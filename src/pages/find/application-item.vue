<template>
  <pl-content-block :offsetTop="44" :offsetBottom="50">
    <div class="application">
      <van-card
        @click.native="to(item)"
        :desc="item.desc"
        class="item-block"
        v-for="(item, index) in datas"
        :key="index">
        <div slot="title" class="card-title">
          <div class="small-font">{{item.title}}</div>
          <div class="small-font">{{item.subTitle}}</div>
        </div>
        <div slot="thumb">
          <img :src="item.imgUrl" width="60" height="60">
        </div>
        <!--<div slot="footer" style="position: relative;top: -35px;">
          <van-icon name="arrow"></van-icon>
        </div>-->
      </van-card>
    </div>
  </pl-content-block>
</template>
<script>
  import customerBrowser from 'core/utils/customerBrowser';
  export default {
    props: {
      datas: Array
    },
    data () {
      return {};
    },
    methods: {
      to (item) {
        customerBrowser.open(item.title, item.link);
      }
    }
  };
</script>
<style lang="scss" scoped>
  @import '~assets/scss/_variables.scss';
  .application {
    margin-top: 15px;
    background: $main-background-color;
  }
</style>
<style lang="scss">
  @import '~assets/scss/_variables.scss';
  .application {
    .van-card {
      background: #fff;
      padding: 5px 15px 5px 100px;
      border-radius: $border-radius;
      .van-card__thumb {
        left: 0px!important;
      }
    }
    .card-title {
      margin-top: 10px;
    }
  }
</style>
