<template>
  <div class="container-statistic">
    <div class="patientVisitS">
      <div class="header">
        <h3>患者访问数量统计</h3>
        <div class="date-picker-search">
          <!-- <el-button type="primary" round @click="handleSearch">查询</el-button> -->
          <el-date-picker
            v-model="value"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </div>
      </div>
      <div ref="showChart" class="statistic" :style="style"></div>
    </div>
    <div class="section">
      <showBar url="log/dept/rank" :title="title" :isRaw="true" :styleA="showBarStyle" @setDept="setDept" @loadChain="loadChain" />
      <div class="deptVisitStatistic_con">
        <div class="loading" v-if="deptVisitSLoading" :style="deptVisitS_style">加载中...</div>
        <div v-else id="deptVisitS" :style="deptVisitS_style"></div>
      </div>
    </div>
    <div v-if="loadDocV" class="section">
      <showBar url="log" :title="titleB" :param="docVisitParam" :isChain="true" :styleA="showBarStyle" @setDept="setDeptB" />
      <div class="deptVisitStatistic_con">
        <div class="loading" v-if="docVisitSLoading" :style="deptVisitS_style">加载中...</div>
        <div v-else id="docVisitS" :style="deptVisitS_style"></div>
      </div>
    </div>
  </div>
</template>

<script>
import echarts from 'echarts';
import dayjs from 'dayjs';
import { getList as getVisitList } from '@/apir/common';
import showBar from './showBar/showBar.vue';

export default {
  name: 'statistic',
  components: {
    showBar
  },
  data() {
    return {
      dataset: [],
      option: {
         tooltip: {
          trigger: "axis"
        },
        color: ["#3AA3E4", "#F6D675"],
        legend: {
          data: ["访问量"],
          bottom: "10",
          orient: "horizontal",
          textStyle: {
            //图例文字的样式
            color: "#000",
            fontSize: 12
          },
          icon: "rect"
        },
        grid: {
          left: "50",
          top: "20",
          backgroundColor: "#f00"
        },
        dataZoom: [
          {
            //用于区域缩放，从而能自由关注细节的数据信息
            //窗口变化
            type: "slider",
            xAxisIndex: 0,
            start: 0,
            // 左边在 0% 的位置。
            end: 100 // 右边在 100% 的位置。
          },
          {
            //滚轮变化
            type: "inside",
            xAxisIndex: 0,
            start: 0,
            end: 100
          },
          {
            type: "slider",
            yAxisIndex: 0,
            start: 0,
            end: 100
          },
          {
            type: "inside",
            yAxisIndex: 0,
            start: 0,
            end: 100
          }
        ],
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: []
        },
        yAxis: {
          type: "value",
          axisLabel: {
            formatter: "{value} "
          }
        },
        series: [
          {
            symbolSize: 10,
            name: "访问量",
            type: "line",
            data: [],
            smooth: true,
            itemStyle: {
              normal: {}
            }
          }
        ]
      },
      style: {
        width: '100%',
        height: '400px'
      },
      value: '',
      firstCommonParam: {
        startDate: '',
        endDate: ''
      },
      title: {
        desc: '科室共访问',
        num: '837'
      },
      titleB: {
        desc: '医生姓名共访问',
        num: '52'
      },
      showBarStyle: {
        width: '600px',
        height: '400px'
      },
      deptVisitS_style: {
        width: '580px',
        height: '400px'
      },
      deptVisitSLoading: true,
      docVisitSLoading: true,
      loadDocV: false,
      docVisitParam: ''
    }
  },
  watch: {
    value: function(newVal, oldVal) {
      this.getList();
    }
  },
  created() {
    this.init();
  },
  mounted() {
    this.showVisitChart();
  },
  methods: {
    init() {
      let now = new Date();
      this.value = [now, now];
      let value = this.value,
        s = dayjs(value[0]).format('YYYY-MM-DD'),
        e = dayjs(value[1]).format('YYYY-MM-DD');
        
      this.firstCommonParam.startDate = s;
      this.firstCommonParam.endDate = e;
    },
    getList() {
      // 数据请求
      let baseParam = this.copy(this.firstCommonParam);
      getVisitList('log/visit/count', Object.assign(baseParam, {
        hourDivide: true
      })).then(res => {
        let handledData = this.handleData(res.data);
        this.option.xAxis.data = handledData[0];
        this.option.series[0].data = handledData[1];

        this.chart.setOption(this.option);
      });
    },
    handleData(data) {
      let ar = [], x = [], y = [];
      data.forEach(item => {
        x.push(item.requestDate);
        y.push(item.requestDateNum);
      });
      x.reverse();
      y.reverse();
      [x, y].forEach(item => ar.push(item));
      return ar;
    },
    showVisitChart() {
      let dom = this.$refs.showChart;
      this.chart = echarts.init(dom);
    },
    handleSearch() {
      // 查询
    },
    renderChart(id, data) {
      let x = data.map(item => item.menuDesc),
        y = data.map(item => item.menuNum + 100);
      this.$nextTick(() => {
        let dom = document.getElementById(id),
          chart = echarts.init(dom),
          option = {
            color: ["#3c90f7"],
            title: {
              text: '科室访问菜单统计'
            },
            toolbox: {
              feature: {
                dataView: { show: true, readOnly: false },
                magicType: { show: true, type: ['line', 'bar'] },
                restore: { show: true },
                saveAsImage: { show: true }
              }
            },
            xAxis: {
              type: 'category',
              data: x,
              axisLabel: { interval: 0, rotate: 30 }
            },
            tooltip: {},
            yAxis: {
              type: 'value'
            },
            series: [
              {
                type: 'bar',
                data: y,
                barWidth: '50%'
              }
            ]
          };
        
        chart.setOption(option);
      });
    },
    setDept(data) {
      this.deptVisitSLoading = false;
      this.renderChart('deptVisitS', data);
    },
    setDeptB(data) {
      this.docVisitSLoading = false;
      this.renderChart('docVisitS', data);
    },
    loadChain(p) {
      this.loadDocV = true;
      this.docVisitParam = {
        doctorDeptDesc: p.deptDesc
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import './visit.scss';
</style>