<template>
  <div class="gradient-bg">
    <slot></slot>
  </div>
</template>
<script>
  export default {};
</script>
<style lang="scss">
  @import 'src/assets/scss/_variables.scss';
  .gradient-bg{
    background-image: radial-gradient(circle at left top, $primay-gradient-light, $primay-gradient);
    .van-nav-bar{
      background: transparent;
      .van-nav-bar__text{
        color: #fff;
      }
    }
    .van-search {
      background: transparent !important;
      margin: 2px 0px;
      .van-field{
        background: rgba(255,255,255, 0.7);
      }
      .van-search__action {
        width: 70px;
        text-align: center;
        color: #fff;
      }
    }
  }
</style>
