<template>
  <van-popup
    style="height: 100%;width: 100%;"
    v-model="showPop"
    position="right"
    :overlay="true">
    <van-nav-bar
      :title="$t('find.newsDetail')"
      @click-left="close"
    >
      <span slot="left"><i class="ultfont ult-left"></i></span>
    </van-nav-bar>

    <pl-content-block :offsetTop="46">
      <div style="padding: 10px;" class="new-adv-detail" v-if="data.content.rendered">
        <div class="text-center news-title" v-html="data.title.rendered"></div>
        <div class="froala-editor">
          <div v-html="data.content.rendered" style="line-height: 1.5em;text-indent: 2em;"></div>
        </div>
        <div class="text-right" style="color: #999999">{{data.modified | date('YYYY-MM-DD')}}</div>
      </div>
      <div v-else class="news-loading">
        <van-loading/>
      </div>
    </pl-content-block>
  </van-popup>
</template>
<script>
  export default {
    data () {
      return {
        data: {
          title: {},
          content: {}
        },
        showPop: false
      };
    },
    methods: {
      show (newsId) {
        this.showPop = true;
        this.data = {
          title: {},
          content: {}
        };
        this.$api.getNewsDetail(newsId).then(resp => {
          this.data = resp;
        });
      },
      close () {
        this.showPop = false;
      }
    }
  };
</script>
<style lang="scss" rel="stylesheet/less">
  @import "~assets/scss/_variables.scss";
  .new-adv-detail {
    .news-title {
      color: #292929;
      text-transform: capitalize;
      font-style: normal;
      font-size: $x-large-font;
      line-height: 25px;
      padding: 10px;
    }
    .froala-editor{
      margin-top: 15px;
      width: 100%;
      overflow: hidden;
      padding: 10px 15px;
      p {
        color: #787878;
      }
      img {
        display: block;
        max-width: 100%;
        height: auto;
      }
    }
  }
  .news-loading {
    position: relative;
    top: 45%;
    left: 45%;
    padding: 10px;
    border-radius:3px;
    background: rgba(0, 0, 0, 0.5);
    width: 50px;
    height: 50px;
  }
</style>
