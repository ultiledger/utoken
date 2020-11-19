<template>
  <div>
    <van-popup
      v-model="showPop"
      position="bottom"
      class="popup-wapper"
      style="width:100%;height: 100%;">
      <van-nav-bar
        title="历史记录"
        @click-left="close()">
        <span slot="left"><i class="ultfont ult-left"></i></span>
      </van-nav-bar>
      <pl-content-block :offsetTop="46">
        <div class="b-white padding trade-offers">
          <table style="height: 100%;width: 100%;border-collapse:collapse;">
            <tr>
              <th colspan="1" rowspan="1" class="small-font text-muted text-left">
                数量({{tradepair.baseCode}})
              </th>
              <th colspan="1" rowspan="1" class="small-font text-muted text-right ">
                价格({{tradepair.counterCode}})
              </th>
              <th colspan="1" rowspan="1" class="small-font text-muted text-right ">
                方向
              </th>
              <th colspan="1" rowspan="1" class="small-font text-muted text-right ">
                时间
              </th>
            </tr>
            <tr v-for="(item,index) in historyOffers" :key="index">
              <td colspan="1" rowspan="1" class="small-font">
                {{item.baseAmount}}
              </td>
              <td colspan="1" rowspan="1" class="text-right small-font" :class="item.baseIsSeller? 'text-success': 'text-danger'">
                {{item.price | currency('', '4')}}
              </td>
              <td colspan="1" rowspan="1" class="text-right small-font" :class="item.baseIsSeller? 'text-success': 'text-danger'">
                <span v-if="item.baseIsSeller">买入</span>
                <span v-else>卖出</span>
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
  import dayjs from 'dayjs';
  export default {
    data () {
      return {
        showPop: false,
        historyOffers: [],
        tradepair: {}
      };
    },
    methods: {
      show (params) {
        this.showPop = true;
        this.tradepair = params;
        this.getHistoryOffers();
      },
      getHistoryOffers () {
        this.historyOffers = [];
        // let base = {code: this.tradepair.baseCode, issuer: this.tradepair.baseIssuer};
        // let counter = {code: this.tradepair.counterCode, issuer: this.tradepair.counterIssuer};
        this.$wallet.queryOfferHistorys(this.$store.state.account.address).then((data) => {
          //console.info(data);
          data.forEach((item) => {
            this.historyOffers.push(this.processHistoryOffers(item));
          });
        }).catch((err) => {
          //console.info(err);
          this.$toast('网络请求失败');
          this.historyOffers = [];
          throw new Error(err);
        });
      },
      processHistoryOffers (item) {
        let price = mathUtils.round(item.counter_amount / item.base_amount, 2);
        let now = dayjs().format('YYYY-MM-DD');
        let ledgerCloseDate = dayjs(item.ledger_close_time).format('YYYY-MM-DD');
        let ledgerCloseTime = dayjs(item.ledger_close_time).format('HH:mm:ss');
        if (!dayjs(ledgerCloseDate).isSame(now)) {
          ledgerCloseTime = dayjs(item.ledger_close_time).format('MM-DD HH:mm:ss');
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
  .trade-offers {
    th {
      padding-bottom: 9px;
    }
    td {
      padding-top: 5px;
      padding-bottom: 5px;
    }
  }
</style>
