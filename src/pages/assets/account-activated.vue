<template>
  <div class="item-block acct-activated normal-font" v-if="acctType">
    <div class="text-center title" v-text="$t('assets.accountActivatedTitle')"></div>
    <div class="text-muted msg" v-if="isStellar">
      {{$t('assets.stellarAccountActivatedMsg')}}
    </div>
    <div v-else>
      {{$t('assets.xrpAccountActivatedMsg')}}
    </div>
    <div class="opt">
      <van-row>
        <van-col span="24" class="text-center text-danger" @click.native="toTransitionActivated" v-text="$t('assets.accountActivatedMode')"></van-col>
      </van-row>
    </div>
  </div>
</template>
<script>
  import constants from 'src/wallet/constants';

  export default {
    props: {
      acctType: { // 账户类型
        type: String,
        default: ''
      },
      shortAcctType: { // 账户简称
        type: String,
        default: ''
      }
    },
    computed: {
      activatedValue () { // 激活需要的数量
        if (this.acctType === constants.AccountType.stellar) {
          return 1;
        } else if (this.acctType === constants.AccountType.ripple) {
          return 20;
        }
        return 0;
      },
      isStellar () { // 是否是stellar
        return this.acctType === constants.AccountType.stellar;
      }
    },
    methods: {
      toTransitionActivated () {
        this.$emit('transitionActivated');
      }
    }
  };
</script>
<style type="text/scss" lang="scss" scoped>
  .acct-activated{
    width: 90%;
    margin: 0 auto;
    margin-top: 20px;
    .title {
      padding: 15px;
      font-weight: bold;
    }
    .msg {
      padding-left: 15px;
      padding-right: 15px;
    }
    .opt {
      padding: 20px 0;
    }
  }
</style>
