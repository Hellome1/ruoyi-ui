<template>
  <div class="module_in_permissionManagement">
    <el-table
      :data="sensitiveList"
      style="width: 100%">
      <template v-for="c in columns">
        <el-table-column v-if="!c.isS" :key="c.prop" :prop="c.prop" :label="c.label" :width="c.w" :show-overflow-tooltip="c.sot" :align="aa"></el-table-column>
        <el-table-column v-if="c.isS" :key="c.prop" :label="c.label" :width="c.w" :align="aa">
          <template slot-scope="scope">
            <el-switch 
              v-model="scope.row[c.prop]"
              @change="handleStatusChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
      </template>
    </el-table>

    <pagination
      class="pagination_in_sensitiveOfPermission"
      v-show="total>0"
      :total="total"
      :page.sync="params.pageNumber"
      :limit.sync="params.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { getList as getL, switchAppling } from '@/apir/common';

export default {
  name: 'sensitiveInPermission',
  props: {
    roleId: {
      required: true
    }
  },
  data() {
    return {
      // 用户列表
      sensitiveList: [],
      // 用户拥有
      sensitiveOfRole: null,
      // 所有表的align
      aa: 'center',
      // 每行设定
      columns: [
        {
          prop: 'fieldName',
          label: '字段名',
          w: 350,
          sot: true
        },
        {
          prop: 'fieldDesc',
          label: '子段描述',
          w: 350,
          sot: false
        },
        {
          prop: 'sensitiveRule',
          label: '敏感规则',
          w: 200,
          sot: false
        },
        {
          prop: 'isBind',
          label: '绑定角色',
          // w: 300,
          sot: false,
          isS: true
        }
      ],
      // 获取列表所用参数
      params: {
        pageNumber: 1,
        pageSize: 10
      },
      // 是否正在切换
      switching: false,
      // 
      total: 0,

    };
  },
  watch: {
    // roleId发生变化时，重新判断是否绑定
    roleId: function() {
      this.getOwnList();
    },
    sensitiveList: function() {
      this.judgeBinding();
    },
    sensitiveOfRole: function() {
      this.judgeBinding();
    }
  },
  created() {
    this.getList();
    this.getOwnList();
  },
  methods: {
    getList() {
      let params = this.params;
      getL('sensitive/list/info', params).then(res => {
        this.sensitiveList = res.data;
        this.total = res.recordsTotal;
      });
    },
    // 获取当前角色拥有列表
    getOwnList() {
      return getL('sensitive/list/role-sensitive', {
        roleId: this.roleId
      }).then(res => {
        this.sensitiveOfRole = res.data;
      }).catch(res => {
        if (res.code) this.sensitiveOfRole = res.data;
      });
    },
    // 判断是否绑定
    judgeBinding() {
      let list = this.sensitiveList, roles = this.sensitiveOfRole;
      if (list.length === 0 || roles === null) return;
      // 重置
      list.forEach(l => {
        this.$set(l, 'isBind', false);
      });
      roles.forEach(role => {
        for (let i = 0; i < list.length; i++) {
          if (role.id === list[i].id) {
            list[i].isBind = true;
            break;
          }
        }
      });
    },
    // switch状态改变
    handleStatusChange(row) {
      let { id : sensitiveIds, isBind } = row,
        roleId = this.roleId,
        switching = this.switching,
        param = {
          sensitiveIds,
          roleId
        },
        url = isBind ? 'role/bind/sensitive' : 'role/remove/bind/sensitive';
      // 正在切换中则不能继续发送请求
      if (!switching) {
        this.switching = true;
        switchAppling(url, param).then(res => {
          if (res.code === 200) this.responseSuccess(res.msg);
          else this.responseErr(res.msg);
          this.switching = false;
        });
      }
    },
    // 响应成功
    responseSuccess(msg) {
      this.$modal.msgSuccess(msg);
    },
    // 响应失败
    responseErr(msg) {
      this.$modal.msgError(msg);
    }
  }
}
</script>

<style lang="scss" scoped>
.pagination_in_sensitiveOfPermission {
  margin-bottom: 18px;
}
</style>