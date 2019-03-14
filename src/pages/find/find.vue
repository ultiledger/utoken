<template>
  <div style="width: 100%;" class="news-container">
   <!-- <van-nav-bar
      :title="$t('news.discovery')"
      :left-arrow="false">
    </van-nav-bar>-->
    <!--<application></application>-->
    <van-tabs v-model="active" sticky swipeable style="z-index: 1">
      <van-tab :title="$t('common.whole')">
        <application-item :datas.sync="all"></application-item>
      </van-tab>
      <van-tab :title="$t('find.application')">
        <application-item :datas.sync="application"></application-item>
      </van-tab>
      <van-tab :title="$t('find.game')">
        <application-item :datas.sync="game"></application-item>
      </van-tab>
    </van-tabs>
  </div>
</template>
<script>
  // import news from './news';
  import applicationItem from './application-item';
  export default{
    name: 'news-adv',
    components: {applicationItem},
    data () {
      return {
        active: 0
      };
    },
    computed: {
      type () {
        if (this.active === 0) {
          return 'all';
        } else if (this.active === 1) {
          return 'tool';
        } else if (this.active === 2) {
          return 'game';
        } else if (this.active === 3) {
          return 'exchange';
        }
        return '';
      },
      all () {
        return [
          {
            title: 'Etherscan',
            subTitle: this.$t('find.ethBlockBrowser'),
            desc: this.$t('find.ethDeveloped'),
            link: 'https://etherscan.io',
            imgUrl: 'static/img/app/Etherscan.png'
          },
          {
            title: this.$t('find.xrpTitle'),
            subTitle: this.$t('find.xrpSubTitle'),
            desc: this.$t('find.xrpDesc'),
            link: 'https://wipple.devnull.network/live/accounts',
            imgUrl: 'static/img/XRP@3x.png'
          },
          {
            title: this.$t('find.xmlTitle'),
            subTitle: this.$t('find.xmlSubTitle'),
            desc: this.$t('find.xmlDesc'),
            link: 'https://steexp.com/',
            imgUrl: 'static/img/XLM@3x.png'
          },
          /* {
            title: this.$t('find.xrpMarketTitle'),
            subTitle: this.$t('find.xrpMarketSubTitle'),
            desc: this.$t('find.xrpMarketDesc'),
            link: 'http://ripple.stellar.chat/#/',
            imgUrl: 'static/img/XRP@3x.png'
          }, */
          {
            title: this.$t('find.u919Title'),
            subTitle: this.$t('find.u919SubTitle'),
            desc: this.$t('find.u919Desc'),
            link: 'http://xlmyun.com:666/#!/track',
            imgUrl: 'static/img/app/u919.png'
          },
          {
            title: 'Fomo3D',
            subTitle: this.$t('find.fomo3DSubTitle'),
            desc: this.$t('find.fomo3DDsc'),
            link: 'http://exitscam.me',
            imgUrl: 'static/img/app/Fomo3D.png'
          }
        ];
      },
      application () {
        return [
          {
            title: 'Etherscan',
            subTitle: this.$t('find.ethBlockBrowser'),
            desc: this.$t('find.ethDeveloped'),
            link: 'https://etherscan.io',
            imgUrl: 'static/img/app/Etherscan.png'
          },
          {
            title: this.$t('find.xrpTitle'),
            subTitle: this.$t('find.xrpSubTitle'),
            desc: this.$t('find.xrpDesc'),
            link: 'https://wipple.devnull.network/live/accounts',
            imgUrl: 'static/img/XRP@3x.png'
          },
          {
            title: this.$t('find.xmlTitle'),
            subTitle: this.$t('find.xmlSubTitle'),
            desc: this.$t('find.xmlDesc'),
            link: ' https://steexp.com/',
            imgUrl: 'static/img/XLM@3x.png'
          },
          /* {
            title: this.$t('find.xrpMarketTitle'),
            subTitle: this.$t('find.xrpMarketSubTitle'),
            desc: this.$t('find.xrpMarketDesc'),
            link: 'http://ripple.stellar.chat/#/',
            imgUrl: 'static/img/XRP@3x.png'
          }, */
          {
            title: this.$t('find.u919Title'),
            subTitle: this.$t('find.u919SubTitle'),
            desc: this.$t('find.u919Desc'),
            link: 'http://xlmyun.com:666/#!/track',
            imgUrl: 'static/img/app/u919.png'
          },
          {
            title: '唤醒测试',
            subTitle: '唤醒测试',
            desc: '唤醒测试',
            link: 'http://120.78.128.36:84/txt.html',
            imgUrl: 'static/img/unknown.png'
          }
        ];
      },
      game () {
        return [
          {
            title: 'Fomo3D',
            subTitle: this.$t('find.fomo3DSubTitle'),
            desc: this.$t('find.fomo3DDsc'),
            link: 'http://exitscam.me',
            imgUrl: 'static/img/app/Fomo3D.png'
          }
        ];
      }
    },
    methods: {
    },
    activated () {
      this.active = 0;
    }
  };
</script>
<style lang="scss">
  @import '~assets/scss/_variables.scss';
  .news-container{
    position: relative;
    height: 1000px;
    .van-tab--active {
      background: #fff;
      color: #000;
    }
    .van-tabs__line {
      background-color: $primary-color;
    }
  }
</style>
