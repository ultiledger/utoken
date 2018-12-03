<template>
 <!-- <van-swipe-cell :right-width="100" :left-width="100" :on-close="onClose">
    <div slot="left" style="line-height: 68px;width: 100px;" class="text-center ripple-bg text-white small-font">
      {{$t('history.addAddress')}}
    </div>
    <div slot="right" style="line-height: 68px;width: 100px;" class="text-center ethereum-bg text-white small-font">
      {{$t('history.viewDetails')}}
    </div>-->
  <van-cell :center="true">
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
  </van-cell>
  <!--</van-swipe-cell>-->
</template>

<script>
  export default {
    props: {
      item: {
        type: Object,
        default () {
          return {};
        }
      }
    },
    data () {
      return {
        types: {
          '0': {icon: 'export.png', cls: '', symbol: '-'},
          '1': {icon: 'import.png', cls: 'text-primary', symbol: '+'},
          '2': {icon: 'contract.png', cls: '', symbol: ''}
        }
      };
    },
    computed: {
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
</style>
