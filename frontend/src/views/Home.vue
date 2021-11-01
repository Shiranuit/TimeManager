<template>
  <div class="view">
    <nav-bar/>
    <div class="home">
    <working-time :me="true"/>
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
    if (this.$store.state.jwt === null) {
      this.$router.push('/')
    }
  }
}
</script>
