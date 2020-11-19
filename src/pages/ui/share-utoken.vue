<template>
  <van-popup v-model="show" position="bottom" :overlay="true">
    <div class="title text-info"><span class="title-text">{{$t('setting.shareTo')}}</span></div>
    <van-row>
      <van-col span="12" class="share-icon" @click.native="shareToWechat">
        <i class="ultfont ult-wechat text-success"></i><br>
        {{$t('setting.wechatFriend')}}
      </van-col>
      <van-col span="12" class="share-icon" @click.native="shareToQQ">
        <i class="ultfont ult-qq text-info"></i><br>
        QQ
      </van-col>
    </van-row>
  </van-popup>
</template>
<script>
  import config from '../../config.js';
  export default{
    data () {
      return {
        show: false
      };
    },
    methods: {
      showPopup () {
        this.show = true;
      },
      closePopup () {
        this.show = false;
      },
      share (clientType, platformType, shareType, shareInfo) {
        window.sharesdk.isInstallClient.promise(clientType).then((isInstall) => {
          if (isInstall) {
            window.sharesdk.share(platformType,
                                  shareType, shareInfo,
                                  (success) => {
                                    this.$toast('分享成功：' + success);
                                  },
                                  (fail) => {
                                    if (fail.state != window.ShareSDK.ResponseState.Cancel) {
                                      this.$toast('分享失败：' + fail.error);
                                    }
                                  });
          } else {
            if (clientType === window.ShareSDK.ClientType.Wechat) {
              this.$toast(this.$t('scan.shareWeiXinFail'));
            } else if (clientType === window.ShareSDK.ClientType.QQ) {
              this.$toast(this.$t('scan.shareQQFail'));
            }
          }
        });
      },
      shareToWechat () {
        if (!window.sharesdk) {
          this.$toast(this.$t('scan.equipmentType'));
          return;
        }
        let shareType = window.ShareSDK.ShareType.WebPage;
        let self = this;
        let shareInfo = {title: self.$t('setting.shareTitle'), text: self.$t('setting.shareTip'), url: config.officialWebsite};
        this.share(window.ShareSDK.ClientType.Wechat, window.ShareSDK.PlatformType.WechatSession, shareType, shareInfo);
      },
      shareToQQ () {
        if (!window.sharesdk) {
          this.$toast(this.$t('scan.equipmentType'));
          return;
        }
        let shareType = window.ShareSDK.ShareType.WebPage;
        let self = this;
        let shareInfo = {title: self.$t('setting.shareTitle'), text: self.$t('setting.shareTip'), url: config.officialWebsite};
        this.share(window.ShareSDK.ClientType.QQ, window.ShareSDK.PlatformType.QQFriend, shareType, shareInfo);
      }
    }
  };
</script>
<style lang="scss" scoped>
  @import '~assets/scss/_variables.scss';
  .share-icon{
    text-align: center;
    padding: 0px 0 15px;
    i{
      font-size: 2.2em;
    }
  }
  .title{
    margin-top: 15px;
    text-align: center;
    position: relative;
    .title-text{
      display: inline-block;
      padding: 10px;
      background: #fff;
    }
    &:after{
      content: '';
      display: inline-block;
      width: 90%;
      height: 2px;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      left: 5%;
      background: $info-color;
      z-index: -1;
    }
  }
</style>
