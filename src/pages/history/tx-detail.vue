<template>
  <van-popup
    v-model="showPop"
    position="bottom"
    class="popup-wapper"
    style="width:100%;height: 100%;">
    <van-nav-bar
      :title="$t('common.detail')"
      @click-left="goBack">
      <span slot="left"><i class="ultfont ult-left"></i></span>
    </van-nav-bar>
    <pl-content-block :offsetTop="46">
      <div class="item-block">
        <component  ref="component" :is="type" :item.sync="item"></component>
      </div>
    </pl-content-block>
  </van-popup>
</template>
<script>
  import {AccountType} from '../../wallet/constants';
  import txDetailEthereum from './tx-detail-ethereum';
  import txDetailRipple from './tx-detail-ripple';
  import txDetailStellar from './tx-detail-stellar';
  import txDetailBitcoin from './tx-detail-bitcoin';
  export default{
    components: {
      [AccountType.ethereum]: txDetailEthereum,
      [AccountType.ripple]: txDetailRipple,
      [AccountType.stellar]: txDetailStellar,
      [AccountType.bitcoin]: txDetailBitcoin
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
      }
    }
  };
</script>
<style lang="scss">
</style>
