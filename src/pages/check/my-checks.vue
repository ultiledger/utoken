<template>
  <div>
    <div class="b-white padding ripple-checks">
      <div :class="{'van-hairline--bottom':index!==(checks.length - 1)}" v-for="(item, index) in checks" :key="index">
        <van-row class="margin-bottom">
          <van-col span="3"><span v-if="item.isSending" class="text-danger" v-text="$t('common.pullOut')"></span><span v-else class="text-primary" v-text="$t('common.pullIn')"></span></van-col>
          <van-col span="5" ><span class="normal-font" :style="{color:item.isSending?'#ed4f78': '#00ac94'}" v-text="item.amount"></span></van-col>
          <van-col span="8" ><div class="detail-card-line small-font" >{{item.acct | longStrAbbr(6)}}</div></van-col>
          <van-col span="4" class="text-right" @click.native="toCheckPassword('2',item)"><span v-if="!item.isSending" class="normal-font text-primary" v-text="$t('common.checkcash')"></span></van-col>
          <van-col span="4" class="text-right" @click.native="toCheckPassword('1',item)"><span class="normal-font text-danger" v-text="$t('common.cancelText')"></span></van-col>
        </van-row>
      </div>
      <!--<div class="text-primary x-small-font" style="margin-top: 10px;" @click="viewOfferHistory">委托历史<i class="ultfont ult-right x-small-font"></i></div>-->
    </div>
    <password-dialog ref="pwdDialog" @done="done" :address.sync="address"></password-dialog>
  </div>
</template>
<script>
  import cryptor from 'core/utils/cryptor';
  import passwordDialog from '../ui/password-dialog';
  export default {
    components: {passwordDialog},
    props: {
      asset: {
        type: Object,
        default () {
          return {};
        }
      },
      address: String,
      secret: String
    },
    data () {
      return {
        checks: [],
        checkTimer: null,
        checkType: ''
      };
    },
    methods: {
      clearTimer () {
        if (this.checkTimer) {
          window.clearInterval(this.checkTimer);
          this.checkTimer = null;
        }
      },
      startTimer () {
        if (!this.checkTimer) {
          this.checkTimer = window.setInterval(() => {
            this.getChecks();
          }, 1000 * 6 * 1);
        }
      },
      processRippleChecks (datas) {
        let result = [];
        datas.account_objects.forEach((item) => {
          let isSending = false; /*发送还是接收，true-发送*/
          let code = '';
          let issuer = '';
          let acct = '';
          code = item.SendMax.currency?item.SendMax.currency:'XRP';
          if (item.SendMax.issuer) {
            issuer = item.SendMax.issuer;
          }
          if (this.address === item.Account)  {
            isSending = true;
            acct = item.Destination;
          }else {
            isSending = false;
            acct = item.Account;
          }
          if ((this.asset.code === code && this.asset.issuer === issuer) || (this.asset.code === code && this.asset.code === 'XRP')) {
            result.push(
            {
              id : item.index,
              isSending,
              acct,
              code,
              issuer,
              amount: item.SendMax.value?item.SendMax.value:item.SendMax/1000000,
            }
          );
          }
          
        });
        return result;
      },
      getChecks () {
        this.$wallet.queryChecks(this.address).then((datas) => {
          this.checks = this.processRippleChecks(datas);          
          this.startTimer();
        }).catch(() => {
          this.checks = [];
          this.startTimer();
        });
      },
      toCheckPassword(checkType, item) {
        this.checkType = checkType;
        this.$refs.pwdDialog.show(item);
      },
      done (password, item) {
        if (this.$store.state.account.password === cryptor.encryptMD5(password)) {
          if (this.checkType === '1') { // export secret
            this.cancelCheck(password,item);
          } else if (this.checkType === '2') { // export mnemonicCode
            this.cashCheck(password,item);
          } 
        } else {
          this.$toast(this.$t('acct.pwdError'));
        }
      },
      cancelCheck (password, item) {
        // this.$emit('savePasswordInMemory', password);
        const toast = this.$toast.loading({
          duration: 0,
          forbidClick: true,
          loadingType: 'circular'
        });
        let check = {
          id: item.id,
        };
        this.$wallet.cancelCheck(check, this.address, cryptor.decryptAES(this.secret, password)).then(ret => {
          if (ret) {
            toast.message = this.$t('trade.cancelSuccess');
            setTimeout(() => {
              toast.clear();
              this.getChecks();
            }, 3000);
          }
        }).catch(err => {
          // console.info(err);
          // let errMsg = this.getErrMsg(err);
          // if (errMsg) {
          //   this.$toast(errMsg);
          // } else {
          this.$toast(this.$t('trade.cancelFail'));
          //}
          setTimeout(() => {
            toast.clear();
          }, 3000);
          throw new Error(err);
        });
      },
      cashCheck (password, item) {
        // this.$emit('savePasswordInMemory', password);
        const toast = this.$toast.loading({
          duration: 0,
          forbidClick: true,
          loadingType: 'circular',
          message: this.$t('transaction.inTransactionMessage')
        });
        let check = {
          id: item.id,
          amount: item.amount.toString(),
          code: item.code
        };
        if (item.issuer) {
          check.issuer = item.issuer;
        }
        this.$wallet.checkCash(check, this.address, cryptor.decryptAES(this.secret, password)).then(ret => {
          //console.info(ret);
          if (ret) {
            toast.message = this.$t('transaction.transactionBroadcastSuccess');
              setTimeout(() => {
                toast.clear();
                this.getChecks();
              }, 3000);
          }
        }).catch(err => {
          // console.info(err);
          // let errMsg = this.getErrMsg(err);
          // if (errMsg) {
          //   this.$toast(errMsg);
          // } else {
          this.$toast(this.$t('common.transactionFail'));
          //}
          setTimeout(() => {
            toast.clear();
          }, 3000);
          throw new Error(err);
        });
      },
      // getErrMsg (err) {
      //   console.info(err);
      //   return null;
      // }
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
  .ripple-checks {
  th {
    padding-bottom: 9px;
  }
  td {
    padding-top: 5px;
    padding-bottom: 5px;
  }
  .check-table {
    width: 100%;
    .header {
      display: flex;
      font-weight: bold;
      padding-bottom: 9px;
      div{
        width: 50%;
        height: 20px;
        line-height: 20px;
      }
    }
    .row {
      display: flex;
      div{
        width: 50%;
        height: 25px;
        line-height: 25px;
      }
    }
  }
}
</style>
