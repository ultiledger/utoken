<template>
  <van-popup
    v-model="showPop"
    position="bottom"
    class="popup-wapper"
    style="width:100%;height: 100%;">
  <div style="width: 100%;" class="transfer-container">
    <van-nav-bar
      :title="asset.code + '转账'"
      @click-left="close()">
      <div slot="title">
        <div v-if="asset.name">
          <div style="line-height: 30px;">{{asset.code}}&nbsp;转账</div>
          <div style="line-height: 15px;" class="text-muted small-font">&nbsp;({{asset.name}})</div>
        </div>
        <div v-else>
          {{asset.code}}&nbsp;转账
        </div>
      </div>
      <span slot="left"><i class="ultfont ult-left"></i></span>
      <span slot="right"><i class="ultfont ult-scan" @click="toScan"></i></span>
    </van-nav-bar>
  </div>
    <component :is="sendType" ref="component" :asset="asset" :transfer-amt="transferAmt" :address="address"  @done="close"></component>
  </van-popup>
</template>
<script>
  import {AccountType} from '../../wallet/constants';
  import sendEthereum from './send-ethereum';
  import sendStellar from './send-stellar';
  import sendRipple from './send-ripple';
  import sendBitcoin from './send-bitcoin';
  import QRCodeScanner from 'core/utils/QRCodeScanner.js';

  export default{
    data () {
      return {
        showPop: false,
        asset: {},
        loading: false,
        address: '',
        transferAmt: ''
      };
    },
    components: {
      [AccountType.ethereum]: sendEthereum,
      [AccountType.stellar]: sendStellar,
      [AccountType.ripple]: sendRipple,
      [AccountType.bitcoin]: sendBitcoin
    },
    computed: {
      sendType () {
        if (this.$store.state.account.type) {
          return this.$store.state.account.type;
        }
        return '';
      }
    },
    methods: {
      show (asset, address, transferAmt) {
        this.asset = asset;
        if (address && address !== '') {
          this.address = address;
        } else {
          this.address = '';
        }
        if (transferAmt && transferAmt !== '') {
          this.transferAmt = transferAmt;
        } else {
          this.transferAmt = '';
        }
        this.$nextTick(() => {
          if (this.$refs['component']) {
            this.$refs['component'].init();
          }
        });
        this.showPop = true;
      },
      close () {
        this.showPop = false;
      },
      toScan () {
        QRCodeScanner.scan(this).then((res) => {
          if (res && res.address && res.address !== '') {
            this.address = res.address;
            if (res.transferAmt) {
              this.transferAmt = res.transferAmt;
            }
            this.$nextTick(() => {
              if (this.$refs['component']) {
                this.$refs['component'].init();
              }
            });
            // this.assetCode = QRCodeScanner.getAssetCodeByAddress(res);
            // if (this.assetCode && this.assetCode !== '') {
            //   if (this.$refs['component']) {
            //     this.$refs['component'].init();
            //   }
            //   return;
            // }
            // this.$toast('Not invalid address!');
          } else {
            this.$toast('非钱包地址，请重新扫描');
          }
        }, (errorMsg) => {
          this.$toast(errorMsg);
        });
      }
    }
  };
</script>
<style lang="scss">
</style>
