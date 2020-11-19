<template>
  <van-popup v-model="show" class="receive-container" @click.self.native="closePopup" :overlay="false" :overlay-style="{'background': 'rgba(39, 51, 50, 0.9)'}">
    <van-nav-bar
      :title="barTitle"
      style="background: transparent;color: #fff;border: none;"
      class="no-border"
      @click-left="closePopup"
      @click-right="toScan"
    >
      <span slot="left"><i class="ultfont ult-left"></i></span>
      <span slot="right"><i class="ultfont ult-scan"></i></span>
    </van-nav-bar>
    <div class="card">
      <div class="header text-center" :class="`${$store.state.account.type}-bg`">
        <p class="big-font">{{$store.state.account.name}}</p>
        <pl-wallet-addr class="small-font" :address="address"></pl-wallet-addr>
      </div>
      <div class="qrcode-container text-center">
        <div class="small-font" style="padding: 15px 0 10px;">{{$t('scan.scanQrCode')}}<b class="normal-font text-primary">&nbsp;{{assetCode}}</b></div>
        <div v-if="transferAmt" style="margin-bottom: 5px;">{{transferAmt}}&nbsp;&nbsp;{{shortCode}}</div>
        <qrcode @click.native="toCopyAddress" class="qrcode" :value="qrCodeText" :options="{ width: 200 }"></qrcode>
        <p class="small-font" v-text="$t('scan.copyQrCodeAddress')"></p>
      </div>
      <div class="footer van-hairline--top">
        <van-row>
          <van-col
            :span="24"
            class="text-center padding text-primary"
            @click.native="toSetAmt">{{$t('common.setAmt')}}</van-col>
         <!-- <van-col span="24" v-if="setAmt" class="text-center padding text-primary">
            <van-field
              v-model="transferAmt"
              type="number"
              name="transferAmt"
              :placeholder="$t('scan.transferAmtPlaceholder')"
              class="normal-font">
                &lt;!&ndash;<span slot="button" class="small-font">取消</span>&ndash;&gt;
                <i class="ultfont ult-close-circle" slot="button" @click="transferAmt = '';setAmt = false"></i>
            </van-field>
          </van-col>-->
        </van-row>
      </div>
    </div>
    <div class="share text-center text-primary" @click="showShareActions = true" v-if="!canChangeAsset">{{$t('scan.shareReceiptCode')}}</div>

    <van-action-sheet
      :overlay="true"
      v-model="showShareActions"
      :cancel-text="$t('common.cancelText')"
      :actions="shareActions"
      @select="onShare"
    />
    <set-amount ref="setAmount" @done="setAmt"></set-amount>
  </van-popup>
</template>
<script>
  import qrcode from '@chenfengyuan/vue-qrcode';
  import setAmount from './set-amount';
  // import coins from 'src/wallet/coins';
  export default {
    props: {
      canChangeAsset: {
        type: Boolean,
        default: true
      },
      navTitle: {
        type: String,
        default: () => {
          return '';
        }
      },
      shortCode: {
        type: String,
        default: ''
      }
    },
    data () {
      return {
        show: false,
        assetCode: '',
        transferAmt: '',
        showShareActions: false
      };
    },
    components: {
      qrcode,
      setAmount
    },
    computed: {
      shareActions () {
        return [
          {
            name: this.$t('scan.shareWeiXin'),
            action: 'wechat'
          },
          {
            name: this.$t('scan.shareQQ'),
            action: 'QQ'
          }
        ];
      },
      address () {
        if (this.$store.state.account && this.$store.state.account.address) {
          return this.$store.state.account.address;
        }
        return '';
      },
      qrCodeText () {
        if (this.transferAmt && this.transferAmt !== '') {
          //console.info(`address=${this.address}&transferAmt=${this.transferAmt}`);
          return `address=${this.address}&transferAmt=${this.transferAmt}`;
        } else {
          return this.address;
        }
      },
      barTitle () {
        return this.shortCode + ' ' + this.$t('common.receivables');
      }
    },
    methods: {
      showPopup (assetCode) {
        this.transferAmt = '';
        this.assetCode = assetCode;
        this.show = true;
      },
      /*shortType () {
        let type = this.$store.state.account.type;
        return coins[type].symbol || type;
      },*/
      toScan () {
        this.$emit('scanQrcode');
      },
      closePopup () {
        this.show = false;
      },
      toCopyAddress () {
        this.$copyText(this.address).then(() => {
          this.$toast(this.$t('common.copySuccess'));
        }, () => {
          this.$toast(this.$t('common.copyFail'));
        });
      },
      toSetAmt () {
        this.$refs.setAmount.show(this.shortCode);
      },
      setAmt (val) {
        this.transferAmt = val;
      },
      onShare (item) {
        this.showShareActions = false;
        let self = this;
        let shareInfo = {text: self.address};
        if (!window.sharesdk) {
          this.$toast(this.$t('scan.equipmentType'));
          return;
        }
        switch (item.action) {
          case 'wechat' : {
            window.sharesdk.isInstallClient.promise(window.ShareSDK.ClientType.Wechat).then((isInstall) => {
              if (isInstall) {
                window.sharesdk.share(window.ShareSDK.PlatformType.WechatSession,
                                      window.ShareSDK.ShareType.Text, shareInfo,
                                      (success) => {
                                        this.$toast('分享成功：' + success);
                                      },
                                      (fail) => {
                                        if (fail.state != window.ShareSDK.ResponseState.Cancel) {
                                          this.$toast('分享失败：' + fail.error);
                                        }
                                      });
              } else {
                this.$toast(this.$t('scan.shareWeiXinFail'));
              }
            });
            break;
          }
          case 'QQ' : {
            window.sharesdk.isInstallClient.promise(window.ShareSDK.ClientType.QQ).then((isInstall) => {
              if (isInstall) {
                window.sharesdk.share(window.ShareSDK.PlatformType.QQFriend,
                                  window.ShareSDK.ShareType.Text, shareInfo,
                                  (success) => {
                                    this.$toast('分享成功：' + success);
                                  },
                                  (fail) => {
                                    if (fail.state != window.ShareSDK.ResponseState.Cancel) {
                                      this.$toast('分享失败：' + fail.error);
                                    }
                                  });
              } else {
                this.$toast(this.$t('scan.shareQQFail'));
              }
            });
            break;
          }
          default:
            break;
        }
      }
    }
  };
</script>
<style lang="scss" scoped>
  @import '~assets/scss/_variables.scss';
  .receive-container{
    height: 100%;
    width: 100%;
    background: rgba(0,0,0,0.9);
  }
  .card{
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 86%;
    background: #fff;
    /*z-index: 99999;*/
    border-radius: $border-radius;
    .header{
      padding: 10px;
      color: #fff;
  /*    background: $primary-color;*/
      border-radius: $border-radius $border-radius 0 0;
    }
  }
  .share{
    position: fixed;
    bottom: 10px;
    width: 100%;
  }
</style>
