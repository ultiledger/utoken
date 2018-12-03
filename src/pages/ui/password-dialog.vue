<template>
  <van-dialog
    v-model="showPop"
    @confirm="sure"
    show-cancel-button>
    <div style="padding: 10px; font-size: 1rem;" class="text-center" v-text="$t('common.inputPwd')"></div>
    <van-cell-group>
      <van-field
        input-align="center"
        type="password"
        v-model="value"></van-field>
    </van-cell-group>
  </van-dialog>
</template>
<script>
  import cryptor from 'core/utils/cryptor';
  export default {
    data () {
      return {
        loading: false,
        showPop: false,
        value: '',
        params: ''
      };
    },
    methods: {
      show (params) {
        this.value = '';
        this.params = params;
        this.showPop = true;
      },
      close () {
        this.showPop = false;
      },
      sure () {
        if (this.value) {
          if (this.$store.state.account.password === cryptor.encryptMD5(this.value)) {
            this.$emit('done', this.value, this.params);
          } else {
            this.$toast(this.$t('acct.pwdError'));
          }
        } else {
          this.$toast(this.$t('common.notEmptyPwd'));
        }
        this.close();
      }
    }
  };
</script>
<style></style>
