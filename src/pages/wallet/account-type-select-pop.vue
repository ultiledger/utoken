<template>
  <div class="account-type-select">
    <van-popup
      v-model="showVpop"
      position="right"
      class="popup-wapper"
      style="width:100%;height: 100%;overflow: hidden;"
    >
      <van-nav-bar
        :title="barTitle"
        @click-left="close"
        @click-right="sure"
      >
        <span slot="left"><i class="ultfont ult-left"></i></span>
        <div slot="right" v-text="$t('common.sure')"></div>
      </van-nav-bar>
      <pl-content-block
        :offsetTop="46">
        <content-block>
          <top-block :title="$t('wallet.selectAccountType')">
            <img src="static/img/account-select@3x.png" width="45" height="45"/>
          </top-block>
          <type-select
            v-model="accountTypes"
            :filter-types.sync="filterTypes"
            :clickable="false"></type-select>
        </content-block>
      </pl-content-block>
    </van-popup>
    <set-pwd ref="setPwd" @done="close"></set-pwd>
    <recovery-wallet ref="recoveryWallet" @done="close()"></recovery-wallet>
    <password-dialog ref="pwdDialog" @done="createAccount"></password-dialog>
  </div>
</template>
<script>
  import setPwd from './set-trans-pwd-pop';
  import {SourceType} from '../../core/constants';
  import recoveryWallet from './recovery-wallet-pop';
  import createWallet from './mixins/createWallet';
  import topBlock from './components/top-block';
  import typeSelect from './components/type-select';
  import contentBlock from './components/content-block';
  import passwordDialog from '../ui/password-dialog';
  import cryptor from 'core/utils/cryptor';
  export default {
    mixins: [createWallet],
    components: {setPwd, recoveryWallet, topBlock, contentBlock, passwordDialog, typeSelect},
    data () {
      return {
        showVpop: false,
        accountTypes: [],
        source: '',
        filterTypes: []
      };
    },
    computed: {
      barTitle () {
        if (this.source === '2') {
          return  this.$t('wallet.recoverWallet');
        }
        return this.$t('wallet.createWallet');
      }
    },
    methods: {
      show (source) { // source=1表示创建钱包，source=2表示恢复钱包
        this.accountTypes = [];
        this.source = source;
        // 根据来源查询账户里面是否已经存在，如果存在则不允许新增了
        let identitys = this.$collecitons.identity.findBySource(SourceType.CREATED);
        if (identitys && identitys.length > 0) {
          let identity = identitys[0];
          let accounts = this.$collecitons.account.findByIdentityId(identity.id);
          if (accounts && accounts.length > 0) {
            this.filterTypes = accounts.map(item => {
              return item.type;
            });
          }
        }
        this.showVpop = true;
      },
      close () {
        this.showVpop = false;
      },
      sure () {
        if (this.accountTypes.length <= 0) {
          this.$toast(this.$t('wallet.selectAccountTypeTip'));
          return;
        }
        if (this.source === '1') {
          this.$refs.setPwd.show(SourceType.CREATED, this.accountTypes);
        } else if (this.source === '2') {
          this.$refs.recoveryWallet.show(SourceType.CREATED, this.accountTypes);
        } else if (this.source === '3') {
          this.$refs.pwdDialog.show();
        }
      },
      createAccount (password) {
        const toast = this.$toast.loading({
          duration: 0,
          forbidClick: true,
          loadingType: 'circular',
          message: this.$t('wallet.creating')
        });
        try {
          let identity = this.getCreatedIdentity();
          if (identity) {
            this.createWalletAcctByMnemonicCode(this.accountTypes, cryptor.decryptAES(identity.value, password), password, SourceType.CREATED, true);
            setTimeout(() => {
              toast.clear();
              this.close();
              this.$emit('done');
            }, 1000);
          }
        }catch (e) {
          console.error(e);
          toast.clear();
          this.$toast(this.$t('wallet.createAcctFail'));
        }
      },
      getCreatedIdentity () { // 获取创建的身份
        let identity = {
          type: 'mnemonicCode',
          source: SourceType.CREATED
        };
        let identitys = this.$collecitons.identity.findByCondition(identity);
        if (identity && identitys.length > 0) {
          return identitys[0];
        }
        return null;
      }
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss">
  .account-type-select{
    .van-cell__title{
      align-self: center;
    }
    .van-cell__value{
      align-self: center;
    }
    .van-cell__right-icon{
      line-height: 35px;
    }
  }
</style>
