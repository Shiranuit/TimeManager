<template>
  <b-col class="column">
  <b-modal id="updateUserModal" title="Password Validation" hide-footer>
    <label for="input" class="input-label">
      Enter your actual password to confirm your changes:
    </label>
    <b-form-input
    v-model="actual_password"
    type="password"
    placeholder="Password"
    @keydown.enter.native="updateUserInfo"/>
    <div class="modal-footer">
      <b-button variant="secondary" @click="$bvModal.hide('updateUserModal')">Cancel</b-button>
      <b-button variant="primary" @click="updateUserInfo">Update</b-button>
    </div>
  </b-modal>
    <b-row>
      <div role="group" class="group">
        <label for="input" class="input-label">
          Email Address:
        </label>
        <div class="editable-input-box">
          <b-form-input id="input-email" class="input" v-model="user.email" :readonly="!edit.email" placeholder="Email" :state="validateEmail()" @keydown.enter.native="passwordBeforeUpdateUserInfo"></b-form-input>
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
          <b-form-input class="input-username" id="input-username" v-model="user.username" size="auto" :readonly="!edit.username" placeholder="Username" :state="validateUsername()" @keydown.enter.native="passwordBeforeUpdateUserInfo"></b-form-input>
          <b-button v-if="!edit.username" @click="edit.username = true">
            <b-icon icon="pencil" class="edit-icon"></b-icon>
          </b-button>
          <b-tooltip target="input-username" triggers="hover" v-if="!validateUsername()" variant="danger">
           Username required
          </b-tooltip>
        </div>
      </div>
    </b-row>
    <b-row>
      <b-modal id="updateUserPasswordModal" title="Change Password" hide-footer>
        <div v-if="this.me">
          <label for="input" class="input-label">
            Actual Password:
          </label>
          <b-form-input
          v-model="actual_password"
          type="password"
          placeholder="Actual Password"
          @keydown.enter.native="updateUserPassword"/>
        </div>

        <label for="input" class="input-label">
          New Password:
        </label>
        <b-form-input
        id="input-password"
        v-model="new_password"
        type="password"
        placeholder="New Password"
        :state="validatePasswordLength() && validatePasswordStrength()"
        @keydown.enter.native="updateUserPassword"/>
        <b-tooltip target="input-password" triggers="hover" v-if="!validatePasswordLength()" variant="danger">
          Password should be at least 8 characters long
        </b-tooltip>
        <b-tooltip target="input-password" triggers="hover" v-if="validatePasswordLength() && !validatePasswordStrength()" variant="danger">
          Should include at least 1 Capital letter and 1 Number
        </b-tooltip>

        <b-form-input
        class="input-field"
        id="input-confirm-password"
        v-model="confirm_new_password"
        type="password"
        placeholder="Confirm New Password"
        :state="validateConfirmationPassword()"
        @keydown.enter.native="updateUserPassword"/>

        <b-tooltip target="input-confirm-password" triggers="hover" v-if="!validateConfirmationPassword()" variant="danger">
          Does not match the new password
        </b-tooltip>

        <div class="modal-footer">
          <b-button variant="secondary" @click="$bvModal.hide('updateUserPasswordModal')">Cancel</b-button>
          <b-button variant="primary" @click="updateUserPassword">Update</b-button>
        </div>
      </b-modal>
      <b-button class="password-button" variant="primary" @click="beforeChangingPassword">Change password</b-button>
      <label v-if="!me && isSuperManager()">
        Role:
      </label>
      <b-form-select v-model="user.role" :options="options" :state="this.user.role !== null" v-if="!me && isSuperManager()" @change="changeUserRole"></b-form-select>
    </b-row>
    <b-row>
      <div class="danger-zone">
        <div class="danger-zone-title">Danger Zone</div>
        <div class="center-text">
          Welcome to the Danger Zone, every action taken here are ireversible, be careful.
        </div>
        <div class="button-space">
          <b-button v-b-modal.delete-user-modal variant="danger" class="danger-button">Delete this account</b-button>
        </div>
          
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
const CAPITAL_PATTERN = /[A-Z]/;
const NUMBER_PATTERN = /[0-9]/;
const LOWER_PATTERN = /[a-z]/;
import axios from "axios";
export default {
  name: 'UserSettings',

  props: {
    userId: {
      type: Number,
    },
    me: {
      type: Boolean
    }
  },
  data() {
    return {
      actual_password: '',
      new_password: '',
      confirm_new_password: '',
      user: {
        username: '',
        email: '',
        role: 'user',
      },
      edit: {
        username: false,
        email: false,
      },
      options: [{
        value: 'user',
        text: 'User'
      }, {
        value: 'manager',
        text: 'Manager'
      }, {
        value: 'super-manager',
        text: 'Super Manager'
      }],
    };
  },
  methods: {
    isSuperManager() {
      const userInfo = this.$store.state.userInfo || {};
      return userInfo.role === "super-manager";
    },
    validatePasswordLength() {
      return this.new_password.length > 8;
    },
    validatePasswordStrength() {
      return CAPITAL_PATTERN.test(this.new_password)
        && LOWER_PATTERN.test(this.new_password)
        && NUMBER_PATTERN.test(this.new_password);
    },
    validateConfirmationPassword() {
      return this.confirm_new_password.length > 0 && this.new_password === this.confirm_new_password;
    },
    validateEmail() {
      const emailPattern = /^[A-z0-9_-]+(\.[A-z0-9_-]+)*@[A-z0-9_-]+(\.[A-z0-9_-]+)*\.[A-z0-9_-]+$/g;
      return this.user.email.length > 0 && emailPattern.test(this.user.email);
    },
    validateUsername() {
      return this.user.username.length > 0;
    },
    changeUserRole(value) {
      axios.put(
        this.$constructUrl(`/api/security/${this.userId}/_role`),
        {
          role: value
        },
        { headers:{ authorization:this.$store.state.jwt } }
      ).then(response => {
        if (response.data.error) {
          throw new Error(response.data.error.message);
        }

        if (!response.data) {
          throw new Error('Could not update user informations');
        }

        this.user = response.data.result;
      }).catch(error => {
        this.$bvToast.toast(error.message, {
          title: "Error",
          variant: "danger",
          solid: true,
        });
      });
    },
    passwordBeforeUpdateUserInfo() {
      this.actual_password = '';
      if (!this.validateEmail() || !this.validateUsername()) {
        this.$bvToast.toast('Some fields are invalid', {
          title: "Error",
          variant: "danger",
          solid: true,
        });
        return;
      }

      if (this.me) {
        this.$root.$emit('bv::show::modal', 'updateUserModal');
      } else {
        this.updateUserInfo();
      }
    },
    beforeChangingPassword() {
      this.actual_password = '';
      this.new_password = '';
      this.confirm_new_password = '';
      this.$root.$emit('bv::show::modal', 'updateUserPasswordModal');
    },
    updateUserPassword() {
      if (this.new_password !== this.confirm_new_password) {
        this.$bvToast.toast('New password and confirmation password does not match', {
          title: "Error",
          variant: "danger",
          solid: true,
        });
        return;
      }

      const url = this.me
        ? this.$constructUrl(`/api/auth/_password`)
        : this.$constructUrl(`/api/security/${this.userId}/_password`);

      axios.put(
        url,
        { 
          oldPassword: this.actual_password,
          newPassword: this.new_password,
        },
        { headers:{ authorization:this.$store.state.jwt } }
      ).then(response => {
        if (response.data.error) {
          throw new Error(response.data.error.message);
        }
        if (!response.data) {
          throw new Error('Could not update user informations');
        }
        this.$root.$emit('bv::hide::modal', 'updateUserPasswordModal');
      }).catch(error => {
        this.$bvToast.toast(error.message, {
          title: "Error",
          variant: "danger",
          solid: true,
        });
      });
    },
    updateUserInfo() {

      if (!this.user) {
        this.$store.commit('setUserInfo', null);
        this.$router.push('/');
      }

      const url = this.me
        ? this.$constructUrl(`/api/auth`)
        : this.$constructUrl(`/api/security/${this.userId}`);

      axios.put(
        url,
        { 
          email: this.user.email,
          username: this.user.username,
          actualPassword: this.actual_password
        },
        { headers:{ authorization:this.$store.state.jwt } }
      ).then(response => {
        if (response.data.error) {
          throw new Error(response.data.error.message);
        }
        if (!response.data) {
          throw new Error('Could not update user informations');
        }
        this.edit.username = false;
        this.edit.email = false;
        this.user = response.data.result;
        if (this.me) {
          this.$store.commit('setUserInfo', response.data.result);
          this.$root.$emit('bv::hide::modal', 'updateUserModal');
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
      const url = this.me
        ? this.$constructUrl(`/api/auth`)
        : this.$constructUrl(`/api/security/${this.userId}`);

      axios.delete(
        url,
        { headers:{ authorization:this.$store.state.jwt } }
      ).then(response => {
        if (response.data.error) {
          throw new Error(response.data.error.message);
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
  created() {
    if (!this.userId && !this.me) {
      this.$router.push('/');
    }

    const url = this.me
      ? this.$constructUrl(`/api/auth/_me`)
      : this.$constructUrl(`/api/security/${this.userId}`);

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
  width: 100%;
  height: 100%;
}

.danger-zone-title {
  margin-left: 50%;
  width: 15%;
  justify-content: center;
  text-align: center;
  background-color: white;
  transform: translate(-50%, -50%);
  color: #e74a3e;
  border-radius: 15px;
  border: 2px solid #e74a3e;
}

.danger-button {
  width: 80%;
  margin-top: 10px;
  margin-bottom: 10px;
}

.password-button {
  width: 100%;
}

.center-text {
  text-align: center;
  width: 100%;
}

.button-space {
  display: flex;
  width: 100%;
  justify-content: center;
  
}

.input-field {
  margin-top: 10px;
}

</style>