let instance = null;
/**
 * 身份class
 */
class Identity {

  /**
   *
   * @param id
   * @param type
   * @param value
   * @param source
   * @param backFlag (备份标识，true-已备份，false-尚未备份)
   */
  constructor(id, type, value, source, backFlag) {
    this.id = id;
    this.type = type;
    this.value = value;
    this.source = source;
    this.backFlag = backFlag;
  }

  /**
   * 保存操作
   * @param id
   * @param type
   * @param value
   * @param source
   * @returns {*}
   */
  static insertIdentity (
    {
      id = '',
      type = '',
      value = '',
      source = '',
      backFlag = false
    } = {}
  ) {
    let identity = new Identity(id, type, value, source, backFlag);
    instance.insert(identity);
    return this;
  }

  /**
   * 根据ID去查询
   * @param id
   * @returns {Object|*}
   */
  static findById (id) {
    let result = instance.findOne({id});
    return result;
  }

  /**
   * 根据来源查询
   * @param source
   * @returns {*}
   */
  static findBySource (source) {
    let resultRet = instance.find({source});
    return resultRet;
  }

  /**
   * 条件查询
   * @param obj
   * @returns {*}
   */
  static findByCondition(obj) {
    return instance.find(obj);
  }

  /**
   * 查询所有
   */
  static findAll () {
    return instance.data;
  }

  /**
   *各种更新身份操作
   * @param obj
   * @param updateFunction
   */
  static findAndUpdateIdentity(obj, updateFunction) {
    return instance.findAndUpdate(obj, updateFunction);
  }

  /**
   * 根据主键去删除身份信息
   * @param id
   */
  static deleteIdentityById(id) {
    return instance.findAndRemove({id});
  }

  /**
   * 清空身份
   * @returns {*}
   */
  static deleteIdentity(){
    return instance.clear();
  }

  /**
   * 创建identity表并返回
   * @param db
   * @returns {Identity}
   */
  static newInstance (db) {
    instance = db.getCollection('identity') || db.addCollection('identity');
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

export default Identity;
