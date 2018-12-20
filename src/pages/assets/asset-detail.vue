<template>
  <van-popup
    v-model="showPop"
    position="bottom"
    class="popup-wapper"
    style="width:100%;height: 100%;overflow: hidden;">
    <van-nav-bar
      @click-left="close"
      @click-right="toScan">
      <div slot="title">
        <div v-if="asset.name">
          <div style="line-height: 30px;">{{asset.code}}</div>
          <div style="line-height: 15px;margin-top: -4px;" v-if="asset.name !== 'unknown'" class="text-muted small-font">&nbsp;({{asset.name}})</div>
          <div v-else style="line-height: 15px;margin-top: -4px;">
            <pl-wallet-addr  class="small-font text-muted"
                            :complete="false"
                            :address="asset.issuer"  :show-copy="false"></pl-wallet-addr>
          </div>
        </div>
        <div v-else>
          {{asset.code}}
        </div>
      </div>
      <span slot="left"><i class="ultfont ult-left"></i></span>
      <span slot="right"><i class="ultfont ult-scan"></i></span>
    </van-nav-bar>

    <pl-content-block :offsetTop="46" :offsetBottom="45" ref="contentBlock">
      <pull-refresh v-model="isLoading" :animation-duration = animationDuration @refresh="onRefresh" ref="pullRefresh" style="min-height: 100%;">
        <pl-content-block :offsetTop="46" :offsetBottom="45" heightType="minHeight" style="overflow-y: hidden;">
          <div class="asset-blc text-center item-block">
            <img v-if="asset.logo" :src="asset.logo" style="width:36px;height: 36px;">
            <img v-else-if="asset.code === 'XRP'" :src="`static/img/${asset.code}-1@3x.png`" style="width:36px;height: 36px;"/>
            <img v-else :src="`static/img/${asset.code}@3x.png`" style="width:36px;height: 36px;" onerror="this.src='static/img/unknown.png'"/>
            <p class="x-x-large-font text-main" style="line-height: 45px;">{{balance | currency('', '8') | cutTail}}</p>
            <p class="small-font text-primary" style="line-height: 20px;">≈&nbsp;{{balance | market(asset.code, asset.issuer)}}</p>
          </div>
          <tx-history :asset="asset" v-if="showPop" class="margin-top" ref="rxHistory" @showDetail="showDetail" @addAddress="addAddress"></tx-history>
        <!--</div>-->
          </pl-content-block>
      </pull-refresh>
    </pl-content-block>
    <pl-stick :offset-bottom="0">
      <van-row class="van-hairline--top" v-if="isStellar">
        <van-col span="8">
          <van-button  size="large" class="plat-btn" type="default" @click.native="receiveAsset" v-text="$t('common.receivables')"></van-button>
        </van-col>
        <van-col span="8">
          <van-button  size="large" class="plat-btn" type="gray" @click.native="exchange" v-text="$t('common.exchange')"></van-button>
        </van-col>
        <van-col span="8">
          <van-button  size="large" class="plat-btn" type="primary" @click.native="transfer" v-text="$t('common.transferAccounts')"></van-button>
        </van-col>
      </van-row>
      <van-row class="van-hairline--top" v-else>
        <van-col span="12">
          <van-button  size="large" class="plat-btn" type="default" @click.native="receiveAsset" v-text="$t('common.receivables')"></van-button>
        </van-col>
        <van-col span="12">
          <van-button  size="large" class="plat-btn" type="primary" @click.native="transfer" v-text="$t('common.transferAccounts')"></van-button>
        </van-col>
      </van-row>
    </pl-stick>
    <receive-asset ref="receiveAsset"  @scanQrcode="toScan" :short-code="asset.code" :nav-title="reNavTitle" :can-change-asset="false"></receive-asset>
    <send-transaction ref="sendTransaction" @done="onRefresh"></send-transaction>
    <tx-detail ref="txDetail"></tx-detail>
    <address-add ref="addressAdd"></address-add>
    <stellar-exchange ref="stellarExchange"></stellar-exchange>
  </van-popup>
