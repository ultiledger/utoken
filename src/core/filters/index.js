import replace from './replace.filter';
import date from './date.filter';
import longStrAbbr from './long-string.filter';
import market from './market.filter';
import cutTail from './cut-tail.filter';

const install = function (Vue) {
  /* istanbul ignore if */
  if (install.installed) return;

  Vue.filter('replace', replace);
  Vue.filter('date', date);
  Vue.filter('longStrAbbr', longStrAbbr);
  Vue.filter('market', market);
  Vue.filter('cutTail', cutTail);
};

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export default {
  install,
  replace
};
