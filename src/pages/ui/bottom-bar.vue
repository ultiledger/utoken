<template>
  <van-tabbar v-model="active" id="tab-bar" class="bottom-bar">
    <van-tabbar-item :key="index" v-for="(item, index) in menus" :info="item.count ? item.count : ''">
     <span slot="icon" class="bottom-icon">
       <img :src="dprImg(item.icon)" class="img-icon" v-if="active !== index">
       <img :src="dprImg(item.activeIcon)" class="img-icon" v-else>
       <!--<i :class="item.icon" v-if="active !== index"></i>-->
       <!---->
       <!--<i :class="item.activeIcon" v-else></i>-->
     </span>
      {{item.text}}
    </van-tabbar-item>
  </van-tabbar>
</template>
<script>
  export default{
    data () {
      return {
      };
    },
    methods: {
    },
    computed: {
      active: {
        get () {
          let tabIndex;
          this.menus.forEach((item, index) => {
            if (item.link === this.$store.state.curRouter.name) {
              tabIndex = index;
            }
          });
          return tabIndex;
        },
        set (val) {
          this.$router.push({name: this.menus[val].link, params: {init: true}});
        }
      },
      menus () {
        /*
        let msgTip = this.$store.state.msgTip;
        let count = 0;
        let workringItem = ['send-review', 'receive-list', 'transfer-review', 'discount-review'];
        let flag = false;
        workringItem.forEach(item => {
          if (this.hasPermission(item)) {
            flag = true;
            count += msgTip[item];
          }
        }); */
        let menus = [
          {icon: 'asset.png', activeIcon: 'asset-active.png', text: this.$t('assets.assets'), link: 'assets', show: true},
          {icon: 'find.png', activeIcon: 'find-active.png', text: this.$t('find.discovery'), link: 'news-adv', show: true},
          {icon: 'setting.png', activeIcon: 'setting-active.png', text: this.$t('setting.setting'), link: 'setting', show: true}
        ];
        return menus.filter(item => {
          return item.show;
        });
      }
    }
  };
</script>
<style lang="scss">
  @import '~assets/scss/_variables.scss';
  .bottom-bar {
    .van-tabbar-item--active {
      color: $black-gray !important;
    }
    .van-tabbar-item{
      color: #b0b0b0;
    }
  }
</style>
