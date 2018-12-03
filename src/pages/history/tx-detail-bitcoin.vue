<template>
  <div>
    <pl-block class="van-hairline--bottom">
      <div class="text-center padding">
        <van-icon name="checked" class="text-primary" style="font-size: 40px;vertical-align: middle;"/>
      </div>
      <div v-if="item.txType !== '2'">
        <div class="text-center">
          <b class="x-x-large-font">
            <span v-if="item.txType !== '2'">{{item.txType === '1' ? '+' : '-'}}&nbsp;</span>{{item.amount | currency('', '7') | cutTail}}</b>&nbsp;
          <span class="big-font">{{item.assetCode}}</span>
        </div>
        <div class="tip text-muted small-font text-center">{{$t('common.transactionSuccess')}}</div>
      </div>
      <div v-else class="text-center large-font">{{$t('history.contractSuccess')}}</div>
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
        <p class="text-muted small-font"  v-text="$t('common.paymentAddress')"></p>
        <pl-wallet-addr :address="item.from" complete></pl-wallet-addr>
      </div>
      <div class="text-block">
        <p class="text-muted small-font" v-text="$t('common.transactionFee')"></p>
        <div>{{item.fee}}&nbsp;BTC</div>
      </div>
    </pl-block>

    <pl-block class="margin-top">
      <div class="text-block">
        <p class="text-muted small-font" v-text="$t('history.transactionHash')"></p>
        <pl-wallet-addr :address="item.txHash" :length="16"></pl-wallet-addr>
      </div>
      <div class="text-block">
        <p class="text-muted small-font" v-text="$t('common.block')"></p>
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
