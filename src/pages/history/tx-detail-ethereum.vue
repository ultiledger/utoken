<template>
  <div>
    <pl-block class="van-hairline--bottom">
      <div class="text-center padding">
        <van-icon :name="iconName" class="text-primary" style="font-size: 40px;vertical-align: middle;"/>
      </div>
      <div v-if="item.confirmations<6">
        <div class="text-center big-font"><strong>{{txTip}}</strong></div>
      </div>
      <div v-else>
        <div v-if="item.txType !== '2'">
          <div class="text-center big-font" v-if="item.txType === '1'"><strong>{{$t('history.receivableSuccess')}}</strong></div>
          <div class="text-center big-font" v-else><strong>{{$t('history.transferSuccess')}}</strong></div>
        </div>
        <div v-else class="text-center big-font"><strong>{{$t('history.contractSuccess')}}</strong></div>
      </div>
      <div class="text-center text-muted small-font" style="margin-top: 10px;">{{item.txTime | date('YYYY/MM/DD hh:mm:ss')}}</div>
    </pl-block>

    <pl-block style="padding-left: 0px;">
      <div class="text-block">
        <!--<p class="text-muted small-font" v-text="$t('history.transactionTime')"></p>-->
        <van-row>
          <van-col span="6" type="flex">
            <div class="text-muted small-font">{{$t('history.amount')}}</div>
          </van-col>
          <van-col span="18">
            <div class="big-font">{{item.amount}}&nbsp;&nbsp;{{item.assetCode}}</div>
          </van-col>
        </van-row>
      </div>
      <div class="text-block">
        <van-row>
          <van-col span="6">
            <p class="text-muted small-font" v-text="$t('common.transactionFee')"></p>
          </van-col>
          <van-col span="18">
            <div class="small-font">{{item.fee}}&nbsp;&nbsp;ether</div>
            <div class="text-muted x-small-font text-ellipsis">=Gas({{item.data.gas}})*GasPrice({{item.data.gasPrice}})</div>
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
      <div class="text-block">
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
            <p class="text-muted small-font" v-text="$t('common.block')"></p>
          </van-col>
          <van-col span="18">
            <div class="small-font">{{item.blockNumber}}</div>
          </van-col>
        </van-row>
      </div>
      <div class="qrcode-parent">
        <qrcode class="qrcode" :value="`https://etherscan.io/tx/${item.txHash}`" :options="{ size: 80 }"></qrcode>
      </div>
    </pl-block>
    <br>
    <br>
  </div>
</template>
<script>
  import qrcode from '@xkeshi/vue-qrcode';
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
    computed: {
      txTip () {
        if (this.item.confirmations === 0) {
          return this.$t('history.unpackage');
        } else {
          return this.$t('history.confirming');
        }
      },
      iconName () {
        if (this.item.confirmations < 6) {
          if (this.item.confirmations === 0) {
            return 'more';
          }
          return 'underway';
        }
        return 'checked';
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
    right: 0px;
  }
</style>
