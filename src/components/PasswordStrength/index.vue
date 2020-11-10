<template>
  <van-field
    class="password-strength"
    maxlength="50"
    v-model="password"
    @focus="inputFocus"
    :type="type"
    :data-vv-as="dataVvAs"
    :placeholder="placeholder"
    :v-validate="vValidate"
    :name="name"
    @click-right-icon="clickIcon">
    <div slot="right-icon" class="strength-wrapper" v-if="rankText">
      <div class="rule-item-text text-right small-font">{{rankText}}</div>
      <div class="rule-item"
           v-for="(item, index) in rules"
           :key="index"
           :style="{backgroundColor:selectIndex>=item.index?backgroundColor:''}"></div>
    </div>
  </van-field>
</template>
<script>
  import config from '../config';
  export default {
    name: config.prefix + "PasswordStrength",
    props: {
      type:String,
      value: String,
      dataVvAs: String,
      placeholder: String,
      vValidate: String,
      name: String
    },
    watch: {
      value (val) {
        if (val === this.password) {
          return;
        }
        this.password = val;
      },
      password (val) {
        this.$emit('input', val);
        this.checkPassword();
      }
    },
    computed: {
      rules () {
        return [
          {reg: '\\S{1,6}$', color: '#FF4949', rank: this.$t('common.weak'), index: 3},
          {reg: '\\S{8,10}$', color: '#F7BA2A', rank: this.$t('common.middle'), index: 2},
          {reg: '\\S{10,14}$', color: '#20A0FF', rank: this.$t('common.strong'), index: 1},
          {reg: '\\S{14,999}$', color: '#41b883', rank: this.$t('common.best'), index: 0}
        ];
      }
    },
    data () {
      return {
        password: this.value,
        backgroundColor: '',
        ulWidth: String,
        rankText: '',
        selectIndex: -1
      };
    },
    methods: {
      clickIcon () {
        this.$emit('click-icon');
      },
      inputFocus () {
        if (!this.rankText) {
          this.rankText = this.$t('common.weak');
        }
      },
      checkPassword () {
        let tempIndex = -1;
        this.rules.forEach((item, index) => {
          const reg = new RegExp(item.reg);
          if (reg.test(this.password)) {
            tempIndex = index;
          } else {
            return;
          }
        });
        this.selectIndex = tempIndex;
        if (tempIndex !== -1) {
          this.rankText = this.rules[tempIndex].rank;
          this.backgroundColor = this.rules[tempIndex].color;
        } else {
          this.backgroundColor = '';
        }
        this.$emit('after-checked', tempIndex);
      }
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
  @import '~assets/scss/variables';
  @import "~assets/scss/mixin";
  .strength-wrapper {
    position: relative;
    .rule-item-text {
      position: absolute;
      left: -52px;
      width: 48px;
      top: 5px;
    }
    .rule-item {
      width: 12px;
      height: 6px;
      background-color: $border-color;
      margin-bottom: 3px;
    }
  }
</style>
<style lang="scss" rel="stylesheet/scss">
  .password-strength {
    &.van-field {
      height: 56px;
    }
  }
</style>
