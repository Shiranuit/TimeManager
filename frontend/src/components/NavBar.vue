<template>
  <div class="nav-bar">
    <div class="button-container" v-if="this.$store.state.jwt !== null">
      <div class="icon-and-text">
        <div class="justIcon">
        <b-icon-house-fill
          class="custom-button"
          @click="$router.push('/home')"
        />
        </div>
        <div class="justText">Home</div>
      </div>
      <template>
        <div>
          <div class="justIcon">
          <b-icon-people-fill
            v-if="this.userInfo.role === 'super-manager'"
            class="custom-button"
            @click="$router.push('/userManagement')"
          />
          </div>
          <div class="justText">User</div>
        </div>
        <div>
          <div class="justIcon">
          <b-icon-briefcase-fill
            class="custom-button"
            @click="$router.push('/teamManagement')"
          />
          </div>
          <div class="justText">Team</div>
        </div>
      </template>
    </div>
    <div class="home" v-on:click="home">
      <div class="logo-container">
        <b-icon-alarm class="logo"></b-icon-alarm>
      </div>
      <div class="title">Time Manager</div>
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
  width: 20%;
  cursor: pointer;
}

.title {
  margin-left: 3rem;
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
  justify-items: center;
  align-content: center;
}

.justIcon {
  font-size:30px;
}

.justText {
  justify-content: center;
  margin-left:2rem;
  font-size:15px;
  font-weight: bold;
}
</style>
