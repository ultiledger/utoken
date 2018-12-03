import router from '../router';
// import { Toast } from 'vant';
import Vue from 'vue';

let layers = [];
const exitApp = () => {
  navigator.app.exitApp();
};

Vue.mixin({
  methods: {
    addLayer (target) {
      layers.push(target);
    },
    clearLayer () {
      layers = [];
    },
    removeLayer () {
      layers.splice(layers.length - 1, 1);
    }
  },
  watch: {
    value (val) {
      let componentTag = this.$options._componentTag;
      let components = ['van-popup', 'van-actionsheet'];
      if (components.indexOf(componentTag) !== -1) {
        if (val) {
          this.addLayer({type: componentTag, target: this, close: this.close});
        } else {
          this.removeLayer();
        }
      }
    }
  }
});
export default {
  handleBackbuttonEvent () {
    if (!window.canBack) {
      return;
    }
    if (layers && layers.length > 0) {
      layers[layers.length - 1].close();
      return;
    }

    let currentRoute = router.router.instance.currentRoute;
    if (currentRoute.meta.canBack === false) {
      // Toast('再点击一下退出');
      document.addEventListener('backbutton', exitApp, false); // 绑定退出事件
      // 3秒后重新注册
      let intervalID = window.setInterval(() => {
        window.clearInterval(intervalID);
        document.removeEventListener('backbutton', exitApp, false); // 注销返回键
        document.addEventListener('backbutton', this.handleBackbuttonEvent, false); // 返回键
      }, 3000);
    } else {
      if (currentRoute.params.lastRouterName && currentRoute.params.lastRouterName !== '') {
        router.router.instance.push({name: currentRoute.params.lastRouterName, params: currentRoute.params});
      } else {
        router.router.instance.back();
      }
    }
  },
  clearLayer () {
    layers = [];
  }
};
