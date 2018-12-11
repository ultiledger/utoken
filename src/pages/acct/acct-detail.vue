<template>
  <div class="large-van-cell-container">
    <van-popup
      v-model="showPop"
      position="right"
      class="popup-wapper"
      style="width:100%;height: 100%;"
    >
      <van-nav-bar
        :title="$t('acct.acctInformation')"
        left-arrow
        @click-left="close">
        <span slot="left"><i class="ultfont ult-left"></i></span>
      </van-nav-bar>
      <pl-content-block :offsetTop="46">
        <van-cell-group :border="false" class="item-block margin-top">
          <van-cell
            :title="$t('acct.acctName')"
            :value="currentAccount.name"
            is-link
            @click.native="openAcctNameDia">
          </van-cell>
        </van-cell-group>
        <van-cell-group :border="false" class="item-block margin-top">
          <van-cell
            :title="$t('acct.modifyPwd')"
            is-link
            @click="toModifyPassword">
          </van-cell>
          <van-cell
            :title="$t('acct.exportPrivateKey')"
            is-link
            @click="toCheckPassword('1')">
          </van-cell>
          <van-cell
            v-if="currentAccount.mnemonicCode"
            :title="$t('acct.exportMnemonicCode')"
            is-link
            @click="toCheckPassword('2')">
          </van-cell>
        </van-cell-group>

        <pl-block class="margin-top item-block margin-bottom">
          <!--<p class="normal-font" style="padding-left: 15px;" v-text="$t('acct.acctAddress')"></p>-->
          <div class="text-center qrcode-container">
            <qrcode class="qrcode" :value="currentAccount.address" :options="{ size: 200 }"></qrcode>
            <!--<img src="./qrcode.jpeg" style="max-width: 50%;" alt="二维码"/>-->
          </div>
          <div class="addr text-center">
            <pl-wallet-addr
              class="small-font text-primary"
              complete
              :address="account.address"></pl-wallet-addr>
          </div>
        </pl-block>
        <div class="single-btn margin-bottom margin-top" v-if="delFlag!=='0'">
          <van-button size="large" round type="primary" @click="toCheckPassword('3')" v-text="$t('acct.deleteWallet')"></van-button>
        </div>
      </pl-content-block>

      <van-dialog
        v-model="showAcctNameDialog"
        @confirm="confirmAcctName"
        show-cancel-button
        :title="$t('acct.modifyAcctName')"
      >
        <van-field
          input-align="center"
          v-model="acctName"
          :placeholder="$t('acct.acctNamePlaceholder')"
        />
      </van-dialog>

    </van-popup>
    <modify-password ref="modifyPassword"></modify-password>
    <password-dialog ref="pwdDialog" @done="done"></password-dialog>
    <export-secret ref="exportSecret"></export-secret>
    <backups-memorizing-words ref="backupsMemorizing"></backups-memorizing-words>
  </div>
</template>
<script>
  import modifyPassword from './popup/modify-password-pop';
  import passwordDialog from '../ui/password-dialog';
  import exportSecret from './popup/export-secret-dialog';
  import backupsMemorizingWords from '../wallet/backups-memorizing-words-pop';
  // import encryptor from 'core/utils/encryptor';
  import qrcode from '@xkeshi/vue-qrcode';
  import cryptor from 'core/utils/cryptor';
  import {SourceType} from 'core/constants';
  export default{
    components: {modifyPassword, passwordDialog, exportSecret, backupsMemorizingWords, qrcode},
    data () {
      return {
        showPop: false,
        account: {},
        acctName: '',
        showAcctNameDialog: false,
        checkType: '' /*校验类型，主要用于是对那个功能点进行密码输入*/
      };
    },

    computed: {
      currentAccount () {
        return this.$store.state.account;
      },
      delFlag () {
        let identity = this.$collecitons.identity.findById(this.account.identityId);
        if (identity && identity.source === SourceType.CREATED) {
          let accounts = this.$collecitons.account.findByIdentityId(identity.id);
          // 不能删除
          if (accounts && accounts.length === 1) {
            return '0';
          }
          return '1';
        }
        return '2';
      }
    },
    methods: {
      show (item) {
        this.account = item;
        this.acctName = item.name;
        this.showPop = true;
      },
      close () {
        this.showPop = false;
      },
      openAcctNameDia () {
        this.showAcctNameDialog = true;
      },
      confirmAcctName () {
        let updateObj = {
          address: this.account.address,
        };
        this.$collecitons.account.findAndUpdateAcct(updateObj, (account) => {
          account.name = this.acctName;
          this.$store.dispatch('setAccount', account);
          return account.name = this.acctName;
        });
      },
      toModifyPassword () {
        this.$refs.modifyPassword.show();
      },
      toCheckPassword(checkType) {
        this.checkType = checkType;
        this.$refs.pwdDialog.show();
      },
      removeDataAndUpdateActions (option, identityId) {
        const toast = this.$toast.loading({
          duration: 0,
          forbidClick: true,
          loadingType: 'circular'
        });
        if (this.delFlag === '1') {
          this.$collecitons.account.findAndUpdateAcct(option, (account) => {
            return account.state = 'D';
          });
        } else {
          this.$collecitons.account.findAndRemoveAcct(option);
        }
        this.$collecitons.history.removeHistory(option);
        this.$collecitons.asset.removAssetByAddressAndName(option);
        let map = {};
        map[this.account.address] = '';
        this.$store.dispatch('setPasswordMap', map);
        let allAccount = this.$collecitons.account.findAll();
        if (allAccount && allAccount.length > 0) {
          let account = {...allAccount[0],  setBalance: false};
          this.$store.dispatch('setAccount' , account);
          this.$emit('afterDelAcct');
        } else {
          this.$collecitons.identity.deleteIdentityById(identityId);
        }
        setTimeout(() => {
          toast.clear();
          this.close();
        }, 1000);
      },
      delWallet () {

        if (this.account) {
          let identityId = this.currentAccount.identityId;
          let option = {address: this.account.address};
          if (this.delFlag === '1') { // 逻辑删除操作
            this.$dialog.confirm({
                     title: this.$t('common.tip'),
                     message: this.$t('acct.delAcctTip')
            }).then(() => {
              this.removeDataAndUpdateActions(option, identityId);
            });
          } else {
            this.removeDataAndUpdateActions(option, identityId);
          }
        } else {
          this.$toast(this.$t('acct.acctNotexist'));
        }
      },
      done (password) {
        if (this.currentAccount.password === cryptor.encryptMD5(password)) {
          if (this.checkType === '1') {
            this.$refs.exportSecret.show(password);
          } else if (this.checkType === '2') {
            this.$refs.backupsMemorizing.show(cryptor.decryptAES(this.currentAccount.mnemonicCode, password), password, 'backups');
          } else if (this.checkType === '3') { // 删除钱包
            this.delWallet();
          }
        } else {
          this.$toast(this.$t('acct.pwdError'));
        }
      }
    }
  };
</script>
<style lang="scss" scoped>
  @import '~assets/scss/_variables.scss';
  .qrcode-container{
    padding: 4px 0;
  }
  .addr{
    padding: 10px;
    background-color: $primary-color-light;
  }
  .margin-bottom {
    margin-bottom: 10px;
  }
</style>
