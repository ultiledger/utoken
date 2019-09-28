import Web3 from 'web3';
import EthTx from 'ethereumjs-tx';
import Big from 'big.js';
import tokens from '../tokens';
import { AccountType, CoinType } from '../constants';
import axios from 'axios';

const apiKeys = ['EB9IXHJKA7W233MV4W7MSME7GTF564Y54R'];

const etherscanApiUrl = {
  test: 'https://api-rinkeby.etherscan.io/api',
  //public: 'https://api.etherscan.io/api' 
  public: 'https://api.utoken.cash/api' 
};

class EthereumWallet {
  constructor(url, option = {}) {
    if (url) {
      this.setServer(url);
    }
    this.option = option;
  }

  setServer(url) {
    this.url = url;
    this.server = new Web3(new Web3.providers.WebsocketProvider(url));
  }

  destroy() {}

  isActivated() {
    return true;
  }

  getInstance() {
    return this.server;
  }

  async getBalances(address, assetCodes = []) {
    this.setServer(this.url);
    // let url = `http://api.ethplorer.io/getAddressInfo/${address}?apiKey=freekey`;
    // let ret = await axios.get(url);
    // let addressInfo = ret.data;
    // let balances = [];
    // if (addressInfo) {
    //   balances.push({
    //     code: CoinType.ETH,
    //     value: addressInfo[CoinType.ETH].balance
    //   });
    //   // //console.info(assetCodes);
    //   let tokenConfig = tokens.get(AccountType.ethereum);
    //   if (addressInfo.tokens && addressInfo.tokens.length > 0) {
    //     addressInfo.tokens.forEach(item => {
    //
    //       if (tokenConfig[item.tokenInfo.symbol]) {
    //         // 如果本地配置了，同时开关，则不显示
    //         if (assetCodes.indexOf(item.tokenInfo.symbol) === -1) {
    //           return;
    //         } else {
    //           assetCodes.splice(assetCodes.indexOf(item.tokenInfo.symbol), 1);
    //         }
    //       }
    //       let balance = new Big(item.balance).div(new Big(10).pow(Number(item.tokenInfo.decimals)));
    //       balances.push({
    //         code: item.tokenInfo.symbol,
    //         value: balance,
    //         name: item.tokenInfo.name,
    //         issuer: item.tokenInfo.address.toLocaleLowerCase()
    //       });
    //     });
    //   }
    //   assetCodes.forEach(item => {
    //     balances.push({
    //       code: item,
    //       value: 0,
    //       name: tokenConfig[item].symbol,
    //       issuer: tokenConfig[item].address
    //     });
    //   });
    // }
    let balances = [];
    // web3.eth.getBalance方法返回链上指定地址的账户余额。
    let ethBalance = await this.server.eth.getBalance(address);
    balances.push({
      code: CoinType.ETH,
      // ether 货币单位
      value: this.server.utils.fromWei(ethBalance, 'ether')
    });
    for (const tokenCode of assetCodes) {
      let tokenBalance = await this._getTokenBalance(address, tokenCode);
      if (tokenBalance) {
        balances.push(tokenBalance);
      }
    }
    return balances;
  }

  async _getTokenBalance(address, tokenCode) {
    let tokenConfig = tokens.get(AccountType.ethereum);
    if (tokenConfig[tokenCode]) {
      let token = tokenConfig[tokenCode];
      let decimal = token.decimals;
      //这允许您与智能合约进行交互
      let contract = new this.server.eth.Contract(token.abi, token.address);
      let tokenBalance = await contract.methods.balanceOf(address).call();
      let value = tokenBalance / Math.pow(10, decimal);
      //判断 如果是ustd就调整单位
      // if(tokenCode === 'USDT') {
      //   return {
      //     value: Web3.utils.fromWei(tokenBalance, 'mwei'),
      //     code: tokenCode,
      //     issuer: token.address
      //   };
      // } else {
      return {
        value: value,
        code: tokenCode,
        issuer: token.address
      };
      // }
      // let aa = Web3.utils.fromWei(tokenBalance, 'mwei');
      // //console.log(address, tokenCode, aa);
    }
    return null;
  }

  async getGasPriceForGwei() {
    let gasPrice = await this.server.eth.getGasPrice();
    return Web3.utils.fromWei(gasPrice, 'gwei');
  }

  // subscribe (address) {
  //   this.subscription = this.server.eth.subscribe('pendingTransactions', (error) => {
  //     if (error) {
  //       //console.error(error);
  //       return;
  //     }
  //   }).on('data', (txHash) => {
  //     // 根据hash查交易
  //     this.server.eth.getTransaction(txHash).then(ret => {
  //       let addressStr = Web3.utils.hexToNumberString(address);
  //       if (ret && (Web3.utils.hexToNumberString(ret.from) === addressStr || Web3.utils.hexToNumberString(ret.to) === addressStr)) {
  //         // 过滤指定地址的交易
  //         store.dispatch('setBalances', address); // 更新余额
  //       }
  //     });
  //   });
  // }
  //
  // unsubscribe () {
  //   if (this.subscription) {
  //     this.subscription.unsubscribe();
  //     this.subscription = undefined;
  //   }
  // }

