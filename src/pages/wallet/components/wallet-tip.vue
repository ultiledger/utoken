<template>
  <div class=" text-tip normal-font">{{tip}}</div>
</template>
<script>
  export default {
    props: {
      tip: String
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
  .text-tip {
    color: #8795a1;
    padding-left: 20px;
    padding-top: 10px;
    padding-bottom: 20px;
  }
</style>
