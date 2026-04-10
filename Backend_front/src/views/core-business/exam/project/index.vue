<template>
  <div class="project-page">
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form" @submit.prevent>
        <el-form-item label="项目名称">
          <el-input
            v-model="searchForm.name"
            clearable
            placeholder="请输入项目名称"
            prefix-icon="Search"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="list-card">
      <div class="list-header">
        <div class="list-header__left">
          <h2 class="list-title">考试项目管理</h2>
          <span class="list-count">共 {{ total }} 个考试项目</span>
        </div>
        <div class="list-header__right">
          <el-button type="primary" @click="handleCreate">
            <el-icon class="el-icon--left"><Plus /></el-icon>添加项目
          </el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="tableData" stripe class="custom-table">
        <el-table-column prop="name" label="考试项目名称" min-width="220">
          <template #default="{ row }">
            <span class="project-name" @click="handleEnter(row)">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="考试科目" min-width="220">
          <template #default="{ row }">
            <div class="subject-tags">
              <el-tag v-for="subject in row.subjects" :key="subject" size="small" effect="light" class="subject-tag">{{
                subject
              }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="schoolCount" label="学校数" width="100" align="center" />
        <el-table-column prop="classCount" label="班级数" width="100" align="center" />
        <el-table-column prop="studentCount" label="考生数" width="100" align="center" />
        <el-table-column label="更新时间" width="180" align="center">
          <template #default="{ row }">
            <span class="time-text">{{ formatDate(row.updateTime || row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEnter(row)">进入</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <ProjectDialog
      v-model="dialogVisible"
      mode="create"
      :options="projectOptions"
      :project="dialogProject"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, reactive, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessageBox } from 'element-plus'
  import { Plus, Search } from '@element-plus/icons-vue'
  import ProjectDialog from './components/ProjectDialog.vue'
  import type {
    ExamProjectForm,
    ExamProjectItem,
    ProjectClassOption,
    ProjectSchoolOption
  } from '@/api/core-business/exam/project'
  import {
    fetchDeleteProject,
    fetchGetProjectList,
    fetchProjectOptions
  } from '@/api/core-business/exam/project'

  const router = useRouter()
  const loading = ref(false)
  const dialogVisible = ref(false)
  const tableData = ref<ExamProjectItem[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const dialogProject = ref<Partial<ExamProjectForm> | null>(null)
  const projectOptions = ref<{
    schools: ProjectSchoolOption[]
    classes: ProjectClassOption[]
    subjects: string[]
  }>({
    schools: [],
    classes: [],
    subjects: []
  })

  const searchForm = reactive({
    name: ''
  })

  async function loadData() {
    loading.value = true
    try {
      const res = await fetchGetProjectList({
        current: page.value,
        size: pageSize.value,
        name: searchForm.name
      })
      tableData.value = res.records ?? []
      total.value = res.total ?? 0
    } finally {
      loading.value = false
    }
  }

  async function loadOptions() {
    const res = await fetchProjectOptions()
    projectOptions.value = {
      schools: res.schools ?? [],
      classes: res.classes ?? [],
      subjects: res.subjects ?? []
    }
  }

  function handleSearch() {
    page.value = 1
    loadData()
  }

  function handleSizeChange() {
    page.value = 1
    loadData()
  }

  function handleReset() {
    searchForm.name = ''
    page.value = 1
    loadData()
  }

  function handleCreate() {
    dialogProject.value = {
      name: '',
      schoolIds: [],
      classIds: [],
      subjects: []
    }
    dialogVisible.value = true
  }

  function handleEnter(row: ExamProjectItem) {
    router.push({
      name: 'ExamProjectEditor',
      query: {
        projectId: row.id
      }
    })
  }

  async function handleDelete(row: ExamProjectItem) {
    await ElMessageBox.confirm(
      `确定删除考试项目“${row.name}”吗？项目下班级、科目和成绩数据会一起删除。`,
      '删除确认',
      {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      }
    )
    await fetchDeleteProject(row.id)
    if (tableData.value.length === 1 && page.value > 1) {
      page.value -= 1
    }
    await loadData()
  }

  function handleSaved() {
    loadData()
  }

  function formatDate(value?: string | number[] | null) {
    if (!value) return '-'
    if (Array.isArray(value)) {
      const [year, month, date, hour = 0, minute = 0, second = 0] = value
      return `${year}-${pad(month)}-${pad(date)} ${pad(hour)}:${pad(minute)}:${pad(second)}`
    }
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return String(value)
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  }

  function pad(value: number) {
    return String(value).padStart(2, '0')
  }

  onMounted(async () => {
    await Promise.all([loadOptions(), loadData()])
  })
</script>

<style scoped lang="scss">
  .project-page {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .search-card {
    border: none;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

    :deep(.el-card__body) {
      padding: 20px 24px;
    }
  }

  .search-form {
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    :deep(.el-form-item) {
      margin-bottom: 0;
      margin-right: 24px;

      &:last-child {
        margin-right: 0;
        margin-left: auto;
      }

      .el-form-item__label {
        font-weight: 500;
        color: #606266;
      }
    }
  }

  .list-card {
    border: none;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    flex: 1;

    :deep(.el-card__body) {
      padding: 24px;
    }
  }

  .list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;

    &__left {
      display: flex;
      align-items: baseline;
      gap: 12px;
    }
  }

  .list-title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #303133;
  }

  .list-count {
    font-size: 13px;
    color: #909399;
  }

  .custom-table {
    margin-bottom: 20px;

    :deep(.el-table__header-wrapper) th {
      background-color: #fafafa;
      color: #606266;
      font-weight: 600;
      height: 50px;
    }

    :deep(.el-table__row) {
      height: 54px;
    }
  }

  .project-name {
    color: #303133;
    cursor: pointer;
    font-weight: 600;

    &:hover {
      color: #409eff;
      text-decoration: underline;
    }
  }

  .subject-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .subject-tag {
    border: none;
    background-color: #f0f7ff;
    color: #409eff;
  }

  .time-text {
    color: #909399;
    font-size: 13px;
  }

  .pagination-wrap {
    display: flex;
    justify-content: flex-end;
  }
</style>
