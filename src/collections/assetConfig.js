let instance = null;

/**
 * AssetConfig(资产配置表)
 */
class AssetConfig {

  /**
   *
   * @param address (地址)
   * @param symbol (符号)
   * @param name (全称)
   * @param decimals 小数位数
   * @param abi 合约abi
   * @param type 所属类型
   */
  constructor(address, symbol, name, decimals, abi, type) {
    this.address = address;
    this.symbol = symbol;
    this.name = name;
    this.decimals = decimals;
    this.abi = abi;
    this.type = type;
  }

  /**
   * 保存资产配置到资产配置表
   * @param address
   * @param symbol
   * @param name
   * @param decimals
   * @param abi
   * @param type
   * @returns {AssetConfig}
   */
  static insertAssetConfig(
    {
      address = '',
      symbol = '',
      name = '',
      abi = '',
      type = '',
      decimals = 18
    } = {}
  ) {
    let assetConfig = new AssetConfig(address, symbol, name, decimals, abi, type);
    instance.insert(assetConfig);
    return this;
  }

  /**
   * 查询所有资产配置数据
   * @returns {*}
   */
  static findAll () {
    return instance.data;
  }

  /**
   * 创建AssetConfig表并返回
   * @param db
   * @returns {asset}
   */
  static newInstance (db) {
    instance = db.getCollection('assetConfig') || db.addCollection('assetConfig');
    return this;
  }
  /**
   * 返回AssetConfig表信息
   * @param db
   * @returns {*}
   */
  static getInstance () {
    return instance;
  }
}

export default AssetConfig;
