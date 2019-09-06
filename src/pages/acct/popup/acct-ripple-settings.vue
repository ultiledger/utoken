<template>
  <div>
    <van-popup
      v-model="showPop"
      position="right"
      class="popup-wapper"
      style="height: 100%;width: 100%;"
    >
      <van-nav-bar
        :title="$t('setting.setting')"
        @click-left="close"
      >
        <span slot="left"><i class="ultfont ult-left"></i></span>
      </van-nav-bar>
      <div class="item-block">
        <van-cell-group :border="false">
          <van-switch-cell
            v-model="form.defaultRipple"
            title="DefaultRipple"
            size="25px"
            :loading="defaultRippleLoading"
            :disabled="!defaultRippleLoading && disabled" @change="toSettings('1')"/>
        </van-cell-group>
        <van-cell-group :border="false" class="van-hairline--top">
          <van-switch-cell
            v-model="form.requireDestinationTag"
            title="RequireDestTag"
            size="25px"
            :loading="requireDestTagLoading"
            :disabled="!requireDestTagLoading && disabled" @change="toSettings('2')"/>
        </van-cell-group>
      </div>
    </van-popup>
  </div>
</template>
<script>
  import cryptor from 'core/utils/cryptor';
  export default {
    data () {
      return {
        showPop: false,
        disabled: false,
        defaultRippleLoading: false,
        requireDestTagLoading: false,
        form: {
          defaultRipple: false,
          requireDestinationTag: false,
          memos: [{
            type: 'rippleutoken.com',
            format: 'text/plain',
            data: 'AccountSettings'
          }]
        },
        password: ''
      };
    },
    computed: {
      currentAccount () {
        return this.$store.state.account;
      }
    },
    methods: {
      close () {
        this.showPop = false;
      },
      show (password) {
        this.defaultSet();
        this.password = password;
        this.showPop = true;
      },
      defaultSet () {
        this.form.defaultRipple = false;
        this.form.requireDestinationTag = false;
        let bs = this.$store.state.balances[this.currentAccount.address];
        if (bs && bs.length > 0) {
          let accountSetting = bs[0].accountSetting;
          if (Object.keys(accountSetting).length > 0) {
            if (accountSetting.defaultRipple) {
              this.form.defaultRipple = accountSetting.defaultRipple;
            }
            if (accountSetting.requireDestinationTag) {
              this.form.requireDestinationTag = accountSetting.requireDestinationTag;
            }
          }
        }
      },
      setBooleanByType (type, bl) {
        this.disabled = bl;
        if (type === '1') { // defaultRipple
          this.defaultRippleLoading = bl;
        } else if (type === '2') {
          this.requireDestTagLoading = bl;
        }
      },
      toSettings (type) {
        this.setBooleanByType(type, true);
        let setting = {memos: this.form.memos};
        if (type === '1') {
          setting.defaultRipple = this.form.defaultRipple;
        } else if (type === '2') {
          setting.requireDestinationTag = this.form.requireDestinationTag;
        }
        this.$wallet.accountSettings(this.currentAccount.address, cryptor.decryptAES(this.currentAccount.secret, this.password), setting).then(ret => {
          this.setBooleanByType(type, false);
          if (ret && ret.resultCode === 'tesSUCCESS') {
            // 成功
            this.$store.dispatch('setBalances', this.currentAccount.address);
            // this.defaultSet();
          } else {
            this.defaultSet();
            this.$toast(`${ret.resultCode}: ${ret.resultMessage}`);
          }
        }).catch(error => {
          this.setBooleanByType(type, false);
          this.$toast(error.message);
          this.defaultSet();
        });
      }
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
</style>
