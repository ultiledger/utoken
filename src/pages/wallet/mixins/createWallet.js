import hdWallet from 'src/wallet/hd-wallet';
import coin from 'src/wallet/coins';
import uuid from 'core/utils/uuid';
import cryptor from 'core/utils/cryptor';
import {AccountType} from 'src/wallet/constants';
export default {
  methods: {
    /**
     * 通过助记词生成、恢复、导入账户钱包
     * @param accountType 账户类型
     * @param mnemonicCode 助记词
     * @param walletPwd (交易密码)
     * @param source (来源，1-创建，2-导入)
     * @param backFlag 助记词是否已经备份
     */
    createWalletAcctByMnemonicCode (accountType, mnemonicCode, walletPwd, source, backFlag=false) {
      let memorizingCodeLanguage = this.getMemorizingCodeLanguage(mnemonicCode);
      let wallet = hdWallet.fromMnemonic(mnemonicCode, null,  memorizingCodeLanguage);
      if (wallet) {
        mnemonicCode = cryptor.encryptAES(mnemonicCode, walletPwd);
        let identity = this.genIdentity('mnemonicCode', mnemonicCode, source, backFlag);
        // 加密密码
        let password = cryptor.encryptMD5(walletPwd);
        // 创建账户钱包
        accountType.forEach(item => {
          let account = wallet.getAccount(coin[item], 0);
          this.$collecitons.account.insertAccount({
            identityId: identity.id,
            address: account.address,
            type: item,
            secret: cryptor.encryptAES(account.secret, walletPwd),
            name: this.$collecitons.account.genAccountName(item),
            password: password,
            mnemonicCode: mnemonicCode,
            mnemonicCodeLanguage: memorizingCodeLanguage
          });
          this.saveDefaultAssets(item, account);
        });
        return password;
      }
      return null;
    },
    /**
     * 通过私钥恢复、导入账户钱包
     * @param accountType 账户类型
     * @param privateKey 私钥
     * @param walletPwd (交易密码)
     * @param source 来源，1-创建，2-导入
     * @param backFlag 助记词是否已经备份
     */
    createWalletAcctByPrivateKey(accountType, privateKey, walletPwd, source, backFlag=false) {
      let account = hdWallet.getAccountFromSecret(coin[accountType], privateKey);
      if (account) {
        privateKey = cryptor.encryptAES(privateKey, walletPwd);
        let identity = this.genIdentity('secret', privateKey, source, backFlag);
        // 创建账户钱包
        let password = cryptor.encryptMD5(walletPwd);
        this.$collecitons.account.insertAccount({
          identityId: identity.id,
          address: account.address,
          type: accountType,
          secret: cryptor.encryptAES(account.secret, walletPwd),
          name: this.$collecitons.account.genAccountName(accountType),
          password: password,
          mnemonicCode: ''
        });
        this.saveDefaultAssets(accountType, account);
        return password;
      }
      return null;
    },
    /**
     * 获取钱包账户，根据助记词或者私钥，用途：判断是否存在
     * @param accountType
     * @param mnemonicCode
     * @param privateKey
     * @returns {*}
     */
    getHdWalletAccount (accountType, mnemonicCode, privateKey) {
      try {
        if (privateKey) {
          return hdWallet.getAccountFromSecret(coin[accountType], privateKey);
        } else if (mnemonicCode) {
          let wallet = hdWallet.fromMnemonic(mnemonicCode, null, this.getMemorizingCodeLanguage(mnemonicCode));
          return wallet.getAccount(coin[accountType], 0);
        }
      }catch (e) {
        console.error(e);
      }
    },
    /**
     * 更新或者获取身份信息
     * @param type
     * @param value
     * @param source
     * @param backFlag
     * @returns {{type: *, value: *, source: *}}
     */
    genIdentity (type, value, source, backFlag) {
      // 如果身份已经存在，那么就直接挂到上面就好，不存在则创建
      let identity = {
        type: type,
        value: value,
        source: source
      };
      let identitys = this.$collecitons.identity.findByCondition(identity);
      if (identity && identitys.length > 0) {
        identity = identitys[0];
      } else {
        identity.id = uuid.getUUID();
        identity.backFlag = backFlag;
        this.$collecitons.identity.insertIdentity (identity);
      }
      return identity;
    },
    getFirstAcct () { // 获取保存的第一个账户作为默认账户
      return this.$collecitons.account.findAll()[0];
    },
    getMemorizingCodeLanguage (memorizingCode) { // 获取助记词的语言
      let reg=/^[\u4e00-\u9fa5]+$/;
      if (reg.test(memorizingCode.replace(/\s+/g, ''))){
        return 'chinese_simplified';
      }
      return 'english';
    },
    /**
     * 以太默认加载ult和dbt资产
     * @param accountType 账户类型
     * @param account 账户包含公钥
     */
    saveDefaultAssets (accountType, account) {
      if (accountType === AccountType.ethereum) {
        let tokens = coin[accountType].tokens();
        if (tokens) {
          let ULT = tokens['ULT'];
          this.$collecitons.asset.insertAsset({
            address: account.address,
            code: ULT.symbol,
            name: ULT.name});
          let DBT = tokens['DBT'];
          this.$collecitons.asset.insertAsset({
            address: account.address,
            code: DBT.symbol,
            name: DBT.name});
        }
      }
    }
  }
};
