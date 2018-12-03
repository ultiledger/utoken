<template>
  <gesture-pwd ref="gesturePwd" @saveGesturePwd="saveGesturePwd" :check-fun="checkGesturePwdExist" :validate-fun="validateGesturePwd" :can-close="canClose" @unlock="close"></gesture-pwd>
</template>
<script>
  import gesturePwd from '../../ui/gesture-password.vue';
  export default{
    data () {
      return {
        clearPwd: ''
      };
    },
    props: {
      canClose: {
        type: Boolean,
        default: true
      }
    },
    components: {
      gesturePwd
    },
    methods: {
      saveGesturePwd (pwd) {
        this.$collecitons.setting.updateSetting((setting) => {
          setting.gesturePwd = pwd;
        });
        this.$store.dispatch('setGesturePwd', pwd);
        this.$refs.gesturePwd.closePopup();
      },
      checkGesturePwdExist () {
        let setting = this.$collecitons.setting.findSetting();
        return new window.Promise((resolve) => {
          resolve(setting.gesturePwd);
        });
      },
      validateGesturePwd (pwd) {
        let setting = this.$collecitons.setting.findSetting();
        return new window.Promise((resolve) => {
          resolve(pwd === setting.gesturePwd);
        });
      },
      close () {
        this.$refs.gesturePwd.closePopup();
        if (this.clearPwd) {
          this.$collecitons.setting.updateSetting((setting) => {
            setting.gesturePwd = '';
          });
          this.$store.dispatch('setGesturePwd', '');
        }
      },
      show (clearPwd) {
        this.clearPwd = clearPwd;
        this.$refs.gesturePwd.showPopup();
      }
    }
  };
</script>
