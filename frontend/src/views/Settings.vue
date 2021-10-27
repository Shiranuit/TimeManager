<template>
  <div class="view">
    <nav-bar/>
    <div class="settings">
      Hello
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import NavBar from '../components/NavBar.vue';

export default {
  name: 'Settings',
  components: {
    NavBar
  },
  beforeMount() {
    if (this.$store.state.userInfo === null) {
      this.$router.push('/');
    }
  }
}
</script>
