<template>
  <div>
    <div class="statistics-container">
      <b-button squared v-b-modal.view-statistics class="statistics-button" variant="info">
        <b-icon icon="graph-up" class="statistics-icon"></b-icon>
        View Statistics
      </b-button>
      <b-button squared class="refresh-button" variant="info" @click="fetchWorkingTimes">
        <b-icon icon="arrow-clockwise" class="statistics-icon"></b-icon>
        Refresh
      </b-button>
      <b-button squared v-b-modal.create-worked-time class="new-workingtime" variant="info" @click="deselectItem">
        <b-icon icon="plus" class="statistics-icon" font-scale="2"></b-icon>
        <div>Add a new working period</div>
      </b-button>
    </div>
    <b-table head-variant="dark" hover :items="items" :fields="fields" inline>
      <template #cell(Action)="row">
        <b-modal :id="'edit-workingtime-modal' + row.item.ID" title="Edit Worked period" hide-footer>
          <label for="datepicker">Date:</label>
          <b-form-datepicker id="datepicker-buttons" v-model="selected.date" class="mb-2" menu-class="w-100" calendar-width="100%" :state="validatePickedDate()"></b-form-datepicker>
          <b-form-timepicker id="timepicker-buttons" v-model="selected.time_str" @context="onTimeContext" now-button reset-button locale="fr" :state="validatePickedTime()"></b-form-timepicker>
          <label for="worked-hours">Hours Worked (ex: 2d, 1h, 10m):</label>
          <b-form-input  class="worked-hours" v-model="selected.worked" :state="validateWorkedHours()"></b-form-input>
          <div class="modal-footer">
            <b-button variant="secondary" @click="$bvModal.hide('edit-workingtime-modal' + row.item.ID)">Cancel</b-button>
            <b-button variant="primary" @click="updateWorkingTime(row.item.ID)">Update</b-button>
          </div>
        </b-modal>
        <b-button v-b-modal="'edit-workingtime-modal' + row.item.ID" size="sm" class="mr-2" @click="selectItem(row.item.ID)">
          Edit
        </b-button>
        <b-button @click="deleteWorkingTime(row.item.ID)" size="sm" variant="danger">
          Delete
        </b-button>
      </template>
    </b-table>
    <b-modal id="create-worked-time" title="New Worked period" hide-footer>
      <label for="datepicker">Date:</label>
      <b-form-datepicker id="datepicker-buttons" v-model="selected.date" class="mb-2" menu-class="w-100" calendar-width="100%" :state="validatePickedDate()"></b-form-datepicker>
      <b-form-timepicker id="timepicker-buttons" v-model="selected.time_str" @context="onTimeContext" now-button reset-button locale="fr" :state="validatePickedTime()"></b-form-timepicker>
      <label for="worked-hours">Hours Worked (ex: 2d, 1h, 10m):</label>
      <b-form-input  class="worked-hours" v-model="selected.worked" :state="validateWorkedHours()"></b-form-input>
      <div class="modal-footer">
        <b-button variant="secondary" @click="$bvModal.hide('create-worked-time')">Cancel</b-button>
        <b-button variant="primary" @click="createWorkingTime">Add</b-button>
      </div>
    </b-modal>
    <b-modal id="view-statistics" title="User Statistics">
      <user-chart :user-id="this.userId" :me="this.me"/>
    </b-modal>
  </div>
</template>

<script>
import axios from "axios";
import moment from "moment";
import ms from "ms";
import UserChart from './UserChart.vue';

