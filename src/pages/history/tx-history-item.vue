<template>
 <!-- <van-swipe-cell :right-width="100" :left-width="100" :on-close="onClose">
    <div slot="left" style="line-height: 68px;width: 100px;" class="text-center ripple-bg text-white small-font">
      {{$t('history.addAddress')}}
    </div>
    <div slot="right" style="line-height: 68px;width: 100px;" class="text-center ethereum-bg text-white small-font">
      {{$t('history.viewDetails')}}
    </div>-->
  <van-cell :center="true" v-if="item.txType !== '3' && item.txType !== '4'">
    <div class="item">
      <div class="icon">
        <table style="height: 100%;width: 100%;">
          <tr>
            <td>
              <span class="icon-cls" :class="type.cls">
                <!--<i class="ultfont x-large-font icon-cls" style="vertical-align: middle;"
                   :class="type.icon" />-->
                <img  :src="dprImg(`${type.icon}`)" alt="图标" style="width: 30px;height: 30px;vertical-align: middle;"/>
              </span>
            </td>
          </tr>
        </table>
      </div>
      <div class="content">
        <div class="detail-card-line small-font" v-if="item.txType === '1'">{{item.from | longStrAbbr(8)}}</div>
        <div class="detail-card-line small-font" v-else="">{{item.to | longStrAbbr(9)}}</div>
        <div class="x-small-font text-muted detail-card-line">{{item.txTime | date('YYYY/MM/DD HH:mm:ss')}}</div>
      </div>
      <div class="amount normal-font" :class="type.cls">
        <table style="height: 100%;width: 100%;">
          <tr>
            <td>
              {{type.symbol}}&nbsp;{{item.amount | currency('', '7') | cutTail}}
            </td>
          </tr>
        </table>
      </div>
    </div>
    <div v-if="showPercentage">
      <div class="text-right x-small-font" style="padding-right: 5px;">
       {{tip}}
      </div>
      <div class="progressbar">
        <div class="progressbar-stack" :style="{width: percentage + '%'}"></div>
      </div>
    </div>
  </van-cell>
  <history-path-item v-else :item="item" :maxConfirmations="maxConfirmations"></history-path-item>
  <!--</van-swipe-cell>-->
</template>

<script>
  import historyPathItem from './tx-history-path-item';
  export default {
    components: {historyPathItem},
    props: {
      item: {
        type: Object,
        default () {
          return {};
        }
      },
      maxConfirmations: {
        type: Number,
        default: 6
      }
    },
    data () {
      return {
        types: {
          '0': {icon: 'export.png', cls: '', symbol: '-'},
          '1': {icon: 'import.png', cls: 'text-primary', symbol: '+'},
          '2': {icon: 'contract.png', cls: '', symbol: ''},
          '3': {icon: 'import.png', cls: '', symbol: '+'},
          '4': {icon: 'export.png', cls: '', symbol: '-'}
        }
      };
    },
    computed: {
      tip () {
        if (this.item.confirmations === 0) {
          return this.$t('history.unpackage');
        } else {
          return this.$t('history.confirming');
        }
      },
      showPercentage () {
        return this.item.confirmations !== undefined && this.item.confirmations <= this.maxConfirmations;
      },
      percentage () {
        return this.item.confirmations / this.maxConfirmations * 100;
      },
      type () {
        if (this.item && this.types[this.item.txType]) {
          return this.types[this.item.txType];
        } else {
          return {};
        }
      }
    },
    methods: {
      onClose(clickPosition, instance) {
        switch (clickPosition) {
          case 'left':
            this.$emit('leftClick');
            instance.close();
            break;
          case 'cell':
          case 'outside':
            instance.close();
            break;
          case 'right':
            this.$emit('rightClick');
            instance.close();
            break;
        }
      }
    }
  };
</script>

<style scoped lang="scss">
  @import "../../../src/assets/scss/variables";
.item{
  display: flex;
  .icon {
    width: 50px;
    vertical-align: middle;
    text-align: left;
    .icon-cls{
      display: inline-block;
    }
  }
  .content{
    width: 200px;
    vertical-align: middle;
  }
  .amount{
    flex: 1;
    vertical-align: middle;
    text-align: right;
  }
}
.progressbar{
  height: 3px;
  background: $primary-color-light-1;
  margin-left: 50px;
  margin-right: 5px;
  .progressbar-stack{
    background: $primary-color;
    width: 50%;
    height: 5px;
  }
}
</style>
