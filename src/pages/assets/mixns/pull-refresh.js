import {PullRefresh} from 'vant';
export default {
  mixins: [PullRefresh],
  computed: {
    style() {
      if (this.animationDuration) {
        return {
          transition: `${this.duration}ms`,
          transform: `translate3d(0,${this.height}px, 0)`
        };
      }
      return {};
    }
  }
};
