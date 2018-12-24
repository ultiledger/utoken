import {RippleAPI} from 'ripple-lib';
import RippleAddress from 'ripple-address-codec';
import {AccountType, CoinType} from '../constants';
import tradingPlatformConfig from '../config/trading-platform';
import rippleKeypairs from 'ripple-keypairs';
class RippleWallet{
  constructor(url, option = {}) {
    if (url) {
      this.setServer(url);
    }
    this.option = option;
  }

  setServer (url) {
    this.url = url;
    if (!this.server || !this.server.isConnected()) {
      this.server = new RippleAPI({
        server: url
      });
    }
  }

  destroy () {
    if (this.server.isConnected()) {
      this.server.disconnect();
    }
  }

  getInstance () {
    return this.server;
  }

  async isActivated (address) {
    if (!this.server.isConnected()) {
      await this.server.connect();
    }
    return new Promise((resolve)=>{
      this.server.getAccountInfo(address)
        .then(() => {
          resolve(true);
        }).catch(e => {
        if (e.data.error === 'actNotFound') {
          resolve(false);
        }
      });
    });
  }

  // subscribe (address) {
  //   this.server.connection.on('transaction', (response) => {
  //     console.info(response);
  //     store.dispatch('setBalances', address); // 更新余额
  //   }); // 指定地址发生交易时触发
  //
  //   this.server.request('subscribe', { // 监听指定地址
  //     accounts: [ address ]
  //   }).then(response => {
  //     if (response.status === 'success') {
  //       console.log('Successfully subscribed');
  //     }
  //   });
  // }
  // async unsubscribe (address) {
  //   if (!this.server.isConnected()) {
  //     await this.server.connect();
  //   }
  //   this.server.request('unsubscribe', { // 取消监听指定地址
  //     accounts: [ address ]
  //   }).then(response => {
  //     if (response.status === 'success') {
  //       console.log('Successfully subscribed');
  //     }
  //   });
  // }

  async getBalances (address) {
    if (!this.server.isConnected()) {
      await this.server.connect();
    }
    try {
      let ret = await this.server.getBalances(address);
      let balances = [];
      let native;
      // console.info(ret);
      // console.info('balances:', balances);
      // let trustlines = await this.server.getTrustlines(address);
      // console.info('trustlines:', trustlines);
      ret.forEach(item => {
        if (item.currency === CoinType.XRP) {
          native = {
            code: item.currency,
            value: item.value
          };
        } else {
          //fix bug #6
          /* let flag = trustlines.some(line => {
            if (line.specification.counterparty === item.counterparty && line.specification.currency === item.currency) {
              return line.specification.limit === '0';
            }
            return false;
          });

          if (!flag) {
            balances.push({
              code: item.currency,
              value: item.value,
              issuer: item.counterparty || ''
            });
          } */
          balances.push({
            code: item.currency,
            value: item.value,
            issuer: item.counterparty || ''
          });
        }
      });
      balances.unshift(native);
      return balances;
    } catch (e) {
      console.error(e);
      return [{
          value: '0',
          code: CoinType.XRP
      }];
    }
  }

  async isTrustAsset(address, assetCode, assetIssuer) {
    if (CoinType.XRP === assetCode && !assetIssuer) {
      return true;
    }
    let trustlines = await this.server.getTrustlines(address);
    // console.info(trustlines);
    if (!trustlines && trustlines.length === 0) {
      return false;
    }

    let flag = trustlines.some(line => {
      if (line.specification.counterparty === assetIssuer && line.specification.currency === assetCode) {
        return line.specification.limit !== '0';
      }
      return false;
    });
    return flag;
  }

  getTransactions (address, option = {}) {
    return new Promise(async (resolve, reject)=>{
      try {
        const serverInfo = await this.server.getServerInfo();
        const ledgers = serverInfo.completeLedgers.split('-');
        const minLedgerVersion = Number(ledgers[0]);
        const maxLedgerVersion = Number(ledgers[1]);
        let params = {
          minLedgerVersion,
          maxLedgerVersion
        };
        params = {...params, ...option};
        let transactions = await this.server.getTransactions(address, params);
        resolve(transactions);
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }

  sendTransaction (fromSecret, to, amount, option = {}) {
    const keypair = rippleKeypairs.deriveKeypair(fromSecret);
    const fromAddress = rippleKeypairs.deriveAddress(keypair.publicKey);
    let currency = option.assetCode || CoinType.XRP;
    let payment = {
      source: {
        address: fromAddress,
        maxAmount: {
          value: amount,
          currency: currency
        }
      },
      destination: {
        address: to,
        amount: {
          value: amount,
          currency: currency
        }
      }
    };
    if (option.assetIssuer) {
      payment.destination.amount.counterparty = option.assetIssuer;
      payment.source.maxAmount.counterparty = option.assetIssuer;
    }
    if (option.tag !== '') {
      let tag = new Number(option.tag);
      payment.destination.tag = tag.valueOf();
    }

    return new Promise((resolve, reject)=> {
      this.server.preparePayment(fromAddress, payment).then(prepared => {
        const {signedTransaction} = this.server.sign(prepared.txJSON, fromSecret);
        this.server.submit(signedTransaction)
          .then(result => {
            console.info(result);
            resolve(result);
          }).catch (err => {
          console.info(err);
          reject(err);
        });
      });
    });
  }

  async changeTrust(fromSecret, code, issuer, limit) {
    const keypair = rippleKeypairs.deriveKeypair(fromSecret);
    const fromAddress = rippleKeypairs.deriveAddress(keypair.publicKey);
    const trustline = {
      currency: code,
      counterparty: issuer,
      limit: limit,
      ripplingDisabled: true
      // ripplingDisabled: ripplingDisabled
    };
    // console.info(ripplingDisabled);
    return new Promise((resolve, reject)=> {
      this.server.prepareTrustline(fromAddress, trustline).then(prepared => {
        const {signedTransaction} = this.server.sign(prepared.txJSON, fromSecret);
        this.server.submit(signedTransaction)
          .then(result => {
            console.info(result);
            resolve(result);
          }).catch (err => {
          console.info(err);
          reject(err);
        });
      });
    });
  }

  isValidAddress (address) {
    return RippleAddress.isValidAddress(address);
  }

  isTradingPlatformAddress (address) {
    let config = tradingPlatformConfig[AccountType.ripple];
    return config[address];
  }

  getAccount(key) {
    let options = {'entropy':key};
    const secret = rippleKeypairs.generateSeed(options);
    const keypair = rippleKeypairs.deriveKeypair(secret);
    const address = rippleKeypairs.deriveAddress(keypair.publicKey);
    return { secret, address };
  }

  getAccountFromSecret(secret) {
    const keypair = rippleKeypairs.deriveKeypair(secret);
    const address = rippleKeypairs.deriveAddress(keypair.publicKey);
    return { secret, address };
  }
}
export default RippleWallet;
