<template>
  <div class="currency-select">
    <van-popup
      v-model="showPop"
      position="right"
      class="popup-wapper"
      style="width:100%;height: 100%;">
      <van-nav-bar
        :title="$t('setting.languages')"
        @click-left="close"
        @click-right="onClickRight"
      >
        <span slot="left"><i class="ultfont ult-left"></i></span>
        <span slot="right" class="normal-font text-primary" v-text="$t('common.save')"></span>
      </van-nav-bar>
      <div class="item-block">
        <van-radio-group v-model="activeItem">
          <van-cell-group :border="false">
            <van-cell
              v-for="(value,key) in languages"
              :key="key"
              :title="value"
              clickable
              @click="onItemSelect(key)">
              <van-radio :name="key" />
            </van-cell>
          </van-cell-group>
        </van-radio-group>
      </div>
    </van-popup>
  </div>
</template>
<script>
  import {languages, languagesCurrencys} from 'src/core/constants';
  export default {
    data () {
      return {
        showPop: false,
        activeItem: '',
        languages: languages
      };
    },
    methods: {
      show () {
        this.activeItem = this.$store.state.setting.language;
        this.showPop = true;
      },
      close () {
        this.showPop = false;
      },
      onItemSelect (item) {
        this.activeItem = item;
      },
      onClickRight () {
        /*保存更新到数据库*/
        this.$collecitons.setting.updateSetting((setting) => {
          setting.language = this.activeItem;
          this.$store.dispatch('setLanguage', this.activeItem);
          this.$store.dispatch('setCurrencyUnit', languagesCurrencys[this.activeItem]);
          this.$i18n.locale = this.activeItem; /* 加载对应配置文件*/
          return setting.language = this.activeItem;
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
