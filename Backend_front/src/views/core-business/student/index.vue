<template>
  <div class="page-container">
    <el-card shadow="never" class="main-card">
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex items-center">
            <span class="font-bold mr-4">学生档案管理</span>
            <el-tag v-if="currentSchoolName || currentClassName" type="warning" effect="plain" class="ml-2">
              当前学校: {{ currentSchoolName || '全部' }} &nbsp;|&nbsp; 
              当前班级: {{ currentClassName || '全部' }}
            </el-tag>
          </div>
          <div class="header-actions">
            <el-button 
              v-if="!isBatchDeleting"
              type="danger"
              @click="isBatchDeleting = true"
            >
              批量删除
            </el-button>
            <el-button 
              v-else
              :type="selectedIds.length > 0 ? 'danger' : 'default'"
              @click="handleBatchDelete"
            >
              {{ selectedIds.length > 0 ? '开始删除' : '取消删除' }}
            </el-button>
            <el-button @click="handleOpenImport">批量导入</el-button>
            <el-button type="primary" @click="handleAdd">添加学生</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="综合搜索">
          <el-input 
            v-model="searchForm.keyword" 
            placeholder="搜索姓名/学号/学校/年级/班级" 
            clearable 
            @keyup.enter="handleSearch" 
            style="width: 300px"
          />
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
        height="350"
        @selection-change="handleSelectionChange"
      >
        <el-table-column v-if="isBatchDeleting" type="selection" width="55" align="center" />
        <el-table-column prop="studentNo" label="学号" width="160" align="center" />
        <el-table-column prop="name" label="姓名" width="120" align="center" />
        <el-table-column prop="school" label="学校" min-width="180" show-overflow-tooltip />
        <el-table-column prop="grade" label="年级" width="120" align="center" />
        <el-table-column prop="className" label="班级" width="100" align="center" />

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
      <div class="pagination-container mt-auto flex justify-end pt-4">
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
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑学生档案' : '新增学生'" 
      width="500px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="学号" prop="studentNo">
          <el-input v-model="form.studentNo" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        
        <el-form-item v-if="isEdit" label="绑定账号">
          <div v-if="boundParents.length > 0" class="w-full">
            <el-tag 
              v-for="(phone, index) in boundParents" 
              :key="index" 
              type="info" 
              class="mr-2 mb-2"
            >
              {{ phone }}
            </el-tag>
          </div>
          <span v-else class="text-gray-400 text-sm">暂无绑定账号</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 导入弹窗 -->
    <el-dialog v-model="importVisible" title="导入学生档案" width="550px">
      <div class="import-container">
        <div class="flex justify-start mb-4">
          <el-tooltip placement="right" effect="light">
            <template #content>
              <div class="text-xs leading-6 text-gray-600 p-2">
                <p>1. 请先<b>下载导入模板</b>，按照模板格式填写学生信息。</p>
                <p>2. 支持<b>多文件批量上传</b>，系统将自动校验列标题及空数据。</p>
                <p>3. 若学号已存在，系统将自动<b>忽略</b>现有学生档案信息。</p>
              </div>
            </template>
            <div class="instructions-trigger">
              <el-icon class="mr-1"><info-filled /></el-icon>
              <span>导入操作说明 (鼠标悬停查看)</span>
            </div>
          </el-tooltip>
        </div>
        
        <el-upload
          ref="uploadRef"
          class="upload-demo"
          drag
          action="#"
          multiple
          :auto-upload="false"
          :on-change="handleFileChange"
          :file-list="fileList"
          :on-remove="handleRemove"
          :show-file-list="false"
          accept=".xlsx, .xls"
        >
          <div v-if="fileList.length === 0" class="upload-empty-content">
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <div class="el-upload__tip mt-2">
              仅支持 .xlsx / .xls 格式文件
            </div>
          </div>
          
          <div v-else class="upload-list-content" @click.stop>
            <div class="flex justify-between items-center mb-2 px-2">
              <span class="text-xs font-bold text-gray-500">待处理队列 ({{ fileList.length }})</span>
              <el-button link type="danger" size="small" @click="fileList = []">清空</el-button>
            </div>
            <el-table :data="fileList" size="small" border max-height="180" class="import-table">
              <el-table-column prop="name" label="文件名" show-overflow-tooltip />
              <el-table-column label="状态" width="90" align="center">
                <template #default="{ row }">
                  <div class="status-cell">
                    <el-tag v-if="row.status === 'ready'" type="info" size="small" class="status-tag-mini">等待中</el-tag>
                    <el-tag v-else-if="row.status === 'success'" type="success" size="small" class="status-tag-mini tag-success-simple">已导入</el-tag>
                    <el-tag v-else-if="row.status === 'fail'" type="danger" size="small" class="status-tag-mini">
                      <el-tooltip v-if="row.errorMsg" :content="row.errorMsg" placement="top">
                        <span>失败</span>
                      </el-tooltip>
                      <span v-else>失败</span>
                    </el-tag>
                    <el-tag v-else type="primary" size="small" class="status-tag-mini rotating">
                      <el-icon><loading-icon /></el-icon>
                    </el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="50" align="center">
                <template #default="{ $index }">
                  <el-button link type="danger" :icon="Delete" @click="fileList.splice($index, 1)" />
                </template>
              </el-table-column>
            </el-table>
            <div class="mt-2 text-center">
              <el-button link type="primary" size="small" @click="handleContinueUpload">
                <el-icon class="mr-1"><plus /></el-icon>继续添加文件
              </el-button>
            </div>
          </div>
        </el-upload>

        <div class="mt-8 flex flex-col gap-3">
          <el-button 
            type="primary" 
            size="large"
            class="w-full start-import-btn" 
            :loading="importLoading" 
            :disabled="fileList.length === 0"
            @click="submitImport"
          >
            <template #icon v-if="!importLoading">
              <el-icon><upload /></el-icon>
            </template>
            {{ importLoading ? '正在解析并写入数据库...' : '确认开始批量导入' }}
          </el-button>
          <div class="flex justify-center mt-1">
            <a href="file:///c:/Users/admin/Desktop/wechat_mini_program-master/JavaSB_back/src/main/assests/学生模板.zip" download="学生模板.zip">
              <el-button link type="primary" class="download-link">
                <el-icon class="mr-1"><document /></el-icon>还没有模板？点击下载学生模板.zip
              </el-button>
            </a>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { 
  fetchGetStudentList, 
  fetchAddStudent, 
  fetchUpdateStudent, 
  fetchDeleteStudent,
  fetchBatchDeleteStudents,
  fetchBatchUpdateStatus,
  fetchImportStudents,
  fetchDownloadTemplate,
  fetchGetBoundParents
} from '@/api/core-business/student/index'
import { fetchGetSchoolList } from '@/api/core-business/school/index'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import { 
  UploadFilled, 
  Check, 
  Close, 
  Loading as LoadingIcon, 
  Delete,
  Upload,
  Document,
  InfoFilled,
  Plus
} from '@element-plus/icons-vue'
import BindingStatus from './components/binding-status.vue'

