<template>
  <div :style="containerStyle" >
    <van-pull-refresh v-model="ptrLoading" @refresh="onRefresh">
      <van-list
        v-model="scrollLoading"
        :finished="noMore"
        :loading-text="loadingText"
        ref="vantList"
        @load="onInfiniteScroll"
      >
        <slot :item="item" v-for="(item) in itemData"></slot>
      </van-list>
      <div class="no-more" v-if="noMore && itemData.length > 0">—&nbsp;{{$t('common.noMore')}}&nbsp;—</div>
      <div v-show="total === 0 && !scrollLoading && !ptrLoading" class="no-recode-tip text-muted">
        <div class="tip-icon">
          <!--<img src="./empty-2.png" width="120"/>-->
        </div>
        <span class="tip-text" v-if="emptyTip">{{emptyTip}}</span>
        <span class="tip-text" v-else>{{$t('common.emptyRecord')}}</span>
      </div>
    </van-pull-refresh>
  </div>
</template>

<script>
  import config from '../config';
  export default {
    name: config.prefix + 'PageList',
    props: {
      pageSize: {
        type: Number,
        default () {
          return 10;
        }
      },
      params: {
        type: Object,
        default () {
          return {};
        }
      },
      dataFun: Function,
      emptyTip: {
        type: String,
        default: ''
      },
      defaultSortProp: String,
      defaultSortOrder: String,
      loadingText: {
        type: String,
        default: () => {
          return '加载中...';
        }
      },
      offsetTop: {
        type: Number,
        default: 0
      },
      offsetBottom: {
        type: Number,
        default: 0
      }
    },
    data () {
      return {
        itemData: [],
        init: false,
        total: 0,
        currentPage: 0,
        currentPageSize: this.pageSize,
        pages: 0,
        noMore: false,
        ptrLoading: false,
        scrollLoading: false
      };
    },
    methods: {
      onSearch (searchbar, query) {
        this.$emit('onSearch', query);
      },
      onInfiniteScroll () {
        if (this.noMore) return;
        this._getdataFun(++this.currentPage);
      },
      _getdataFun (currentPage, filters) {
        if (currentPage) {
          this.currentPage = currentPage;
        }
        if (!filters || typeof filters !== 'object') {
          filters = {};
        }
        if (!filters.sortName) {
          filters.sortName = this.defaultSortProp || '';
          if (filters.sortName) {
            filters.sortType = this.defaultSortOrder === 'descending' ? 'desc' : 'asc';
          } else {
            filters.sortType = '';
          }
        }
        let pageNo = this.currentPage - 1;
        if (this.currentPage > 1) {
          pageNo = pageNo * this.currentPageSize;
        }
        let params = {
          pageSize: this.currentPageSize,
          pageNo: pageNo,
          ...this.params,
          ...filters
        };
        this.$emit('before-load');
        this.dataFun(params).then(ret => {
          setTimeout(() => {
            if (this.currentPage === 1) {
              this.itemData = ret.data;
            } else {
              this.itemData = [...this.itemData, ...ret.data];
            }
            this.$emit('after-load', ret, this.itemData);
            this.total = ret.total;
            this.pages = parseInt(this.total / this.currentPageSize) + (this.total % this.currentPageSize === 0 ? 0 : 1);
            if (this.currentPage >= this.pages || ret.data.length <= 0 || ret.data.length < params.pageSize) {
              this.noMore = true;
            } else {
              this.noMore = false;
            }
            this.ptrLoading = false;
            this.scrollLoading = false;
          }, 500);
        });
      },
      onRefresh: function () {
        this._getdataFun(1);
        window.scrollTo(0, 10);
      },
      reload (filters) {
        this.itemData = [];
        this.ptrLoading = true;
        this._getdataFun(1, filters);
      }
    },
    computed: {
      containerStyle () {
        let cs = {
          width: '100%',
          'overflow-y': 'auto'
        };
        let wHeight = document.body.clientHeight - this.offsetTop - this.offsetBottom;
        cs.height = wHeight + 'px';
        return cs;
      }
    }
  };
</script>

<style lang="scss" rel="stylesheet/scss">
  .no-more{
    padding: 10px 0;
    text-align: center;
    font-size: 13px;
    color: #aaa;
  }
  .no-recode-tip{
    padding-top: 20%;
    text-align: center;
    .tip-icon{
      > i{
        font-size: 70px;
        color: #bcbcbc;
      }
      /*height: 80px;*/
      margin-bottom: 10px;
    }
    .tip-text{
      font-size: 14px;
    }
  }
</style>
