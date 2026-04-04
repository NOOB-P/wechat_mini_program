<template>
  <div class="page-container">
    <el-card shadow="never" class="search-card mb-4">
      <el-form :inline="true" :model="searchForm" class="search-form-inline">
        <el-form-item label="考试项目名称">
          <el-input v-model="searchForm.name" placeholder="请输入项目名称" clearable @keyup.enter="handleSearch" />
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
          <span class="font-bold">考试项目列表</span>
          <el-button type="primary" @click="handleAddProject">创建考试项目</el-button>
        </div>
      </template>

      <el-table :data="tableData" border style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="考试项目名称" min-width="250" />
        <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEnter(row)">进入</el-button>
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑考试项目' : '创建考试项目'" width="400px">
      <el-form :model="form" ref="formRef" :rules="rules" label-width="100px">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入项目名称" />
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
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const tableData = ref([
  { id: '1', name: '2023-2024学年第一学期期中联考', createTime: '2023-11-01 10:00:00' },
  { id: '2', name: '2024年春季学期摸底考试', createTime: '2024-03-01 09:00:00' }
])
const total = ref(2)
const page = ref(1)
const pageSize = ref(10)

const searchForm = ref({
  name: ''
})

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const form = ref({
  id: '',
  name: ''
})

const rules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }]
}

const handleSearch = () => {
  ElMessage.success('查询成功')
}

const resetSearch = () => {
  searchForm.value.name = ''
}

const handleAddProject = () => {
  isEdit.value = false
  form.value = { id: '', name: '' }
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除项目 [${row.name}] 吗？`, '警告', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  })
}

const handleEnter = (row: any) => {
  router.push({
    name: 'ExamClass',
    query: { projectId: row.id, projectName: row.name }
  })
}

const handleCurrentChange = (val: number) => {
  page.value = val
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success(isEdit.value ? '编辑成功' : '创建成功')
      dialogVisible.value = false
    }
  })
}

onMounted(() => {
  // loadData()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
</style>
