<template>
  <span v-if="this.switchable">
    <span @click.stop="setMode(false)" v-if="$store.state.setting.privacyMode">****<span v-if="suffix">&nbsp;{{suffix}}</span></span>
    <span @click.stop="setMode(true)" v-else><slot></slot></span>
  </span>
  <span v-else>
    <span  v-if="$store.state.setting.privacyMode">****<span v-if="suffix">&nbsp;{{suffix}}</span></span>
    <span  v-else><slot></slot></span>
  </span>
</template>
<script>
  import config from '../config';
  export default{
    name: config.prefix + 'Privacy',
    props: {
      suffix: String,
      switchable: {
        type: Boolean,
        default: true
      }
    },
    methods: {
      setMode (val) {
        if (!this.switchable) {
          return;
        }
        this.$store.dispatch('setPrivacyMode', val);
      }
    }
  };
</script>
<style lang="scss">
  @import 'src/assets/scss/_variables.scss';
</style>
