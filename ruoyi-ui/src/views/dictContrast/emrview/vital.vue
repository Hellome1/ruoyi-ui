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

    <el-table v-loading="loading" :data="vitalList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="100" align="center" />
      <el-table-column label="字段代码" prop="vitalCode" :show-overflow-tooltip="true" width="230" />
      <el-table-column label="字段描述" prop="vitalDesc" :show-overflow-tooltip="true" width="230" />
      <el-table-column label="单位" prop="vitalUnit" :show-overflow-tooltip="true" width="230" />
      <el-table-column label="是否启用" align="center" width="100" >
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.vitalStatus"
            active-value="1"
            inactive-value="0"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
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
        <el-form-item label="字段代码" prop="vitalCode">
          <el-input v-model="form.vitalCode" placeholder="请输入字段名" />
        </el-form-item>
        <el-form-item label="字段描述" prop="vitalDesc">
          <el-input v-model="form.vitalDesc" placeholder="请输入字段描述" />
        </el-form-item>
        <el-form-item label="单位" prop="vitalUnit">
          <el-input v-model="form.vitalUnit" placeholder="请输入单位" />
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
import { getVitalList, setVitalList, addVitalList, deleteVitalList, switchAppling } from '@/apir/dictContrast/emrview/vital';

export default {
  name: "Role",
  dicts: ['sys_normal_disable'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 数据的id key
      idk: 'vitalSignId',
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 角色表格数据
      vitalList: [],
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
      formKeys: {
        vitalCode: true,
        vitalDesc: true,
        vitalUnit: true,
        vitalSignId: true
      },
      // 表单校验
      rules: {
        vitalCode: [
          { required: true, message: "字段名称不能为空", trigger: "blur" }
        ],
        vitalDesc: [
          { required: true, message: "字段描述不能为空", trigger: "blur" }
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
      getVitalList(this.queryParams.pageNum, this.queryParams.pageSize).then(res => {
        // console.log({...res});
        this.rawData = this.copy(res.data, true);
        this.vitalList = this.handleNullInData(res.data);
        this.total = res.recordsTotal;
        this.loading = false;
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
      switchAppling({
        ids: row[this.idk]
      }).then(res => {
        if (res.code === 200) {
          this.$modal.msgSuccess(res.msg);
          this.getList();
        }
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
    /** 修改按钮操作 */
    handleUpdate(row) {
      let transed = this.transToRaw(row, this.idk);
      this.title = "修改";
      let keys = this.formKeys;
      let form = {};
      for (let k in keys) {
        if (transed.hasOwnProperty(k)) form[k] = transed[k];
      }
      this.form = form;
      this.open = true;
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.title === "修改"){
            // 修改
            setVitalList(this.form).then(res => {
              if (res.code === 200) {
                this.getList();
                this.open = false;
                this.$modal.msgSuccess("修改成功");
              }
            });
          } else {
            // 新增
            let paramBefore = {
              vitalCode: null,
              vitalDesc: null,
              vitalUnit: null
            },
            param = {};
            for (let k in paramBefore) {
              param[k] = this.form[k]
            }
            param[this.idk] = "";
            console.log(this.form);
            console.log(param);
            addVitalList(param).then(res => {
              if (res.code === 200) {
                this.getList();
                this.open = false;
                this.$modal.msgSuccess(res.msg);
              }
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      let ids = this.ids;
      const roleIds = row[this.idk] || ids;
      let param = {
        ids: row[this.idk] || ids.join('|')
      };
      this.$modal.confirm('是否确认删除编号为"' + roleIds + '"的数据？')
      .then(function() {
        return deleteVitalList(param);
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