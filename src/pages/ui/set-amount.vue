<template>
  <van-popup
    v-model="showPop"
    class="popup-wapper"
    style="height: 100%;width: 100%;"
  >
    <van-nav-bar
      :title="$t('assets.setReceivablesAmt')"
      @click-left="close"
    >
      <span slot="left"><i class="ultfont ult-left"></i></span>
    </van-nav-bar>
    <div class="b-white padding set-amount border-radius">
      <div class="title" v-text="$t('scan.transferAmt')"></div>
      <van-field
        type="number"
        ref="amountInput"
        class="large-font text-primary"
        style="padding-left: 20px;"
        v-model="amount"
        :placeholder="$t('scan.transferAmtPlaceholder')">
        <span slot="right-icon" class="text-main large-font">{{coinType}}</span>
      </van-field>
      <div class="btn">
        <van-button size="large" round type="primary" @click="sure()" :text="$t('common.sure')"></van-button>
      </div>
    </div>
    <van-number-keyboard
      :show="showKeyboard"
      theme="custom"
      extra-key="."
      :close-button-text="$t('common.complete')"
      @close="closeKeyboard"
      @input="onInput"
      @delete="onDelete"
    />
  </van-popup>
</template>
<script>
  export default {
    data () {
      return {
        showPop: false,
        showKeyboard: false,
        amount: '',
        coinType: ''
      };
    },
    methods: {
      show (coinType) {
        this.amount = '';
        this.coinType = coinType;
        this.showPop = true;
        this.$nextTick(() => {
          this.$refs['amountInput'].$refs['input'].focus();
        });
      },
      close () {
        this.showPop = false;
      },
      inputFocus () {
        // document.activeElement.blur();
        this.showKeyboard = true;
      },
      inputBlur () {
        this.showKeyboard = false;
      },
      onInput (value) {
        this.amount += value;
      },
      closeKeyboard () {
        this.showKeyboard = false;
      },
      onDelete () {
        this.amount = this.amount.slice(0, this.amount.length - 1);
      },
      sure () {
        // 校验是否是数字
        let reg = /^[0-9]+.?[0-9]*$/; //判断字符串是否为数字 //判断正整数 /^[1-9]+[0-9]*]*$/
        if (this.amount && !reg.test(this.amount)) {
          this.$toast(this.$t('scan.inputIllegal'));
        } else {
          setTimeout(() => {
            this.$emit('done', this.amount);
            this.close();
          }, 300);
        }
      }
    }
  };
</script>
<style lang="scss" scoped>
  @import 'src/assets/scss/_variables.scss';
  .border-radius{
    border-radius: $border-radius;
  }
  .set-amount {
    margin: 20px 15px;
    .title {
      margin-left: 12px;
      margin-right: 12px;
      padding-top: 6px;
      padding-bottom: 18px;
    }
    .btn{
      margin: 40px 12px 20px;
    }
}
</style>
