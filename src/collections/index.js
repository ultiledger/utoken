import Vue from 'vue';
import Loki from 'lokijs';
import LokiCordovaFSAdapter from 'loki-cordova-fs-adapter';
import account from './account';
import identity from './identity';
import asset from './asset';
import setting from './setting';
import address from './address';
import history from './history';
import assetConfig from './assetConfig';
import tempHistory from './tempHistory';

let adapter = new LokiCordovaFSAdapter({'prefix': 'loki'});
// const env = process.env.NODE_ENV;

// db = new Loki('walletDB', {
//   env: 'BROWSER',
//   autosave: true,
//   autosaveInterval: 500
// });

Vue.mixin({
  computed: {
    '$collecitons' () {
      return Vue.collecitons;
    }
  }
});

const loadData  = (callback) => {
  let db = null;
  const env = process.env.NODE_ENV;
  if (env === 'production') {
    db = new Loki('walletDB', {
      autosave: true,
      autosaveInterval: 3000,
      adapter: adapter
    });
  } else {
    db = new Loki('walletDB', {
      env: 'BROWSER',
      autosave: true,
      autosaveInterval: 500
    });
  }

  db.loadDatabase({}, () => {
    Vue.collecitons = {
      account: account.newInstance(db),
      identity: identity.newInstance(db),
      asset: asset.newInstance(db),
      setting: setting.newInstance(db),
      address: address.newInstance(db),
      history: history.newInstance(db),
      tempHistory: tempHistory.newInstance(db),
      assetConfig: assetConfig.newInstance(db)
    };
    callback();
  });
};
export default loadData;

