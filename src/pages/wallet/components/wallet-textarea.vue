<template>
  <div class="wallet-textarea">
    <wallet-tip :tip="tip"></wallet-tip>
    <div class="textarea item-block">
      <van-cell-group :border="false">
        <van-field
          v-model="text"
          type="textarea"
          autosize
          :placeholder="placeholder"
        />
      </van-cell-group>
    </div>
  </div>
</template>
<script>
  import walletTip from './wallet-tip';
  export default {
    components: {walletTip},
    props: {
      type:String,
      tip: String,
      value: String,
      placeholder: String
    },
    watch: {
      value (val) {
        if (val && this.type==="privateKey"){
          val = val.trim();
        }
        this.text = val;
      },
      text (val) {
        this.$emit('input', val);
      }
    },
    data () {
      return {
        text: this.value
      };
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss">
  .wallet-textarea {
    .textarea {
      padding: 0px;
      margin-top: 0px;
      margin-bottom: 0px;
      .van-cell-group {
        border-radius: 10px;
        .van-cell {
          border-radius: 10px;
        }
      }
      .van-hairline--top-bottom::after{
        border-width: 0px;
      }
      .van-field__body{
        .van-field__control{
          padding: 10px!important;
        }
      }
    }
  }
</style>
