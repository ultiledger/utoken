<template>
  <van-popup v-model="show" style="width: 100%;height: 100%;" position="bottom">
    <van-nav-bar
      :title="$t('setting.userProtocol')"
      @click-left="closePopup">
      <span slot="left"><i class="ultfont ult-left"></i></span>
    </van-nav-bar>
    <pl-content-block :offsetTop="46" :offsetBottom="0" >
      <iframe :src="protocolUrl" width="100%" :height="height" style="border: none;"></iframe>
    </pl-content-block>
  </van-popup>
</template>
<script>
  export default{
    data () {
      return {
        show: false,
        height: 0,
        protocolUrl: 'static/protocol/utoken-protocol-zh-CN.htm'
      };
    },
    methods: {
      closePopup () {
        this.show = false;
      },
      showPopup () {
        this.protocolUrl = `static/protocol/utoken-protocol-${this.$store.state.setting.language}.htm`;
        this.setHeight();
        this.show = true;
      },
      setHeight () {
        this.height = document.documentElement.clientHeight - 46 + 'px';
      }
    }
  };
</script>
<style lang="scss" scoped>
  .protocol-content{
    overflow-x: hidden;
    max-width: 100%;
    white-space:pre-wrap;
    white-space:-moz-pre-wrap;
    white-space:-pre-wrap;
    white-space:-o-pre-wrap;
    word-wrap:break-word;
  }
</style>
