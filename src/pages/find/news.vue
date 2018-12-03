<template>
  <div class="news">
    <van-search
      :placeholder="$t('common.searchPlaceholder')"
      v-model="searchStr"/>
    <pl-page-list
      :dataFun="dataFun"
      :offsetBottom="55"
      :offsetTop="110"
      ref="list">
      <template slot-scope="props">
        <new-item :item="props.item" @click.native="toNewsDetail(props.item.id)"></new-item>
      </template>
    </pl-page-list>
    <news-detail-popup ref="newsDetailPopup"></news-detail-popup>
  </div>
</template>
<script>
  import newsDetailPopup from './news-detail-popup.vue';
  import newItem from './news-item';
  export default{
    name: 'news',
    data () {
      return {
        newsTotal: 0,
        swipeItems: [],
        searchStr: '',
        init: false
      };
    },
    computed: {
      language () {
        return this.$store.state.setting.language;
      }
    },
    watch: {
      searchStr () {
        this.$refs.list.reload({search: this.searchStr});
      },
      language () {
        this.$refs.list.reload();
      }
    },
    components: {
      newsDetailPopup,
      newItem
    },
    methods: {
      toNewsDetail (newsId) {
        this.$refs.newsDetailPopup.show(newsId);
      },
      dataFun (params) {
        params.context = 'embed';
        if (this.language === 'zh-CN') {
          params.categories = '3';
        } else if (this.language === 'en-US') {
          params.categories = '2';
        }
        params.pageSize = 5;
        params.per_page = params.pageSize;
        params.page = parseInt(params.pageNo / params.pageSize) + 1;
        return this.$api.getNews(params);
      }
    },
    activated () {
      this.searchStr = '';
      this.init = false;
    }
  };
</script>
<style lang="scss" scoped>
</style>
<style lang="scss" type="text/scss">
  .news {
    .van-search{
      /*padding: 20px;*/
      background: #fff!important;
      padding-bottom: 15px;
      margin-bottom: 0px;
    }
  }
</style>
