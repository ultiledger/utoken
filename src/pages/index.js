import routes from './routes.config';
const install = function (Vue) {
  /* istanbul ignore if */
  if (install.installed) return;

  Vue.routesConfig = [...Vue.routesConfig, ...routes]; // 配置本业务模块的路由
};

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export default {
  install
};
