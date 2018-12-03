import Vue from 'vue';
import VueRouter from 'vue-router';
import routes from './routes.config';
import store from '../store';
import * as types from '../store/mutation-types';
// import routerUtil from './router-util';

Vue.routesConfig = [];
let router = {instance: ''};

/**
 * 初始化路由方法
 */
function initRouter (Vue) {
  Vue.use(VueRouter);
  Vue.routesConfig = [...Vue.routesConfig, ...routes];
  // 创建 router 实例
  router.instance = new VueRouter({
    routes: Vue.routesConfig
  });
  // 把路由信息配置到vuex

  const history = window.sessionStorage;
  history.clear();

  // 如果是进入home路由，则判断是否登录，如果没有登录跳转登录页面
  router.instance.beforeEach((to, from, next) => {

    const toIndex = history.getItem(to.path);
    const fromIndex = history.getItem(from.path);

    if (to.meta.transition === false && (from.path === '/' || from.meta.transition === false)) {
      store.commit(types.SET_DIRECTION, '');
    } else {
      if (toIndex) {
        if (!fromIndex || parseInt(toIndex, 10) > parseInt(fromIndex, 10) || (toIndex === '0' && fromIndex === '0')) {
          store.commit(types.SET_DIRECTION, 'forward');
        } else {
          store.commit(types.SET_DIRECTION, 'reverse');
        }
      } else {
        store.commit(types.SET_DIRECTION, 'forward');
      }
    }

    // 判断是否存在需要授权的路由
    if (to.matched && to.matched.some(record => record.meta.requiresAuth)) {
      /* 暂时这样写 */
      store.commit(types.SET_CUR_ROUTER, to);
      store.commit(types.SET_PREVIOUS_ROUTER, from);
    }
    next();
  });
}

const install = function (Vue) {
  /* istanbul ignore if */
  if (install.installed) return;
  initRouter(Vue);// 执行初始化路由
};

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}


export default {
  install,
  router
};
