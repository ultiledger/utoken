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
            <span slot="button" class="small-font">≈&nbsp;{{form.amt |  market(asset.code)}}</span>
          </van-field>
         <!-- <van-cell style="padding: 14px 0;">
            <span slot="title">{{$t('transaction.balance')}}&nbsp;<span class="text-primary">{{balance| currency('', '7') | cutTail}}&nbsp;{{asset.code}}</span></span>
            <span class="text-primary" @click="form.amt = balance">全部转出</span>
          </van-cell>-->
        </pl-block>
      </div>
      <receive-address class="item-block" v-model="form.receiveAddress" :accountType="bitcoin">
        <small class="text-danger" v-show="!addressValid" v-text="$t('address.invalidAddressTip')"></small>
      </receive-address>

      <div class="item-block">
        <pl-block>
          <div style="padding: 0 0 10px;overflow: hidden;">
            <div class="pull-left normal-font">{{$t('transaction.minerFee')}}</div>
            <div class="pull-right">
              {{selectFee}}&nbsp;sat/b
            </div>
          </div>
          <van-radio-group v-model="selectFee">
            <van-cell-group>
              <van-cell
                v-for="(item,index) in frees"
                :key="index"
                clickable>
                <span slot="title">{{item.name}}:&nbsp;{{item.value}}&nbsp;sat/b</span>
                <van-radio :name="item.value" />
              </van-cell>
              <van-field
                type="number"
                style="padding-left: 15px;"
                maxlength="20"
                v-model="customerFee"
                @focus="feeFocus"
                :placeholder="$t('transaction.customerFeePlaceholder')" />
            </van-cell-group>
          </van-radio-group>
        </pl-block>
      </div>
      </pl-content-block>
      <pl-stick :offset-bottom="0">
        <van-button size="large" :loading="loading" :disabled="firstBthDisabled" class="plat-btn" @click="firstStep" type="primary" :text="$t('common.next')"></van-button>
      </pl-stick>
    </div>
    <van-action-sheet v-model="showFirstStep"  :close-on-click-overlay="false">
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
              <van-cell>
                <span slot="title" class="text-muted" v-text="$t('common.receivablesAddress')"></span>
                <div>{{form.receiveAddress}}</div>
              </van-cell>
              <van-cell>
                <span slot="title" class="text-muted" v-text="$t('common.paymentAddress')"></span>
                <div>{{$store.state.account.address}}</div>
              </van-cell>
              <van-cell>
                <span slot="title" class="text-muted" v-text="$t('transaction.minerFee')"></span>
                <div>{{selectFee}}&nbsp;sat/b</div>
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
            <van-field v-model="form.password" ref="password" type="password" @click-right-icon="displayPassword = true" :placeholder="$t('transaction.walletPwdPlaceholder')" right-icon="closed-eye" v-show="!displayPassword"/>
            <van-field v-model="form.password" ref="visualPassword" type="text" @click-right-icon="displayPassword = false" :placeholder="$t('transaction.walletPwdPlaceholder')" right-icon="eye-o" v-show="displayPassword"/>          </van-cell-group>
          <pl-stick :offset-bottom="0">
            <van-button size="large" :loading="loading" :disabled="!form.password" class="plat-btn"  @click="submit" type="primary" :text="$t('transaction.submit')"></van-button>
          </pl-stick>
        </div>
      </div>
    </van-action-sheet>
  </div>
</template>
<script>
  import receiveAddress from '../ui/receive-address';
  import Big from 'big.js';
  import cryptor from 'core/utils/cryptor';
  import {AccountType} from '../../wallet/constants';
  import axios from 'axios';

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
        selectFee: '35',
        customerFee: '',
        frees: [
          {name: 'Regular', value: '35'},
          {name: 'Priority', value: '45'}
          ],
        form: {
          amt: '',
          receiveAddress: '',
          tag: '',
          remark: '',
          password: ''
        },
        loading: false,
        addressValid: true,
        bitcoin: AccountType.bitcoin
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
      },
      customerFee () {
        if (this.customerFee) {
          this.selectFee = this.customerFee;
        }
      }
    },
    computed: {
      balance () {
        return this.getBalance(this.asset.code).value;
      },
      firstBthDisabled () {
        if (this.form.amt && this.form.receiveAddress && this.addressValid && this.selectFee) {
          return false;
        }
        return true;
      },
      errMsg () {
        return  {
          'Invalid checksum': this.$t('transaction.invalidChecksum'),
          'Inconsistent network': this.$t('transaction.inconsistentNetwork'),
          'inputs and outputs are undefined because no solution was found': this.$t('transaction.balanceTooLowTip'),
          'no utxo': this.$t('transaction.utxosUnExist'),
          'fee too low': this.$t('transaction.feeTooLow'),
          'Network Error': this.$t('transaction.networkError')
        };
      }
    },
    created () {
    },
    methods: {
      init () {
        this.showFirstStep = false;
        this.showSecondStep = false;
        this.displayPassword = false;
        this.selectFee = '35';
        this.customerFee = '';
        this.form = {
          amt: '',
          receiveAddress: '',
          remark: '',
          password: ''
        };
        if (this.address && this.address !== '') {
          this.form.receiveAddress = this.address;
        }
        if (this.transferAmt && this.transferAmt !== '') {
          this.form.amt = Number(this.transferAmt);
        }
      },
      firstStep () {
        let amt = new Big(this.form.amt);
        if (amt.lte(0)) {
          this.$toast(this.$t('transaction.amountGreaterThanZero'));
          return;
        }
        if (amt.gte(this.balance)) {
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
        if (err && this.errMsg[err.message]) {
          return this.errMsg[err.message];
        }
        return retMsg;
      },
      feeFocus () {
        this.selectFee = '';
        this.customerFee = '';
      },
      httpPost () {
        return axios.post;
      },
      sendTransaction (url, txHex, resolve, reject) {
        let post = this.httpPost();
        post(`${url}/pushtx?cors=true`, {
          tx: txHex
        }, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          transformRequest: [
            function (data) {
              let ret = '';
              for (let it in data) {
                ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]);
              }
              return ret;
            }]
        }).then(ret => {
          resolve(ret);
        }).catch((error) => {
          reject(error);
        });
      },
      submit () {
        let paswordMd5 = cryptor.encryptMD5(this.form.password);
        if (paswordMd5 !== this.$store.state.account.password) {
          this.$toast(this.$t('transaction.walletPwdError'));
          return;
        }

        const toast = this.$toast.loading({
          duration: 0,
          forbidClick: true,
          loadingType: 'circular',
          message: this.$t('transaction.inTransactionMessage')
        });

        let options = {
          feeRate: this.selectFee,
          amount: this.form.amt
        };

        this.$wallet.sendTransaction(cryptor.decryptAES(this.$store.state.account.secret, this.form.password), this.form.receiveAddress,options, this.sendTransaction)
          .then(ret => {
            console.info(ret);
            toast.message = this.$t('transaction.transactionBroadcastSuccess');
            setTimeout(() => {
              toast.clear();
              this.$emit('done');
            }, 2000);
          })
          .catch(err => {
            console.error(err);
            this.$toast(this.getErrMsg(err));
            setTimeout(() => {
              toast.clear();
            }, 4000);
          });
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
