let instance = null;
class History {
  /**
   * @param address
   * @param acctType
   * @param assetCode
   * @param assetIssuer
   * @param txHash
   * @param amount
   * @param blockNumber
   * @param to
   * @param from
   * @param fee
   * @param txType
   * @param txTime
   * @param data
   * @param firstHistory
   */
  constructor (address, acctType, assetCode, assetIssuer, txHash, amount, blockNumber, to, from, fee, txType, txTime, data, firstHistory) {
    this.address = address;
    this.acctType = acctType;
    this.assetCode = assetCode;
    this.assetIssuer = assetIssuer;
    this.txHash = txHash;
    this.amount = amount;
    this.blockNumber = blockNumber;
    this.to = to;
    this.from = from;
    this.fee = fee;
    this.txType = txType;
    this.txTime = txTime;
    this.data = data;
    this.firstHistory = firstHistory;
  }

  /**
   * @param address
   * @param acctType
   * @param assetCode
   * @param assetIssuer
   * @param txHash
   * @param amount
   * @param blockNumber
   * @param to
   * @param from
   * @param fee
   * @param txType
   * @param txTime
   * @param data
   * @param firstHistory
   * @returns {History}
   */
  static insertHistory (
    {
      address = '',
      acctType = '',
      assetCode = '',
      assetIssuer = '',
      txHash = '',
      amount = '',
      blockNumber = '',
      to = '',
      from = '',
      fee = '',
      txType = '',
      txTime = '',
      data = '',
      firstHistory = false
    } = {}
  ) {
    let history = new History(address, acctType, assetCode, assetIssuer, txHash, amount, blockNumber, to, from, fee, txType, txTime, data, firstHistory);
    instance.insert(history);
    return this;
  }

  /**
   *
   * @param identityId
   * @returns {*} 返回一个数组，多个
   */
  static findHistory(acctType, address, assetCode = '', assetIssuer = '') {
    let params = {
      acctType: acctType,
      address: address
    };
    if (assetCode) {
      params.assetCode = assetCode;
    }
    if (assetIssuer) {
      params.assetIssuer = assetIssuer;
    }
    let resultRet = instance.chain().find(params)
      .simplesort('blockNumber', true).data();
    return resultRet;
  }

  /**
   * 根据哈希更新历史
   * @returns {Object|*}
   */
  static updateHistory (txHash, updateFunction) {
    let result = instance.findAndUpdate({txHash: txHash}, updateFunction);
    return result;
  }

  /**
   * 根据删除历史
   * @param option
   */
  static removeHistory(option) {
    if (!option) {
      return;
    }
    return instance.findAndRemove(option);
  }

  /**
   * 创建history表并返回
   * @param db
   * @returns {history}
   */
  static newInstance (db) {
    instance = db.getCollection('history') || db.addCollection('history');
    return this;
  }
  /**
   * 返回history表信息
   * @param db
   * @returns {*}
   */
  static getInstance () {
    return instance;
  }
}

export default History;

