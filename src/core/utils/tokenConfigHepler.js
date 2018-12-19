import tokens from '../../wallet/tokens';
import axios from 'axios';
import store from '../store';
import Vue from "vue";
import getMarket from './market';

export default {
  async settingConfig () {
    let obj = await axios.get('https://ultiledger.github.io/hd-wallet/pages/config_version.json');
    let setting = Vue.collecitons.setting.findSetting();
    let flag = true;
    if (setting) {
      flag = !setting.tokenConfig || !setting.tokenConfig.version || setting.tokenConfig.version !== obj.data.version;
    }
    let config = await axios.get('https://ultiledger.github.io/hd-wallet/pages/config.json');
    // 设置行情url
    if (config.data['mytoken-api']) {
      store.dispatch('setMyTokenApi',  config.data['mytoken-api']['url']);
      getMarket();
    }
    if (flag) {
      let tokenCofing = {
        version: obj.data.version,
        config: config.data
      };
      store.dispatch('setTokenConfig',  tokenCofing);
    } else {
      tokens.set(setting.tokenConfig.config);
      // 把新增的合约加载到内存
      let assetConfigs = Vue.collecitons.assetConfig.findAll();
      assetConfigs.forEach(item => {
        let tokenconfigs = tokens.get(item.type);
        if (tokenconfigs) {
          tokenconfigs[item.symbol] = {
            symbol: item.symbol,
            name: item.name,
            displayName: item.name,
            decimals: item.decimals,
            address: item.address.toLocaleLowerCase(),
            abi: item.abi
          };
          tokens.set(tokenconfigs);
        }
      });

    }
  }
};

