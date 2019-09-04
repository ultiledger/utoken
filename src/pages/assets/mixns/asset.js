import coins from 'src/wallet/coins';
import { AccountType } from '../../../wallet/constants';

export default {
  methods: {
    getConfigAssets(type) {
      let coin = coins[type];
      let ret = [];
      switch (type) {
        case AccountType.ethereum:
          Object.keys(coin.tokens()).forEach(key => {
            let token = coin.tokens()[key];
            let item = {
              code: token.symbol,
              name: token.name,
              issuer: token.address
            };
            ret.push(item);
          });
          return ret;
        case AccountType.ripple: {
          let cr = coin.tokens();
          Object.keys(cr).forEach(key => {
            let gateway = coin.tokens()[key];
            gateway.assets.forEach(item => {
              if (item.list) {
                ret.push({
                  code: item.code,
                  issuer: item.issuer,
                  name: gateway.name,
                  logo: gateway.logo
                });
              }
            });
          });
          return ret;
        }
        case AccountType.stellar: {
          let cs = coin.tokens();
          Object.keys(cs).forEach(key => {
            let gateway = coin.tokens()[key];
            gateway.assets.forEach(item => {
              if (item.list) {
                ret.push({
                  code: item.code,
                  issuer: item.issuer,
                  name: gateway.name,
                  logo: gateway.logo
                });
              }
            });
          });
          return ret;
        }
        default:
          return [];
      }
    },
    getConfigAssetsMap(type) {
      let assets = this.getConfigAssets(type);
      let assetsMap = {};
      assets.forEach(item => {
        assetsMap[item.code + (item.issuer || '')] = item;
      });

      return assetsMap;
    }
  }
};
