<template>
  <div>
    <pl-block class="van-hairline--bottom">
      <div class="text-center padding">
        <van-icon name="checked" class="text-primary" style="font-size: 40px;vertical-align: middle;"/>
      </div>
      <div class="text-center">
        <b class="x-x-large-font">
          {{item.txType === '1' ? '+' : '-'}}&nbsp;{{item.amount | currency('', '7') | cutTail}}</b>&nbsp;
        <span class="big-font">{{item.assetCode}}</span>
      </div>
      <div class="tip text-muted small-font text-center" v-text="$t('common.transactionSuccess')"></div>
    </pl-block>

    <pl-block>
      <div class="text-block">
        <p class="text-muted small-font" v-text="$t('history.transactionTime')"></p>
        <div>{{item.txTime | date('YYYY/MM/DD hh:mm:ss')}}</div>
      </div>
      <div class="text-block">
        <p class="text-muted small-font" v-text="$t('common.receivablesAddress')"></p>
        <pl-wallet-addr :address="item.to" complete></pl-wallet-addr>
      </div>
      <div class="text-block">
        <p class="text-muted small-font" v-text="$t('common.paymentAddress')"></p>
        <pl-wallet-addr :address="item.from" complete></pl-wallet-addr>
      </div>
      <div class="text-block" v-if="item.data && item.data.specification && item.data.specification.destination && item.data.specification.destination.tag">
        <p class="text-muted small-font">Tag</p>
        <div>{{item.data.specification.destination.tag}}</div>
      </div>
      <div class="text-block">
        <p class="text-muted small-font" v-text="$t('common.transactionFee')"></p>
        <div>{{item.fee}}&nbsp;XRP</div>
      </div>
    </pl-block>

    <pl-block class="margin-top">
      <div class="text-block">
        <p class="text-muted small-font" v-text="$t('history.transactionHash')"></p>
        <pl-wallet-addr :address="item.txHash" :length="16"></pl-wallet-addr>
      </div>
      <div class="text-block">
        <p class="text-muted small-font" v-text="$t('history.ledgerNummber')"></p>
        <div>{{item.blockNumber}}</div>
      </div>
    </pl-block>
    <br>
    <br>
  </div>
</template>
<script>
  export default{
    props: {
      item: {
        type: Object,
        default () {
          return {};
        }
      }
    },
    methods: {
    }
  };
</script>
<style lang="scss" scoped>
  .tip{
    padding-bottom: 10px;
  }

  .text-block{
    padding-top: 10px;
  }
</style>
