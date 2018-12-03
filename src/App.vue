<template>
  <div id="app" style="height: 100%;">
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <gesture-pwd-pop ref="gesturePwdPop" :can-close="false"></gesture-pwd-pop>
    <update-dialog :check-update-url="updateUrl"></update-dialog>
  </div>
</template>
<script>
import gesturePwdPop from './pages/setting/popup/gesture-pwd-pop';
import updateDialog from './pages/ui/update-dialog';
import config from './config.js';
// import backbuttonHandler from 'core/utils/backbuttonHandler';
export default {
  components: {
    gesturePwdPop,
    updateDialog
  },
  data () {
    return {
      updateUrl: config.updateUrl
    };
  },
  created () {
    this.$nextTick(() => {
      if (window.navigator && window.navigator.splashscreen) {
        window.setTimeout(() => {
          window.navigator.splashscreen.hide(); // 隐藏启动页面
        }, 500);
      }
      if (this.$store.state.setting.gesturePwd && this.$refs.gesturePwdPop) {
        this.$refs.gesturePwdPop.show();
      }
    });
  },
  methods: {
    // backbuttonHandler () {
    //   backbuttonHandler.handleBackbuttonEvent();
    // }
  }
};
</script>

<style>
  html, body {
    height: 100%;
    width: 100%;
    overflow-x: hidden;
  }
</style>
