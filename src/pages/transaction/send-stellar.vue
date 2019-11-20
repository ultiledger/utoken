<template>
  <div>
    <div style="width: 100%;" class="transfer-container">
      <pl-content-block :offsetTop="46" :offsetBottom="45">
      <div class="item-block" style="padding-bottom: 0;">
        <pl-block >
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
      <receive-address class="item-block" v-model="form.receiveAddress" :accountType="stellar" @change="changeReceiveAddress">
        <small class="text-danger" v-show="!addressValid" v-text="$t('address.invalidAddressTip')"></small>
        <small class="text-info" v-show="!addressActivated" v-text="$t('transaction.stellarUnActivationAddressMsg')"></small>
        <small class="text-danger" v-show="!trustAsset" v-html="$t('transaction.notTrustAssetMsg', {code: asset.code})"></small>
      </receive-address>

      <div class="item-block">
        <pl-block>
          <div style="padding: 0 0 10px;">
            <div class="pull-left normal-font">Memo</div>
            <div class="pull-right">
              <span class="memo-type" @click="selectMemo(memo.value)" :class="{'active': form.memoType === memo.value, 'disabled' : !canSelectMemoType}" :key="index" v-for="(memo, index) in memoTypes">
              <span class="icon text-success" v-if="form.memoType === memo.value"><van-icon name="certificate" style="vertical-align: middle;"/></span>
                <span style="vertical-align: middle;">{{memo.text}}</span>
              </span>
            </div>
          </div>
          <van-field
            v-model="form.memo"
            :placeholder="$t('transaction.inputMemoPlaceholder')"
            clearable>
          </van-field>
          <small class="text-danger" v-show="isNeedMemo && !form.memo" v-text="$t('transaction.stellarNeedMemo')"></small>
          <small class="text-danger" v-show="isValidMemo">{{isValidMemo}}</small>
        </pl-block>
      </div>
      </pl-content-block>
      <pl-stick :offset-bottom="0">
        <van-button size="large" :loading="loading" :disabled="firstBthDisabled" class="plat-btn" @click="firstStep" type="primary" v-text="$t('common.next')"></van-button>
      </pl-stick>
    </div>
    <van-actionsheet v-model="showFirstStep"  :close-on-click-overlay="false">
      <div class="transfer-sub-warpper">
        <div v-show="!showSecondStep">
          <van-nav-bar :title="$t('transaction.confirmTransferAcctMsg')" @click-left="showFirstStep = false">
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
                <div style="font-size: 12px;">{{form.receiveAddress}}</div>
              </van-cell>
              <van-cell>
                <span slot="title" class="text-muted" v-text="$t('common.paymentAddress')"></span>
                <div style="font-size: 12px;">{{$store.state.account.address}}</div>
              </van-cell>
              <van-cell>
                <span slot="title" class="text-muted">memo_{{form.memoType}}</span>
                <div>{{form.memo}}</div>
              </van-cell>
            </van-cell-group>
          </div>
          <pl-stick :offset-bottom="0">
            <van-button size="large" :loading="loading" class="plat-btn" @click="secondStep()" type="primary" v-text="$t('common.next')"></van-button>
          </pl-stick>
        </div>
        <div v-show="showSecondStep">
          <van-nav-bar :title="$t('common.inputPwd')"  left-arrow @click-left="showSecondStep = false" />
          <van-cell-group>
            <van-field v-model="form.password" ref="password" type="password" @click-icon="displayPassword = true" :placeholder="$t('transaction.walletPwdPlaceholder')" icon="password-not-view" v-show="!displayPassword"/>
            <van-field v-model="form.password" ref="visualPassword" type="text" @click-icon="displayPassword = false" :placeholder="$t('transaction.walletPwdPlaceholder')" icon="password-view" v-show="displayPassword"/>          </van-cell-group>
          <pl-stick :offset-bottom="0">
            <van-button size="large" :loading="loading" :disabled="!form.password" class="plat-btn"  @click="submit" type="primary" v-text="$t('transaction.submit')"></van-button>
          </pl-stick>
        </div>
      </div>
    </van-actionsheet>
  </div>
