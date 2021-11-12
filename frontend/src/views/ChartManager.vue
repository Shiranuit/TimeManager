<template>
  <div class="view">
    <nav-bar/>
    <div class="container">
      <div class="user-chart-manager">
        <user-chart :userId="this.$route.params.userId"/>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import NavBar from '../components/NavBar.vue';
import UserChart from '../components/UserChart.vue';

export default {
  name: 'Home',
  components: {
    NavBar,
    UserChart
  },
}
</script>

<style lang="scss" scoped>
.user-chart-manager {
    width: 50%;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100;
}
</style>