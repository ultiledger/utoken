<template>
  <div class="asset-item">
    <div class="top-wrapper">
      <div class="asset-top-card" @click="topCardClick" :class="`${data.type}-bg`">
        <div class="bg">
          <img src="static/img/card-bg.png" />
        </div>
        <div class="content-wrapper">
          <div class="qrcode" @click.stop="showQRcode(data.type)">
            <i class="ultfont ult-qrcode"></i>
          </div>
          <div class="title text-ellipsis">
            <img
              :src="dprImg(`${shortType(data.type)}-w.png`)"
              width="25"
              height="25"
              style="vertical-align: middle"
            />
            <span style="vertical-align: middle">&nbsp;&nbsp;{{data.name}}</span>
          </div>
          <div class="content" :class="setStatAmtClass">
            <span class="normal-font">&nbsp;&#8776;&nbsp;</span>
            <pl-privacy>{{statAmt | currency('', '4') | cutTail}}&nbsp;</pl-privacy>
            <span class="small-font">&nbsp;{{$store.state.setting.currencyUnit}}</span>
          </div>
          <div class="bottom">
            <pl-wallet-addr class="small-font" :complete="false" :address="data.address"></pl-wallet-addr>
            <span class="pull-right">
              <i class="ultfont ult-ellipsis"></i>
            </span>
          </div>
        </div>
      </div>
    </div>
    <pl-content-block
      :offsetTop="214"
      :offsetBottom="51"
      heightType="minHeight"
      style="overflow-y: hidden;"
    >
      <div class="text-center" v-if="loading">
        <van-loading style="margin: 10px auto;" />
      </div>
      <div v-else>
        <account-activated
          v-if="!activated"
          :acct-type="data.type"
          :short-acct-type="shortType(data.type)"
          @transitionActivated="showQRcode(data.type)"
        ></account-activated>
        <div v-else>
          <div class="asset-bar" v-if="this.balances && this.balances.length > 0">
            <div class="big-font" style="font-weight: bold">
              <span style="vertical-align: middle;">{{$t('assets.assets')}}</span>
              <span style="vertical-align: middle;">
                &nbsp;
                <van-icon
                  v-if="!$store.state.setting.privacyMode"
                  name="password-view"
                  @click="setMode(true)"
                />
                <van-icon v-else name="password-not-view" @click="setMode(false)" />
              </span>
            </div>
            <span
              class="add-btn"
              style="right: 60px;background-color: #00c2c2"
              @click="toTrade"
              v-if="showTradeBtn"
            >
              <img :src="dprImg(`trade.png`)" width="20" height="20" />
            </span>
            <span class="add-btn" @click="addAssets" v-if="showAddBtn">
              <img :src="dprImg(`add.png`)" width="20" height="20" />
            </span>
          </div>
          <div class="asset-list">
            <div
              class="asset-list-item item-block"
              v-for="(item, key) in assets"
              :key="key"
              @click="assetClick(item)"
            >
              <div class="content">
                <table style="width: 100%;">
                  <tr>
                    <td width="35">
                      <span class="img-icon">
                        <img v-if="item.logo" :src="item.logo" />
                        <img
                          v-else-if="item.code === 'XRP'"
                          :src="`static/img/${item.code}-1@3x.png`"
                        />
                        <img
                          v-else
                          :src="`static/img/${item.code}@3x.png`"
                          onerror="this.src='static/img/unknown.png'"
                        />
                      </span>
                    </td>
                    <td width="90">
                      <div style="vertical-align: middle;" class="big-font">{{item.code}}</div>
                      <span v-if="item.name" class="text-main">
                        <span v-if="item.name !== 'unknown'">{{item.name}}</span>
                        <span v-else>
                          <pl-wallet-addr
                            class="x-small-font"
                            :complete="false"
                            :address="item.issuer"
                            :length="4"
                            :show-copy="false"
                          ></pl-wallet-addr>
                        </span>
                      </span>
                    </td>
                    <td class="text-right">
                      <div class="big-font">
                        <!-- item 返回0.0000000001 -->
                        <pl-privacy :switchable="false">{{item.value | currency('', '8') | cutTail}}</pl-privacy>
                      </div>
                      <div
                        class="text-main small-font"
                        v-if="isShowMarket(item.value, item.code, item.issuer)"
                      >
                        <div v-if="item.issuer || item.code === 'ETH' || item.code === 'BTC'">
                          &#8776;&nbsp;
                          <pl-privacy
                            :suffix="$store.state.setting.currencyUnit"
                            :switchable="false"
                          >{{item.value | market(item.code, item.issuer)}}</pl-privacy>
                        </div>
                      </div>
                      <div
                        v-if="(item.code === 'XLM' && !item.issuer) || (item.code === 'XRP' && !item.issuer)"
                      >
                        {{$t('assets.frozenNative')}}
                        <pl-privacy
                          :suffix="$store.state.setting.currencyUnit"
                          :switchable="false"
                        >{{item.frozenNative}} {{item.code}}</pl-privacy>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </pl-content-block>
  </div>
