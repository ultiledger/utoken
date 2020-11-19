<template>
  <div>
    <van-tabs v-model="tabActive" :sticky="sticky" :offset-top="45">
      <van-tab  :title="$t('common.whole')">
        <van-cell-group>
          <tx-history-item :key="index" v-for="(item, index) in history" :item="item"
                  @leftClick="addAddress(item)"  @rightClick="showDetail(item)" @click.native="showDetail(item)"></tx-history-item>
        </van-cell-group>
        <div class="text-center">
          <load-more-btn :loading="nextLoading" @load-more="getRemoteHistory({}, 'down')" :has-next="hasNext"></load-more-btn>
          <br>
        </div>
      </van-tab>
      <van-tab  :title="$t('common.pullOut')">
        <van-cell-group>
          <tx-history-item :key="index" v-for="(item, index) in outHistory" :item="item"
                   @leftClick="addAddress(item)" @rightClick="showDetail(item)"  @click.native="showDetail(item)"></tx-history-item>
        </van-cell-group>
        <div class="text-center">
          <load-more-btn :loading="nextLoading" @load-more="getRemoteHistory({}, 'down')" :has-next="hasNext"></load-more-btn>
          <br>
        </div>
      </van-tab>
      <van-tab  :title="$t('common.pullIn')">
        <van-cell-group>
          <tx-history-item :key="index" v-for="(item, index) in inHistory" :item="item"
                    @leftClick="addAddress(item)"    @rightClick="showDetail(item)"  @click.native="showDetail(item)"></tx-history-item>
        </van-cell-group>
        <div class="text-center">
          <load-more-btn :loading="nextLoading" @load-more="getRemoteHistory({}, 'down')" :has-next="hasNext"></load-more-btn>
          <br>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>
<script>
  import dayjs from 'dayjs';
  import history from './mixns/history';
  export default{
    mixins: [history],
    data () {
      return {
        page: 1,
        total: 0
      };
    },
    computed: {
      hasNext () {
        if (this.total === this.history.length) {
          return false;
        }
        return true;
      }
    },
    methods: {
      clearHistory () {
        this.tempHistory = [];
        this.normalHistory = [];
      },
      getHistory () {
        this.getRemoteHistory();
      },
      getRemoteHistory (param, direction = 'up') {
        let option = this.getOption(param, direction);
        if (direction !== 'up') {
          this.nextLoading = true;
        }
        if (this.page === 1) {
          this.clearHistory();
        }
        this.$wallet.getTransactions(this.$store.state.account.address, option)
          .then(data => {
            this.total = data.wallet.n_tx;
            let lastBlockHeight = data.info.latest_block.height;
            data.txs.forEach(item => {
              item.confirmations = 0;
              if (item.block_height) {
                item.confirmations = lastBlockHeight - item.block_height + 1;
              }
              let history = this.toHistory(item);
              if (history) {
                this.normalHistory.push(history);
              }
            });
            this.nextLoading = false;
          }).catch(err => {
          this.nextLoading = false;
          throw new Error(err);
        });
      },
      setRegion () {
      },
      getOption (param, direction) {
        if (direction === 'up') {
          this.page = 1;
        } else {
          this.page++;
        }
        let option = {
          limit: this.limit,
          offset: this.limit * (this.page - 1)
        };
        return option;
      },
      updateConfirmations () {
        let confirmations = 6;
        this.clearTimers();
        this.tempHistory.forEach(item => {
          let timer = setInterval(async () => {
            const trxConfirmations = await this.$wallet.getConfirmations(item);
            //console.log('trxConfirmations:', trxConfirmations);
            if (trxConfirmations === -1) {
              this.$collecitons.tempHistory.removeHistory({txHash: item.txHash});
              this.getRemoteHistory();
            }
            if (trxConfirmations > confirmations) {
              this.$collecitons.tempHistory.removeHistory({txHash: item.txHash});
              clearInterval(timer);
              this.$store.dispatch('setBalances', this.$store.state.account.address);
              this.getRemoteHistory();
            } else {
              this.$collecitons.tempHistory.updateHistory(item.txHash, history => {
                history.confirmations = trxConfirmations;
              });
              item.confirmations = trxConfirmations;
            }
          }, 20 * 1000);
          this.timers.push(timer);
        });
      },
      checkTempHistory (data) {
        let storeTempHistory =  this.$collecitons.tempHistory.findHistory(this.$store.state.account.type, this.$store.state.account.address, this.asset.code, this.asset.issuer, data.hash);
        if (storeTempHistory && storeTempHistory.length > 0) {
          this.$collecitons.tempHistory.updateHistory(data.hash, history => {
            history.confirmations = data.confirmations;
          });
          this.tempHistory =  this.$collecitons.tempHistory.findHistory(this.$store.state.account.type, this.$store.state.account.address, this.asset.code, this.asset.issuer);
          this.updateConfirmations();
          return true;
        }

        let fee = '0';
        if (data.fee) {
          fee = this.$wallet.transfToBtc(data.fee);
        }
        if (data.confirmations <= 6) {
          let tempHistory = {
            address: this.$store.state.account.address,
            acctType: this.$store.state.account.type,
            assetCode: this.asset.code,
            txHash: data.hash,
            amount: Math.abs(this.$wallet.transfToBtc(data.result)),
            blockNumber: data.block_height,
            to: data.out[0].addr,
            from: data.inputs[0].prev_out.addr,
            txTime: dayjs.unix(data.time).format('YYYYMMDD HH:mm:ss'),
            fee: fee,
            txType: data.out[0].addr.toLowerCase() === this.$store.state.account.address.toLowerCase() ? '1' : '0',
            data: data,
            confirmations: data.confirmations
          };
          this.$collecitons.tempHistory.insertHistory(tempHistory);
          this.tempHistory.push(tempHistory);
          this.updateConfirmations();
          return true;
        }
        return false;
      },
      toHistory (data) {
        if (!this.checkTempHistory(data)) {
          let fee = '0';
          if (data.fee) {
            fee = this.$wallet.transfToBtc(data.fee);
          }
          let history = {
            address: this.$store.state.account.address,
            acctType: this.$store.state.account.type,
            assetCode: this.asset.code,
            txHash: data.hash,
            amount: Math.abs(this.$wallet.transfToBtc(data.result)),
            blockNumber: data.block_height,
            to: data.out[0].addr,
            from: data.inputs[0].prev_out.addr,
            txTime: dayjs.unix(data.time).format('YYYYMMDD HH:mm:ss'),
            fee: fee,
            txType: data.out[0].addr.toLowerCase() === this.$store.state.account.address.toLowerCase() ? '1' : '0',
            data: data
          };
          return history;
        }
      }
    }
  };
</script>
<style lang="scss">
</style>
