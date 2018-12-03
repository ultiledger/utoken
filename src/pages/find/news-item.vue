<template>
  <div>
    <div class="news-card" style="background: #fff;"  >
      <div class="new-card-container">
        <div class="line van-hairline--left"></div>
        <div class="time"><span class="small-font text-muted">{{item.date | date('YYYY-MM-DD')}}</span></div>
        <div class="small-font news-title" style="font-weight: bold;" v-html="item.title.rendered"></div>
        <span class="news-content small-font text-muted" :class="{'showDot': showDot}" ref="newsContent">
          <div v-html="item.excerpt.rendered" ref="newsInfo"></div>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      item: {
        type: Object,
        default () {
          return {};
        }
      }
    },
    data () {
      return {
       showDot: false
      };
    },
    mounted () {
      this.$nextTick(() => {
        let newsContentHeight = this.$refs['newsContent'].clientHeight;
        let newsInfoHeight = this.$refs['newsInfo'].clientHeight;
        if (newsContentHeight < newsInfoHeight) {
          this.showDot = true;
        }
      });
    }
  };
</script>

<style scoped lang="scss">
  @import "~assets/scss/_variables.scss";
  .news-card {
    .new-card-container {
      padding: 10px 20px 10px 40px;
      position: relative;
      .line{
        position: absolute;
        width: 1px;
        top: 0px;
        height: 100%;
        left: 30px;
      }
    }
    .time {
      padding: 5px 0px 5px 20px;
      position: relative;
      margin-left: -10px;
      &:after {
        content: "";
        position: absolute;
        width: 11px;
        height: 11px;
        left: -5px;
        top: calc(50% - 5px);
        background: $primary-color;
        border-radius: 50%;
      }
    }
    .dot {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 100%;
      background: $primary-color;
    }
    .news-title {
      font-weight: 600;
    }
    .news-content {
      width: 100%;
      text-indent: 2em;
      display: inline-block;
      line-height: 1.15rem;
      max-height: 4.6rem;
      overflow: hidden;
      position: relative;
      p{
        margin: 0px;
      }
      &.showDot:before{
        content: '...';
        position: absolute;
        display: block;
        right: 0px;
        line-height: 1.15rem;
        bottom: 0px;
        background: rgba(255,255,255,.9);
        text-align: center;
        text-indent: 0;
        width: 1.3em;
      }
    }
  }
</style>
