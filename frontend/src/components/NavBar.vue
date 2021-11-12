<template>
  <div class="nav-bar">
    <div class="home" v-on:click="home">
      <div class="logo-container">
        <b-icon-alarm class="logo"></b-icon-alarm>
      </div>
      <div class="title">Time Manager</div>
    </div>
    <div class="button-container" v-if="this.$store.state.jwt !== null">
      <div class="custom-button" @click="$router.push('/home')">
        <div class="justIcon">
        <b-icon-house-fill/>
        </div>
        <div class="justText">Home</div>
      </div>
      <div class="custom-button" @click="$router.push('/teamManagement')">
        <div class="justIcon">
          <b-icon-briefcase-fill/>
        </div>
        <div class="justText">My Teams</div>
      </div>
      <div class="custom-button" v-if="this.userInfo.role === 'super-manager'" @click="$router.push('/userManagement')">
        <div class="justIcon">
        <b-icon-people-fill/>
        </div>
        <div class="justText">Manage Users</div>
      </div>
    </div>
    <user-profile-menu
      class="profile-menu"
      v-if="this.$store.state.jwt !== null"
    />
  </div>
</template>

<script>
import UserProfileMenu from "./UserProfileMenu.vue";
export default {
  name: "NavBar",
  components: { UserProfileMenu },
  computed: {
    userInfo() {
      return this.$store.state.userInfo || {};
    },
  },
  methods: {
    home() {
      this.$router.push("/");
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.nav-bar {
  background-color: #f8684a;
  color: rgb(255, 255, 255);

  height: 70px;
  display: flex;
  justify-content: space-between;

  align-items: center;
}

.home {
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-content: center;
  align-self: center;
  align-items: center;
  width: 20%;
  cursor: pointer;
}

.title {
  // margin-left: 3rem;
  padding: 3%;
  text-align: left;
  font-size: 20px;
  font-weight: bold;
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
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  // padding: 20px;
  
  padding: 0rem 1rem;
  margin: 0rem 1rem;
}

.custom-button:hover {
  cursor: pointer;
  background-color: #eb3a17;
}

.button-container {
  display: flex;
  flex-direction: row;
  width: 30%;
  // justify-items: center;
  // align-content: center;
}

.justIcon {
  font-size:30px;
}

.justText {
  justify-content: center;
  // margin-left:2rem;
  // font-size:15px;
  font-weight: bold;
}
</style>
