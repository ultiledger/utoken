import modules from 'src/config';
/**
 * 相关配置请查阅vue-router的文档，https://router.vuejs.org/zh-cn/
 * 注意：1、要求一定要配置name,命名规则按照层次用'.'分开，比如路由1的name：'home',它的子节点的name: 'home.xxx'
 *      2、desc 不是vue-router的配置，是自动定义的，主要用来描述当前路由
 * @type {[*]}
 */
export default [
  {
    desc: '',
    name: '',
    path: '/',
    redirect: modules.defaultRoute(),
    meta: {canBack: false}
  }
];
