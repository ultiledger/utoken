<template>
  <div>
    <van-popup
      v-model="showPop"
      position="bottom"
      class="popup-wapper"
      style="width:100%;height: 100%;">
      <van-nav-bar
        :title="$t('exchange.inputTitle')"
        @click-left="close()">
        <span slot="left"><i class="ultfont ult-left"></i></span>
      </van-nav-bar>
      <div class="b-white padding exchange-coin border-radius">
        <div class="title">{{$t('exchange.receive')}}</div>
        <van-field
          type="number"
          :readonly="loadingPath"
          class="large-font text-primary"
          style="padding-left: 20px;"
          v-model="amount"
          :placeholder="$t('exchange.inputPlaceholder')">
          <span slot="icon" @click="toCurrencyType" class="text-main large-font">{{assetCode}}&nbsp;<van-icon name="arrow" style="display: inline-block;"/></span>
        </van-field>
        <small class="text-danger padding-left" v-if="amount && amount <= 0">{{$t('exchange.amountErrorTip')}}</small>
        <small class="text-danger padding-left" v-else-if="errorMsg">{{errorMsg}}</small>
      </div>
      <div>
        <van-radio-group v-model="selectPath" class="margin-top" v-if="!loadingPath">
          <div class="path-list">
            <div class="path-list-item item-block" v-for="(value,key) in paths" :key="key" @click="pathClick(key)">
              <div class="content">
                <table style="width: 100%;">
                  <tr>
                    <td width="25">
                      <van-radio :name="key" style="overflow: visible"/>
                    </td>
                    <td width="35">
                       <span class="img-icon">
                      <img v-if="value.srcLogo" :src="value.srcLogo">
                      <img v-else :src="`static/img/${value.srcCode}@3x.png`" onerror="this.src='static/img/unknown.png'"/>
                      </span>
                    </td>
                    <td width="90">
                      <div style="vertical-align: middle;" class="big-font">{{value.srcCode}}</div>
                      <span v-if="value.srcName" class="text-main">
                      <span v-if="value.srcName !== 'unknown'">{{value.srcName}}</span>
                      <span v-else>
                        <pl-wallet-addr
                          class="x-small-font"
                          :complete="false"
                          :address="value.srcIssuer" :length="4" :show-copy="false"></pl-wallet-addr>
                      </span>
                    </span>
                    </td>
                    <td class="text-right">
                      <div class="big-font">
                        {{value.srcAmount | currency('', value.precise)}}
                      </div>
                      <div class="text-main small-font">
                        {{value.price | currency('', value.precise)}}&nbsp;{{assetCode}}
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </div>

          <!--<div style="position: relative;" class="padding" v-for="(value,key) in paths" :key="key">
            <div style="display: inline-block">{{value.dst_code}}</div>
            <div class="adddd"><van-icon name="arrow" style="display: inline-block;"/></div>
            <div style="position: absolute;left: 30%;top: 2px;">{{value.price | currency('', '3')}}/{{value.src_amount | currency('', '3')}}</div>
            <div style="display: inline-block;">{{value.src_code}}</div>
            <div style="display: inline-block;width: 25px; line-height:25px;margin-left: 3px;text-align: center;transform: translateY(5px);"><van-radio :name="key" /></div>
          </div>-->
        </van-radio-group>
        <div v-else>
          <van-loading style="margin: 0 auto;"/>
        </div>
      </div>
      <pl-stick :offset-bottom="0">
        <van-button
          size="large"
          :loading="loading"
          :disabled="disabledBtn"
          class="plat-btn"
          @click="showPasswordDialog"
          type="primary"
          v-text="$t('common.exchange')"></van-button>
      </pl-stick>
    </van-popup>
    <van-popup
      v-model="showPicker"
      position="bottom">
      <van-picker
        ref="exchangePicker"
        show-toolbar
        :columns="balances"
        value-key="code"
        @cancel="onCancel"
        @confirm="onConfirm"
      />
    </van-popup>
    <password-dialog ref="pwdDialog" @done="exchange"></password-dialog>
  </div>
