
<template>
  <van-popup v-model="show" style="width: 76%;" class="border-radius" :close-on-click-overlay="false">
    <div class="container">
      <img :src="dprImg(`logo1.png`)" alt="logo" class="update-logo">
      <div class="title normal-font">{{$t('setting.version')}}&nbsp;V{{newVersion.tag_name}}</div>
      <div class="desc van-hairline--bottom small-font" v-html="updateDesc">
      </div>
      <van-row>
        <van-col span="12" class="btn cancel-btn" @click.native="cancel">{{$t('setting.nextTime')}}</van-col>
        <van-col span="12" class="btn update-btn" @click.native="update">{{$t('setting.updateNow')}}</van-col>
      </van-row>
    </div>
  </van-popup>
</template>

<script>
import updateUtil from 'core/utils/update.js';
import config from '../../config.js';
export default {
  props: {
    checkUpdateUrl: String, // 检查更新地址
    autoShow: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      show: false,
      newVersion: {},
      updateDesc: ''
    };
  },
  methods: {
    update () {
      // 有更新
      window.location.href = config.officialWebsite;
      /* if (window.device.platform === 'iOS') { // iOS跳转到官网

        return;
      } */
      // let downloadUrl = this.newVersion.assets[0].browser_download_url;
      /* let downloadUrl = config.downloadUrl;
      let targetPath = 'cdvfile://localhost/persistent/Utoken.apk';
      if (window.device.version.toString().replace(/\./g, '').substring(0, 1) < 6) {
        targetPath = window.cordova.file.externalRootDirectory + '/Utoken.apk';
      }
      this.show = false;
      updateUtil.downloadAndInstall(this, downloadUrl, targetPath).then(() => {
        // 安装成功
      }, (errMsg) => {
        if (errMsg) {
          this.$toast(errMsg);
        }
        window.location.href = downloadUrl;
      }); */
    },
    cancel () {
      this.show = false;
    },
    showUpdateDialog () {
      this.checkUpdate(true);
    },
    checkUpdate (showDialog) {
      // 检查更新
      if (!(window.device && window.cordova.getAppVersion)) {
        // this.$toast('检查更新失败，请联系客服！');
        return;
      }
      updateUtil.checkUpdate(this, this.checkUpdateUrl).then( (newVersion) => {
        this.newVersion = newVersion;
        let el = document.createElement( 'html' );
        let language = this.$store.state.setting.language;
        el.innerHTML = newVersion.body;
        let desc = el.getElementsByClassName(language);
        if (desc && desc.length > 0) {
          this.updateDesc = desc[0].outerHTML;
        } else {
          this.updateDesc = newVersion.body;
        }
        if (showDialog) {
          this.show = true;
        }
      }, (errorMsg) => {
        if (errorMsg) {
          throw new Error(errorMsg);
        }
      }).catch((err) => {
        if (err) {
          throw new Error(err);
        }
      });
    }
  },
  mounted () {
    this.checkUpdate(this.autoShow);
  }
};
</script>
<style scoped lang="scss">
  @import '~assets/scss/_variables.scss';
  .border-radius{
    border-radius: $border-radius;
  }
  .container{
    position: relative;
    text-align: center;
    padding: 0;
    .update-logo{
      max-width: 90px;
      margin-top: 18px;
      margin-bottom: 4px;
    }
    .title{
      font-weight: 600;
    }
    .desc{
      padding: 14px;
      text-align: left;
      color: #AEB0B2;
    }
    .btn{
      padding: 14px 0;
      &.update-btn{
        color: #fff;
        background-image: radial-gradient(circle at left top, $primay-gradient-light, $primay-gradient);
      }
      &.cancel-btn{
        color: $black-gray;
        background: $main-background-color;
      }
    }
  }
</style>
