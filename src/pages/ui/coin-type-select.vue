<template>
  <div class="coin-type">
    <van-popup
      v-model="showPop"
      position="right"
      class="popup-wapper"
      style="width:100%;height: 100%"
    >
      <van-nav-bar
        :title="$t('address.coinTypePlaceholder')"
        @click-left="close"
      >
        <span slot="left"><i class="ultfont ult-left"></i></span>
      </van-nav-bar>
      <pl-content-block
      :offsetTop="46"
      :offsetBottom="0">
        <div class="item-block">
        <van-cell-group :border="false">
          <van-cell
            :title="item.name"
            v-for="(item,index) in coinTypes"
            clickable
            :key="index"
            @click="toSelect(item)">
                 <span slot="icon" class="content-left__icon">
                   <img
                          v-if="item.coinType === 'XRP'"
                          :src="`static/img/${item.coinType}-1@3x.png`"
                        />
                    <img v-else :src="`static/img/${item.coinType}@3x.png`" >
                   <!--<img :src="dprImg(`${item.coinType}.png`)" class="img-icon">-->
                   <!--<img :src="`static/img/tokens/${item.coinType}.png`" style="vertical-align: middle" width="20px" height="20px">-->
                 </span>
          </van-cell>
        </van-cell-group>
        </div>
      </pl-content-block>
    </van-popup>
  </div>
</template>
<script>
  import coins from 'src/wallet/coins';
  export default {
    data () {
      return {
        showPop: false,
        coinTypes: []
      };
    },
    methods: {
      show () {
        this.coinTypes = [];
        Object.keys(coins).forEach(key => {
          let coin = coins[key];
          this.coinTypes.push({
            acctType: key,
            name: coin.name.charAt(0).toUpperCase() + coin.name.substring(1),
            coinType: coin.symbol
          });
          // Object.keys(coin.tokens).forEach(titem => {
          //   let coinType = {acctType: key, coinType: titem};
          //   this.coinTypes.push(coinType);
          // });
        });
        this.showPop = true;
      },
      toSelect (item){
        this.$emit('done', item.coinType, item.acctType);
        this.close();
      },
      close () {
        this.showPop = false;
      }
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
  .coin-type {
    .content-left__icon{
      display: inline-block;
      width:36px;
      height: 36px;
      /*border: 1px solid #e5e5e5;*/
      /*line-height: 32px;*/
      border-radius: 50%;
      text-align: center;
      margin-right: 5px;
      vertical-align: middle;
      padding: 2px;
      img {
        width:30px;
        height: 30px;
      }
    }
  }
</style>
<style lang="scss" rel="stylesheet/scss">
  .coin-type{
    .van-cell__title{
     line-height: 35px;
    }
  }
</style>
