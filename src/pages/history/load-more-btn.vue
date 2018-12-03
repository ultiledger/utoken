<template>
  <div>
    <van-loading v-if="loading" style="margin: 0px auto;"/>
    <span v-else>
       <span class="x-small-font load-more" v-if="hasNext" @click="loadMore" v-text="$t('common.loadMore')"></span>
       <span class="x-small-font" v-else>~</span>
    </span>
  </div>
</template>
<script>
  export default{
    props: {
      hasNext: Boolean,
      loading: Boolean
    },
    methods: {
      loadMore () {
        this.$emit('load-more');
      }
    }
  };
</script>
<style lang="scss">
  .load-more{
    padding: 3px 10px;
    margin: 10px;
    display: inline-block;
    background: #fff;
    border-radius: 10px;
    text-align: center;
    color: #666;
  }
</style>
