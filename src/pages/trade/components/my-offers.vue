<template>
  <div>
    <div class="b-white padding trade-offers">
      <div :class="{'van-hairline--bottom':index!==(offers.length - 1)}" v-for="(item, index) in offers" :key="index">
        <van-row class="margin-bottom">
          <van-col span="3"><span v-if="item.isSelling" class="text-danger" v-text="$t('trade.selling')"></span><span v-else class="text-primary" v-text="$t('trade.buying')"></span></van-col>
          <van-col span="15" class="text-muted">{{item.tradeTime}}</van-col>
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
            <td colspan="1" rowspan="1" class="small-font">
              {{item.price | currency('', '7') | cutTail}}
            </td>
            <td colspan="1" rowspan="1" class="text-right small-font text-muted">
              {{item.amount | currency('', '7') | cutTail}}
            </td>
            <td colspan="1" rowspan="1" class="text-right small-font text-muted">
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
  export default {
    components: {passwordDialog, offerHistory},
    props: {
      tradePair: {
        type: Object,
        default: () => {
          return {};
        }
      },
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
          }, 1000 * 60 * 1);
        }
      },
      isSameAsset (code, issuer, code2, issuer2) { /*是否是当前交易对*/
        if (code == 'XLM') {
          return code == code2;
        } else {
          return code == code2 && issuer == issuer2;
        }
      },
      processOffers (datas) {
        let result = [];
        datas.forEach((item) => {
          let buyCode = item.buying.asset_type === 'native' ? 'XLM' : item.buying.asset_code;
          let buyIssuer = item.buying.asset_type == 'native' ? '' : item.buying.asset_issuer;
          let sellCode = item.selling.asset_type === 'native' ? 'XLM' : item.selling.asset_code;
          let sellIssuer = item.selling.asset_type == 'native' ? '' : item.selling.asset_issuer;
          let amount = parseFloat(item.amount);
          let price = parseFloat(item.price);
          let volume = item.amount * item.price;
          let isSelling = false; /*买入还是卖出，true-卖出*/
          if (this.isSameAsset(sellCode, sellIssuer, this.tradePair.baseCode, this.tradePair.baseIssuer) && this.isSameAsset(buyCode, buyIssuer, this.tradePair.counterCode, this.tradePair.counterIssuer)) {
            isSelling = true;
            result.push(
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
            amount = item.amount * item.price;
            price = 1 / item.price;
            volume = parseFloat(item.amount);
            result.push(
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
      getOffers () {
        this.$wallet.queryOffers(this.address).then((datas) => {
          this.offers = this.processOffers(datas);
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
      viewOfferHistory () {
        this.$refs.offerHistory.show(this.tradePair);
      }
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../scss/trade";
</style>
