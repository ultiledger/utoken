<template>
  <van-popup v-model="showPop" style="width: 100%;height: 100%;" position="bottom">
    <van-nav-bar
      :title="title"
      @click-left="closePopup">
      <span slot="left"><i class="ultfont ult-left"></i></span>
    </van-nav-bar>
    <pl-content-block :offsetTop="46" :offsetBottom="0" >
      <iframe :src="helpUrl" width="100%" :height="height" style="border: none;"></iframe>
    </pl-content-block>
  </van-popup>
</template>
<script>
  export default{
    data () {
      return {
        showPop: false,
        height: 0,
        helpUrl: '',
        title: ''
      };
    },
    methods: {
      closePopup () {
        this.showPop = false;
      },
      show (item) {
        if (item === 'mnemonic') {
          this.title = this.$t('wallet.whatIsMnemonic');
        } else if (item == 'private-key') {
          this.title = this.$t('wallet.whatIsPrivateKey');
        }
        this.helpUrl = `static/help/${item}-help-${this.$store.state.setting.language}.htm`;
        this.setHeight();
        this.showPop = true;
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
