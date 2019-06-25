import tokens from '../../wallet/tokens';
import axios from 'axios';
import store from '../store';
import Vue from "vue";
import getMarket from './market';
import {AccountType} from "../../wallet/constants";

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
      // 设置行情url
      if (config.data['mytoken-api']) {
        store.dispatch('setMyTokenApi',  config.data['mytoken-api']['url']);
        getMarket();
      }
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
        let tokenConfigs = tokens.get(item.type);
        switch (item.type) {
          case AccountType.ethereum:
            if (tokenConfigs) {
              tokenConfigs[item.symbol] = {
                symbol: item.symbol,
                name: item.name,
                displayName: item.name,
                decimals: item.decimals,
                address: item.address.toLocaleLowerCase(),
                abi: item.abi
              };
              tokens.set(tokenConfigs);
            }
            break;
          case AccountType.stellar:
            if (tokenConfigs) {
              tokenConfigs[item.symbol] = {
                name: item.name,
                assets: [{code:item.symbol,issuer:item.address,list:true}],
                logo:''
              };
              tokens.set(tokenConfigs);
            }
            break;
          case AccountType.ripple:
            if (tokenConfigs) {
              tokenConfigs[item.symbol] = {
                name: item.name,
                assets: [{code:item.symbol,issuer:item.address,list:true}],
                logo:''
              };
              tokens.set(tokenConfigs);
            }
            break;
        }

      });

    }
  }
};

