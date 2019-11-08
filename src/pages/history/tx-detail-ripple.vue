<template>
  <div style="overflow-x: hidden;">
    <pl-block class="van-hairline--bottom">
      <div class="text-center padding">
        <van-icon name="checked" class="text-primary" style="font-size: 40px;vertical-align: middle;"/>
      </div>
      <div class="text-center big-font" v-if="item.txType === '1'"><strong>{{$t('history.receivableSuccess')}}</strong></div>
      <div class="text-center big-font" v-else><strong>{{$t('history.transferSuccess')}}</strong></div>
      <div class="text-center text-muted small-font" style="margin-top: 10px;">{{item.txTime | date('YYYY/MM/DD hh:mm:ss')}}</div>
    </pl-block>

    <pl-block  style="padding-left: 0px;">
      <div class="text-block">
        <van-row>
          <van-col span="6" type="flex">
            <div class="text-muted small-font">{{$t('history.amount')}}</div>
          </van-col>
          <van-col span="18">
            <div class="big-font">{{item.amount | currency('', '7') | cutTail}}&nbsp;&nbsp;{{item.assetCode}}</div>
          </van-col>
        </van-row>
      </div>
      <div class="text-block">
        <van-row>
          <van-col span="6">
            <p class="text-muted small-font" v-text="$t('common.transactionFee')"></p>
          </van-col>
          <van-col span="18">
            <div class="small-font">{{item.fee}}&nbsp;&nbsp;XRP</div>
          </van-col>
        </van-row>
      </div>
      <div class="text-block" v-if="item.data && item.toTag">
        <van-row>
          <van-col span="6">
            <p class="text-muted small-font">Tag</p>
          </van-col>
          <van-col span="18">
            <div class="small-font">{{item.toTag}}</div>
          </van-col>
        </van-row>
      </div>
      <div class="text-block">
        <van-row>
          <van-col span="6">
            <p class="text-muted small-font" v-text="$t('common.receivablesAddress')"></p>
          </van-col>
          <van-col span="18">
            <pl-wallet-addr class="small-font" :address="item.to" complete></pl-wallet-addr>
          </van-col>
        </van-row>
      </div>
      <div class="text-black">
        <van-row>
          <van-col span="6">
            <p class="text-muted small-font"  v-text="$t('common.paymentAddress')"></p>
          </van-col>
          <van-col span="18">
            <pl-wallet-addr class="small-font" :address="item.from" complete></pl-wallet-addr>
          </van-col>
        </van-row>
      </div>
    </pl-block>

    <pl-block class="margin-top van-hairline--top" style="padding-left: 0px;position: relative;">
      <div class="text-block">
        <van-row>
          <van-col span="6">
            <div class="text-muted small-font" v-text="$t('history.transactionHash')"></div>
          </van-col>
          <van-col span="18">
            <pl-wallet-addr class="small-font" :address="item.txHash"  :length="6"></pl-wallet-addr>
          </van-col>
        </van-row>
      </div>
      <div class="text-block">
        <van-row>
          <van-col span="6">
            <p class="text-muted small-font" v-text="$t('history.ledgerNummber')"></p>
          </van-col>
          <van-col span="18">
            <div class="small-font">{{item.blockNumber}}</div>
          </van-col>
        </van-row>
      </div>
      <div class="qrcode-parent">
        <qrcode class="qrcode" :value="`https://xrpscan.com/tx/${item.txHash}`" :options="{ width: 85 }"></qrcode>
      </div>
    </pl-block>
    <br>
    <br>
  </div>
</template>
<script>
  import qrcode from '@chenfengyuan/vue-qrcode';
  export default{
    components: {qrcode},
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
  .qrcode-parent{
    position: absolute;
    top: 15px;
    right: -3px;
  }
</style>
