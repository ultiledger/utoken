Ripple Wallet, Stellar Wallet, ETH wallet, BTC wallet

# 官网地址(下载)：https://utoken.cash
# Utoken (The first mobile wallet to support Ripple, Stellar,ETH and other popular blockchain networks)

Supporting Ripple/Stellar/BTC/ETH multi-chain assets
No background server, no personal information, no centralization
Your key is encrypted in your local storage

## Key Features

- A set of mnemonics, easy to manage
- Offline transaction signing. Protect the secret key from exposure to the Internet.
- Send/receive/convert/trade xrp, xlm, assets and tokens.
- Send/receive ETH and ERC20 tokens.
- Send/receive BTC
- Buy/sell xlm, xrp, assets and tokens
- View balances and history.
- Manage trust lines, account data.
- Federation protocol support，Deposit/withdraw CNY(in progress).
- Contacts support.
- 

## Build yourself
```sh
npm run build

```

## Development
```sh
npm run dev
```
## Cordova
- Android need to download the Android SDK and set the ANDROID_HOME='SDKPath'  in the environment variable, PATH=%PATH%;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools
- iOS needs to install xcode package debugging
- Put the files and folders under the compiled dist directory under the www directory

```sh
cordova create utolen_app
cordova platform add android ios
cordova plugin add cordova-plugin-app-version
cordova plugin add cordova-plugin-camera
cordova plugin add cordova-plugin-file
cordova plugin add cordova-plugin-themeablebrowser
cordova plugin add gizscanqrcode
cordova plugin add cordova-plugin-splashscreen
cordova plugin add cordova-plugin-sharesdk
cordova plugin add cordova-plugin-android-permissions
cordova plugin add cordova-plugin-file-opener2
cordova plugin add cordova-plugin-device
cordova plugin add cordova-plugin-file-transfer
cordova plugin add cordova-plugin-statusbar
cordova build android
```
cordova build android  --release  --buildConfig=build.json  

瑞波钱包，恒星钱包，以太坊钱包
# Utoken(首款支持Ripple，Stellar及其他主流区块链网络的移动钱包)

支持Ripple/Stellar/BTC/ETH等多链资产, 一套助记词，轻松管理

## 主要功能

- 无需注册，一套助记词管理跨连钱包，加密存在本地。
- 交易本地签名。密钥不会暴露到因特网。
- 瑞波恒星支持发送、兑换、交易任意资产。
- 支持发送接收 ETH 和 ERC20 tokens.
- 支持发送接收 BTC
- 查询资产和历史记录。
- 管理授信、账户数据。
- 全面支持联邦协议。(正在开发)。
- 支持设置联系人。
- 同一个链支持多账户
- 支持指纹(开发中)
- 支持DAPP钱包支付（正在开发)
## 编译


请用以下命令进行编译：

```sh
npm run build

```

## 开发和调试

```sh
npm run dev
```


## 开发cordova打包到手机调式
- android需要下载Android SDK并在环境变量中设置ANDROID_HOME=SDK路径， PATH=%PATH%;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools
- iOS需要安装xcode打包调试
- 把编译后的dist目录下面的文件和文件夹放到www目录下面
```sh
cordova create utolen_app
cordova platform add android ios
cordova plugin add cordova-plugin-app-version
cordova plugin add cordova-plugin-camera
cordova plugin add cordova-plugin-file
cordova plugin add cordova-plugin-themeablebrowser
cordova plugin add gizscanqrcode
cordova plugin add cordova-plugin-splashscreen
cordova plugin add cordova-plugin-sharesdk
cordova plugin add cordova-plugin-android-permissions
cordova plugin add cordova-plugin-file-opener2
cordova plugin add cordova-plugin-device
cordova plugin add cordova-plugin-file-transfer
cordova build android
```

