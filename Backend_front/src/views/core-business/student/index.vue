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
            <el-option 
              v-for="item in schoolList" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

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

        <el-table-column label="绑定数量" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.boundCount > 0 ? 'success' : 'info'" size="small">
              {{ row.boundCount }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
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
        <el-form-item label="所在学校" prop="schoolId">
          <el-select v-model="form.schoolId" placeholder="请选择学校" class="w-full">
            <el-option 
              v-for="item in schoolList" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id" 
            />
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
import { fetchGetSchoolList } from '@/api/core-business/school/index'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import BindingStatus from './components/binding-status.vue'

// 表格数据相关
const loading = ref(false)
const tableData = ref<Api.Student.StudentItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const selectedIds = ref<string[]>([])
const schoolList = ref<any[]>([])

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
  schoolId: [{ required: true, message: '请选择学校', trigger: 'change' }]
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
    
    // 处理 axios 拦截器解包的情况
    if (res && res.records) {
      tableData.value = res.records
      total.value = res.total
    } else if (res && res.code === 200) {
      tableData.value = res.data.records
      total.value = res.data.total
    } else {
      tableData.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取学生列表失败:', error)
  } finally {
    loading.value = false
  }
}

const loadSchools = async () => {
  try {
    const res = await fetchGetSchoolList()
    if (Array.isArray(res)) {
      schoolList.value = res
    } else if (res && res.code === 200) {
      schoolList.value = res.data
    }
  } catch (error) {
    console.error('获取学校列表失败:', error)
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
  form.value = {
    id: '',
    studentNo: '',
    name: '',
    gender: '男',
    schoolId: '',
    grade: '',
    className: '',
    parentPhone: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row: Api.Student.StudentItem) => {
  isEdit.value = true
  form.value = { ...row }
  // 处理后端返回字段匹配问题，给 schoolId 赋值
  if (row.school && !form.value.schoolId) {
    const matchedSchool = schoolList.value.find(s => s.name === row.school)
    if (matchedSchool) {
      form.value.schoolId = matchedSchool.id
    }
  }
  dialogVisible.value = true
}

const handleDelete = (row: Api.Student.StudentItem) => {
  ElMessageBox.confirm(`确认删除学生 [${row.name}] 吗？`, '警告', {
    type: 'warning'
  }).then(async () => {
    try {
      await fetchDeleteStudent(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      ElMessage.error((error as any).message || '删除失败')
    }
  })
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        submitLoading.value = true
        
        // 获取选中学校的名称（为了冗余字段 school 赋值）
        const matchedSchool = schoolList.value.find(s => s.id === form.value.schoolId)
        if (matchedSchool) {
          form.value.school = matchedSchool.name
        }

        if (isEdit.value) {
          await fetchUpdateStudent(form.value)
          ElMessage.success('更新成功')
        } else {
          await fetchAddStudent(form.value)
          ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        loadData()
      } catch (error) {
        // Axios 拦截器会抛出错误，我们在 catch 里不用自己提示了或者可以通过 error.message 提示
        ElMessage.error((error as any).message || '操作失败')
      } finally {
        submitLoading.value = false
      }
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
  loadSchools()
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
