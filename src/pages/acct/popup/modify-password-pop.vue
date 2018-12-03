<template>
  <div>
    <van-popup
      v-model="showPop"
      position="right"
      class="popup-wapper"
      style="height: 100%;width: 100%;"
    >
      <van-nav-bar
        :title="$t('acct.modifyPwd')"
        @click-left="close"
        @click-right="save"
      >
        <span slot="left"><i class="ultfont ult-left"></i></span>
        <span slot="right" class="normal-font text-primary" v-text="$t('common.save')"></span>
      </van-nav-bar>
      <div class="item-block">
        <van-cell-group :border="false">
          <van-field
            type="password"
            v-model="form.oldWalletPwd"
            v-validate="'required|min:6'"
            :data-vv-as="$t('acct.oldPwd')"
            name="oldWalletPwd"
            :placeholder="$t('acct.oldPwdPlaceholder')"
          />
          <van-field
            type="password"
            v-model="form.newWalletPwd"
            v-validate="'required|min:6'"
            :data-vv-as="$t('acct.newPwd')"
            name="newWalletPwd"
            :placeholder="$t('acct.newPwdPlaceholder')"
          />
          <van-field
            type="password"
            v-model="form.confirmWalletPwd"
            v-validate="'required|min:6'"
            :data-vv-as="$t('acct.confirmPwd')"
            name="confirmWalletPwd"
            :placeholder="$t('acct.confirmPwdPlaceholder')"
          />
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
        form: {
          oldWalletPwd: '',
          newWalletPwd: '',
          confirmWalletPwd: ''
        }
      };
    },
    methods: {
      close () {
        this.showPop = false;
      },
      show () {
        this.form.oldWalletPwd = '';
        this.form.newWalletPwd = '';
        this.form.confirmWalletPwd = '';
        this.showPop = true;
      },
      save () {
        if (this.form.newWalletPwd !== this.form.confirmWalletPwd) {
          this.$toast(this.$t('common.confirmPwdTip'));
          return;
        }
        if (!this.form.oldWalletPwd) {
          this.$toast(this.$t('acct.oldPwdPlaceholder'));
          return;
        }
        if (!this.form.newWalletPwd) {
          this.$toast(this.$t('acct.newPwdPlaceholder'));
          return;
        }
        if (this.form.newWalletPwd.length < 6) {
          this.$toast(this.$t('wallet.passwordLimitTip'));
          return;
        }
        this.$validator.validateAll().then((result) => {
          if (result) {
            let currentAccount = this.$store.state.account;
            if (currentAccount) {
              if (currentAccount.password !== cryptor.encryptMD5(this.form.oldWalletPwd)) {
                this.$toast(this.$t('acct.oldPwdErrorTip'));
                return;
              }
              let updateObj = {
                address: this.$store.state.account.address,
              };
              if (this.form.oldWalletPwd !== this.form.newWalletPwd) {
                /*用新密码加密私钥和助记词*/
                this.$collecitons.account.findAndUpdateAcct({identityId: this.$store.state.account.identityId}, (account) => {
                  let oldSecret = cryptor.decryptAES(account.secret, this.form.oldWalletPwd);
                  let newSecret = cryptor.encryptAES(oldSecret, this.form.newWalletPwd);
                  if (account.mnemonicCode) {
                    let oldMnemonicCode = cryptor.decryptAES(account.mnemonicCode, this.form.oldWalletPwd);
                    let newMnemonicCode = cryptor.encryptAES(oldMnemonicCode, this.form.newWalletPwd);
                    account.mnemonicCode = newMnemonicCode;
                  }
                  return account.secret = newSecret;
                });
                /*更新身份的value*/
                this.$collecitons.identity.findAndUpdateIdentity({id: this.$store.state.account.identityId}, (identity) => {
                  let oldValue = cryptor.decryptAES(identity.value, this.form.oldWalletPwd);
                  let newValue = cryptor.encryptAES(oldValue, this.form.newWalletPwd);
                  return identity.value = newValue;
                });
              }
              this.$collecitons.account.findAndUpdateAcct(updateObj, (account) => {
                let newWalletPwd = cryptor.encryptMD5(this.form.newWalletPwd);
                account.password = newWalletPwd;
                this.$store.dispatch('setAccount', account);
                return account.password = newWalletPwd;
              });
              this.close();
            }
          } else {
            this.$toast(this.validateErrors.items[0].msg);
          }
        });
      }
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
  .setting-cell {
    margin-top: 10px;
    &.btn {
      padding: 10px;
    }
  }
</style>
