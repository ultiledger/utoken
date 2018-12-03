<template>
  <div :class="b()" :style="style">
    <slot />
  </div>
</template>

<script>
import { SwipeItem } from 'vant';
import config from '../config';
const ELEMENT = '__';
const MODS = '--';
const prefix = (name, mods) => {
  if (typeof mods === 'string') {
    return join(name, mods, MODS);
  }

  if (Array.isArray(mods)) {
    return mods.map(item => prefix(name, item));
  }

  const ret = {};
  Object.keys(mods).forEach(key => {
    ret[name + MODS + key] = mods[key];
  });
  return ret;
};
const join = (name, el, symbol) => el ? name + symbol + el : name;

export default {
  name: config.prefix + 'SwipeItem',

  mixins: [SwipeItem],

  methods: {
    b (el, mods) {
      const name = 'van-swipe-item';
      if (el && typeof el !== 'string') {
        mods = el;
        el = '';
      }
      el = join(name, el, ELEMENT);
      return mods ? [el, prefix(el, mods)] : el;
    }
  },

  computed: {
    style () {
      const { vertical, height } = this.$parent;
      let self = this;
      return {
        width: self.swipeWidth + 'px',
        height: vertical ? height + 'px' : '100%',
        transform: `translate${vertical ? 'Y' : 'X'}(${this.offset}px)`
      };
    }
  }
};
</script>
