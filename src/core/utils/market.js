import store from '../store';
import coins from 'src/wallet/coins';
import axios from "axios/index";
import nativeHttp from '../utils/nativeHttp';
import Big from 'big.js';
import {CoinType, AccountType} from "../../wallet/constants";

const env = process.env.NODE_ENV;

const httpGet = (url) => {
  if (nativeHttp.isNative()) {
    return nativeHttp.get(url);
  } else {
    return axios.get(url);
  }
};

/**
 * 获取行情
 * @param token
 * @returns {Promise<void>}
 */
async function getBaseMarket () {
  let assets = getBaseAssets();
  let currencyUnit = store.state.setting.currencyUnit;
  // console.info(assets);
  for (const asset of assets) {
    // console.info(asset);
    // await new Promise(resolve => {
    let assetCode, assetIssuer;
    if (typeof asset === 'string') {
      assetCode = asset;
      assetIssuer = '';
    } else {
      assetCode = asset.symbol;
      assetIssuer = asset.address;
    }
    let url = `mytoken-api/ticker/search?category=currency&keyword=${assetCode}&timestamp=1540258888182&code=b7c1a42b4f643c01eb1eb85d85fc03a7&platform=web_pc&v=1.0.0&language=zh_CN&legal_currency=${currencyUnit}`;
    if (env === 'production') {
      url = `${store.state.setting.mytokenApi}/ticker/search?category=currency&keyword=${assetCode}&timestamp=1540258888182&code=b7c1a42b4f643c01eb1eb85d85fc03a7&platform=web_pc&v=1.0.0&language=zh_CN&legal_currency=${currencyUnit}`;
    }
    let markets = {};
    httpGet(url).then(ret => {
      if (ret.status === 200) {
        let resultDatas = ret.data;
        if (resultDatas.code === 0&& resultDatas) {
          let datas = resultDatas.data;
          if (datas && datas.length > 0) {
            let data = datas.filter(item => {
              return item.symbol === assetCode;
            });
            if (data && data.length > 0) {
              let key = assetCode;
              if (assetIssuer) {
                key = `${assetCode}-${assetIssuer}`;
              }
              markets[key] = {
                currencyUnit: currencyUnit,
                alias: data[0].alias,
                name: data[0].name,
                marketPrice: data[0].legal_currency_price
              };
              if (assetCode === CoinType.XLM) {
                getStellarAseetsMarket (data[0].legal_currency_price);
              }
              if (assetCode === CoinType.XRP) {
                getRippleAssetsMarket(data[0].legal_currency_price);
              }
              store.dispatch('setMarket', markets);
              // resolve(ret);
            }
          }
        }
      }
    });
    // });
  }
}

async function getRippleAssetsMarket (basePrice) {
  let currencyUnit = store.state.setting.currencyUnit;
  let assets = getRippleAssets();
  assets.forEach(item => {
    let key = `${item.code}-${item.issuer}`;
    let name = `${AccountType.ripple} - ${item.code}(${item.name})`;
    let url = `https://data.ripple.com/v2/exchanges/${item.code}+${item.issuer}/XRP?limit=1&descending=true`;
    let markets = {};
    httpGet(url).then(ret => {
      if (ret.status !== 200) {
        return;
      }
      if (ret.data.count > 0) {
        markets[key] = {
          currencyUnit: currencyUnit,
          name: name,
          marketPrice: 0
        };
        let xrpPrice = new Big(ret.data.exchanges[0].rate);
        markets[key].marketPrice = xrpPrice.times(basePrice).toString();
        store.dispatch('setMarket', markets);
      }
    });
  });
}

