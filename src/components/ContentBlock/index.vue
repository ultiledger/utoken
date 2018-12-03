<template>
  <div class="content-block" :style="containerStyle">
    <slot></slot>
  </div>
</template>
<script>
  import config from '../config';
  export default {
    name: config.prefix + 'ContentBlock',
    props: {
      offsetTop: {
        type: Number,
        default: 0
      },
      offsetBottom: {
        type: Number,
        default: 0
      },
      heightType: {
        type: String,
        default: 'height'
      }
    },
    data () {
      return {
        containerStyle: {}
      };
    },
    methods: {
      setContainerStyle () {
        let cs = {
          width: '100%',
        };
        let wHeight = document.body.clientHeight - this.offsetTop - this.offsetBottom;
        cs[this.heightType] = wHeight + 'px';
        this.containerStyle = cs;
      }
    },
    mounted () {
      this.setContainerStyle();
      window.addEventListener('resize', this.setContainerStyle, false);
    },
    beforeDestroy () {
      window.removeEventListener('resize', this.setContainerStyle, false);
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss">
  .content-block{
    overflow-y: auto;
  }
</style>
