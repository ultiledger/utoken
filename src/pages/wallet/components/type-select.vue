<template>
  <div class="type-select__main">
    <van-checkbox-group v-model="accountTypes">
      <div
        class="item-block type-select__cell"
        :key="index"
        @click="clickOpt(item, index)"
        v-show="canSelected(item.type)"
        v-for="(item,index) in accounts">
              <span class="content-left__icon type-select__icon">
                <img :src="`static/img/${item.code}@3x.png`">
              </span>
        <div class="type-select__title">
          <span>{{item.name}}</span>
        </div>
        <div class="type-select__value">
          <van-checkbox :name="item.type" ref="checkboxes" v-if="isCheck"/>
          <van-icon name="arrow" v-else></van-icon>
        </div>
      </div>
    </van-checkbox-group>
  </div>
</template>
<script>
  import accounts from '../mixins/accounts';
  export default {
    mixins: [accounts],
    props: {
      value: String|Array,
      clickable: Boolean,
      filterTypes: String|Array,
      isCheck: {
        type: Boolean,
        default: true
      }
    },
    watch: {
      accountTypes (val) {
        this.$emit('input', val);
      },
      value (val) {
        this.accountTypes = val;
      }
    },
    data () {
      return {
        accountTypes: this.value,
      };
    },
    methods: {
      clickOpt (item ,index) {
        if (this.clickable) {
          this.$emit('click-opt', item);
        } else if (this.isCheck) {
          this.$refs.checkboxes[index].toggle();
        }
      },
      canSelected (type) {
        if (this.filterTypes && this.filterTypes.length > 0) {
          return this.filterTypes.indexOf(type) < 0;
        }
        return true;
      }
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
  .type-select__main {
    margin-top: 1.6rem;
    .type-select__cell{
      /*height: 4rem;*/
      display: flex;
      padding:10px 15px;
      font-size:0.88rem;
      color:#333;
      line-height: 24px;
      margin-bottom: 15px;
      .type-select__title {
        flex: 1;
        align-self:center;
      }
      .type-select__value {
        flex: 1;
        align-self:center;
        text-align:right;
        overflow:hidden;
        vertical-align:middle
      }
    }
  }

</style>