</template>

<script>
import asset from "./mixns/asset";
import coins from "src/wallet/coins";
import accountActivated from "./account-activated";
import { AccountType } from "src/wallet/constants";
import Big from "big.js";
import convertMarket from "core/utils/convertMarket";
export default {
  mixins: [asset],
  props: {
    data: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      loading: false
    };
  },
  components: {
    accountActivated
  },
  created() {
    console.log(this.data);
  },

  computed: {
    showAddBtn() {
      if (this.data && this.data.type === AccountType.bitcoin) {
        return false;
      } else {
        return true;
      }
    },
    showTradeBtn() {
      if (
        this.data &&
        (this.data.type === AccountType.stellar ||
          this.data.type === AccountType.ripple)
      ) {
        return true;
      } else {
        return false;
      }
    },
    activated() {
      if (this.data && this.data.address) {
        let activated = this.$store.state.activatedMap[this.data.address];
        return activated === false ? false : true;
      }
      return true;
    },
    // 资产
    assets() {
      let assets = [];
      if (this.data && this.data.address) {
        let assetsMap = this.getConfigAssetsMap(this.data.type);
        if (this.balances) {
          //以太坊的数据
          this.balances.forEach((item, index) => {
            let asset = { ...item };
            let assetMap = assetsMap[item.code + (item.issuer || "")];
            if (assetMap) {
              asset.logo = assetMap.logo || "";
              asset.name = assetMap.name || "unknown";
              asset.issuer = assetMap.issuer;
              assets.push(asset);
            } else if (index === 0) {
              // asset.name = this.data.type;
              assets.push(asset);
            } else {
              asset.logo = "static/img/unknown.png";
              if (!asset.name) {
                asset.name = "unknown";
              }
              assets.push(asset);
            }
          });
        }
      }
      return assets;
    },
    balances() {
      if (this.data.address) {
        return this.$store.state.balances[this.data.address];
      }
      return [];
    },

    statAmt() {
      let assets = this.assets;
      let result = 0;
      if (assets && assets.length > 0) {
        let markets = this.$store.state.markets;
        assets.forEach(item => {
          let key = item.issuer ? `${item.code}-${item.issuer}` : item.code;
          let market = markets[key];
          if (market && market.marketPrice) {
            let calVal = new Big(item.value).times(market.marketPrice);
            result = new Big(result).plus(calVal);
          }
        });
      }
      if (result > 1) {
        result = result.toFixed(2);
      } else if (result > 0 && result < 1) {
        result = result.toFixed(4);
      }

      return Number(result);
    },
    setStatAmtClass() {
      if (this.statAmt && this.statAmt.toString().length > 12) {
        return "x-large-font";
      } else {
        return "x-x-large-font";
      }
    }
  },
  methods: {
    isShowMarket(value, assetCode, assetIssuer) {
      return convertMarket(value, assetCode, assetIssuer) > 0;
    },
    setMode(val) {
      this.$store.dispatch("setPrivacyMode", val);
    },
    async setActive() {
      if (!this.balances || this.balances.length === 0) {
        this.loading = true;
      }
      let params = { ...this.data, setBalance: false };
      await this.$store.dispatch("setAccount", params);
      this.$store.dispatch("setBalances", this.data)
        .then(() => {
          this.loading = false;
          this.$emit("setSwipeHeight");
        })
        .catch(() => {
          this.loading = false;
          this.$emit("setSwipeHeight");
        });
         
      if(this.data.type === AccountType.ripple){
        setTimeout(()=>{
         this.loading = false;
         this.$emit("setSwipeHeight");
        },2000);
     
       }
      // this.$wallet.getInstance().getTrustlines('rDDJqnFgTNnR4c4u8EAAskpet4LUYUZm4A').then(ret => {
      //   console.info(ret);
      // });
    },
    shortType(type) {
      return coins[type].symbol || type;
    },
    assetClick(item) {
      this.$emit("assetClick", item);
    },
    topCardClick() {
      this.$emit("topCardClick");
    },
    showQRcode(type) {
      this.$emit("showQRcode", this.shortType(type));
    },
    addAssets() {
      this.$emit("addAssets");
    },
    toTrade() {
      if (this.balances.length > 1 || this.data.type === AccountType.ripple) {
        // fix#86
        this.$emit("toTrade");
      } else {
        this.$dialog
          .confirm({
            title: this.$t("common.tip"),
            message: this.$t("trade.tradeTip")
          })
          .then(() => {
            this.$emit("toTrade");
          });
      }
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
@import "~assets/scss/variables";
@import "~assets/scss/mixin";
.asset-item {
  height: 100%;
  .top-wrapper {
    background: #fff;
    padding: 20px 32px;
    position: relative;
    border-radius: 0 0 12px 12px;
    .asset-top-card {
      /* background-image: radial-gradient(circle at left top, $primay-gradient-light, $primay-gradient);*/
      overflow: hidden;
      .content-wrapper {
        position: relative;
        z-index: 2;
      }
      .bg {
        position: absolute;
        height: 100%;
        width: 100%;
        top: -5px;
        left: 0px;
        z-index: 1;
        img {
          height: 100%;
          width: 100%;
          border: 0px;
        }
      }
      height: 128px;
      border-radius: $border-radius;
      transition: 0.2s all;
      position: relative;
      z-index: 2;
      margin: 0px -60px;
      transform: scale(0.8);
      padding: 10px 20px;
      color: #fff;
      .title {
        padding-right: 60px;
        > span {
          display: inline-block;
          line-height: 27px;
          height: 25px;
        }
      }
      .content {
        height: 58px;
        line-height: 58px;
      }
      .bottom {
        line-height: 20px;
      }
      .qrcode {
        position: absolute;
        top: -5px;
        right: 0px;
      }
    }
  }
  .asset-bar {
    padding: 25px 20px 10px;
    padding-left: 10px;
    padding-right: 10px;
    position: relative;
    line-height: 30px;
    .add-btn {
      background: #fff;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      line-height: 36px;
      text-align: center;
      display: block;
      position: absolute;
      top: 22px;
      /* right: 20px;*/
      right: 10px;
      color: $primary-color;
      padding: 5px;
      box-shadow: 0px -2px 20px rgba(0, 0, 0, 0.05);
    }
  }

  .asset-list {
    .asset-list-item {
      height: 80px;
      padding: 20px;
      margin-left: 10px;
      margin-right: 10px;
      .title {
        @include clearfix();
        margin-bottom: 2px;
      }
      .content {
        @include clearfix();
        line-height: 20px;
        font-size: $x-small-font;
      }
    }
    margin-bottom: 20px;
  }
}
</style>
