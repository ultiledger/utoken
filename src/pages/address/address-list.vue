<template>
  <div class="address-list">
    <van-popup
      v-model="showPop"
      position="right"
      class="popup-wapper"
      style="width:100%;"
      get-container="body"
    >
      <van-nav-bar
        :title="$t('setting.addressBook')"
        left-arrow
        @click-left="close"
      >
        <span slot="left"><i class="ultfont ult-left"></i></span>
        <span slot="right" @click="addAddress" class="text-primary normal-font">{{$t('common.add')}}</span>

      </van-nav-bar>
      <van-search
        :placeholder="$t('common.searchPlaceholder')"
        v-model="searchStr"/>
      <pl-page-list :dataFun="dataFun" ref="list" :params="params"
                    :offsetBottom="0" :offsetTop="112">
        <template slot-scope="props">
          <van-row class="address-card item-block" @click.native="toAddressDetail(props.item)">
            <van-col :span="4" class="address-card-col text-center">
            <span class="wallet-logo">
              <img :src="`static/img/${props.item.type}@3x.png`">
               <!--<img :src="`static/img/tokens/${props.item.type}.png`" style="vertical-align: middle" width="20px" height="20px">-->
            </span>
            </van-col>
            <van-col :span="20" class="address-card-col">
              <p class="address-card-col-line normal-font">{{props.item.name}}</p>
              <pl-wallet-addr
                :address="props.item.value"
                :show-copy="false"
                :length="14"
                class="x-small-font text-muted address-card-col-line addr-block"></pl-wallet-addr>
            </van-col>
          </van-row>
          <div class="van-hairline--bottom"></div>
        </template>
      </pl-page-list>
      <address-add ref="addressAdd" @done="onRefresh"></address-add>
    </van-popup>
    <address-detail ref="addressDetail" @done="onRefresh"></address-detail>
  </div>
</template>
<script>
  import addressAdd from './address-add';
  import addressDetail from './address-detail';
  export default {
    components: {addressAdd, addressDetail},
    data () {
      return {
        showPop: false,
        searchStr: '',
        accountType: '',
        handleFalg: '1', /*点击列表项标识，1-到详情，2-触发回调*/
        params: {
        }
      };
    },
    watch: {
      searchStr () {
        this.$refs.list.reload();
      }
    },
    methods: {
      show (handleFalg, accountType) {
        this.searchStr = '';
        this.params = {};
        if (handleFalg) {
          this.handleFalg = handleFalg;
          this.accountType = accountType;
        }
        if (this.$refs.list) {
          this.$refs.list.onRefresh();
        }
        this.showPop = true;
      },
      close () {
        this.showPop = false;
      },
      addAddress () {
        let params = null;
        if (this.accountType) {
          params = {};
          params.type = this.accountType;
        }
        this.$refs.addressAdd.show(params);
      },
      toAddressDetail (addressInfo) {
        if (this.handleFalg === '1') {
          this.$refs.addressDetail.show(addressInfo);
        } else if (this.handleFalg === '2') {
          this.$emit('done', addressInfo);
          this.close();
        }
      },
      dataFun (params) {
        params.searchStr = this.searchStr;
        if (this.accountType) {
          params.searchStr = this.accountType;
        }
        return this.$collecitons.address.findAddressByPages(params);
      },
      onRefresh () {
        this.$refs.list.onRefresh();
      }
    }
  };
</script>
<style lang="scss" scoped>
  @import '~assets/scss/_variables.scss';
  .address-card{
    background: #fff;
    padding: 0px 10px !important;
    .address-card-col{
      height: 70px;
      line-height: 70px;
      position: relative;
      .address-card-col-line{
        height: 20px;
        line-height: 20px;
        &:first-child{
          margin-top: 15px;
        }
        &:last-child{
          margin-bottom: 15px;
        }
        &.addr-block{
          display: block;
        }
      }
      .wallet-logo{
        display: inline-block;
        width:35px;
        height: 35px;
        /*border: 1px solid #e5e5e5;*/
        border-radius: 50%;
        line-height: 30px;
        text-align: center;
        margin-right: 5px;
        img{
          margin: 17px 0px;
          width:35px;
          height: 35px;
        }
        /*display: inline-block;
        line-height: 40px;
        position: absolute;
        height: 40px;
        font-size: 20px;
        font-weight: 600;
        width: 40px;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        background: $primary-color;
        border-radius: 100%;*/
      }
    }
  }
</style>
<style lang="scss" type="text/scss">
  .addr-block{
    .address-text {
      width: 100%;
    }
  }
</style>
