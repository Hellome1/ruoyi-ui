<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
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

    <el-table v-loading="loading" :data="sysList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <template v-for="dtc in dtcs">
        <el-table-column :key="dtc.val" v-if="!dtc.isS" :label="dtc.cla" :prop="dtc.val" :width="dtc.w" :show-overflow-tooltip="dtc.sot" align="center"></el-table-column>
        <el-table-column :key="dtc.val" v-else :label="dtc.cla" align="center" :width="dtc.w">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row[dtc.val]"
              active-value="1"
              inactive-value="0"
              @change="handleStatusChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
      </template>
      <!-- <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="配置描述" prop="systemConfigDesc" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="配置内容" prop="systemConfigValue" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="备注" prop="systemConfigRemark" width="450" /> -->
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

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 修改新增对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <template v-for="dtc in dtcs">
          <el-form-item v-if="!dtc.excModal" :key="dtc.val" :label="dtc.cla" :prop="dtc.val">
            <template v-if="!dtc.sele">
              <el-input v-model="form[dtc.val]" :placeholder="'请输入' + dtc.cla" />
            </template>
            <template v-else>
              <el-select v-model="form[dtc.formSele]" placeholder="请选择">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </template>
          </el-form-item>
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
import { getList as getSysList, setList as setSysList, addList as addSysList, deleteList as deleteSysList, switchAppling } from '@/apir/common';

export default {
  name: "Role",
  // dicts: ['sys_normal_disable'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // id的key
      idk: 'id',
      // 数据字段和配置
      dtcs: [
        {
          cla: '系统名称',
          val: 'systemName',
          sot: false,
          w: 150,
          rule: true
        },
        {
          cla: '类型代码',
          val: 'typeCode',
          sot: false,
          w: 150,
          rule: true
        },
        {
          cla: '系统IP',
          val: 'webLocationIp',
          sot: false,
          w: 250,
          rule: true
        },
        {
          cla: '创建人',
          val: 'createUser',
          sot: false,
          w: 150
        },
        {
          cla: '默认角色',
          val: 'roleName',
          sot: false,
          w: 150,
          sele: true,
          formSele: 'roleId'
        },
        {
          cla: '激活状态',
          val: 'status',
          sot: false,
          w: 150,
          isS: true,
          excModal: true
        }
      ],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 角色表格数据
      sysList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        //
      },
      formKeys: {
        systemName: true,
        typeCode: true,
        webLocationIp: true,
        createUser: true,
        status: '1',
        roleId: true,
      },
      options: []
    };
  },
  created() {
    this.addRule();
    this.getList();
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
          r.message = d.cla + '不能为空';
          rules[d.val] = r;
        }
      });
      this.rules = rules;
    },
    /** 查询角色列表 */
    getList() {
      this.loading = true;
      this.getSeleL();
      getSysList('system/list', {
        pageNumber: this.queryParams.pageNum,
        pageSize: this.queryParams.pageSize
      }).then(res => {
        // console.log({...res});
        this.rawData = this.copy(res.data, true); // 储存原始数据供修改表单显示
        this.sysList = this.handleNullInData(res.data);
        this.total = res.recordsTotal;
        this.loading = false;
      }).catch((err) => {
        this.loading = false;
        this.total = 0;
        if (err.recordsTotal === 0) this.sysList = [];
      });
    },
    // 修改列表数据的null字段
    handleNullInData(data) {
      data.forEach(item => {
        for (let k in item) {
          if (item[k] === null || item[k] === '') {
            item[k] = '-'; // 用'-'代替
          }
        }
      });
      return data;
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item[this.idk])
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
    // 滑块操作
    handleStatusChange(row) {
      let par = {
        typeCode: true,
        webLocationIp: true,
        systemName: true,
        status: true,
      };
      for (let k in par) {
        par[k] = row[k];
      }
      par[this.idk] = row[this.idk];
      switchAppling('system/update', par).then(res => {
        if (res.code === 200) this.responseSuccess(res);
      }).catch(err => {
        this.getList();
      });
    },
    // 重置表格
    reset() {
      let form = this.form;
      for (let k in form) {
        form[k] = '';
      }
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加";
    },
    // 获取供选择的表单
    getSeleL(target, selectedName) {
      getSysList('role/list').then(res => {
        let options = [],
          t = {
            label: 'roleName',
            value: 'roleId'
          };
        res.data instanceof Array 
          && res.data.forEach(item => {
            let o = new Object();
            for (let k in t) {
              o[k] = item[t[k]];
            }
            options.push(o);
            if (item.roleName === selectedName) r = item[target];
          });
        this.options = options;
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      let transed = this.transToRaw(row, this.idk);
      this.title = "修改";
      let keys = this.formKeys;
      keys[this.idk] = true;
      let form = {};
      for (let k in keys) {
        if (transed.hasOwnProperty(k)) form[k] = transed[k];
        else form[k] = this.getAnother(transed.roleName);
      }
      this.form = form;
      this.open = true;
    },
    // 获取select中的另一个值
    getAnother(condition) {
      let ops = this.options;
      for (let k in ops) {
        let op = ops[k];
        for (let key in op) {
          if (op[key] === condition) return op['value'];
        }
      }
      return null;
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.title === "修改"){
            // 修改
            setSysList('system/update', this.form).then(res => {
              if (res.code === 200) this.responseSuccess(res);
              else this.responseErr(res);
            });
          } else {
            // 新增
            // this.form[this.idk] = "";
            this.formCheckout();
            addSysList('system', this.form).then(res => {
              if (res.code === 200) this.responseSuccess(res);
              else this.responseErr(res);
            });
          }
        }
      });
    },
    // 表单校验
    formCheckout() {
      let form = this.form,
        fmk = this.formKeys;
      for (let k in fmk) {
        if (!form.hasOwnProperty(k)) {
          form[k] = fmk[k]
        }
      }
    },
    // 请求成功响应
    responseSuccess(res) {
      this.getList();
      this.open = false;
      this.$modal.msgSuccess(res.msg);
    },
    // 请求不成功时响应
    responseErr(res) {
      this.$modal.msgWarning(res.msg);
      this.open = false;
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      let ids = this.ids;
      const roleIds = row[this.idk] || ids;
      let param = {};
      param[this.idk] = row[this.idk] || ids.join('|')
      this.$modal.confirm('是否确认删除编号为"' + roleIds + '"的数据？')
      .then(function() {
        return deleteSysList('system/delete', param);
      }).then(res => {
        if (res.code === 200) this.responseSuccess(res);
        else this.responseErr(res);
      }).catch(() => {});
    }
  }
};
</script>