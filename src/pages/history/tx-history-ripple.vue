<template>
  <div>
    <van-tabs v-model="tabActive" :sticky="sticky" :offset-top="45">
      <van-tab  :title="$t('common.whole')">
        <van-cell-group>
          <tx-history-item :key="index" v-for="(item, index) in history" :item="item"
                           @leftClick="addAddress(item)"  @rightClick="showDetail(item)"  @click.native="showDetail(item)"></tx-history-item>
        </van-cell-group>
        <div class="text-center">
          <load-more-btn :loading="nextLoading" @load-more="getRemoteHistory({}, 'down')" :has-next.sync="hasMore"></load-more-btn>
          <br>
        </div>
      </van-tab>
      <van-tab  :title="$t('common.pullOut')">
        <van-cell-group>
          <tx-history-item :key="index" v-for="(item, index) in outHistory" :item="item"
                           @leftClick="addAddress(item)" @rightClick="showDetail(item)"  @click.native="showDetail(item)"></tx-history-item>
        </van-cell-group>
        <div class="text-center">
          <load-more-btn :loading="nextLoading" @load-more="getRemoteHistory({}, 'down')" :has-next.sync="hasMore && outHistory.length > 0"></load-more-btn>
          <br>
        </div>
      </van-tab>
      <van-tab  :title="$t('common.pullIn')">
        <van-cell-group>
          <tx-history-item :key="index" v-for="(item, index) in inHistory" :item="item"
                           @leftClick="addAddress(item)" @rightClick="showDetail(item)"  @click.native="showDetail(item)"></tx-history-item>
        </van-cell-group>
        <div class="text-center">
          <load-more-btn :loading="nextLoading" @load-more="getRemoteHistory({}, 'down')" :has-next.sync="hasMore && inHistory.length > 0"></load-more-btn>
          <br>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>
<script>
  import moment from 'moment';
  import history from './mixns/history';
  import coins from 'src/wallet/coins';
  export default{
    mixins: [history],
    data () {
      return {
        hasMore: false,
        rps: null
      };
    },
    methods: {
      clearHistory () {
        this.tempHistory = [];
        this.normalHistory = [];
      },
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
      getHistory () {
        this.getRemoteHistory();
      },
      getRemoteHistory (param, direction = 'up') {
        if (direction !== 'up') {
          this.nextLoading = true;
        }
        if (direction === 'up') {
          this.hasMore = false;
          this.clearHistory();
        }
        let option = {};
        if (this.hasMore) {
          option = {hasMore: true, historys: this.rsp};
        }
        this.$wallet.getTransactions(this.$store.state.account.address, option)
            .then(ret => {
              this.hasMore = ret.hashMore;
              if (this.hasMore) {
                this.rsp = ret.data;
              }
              ret.data.transactions.forEach(item => {
                if (item.tx && item.tx.TransactionType === 'Payment' && item.validated && item.meta.TransactionResult === 'tesSUCCESS') {
                  let history = this.toHistory(item);
                  if (history) {
                    this.normalHistory.push(history);
                  }
                }
              });
              this.filterHistory();
              this.nextLoading = false;
            }).catch(err => {
          this.nextLoading = false;
          console.info(err);
        });
      },
      shortType (type) {
        return coins[type].symbol || type;
      },
      filterHistory () {
        if (this.normalHistory && this.normalHistory.length > 0) {
          let address = this.$store.state.account.address;
          let acctType = this.$store.state.account.type;
          this.normalHistory = this.normalHistory.filter(item => {
            if (item.assetIssuer) {
              return item.assetCode === this.asset.code && item.address === address && item.acctType === acctType;
            } else {
              return item.assetCode === this.shortType(acctType) && item.address === address && item.acctType === acctType;
            }
          });
        }
      },
      toHistory (data) {
        let tx = data.tx;
        let toAddress = tx.Destination;
        /* let deliveredAmount = data.outcome.deliveredAmount || {};
        let assetIssuer = deliveredAmount.counterparty;
        if (deliveredAmount.currency && deliveredAmount.currency !== 'XRP') {
          let balanceChanges = data.outcome.balanceChanges[this.$store.state.account.address];
          for(let i = 0, len = balanceChanges.length; i < len; i++) {
            if (balanceChanges[i].currency === deliveredAmount.currency) {
              assetIssuer = balanceChanges[i].counterparty;
              break;
            }
          }
        } */
        let assetCode = '';
        let assetIssuer = '';
        let fromAddress = tx.Account;
        let amount = data.meta.delivered_amount;
        if (data.meta.delivered_amount instanceof Object) {
          amount = data.meta.delivered_amount.value;
          if (toAddress === data.meta.delivered_amount.issuer && this.$store.state.account.address === data.meta.delivered_amount.issuer) {
            assetIssuer = fromAddress;
          } else {
            assetIssuer = data.meta.delivered_amount.issuer;
          }
          assetCode = data.meta.delivered_amount.currency;
          // fromAddress = data.meta.delivered_amount.issuer;
        } else {
          amount = data.meta.delivered_amount / 1000000;
          assetCode = this.asset.code;
        }
        let history = {
          address: this.$store.state.account.address,
          acctType: this.$store.state.account.type,
          assetCode: assetCode,
          assetIssuer: assetIssuer,
          txHash: tx.hash,
          amount: amount,
          blockNumber: tx.inLedger,
          to: toAddress,
          toTag: tx.DestinationTag,
          from: fromAddress,
          txTime: moment((tx.date + 0x386D4380) * 1000).format('YYYYMMDD HH:mm:ss'),
          fee:  tx.Fee / 1000000,
          txType: toAddress.toLowerCase() === this.$store.state.account.address.toLowerCase() ? '1' : '0',
          data: tx
        };
        return history;
      }
    }
  };
</script>
<style lang="scss">
</style>
