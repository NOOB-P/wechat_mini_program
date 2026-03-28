<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-bold">学生档案管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="importVisible = true">导入学生</el-button>
            <el-button type="success" @click="handleAdd">新增学生</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="姓名">
          <el-input v-model="searchForm.name" placeholder="请输入姓名" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="学号">
          <el-input v-model="searchForm.studentNo" placeholder="请输入学号" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="学校">
          <el-select v-model="searchForm.school" placeholder="请选择学校" clearable style="width: 180px">
            <el-option label="第一中学" value="第一中学" />
            <el-option label="第二中学" value="第二中学" />
            <el-option label="第三实验学校" value="第三实验学校" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 批量操作工具栏 -->
      <div v-if="selectedIds.length > 0" class="batch-bar mb-4">
        <el-alert type="info" :closable="false" show-icon>
          <template #title>
            <span>已选择 {{ selectedIds.length }} 项</span>
            <el-divider direction="vertical" />
            <el-button type="primary" link @click="handleBatchVip('vip', 'enable')">批量开通 VIP</el-button>
            <el-button type="warning" link @click="handleBatchVip('svip', 'enable')">批量开通 SVIP</el-button>
            <el-button type="danger" link @click="handleBatchVip('vip', 'disable')">取消 VIP</el-button>
          </template>
        </el-alert>
      </div>

      <!-- 数据表格 -->
      <el-table 
        :data="tableData" 
        border 
        style="width: 100%" 
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="studentNo" label="学号" width="120" align="center" />
        <el-table-column prop="name" label="姓名" width="100" align="center" />
        <el-table-column prop="gender" label="性别" width="70" align="center" />
        <el-table-column prop="school" label="学校" min-width="150" show-overflow-tooltip />
        <el-table-column prop="grade" label="年级" width="100" align="center" />
        <el-table-column prop="className" label="班级" width="80" align="center" />
        
        <el-table-column label="VIP 状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isVip ? 'success' : 'info'" size="small">
              {{ row.isVip ? '已开通' : '未开通' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="SVIP 状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isSvip ? 'warning' : 'info'" size="small">
              {{ row.isSvip ? '已开通' : '未开通' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="绑定状态" width="100" align="center">
          <template #default="{ row }">
            <BindingStatus :isBound="row.isBound" />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-dropdown trigger="click" class="ml-2" @command="(cmd: string) => handleStatusCmd(cmd, row)">
              <el-button link type="primary" size="small">权限管理<el-icon class="el-icon--right"><arrow-down /></el-icon></el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="vip_enable" :disabled="row.isVip">开通 VIP</el-dropdown-item>
                  <el-dropdown-item command="vip_disable" :disabled="!row.isVip">取消 VIP</el-dropdown-item>
                  <el-dropdown-item divided command="svip_enable" :disabled="row.isSvip">开通 SVIP</el-dropdown-item>
                  <el-dropdown-item command="svip_disable" :disabled="!row.isSvip">取消 SVIP</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button link type="danger" size="small" @click="handleDelete(row)" class="ml-2">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑学生' : '新增学生'" width="500px">
      <el-form :model="form" label-width="100px" ref="formRef" :rules="rules">
        <el-form-item label="学号" prop="studentNo">
          <el-input v-model="form.studentNo" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="学校" prop="school">
          <el-select v-model="form.school" placeholder="请选择学校" class="w-full">
            <el-option label="第一中学" value="第一中学" />
            <el-option label="第二中学" value="第二中学" />
            <el-option label="第三实验学校" value="第三实验学校" />
          </el-select>
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-input v-model="form.grade" placeholder="如：高一年级" />
        </el-form-item>
        <el-form-item label="班级" prop="className">
          <el-input v-model="form.className" placeholder="如：1班" />
        </el-form-item>
        <el-form-item label="家长手机" prop="parentPhone">
          <el-input v-model="form.parentPhone" placeholder="请输入手机号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 导入弹窗 -->
    <el-dialog v-model="importVisible" title="导入学生档案" width="450px">
      <div class="import-container flex flex-col items-center">
        <el-alert
          title="导入说明"
          type="info"
          description="请按照模板格式填写学生信息。系统将自动根据学号进行匹配，若已存在则更新信息。"
          show-icon
          :closable="false"
          class="mb-4"
        />
        <el-upload
          class="upload-demo"
          drag
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          accept=".xlsx, .xls"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
        </el-upload>
        <div class="mt-4 w-full flex flex-col gap-2">
          <el-button type="primary" class="w-full" :loading="importLoading" @click="submitImport">
            开始导入
          </el-button>
          <el-button link @click="downloadTemplate">下载导入模板</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  fetchGetStudentList, 
  fetchAddStudent, 
  fetchUpdateStudent, 
  fetchDeleteStudent,
  fetchBatchUpdateStatus,
  fetchImportStudents
} from '@/api/core-business/student/index'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import { ArrowDown, UploadFilled } from '@element-plus/icons-vue'
import BindingStatus from './components/BindingStatus.vue'

const loading = ref(false)
const tableData = ref<Api.Student.StudentItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const selectedIds = ref<string[]>([])

const searchForm = ref({
  name: '',
  studentNo: '',
  school: ''
})

const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const form = ref<Partial<Api.Student.StudentItem>>({
  id: '',
  studentNo: '',
  name: '',
  gender: '男',
  school: '',
  grade: '',
  className: '',
  parentPhone: ''
})

const rules = {
  studentNo: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  school: [{ required: true, message: '请选择学校', trigger: 'change' }]
}

const importVisible = ref(false)
const importLoading = ref(false)
const selectedFile = ref<File | null>(null)

const loadData = async () => {
  loading.value = true
  try {
    const res = await fetchGetStudentList({
      current: page.value,
      size: pageSize.value,
      ...searchForm.value
    })
    if (res.code === 200) {
      tableData.value = res.data.records
      total.value = res.data.total
    }
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  loadData()
}

const resetSearch = () => {
  searchForm.value = { name: '', studentNo: '', school: '' }
  handleSearch()
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadData()
}

const handleCurrentChange = (val: number) => {
  page.value = val
  loadData()
}

const handleSelectionChange = (selection: Api.Student.StudentItem[]) => {
  selectedIds.value = selection.map(item => item.id)
}

const handleAdd = () => {
  isEdit.value = false
  form.value = { id: '', studentNo: '', name: '', gender: '男', school: '', grade: '', className: '', parentPhone: '' }
  dialogVisible.value = true
}

const handleEdit = (row: Api.Student.StudentItem) => {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row: Api.Student.StudentItem) => {
  ElMessageBox.confirm(`确定要删除学生 ${row.name} 吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await fetchDeleteStudent(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadData()
    }
  })
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        const api = isEdit.value ? fetchUpdateStudent : fetchAddStudent
        const res = await api(form.value)
        if (res.code === 200) {
          ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
          dialogVisible.value = false
          loadData()
        }
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 权限管理指令处理
const handleStatusCmd = async (command: string, row: Api.Student.StudentItem) => {
  const [type, action] = command.split('_') as ['vip' | 'svip', 'enable' | 'disable']
  const typeName = type === 'vip' ? 'VIP' : 'SVIP'
  const actionName = action === 'enable' ? '开通' : '取消'
  
  try {
    const res = await fetchBatchUpdateStatus({
      ids: [row.id],
      type,
      action
    })
    if (res.code === 200) {
      ElMessage.success(`${actionName} ${typeName} 成功`)
      loadData()
    }
  } catch (error) {
    console.error(error)
  }
}

// 批量操作
const handleBatchVip = (type: 'vip' | 'svip', action: 'enable' | 'disable') => {
  const typeName = type === 'vip' ? 'VIP' : 'SVIP'
  const actionName = action === 'enable' ? '开通' : '取消'
  
  ElMessageBox.confirm(`确定要为选中的 ${selectedIds.value.length} 名学生${actionName} ${typeName} 吗?`, '批量操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    const res = await fetchBatchUpdateStatus({
      ids: selectedIds.value,
      type,
      action
    })
    if (res.code === 200) {
      ElMessage.success(`批量${actionName}成功`)
      loadData()
    }
  })
}

// 导入相关
const handleFileChange = (uploadFile: any) => {
  selectedFile.value = uploadFile.raw
}

const submitImport = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }
  importLoading.value = true
  try {
    const res = await fetchImportStudents(selectedFile.value)
    if (res.code === 200) {
      ElMessage.success('导入成功')
      importVisible.value = false
      loadData()
    }
  } finally {
    importLoading.value = false
  }
}

const downloadTemplate = () => {
  ElMessage.info('正在下载学生档案导入模板...')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.search-form {
  background-color: #f8f9fa;
  padding: 18px 18px 0;
  border-radius: 4px;
  margin-bottom: 20px;
}
.batch-bar {
  margin-bottom: 16px;
}
.header-actions {
  display: flex;
  gap: 12px;
}
.ml-2 {
  margin-left: 8px;
}
.w-full {
  width: 100%;
}
.upload-demo {
  width: 100%;
}
:deep(.el-upload-dragger) {
  width: 100%;
}
</style>
