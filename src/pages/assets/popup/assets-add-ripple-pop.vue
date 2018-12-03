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
                         <img v-else-if="asset.code === 'XRP'" :src="`static/img/${asset.code}-1@3x.png`" >
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
          'tecNO_LINE_INSUF_RESERVE': this.$t('assets.changeTrustLowReserveXRP'),
          'tecNO_DST': this.$t('assets.changeTrustNoIssuer')
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
        if (!this.curreAcctountAddress || this.curreAcctountAddress !== account.address) {
          this.curreAcctountAddress = account.address;
          this.assets = this.getAssets(account.type);
        }
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
        if (err && this.errMsg[err.resultCode]) {
          return this.errMsg[err.resultCode];
        }
        return retMsg;
      },
      changeTrust (password, asset) {
        let map = {};
        map[this.curreAcctountAddress] = password;
        this.$store.dispatch('setPasswordMap', map);
        let amount = '0';
        // let ripplingDisabled = true;
        if (!asset.selected) {
          amount = '100000000000';
          // ripplingDisabled = false;
        }
        let secret = cryptor.decryptAES(this.$store.state.account.secret, password);

        asset.loading = true;
        this.disabled = true;
        window.canBack = false;
        return this.$wallet.changeTrust(secret,  asset.code, asset.issuer, amount).then(ret => {
          console.info(ret);

          if (ret && ret.resultCode === 'tesSUCCESS') {
            this.checkedTrustState(asset.selected, asset).then(() => {
              asset.selected = !asset.selected;
              asset.loading = false;
              this.disabled = false;
              window.canBack = true;
              this.$store.dispatch('setBalances', this.curreAcctountAddress);
            });
          } else {
            this.$toast(this.getErrMsg(ret));
            asset.loading = false;
            this.disabled = false;
            window.canBack = true;
          }
        }).catch(err => {
          console.info(err);
          this.$toast(this.$t('assets.changeTrustFail'));
          asset.loading = false;
          this.disabled = false;
          window.canBack = true;
        });
      },
      async checkedTrustState (disabled, asset) {
        let flag = true;
        let count = 0;
        let MaxCount = 20;
        while (flag) {
          let trustlines = await this.$wallet.getInstance().getTrustlines(this.$store.state.account.address);
          // console.info(trustlines);
          if (!trustlines || trustlines.length === 0) {
            flag = !disabled;
            continue;
          }

          if (disabled) {
            let flag1 = false;
            for (let i = 0, len = trustlines.length; i < len; i++) {
              let line = trustlines[i];
              if (line.specification.counterparty === asset.issuer && line.specification.currency === asset.code) {
                flag1 = true;
                if (line.specification.limit === '0') {
                  flag = false;
                  break;
                }
              }
            }
            if (flag && !flag1) {
              flag = false;
            }
          } else {
            flag = !trustlines.some(line => {
              if (line.specification.counterparty === asset.issuer &&
                line.specification.currency === asset.code && line.specification.limit !== '0') {
                return true;
              }
              return false;
            });
          }
          count++;
          if (count === MaxCount) {
            flag = false;
          }
          // flag = true;
          // for (let i = 0, len = trustlines.length; i < len; i++) {
          //   let line = trustlines[i];
          //   if (line.specification.ripplingDisabled === undefined) {
          //     line.specification.ripplingDisabled = false;
          //   }
          //
          //   if (line.specification.counterparty === asset.issuer &&
          //     line.specification.currency === asset.code &&
          //     line.specification.ripplingDisabled === disabled) {
          //     flag = false;
          //     break;
          //   } else if (line.specification.counterparty === asset.issuer &&
          //     line.specification.currency === asset.code) {
          //     break;
          //   }
          //
          //   if (i === len - 1) {
          //     flag = false;
          //   }
          // }
          //
          // flag = !trustlines.some(line => {
          //   if (line.specification.ripplingDisabled === undefined) {
          //     line.specification.ripplingDisabled = false;
          //   }
          //   if (line.specification.counterparty === asset.issuer &&
          //     line.specification.currency === asset.code &&
          //     line.specification.ripplingDisabled === disabled) {
          //     return true;
          //   }
          //
          //   return false;
          // });
        }
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
