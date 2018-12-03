// see http://vuejs-templates.github.io/webpack for documentation.
var path = require('path');
var prodEnv = require('./prod.env');
var devEnv = require('./dev.env');

module.exports = {
  common: {projectName: '"ulti-wallet-mobile"',title: 'ult钱包'},
  build: {
    env: prodEnv,
    index: path.resolve(__dirname, '../dist/index.html'),
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: prodEnv.assetsPublicPath,
    productionSourceMap: true,
    productionGzip: false,
    productionGzipExtensions: ['js', 'css']
  },
  dev: {
    env: devEnv,
    host: 'localhost',
    port: 3030,
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    mockData: devEnv.mockData, // 是否开启模拟数据
    proxyTable: devEnv.proxyTable, // 配置代理
    cssSourceMap: false
  }
};