</template>
<script>
  import receiveAsset from '../ui/receive-asset.vue';
  import sendTransaction from '../transaction/send-transaction';
  import txHistory from '../history/tx-history';
  import txDetail from '../history/tx-detail';
  import stellarExchange from '../exchange/stellar-exchange';
  import addressAdd from '../address/address-add';
  import QRCodeScanner from 'core/utils/QRCodeScanner.js';
  import pullRefresh from './mixns/pull-refresh.js';
  import {AccountType} from 'src/wallet/constants';

  export default{
    components: {
      receiveAsset,
      sendTransaction,
      txHistory,
      txDetail,
      pullRefresh,
      addressAdd,
      stellarExchange
    },
    data () {
      return {
        showPop: false,
        asset: {},
        tabActive: 0,
        isLoading: false,
        animationDuration: 300
      };
    },
    computed: {
      balance () {
        return this.getBalance(this.asset.code, this.asset.issuer).value;
      },
      reNavTitle () {
        return this.asset.code + this.$t('common.receivables');
      },
      isStellar () { // 是否是恒星账户
        if (this.$store.state.account.type === AccountType.stellar) {
          return true;
        }
        return false;
      }
    },
    methods: {
      addAddress (address) {
        this.$refs.addressAdd.show(address);
      },
      showDetail (item) {
        this.$refs.txDetail.show(item);
      },
      changeTab () {
        if (this.$refs.list) {
          this.$refs.list.reload();
        }
      },
      show (asset) {
        if (this.$refs.list) {
          this.$refs.list.reload();
        }
        this.asset = asset;

        if (this.$refs['contentBlock']) {
          setTimeout(() => {
            this.$refs['contentBlock'].$el.scrollTop = 0;
          }, 300);
        }
        this.showPop = true;
        setTimeout(() => {
          this.$refs['contentBlock'].$el.onscroll = () => {
            if (this.$refs['contentBlock'].$el.scrollTop > 0) {
              this.animationDuration = 0;
            } else {
              this.animationDuration = 300;
            }
          };
        }, 800);
      },
      onRefresh () {
        this.isLoading = true;
        if (this.$refs['rxHistory']) {
          this.$refs['rxHistory'].getHistory();
        }
        this.$store.dispatch('setBalances', this.$store.state.account.address).then(() => {
          this.isLoading = false;
        }).catch(err => {
          console.info(err);
          this.isLoading = false;
        });
      },
      removeStyle () {
        if (this.$refs['pullRefresh']) {
          this.$refs['pullRefresh'].$el.querySelector('.van-pull-refresh__track').style = '';
        }
      },
      close () {
        this.showPop = false;
      },
      transfer () {
        this.$refs.sendTransaction.show(this.asset);
      },
      exchange () {
        this.$refs.stellarExchange.show(this.asset);
      },
      toScan () {
        QRCodeScanner.scan(this).then((res) => {
          if (res && res.address && res.address !== '') {
            this.$refs.sendTransaction.show(this.asset, res.address, res.transferAmt);
          } else {
            this.$toast(this.$t('assets.scanFailTip'));
          }
        }, (errorMsg) => {
          this.$toast(errorMsg);
        });
      },
      receiveAsset () {
        this.$refs.receiveAsset.showPopup(this.assetCode);
      }
    }
  };
</script>
<style lang="scss" scoped>
  .asset-blc{
    .blc-main{
      padding-bottom: 20px;
    }
    padding: 20px 0 10px;
    background: #fff;
  }
  .detail-card{
    background: #fff;
    .detail-card-col{
      height: 70px;
      line-height: 70px;
      .detail-card-line{
        line-height: 25px;
        height: 25px;
      }
    }
  }
</style>
