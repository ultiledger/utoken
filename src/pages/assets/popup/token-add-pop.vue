<template>
  <van-popup
    v-model="showPop"
    position="bottom"
    class="popup-wapper"
    style="width:100%;height: 100%;">
    <van-nav-bar
      :title="$t('common.add')"
      @click-left="close">
      <span slot="left"><i class="ultfont ult-left"></i></span>
    </van-nav-bar>
    <van-cell-group class="margin-top item-block">
      <van-field
        maxlength="80"
        :placeholder="$t('assets.contractName')"
        clearable
        name="name"
        v-model="form.name"
      />
      <van-field
        maxlength="80"
        :placeholder="$t('assets.contractSymbol')"
        clearable
        name="symbol"
        v-model="form.symbol"
      />
      <small class="text-danger padding-left" v-show="!assetExist">{{$t('assets.contractAssetExist')}}</small>
      <van-field
        maxlength="36"
        type="number"
        :placeholder="$t('assets.contractDecimals')"
        clearable
        name="decimals"
        v-model="form.decimals"
      />
      <van-field
        type="textarea"
        class="no-border"
        autosize
        maxlength="80"
        :placeholder="$t('assets.contractAddress')"
        clearable
        name="address"
        v-model="form.address"
      />
      <small class="text-danger padding-left" v-show="!addressValid">{{$t('assets.contractAddressValid')}}</small>
      <small class="text-danger padding-left" v-show="!addressExist">{{$t('assets.contractAddressExist')}}</small>
    </van-cell-group>
    <div class="single-btn" style="margin-top: 30px;">
      <van-button size="large" round :loading="loading"  @click="saveToken" type="primary">{{$t('common.save')}}</van-button>
    </div>
  </van-popup>
</template>
<script>
  import coins from 'src/wallet/coins';
  import {AccountType} from 'src/wallet/constants';
  import tokens from 'src/wallet/tokens';
  export default {
    data () {
      return {
        showPop: false,
        form: {
          address: '',
          name: '',
          symbol: '',
          decimals: ''
        },
        addressValid: true,
        addressExist: true,
        assetExist: true,
        loading: false
      };
    },
    watch: {
      'form.address' () {
        if (this.form.address) {
          this.addressExist = true;
          if(!coins[AccountType.ethereum].wallet.isValidAddress(this.form.address)) {
            this.addressValid = false;
          } else {
            this.addressValid = true;
            let tokens = coins[AccountType.ethereum].tokens();
            Object.keys(tokens).forEach(key => {
              let token = tokens[key];
              if (token.address === this.form.address.toLocaleLowerCase()) {
                this.addressExist = false;
              }
            });
          }
        } else {
          this.addressExist = true;
          this.addressValid = true;
        }
      },
      'form.symbol' () {
        if (this.form.symbol) {
          let tokens = coins[AccountType.ethereum].tokens();
          if (tokens && tokens[this.form.symbol]) {
            this.assetExist = false;
          } else {
            this.assetExist = true;
          }
        } else {
          this.assetExist = true;
        }
      }
    },
    computed: {
      errMsg () {
        return  {
          'Contract source code not verified': this.$t('assets.contractERC-20Valid') // valid ERC-20 token
        };
      }
    },
    methods: {
      show () {
        this.resetForm();
        this.showPop = true;
      },
      close () {
        this.showPop = false;
      },
      resetForm () {
        this.form.address = '';
        this.form.name = '';
        this.form.symbol = '';
        this.form.decimals = '';
      },
      saveAssetConfig (abi) { // 对所有的账户进行合约绑定
        let assetConfig = {
          address: this.form.address,
          symbol: this.form.symbol,
          name: this.form.name,
          decimals: Number(this.form.decimals),
          type: AccountType.ethereum,
          abi: abi
        };
        this.$collecitons.assetConfig.insertAssetConfig(assetConfig);
      },
      setTokens (ret) { // 追加合约到内存
        let config = tokens.get(AccountType.ethereum);
        config[this.form.symbol] = {
          symbol:  this.form.symbol,
          name:  this.form.name,
          displayName: this.form.name,
          decimals: Number(this.form.decimals),
          address: this.form.address.toLocaleLowerCase(),
          abi: ret
        };
        tokens.set(config);
      },
      saveToken () {
        if (!this.form.address) {
          this.$toast(this.$t('assets.contractAddressTip'));
          return;
        }
        if (!this.form.name) {
          this.$toast(this.$t('assets.contractNameTip'));
          return;
        }
        if (!this.form.symbol) {
          this.$toast(this.$t('assets.contractSymbolTip'));
          return;
        }
        if (!this.form.decimals) {
          this.$toast(this.$t('assets.contractDecimalsTip'));
          return;
        }
        if (!this.addressValid || !this.addressExist || !this.assetExist) {
          return;
        }
        // 保存数据库操作
        this.loading = true;
        coins[AccountType.ethereum].wallet.getContractAbi(this.form.address).then(ret => {
          if (ret && ret.length > 0) {
            this.saveAssetConfig(ret);
            this.setTokens(ret);
            this.loading = false;
            this.$emit('reload');
            this.close();
          } else {
            this.loading = false;
            this.$toast(this.$t('assets.contractAddressFail'));
          }
        }).catch(error => {
          this.loading = false;
          if (error && this.errMsg[error]) {
            this.$toast(this.errMsg[error]);
          } else {
            this.$toast(error);
          }
        });
      }
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
  .padding-left {
    padding-left: 15px;
  }
</style>
