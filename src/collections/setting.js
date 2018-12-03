let instance = null;
/**
 * 设置表
 */
class Setting {

  /**
   *
   * @param id (默认是1)
   * @param defaultAddress （账户地址）
   * @param currencyUnit （货币类型）
   * @param network （网络设置）
   * @param language （语种）
   * @param gesturePwd （手势密码）
   */
  constructor(id, defaultAddress, currencyUnit, network, language, gesturePwd) {
    this.id = id;
    this.defaultAddress = defaultAddress;
    this.currencyUnit = currencyUnit;
    this.network = network;
    this.language = language;
    this.gesturePwd = gesturePwd;
  }

  /**
   * 保存操作
   * @param id
   * @param address
   * @param currencyUnit
   * @returns {Setting}
   */
  static insertSetting(
    {
      id = '1',
      language = 'zh-CN',
      defaultAddress = '',
      currencyUnit = 'CNY',
      network = {},
      gesturePwd = ''
    } = {}
  ) {
    let setting = new Setting(id, defaultAddress, currencyUnit, network, language, gesturePwd);
    instance.insert(setting);
    return this;
  }
  /**
   * 根据地址查询
   * @returns {Object|*} 返回单个
   */
  static findSetting () {
    let result = instance.findOne({id: '1'});
    return result;
  }

  /**
   * 更新地址
   * @returns {Object|*} 返回单个
   */
  static updateSetting (updateFunction) {
    let result = instance.findAndUpdate({id: '1'}, updateFunction);
    return result;
  }

  /**
   * 创建setting表并返回
   * @param db
   * @returns {setting}
   */
  static newInstance (db) {
    instance = db.getCollection('setting') || db.addCollection('setting');
    return this;
  }
  /**
   * 返回setting表
   * @param db
   * @returns {*}
   */
  static getInstance () {
    return instance;
  }
}

export default Setting;
