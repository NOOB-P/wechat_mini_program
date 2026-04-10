<template>
  <div class="student-panel">
    <div class="summary-row">
      <div class="summary-pill">
        <span>覆盖学校</span>
        <strong>{{ stats.schoolCount ?? 0 }}</strong>
      </div>
      <div class="summary-pill">
        <span>参与班级</span>
        <strong>{{ stats.classCount ?? 0 }}</strong>
      </div>
      <div class="summary-pill">
        <span>考生总数</span>
        <strong>{{ stats.studentCount ?? 0 }}</strong>
      </div>
      <div class="summary-pill">
        <span>已完成录入</span>
        <strong>{{ stats.completedCount ?? 0 }}</strong>
      </div>
    </div>

    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="searchForm" class="filter-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            clearable
            placeholder="姓名 / 考号"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="学校">
          <el-select
            v-model="searchForm.schoolId"
            clearable
            placeholder="全部学校"
            style="width: 180px"
          >
            <el-option
              v-for="item in schools"
              :key="item.schoolId"
              :label="item.schoolName"
              :value="item.schoolId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select
            v-model="searchForm.classId"
            clearable
            placeholder="全部班级"
            style="width: 220px"
          >
            <el-option
              v-for="item in classes"
              :key="item.sourceClassId"
              :label="`${item.school} / ${item.grade}${item.className}`"
              :value="item.sourceClassId"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="tableData" stripe class="custom-table">
        <el-table-column prop="studentNo" label="考号" width="150" />
        <el-table-column prop="studentName" label="姓名" width="120" />
        <el-table-column prop="school" label="学校" min-width="180" />
        <el-table-column prop="grade" label="年级" width="100" align="center" />
        <el-table-column prop="className" label="班级" width="100" align="center" />
        <el-table-column label="完成进度" width="130" align="center">
          <template #default="{ row }"
            >{{ row.completedSubjectCount }} / {{ row.subjectCount }}</template
          >
        </el-table-column>
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTypeMap[row.status] ?? 'info'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="loadData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, reactive, ref, watch } from 'vue'
  import {
    fetchProjectStudents,
    type ProjectStudentItem
  } from '@/api/core-business/exam/project-editor'

  interface SchoolRow {
    schoolId: string
    schoolName: string
  }

  interface ClassRow {
    school: string
    grade: string
    className: string
    sourceClassId: string
  }

  const props = defineProps<{
    projectId: string
    schools: SchoolRow[]
    classes: ClassRow[]
  }>()

  const loading = ref(false)
  const tableData = ref<ProjectStudentItem[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const stats = ref<Record<string, number>>({})

  const searchForm = reactive({
    keyword: '',
    schoolId: '',
    classId: ''
  })

  const statusTypeMap: Record<string, 'success' | 'warning' | 'info'> = {
    已完成: 'success',
    录入中: 'warning',
    待录入: 'info'
  }

  async function loadData() {
    if (!props.projectId) return
    loading.value = true
    try {
      const res = await fetchProjectStudents({
        projectId: props.projectId,
        current: page.value,
        size: pageSize.value,
        keyword: searchForm.keyword,
        schoolId: searchForm.schoolId || undefined,
        classId: searchForm.classId || undefined
      })
      tableData.value = res.records ?? []
      total.value = res.total ?? 0
      stats.value = res.stats ?? {}
    } finally {
      loading.value = false
    }
  }

  function handleSearch() {
    page.value = 1
    loadData()
  }

  function handleReset() {
    searchForm.keyword = ''
    searchForm.schoolId = ''
    searchForm.classId = ''
    page.value = 1
    loadData()
  }

  watch(
    () => props.projectId,
    () => {
      page.value = 1
      loadData()
    }
  )

  onMounted(loadData)

  defineExpose({
    reload: loadData
  })
</script>

<style scoped lang="scss">
  .student-panel {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding-bottom: 24px;
  }

  .summary-row {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
  }

  .summary-pill {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: #fff;
    border: none;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }

  .summary-pill span {
    color: #909399;
    font-size: 14px;
    font-weight: 500;
  }

  .summary-pill strong {
    font-size: 24px;
    color: #409eff;
    font-weight: 700;
  }

  .filter-card {
    border: none;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

    :deep(.el-card__body) {
      padding: 24px;
    }
  }

  .filter-form {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 20px;

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

  .custom-table {
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

  .pagination-wrap {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }

  @media (max-width: 1100px) {
    .summary-row {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .filter-form :deep(.el-form-item:last-child) {
      margin-left: 0;
      margin-top: 12px;
      width: 100%;
    }
  }

  @media (max-width: 640px) {
    .summary-row {
      grid-template-columns: 1fr;
    }
  }
</style>
