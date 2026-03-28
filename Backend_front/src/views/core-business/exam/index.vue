<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-bold">考试数据中心</span>
          <el-button type="primary" @click="handleUpload">上传考试数据</el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form mb-4">
        <el-form-item label="考试名称">
          <el-input v-model="searchForm.name" placeholder="请输入考试名称" clearable @keyup.enter="handleSearch" />
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

      <!-- 数据表格 -->
      <el-table :data="tableData" border style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="考试名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="school" label="学校" width="180" show-overflow-tooltip />
        <el-table-column prop="grade" label="年级" width="120" align="center" />
        <el-table-column prop="className" label="班级" width="100" align="center" />
        <el-table-column prop="date" label="考试日期" width="120" align="center" />
        <el-table-column prop="status" label="解析状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="successCount" label="成功匹配" width="100" align="center" />
        <el-table-column prop="failCount" label="匹配失败" width="100" align="center">
          <template #default="{ row }">
            <span :class="row.failCount > 0 ? 'text-red-500 font-bold' : ''">{{ row.failCount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button 
              link 
              type="primary" 
              size="small" 
              @click="viewResult(row)" 
              :disabled="row.status !== '已解析'"
            >查看结果</el-button>
            <el-button 
              link 
              type="danger" 
              size="small" 
              @click="handleDelete(row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <UploadPanel v-model:visible="uploadVisible" @success="loadData" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchGetExamList, fetchDeleteExam } from '@/api/core-business/exam/index'
import { ElMessage, ElMessageBox } from 'element-plus'
import UploadPanel from './upload-panel.vue'

const router = useRouter()
const loading = ref(false)
const tableData = ref<Api.Exam.ExamItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const uploadVisible = ref(false)

const searchForm = ref({
  name: '',
  school: ''
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await fetchGetExamList({
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
  searchForm.value = { name: '', school: '' }
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

const handleUpload = () => {
  uploadVisible.value = true
}

const viewResult = (row: Api.Exam.ExamItem) => {
  router.push({
    name: 'ExamAnalysisRes',
    query: { id: row.id }
  })
}

const handleDelete = (row: Api.Exam.ExamItem) => {
  ElMessageBox.confirm(`确定要删除考试记录 "${row.name}" 吗？此操作不可恢复。`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(async () => {
    const res = await fetchDeleteExam(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadData()
    }
  })
}

const getStatusType = (status: string) => {
  switch (status) {
    case '已解析': return 'success'
    case '解析中': return 'warning'
    case '待解析': return 'info'
    default: return ''
  }
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
}
.text-red-500 {
  color: #f56c6c;
}
</style>
