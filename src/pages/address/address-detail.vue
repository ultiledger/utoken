<template>
  <div>
    <van-popup
      v-model="showPop"
      position="right"
      class="popup-wapper"
      get-container="body"
      style="width:100%;height: 100%;">
      <van-nav-bar
        :title="$t('common.detail')"
        left-arrow
        @click-right="deleteAddress"
        @click-left="close">
        <span slot="left"><i class="ultfont ult-left"></i></span>
        <span slot="right" class="normal-font text-primary" v-text="$t('common.delete')"></span>
      </van-nav-bar>

      <van-cell-group class="margin-top item-block">
        <van-field
          v-model="addressInfo.name"
          @blur="modifyName"
          maxlength="80"
          clearable
          :label="$t('address.name')"
          :placeholder="$t('address.namePlaceholder')"
        />
        <van-field
          type="textarea"
          maxlength="50"
          @blur="modifyRemark"
          v-model="addressInfo.remark"
          clearable
          :label="$t('address.remark')"
          :placeholder="$t('address.remarkPlaceholder')"
        />
        <!--<van-cell
          title="名称"
          :value="addressInfo.name"
          is-link
          @click="toModifyName('1')"/>-->
       <!-- <van-cell
          title="备注"
          :value="addressInfo.remark"
          is-link
          @click="toModifyRemark"/>-->
      </van-cell-group>

      <pl-block class="margin-top item-block">
        <p class="normal-font" v-text="$t('common.receivablesAddress')"></p>
        <div class="text-center qrcode-container">
          <qrcode class="qrcode" :value="addressInfo.value" :options="{ size: 200 }"></qrcode>
          <!--<img src="../acct/qrcode.jpeg" style="max-width: 50%;" alt="二维码"/>-->
        </div>
        <div class="addr">
          <pl-wallet-addr
            class="small-font text-primary text-center"
            complete
            :address="addressInfo.value"></pl-wallet-addr>
        </div>
      </pl-block>
    </van-popup>
  </div>
</template>
<script>
  import qrcode from '@xkeshi/vue-qrcode';
  export default {
    data () {
      return {
        showPop: false,
        showNameDialog: false,
        showRemarkDialog: false,
        addressInfo: {},
        addressName: '',
        remark: ''
      };
    },
    components: {
      qrcode
    },
    methods: {
      show (params) {
        this.addressInfo = {...params};
        this.showPop = true;
      },
      close () {
        this.$emit('done');
        this.showPop = false;
      },
      deleteAddress () {
        this.$dialog.confirm({
          title: this.$t('common.tip'),
          message: this.$t('address.deleteConfirm')
        }).then(() => {
          this.$collecitons.address.deleteAddressByValue(this.addressInfo.value);
          this.close();
        });
      },
      modifyName () {
        if (this.addressInfo.name) {
          this.$collecitons.address.findAnUpdateAddress({value: this.addressInfo.value}, (address) => {
            return address.name = this.addressInfo.name;
          });
        } else {
          this.$toast(this.$t('address.nameNotEmpty'));
        }
        // this.showNameDialog = false;
      },
      modifyRemark () {
        this.$collecitons.address.findAnUpdateAddress({value: this.addressInfo.value}, (address) => {
          return address.remark = this.addressInfo.remark;
        });
        // this.showRemarkDialog = false;
      }
    },
  };
</script>
<style lang="scss" scoped>
  @import '~assets/scss/_variables.scss';
  .qrcode-container{
    padding: 4px 0;
  }
  .addr{
    padding: 10px;
    background-color: $primary-color-light;
  }
</style>
