<template>
  <div class="trade" @click.stop="bindClick">
    <van-popup
      v-model="showPop"
      position="bottom"
      class="popup-wapper"
      style="width:100%;height: 100%;">
      <van-nav-bar
        @click-left="close()">
        <div slot="title">
          <span>{{tradepair.baseCode}}</span>
          <span>/</span>
          <span>{{tradepair.counterCode}}</span>
        </div>
        <span slot="left"><i class="ultfont ult-left"></i></span>
        <i slot="right" @click.stop="toAddTradepair" class="ultfont ult-plus"></i>
      </van-nav-bar>
      <pl-content-block :offsetTop="46" class="b-white">
        <div style="padding-top: 10px;padding-left: 20px;text-align: center;">
          <span class="bs-btn buy-btn" :class="bsFlag" @click.stop="toBs('buy')" v-text="$t('trade.buying')"></span>
          <span class="bs-btn sell-btn" :class="bsFlag" @click.stop="toBs('sell')" v-text="$t('trade.selling')"></span>
        </div>

        <div class="bs-block item-block">
          <div class="text-muted b-white item x-small-font" >
            <span>{{$t('trade.youAsset')}}&nbsp;&nbsp;&nbsp;{{balances[bsCode+bsIssuer] | cutTail}}&nbsp;{{bsCode}}</span>
          </div>
          <div class="item">
            <van-row>
              <van-col span="11" class="x-small-font">
                <span v-if="bsFlag === 'buy'" v-text="$t('trade.buyPrice')"></span><span v-else-if="bsFlag === 'sell'" v-text="$t('trade.sellPrice')"></span>({{tradepair.counterCode}})
              </van-col>
              <van-col span="11" offset="2" class="x-small-font">
                {{$t('trade.amount')}}({{tradepair.baseCode}})
              </van-col>
            </van-row>
            <van-row>
              <van-col span="11">
                <van-field
                  v-if="bsFlag === 'buy'"
                  v-model="form.price"
                  type="number"
                  class="x-small-font text-primary"
                  style="background: #f1f8fb"
                  :placeholder="`${$t('trade.buyPrice')}(${tradepair.counterCode})`">
                </van-field>
                <van-field
                  v-if="bsFlag === 'sell'"
                  type="number"
                  v-model="form.price"
                  class="x-small-font text-primary"
                  style="background: #f1f8fb"
                  :placeholder="`${$t('trade.sellPrice')}(${tradepair.counterCode})`">
                </van-field>
              </van-col>
              <van-col span="11" offset="2">
                <van-field
                  class="x-small-font text-primary"
                  v-model.number="form.amount"
                  type="number"
                  style="background: #f1f8fb"
                  :placeholder="`${$t('trade.amount')}(${tradepair.baseCode})`">
                </van-field>
              </van-col>
            </van-row>
          </div>
          <div class="item">
            <van-row>
              <van-col span="11" class="x-small-font" v-text="$t('trade.estVal')"></van-col>
            </van-row>
            <van-row>
              <van-col span="11" class="text-muted">
                {{expectedTradePrice | cutTail}}&nbsp;{{tradepair.counterCode}}
              </van-col>
              <van-col span="11" offset="2">
                <vue-slider
                  style="position: relative;top: -12px;"
                  v-model="form.amount"
                  :debug="false"
                  :height="2"
                  :tooltip="false"
                  :interval.sync="step"
                  :max.sync="maxVal"></vue-slider>
              </van-col>
            </van-row>
          </div>
        </div>
        <div @touchstart.stop="onTouchStart"
             @touchmove.stop="onTouchMove"
             @touchend.stop="onTouchEnd"
             @touchcancel.stop="onTouchEnd">
        <div class="single-btn margin-top margin-bottom" style="margin-right: 50px;margin-left: 50px;">
          <van-button size="large" round type="primary" class="buy-bg-image" style="border:none;" @click="toInputPassword" v-if="bsFlag === 'buy'">{{$t('trade.buyingCode', {code: tradepair.baseCode})}}</van-button>
          <van-button size="large" round type="danger" class="sell-bg-image" style="border:none" @click="toInputPassword" v-else-if="bsFlag === 'sell'">{{$t('trade.selling')}}{{tradepair.baseCode}}</van-button>
        </div>
        <van-tabs v-model="tabActive" sticky @change="tabChange">
          <van-tab  :title="$t('trade.marketDepth')">
            <market-dept
              ref="marketDept"
              v-model="form.price"
              @viewLastBooks="viewLastBooks"
              @viewMyBooks="viewMyBooks"
              :accountType="currentAccount.type"
              :tradePair.sync="tradepair"></market-dept>
          </van-tab>
          <van-tab  :title="$t('trade.myOffer')">
            <my-offers
              ref="myOffers"
              :accountType="currentAccount.type"
              :tradePair.sync="tradepair"
              :address.sync="currentAccount.address"
              :secret.sync="currentAccount.secret"
              @savePasswordInMemory="savePasswordInMemory"></my-offers>
          </van-tab>
        </van-tabs>
        </div>
      </pl-content-block>
    </van-popup>
    <trade-last-book-pop ref="tradeLastBookPop" :accountType="currentAccount.type"></trade-last-book-pop>
    <tradepair-add-pop ref="tradepairAddPop" @done="pairAddDone"></tradepair-add-pop>
    <password-dialog ref="pwdDialog" @done="tradeTx"></password-dialog>
  </div>
