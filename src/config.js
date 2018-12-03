import wallet from 'src/pages';

export default {
  defaultRoute () { // 登录后的默认跳转路径
    return '/wallet';
  },
  modules: {
    wallet
  },
  updateUrl: 'https://api.github.com/repos/gylsz-dev/utoken/releases/latest', // 检查更新地址
  downloadUrl: 'https://www.pgyer.com/apiv2/app/install?appKey=1d15c396db9ba6a6ba1cb1473a38c407&_api_key=f16c6672198f996f3cd8ff9e3c4d5e02', // 安卓安装包下载地址
  officialWebsite: 'https://utoken.cash/#/' // 官网
};
