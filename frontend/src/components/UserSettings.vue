<template>
  <b-col class="column">
    <b-row>
      <div role="group" class="group">
        <label for="input" class="input-label">
          Email Address:
        </label>
        <div class="editable-input-box">
          <b-form-input id="input-email" class="input" v-model="user.email" :readonly="!edit.email" placeholder="Email" :state="validateEmail()" @keydown.enter.native="updateUserInfo"></b-form-input>
          <b-button v-if="!edit.email" @click="edit.email = true">
            <b-icon icon="pencil" class="edit-icon"></b-icon>
          </b-button>
          <b-tooltip target="input-email" triggers="hover" v-if="!validateEmail()" variant="danger">
            Please enter a valid email address
          </b-tooltip>
        </div>
      </div>
    </b-row>
    <b-row>
      <div role="group" class="group">
        <label for="input" class="input-label">
          Username:
        </label>
        <div class="editable-input-box">
          <b-form-input class="input-username" v-model="user.username" size="auto" :readonly="!edit.username" placeholder="Username" :state="validateUsername()" @keydown.enter.native="updateUserInfo"></b-form-input>
          <b-button v-if="!edit.username" @click="edit.username = true">
            <b-icon icon="pencil" class="edit-icon"></b-icon>
          </b-button>
          <b-tooltip target="input-username" triggers="hover" v-if="validateUsername()" variant="danger">
           Username required
          </b-tooltip>
        </div>
      </div>
    </b-row>
    <b-row>
      <div class="danger-zone">
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
            <b-button variant="danger" @click="deleteUser">Delete</b-button>
          </div>
        </b-modal>
      </div>
    </b-row>
  </b-col>
</template>

<script>
import axios from "axios";
export default {
  name: 'UserSettings',
  data() {
    return {
      user: {
        username: '',
        email: '',
      },
      edit: {
        username: false,
        email: false,
      }
    };
  },
  methods: {
    validateEmail() {
      const emailPattern = /^[A-z0-9_-]+(\.[A-z0-9_-]+)*@[A-z0-9_-]+(\.[A-z0-9_-]+)*\.[A-z0-9_-]+$/g;
      return this.user.email.length > 0 && emailPattern.test(this.user.email);
    },
    validateUsername() {
      return this.user.username.length > 0;
    },
    updateUserInfo() {
      if (!this.validateEmail() || !this.validateUsername()) {
        return;
      }

      if (!this.user) {
        this.$store.commit('setUserInfo', null);
        this.$router.push('/');
      }

      axios.put(this.$constructUrl(`/api/users/${this.user.id}`), {user: this.user})
      .then(response => {
        if (response.data.error) {
          throw new Error(response.data.error);
        }
        if (!response.data) {
          throw new Error('Could not update user informations');
        }
        this.edit.username = false;
        this.edit.email = false;
        this.user = response.data.result;
        if (this.me) {
          this.$store.commit('setUserInfo', response.data.result);
        }
      }).catch(error => {
        this.$bvToast.toast(error.message, {
          title: "Error",
          variant: "danger",
          solid: true,
        });
      });
    },
    deleteUser() {
      axios.delete(this.$constructUrl(`/api/users/${this.user.id}`))
      .then(response => {
        if (response.data.error) {
          throw new Error(response.data.error);
        }
        if (this.me) {
          this.$store.commit('setUserInfo', null);
          this.$router.push('/');
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
    me: {
      type: Boolean
    }
  },
  created() {
    if (!this.userId) {
      this.$router.push('/');
    }

    axios.get(this.$constructUrl(`/api/users/${this.userId}`))
    .then(response => {
      if (response.data.error) {
        throw new Error(response.data.error);
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