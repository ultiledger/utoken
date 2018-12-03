export default{
  isNative () {
    return window.cordovaHTTP ? true : false;
  },
  get (url) {
    return new Promise((resolve, reject) => {
      window.cordovaHTTP.get(url, {}, {},
        function(response) {
          response.data = JSON.parse(response.data);
          resolve(response);
      }, function(response) {
          reject(response);
      });
    });
  }
};
