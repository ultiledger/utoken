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
 * 'HKD': 'HK$',
 * 货币单位
 * @type {{CNY: string, USD: string, HKD: string, JPY: string, KRW: string, GBP: string}}
 */
export const currencys = {
  'CNY': '￥', /*人民币*/
  'USD': '$', /*美元*/
  'KRW': '₩', /*韩币*/
  'JPY': '円' /*日元*/
};
/**
 * 多语言 (需要注意更vant组件定义的一样对一下)
 * @type {{zh-CN: string, en-US: string}}
 */
export const languages = {
  'zh-CN': '简体中文',
  'en-US': 'English',
  'ja-JP': '日本語',
  'ko-KO': '한국어'
};
/**
 * 语言-货币对应关系
 * @type {{"zh-CN": string, "en-US": string, "ja-JP": string, "ko-KO": string}}
 */
export const languagesCurrencys = {
  'zh-CN': 'CNY',
  'en-US': 'USD',
  'ja-JP': 'JPY',
  'ko-KO': 'KRW'
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
