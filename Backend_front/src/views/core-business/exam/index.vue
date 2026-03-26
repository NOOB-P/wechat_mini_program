<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <span>考试数据中心</span>
          <el-button type="primary" @click="handleUpload">上传考试数据</el-button>
        </div>
      </template>

      <el-table :data="tableData" border style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="考试名称" />
        <el-table-column prop="date" label="考试日期" width="150" />
        <el-table-column prop="status" label="解析状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === '已解析' ? 'success' : 'warning'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="successCount" label="成功匹配" width="120" />
        <el-table-column prop="failCount" label="匹配失败" width="120">
          <template #default="{ row }">
            <span :class="row.failCount > 0 ? 'text-red-500 font-bold' : ''">{{ row.failCount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewResult(row)" :disabled="row.status !== '已解析'">查看结果</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <UploadPanel v-model:visible="uploadVisible" @success="loadData" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchGetExamList } from '@/api/core-business/exam/index'
import UploadPanel from './upload-panel.vue'

const router = useRouter()
const loading = ref(false)
const tableData = ref<any[]>([])
const uploadVisible = ref(false)

const loadData = async () => {
  loading.value = true
  const res = await fetchGetExamList({})
  if (res.code === 200) {
    tableData.value = res.data.list
  }
  loading.value = false
}

const handleUpload = () => {
  uploadVisible.value = true
}

const viewResult = (row: any) => {
  router.push({
    name: 'ExamAnalysisRes',
    query: { id: row.id }
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
