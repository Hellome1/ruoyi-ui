<template>
  <div class="module_in_permissionManagement">
    <div class="menu_selector">
      <el-select v-model="currentDict" placeholder="请选择">
        <el-option
          v-for="item in menuDict"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
    </div>
    <div class="menu_main">
      <el-table
        :data="menuList"
        style="width: 100%;"
        row-key="menuId"
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
    </div>
  </div>
</template>

<script>
import { getList as getL, switchAppling } from '@/apir/common'
export default {
  name: 'menuInPermission',
  props: {
    roleId: {
      required: true
    }
  },
  data() {
    return {
      // 菜单选项字典
      menuDict: [],
      // 表格的所有textAlign
      aa: 'left',
      // 菜单列表
      menuList: [],
      // 当前菜单
      currentDict: '',
      // 角色拥有菜单
      roleMenus: null,
      // 列设置
      columns: [
        {
          prop: 'menuName',
          label: '菜单名称',
          w: 350,
          sot: false,
          indent: true
        },
        {
          prop: 'menuCode',
          label: '菜单代码',
          w: 400,
          align: 'center',
          sot: false
        },
        {
          prop: 'isBind',
          label: '绑定角色',
          sot: false,
          align: 'center',
          isS: true
        }
      ],
      // 查询参数
      queryParam: {
        pageNumber: 1,
        pageSize: 500
      },
      // 是否正在切换
      switching: false
    };
  },
  watch: {
    currentDict: function(newVal) {
      if (newVal) {
        this.getMenu().then(res => {
          let d = this.arrangeChildren(res.data);
          this.menuList = d;
          this.judgeBinding();
        }).catch(res => {
          this.menuList = res.data;
        });
      }
    },
    roleMenus: function(newMenus) {
      if (newMenus) {
        this.judgeBinding();
      }
    },
    roleId: function(newId) {
      this.getRoleMenus();
      // this.getMenu().then(res => {
      //   let d = this.arrangeChildren(res.data);
      //   this.menuList = d;
      //   this.judgeBinding();
      // }).catch(res => {
      //   this.menuList = res.data;
      // });
    }
  },
  created() {
    this.getList();
    this.getRoleMenus();
  },
  methods: {
    // 获取可选菜单类和角色拥有菜单（绑定菜单）
    getList() {
      getL('menu/dict').then(res => {
        this.menuDict = this.getMenuDict(res.data);
      });
    },
    // 获取roleMenus
    getRoleMenus() {
      getL('menu/list/role', { role: this.roleId }).then(res => {
        this.roleMenus = res.data;
      }).catch(res => {
        if (res.data) this.roleMenus = res.data;
      });
    },
    // 可选菜单类数据转换
    getMenuDict(d) {
      let dict = [];
      // 默认选中第一个
      this.currentDict = d[0].systemCode;
      d.forEach(item => {
        let label = item.systemName,
          value = item.systemCode,
          o = {
            label,
            value
          };
        dict.push(o);
      });
      return dict;
    },
    // 获取当前类下菜单
    getMenu() {
      let roleId = this.roleId,
        param = this.queryParam,
        belongSystemCode = this.currentDict,
        query = Object.assign({
          roleId,
          belongSystemCode
        }, param);
      return getL('menu/list', query);
    },
    // 整理子分支
    arrangeChildren(d) {
      this.rawData = d;
      
      let nd = this.lookUpCBranch(d, '0', 'parentId', 1);

      // let nd = [], cs = [];
      // // 根据menuId大小判断是否有子分支
      // d.forEach(item => {
      //   if (item.parentId != 0) {
      //     cs.push(item);
      //   } else {
      //     item.children = [];
      //     nd.push(item);
      //   }
      // });
      // this.lookupChildrensDeeply(nd, cs);
      
      return nd;
    },
    // 深度查找子分支
    lookupChildrensDeeply(ps, cs) {
      /** 如果某个分支数据不属于当前任何一个父集，则说明还有分支，该数据放入分支池，如果分支数据属于父集则该分支作为子父集 **/
      let nps = [], ncs = [];
      cs.forEach(c => {
        let isp = false;
        for (let i = 0; i < ps.length; i++) {
          if (ps[i].menuId === c.parentId) {
            isp = true;
            ps[i].children ? ps[i].children.push(c) : (ps[i].children = [c]);
            break;
          }
        }
        if (isp) {
          nps.push(c);
        } else {
          ncs.push(c);
        }
      });
      // 如果分支池不在变化则说明有无效数据，不必再执行
      if (ncs.length && ps.length && cs.length != ncs.length) this.lookupChildrensDeeply(nps, ncs);
    },
    // 深度查找子分支 2
    lookUpCBranch(ds, target, k, dc) {
      dc++;
      // console.log(target, dc);
      let ps = [], cs = [];
      ds.forEach(d => {
        if (target === '0') {
          if (d[k] === target) ps.push(d);
          else cs.push(d);
        } else {
          if (d.exist) ps.push(d);
          else cs.push(d);
        }
      });
      if (ps.length === 0) return; // 说明上一个循环全都不存在，分支断裂，结束--
      cs.forEach(c => {
        let exist = false;
        for (let i = 0; i < ps.length; i++) {
          if (c['parentId'] === ps[i].menuId) {
            ps[i].children ? ps[i].children.push(c) : (ps[i].children = [c]);
            exist = true;
            break;
          }
        }
        if (exist) c.exist = true;
        else c.exist = false;
      });
      cs.forEach(c => {
        if (!c.exist && dc < 5) this.lookUpCBranch(cs, true, true, dc);
      });
      if (target === '0') {
        return ps;
      }
    },
    // 判断当前角色绑定的菜单
    judgeBinding() {
      let rawData = this.rawData,
        roleMenus = this.roleMenus;

      // 数据都存在
      if (roleMenus && rawData) {
        // 重置
        rawData.forEach(item => {
          this.$set(item, 'isBind', false);
        });
        roleMenus.forEach(rm => {
          for (let i = 0; i < rawData.length; i++) {
            if (rm.menuId === rawData[i].menuId) {
              this.$set(rawData[i], 'isBind', true);
              // rawData[i].isBind = true;
              break;
            }
          }
        });
      }
    },
    // 操作状态改变
    handleStatusChange(row) {
      let url = row.isBind ? 'role/bind/menu' : 'role/remove/bind/menu' ;
      switchAppling(url, {
        roleId: this.roleId,
        menuIds: row.menuId
      }).then(res => {
        if (res.code === 200) {
          this.$modal.msgSuccess('修改成功');
        }
      });
    }
  }
}
</script>

<style lang="scss">
@import './index.scss';
</style>