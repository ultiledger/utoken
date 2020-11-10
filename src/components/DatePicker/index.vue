<template>
  <div>
    <van-action-sheet v-model="actionsheetShow" @click-overlay="cancel" :get-container="getContainer">
      <van-datetime-picker
        v-model="curDate"
        :title="title"
        :type="type"
        :min-date="minDateTemp"
        :max-date="maxDateTemp"
        :min-dour="minHour"
        :max-hour="maxHour"
        :min-minute="minMinute"
        :max-minute="maxMinute"
        @confirm="confirm"
        @cancel="cancel"/>
    </van-action-sheet>
  </div>
</template>
<script>
  import dayjs from 'dayjs';
  import config from '../config';
  export default {
    name: config.prefix + 'DatePicker',
    props: {
      value: String,
      show: {
        type: Boolean,
        default: false
      },
      title: String,
      type: {
        type: String,
        default: 'date'
      },
      minDate: String, // YYYYMMDD
      maxDate: String, // YYYYMMDD
      minHour: {
        type: Number,
        default: 0
      },
      maxHour: {
        type: Number,
        default: 23
      },
      minMinute: {
        type: Number,
        default: 0
      },
      maxMinute: {
        type: Number,
        default: 59
      },
      formatter: Function,
      valueFormatter: String
    },
    data () {
      return {
        curDate: new Date(),
        actionsheetShow: false
      };
    },
    watch: {
      show () {
        if (this.show) {
          if (this.value) {
            this.curDate = dayjs(this.value, this.valueFormatterStr).toDate();
          } else {
            this.curDate = new Date();
          }
        }
        this.actionsheetShow = this.show;
      },
      value () {
        // if (this.value) {
        //   this.curDate = dayjs(this.value, this.valueFormatterStr).toDate();
        // } else {
        //   this.curDate = new Date();
        // }
      }
    },
    computed: {
      valueFormatterStr () {
        if (!this.valueFormatter) {
          let formatter = {
            'date': 'YYYYMMDD',
            'datetime': 'YYYYMMDD HH:mm:ss',
            'year-month': 'YYYYMM',
            'time': 'HH:mm:ss'
          };
          return formatter[this.type];
        }
        return this.valueFormatter;
      },
      minDateTemp () {
        if (this.minDate) {
          return dayjs(this.minDate, 'YYYYMMDD').toDate();
        }
        return dayjs().subtract(10, 'y').toDate(); // 默认10年前
      },
      maxDateTemp () {
        if (this.maxDate) {
          return dayjs(this.maxDate, 'YYYYMMDD').toDate();
        }
        return dayjs().add(10, 'y').toDate(); // 默认10年后
      }
    },
    methods: {
      close () {
        this.actionsheetShow = false;
        this.$emit('update:show', false);
      },
      up () {
        if (this.value) {
          this.curDate = dayjs(this.value, this.valueFormatterStr).toDate();
        } else {
          this.curDate = new Date();
        }
        this.actionsheetShow = true;
      },
      confirm () {
        let val = dayjs(this.curDate).format(this.valueFormatterStr);
        this.$emit('input', val);
        this.close();
      },
      cancel () {
        this.close();
      },
      getContainer () {
        return document.body;
      }
    }
  };
</script>
<style lang="scss">
</style>
