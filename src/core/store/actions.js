import * as types from './mutation-types';
import coins from '../../wallet/coins';
import getMarket from '../utils/market';
import tokenConfigHepler from '../utils/tokenConfigHepler';
import initScript from '../utils/initScript';
import Vue from 'vue';
// import {toast} from 'vant';

/**
 * 更新当前账号
 * @param commit
 * @param state
 * @param dispatch
 * @param account
 */
export const setAccount = async ({commit, state, dispatch}, account) => {
  let tempAccount = {...state.account};
  let setBalance = account.setBalance;
  delete account.setBalance;
  if (!tempAccount.type || tempAccount.type !== account.type) {
    coins[account.type].wallet.setServer(state.setting.network[account.type]);
  }
  // commit(types.SET_ACCOUNT, JSON.parse(JSON.stringify(account)));
  // await dispatch('setActivated', account);
  // account.isActivated = activated;
  commit(types.SET_ACCOUNT, JSON.parse(JSON.stringify(account)));
  Vue.collecitons.setting.updateSetting(setting => {
    return setting.defaultAddress = account.address;
  });
  if (setBalance === false) {
    return;
  }
  dispatch('setBalances', account.address);
};

/**
 * 设置网络
 * @param commit
 * @param state
 * @param dispatch
 * @param type
 * @param url
 */
export const setNetwork = async ({commit, state, dispatch}, {type, url, accounts}) => {
  let network = {...state.setting.network};
  if (url === network[type] ) {
    return;
  }
  network[type] = url;
  commit(types.SET_NETWORK, network);
  Vue.collecitons.history.removeHistory({acctType: type});
  // if (type === state.account.type) {
  //   coins[type].wallet.destroy();
  //   coins[type].wallet.setServer(url);
  //   await this.dispatch('setActivated', account);
  //   dispatch('setBalances', state.account.address);
  // }
  coins[type].wallet.destroy();
  coins[type].wallet.setServer(url);
  accounts.forEach((item) => {
    dispatch('setBalances', item.address);
  });
};

/**
 * 设置余额
 * @param commit
 * @param adress
 */
export const setActivated =  async ({commit, state}, {type, address}) => {
  let activated = await coins[type].wallet.isActivated(address);
  let activatedMap = {};
  activatedMap = JSON.parse(JSON.stringify(state.activatedMap));
  activatedMap[address] = activated;
  commit(types.SET_ACTIVATED_MAP, activatedMap);
  return activated;
};

/**
 * 设置余额
 * @param commit
 * @param adress
 */
export const setBalances =  ({commit, state, dispatch}, params) => {
  // console.info(params);
  let address, type;
  if (typeof params === 'string') {
    address = params;
    type = state.account.type;
  } else {
    address = params.address;
    type = params.type;
  }
  return new Promise(async (resolve, reject) => {
    let assets = Vue.collecitons.asset.findByAddress(address);
    let assetCodes = assets.map(item => {
      return item.code;
    });
    let account = {...state.account};
    // if (!state.activatedMap[account.address]) {
      await dispatch('setActivated', account);
    // }
    coins[type].wallet.getBalances(address, assetCodes).then( ret => {
      let balances = {};
      if (state.balances) {
        balances = JSON.parse(JSON.stringify(state.balances));
      }
      balances[address] = ret;
      commit(types.SET_BALANCES, balances);
      // if (!state.activatedMap[account.address]) {
      //   await dispatch('setActivated', account);
      // }
      resolve();
    }).catch(err => {
      reject(err);
    });
  });
};



/**
 * 设置余额
 * @param commit
 * @param adress
 */
export const setSetting = ({commit}, setting) => {
  let tempSetting = Vue.collecitons.asset.findByAddress();
  if (tempSetting) {
    Object.keys(setting).forEach(key => {
      tempSetting[key] = setting[key];
    });
  } else {
    tempSetting = setting;
  }
  commit(types.SET_SETTING, JSON.parse(JSON.stringify(tempSetting)));
};

/**
 * 设置手势密码
 * @param commit
 * @param gesturePwd
 */
export const setGesturePwd = ({commit}, gesturePwd) => {
  commit(types.SET_GESTUREPWD, gesturePwd);
};

