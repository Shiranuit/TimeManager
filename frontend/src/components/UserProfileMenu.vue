<template>
  <div>
    <b-dropdown variant="link" toggle-class="text-decoration-none" no-caret>
      <template #button-content>
        <b class="username">{{ userInfo.username }}</b>
        <b-avatar button></b-avatar>
      </template>
      <b-dropdown-item to="/user/settings">Settings</b-dropdown-item>
      <b-dropdown-item v-on:click="logout"><span class="logout-button">Logout</span></b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script>
export default {
  name: 'UserProfileMenu',
  computed: {
    userInfo() {
        return this.$store.state.userInfo || {};
    }
  },
  methods: {
    logout() {
      this.$store.commit('setUserInfo', null);
      this.$store.commit('setJWT', null);
      this.$router.push('/');
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

.dot {
  height: 90%;
  width: 90%;
  background-color: #bbb;
  border-radius: 50%;
  display: inline-block;
}

.username {
  padding-right: 5px;
  color: white;
}

.logout-button {
  // background-color: #f44336;
  color: red;
}

.profile-icon {
  height: 95%;
  width: 95%;
  position: relative;
}

.profile-container {
  width: 6vh;
  height: 100%;
  float: right;
}
</style>
