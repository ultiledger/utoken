<template>
  <van-popup
    v-model="showPop"
    position="bottom"
    class="popup-wapper"
    style="width:100%;height: 100%;">
    <van-nav-bar
      :title="$t('assets.addAsset')"
      @click-left="close">
      <span slot="left"><i class="ultfont ult-left"></i></span>
    </van-nav-bar>
    <component :is="type" ref="component" ></component>
  </van-popup>
</template>
<script>
  import {AccountType} from '../../../wallet/constants';
  import ethereum from './assets-add-ethereum-pop';
  import ripple from './assets-add-ripple-pop';
  import stellar from './assets-add-stellar-pop';
  import btcion from './assets-add-btcion-pop';
  export default{
    data () {
      return {
        showPop: false,
      };
    },
    components: {
      [AccountType.bitcoin]: btcion,
      [AccountType.ethereum]: ethereum,
      [AccountType.stellar]: stellar,
      [AccountType.ripple]: ripple
    },
    computed: {
      type () {
        if (this.$store.state.account.type) {
          return this.$store.state.account.type;
        }
        return '';
      }
    },
    methods: {
      show () {
        this.showPop = true;
        this.$nextTick(() => {
          this.$refs['component'].init();
        });
      },
      close () {
        this.showPop = false;
      }
    }
  };
</script>
<style lang="scss">
</style>
