<template>
  <span class="addr-container" >
    <span @click.stop="copyAddr" v-if="showCopy">
      <span v-if="complete" class="address-text">
        {{address}}&nbsp;<i class="ultfont ult-block" style="font-size: 1.1em;"></i>
      </span>
      <span v-else class="address-text">
        {{address | longStrAbbr(length)}}&nbsp; <i class="ultfont ult-block" style="font-size: 1.1em;"></i>
      </span>
      <!--<span>-->
        <!--<i class="ultfont ult-block"></i>-->
      <!--</span>-->
    </span>
    <span v-else>
      <span v-if="complete" class="address-text">
        {{address}}&nbsp;
      </span>
      <span v-else class="address-text">
        {{address | longStrAbbr(length)}}&nbsp;
      </span>
    </span>
  </span>
</template>
<script>
  import config from '../config';
  export default{
    name: config.prefix + 'WalletAddr',
    props: {
      showCopy: { // 是否显示复制按钮
        type: Boolean,
        default: true
      },
      complete: { // 是否全部显示
        type: Boolean,
        default: false
      },
      address: { // 钱包地址
        type: String,
        default: '',
        required: true
      },
      length: { // 地址前后显示的数字长度
        type: Number,
        default: 8
      }
    },
    data () {
      return {};
    },
    methods: {
      copyAddr () {
        if (!this.showCopy) {
          return;
        }
        this.$copyText(this.address).then(() => {
          this.$toast(this.$t('common.copySuccess'));
        }, () => {
          this.$toast(this.$t('common.copyFail'));
        });
      }
    }
  };
</script>
<style lang="scss">
  .addr-container{
    width: 100%;
    bakground: transparent;
    .address-text{
      display: inline-block;
      /*width: 100%;*/
      word-break: break-all;
      vertical-align: middle;
    }
  }
</style>
