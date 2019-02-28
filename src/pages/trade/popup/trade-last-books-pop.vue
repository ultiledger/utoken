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
              <th colspan="1" rowspan="1" class="small-font text-muted  text-left" v-text="$t('trade.time')"></th>
              <th colspan="1" rowspan="1" class="small-font text-muted text-left" v-text="$t('trade.direction')"></th>
              <th colspan="1" rowspan="1" class="small-font text-muted text-right">
                {{$t('trade.amount')}}({{tradepair.baseCode}})
              </th>
              <th colspan="1" rowspan="1" class="small-font text-muted text-right ">
                {{$t('trade.price')}}({{tradepair.counterCode}})
              </th>
            </tr>
            <tr v-for="(item,index) in lastBooks" :key="index">
              <td colspan="1" rowspan="1" class="text-left small-font text-muted">
                {{item.ledgerCloseTime}}
              </td>
              <td colspan="1" rowspan="1" class="text-left small-font" :class="item.baseIsSeller? 'text-success': 'text-danger'">
                <span v-if="item.baseIsSeller" v-text="$t('trade.buying')"></span>
                <span v-else v-text="$t('trade.selling')"></span>
              </td>
              <td colspan="1" rowspan="1" class="small-font text-right">
                {{item.baseAmount}}
              </td>
              <td colspan="1" rowspan="1" class="text-right small-font" :class="item.baseIsSeller? 'text-success': 'text-danger'">
                {{item.price | currency('', '7') | cutTail}}
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
  import {AccountType} from "src/wallet/constants";
  export default {
    props: {
      accountType: String
    },
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
          if (this.accountType === AccountType.stellar) {
            data.forEach((item) => {
              this.lastBooks.push(this.processStellarLastBooks(item));
            });
          } else if (this.accountType === AccountType.ripple) {
            if (data.count > 0) {
              let exs = this.preProcessRippleLastBooks(data.exchanges);
              exs.forEach((item) => {
                if (item.tx_type ==="OfferCreate"){
                  let i = this.processRippleLastBooks(item);
                  if (i){
                    this.lastBooks.push(i);
                  }
                }
              });
            }
          }

        }).catch((err) => {
          console.info(err);
          this.$toast(this.$t('trade.networkError'));
          this.lastBooks = [];
        });
      },
      processStellarLastBooks (item) {
        let price = mathUtils.round(item.counter_amount / item.base_amount, 6);
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
      preProcessRippleLastBooks(exchanges){
        let preMap = new Map();
        exchanges.forEach((item) => {
          if (item.tx_type ==="OfferCreate"){
            if (preMap.get(item.tx_hash)){
              let low,hight;
              let temp = preMap.get(item.tx_hash);
              if (temp.node_index>item.node_index){
                hight = temp;
                low = item;
              }else {
                hight = item;
                low = temp;
              }
              let merge={
                "base_amount": hight.base_amount,
                "counter_amount": low.base_amount,
                "node_index": hight.node_index,
                "rate": low.base_amount / hight.base_amount,
                "tx_index": hight.tx_index,
                "base_currency": hight.base_currency,
                "base_issuer": hight.base_issuer,
                "buyer": hight.buyer,
                "counter_currency": low.base_currency,
                "counter_issuer": low.base_issuer,
                "executed_time": hight.executed_time,
                "ledger_index": 45436038,
                "offer_sequence": hight.offer_sequence,
                "provider": hight.provider,
                "seller": hight.taker,
                "taker": hight.taker,
                "tx_hash": hight.tx_hash,
                "tx_type": hight.tx_type
              };

              preMap.set(item.tx_hash,merge);
            }else {
              preMap.set(item.tx_hash,item);
            }
          }
        });
        // preMap.sort(function(a, b) {
        //   return b.executed_time > a.executed_time;
        // });
        let exs = [];
        preMap.forEach(ret=>{
          exs.push(ret);
        });
        return exs;
      },
      processRippleLastBooks (item) {
        let price = mathUtils.round(item.counter_amount / item.base_amount, 6);
        let now = moment().format('YYYY-MM-DD');
        let ledgerCloseDate = moment(item.executed_time).format('YYYY-MM-DD');
        let ledgerCloseTime = moment(item.executed_time).format('HH:mm:SS');
        if (!moment(ledgerCloseDate).isSame(now)) {
          ledgerCloseTime = moment(item.executed_time).format('MM-DD HH:mm:SS');
        }
        let baseIsSeller ;
        if (item.taker === item.buyer){
          baseIsSeller = true;
        }else if(item.taker === item.seller){
          baseIsSeller = false;
        }
        let result = {
          baseCode: item.base_currency,
          baseIssuer:item.base_issuer,
          baseAmount:  Number(item.base_amount).toFixed(6).toString(),
          baseIsSeller: baseIsSeller, /*买入还是卖出，true-买入，false-卖出*/
          counterAmount: Number(item.counter_amount).toFixed(6).toString(),
          counterCode: item.counter_currency,
          counterIssuer:item.counter_issuer,
          ledgerCloseTime: ledgerCloseTime,
          price: price
        };
        //交易对相同
        if(this.isSameAsset(this.tradepair.baseCode,this.tradepair.baseIssuer,result.baseCode,result.baseIssuer)
        && this.isSameAsset(this.tradepair.counterCode,this.tradepair.counterIssuer,result.counterCode,result.counterIssuer)){
          return result;
          //交易对相反
        }else if (this.isSameAsset(this.tradepair.baseCode,this.tradepair.baseIssuer,result.counterCode,result.counterIssuer)
          && this.isSameAsset(this.tradepair.counterCode,this.tradepair.counterIssuer,result.baseCode,result.baseIssuer)) {
          return {
            baseCode: result.counterCode,
            baseIssuer:result.counterIssuer,
            baseAmount:  result.counterAmount,
            baseIsSeller: !result.baseIsSeller, /*买入还是卖出，true-买入，false-卖出*/
            counterAmount: result.baseAmount,
            counterCode: result.baseCode,
            counterIssuer:result.baseIssuer,
            ledgerCloseTime: result.ledgerCloseTime,
            price: 1 / price
          };
        }
      },
      isSameAsset (code, issuer, code2, issuer2) { /*是否是当前交易对*/
        if (!issuer) issuer="";
        if (!issuer2) issuer2="";
        return code == code2 && issuer == issuer2;
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
