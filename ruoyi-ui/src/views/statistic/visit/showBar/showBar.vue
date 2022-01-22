<template>
  <div class="showBar_container" :style="styleA">
    <div class="header" :style="{height: headerHeight}">
      <h3> {{ title.desc }} <span class="highlight">{{ title.num }}</span> 次</h3>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期">
      </el-date-picker>
    </div>
    <div class="barsCon" :style="barsS">
      <ul class="bars" v-if="isRaw">
        <li class="bar" v-for="(l, i) in list" :key="i">
          <div class="progress" @click="handleClickBar(l)">
            <div class="desc" :style="{width: minWidth + l.deptNum / 2 + 'px'}">{{l.deptDesc}}</div>
            <div class="num">{{l.deptNum}}</div>
          </div>
        </li>
      </ul>
      <ul class="bars" v-if="isChain">
        <li class="bar" v-for="(l, i) in list" :key="i">
          <div class="progress" @click="handleClickBar(l)">
            <div class="desc" :style="{width: minDocWidth + l.count * 3 + 'px'}">{{l.name}}</div>
            <div class="num">{{l.count}}</div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { getList as getL } from '@/apir/common';
import dayjs from 'dayjs';

export default {
  props: {
    title: {
      type: Object
    },
    url: {
      type: String,
      required: true
    },
    styleA: {
      type: Object,
      default: function() {
        return {
          width: '500px',
          height: '400px'
        }
      }
    },
    param: {
      type: Object,
      default: function() {
        return {};
      }
    },
    isRaw: {
      type: Boolean,
      default: false
    },
    isChain: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      list: [],
      dateRange: '',
      headerHeight: '50px',
      minWidth: 250,
      firstCommonParam: {
        startDate: '',
        endDate: ''
      },
      loading: false,
      loadingL: false,
      minDocWidth: 300
    };
  },
  watch: {
    dateRange: function() {
      if (this.param != {}) this.getList();
    },
    param: function() {
      this.getList();
    }
  },
  created() {
    this.init();
  },
  computed: {
    barsS: function() {
      return {
        width: parseInt(this.styleA.width) - 2 + 'px',
        height: parseInt(this.styleA.height) - parseInt(this.headerHeight) - 2 + 'px'
      }
    }
  },
  methods: {
    init() {
      let now = new Date();
      this.dateRange = [now, now];
      let dateRange = this.dateRange,
        s = dayjs(dateRange[0]).format('YYYY-MM-DD'),
        e = dayjs(dateRange[1]).format('YYYY-MM-DD');
        
      this.firstCommonParam.startDate = s;
      this.firstCommonParam.endDate = e;
    },
    getList() {
      let baseParam = this.copy(this.firstCommonParam);
      let param = this.param || {};
      let sendParam = Object.assign(baseParam, param);
      if (!this.loadingL) {
        this.loadingL = true;
        getL(this.url, sendParam).then(res => {
          this.list = this.transData(res.data);
          this.title.num = res.recordsTotal;
          this.handleClickBar(this.list[0]);
          this.loadingL = false;
        });
      }
    },
    transData(data) {
      if (this.isRaw) return data;
      if (this.isChain) {
        let list = [];
        data.forEach(item => {
          let o = {},
            pushF = true;
          for (let i = 0; i < list.length; i++) {
            if (list[i].name === item.doctorName) {
              list[i].count++;
              pushF = false;
            }
          }
          if (pushF) {
            o.name = item.doctorName;
            o.count = 1;
            list.push(o);
          }
        });
        // console.log(list);
        return list;
      }
    },
    handleClickBar(l) {
      let param = {
        deptCode: '',
        deptName: '',
        doctorName: ''
      };

      if (this.isRaw) {
        param.deptName = l.deptDesc;
        this.$emit('loadChain', l);
      } else if (this.isChain) {
        param.doctorName = l.name
      }

      if (!this.loading) {
        this.loading = true;
        getL('log/menu/rank', Object.assign(param, this.firstCommonParam)).then(res => {
          this.$emit('setDept', res.data);
          this.loading = false;
        }).catch(err => { 
          this.loading = false; 
          new Error(err);
        });
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import './showBar.scss';
</style>