const route = useRoute()

// 表格数据相关
const loading = ref(false)
const tableData = ref<Api.Student.StudentItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const selectedIds = ref<string[]>([])
const schoolList = ref<any[]>([])

const searchForm = reactive({
  keyword: '',
  schoolId: (route.query.schoolId as string) || '',
  classId: (route.query.classId as string) || ''
})

const currentSchoolName = ref((route.query.schoolName as string) || '')
const currentClassName = ref((route.query.className as string) || '')

const isBatchDeleting = ref(false)

const dialogVisible = ref(false)
const isEdit = ref(false)
const boundParents = ref<string[]>([])
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const form = ref<Partial<Api.Student.StudentItem>>({
  id: '',
  studentNo: '',
  name: '',
  school: '',
  schoolId: '',
  classId: '',
  grade: '',
  className: ''
})

const rules = {
  studentNo: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  schoolId: [{ required: true, message: '请选择学校', trigger: 'change' }]
}

const importVisible = ref(false)
const importLoading = ref(false)
const fileList = ref<any[]>([])
const activeNames = ref(['1'])
const uploadRef = ref<any>()

const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      current: page.value,
      size: pageSize.value,
      keyword: searchForm.keyword || undefined
    }
    
    // 支持按学校和班级ID进行关联查询过滤
    if (searchForm.schoolId) params.schoolId = searchForm.schoolId
    if (searchForm.classId) params.classId = searchForm.classId

    const res = await fetchGetStudentList(params)
    
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
  searchForm.keyword = ''
  searchForm.schoolId = (route.query.schoolId as string) || ''
  searchForm.classId = (route.query.classId as string) || ''
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

const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map(item => item.id)
}

