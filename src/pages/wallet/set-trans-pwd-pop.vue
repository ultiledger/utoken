<template>
  <div class="set-tran-pwd">
    <van-popup
      v-model="showVpop"
      position="right"
      class="popup-wapper"
      style="width:100%;height: 100%;overflow: hidden;">
      <van-nav-bar
        :title="$t('wallet.setTranPwdTitle')"
        @click-left="close">
        <span slot="left"><i class="ultfont ult-left"></i></span>
      </van-nav-bar>
      <pl-content-block
       :offsetTop="46">
        <content-block>
          <top-block :title="$t('wallet.setTranPwdTitle')" line-height="45px">
            <img src="static/img/set-password@3x.png" width="45" height="45"/>
          </top-block>
        </content-block>
        <div class="text-muted small-font item text-tip-color" v-text="$t('wallet.setTranPwdTip')"></div>
        <password-block v-model="form" ref="passwordBlock"></password-block>

        <div class="single-btn"  style="margin-top: 8rem;padding-bottom: 10px;">
          <van-button size="large" round type="primary" :loading="loading"  @click="next()" v-text="$t('common.sure')"></van-button>
        </div>
      </pl-content-block>

    </van-popup>
    <backups-start ref="backupsStart"></backups-start>
  </div>
</template>
<script>
  import backupsStart from './backups-start-pop';
  import topBlock from './components/top-block';
  import contentBlock from './components/content-block';
  import passwordBlock from './components/password-input-block';
  export default {
    components: {backupsStart, topBlock, contentBlock, passwordBlock},
    data () {
      return {
        showVpop: false,
        loading: false,
        accountTypes: [],
        source: '',
        form: {
          walletPwd: '',
          confirmWalletPwd: ''
        }
      };
    },
    methods: {
      show (source, accountTypes) {
        this.accountTypes = accountTypes;
        this.source = source;
        this.showVpop = true;
        this.$nextTick(() => {
          this.resetForm();
        });
      },
      resetForm () {
        this.$refs.passwordBlock.resetForm();
      },
      next () {
        if (this.form.walletPwd !== this.form.confirmWalletPwd) {
          this.$toast(this.$t('common.confirmPwdTip'));
          return;
        }
        if (!this.form.walletPwd) {
          this.$toast(this.$t('common.notEmptyPwd'));
          return;
        }
        if (this.form.walletPwd.length < 6) {
          this.$toast(this.$t('wallet.passwordLimitTip'));
          return;
        }
        this.loading = true;
        this.$validator.validateAll().then((result) => {
          if (result) {
            this.$refs.backupsStart.show(this.form.walletPwd, false, this.source, this.accountTypes);
            this.loading = false;
          } else {
            this.loading = false;
            this.$toast(this.validateErrors.items[0].msg);
          }
        });
      },
      close () {
        this.showVpop = false;
      }
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
  .item {
    margin-top: 20px;
    margin-right: 20px;
    margin-left: 20px;
  }
</style>
