<template>
  <div style="width: 100%;" class="assets-container">
      <van-nav-bar>
        <span slot="left" @click="toScan">
          <i class="ultfont ult-scan"></i>
        </span>
        <span slot="title">
          {{$t('assets.assets')}}
        </span>
        <span slot="right" @click="viewAccounts">
          <i class="ultfont ult-menu"></i>
        </span>
      </van-nav-bar>

    <pl-content-block :offsetTop="46" :offsetBottom="51" ref="contentBlock">
      <van-pull-refresh v-model="isLoading" @refresh="onRefresh" style="min-height: 100%;">
      <van-swipe
        refs="swipe"
        :duration="200"
        :loop="false"
        :height.sync="swipeHeight"
        :show-indicators="false"
        @change="swipeChange" ref="swipe"
        :initial-swipe="index">
        <van-swipe-item v-for="(item, key) in wallets" :key="key" :class="{
          'asset-active': index === key,
          'asset-active-prev': index === key + 1,
          'asset-active-next': index === key - 1,
          'asset-active-prev-1': index === key + 2,
           'asset-active-next-1': index === key - 2
          }">
          <asset-item :data="item" ref="assetItem"
                      @setSwipeHeight="setSwipeHeight"
                      @assetClick="showAssetDetail"
                      @topCardClick="viewAcctDetail"
                      @showQRcode="showQRcode"
                      @addAssets="addAssets"
                      @toTrade = "toTrade"></asset-item>
        </van-swipe-item>
      </van-swipe>
      </van-pull-refresh>
    </pl-content-block>
    <view-accounts ref="viewAccounts" @afterDelAcct="setWallets" @selectWallet="selectWallet" @updateAcct="setWallets()"></view-accounts>
    <assets-add ref="assetsAdd"></assets-add>
    <receive-asset ref="receiveAsset" @scanQrcode="toScan" :short-code="shortCode"></receive-asset>
    <acct-detail ref="acctDetail" @afterDelAcct="setWallets"></acct-detail>
    <asset-detail ref="assetDetail"></asset-detail>
    <send-transaction ref="sendTransaction"></send-transaction>
    <address-add ref="addressAdd"></address-add>
    <trade ref="trade"></trade>

    <van-actionsheet
      v-model="showActions"
      :cancel-text="$t('common.cancelText')"
      :actions="actions"
      @select="onSelect"
    />
  </div>
</template>