const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) {
    isBatchDeleting.value = false
    selectedIds.value = []
    return
  }
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedIds.value.length} 个学生吗？`,
    '批量删除警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const res: any = await fetchBatchDeleteStudents(selectedIds.value)
      console.log('学生批量删除返回数据:', res)
      
      let msg = ''
      if (typeof res === 'string') {
        msg = res
      } else {
        msg = res?.msg || res?.data?.msg
      }
      
      console.log('后端返回的详细 msg:', msg)
      
      if (msg && msg.includes('未能删除')) {
        ElMessage.warning(msg)
      } else {
        ElMessage.success(msg || '批量删除成功')
      }
      selectedIds.value = []
      isBatchDeleting.value = false
      loadData()
    } catch (error: any) {
      console.error('学生批量删除异常:', error)
      ElMessage.error(error.message || '批量删除失败')
    }
  }).catch(() => {})
}

const handleAdd = () => {
  if (!searchForm.schoolId || !searchForm.classId) {
    ElMessage.warning('请先从学校管理 -> 班级管理进入指定的班级，才能添加学生！')
    return
  }

  isEdit.value = false
  form.value = {
    id: '',
    studentNo: '',
    name: '',
    schoolId: searchForm.schoolId,
    classId: searchForm.classId,
    school: currentSchoolName.value,
    grade: '',
    className: ''
  }
  if (formRef.value) {
    formRef.value.resetFields()
  }
  dialogVisible.value = true
}

const handleEdit = async (row: Api.Student.StudentItem) => {
  isEdit.value = true
  form.value = { ...row }
  boundParents.value = []
  if (formRef.value) {
    formRef.value.resetFields()
  }
  // 处理后端返回字段匹配问题，给 schoolId 赋值
  if (row.school && !form.value.schoolId) {
    const matchedSchool = schoolList.value.find(s => s.name === row.school)
    if (matchedSchool) {
      form.value.schoolId = matchedSchool.id
    }
  }
  dialogVisible.value = true
  
  // 获取绑定的家长手机号列表
  try {
    const res: any = await fetchGetBoundParents(row.id)
    if (res.code === 200) {
      boundParents.value = res.data || []
    } else if (Array.isArray(res)) {
      boundParents.value = res
    }
  } catch (error) {
    console.error('获取绑定账号失败', error)
  }
}

const handleDelete = (row: Api.Student.StudentItem) => {
  ElMessageBox.confirm(`确认删除学生 [${row.name}] 吗？`, '警告', {
    type: 'warning'
  }).then(async () => {
    try {
      const res: any = await fetchDeleteStudent(row.id)
      if (res && res.code === 200 && res.msg && res.msg.includes('失败')) {
        ElMessage.warning(res.msg)
      } else {
        ElMessage.success(res?.msg || '删除成功')
      }
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

const handleOpenImport = () => {
  fileList.value = []
  importVisible.value = true
}

// 导入相关
const handleFileChange = (uploadFile: any, uploadFiles: any) => {
  fileList.value = uploadFiles
}

const handleRemove = (file: any, uploadFiles: any) => {
  fileList.value = uploadFiles
}

const handleContinueUpload = () => {
  if (uploadRef.value) {
    // 触发 el-upload 内部的 input 点击
    const input = uploadRef.value.$el.querySelector('input[type="file"]')
    if (input) {
      input.click()
    }
  }
}

const submitImport = async () => {
  const readyFiles = fileList.value.filter(f => f.status === 'ready' || f.status === 'fail')
  if (readyFiles.length === 0) {
    ElMessage.warning('没有待导入的文件')
    return
  }
  
  importLoading.value = true
  let successCount = 0
  let failCount = 0

  for (const fileItem of readyFiles) {
    fileItem.status = 'uploading'
    fileItem.errorMsg = ''
    
    try {
      await fetchImportStudents(fileItem.raw)
      fileItem.status = 'success'
      successCount++
    } catch (error: any) {
      fileItem.status = 'fail'
      fileItem.errorMsg = error.message || '导入失败'
      failCount++
    }
  }

  if (failCount === 0) {
    ElMessage.success(`成功导入 ${successCount} 个文件`)
    setTimeout(() => {
      importVisible.value = false
      fileList.value = []
      loadData()
    }, 1500)
  } else {
    ElMessage.warning(`导入完成：${successCount} 个成功，${failCount} 个失败`)
    loadData() // 部分成功也要刷新列表
  }
  importLoading.value = false
}


const downloadTemplate = () => {
  fetchDownloadTemplate()
}

onMounted(() => {
  loadSchools()
  loadData()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 120px);
}
.main-card {
  height: 600px;
  display: flex;
  flex-direction: column;
}
:deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 180px;
}
.upload-empty-content {
  padding: 30px 0;
}
.upload-list-content {
  padding: 15px;
  cursor: default;
}
.import-container {
  padding: 0 10px;
}
.import-table {
  border-radius: 4px;
  overflow: hidden;
}
.status-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}
.status-tag-mini {
  min-width: 60px;
  height: 24px;
  line-height: 22px;
  padding: 0 8px;
  border-radius: 12px;
}
.start-import-btn {
  height: 48px;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 1px;
}
.download-link {
  font-size: 13px;
  color: #409eff;
}
.mr-1 {
  margin-right: 4px;
}

/* 动画效果 */
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(103, 194, 58, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(103, 194, 58, 0); }
  100% { box-shadow: 0 0 0 0 rgba(103, 194, 58, 0); }
}
.pulse-success {
  animation: pulse 2s infinite;
  background-color: #f0f9eb;
  border-color: #e1f3d8;
  color: #67c23a;
}
.tag-success-simple {
  background-color: #f0f9eb;
  border-color: #e1f3d8;
  color: #67c23a;
}
.instructions-trigger {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #409eff;
  cursor: help;
  padding: 4px 8px;
  background-color: #ecf5ff;
  border-radius: 4px;
  transition: all 0.3s;
}
.instructions-trigger:hover {
  background-color: #d9ecff;
}
.instructions-collapse {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
}
:deep(.instructions-collapse .el-collapse-item__header) {
  padding: 0 15px;
  height: 40px;
  background-color: #f8f9fb;
  border-bottom: none;
}
:deep(.instructions-collapse .el-collapse-item__wrap) {
  border-bottom: none;
  background-color: #fcfdfe;
}
:deep(.instructions-collapse .el-collapse-item__content) {
  padding: 10px 15px 15px;
}
.text-primary {
  color: #409eff;
}

:deep(.el-alert__description) {
  margin-top: 5px;
}
</style>
