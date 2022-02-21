<template>
  <div class="app-container">
    <div v-if="roleList.length > 0" class="permissionManagement">
      <div class="role-select-container">
        <div class="active-role-display" :class="showRoles ? 'pick-up' : ''" @click="listRoles">
          <span class="active-role">{{activeRole}}</span>
          <span class="icon-arrow"></span>
        </div>
        <div class="role-select" :class="showRoles ? '' : 'roles-list-folded'" v-show="showRoles">
          <div class="role-list">
            <ul class="roles">
              <li class="role" :class="rl.class" v-for="rl in roleList" :key="rl.roleId"
              @click="handleClickRole(rl)" @mouseenter="handleMouseenterRole(rl)" @mouseleave="handleMouseleaveRole"
              >{{rl.roleName}}</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="layout-right">
        <div class="main-title">
          <h3>{{title}}绑定角色管理</h3>
        </div>
        <el-tabs v-model="activeName" v-if="roleId">
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
      // 活跃角色
      activeRole: '',
      // 活跃的tab
      activeName: '',
      // 记录当前点击角色列表的roleId
      roleId: '',
      // 标题数组
      titles: ['用户', '菜单', '隐私域', '权限集'],
      // 活跃标题
      title: '',
      // 展示角色列表
      showRoles: true
    };
  },
  watch: {
    activeName: function(n, o) {
      let title = '', titles = this.titles;
      switch (n) {
        case 'first':
          title = titles[0];
          break;
      
        case 'second':
          title = titles[1];
          break;
      
        case 'third':
          title = titles[2];
          break;
      
        case 'fourth':
          title = titles[3];
          break;
      
        default:
          break;
      }
      this.title = title;
    }
  },
  created() {
    this.init(); // 初始化
  },
  methods: {
    init() {
      this.activeName = 'first';
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
      // 改变活跃角色
      this.activeRole = r.roleName;
      this.showRoles = false;
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
    },
    listRoles() {
      this.showRoles = !this.showRoles;
    }
  }
}
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>