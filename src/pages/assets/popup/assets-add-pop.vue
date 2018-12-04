<template>
  <div>
    <van-popup
      v-model="showPop"
      position="bottom"
      class="popup-wapper"
      style="width:100%;height: 100%;">
      <van-nav-bar
        :title="$t('assets.addAsset')"
        @click-left="close"
        @click-right="addToken">
        <span slot="left"><i class="ultfont ult-left"></i></span>
        <span slot="right" v-if="type === this.ethereum">{{$t('common.add')}}</span>
      </van-nav-bar>
      <component :is="type" ref="component" ></component>
    </van-popup>
    <token-add ref="tokenAdd" @reload="reload"></token-add>
  </div>
</template>
<script>
  import {AccountType} from '../../../wallet/constants';
  import ethereum from './assets-add-ethereum-pop';
  import ripple from './assets-add-ripple-pop';
  import stellar from './assets-add-stellar-pop';
  import btcion from './assets-add-btcion-pop';
  import tokenAdd from './token-add-pop';
  export default{
    data () {
      return {
        showPop: false,
        ethereum: AccountType.ethereum
      };
    },
    components: {
      [AccountType.bitcoin]: btcion,
      [AccountType.ethereum]: ethereum,
      [AccountType.stellar]: stellar,
      [AccountType.ripple]: ripple,
      tokenAdd
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
      addToken () {
        this.$refs.tokenAdd.show();
      },
      close () {
        this.showPop = false;
      },
      reload () {
        this.$refs['component'].init();
      }
    }
  };
</script>
<style lang="scss">
</style>
