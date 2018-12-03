<template>
  <div style="position: relative;">
    <component  ref="component" :is="type" :tab="tab" :asset="asset" @showDetail="showDetail" @addAddress="addAddress"></component>
  </div>
</template>
<script>
  import {AccountType} from '../../wallet/constants';
  import txHistoryEthereum from './tx-history-ethereum';
  import txHistoryRipple from './tx-history-ripple';
  import txHistoryStellar from './tx-history-stellar';
  import txHistoryBitcoin from './tx-history-bitcoin';
  export default{
    props: {
      asset: {
        type: Object,
        default () {
          return {};
        }
      }
    },
    data () {
      return {
        tab: 0
      };
    },
    components: {
      [AccountType.ethereum]: txHistoryEthereum,
      [AccountType.ripple]: txHistoryRipple,
      [AccountType.stellar]: txHistoryStellar,
      [AccountType.bitcoin]: txHistoryBitcoin
    },
    computed: {
      type () {
        if (this.$store.state.account.type) {
          return this.$store.state.account.type;
        }
        return '';
      }
    },
    watch: {
      type () {
        this.tab = 0;
      }
    },
    mounted () {
      this.getHistory();
    },
    methods: {
      showDetail (item) {
        this.$emit('showDetail', item);
      },
      addAddress (address) {
        this.$emit('addAddress', address);
        // console.info(address);
      },
      getHistory () {
        this.tab = 0;
        let component = this.$refs['component'];
        if (component) {
          if (component.history && component.history.length > 0) {
            component.getRemoteHistory();
          } else {
            component.getHistory();
            if (component.history && component.history.length > 0) {
              component.getRemoteHistory();
            }
          }
        }
      }
    }
  };
</script>
<style lang="scss">
</style>
