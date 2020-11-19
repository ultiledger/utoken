<template>
  <div class="text-center top-block">
    <div class="main-icon" :style="{'line-height':lineHeight}">
      <slot>
        <van-icon :name="iconName" class="icon-color x-large-font"/>
      </slot>
    </div>
    <div class="big-font text-color padding-top">
      {{title}}
    </div>
    <!--提示信息-->
    <div class="text-center normal-font sub-tip" v-if="subTip">
      {{subTip}}
    </div>
  </div>
</template>
<script>
  export default {
    props: {
      title: String,
      iconName: String,
      lineHeight: String,
      subTip: String
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
  @import "~assets/scss/variables";
  .top-block {
    padding-top: 30px;
    padding-bottom: 30px;
    .icon-color {
      color: #d1d7dd;
    }
    .text-color {
      color:#7b8a97;
    }
    .main-icon{
      width:45px;
      height: 45px;
      margin: 0 auto;
      line-height: 55px;
      margin-bottom: 10px;
    }
    .sub-tip {
      padding: 10px 0px;
      margin-left: 15px;
      margin-right: 15px;

    }
  }
</style>
