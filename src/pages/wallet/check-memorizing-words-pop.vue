<template>
  <div class="set-mw">
    <van-popup
      v-model="showVpop"
      position="right"
      class="popup-wapper"
      style="width:100%;height: 100%;overflow: hidden"
    >
      <van-nav-bar
        :title="$t('wallet.checkMnemonicCode')"
        @click-left="close">
        <span slot="left"><i class="ultfont ult-left"></i></span>
      </van-nav-bar>
      <pl-content-block
        :offsetTop="46">
        <content-block>
          <!--:sub-tip="$t('wallet.checkMnemonicCodeSubTip')"-->
          <top-block
            :title="$t('wallet.checkMnemonicCode')">
            <img src="static/img/backups-wallet@3x.png" width="45" height="45"/>
          </top-block>
          <div class="text-muted small-font item text-tip-color" style="margin-top: 1.5rem;" v-text="$t('wallet.checkMnemonicCodeSubTip')"></div>

          <div class="item-block">
            <div class="mem-fill-block">
             <span
               @click="removeMemWord(index)"
               class="check-mw__add_mw add_mw_remove"
               v-for="(item,index) in selectMemorizingWords"
               :key="index">{{item.name}}</span>
            </div>
          </div>
          <div style="padding: 0px 20px">
          <span
            @click="addMemWord(item)"
            class="check-mw__add_mw van-hairline--surround"
            style="margin-right: 20px;"
            :class="{'add_mw_selected':selectMemorizingWords.indexOf(item) >= 0}"
            v-for="(item,index) in memorizingWords"
            :key="index">{{item.name}}</span>
          </div>
          <button-bottom style="margin-top: 2.5rem;">
            <van-button size="large" round type="primary" @click="submit()" :text="$t('wallet.back')"></van-button>
          </button-bottom>
        </content-block>
      </pl-content-block>
    </van-popup>
  </div>
</template>
<script>
  import hdWallet from 'src/wallet/hd-wallet';
  import ContentBlock from "./components/content-block";
  import topBlock from './components/top-block';
  import buttonBottom from './components/button-bottom';
  import createWallet from './mixins/createWallet';
  export default {
    mixins: [createWallet],
    components: {ContentBlock, topBlock, buttonBottom},
    props: {
      // 两个值，一个是创建(create)，一个是备份(backups)
      backupsSource: String
    },
    data () {
      return {
        showVpop: false,
        selectMemorizingWords: [],
        memorizingWords: [],
        password: '',
        source: '',
        accountTypes: []
      };
    },
    methods: {
      show (form, source, accountTypes) {
        this.password = form.password;
        this.memorizingWords = [];
        this.selectMemorizingWords = [];
        let mnemonicCodes = form.memorizingWords.split(' ');
        mnemonicCodes.forEach((item, index) => {
          this.memorizingWords.push({name: item, index});
        });
        this.shuffle(this.memorizingWords);
        this.source = source;
        this.accountTypes = accountTypes;
        this.showVpop = true;
      },
      close () {
        this.showVpop = false;
      },
      createWalletAcct (mnemonicCodes) {
        // 创建账户
        this.createWalletAcctByMnemonicCode(this.accountTypes, mnemonicCodes, this.password, this.source, true);
        // 创建隐藏账户
        this.filterAndCreateNotSelectAccountType(this.accountTypes, mnemonicCodes, this.password, this.source, true, 'D');

        let firstAcct = this.getFirstAcct();
        if (firstAcct) {
          this.$store.dispatch('setAccount', firstAcct);
        } else {
          this.$toast(this.$t('wallet.createAcctFail'));
        }
      },
      submit () {
        // 验证助记词
        let mnemonicCodes = this.selectMemorizingWords.map(item => {
          return item.name;
        }).join(' ');
        if (this.selectMemorizingWords && this.selectMemorizingWords.length > 0 && hdWallet.validateMnemonic(mnemonicCodes, this.getMemorizingCodeLanguage(mnemonicCodes))) {
          /* 备份成功之后把手机设备返回按钮启动 */
          window.canBack = true;
          if (this.backupsSource === 'backups') {
            // 保存数据库操作
            const toast = this.$toast.loading({
              duration: 0,
              forbidClick: true,
              message: this.$t('wallet.correctMnemonic')
            });
            setTimeout(() => {
              toast.clear();
              this.close();
              this.$emit('done');
            }, 300);
          } else {
            this.createWalletAcct(mnemonicCodes);
            this.$router.push({name: 'assets', params: {refresh: true}});
          }
        } else {
          this.$toast(this.$t('wallet.mnemonicCodeErrorTip'));
        }
      },
      addMemWord (item) {
        let mnemonicCodes = this.selectMemorizingWords.filter(fitem => {
          return fitem.name == item.name && fitem.index === item.index;
        });
        if (mnemonicCodes.length <= 0) {
          this.selectMemorizingWords.push(item);
          this.shuffle(this.memorizingWords);
        }
      },
      removeMemWord (index) {
        this.selectMemorizingWords.splice(index, 1);
        this.shuffle(this.memorizingWords);
      },
      shuffle (arr) {
        let i = arr.length;
        while (i) {
          let j = Math.floor(Math.random() * i--);
          [arr[j], arr[i]] = [arr[i], arr[j]];
        }
      }
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
  @import "~assets/scss/variables";
  .set-mw {
    position: relative;
    .check-mw__add_mw{
      display: inline-block;
      padding: 5px;
      border-radius: $border-radius;
      /*border: 1px solid #c9c9c9;*/
      margin-right: 5px;
      margin-bottom: 5px;
      background: #fff;
      color: $primary-color;
      &.add_mw_selected{
        color: #222222;
        background: #c9c9c9;
      }
      &.add_mw_remove{
        background: #fff;
        border: none;
      }
    }
    .item {
      margin-right: 20px;
      margin-left: 20px;
    }
    .mem-fill-block{
      min-height: 60px;
    }
  }
</style>
<style lang="scss" rel="stylesheet/scss">
  .set-mw{
    .van-hairline--top-bottom::after{
      border-width: 0px;
    }
    .van-field__body{
      .van-field__control{
        background: #F9F7F6!important;
        padding: 10px!important;
      }
    }
  }
</style>
