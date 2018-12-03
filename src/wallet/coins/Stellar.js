import StellarSdk from 'stellar-sdk';
import {AccountType, CoinType} from '../constants';
import tradingPlatformConfig from "../config/trading-platform";
// import store from 'core/store';

const round = function(dight, howMany) {
  if(howMany) {
    dight = Math.round(dight * Math.pow(10, howMany)) / Math.pow(10, howMany);
  } else {
    dight = Math.round(dight);
  }
  return dight;
};
class StellarWallet {
  constructor(url, option = {}) {
    if (url) {
      this.setServer(url);
    }
    this.option = option;
  }

  setServer (url, passphrase) {
    this.url = url;
    this.server = new StellarSdk.Server(url);
    if (url === 'https://horizon.stellar.org') {
      StellarSdk.Network.usePublicNetwork();
    } else if (url === 'https://horizon-testnet.stellar.org') {
      StellarSdk.Network.useTestNetwork();
    } else {
      StellarSdk.Network.use(new StellarSdk.Network(passphrase));
    }
  }

  destroy () {}

  getInstance () {
    return this.server;
  }

  async isActivated (address) {
    try {
      await this.server.accounts().accountId(address).call();
      return true;
    } catch(e) {
      if (e.response.status === 404 && e.response.title === 'Resource Missing') {
        return false;
      }
    }
  }

  async getBalances (address) {
    try {
      let ret = await this.server.loadAccount(address);
      let balances = [];
      let native;
      ret.balances.forEach(item => {
        if (item.asset_type === 'native') {
          native = {
            code: CoinType.XLM,
            value: item.balance
          };
        } else {
          balances.push({
            code: item.asset_code,
            value: item.balance,
            issuer: item.asset_issuer
          });
        }
      });
      balances.unshift(native);
      return balances;
    } catch (e) {
      return [{
          value: '0',
          code: CoinType.XLM
        }
      ];
    }
  }

  async isTrustAsset(address, assetCode, assetIssuer) {
    if (CoinType.XLM === assetCode && !assetIssuer) {
      return true;
    }
    let balances = await  this.getBalances(address);
    if (!balances && balances.length === 0) {
      return false;
    }
    let flag = balances.some(item => {
      if (item.issuer === assetIssuer && item.code === assetCode) {
        return true;
      }
      return false;
    });
    return flag;
  }

  // subscribe (address) {
  //   if (this._closeAccountStream) {
  //     this._closeAccountStream();
  //     this._closeAccountStream = undefined;
  //   }
  //   this._closeAccountStream = this.server.accounts().accountId(address).stream({
  //     onmessage: (res) => {
  //       let flag  = true;
  //       res.balances.forEach(item => {
  //         let assetType = item.asset_type;
  //         if (assetType === 'native') {
  //           assetType = CoinType.XLM;
  //         }
  //         let balance = store.state.balances[assetType];
  //         if (item.balance !== balance) {
  //           flag = false;
  //           return;
  //         }
  //       });
  //
  //       if(!flag) {
  //         // console.info(res.balances);
  //         store.dispatch('setBalances', address); // 更新余额
  //       }
  //     }
  //   });
  // }
  //
  // unsubscribe () {
  //   if (this._closeAccountStream) {
  //     this._closeAccountStream();
  //     this._closeAccountStream = undefined;
  //   }
  // }

  async getTransactions (address, option = {}) {
    return new Promise(async (resolve, reject)=>{
      try {
        let action =  this.server.payments().forAccount(address).order(option.order || 'desc');
        if (option.limit) {
          action = action.limit(option.limit);
        }
        if (option.cursor) {
          action = action.cursor(option.cursor);
        }
        let page = await action.call();
        resolve(page.records);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getTransaction (txHash) {
    let operations = await this.server.operations().forTransaction(txHash).call();
    if (operations && operations.records && operations.records.length > 0) {
      return await operations.records[0].transaction();
    }
    return null;
  }

  async sendTransaction (fromSecret, to, amount, option = {}) {
    const fromPair = StellarSdk.Keypair.fromSecret(fromSecret);
    const fromAddress = fromPair.publicKey();

    const activated = await this.isActivated(to);


    amount = round(amount, 7);
    const account = await this.server.loadAccount(fromAddress);

    let asset;
    if (option.assetCode && option.assetIssuer) {
      asset = new StellarSdk.Asset(option.assetCode, option.assetIssuer);
    } else {
      asset = StellarSdk.Asset.native();
    }
    let payment;
    if (activated) {
      payment = StellarSdk.Operation.payment({
        destination: to,
        asset: asset,
        amount: amount.toString()
      });
    } else {
      payment = StellarSdk.Operation.createAccount({
        destination: to,
        startingBalance: amount.toString()
      });
    }

    let txBuilder = new StellarSdk.TransactionBuilder(account);
    txBuilder.addOperation(payment);
    if (option.memo) {
      const memo = new StellarSdk.Memo(option.memoType, option.memo);
      txBuilder.addMemo(memo);
    }

    let tx = txBuilder.build();
    tx.sign(fromPair);
    return this.server.submitTransaction(tx);
  }

  async changeTrust(fromSecret, code, issuer, limit) {
    const fromPair = StellarSdk.Keypair.fromSecret(fromSecret);
    const address = fromPair.publicKey();
    const asset = new StellarSdk.Asset(code, issuer);
    console.debug('Turst asset', asset, limit);
    const account = await this.server.loadAccount(address);
    const op = StellarSdk.Operation.changeTrust({
      asset: asset,
      limit: limit || '0'
    });
    let tx = new StellarSdk.TransactionBuilder(account).addOperation(op).build();
    tx.sign(fromPair);
    return this.server.submitTransaction(tx);
  }

  isValidAddress (address) {
    return StellarSdk.StrKey.isValidEd25519PublicKey(address);
  }

  isValidMemo(type, memo) {
    try {
      new StellarSdk.Memo(type, memo);
      return '';
    } catch (e) {
      return e.message;
    }
  }

  isTradingPlatformAddress (address) {
    let config = tradingPlatformConfig[AccountType.stellar];
    return config[address];
  }

  getAccount(key) {
    const keypair =  StellarSdk.Keypair.fromRawEd25519Seed(key);
    const address = keypair.publicKey();
    const secret = keypair.secret();
    return { secret, address };
  }

  getAccountFromSecret(secret) {
    const keypair = StellarSdk.Keypair.fromSecret(secret);
    const address = keypair.publicKey();
    return { secret, address };
  }
}

export default StellarWallet;
