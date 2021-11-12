<template>
  <b-col class="column">
    <!-- <b-row>
      <div role="group" class="group">
        <label for="input" class="input-label">
          Team Name:
        </label>
        <div class="editable-input-box">
          <b-form-input id="input-team-name" class="input" v-model="team.name" :readonly="!edit.teamName" placeholder="Team Name"></b-form-input>
          <b-button v-if="!edit.teamName" @click="edit.teamName = true">
            <b-icon icon="pencil" class="edit-icon"></b-icon>
          </b-button>
        </div>
      </div>
    </b-row> -->
    <b-row>
      <div role="group" class="group">
        <label for="input" class="input-label">
          Users :
        </label>
        <div class="editable-input-box">
          <b-form-input class="input-teamUsers" v-model="team.users" :readonly="!edit.teamUsers" placeholder="Users"></b-form-input>
          <b-button v-if="!edit.teamUsers" @click="edit.teamUsers = true">
            <b-icon icon="pencil" class="edit-icon"></b-icon>
          </b-button>
        </div>
      </div>
    </b-row>
    <b-row>
      <!-- <div class="danger-zone">
        <div class="danger-zone-title">Danger Zone</div>
        <div>
          Welcome to the Danger Zone, every action taken here are ireversible, be careful.
        </div>
        <b-col>
          <b-row></b-row>
          <b-row><b-button v-b-modal.delete-user-modal variant="danger" class="danger-button">Delete this account</b-button></b-row>
          <b-row></b-row>
        </b-col>
        <b-modal id="delete-user-modal" title="Delete account" hide-footer>
          <div class="modal-body">
            <p>Are you sure you want to delete this account: {{ user.email }}</p>
          </div>
          <div class="modal-footer">
            <b-button variant="secondary" @click="$bvModal.hide('delete-user-modal')">Cancel</b-button>
            <b-button variant="danger" @click="deleteTeam">Delete</b-button>
          </div>
        </b-modal>
      </div> -->
    </b-row>
  </b-col>
</template>

<script>
import axios from "axios";
export default {
  name: 'TeamSettings',

  props: {
    teamName: {
      type: Number,
    },
    me: {
      type: Boolean
    }
  },
  data() {
    return {
      team: {
        name: '',
        users: []
      },
      edit: {
        teamName: false,
        teamUsers: false
      }
    };
  },
  methods: {
    
    // updateUserInfo() {
    //   if (!this.validateEmail() || !this.validateUsername()) {
    //     return;
    //   }

    //   if (!this.user) {
    //     this.$store.commit('setUserInfo', null);
    //     this.$router.push('/');
    //   }

    //   const url = this.me
    //     ? this.$constructUrl(`/api/auth`)
    //     : this.$constructUrl(`/api/security/${this.teamName}`);

    //   axios.put(
    //     url,
    //     { 
    //       email: this.user.email,
    //       username: this.user.username,
    //     },
    //     { headers:{ authorization:this.$store.state.jwt } }
    //   ).then(response => {
    //     if (response.data.error) {
    //       throw new Error(response.data.error.message);
    //     }
    //     if (!response.data) {
    //       throw new Error('Could not update user informations');
    //     }
    //     this.edit.username = false;
    //     this.edit.email = false;
    //     this.user = response.data.result;
    //     if (this.me) {
    //       this.$store.commit('setUserInfo', response.data.result);
    //     }
    //   }).catch(error => {
    //     this.$bvToast.toast(error.message, {
    //       title: "Error",
    //       variant: "danger",
    //       solid: true,
    //     });
    //   });
    // },

    
    deleteTeam() {
      const url = this.$constructUrl(`/api/_me/${this.team.name}`);

      axios.delete(
        url,
        { headers:{ authorization:this.$store.state.jwt } }
      ).then(response => {
        if (response.data.error) {
          throw new Error(response.data.error.message);
        }
        if (this.me) {
          // this.$store.commit('setUserInfo', null);
          // this.$router.push('/');
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
    if (!this.teamName && !this.me) {
      this.$router.push('/');
    }

    const url = this.$constructUrl(`/api/_me/${this.teamName}`);

    axios.get(
      url,
      { headers:{ authorization:this.$store.state.jwt } }
    ).then(response => {
      if (response.data.error) {
        throw new Error(response.data.error.message);
      }
      this.user = response.data.result;
    }).catch(error => {
      this.$bvToast.toast(error.message, {
        title: "Error",
        variant: "danger",
        solid: true,
      });
    })
  }
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

</style>