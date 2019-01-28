<template>
  <div>
    <van-popup
      v-model="showPop"
      position="bottom"
      class="popup-wapper"
      style="width:100%;height: 100%;">
      <van-nav-bar
        :title="title"
        @click-left="close()">
        <span slot="left"><i class="ultfont ult-left"></i></span>
      </van-nav-bar>
      <pl-content-block :offsetTop="46">
        <div class="b-white padding trade-offers">
          <table style="height: 100%;width: 100%;border-collapse:collapse;">
            <tr>
              <th colspan="1" rowspan="1" class="small-font text-muted text-left">
                {{$t('trade.amount')}}({{tradepair.baseCode}})
              </th>
              <th colspan="1" rowspan="1" class="small-font text-muted text-right ">
                {{$t('trade.price')}}({{tradepair.counterCode}})
              </th>
              <th colspan="1" rowspan="1" class="small-font text-muted text-right " v-text="$t('trade.direction')"></th>
              <th colspan="1" rowspan="1" class="small-font text-muted text-right " v-text="$t('trade.time')"></th>
            </tr>
            <tr v-for="(item,index) in lastBooks" :key="index">
              <td colspan="1" rowspan="1" class="small-font">
                {{item.baseAmount}}
              </td>
              <td colspan="1" rowspan="1" class="text-right small-font" :class="item.baseIsSeller? 'text-success': 'text-danger'">
                {{item.price | currency('', '7') | cutTail}}
              </td>
              <td colspan="1" rowspan="1" class="text-right small-font" :class="item.baseIsSeller? 'text-success': 'text-danger'">
                <span v-if="item.baseIsSeller" v-text="$t('trade.buying')"></span>
                <span v-else v-text="$t('trade.selling')"></span>
              </td>
              <td colspan="1" rowspan="1" class="text-right small-font text-muted">
                {{item.ledgerCloseTime}}
              </td>
            </tr>
          </table>
        </div>
      </pl-content-block>
    </van-popup>
  </div>
</template>
<script>
  import mathUtils from 'core/utils/mathUtils';
  import moment from 'moment';
  export default {
    data () {
      return {
        title:'',
        showPop: false,
        lastBooks: [],
        tradepair: {}
      };
    },
    methods: {
      show (params,addr) {
        this.showPop = true;
        this.tradepair = params;
        this.getLastBooks(addr);
      },
      getLastBooks (addr) {
        this.lastBooks = [];
        let base = {code: this.tradepair.baseCode, issuer: this.tradepair.baseIssuer};
        let counter = {code: this.tradepair.counterCode, issuer: this.tradepair.counterIssuer};
        let option = {limit: 50};
        if (addr){
          option.forAccount = addr;
          this.title = this.$t('trade.myExec');
        }else {
          option.forAccount = null;
          this.title = this.$t('trade.lastExec');
        }
        this.$wallet.queryLastBook(base, counter, option).then((data) => {
          data.forEach((item) => {
            this.lastBooks.push(this.processLastBooks(item));
          });
        }).catch((err) => {
          console.info(err);
          this.$toast(this.$t('trade.networkError'));
          this.lastBooks = [];
        });
      },
      processLastBooks (item) {
        let price = mathUtils.round(item.counter_amount / item.base_amount, 2);
        let now = moment().format('YYYY-MM-DD');
        let ledgerCloseDate = moment(item.ledger_close_time).format('YYYY-MM-DD');
        let ledgerCloseTime = moment(item.ledger_close_time).format('HH:mm:SS');
        if (!moment(ledgerCloseDate).isSame(now)) {
          ledgerCloseTime = moment(item.ledger_close_time).format('MM-DD HH:mm:SS');
        }
        let result = {
          baseCode: item.base_asset_type === 'native' ? 'XLM' : item.base_asset_code,
          baseAmount: item.base_amount,
          baseIsSeller: item.base_is_seller, /*买入还是卖出，true-买入，false-卖出*/
          counterAmount: item.counter_amount,
          counterCode: item.counter_asset_type === 'native' ? 'XLM' : item.counter_asset_code,
          ledgerCloseTime: ledgerCloseTime,
          price: price
        };
        return result;
      },
      close () {
        this.showPop = false;
      }
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../scss/trade";
</style>
