<template>
  <div class="page-container">
    <el-card shadow="never" class="search-card mb-4">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-bold">选择分析项目</span>
        </div>
      </template>
      <el-form :inline="true" :model="searchForm" class="search-form-inline">
        <el-form-item label="考试项目">
          <el-input v-model="searchForm.name" placeholder="请输入考试项目名称" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="8" v-for="item in tableData" :key="item.id" class="mb-4">
        <el-card shadow="hover" class="project-card" @click="handleEnter(item)">
          <div class="project-info">
            <div class="project-name">{{ item.name }}</div>
            <div class="project-meta">
              <span>创建时间: {{ item.createTime }}</span>
            </div>
            <div class="project-stats mt-4 flex justify-around text-center">
              <div>
                <div class="stat-value">12</div>
                <div class="stat-label">参与学校</div>
              </div>
              <div>
                <div class="stat-value">45</div>
                <div class="stat-label">参与班级</div>
              </div>
              <div>
                <div class="stat-value">2,450</div>
                <div class="stat-label">考生人数</div>
              </div>
            </div>
          </div>
          <div class="mt-4 text-right flex justify-end gap-2">
            <el-button type="primary" plain size="small" @click.stop="handleEnter(item)">
              分析大屏
            </el-button>
            <el-button type="success" plain size="small" @click.stop="handleSelectClass(item)">
              班级分析
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchForm = ref({
  name: ''
})

const tableData = ref([
  { id: '1', name: '2023-2024学年第一学期期中联考', createTime: '2023-11-01' },
  { id: '2', name: '2024年春季学期摸底考试', createTime: '2024-03-01' },
  { id: '3', name: '2023年高二上学期期末考试', createTime: '2024-01-15' }
])

const handleSearch = () => {
  // 搜索逻辑
}

const resetSearch = () => {
  searchForm.value.name = ''
}

const handleEnter = (item: any) => {
  router.push({
    name: 'ExamAnalysisDashboard',
    query: { projectId: item.id, projectName: item.name }
  })
}

const handleSelectClass = (item: any) => {
  router.push({
    name: 'ExamAnalysisClassSelect',
    query: { projectId: item.id, projectName: item.name }
  })
}
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.project-card {
  cursor: pointer;
  transition: transform 0.3s;
}
.project-card:hover {
  transform: translateY(-5px);
}
.project-name {
  font-size: 16px;
  font-bold: bold;
  margin-bottom: 10px;
  color: var(--el-text-color-primary);
}
.project-meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: var(--el-color-primary);
}
.stat-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
