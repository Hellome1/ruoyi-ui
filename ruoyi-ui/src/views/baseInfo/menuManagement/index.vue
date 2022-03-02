<template>
  <div class="app-container">
    <div class="menuMagenament_baseInfo">
      <el-tabs v-model="activeName">
        <el-tab-pane v-for="dic in dict" :key="dic.code" :label="dic.name" :name="dic.code">
          <Table :menuCode="dic.code" :dict="copy(dict, true)" v-if="dic.code === activeName" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import { getList as getL } from '@/apir/common';
import Table from './table/index.vue';
export default {
  name: 'menuManagement',
  components: {
    Table
  },
  data() {
    return {
      activeName: '',
      dict: [],
      dictRaw: []
    };
  },
  created() {
    this.getDict();
  },
  methods: {
    getDict() {
      getL('menu/dict', {}).then(res => {
        let { data = [] }  = res;
        let dict = data.map(dictInfo => {
          let { systemCode, systemName, id } = dictInfo;
          return {
            code: systemCode,
            name: systemName,
            id
          }
        });
        this.activeName = dict[0] ? dict[0].code : '';
        this.dict = dict;
        this.dictRaw = data;
      });
    }
  }
}
</script>

<style>

</style>