  getTransactions(address, option = {}) {
    let mode = 'test';
    if (this.url && this.url.indexOf('mainnet.infura') != -1) {
      mode = 'public';
    }
    let url = `${etherscanApiUrl[mode]}?module=account&apikey=${
      apiKeys[0]
    }&address=${address}`;
    let tokenConfig = tokens.get(AccountType.ethereum);
    if (
      option &&
      option.assetCode &&
      option.assetCode != CoinType.ETH &&
      tokenConfig[option.assetCode]
    ) {
      let token = tokenConfig[option.assetCode];
      url += `&action=tokentx&contractaddress=${token.address}`;
    } else {
      url += '&action=txlist';
    }

    Object.keys(option).forEach(key => {
      if (key !== 'assetCode') {
        url += `&${key}=${option[key]}`;
      }
    });
    return new Promise((resolve, reject) => {
      axios
        .get(url)
        .then(ret => {
          if (ret.data.status === '1' && ret.data.message === 'OK') {
            resolve(ret.data.result);
          } else {
            resolve([]);
          }
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  getTransaction(txHash) {
    this.setServer(this.url);
    return this.server.eth.getTransaction(txHash);
  }

  async sendTransaction(fromSecret, to, amount, option = {}) {
    this.setServer(this.url);
    fromSecret = `0x${fromSecret}`;
    let account = this.server.eth.accounts.privateKeyToAccount(fromSecret);
    const from = account.address;
    const gasPrice = option.gasPrice || (await this.server.eth.getGasPrice());
    const gasLimit = option.gasLimit || 21000;
    const nonce = await this.server.eth.getTransactionCount(from, 'pending');
    let amountValue;
    let toAddress;
    let data;

    if (option.assetCode && option.assetCode !== CoinType.ETH) {
      let tokenConfig = tokens.get(AccountType.ethereum);
      let token = tokenConfig[option.assetCode];
      let contract = new this.server.eth.Contract(token.abi, token.address);
      toAddress = token.address;
      amountValue = '0';
      data = contract.methods
        .transfer(
          to,
          new Big(amount).times(new Big(10).pow(token.decimals)).toFixed()
        )
        .encodeABI();
    } else {
      amountValue = this.server.utils.toWei(amount, 'ether');
      toAddress = to;
      data = '0x';
    }

    const rawTransaction = {
      from: from,
      to: toAddress,
      nonce: Web3.utils.toHex(nonce),
      gasPrice: Web3.utils.toHex(gasPrice),
      gasLimit: Web3.utils.toHex(gasLimit),
      value: Web3.utils.toHex(amountValue),
      data: data
    };

    let privateKey = Buffer.from(fromSecret.substr(2), 'hex');
    let tx = new EthTx(rawTransaction);
    tx.sign(privateKey);
    let serializedTx = `0x${tx.serialize().toString('hex')}`;

    return new Promise((resolve, reject) => {
      this.server.eth.sendSignedTransaction(serializedTx, (err, hash) => {
        if (!err) {
          resolve(hash);
          //console.info('tx hash:' + hash);
        } else {
          reject(err);
          //console.error(err);
        }
      });
    });
  }

  async isContract(address) {
    this.setServer(this.url);
    let code = await this.server.eth.getCode(address);
    if (code === '0x') {
      return false;
    } else {
      return true;
    }
  }

  isValidAddress(address) {
    return Web3.utils.isAddress(address);
  }

  getAccount(hdKey) {
    let wallet = hdKey.getWallet();
    let secret = wallet.getPrivateKeyString().substring(2);
    let address = wallet.getChecksumAddressString();

    return { secret, address };
  }

  getAccountFromSecret(secret) {
    let web3 = new Web3();
    const account = web3.eth.accounts.privateKeyToAccount(
      this.handleSecret(secret)
    );
    const address = account.address;
    return { secret, address };
  }

  /**
   * 对私钥进行处理
   * @param secret （私钥）
   * @returns {*}
   */
  handleSecret(secret) {
    /*私钥规定是64位的排除0x*/
    if (secret.indexOf('0x') === 0 && secret.length > 64) {
      return secret;
    }
    return `0x${secret}`;
  }

  /**
   * 新增合约的时候获取abi
   * @param address (合约地址)
   * @returns {Promise<any>}
   */
  getContractAbi(address) {
    let mode = 'test';
    if (this.url && this.url.indexOf('mainnet.infura') != -1) {
      mode = 'public';
    }
    let url = `${
      etherscanApiUrl[mode]
    }?module=contract&action=getabi&address=${address}&apikey=${apiKeys[0]}`;
    return new Promise((resolve, reject) => {
      axios
        .get(url)
        .then(ret => {
          if (ret.data.status === '1' && ret.data.message === 'OK') {
            resolve(JSON.parse(ret.data.result));
          } else {
            reject(ret.data.result);
          }
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  async getConfirmations(txHash) {
    this.setServer(this.url);
    try {
      const trx = await this.server.eth.getTransaction(txHash);
      const currentBlock = await this.server.eth.getBlockNumber();
      if (!trx) {
        return -1;
      }
      return trx.blockNumber === null ? 0 : currentBlock - trx.blockNumber;
    } catch (error) {
      //console.log(error);
      return error;
    }
  }
}

export default EthereumWallet;
