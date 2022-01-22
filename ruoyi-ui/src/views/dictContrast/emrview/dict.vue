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

    <el-table v-loading="loading" :data="dictList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="100" align="center" />
      <el-table-column label="源Code" prop="originCode" :show-overflow-tooltip="true" width="300" />
      <el-table-column label="模版Code" prop="targetCode" :show-overflow-tooltip="true" width="300" />
      <el-table-column label="标记" prop="sign" :show-overflow-tooltip="true" width="300" />
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
          <el-form-item label="源Code" prop="originCode">
            <el-input v-model="form.originCode" placeholder="请输入源Code" />
          </el-form-item>
          <el-form-item label="模版Code" prop="targetCode">
            <el-input v-model="form.targetCode" placeholder="请输入模版Code" />
          </el-form-item>
          <el-form-item label="标记" prop="sign">
            <el-input v-model="form.sign" placeholder="请输入标记" />
          </el-form-item>
        </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getDictList, setDictList, addDictList, deleteDictList, switchAppling } from '@/apir/dictContrast/emrview/dict';

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
      // 角色表格数据
      dictList: [],
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
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 表单校验
      rules: {
        originCode: [
          { required: true, message: "源Code不能为空", trigger: "blur" }
        ],
        targetCode: [
          { required: true, message: "模版Code不能为空", trigger: "blur" }
        ],
        sign: [
          { required: true, message: "标记不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询角色列表 */
    getList() {
      this.loading = true;
      getDictList(this.queryParams.pageNum, this.queryParams.pageSize).then(res => {
        // console.log({...res});
        this.dictList = this.handleNullInData(res.data);
        this.total = res.recordsTotal;
        this.loading = false;
      }).catch((err) => {
        this.loading = false;
        this.total = 0;
        if (err.recordsTotal === 0) this.dictList = [];
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
      this.ids = selection.map(item => item.dictContrastId)
      this.single = selection.length!=1
      this.multiple = !selection.length
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
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.title = "修改";
      let { originCode, targetCode, sign, dictContrastId } = row;
      this.open = true;
      this.form = {
        originCode,
        targetCode,
        sign,
        dictContrastId
      };
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.title === "修改"){
            // 修改
            setDictList(this.form).then(res => {
              if (res.code === 200) this.responseSuccess(res);
            });
          } else {
            // 新增
            this.form.dictContrastId = "";
            addDictList(this.form).then(res => {
              if (res.code === 200) this.responseSuccess(res);
            });
          }
        }
      });
    },
    // 请求成功响应
    responseSuccess(res) {
      this.getList();
      this.open = false;
      this.$modal.msgSuccess(res.msg);
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      let ids = this.ids;
      const roleIds = row.dictContrastId || ids;
      let param = {
        ids: row.dictContrastId || ids.join('|')
      };
      this.$modal.confirm('是否确认删除编号为"' + roleIds + '"的数据？')
      .then(function() {
        return deleteDictList(param);
      }).then(res => {
        if (res.code === 200) this.responseSuccess(res);
      }).catch(() => {});
    }
  }
};
</script>