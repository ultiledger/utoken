import Big from 'big.js';
import store from '../store';

const cutTail = (val) => {
  if (!val) {
    return 0;
  }
  let vaule = val + '';
  let index;
  for (let i = vaule.length; i > 0; i--) {
    let s = vaule[i - 1];
    if (s === '0') {
      continue;
    } else if (s === '.') {
      index = i - 1;
      break;
    } else {
      index = i;
      break;
    }
  }

  return vaule.substring(0, index);
};

export default function (value, assetCode, assetIssuer = '') {
  let markets = store.state.markets;
  if (assetCode && markets) {
    let key = assetIssuer ? `${assetCode}-${assetIssuer}` : assetCode;
    let market = markets[key];
    if (value && market && market.marketPrice) {
      let calVal = new Big(value).times(market.marketPrice);
      if (calVal > 1) {
        calVal = calVal.toFixed(2);
      } else {
        calVal = calVal.toFixed(4);
      }
      let index = calVal.indexOf('.');
      let decimal = calVal.substring(index);
      let integer = calVal.substring(0, index);
      let val = `${integer.replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g,'$&,')}${decimal}`;
      return cutTail(val);
    }
  }
  return 0;
}
