<template>
  <div class="backups-wallet">
    <van-popup
      v-model="showVpop"
      position="right"
      class="popup-wapper"
      style="width:100%;height: 100%;;overflow: hidden"
    >
      <van-nav-bar @click-left="close" :title="$t('wallet.selectMnemonicLang')">
        <span slot="left"><i class="ultfont ult-left"></i></span>
      </van-nav-bar>
      <pl-content-block :offsetTop="46">
        <!--提示信息-->
        <div class="tip item-block" style="box-shadow: none;">
          <van-row>
            <van-col span="12" class="text-center">
              <div class="large-font select-language" style="border-radius: 5px 0 0 5px;" :class="{'active': memorizingCodeLanguage === 'english'}" @click="changeLanguage('english')">
                {{$t('wallet.enMnemonic')}}
              </div>
            </van-col>
            <van-col span="12" class="text-center">
              <div class="large-font select-language" style="border-radius: 0 5px 5px 0;" :class="{'active': memorizingCodeLanguage === 'chinese_simplified'}" @click="changeLanguage('chinese_simplified')">
                {{$t('wallet.cnMnemonic')}}
              </div>
            </van-col>
          </van-row>
        </div>
        <!--按钮部分-->
        <button-bottom>
          <div style="margin-bottom: 10px;margin-top: 18rem;" class="text-center"></div>
          <van-button size="large" round type="primary" @click="checkPassword" v-text="$t('common.next')"></van-button>
        </button-bottom>
      </pl-content-block>
    </van-popup>
    <backups-memoring-words ref="backupsMW"></backups-memoring-words>
  </div>
</template>
<script>
  import backupsMemoringWords from './backups-memorizing-words-pop';
  import topBlock from './components/top-block';
  import contentBlock from './components/content-block';
  import buttonBottom from './components/button-bottom';
  export default {
    components: {backupsMemoringWords, topBlock, contentBlock, buttonBottom},
    data () {
      return {
        showVpop: false,
        passwordFlag: true,
        mnemonicCode: null,
        backupsSource: '',
        source: '',
        accountTypes: [],
        memorizingCodeLanguage: 'english'
      };
    },
    methods: {
      show (mnemonicCode, password, backupsSource, source, accountTypes) {
        this.memorizingCodeLanguage = 'english';
        this.mnemonicCode = mnemonicCode;
        this.password = password;
        this.source = source;
        this.accountTypes = accountTypes;
        this.backupsSource = backupsSource;
        this.showVpop = true;
      },
      close () {
        this.showVpop = false;
      },
      checkPassword () {
        this.toBackups(this.password);
      },
      toBackups (password) {
        this.$refs.backupsMW.show(this.mnemonicCode, password, this.backupsSource, this.source, this.accountTypes, this.memorizingCodeLanguage);
      },
      changeLanguage (lang) {
        this.memorizingCodeLanguage = lang;
      }
    },
    created () {
      /* let params = this.$route.params;
      if (params && params.showVpop) {
        // window.canBack = false;
        // this.showVpop = true;
      } */
    }
  };
</script>
<style  lang="scss" rel="stylesheet/scss" scoped>
  @import "~assets/scss/variables";
  .backups-wallet {
    position: relative;
    .vertical-align-middle {
      vertical-align: middle;
    }
    .item {
      margin-right: 15px;
      margin-left: 15px;
    }
    .select-language {
      height: 8rem;
      line-height: 8rem;
      background: $primary-color;
      color:#ffffff;
      &.active {
        color: $primary-color;
        background: #ffffff
      }
    }
    .tip {
      position: relative;
      top: 10rem;
      background: $main-background-color;
    }
  }
</style>
