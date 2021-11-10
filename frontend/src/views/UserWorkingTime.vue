<template>
  <div class="view">
    <nav-bar/>
    <div class="user-working-time">
    <working-time :userId="this.$route.params.userId" :me="false"/>
  </div>
</div>
</template>

<script>
// @ is an alias to /src
import NavBar from '../components/NavBar.vue';
import WorkingTime from '../components/WorkingTime.vue';

export default {
  name: 'User Working Time',
  components: {
    NavBar,
    WorkingTime
  },
}
</script>
