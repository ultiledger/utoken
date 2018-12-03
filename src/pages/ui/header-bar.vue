<template>
  <van-nav-bar class="header-bar">
      <span slot="left"  @click="goMessage">
        <div style="position: relative">
           <van-icon name="pending-evaluate"/>
            <span class="badge-tip" v-if="$store.state.msgTip['notReadedMsgCount'] > 0" style="top: 8px; left: 85%;position: absolute;">{{$store.state.msgTip['notReadedMsgCount']}}</span>
        </div>
      </span>
    <span slot="title">
       <slot></slot>
    </span>
    <!--<span slot="right">-->
       <!--<van-icon name="more-o"/>-->
    <!--</span>-->
  </van-nav-bar>
</template>
<script>
  export default {
    methods: {
      goMessage () {
        // console.info(this.$route.name);
        this.$router.push({name: 'message', params: {backPath: this.$route.name}});
      }
    }
  };
</script>
<style lang="scss">
  @import 'src/assets/scss/_variables.scss';
  .header-bar {
    .van-nav-bar__left{
      width: 50px;
      padding-right: 15px;
      color: #fff;
      font-size: 18px;
    }
    .van-nav-bar__title{
      max-width: calc(100% - 50px) !important;
      margin-left: 50px;
    }
    .van-nav-bar__right{
      width: 50px;
      padding-left: 15px;
      color: #fff;
      font-size: 18px;
    }
  }

</style>
