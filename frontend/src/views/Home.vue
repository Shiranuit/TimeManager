<template>
  <div class="view">
    <nav-bar/>
    <div class="home">
  </div>
</div>
</template>

<script>
// @ is an alias to /src
import NavBar from '../components/NavBar.vue';

export default {
  name: 'Home',
  components: {
    NavBar
  },
  beforeMount() {
    if (this.$store.state.userInfo === null) {
      this.$router.push('/')
    }
  }
}
</script>
