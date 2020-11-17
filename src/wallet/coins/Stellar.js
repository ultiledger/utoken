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
const _seq = {
  snapshot : "",
  time : new Date()
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
      native.frozenNative = ret.subentry_count * 0.5 + 1;
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
    if (address && assetIssuer && address === assetIssuer) {
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
   // return new Promise(async (resolve, reject)=>{
      try {
        let action =  this.server.payments().forAccount(address).order(option.order || 'desc');
        if (option.limit) {
          action = action.limit(option.limit);
        }
        if (option.cursor) {
          action = action.cursor(option.cursor);
        }
        let page = await action.call();
        return page.records;
      } catch (err) {
        throw new Error(err);
      }
   // });
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
    //console.debug('Turst asset', asset, limit);
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

  /**
   * 通过StellarSdk API对资产进行相应的转换
   * @param code 资产代码（简称）
   * @param issuer （资产合约，XLM是空）
   * @returns {*}
   */
  getAsset (code, issuer) {
    if (typeof code == 'object') {
      issuer = code.issuer;
      code = code.code;
    }
    let asset;
    if (code && issuer) {
      asset = new StellarSdk.Asset(code, issuer);
    } else {
      asset = StellarSdk.Asset.native();
    }
    return asset;
  }
  /**
   * 判断两个资产是否是同一个
   * @param code 资产代码（简称）
   * @param issuer （资产合约，XLM是空）
   * @returns {*}
   */
  compareAsset (asset1, asset2) {
    if (asset1.issuer || asset2.issuer) {
      if (asset1.issuer === asset2.issuer
      && asset1.code === asset2.code) {
        return true;
      }
    }else {
      if (asset1.code === asset2.code) {
        return true;
      }
    }
    return false;
  }

  /**
   * 获取兑换path，返回数组形式
   * @param src （兑换原地址）
   * @param dest （兑换目标地址）
   * @param code （当前资产的code，简称）
   * @param issuer （当前资产合约，xlm是空）
   * @param amount （兑换金额）
   * @returns {Promise<any>}
   */
  async getExchangePath (src, dest, code, issuer, amount) {
   // return new Promise(async (resolve, reject)=>{
      try {
        await this.server.paths(src, dest, this.getAsset(code, issuer), amount).call().then((data) => {
          return data;
        }).catch((err) => {
          //console.info(err);
          throw new Error(this.getErrMsg(err));
        });
      } catch (err) {
        throw new Error(this.getErrMsg(err));
      }
  //  });
  }

  /**
   * 进行兑换
   * @param alt （各种参数，getPath获得）
   * @param address （当前账户的stellar地址）
   * @param fromSecret （当前账户的stellar私钥）
   * @returns {Promise<any>}
   */
  async pathPayment (alt, address, fromSecret) {
   // return new Promise(async (resolve, reject)=>{
      try {
        const path = alt.origin.path.map((item) => {
          if (item.asset_type == 'native') {
            return new StellarSdk.Asset.native();
          } else {
            return new StellarSdk.Asset(item.asset_code, item.asset_issuer);
          }
        });
        let max_rate = 1.0001; // 波动差, 因为市场是波动的
        let sendMax = alt.origin.source_amount;
        sendMax = round(max_rate * sendMax, 7).toString();
        this.server.loadAccount(address).then((account) => {
          const pathPayment = StellarSdk.Operation.pathPayment({
            destination: address,
            sendAsset  : this.getAsset(alt.srcCode, alt.srcIssuer),
            sendMax    : sendMax,
            destAsset  : this.getAsset(alt.dstCode, alt.dstIssuer),
            destAmount : alt.origin.destination_amount,
            path       : path
          });
          const transaction = new StellarSdk.TransactionBuilder(account).addOperation(pathPayment).build();
          let keypair = StellarSdk.Keypair.fromSecret(fromSecret);
          transaction.sign(keypair);
          return transaction;
        }).then(transaction => {
          return this.server.submitTransaction(transaction);
        }).then(txResult => {
          return txResult.hash;
        }).catch((err) => {
          throw new Error(this.getErrMsg(err));
        });
      } catch (err) {
        throw new Error(this.getErrMsg(err));
      }
   // });
  }

  /**
   * 查询交易对的挂单记录
   * @param baseBuy （基础货币，包含code和合约）
   * @param counterSelling (对手货币，包含code和合约)
   * @returns {Promise<any>}
   */
  async queryBook (baseBuy, counterSelling) {
    //console.debug('orderbook', `${baseBuy.code}/${counterSelling.code}`);
   // return new Promise(async (resolve, reject)=>{
      try {
        await this.server.orderbook(this.getAsset(baseBuy), this.getAsset(counterSelling)).call().then((data) => {
          return data;
        }).catch((err) => {
          //console.error(err, `${baseBuy.code}/${counterSelling.code}`);
          throw new Error(this.getErrMsg(err));
        });
      } catch (err) {
        throw new Error(this.getErrMsg(err));
      }
    //});

  }

  /**
   * 查询交易对的最近成交历史
   * @param baseBuy （基础货币，包含code和合约）
   * @param counterSelling (对手货币，包含code和合约)
   * @param optional （可选项）
   * @returns {Promise<any>}
   */
  async queryLastBook (baseBuy, counterSelling, optional = {}) {
   // return new Promise(async (resolve, reject)=>{
      //my last book
      if (optional.forAccount) {
        try {
          let action = this.server.trades().forAssetPair(this.getAsset(baseBuy), this.getAsset(counterSelling))
            .forAccount(optional.forAccount)
            .order(optional.order || 'desc');
          if (optional.limit) {
            action = action.limit(optional.limit);
          }
          if (optional.cursor) {
            action = action.cursor(optional.cursor);
          }
          let page = await action.call();
          let records=[];
          if (page.records) {
            page.records.forEach((item) => {
              let baseAsset = this.getAsset(item.base_asset_code,item.base_asset_issuer);
              let counterAsset = this.getAsset(item.counter_asset_code,item.counter_asset_issuer);
              if (this.compareAsset(baseAsset,this.getAsset(baseBuy))
                && this.compareAsset(counterAsset,this.getAsset(counterSelling))){
                records.push(item);
              }else if(this.compareAsset(counterAsset,this.getAsset(baseBuy))
                && this.compareAsset(baseAsset,this.getAsset(counterSelling))){
                records.push(item);
              }
            });
          }
          return records;
        } catch (err) {
          throw new Error(err);
        }
      }else {
        try {
          let action =  this.server.trades().forAssetPair(this.getAsset(baseBuy), this.getAsset(counterSelling)).order(optional.order || 'desc');
          if (optional.limit) {
            action = action.limit(optional.limit);
          }
          if (optional.cursor) {
            action = action.cursor(optional.cursor);
          }
          let page = await action.call();
          return page.records;
        } catch (err) {
          throw new Error(err);
        }
      }
  //  });
  }

  /**
   * 发起挂单交易请求
   * @param selling (卖方数据)
   * @param buying (买方数据)
   * @param amount (数量)
   * @param price (价格)
   * @param address (账户地址)
   * @param fromSecret (账户私钥)
   * @returns {Promise<any>}
   */
  async sendOffer(selling, buying, amount, price , address, fromSecret) {
   // return new Promise(async (resolve, reject) => {
      try {
        this.server.loadAccount(address).then((account) => {
          const op = StellarSdk.Operation.manageOffer({
            selling: this.getAsset(selling.code, selling.issuer),
            buying: this.getAsset(buying.code, buying.issuer),
            amount: round(amount, 7).toString(),
            price : price.toString()
          });
          const transaction = new StellarSdk.TransactionBuilder(account).addOperation(op).build();
          let keypair = StellarSdk.Keypair.fromSecret(fromSecret);
          transaction.sign(keypair);
          //return transaction;
        }).then(transaction => {
          this.server.submitTransaction(transaction);
        }).then(txResult => {
          return txResult.hash;
        }).catch((err) => {
          throw new Error(this.getErrMsg(err));
        });
      } catch (err) {
        throw new Error(this.getErrMsg(err));
      }
   // });
  }

  /**
   * 查询我的委托单
   * @param address (账户地址)
   * @param optional (可选项)
   * @returns {Promise<any>}
   */
  async queryOffers (address, optional = {}) {
    //console.debug('offers', address);
   // return new Promise(async (resolve, reject)=>{
      try {
        let action =  this.server.offers('accounts', address);
        if (optional.limit) {
          action = action.limit(optional.limit);
        } else {
          action = action.limit(200);
        }
        let page = await action.call();
        return page.records;
      } catch (err) {
        throw new Error(err);
      }
   // });
  }

  _updateSeq(account) {
    const now = new Date();
    // In the same ledger
    if (now - _seq.time < 5000) {
      for (;account.sequence <= _seq.snapshot;) {
        account.incrementSequenceNumber();
        //console.debug('Sequence: ' + _seq.snapshot + ' -> ' + account.sequence);
      }
    }
    _seq.snapshot = account.sequence;
    _seq.time = now;
  }

  /**
   * 撤单操作
   * @param offer
   * @param address
   * @param fromSecret
   * @returns {Promise<any>}
   */
  async cancelOffer (offer , address, fromSecret) {
    //return new Promise(async (resolve, reject) => {
      try {
        this.server.loadAccount(address).then((account) => {
          this._updateSeq(account);
          const op = StellarSdk.Operation.manageOffer({
            selling: this.getAsset(offer.selling.code, offer.selling.issuer),
            buying: this.getAsset(offer.buying.code, offer.buying.issuer),
            amount: '0',
            price : offer.price.toString(),
            offerId : offer.id
          });
          const transaction = new StellarSdk.TransactionBuilder(account).addOperation(op).build();
          let keypair = StellarSdk.Keypair.fromSecret(fromSecret);
          transaction.sign(keypair);
          //return transaction;
        }).then(transaction => {
          this.server.submitTransaction(transaction);
        }).then(txResult => {
          return txResult.hash;
        }).catch((err) => {
          throw new Error(this.getErrMsg(err));
        });
      } catch (err) {
        throw new Error(this.getErrMsg(err));
      }
    //});
  }

  async queryOfferHistorys (address, optional = {}) {
   // return new Promise(async (resolve, reject)=>{
      try {
        let action = await this.server.transactions().forAccount(address).order(optional.order || 'desc');
        if (optional.limit) {
          action = action.limit(optional.limit);
        } else {
          action = action.limit(20);
        }
        /* let action =  this.server.offers('accounts', address);*/
        let page = await action.call();
        let result = [];
        for (const record of page.records) {
          let tx = new StellarSdk.Transaction(record.envelope_xdr);
          result.push(tx.operations[0]);
        }
        return result;

        /*let action =  this.server.trades().forAccount(address).order(optional.order || 'desc');
        if (optional.limit) {
          action = action.limit(optional.limit);
        }
        if (optional.cursor) {
          action = action.cursor(optional.cursor);
        }
        let page = await action.call();
        resolve(page.records);*/
      } catch (err) {
        throw new Error(err);
      }
   // });
  }

  /**
   * stellar api请求错误统一处理方法
   * @param err
   * @returns {*|string}
   */
  getErrMsg (err) {
    let message = "";
    if (err instanceof StellarSdk.NotFoundError) {
      message = "NotFoundError";
    } else if (err.response && err.response.extras && err.response.extras.reason) {
      message = err.response.extras.reason;
    } else if (err.response && err.response.data && err.response.data.extras && err.response.data.extras.result_xdr) {
      const resultXdr = StellarSdk.xdr.TransactionResult.fromXDR(err.response.data.extras.result_xdr, 'base64');
      if (resultXdr.result().results()) {
        message = resultXdr.result().results()[0].value().value().switch().name;
      } else {
        message = resultXdr.result().switch().name;
      }
    }else {
      message = err.detail || err.message;
    }

    //if (!message) console.error("Fail in getErrMsg", err);
    return message;
  }

}

export default StellarWallet;
