import nativeHttp from '../utils/nativeHttp';
import axios from 'axios';
const httpRequest = () => {
  if (nativeHttp.isNative()) {
    return nativeHttp;
  } else {
    return axios;
  }
};

export default {
  queryLastBook: async (baseBuy, counterSelling, optional = {}) => { // 最近成交/我的成交
    let options = {limit: 1, descending: true};
    optional.descending = options.descending;
    if (optional.limit) {
      options.limit = optional.limit;
    }
    let url = `https://data.ripple.com/v2/exchanges/${baseBuy.code}+${baseBuy.issuer}/${counterSelling.code}+${counterSelling.issuer}?limit=${optional.limit}&descending=${optional.descending}`;
    if (optional.forAccount) {
      url = `https://data.ripple.com/v2/accounts/${optional.forAccount}/exchanges?/${baseBuy.code}+${baseBuy.issuer}/${counterSelling.code}+${counterSelling.issuer}?limit=${optional.limit}&descending=${optional.descending}`;
    }
    let ret = await httpRequest().get(url);
    if (ret.status === 400) {
     return {data: []};
    }
    return ret.data;
  }
};
