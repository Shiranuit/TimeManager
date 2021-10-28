<template>
  <div class="view">
    <nav-bar/>
    <div class="home">
    <working-time :userId="this.$store.state.userInfo.id"/>
  </div>
</div>
</template>

<script>
// @ is an alias to /src
import NavBar from '../components/NavBar.vue';
import WorkingTime from '../components/WorkingTime.vue';

export default {
  name: 'Home',
  components: {
    NavBar,
    WorkingTime
  },
  beforeMount() {
    if (this.$store.state.userInfo === null) {
      this.$router.push('/')
    }
  }
}
</script>
