<template>
  <div class="app-container">
    <div v-if="roleList.length > 0" class="permissionManagement">
      <div class="layout-left">
        <div class="role-list">
          <h3 class="role-list-title">角色列表</h3>
          <ul class="roles">
            <li class="role" :class="rl.class" v-for="rl in roleList" :key="rl.roleId"
             @click="handleClickRole(rl)" @mouseenter="handleMouseenterRole(rl)" @mouseleave="handleMouseleaveRole"
            >{{rl.roleName}}</li>
          </ul>
        </div>
      </div>
      <div class="layout-right">
        <div class="main-title">
          <h3>{{'用户'}}绑定角色管理</h3>
        </div>
        <el-tabs v-model="activeName">
          <el-tab-pane label="用户" name="first">
            <User :roleId="roleId" />
          </el-tab-pane>
          <el-tab-pane label="菜单" name="second">
            <Menu :roleId="roleId" />
          </el-tab-pane>
          <el-tab-pane label="隐私域" name="third">
            <Sensitive :roleId="roleId" />
          </el-tab-pane>
          <el-tab-pane label="权限集" name="fourth">
            <Permissions :roleId="roleId" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import { getList as getL } from '@/apir/common';
import User from './user';
import Sensitive from './sensitive';
import Permissions from './permissions';
import Menu from './menu';

export default {
  name: 'PermissionManagement',
  components: {
    User,
    Sensitive,
    Permissions,
    Menu
  },
  data() {
    return {
      // 储存原始数据
      rawData: null,
      // 角色列表
      roleList: [],
      // 活跃的tab
      activeName: 'first',
      // 记录当前点击角色列表的roleId
      roleId: ''
    };
  },
  created() {
    this.init(); // 初始化
  },
  methods: {
    init() {
      this.getRoleList();
    },
    // 获取角色列表
    getRoleList() {
      getL('role/list', {pageSize: 1000}).then(res => {
        this.rawData = this.copy(res.data, true); // 拷贝一份以备不时之需
        this.roleList = this.handleRoleList(res.data);
        this.$nextTick(() => {
          this.handleClickRole(this.roleList[0]) // 默认点击第一个
        })
      });
    },
    // 处理角色列表数据
    handleRoleList(d) {
      // 增加active字段控制是否active
      d.forEach(item => {
        item.class = {
          mouseenter: false,
          active: false
        };
      });
      return d;
    },
    // 重置roleactive
    resetRoleActive() {
      let l = this.roleList;
      l.forEach(item => {item.class.active = false;});
    },
    // 点击角色处理
    handleClickRole(r) {
      let c = r.class;
      // 样式active其余inactive
      this.resetRoleActive();
      c.active = true;
      // 改变roleId
      this.roleId = r.roleId;
      // 请求数据

    },
    // 处理角色列表鼠标移入事件
    handleMouseenterRole(r) {
      this.handleMouseleaveRole();
      r.class.mouseenter = true;
    },
    // 处理角色列表鼠标移出事件
    handleMouseleaveRole() {
      let l = this.roleList;
      l.forEach(item => {item.class.mouseenter = false});
    }
  }
}
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>