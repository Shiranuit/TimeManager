<template>
  <div class="view">
    <nav-bar/>
    <div class="settings">
      <div class="user-profile-settings">
        <user-settings :userId="this.userId" :me="true"/>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import NavBar from '../components/NavBar.vue';
import UserSettings from '../components/UserSettings.vue'

export default {
  name: 'Settings',
  components: {
    NavBar,
    UserSettings
  },
  computed: {
    userId() {
      return this.$store.state && this.$store.state.userInfo && this.$store.state.userInfo.id;
    }
  },
  beforeMount() {
    if (this.$store.state.jwt === null) {
      this.$router.push('/');
    }
  }
}
</script>

<style scoped lang="scss">
.settings {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.user-profile-settings {
  padding-left: 2%;
  border-radius: 10px;
  border: 2px solid #42b983;
  width: 50%;
  height: auto;
  margin-top: 50%;
  margin-bottom: 50%;
  display: flex;
  transform: translate(0, -50%);
}
</style>