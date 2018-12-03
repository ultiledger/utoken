<template>
  <div>
    <pl-block class="van-hairline--bottom">
      <div class="text-center padding">
        <van-icon name="checked" class="text-primary" style="font-size: 40px;vertical-align: middle;"/>
      </div>
      <div class="text-center">
        <b class="x-x-large-font">
          {{item.txType === '1' ? '+' : '-'}}&nbsp;{{item.amount | currency('', '7') | cutTail}}</b>&nbsp;
        <span class="big-font">{{tempItem.assetCode}}</span>
      </div>
      <div class="tip text-muted small-font text-center" v-text="$t('common.transactionSuccess')"></div>
    </pl-block>

    <pl-block>
      <div class="text-block">
        <p class="text-muted small-font" v-text="$t('history.transactionTime')"></p>
        <div>{{tempItem.txTime | date('YYYY/MM/DD hh:mm:ss')}}</div>
      </div>
      <div class="text-block">
        <p class="text-muted small-font" v-text="$t('common.receivablesAddress')"></p>
        <pl-wallet-addr :address="tempItem.to" complete></pl-wallet-addr>
      </div>
      <div class="text-block">
        <p class="text-muted small-font" v-text="$t('common.paymentAddress')"></p>
        <pl-wallet-addr :address="tempItem.from" complete></pl-wallet-addr>
      </div>
      <div class="text-block"  v-if="tempItem && tempItem.data && tempItem.data.memo_type && tempItem.data.memo_type !== 'none'">
        <p class="text-muted small-font">Memo-{{tempItem.data.memo_type}}</p>
        <div>{{tempItem.data.memo}}</div>
      </div>
    </pl-block>

    <pl-block class="margin-top">
      <div class="text-block">
        <p class="text-muted small-font" v-text="$t('history.transactionHash')"></p>
        <pl-wallet-addr :address="tempItem.txHash" :length="16"></pl-wallet-addr>
      </div>
    </pl-block>
    <br>
    <br>
  </div>
</template>
<script>
  export default{
    props: {
      item: {
        type: Object,
        default () {
          return {};
        }
      }
    },
    data () {
      return {
        tempItem: {
          data: {
            memo: '',
            memo_type: ''
          }
        }
      };
    },
    watch: {
      item () {
        this.setTx();
      }
    },
    methods: {
      setTx () {
        this.tempItem = this.item;
        if (this.tempItem && this.tempItem.data.memo_type === undefined) {
          this.$wallet.getTransaction(this.tempItem.txHash).then(tx => {
            this.tempItem.data.memo = tx.memo || '';
            this.tempItem.data.memo_type = tx.memo_type;
            this.$forceUpdate();
            this.$collecitons.history.updateHistory(this.tempItem.txHash , item => {
              item.data.memo = tx.memo || '';
              item.data.memo_type = tx.memo_type;
            });
            this.$emit('update:item', this.tempItem);
          });
        }
      }
    },
    mounted () {
      this.setTx();
    }
  };
</script>
<style lang="scss" scoped>
  .tip{
    padding-bottom: 10px;
  }

  .text-block{
    padding-top: 10px;
  }
</style>
