<template>
  <div id="sensitiveRule" class="app-container">
    <template>
      <el-table
        :data="tableData"
        style="width: 100%">
        <el-table-column
          prop="ruleName"
          label="规则名"
          width="500">
        </el-table-column>
        <el-table-column
          prop="ruleDesc"
          label="规则描述"
          width="500">
        </el-table-column>
        <el-table-column
          prop="ruleExample"
          label="规则示例">
        </el-table-column>
      </el-table>
    </template>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getInfo"
    />
  </div>
</template>

<script>
import { getRule } from '@/apir/sensitive/sensitiveRule';

export default {
  name: 'sensitiveRule',

  data() {
    return {
      tableData: [],
      total: 0,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        roleName: undefined,
        roleKey: undefined,
        status: undefined
      },
    }
  },

  created() {
    this.getInfo();
  },

  methods: {
    getInfo() {
      getRule(1, 10).then(res => {
        console.log(res);
        this.tableData = res.data;
        this.total = res.recordsTotal;
      })
    }
  }
}
</script>

<style>

</style>