<template>
  <div class="user-management-page">
    <div class="container-team">
      <b-button squared v-b-modal.create-team class="team" variant="info" @click="deselectItem" v-if="isManager()">
        <b-icon icon="plus" class="action-icon" font-scale="2"/>
        Create a new team
      </b-button>
      <b-button class="team" @click="refresh()" >
      <b-icon class="icon-refresh" icon="arrow-clockwise" />Refresh</b-button>
    </div>
    <b-table head-variant="dark" hover :items="teams" :fields="fields" inline>
      <template #cell(Action)="row">
        <b-modal :id="'edit-team-modal' + row.item.name" :title="'Members of team ' + row.item.name" hide-footer>
          <team-settings :teamName="row.item.name" class="management-modal" :me="me"/>
        </b-modal>
        <b-button v-b-modal="'edit-team-modal' + row.item.name" size="sm" class="mr-2" @click="selectItem(row.item.name)">
          {{ userInfo.role === 'user' ? 'View Members' : 'View / Edit Members' }}
        </b-button>
        <b-button @click="deleteTeam(row.item.name)" size="sm" variant="danger" v-if="isManager()">
          Delete Team
        </b-button>
      </template>
    </b-table>
    <b-modal id="create-team" title="Create a team" hide-footer>
      <b-col class="login-context">
          <b-row
            ><b-form-input
              id="input-team-name"
              v-model="team.name" 
              placeholder="Team name" 
              @keydown.enter.native="createTeam"
              :state="team.name.length >= 3"
              ></b-form-input
          ></b-row>
          <b-tooltip target="input-team-name" triggers="hover" v-if="team.name.length < 3" variant="danger">
            Team name must be at least 3 characters long
          </b-tooltip>
          
        </b-col><div class="modal-footer">
        <b-button variant="secondary" @click="$bvModal.hide('create-team')">Cancel</b-button>
        <b-button variant="primary" @click="createTeam">Create new team</b-button>
      </div>
    </b-modal>

  </div>
</template>

<script>
import axios from "axios";
import TeamSettings from './TeamSettings.vue';
// import TeamSettings from './TeamSettings.vue';

export default {
  name: 'TeamManager',
  components: {
    TeamSettings
    // TeamSettings
  },
  props: {
    me: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo || {};
    }
  },
  data() {
    return {
      team: {
        name: ''
      },
      items: [],
      fields: ['name', 'Action'],
      selected: {
      },
      teams: [],
      teamSelected: []
    };
  },
  methods: {
    isManager() {
      const userInfo = this.$store.state.userInfo || {};
      return userInfo.role === "manager" || userInfo.role === "super-manager";
    },
    refresh() {
      this.items = [];
      this.teams = {};
      this.fetchTeams();
    },
    deselectItem() {
      this.selected = {};
    },
    deleteTeam(name) {
      axios.delete(
        this.$constructUrl(`/api/team/${name}`),
        { headers:{ authorization:this.$store.state.jwt } }
      ).then(response => {
        if (response.data.error) {
          throw new Error(response.data.error.message);
        }
        this.items = this.items.filter(item => item.name !== name);
        this.teams = this.teams.filter(item => item.name !== name);
      }).catch(error => {
        this.$bvToast.toast(error.message, {
          title: "Error",
          variant: "danger",
          solid: true,
        });
      });
    },
    selectItem(name) {
      this.selected = this.teams.find(item => item.name === name);
    },
    createTeam() {
      const url = this.me
        ? this.$constructUrl('/api/team/_me')
        : this.$constructUrl('/api/team');

      axios.post(
        url,
        {
          name: this.team.name
        },
        { headers:{ authorization:this.$store.state.jwt } }
      ).then(response => {
        if (response.data.error) {
          throw new Error(response.data.error.message);
        }
        const result = response.data.result;
        this.teams.push({
          name: result.name
        });
        this.items.push({
          NAME: result.name,
        });
        this.$bvModal.hide('create-team');
      }).catch(error => {
        this.$bvToast.toast(error.message, {
          title: "Error",
          variant: "danger",
          solid: true,
        });
      });
    },
    fetchTeams() {
      const url = this.me
        ? this.$constructUrl('/api/team/_me/_list')
        : this.$constructUrl('/api/team/_list')

      axios.get(
        url,
        { headers:{ authorization:this.$store.state.jwt } }
      ).then(response => {
        if (response.data.error) {
          throw new Error(response.data.error.message);
        }
        this.teams = response.data.result;
        this.items = [];
      }).catch(error => {
        this.$bvToast.toast(error.message, {
          title: "Error",
          variant: "danger",
          solid: true,
        });
      });
    }
  },
  created() {
    if (this.me) {
      return axios.get(
        this.$constructUrl('/api/auth/_me'),
        { headers: { authorization: this.$store.state.jwt } }
      ).then(response => {
        if (response.data.error) {
          throw new Error(response.data.error.message);
        }
        this.$store.commit('setUserInfo', response.data.result);
        return this.fetchTeams();
      }).catch(() => {
        this.$router.push('/');
      });
    }
    return this.fetchTeams();
  }
}
</script>

<style scoped lang="scss">
.user-management-page {
  width: 66%;
  margin-right: 15%;
  margin-left: 15%;
  margin-top: 5%;
}
.statistics-container {
  align-items: left;
  display: flex;
  justify-content: left;
  width: 100%;
}

.container-team {
  display: flex;
  justify-content: center;
}
.team,.team-icon-refresh {
  background-color: #F8684A;
  align-items: center;
  display: flex;
  justify-content: center;
  width: 25%;
  border: none;
  border-radius: 15px !important;
  margin-right: 1rem;
  margin-bottom: 1rem;
}

.team{
 width: 25%;
}

.team-icon-refresh{
  
  width: 6%;

}
.action-icon {
  // margin-right: 35px;
}

.new-user {
  width: 100%;
  align-items: center;
  display: flex;
  justify-content: center;
}

.refresh-button {
  width: 100%;
  align-items: center;
  display: flex;
  justify-content: center;
}

.management-modal {
  padding-left: 10%;
}
</style>