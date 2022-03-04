<template>
  <div class="table_in_menuManagement">
    <div class="menu_main">
      <el-row :gutter="10" class="mb8" style="margin-right: 0;">
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
            v-hasPermi="['system:role:add']"
          >新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="danger"
            plain
            icon="el-icon-delete"
            size="mini"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['system:role:remove']"
          >删除</el-button>
        </el-col>
        <right-toolbar :hiddenSearch="true" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table
        :data="menuList"
        style="width: 100%;"
        @selection-change="handleSelectionChange"
        row-key="menuId"
        default-expand-all
        :tree-props="{children: 'children'}"
      >
        <el-table-column type="selection" width="55"></el-table-column>
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
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:role:edit']"
            >修改</el-button>
            <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:role:remove']"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog :title="title" :visible.sync="open" width="540px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <template v-for="dtc in dtcs">
          <template v-if="!dtc.excModal && !dtc.whenIframe">
             <el-form-item :key="dtc.prop" :label="dtc.label" :prop="dtc.prop">
              <template v-if="dtc.isS">
                <el-switch
                  v-model="form[dtc.prop]"
                  active-value="1"
                  inactive-value="0"
                ></el-switch>
              </template>
              <template v-else-if="!dtc.sele">
                <el-input v-model="form[dtc.prop]" :placeholder="dtc.disabled ? '' : '请输入' + dtc.label" :disabled="dtc.disabled" :type="dtc.prop === 'password' ? 'password' : 'text'"/>
              </template>
              <template v-else>
                <el-select :disabled="dtc.disabled" v-model="form[dtc.prop]" placeholder="请选择" :iframeSwitch="dtc.prop === 'loadType' ? switchToIframe() : null">
                  <el-option
                    v-for="item in dtc.options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </template>
            </el-form-item>
          </template>
          <template v-else-if="!dtc.excModal && isIframe">
            <el-form-item :key="dtc.prop" :label="dtc.label" :prop="dtc.prop">
              <template v-if="dtc.prop === 'stationaryParams'">
                <el-input v-model="formJoint[dtc.prop]" :placeholder="'请输入' + dtc.label" type="text"/>
              </template>
              <template v-else>
                <el-input v-model="formJoint[dtc.prop + '_1']" type="text" style="width: 150px;"/>
                =
                <el-select v-model="formJoint[dtc.prop + '_2']">
                  <el-option
                    v-for="item in dtc.options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
                <span class="numberSelector">
                  <i class="fa fa-plus" @click="formJointNum++"></i>
                  <i class="fa fa-minus" @click="formJointNum > 0 ? formJointNum-- : null"></i>
                </span>
                <div class="addableArea">
                  <span v-for="num in formJointNum" :key="num">
                    <el-input v-model="formJointDouble[num + '_1']" type="text" style="width: 150px;"/>
                    =
                    <el-select v-model="formJointDouble[num + '_2']">
                      <el-option
                        v-for="item in dtc.options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>
                  </span>
                </div>
              </template>
            </el-form-item>
          </template>
        </template>
        <!-- <el-form-item label="配置描述" prop="systemConfigDesc">
          <el-input v-model="form.systemConfigDesc" placeholder="请输入配置描述" />
        </el-form-item>
        <el-form-item label="配置内容" prop="systemConfigValue">
          <el-input v-model="form.systemConfigValue" placeholder="请输入配置内容" />
        </el-form-item>
        <el-form-item label="备注" prop="systemConfigRemark">
          <el-input v-model="form.systemConfigRemark" placeholder="请输入备注" />
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getList as getL, setList } from '@/apir/common';
export default {
  name: 'menuInPermission',
  props: {
    menuCode: {
      type: String,
      required: true
    },
    dict: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      id: '',
      ids: [],
      idk: 'menuId',
      // 表格的所有textAlign
      aa: 'center',
      // 菜单列表
      menuList: [],
      /* eldialog */
      open: false,
      title: '',
      rules: {},
      form: {},
      /* eldialog---end */
      multiple: true,
      // 列设置
      columns: [
        {
          prop: 'menuName',
          label: '菜单名称',
          align: 'left',
          w: 200,
          sot: false,
          indent: true
        },
        {
          prop: 'menuCode',
          label: '菜单代码',
          w: 100,
          align: 'center',
          sot: true
        },
        {
          prop: 'menuType',
          label: '菜单类型',
          w: 90,
          sot: false,
          align: 'center'
        },
        {
          prop: 'parentName',
          label: '父级菜单',
          w: 100,
          sot: true,
          align: 'center'
        },
        {
          prop: 'menuIcon',
          label: '菜单图标',
          w: 110,
          sot: true,
          align: 'center'
        },
        {
          prop: 'loadType',
          label: '加载类型',
          w: 90,
          sot: false,
          align: 'center'
        },
        {
          prop: 'menuHref',
          label: '链接地址',
          w: 250,
          sot: false,
          align: 'center'
        },
        {
          prop: 'menuOrder',
          label: '菜单排序',
          w: 90,
          sot: true,
          align: 'center'
        }
      ],
      isIframe: false,
      formJoint: {},
      formJointNum: 0,
      formJointDouble: {},
      // 弹出框
      dtcs: [
        {
          prop: 'menuName',
          label: '菜单名称',
          rule: true
        },
        {
          prop: 'menuCode',
          label: '菜单代码',
        },
        {
          prop: 'menuType',
          label: '菜单类型',
          rule: true,
          sele: true,
          options: [
            {
              value: '菜单',
              label: '菜单'
            },
            {
              value: '按钮',
              label: '按钮'
            }
          ]
        },
        {
          prop: 'parentId',
          label: '父级菜单',
          sele: true,
          options: []
        },
        {
          prop: 'menuIcon',
          label: '菜单图标'
        },
        {
          prop: 'loadType',
          label: '加载类型',
          rule: true,
          sele: true,
          options: [
            {
              value: 'load',
              label: 'load'
            },
            {
              value: 'iframe',
              label: 'iframe'
            }
          ]
        },
        {
          whenIframe: true,
          prop: 'stationaryParams',
          label: '固定参数'
        },
        {
          whenIframe: true,
          prop: 'setedParams',
          label: '设置参数',
          options: setting.options
        },
        {
          prop: 'menuHref',
          label: '链接地址',
          rule: true
        },
        {
          prop: 'belongSystemCode',
          label: '所属系统',
          rule: true,
          sele: true,
          options: this.dict,
          disabled: true
        },
        {
          prop: 'menuOrder',
          label: '菜单顺序'
        },
        {
          prop: 'perms',
          label: '菜单权限'
        },
        {
          prop: 'createUser',
          label: '创建人',
          disabled: true
        }
      ],
      // 表格格式校验
      formLint: {
        menuCode: null,
        menuName: null,
        menuHref: null,
        menuIcon: null,
        menuOrder: null,
        perms: null,
        createUserCode: null,
        loadType: null,
        menuType: null,
        belongSystem: null,
        parentId: null
      }
    };
  },
  watch: {
    menuCode: function(n) {
      this.getList();
    },
    form: function(n) {
      console.log(n);
    }
  },
  created() {
    this.getList();
    this.transformProps();
    this.addRule();
  },
  methods: {
    // 添加校验规则
    addRule() {
      let rules = {},
        rule = {required: true, message: "", trigger: "blur"},
        dtcs = this.dtcs;
      dtcs.forEach(d => {
        if (d.rule && !d.excModal) {
          let r = this.copy(rule);
          r.message = d.label + '不能为空';
          rules[d.prop] = r;
        }
      });
      this.rules = rules;
    },
    // 对props中的需要转化的数据进行转化
    transformProps() {
      let dict = this.dict;
      dict.forEach(d => {
        d.code = d.code.toLowerCase ? d.code.toLowerCase() : d.code;
        d.value = d.code;
        d.label = d.name;
      });
    },
    // 获取菜单列表
    getList() {
      getL('menu/list', {
        belongSystemCode: this.menuCode
      }).then(res => {
        this.rawMenuList = this.copy(res.data, true);
        this.addMenuOption(this.rawMenuList);
        this.menuList = this.arrangeChildren(res.data);
      });
    },
    // 添加新增修改对话框里的菜单选项
    addMenuOption(rl) {
      let ops = rl.map(r => {
        return {
          value: r.menuId,
          label: r.menuName
        }
      });
      this.dtcs.forEach(dtc => {
        if (dtc.prop === 'parentId') {
          dtc.options = ops;
        }
      });
    },
    // 整理子分支
    arrangeChildren(d) {
      this.rawData = d;
      // 固定参数和设置的参数
      d.forEach(di => {
        let querystring = di.menuHref ? di.menuHref.split('?')[1] : '';
        if (querystring) {
          let qsa = querystring.split('&');
          let stationaryParams = '';
          let setedParams = '';
          qsa.forEach(qs => {
            let n1 = qs.indexOf('{'), n2 = qs.indexOf('}');
            if (n1 > -1 && n2 > -1 && n1 < n2) {
              setedParams += '&' + qs;
            } else {
              stationaryParams += '&' + qs;
            }
          });
          if (stationaryParams.length > 0) {
            stationaryParams = stationaryParams.substring(1);
            di.stationaryParams = stationaryParams;
          }
          if (setedParams.length > 0) {
            setedParams = setedParams.substring(1);
            di.setedParams = setedParams;
          }
        }
      });
      let nd = this.lookUpCBranch(d, '0', 'parentId', 1);
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
    /* 选中数据 */
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item[this.idk]);
      this.single = selection.length!=1;
      this.multiple = !selection.length;
    },
    /* 修改按钮 */
    handleUpdate(row) {
      this.reset();
      this.rowToJoint(row); // row里数据取到对应joint
      this.open = true;
      this.title = '修改';
      this.titleCode = 'XG';
      let form = {};
      this.id = row[this.idk];
      row.belongSystemCode = row.belongSystemCode.toLowerCase ? row.belongSystemCode.toLowerCase() : row.belongSystemCode;
      this.dtcs.forEach(dtc => {
        if (dtc.prop === 'parentId' && row.parentId === '0') return;
        if (dtc.prop === 'menuHref') {
          form.menuHref = row.menuHref ? row.menuHref.split('?')[0] : '';
          return;
        }
        if (!dtc.whenIframe) {
          form[dtc.prop] = row[dtc.prop];
        }
      });
      this.form = form;
    },
    /* 删除按钮 */
    handleDelete(row) {
      let menuIds = row[this.idk] || this.ids.join('|');
      this.$modal.confirm('是否删除编号为' + menuIds + '的数据？')
      .then(function() {
        return (setList('menu/delete/', {
          menuIds
        }));
      }).then(res => {
        this.responseBox(res);
      });
    },
    // 重置
    reset() {
      this.id = '';
      this.form = {};
      this.formJoint = {};
      this.formJointNum = 0;
      this.formJointDouble = {};
    },
    // 锁死所属系统
    lockBelongSystem() {
      this.form.belongSystemCode = this.menuCode.toLowerCase();
    },
    /* 新增 */
    handleAdd() {
      this.reset();
      this.lockBelongSystem();
      this.open = true;
      this.title = '新增';
      this.titleCode = 'XZ';
    },
    getLintedParam() {
      let params = {}, form = this.form, lint = this.formLint;
      for (let k in form) {
        if (k === 'belongSystemCode') {
          let id;
          this.dict.forEach(d => {
            if (d.value === form[k]) id = d.id;
          });
          params['belongSystem'] = id;
        } else if (k === 'createUser') {} else {
          params[k] = form[k];
        }
      }
      for (let k in lint) {
        if (!params.hasOwnProperty(k)) params[k] = '';
      }
      return params;
    },
    /* dialog确定 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.titleCode === 'XG') {
            let params = this.getLintedParam();
            params[this.idk] = this.id;
            if (this.isIframe) this.mergeIframeParams(params);
            console.log(params);
            setList('menu/update', params).then(res => { this.responseBox(res); });
          } else { 
            let params = this.getLintedParam();
            if (this.isIframe) this.mergeIframeParams(params);
            console.log(params);
            setList('menu', params).then(res => { this.responseBox(res); });
          }
        }
      })
    },
    /* dialog取消 */
    cancel() {
      this.reset();
      this.open = false;
    },
    // 响应消息
    responseBox(res) {
      if (res.code === 200) {
        this.$modal.msgSuccess(res.msg);
        this.open = false;
        this.getList();
      } else {
        this.$modal.msgError(res.msg);
        this.open = false;
      }
    },
    rowToJoint(row) {
      if (row.loadType === 'iframe') {
        let sP = row.stationaryParams, setedP = row.setedParams, formJoint = {}, formJointDouble = {};
        if (sP) {
          formJoint.stationaryParams = sP;
        }
        if (setedP) {
          let setedArr = setedP.split('&');
          for (let i = 0; i < setedArr.length; i++) {
            if (i === 0) {
              let nameValue = setedArr[0], name = nameValue.split('=')[0], value = nameValue.split('=')[1];
              formJoint.setedParams_1 = name;
              formJoint.setedParams_2 = value;
            } else {
              let nameValue = setedArr[i], name = nameValue.split('=')[0], value = nameValue.split('=')[1];
              formJointDouble[i + '_1'] = name;
              formJointDouble[i + '_2'] = value;
              this.formJointNum++;
            }
          }
        }
        this.formJoint = formJoint;
        this.formJointDouble = formJointDouble;
      }
    },
    mergeIframeParams(params) {
      let num = 0, fj = this.formJoint, fjd = this.formJointDouble, fjn = this.formJointNum, querystring = '';
      console.log(fj, 'fj');
      console.log(fjd, 'jfd');
      console.log(fjn, 'fjn');
      for (let k in fj) { num++ };
      num += fjn;
      if (num) {
        for (let k in fj) {
          if (k === 'stationaryParams') querystring += '&' + fj[k];
          else if (k.indexOf('_1') > -1) {
            let name = fj[k], value = '', qs = '';
            for (let kd in fj) {
              if (kd.indexOf('_2') > -1) value = fj[kd];
            }
            qs = name + '=' + value;
            querystring += '&' + qs;
          }
        }
        for (let k in fjd) {
          if (k.indexOf('_1') > -1) {
            let key = k.split('_')[0], name = fjd[k], value = '', qs = '';
            for (let kd in fjd) {
              if (k != kd && kd.split('_')[0] === key) value = fjd[kd];
            }
            qs = name + '=' + value;
            querystring += '&' + qs;
          }
        }
      }
      if (querystring.length > 0) {
        querystring = querystring.substring(1);
        params.menuHref += '?' + querystring;
      }
      return params;
    },
    switchToIframe() {
      console.log(this.form.loadType);
      if (this.form.loadType === 'iframe') {
        this.isIframe = true;
      } else {
        this.isIframe = false;
      }
    }
  }
}
</script>

<style lang="scss">
@import './index.scss';
</style>