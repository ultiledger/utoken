<template>
  <div>
    <van-popup
      v-model="showPop"
      position="bottom"
      class="popup-wapper"
      style="width:100%;height: 100%;">
      <van-nav-bar
        :title="$t('trade.addTradePair')"
        @click-left="close()">
        <span slot="left"><i class="ultfont ult-left"></i></span>
      </van-nav-bar>
      <div class="b-white padding exchange-coin border-radius">
        <van-row>
          <van-col span="10">
            <div class="text-muted small-font title" v-text="$t('trade.baseCoin')"></div>
            <van-row class="select-van-row" @click.native="selectTradepair('1')">
              <van-col span="5">
                <img v-if="pairs.baseLogo" :src="pairs.baseLogo">
                <img v-else :src="`static/img/${pairs.baseCode}@3x.png`" onerror="this.src='static/img/unknown.png'"/>
              </van-col>
              <van-col span="16">
                &nbsp;<span style="vertical-align: middle;">{{pairs.baseCode}}</span>
              </van-col>
              <van-col span="3">
                <i class="ultfont ult-down small-font"></i>
              </van-col>
            </van-row>
          </van-col>
          <van-col span="4" class="text-center x-large-font" style="margin-top: 32px;">
            <img src="static/img/exchange.png" @click="exchangePair" width="20" height="20">
          </van-col>
          <van-col span="10">
            <div class="text-muted small-font title"  v-text="$t('trade.counterCoin')"></div>
            <van-row class="select-van-row" @click.native="selectTradepair('2')">
              <van-col span="5">
                <img v-if="pairs.counterLogo" :src="pairs.counterLogo" >
                <img v-else :src="`static/img/${pairs.counterCode}@3x.png`" onerror="this.src='static/img/unknown.png'"/>
              </van-col>
              <van-col span="16">
                &nbsp;<span style="vertical-align: middle;">{{pairs.counterCode}}</span>
              </van-col>
              <van-col span="3">
                <i class="ultfont ult-down small-font"></i>
              </van-col>
            </van-row>
        </van-col>
        </van-row>
        <div class="btn">
          <van-button
            size="large"
            :loading="loading"
            :disabled="disabledBtn"
            round
            type="primary"
            @click="sure()"
            v-text="$t('common.sure')"></van-button>
        </div>
      </div>
    </van-popup>
    <van-actionsheet v-model="showPicker">
      <div class="van-hairline--top-bottom van-picker__toolbar b-white">
        <div class="van-picker__cancel" @click="onCancel" v-text="$t('common.cancelText')"></div>
        <div class="van-picker__confirm" @click="onConfirm" v-text="$t('common.sure')"></div>
      </div>
      <van-radio-group v-model="pickerPair">
        <van-cell-group>
          <van-cell
            v-for="(item, index) in pickerBalances"
            clickable
            @click="pickerPair = item.code+item.issuer"
            :key="index">
            <div slot="title">
              <table style="width: 100%;">
                <tr>
                  <td width="35">
                  <span class="img-icon">
                      <img v-if="item.srcLogo" :src="item.srcLogo">
                      <img v-else :src="`static/img/${item.code}@3x.png`" onerror="this.src='static/img/unknown.png'"/>
                  </span>
                  </td>
                  <td width="90">
                    <div style="vertical-align: middle;" class="big-font">{{item.code}}</div>
                    <span v-if="item.srcName" class="text-main">
                      <span v-if="item.srcName !== 'unknown'">{{item.srcName}}</span>
                      <span v-else>
                        <pl-wallet-addr
                          class="x-small-font"
                          :complete="false"
                          :address="item.issuer" :length="4" :show-copy="false"></pl-wallet-addr>
                      </span>
                    </span>
                  </td>
                  <td class="text-right">
                    <van-radio :name="item.code+item.issuer" />
                  </td>
                </tr>
              </table>
            </div>
          </van-cell>
        </van-cell-group>
      </van-radio-group>
    </van-actionsheet>
  </div>
