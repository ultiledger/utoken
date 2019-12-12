<template>
  <div>
  <div style="width: 100%;" class="transfer-container">
    <pl-content-block :offsetTop="46" :offsetBottom="45">
    <div class="item-block" style="padding-bottom: 0;">
      <pl-block>
        <div style="padding: 0 0 10px;" class="normal-font">
          {{asset.code}}
          <span class="small-font pull-right">
            <span slot="title">
              <span>{{$t('transaction.balance')}}&nbsp;</span>
              <span class="text-primary">{{balance| currency('', '7') | cutTail}}&nbsp;{{asset.code}}</span></span>
          </span>
        </div>
        <van-field
          v-model="form.amt"
          type="number"
          name="amt"
          :placeholder="$t('transaction.amtPlaceholder')"
          class="x-large-font">
          <span slot="button" class="small-font">≈&nbsp;{{form.amt |  market(asset.code, asset.issuer)}}</span>
        </van-field>
       <!-- <van-cell style="padding: 14px 0;">
          <span slot="title">{{$t('transaction.balance')}}&nbsp;<span class="text-primary">{{balance| currency('', '7') | cutTail}}&nbsp;{{asset.code}}</span></span>
          <span class="text-primary" @click="form.amt = balance">全部转出</span>
        </van-cell>-->
      </pl-block>
    </div>

   <receive-address class="item-block" v-model="form.receiveAddress" :accountType="ethereum">
     <small class="text-danger" v-show="!addressValid" v-text="$t('address.invalidAddressTip')"></small>
   </receive-address>

    <div class="item-block">
      <pl-block>
        <div style="padding: 0 0 10px;overflow: hidden;">
          <div class="pull-left normal-font">{{$t('transaction.minerFee')}}</div>
          <div class="pull-right">
            <span class="small-font">{{fee}}&nbsp;ether&nbsp;≈&nbsp;{{fee |  market(ETH, '') | currency('', '7') | cutTail}}&nbsp;{{$store.state.setting.currencyUnit}}<!--&nbsp;<van-icon name="arrow" style="vertical-align: middle;" />--></span>
          </div>
        </div>
        <div class="slider">
          <van-slider  bar-height="4px" @change="calcGas()" v-model="rate"/>
        </div>
        <van-row class="small-font" style="padding-bottom: 20px;">
          <van-col span="8" v-text="$t('transaction.slow')"></van-col>
          <van-col span="8" class="text-center text-muted">{{form.gasPrice}}&nbsp;gwei</van-col>
          <van-col span="8" class="text-right" v-text="$t('transaction.fast')"></van-col>
        </van-row>
      </pl-block>
    </div>
    </pl-content-block>
    <pl-stick :offset-bottom="0">
      <van-button size="large" :loading="loading" :disabled="!form.amt || !form.receiveAddress" class="plat-btn" @click="firstStep" type="primary" :text="$t('common.next')"></van-button>
    </pl-stick>
  </div>
    <van-actionsheet v-model="showFirstStep"  :close-on-click-overlay="false">
      <div class="transfer-sub-warpper">
        <div v-show="!showSecondStep">
          <van-nav-bar :title="$t('transaction.confirmTransferAcctMsg')"  @click-left="showFirstStep = false">
            <span slot="left"><van-icon name="close" /></span>
          </van-nav-bar>
          <div>
            <div class="text-center x-x-large-font" style="padding:20px 0px;">
              {{form.amt | currency('', '7') | cutTail}}&nbsp;<small>{{asset.code}}</small>
            </div>
            <van-cell-group>
              <van-cell>
                <span slot="title" class="text-muted" v-text="$t('transaction.transferAcctType')"></span>
                {{asset.code}}&nbsp;{{$t('common.transferAccounts')}}
              </van-cell>
              <van-cell :title="$t('common.receivablesAddress')">
                <span slot="title" class="text-muted" v-text="$t('common.receivablesAddress')"></span>
                <div>{{form.receiveAddress}}</div>
              </van-cell>
              <van-cell :title="$t('common.paymentAddress')">
                <span slot="title" class="text-muted" v-text="$t('common.paymentAddress')"></span>
                <div>{{$store.state.account.address}}</div>
              </van-cell>
              <van-cell>
                <span slot="title" class="text-muted" v-text="$t('transaction.minerFee')"></span>
                <div >
                  {{fee | currency('', '7') | cutTail}}&nbsp;ether
                  <br><span class="text-muted small-font">= Gas({{form.gasLimit}}) * Gas Price({{form.gasPrice}}&nbsp;gwei)</span>
                </div>
              </van-cell>
            </van-cell-group>
          </div>
          <pl-stick :offset-bottom="0">
            <van-button size="large" :loading="loading" class="plat-btn" @click="secondStep()" type="primary" :text="$t('common.next')"></van-button>
          </pl-stick>
        </div>
        <div v-show="showSecondStep">
          <van-nav-bar :title="$t('common.inputPwd')"  left-arrow @click-left="showSecondStep = false" />
          <van-cell-group>
            <van-field v-model="form.password" ref="password" type="password" @click-icon="displayPassword = true" :placeholder="$t('transaction.walletPwdPlaceholder')" icon="closed-eye" v-show="!displayPassword"/>
            <van-field v-model="form.password" ref="visualPassword" type="text" @click-icon="displayPassword = false" :placeholder="$t('transaction.walletPwdPlaceholder')" icon="eye-o" v-show="displayPassword"/>
          </van-cell-group>
          <pl-stick :offset-bottom="0">
            <van-button size="large" :loading="loading" :disabled="!form.password" class="plat-btn"  @click="submit" type="primary" :text="$t('transaction.submit')"></van-button>
          </pl-stick>
        </div>
      </div>
    </van-actionsheet>
  </div>
