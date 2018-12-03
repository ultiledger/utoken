import Vue from 'vue';
Vue.mixin({
  methods: {
    dprImg (imgPath) {
      let dpr = Math.round(window.devicePixelRatio ? window.devicePixelRatio : 1);
      let index = imgPath.lastIndexOf('.');
      if (dpr === 1) {
        return `static/img/${imgPath}`;
      } else if (dpr === 2) {
        return `static/img/${imgPath.substring(0, index)}@2x.${imgPath.substring(index + 1)}`;
      } else {
        return `static/img/${imgPath.substring(0, index)}@3x.${imgPath.substring(index + 1)}`;
      }
    }
  }
});
