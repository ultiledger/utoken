<template>
  <div :style="{height: elHeight}" class="stick">
    <div class="stick-bottom" >
      <slot></slot>
    </div>
  </div>
</template>
<script>
  import config from '../config';
  function getScroll (target, top) {
    const prop = top ? 'pageYOffset' : 'pageXOffset';
    const method = top ? 'scrollTop' : 'scrollLeft';

    let ret = target[prop];

    if (typeof ret !== 'number') {
      ret = window.document.documentElement[method];
    }

    return ret;
  }

  function getOffset (element) {
    const rect = element.getBoundingClientRect();

    const scrollTop = getScroll(window, true);
    const scrollLeft = getScroll(window);

    const docEl = window.document.body;
    const clientTop = docEl.clientTop || 0;
    const clientLeft = docEl.clientLeft || 0;

    return {
      top: rect.top + scrollTop - clientTop,
      left: rect.left + scrollLeft - clientLeft
    };
  }
  export default{
    name: config.prefix + 'Stick',
    data () {
      return {
        elHeight: 'auto'
      };
    },
    mounted () {
      const scrollTop = getScroll(window, true);
      const elOffset = getOffset(this.$el);
      const windowHeight = window.innerHeight;
      const elHeight = this.$el.getElementsByTagName('div')[0].offsetHeight;
      if ((elOffset.top + elHeight) > (scrollTop + windowHeight)) {
        this.elHeight = elHeight + 'px';
      }
    }
  };
</script>
<style  lang="scss" rel="stylesheet/scss" scoped>
  .stick {
    margin-top: 10px;
    .stick-bottom {
      background: rgba(255,255,255,0.8);
      width: 100%;
      z-index: 1;
      left:0;
      bottom: 0;
      position: fixed;
    }
  }
</style>
