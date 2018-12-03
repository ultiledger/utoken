import tokens from '../../wallet/tokens';
import axios from 'axios';
import store from '../store';
import Vue from "vue";

export default {
  async settingConfig () {
    let obj = await axios.get('https://ultiledger.github.io/hd-wallet/pages/config_version.json');
    let setting = Vue.collecitons.setting.findSetting();
    let flag = true;
    if (setting) {
      flag = !setting.tokenConfig || !setting.tokenConfig.version || setting.tokenConfig.version !== obj.data.version;
    }
    if (flag) {
      let config = await axios.get('https://ultiledger.github.io/hd-wallet/pages/config.json');
      let tokenCofing = {
        version: obj.data.version,
        config: config.data
      };
      store.dispatch('setTokenConfig',  tokenCofing);
    } else {
      tokens.set(setting.tokenConfig.config);
    }
  }
};

