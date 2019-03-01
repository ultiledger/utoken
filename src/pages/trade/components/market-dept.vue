<template>
  <div>
    <div class="b-white padding trade-offers">
      <van-row>
        <van-col span="12" class="van-hairline--right" style="padding-right: 3px;">
          <div class="offer-table">
            <div class="text-muted x-small-font header">
              <div class="text-left" v-text="$t('trade.buyAmount')"></div>
              <div class="text-right" v-text="$t('trade.buyPrice')"></div>
            </div>
            <div class="small-font row"
                 v-for="(item, index) in bids"
                 :style="`background: linear-gradient(to left, #dcf6de ${item.pct}%, #fff ${item.pct}%)`"
                 :key="index"
                 @click.stop="selectOnePrice(item)">
              <div class="text-left" style="color:#00ac94"> {{item.amount | currency('', '4')}}</div>
              <div class="text-right small-font" style="color:#00ac94"> {{item.price | currency('', '7')}}</div>
            </div>
          </div>
        </van-col>
        <van-col span="12" style="padding-left: 3px;">
          <div class="offer-table">
            <div class="text-muted x-small-font header">
              <div class="text-left" v-text="$t('trade.sellPrice')"></div>
              <div class="text-right" v-text="$t('trade.sellAmount')"></div>
            </div>
            <div class="small-font row"
                 v-for="(item, index) in asks"
                 :style="`background: linear-gradient(to right, #fed6d8 ${item.pct}%, #fff ${item.pct}%)`"
                 :key="index"
                 @click.stop="selectOnePrice(item)">
              <div class="text-left" style="color:#ed4f78">{{item.price | currency('', '7')}}</div>
              <div class="text-right small-font" style="color:#ed4f78"> {{item.amount | currency('', '4')}}</div>
            </div>
          </div>
        </van-col>
      </van-row>
      <van-row>
        <van-col span="12" class="text-left">
          <div class="text-primary x-small-font" style="margin-top: 10px;" @click.stop="viewLastBooks">{{$t('trade.lastExec')}}<i class="ultfont ult-right x-small-font"></i></div>
        </van-col>
        <van-col span="12" class="text-right">
          <div class="x-small-font dept-dw">
            <div @click.stop="selectPage = !selectPage">
              {{pageNo}}&nbsp;<i class="ultfont ult-down small-font"></i>
            </div>
            <div class="selectUl x-small-font" v-if="selectPage">
              <div class="selectLi" v-for="item in pageNos" :key="item" @click.stop="toSelectPageNo(item)" :class="{'select': pageNo==item}">{{item}}</div>
            </div>
          </div>
          <div class="text-primary x-small-font" style="margin-top: 10px;display: inline-block;" @click.stop="viewMyBooks">{{$t('trade.myExec')}}<i class="ultfont ult-right x-small-font"></i></div>
        </van-col>
      </van-row>
    </div>
  </div>
</template>
<script>
  import mathUtils from 'core/utils/mathUtils';
  import {AccountType} from 'src/wallet/constants';
  export default {
    props: {
      tradePair: {
        type: Object,
        default: () => {
          return {};
        }
      },
      accountType: String
    },
    data () {
      return {
        pageNos: [100, 50, 30, 10],
        pageNo: 10,
        selectPage: false,
        marketTimer: null, // 市场深度定时器
        books: [], /*买单+卖单*/
        asks: [], /*卖单*/
        bids: [] /*买单*/
      };
    },
    methods: {
      toSelectPageNo (item) {
        this.pageNo=item;
        this.selectPage=false;
        this.getBooks();
      },
      initSelectPage () {
        this.selectPage = false;
      },
      initMarketDept () {
        this.selectPage = false;
        this.pageNo = 10;
      },
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
        let type = this.accountType;
        this.$wallet.queryBook(base, counter).then((data) => {
          this.books = data;
          this.asks = data.asks;
          this.bids = data.bids;
          if (type === AccountType.stellar){
            this.processBooks();
          } else if(type === AccountType.ripple){
            this.processRippleBooks();
          }
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
        // let displayNo = 15;
        let displayNo = this.pageNo;
        if (this.asks.length > displayNo) {
          this.asks = this.asks.slice(0, displayNo);
        }
        if (this.bids.length > displayNo) {
          this.bids = this.bids.slice(0, displayNo);
        }
        let depth = 0;
        for (let i=0; i<this.asks.length; i++) {
          this.asks[i].volumn = this.asks[i].amount;
          depth = depth + parseFloat(this.asks[i].volumn);
          this.asks[i].depth = depth;
        }
        depth = 0;
        for (let i=0; i<this.bids.length; i++) {
          this.bids[i].volumn = this.bids[i].amount / this.bids[i].price;
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
      processRippleBooks () {
        // 最多显示15条记录
        // let displayNo = 15;
        let displayNo = this.pageNo;
        if (this.asks.length > displayNo) {
          this.asks = this.asks.slice(0, displayNo);
        }
        if (this.bids.length > displayNo) {
          this.bids = this.bids.slice(0, displayNo);
        }
        let depth = 0;
        for (let i=0; i<this.asks.length; i++) {
          this.asks[i].volumn = this.asks[i].amount;
          depth = depth + parseFloat(this.asks[i].volumn);
          this.asks[i].depth = depth;
        }
        depth = 0;
        for (let i=0; i<this.bids.length; i++) {
          this.bids[i].volumn = this.bids[i].amount;
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
        this.initSelectPage();
        this.$emit('viewLastBooks');
      },
      viewMyBooks () {
        this.initSelectPage();
        this.$emit('viewMyBooks');
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
  @import "~assets/scss/variables";
  .dept-dw {
    display: inline-block;
    margin-top: 10px;
    padding-right: 8px;
    margin-right: 10px;
    border-right: 1px solid $border-color;
    position: relative;
    .selectUl {
      margin-left:0.75rem;
      position:absolute;
      z-index:99999;
      width:5rem;
      left: -2rem;
      top: -7rem;
      height:6.6rem;
      border-radius:0.5rem;
      text-align:center;
      font-size:0.9rem;
      box-shadow: 0px -2px 20px rgba(0,0,0,0.05);
      background: #fff;
      .selectLi {
        height:1.6rem;
        line-height:1.6rem;
        &.select {
          color: #fff;
          background-color:$primary-color;
        }
      }
    }
  }
</style>
