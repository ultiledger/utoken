const path = require('path');
const config = require('./config');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const PATHS = {
  src: path.join(__dirname, './src'),
  dist: path.join(__dirname, './dist')
};
module.exports = {
  // transpileDependencies: ['bitcoinjs-lib', 'bip32', 'ripple-lib', 'ethereumjs-tx', 'rlp', 'eth-lib', 'agent-base', 'tiny-secp256k1'],
  publicPath:  process.env.NODE_ENV === 'production'?'': '/',
  chainWebpack: vwconfig => { // 主要修改一些公共配置
    // 指定输出目录及文件命名方式
    vwconfig.output
      .fileName = path.join('js', '[name].[hash].js')
      .chunkFilename = path.join('js', '[name].[hash].js');
    vwconfig.plugin('html').tap(args => {
      args[0].inject = true;
      args[0].minify = {
        removeAttributeQuotes: true,
        collapseWhitespace: true,
        html5: true,
        minifyCSS: true,
        removeComments: true,
        removeEmptyAttributes: true
      };
      args[0].title = config.common.title;
      return args;
    });
    vwconfig
      .plugin('copyplugin')
      .use(CopyWebpackPlugin, [[{ // 拷贝static目录至dist下
        from: path.join(__dirname, './static'),
        to: path.join(PATHS.dist, './static')
      }]]);
    /*修改eslint的formatter*/
    vwconfig.module
      .rule('eslint')
      .use('eslint-loader')
      .tap(options => {
        options.formatter = require("eslint-friendly-formatter");
        return options;
      });
    /*修改fonts的处理*/
    vwconfig.module
      .rule('fonts')
      .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/)
      .use('url-loader')
      .loader('url-loader')
      .options({
        name: '[path][name].[ext]',
        outputPath: 'fonts/'
      });
    /*修改图片的处理*/
    vwconfig.module
      .rule('images')
      .test(/\.(png|jpe?g|gif|svg)(\?.*)?$/)
      .use('url-loader')
      .loader('url-loader')
      .options({
        name: '[path][name].[ext]',
        outputPath: 'images/'
      });
  },
  devServer: { // 开发服务器配置
    disableHostCheck: true,
    historyApiFallback: false,
    noInfo: false,
    host: config.dev.host,
    port: config.dev.port,
    open: true,
    contentBase: './',
    proxy: config.dev.env.proxyTable,
    hot: true,
    inline: true,
    overlay: { // 这里配置 html 页面是否显示 eslint 错误信息蒙版
      errors: true,
      warnings: true
    }
  },
  configureWebpack: {
    devtool: process.env.NODE_ENV === 'production'?false: 'inline-source-map',
    resolve: {
      alias: {
        '@': path.resolve('src'),
        'vue$': 'vue/dist/vue.common.js',
        'src': path.resolve(__dirname, 'src'),
        'assets': path.resolve(__dirname, 'src/assets'),
        'core': path.resolve(__dirname, 'src/core'),
        'pages': path.resolve(__dirname, 'src/pages'),
        'components': path.resolve(__dirname, 'src/components'),
        'store': path.resolve(__dirname, 'src/store')
      }
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            chunks: 'initial',
            name: 'commons',
            minChunks: 2,
            maxInitialRequests: 5,
            minSize: 0
          },
          vendor: { // 抽离第三插件
            test: /node_modules/,
            chunks: 'initial',
            name: 'vendor',
            priority: 10
          }
        }
      }
    }
  }
};
