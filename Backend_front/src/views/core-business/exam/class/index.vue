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

const router = useRouter()
const route = useRoute()
const projectName = ref(route.query.projectName || '未指定项目')
const projectId = ref(route.query.projectId)

const loading = ref(false)
const tableData = ref([
  { id: '101', school: '第一中学', grade: '高一', className: '1班' },
  { id: '102', school: '第一中学', grade: '高一', className: '2班' },
  { id: '103', school: '第二中学', grade: '初一', className: '3班' }
])

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
  school: '',
  grade: '',
  className: ''
})

const rules = {
  school: [{ required: true, message: '请输入学校名称', trigger: 'blur' }],
  grade: [{ required: true, message: '请输入年级', trigger: 'blur' }],
  className: [{ required: true, message: '请输入班级', trigger: 'blur' }]
}

const goBack = () => {
  router.push({ name: 'ExamProject' })
}

const handleSearch = () => {
  ElMessage.success('查询成功')
}

const resetSearch = () => {
  searchForm.value = { school: '', grade: '', className: '' }
}

const handleAddClass = () => {
  isEdit.value = false
  form.value = { id: '', school: '', grade: '', className: '' }
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除班级 [${row.school} ${row.grade}${row.className}] 吗？`, '警告', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
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

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success(isEdit.value ? '编辑成功' : '添加成功')
      dialogVisible.value = false
    }
  })
}
</script>

<style scoped>
.page-container {
  padding: 20px;
}
</style>
