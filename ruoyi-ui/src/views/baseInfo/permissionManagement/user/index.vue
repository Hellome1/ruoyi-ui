<template>
  <div class="module_in_permissionManagement">
    <el-table
      :data="userList"
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
  </div>
</template>

<script>
import { getList as getL, switchAppling } from '@/apir/common';

export default {
  name: 'userInPermission',
  props: {
    roleId: {
      required: true
    }
  },
  data() {
    return {
      // 用户列表
      userList: [],
      // 所有表的align
      aa: 'center',
      // 每行设定
      columns: [
        {
          prop: 'account',
          label: '用户账号',
          w: 280,
          sot: false
        },
        {
          prop: 'username',
          label: '用户姓名',
          w: 280,
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
      switching: false
    };
  },
  watch: {
    // roleId发生变化时，重新判断是否绑定
    roleId: function() {
        this.userList = this.handleData(this.userList);
    }
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      let params = this.params;
      getL('user/list', params).then(res => {
        this.userList = this.handleData(res.data);
      });
    },
    // 处理数据
    handleData(d) {
      d.forEach(item => {
        item.isBind = this.isBind(item.roles);
      });
      return d;
    },
    // 判断是否绑定当前角色
    isBind(rls) {
      let isB = false;
      rls.forEach(rl => {
        if (rl.roleId === this.roleId) isB = true;
      });
      return isB;
    },
    // switch状态改变
    handleStatusChange(row) {
      let { userId, isBind } = row,
        roleIds = this.roleId,
        switching = this.switching,
        param = {
          userId,
          roleIds
        },
        url = isBind ? 'user/bind/role' : 'user/remove/bind/role';
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
      this.getList();
    },
    // 响应失败
    responseErr(msg) {
      this.$modal.msgError(msg);
      this.getList();
    }
  }
}
</script>

<style lang="scss" scoped>

</style>