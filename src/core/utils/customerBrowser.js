/*调用webview插件打开网页*/
export default {
  open (title, link) {
    // window.cordova.InAppBrowser.open(item.link, '_blank', 'location=yes');
    window.cordova.ThemeableBrowser.open(link, '_blank', {
      title: {
        staticText: title
      },
      browserProgress: {
        showProgress: true,
        progressBgColor: "#ffffff",
        progressColor: "#007e9c"
      },
      closeButton: {
        wwwImage: 'static/img/back.png',
        wwwImagePressed: 'static/img/back_pressed.png',
        wwwImageDensity: 2,
        align: 'left',
        event: 'backPressed'
      }
    });
  }
};
