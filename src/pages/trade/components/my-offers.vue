<template>
  <div>
    <div class="b-white padding trade-offers">
      <div :class="{'van-hairline--bottom':index!==(offers.length - 1)}" v-for="(item, index) in offers" :key="index">
        <van-row class="margin-bottom">
          <van-col span="3"><span v-if="item.isSelling" class="text-danger" v-text="$t('trade.selling')"></span><span v-else class="text-primary" v-text="$t('trade.buying')"></span></van-col>
          <van-col span="15" class="text-muted">{{item.tradeTime}}&nbsp;</van-col>
          <van-col span="6" class="text-right" @click.native="toCancel(item)"><span class="normal-font text-primary" v-text="$t('trade.cancel')"></span></van-col>
        </van-row>
        <table style="height: 100%;width: 100%;border-collapse:collapse;">
          <tr>
            <th colspan="1" rowspan="1" class="small-font text-muted text-left">
              {{$t('trade.price')}}({{tradePair.counterCode}})
            </th>
            <th colspan="1" rowspan="1" class="small-font text-muted text-right ">
              {{$t('trade.amount')}}({{tradePair.baseCode}})
            </th>
            <th colspan="1" rowspan="1" class="small-font text-muted text-right ">
              {{$t('trade.unexecuted')}}({{tradePair.baseCode}})
            </th>
          </tr>
          <tr>
            <td colspan="1" rowspan="1" class="small-font" :style="{color:item.isSelling?'#ed4f78': '#00ac94'}">
              {{item.price | currency('', '7') | cutTail}}
            </td>
            <td colspan="1" rowspan="1" class="text-right small-font" :style="{color:item.isSelling?'#ed4f78': '#00ac94'}">
              {{item.amount | currency('', '7') | cutTail}}
            </td>
            <td colspan="1" rowspan="1" class="text-right small-font" :style="{color:item.isSelling?'#ed4f78': '#00ac94'}">
              0
            </td>
          </tr>
        </table>
      </div>
      <!--<div class="text-primary x-small-font" style="margin-top: 10px;" @click="viewOfferHistory">委托历史<i class="ultfont ult-right x-small-font"></i></div>-->
    </div>
    <password-dialog ref="pwdDialog" @done="cancelOffer"></password-dialog>
    <offer-history ref="offerHistory"></offer-history>
  </div>
