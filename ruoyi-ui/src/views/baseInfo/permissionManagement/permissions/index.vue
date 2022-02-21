<template>
  <div class="module_in_permissionManagement">
    <div class="perms_tools_container">
      <div class="perms_selector">
        <el-select v-model="authTypeId" placeholder="请选择">
          <el-option
            v-for="item in permsDict"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </div>
      <Search @search="handleSearch"/>
    </div>

    <div class="perms_main">
      <el-table
        :data="permsList"
        style="width: 100%;"
        row-key="permsId"
        default-expand-all
        :tree-props="{children: 'children'}"
      >
        <template v-for="c in columns">
          <el-table-column v-if="!c.isS" :key="c.prop" :prop="c.prop" :label="c.label" :width="c.w"
           :show-overflow-tooltip="c.sot"
           :align="c.align || aa" :class-name="c.indent ? 'indent_module_in_permissionManagement' : ''"
          ></el-table-column>
          <el-table-column v-if="c.isS" :key="c.prop" :label="c.label" :width="c.w" :align="c.align || aa" 
          >
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
        class="pagination_in_permsOfPermission"
        v-show="total>0"
        :total="total"
        :page.sync="params.pageNumber"
        :limit.sync="params.pageSize"
        @pagination="getPerms"
      />
    </div>
  </div>
</template>

<script>
import { getList as getL, switchAppling } from '@/apir/common'
import Search from './search.vue';
export default {
  name: 'permsInPermission',
  components: {
    Search
  },
  props: {
    roleId: {
      required: true
    }
  },
  data() {
    return {
      // 权限选项字典
      permsDict: [],
      // 表格的所有textAlign
      aa: 'center',
      // 权限列表
      permsList: [],
      // 当前权限Id
      authTypeId: '',
      // 当前权限
      authTypeName: '',
      // 角色拥有权限
      rolePerms: null,
      // 列设置
      columns: [
        {
          prop: 'authName',
          label: '权限名称',
          w: 600,
          sot: false,
          indent: true
        },
        {
          prop: 'isBind',
          label: '绑定角色',
          sot: false,
          isS: true
        }
      ],
      // 查询参数
      params: {
        pageNumber: 1,
        pageSize: 10
      },
      // 搜索时添加的参数
      authName: '',
      // 数据总数
      total: 0,
      // 是否正在切换
      switching: false
    };
  },
  watch: {
    authTypeId: function(newVal) {
      if (newVal) {
        this.setAuthTypeName();
        this.getPerms();
        this.getRoleHas();
      }
    },
    rolePerms: function(newPerms) {
      if (newPerms) {
        this.judgeBinding();
      }
    },
    roleId: function() {
      this.getRoleHas();
    }
  },
  created() {
    this.getList();
  },
  methods: {
    // 获取可选权限类和角色拥有权限（绑定权限）
    getList() {
      getL('auth/type').then(res => {
        this.permsDict = this.getAuthType(res.data);
      });
    },
    // 获取rolePerms
    getRoleHas() {
      let authTypeName = this.authTypeName,
        roleId = this.roleId;
      getL('auth/role', { 
        roleId,
        authTypeName
       }).then(res => {
        this.rolePerms = res.data;
      }).catch(res => {
        if (res.data) this.rolePerms = res.data;
      });
    },
    // 可选权限类数据转换
    getAuthType(d) {
      let dict = [];
      // 默认选中第一个
      this.authTypeId = d[0].authTypeId;
      d.forEach(item => {
        let label = item.authTypeName,
          value = item.authTypeId,
          o = {
            label,
            value
          };
        dict.push(o);
      });
      return dict;
    },
    setAuthTypeName() {
      let dict = this.permsDict,
        id = this.authTypeId;
      dict.forEach(d => {
        if (d.value === id) {
          this.authTypeName = d.label;
        }
      });
    },
    // 获取当前类下权限
    getPerms() {
      let authName = this.authName,
        param = authName ? Object.assign({}, this.params, {authName}) : this.params;
      getL('auth', param).then(res => {
        this.permsList = res.data;
        this.total = res.recordsTotal;
        this.judgeBinding();
      }).catch(res => {
        this.permsList = res.data;
      });
    },
    // 判断当前角色绑定的权限
    judgeBinding() {
      let permsList = this.permsList,
        rolePerms = this.rolePerms;

      // 数据都存在
      if (rolePerms && permsList) {
        // 重置
        permsList.forEach(item => {
          this.$set(item, 'isBind', false);
        });
        rolePerms.forEach(rm => {
          for (let i = 0; i < permsList.length; i++) {
            if (rm.authId === permsList[i].authId) {
              this.$set(permsList[i], 'isBind', true);
              // permsList[i].isBind = true;
              break;
            }
          }
        });
      }
    },
    // 操作状态改变
    handleStatusChange(row) {
      let url = row.isBind ? 'auth/auth/role' : 'auth/auth/role/unbind',
        { authId } = row;
      switchAppling(url, {
        roleId: this.roleId,
        authId
      }).then(res => {
        if (res.code === 200) {
          this.$modal.msgSuccess('修改成功');
        }
      });
    },
    handleSearch(context) {
      this.authName = context;
      this.getPerms();
    }
  }
}
</script>

<style lang="scss">
@import './index.scss';
</style>