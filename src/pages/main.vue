<template>
  <div style="width: 100%;">
    <transition :name="transitionClass">
      <keep-alive :include="['news-adv', 'assets', 'mine']">
        <router-view :style="{'overflow-y': 'auto', 'height': vHeight}"></router-view>
      </keep-alive>
    </transition>
    <bottom-bar v-if="showTabBar"></bottom-bar>
  </div>
</template>
<script>
import bottomBar from './ui/bottom-bar';
export default {
  components: {
    bottomBar
  },
  computed: {
    direction () {
      return this.$store.state.direction;
    },
    vHeight () {
      return (document.body.clientHeight - (this.showTabBar ? 46 : 0)) + 'px';
    },
    showTabBar () {
      return this.$store.state.curRouter.meta.showTabBar !== undefined ? this.$store.state.curRouter.meta.showTabBar : true;
    },
    transitionClass () {
      if (this.direction === 'forward') {
        return 'vux-pop-in';
      } else if (this.direction === 'reverse') {
        return 'vux-pop-out';
      }
      return '';
    }
  },
  created () {
  }
};
</script>

<style>
  .vux-demo {
    text-align: center;
  }
  .logo {
    width: 100px;
    height: 100px
  }
  html, body {
    height: 100%;
    width: 100%;
    overflow-x: hidden;
  }
  .vux-pop-out-enter-active,
  .vux-pop-out-leave-active,
  .vux-pop-in-enter-active,
  .vux-pop-in-leave-active {
    will-change: transform;
    transition: all 500ms;
    height: 100%;
    top: 0px;
    position: absolute;
    backface-visibility: hidden;
    perspective: 1000;
  }
  .vux-pop-out-enter {
    opacity: 0;
    transform: translate3d(-100%, 0, 0);
  }
  .vux-pop-out-leave-active {
    opacity: 0;
    transform: translate3d(100%, 0, 0);
  }
  .vux-pop-in-enter {
    opacity: 0;
    transform: translate3d(100%, 0, 0);
  }
  .vux-pop-in-leave-active {
    opacity: 0;
    transform: translate3d(-100%, 0, 0);
  }
</style>
