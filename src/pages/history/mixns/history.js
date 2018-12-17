// import Big from 'big.js';
// import moment from 'moment';
import txHistoryItem from '../tx-history-item';
import loadMoreBtn from '../load-more-btn';
export default{
  props: {
    asset: {
      type: Object,
      default () {
        return {};
      }
    },
    tab: Number
  },
  components: {
    txHistoryItem,
    loadMoreBtn
  },
  data () {
    return {
      tabActive: 0,
      // history: [],
      tempHistory: [],
      normalHistory: [],
      tempHistoryMap: {},
      lastHistory: null,
      firstHistory: null,
      timers: [],
      nextLoading: false,
      limit: 30,
      sticky: true
    };
  },
  watch: {
    tab () {
      this.tabActive = this.tab;
    },
    asset () {
      this.tabActive = 0;
      // this.history = [];
      this.tempHistory = [];
      this.normalHistory = [];
      this.tempHistoryMap = {};
      this.setRegion();
    }
  },
  computed: {
    outHistory () {
      return this.history.filter(item => {
        return item.txType === '0' || item.txType === '2';
      });
    },
    inHistory () {
      return this.history.filter(item => {
        return item.txType === '1';
      });
    },
    hasNext () {
      if (!this.firstHistory || this.firstHistory.firstHistory) {
        return false;
      }
      return true;
    },
    history () {
      return [...this.tempHistory, ...this.normalHistory];
    }
  },
  beforeDestroy () {
    this.clearTimers();
  },
  methods: {
    showDetail (item) {
      if (item.txType !== '3' && item.txType !== '4') {
        this.$emit('showDetail', item);
      }
    },
    addAddress (item) {
      let address = {
        address: item.txType === '1' ?  item.from : item.to,
        type: item.acctType
      };
      this.$emit('addAddress', address);
    },
    getHistory () {
      let history = this.getLocalHistory();
      // this.getLocalHistory();
      this.setRegion();
      if (!history || history.length === 0) {
        this.getRemoteHistory();
      } else {
        // this.history = history;
        this.setRegion();
      }
    },
    clearTimers () {
      this.timers.forEach(timer => {
        clearInterval(timer);
      });
      this.timers = [];
    },
    updateConfirmations () {},
    getLocalHistory () {
      this.normalHistory =  this.$collecitons.history.findHistory(this.$store.state.account.type, this.$store.state.account.address, this.asset.code, this.asset.issuer);
      this.tempHistory =  this.$collecitons.tempHistory.findHistory(this.$store.state.account.type, this.$store.state.account.address, this.asset.code, this.asset.issuer);
      this.tempHistoryMap = {};
      this.tempHistory.forEach(item => {
        this.tempHistoryMap[item.txHash] = item;
      });
      // console.info(this.tempHistoryMap);
      let history = [...this.tempHistory, ...this.normalHistory];
      this.updateConfirmations();
      return history;
    },
    getRemoteHistory (param, direction = 'up') {
      let option = this.getOption(param, direction);

      if (direction !== 'up') {
        this.nextLoading = true;
      }
      this.$wallet.getTransactions(this.$store.state.account.address, option)
        .then(async txs => {
          for (const item of txs) {
            let historyItem = await this.toHistory(item);
            if (!historyItem) {
              continue;
            }
            // console.info(this.history);
            if (!this.history || this.history.length == 0 ||
              (direction === 'up' && historyItem.txTime > this.lastHistory.txTime) ||
              (direction !== 'up' && historyItem.txTime < this.firstHistory.txTime)) {

              let storeNormalHistory =  this.$collecitons.history.findHistory(this.$store.state.account.type, this.$store.state.account.address, this.asset.code, this.asset.issuer, historyItem.txHash);
              if (!storeNormalHistory || storeNormalHistory.length === 0) {
                this.$collecitons.history.insertHistory(historyItem);
              }
              /*兑换记录处理*/
              if (this.toPathHistory) {
                let pathHistoryItem = await this.toPathHistory(item);
                if (pathHistoryItem) {
                  let storePathHistory =  this.$collecitons.history.findHistory(pathHistoryItem.acctType, pathHistoryItem.address, pathHistoryItem.assetCode, pathHistoryItem.assetIssuer, pathHistoryItem.txHash);
                  if (!storeNormalHistory || storePathHistory.length === 0) {
                    this.$collecitons.history.insertHistory(pathHistoryItem);
                  }
                }
              }
            }
          }

          let hasFirstHistory = this.firstHistory ? true : false;

          // this.history = this.getLocalHistory();
          this.getLocalHistory();
          this.setRegion();

          if ((direction !== 'up' || !hasFirstHistory) && (!txs || txs.length === 0 || txs.length < this.limit)) {
            if (this.firstHistory) {
              // let firstHistory = this.history[this.history.length - 1];
              this.firstHistory.firstHistory = true;
              this.$collecitons.history.updateHistory(this.firstHistory.txHash, item => {
                return item.firstHistory = true;
              });
            }
          }
          this.nextLoading = false;
        }).catch(err => {
        this.nextLoading = false;
        console.info(err);
      });
    }
  }
};
