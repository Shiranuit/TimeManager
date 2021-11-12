<template>
  <div class="view">
    <nav-bar/>
    <div class="user-management">
    <user-management/>
  </div>
</div>
</template>

<script>
// @ is an alias to /src
import NavBar from '../components/NavBar.vue';
import UserManagement from '../components/UserManagement.vue';

export default {
  name: 'User Management',
  components: {
    NavBar,
    UserManagement
  },
}
</script>
