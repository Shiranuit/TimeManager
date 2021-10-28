<template>
  <div class="nav-bar">
    <div class="home" v-on:click="home">
      <div class="logo-container">
        <b-aspect aspect="1:1">
          <b-icon-alarm class="logo"></b-icon-alarm>
        </b-aspect>
      </div>
      <div class="title">Time Manager</div>
    </div>
    <user-profile-menu class="profile-menu" v-if="this.$store.state.userInfo !== null"/>
  </div>
</template>

<script>
import UserProfileMenu from './UserProfileMenu.vue';
export default {
  components: { UserProfileMenu },
  name: 'NavBar',
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
  background-color: #42b983;
  color: rgb(255, 255, 255);
  font-size: 20px;
  font-weight: bold;
  text-align: left;
  width: 100%;
  height: 8vh;
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
  width: 6vh;
  float: left;
}

.profile-menu {
  padding-right: 1%;
  float: right;
}
</style>
