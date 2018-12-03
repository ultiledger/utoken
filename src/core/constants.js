/**
 * 钱包来源
 * @type {{CREATED: string, IMPORT: string}}
 */
export const SourceType = {
  CREATED: '1',
  IMPORT: '2',
  ADD: '3'
};

/**
 * 货币单位
 * @type {{CNY: string, USD: string, HKD: string, JPY: string, KRW: string, GBP: string}}
 */
export const currencys = {
  'CNY': '￥', /*人民币*/
  'USD': '$', /*美元*/
  'KRW': '₩', /*韩币*/
  'HKD': 'HK$' /*港币*/
  /*'JPY': '円', /!*日元*!/
  'GBP': '£' /!*英镑*!/*/
};
/**
 * 多语言 (需要注意更vant组件定义的一样对一下)
 * @type {{zh-CN: string, en-US: string}}
 */
export const languages = {
  'zh-CN': '简体中文',
  'en-US': 'English'
};
/**
 * 导入常量类
 *
 */
export default {
  SourceType,
  currencys,
  languages
};
