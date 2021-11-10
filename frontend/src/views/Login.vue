<template>
  <div class="view">
    <nav-bar />
    <div class="login">
      <b-container fluid class="login-flexbox">
        <b-col class="login-context">
          <b-row v-if="!show_login"
            ><b-form-input v-model="email" placeholder="Email" @keydown.enter.native="login_register"></b-form-input
          ></b-row>
          <b-row
            ><b-form-input
              v-model="username"
              placeholder="Username"
              @keydown.enter.native="login_register"
            ></b-form-input
          ></b-row>
          <b-row
            ><b-form-input
              v-model="password"
              type="password"
              placeholder="Password"
              @keydown.enter.native="login_register"
            ></b-form-input
          ></b-row>
          <b-row
            ><b-button class="action-button" v-on:click="login_register">{{
              (show_login && "Login") || "Register"
            }}</b-button></b-row
          >
          <b-row
            ><b-link class="swap-action" v-on:click="swap_action">{{
              (show_login && "Register a new account ?") ||
              "Already have an account ?"
            }}</b-link></b-row
          >
        </b-col>
      </b-container>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import NavBar from "../components/NavBar.vue";
export default {
  name: "Login",
  components: {
    NavBar,
  },
  data() {
    return {
      show_login: true,
      email: "",
      username: "",
      password: "",
    };
  },
  methods: {
    swap_action() {
      this.show_login = !this.show_login;
    },

    login_register() {
      if (this.show_login) {
        this.login();
      } else {
        this.register();
      }
    },

    getUserInfo() {
      return axios.get(
        this.$constructUrl('/api/auth/_me'),
        { headers: { authorization: this.$store.state.jwt } }
      ).then(response => {
        if (response.data.error) {
          throw new Error(response.data.error.message);
        }

        this.$store.commit("setUserInfo", response.data.result);
      })

    },
    login() {
      axios
        .post(this.$constructUrl('/api/auth/_login'),
          {
            username: this.username,
            password: this.password
          }
        ).then((response) => {
          if (response.data.error) {
            throw new Error(response.data.error.message);
          }

          const result = response.data.result;

          if (!result.jwt) {
            throw new Error('No jwt returned, authentication failed');
          }

          this.$store.commit("setJWT", result.jwt);
          return this.getUserInfo().then(() => {
            this.$router.push("/home");
          })
        })
        .catch((error) => {
          this.$bvToast.toast(error.message, {
            title: "Error",
            variant: "danger",
            solid: true,
          });
        });
    },

    register() {
      axios
        .post(this.$constructUrl('/api/auth/_register'), {
          email: this.email,
          username: this.username,
          password: this.password,
        })
        .then((response) => {

          if (response.data.error) {
            throw new Error(response.data.error.message);
          }

          const result = response.data.result;

          if (!result.jwt) {
            throw new Error('No jwt returned, authentication failed');
          }

          this.$store.commit("setJWT", result.jwt);
          return this.getUserInfo().then(() => {
            this.$router.push("/home");
          })
        })
        .catch((error) => {
          this.$bvToast.toast(error.message, {
            title: "Error",
            variant: "danger",
            solid: true,
          });
        });
    },
  },
  beforeMount() {
    if (this.$store.state.jwt !== null) {
      this.$router.push("/home");
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

.action-button {
  width: 100%;
}

.swap-action {
  text-align: center;
  width: 100%;
}

.login-context {
  transform: translate(0, -50%);
  padding-left: 40%;
  padding-right: 40%;
}

.login-flexbox {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.row {
  padding-top: 10px;
}
</style>