</template>
<script>
  import Big from 'big.js';
  import {AccountType, CoinType} from '../../wallet/constants';
  import receiveAddress from '../ui/receive-address';
  import cryptor from 'core/utils/cryptor';
  import moment from 'moment';
  export default{
    components: {receiveAddress},
    props: {
      asset: {
        type: Object,
        default () {
          return {};
        }
      },
      address: String,
      transferAmt: String
    },
    data () {
      return {
        showFirstStep: false,
        showSecondStep: false,
        displayPassword: false,
        form: {
          amt: '',
          receiveAddress: '',
          remark: '',
          gasLimit: 60000,
          gasPrice: '5',
          password: ''
        },
        minGasPrice: 5,
        rate: 0,
        loading: false,
        addressValid: true,
        ethereum: AccountType.ethereum,
        ETH: CoinType.ETH
      };
    },
    watch: {
      'form.receiveAddress' () {
        if (this.form.receiveAddress) {
          if (!this.$wallet.isValidAddress(this.form.receiveAddress)) {
            this.addressValid = false;
            return;
          } else {
            this.addressValid = true;
          }
        } else {
          this.addressValid = true;
        }
      },
      displayPassword () {
        if (this.showSecondStep) {
          if (this.displayPassword) {
            this.$nextTick(() => {
              this.$refs['visualPassword'].$refs['input'].focus();
            });
          } else {
            this.$nextTick(() => {
              this.$refs['password'].$refs['input'].focus();
            });
          }
        }
      }
    },
    computed: {
      fee () {
        if ( this.$wallet && this.$wallet.getInstance()) {
          let wei = new Big(this.form.gasPrice).times('1000000000').times(this.form.gasLimit).toFixed(0);
          return this.$wallet.getInstance().utils.fromWei(wei, 'ether');
        }
        return 0;
      },
      balance () {
        return this.getBalance(this.asset.code, this.asset.issuer).value;
      },
      errMsg () {
        return {
          'intrinsic gas too low': 'gas ' + this.$t('transaction.gasTooLow'),
          'insufficient funds for gas * price + value': this.$t('transaction.insufficientFundsGasAndValue')
        };
      }
    },
    created () {
      this.init();
    },
    methods: {
      init () {
        this.showFirstStep = false;
        this.showSecondStep = false;
        this.displayPassword = false;
        this.form = {
          amt: '',
          receiveAddress: '',
          remark: '',
          gasLimit: 60000,
          gasPrice: '5',
          password: ''
        };
        if (this.address && this.address !== '') {
          this.form.receiveAddress = this.address;
        }
        if (this.transferAmt && this.transferAmt !== '') {
          this.form.amt = Number(this.transferAmt);
        }
        this.$wallet.getGasPriceForGwei().then(ret => {
          this.minGasPrice = Math.round(new Number(ret));
          this.form.gasPrice = this.minGasPrice  + '';
        });
      },
      firstStep () {
        // let amt = new Big(this.form.amt).plus(this.fee);
        let amt = new Big(this.form.amt);
        if (amt.lte(0)) {
          this.$toast(this.$t('transaction.amountGreaterThanZero'));
          return;
        }

        if (amt.gt(this.balance)) {
          this.$toast(this.$t('transaction.balanceTooLowTip'));
          return;
        }
        if (!this.$wallet.isValidAddress(this.form.receiveAddress)) {
          this.$toast(this.$t('address.invalidAddressTip'));
          return;
        }
        this.showFirstStep = true;
      },
      secondStep () {
        this.showSecondStep = true;
        this.form.password = '';
        this.$nextTick(() => {
          this.$refs['password'].$refs['input'].focus();
        });
      },
      getErrMsg (err) {
        let retMsg = this.$t('common.transactionFail');
        if (err && err.message) {
          let message = err.message.replace('Returned error: ', '');
          return this.errMsg[message] ? this.errMsg[message] : retMsg;
        }
        return retMsg;
      },
      submit () {
        let paswordMd5 = cryptor.encryptMD5(this.form.password);
        if (paswordMd5 !== this.$store.state.account.password) {
          this.$toast(this.$t('transaction.walletPwdError'));
          return;
        }
        let options;
        if (this.$store.state.account.type === this.ethereum) {
          options = {
            assetCode: this.asset.code,
            gasLimit: this.form.gasLimit,
            gasPrice: this.$wallet.getInstance().utils.toWei(this.form.gasPrice, 'gwei')
          };
        }

        const toast = this.$toast.loading({
          duration: 0,
          forbidClick: true,
          loadingType: 'circular',
          message: this.$t('transaction.inTransactionMessage')
        });

        this.$wallet.sendTransaction(cryptor.decryptAES(this.$store.state.account.secret, this.form.password), this.form.receiveAddress, this.form.amt, options)
          .then(ret => {
            console.info(ret);
            this.setTempHistory(ret, this.form.receiveAddress, this.form.amt, options, () => {
              toast.message = this.$t('transaction.transactionBroadcastSuccess');
              setTimeout(() => {
                toast.clear();
                this.$emit('done');
              }, 2000);
            });
            // this.$wallet.getTransaction(ret).then(tx => {
            //   console.info('tx:', tx);
            //   let account = this.$store.state.account;
            //   let fee = '0';
            //   if (tx.gas && tx.gasPrice) {
            //     fee = new Big(tx.gas).times(tx.gasPrice).toFixed();
            //   }
            //   let tempHistory = {
            //     address: account.address,
            //     acctType: account.type,
            //     assetCode: this.asset.code,
            //     assetIssuer: this.asset.issuer,
            //     txHash: tx.hash,
            //     amount: this.form.amt,
            //     blockNumber: tx.blockNumber,
            //     to: this.form.receiveAddress,
            //     from: tx.from,
            //     fee:  this.$wallet.getInstance().utils.fromWei(fee, 'ether'),
            //     txType: '0',
            //     txTime: new moment().format('YYYYMMDD HH:mm:ss'),
            //     data: tx,
            //     confirmations: 0
            //   };
            //   this.$collecitons.tempHistory.insertHistory(tempHistory);
            //   toast.message = this.$t('transaction.transactionBroadcastSuccess');
            //   setTimeout(() => {
            //     toast.clear();
            //     this.$emit('done');
            //   }, 1000);
            // });
          })
          .catch(err => {
            console.info(err);
            this.$toast(this.getErrMsg(err));
            setTimeout(() => {
              toast.clear();
            }, 5000);
          });
      },
      async setTempHistory (txHash, to, amount, options, callback) {
        // let flag = true;
        let count = 0;
        const done = async () => {
          let tx = await this.$wallet.getTransaction(txHash);
          count++;
          console.info(`tx(${count}):`, tx);
          if (!tx) {
            if (count === 20) {
              callback();
              return;
            }
            setTimeout(done, 3000);
            return;
          }
          let account = this.$store.state.account;
          let fee = '0';
          if (tx.gas && tx.gasPrice) {
            fee = new Big(tx.gas).times(tx.gasPrice).toFixed();
          }
          let tempHistory = {
            address: account.address,
            acctType: account.type,
            assetCode: this.asset.code,
            assetIssuer: this.asset.issuer,
            txHash: tx.hash,
            amount:amount,
            blockNumber: tx.blockNumber,
            to: to,
            from: tx.from,
            fee:  this.$wallet.getInstance().utils.fromWei(fee, 'ether'),
            txType: '0',
            txTime: new moment().format('YYYYMMDD HH:mm:ss'),
            data: tx,
            confirmations: 0
          };
          this.$collecitons.tempHistory.insertHistory(tempHistory);
          callback();
        };
        done();
        // while (flag)  {
        //   let tx = await this.$wallet.getTransaction(txHash);
        //   console.info('tx:', tx);
        //   if (!tx) {
        //     continue;
        //   } else {
        //     flag = false;
        //   }
        //   let account = this.$store.state.account;
        //   let fee = '0';
        //   if (tx.gas && tx.gasPrice) {
        //     fee = new Big(tx.gas).times(tx.gasPrice).toFixed();
        //   }
        //   let tempHistory = {
        //     address: account.address,
        //     acctType: account.type,
        //     assetCode: this.asset.code,
        //     assetIssuer: this.asset.issuer,
        //     txHash: tx.hash,
        //     amount:amount,
        //     blockNumber: tx.blockNumber,
        //     to: to,
        //     from: tx.from,
        //     fee:  this.$wallet.getInstance().utils.fromWei(fee, 'ether'),
        //     txType: '0',
        //     txTime: new moment().format('YYYYMMDD HH:mm:ss'),
        //     data: tx,
        //     confirmations: 0
        //   };
        //   this.$collecitons.tempHistory.insertHistory(tempHistory);
        //   callback();
        // }
      },
      calcGas () {
        let minGasPrice  = new Big(this.minGasPrice);
        let maxGasPrice  = new Big(30);
        this.form.gasPrice = maxGasPrice.minus(minGasPrice).div(100).times(this.rate).plus(minGasPrice).toFixed(2);
      }
    }
  };
</script>
<style lang="scss">
  .transfer-container{
    .van-field{
      padding-left: 0;
      padding-right: 0;
    }
    .van-cell{
      &:after{
        left: 0;
      }
    }
    .slider{
      padding-top: 30px;
      padding-bottom: 14px;
    }
  }
  .transfer-sub-warpper {
    height: 450px;
    .van-cell {
      .van-cell__title{
        width: 90px;
        flex: none;
      }
      .van-cell__value{
        text-align: left;
        word-break: break-all;
      }
    }
  }
</style>
