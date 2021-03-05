import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './actions';
import mutations from './mutations';
import {AccountType} from 'src/wallet/constants';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

const state = {
  isLogin: false,
  routerMap: {}, // 系统启动的时候自动生成
  previousRouter: {}, // 前路由； 路由切换的时候，自动生成
  curRouter: {}, // 当前路由； 路由切换的时候，自动生成
  direction: 'forward', // 路由方向
  account: {},
  balances: {},
  activatedMap: {},
  markets: {}, // 行情
  passwordMap: {}, // 密码映射
  network: {
    [AccountType.stellar]: [
      {value: 'https://horizon.stellar.org', type: 'public'},
      {value: 'https://h.fchain.io', type: 'public'},
      {value: 'https://horizon-testnet.stellar.org', type: 'test'}
    ],
    [AccountType.ripple]: [
      {value: 'wss://xrplcluster.com', type: 'public'},
      {value: 'wss://ws.foxcny.com', type: 'public'},
      {value: 'wss://ws2.foxcny.com', type: 'public'},
      {value: 'wss://s1.ripple.com', type: 'public'},
      {value: 'wss://s-east.ripple.com', type: 'public'},
      {value: 'wss://s-west.ripple.com', type: 'public'},
      {value: 'wss://s2.ripple.com', type: 'public'},
      {value: 'wss://s.altnet.rippletest.net:51233', type: 'test'},
      {value: 'wss://s.devnet.rippletest.net:51233', type: 'test'}
    ],
    [AccountType.ethereum]: [
      // {value: 'https://mainnet.infura.io/', type: 'public'},
      // {value: 'https://rinkeby.infura.io/', type: 'test'}
      {value: 'wss://ethapi.foxcny.com/ws/v3/508b5431b89041d18256f8d7d91558d1', type: 'public'},
      {value: 'wss://mainnet.infura.io/ws/v3/508b5431b89041d18256f8d7d91558d1', type: 'public'},
      //{value: 'https://mainnet-eth.token.im/', type: 'public'},
      {value: 'wss://rinkeby.infura.io/ws', type: 'test'} 
    ],
    [AccountType.bitcoin]: [
      {value: 'https://blockchain.info', type: 'public'},
      {value: 'https://testnet.blockchain.info', type: 'test'}
    ]
  },
  setting: {
    id: '1',
    appVersion: '1.0.0',
    language: 'zh-CN',
    defaultAddress: '',
    currencyUnit: 'CNY',
    gesturePwd: '',
    tokenConfig: {},
    privacyMode: false,
    mytokenApi: 'https://api.mytokenapi.com', // mytoken-api获取行情
    network: {
      [AccountType.stellar]: 'https://horizon.stellar.org',
      [AccountType.ripple]: 'wss://xrplcluster.com',
      [AccountType.ethereum]: 'wss://mainnet.infura.io/ws/v3/508b5431b89041d18256f8d7d91558d1',
      [AccountType.bitcoin]: 'https://blockchain.info'
    }
  }
};

export default new Vuex.Store({
  state,
  actions,
  mutations,
  strict: debug
});