// async function getStellarAseetsMarket2 (basePrice) {
//   let url = `https://api.stellarterm.com/v1/ticker.json`;
//   let assets = getStellarAssets();
//   let currencyUnit = store.state.setting.currencyUnit;
//   axios.get(url).then(ret => {
//        if (ret.status !== 200) {
//          return;
//        }
//     let retMarkets = {};
//     ret.data.assets.forEach(item => {
//       retMarkets[item.id] = item;
//     });
//     let markets = {};
//     assets.forEach(item => {
//       let key = `${item.code}-${item.issuer}`;
//       let name = `${AccountType.stellar} - ${item.code}(${item.name})`;
//       let market = retMarkets[key];
//       if (market) {
//         let xlmPrice = new Big(market.price_XLM);
//         markets[key] = {
//           currencyUnit: currencyUnit,
//           name: name,
//           marketPrice: xlmPrice.times(basePrice).toString()
//         };
//         store.dispatch('setMarket', markets);
//       }
//     });
//   });
// }

/**
 * 获取setellar行情
 * @param basePrice
 * @returns {Promise<void>}
 */
async function getStellarAseetsMarket (basePrice) {
  let url = `ticker.stellar.org-api`;
  if (env === 'production') {
    url = `http://ticker.stellar.org/`;
  }
  let assets = getStellarAssets();
  let currencyUnit = store.state.setting.currencyUnit;
  httpGet(url).then(ret => {
    if (ret.status !== 200) {
      return;
    }
    let retMarkets = {};
    ret.data.pairs.forEach(item => {
      retMarkets[item.name] = item;
    });
    let markets = {};
    assets.forEach(item => {
      let key = `${item.code}-${item.issuer}`;
      let key2 = `${CoinType.XLM}_${item.code}`;
      let name = `${AccountType.stellar} - ${item.code}(${item.name})`;
      let market = retMarkets[key2];
      // console.info(market);
      if (market) {
        let xlmPrice;
        if (new Big(market.price).eq(0)) {
          xlmPrice = new Big(0);
        } else {
          xlmPrice = new Big(1).div(market.price);
        }
        markets[key] = {
          currencyUnit: currencyUnit,
          name: name,
          marketPrice: xlmPrice.times(basePrice).toString()
        };
        store.dispatch('setMarket', markets);
      }
    });
  });
}


/**
 * 获取stellar资产数组
 * @returns {Array}
 */
let stellarAssets = null;
function getStellarAssets () {
  if (stellarAssets) {
    return stellarAssets;
  }
  stellarAssets = [];
  if (coins[AccountType.stellar].tokens) {
    let tokens = coins[AccountType.stellar].tokens();
    Object.keys(tokens).forEach(item => {
      let gateway = tokens[item];
      if (gateway.assets && gateway.assets.length > 0) {
        gateway.assets.forEach(item => {
          if (item.list) {
            stellarAssets.push({
              code: item.code,
              issuer: item.issuer,
              name: gateway.name
            });
          }
        });
      }
    });
  }
  return stellarAssets;
}


/**
 * 获取ripple资产数组
 * @returns {Array}
 */
let rippleAssets = null;
function getRippleAssets () {
  if (rippleAssets) {
    return rippleAssets;
  }
  rippleAssets = [];
  if (coins[AccountType.ripple].tokens) {
    let tokens = coins[AccountType.ripple].tokens();
    Object.keys(tokens).forEach(item => {
      let gateway = tokens[item];
      if (gateway.assets && gateway.assets.length > 0) {
        gateway.assets.forEach(item => {
          if (item.list) {
            rippleAssets.push({
              code: item.code,
              issuer: item.issuer,
              name: gateway.name
            });
          }
        });
      }
    });
  }
  return rippleAssets;
}

/**
 * 获取基础资产数组
 * @returns {Array}
 */
let baseAssets = null;
function getBaseAssets () {
  if (baseAssets) {
    return baseAssets;
  }
  baseAssets = [];
  Object.keys(coins).forEach(key => {
    let coin = coins[key];
    baseAssets.push(coin.symbol);
    if (CoinType.ETH === coin.symbol) {
      Object.keys(coin.tokens()).forEach(key => {
        baseAssets.push(coin.tokens()[key]);
      });
    }
  });
  return baseAssets;
}


function getMarket () {
  getBaseMarket();
}

export default getMarket;
