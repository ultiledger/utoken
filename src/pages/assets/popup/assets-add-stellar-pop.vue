<template>
  <div class="assets-add">
      <div>
        <van-search
          v-model="searchValue"
          :placeholder="$t('common.searchPlaceholder')">
        </van-search>
        <pl-content-block :offsetTop="112">
          <div v-for="(asset, index) in filterBy(assets, searchValue, 'code') " :key="index" class="item-block assset-add-block">
            <table style="width: 100%;table-layout: fixed;">
              <tr>
                <td width="40px">
                      <span class="img-icon">
                        <img v-if="asset.logo" :src="asset.logo">
                        <img v-else :src="`static/img/${asset.code}@3x.png`" >
                      </span>
                </td>
                <td>
                  <div class="text-ellipsis">
                    <span>{{asset.code}}</span>
                    <span v-if="asset.name" class="small-font text-muted">&nbsp;
                          {{asset.name}}
                        </span>
                  </div>
                  <div v-if="asset.issuer" class="text-ellipsis">
                    <pl-wallet-addr
                      class="small-font text-muted"
                      :complete="false"
                      :show-copy="false"
                      :address="asset.issuer"></pl-wallet-addr>
                  </div>
                </td>
                <td width="50">
                  <van-switch
                    v-if="asset.canSelect"
                    size="25px"
                    :value="asset.selected"
                    :loading="asset.loading"
                    :disabled="!asset.loading && disabled"
                    @input="changeAssets(asset)"/>
                </td>
              </tr>
            </table>
          </div>
        </pl-content-block>
      </div>
      <password-dialog ref="pwdDialog" @done="changeTrust"></password-dialog>
  </div>
</template>
<script>
  import coins from 'src/wallet/coins';
  import asset from '../mixns/asset';
  import passwordDialog from '../../ui/password-dialog';
  import cryptor from 'core/utils/cryptor';
  import Big from 'big.js';
  export default {
    mixins: [asset],
    components: {passwordDialog},
    data () {
      return {
        searchValue: '',
        assets: {},
        curreAcctountAddress: '',
        disabled: false
      };
    },
    computed: {
      errMsg () {
        return {
          'op_invalid_limit': this.$t('assets.changeTrustLowReserve'),
          'op_low_reserve': this.$t('assets.changeTrustLowReserve'),
          'op_no_issuer': this.$t('assets.changeTrustNoIssuer')
        };
      }
    },
    // created () {
    //   this.init();
    // },
    methods: {
      init () {
        let account = this.$store.state.account;
        this.searchValue = '';
        this.curreAcctountAddress = account.address;
        this.assets = this.getAssets(account.type);
      },
      getAssets (type) {
        let coin = coins[type];
        let result = [
          {
            code: coin.symbol,
            canSelect: false,
            loading: false
          }
        ];

        let selectAssets = this.$store.state.balances[this.curreAcctountAddress];
        let selectAssetsCode = selectAssets.map(item => {
         return item.code + (item.issuer || '');
        }).join(',');

        let configAssets = this.getConfigAssets(type);
        configAssets.forEach(token => {
          let selected = selectAssetsCode.indexOf(token.code + token.issuer) !== -1;
          token.logo = (!token.logo || token.logo === '')? 'static/img/unknown.png':token.logo;
          let item = {...token, canSelect: true, selected: selected, loading: false};
          result.push(item);
        });
        return result;
      },
      changeAssets (asset) {
        let balance = this.getBalance(asset.code, asset.issuer).value;
        balance = new Big(balance);
        if (asset.selected && balance.gt(0)) {
          this.$toast(this.$t('assets.trustRemoveTip'));
          return;
        }
        if (this.$store.state.passwordMap[this.curreAcctountAddress]) {
          this.changeTrust (this.$store.state.passwordMap[this.curreAcctountAddress], asset);
        } else {
          this.$refs['pwdDialog'].show(asset);
        }
      },
      getErrMsg (err) {
        let retMsg = this.$t('assets.changeTrustFail');
        if (err && err.response && err.response.data && err.response.data.extras && err.response.data.extras.result_codes) {
          // const resultXdr = StellarSdk.xdr.TransactionResult.fromXDR(err.response.data.extras.result_xdr, 'base64');
          // console.info(resultXdr);
          let result_codes = err.response.data.extras.result_codes;
          return this.errMsg[result_codes.operations[0]] ? this.errMsg[result_codes.operations[0]] : retMsg;
        }
        return retMsg;
      },
      changeTrust (password, asset) {
        let map = {};
        map[this.curreAcctountAddress] = password;
        this.$store.dispatch('setPasswordMap', map);
        let amount = '0';
        if (!asset.selected) {
          amount = '100000000000';
        }
        let account = this.$store.state.account;
        let secret = cryptor.decryptAES(account.secret, password);

        asset.loading = true;
        this.disabled = true;
        window.canBack = false;
        return this.$wallet.changeTrust(secret,  asset.code, asset.issuer, amount).then(ret => {
          console.info(ret);
          asset.selected = !asset.selected;
          this.$store.dispatch('setBalances', this.curreAcctountAddress);
          if (!asset.selected) {
            this.$collecitons.tradepair.findAndRemoveTradepair(account.type, account.address, asset.code, asset.issuer);
          }
          asset.loading = false;
          this.disabled = false;
          window.canBack = true;
        }).catch(err => {
          console.info(err);
          this.$toast(this.getErrMsg(err));
          asset.loading = false;
          this.disabled = false;
          window.canBack = true;
        });
      }
    }
  };
</script>
<style  lang="scss" rel="stylesheet/scss" scoped>
  .assset-add-block {
    padding-left: 20px;
    padding-top: 15px;
    padding-bottom: 15px;
  }
</style>

