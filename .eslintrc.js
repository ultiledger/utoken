module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    'eslint:recommended'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // 箭头函数参数可以不要括号
    'arrow-parens': 0,
    // 不强制生成器函数*的前后空格
    'generator-star-spacing': 0,
    // 开发模式可以使用debugger，生产模式不可以
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    // 需要分号结尾
    'semi': ['error', 'always']
  },
  'globals': {
    'FormData': true
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
};
