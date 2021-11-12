<template>
  <div class="view">
    <nav-bar/>
    <div class="user-management">
    <user-manager/>
  </div>
</div>
</template>

<script>
// @ is an alias to /src
import NavBar from '../components/NavBar.vue';
import UserManager from '../components/UserManager.vue';

export default {
  name: 'UserManagement',
  components: {
    NavBar,
    UserManager
  },
}
</script>
