let instance = null;
/**
 * Asset(资产表)
 */
class Asset {

  /**
   *
   * @param address (账户地址/publicKey)
   * @param code (资产类型||资产编码)
   * @param name ()
   * @param issuer 发布者
   * @param profile (资产描述的url，资产描述后台配置)
   */
  constructor(address, code, name, issuer, profile) {
    this.address = address;
    this.code = code;
    this.name = name;
    this.issuer = issuer;
    this.profile = profile;
  }

  /**
   * 保存资产信息到资产表
   * @param address
   * @param code
   * @param name
   * @param profile
   * @returns {Asset}
   */
  static insertAsset(
    {
      address = '',
      code = '',
      name = '',
      issuer ='',
      profile = ''
    } = {}
  ) {
    let asset = new Asset(address, code, name, issuer, profile);
    instance.insert(asset);
    return this;
  }

  /**
   * 根据地址查询
   * @returns {Array|*} 返回
   */
  static findByAddress (address) {
    let result = instance.find({address: address});
    return result;
  }

  /**
   * 根据地址和code删除
   * @param address
   */
  static removAssetByAddressAndName (option) {
    return instance.findAndRemove(option);
  }

  /**
   * 创建asset表并返回
   * @param db
   * @returns {asset}
   */
  static newInstance (db) {
    instance = db.getCollection('asset') || db.addCollection('asset');
    return this;
  }
  /**
   * 返回asset表信息
   * @param db
   * @returns {*}
   */
  static getInstance () {
    return instance;
  }
}

export default Asset;
