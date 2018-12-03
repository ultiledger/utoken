export default {
  getUUID () {
    let s = [];
    let hexDigits = '0123456789abcdef';
    for (let i=0; i< 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = '4';
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    return s.join('');
  }
};
