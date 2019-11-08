// http://vee-validate.logaretm.com/ 验证组件文档
import Vue from 'vue';
import * as VeeValidate from 'vee-validate';
import { extend,localize } from 'vee-validate';
Vue.use(VeeValidate);
const locale = {
  name: 'zh_CN',
  messages: {
    after: (field, [target]) => ` ${field}必须在${target}之后`,
    alpha_dash: (field) => ` ${field}能够包含字母数字字符，包括破折号、下划线`,
    alpha_num: (field) => `${field} 只能包含字母数字字符.`,
    alpha_spaces: (field) => ` ${field} 只能包含字母字符，包括空格.`,
    alpha: (field) => ` ${field} 只能包含字母字符.`,
    before: (field, [target]) => ` ${field} 必须在${target} 之前.`,
    between: (field, [min, max]) => ` ${field} 必须在${min} ${max}之间.`,
    confirmed: (field, [confirmedField]) => ` ${field} 不能和${confirmedField}匹配.`,
    date_between: (field, [min, max]) => ` ${field}必须在${min}和${max}之间.`,
    date_format: (field, [format]) => ` ${field}必须在在${format}格式中.`,
    decimal: (field, [decimals] = ['*']) => ` ${field} 必须是数字的而且能够包含${decimals === '*' ? '' : decimals} 小数点.`,
    digits: (field, [length]) => ` ${field} 必须是数字，且精确到 ${length}数`,
    dimensions: (field, [width, height]) => ` ${field}必须是 ${width} 像素到 ${height} 像素.`,
    email: (field) => ` ${field} 必须是有效的邮箱.`,
    ext: (field) => ` ${field} 必须是有效的文件.`,
    image: (field) => ` ${field} 必须是图片.`,
    in: (field) => ` ${field} 必须是一个有效值.`,
    ip: (field) => ` ${field} 必须是一个有效的地址.`,
    max: (field, [length]) => ` ${field} 不能大于${length}字符.`,
    mimes: (field) => ` ${field} 必须是有效的文件类型.`,
    min: (field, [length]) => ` ${field} 必须至少有 ${length} 字符.`,
    not_in: (field) => ` ${field}必须是一个有效值.`,
    numeric: (field) => ` ${field} 只能包含数字字符.`,
    regex: (field) => ` ${field} 格式无效.`,
    required: (field) => `${field} 不能为空.`,
    size: (field, [size]) => ` ${field} 必须小于 ${size} KB.`,
    url: (field) => ` ${field}不是有效的url.`,
    phone: () => `请输入有效的手机号码.`,
    max_value: (field, [value]) => `${field}不能大于${value}.`,
    min_value: (field, [value]) => `${field}不能小于${value}.`,
    idCardNo: () => `请输入正确的身份证号.`,
    creditCard: (field) => `${field}输入不正确`,
    positiveNumber: (field) => `${field}必须是大于0的数字`
  },
  attributes: {}
};
const valisators = {
  phone: {
    validate (value) {
      return (/^1[34578]\d{9}$/.test(value));
    }
  },
  greater_than: {
    messages: {
      en: () => {
      },
      'zh_CN': (field, args) => {
        return `${field}必须大于${args[0]}.`;
      }
    },
    validate (value, args) {
      return (value > args[0]);
    }
  },
  positiveNumber: {
    messages: {
      en: () => {
      },
      'zh_CN': (field) => {
        return `${field}必须是大于0的数字.`;
      }
    },
    validate (value) {
      return /^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,}[0-9]{0,}$/.test(value);
    }
  },
  creditCard: {
    messages: {
      en: () => {
      },
      'zh_CN': () => {
        return `请输入正确的银行卡号.`;
      }
    },
    validate (value) {
      return /^\d{10,32}$/.test(value);
    }
  },
  idCardNo: {
    validate (value) {
      return /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}$)/.test(value);
    }
  }
};

localize({[locale.name]: locale});

Object.keys(valisators).map(key => {
  extend(key, valisators[key]);
});

const config = {
  errorBagName: 'validateErrors', // change if property conflicts.
  fieldsBagName: 'fields',
  delay: 0,
  locale: 'zh_CN',
  dictionary: null,
  strict: true,
  enableAutoClasses: true,
  classes: true,
  classNames: {
    touched: 'touched', // the control has been blurred
    untouched: 'untouched', // the control hasn't been blurred
    valid: 'valid', // model is valid
    invalid: 'invalid', // model is invalid
    pristine: 'pristine', // control has not been interacted with
    dirty: 'dirty' // control has been interacted with
  },
  events: 'input|blur',
  inject: true
};

Vue.use(VeeValidate, config);
