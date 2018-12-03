let instance = null;
/**
 * 地址表
 */
class Address {
  /**
   *
   * @param type (地址类型)
   * @param value (地址，"value"区分"address")
   * @param name
   * @param remark
   * @param addTime (地址添加时间)
   * @param lastTxTime (最近交易时间)
   */
  constructor(type, value, name, remark, addTime, lastTxTime) {
    this.type = type;
    this.value = value;
    this.name = name;
    this.remark = remark;
    this.addTime = addTime;
    this.lastTxTime = lastTxTime;
  }

  /**
   * 保存操作
   * @param type
   * @param value
   * @param name
   * @param remark
   * @param addTime
   * @param lastTxTime
   * @returns {Address}
   */
  static insertAddress(
    {
      type = '',
      value = '',
      name = '',
      remark = '',
      addTime = '',
      lastTxTime = ''
    } = {}
  ) {
    let address = new Address(type, value, name, remark, addTime, lastTxTime);
    instance.insert(address);
    return this;
  }

  /**
   * 分页查询地址
   * @param obj
   */
  static findAddressByPages (params) {
    /*统计总的数量*/
    let totalResults = instance.chain().find().where((obj) => {
        if (params.searchStr) {
          return obj.name.indexOf(params.searchStr) >=0 || obj.value.indexOf(params.searchStr) >= 0 || obj.type == params.searchStr;
        } else {
          return true;
        }
      }).data();
    return new Promise((resolve) => {
      let resultSet = instance
        .chain()
        .find()
        .where((obj) => {
          if (params.searchStr) {
            return obj.name.indexOf(params.searchStr) >=0 || obj.value.indexOf(params.searchStr) >= 0 || obj.type == params.searchStr;
          } else {
            return true;
          }
        })
        .offset(params.pageNo)
        .limit(params.pageSize)
        .data();
      let results = {
        total: totalResults.length,
        data: resultSet
      };
      resolve(results);
    });
  }

  /**
   * 根据唯一的value查询地址信息
   * @param value
   * @returns {Object|*}
   */
  static findAddreByValue (value) {
    return instance.findOne({value: value});
  }

  /**
   * 根据唯一的value删除地址信息
   * @param value
   */
  static deleteAddressByValue (value) {
    return instance.findAndRemove({value: value});
  }

  /**
   * 更新地址信息
   * @param obj
   * @param updateFunction
   */
  static findAnUpdateAddress(obj, updateFunction) {
    return instance.findAndUpdate(obj, updateFunction);
  }
  /**
   * 创建identity表并返回
   * @param db
   * @returns {Identity}
   */
  static newInstance (db) {
    instance = db.getCollection('address') || db.addCollection('address');
    return this;
  }
  /**
   * 返回identity表
   * @param db
   * @returns {*}
   */
  static getInstance () {
    return instance;
  }
}
export default Address;
