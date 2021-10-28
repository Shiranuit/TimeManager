<template>
  <div>
    <b-col>
      <b-row>
        <div class="hours-worked">
          <apexchart width="100%" type="line" :options="chartOptions" :series="series"></apexchart>
        </div>
      </b-row>
      <b-row>
        <div class="hours-worked">
          <apexchart width="100%" type="donut" :options="chartOptions" :series="series"></apexchart>
        </div>
      </b-row>
    </b-col>
  </div>
</template>

<script>
import axios from "axios";
import moment from "moment";
import "twix";

export default {
  name: 'UserSettings',
  data() {
    return {
      chartOptions: {
        chart: {
          id: 'vuechart-example',
          toolbar: {
            show: false
          }
        },
        xaxis: {
          type: 'categorie'
        },
      },
      series: [],
      user: {
        username: '',
        email: '',
      },
    };
  },
  methods: {
    fetchWorkingTimes() {
      axios.get(this.$constructUrl(`/api/workingtimes/${this.user.id}/_list`))
      .then(response => {
        if (response.data.error) {
          throw new Error(response.data.error);
        }

        const workingtimes = response.data.result.map(item => {
          return {
            id: item.id,
            start: new Date(item.start).getTime(),
            end: new Date(item.end).getTime(),
          };
        });

        let min = -1;
        for (const workingtime of workingtimes) {
          if (min === -1 || workingtime.start < min) {
            min = workingtime.start;
          }
        }

        let max = -1;
        for (const workingtime of workingtimes) {
          if (max === -1 || workingtime.end > max) {
            max = workingtime.end;
          }
        }

        if (min === -1 || max === -1) {
          return;
        }

        let dates = moment.twix(moment.utc(min), moment.utc(max)).toArray('day');

        const counter = {};

        for (const workingtime of workingtimes) {
          const hours = moment.twix(moment.utc(workingtime.start), moment.utc(workingtime.end)).toArray('hour');

          for (const hour of hours) {
            const key = hour.format('Do MMMM YYYY');
            counter[key] = (counter[key] || 0) + 1;
          }
        }

        const serie = [];
        for (const date of dates) {
          const key = date.format('Do MMMM YYYY');
          serie.push({x: key, y: counter[key] || 0});
        }
        this.series.push({name: 'Hours worked per day', data: serie})
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
    if (!this.userId) {
      this.$router.push('/');
    }

    axios.get(this.$constructUrl(`/api/users/${this.userId}`))
    .then(response => {
      if (response.data.error) {
        throw new Error(response.data.error);
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
  width: 100%;
  // background-color: rgb(168, 216, 178);
  border-radius: 30px;
  border: 2px solid rgb(168, 216, 178);
}
</style>