</template>
<script>
  // todo: 加入撤单，成交历史记录
  import tradeLastBookPop from './popup/trade-last-books-pop';
  import tradepairAddPop from './popup/tradepair-add-pop';
  import marketDept from './components/market-dept';
  import myOffers from './components/my-offers';
  import passwordDialog from '../ui/password-dialog';
  import Big from 'big.js';
  import cryptor from 'core/utils/cryptor';
  import vueSlider from 'vue-slider-component';
  import coins from 'src/wallet/coins';
  import {AccountType} from 'src/wallet/constants';
  export default {
    components: {tradepairAddPop, passwordDialog, vueSlider, marketDept, myOffers, tradeLastBookPop},
    data () {
      return {
        showPop: false,
        tabActive: 0, /*tab激活*/
        // bsNum: 0, /*滑动百分比*/
        bsFlag: 'buy', /*选中买入按钮还是卖出按钮, 默认buy*/
        bsCode: '', /*买入Code，卖出Code*/
        bsIssuer:'',
        tradepair: {}, /*交易对*/
        form: {
          price: '',
          amount: ''
        },
        startX: 0, // 滑动开始
        startY: 0,
        deltaX: 0, // 滑动过渡
        deltaY: 0,
        offsetX: 0, // 滑动偏移
        offsetY: 0
      };
    },
    computed: {
      currentAccount () {
        return this.$store.state.account;
      },
      balances () {
        let account = this.$store.state.account;
        if (account) {
          let bs = this.$store.state.balances[account.address];
          if (bs) {
            let result = {};
            bs.forEach((item) => {
              let issuer = item.issuer?item.issuer:'';
              result[item.code+issuer] = (new Big(item.value).toFixed(6)).toString();
            });
            return result;
          }
        }
        return {};
      },
      expectedTradePrice () {
        if (this.form.price && this.form.amount) {
          return new Big(this.form.price).times(this.form.amount).toFixed(8);
        }
        return 0.000000;
      },
      errMsg () {
        return  {
          'Bad Request': 'Bad Request',
          'NotFoundError': this.$t('exchange.notFoundError'),
          'Network Error': this.$t('transaction.networkError'),
          'manageOfferSellNoTrust': this.$t('trade.manageOfferNoTrust'),
          'manageOfferBuyNoTrust':this.$t('trade.manageOfferNoTrust'),
          'manageOfferMalformed': this.$t('trade.manageOfferMalformed'),
          'manageOfferUnderfunded': this.$t('trade.balancesTip')
        };
      },
      maxVal () {
        if (this.bsFlag === 'buy' && this.form.price > 0) {
          let amount = this.balances[this.bsCode+this.bsIssuer];
          if (amount) {
            return Number(new Big(amount).div(this.form.price).toFixed(8));
          }
        } else if (this.bsFlag === 'sell') {
          return Number(this.balances[this.bsCode+this.bsIssuer]);
        }
        return 100;
      },
      step () {
        if (this.maxVal > 0) {
          return Number(new Big(this.maxVal).div(10).toFixed(8));
        }
        return 1;
      }
    },
    watch: {
      showPop () {
        if (this.$refs.marketDept) {
          this.$refs.marketDept.clearTimer();
        }
        if (this.$refs.myOffers) {
          this.$refs.myOffers.clearTimer();
        }
      },
      'form.price' () {
        if (this.form.price) {
          this.form.price = (this.form.price.toString().match(/^\d*(\.?\d{0,7})/g)[0]) || null;
        }
      },
      'form.amount' () {
        if (this.form.amount) {
          this.form.amount = (this.form.amount.toString().match(/^\d*(\.?\d{0,7})/g)[0]) || null;
        }
      }
    },
    methods: {
      show () {
        this.showPop = true;
        this.init();
      },
      bindClick () {
        this.$refs.marketDept.initSelectPage();
      },
      shortType () {
        let type = this.$store.state.account.type;
        return coins[type].symbol || type;
      },
      init () {
        this.toBs('buy');
        this.form.price = '';
        let account = this.$store.state.account;
        if (account) {
          let tradepair = this.$collecitons.tradepair.findByAcctTypeAndAddress(account.type, account.address);
          if (tradepair && tradepair.length > 0) {
            this.tradepair = tradepair[0];
          } else {
            this.saveDefaultTradepair(account);
          }
          this.bsCode = this.tradepair.counterCode;
          this.bsIssuer = this.tradepair.counterIssuer ? this.tradepair.counterIssuer:'';
          this.$nextTick(() => {
            this.$refs.marketDept.initMarketDept();
            this.$refs.marketDept.getBooks();
          });
        }
      },
      onTouchStart (event) {
        this.startX = event.touches[0].clientX;
        this.startY = event.touches[0].clientY;
        this.deltaX = 0;
        this.deltaY = 0;
        this.offsetX = 0;
        this.offsetY = 0;
      },
      onTouchMove(event) {
        const touch = event.touches[0];
        this.deltaX = touch.clientX - this.startX;
        this.deltaY = touch.clientY - this.startY;
        this.offsetX = Math.abs(this.deltaX);
        this.offsetY = Math.abs(this.deltaY);
      },
      onTouchEnd () {
        const minSwipeDistance = 50;
        if (this.offsetX > this.offsetY && this.offsetX > 10 && this.offsetX >= minSwipeDistance) {
          if (this.deltaX > 0 && this.bsFlag !== 'buy') {
            this.toBs('buy');
          } else if (this.deltaX < 0 && this.bsFlag !== 'sell') {
            this.toBs('sell');
          }
        }
      },
      saveDefaultTradepair (account) {
        let bs = this.$store.state.balances[account.address];
        if (bs && bs.length > 1) {
          let oneBs = bs[1];
          this.tradepair = {
            acctType: account.type,
            acctAddress: account.address,
            baseCode: this.shortType(),
            baseIssuer: '',
            counterCode: oneBs.code,
            counterIssuer: oneBs.issuer ? oneBs.issuer: ''
          };
          this.$collecitons.tradepair.insertTradepair(this.tradepair);
        } else {
          this.tradepair = {
            acctType: account.type,
            acctAddress: account.address,
            baseCode: this.shortType(),
            baseIssuer: '',
            counterCode: 'CNY',
            counterIssuer: 'rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y'
          };
        }
      },
      toAddTradepair () {
        this.$refs.tradepairAddPop.show(this.tradepair);
      },
      toBs (flag) {
        this.form.amount = ''; //重置滑块
        this.bsFlag = flag;
        if (flag === 'buy') {
          this.bsCode = this.tradepair.counterCode;
          this.bsIssuer = this.tradepair.counterIssuer ? this.tradepair.counterIssuer:'';
        } else if (flag === 'sell') {
          this.bsCode = this.tradepair.baseCode;
          this.bsIssuer = this.tradepair.baseIssuer ? this.tradepair.baseIssuer:'';
        }
      },
      pairAddDone (tradePair) {
        this.tradepair = tradePair;
        this.bsCode = this.tradepair.counterCode;
        this.bsIssuer = this.tradepair.counterIssuer ? this.tradepair.counterIssuer:'';
        this.tabActive = 0;
        this.toBs('buy');
        this.$nextTick(() => {
          this.$refs.marketDept.getBooks();
        });
      },
      checkForm () {
        if (!this.form.price) {
          this.$toast(this.$t('trade.priceTip'));
          return false;
        }
        if (!this.form.amount) {
          this.$toast(this.$t('trade.amountTip'));
          return false;
        }
        if (this.bsFlag === 'buy') {
          if (Number(this.balances[this.bsCode+this.bsIssuer]) < Number(this.expectedTradePrice)) {
            this.$toast(this.$t('trade.balancesTip'));
            return false;
          } else {
            return true;
          }
        } else if (this.bsFlag === 'sell') {
          if (Number(this.balances[this.bsCode+this.bsIssuer]) < Number(this.form.amount)) {
            this.$toast(this.$t('trade.balancesTip'));
            return false;
          } else {
            return true;
          }
        }
        return true;
      },
      toInputPassword () {
        if (!this.checkForm()) {
          return;
        }
        if (this.$store.state.passwordMap[this.currentAccount.address]) {
          this.tradeTx (this.$store.state.passwordMap[this.currentAccount.address]);
        } else {
          this.$refs.pwdDialog.show();
        }
      },
      getErrMsg (err) {
        if (err && this.errMsg[err]) {
          return this.errMsg[err];
        }
        return null;
      },
      savePasswordInMemory (password) {
        let map = {};
        map[this.currentAccount.address] = password;
        this.$store.dispatch('setPasswordMap', map);
      },
      tradeTx (password) {
        this.savePasswordInMemory(password);
        this.loading = true;
        const toast = this.$toast.loading({
          duration: 0,
          forbidClick: true,
          loadingType: 'circular'
        });
        let selling = {};
        let buying = {};
        let amount = '';
        let price = '';
        if(this.currentAccount.type === AccountType.stellar){
          if (this.bsFlag === 'buy') {
            selling.code = this.tradepair.counterCode;
            selling.issuer = this.tradepair.counterIssuer;
            buying.code = this.tradepair.baseCode;
            buying.issuer = this.tradepair.baseIssuer;
            amount = this.expectedTradePrice;
            price = 1 / this.form.price;
          } else if (this.bsFlag === 'sell') {
            selling.code = this.tradepair.baseCode;
            selling.issuer = this.tradepair.baseIssuer;
            buying.code = this.tradepair.counterCode;
            buying.issuer = this.tradepair.counterIssuer;
            amount = this.form.amount;
            price = this.form.price;
          }
        }
        if(this.currentAccount.type === AccountType.ripple){
          selling.code = this.tradepair.counterCode;
          selling.issuer = this.tradepair.counterIssuer;
          buying.code = this.tradepair.baseCode;
          buying.issuer = this.tradepair.baseIssuer;
          amount = this.form.amount;
          price = this.form.price;
        }

        this.$wallet.sendOffer(selling, buying, amount, price, this.currentAccount.address, cryptor.decryptAES(this.currentAccount.secret, password), this.bsFlag).then(ret => {
          if (ret) {
            toast.message = this.$t('trade.offerSuccess');
            setTimeout(() => {
              toast.clear();
              this.tabActive = 1;
              this.tabChange();
            }, 1000);
          }
          this.loading = false;
          this.onRefreshBalances();
        }).catch(err => {
          console.info(err);
          let errMsg = this.getErrMsg(err);
          if (errMsg) {
            this.$toast(errMsg);
          } else {
            this.$toast(this.$t('trade.offerFail') + ':' + err);
          }
          setTimeout(() => {
            toast.clear();
          }, 2000);
          this.loading = false;
        });
      },
      tabChange () {
        if (this.tabActive === 0) {
          this.$nextTick(() => {
            this.$refs.myOffers.clearTimer();
            this.$refs.marketDept.getBooks();
          });
        } else if (this.tabActive === 1) {
          this.$nextTick(() => {
            this.$refs.marketDept.clearTimer();
            this.$refs.myOffers.getOffers();
          });
        }
      },
      viewLastBooks () {
        this.$refs.tradeLastBookPop.show(this.tradepair);
      },
      viewMyBooks () {
        this.$refs.tradeLastBookPop.show(this.tradepair, this.$store.state.account.address);
      },
      onRefreshBalances () {
        this.$store.dispatch('setBalances', this.$store.state.account.address).then(() => {
        }).catch(err => {
          console.info(err);
        });
      },
      close () {
        this.showPop = false;
      }
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
  @import "~assets/scss/variables";
  .trade {
    .bs-btn {
      display: inline-block;
      width: 90px;
      text-align: center;
      padding: 5px 10px;
    }
    .bs-block {
      margin-left: 0px;
      margin-right: 0px;
      border-radius: 0px;
      .item {
        padding-top:5px;
        padding-bottom: 5px;
      }
    }
    .buy-btn {
      margin-right: 10px;
      border: 1px solid #25e5ca;
      color: #25e5ca;
      &.buy {
       /* background-color: #25e5ca;*/
        background-image: radial-gradient(circle at left top, #25e5ca, #20c9e4);
        color: #ffffff;
      }
    }
    .buy-bg-image {
      background-image: radial-gradient(circle at left top, #25e5ca, #20c9e4);
    }
    .sell-btn {
      border: 1px solid #f3bc9d;
      color: #f3bc9d;
      &.sell {
        /*background-color: #f78994;*/
        background-image: radial-gradient(circle at left top, #f3bc9d, #f78994);
        color: #ffffff;
      }
    }
    .sell-bg-image {
      background-image: radial-gradient(circle at left top, #f3bc9d, #f78994);
    }
  }
</style>
