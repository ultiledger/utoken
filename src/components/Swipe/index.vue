<template>
  <div :class="b()">
    <div
      :style="trackStyle"
      :class="b('track')"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @touchcancel="onTouchEnd"
      @transitionend="$emit('change', activeIndicator)"
    >
      <slot />
    </div>
    <div
      v-if="showIndicators && count > 1"
      :class="b('indicators', { vertical })"
    >
      <i
        v-for="index in count"
        :key="index"
        :class="b('indicator', { active: index - 1 === activeIndicator })"
      />
    </div>
  </div>
</template>
<script>
  import { Swipe } from 'vant';
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
    mixins: [Swipe],
    name: config.prefix + 'Swipe',
    props: {
      loop: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        swidth: 0,
        sheight: 0,
        offset: 0,
        active: 0,
        deltaX: 0,
        deltaY: 0,
        swipes: [],
        swiping: false
      };
    },
    methods: {
      b (el, mods) {
        const name = 'van-swipe';
        if (el && typeof el !== 'string') {
          mods = el;
          el = '';
        }
        el = join(name, el, ELEMENT);
        return mods ? [el, prefix(el, mods)] : el;
      },
      // initialize swipe position
      initialize (active = this.initialSwipe) {
        clearTimeout(this.timer);
        const rect = this.$el.getBoundingClientRect();
        if (this.$el) {
          this.swidth = rect.width * 0.8;
          this.sheight = rect.height;
        }
        this.swiping = true;
        this.active = active;
        this.offset = this.count > 1 ? -this.size * this.active : 0;
        this.swipes.forEach((swipe, index) => {
          swipe.offset = rect.width / 30 * (index + 1);
          if (index > 0) {
            swipe.swipeWidth = this.swidth;
            if (index === this.swipes.length - 1) {
              swipe.swipeWidth = rect.width * 0.9 - 10;
            }
          } else if (index === 0) {
            swipe.swipeWidth = rect.width * 0.9 - 10;
            if (this.swipes.length === 1) {
              swipe.swipeWidth = rect.width - rect.width / 30 * 2;
            }
          }
        });
        this.autoPlayFn();
      },
      swipeTo (index, cb) {
        this.swiping = true;
        this.correctPosition();
        setTimeout(() => {
          this.swiping = false;
          this.move(index % this.count - this.active);
          cb();
        }, 30);
      },
      autoPlayFn () {
        const { autoplay, loop } = this;
        if (autoplay && this.count > 1) {
          this.clear();
          this.timer = setTimeout(() => {
            this.swiping = true;
            this.correctPosition();

            if (this.active + 1 >= this.count && loop) {
              this.clear();
              this.swipeTo(0, this.autoPlay);
            } else {
              setTimeout(() => {
                this.swiping = false;
                this.move(1);
                this.autoPlayFn();
              }, 30);
            }
          }, autoplay);
        }
      },
      move (move = 0, offset = 0) {
        const { active, count, swipes, loop } = this;
        const atFirst = active === 0;
        const atLast = active === count - 1;
        const outOfBounds = (atFirst && (offset > 0 || move < 0)) || (atLast && (offset < 0 || move > 0));
        if (outOfBounds || count <= 1) {
          if (atLast && loop) {
            this.clear();
            this.swipeTo(0, this.autoPlayFn);
          }
          return;
        }

        if (move) {
          if (active === -1) {
            swipes[count - 1].offset = 0;
          }
          // swipes[0].offset = atLast && move > 0 ? trackSize : 0;

          this.active += move;
        } else {
          if (atFirst) {
            // swipes[count - 1].offset = -this.trackSize + (this.size / 8 * 2 / 3);
          } else if (atLast) {
            // swipes[0].offset = delta < 0 ? trackSize : 0;
          }
        }
        this.offset = offset - this.active * (this.swidth + this.swidth / 8 / 3);
        if (this.active >= 1) {
          this.offset -= this.swidth / 8 / 3 - 10;
          if (this.active === this.count - 1) {
            this.offset -= this.swidth / 8 / 3 - 10;
          }
        }
      }
    },
    computed: {
      trackSize () {
        let swipesWidth = 0;
        for (let i = 0; i < this.swipes.length; i++) {
          swipesWidth += this.swipes[i].swipeWidth;
        }
        return swipesWidth;
      },
      trackStyle () {
        return {
          [this.vertical ? 'height' : 'width']: `${this.trackSize}px`,
          transitionDuration: `${this.swiping ? 0 : this.duration}ms`,
          transform: `translate${this.vertical ? 'Y' : 'X'}(${this.offset}px)`
        };
      }
    }
  };
</script>
<style lang="scss" scoped>

</style>
