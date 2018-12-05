<template>
  <div  class="address-add-container">
    <van-popup
      v-model="showPop"
      position="right"
      class="popup-wapper"
      get-container="body"
      style="width:100%;height: 100%;">
      <van-nav-bar
        :title="$t('address.addAddress')"
        left-arrow
        @click-left="close">
        <span slot="left"><i class="ultfont ult-left"></i></span>
      </van-nav-bar>
      <van-cell-group class="margin-top item-block">
        <van-field
          maxlength="80"
          :placeholder="$t('address.namePlaceholder')"
          :data-vv-as="$t('address.name')"
          clearable
          name="name"
          v-validate="'required'"
          v-model="form.name"
        />
        <van-field
          class="small-font"
          maxlength="50"
          rows="1"
          type="textarea"
          autosize
          :placeholder="$t('address.remarkPlaceholder')"
          v-model="form.remark"
        />
      </van-cell-group>
      <div class="item-block" @click="toSelectType">
        <van-field
          v-model="form.type"
          v-validate="'required'"
          :placeholder="$t('address.coinTypePlaceholder')"
          :data-vv-as="$t('address.coinType')"
          name="type"
          icon="arrow"
          readonly>
        </van-field>
      </div>

      <div class="item-block" v-if="form.type">
        <pl-block :title="$t('common.address')" :title-class="false">
          <span slot="title-tip"><i class="ultfont ult-scan" @click="toScan"></i></span>

          <van-field
            v-model="form.value"
            :data-vv-as="$t('common.receivablesAddress')"
            :placeholder="$t('address.receivablesAddressPlaceholder')"
            clearable
            name="value"
            rows="1"
            type="textarea"
            autosize
            class="no-border no-padding-side"
            style="padding-left: 0 !important;"
            v-validate="'required'"
          >
          </van-field>
          <small class="text-danger" v-show="!addressValid">{{$t('address.invalidAddressTip')}}</small>
        </pl-block>
      </div>

      <div class="single-btn">
        <van-button size="large" round  @click="saveAddress" type="primary" v-text="$t('address.save')"></van-button>
      </div>
      <coin-type-select ref="coinTypeSelect" @done="setType"></coin-type-select>
    </van-popup>
  </div>
</template>
<script>
  import coinTypeSelect from '../ui/coin-type-select';
  import moment from 'moment';
  import QRCodeScanner from 'core/utils/QRCodeScanner.js';
  import coins from 'src/wallet/coins';

  export default {
    components: {coinTypeSelect},
    data () {
      return {
        showPop: false,
        addressValid: true,
        form: {
          acctType: '',
          type: '',
          name: '',
          value: '',
          remark: ''
        }
      };
    },
    watch: {
      'form.value' () {
        if (this.form.value && this.form.acctType) {
          if(!coins[this.form.acctType].wallet.isValidAddress(this.form.value)) {
            this.addressValid = false;
          } else {
            this.addressValid = true;
          }
        } else {
          this.addressValid = true;
        }
      },
      'form.type' () {
        if (this.form.value && this.form.acctType) {
          if(!coins[this.form.acctType].wallet.isValidAddress(this.form.value)) {
            this.addressValid = false;
          } else {
            this.addressValid = true;
          }
        } else {
          this.addressValid = true;
        }
      }
    },
    methods: {
      show(address) {
        this.resetForm();
        if (typeof address === 'object' && address) {
          this.form.value = address.address;
          this.form.acctType = address.type;
          this.form.type = this.stringUpperCaseFirstChar(address.type);
        } else if (address && address !== '') {
          this.form.value = address;
        }
        this.showPop = true;
      },
      resetForm () {
        this.form.name = '';
        this.form.type = '';
        this.form.value = '';
        this.form.acctType = '';
        this.form.remark = '';
      },
      toScan () {
        QRCodeScanner.scan(this).then((res) => {
          if (res && res.address && res.address !== '') {
            this.form.value = res.address;
            // let assetCode = QRCodeScanner.getAssetCodeByAddress(res);
            // if (assetCode && assetCode !== '') {
              // this.form.type = assetCode;
              // return;
            // }
            // this.$toast('Not invalid address!');
          } else {
            this.$toast(this.$t('assets.scanFailTip'));
          }
        }, (errorMsg) => {
          this.$toast(errorMsg);
        });
      },
      close () {
        this.showPop = false;
      },
      toSelectType () {
        this.$refs.coinTypeSelect.show();
      },
      setType (type, acctType) {
        this.form.acctType = acctType;
        this.form.type = this.stringUpperCaseFirstChar(acctType);
      },
      stringUpperCaseFirstChar (str) { // 首字母大写
        return str.charAt(0).toUpperCase() + str.substring(1);
      },
      saveAddress () {
        if (!this.form.value) {
          this.$toast(this.$t('address.addressRequire'));
          return;
        }
        if (!this.addressValid) {
          return;
        }
        let checkAddress = this.$collecitons.address.findAddreByValue(this.form.value);
        if (checkAddress) {
          this.$toast(this.$t('address.existAddress'));
          return;
        }
        if (!this.form.type) {
          this.$toast(this.$t('address.coinTypeRequire'));
          return;
        }
        if (!this.form.name) {
          this.$toast(this.$t('address.nameNotEmpty'));
          return;
        }
        this.$validator.validateAll().then((result) => {
          if (result) {
            let addObj = this.form;
            addObj.addTime = moment().format('YYYY-MM-DD HH:mm:ss');
            addObj.type = this.form.acctType;
            this.$collecitons.address.insertAddress(addObj);
            this.$emit('done');
            this.close();
          } else {
            this.$toast(this.validateErrors.items[0].msg);
          }
        });
      }
    }
  };
</script>
<style lang="scss" scoped>
  .address-add-container{
    .no-padding-side{
      &.van-field{
        padding-left: 0;
        padding-right: 0;
      }
    }
  }
</style>
<style lang="scss">
  .address-add-container {
    .van-field {
      padding-left: 15px;
      padding-right: 15px;
    }
  }
</style>
