import {RippleAPI} from 'ripple-lib';
import {isValidXAddress,xAddressToClassicAddress} from 'ripple-address-codec';
import {AccountType, CoinType} from '../constants';
import tradingPlatformConfig from '../config/trading-platform';
import rippleKeypairs from 'ripple-keypairs';
import Big from 'big.js';

const round = function(dight, howMany) {
  if(howMany) {
    dight = Math.round(dight * Math.pow(10, howMany)) / Math.pow(10, howMany);
  } else {
    dight = Math.round(dight);
  }
  return dight;
};
class RippleWallet{
  constructor(url, option = {}) {
    if (url) {
      this.setServer(url);
      this.server.connect();
    }
    this.option = option;
  }

  setServer (url) {
    this.url = url;
    if (!this.server || !this.server.isConnected()) {
      this.server = new RippleAPI({
        server: url, maxFeeXRP: '0.05',timeout:16000
      });
      this.server.on('error', (errorCode, errorMessage) => {
        throw new Error(errorCode + ': ' + errorMessage);
      });
      this.server.on('connected', () => {
        //console.log('RippleApi connected');
      });
      this.server.on('disconnected', (code) => {
        if (code !== 1000) {
          throw new Error('Connection is closed due to error.');
        } else {
          throw new Error('Connection is closed normally.');
        }
      });
    }
  }

