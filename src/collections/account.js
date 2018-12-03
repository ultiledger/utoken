let instance = null;
class Account {
  /**
   *
   * @param address (地址，stellar时存储publicKey)
   * @param identityId (身份id)
   * @param type (eth、xrp、xlm)
   * @param secret (私钥)-对称加密
   * @param name (账户名称)
   * @param password (密码)
   * @param mnemonicCode (助记词)-对称加密
   * @param mnemonicCodeLanguage (助记词)-语言版本
   */
  constructor (address, identityId, type, name, password, mnemonicCode, secret, mnemonicCodeLanguage) {
    this.address = address;
    this.identityId = identityId;
    this.type = type;
    this.secret = secret;
    this.name = name;
    this.password = password;
    this.mnemonicCode = mnemonicCode;
    this.secret = secret;
    this.mnemonicCodeLanguage = mnemonicCodeLanguage;
  }

  /**
   * 保存
   * @param identityId
   * @param address
   * @param type
   * @param secret
   * @param name
   * @param password
   * @param mnemonicCodeLanguage
   * @returns {*}
   */
  static insertAccount (
    {
      identityId = '',
      address = '',
      type = '',
      secret = '',
      name = '',
      password = '',
      mnemonicCode = '',
      mnemonicCodeLanguage = 'english'
    } = {}
  ) {
    let account = new Account(address, identityId, type, name, password, mnemonicCode, secret, mnemonicCodeLanguage);
    instance.insert(account);
    return this;
  }

  /**
   *
   * @param identityId
   * @returns {*} 返回一个数组，多个
   */
  static findByIdentityId (identityId) {
    let resultRet = instance.find({identityId: identityId});
    return resultRet;
  }

  /**
   * 根据地址查询
   * @returns {Object|*} 返回单个
   */
  static findByAddress (address) {
    let result = instance.findOne({address});
    return result;
  }

  /**
   * 根据账户类型和助记词查询账户是否存在
   * @param type
   * @param mnemonicCode
   * @returns {Object|*}
   */
  static findByTypeAndMnemonicCode(type, mnemonicCode) {
    return instance.findOne({type: type, mnemonicCode: mnemonicCode});
  }

  /**
   * 根据账户类型和私钥查询账户是否存在
   * @param type
   * @param secret
   * @returns {Object|*}
   */
  static findByTypeAndSecret(type, secret) {
    return instance.findOne({type: type, secret: secret});
  }

  /**
   * 根据账户类型查询账号
   * @param type
   * @param secret
   * @returns {Object|*}
   */
  static findByType(type) {
    return instance.find({type: type});
  }

  /**
   *查询全部
   */
  static findAll () {
    return instance.data;
  }


  /**
   *查询全部，按类型排序
   */
  static findAllSoryByType () {
    let resultRet = instance.chain().find()
      .simplesort('type', true).data();
    return resultRet;
  }

  /**
   * 生成账户前面的后缀，命名规则类型+当前数量
   * @param type
   * @returns {*}
   */
  static genAccountName(type) {
    let results = instance.find({type: type});
    let accountNames = results.map(item => {
      return item.name;
    });
    let name = type.charAt(0).toUpperCase() + type.substring(1);
    for(let i = 0, len = results.length; i < len; i++) {
      let tempName = name + '_' + (i + 1);
      if (accountNames.indexOf(tempName) == -1) {
        name = tempName;
        break;
      }
    }
    return name;
  }

  /**
   *各种更新账户操作
   * @param obj
   * @param updateFunction
   */
  static findAndUpdateAcct(obj, updateFunction) {
    return instance.findAndUpdate(obj, updateFunction);
  }

  /**
   * 根据条件删除账户
   * @param obj
   */
  static findAndRemoveAcct (obj) {
    return instance.findAndRemove(obj);
  }

  /**
   * 清空账户信息
   * @returns {*}
   */
  static deleteAccts() {
    return instance.findAndRemove({});
  }

  /**
   * 创建account表并返回
   * @param db
   * @returns {Account}
   */
  static newInstance (db) {
    instance = db.getCollection('account') || db.addCollection('account');
    return this;
  }
  /**
   * 返回account表信息
   * @param db
   * @returns {*}
   */
  static getInstance () {
    return instance;
  }
}

export default Account;

