<template>
  <div class="currency-select">
    <van-popup
      v-model="showPop"
      position="right"
      class="popup-wapper"
      style="width:100%;height: 100%;">
      <van-nav-bar
        :title="$t('setting.currencyUnit')"
        @click-left="close"
        @click-right="onClickRight"
      >
        <span slot="left"><i class="ultfont ult-left"></i></span>
        <span slot="right" class="normal-font text-primary" v-text="$t('common.save')"></span>
      </van-nav-bar>

      <van-radio-group v-model="activeItem" class="margin-top item-block">
        <van-cell-group :border="false">
          <van-cell
            v-for="(value,key) in currencys"
            :key="value"
            :title="key"
            clickable
            @click="onItemSelect(key)">
            <van-radio :name="key" />
          </van-cell>
        </van-cell-group>
      </van-radio-group>
    </van-popup>
  </div>
</template>
<script>
  import {currencys} from '../../../core/constants';
  export default {
    data () {
      return {
        showPop: false,
        activeItem: '',
        currencys: currencys
      };
    },
    methods: {
      show () {
        this.activeItem = this.$store.state.setting.currencyUnit;
        this.showPop = true;
      },
      close () {
        this.showPop = false;
      },
      onItemSelect (item) {
        this.activeItem = item;
      },
      onClickRight () {
        this.$collecitons.setting.updateSetting((setting) => {
          setting.currencyUnit = this.activeItem;
          this.$store.dispatch('setCurrencyUnit', this.activeItem);
          return setting.currencyUnit = this.activeItem;
        });
        this.close();
      }
    }
  };
</script>
<style lang="scss" scoped>
  @import '~assets/scss/_variables.scss';
  .currency-select {
    .item {
      position: relative;
      line-height:44px;
      padding-left:5px;
      padding-right:18px;
      &.select {
        color: $primary-color;
      }
    }
    .select-icon {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      float: right;
      line-height: inherit;
      color: $primary-color;
    }
  }
</style>
