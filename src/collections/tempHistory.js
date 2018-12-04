let instance = null;
class TempHistory {
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
   * @param confirmations
   */
  constructor (address, acctType, assetCode, assetIssuer, txHash, amount, blockNumber, to, from, fee, txType, txTime, data, confirmations) {
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
    this.confirmations = confirmations;
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
   * @param confirmations
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
      confirmations = 0
    } = {}
  ) {
    let history = new TempHistory(address, acctType, assetCode, assetIssuer, txHash, amount, blockNumber, to, from, fee, txType, txTime, data, confirmations);
    instance.insert(history);
    return this;
  }

  /**
   *
   * @param identityId
   * @returns {*} 返回一个数组，多个
   */
  static findHistory(acctType, address, assetCode = '', assetIssuer = '', txHash = '') {
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

    if (txHash) {
      params.txHash = txHash;
    }

    let resultRet = instance.chain().find(params)
      .simplesort('txTime', true).data();
    return resultRet;
  }

  /**
   *
   * @param identityId
   * @returns {*} 返回一个数组，多个
   */
  static findHistoryByTxHash(txHash) {
    let params = {
      txHash: txHash
    };
    let resultRet = instance.findOne(params);
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
    instance = db.getCollection('tempHistory') || db.addCollection('tempHistory');
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

export default TempHistory;

