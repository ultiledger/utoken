import Vue from 'vue';
import App from './App';
import i18n from './i18n';
import vantI18n from './i18n/vant-i18n';
import store from './core/store'; // vuex配置
import loadData from './collections';
import router from './core/router'; // vuex配置
import Filters from './core/filters'; // 自定义过滤器
import Vue2Filters from 'vue2-filters'; // 第三方过滤器，把vue1的过滤器移值到vue2 https://github.com/freearhey/vue2-filters
import './vant-config'; // 配置vant
import './validate.config'; // 配置表单校验
import config from './config';
import PlComponents from './components'; // 自定义组件
import 'src/assets/fonts/ult-icon/iconfont.css'; // 引入图标
import 'src/assets/scss/_index.scss';
import './assets/scss/_index.scss';
import './assets/scss/_reset.scss';
import VueClipboard from 'vue-clipboard2';
import backbuttonHandler from './core/utils/backbuttonHandler';
import coins from './wallet/coins';
import api from './core/api';
import getMarket from './core/utils/market';
import './core/mixins/dpr-img';

window.canBack = true;
process.versions = {};

// 使用业务模块 (注意不要随便移动位置，要放在安装api和路由之前),这里使用了业务模块的api
if (config && config.modules) {
  Object.keys(config.modules).map((item) => {
    Vue.use(config.modules[item]);
  });
}

Vue.use(VueClipboard);
Vue.use(Filters); // 使用自定义过滤器
Vue.use(Vue2Filters); // 使用过滤器
Vue.use(PlComponents);
Vue.use(router); // 使用路由
Vue.use(api);

// 获取行情
let SetMarketTimer = () => {
  getMarket();
  setInterval(() => {
    getMarket();
  }, 1000 * 60 * 5);
};

Vue.mixin({
  computed: {
    '$wallet' () {
      if (this.$store.state.account.type) {
        return coins[this.$store.state.account.type].wallet;
      }
      return null;
    }
  },
  methods: {
    getBalance(assetCode, issuer) {
      let balances = this.$store.state.balances[this.$store.state.account.address];
      let balance = {
        code: assetCode,
        issuer: issuer || '',
        value: 0
      };
      if (!balances) {
        return balance;
      }
      for (let i = 0, len = balances.length; i < len; i++) {
        let item = balances[i];
        if (item.code === assetCode && (!issuer || issuer === item.issuer)) {
          balance = item;
          break;
        }
      }
      return balance;
    }
  }
});


const initApp = () => {
  // 创建根组件
  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    template: '<app/>',
    i18n: i18n,
    components: {
      app: App
    },
    router: router.router.instance,
    store, // （缩写）相当于 store:store
    created () {
      this.$store.dispatch('initData');
    },
    computed: {
      language () {
        if (this.$store.state.setting) {
          return this.$store.state.setting.language;
        }
        return '';
      }
    },
    watch: {
      language (val) {
        vantI18n(val);
      }
    },
    mounted () {
      SetMarketTimer();
      let setting = this.$collecitons.setting.findSetting();
      if (!setting || !setting.defaultAddress) {
        return this.$router.push({name: 'guide'});
      } else {
        this.$i18n.locale = setting.language; /* 设置已经设置的语言*/
        vantI18n(setting.language); /* 设置已经设置的语言*/
        /* let currentAcct = this.$collecitons.account.findByAddress(setting.defaultAddress);
        if (currentAcct && currentAcct.identityId) {
          let identity = this.$collecitons.identity.findById(currentAcct.identityId);
          if (identity && !identity.backFlag) {
            return this.$router.push({name: 'back-mnemonicCode', params: {showVpop: true}});
          }
        } */
      }
    }
  });
};

if (process.env.NODE_ENV !== 'production') {
  loadData(() => {
    initApp();
  });
}
router.router.instance.afterEach(() => {
  backbuttonHandler.clearLayer();
});
document.addEventListener('deviceready', function () {
  // 需要deviceready之后
  document.addEventListener('backbutton', backbuttonHandler.handleBackbuttonEvent, false);
  loadData(() => {
    initApp();
  });
}, false);
