import * as types from './mutation-types';

export default {
  [types.SET_LOGIN_STATE] (state, value) {
    state.isLogin = value;
  },
  [types.SET_ROUTER_MAP] (state, value) {
    state.routerMap = value;
  },
  [types.SET_PREVIOUS_ROUTER] (state, value) {
    state.previousRouter = value;
  },
  [types.SET_CUR_ROUTER] (state, value) {
    state.curRouter = value;
  },
  [types.SET_DIRECTION] (state, value) {
    state.direction = value;
  },
  [types.SET_ACCOUNT] (state, value) {
    state.account = value;
  },
  [types.SET_SETTING] (state, value) {
    state.setting = value;
  },
  [types.SET_BALANCES] (state, value) {
    state.balances = value;
  },
  [types.SET_NETWORK] (state, value) {
    state.setting.network = value;
  },
  [types.SET_MARKET] (state, value) {
    state.markets = value;
  },
  [types.SET_CURRENCY_UNIT] (state, value) {
    state.setting.currencyUnit = value;
  },
  [types.SET_LANGUAGE] (state, value) {
    state.setting.language = value;
  },
  [types.SET_GESTUREPWD] (state, value) {
    state.setting.gesturePwd = value;
  },
  [types.SET_GESTUREPWD] (state, value) {
    state.setting.gesturePwd = value;
  },
  [types.SET_ACTIVATED_MAP] (state, value) {
    state.activatedMap = value;
  },
  [types.SET_DEFAULT_ADDRESS] (state, value) {
    state.setting.defaultAddress = value;
  },
  [types.SET_PASSWORD_MAP] (state, value) {
    state.passwordMap = value;
  },
  [types.SET_TOKEN_CONFIG] (state, value) {
    state.setting.tokenConfig = value;
  },
  [types.SET_PRIVACY_MODE] (state, value) {
    state.setting.privacyMode = value;
  },
  [types.SET_APP_VERSION] (state, value) {
    state.setting.appVersion = value;
  },
  [types.SET_MYTOKEN_API] (state, value) {
    state.setting.mytokenApi = value;
  }
};
