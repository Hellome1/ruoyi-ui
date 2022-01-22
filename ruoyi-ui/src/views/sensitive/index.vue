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

    <el-table v-loading="loading" :data="ruleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="字段名" prop="fieldName" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="字段描述" prop="fieldDesc" :show-overflow-tooltip="true" width="200" />
      <el-table-column label="敏感规则" prop="ruleDesc" :show-overflow-tooltip="true" width="300" />
      <el-table-column label="敏感类型" prop="sensitiveTypeName" width="100" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope" v-if="scope.row.roleId !== 1">
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
          <el-dropdown size="mini" @command="(command) => handleCommand(command, scope.row)" v-hasPermi="['system:role:edit']">
            <span class="el-dropdown-link">
              <i class="el-icon-d-arrow-right el-icon--right"></i>更多
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="handleDataScope" icon="el-icon-circle-check"
                v-hasPermi="['system:role:edit']">权限管理</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
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

    <!-- 修改规格对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <template v-if="title === '添加规则'">
        <el-form ref="form" :model="form" :rules="rules" label-width="100px">
          <el-form-item label="字段名" prop="fieldName">
            <el-input v-model="form.fieldName" placeholder="请输入字段名" />
          </el-form-item>
          <el-form-item label="字段描述" prop="fieldDesc">
            <el-input v-model="form.fieldDesc" placeholder="请输入字段描述" />
          </el-form-item>
          <el-form-item label="敏感规则" prop="ruleDesc">
            <el-select v-model="form.ruleDesc" placeholder="请选择">
              <el-option
                v-for="item in optionsDesc"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="敏感类型" prop="sensitiveType">
            <el-select v-model="form.sensitiveType" placeholder="请选择">
              <el-option
                v-for="item in optionsDict"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </template>
      <template v-else>
        <el-form ref="form" :model="form" :rules="rules" label-width="100px">
          <el-form-item label="字段名" prop="fieldName">
            <el-input v-model="form.fieldName" placeholder="请输入字段名" />
          </el-form-item>
          <el-form-item label="字段描述" prop="fieldDesc">
            <el-input v-model="form.fieldDesc" placeholder="请输入字段描述" />
          </el-form-item>
          <el-form-item label="敏感规则" prop="ruleDesc">
            <el-select v-model="form.ruleDesc" placeholder="请选择">
              <el-option
                v-for="item in optionsDesc"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </template>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getSensitiveList, setSensitiveList, getDict, addSensitiveRule, deleteSensitiveRule } from '@/apir/sensitive/sensitiveList';
import { getRule } from '@/apir/sensitive/sensitiveRule';

export default {
  name: "Role",
  dicts: ['sys_normal_disable'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 规则表格数据
      ruleList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      // 部门列表
      deptOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        fieldName: [
          { required: true, message: "字段名称不能为空", trigger: "blur" }
        ],
        fieldDesc: [
          { required: true, message: "字段描述不能为空", trigger: "blur" }
        ],
        ruleDesc: [
          { required: true, message: "敏感规则不能为空", trigger: "blur" }
        ],
        sensitiveType: [
          { required: true, message: "敏感类型不能为空", trigger: "blur" }
        ]
      },
      optionsDesc: [], // 敏感规则
      optionsDict: []  // 敏感类型
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询规则列表 */
    getList() {
      this.loading = true;
      getSensitiveList(this.queryParams.pageNum, this.queryParams.pageSize).then(res => {
        // console.log({...res});
        this.ruleList = res.data;
        this.total = res.recordsTotal;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
    handleDataScope(row) {
      // 跳转到权限管理
      console.log(row);
    },
    // 更多操作触发
    handleCommand(command, row) {
      switch (command) {
        case "handleDataScope":
          this.handleDataScope(row);
          break;
        default:
          break;
      }
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
      this.title = "添加规则";
      getRule().then(res => {
        let options = [];
        res.data.forEach(item => {
          let option = {
            value: item.id,
            label: item.ruleDesc
          };
          options.push(option);
        });
        this.optionsDesc = options;
      });
      getDict().then(res => {
        let options = [];
        res.data.forEach(item => {
          let option = {
            value: item.sensitiveTypeId,
            label: item.sensitiveTypeName
          };
          options.push(option);
        });
        this.optionsDict = options;
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.title = "修改规则";
      let { fieldName, fieldDesc, ruleDesc, id, sensitiveRule } = row;
      console.log(row);
      this.open = true;
      this.form = {
        fieldName,
        fieldDesc,
        ruleDesc,
        id,
        sensitiveRule
      };
      getRule().then(res => {
        let options = [];
        res.data.forEach(item => {
          let option = {
            value: item.id,
            label: item.ruleDesc
          };
          options.push(option);
        });
        this.optionsDesc = options;
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.title === "修改规则"){
            let excludeName = "ruleDesc";
            let param = {};
            let { sensitiveRule, ruleDesc } = this.form;
            // let { sensitiveRule, id, fieldName, fieldDesc } = this.form;
            let num = parseInt(ruleDesc);
            this.form.sensitiveRule = isNaN(num) ? sensitiveRule : num;
            for (let k in this.form) {
              if (k != excludeName) {
                param[k] = this.form[k];
              }
            }
            setSensitiveList(param).then(res => {
              if (res.code === 200) {
                this.$modal.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            // 新增规则
            let param = {},
                excludeName = 'ruleDesc';
            this.form.sensitiveRule = this.form.ruleDesc;
            for (let k in this.form) {
              if (k != excludeName) {
                param[k] = this.form[k];
              }
            }
            addSensitiveRule(param).then(res => {
              if (res.code === 200) {
                this.$modal.msgSuccess("新增成功");
                this.open = false;
                this.getList();
              }
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      let ids = this.ids;
      const roleIds = row.id || ids;
      let param = {
        ids: row.id || ids.join('|')
      };
      this.$modal.confirm('是否确认删除编号为"' + roleIds + '"的数据？')
      .then(function() {
        return deleteSensitiveRule(param);
      }).then(res => {
        if (res.code === 200) {
          this.$modal.msgSuccess('删除成功');
          this.getList();
        }
      }).catch(() => {});
    }
  }
};
</script>