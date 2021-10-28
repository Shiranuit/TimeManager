<template>
  <div>
    <b-col>
      <b-row>
        <span>Hours worked per day</span>
        <div class="hours-worked">
          <apexchart width="100%" type="line" :options="chartOptions" :series="series"></apexchart>
        </div>
      </b-row>
      <b-row>
        <span>Hours worked per month</span>
        <div class="hours-worked">
          <apexchart width="100%" type="donut" :options="chartOptions2" :series="series2"></apexchart>
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
      chartOptions2: {
        chart: {
          id: 'vuechart-example',
          toolbar: {
            show: false
          },
          type: 'donut'
        },
        labels: [],
      },
      series2: [],
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

        const counterPerDay = {};
        const counterPerMonth = {}

        for (const workingtime of workingtimes) {
          const hours = moment.twix(moment.utc(workingtime.start), moment.utc(workingtime.end)).toArray('hour');

          for (const hour of hours) {
            const dayKey = hour.format('Do MMMM YYYY');
            const monthKey = hour.format('MMMM YYYY');
            counterPerDay[dayKey] = (counterPerDay[dayKey] || 0) + 1;
            counterPerMonth[monthKey] = (counterPerMonth[monthKey] || 0) + 1;
          }
        }

        const serieDay = [];
        // const serieMonth = [];
        for (const date of dates) {
          const key = date.format('Do MMMM YYYY');
          serieDay.push({x: key, y: counterPerDay[key] || 0});
        }
        for (const key of Object.keys(counterPerMonth)) {
          this.series2.push(counterPerMonth[key]);
          this.chartOptions2.labels.push(key);
        }
        this.series.push({name: 'Hours worked per day', data: serieDay})
        // this.series2.push({name: 'Hours worked per month', data: serieMonth})
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