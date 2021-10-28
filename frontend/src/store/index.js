import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userInfo: null,
    host: 'localhost',
    port: '4000',
    ssl: false
  },
  mutations: {
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo
    }
  },
  getters: {
  },
  actions: {
  },
  modules: {
  }
})
