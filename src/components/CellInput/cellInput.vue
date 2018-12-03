<template>
  <div class="van-password-input">
    <ul  class="van-hairline--surround van-password-input__security" style="height: 50px;" @touchstart.stop="$emit('focus')">
      <li v-for="point in points" class="van-hairline" :key="point">
        <span>{{point}}</span>
      </li>
    </ul>
    <div
      v-if="errorInfo || info"
      v-text="errorInfo || info"
      :class="errorInfo ? 'van-password-input__error-info' : 'van-password-input__info'"
    />
  </div>
</template>

<script>
  import config from '../config';
  export default {
    name: config.prefix + 'CellInput',
    props: {
      info: String,
      errorInfo: String,
      value: {
        type: String,
        default: ''
      },
      length: {
        type: Number,
        default: 6
      }
    },

    computed: {
      points () {
        const arr = [];
        for (let i = 0; i < this.length; i++) {
          arr[i] = this.value[i] ? this.value[i] : '';
        }
        return arr;
      }
    }
  };
</script>

<style lang="scss" rel="stylesheet/scss">
  @import "~assets/scss/variables";
  .van-password-input {
    margin: 0 15px;
    user-select: none;
    position: relative;

    &:focus {
      outline: none;
    }

    &__info,
    &__error-info {
      font-size: 14px;
      margin-top: 15px;
      text-align: center;
    }

    &__info {
      color: $muted-color;
    }

    &__error-info {
      color: $danger-color;
    }

    &__security {
      width: 100%;
      height: 50px;
      display: flex;
      background-color: #fff;

      &::after {
        border-radius: 6px;
      }

      li {
        flex: 1;
        height: 100%;
        position: relative;
        line-height: 48px;
        text-align: center;
        font-size: 16px;
        &:not(:first-of-type)::after {
          border-left-width: 1px;
        }
      }
    }
  }
</style>
