<template>
  <div>
    <van-tabs v-model="tabActive" :sticky="sticky" :offset-top="45">
      <van-tab  :title="$t('common.whole')">
        <van-cell-group>
          <tx-history-item :key="index" v-for="(item, index) in history" :item="item"
                           @leftClick="addAddress(item)"  @rightClick="showDetail(item)"  @click.native="showDetail(item)"></tx-history-item>
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
                           @leftClick="addAddress(item)" @rightClick="showDetail(item)"  @click.native="showDetail(item)"></tx-history-item>
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
    methods: {
      setRegion () {
        let tempAllHistorys = this.$collecitons.history.findHistory(this.$store.state.account.type, this.$store.state.account.address);
        if (tempAllHistorys && tempAllHistorys.length > 0) {
          this.lastHistory = tempAllHistorys[0];
          this.firstHistory = tempAllHistorys[tempAllHistorys.length - 1];
        } else {
          this.lastHistory = null;
          this.firstHistory = null;
        }
      },
      getOption (param, direction) {
        let option = {
          types: ['payment'],
          limit: this.limit
        };
        if (direction === 'up') {
          if ((!param || param.minLedgerVersion === undefined) && this.lastHistory) {
            option.minLedgerVersion = this.lastHistory.blockNumber;
          }
        } else {
          if ((!param || param.maxLedgerVersion === undefined) && this.firstHistory) {
            option.maxLedgerVersion = this.firstHistory.blockNumber;
          }
        }
        return option;
      },
      async toHistory (data) {
        let toAddress = data.specification.destination.address;
        let deliveredAmount = data.outcome.deliveredAmount || {};
        let assetIssuer = deliveredAmount.counterparty;
        if (deliveredAmount.currency && deliveredAmount.currency !== 'XRP') {
          let balanceChanges = data.outcome.balanceChanges[this.$store.state.account.address];
          for(let i = 0, len = balanceChanges.length; i < len; i++) {
            if (balanceChanges[i].currency === deliveredAmount.currency) {
              assetIssuer = balanceChanges[i].counterparty;
              break;
            }
          }
        }
        let history = {
          address: this.$store.state.account.address,
          acctType: this.$store.state.account.type,
          assetCode: deliveredAmount.currency,
          assetIssuer: assetIssuer,
          txHash: data.id,
          amount: deliveredAmount.value || '',
          blockNumber: data.outcome.ledgerVersion,
          to: toAddress,
          from: data.specification.source.address,
          txTime: moment(data.outcome.timestamp).format('YYYYMMDD HH:mm:ss'),
          fee:  data.outcome.fee,
          txType: toAddress.toLowerCase() === this.$store.state.account.address.toLowerCase() ? '1' : '0',
          data: data
        };

        return history;
      }
    }
  };
</script>
<style lang="scss">
</style>
