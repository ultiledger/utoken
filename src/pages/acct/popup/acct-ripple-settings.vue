<template>
  <div>
    <van-popup
      v-model="showPop"
      position="right"
      class="popup-wapper"
      style="height: 100%;width: 100%;"
    >
      <van-nav-bar
        :title="$t('acct.gatewaySetting')"
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
            :disabled="!defaultRippleLoading && disabled" @input="toSettings('1')"/>
        </van-cell-group>
        <van-cell-group :border="false" class="van-hairline--top">
          <van-switch-cell
            v-model="form.requireDestinationTag"
            title="RequireDestTag"
            :loading="requireDestTagLoading"
            :disabled="!requireDestTagLoading && disabled" @input="toSettings('2')"/>
        </van-cell-group>
        <van-cell-group :border="false" class="van-hairline--top">
          <van-field
            v-model="form.domain"
            ref="domainInput"
            label="Domain"
            type="text"
            @blur="handleBlur"
            @focus="handleFocus"
            :placeholder="$t('acct.domainPh')">
            <div slot="button" v-if="!domainLoading && isFocus" @click="toSettings('3')">
              <van-icon name="success" class="icon text-success"></van-icon>
            </div>
            <div slot="button" v-if="domainLoading">
              <van-loading size="24px"/>
            </div>
          </van-field>
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
        domainLoading: false,
        form: {
          defaultRipple: false,
          requireDestinationTag: false,
          domain: ''
        },
        password: '',
        isFocus: false
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
      },
      defaultSet () {
        const toast = this.$toast.loading({
          duration: 0,
          forbidClick: true,
          loadingType: 'circular'
        });
        this.form.domain = '';
        this.form.defaultRipple = false;
        this.form.requireDestinationTag = false;
        this.$wallet.getAccountSettings(this.currentAccount.address).then(accountSetting => {
          console.info(accountSetting);
          if (Object.keys(accountSetting).length > 0) {
            if (accountSetting.defaultRipple) {
              this.form.defaultRipple = accountSetting.defaultRipple;
            }
            if (accountSetting.requireDestinationTag) {
              this.form.requireDestinationTag = accountSetting.requireDestinationTag;
            }
            if (accountSetting.domain) {
              this.form.domain = accountSetting.domain;
            }
          }
          toast.clear();
        }).catch(error => {
          toast.clear();
          this.$toast(error.toString());
        });
        this.showPop = true;
      },
      handleBlur () {
        this.isFocus = false;
      },
      handleFocus () {
        this.isFocus = true;
      },
      setBooleanByType (type, bl) {
        this.disabled = bl;
        if (type === '1') { // defaultRipple
          this.defaultRippleLoading = bl;
        } else if (type === '2') {
          this.requireDestTagLoading = bl;
        } else if (type === '3') {
          this.domainLoading = bl;
        }
      },
      toSettings (type) {
        this.setBooleanByType(type, true);
        let setting = {};
        if (type === '1') {
          setting.defaultRipple = this.form.defaultRipple;
        } else if (type === '2') {
          setting.requireDestinationTag = this.form.requireDestinationTag;
        } else if (type === '3') {
          setting.domain = this.form.domain;
        }
        this.$wallet.accountSettings(this.currentAccount.address, cryptor.decryptAES(this.currentAccount.secret, this.password), setting).then(ret => {
          setTimeout(() => {
            this.setBooleanByType(type, false);
          }, 1000);
          if (!(ret && ret.resultCode === 'tesSUCCESS')) {
            this.defaultSet();
            this.$toast(`${ret.resultCode}: ${ret.resultMessage}`);
          }
        }).catch(error => {
          this.setBooleanByType(type, false);
          this.$toast(error.message);
          setTimeout(() => {
            this.defaultSet();
          }, 1000);
        });
      }
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
</style>
