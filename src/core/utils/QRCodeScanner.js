
export default{
  scan (vueInstance) {
    return new window.Promise((resolve, reject) => {
      if (!(window.cordova && window.cordova.plugins.gizscanqrcode)) {
        reject(vueInstance.$t('assets.scanDeviceError'));
      }
      window.cordova.plugins.gizscanqrcode.scan(
        {//全部参数
          'baseColor': '#4e8dec',             //(边框、按钮、导航栏等背景颜色，优先级最低，单独设置可覆盖)

          //bar
          "title": vueInstance.$t('assets.scanTitle'),                 //(标题文字)
          'barColor': '#2d2d2d',               //(导航栏颜色)
          'statusBarColor': 'white',          //(状态栏字体颜色 white为白，不填为默认)

          //describe string
          'describe': vueInstance.$t('assets.scanTip'),            //(提示用户文字，支持 \n 换行，多行文字需注意小屏幕设备适配问题)
          'describeFontSize': '15',          //(字体大小)
          'describeLineSpacing': '8',        //(行间距)
          'describeColor': '#ffffff',         //(文字颜色)

          //scan border
          'borderColor': '#4e8dec',           //(扫描框颜色)
          'borderScale': '0.6',              //(边框大小，0.1 ~ 1)

          //flashlight
          'flashlightEnable': 'true'         //(支持手电筒, 默认false)
        },
        (resp) => {
          let result = JSON.parse(resp).result;
          let rs = {};
          if (result.indexOf('&') >= 0) {
            let pairs = result.split("&"); // Break at ampersand
            for (let i = 0; i < pairs.length; i++) {
              let pos = pairs[i].indexOf('=');
              if (pos == -1) continue;
              let argname = pairs[i].substring(0, pos);
              let value = pairs[i].substring(pos + 1);
              value = decodeURIComponent(value);
              rs[argname] = value;
            }
          } else {
            rs.address = result;
          }
          resolve(rs);
        },
        (error) => {
          console.error(error);
        }
      );
    });
  }
};
