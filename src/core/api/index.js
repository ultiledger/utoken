import Vue from 'vue';
import axios from 'axios';
import configJS from '../../config';
Vue.api = {
  checkUpdate (updateUrl) {
    return new window.Promise((resolve, reject) => {
      if (!(window.cordova && window.cordova.getAppVersion)) {
        reject();
        return;
      }
      axios.get(updateUrl).then(ret => {
        ret = ret.data;
        window.cordova.getAppVersion.getVersionNumber().then( (version) => {
          let curVersion = version.toString().replace(/\./g, '');
          if (ret && ret.tag_name) {
            let remoteVersion = ret.tag_name.toString().replace(/\./g, '');
            if (window.parseInt(remoteVersion) > window.parseInt(curVersion)) {
              resolve(ret);
            } else {
              reject();
            }
          } else {
            reject();
          }
        });
      }).catch( (error) => {
        reject(error);
      });
    });
  },
  async getNews (params) {
    let url = `https://news.ultiledger.io/index.php/wp-json/wp/v2/posts`;
    let ret = await axios.get(url, {params: params});
    return new Promise((resolve) => {
      if (ret.status === 400) {
        resolve({data: []});
      } else {
        let datas = ret.data.map(item => {
          this.getNewImgUrl(item.featured_media).then(imgUrl => {
            item.imgUrl = imgUrl;
          });
          return item;
        });
        resolve({data: datas});
      }
    });
  },
  getNewsDetail (newsId) {
    let url = `https://news.ultiledger.io/index.php/wp-json/wp/v2/posts/${newsId}`;
    return axios.get(url).then(ret => {
      return ret.data;
    });
  },
  async getNewImgUrl (featuredMedia) {
    let url = `https://news.ultiledger.io/index.php/wp-json/wp/v2/media/${featuredMedia}`;
    let ret = await axios.get(url);
    return ret.data.source_url;
  },
  async getTokenCofing () {
    try {
      let config = await axios.get(configJS.configUrl+'?timestamp='+(new Date().getTime()));
      return config.data;
    } catch (e) {
      //console.error(e);
      return null;
    }
  }
};

const install = (Vue) => {
  if (install.installed) {
    return;
  }

  Object.defineProperties(Vue.prototype, {
    $api: {
      get () {
        return Vue.api;
      }
    }
  });
};

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(install);
}

export default {
  install
};
