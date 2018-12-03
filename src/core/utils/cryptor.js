import CryptoJS from 'crypto-js';

export default {
  /**
   * 加密
   * @param string
   * @returns {*}
   */
  encryptMD5 (string) {
    return CryptoJS.MD5(string).toString().toLocaleUpperCase();
  },
  /**
   * 对称加密
   * @param string
   * @returns {*}
   */
  encryptAES (string, key) {
    if(typeof(string) == 'object'){
      string = JSON.stringify(string);
    }
    let srcs = CryptoJS.enc.Utf8.parse(string);
    const iv = CryptoJS.enc.Utf8.parse(this.genKey(key));
    return CryptoJS.AES.encrypt(srcs,  CryptoJS.enc.Utf8.parse(this.genKey(key)), {iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7}).toString();
  },
  /**
   * 对称解密
   * @param string
   * @returns {any}
   */
  decryptAES (string, key) {
    const iv = CryptoJS.enc.Utf8.parse(this.genKey(key));
    let val = CryptoJS.AES.decrypt(string, CryptoJS.enc.Utf8.parse(this.genKey(key)), {iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7});
    return val.toString(CryptoJS.enc.Utf8);
  },
  genKey (key) { // 生成16位的key
    // return this.encryptMD5((Array(16).join('A') + key).slice(-16));
    return (Array(16).join('A') + key).slice(-16);
  }
};