</template>
<script>
  import receiveAddress from '../ui/receive-address';
  import Big from 'big.js';
  import StellarSdk from 'stellar-sdk';
  import cryptor from 'core/utils/cryptor';
  import {AccountType} from '../../wallet/constants';
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
        isNeedMemo: false,
        canSelectMemoType: true,
        form: {
          amt: '',
          receiveAddress: '',
          memo: '',
          memoType: StellarSdk.MemoText,
          remark: '',
          password: ''
        },
        loading: false,
        addressValid: true,
        addressActivated: true,
        trustAsset: true,
        memoTypes: [
          {text: 'ID', value: StellarSdk.MemoID},
          {text: 'Text', value: StellarSdk.MemoText},
          {text: 'Hash', value: StellarSdk.MemoHash}
        ],
        stellar: AccountType.stellar
      };
    },
    watch: {
      'form.receiveAddress' () {
        if (this.form.receiveAddress) {

          if (!this.$wallet.isValidAddress(this.form.receiveAddress)) {
            this.addressValid = false;
            this.addressActivated = true;
            this.trustAsset = true;
            return;
          } else {
            this.addressValid = true;
          }
          this.$wallet.isActivated(this.form.receiveAddress).then(ret => {
            this.addressActivated = ret;
            if (this.addressActivated) {
              this.$wallet.isTrustAsset(this.form.receiveAddress, this.asset.code, this.asset.issuer).then(ret => {
                this.trustAsset = ret;
              });
            } else {
              this.trustAsset = true;
            }
          });
          let config = this.$wallet.isTradingPlatformAddress(this.form.receiveAddress);
          if (config) {
            if (config['memo_type']) {
              this.form.memoType = config['memo_type'];
            }
            this.isNeedMemo = true;
            this.canSelectMemoType = false;
          } else {
            this.isNeedMemo = false;
            this.canSelectMemoType = true;
          }
        } else {
          this.addressValid = true;
          this.addressActivated = true;
          this.isNeedMemo = false;
          this.canSelectMemoType = true;
          this.trustAsset = true;
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
      balance () {
        let value = this.getBalance(this.asset.code, this.asset.issuer).value;
        let frozenNative = this.getBalance(this.asset.code, this.asset.issuer).frozenNative;
        if (frozenNative && frozenNative <= value){
          value = value - frozenNative;
        }
        return value;
      },
      isValidMemo () {
        if (this.form.memo) {
          let msg =  this.$wallet.isValidMemo(this.form.memoType, this.form.memo);
          if (msg) {
            console.log(msg);
            return this.memoErrMsg[this.form.memoType];
          } else {
            return '';
          }
        }
        return '';
      },
      firstBthDisabled () {
        if (this.form.amt && this.form.receiveAddress && this.addressValid && this.trustAsset) {
          if (this.asset.issuer && !this.addressActivated) {
            return true;
          }
          if (this.isNeedMemo && !this.form.memo) {
            return true;
          }
          return false;
        }
        return true;
      },
      errMsg () {
        return {
          'op_underfunded': this.$t('transaction.tecUnfundedPayment'),
          'op_low_reserve': this.$t('transaction.opLowReserve')
        };
      },
      memoErrMsg () {
        return {
          [StellarSdk.MemoID]: this.$t('transaction.memoExpectsNum'), // Expects a int64 as a string
          [StellarSdk.MemoText]: this.$t('transaction.memoExpectsMax28Byte'), // Expects string, array or buffer, max 28 bytes
          [StellarSdk.MemoHash]: this.$t('transaction.memoExpects32Byte') // Expects a 32 byte hash value or hex encoded string
        };
      }
    },
    created () {
    },
    methods: {
      init () {
        this.showFirstStep = false;
        this.showSecondStep = false;
        this.displayPassword =  false;
        this.isNeedMemo = false;
        this.canSelectMemoType = true;
        this.form ={
          amt: '',
          receiveAddress: '',
          memo: '',
          memoType: StellarSdk.MemoText,
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
      selectMemo (value) {
        if (!this.canSelectMemoType) {
          return;
        }
        if (value !== this.form.memoType) {
          this.form.memoType = value;
          this.form.memo = '';
        }
      },
      changeReceiveAddress (address) {
        this.form.memoType = address.labelType;
        this.form.memo = address.labelValue;
      },
      firstStep () {
        let amt = new Big(this.form.amt);
        if (amt.lte(0)) {
          this.$toast(this.$t('transaction.amountGreaterThanZero'));
          return;
        }
        if (amt.gt(this.balance)) {
          this.$toast(this.$t('transaction.balanceTooLowTip'));
          return;
        }

        if (!this.addressActivated && amt.lt('1')) {
          this.$toast(this.$t('transaction.stellarUnActivationAddressTip'));
          return;
        }

        if (!this.$wallet.isValidAddress(this.form.receiveAddress)) {
          this.$toast(this.$t('address.invalidAddressTip'));
          return;
        }

        if (this.isNeedMemo && !this.form.memo) {
          this.$toast(this.$t('transaction.requiredMemo'));
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
        if (err && err.response && err.response.data && err.response.data.extras && err.response.data.extras.result_codes) {
          // const resultXdr = StellarSdk.xdr.TransactionResult.fromXDR(err.response.data.extras.result_xdr, 'base64');
          let result_codes = err.response.data.extras.result_codes;
          return this.errMsg[result_codes.operations[0]] ? this.errMsg[result_codes.operations[0]] : retMsg;
        }
        return retMsg;
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
          memo: this.form.memo,
          memoType: this.form.memoType
        };

        if (this.asset && this.asset.code && this.asset.issuer) {
          options.assetCode = this.asset.code;
          options.assetIssuer = this.asset.issuer;
        }

        this.$wallet.sendTransaction(cryptor.decryptAES(this.$store.state.account.secret, this.form.password), this.form.receiveAddress, this.form.amt, options)
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
  @import "../../../src/assets/scss/variables";
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
    .memo-type {
      height: 20px;
      margin: 6px 0px 6px 5px;
      line-height: 20px;
      display: inline-block;
      width: 55px;
      text-align: center;
      background: #ecebeb;
      border-radius: 10px;
      font-size: 12px;
      position: relative;
      .icon{
        position: absolute;
        top: -4px;
        right: 0px;
      }
      &.active{
        background: $primary-color-light-1 !important;
        color: #222 !important;
      }
      &.disabled {
        background: $dark-white;
        color: #999;
      }
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
