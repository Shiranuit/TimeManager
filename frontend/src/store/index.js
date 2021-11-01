import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

console.log(process.env.VUE_APP_BACKEND_HOST)

export default new Vuex.Store({
  state: {
    userInfo: null,
    host: process.env.VUE_APP_BACKEND_HOST || 'localhost',
    port: '4000',
    ssl: false,
    jwt: null
  },
  mutations: {
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo;
    },
    setJWT(state, jwt) {
      state.jwt = jwt;
    }
  },
  getters: {
  },
  actions: {
  },
  modules: {
  }
})
