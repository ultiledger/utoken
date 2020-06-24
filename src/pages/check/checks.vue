<template>
  <van-popup
    v-model="showPop"
    position="bottom"
    class="popup-wapper"
    style="width:100%;height: 100%;">
  <div style="width: 100%;" class="transfer-container">
    <van-nav-bar
      :title="$t('common.check')"
      @click-left="close()">
      <div slot="title">
        <div v-if="asset.name">
          <div style="line-height: 30px;">{{asset.code}}&nbsp;{{$t('common.check')}}</div>
          <div style="line-height: 15px;" class="text-muted small-font">&nbsp;({{asset.name}})</div>
        </div>
        <div v-else>
          {{asset.code}}&nbsp;{{$t('common.check')}}
        </div>
      </div>
      <span slot="left"><i class="ultfont ult-left"></i></span>
      <span slot="right"><i class="ultfont ult-scan" @click="toScan"></i></span>
    </van-nav-bar>
  </div>
  <van-tabs v-model="tabActive" sticky @change="tabChange">
    <van-tab :title="$t('common.checkcreate')">
      <send-check ref="sendCheck" :asset="asset" :transfer-amt="transferAmt" :address="address"  @done="done"></send-check>
    </van-tab>
    <van-tab :title="$t('common.checkmng')">
      <my-checks
        ref="myChecks"
        :address.sync="currentAccount.address"
        :secret.sync="currentAccount.secret"
        :asset="asset"
         @savePasswordInMemory="savePasswordInMemory"
      ></my-checks>
    </van-tab>
  </van-tabs>    
  </van-popup>
</template>
<script>
  import sendCheck from './send-check';
  import myChecks from './my-checks';
  import QRCodeScanner from 'core/utils/QRCodeScanner.js';

  export default{
    data () {
      return {
        showPop: false,
        asset: {},
        loading: false,
        address: '',
        transferAmt: '',
        tabActive: 0 /*tab激活*/,
      };
    },
    components: {
     sendCheck,
     myChecks
    },
    computed: {
      sendType () {
        if (this.$store.state.account.type) {
          return this.$store.state.account.type;
        }
        return '';
      },
      currentAccount() {
      return this.$store.state.account;
    },
    },
    methods: {
      show (asset, address, transferAmt) {
        this.asset = asset;
        if (address && address !== '') {
          this.address = address;
        } else {
          this.address = '';
        }
        if (transferAmt && transferAmt !== '') {
          this.transferAmt = transferAmt;
        } else {
          this.transferAmt = '';
        }
        this.$nextTick(() => {
          if (this.$refs.sendCheck) {
            this.$refs.sendCheck.init();
          }
        });
        this.showPop = true;
      },
      done () {
        this.$emit('done');
        this.close();
      },
      tabChange() {
      if (this.tabActive === 0) {
        this.$nextTick(() => {
          this.$refs.myChecks.clearTimer();
        });
      } else if (this.tabActive === 1) {
        this.$nextTick(() => {
          this.$refs.myChecks.getChecks();
        });
      }
    },
      close () {
        this.showPop = false;
      },
      toScan () {
        QRCodeScanner.scan(this).then((res) => {
          if (res && res.address && res.address !== '') {
            this.address = res.address;
            if (res.transferAmt) {
              this.transferAmt = res.transferAmt;
            }
            this.$nextTick(() => {
              if (this.$refs['component']) {
                this.$refs['component'].init();
              }
            });
            // this.assetCode = QRCodeScanner.getAssetCodeByAddress(res);
            // if (this.assetCode && this.assetCode !== '') {
            //   if (this.$refs['component']) {
            //     this.$refs['component'].init();
            //   }
            //   return;
            // }
            // this.$toast('Not invalid address!');
          } else {
            this.$toast('非钱包地址，请重新扫描');
          }
        }, (errorMsg) => {
          this.$toast(errorMsg);
        });
      },
      savePasswordInMemory(password) { // Deprecated
      let map = {};
      map[this.currentAccount.address] = password;
      this.$store.dispatch("setPasswordMap", map);
    },
    }
  };
</script>
<style lang="scss">
</style>
