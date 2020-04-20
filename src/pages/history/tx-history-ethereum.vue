<template>
  <div>
    <van-tabs v-model="tabActive" :sticky="sticky" :offset-top="45">
      <van-tab :title="$t('common.whole')">
        <van-cell-group>
          <tx-history-item
            :key="index"
            v-for="(item, index) in history"
            :item="item"
            @leftClick="addAddress(item)"
            @rightClick="showDetail(item)"
            @click.native="showDetail(item)"
          ></tx-history-item>
        </van-cell-group>
        <div class="text-center">
          <load-more-btn
            :loading="nextLoading"
            @load-more="getRemoteHistory({}, 'down')"
            :has-next="hasNext"
          ></load-more-btn>
          <br />
        </div>
      </van-tab>
      <van-tab :title="$t('common.pullOut')">
        <van-cell-group>
          <tx-history-item
            :key="index"
            v-for="(item, index) in outHistory"
            :item="item"
            @leftClick="addAddress(item)"
            @rightClick="showDetail(item)"
            @click.native="showDetail(item)"
          ></tx-history-item>
        </van-cell-group>
        <div class="text-center">
          <load-more-btn
            :loading="nextLoading"
            @load-more="getRemoteHistory({}, 'down')"
            :has-next="hasNext"
          ></load-more-btn>
          <br />
        </div>
      </van-tab>
      <van-tab :title="$t('common.pullIn')">
        <van-cell-group>
          <tx-history-item
            :key="index"
            v-for="(item, index) in inHistory"
            :item="item"
            @leftClick="addAddress(item)"
            @rightClick="showDetail(item)"
            @click.native="showDetail(item)"
          ></tx-history-item>
        </van-cell-group>
        <div class="text-center">
          <load-more-btn
            :loading="nextLoading"
            @load-more="getRemoteHistory({}, 'down')"
            :has-next="hasNext"
          ></load-more-btn>
          <br />
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>
<script>
import Big from "big.js";
import moment from "moment";
import history from "./mixns/history";
import { CoinType } from "../../wallet/constants";

export default {
  mixins: [history],
  methods: {
    setRegion() {
      if (this.normalHistory && this.normalHistory.length > 0) {
        this.lastHistory = this.normalHistory[0];
        this.firstHistory = this.normalHistory[this.normalHistory.length - 1];
      } else {
        this.lastHistory = null;
        this.firstHistory = null;
      }
    },
    updateConfirmations() {
      let confirmations = 6;
      this.clearTimers();
      this.tempHistory.forEach(item => {
        let timer = setInterval(async () => {
          const trxConfirmations = await this.$wallet.getConfirmations(
            item.txHash
          );
          if (trxConfirmations === -1) {
            this.$collecitons.tempHistory.removeHistory({
              txHash: item.txHash
            });
            this.getRemoteHistory();
          }
          if (trxConfirmations > confirmations) {
            this.$collecitons.tempHistory.removeHistory({
              txHash: item.txHash
            });
            clearInterval(timer);
            this.$store.dispatch(
              "setBalances",
              this.$store.state.account.address
            );
            this.getRemoteHistory();
          } else {
            this.$collecitons.tempHistory.updateHistory(
              item.txHash,
              history => {
                history.confirmations = trxConfirmations;
              }
            );
            item.confirmations = trxConfirmations;
          }
        }, 20 * 1000);
        this.timers.push(timer);
      });
    },
    getOption(param, direction) {
      let option = {
        sort: "desc",
        offset: this.limit,
        page: "1",
        assetCode: this.asset.code
      };
      if (direction === "up") {
        if ((!param || param.startblock === undefined) && this.lastHistory) {
          option.startblock = this.lastHistory.blockNumber;
        }
      } else {
        if ((!param || param.endblock === undefined) && this.firstHistory) {
          option.endblock = this.firstHistory.blockNumber;
        }
      }
      return option;
    },
    checkTempHistory(data, isContract) {
      let storeTempHistory = this.$collecitons.tempHistory.findHistory(
        this.$store.state.account.type,
        this.$store.state.account.address,
        this.asset.code,
        this.asset.issuer,
        data.hash
      );
      if (storeTempHistory && storeTempHistory.length > 0) {
        this.$collecitons.tempHistory.updateHistory(data.hash, history => {
          history.confirmations = data.confirmations;
        });
        this.tempHistory = this.$collecitons.tempHistory.findHistory(
          this.$store.state.account.type,
          this.$store.state.account.address,
          this.asset.code,
          this.asset.issuer
        );
        return true;
      }

      let fee = "0";
      if (data.gasUsed && data.gasPrice) {
        fee = new Big(data.gasUsed).times(data.gasPrice).toFixed();
      }

      if (data.confirmations <= 6) {

        let tempHistory = {
          address: this.$store.state.account.address,
          acctType: this.$store.state.account.type,
          assetCode: this.asset.code,
          assetIssuer: this.asset.issuer,
          txHash: data.hash,
          amount: this.$wallet.getInstance().utils.fromWei(data.value, "ether"),
          blockNumber: data.blockNumber,
          to: data.to,
          from: data.from,
          fee: this.$wallet.getInstance().utils.fromWei(fee, "ether"),
          txType: isContract
            ? "2"
            : data.to.toLowerCase() ===
              this.$store.state.account.address.toLowerCase()
            ? "1"
            : "0",
          txTime: new moment().format("YYYYMMDD HH:mm:ss"),
          data: data,
          confirmations: data.confirmations
        };
        console.log(tempHistory);
        this.$collecitons.tempHistory.insertHistory(tempHistory);
        return true;
      }
      return false;
    },
    async toHistory(data) {
      let isContract = false;
      if (this.asset.code === CoinType.ETH) {
        isContract = await this.$wallet.isContract(data.to);
      }

      if (this.checkTempHistory(data, isContract)) {
        return null;
      }
      let fee = "0";
      if (data.gasUsed && data.gasPrice) {
        fee = new Big(data.gasUsed).times(data.gasPrice).toFixed();
      }

      let history = {
        address: this.$store.state.account.address,
        acctType: this.$store.state.account.type,
        assetCode: this.asset.code,
        assetIssuer: this.asset.issuer || "",
        txHash: data.hash,
        amount: this.$wallet.getInstance().utils.fromWei(data.value, "ether"),
        blockNumber: data.blockNumber,
        to: data.to,
        from: data.from,
        txTime: moment(data.timeStamp * 1000).format("YYYYMMDD HH:mm:ss"),
        fee: this.$wallet.getInstance().utils.fromWei(fee, "ether"),
        txType: isContract
          ? "2"
          : data.to.toLowerCase() ===
            this.$store.state.account.address.toLowerCase()
          ? "1"
          : "0",
        data: data
      };
      return history;
    }
  }
};
</script>
<style lang="scss">
</style>
