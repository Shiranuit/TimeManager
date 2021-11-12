<template>
  <b-col class="column">
    <b-modal id="add-user-team" title="Add user to a team" hide-footer>
      <b-col class="login-context">
        <label>
          Username
        </label>
        <b-form-select v-model="selected" :options="options" :state="this.selected !== null"></b-form-select>
      </b-col>
      <div class="modal-footer">
        <b-button variant="secondary" @click="$bvModal.hide('add-user-team')">Cancel</b-button>
        <b-button variant="primary" @click="addUser">Add to team</b-button>
      </div>
    </b-modal>

    <b-button variant="primary" class="full-width-button" @click="$bvModal.show('add-user-team')" v-if="isManager()">Add User</b-button>
    <b-table head-variant="dark" hover :items="members" :fields="fields" inline>
      <template #cell(Action)="row">
        <b-button @click="removeUser(row.item.ID)" size="sm" variant="danger">
          Remove Member
        </b-button>
      </template>
    </b-table>

  </b-col>
</template>

<script>
import axios from "axios";
export default {
  name: 'TeamSettings',

  props: {
    teamName: {
      type: String,
    },
    me: {
      type: Boolean
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo || {};
    },
  },
  data() {
    return {
      fields: ['ID', 'name', this.isManager() ? 'Action' : undefined],
      members: [],
      teamInfo: {},
      options: [],
      selected: null,
    };
  },
  methods: {
    isManager() {
      const userInfo = this.$store.state.userInfo || {};
      return userInfo.role === "manager" || userInfo.role === "super-manager";
    },
    addUser() {
      if (!this.selected) {
        return;
      }

      const url = this.me
        ? this.$constructUrl(`/api/team/_me/${this.teamName}/${this.selected}`)
        : this.$constructUrl(`/api/team/${this.teamName}/${this.selected}`);
      
      axios.put(
        url,
        {},
        { headers: { authorization: this.$store.state.jwt } }
      )
      .then((response) => {
        if (response.data.error) {
          throw new Error(response.data.error.message);
        }

        return this.fetchMembers()
          .then(() => {
             this.$bvModal.hide('add-user-team');
          });
      }).catch(error => {
        this.$bvToast.toast(error.message, {
          title: "Error",
          variant: "danger",
          solid: true,
        });
      });

    },
    removeUser(userId) {
      const url = this.me
        ? this.$constructUrl(`/api/team/_me/${this.teamName}/${userId}`)
        : this.$constructUrl(`/api/team/${this.teamName}/${userId}`);

      axios.delete(
        url,
        { headers:{ authorization:this.$store.state.jwt } }
      )
      .then((response) => {
        if (response.data.error) {
          throw new Error(response.data.error.message);
        }

        this.members = this.members.filter(member => member.ID !== userId);
      }).catch(error => {
        this.$bvToast.toast(error.message, {
          title: "Error",
          variant: "danger",
          solid: true,
        });
      });
    },
    fetchMembers() {
      const url = this.me
        ? this.$constructUrl(`/api/team/_me/${this.teamName}`)
        : this.$constructUrl(`/api/team/${this.teamName}`);

      return axios.get(
        url,
        { headers:{ authorization:this.$store.state.jwt } }
      ).then(response => {
        if (response.data.error) {
          throw new Error(response.data.error.message);
        }

        return this.fetchUserList().then(() => {
          this.teamInfo = response.data.result;
          this.members = response.data.result.members_id.map(member_id => {
            return {
              ID: member_id,
              name: this.userList.find(user => user.id === member_id).username,
            };
          });
          this.options = this.userList.map(user => {
            return {
              value: user.id,
              text: user.username,
            };
          });
        });
      }).catch(error => {
        this.$bvToast.toast(error.message, {
          title: "Error",
          variant: "danger",
          solid: true,
        });
      });
    },
    fetchUserList() {
      return axios.get(
        this.$constructUrl('/api/security/_list/_soft'),
        { headers:{ authorization:this.$store.state.jwt } }
      ).then(response => {
        if (response.data.error) {
          throw new Error(response.data.error.message);
        }
        this.userList = response.data.result;
        return this.userList;
      }).catch(error => {
        this.$bvToast.toast(error.message, {
          title: "Error",
          variant: "danger",
          solid: true,
        });
      }
      );
    },
  },
  created() {
    this.fetchMembers();
  },
}
</script>

<style scoped lang="scss">
.row {
  width: 100%;
  padding-top: 10px;
}

.group {
  width: 100%;
}

.input {
  width: 100%;
  float: left;
}

.edit-icon {
  float: right;
  flex-grow: 1;
}

.input-email {
  align-self: flex-end;
  flex-grow: 3;
}

.break {
  flex-basis: 100%;
  height: 0;
}

.break-column {
  flex-basis: 100%;
  width: 0;
}

.editable-input-box {
  display: flex;
  justify-items: end;
  align-items: center;
}

.danger-zone {
  border-radius: 15px;
  border: 2px solid #e74a3e;
  margin: 10px;
  padding-bottom: auto;
  width: 100%;
  height: 100%;
}

.danger-zone-title {
  margin-left: 50%;
  width: 15%;
  background-color: white;
  transform: translate(-50%, -50%);
  color: #e74a3e;
  border-radius: 15px;
  border: 2px solid #e74a3e;
}

.danger-button {
  width: 100%;
  margin-left: 10%;
  margin-right: 10%
}

.full-width-button {
  width: 100%;
}

</style>