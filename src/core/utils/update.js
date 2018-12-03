import { Toast  } from 'vant';
import axios from "axios/index";

export default {
  downloadAndInstall (vueInstance, url, targetPath) {
    let loading;
    return new window.Promise( (resolve, reject) => {
      loading = Toast.loading({
        mask: true,
        message: vueInstance.$t('setting.updateTip'),
        duration: 0
      });
      let downloadFile = () => {
        let ft = new window.FileTransfer();
        // 监听下载进度
        ft.onprogress = function (e) {
          if (e.lengthComputable) {
            if (e.loaded >= e.total) {
              loading.clear();
            } else {
              let percentage = Math.ceil(e.loaded / e.total * 100);
              loading = Toast.loading({
                mask: true,
                message: vueInstance.$t('setting.downloaded') + percentage + '%',
                duration: 0
              });
            }
          }
        };
        ft.download(url, targetPath,  () => {
          if (window.device.version.toString().replace(/\./g, '').substring(0, 1) >= 6) {
            window.resolveLocalFileSystemURL(targetPath,  (entry) => {
              let nativePath = entry.toURL();
              window.cordova.plugins.fileOpener2.open(nativePath, 'application/vnd.android.package-archive', {
                success () {
                  resolve();
                },
                error () {
                  reject();
                }
              });
            });
          } else {
            window.cordova.plugins.fileOpener2.open(targetPath, 'application/vnd.android.package-archive', {
              success () {
                resolve();
              },
              error () {
                reject();
              }
            });
          }
        }, () => {
          // 下载失败
          loading.clear();
          reject();
        },
        true,
        {});
      };
      // 检查权限
      let permissions = window.cordova.plugins.permissions;
      let checkPermissionCallback = (status) => {
        if (!status.hasPermission) {      // 未取得权限
            let errorCallback = () => {
              reject('Storage permission is not turned on');
            };
            permissions.requestPermission(
              permissions.READ_EXTERNAL_STORAGE,
              (status) => {
                if (!status.hasPermission) {
                  errorCallback();
                } else {
                  // continue with downloading/ Accessing operation 
                  downloadFile();
                }
              },
              errorCallback);
        } else {
          // 取得权限直接执行代码
          downloadFile();
        }
      };
      permissions.checkPermission(permissions.READ_EXTERNAL_STORAGE, checkPermissionCallback, (error) => {
        console.error(error);
      });
    });
  },
  checkUpdate (vueInstance, url) {
    return new window.Promise( (resolve, reject) => {
      /* if (window.device.platform === 'iOS') {
        reject(vueInstance.$t('setting.iOSUpdateTip'));
        return;
      } */
      axios.get(url).then(ret => {
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
      })
      .catch( () => {
        reject();
      });
    });
  }
};
