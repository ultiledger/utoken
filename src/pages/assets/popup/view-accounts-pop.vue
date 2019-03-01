<template>
  <div class="view-my-wallet">
    <van-popup
      v-model="showVpop"
      position="right"
      style="width:90%;height: 100%;"
      class="popup-wapper">
      <view-account-item
        :accounts.sync="createAccounts"
        :title="$t('assets.currentAccount')"
        :opt-text="$t('common.add')"
        :opt-falg.sync="createAccounts.length < 100"
        isImport
        @opt="addWalletAcct"
        @viewDetail="toAcctDetail"
        @selectWallet="selectWallet"
        @close="close"></view-account-item>
      <view-account-item
        :accounts.sync="importAccounts"
        :title="$t('assets.importAccount')"
        :opt-text="$t('common.import')"
        @opt="importWalletAcct"
        @viewDetail="toAcctDetail"
        @selectWallet="selectWallet"
        @close="close"></view-account-item>
    </van-popup>
    <account-type-select ref="accountTypeSelect" @done="updateCurrentAcct"></account-type-select>
    <wallet-type-select ref="walletTypeSelect" @done="updateImportAcct" @refreshAll="refreshAccts"></wallet-type-select>
    <acct-detail ref="acctDetail" @afterDelAcct='afterDelAcct'></acct-detail>
  </div>
</template>
<script>
  import accountTypeSelect from 'src/pages/wallet/account-type-select-pop';
  import walletTypeSelect from 'src/pages/wallet/import-type-select-pop';
  import acctDetail from '../../acct/acct-detail';
  import viewAccountItem from './view-account-item';
  import {SourceType} from '../../../core/constants';

  export default {
    components: {accountTypeSelect, walletTypeSelect, viewAccountItem, acctDetail},
    data () {
      return {
        showVpop: false,
        importAccounts: [],
        createAccounts: []
      };
    },
    methods: {
      show () {
        this.updateCurrentAcct();
        this.updateImportAcct();
        this.showVpop = true;
      },
      close() {
        this.showVpop = false;
      },
      selectWallet (item) {
        this.$emit('selectWallet', item);
      },
      addWalletAcct () {
        this.$refs.accountTypeSelect.show(SourceType.ADD);
      },
      importWalletAcct () {
        this.$refs.walletTypeSelect.show(SourceType.IMPORT);
      },
      toAcctDetail (item) {
        this.$refs.acctDetail.show(item);
      },
      afterDelAcct () {
        this.$emit('afterDelAcct');
      },
      refreshAccts () {
        this.updateCurrentAcct();
        this.updateImportAcct();
      },
      updateCurrentAcct () {
        let createIdentity = this.$collecitons.identity.findBySource(SourceType.CREATED);
        if (createIdentity && createIdentity.length > 0) {
          this.createAccounts = this.$collecitons.account.findByIdentityId(createIdentity[0].id);
        }
        this.$emit('updateAcct');
      },
      updateImportAcct () {
        this.importAccounts = [];
        let importIdentity = this.$collecitons.identity.findBySource(SourceType.IMPORT);
        if (importIdentity && importIdentity.length > 0) {
          importIdentity.forEach(item => {
            this.importAccounts.push(...this.$collecitons.account.findByIdentityId(item.id));
          });
        }
        this.$emit('updateAcct');
      }
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
  @import "~assets/scss/variables";
  .view-my-wallet {
    .popup-wapper{
      background: #22262A;
      box-shadow: -2px 0 20px 0 rgba(0,0,0,0.05);
    }
  }
</style>
