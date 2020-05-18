<template>
  <div>
    <van-popup
      v-model="showPop"
      position="right"
      class="popup-wapper"
      style="height: 100%;width: 100%;"
    >
      <van-nav-bar
        :title="$t('acct.acctdel')"
        @click-left="close"
      >
        <span slot="left"><i class="ultfont ult-left"></i></span>
      </van-nav-bar>
      <div style="width: 100%;" class="transfer-container">
      <pl-content-block :offsetTop="46" :offsetBottom="45">
      <receive-address class="item-block" v-model="form.receiveAddress" :accountType="ripple" @change="changeReceiveAddress">
        <small class="text-danger" v-show="!addressValid" v-text="$t('address.invalidAddressTip')"></small>
        <small class="text-danger" v-show="!addressActivated" v-text="$t('transaction.xrpUnActivationAddressMsg')"></small>
      </receive-address>

      <div class="item-block" v-show="!XAddress">
        <pl-block>
          <div style="padding: 0 0 10px;overflow: hidden;">
            <div class="pull-left normal-font">Tag</div>
          </div>
          <van-field
            v-model="form.tag"
            :placeholder="$t('transaction.inputTagPlaceholder')"
            type="number"
            clearable>
          </van-field>
          <small class="text-danger" v-show="isNeedTag && !form.tag" v-text="$t('transaction.xrpExchangeAddress')"></small>
        </pl-block>
      </div>
      </pl-content-block>
      <pl-stick :offset-bottom="0">
        <van-button size="large" :loading="loading" :disabled="firstBthDisabled" class="plat-btn" @click="firstStep" type="primary" :text="$t('common.next')"></van-button>
      </pl-stick>
    </div>
    <van-actionsheet v-model="showFirstStep"  :close-on-click-overlay="false">
      <div class="transfer-sub-warpper">
        <div v-show="!showSecondStep">
          <van-nav-bar :title="$t('transaction.confirmTransferAcctMsg')"  @click-left="showFirstStep = false">
            <span slot="left"><van-icon name="close" /></span>
          </van-nav-bar>
          <div>
            <van-cell-group>
              <van-cell>
                <span slot="title" class="text-muted" v-text="$t('common.receivablesAddress')"></span>
                <div>{{form.receiveAddress}}</div>
              </van-cell>
              <van-cell>
                <span slot="title" class="text-muted" v-text="$t('common.paymentAddress')"></span>
                <div>{{$store.state.account.address}}</div>
              </van-cell>
              <van-cell v-show="!XAddress">
                <span slot="title" class="text-muted">Tag</span>
                <div>{{form.tag}}</div>
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
            <van-field v-model="form.password" ref="visualPassword" type="text" @click-icon="displayPassword = false" :placeholder="$t('transaction.walletPwdPlaceholder')" icon="eye-o" v-show="displayPassword"/>          </van-cell-group>
          <pl-stick :offset-bottom="0">
            <van-button size="large" :loading="loading" :disabled="!form.password" class="plat-btn"  @click="submit" type="primary" :text="$t('transaction.submit')"></van-button>
          </pl-stick>
        </div>
      </div>
    </van-actionsheet> 
    </van-popup>
  </div>
</template>
<script>
  import receiveAddress from '../../ui/receive-address';
  import cryptor from 'core/utils/cryptor';
  import {AccountType} from '../../../wallet/constants';
  import {isValidXAddress} from 'ripple-address-codec';

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
        showPop: false,
        showFirstStep: false,
        showSecondStep: false,
        displayPassword: false,
        form: {
          receiveAddress: '',
          tag: '',
          remark: '',
          password: ''
        },
        loading: false,
        addressValid: true,
        addressActivated: true,
        XAddress: false,
        requireDestinationTag:false,
        ripple: AccountType.ripple
      };
    },
    watch: {
      'form.receiveAddress' () {
        if (this.form.receiveAddress) {
          this.XAddress=isValidXAddress(this.form.receiveAddress);
          if (!this.$wallet.isValidAddress(this.form.receiveAddress)) {
            this.addressValid = false;
            this.addressActivated = true;
            return;
          } else {
            this.addressValid = true;
          }
          this.$wallet.isActivated(this.form.receiveAddress).then(ret => {
            this.addressActivated = ret;
            if (this.addressActivated) {
              this.$wallet.getAccountSettings(this.form.receiveAddress).then(ret => {
                this.requireDestinationTag = ret.requireDestinationTag;
              });
            } else {
              this.requireDestinationTag = false;
            }
          });
        } else {
          this.addressValid = true;
          this.addressActivated = true;
          this.requireDestinationTag = false;
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
      isNeedTag () {
        if (this.form.receiveAddress) {
          return this.$wallet.isTradingPlatformAddress(this.form.receiveAddress);
        }
        return false;
      },
      firstBthDisabled () {
        if (this.form.receiveAddress && this.addressValid ) {
           if (!this.addressActivated) {
             return true;
           }
           if (this.isNeedTag && !this.form.tag  && !this.XAddress) {
             return true;
           }
           return false;
        }
        return true;
      },
    },
    created () {
    },
    methods: {
      close () {
        this.showPop = false;
      },
      show () {
        this.showPop = true;
        this.init();
      },
      init () {
        this.showFirstStep = false;
        this.showSecondStep = false;
        this.displayPassword = false;
        this.form = {
          receiveAddress: '',
          tag: '',
          remark: '',
          password: ''
        };
        if (this.address && this.address !== '') {
          this.form.receiveAddress = this.address;
        }
      },
      firstStep () {
        if (!this.addressActivated) {
          this.$toast(this.$t('transaction.xrpUnActivationAddressTip'));
          return;
        }

        if (!this.$wallet.isValidAddress(this.form.receiveAddress)) {
          this.$toast(this.$t('address.invalidAddressTip'));
          return;
        }

        if (this.isNeedTag && !this.form.tag && !this.XAddress) {
          this.$toast(this.$t('transaction.requiredTag'));
          return;
        }

        if (this.requireDestinationTag && !this.form.tag && !this.XAddress) {
          this.$toast(this.$t('transaction.requiredTag'));
          return;
        } else {
          this.showFirstStep = true;
        }
      },
      secondStep () {
        this.showSecondStep = true;
        this.form.password = '';
        this.$nextTick(() => {
          this.$refs['password'].$refs['input'].focus();
        });
      },
      changeReceiveAddress (address) {
        this.form.tag = address.labelValue;
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
          tag: this.XAddress?'':this.form.tag
        };

        this.$wallet.acctDel(cryptor.decryptAES(this.$store.state.account.secret, this.form.password), this.form.receiveAddress, options)
          .then(ret => {
            if (ret && ret.resultCode === 'tesSUCCESS') {
              console.info(ret);
              toast.message = this.$t('transaction.transactionBroadcastSuccess');
              setTimeout(() => {
                toast.clear();
                this.close();
              }, 3000);
            } else {
              console.error(ret);
              this.$toast(ret.resultMessage);
              setTimeout(() => {
                toast.clear();
              }, 3500);
            }
          })
          .catch(err => {
            console.error(err);
            toast.message = err;
            setTimeout(() => {
              toast.clear();
            }, 3500);
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