  destroy () {
    if (this.server) {
      if (this.server.isConnected()) {
        this.server.disconnect();
      }
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
      let classicAddress = isValidXAddress(address)? xAddressToClassicAddress(address).classicAddress:address;
      this.server.getAccountInfo(classicAddress)
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
  //     //console.info(response);
  //     store.dispatch('setBalances', address); // 更新余额
  //   }); // 指定地址发生交易时触发
  //
  //   this.server.request('subscribe', { // 监听指定地址
  //     accounts: [ address ]
  //   }).then(response => {
  //     if (response.status === 'success') {
  //       //console.log('Successfully subscribed');
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
  //       //console.log('Successfully subscribed');
  //     }
  //   });
  // }

  async getBalances (address) {
    if (!this.server.isConnected()) {
      await this.server.connect();
    }
   // console.log("in ripple getBalance");
    try {
      let classicAddress = isValidXAddress(address)? xAddressToClassicAddress(address).classicAddress:address;
      let ret = await this.server.getBalances(classicAddress);
      let balances = [];
      let native={};
      ret.forEach(item => {
        if (item.currency === CoinType.XRP) {
          native = {
            code: item.currency,
            value: item.value
          };
        } else {
          balances.push({
            code: item.currency,
            value: item.value,
            issuer: item.counterparty || ''
          });
        }
      });
      let accountInfo = await this.server.getAccountInfo(classicAddress);
      native.frozenNative = 20 + 5 * accountInfo.ownerCount;
      balances.unshift(native);
      // console.log("ripple balance",balances);
      return balances;
    } catch (e) {
      // console.error(e);
      return [{
          value: '0',
          code: CoinType.XRP
      }];
    }
  }

  async getAccountSettings(address) {
    if (!this.server.isConnected()) {
      await this.server.connect();
    }
    //return new Promise(async (resolve) => {
      let classicAddress = isValidXAddress(address)? xAddressToClassicAddress(address).classicAddress:address;
      let settings = await this.server.getSettings(classicAddress);
      return settings;
    //});
  }

  async isTrustAsset(address, assetCode, assetIssuer) {
    if (!this.server.isConnected()) {
      await this.server.connect();
    }
    if (CoinType.XRP === assetCode && !assetIssuer) {
      return true;
    }
    let classicAddress = isValidXAddress(address)? xAddressToClassicAddress(address).classicAddress:address;
    if (address && assetIssuer && address === assetIssuer) {
      return true;
    }
    if (address && assetIssuer && classicAddress === assetIssuer) {
      return true;
    }
    let trustlines = await this.server.getTrustlines(classicAddress);
    // //console.info(trustlines);
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

  async getTransactions (address, option = {}) {
    if (!this.server.isConnected()) {
      await this.server.connect();
    }
   // return new Promise(async (resolve, reject)=>{
      try {
        let classicAddress = isValidXAddress(address)? xAddressToClassicAddress(address).classicAddress:address;
        const options = {
          account: classicAddress,
          limit: 50
        };
        const command = 'account_tx';
        let result = {};
        if (option.hasMore && option.historys) {
          let rsp2 = await this.server.requestNextPage(command, options, option.historys);
          if (rsp2 && rsp2.marker) {
            result = {'hashMore': true, 'data': rsp2};
          } else {
            result = {'hashMore': false, 'data': rsp2};
          }
        } else {
          let rsp = await this.server.request(command, options);
          if (rsp && rsp.marker) {
            result = {'hashMore': true, 'data': rsp};
          } else {
            result = {'hashMore': false, 'data': rsp};
          }
        }
        return result;
        /* const serverInfo = await this.server.getServerInfo();
        const ledgers = serverInfo.completeLedgers.split('-');
        const minLedgerVersion = Number(ledgers[0]);
        const maxLedgerVersion = Number(ledgers[1]);
        let params = {
          minLedgerVersion,
          maxLedgerVersion
        };
        params = {...params, ...option};
        let transactions = await this.server.getTransactions(address, params);
        //console.info(transactions);
        resolve(transactions); */
      } catch (err) {
        ////console.error(err);
        throw new Error(err);
      }
  //  });
  }

  async sendTransaction (fromSecret, to, amount, option = {}) {
    if (!this.server.isConnected()) {
      await this.server.connect();
    }
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
      let accountSetting = await this.getAccountSettings(option.assetIssuer);
      if (Object.keys(accountSetting).length > 0) {
        if (accountSetting.transferRate) {
          payment.source.maxAmount.value = (Number(amount) * accountSetting.transferRate).toString();
        }
      }
    }
    if (option.tag !== '') {
      let tag = new Number(option.tag);
      payment.destination.tag = tag.valueOf();
    }
    payment.memos = [{data: 'utoken.cash', type: 'client', format: 'plain/text'}];
    if (option.memos) {
      payment.memos.push({data: encodeURIComponent(option.memos), type: 'memo', format: 'plain/text'});
    }
    return new Promise((resolve, reject)=> {
      this.server.preparePayment(fromAddress, payment).then(prepared => {
        const {signedTransaction} = this.server.sign(prepared.txJSON, fromSecret);
        this.server.submit(signedTransaction, true)
          .then(result => {
            // console.info(result);
            ////console.info(result);
            resolve(result);
          }).catch (err => {
          ////console.info(err);
          reject(err);
        });
      }).catch (err => {
        ////console.info(err);
        reject(err);
      });
    });
  }

  async sendCheck (fromSecret, to, amount, option = {}) {
    if (!this.server.isConnected()) {
      await this.server.connect();
    }
    const keypair = rippleKeypairs.deriveKeypair(fromSecret);
    const fromAddress = rippleKeypairs.deriveAddress(keypair.publicKey);
    let currency = option.assetCode || CoinType.XRP;
    let checkcreate = {      
      destination: to,
      sendMax: {
          value: amount,
          currency: currency
        }      
    };
    if (option.assetIssuer) {
      checkcreate.sendMax.counterparty = option.assetIssuer;
    }
    if (option.tag !== '') {
      let tag = new Number(option.tag);
      checkcreate.destinationTag = tag.valueOf();
    }
    return new Promise((resolve, reject)=> {
      this.server.prepareCheckCreate(fromAddress, checkcreate).then(prepared => {
        const {signedTransaction} = this.server.sign(prepared.txJSON, fromSecret);
        this.server.submit(signedTransaction, true)
          .then(result => {
            //console.info(result);
            resolve(result);
          }).catch (err => {
          //console.info(err);
          reject(err);
        });
      }).catch (err => {
        //console.info(err);
        reject(err);
      });
    });
  }
  async cancelCheck (check , address, fromSecret) {
    if (!this.server.isConnected()) {
      await this.server.connect();
    }
   // return new Promise(async (resolve, reject) => {
      try {
        const checkCancellation = {checkID: check.id};
        let prepared = await this.server.prepareCheckCancel(address, checkCancellation);
        const {signedTransaction} = this.server.sign(prepared.txJSON, fromSecret);
        this.server.submit(signedTransaction, true)
          .then(result => {
            //console.info(result);
            if (result && result.resultCode === 'tesSUCCESS') {
              return result;
            } else {
              throw new Error(result.resultMessage);
            }
          }).catch (err => {
          //console.info(err);
          throw new Error(err);
        });
      } catch (err) {
        throw new Error(err);
      }
  //  });
  }
  async checkCash (check , address, fromSecret) {
    if (!this.server.isConnected()) {
      await this.server.connect();
    }
   // return new Promise(async (resolve, reject) => {
      try {
        const cash = {
          checkID: check.id,
          amount:{
            currency: check.code,
            value: check.amount
          }
        };
        if (check.issuer) {
          cash.amount.counterparty = check.issuer;
        }
        let prepared = await this.server.prepareCheckCash(address, cash);
        const {signedTransaction} = this.server.sign(prepared.txJSON, fromSecret);
        this.server.submit(signedTransaction, true)
          .then(result => {
            //console.info(result);
            if (result && result.resultCode === 'tesSUCCESS') {
              return result;
            } else {
              throw new Error(result.resultMessage);
            }
          }).catch (err => {
          //console.info(err);
          throw new Error(err);
        });
      } catch (err) {
        throw new Error(err);
      }
   // });
  }
  async queryChecks (address, optional = {}) {
    if (!this.server.isConnected()) {
      await this.server.connect();
    }
   // return new Promise(async (resolve, reject)=>{
      try {
        let options = {
          type:"check"
        };
        if (!optional.limit) {
          options.limit = 200;
        } else {
          options.limit = optional.limit;
        }
        let page = await this.server.getAccountObjects(address, options);
        ////console.info(page);
        return page;
      } catch (err) {
        throw new Error(err);
      }
   // });
  }
  async acctDel (fromSecret, to, option = {}) {
    if (!this.server.isConnected()) {
      await this.server.connect();
    }
    const keypair = rippleKeypairs.deriveKeypair(fromSecret);
    const fromAddress = rippleKeypairs.deriveAddress(keypair.publicKey);
    const localInstructions = { maxFee: '5.0'};
    let classicAddress = isValidXAddress(to)? xAddressToClassicAddress(to).classicAddress:to;

    let tx = {
      TransactionType: 'AccountDelete',
      Account: fromAddress,
      Destination: classicAddress,
      Fee: '5000000',
    };
    if (option.tag !== '') {
      let tag = new Number(option.tag);
      tx.DestinationTag = tag.valueOf();
    }
    if (isValidXAddress(to)) {
      tx.DestinationTag = xAddressToClassicAddress(to).tag;
    }
    // console.log(tx);
    // acctdel.memos = [{data: 'utoken.cash', type: 'client', format: 'plain/text'}];
    // if (option.memos) {
    //   acctdel.memos.push({data: encodeURIComponent(option.memos), type: 'memo', format: 'plain/text'});
    // }
    return new Promise((resolve, reject)=> {
      this.server.prepareTransaction(tx, localInstructions).then(prepared => {
        // console.log(prepared);
        const {signedTransaction} =new RippleAPI({maxFeeXRP: '5.0'}).sign(prepared.txJSON, fromSecret);
        this.server.submit(signedTransaction, true)
          .then(result => {
            // console.info(result);
            ////console.info(result);
            resolve(result);
          }).catch (err => {
          ////console.info(err);
          reject(err);
        });
      }).catch (err => {
        ////console.info(err);
        reject(err);
      });
    });
  }
 
  async changeTrust(fromSecret, code, issuer, limit) {
    if (!this.server.isConnected()) {
      await this.server.connect();
    }
    const keypair = rippleKeypairs.deriveKeypair(fromSecret);
    const fromAddress = rippleKeypairs.deriveAddress(keypair.publicKey);
    const trustline = {
      currency: code,
      counterparty: issuer,
      limit: limit,
      ripplingDisabled: true
      // ripplingDisabled: ripplingDisabled
    };
    trustline.memos = [{data: 'utoken.cash', type: 'client', format: 'plain/text'}];
    // //console.info(ripplingDisabled);
    return new Promise((resolve, reject)=> {
      this.server.prepareTrustline(fromAddress, trustline).then(prepared => {
        const {signedTransaction} = this.server.sign(prepared.txJSON, fromSecret);
        this.server.submit(signedTransaction, true)
          .then(result => {
            //console.info(result);
            resolve(result);
          }).catch (err => {
          //console.info(err);
          reject(err);
        });
      }).catch (err => {
        ////console.info(err);
        reject(err);
      });
    });
  }

  isValidAddress (address) {
    return this.server.isValidAddress(address);
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

  /**
   * 查询交易对的挂单记录
   * @param baseBuy （基础货币，包含code和合约）
   * @param counterSelling (对手货币，包含code和合约)
   * @returns {Promise<any>}
   */
  async queryBook (baseBuy, counterSelling) {
  //  return new Promise(async (resolve, reject)=>{
      try {
        const orderbook = {
          base: {
            'currency': baseBuy.code
          },
          counter: {
            'currency': counterSelling.code
          }
        };
        let address = '';
        if (baseBuy.issuer) {
          address = baseBuy.issuer;
          orderbook.base.counterparty = baseBuy.issuer;
        }
        if (counterSelling.issuer) {
          if (!address) {
            address = counterSelling.issuer;
          }
          orderbook.counter.counterparty = counterSelling.issuer;
        }
        await this.server.getOrderbook(address, orderbook, {limit: 150}).then((data) => {
          let result = {
            asks: [],
            bids: []
          };
          data.asks.map(ret => {
            let amount = ret.specification.quantity.value;
            let price = Number(new Big(ret.specification.totalPrice.value).div(ret.specification.quantity.value).toFixed(7).toString()).toString();
            if(ret.state){
              amount = ret.state.fundedAmount.value;
            }
            if (Number(amount)===Number(0)){
              return;
            }
            let r = {
              amount: amount,
              price: price
            };
            let pop = result.asks.pop();
            if(!pop){
              result.asks.push(r);
            }else {
              if (pop.price === r.price){
                pop.amount = Number(new Big(pop.amount).add(r.amount).toFixed(7).toString()).toString();
                result.asks.push(pop);
              }else {
                result.asks.push(pop);
                result.asks.push(r);
              }
            }
          });
          data.bids.map(ret => {
            let amount = ret.specification.quantity.value;
            let price =  Number(new Big(ret.specification.totalPrice.value).div(ret.specification.quantity.value).toFixed(7).toString()).toString();
            if(ret.state){
              amount = ret.state.priceOfFundedAmount.value;
            }
            if (Number(amount)===Number(0)){
              return;
            }
            let r = {
              amount: amount,
              price: price
            };
            let pop = result.bids.pop();
            if(!pop){
              result.bids.push(r);
            }else {
              if (pop.price === r.price){
                pop.amount = Number(new Big(pop.amount).add(r.amount).toFixed(7).toString()).toString();
                result.bids.push(pop);
              }else {
                result.bids.push(pop);
                result.bids.push(r);
              }
            }
          });
          return result;
        }).catch((err) => {
          //console.error(err);
          throw new Error(err);
        });
      } catch (err) {
        throw new Error(err);
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
    ////console.debug('offers', address);
   // return new Promise(async (resolve, reject)=>{
      try {
        let options = {};
        if (!optional.limit) {
          options.limit = 200;
        } else {
          options.limit = optional.limit;
        }
        let page = await this.server.getOrders(address, options);
        ////console.info(page);
        return page;
      } catch (err) {
        throw new Error(err);
      }
  //  });
  }

  /**
   * 发起挂单交易请求
   * @param selling (卖方数据)
   * @param buying (买方数据)
   * @param amount (数量)
   * @param price (单价)
   * @param address (账户地址)
   * @param fromSecret (账户私钥)
   * @param direction (方向-买入还是卖出)
   * @returns {Promise<any>}
   */
  async sendOffer(selling, buying, amount, price , address, fromSecret, direction) {
    if (!this.server.isConnected()) {
      await this.server.connect();
    }
   // return new Promise(async (resolve, reject) => {
      try {
        let totalPrice = Number(new Big(amount).times(price).toString());
        const order = {
          'direction': direction,
          'quantity': {
            'currency': buying.code
          },
          'totalPrice': {
            'currency': selling.code
          },
          "passive": false,
          "fillOrKill": false
        };
        if (selling.issuer) {
          order.totalPrice.counterparty = selling.issuer;
          order.totalPrice.value = round(totalPrice,8).toString();
        }else{
          order.totalPrice.value =  round(totalPrice,6).toString();
        }
        if (buying.issuer) {
          order.quantity.counterparty = buying.issuer;
          order.quantity.value = amount.toString();
        }else{
          order.quantity.value = round(amount,6).toString();
        }
        order.memos = [{data: 'utoken.cash', type: 'client', format: 'plain/text'}];
        let prepared = await this.server.prepareOrder(address, order);
        const {signedTransaction} = this.server.sign(prepared.txJSON, fromSecret);
        this.server.submit(signedTransaction, true)
          .then(result => {
            //console.info(result);
            if (result && result.resultCode === 'tesSUCCESS') {
              return result;
            } else {
              throw new Error(result.resultMessage);
            }
          }).catch (err => {
          //console.info(err);
          throw new Error(err);
        });
      } catch (err) {
        throw new Error(err);
      }
   // });
  }

  /**
   * 撤单操作
   * @param offer
   * @param address
   * @param fromSecret
   * @returns {Promise<any>}
   */
  async cancelOffer (offer , address, fromSecret) {
    if (!this.server.isConnected()) {
      await this.server.connect();
    }
   // return new Promise(async (resolve, reject) => {
      try {
        const orderCancellation = {orderSequence: offer.id};
        orderCancellation.memos = [{data: 'utoken.cash', type: 'client', format: 'plain/text'}];
        let prepared = await this.server.prepareOrderCancellation(address, orderCancellation);
        const {signedTransaction} = this.server.sign(prepared.txJSON, fromSecret);
        this.server.submit(signedTransaction, true)
          .then(result => {
            //console.info(result);
            if (result && result.resultCode === 'tesSUCCESS') {
              return result;
            } else {
              throw new Error(result.resultMessage);
            }
          }).catch (err => {
          //console.info(err);
          throw new Error(err);
        });
      } catch (err) {
        throw new Error(err);
      }
   // });
  }

  async queryLastBook (baseBuy, counterSelling, optional = {}) {
    return new Promise((resolve, reject) => {
      try{
        let options = {limit: 1, descending: true};
        optional.descending = options.descending;
        if (optional.limit) {
          options.limit = optional.limit;
        }
        let url = `https://data.ripple.com/v2/exchanges/${baseBuy.code}+${baseBuy.issuer}/${counterSelling.code}+${counterSelling.issuer}?limit=${optional.limit}&descending=${optional.descending}`;
        if (optional.forAccount) {
          url = `https://data.ripple.com/v2/accounts/${optional.forAccount}/exchanges?descending=true&limit=200`;
          //url = `https://data.ripple.com/v2/accounts/${optional.forAccount}/exchanges?/${baseBuy.code}+${baseBuy.issuer}/${counterSelling.code}+${counterSelling.issuer}?limit=${optional.limit}&descending=${optional.descending}`;
        }
        let xmlhttp = new XMLHttpRequest();  // 创建异步请求
        xmlhttp.onreadystatechange = () => {
          if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            resolve(JSON.parse(xmlhttp.responseText));
          } else if (xmlhttp.status === 400) {
            resolve({data: []});
          }
        };
        xmlhttp.open('GET', url);
        xmlhttp.send();
      }catch (err) {
        reject(err);
      }
    });
  }

  /**
   *AccountSet设置(包含DefaultRipple和RequireDestTag)
   * @param address
   * @param fromSecret
   * @param settings
   * @returns {Promise<void>}
   */
  async accountSettings (address, fromSecret, settings) {
    if (!this.server.isConnected()) {
      await this.server.connect();
    }
    return new Promise((resolve, reject)=> {
      try {
        settings.memos = [{data: 'utoken.cash', type: 'client', format: 'plain/text'}];
        this.server.prepareSettings(address, settings).then(prepared => {
          const {signedTransaction} = this.server.sign(prepared.txJSON, fromSecret);
          this.server.submit(signedTransaction, true).then(ret => {
            resolve(ret);
          }).catch (err => {
            reject(err);
          });
        }).catch(err => {
          reject(err);
        });
      }catch (e) {
        reject(e);
      }
    });
  }

}
export default RippleWallet;
