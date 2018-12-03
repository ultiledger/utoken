<template>
  <div style="position: relative;">
    <van-dialog
      v-model="showDialog"
      :close-on-click-overlay="false"
      :show-cancel-button="true"
      @confirm="copy"
      @cancel="close"
      :confirm-button-text="$t('common.copy')"
      style="right:5%;width: 90%;"
    >
      <div class="copy-secret-container">
        <div class="copy-secret-container__title text-center">
          <van-row>
            <van-col span="24">
              <span style="font-weight: bold;" v-text="$t('acct.exportPrivateKey')"></span>
            </van-col>
           <!-- <van-col
              span="3"
              class="text-right"
              @click.native="close">
              <van-icon name="close"/>
            </van-col>-->
          </van-row>
        </div>
        <div class="text-danger copy-secret-container__tip" v-text="$t('acct.exportWarning')"></div>
        <div class="copy-secret-container__content">
          {{currentAccountSecret}}
        </div>
        <!--<div style="margin-top: 10px;margin-bottom: 10px;">
          <van-row gutter="2">
            <van-col span="12">
              <van-button size="large" class="plat-btn" @click="close">取消</van-button>
            </van-col>
            <van-col span="12">
              <van-button size="large" class="plat-btn" type="primary" @click="copy">复制</van-button>
            </van-col>
          </van-row>

        </div>-->
      </div>

    </van-dialog>
  </div>
</template>
<script>
  import cryptor from 'core/utils/cryptor';

  export default {
    data () {
      return {
        showDialog: false,
        password: ''
      };
    },
    computed: {
      currentAccountSecret () {
        if (this.password) {
          return cryptor.decryptAES(this.$store.state.account.secret, this.password);
        }
        return '';
      }
    },
    methods: {
      show (password) {
        this.password = password;
        this.showDialog = true;
      },
      close () {
        this.showDialog = false;
      },
      copy () {
        this.$copyText(this.currentAccountSecret).then(() => {
          this.$toast(this.$t('common.copySuccess'));
        }, () => {
          this.$toast(this.$t('common.copyFail'));
        });
      }
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
  .copy-secret-container{
    padding-left: 10px;
    padding-right: 10px;
    .copy-secret-container__title{
      padding: 15px 0;
    }
    .copy-secret-container__tip{
      border: 1px solid #fa5555;
      border-radius: 3px;
      padding: 5px;
      margin-bottom: 10px;
    }
    .copy-secret-container__content{
      padding: 5px;
      background: #f0f0f0;
      border-radius: 3px;
      word-break:break-all;
      margin-bottom: 10px;
    }
  }
</style>
