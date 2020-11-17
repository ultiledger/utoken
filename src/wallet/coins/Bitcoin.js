import bitcoin from 'bitcoinjs-lib';
import wif from 'wif';
import axios from 'axios';
import {CoinType} from "../constants";
import coinSelect  from 'coinselect';
import {usingNetwork} from 'blockchain.info/pushtx';
import Big from 'big.js';
class BitcoinWallet{
  constructor(url, option) {
    this.option = option;
    if (url) {
      this.setServer(url);
    }
  }

  setServer (url) {
    this.url = url;
    if (url === 'https://testnet.blockchain.info') {
      this.network = bitcoin.networks.testnet;
      this.pushtxNetWork = 3;
    } else if (url === 'https://blockchain.info') {
      this.network = bitcoin.networks.bitcoin;
      this.pushtxNetWork = 0;
    }
  }
  destroy () {}

  isActivated () {
    return true;
  }
  getInstance () {
    return this.network;
  }

  transfToBtc (balance) { // satoshi转换为btc
    return new Big(balance).div(100000000).toString();
  }

  transfToSatoshi (amount) { // btc转换为satoshi
    return Number(new Big(amount).times(100000000));
  }

  async getBalances (address) {
    let url = `${this.url}/balance?active=${address}&cors=true`;
    let ret = await axios.get(url);
    if (ret.status === 200) {
      let data = ret.data[address];
      return [{
        value: this.transfToBtc(data.final_balance),
        code: CoinType.BTC
      }];
    } else {
      return [{
        value: '0',
        code: CoinType.BTC
      }];
    }
  }

  getAccount(seed,path) {
    const root = bitcoin.bip32.fromSeed(Buffer.from(seed, 'hex'),this.network);
    const child = root.derivePath(path);
    let keyPair = bitcoin.ECPair.fromWIF(child.toWIF(),this.network);
    return this._getAccountFromECPair(keyPair);
  }
  getAccountFromSecret(secret) {
    const keyPair = this._getECPairFromSecret(secret);
    return this._getAccountFromECPair(keyPair);
  }
  _getAccountFromECPair(keyPair){
    let { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey,network:this.network });
    let secret = wif.encode(0x80,Buffer.from(keyPair.privateKey, 'hex'),true);
    return {secret, address};
  }
  _getECPairFromSecret(secret){
    const w = wif.decode(secret.toString());
    const keyPair = bitcoin.ECPair.fromPrivateKey(w.privateKey);
    return keyPair;
  }

  async sendTransaction(fromSecret, toAddress, options = {}, func){
    // Error: Invalid checksum,是fromSecret不正确
    let NETWORK = this.network;
    let pushtx = usingNetwork(this.pushtxNetWork);
    const w = wif.decode(fromSecret);
    const fromPair = bitcoin.ECPair.fromPrivateKey(w.privateKey, {network:NETWORK});
    let { address } = bitcoin.payments.p2pkh({ pubkey: fromPair.publicKey,network:NETWORK});
    //return new Promise(async (resolve, reject)=>{
      try {
        await axios.get(`${this.url}/unspent?active=${address}&cors=true`).then((response) => {
          if (response.status === 200) {
            let amount = options.amount || 0;
            if (typeof amount === 'string') {
              amount = Number(amount);
            }
            let feeRate = options.feeRate || 35;
            if (typeof feeRate === 'string') {
              feeRate = Number(feeRate);
            }
            let targets = [
              {
                address: toAddress,
                value: this.transfToSatoshi(amount)
              }
            ];
            let bodyObj = response.data;
            if (typeof response.data !== 'object') {
              bodyObj = JSON.parse(response.data);
            }
            if (!bodyObj) throw new Error('no utxos back or error');
            let utxos = bodyObj.unspent_outputs;
            if (utxos.length <= 0) {
              console.error('no utxo');
              throw new Error('no utxo');
            }
            let { inputs, outputs, fee } = coinSelect(utxos, targets, feeRate);
            if (!fee) {
              throw new Error('fee too low');
            }
            if (!inputs || !outputs) {
              console.error('.inputs and .outputs are undefined because no solution was found');
              throw new Error('inputs and outputs are undefined because no solution was found');
            }
            console.log('transaction stat:');
            const txb = new bitcoin.TransactionBuilder(NETWORK);
            inputs.forEach(input => txb.addInput(input.tx_hash_big_endian, input.tx_output_n));
            outputs.forEach(output => {
              // watch out, outputs may have been added that you need to provide
              // an output address/script for
              if (!output.address) {
                output.address = address;
              }
              txb.addOutput(output.address, output.value);
            });
            for (let index in inputs) {
              txb.sign(parseInt(index), fromPair);
            }
            console.log('transaction end:');
            // 广播(广播成功之后返回transition submitted)
            if (func) {
              func(this.url, txb.build().toHex());
            } else {
              pushtx.pushtx(txb.build().toHex()).then((ret) => {
                return ret;
              }).catch(err => {
                throw new Error(err);
              });
            }
          }
        }).catch(function (error) {
          throw new Error(error);
        });
      } catch (err) {
        throw new Error(err);
      }
    //});
  }

  async getTransactions (address, option = {}) {
    //return new Promise(async (resolve, reject)=>{
      try {
        if (!option.limit) {
          option.limit = 50;
        }
        if (!option.offset) {
          option.offset  = 0;
        }
        let page = await axios.get(`${this.url}/multiaddr?active=${address}&offset=${option.offset}&n=${option.limit}&cors=true`);
        if (page) {
          return page.data;
        }
      } catch (err) {
        throw new Error(err);
      }
  //  });
  }

  isValidAddress (address) {
    try {
      bitcoin.address.toOutputScript(address,this.network);
      return true;
    } catch (e) {
      return false;
    }
  }

  async getConfirmations(item) { // 获取确认数，原理=最新区块-交易的区块
    try {
      const lastBlock = await axios.get(`${this.url}/latestblock?cors=true`);
      if (!item.blockNumber) {
        return -1;
      }
      return item.blockNumber === null ? 0 : lastBlock.data.height - item.blockNumber + 1;
    }catch (error) {
      console.log(error);
      return error;
    }

  }
}

export default BitcoinWallet;
