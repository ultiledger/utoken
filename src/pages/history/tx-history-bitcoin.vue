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
  import moment from 'moment';
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
            data.txs.forEach(item => {
              let history = this.toHistory(item);
              this.normalHistory.push(history);
            });
            this.nextLoading = false;
          }).catch(err => {
          this.nextLoading = false;
          console.info(err);
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
      toHistory (data) {
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
          txTime: moment.unix(data.time).format('YYYYMMDD HH:mm:ss'),
          fee: fee,
          txType: data.out[0].addr.toLowerCase() === this.$store.state.account.address.toLowerCase() ? '1' : '0',
          data: data
        };
        return history;
      }
    }
  };
</script>
<style lang="scss">
</style>