</template>
<script>
  import cryptor from 'core/utils/cryptor';
  import moment from 'moment';
  import passwordDialog from '../../ui/password-dialog';
  import offerHistory from '../popup/offer-history-pop';
  import Big from 'big.js';
  import {AccountType} from "src/wallet/constants";
  import coins from 'src/wallet/coins';
  export default {
    components: {passwordDialog, offerHistory},
    props: {
      tradePair: {
        type: Object,
        default: () => {
          return {};
        }
      },
      accountType: String,
      address: String,
      secret: String
    },
    data () {
      return {
        offers: [],
        offerTimer: null
      };
    },
    methods: {
      clearTimer () {
        if (this.offerTimer) {
          window.clearInterval(this.offerTimer);
          this.offerTimer = null;
        }
      },
      startTimer () {
        if (!this.offerTimer) {
          this.offerTimer = window.setInterval(() => {
            this.getOffers();
          }, 1000 * 6 * 1);
        }
      },
      shortType () {
        let type = this.accountType;
        return coins[type].symbol || type;
      },
      isSameAsset (code, issuer, code2, issuer2) { /*是否是当前交易对*/
        if (code == this.shortType()) {
          return code == code2;
        } else {
          return code == code2 && issuer == issuer2;
        }
      },
      processStellarOffers (datas) {
        let result = [];
        datas.forEach((item) => {
          let buyCode = item.buying.asset_type === 'native' ? 'XLM' : item.buying.asset_code;
          let buyIssuer = item.buying.asset_type == 'native' ? '' : item.buying.asset_issuer;
          let sellCode = item.selling.asset_type === 'native' ? 'XLM' : item.selling.asset_code;
          let sellIssuer = item.selling.asset_type == 'native' ? '' : item.selling.asset_issuer;
          let amount = 0;
          let price = 0;
          let volume = 0;
          let isSelling = false; /*买入还是卖出，true-卖出*/
          if (this.isSameAsset(sellCode, sellIssuer, this.tradePair.baseCode, this.tradePair.baseIssuer) && this.isSameAsset(buyCode, buyIssuer, this.tradePair.counterCode, this.tradePair.counterIssuer)) {
            isSelling = true;
            amount = Number(item.amount);
            price = parseFloat(item.price).toFixed(7);
            volume = Number(new Big(item.amount).times(item.price).toString());
            result.unshift(
              {
                id : item.id,
                isSelling,
                buyCode,
                buyIssuer,
                sellCode,
                sellIssuer,
                amount,
                price,
                volume,
                tradeTime: moment(item.last_modified_time).format('HH:mm MM/DD')
              }
            );
          } else if (this.isSameAsset(sellCode, sellIssuer, this.tradePair.counterCode, this.tradePair.counterIssuer) && this.isSameAsset(buyCode, buyIssuer, this.tradePair.baseCode, this.tradePair.baseIssuer)) {
            amount = Number(new Big(item.amount).times(item.price).toString());
            price = Number(new Big(1).div(item.price).toString());
            volume = Number(item.amount);
            result.unshift(
              {
                id : item.id,
                isSelling,
                buyCode,
                buyIssuer,
                sellCode,
                sellIssuer,
                amount,
                price,
                volume,
                tradeTime: moment(item.last_modified_time).format('HH:mm MM/DD')
              }
            );
          }
        });
        return result;
      },
      processRippleOffers (datas) {
        let result = [];
        datas.forEach((item) => {
          let isSelling = false; /*买入还是卖出，true-卖出*/
          let buyCode = '';
          let buyIssuer = '';
          let sellCode = '';
          let sellIssuer = '';
          buyCode = item.specification.quantity.currency;
          sellCode = item.specification.totalPrice.currency;
          if (item.specification.quantity.counterparty) {
            buyIssuer = item.specification.quantity.counterparty;
          }
          if (item.specification.totalPrice.counterparty) {
            sellIssuer = item.specification.totalPrice.counterparty;
          }
          if (this.isSameAsset(sellCode, sellIssuer, this.tradePair.baseCode, this.tradePair.baseIssuer) && this.isSameAsset(buyCode, buyIssuer, this.tradePair.counterCode, this.tradePair.counterIssuer)) {
            isSelling = true;
            if (item.specification.direction === 'sell'){
              isSelling = false;
            }
            let price = Number(new Big(item.specification.quantity.value).div(item.specification.totalPrice.value).toString()).toString();
            result.push(
              {
                id : item.properties.sequence,
                isSelling,
                buyCode,
                sellCode,
                buyIssuer,
                sellIssuer,
                amount: item.specification.totalPrice.value,
                price,
                tradeTime: ''
              }
            );
          } else if (this.isSameAsset(sellCode, sellIssuer, this.tradePair.counterCode, this.tradePair.counterIssuer) && this.isSameAsset(buyCode, buyIssuer, this.tradePair.baseCode, this.tradePair.baseIssuer)) {
            isSelling = false;
            if (item.specification.direction === 'sell'){
              isSelling = true;
            }
            let price = Number(new Big(item.specification.totalPrice.value).div(item.specification.quantity.value).toString()).toString();
            result.push(
              {
                id : item.properties.sequence,
                isSelling,
                buyCode,
                sellCode,
                buyIssuer,
                sellIssuer,
                amount:item.specification.quantity.value,
                price,
                tradeTime: ''
              }
            );
          }
        });
        return result;
      },
      getOffers () {
        this.$wallet.queryOffers(this.address).then((datas) => {
          if (this.accountType === AccountType.stellar) {
            this.offers = this.processStellarOffers(datas);
          } else if (this.accountType === AccountType.ripple) {
            this.offers = this.processRippleOffers(datas);
          }
          this.startTimer();
        }).catch(() => {
          this.offers = [];
          this.startTimer();
        });
      },
      toCancel (item) {
        if (this.$store.state.passwordMap[this.address]) {
          this.cancelOffer (this.$store.state.passwordMap[this.address], item);
        } else {
          this.$refs.pwdDialog.show(item);
        }
      },
      cancelOffer (password, item) {
        this.$emit('savePasswordInMemory', password);
        const toast = this.$toast.loading({
          duration: 0,
          forbidClick: true,
          loadingType: 'circular'
        });
        let offer = {
          id: item.id,
          price: item.price
        };
        if (item.isSelling) {
          offer.selling = {
            code: item.sellCode,
            issuer: item.sellIssuer
          };
          offer.buying = {
            code: item.buyCode,
            issuer: item.buyIssuer
          };
        } else {
          offer.selling = {
            code: item.buyCode,
            issuer: item.buyIssuer
          };
          offer.buying = {
            code: item.sellCode,
            issuer: item.sellIssuer
          };
        }
        this.$wallet.cancelOffer(offer, this.address, cryptor.decryptAES(this.secret, password)).then(ret => {
          if (ret) {
            toast.message = this.$t('trade.cancelSuccess');
            setTimeout(() => {
              toast.clear();
              this.getOffers();
            }, 1000);
          }
        }).catch(err => {
          console.info(err);
          let errMsg = this.getErrMsg(err);
          if (errMsg) {
            this.$toast(errMsg);
          } else {
            this.$toast(this.$t('trade.cancelFail'));
          }
          setTimeout(() => {
            toast.clear();
          }, 2000);
        });
      },
      getErrMsg (err) {
        console.info(err);
        return null;
      },
      viewOfferHistory () {
        this.$refs.offerHistory.show(this.tradePair);
      }
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../scss/trade";
</style>
