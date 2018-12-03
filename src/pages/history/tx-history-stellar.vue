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
                           @leftClick="addAddress(item)"  @rightClick="showDetail(item)"  @click.native="showDetail(item)"></tx-history-item>
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
          limit: this.limit
        };
        if (direction === 'up') {
          if ((!param || param.cursor === undefined) && this.lastHistory) {
            option.cursor = this.lastHistory.blockNumber;
            option.order = 'asc';
          }
        } else {
          if ((!param || param.cursor === undefined) && this.firstHistory) {
            option.cursor = this.firstHistory.blockNumber;
            option.order = 'desc';
          }
        }
        return option;
      },
      async toHistory (data) {
        let fee = null;
        if (data.type === 'account_merge') {
          return null;
        }
        let toAddress = data.type === 'create_account' ? data.account : data.to;
        let fromAddress = data.type === 'create_account' ? data.source_account : data.from;
        let amount = data.type === 'create_account' ? data.starting_balance : data.amount;
        let history = {
          address: this.$store.state.account.address,
          acctType: this.$store.state.account.type,
          assetCode: data.asset_type === 'native' || data.type === 'create_account' ? 'XLM' : data.asset_code,
          assetIssuer: data.asset_issuer || '',
          txHash: data.transaction_hash,
          amount: amount,
          blockNumber: data.paging_token,
          to: toAddress,
          from: fromAddress,
          txTime: moment(data.created_at).format('YYYYMMDD HH:mm:ss'),
          fee:  fee,
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
