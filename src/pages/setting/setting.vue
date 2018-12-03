<template>
  <div style="width: 100%;" class="mine large-van-cell-container">
    <!--
    <div class="mine-header">
      <img src="static/img/setting-bg.png"/>
    </div>
    -->
    <van-nav-bar
      :title="$t('setting.setting')"
    >
    </van-nav-bar>
    <van-cell-group class="margin-top item-block">

      <van-cell is-link @click.native="toAddressList">
        <span slot="title" class="cell-title">
          <img :src="dprImg(`book.png`)" class="img-icon">&emsp;
          <!--<i class="ultfont ult-contacts icon-font"></i>&emsp;-->
          <span class="text" v-text="$t('setting.addressBook')"></span>
        </span>
      </van-cell>
      <van-cell is-link @click.native="showShareAction">
       <span slot="title" class="cell-title">
         <!--<i class="ultfont ult-team icon-font"></i>&emsp;-->
         <img :src="dprImg(`join.png`)" class="img-icon">&emsp;
         <span class="text" v-text="$t('setting.shareUtoken')"></span>
       </span>
     </van-cell>
    </van-cell-group>
    <van-cell-group class="margin-top item-block reset-van-cell">
      <van-cell
        :value="setting.currencyUnit"
        @click="toCurrencySelect"
        is-link>
        <span slot="title" class="cell-title">
          <img :src="dprImg(`price.png`)" class="img-icon">&emsp;
          <span class="text" v-text="$t('setting.currencyUnit')"></span>
        </span>
      </van-cell>
      <van-cell
        :value="languages[setting.language]"
        @click="toSetLanguage"
        is-link>
        <span slot="title">
          <img :src="dprImg(`language.png`)" class="img-icon">&emsp;
          <span class="text" v-text="$t('setting.languages')"></span>
        </span>
      </van-cell>
      <van-cell is-link @click.native="toSetting">
        <span slot="title" class="cell-title">
           <img :src="dprImg(`settings.png`)" class="img-icon">&emsp;
          <!--<i class="ultfont ult-setting"></i>&emsp;-->
          <span class="text" v-text="$t('setting.settings')"></span>
        </span>
      </van-cell>
    </van-cell-group>
    <van-cell-group class="margin-top item-block">
      <van-cell is-link @click.native="showUserProtocol">
        <span slot="title" class="cell-title">
            <img :src="dprImg(`protocol.png`)" class="img-icon">&emsp;
          <!--<i class="ultfont ult-detail"></i>&emsp;-->
            <span class="text" v-text="$t('setting.userProtocol')"></span>
        </span>
      </van-cell>
      <van-cell is-link @click.native="toAbout">
        <span slot="title" class="cell-title">
          <img :src="dprImg(`about.png`)" class="img-icon">&emsp;
          <!--<i class="ultfont ult-info-circle"></i>&emsp;-->
          <span class="text" v-text="$t('setting.aboutUs')"></span>
        </span>
      </van-cell>
    </van-cell-group>

    <currency-select ref="currencySelect"></currency-select>
    <language-setting ref="languageSetting"></language-setting>
    <address-list ref="addressList"></address-list>
    <base-setting ref="setting"></base-setting>
    <user-protocol ref="userProtocol"></user-protocol>
    <share-utoken ref="shareUtoken"></share-utoken>
    <about ref="about"></about>
  </div>
</template>

<script>
  import addressList from '../address/address-list';
  import currencySelect from './popup/currency-select-pop';
  import languageSetting from './popup/language-setting-pop';
  import baseSetting from './popup/base-setting-pop';
  import userProtocol from '../ui/user-protocol.vue';
  import constants from 'src/core/constants';
  import shareUtoken from '../ui/share-utoken.vue';
  import about from './popup/about-pop.vue';
  export default {
    name: 'mine',
    components: {addressList, baseSetting, userProtocol, currencySelect, languageSetting, shareUtoken, about},
    data () {
      return {
        languages: constants.languages
      };
    },
    computed: {
      setting () {
        return this.$store.state.setting;
      }
    },
    methods: {
      showShareAction () {
        this.$refs.shareUtoken.showPopup();
      },
      toAbout () {
        this.$refs.about.show();
      },
      toAddressList () {
        this.$refs.addressList.show();
      },
      toSetting () {
        this.$refs.setting.show();
      },
      toCurrencySelect () {
        this.$refs.currencySelect.show();
      },
      toSetLanguage () {
        this.$refs.languageSetting.show();
      },
      showUserProtocol () {
        this.$refs.userProtocol.showPopup();
      }
    }
  };
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import '~assets/scss/_variables.scss';
  .mine-header{
    height: 200px;
    line-height: 200px;
    text-align: center;
   /* background-color: $black-gray;*/
    overflow: hidden;
    img  {
      width: 100%;
    }
    /*background: no-repeat url('static/img/setting-bg.png') center center;*/
    /*background-size: 100%;*/
  }
  .cell-title{
    *{
      vertical-align: middle;
    }
  }
</style>
<style lang="scss" rel="stylesheet/scss">
  .reset-van-cell {
    .van-cell__value {
      flex: 0 0 28%;
    }
  }
</style>


