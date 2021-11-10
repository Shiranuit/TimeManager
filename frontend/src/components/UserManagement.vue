<template>
  <div>
    <div class="statistics-container">
      <b-button squared class="refresh-button" variant="info" @click="fetchUsers">
        <b-icon icon="arrow-clockwise" class="statistics-icon" font-scale="2"></b-icon>
        <div>Refresh</div>
      </b-button>
      <b-button squared v-b-modal.create-user class="new-user" variant="info" @click="deselectItem">
        <b-icon icon="plus" class="statistics-icon" font-scale="2"></b-icon>
        <div>Create a new user account</div>
      </b-button>
    </div>
    <b-table head-variant="dark" hover :items="items" :fields="fields" inline>
      <template #cell(Action)="row">
        <b-modal :id="'edit-user-modal' + row.item.ID" title="Edit user informations" hide-footer>
          <user-settings :userId="row.item.ID" class="management-modal" :me="false"/>
        </b-modal>
        <b-button v-b-modal="'edit-user-modal' + row.item.ID" size="sm" class="mr-2" @click="selectItem(row.item.ID)">
          Edit
        </b-button>
        <b-button @click="$router.push(`/workingtimes/${row.item.ID}`)" size="sm" class="mr-2" variant="primary">
          <b-icon icon="graph-up" class="statistics-icon"></b-icon>
          View Tempo
        </b-button>
        <b-button @click="deleteUser(row.item.ID)" size="sm" variant="danger">
          Delete User
        </b-button>
      </template>
    </b-table>
    <b-modal id="create-user" title="Create user account" hide-footer>
      <div class="modal-footer">
        <b-button variant="secondary" @click="$bvModal.hide('create-user')">Cancel</b-button>
        <b-button variant="primary" @click="createUser">Create Account</b-button>
      </div>
    </b-modal>
    <b-modal id="view-statistics" title="User Statistics">
      <user-chart :user-id="this.userId" :me="false"/>
    </b-modal>
  </div>
</template>

<script>
import axios from "axios";
import UserSettings from './UserSettings.vue';

export default {
  name: 'UserManagement',
  components: {
    UserSettings
  },
  data() {
    return {
      user: {
        username: '',
        email: '',
      },
      items: [],
      fields: ['ID', 'Username', 'Email', 'Action'],
      selected: {
      },
      users: {}
    };
  },
  methods: {
    deselectItem() {
      this.selected = {};
    },
    deleteUser(id) {
      axios.delete(
        this.$constructUrl(`/api/security/${id}`),
        { headers:{ authorization:this.$store.state.jwt } }
      ).then(response => {
        if (response.data.error) {
          throw new Error(response.data.error.message);
        }
        this.items = this.items.filter(item => item.ID !== id);
        this.users = this.users.filter(item => item.id !== id);
      }).catch(error => {
        this.$bvToast.toast(error.message, {
          title: "Error",
          variant: "danger",
          solid: true,
        });
      });
    },
    selectItem(id) {
      this.selected = this.users.find(item => item.id === id);
    },
    createUser() {
      axios.post(
        this.$constructUrl('/api/security/'),
        {
          email: new Date(this.selected.start).toISOString(),
          username: new Date(this.selected.end).toISOString(),
        },
        { headers:{ authorization:this.$store.state.jwt } }
      ).then(response => {
        if (response.data.error) {
          throw new Error(response.data.error.message);
        }
        const result = response.data.result;
        this.users.push({
          email: result.email,
          username: result.username,
          id: result.id,
        });
        this.items.push({
          ID: result.id,
          Username: result.username,
          Email: result.email,
        });
        this.$bvModal.hide('create-user');
      }).catch(error => {
        this.$bvToast.toast(error.message, {
          title: "Error",
          variant: "danger",
          solid: true,
        });
      });
    },
    fetchUsers() {
      axios.get(
        this.$constructUrl('/api/security/_list'),
        { headers:{ authorization:this.$store.state.jwt } }
      ).then(response => {
        if (response.data.error) {
          throw new Error(response.data.error.message);
        }

        this.users = response.data.result;

        this.items = [];
        for (const user of this.users) {
          this.items.push({
            isActive: true,
            ID: user.id,
            Email: user.email,
            Username: user.username,
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
  props: {
    userId: {
      type: Number,
    },
  },
  created() {
    this.fetchUsers();
  }
}
</script>

<style scoped lang="scss">

.statistics-container {
  align-items: left;
  display: flex;
  justify-content: left;
  width: 100%;
}
.statistics-button {
  width: 100%;
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