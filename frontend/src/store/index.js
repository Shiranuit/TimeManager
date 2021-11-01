import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userInfo: null,
    host: 'localhost',
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