export default {
  name: 'UserSettings',
  components: {
    UserChart
  },
  data() {
    return {
      user: {
        username: '',
        email: '',
      },
      items: [],
      fields: ['ID', 'Start', 'End', 'Hours Worked', 'Action'],
      selected: {
        date: '',
        time: '',
      },
      workingtimes: {}
    };
  },
  methods: {
    validateWorkedHours() {
      const pattern = /(\d+d|\d+h|\d+m|\d+s)/g
      return !!(this.selected.worked && this.selected.worked.length > 0 && pattern.test(this.selected.worked));
    },
    validatePickedDate() {
      return !!(this.selected.date && this.selected.date.length > 0);
    },
    validatePickedTime() {
      return !!(this.selected.time_str && this.selected.time_str.length > 0);
    },
    deselectItem() {
      this.selected = {};
    },
    onTimeContext(context) {
      this.selected.time = {
        minutes: context.minutes,
        hours: context.hours,
      };
    },
    deleteWorkingTime(id) {
      const url = this.me
        ? this.$constructUrl(`/api/workingtime/_me/${id}`)
        : this.$constructUrl(`/api/workingtime/${this.userId}/${id}`);

      axios.delete(
        url,
        { headers:{ authorization:this.$store.state.jwt } }
      ).then(response => {
        if (response.data.error) {
          throw new Error(response.data.error.message);
        }
        this.workingtimes = this.workingtimes.filter(item => item.id !== id)
        this.items = this.items.filter(item => item.ID !== id);
      }).catch(error => {
        this.$bvToast.toast(error.message, {
          title: "Error",
          variant: "danger",
          solid: true,
        });
      });
    },
    selectItem(id) {
      this.selected = this.workingtimes.find(item => item.id === id);
      this.selected.date = moment(this.selected.start).format('YYYY-MM-DD');
      this.selected.context = {
        seconds: new Date(this.selected.start).getUTCSeconds(),
        minutes: new Date(this.selected.start).getUTCMinutes(),
        hours: new Date(this.selected.start).getUTCHours(),
      };
      this.selected.time_str = `${new Date(this.selected.start).getHours()}:${new Date(this.selected.start).getMinutes()}:00`;
    },
    updateWorkingTime(id) {
      if (!this.validatePickedTime() || !this.validatePickedDate() || !this.validateWorkedHours()) {
        return;
      }

      const date = new Date(this.selected.date);
      date.setUTCHours(this.selected.time.hours);
      date.setUTCMinutes(this.selected.time.minutes);
      this.selected.start = date.getTime();
      this.selected.end = this.selected.start + ms(this.selected.worked);

      const url = this.me
        ? this.$constructUrl(`/api/workingtime/_me/${id}`)
        : this.$constructUrl(`/api/workingtime/${this.userId}/${id}`);

      axios.put(
        url,
        {
          start: new Date(this.selected.start).toISOString(),
          end: new Date(this.selected.end).toISOString(),
        },
        { headers:{ authorization:this.$store.state.jwt } }
      ).then(response => {
        if (response.data.error) {
          throw new Error(response.data.error.message);
        }
        const result = response.data.result;
        const workingtime = this.workingtimes.find(item => item.id === result.id);
        workingtime.start = result.start;
        workingtime.end = result.end;
        const table_item = this.items.find(item => item.ID === result.id);
        table_item.Start = moment(result.start).format('Do MMMM YYYY HH:mm:ss');
        table_item.End = moment(result.end).format('Do MMMM YYYY HH:mm:ss');
        table_item['Hours Worked'] = ms(moment.duration(moment(result.end) - moment(result.start)).asMilliseconds());
        this.$bvModal.hide('edit-workingtime-modal' + id);
      }).catch(error => {
        this.$bvToast.toast(error.message, {
          title: "Error",
          variant: "danger",
          solid: true,
        });
      });
    },
    createWorkingTime() {
      if (!this.validatePickedTime() || !this.validatePickedDate() || !this.validateWorkedHours()) {
        return;
      }

      const date = new Date(this.selected.date);
      date.setUTCHours(this.selected.time.hours);
      date.setUTCMinutes(this.selected.time.minutes);
      this.selected.start = date.getTime();
      this.selected.end = this.selected.start + ms(this.selected.worked);

      const url = this.me
        ? this.$constructUrl(`/api/workingtime/_me`)
        : this.$constructUrl(`/api/workingtime/${this.userId}`);

      axios.post(
        url,
        {
          start: new Date(this.selected.start).toISOString(),
          end: new Date(this.selected.end).toISOString(),
          jwt: this.$store.state.jwt
        },
        { headers:{ authorization:this.$store.state.jwt } }
      ).then(response => {
        if (response.data.error) {
          throw new Error(response.data.error.message);
        }
        const result = response.data.result;
        this.workingtimes.push({
          start: moment.utc(result.start).unix() * 1000,
          end: moment.utc(result.end).unix() * 1000,
          id: result.id,
          worked: ms(moment.duration(moment.utc(result.end) - moment.utc(result.start)).asMilliseconds()),
        });
        this.items.push({
          ID: result.id,
          Start: moment.utc(result.start).local().format('Do MMMM YYYY HH:mm:ss'),
          End: moment.utc(result.end).local().format('Do MMMM YYYY HH:mm:ss'),
          "Hours Worked": ms(moment.duration(moment.utc(result.end) - moment.utc(result.start)).asMilliseconds()),
        });
        this.$bvModal.hide('create-worked-time');
      }).catch(error => {
        this.$bvToast.toast(error.message, {
          title: "Error",
          variant: "danger",
          solid: true,
        });
      });
    },
    fetchWorkingTimes() {
      const url = this.me
        ? this.$constructUrl(`/api/workingtime/_me/_list`)
        : this.$constructUrl(`/api/workingtime/${this.user.id}/_list`);

      axios.get(
        url,
        { headers:{ authorization:this.$store.state.jwt } }
      ).then(response => {
        if (response.data.error) {
          throw new Error(response.data.error.message);
        }

        this.workingtimes = response.data.result.map(item => {
          return {
            id: item.id,
            start: moment.utc(item.start).unix() * 1000,
            end: moment.utc(item.end).unix() * 1000,
            worked: ms(moment.duration(moment.utc(item.end) - moment.utc(item.start)).asMilliseconds()),
          };
        });

        this.items = [];

        for (const workingtime of this.workingtimes) {
          this.items.push({
            isActive: true,
            ID: workingtime.id,
            Start: moment.utc(workingtime.start).local().format('Do MMMM YYYY HH:mm:ss'),
            End: moment.utc(workingtime.end).local().format('Do MMMM YYYY HH:mm:ss'),
            "Hours Worked": `${workingtime.worked}`,
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
    me: {
      type: Boolean,
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
      { headers:{ authorization:this.$store.state.jwt} }
    ).then(response => {
      if (response.data.error) {
        throw new Error(response.data.error.message);
      }
      this.user = response.data.result;
      return this.fetchWorkingTimes();
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
.hours-worked {
  // width: 40%;
  background-color: rgb(168, 216, 178);
  border-radius: 30px;
}

.statistics-container {
  align-items: left;
  display: flex;
  justify-content: left;
  width: 100%;
}
.statistics-button {
  width: 100%;
}

.new-workingtime {
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
</style>