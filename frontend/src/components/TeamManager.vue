<template>
  <div class="user-management-page">
    <div class="container-working-time">
      <b-button squared v-b-modal.create-team class="working-time" variant="info" @click="deselectItem">
        <b-icon icon="plus" class="action-icon" font-scale="2"></b-icon>
        <div>Create a new team</div>
      </b-button>
      <b-button squared v-b-modal.add-user-team class="working-time" variant="info" @click="deselectItem">
        <b-icon icon="person-plus-fill" class="action-icon" font-scale="2"></b-icon>
        <div>Add user in a team</div>
      </b-button>
      <b-button class="working-time" @click="refresh()" >
      <b-icon class="icon-refresh" icon="arrow-clockwise" />Refresh</b-button>
    </div>
    <b-table head-variant="dark" hover :items="items" :fields="fields" inline>
      <template #cell(Action)="row">
        <b-modal :id="'edit-team-modal' + row.item.NAME" title="Edit team informations" hide-footer>
          <team-settings :teamName="row.item.NAME" class="management-modal" :me="false"/>
        </b-modal>
        <!-- <b-button v-b-modal="'edit-team-modal' + row.item.ID" size="sm" class="mr-2" @click="selectItem(row.item.NAME)">
          Edit
        </b-button>
        <b-button @click="$router.push(`/teamManagement/${row.item.NAME}`)" size="sm" class="mr-2" variant="primary">
          <b-icon icon="graph-up" class=""></b-icon>
          View Tempo
        </b-button>
        <b-button @click="deleteTeam(row.item.NAME)" size="sm" variant="danger">
          Delete User
        </b-button> -->
      </template>
    </b-table>
    <b-modal id="create-team" title="Create a team" hide-footer>
      <b-col class="login-context">
          <b-row
            ><b-form-input 
              v-model="team.name" 
              placeholder="Team name" 
              @keydown.enter.native="login_register"
              ></b-form-input
          ></b-row>
          
        </b-col><div class="modal-footer">
        <b-button variant="secondary" @click="$bvModal.hide('create-team')">Cancel</b-button>
        <b-button variant="primary" @click="createTeam">Create new team</b-button>
      </div>
    </b-modal>
    <b-modal id="add-user-team" title="Create a team" hide-footer>
      <b-col class="login-context">
        <b-dropdown id="dropdown-1" text="Teams" class="m-md-2">
          <template>
            <!-- <div v-for="team in teamList" :key="item.name">
              <b-dropdown-item>{{team.name}}</b-dropdown-item>
            </div> -->
          </template>
        </b-dropdown>
        <b-form-select id="dropdown-1" text="Users" class="m-md-2">
          <template>
            <!-- <div v-for="team in teamList" :key="item.name">
              <b-dropdown-item>{{team.name}}</b-dropdown-item>
            </div> -->
          </template>
        </b-form-select>
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

export default {
  name: 'UserManagement',
  components: {
    TeamSettings
  },

  props: {
    userId: {
      type: Number,
    },
  },
  data() {
    return {
      team: {
        name: ''
      },
      items: [],
      fields: ['team name', 'owner_id'],
      selected: {
      },
      teams: {}
    };
  },
  methods: {
    // login_register() {
    //   this.createUser();
    // },
    deselectItem() {
      this.selected = {};
    },
    deleteTeam(name) {
      axios.delete(
        this.$constructUrl(`/api/security/${name}`),
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
      axios.post(
        this.$constructUrl('/api/team/_me/'),
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
          // Username: result.username,
          // Email: result.email,
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
      axios.get(
        this.$constructUrl('/api/security/_list'),
        { headers:{ authorization:this.$store.state.jwt } }
      ).then(response => {
        if (response.data.error) {
          throw new Error(response.data.error.message);
        }

        this.teams = response.data.result;

        this.items = [];
        for (const team of this.teams) {
          this.items.push({
            isActive: true,
            NAME: team.name
          });
        }
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
    this.fetchTeams();
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

.container-working-time {
  display: flex;
  justify-content: center;
}
.working-time {
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
.action-icon {
  margin-right: 35px;
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