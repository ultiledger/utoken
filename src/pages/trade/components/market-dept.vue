<template>
  <div>
    <div class="b-white padding trade-offers">
      <van-row>
        <van-col span="12" class="van-hairline--right" style="padding-right: 3px;">
          <div class="offer-table">
            <div class="text-muted small-font header">
              <div class="text-left" v-text="$t('trade.buyAmount')"></div>
              <div class="text-right" v-text="$t('trade.buyPrice')"></div>
            </div>
            <div class="small-font row"
                 v-for="(item, index) in bids"
                 :style="`background: linear-gradient(to left, #dcf6de ${item.pct}%, #fff ${item.pct}%)`"
                 :key="index"
                 @click="selectOnePrice(item)">
              <div class="text-left text-muted"> {{item.depth | currency('', '2')}}</div>
              <div class="text-right small-font"> {{item.price | currency('', '7')}}</div>
            </div>
          </div>
        </van-col>
        <van-col span="12" style="padding-left: 3px;">
          <div class="offer-table">
            <div class="text-muted small-font header">
              <div class="text-left" v-text="$t('trade.sellPrice')"></div>
              <div class="text-right" v-text="$t('trade.sellAmount')"></div>
            </div>
            <div class="small-font row"
                 v-for="(item, index) in asks"
                 :style="`background: linear-gradient(to right, #fed6d8 ${item.pct}%, #fff ${item.pct}%)`"
                 :key="index"
                 @click="selectOnePrice(item)">
              <div class="text-left">{{item.price | currency('', '7')}}</div>
              <div class="text-muted text-right small-font"> {{item.depth | currency('', '2')}}</div>
            </div>
          </div>
        </van-col>
      </van-row>
      <van-row>
        <van-col span="12" class="text-left">
          <div class="text-primary x-small-font" style="margin-top: 10px;" @click="viewLastBooks">{{$t('trade.lastExec')}}<i class="ultfont ult-right x-small-font"></i></div>
        </van-col>
        <van-col span="12" class="text-right">
          <div class="text-primary x-small-font" style="margin-top: 10px;" @click="viewMyBooks">{{$t('trade.myExec')}}<i class="ultfont ult-right x-small-font"></i></div>
        </van-col>
      </van-row>
    </div>
    <trade-last-book-pop ref="tradeLastBookPop"></trade-last-book-pop>
  </div>
</template>
<script>
  import tradeLastBookPop from '../popup/trade-last-books-pop';
  import mathUtils from 'core/utils/mathUtils';
  export default {
    components: {tradeLastBookPop},
    props: {
      tradePair: {
        type: Object,
        default: () => {
          return {};
        }
      }
    },
    data () {
      return {
        marketTimer: null, // 市场深度定时器
        books: [], /*买单+卖单*/
        asks: [], /*卖单*/
        bids: [] /*买单*/
      };
    },
    methods: {
      clearTimer () {
        if (this.marketTimer) {
          window.clearInterval(this.marketTimer);
          this.marketTimer = null;
        }
      },
      startTimer () {
        if (!this.marketTimer) {
          this.marketTimer = window.setInterval(() => {
            this.getBooks();
          }, 1000 * 60 * 0.5);
        }
      },
      getBooks () {
        let base = {code: this.tradePair.baseCode, issuer: this.tradePair.baseIssuer};
        let counter = {code: this.tradePair.counterCode, issuer: this.tradePair.counterIssuer};
        this.$wallet.queryBook(base, counter).then((data) => {
          this.books = data;
          this.asks = data.asks;
          this.bids = data.bids;
          this.processBooks();
          this.startTimer();
        }).catch(() => {
          this.books = [];
          this.asks = [];
          this.bids = [];
          this.startTimer();
        });
      },
      processBooks () {
        // 最多显示15条记录
        let displayNo = 15;
        if (this.asks.length > displayNo) {
          this.asks = this.asks.slice(0, displayNo);
        }
        if (this.bids.length > displayNo) {
          this.bids = this.bids.slice(0, displayNo);
        }
        let depth = 0;
        for (let i=0; i<this.asks.length; i++) {
          this.asks[i].volumn = this.asks[i].amount * this.asks[i].price;
          depth = depth + this.asks[i].volumn;
          this.asks[i].depth = depth;
        }
        depth = 0;
        for (let i=0; i<this.bids.length; i++) {
          this.bids[i].volumn = this.bids[i].amount;
          this.bids[i].amount = this.bids[i].volumn / this.bids[i].price;
          depth = depth + parseFloat(this.bids[i].volumn);
          this.bids[i].depth = depth;
        }
        let max_depth = 0;
        if (this.asks.length>0) {
          max_depth = this.asks[this.asks.length-1].depth;
        }
        if (this.bids.length>0 && this.bids[this.bids.length-1].depth > max_depth) {
          max_depth = this.bids[this.bids.length-1].depth;
        }
        for (let i=0; i<this.asks.length; i++) {
          this.asks[i].pct = mathUtils.round(this.asks[i].depth / max_depth * 100, 2);
        }
        for (let i=0; i<this.bids.length; i++) {
          this.bids[i].pct = mathUtils.round(this.bids[i].depth / max_depth * 100, 2);
        }
      },
      viewLastBooks () {
        this.$refs.tradeLastBookPop.show(this.tradePair);
      },
      viewMyBooks () {
        this.$refs.tradeLastBookPop.show(this.tradePair, this.$store.state.account.address);
      },
      selectOnePrice (item) {
        this.$emit('input', item.price);
        // this.form.price = item.price;
      }
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../scss/trade";
</style>
