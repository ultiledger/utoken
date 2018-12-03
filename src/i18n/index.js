import VueI18n from 'vue-i18n';
import Vue from 'vue';
import store from '../core/store';
import {languages} from '../core/constants';

const currentLang = store.state.setting.language;

Vue.use(VueI18n);
let langMessages = {};
Object.keys(languages).forEach(key => {
  langMessages[key] = require(`./lang/${key}.json`);
});
let i18n = new VueI18n({
  locale: currentLang, /* 默认的 */
  messages: langMessages
});
export default i18n;
