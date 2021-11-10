import Vue from 'vue'

Vue.use({
  install(Vue) {
    Vue.prototype.$constructUrl = function (path) {
      return `${this.$store.state.ssl ? 'https' : 'http'}://${this.$store.state.host}:${this.$store.state.port}${path}`;
    }
  }
});