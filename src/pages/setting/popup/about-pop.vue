<template>
  <van-popup
    v-model="showVpop"
    position="bottom"
    class="popup-wapper"
    style="height: 100%;width: 100%;"
  >
    <van-nav-bar
      left-arrow
      :title="$t('setting.aboutUs')"
      @click-left="close">
      <span slot="left"><i class="ultfont ult-left"></i></span>
    </van-nav-bar>

    <div class="top-container text-center">
      <img :src="dprImg(`logo1.png`)" style="width: 200px;padding-bottom: 10px;" alt="Logo"/>
      <p class="gray-text">{{$t('setting.version')}}&nbsp;{{curVersionCode}}</p>
      <p class="gray-text margin-top">{{$t('setting.walletDesc')}}</p>
    </div>

    <van-cell-group class="margin-top item-block">
      <van-cell :title="$t('setting.newVersion')" @click.native="showUpdateDialog">
        <span v-if="versionCode && versionCode !== ''">
          <span class="new-dot"></span>&nbsp;v{{versionCode}}
        </span>
        <span v-else>
          {{$t('setting.latestVersion')}}
        </span>
      </van-cell>
      <van-cell :title="$t('setting.officialNetwork')" @click.native="toOfficialNet">
        <span class="text-primary">
          utoken.cash
        </span>
      </van-cell>
    </van-cell-group>
    <update-dialog :check-update-url="updateUrl" :auto-show="false" ref="updateDialog"></update-dialog>
  </van-popup>
</template>
<script>
  import updateDialog from '../../ui/update-dialog.vue';
  import config from '../../../config.js';
  export default {
    data () {
      return {
        showVpop: false,
        versionCode: '',
        updateUrl: config.updateUrl,
        curVersionCode: '1.0.0'
      };
    },
    components: {
      updateDialog
    },
    methods: {
      close () {
        this.showVpop = false;
      },
      show () {
        this.showVpop = true;
      },
      showUpdateDialog () {
        this.$refs.updateDialog.showUpdateDialog();
      },
      toOfficialNet () {
        window.location.href = config.officialWebsite;
      }
    },
    created () {
      this.$api.checkUpdate(this.updateUrl).then((newVersionInfo) => {
        this.versionCode = newVersionInfo.tag_name.toString();
      });
      if (!(window.cordova && window.cordova.getAppVersion)) {
        return;
      }
      window.cordova.getAppVersion.getVersionNumber().then( (version) => {
        this.curVersionCode = version;
      });
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
.top-container{
  padding: 20px 0;
  margin-top: 80px;
}
.new-dot{
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 100%;
  background: red;
}
</style>
