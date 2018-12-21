let instance = null;

/**
 * 交易对表
 */
class Tradepair {
  /**
   *
   * @param acctType (账户类型)
   * @param acctAddress (账户地址)
   * @param baseCode (基础货币，默认XLM)
   * @param baseIssuer (基础货币合约，默认空)
   * @param counterCode （对手货币，默认XLM）
   * @param counterIssuer （对手货币合约，默认空）
   */
  constructor(acctType, acctAddress, baseCode, baseIssuer, counterCode, counterIssuer) {
    this.acctType = acctType;
    this.acctAddress = acctAddress;
    this.baseCode = baseCode;
    this.baseIssuer = baseIssuer;
    this.counterCode = counterCode;
    this.counterIssuer = counterIssuer;
  }

  /**
   * 保存操作
   * @param acctType
   * @param acctAddress
   * @param baseCode
   * @param baseIssuer
   * @param counterCode
   * @param counterIssuer
   */
  static insertTradepair(
    {
      acctType = 'stellar',
      acctAddress = '',
      baseCode = 'XLM',
      baseIssuer = '',
      counterCode = '',
      counterIssuer = ''
    } = {}
  ) {
    let tp = new Tradepair(acctType, acctAddress, baseCode, baseIssuer, counterCode, counterIssuer);
    instance.insert(tp);
    return this;
  }

  /**
   *查询全部
   */
  static findAll () {
    return instance.data;
  }

  /**
   * 通过账户类型和账户地址查询交易对
   * @param acctType
   * @param acctAddress
   * @returns {*}
   */
  static findByAcctTypeAndAddress(acctType, acctAddress) {
    return instance.find({acctType, acctAddress});
  }

  /**
   * 各种更新账户操作
   * @param obj
   * @param updateFunction
   */
  static findAndUpdateTradepair (obj, updateFunction) {
    return instance.findAndUpdate(obj, updateFunction);
  }

  /**
   * 创建tradepair表并返回
   * @param db
   * @returns {setting}
   */
  static newInstance (db) {
    instance = db.getCollection('tradepair') || db.addCollection('tradepair');
    return this;
  }
  /**
   * 返回tradepair表
   * @param db
   * @returns {*}
   */
  static getInstance () {
    return instance;
  }

}

export default Tradepair;
