module.exports = {
  NODE_ENV: '"production"',
  // 使用此配置，会对所以的api请求的跟路径进行替换，
  // 比如/api/common/get-data => http://ip:port/bsp/common/get-data
  // 前后端一起部署的时候可以不配置ip和端口
  // 前后端分开部署的时候配置apiRootMap一定要指定后端定制的ip和端口，如果http://ip:port/bsp
  apiRootMap: {
  },
  // 前端静态文件的路径
  assetsPublicPath: '"/"'
};
