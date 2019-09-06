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
    props: {
      address: String
    },
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
        this.params = params;
        let password = this.$store.state.passwordMap[this.address];
        if (this.address && password) {
          this.$emit('done', password, this.params);
        } else {
          this.value = '';
          this.showPop = true;
        }
      },
      close () {
        this.showPop = false;
      },
      savePasswordInMemory (password) {
        if (this.address) {
          let map = {};
          map[this.address] = password;
          this.$store.dispatch('setPasswordMap', map);
        }
      },
      sure () {
        if (this.value) {
          if (this.$store.state.account.password === cryptor.encryptMD5(this.value)) {
            this.savePasswordInMemory(this.value);
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
