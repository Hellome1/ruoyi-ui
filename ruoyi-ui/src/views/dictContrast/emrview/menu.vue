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
      <!-- <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:role:remove']"
        >删除</el-button>
      </el-col> -->
      <right-toolbar :hiddenSearch="true" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="menuList" @selection-change="handleSelectionChange">
      <el-table-column type="" width="100" align="center" />
      <el-table-column label="字段代码" prop="menuContrastField" :show-overflow-tooltip="true" width="310" />
      <el-table-column label="对应菜单代码" prop="menuCode" :show-overflow-tooltip="true" width="310" />
      <el-table-column label="对应菜单描述" prop="menuContrastDesc" :show-overflow-tooltip="true" width="280" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
          size="mini"
          type="text"
          icon="el-icon-edit"
          @click="handleUpdate(scope.row)"
          v-hasPermi="['system:role:edit']"
          >修改</el-button>
          <!-- <el-button
          size="mini"
          type="text"
          icon="el-icon-delete"
          @click="handleDelete(scope.row)"
          v-hasPermi="['system:role:remove']"
          >删除</el-button> -->
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
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="字段代码" prop="menuContrastField">
          <el-input v-model="form.menuContrastField" placeholder="请输入字段代码" />
        </el-form-item>
        <el-form-item label="对应菜单代码" prop="menuCode">
          <el-input v-model="form.menuCode" placeholder="请输入对应菜单代码" />
        </el-form-item>
        <el-form-item label="对应菜单描述" prop="menuContrastDesc">
          <el-select v-model="form.menuContrastDesc" placeholder="请选择">
            <el-option
              v-for="item in optionsDesc"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
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
import { getMenuList, setMenuList, addMenuList, getCorrespondingMenu } from '@/apir/dictContrast/emrview/menu';

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
      menuList: [],
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
        menuContrastField: [
          { required: true, message: "字段代码不能为空", trigger: "blur" }
        ],
        menuCode: [
          { required: true, message: "对应菜单代码不能为空", trigger: "blur" }
        ],
        menuContrastDesc: [
          { required: true, message: "对应菜单描述不能为空", trigger: "blur" }
        ]
      },
      optionsDesc: [], // 对应菜单描述
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询角色列表 */
    getList() {
      this.loading = true;
      getMenuList(this.queryParams.pageNum, this.queryParams.pageSize).then(res => {
        // console.log({...res});
        this.menuList = this.handleNullInData(res.data);
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
      this.ids = selection.map(item => item.vitalSignId)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
    // 滑块操作
    handleStatusChange(row) {
      switchAppling({
        ids: row.vitalSignId
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
      // 没有列表数据，请求
      if (this.optionsDesc.length === 0) {
        getCorrespondingMenu({
          belongSystemCode: 'EMRView'
        }).then(res => {
          let options = [];
          let transK = {
            value: 'menuName',
            label: 'menuName'
          };
          res.data.forEach(item => {
            let o = {};
            for (let k in transK) {
              o[k] = item[transK[k]];
            }
            options.push(o);
          });
          this.optionsDesc = options;
        });
      }
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.title = "修改";
      let { menuContrastField, menuCode, menuContrastDesc, menuContrastId } = row;
      console.log(row);
      this.open = true;
      this.form = {
        menuContrastField,
        menuCode,
        menuContrastDesc,
        menuContrastId
      };
      getCorrespondingMenu({
        belongSystemCode: 'EMRView'
      }).then(res => {
        let options = [];
        let transK = {
          value: 'menuName',
          label: 'menuName'
        };
        res.data.forEach(item => {
          let o = {};
          for (let k in transK) {
            o[k] = item[transK[k]];
          }
          // 选择对应的选项
          if (o.label === menuContrastDesc) {
            this.form.menuContrastDesc = o.value;
          }
          options.push(o);
        });
        this.optionsDesc = options;
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.title === "修改"){
            // 修改
            console.log(this.form);
            setMenuList(this.form).then(res => {
              if (res.code === 200) {
                this.getList();
                this.open = false;
                this.$modal.msgSuccess(res.msg);
              }
            });
          } else {
            // 新增
            this.form.menuContrastId = "";
            console.log("postData:", this.form);
            addMenuList(this.form).then(res => {
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
      const roleIds = row.vitalSignId || ids;
      let param = {
        ids: row.vitalSignId || ids.join('|')
      };
      this.$modal.confirm('是否确认删除编号为"' + roleIds + '"的数据？')
      .then(function() {
        return deleteMenuList(param);
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