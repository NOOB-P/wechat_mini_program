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
          <el-button type="primary" @click="handleAddClass">添加班级</el-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
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
      classId: row.id,
      className: `${row.school} ${row.grade}${row.className}`
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
</style>
