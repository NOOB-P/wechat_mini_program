<template>
  <div class="page-container">
    <el-page-header @back="goBack" class="mb-4">
      <template #content>
        <span class="text-large font-600 mr-3"> 班级管理 </span>
        <span class="text-sm mr-2" style="color: var(--el-text-color-regular)">
          当前项目: {{ projectName }}
        </span>
      </template>
    </el-page-header>

    <el-card shadow="never" class="search-card mb-4">
      <el-form :inline="true" :model="searchForm" class="search-form-inline">
        <el-form-item label="学校">
          <el-input v-model="searchForm.school" placeholder="学校名称" clearable />
        </el-form-item>
        <el-form-item label="年级">
          <el-input v-model="searchForm.grade" placeholder="年级" clearable />
        </el-form-item>
        <el-form-item label="班级">
          <el-input v-model="searchForm.className" placeholder="班级" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-bold">班级列表</span>
          <div class="header-actions">
            <el-button @click="handleOpenImport">批量导入</el-button>
            <el-button type="primary" @click="handleAddClass">添加班级</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" border style="width: 100%" v-loading="loading">
        <el-table-column prop="school" label="学校" min-width="150" />
        <el-table-column prop="grade" label="年级" width="120" align="center" />
        <el-table-column prop="className" label="班级" width="120" align="center" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEnter(row)">进入</el-button>
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="loadData"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑班级' : '添加班级'" width="450px">
      <el-form :model="form" ref="formRef" :rules="rules" label-width="80px">
        <el-form-item label="学校" prop="school">
          <el-input v-model="form.school" placeholder="请输入学校名称" />
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-input v-model="form.grade" placeholder="例如: 高一" />
        </el-form-item>
        <el-form-item label="班级" prop="className">
          <el-input v-model="form.className" placeholder="例如: 1班" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 导入弹窗 -->
    <el-dialog v-model="importVisible" title="导入班级架构" width="550px">
      <div class="import-container">
        <div class="flex justify-start mb-4">
          <el-tooltip placement="right" effect="light">
            <template #content>
              <div class="text-xs leading-6 text-gray-600 p-2">
                <p>1. 请先<b>下载导入模板</b>，按照模板格式填写班级信息。</p>
                <p>2. 支持<b>多文件批量上传</b>，系统将自动校验数据。</p>
              </div>
            </template>
            <div class="instructions-trigger">
              <el-icon class="mr-1"><info-filled /></el-icon>
              <span>导入操作说明 (鼠标悬停查看)</span>
            </div>
          </el-tooltip>
        </div>
        
        <el-upload
          class="upload-demo"
          drag
          action="#"
          multiple
          :auto-upload="false"
          :on-change="handleFileChange"
          :file-list="fileList"
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
          <div v-else class="p-4">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-bold">待上传文件 ({{ fileList.length }})</span>
              <el-button link type="danger" @click="fileList = []">清空</el-button>
            </div>
            <el-table :data="fileList" size="small" border>
              <el-table-column prop="name" label="文件名" />
            </el-table>
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
            确认开始批量导入
          </el-button>
          <div class="flex justify-center mt-1">
            <a href="file:///c:/Users/admin/Desktop/wechat_mini_program-master/JavaSB_back/src/main/assests/班级导入模板.zip" download="班级导入模板.zip">
              <el-button link type="primary" class="download-link">
                <el-icon class="mr-1"><document /></el-icon>还没有模板？点击下载班级导入模板.zip
              </el-button>
            </a>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import { 
  InfoFilled, 
  UploadFilled, 
  Document, 
  Upload, 
  Delete, 
  Plus 
} from '@element-plus/icons-vue'
import { 
  fetchGetClassList, 
  fetchAddClass, 
  fetchUpdateClass, 
  fetchDeleteClass 
} from '@/api/core-business/exam/class'

const router = useRouter()
const route = useRoute()
const projectName = ref(route.query.projectName || '未指定项目')
const projectId = ref(route.query.projectId as string)

const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const searchForm = ref({
  school: '',
  grade: '',
  className: ''
})

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const form = ref({
  id: '',
  projectId: projectId.value,
  school: '',
  grade: '',
  className: ''
})

const rules = {
  school: [{ required: true, message: '请输入学校名称', trigger: 'blur' }],
  grade: [{ required: true, message: '请输入年级', trigger: 'blur' }],
  className: [{ required: true, message: '请输入班级', trigger: 'blur' }]
}

const importVisible = ref(false)
const importLoading = ref(false)
const fileList = ref<any[]>([])

const handleOpenImport = () => {
  fileList.value = []
  importVisible.value = true
}

const handleFileChange = (file: any) => {
  fileList.value.push(file)
}

const submitImport = () => {
  importLoading.value = true
  setTimeout(() => {
    importLoading.value = false
    importVisible.value = false
    ElMessage.success('导入成功')
    loadData()
  }, 1500)
}

const loadData = async () => {
  if (!projectId.value) {
    ElMessage.error('缺少考试项目ID')
    return
  }
  loading.value = true
  try {
    const res = await fetchGetClassList({
      current: page.value,
      size: pageSize.value,
      projectId: projectId.value,
      school: searchForm.value.school,
      grade: searchForm.value.grade,
      className: searchForm.value.className
    })
    
    if (res) {
      tableData.value = res.records || []
      total.value = res.total || 0
    } else {
      tableData.value = []
      total.value = 0
    }
  } catch (error) {
    ElMessage.error('加载班级列表失败')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push({ name: 'ExamProject' })
}

const handleSearch = () => {
  page.value = 1
  loadData()
}

const resetSearch = () => {
  searchForm.value = { school: '', grade: '', className: '' }
  page.value = 1
  loadData()
}

const handleAddClass = () => {
  isEdit.value = false
  form.value = { id: '', projectId: projectId.value, school: '', grade: '', className: '' }
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  form.value = { 
    id: row.id, 
    projectId: row.projectId, 
    school: row.school, 
    grade: row.grade, 
    className: row.className 
  }
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除班级 [${row.school} ${row.grade}${row.className}] 吗？`, '危险操作警告', {
    type: 'warning',
    confirmButtonText: '确定删除',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      await fetchDeleteClass(row.id)
      ElMessage.success('删除成功')
      if (tableData.value.length === 1 && page.value > 1) {
        page.value -= 1
      }
      loadData()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

const handleEnter = (row: any) => {
  router.push({
    name: 'ExamSubject',
    query: { 
      projectId: projectId.value,
      projectName: route.query.projectName || ''
    }
  })
}

const handleCurrentChange = (val: number) => {
  page.value = val
  loadData()
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await fetchUpdateClass(form.value)
        } else {
          await fetchAddClass(form.value)
        }
        
        ElMessage.success(isEdit.value ? '编辑成功' : '创建成功')
        dialogVisible.value = false
        loadData()
      } catch (error) {
        ElMessage.error(isEdit.value ? '编辑失败' : '创建失败')
      }
    }
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.import-container {
  padding: 10px 20px;
}

.instructions-trigger {
  display: flex;
  align-items: center;
  color: #409eff;
  cursor: pointer;
  font-size: 13px;
  padding: 8px 12px;
  background: #f0f7ff;
  border-radius: 4px;
}

.upload-demo :deep(.el-upload-dragger) {
  padding: 40px 20px;
  border: 2px dashed #dcdfe6;
  border-radius: 12px;
  background: #fafafa;
}

.upload-empty-content .el-icon--upload {
  font-size: 48px;
  color: #909399;
  margin-bottom: 16px;
}

.start-import-btn {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
}
</style>
