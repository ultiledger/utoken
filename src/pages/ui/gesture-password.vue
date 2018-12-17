
<template>
  <van-popup v-model="show" class="container" position="bottom">
    <van-nav-bar class="no-border-nav">
      <span slot="left" v-show="pswObj.step !== 1 && canClose" @click="closePopup()" >
        <i class="ultfont ult-left"></i>&nbsp;{{$t('common.goBack')}}
      </span>
    </van-nav-bar>
    <div style="position: absolute; top: 50%;margin-top: -50%;left: 0px;width: 100%;">
      <div class="gestureTitle big-font" :style="gestureTitleStyle">{{gestureTitle}}</div>
      <canvas ref="canvas" class="canvas"></canvas>
    </div>
  </van-popup>
</template>

<script>
export default {
  props: {
    validateFun: Function, // 验证手势是否正确
    checkFun: Function, // 检查是否已设置手势
    canClose: { // 是否允许关闭
      type: Boolean,
      default: true
    },
    defaultColor: { // 默认颜色
      type: String,
      default: '#87888a'
    },
    trailColor: { // 轨迹颜色
      type: String,
      default: '#00c2c2'
    },
    saveSuccessColor: { // 保存成功颜色
      type: String,
      default: '#00c2c2'
    },
    warningColor: { // 警告颜色
      type: String,
      default: '#fa5555'
    },
    unlockSuccessColor: { // 解锁成功颜色
      type: String,
      default: '#00c2c2'
    },
    tipColor: { // 提示语颜色
      type: String,
      default: '#f2511a'
    }
  },
  data () {
    return {
      ctx: '',
      width: 0,
      height: 0,
      devicePixelRatio: 0,
      chooseType: '',
      r: '', // 公式计算
      lastPoint: [],
      arr: [],
      restPoint: [],
      pswObj: {},
      canvas: '',
      resetGesture: false, // 判断是否重置手势
      gestureTitleStyle: {},
      show: false,
      gestureTitle: this.$t('gesture.gestureTitle')
    };
  },
  methods: {
    closePopup () {
      /* setTimeout(() => {
        this.show = false;
      }, 1000); */
      this.$emit('close');
      this.show = false;
    },
    H5lock (obj) {
      this.height = obj.height;
      this.width = obj.width;
      this.chooseType = Number(window.localStorage.getItem('chooseType')) || obj.chooseType;
      this.devicePixelRatio = window.devicePixelRatio || 1;
    },
    drawCle (x, y) { // 初始化解锁密码面板 小圆圈
      this.ctx.strokeStyle = this.defaultColor;// 密码的点点默认的颜色
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(x, y, this.r, 0, Math.PI * 2, true);
      this.ctx.closePath();
      this.ctx.stroke();
    },
    drawPoint (style) { // 初始化圆心
      for (let i = 0; i < this.lastPoint.length; i++) {
        this.ctx.fillStyle = style;
        this.ctx.beginPath();
        this.ctx.arc(this.lastPoint[i].x, this.lastPoint[i].y, this.r / 2.5, 0, Math.PI * 2, true);
        this.ctx.closePath();
        this.ctx.fill();
      }
    },
    drawStatusPoint (type) { // 初始化状态线条
      for (let i = 0; i < this.lastPoint.length; i++) {
        this.ctx.strokeStyle = type;
        this.ctx.beginPath();
        this.ctx.arc(this.lastPoint[i].x, this.lastPoint[i].y, this.r, 0, Math.PI * 2, true);
        this.ctx.closePath();
        this.ctx.stroke();
      }
    },
    drawLine (style, po) { // style:颜色 解锁轨迹
      this.ctx.beginPath();
      this.ctx.strokeStyle = style;
      this.ctx.lineWidth = 3;
      this.ctx.moveTo(this.lastPoint[0].x, this.lastPoint[0].y);
      for (let i = 1; i < this.lastPoint.length; i++) {
        this.ctx.lineTo(this.lastPoint[i].x, this.lastPoint[i].y);
      }
      this.ctx.lineTo(po.x, po.y);
      this.ctx.stroke();
      this.ctx.closePath();
    },
    createCircle () { // 创建解锁点的坐标，根据canvas的大小来平均分配半径
      let n = this.chooseType;
      let count = 0;
      this.r = this.ctx.canvas.width / (2 + 4 * n);// 公式计算
      this.lastPoint = [];
      this.arr = [];
      this.restPoint = [];
      let r = this.r;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          count++;
          let obj = {
            x: j * 4 * r + 3 * r,
            y: i * 4 * r + 3 * r,
            index: count
          };
          this.arr.push(obj);
          this.restPoint.push(obj);
        }
      }
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      for (let i = 0; i < this.arr.length; i++) {
        this.drawCle(this.arr[i].x, this.arr[i].y);
      }
    },
    getPosition (e) { // 获取touch点相对于canvas的坐标
      let rect = e.currentTarget.getBoundingClientRect();
      let po = {
        x: (e.touches[0].clientX - rect.left) * this.devicePixelRatio,
        y: (e.touches[0].clientY - rect.top) * this.devicePixelRatio
      };
      return po;
    },
    showPopup () {
      this.gestureTitle = this.$t('gesture.gestureTitle');
      this.show = true;
      this.$nextTick(() => {
        this.init();
      });
    },
    update (po) { // 核心变换方法在touchmove时候调用
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      for (let i = 0; i < this.arr.length; i++) { // 每帧先把面板画出来
        this.drawCle(this.arr[i].x, this.arr[i].y);
      }
      this.drawPoint(this.trailColor);// 每帧花轨迹
      this.drawStatusPoint(this.trailColor);// 每帧花轨迹
      this.drawLine(this.trailColor, po, this.lastPoint);// 每帧画圆心
      for (let i = 0; i < this.restPoint.length; i++) {
        if (Math.abs(po.x - this.restPoint[i].x) < this.r && Math.abs(po.y - this.restPoint[i].y) < this.r) {
          this.drawPoint(this.restPoint[i].x, this.restPoint[i].y);
          this.lastPoint.push(this.restPoint[i]);
          this.restPoint.splice(i, 1);
          break;
        }
      }
    },
    checkPass (psw1, psw2) { // 检测密码
      let p1 = '';
      let p2 = '';
      for (let i = 0; i < psw1.length; i++) {
        p1 += psw1[i].index + psw1[i].index;
      }
      for (let i = 0; i < psw2.length; i++) {
        p2 += psw2[i].index + psw2[i].index;
      }
      return p1 === p2;
    },
    storePass (psw) { // touchend结束之后对密码和状态的处理
      // 解除事件,防止误操作
      this.unBindEvent();
      // 密码
      let pwd = '';
      for (let i = 0; i < psw.length; i++) {
        pwd += psw[i].index;
      }
      if (this.pswObj.step === 1) {
        if (this.checkPass(this.pswObj.fpassword, psw)) {
          this.pswObj.step = 2;
          this.gestureTitleStyle.color = this.saveSuccessColor;
          this.gestureTitle = this.$t('gesture.saveSuccess');
          this.drawStatusPoint(this.saveSuccessColor);
          this.drawPoint(this.saveSuccessColor);
          this.drawLine(this.saveSuccessColor, this.lastPoint[this.lastPoint.length - 1], this.lastPoint);// 每帧画圆心
          /* window.localStorage.setItem('passwordxx', JSON.stringify(this.pswObj.spassword)); */
          // 保存手势密码
          setTimeout(() => {
            this.$emit('saveGesturePwd', pwd);
            setTimeout(() => {
              this.reset();
            }, 1000);
          }, 200);
        } else {
          this.gestureTitleStyle.color = this.warningColor;
          this.gestureTitle = this.$t('common.confirmPwdTip');
          this.drawStatusPoint(this.warningColor);
          this.drawPoint(this.warningColor);
          this.drawLine(this.warningColor, this.lastPoint[this.lastPoint.length - 1], this.lastPoint);// 每帧画圆心
          delete this.pswObj.step;
          setTimeout(() => {
            this.reset();
          }, 1000);
        }
      } else if (this.pswObj.step === 2) {
        this.validateFun(pwd).then(ret => {
          if (ret) {
            if (this.resetGesture) {
              this.gestureTitleStyle.color = this.defaultColor;
              this.gestureTitle = this.$t('gesture.gestureTitle');
              this.pswObj = {};
              this.reset();
              return;
            }
            this.gestureTitleStyle.color = this.unlockSuccessColor;
            this.gestureTitle = this.$t('gesture.unlockSuccess');
            this.drawStatusPoint(this.unlockSuccessColor);// 小点点外圈高亮
            this.drawPoint(this.unlockSuccessColor);
            this.drawLine(this.unlockSuccessColor, this.lastPoint[this.lastPoint.length - 1], this.lastPoint);// 每帧画圆心
            // 解锁并登陆
            setTimeout(() => {
              this.$emit('unlock', pwd);
              setTimeout(() => {
                this.reset();
              }, 1000);
            }, 200);
          } else if (psw.length < 4) {
            this.drawStatusPoint(this.tipColor);
            this.drawPoint(this.tipColor);
            this.drawLine(this.tipColor, this.lastPoint[this.lastPoint.length - 1], this.lastPoint);// 每帧画圆心
            this.gestureTitleStyle.color = this.tipColor;
            this.gestureTitle = this.$t('gesture.connectPoints');
            setTimeout(() => {
              this.reset();
            }, 1000);
          } else {
            this.drawStatusPoint(this.tipColor);
            this.drawPoint(this.tipColor);
            this.drawLine(this.tipColor, this.lastPoint[this.lastPoint.length - 1], this.lastPoint);// 每帧画圆心
            this.gestureTitleStyle.color = this.tipColor;
            this.gestureTitle = this.$t('gesture.pwdError');
            setTimeout(() => {
              this.reset();
            }, 1000);
          }
        });
      } else {
        if (psw.length < 4) {
          this.drawStatusPoint(this.tipColor);
          this.drawPoint(this.tipColor);
          this.drawLine(this.tipColor, this.lastPoint[this.lastPoint.length - 1], this.lastPoint);// 每帧画圆心
          this.gestureTitleStyle.color = this.tipColor;
          this.gestureTitle = this.$t('gesture.connectPoints');
          setTimeout(() => {
            this.reset();
          }, 1000);
        } else {
          this.pswObj.step = 1;
          this.pswObj.fpassword = psw;
          this.gestureTitleStyle.color = this.defaultColor;
          this.gestureTitle = this.$t('gesture.reinput');
          setTimeout(() => {
            this.reset();
          }, 1000);
        }
      }
    },
    makeState () {
      this.gestureTitleStyle.color = this.defaultColor;
      if (this.pswObj.step === 2) {
        this.gestureTitle = this.$t('gesture.unlock');
      } else if (this.pswObj.step === 1) {
        this.gestureTitle = this.$t('gesture.reinput');
      } else {
        this.gestureTitle = this.$t('gesture.gestureTitle');
      }
    },
    updatePassword () {
      this.resetGesture = true;
      this.init();
    },
    initDom () {
      this.chooseType = Number(window.localStorage.getItem('chooseType')) || 3;
      this.devicePixelRatio = window.devicePixelRatio || 1;
      let canvas = this.$refs.canvas;
      let width = this.width || 320;
      let height = this.height || 320;
      // 高清屏锁放
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      canvas.height = height * this.devicePixelRatio;
      canvas.width = width * this.devicePixelRatio;
    },
    init () {
      this.chooseType = 3;
      this.initDom();
      // 检查是否已设置手势密码
      this.touchFlag = false;
      this.canvas = this.$refs.canvas;
      this.ctx = this.canvas.getContext('2d');
      this.createCircle();
      this.bindEvent();
      if (!this.resetGesture) {
        this.checkFun().then((ret) => {
          this.pswObj = ret ? {
            step: 2
          } : {};
          this.makeState();
        });
      }
    },
    reset () {
      this.makeState();
      this.createCircle();
      // 重新绑定事件
      this.bindEvent();
    },
    touchstart (e) {
      let self = this;
      e.preventDefault();// 某些android 的 touchmove不宜触发 所以增加此行代码
      let po = self.getPosition(e);
      for (let i = 0; i < self.arr.length; i++) {
        if (Math.abs(po.x - self.arr[i].x) < self.r && Math.abs(po.y - self.arr[i].y) < self.r) {
          self.touchFlag = true;
          self.drawPoint(self.arr[i].x, self.arr[i].y);
          self.lastPoint.push(self.arr[i]);
          self.restPoint.splice(i, 1);
          break;
        }
      }
    },
    touchmove (e) {
      let self = this;
      if (self.touchFlag) {
        self.update(self.getPosition(e));
      }
    },
    touchend () {
      let self = this;
      if (self.touchFlag) {
        self.touchFlag = false;
        self.storePass(self.lastPoint);
      }
    },
    bindEvent () {
      // 先解除事件
      this.unBindEvent();
      this.canvas = this.$refs.canvas;
      this.canvas.addEventListener('touchstart', this.touchstart, false);
      this.canvas.addEventListener('touchmove', this.touchmove, false);
      this.canvas.addEventListener('touchend', this.touchend, false);
    },
    unBindEvent () {
      this.canvas = this.$refs.canvas;
      this.canvas.removeEventListener('touchstart', this.touchstart, false);
      this.canvas.removeEventListener('touchmove', this.touchmove, false);
      this.canvas.removeEventListener('touchend', this.touchend, false);
    }
  }
};
</script>
<style scoped>
  .container{
    background-color: #fff;
    text-align: center;
    height: 100%;
  }
  .gestureTitle {
    text-align: center;
    width: 100%;
  }
  .userInfo {
    color: #87888a;
    font-size: 20px;
    font-weight:normal;
    width: 100%;
    text-align: center;
    margin-top: 2em;
  }
  .canvas{
    background-color:#fff;
    display: inline-block;
    width: 320px;
    height: 320px;
  }
</style>
