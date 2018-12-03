<template>
  <div style="position: relative;" :style="{height: fixHeight + 'px'}">
    <slot></slot>
  </div>
</template>
<script>
  /* 如果采用内容的方式,使用min-height */
  import config from '../config';
  export default {
    name: config.prefix + 'Header',
    props: {
      fixHeight: {
        type: Number,
        default: 46
      }
    },
    data () {
      return {};
    },
    methods: {
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss"  scoped>
  .contentBlock {
    overflow-y: auto;
  }
</style>
