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
        yaxis: {
          decimalsInFloat: 1
        }
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
      const url = this.me
        ? this.$constructUrl(`/api/workingtime/_me/_list`)
        : this.$constructUrl(`/api/workingtime/${this.userId}/_list`);

      axios.get(
        url,
        { headers:{ authorization:this.$store.state.jwt } }
      ).then(response => {
        if (response.data.error) {
          throw new Error(response.data.error.message);
        }

        const workingtimes = response.data.result.map(item => {
          return {
            id: item.id,
            start: moment.utc(item.start).unix() * 1000,
            end: moment.utc(item.end).unix() * 1000,
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

        let dates = moment.twix(moment(min), moment(max)).toArray('day');

        const counterPerDay = {};
        const counterPerMonth = {}

        for (const workingtime of workingtimes) {
          const range = moment.twix(moment(workingtime.start), moment(workingtime.end));
          const days = range.toArray('day');

          for (const day of days) {
            const dayRange = moment.twix(moment(day), moment(day).add(23, 'h').add(59, 'm').add(59, 's'));
            const time = dayRange.intersection(range).length('ms') / 3600000;
            const dayKey = day.format('Do MMMM YYYY');
            const monthKey = day.format('MMMM YYYY')
            counterPerDay[dayKey] = (counterPerDay[dayKey] || 0) + time;
            counterPerMonth[monthKey] = (counterPerMonth[monthKey] || 0) + time
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
      { headers:{ authorization:this.$store.state.jwt } }
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
  width: 100%;
  // background-color: rgb(168, 216, 178);
  border-radius: 30px;
  border: 2px solid rgb(168, 216, 178);
}
</style>