export default [
  {
    desc: 'ulti钱包',
    path: '/wallet',
    name: 'wallet',
    component (resolve) {
      require.ensure([], () => resolve(require('./main.vue')), 'wallet-main');
    },
    meta: {canBack: false, transition: false, requiresAuth: true},
    redirect: '/wallet/assets',
    children: [
      {
        desc: '指引',
        path: '/guide',
        name: 'guide',
        component (resolve) {
          require.ensure([], () => resolve(require('./wallet/guide.vue')), 'guide');
        },
        meta: {canBack: false, transition: false, showTabBar: false}
      },
      {
        desc: '我的',
        path: 'setting',
        name: 'setting',
        component (resolve) {
          require.ensure([], () => resolve(require('./setting/setting.vue')), 'setting');
        },
        meta: {canBack: false, transition: false}
      },
      {
        desc: '资产',
        path: 'assets',
        name: 'assets',
        component (resolve) {
          require.ensure([], () => resolve(require('./assets/assets.vue')), 'assets');
        },
        meta: {canBack: false, transition: false}
      },
      {
        desc: '备份助记词',
        path: 'back-mnemonicCode',
        name: 'back-mnemonicCode',
        component (resolve) {
          require.ensure([], () => resolve(require('./wallet/backups-start-pop.vue')), 'back-mnemonicCode');
        },
        meta: {canBack: false, transition: true, showTabBar: false}
      },
      {
        desc: '发现',
        path: 'news-adv',
        name: 'news-adv',
        component (resolve) {
          require.ensure([], () => resolve(require('./find/find.vue')), 'news-adv');
        },
        meta: {canBack: false, transition: false}
      }
    ]
  }
];
