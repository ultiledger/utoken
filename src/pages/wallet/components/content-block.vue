<template>
  <div class="content-block" :style="{'min-height': minHeight, 'padding-bottom': paddingBottom}">
    <slot></slot>
  </div>
</template>
<script>
  export default {
    props: {
      minHeight: String,
      paddingBottom: String
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
  .content-block {
    /*padding-bottom: 30px;*/
    /*padding-top: 10px;*/
  }
</style>