<script>
  import assetItem from './asset-item';
  import viewAccounts from './popup/view-accounts-pop';
  import assetDetail from './asset-detail';
  import assetsAdd from './popup/assets-add-pop';
  import receiveAsset from '../ui/receive-asset.vue';
  import acctDetail from '../acct/acct-detail';
  import sendTransaction from '../transaction/send-transaction.vue';
  import addressAdd from '../address/address-add.vue';
  import trade from '../trade/trade';
  import QRCodeScanner from 'core/utils/QRCodeScanner.js';
  import coins from 'src/wallet/coins';
  export default {
    name: 'assets',
    data () {
      return {
        index: 0,
        isLoading: false,
        wallets: [],
        walletIndexMap: {},
        showActions: false,
        shortCode: '',
        swipeHeight: 0
      };
    },
    components: {
      assetItem,
      acctDetail,
      viewAccounts,
      assetsAdd,
      receiveAsset,
      assetDetail,
      sendTransaction,
      addressAdd,
      trade
    },
    computed: {
      actions () {
        return [
          {
            name: this.$t('common.transferAccounts'),
            action: 'transfer'
          },
          {
            name: this.$t('common.addContacts'),
            action: 'addContract'
          }
        ];
      }
    },
    watch: {
      index () {
        if (this.wallets && this.wallets.length> 0 && this.$refs['assetItem'] && this.$refs['assetItem'][this.index]) {
          this.$refs['assetItem'][this.index].setActive();
        }
      }
    },
    methods: {
      shortType (type) {
        return coins[type].symbol || type;
      },
      swipeChange (index) {
        this.index = index;
        if (this.$refs['contentBlock']) {
          setTimeout(() => {
            this.$refs['contentBlock'].$el.scrollTop = 0;
            this.setSwipeHeight();
          }, 300);
        }
      },
      setSwipeHeight () {
        let assetsLen = this.$refs['assetItem'][this.index].assets.length;
        if (assetsLen > 0) {
          this.swipeHeight = (80 + 30)*assetsLen + 66 + 168 - 46;
          if (this.swipeHeight < this.$refs['contentBlock'].$el.offsetHeight) {
            this.swipeHeight = this.$refs['contentBlock'].$el.offsetHeight;
          }
        }
      },
      viewAccounts () {
        this.$refs.viewAccounts.show();
      },
      selectWallet (item) {
        this.$store.dispatch('setAccount' ,item);
        this.index = this.walletIndexMap[item.address];
        this.$refs['swipe'].swipeTo(this.index);
        this.$refs.viewAccounts.close();
      },
      setWallets () {
        this.wallets = this.$collecitons.account.findAllSoryByType();
        this.wallets.forEach((item, index) => {
          this.walletIndexMap[item.address] = index;
        });
        let setting = this.$collecitons.setting.findSetting();
        this.index = this.walletIndexMap[setting.defaultAddress] || 0;
      },
      onRefresh () {
        this.$store.dispatch('setBalances', this.$store.state.account.address).then(() => {
          this.isLoading = false;
        }).catch(err => {
          console.info(err);
          this.isLoading = false;
        });
      },
      onSelect (item) {
        // 点击选项时默认不会关闭菜单，可以手动关闭
        this.showActions = false;
        let asset = {
          code: this.shortType(this.$store.state.account.type)
        };
        switch (item.action) {
          case 'transfer' :
            this.$refs.sendTransaction.show(asset, this.address, this.transferAmt);
            break;
          case 'addContract' :
            this.$refs.addressAdd.show(this.address);
            break;
          default:
            break;
        }
      },
      toScan () {
        QRCodeScanner.scan(this).then((res) => {
          if (res && res.address && res.address !== '') {
            this.address = res.address;
            if (res.transferAmt) {
              this.transferAmt = res.transferAmt;
            }
            this.showActions = true;
          } else {
            this.$toast(this.$t('assets.scanFailTip'));
          }
        }, (errorMsg) => {
          console.log(errorMsg);
          this.$toast(errorMsg);
        });
      },
      showAssetDetail (item) {
        this.$refs.assetDetail.show(item);
      },
      viewAcctDetail () {
        this.$refs.acctDetail.show(this.$store.state.account);
      },
      showQRcode (type) {
        this.shortCode = type;
        this.$refs.receiveAsset.showPopup();
      },
      addAssets () { // 添加资产
        this.$refs.assetsAdd.show(this.assets);
      },
      toTrade () { // 交易
        this.$refs.trade.show();
      }
    },
    activated () {
      let params = this.$route.params;
      if (params && params.refresh) {
        // debugger;
        this.wallets = [];
        this.index = -1;
        this.$nextTick(() => {
          this.setWallets();
        });
        // this.$refs['assetItem'][this.index].setActive();
      }
      if (this.$refs['swipe']) {
        this.$refs['swipe'].onResize();
      }
    },
    mounted () {
      // this.$refs['assetItem'][this.index].setActive();
    },
    created () {
      // this.wallets = [];
      this.setWallets();
    }
  };
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "~assets/scss/variables";
  .assets-container{

  }
</style>
<style lang="scss" rel="stylesheet/scss">
  @import "~assets/scss/variables";
  .assets-container{
    .van-swipe-item{
      position: relative;
      z-index: 3;
    }
    .asset-active-prev {
      z-index: 2;
      .asset-top-card{
        transform: translateX(75px) scale(0.8)!important;
        margin: 0px !important;
      }
    }
    .asset-active {
      z-index: 1;
      .asset-top-card{
        margin: 0px !important;
        transform:  scale(1)!important ;
      }
    }
    .asset-active-next {
      z-index: 2;
      .asset-top-card{
        transform: translateX(-75px) scale(0.8)!important ;
        margin: 0px !important;
      }
    }
    .asset-active-next-1 {
      .asset-top-card{
        transform: translateX(-115px) scale(0.8)!important ;
      }
    }
    .asset-active-prev-1 {
      .asset-top-card{
        transform: translateX(115px) scale(0.8)!important;
      }
    }
  }
</style>
