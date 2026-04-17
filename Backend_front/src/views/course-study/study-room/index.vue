<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <span class="font-bold">AI 自习室报名管理</span>
      </template>

      <el-table :data="tableData" border v-loading="loading">
        <el-table-column prop="parentName" label="家长姓名" width="120" />
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="phone" label="联系电话" width="150" />
        <el-table-column prop="applyTime" label="报名时间" width="180" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div v-if="row.status === 'pending'">
              <el-button link type="primary" @click="handleApply(row, 'confirmed')">确认</el-button>
              <el-button link type="danger" @click="handleApply(row, 'rejected')">拒绝</el-button>
            </div>
            <span v-else class="text-gray-400 text-sm">已处理</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchGetStudyRoomApplyList, fetchHandleStudyRoomApply } from '@/api/course-study/study-room/index'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const tableData = ref<any[]>([])

const loadData = async () => {
  loading.value = true
  const res = await fetchGetStudyRoomApplyList({})
  if (res.code === 200) {
    tableData.value = res.data.list
  }
  loading.value = false
}

const statusTypeMap = {
  pending: 'warning',
  confirmed: 'success',
  rejected: 'danger'
} as const

const getStatusType = (status: string): 'warning' | 'success' | 'danger' | 'info' => {
  return (statusTypeMap as any)[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '待处理',
    confirmed: '已确认',
    rejected: '已拒绝'
  }
  return labels[status] || '未知'
}

const handleApply = (row: any, status: string) => {
  const action = status === 'confirmed' ? '确认' : '拒绝'
  ElMessageBox.confirm(`确定要${action}该家长的报名申请吗?`, '提示', {
    type: status === 'confirmed' ? 'success' : 'warning'
  }).then(async () => {
    const res = await fetchHandleStudyRoomApply(row.id, status)
    if (res.code === 200) {
      ElMessage.success(res.msg)
      loadData()
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
