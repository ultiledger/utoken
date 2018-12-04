<template>
  <van-popup
    v-model="showPop"
    position="bottom"
    class="tx-detail-popup"
    :class="type"
    style="width:100%;height: 100%;">
    <van-nav-bar
      style="background: transparent;"
      class="tx-nav-bar"
      @click-left="goBack">
      <span slot="title" class="text-white" v-text="$t('common.detail')"></span>
      <span slot="left" class="text-white"><i class="ultfont ult-left"></i></span>
    </van-nav-bar>

    <div class="item-block" style="overflow: hidden;">
      <pl-content-block :offsetTop="150">
        <component  ref="component" :is="type" :item.sync="item"></component>
      </pl-content-block>
    </div>
    <div class="text-center text-primary" @click="to">{{$t('history.searchMore')}}&nbsp;>></div>
  </van-popup>
</template>
<script>
  import {AccountType} from '../../wallet/constants';
  import txDetailEthereum from './tx-detail-ethereum';
  import txDetailRipple from './tx-detail-ripple';
  import txDetailStellar from './tx-detail-stellar';
  import txDetailBitcoin from './tx-detail-bitcoin';
  import customerBrowser from 'core/utils/customerBrowser';
  import gradientBg from '../ui/gradient-bg';
  export default{
    components: {
      [AccountType.ethereum]: txDetailEthereum,
      [AccountType.ripple]: txDetailRipple,
      [AccountType.stellar]: txDetailStellar,
      [AccountType.bitcoin]: txDetailBitcoin,
      gradientBg
    },
    computed: {
      type () {
        if (this.$store.state.account.type) {
          return this.$store.state.account.type;
        }
        return '';
      }
    },
    data () {
      return {
        showPop: false,
        item: {},
      };
    },
    methods: {
      goBack () {
        this.showPop = false;
      },
      show (item) {
        this.showPop = true;
        this.item = item;
      },
      to () {
        let link = '';
        let title = '';
        if (this.type === AccountType.ethereum) {
          link = `https://etherscan.io/tx/${this.item.txHash}`;
          title = 'Etherscan';
        } else if (this.type === AccountType.ripple) {
          link = `https://wipple.devnull.network/live/transactions/${this.item.txHash}`;
          title = 'Wipple';
        } else if (this.type === AccountType.stellar) {
          link = `https://steexp.com/tx/${this.item.txHash}`;
          title = 'Steexp';
        } else if (this.type === AccountType.bitcoin) {
          link = `https://live.blockcypher.com/btc/tx/${this.item.txHash}`;
          title = 'blockcypher';
        //  https://www.blockchain.com/btc/tx/
        }
        if (link) {
          customerBrowser.open(title,link);
        }
      }
    }
  };
</script>
<style lang="scss">
  @import '~assets/scss/_variables.scss';
  .tx-detail-popup{
    &.ethereum {
      background-image: radial-gradient(circle at center top, #0bbcbc, #FFF, $main-background-color);
    }
    &.ripple {
      background-image: radial-gradient(circle at center top, #016198, #FFF, $main-background-color);
    }
    &.stellar {
      background-image: radial-gradient(circle at center top, #73a8b7, #FFF, $main-background-color);
    }
    &.bitcoin {
      background-image: radial-gradient(circle at center top, #fd8023, #FFF, $main-background-color);
    }
    background-size: 100% 100%;
    background-repeat: no-repeat;
    .tx-nav-bar {
      &:after{
        display: none;
      }
    }
  }
</style>
