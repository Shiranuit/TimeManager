<template>
  <div>
    <b-button class="btn-refresh" @click="refresh()" >
      <b-icon class="icon-refresh" icon="arrow-clockwise" />Refresh</b-button>
    <b-col>
      <b-row>
        <div class="chart-section1">
          <span>Hours worked per day</span>
          <apexchart type="line" :options="chartOptions" :series="series"></apexchart>
        </div>
        <div class="chart-section1">
          <span>Hours worked per month</span>
          <apexchart type="pie" :options="chartOptions2" :series="series2"></apexchart>
        </div>
      </b-row>
      <b-row>
        <div class="chart-section2">
          <span>Hours worked per Year</span>
          <apexchart type="donut" :options="chartOptions3" :series="series3"></apexchart>
        </div>
      </b-row>
      <!-- <b-row>
        <span>Hours worked per month</span>
        <div class="hours-worked">
          <apexchart width="50%" type="donut" :options="chartOptions2" :series="series2"></apexchart>
        </div>
      </b-row> -->
    </b-col>
  </div>
</template>

<script>
import axios from "axios";
import moment from "moment";
import "twix";

export default {
  name: 'UserSettings',
  props: {
    userId: {
      type: Number,
    },
    me: {
      type: Boolean,
    }
  },
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
          type: 'pie'
        },
        labels: [],
      },
      chartOptions3: {
        chart: {
          id: 'vuechart-example',
          toolbar: {
            show: false
          },
          type: 'donut'
        },
        labels: [],
      },
      series3: [],
      series2: [],
      series: [],
      user: {
        username: '',
        email: '',
      },
    };
  },
  methods: {
    refresh() {
      this.series3 = [],
      this.series2 = [],
      this.series = [],
      this.chartOptions = {
        xaxis: {
          type: 'categorie'
        },
        yaxis: {
          decimalsInFloat: 1
        }
      },
      this.chartOptions2 = {
        labels: [],
      },
      this.chartOptions3 = {
        labels: [],
      },
      this.fetchWorkingTimes()
    },
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
        const counterPerMonth = {};
        const counterPerYear = {}

        for (const workingtime of workingtimes) {
          const range = moment.twix(moment(workingtime.start), moment(workingtime.end));
          const days = range.toArray('day');

          for (const day of days) {
            const dayRange = moment.twix(moment(day), moment(day).add(23, 'h').add(59, 'm').add(59, 's'));
            const time = dayRange.intersection(range).length('ms') / 3600000;
            const dayKey = day.format('Do MMMM YYYY');
            const monthKey = day.format('MMMM YYYY');
            const yearKey = day.format( 'YYYY');
            counterPerDay[dayKey] = (counterPerDay[dayKey] || 0) + time;
            counterPerMonth[monthKey] = (counterPerMonth[monthKey] || 0) + time;
            counterPerYear[yearKey] = (counterPerYear[yearKey] || 0) + time;
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
        for (const key of Object.keys(counterPerYear)) {
          this.series3.push(counterPerYear[key]);
          this.chartOptions3.labels.push(key);
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
.chart-section1 {
  width: 50%;
  border-radius: 30px;
  border: 2px solid #F8684A;;
}

.chart-section2 {
  margin-top: 15px;
  width: 100%;
  border-radius: 30px;
  border: 2px solid #F8684A;;
}
.btn-refresh {
  margin: 5px;
  background-color: #F8684A;
  align-items: center;
  display: flex;
  justify-content: center;
  width: 25%;
}
.icon-refresh {
  margin: 5px;
}
</style>