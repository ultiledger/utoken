<template>
  <div class="recovery-wallet">
    <van-popup
      v-model="showVpop"
      position="right"
      class="popup-wapper"
      style="width:100%;height: 100%;overflow: hidden;"
    >
      <van-nav-bar
        left-arrow
        :title="$t('wallet.recoverWallet')"
        @click-left="close">
        <span slot="left"><i class="ultfont ult-left"></i></span>
      </van-nav-bar>
     <pl-content-block :offsetTop="46">
       <wallet-text-area
         class="margin-top"
         :tip="$t('wallet.recoverWalletTip')"
         v-model="form.memorizingWords"
         :placeholder="$t('wallet.recoverWalletPlaceholder')"></wallet-text-area>
       <wallet-tip :tip="$t('wallet.recoverWalletPwdTip')" style="margin-top: 15px;padding-bottom: 10px;"></wallet-tip>
       <password-block v-model="form" ref="passwordBlock"></password-block>
       <button-bottom>
         <div class="text-primary text-center" style="padding-bottom:10px;">
           <van-icon name="idcard" style="vertical-align: middle" class="text-primary"/>&nbsp;&nbsp;<span @click="viewHelp" style="vertical-align: middle" v-text="$t('wallet.oneSecUnderstandMnemonicCode')"></span>
         </div>
         <van-button size="large" round type="primary" @click="recoveryWallet(false)" :text="$t('wallet.immediatelyRecover')"></van-button>
         <van-button size="large" round type="primary" @click="recoveryWallet(true)" :text="$t('wallet.immediatelyRecover')+'<V3(中文老版本)'"></van-button>
       </button-bottom>
     </pl-content-block>
     <!-- <pl-stick>
        <div class="padding text-center text-primary">
          <van-icon name="idcard" style="vertical-align: middle" class="text-primary"/>&nbsp;&nbsp;1分钟了解助记词
        </div>
      </pl-stick>-->
    </van-popup>
    <help ref="help"></help>
  </div>
</template>
<script>
  import createWallet from './mixins/createWallet';
  import help from './components/help';
  import passwordBlock from './components/password-input-block';
  import walletTextArea from './components/wallet-textarea';
  import walletTip from './components/wallet-tip';
  import buttonBottom from './components/button-bottom';
  export default {
    mixins: [createWallet],
    components: {help, passwordBlock, walletTextArea, walletTip, buttonBottom},
    data () {
      return {
        showVpop: false,
        form: {
          memorizingWords: '',
          walletPwd: '',
          confirmWalletPwd: ''
        },
        source: '',
        accountType: []
      };
    },
    methods: {
      show (source, accountType) {
        this.source = source;
        this.accountType = accountType;
        this.showVpop = true;
        this.resetForm();
      },
      resetForm () {
        this.form.memorizingWords = '';
        this.$nextTick(() => {
          this.$refs.passwordBlock.resetForm();
        });
      },
      close () {
        this.showVpop = false;
      },
      viewHelp () {
        this.$refs.help.show('mnemonic');
      },
      checkFormFields () {
        if (this.form.walletPwd !== this.form.confirmWalletPwd) {
          this.$toast(this.$t('common.confirmPwdTip'));
          return false;
        }
        if (!this.form.walletPwd) {
          this.$toast(this.$t('common.notEmptyPwd'));
          return false;
        }
        if (this.form.walletPwd.length < 6) {
          this.$toast(this.$t('wallet.passwordLimitTip'));
          return false;
        }
        return true;
      },
      recoveryWallet (v2) {
        if (!this.checkFormFields()) {
          return;
        }
        let mnemonicCodes = this.form.memorizingWords.split(' ');
        if (mnemonicCodes.length < 12) {
          this.$toast(this.$t('wallet.invalidMnemonicCodeTip'));
          return;
        } // trust prison patch example two remind mother behave thank coil champion certain
        // 保存数据库操作
        const toast = this.$toast.loading({
          duration: 0,
          forbidClick: true,
          loadingType: 'circular',
          message: this.$t('wallet.recovering')
        });
        try {
          this.createWalletAcctByMnemonicCode(this.accountType, this.form.memorizingWords, this.form.walletPwd, this.source, true,'N',v2);
          // 创建隐藏账户
          this.filterAndCreateNotSelectAccountType(this.accountType, this.form.memorizingWords, this.form.walletPwd, this.source, true, 'D');

          let firstAcct = this.getFirstAcct();
          if (firstAcct) {
            setTimeout(() => {
              toast.clear();
              this.$store.dispatch('setAccount', firstAcct);
              /* this.close();
               this.$emit('done');*/
              this.$router.push({name: 'assets', params: {refresh: true}});
            }, 1000);
          } else {
            this.$toast(this.$t('wallet.recoverFail'));
          }
        } catch (e) {
          //console.error(e);
          if (e.toString().indexOf('Invalid mnemonic') >= 0) {
            this.$toast(this.$t('wallet.invalidMnemonic'));
          } else if (e.toString().indexOf('Invalid derivation path') >= 0 ){
            this.$toast(this.$t('wallet.invalidDevicePath'));
          } else {
            this.$toast(this.$t('wallet.recoverFail') + ':' +e);
          }
        }
      }
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
  .recovery-wallet{
    .coin-type-select__main {
      min-height: 200px;
      .main-logo{
        width:80px;
        height: 80px;
        border-radius: 50%;
        margin: 0 auto;
      }
    }
    .btn {
      margin-top: 30px;
      padding-top: 10px;
      padding-bottom: 10px;
    }
  }
</style>