</template>
<script>
  import asset from '../../assets/mixns/asset';
  export default {
    mixins: [asset],
    data () {
      return {
        pairs: {},
        showPop: false,
        showPicker: false,
        pairType: '', /*交易对类型：1-基础货币，2-对手方货币*/
        loading: false, // 按钮loading状态,
        pickerBalances: [],
        pickerPair: ''
      };
    },
    computed: {
      disabledBtn () {
        if (Object.keys(this.pairs).length > 0) {
          return false;
        }
        return true;
      },
      balances () {
        let account = this.$store.state.account;
        if (account) {
          let bs = this.$store.state.balances[account.address];
          let assetsMap = this.getConfigAssetsMap(account.type);
          bs.forEach((item) => {
            let baseAssetMap = assetsMap[item.code + (item.issuer || '')];
            if (baseAssetMap) {
              item.srcLogo = baseAssetMap.logo || '';
              item.srcName = baseAssetMap.name;
            }
          });
          return bs;
        }
        return [];
      }
    },
    methods: {
      show (params) {
        this.pairs = {...params};
        this.resetData();
        this.showPop = true;
      },
      resetData () {
        this.pickerPair = '';
        let account = this.$store.state.account;
        if (account) {
          let assetsMap = this.getConfigAssetsMap(account.type);
          let baseAssetMap = assetsMap[this.pairs.baseCode + (this.pairs.baseIssuer || '')];
          if (baseAssetMap) {
            this.pairs.baseLogo = baseAssetMap.logo || '';
            this.pairs.baseName = baseAssetMap.name;
          }
          let counterAssetMap = assetsMap[this.pairs.counterCode + (this.pairs.counterIssuer || '')];
          if (counterAssetMap) {
            this.pairs.counterLogo = counterAssetMap.logo || '';
            this.pairs.counterName = counterAssetMap.name;
          }
        }
      },
      close () {
        this.showPop = false;
      },
      exchangePair () {
        let tempPairs = {...this.pairs};
        tempPairs.baseCode = this.pairs.counterCode;
        tempPairs.baseIssuer = this.pairs.counterIssuer;
        tempPairs.counterCode = this.pairs.baseCode;
        tempPairs.counterIssuer = this.pairs.baseIssuer;
        tempPairs.baseLogo = this.pairs.counterLogo;
        tempPairs.counterLogo = this.pairs.baseLogo;
        this.pairs = tempPairs;
      },
      sure () {
        this.$collecitons.tradepair.findAndUpdateTradepair({acctType: this.pairs.acctType, acctAddress: this.pairs.acctAddress}, (tradepair) => {
          tradepair.baseCode = this.pairs.baseCode;
          tradepair.baseIssuer = this.pairs.baseIssuer;
          tradepair.counterIssuer = this.pairs.counterIssuer;
          return tradepair.counterCode = this.pairs.counterCode;
        });
        this.$emit('done', this.pairs);
        this.close();
      },
      selectTradepair (type) {
        this.pairType = type;
        if (this.pairType === '1') {
          this.pickerBalances = this.balances.filter((item) => {
            let codeIssuer = item.code + (item.issuer || '');
            return codeIssuer != this.pairs.counterCode + this.pairs.counterIssuer;
          });
        } else if (this.pairType === '2') {
          this.pickerBalances = this.balances.filter((item) => {
            let codeIssuer = item.code + (item.issuer || '');
            return codeIssuer != this.pairs.baseCode + this.pairs.baseIssuer;
          });
        }
        if (this.pickerBalances.length > 0) {
          this.showPicker = true;
        }
      },
      onCancel () {
        this.showPicker = false;
      },
      onConfirm () {
        let pp = this.pickerBalances.filter((item) => {
          return (item.code + item.issuer) === this.pickerPair;
        });
        let assetsMap = this.getConfigAssetsMap(this.$store.state.account.type);
        if (this.pairType === '1') {
          this.pairs.baseLogo = '';
          this.pairs.baseName = '';
          this.pairs.baseCode = pp[0].code;
          this.pairs.baseIssuer = pp[0].issuer || '';
          let baseAssetMap = assetsMap[this.pairs.baseCode + (this.pairs.baseIssuer || '')];
          if (baseAssetMap) {
            this.pairs.baseLogo = baseAssetMap.logo || '';
            this.pairs.baseName = baseAssetMap.name;
          }
        } else if (this.pairType === '2') {
          this.pairs.counterLogo = '';
          this.pairs.counterName = '';
          this.pairs.counterCode = pp[0].code;
          this.pairs.counterIssuer = pp[0].issuer || '';
          let counterAssetMap = assetsMap[this.pairs.counterCode + (this.pairs.counterIssuer || '')];
          if (counterAssetMap) {
            this.pairs.counterLogo = counterAssetMap.logo || '';
            this.pairs.counterName = counterAssetMap.name;
          }
        }
        this.showPicker = false;
      }
    }
  };
</script>
<style lang="scss" scoped>
  @import '~assets/scss/_variables.scss';
  @import "~assets/scss/mixin";
  .border-radius{
    border-radius: $border-radius;
  }
  .padding-left {
    padding-left: 15px;
  }
  .exchange-coin {
    margin: 20px 15px;
    .title {
      padding-left:5px;
      margin-bottom: 10px;
    }
    .select-van-row {
      border: 1px solid $border-color;
      line-height: 30px;
      img {
        width: 30px;
        height: 30px;
        vertical-align: middle;
      }
    }
    .btn {
      margin: 40px 12px 20px;
    }
  }
</style>
