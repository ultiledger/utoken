<template>
  <div class="container" :class="!noPadding ? 'padding-15' : ''">
    <div class="title-container normal-font" v-if="title">
      <span class="pull-left" :class="titleClass ? 'title' : ''">{{title}}</span>
      <span class="pull-right">
        <slot name="title-tip"></slot>
      </span>
    </div>
    <van-loading color="black" v-if="loading" style="width: 60px; height: 60px;margin: 0 auto;padding: 10px;"/>
    <slot v-else></slot>
  </div>
</template>
<script>
  import config from '../config';
  export default{
    name: config.prefix + 'Block',
    props: {
      title: {
        type: String
      },
      loading: {
        type: Boolean,
        default: false
      },
      noPadding: {
        type: Boolean,
        default: false
      },
      titleClass: {
        type: Boolean,
        default: true
      }
    }
  };
</script>
<style lang="scss">
  @import 'src/assets/scss/_variables.scss';
  .container{
    background: #fff;
    padding: 10px 0;
  }
  .padding-15{
    padding-left: 15px;
    padding-right: 15px;
  }
  .title-container {
    height: 2em;
    line-height: 2em;
    .title-tip{
      margin-left: 10px;
    }
    .title{
      position: relative;
      padding-left: 14px;
      &:before{
        position: absolute;
        left: 0;
        top: .5em;
        width: 6px;
        height: 1em;
        border-radius: 4px;
        background: $primary-color;
      }
    }
  }
</style>
