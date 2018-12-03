<template>
  <div class="no-recode-tip">
    <div class="tip-icon">
      <i class="wt wt-empty"></i>
    </div>
    <span class="tip-text" v-text="$t('common.emptyRecord')"></span>
  </div>
</template>
<script>
  import config from '../config';
  export default{
    name: config.prefix + 'EmptyBox'
  };
</script>
<style lang="scss" scoped>
  .no-recode-tip{
    padding-top: 20%;
    text-align: center;
    color: #999999;
    .tip-icon{
      > i{
        font-size: 80px;
      }
      height: 80px;
      margin-bottom: 10px;
    }
    .tip-text{
      font-size: 14px;
    }
  }
</style>
