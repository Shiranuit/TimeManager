<template>
    <div class="view">
        <nav-bar/>
        <team-manager></team-manager>
    </div>
</template>

<script>
import NavBar from '../components/NavBar.vue';
import TeamManager from '../components/TeamManager.vue';
export default {
    name: 'TeamManagement',
    components: {
        NavBar,
        TeamManager
    }

}
</script>

<style>

</style>