</template>
<script>
  import asset from '../assets/mixns/asset';
  import passwordDialog from '../ui/password-dialog';
  import cryptor from 'core/utils/cryptor';
  // import delayer from './mixns/delayer';

  export default {
    mixins: [asset],
    components: {passwordDialog},
    data () {
      return {
        showPop: false,
        amount: '',
        asset: {}, // 需要兑换资产
        assetCode: '', // 当前选择的资产code
        assetIssuer:'',
        loading: false, // 按钮loading状态
        showPicker: false, // 是否显示选择框
        loadingPath: false, // 路径是否在加载中
        paths: {},
        selectPath: '',
        errorMsg: '',
        timer: ''
      };
    },
    computed: {
      currentAccount () {
        return this.$store.state.account;
      },
      balances () {
        let account = this.$store.state.account;
        if (account) {
          return this.$store.state.balances[account.address];
        }
        return [];
      },
      disabledBtn () {
        if (this.assetCode && this.amount && this.selectPath) {
          return false;
        }
        return true;
      },
      errMsg () {
        return  {
          'Bad Request': 'Bad Request',
          'NotFoundError': this.$t('exchange.notFoundError'),
          'Network Error': this.$t('transaction.networkError')
        };
      }
    },
    watch: {
      amount () {
        if (this.timer) {
          clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => {
          this.getExchangePath();
        }, 700);
      }
    },
    methods: {
      show (asset) {
        this.resetData();
        this.asset = asset;
        this.assetCode = asset.code;
        this.assetIssuer = asset.issuer;
        this.showPop = true;
      },
      isEmptyPaths () {
        if (this.paths) {
          let keys = Object.keys(this.paths);
          return keys.length <= 0;
        }
        return true;
      },
      resetData () {
        this.amount = '';
        this.paths = {};
        this.selectPath = '';
      },
      close () {
        this.showPop = false;
      },
      pathClick (key) {
        this.selectPath = key;
      },
      getErrMsg (err) {
        if (err && this.errMsg[err]) {
          return this.errMsg[err];
        }
        return null;
      },
      getExchangePath () {
        this.paths = {};
        this.selectPath = '';
        this.errorMsg = '';
        if (this.assetCode && this.amount) {
          this.loadingPath = true;
          this.$wallet.getExchangePath(this.currentAccount.address, this.currentAccount.address, this.asset.code, this.asset.issuer, this.amount).then(ret => {
            let assetsMap = this.getConfigAssetsMap(this.currentAccount.type);
            ret.records.forEach((item) => {
              let alt = {
                origin: item,
                dstCode   : item.destination_asset_type == 'native' ? 'XLM' : item.destination_asset_code,
                dstIssuer : item.destination_asset_type == 'native' ? '' : item.destination_asset_issuer,
                srcAmount : parseFloat(item.source_amount),
                srcCode   : item.source_asset_type == 'native' ? 'XLM' : item.source_asset_code,
                srcIssuer : item.source_asset_type == 'native' ? '' : item.source_asset_issuer,
              };
              alt.precise = alt.srcCode == 'BTC' ? 6 : 3;
              alt.price = alt.srcAmount / item.destination_amount;
              let assetMap = assetsMap[alt.srcCode + (alt.srcIssuer || '')];
              if (assetMap) {
                alt.srcLogo = assetMap.logo || '';
                alt.srcName = assetMap.name;
              }
              let isValid = true;
              if (alt.srcAmount <= 0) {
                isValid = false;
              } else {
                let index = this.getColumnIndexByValue(alt.srcCode,alt.srcIssuer);
                if (this.balances[index].value - alt.srcAmount < 0) {
                  isValid = false;
                }
                if (alt.srcCode == alt.dstCode && alt.srcIssuer == alt.dstIssuer && alt.price >= 1) {
                  isValid = false;
                }
              }
              if (isValid) {
                if (this.paths[alt.srcCode + '.' + alt.srcIssuer]) {
                  if (this.paths[alt.srcCode + '.' + alt.srcIssuer].srcAmount > alt.srcAmount) { // 取最优的/花费最少的资产
                    this.paths[alt.srcCode + '.' + alt.srcIssuer] = alt;
                  }
                } else {
                  this.paths[alt.srcCode + '.' + alt.srcIssuer] = alt;
                }
                this.$forceUpdate();
              }
            });
            if (this.isEmptyPaths()) {
              this.errorMsg = this.$t('exchange.pathEmpty');
            }
            this.loadingPath = false;
          }).catch(err => {
            this.errorMsg = this.getErrMsg(err);
            this.loadingPath = false;
          });
        }
      },
      getColumnIndexByValue (code,issuer) {
        let balances = this.balances;
        let index = 0;
        for (let i=0 ;i< balances.length; i++) {
          let balance = balances[i];
          if (balance.code === code
          && balance.issuer === issuer) {
            index = i;
            break;
          }
        }
        return index;
      },
      toCurrencyType () {
        this.showPicker = true;
        this.$nextTick(() => {
          this.$refs.exchangePicker.setColumnIndex(0, this.getColumnIndexByValue(this.assetCode,this.assetIssuer));
        });
      },
      onCancel () {
        this.showPicker = false;
      },
      onConfirm(value) {
        this.assetCode = value.code;
        this.assetIssuer = value.issuer;
        this.asset = value;
        this.getExchangePath();
        this.showPicker = false;
      },
      showPasswordDialog () {
        this.$refs.pwdDialog.show();
      },
      exchange (password) {
        this.loading = true;
        const toast = this.$toast.loading({
          duration: 0,
          forbidClick: true,
          loadingType: 'circular',
          message: this.$t('exchange.converting')
        });
        this.$wallet.pathPayment(this.paths[this.selectPath], this.currentAccount.address, cryptor.decryptAES(this.currentAccount.secret, password)).then(ret => {
          if (ret) {
            toast.message = this.$t('transaction.transactionBroadcastSuccess');
            setTimeout(() => {
              toast.clear();
              this.close();
              this.$emit('done');
            }, 1000);
          }
          this.loading = false;
        }).catch(err => {
          console.info(err);
          let errMsg = this.getErrMsg(err);
          if (errMsg) {
            this.$toast(errMsg);
          } else {
            this.$toast(this.$t('exchange.exchangeFail'));
          }
          setTimeout(() => {
            toast.clear();
          }, 2000);
          this.loading = false;
        });
      }
    }
  };
</script>
<style lang="scss" scoped>
  @import '~assets/scss/_variables.scss';
  @import "~assets/scss/mixin";
  .border-radius{
    border-radius: $border-radius;
  }
  .padding-left {
    padding-left: 15px;
  }
  .exchange-coin {
    margin: 20px 20px;
    .title {
      margin-left: 12px;
      margin-right: 12px;
      padding-top: 6px;
      padding-bottom: 18px;
    }
  }
  .path-list{
    .path-list-item{
      height: 80px;
      padding: 20px;
      .title{
        @include clearfix();
        margin-bottom: 2px;
      }
      .content{
        @include clearfix();
        line-height: 20px;
        font-size: $x-small-font;
      }
    }
    margin-bottom: 20px;
  }
</style>