/**
 * 设置余额
 * @param commit
 * @param adress
 */
export const initData = ({commit, state, dispatch}) => {
  let setting = Vue.collecitons.setting.findSetting();
  if (setting && setting.defaultAddress) {
    let updateSetting = JSON.parse(JSON.stringify(setting));
    commit(types.SET_SETTING, updateSetting);
    doInitScript(updateSetting, dispatch);
    let account = Vue.collecitons.account.findByAddress(setting.defaultAddress);
    dispatch('setAccount', account);
  } else {
    setting = {...state.setting};
    Vue.collecitons.setting.insertSetting(JSON.parse(JSON.stringify(setting)));
  }
  tokenConfigHepler.settingConfig();

  // 设置比特币的默认网络
  coins['bitcoin'].wallet.setServer(state.setting.network['bitcoin']);
};


const doInitScript = (setting, dispatch) => {
  Vue.collecitons.history.removeHistory({acctType: 'stellar'});
  if (!window.cordova || !window.cordova.getAppVersion) {
    return;
  }
  window.cordova.getAppVersion.getVersionNumber().then( (version) => {
    console.info('setting.appVersion', setting.appVersion);
    console.info('appVersion', version);
    if (version !== setting.appVersion) {
      dispatch('setAppVersion', version);
      initScript.done();
    }
  });
  // let version = window.cordova.getAppVersion.getVersionNumber();
  // if (version !== setting.appVersion) {
  //   dispatch('setAppVersion', version);
  //   initScript.done();
  // }
};

/**
 * 设置行情
 * @param commit
 * @param market
 */
export const setMarket = ({commit, state}, market) => {
  let markets = JSON.parse(JSON.stringify(state.markets));
  Object.keys(market).forEach(key => {
    markets[key] = market[key];
  });
  commit(types.SET_MARKET, markets);
};


/**
 * 设置密码映射
 * @param commit
 * @param market
 */
export const setPasswordMap = ({commit, state}, passwordMapObj) => {
  let passwordMap = JSON.parse(JSON.stringify(state.passwordMap));
  if (!passwordMapObj) {
    console.info('clear password');
    commit(types.SET_PASSWORD_MAP, {});
    return;
  }
  Object.keys(passwordMapObj).forEach(key => {
    passwordMap[key] = passwordMapObj[key];
  });
  commit(types.SET_PASSWORD_MAP, passwordMap);
};

/**
 * 设置货币单位
 * @param commit
 * @param currencyUnit
 */
export const setCurrencyUnit = ({commit}, currencyUnit) => {
  commit(types.SET_CURRENCY_UNIT, currencyUnit);
  getMarket();
};

/**
 * 设置语种
 * @param commit
 * @param value
 */
export const setLanguage = ({commit}, value) => {
  commit(types.SET_LANGUAGE, value);
};
/**
 * 退出钱包的时候设置默认地址为空
 * @param commit
 * @param value
 */
export const setDefaultAddress = ({commit}, value) => {
  commit(types.SET_DEFAULT_ADDRESS, value);
};

/**
 * 设置币种配置
 * @param commit
 * @param value
 */
export const setTokenConfig = ({commit}, value) => {
  Vue.collecitons.setting.updateSetting(setting => {
    return setting.tokenConfig = value;
  });
  commit(types.SET_TOKEN_CONFIG, value);
};

/**
 * 设置隐私模式
 * @param commit
 * @param value
 */
export const setPrivacyMode = ({commit}, value) => {
  Vue.collecitons.setting.updateSetting(setting => {
    return setting.privacyMode = value;
  });
  commit(types.SET_PRIVACY_MODE, value);
};

/**
 * 设置app版本
 * @param commit
 * @param value
 */
export const setAppVersion = ({commit}, value) => {
  Vue.collecitons.setting.updateSetting(setting => {
    return setting.appVersion = value;
  });
  commit(types.SET_APP_VERSION, value);
};

/**
 * 设置请求行情的api地址
 * @param commit
 * @param value
 */
export const setMyTokenApi = ({commit}, value) => {
  commit(types.SET_MYTOKEN_API, value);
};
