<template>
  <li class="mint-indexsection">
    <p class="mint-indexsection-index">{{ index }}</p>
    <ul>
      <slot></slot>
    </ul>
  </li>
</template>
<style lang="scss" scoped>
    .mint-indexsection {
        padding: 0;
        margin: 0
    }
    .mint-indexsection-index {
        margin: 0;
        padding: 10px;
        background-color: #fafafa
    }
    .mint-indexsection-index + ul {
        padding: 0
    }
</style>

<script type="text/babel">
  import config from '../config';
  export default {
    name: config.prefix + 'IndexSection',

    props: {
      index: {
        type: String,
        required: true
      }
    },

    mounted () {
      this.$parent.sections.push(this);
    },

    beforeDestroy () {
      let index = this.$parent.sections.indexOf(this);
      if (index > -1) {
        this.$parent.sections.splice(index, 1);
      }
    }
  };
</script>
