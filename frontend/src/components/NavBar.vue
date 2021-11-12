<template>
  <div class="nav-bar">
    <div class="button-container" v-if="this.$store.state.jwt !== null">
      <b-icon-house-fill class="custom-button" @click="$router.push('/home')" />
      <template>
        <b-icon-people-fill v-if="this.userInfo.role === 'super-manager' " class="custom-button" @click="$router.push('/userManagement')"/>
        <b-icon-briefcase-fill class="custom-button" @click="$router.push('/teamManagement')"/>
        <b-icon-calendar class="custom-button" />
      </template>
    </div>
    <div class="home" v-on:click="home">
      <div class="logo-container">
        <b-icon-alarm class="logo"></b-icon-alarm>
      </div>
      <div class="title">Time Manager</div>
    </div>
    <user-profile-menu class="profile-menu" v-if="this.$store.state.jwt !== null"/>
  </div>
</template>

<script>
import UserProfileMenu from './UserProfileMenu.vue';
export default {
  name: 'NavBar',
  components: { UserProfileMenu },
  computed: {
    userInfo() {
        return this.$store.state.userInfo || {};
    }
  },
  methods: {
    home() {
      this.$router.push('/');
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.nav-bar {
  background-color: #F8684A;
  color: rgb(255, 255, 255);
  font-size: 20px;
  font-weight: bold;
  text-align: left;
  width: 100%;
  height: 6vh;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.home {
  width: 20%;
}

.title {
  float: left;
  transform: translate(10%, 50%);
  // padding-left: 2%;
  // padding-top: 2%;
}

.logo {
  height: 100%;
  width: 100%;
  padding-left: 2%;
  transform: translate(10%, 0%);
}

.logo-container {
  width: 4vh;
  float: left;
}

.profile-menu {
  padding-right: 1%;
  float: right;
}

.custom-button {
  height: 100%;
  width: 100%;
  padding: 20px;
  align-content: center;
  justify-items: center;
  justify-content: center;
  align-items: center;
  display: flex;
}

.custom-button:hover {
  cursor: pointer;
  background-color: #eb3a17;
}

.button-container {
  width: auto;
  height: 100%;
  display: flex;
  justify-items: center;
  align-content: center;
}
</style>
