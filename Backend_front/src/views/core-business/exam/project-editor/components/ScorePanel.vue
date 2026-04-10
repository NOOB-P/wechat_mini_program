<template>
  <div class="score-panel">
    <div class="summary-row">
      <div class="summary-pill">
        <span>项目科目</span>
        <strong>{{ summaryStats.subjectCount ?? 0 }}</strong>
      </div>
      <div class="summary-pill">
        <span>已录入科目</span>
        <strong>{{ summaryStats.uploadedSubjectCount ?? 0 }}</strong>
      </div>
      <div class="summary-pill">
        <span>成绩条数</span>
        <strong>{{ summaryStats.scoreRecordCount ?? 0 }}</strong>
      </div>
      <div class="summary-pill">
        <span>项目考生</span>
        <strong>{{ summaryStats.studentCount ?? 0 }}</strong>
      </div>
    </div>

    <el-card shadow="never" class="panel-card">
      <template #header>
        <div class="section-header">
          <div>
            <div class="section-title">考试科目管理</div>
            <div class="section-desc">点击学科进入对应成绩管理页，按学科逐步维护成绩数据。</div>
          </div>
        </div>
      </template>

      <el-table
        v-loading="summaryLoading"
        :data="summaryData"
        stripe
        row-class-name="subject-row"
        @row-click="handleEnterSubject"
      >
        <el-table-column prop="subjectName" label="科目" min-width="120" />
        <el-table-column prop="classCount" label="班级数" width="90" align="center" />
        <el-table-column prop="studentCount" label="学生数" width="100" align="center" />
        <el-table-column prop="scoreCount" label="成绩条数" width="100" align="center" />
        <el-table-column prop="avgScore" label="平均分" width="100" align="center" />
        <el-table-column prop="maxScore" label="最高分" width="100" align="center" />
        <el-table-column prop="minScore" label="最低分" width="100" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.scoreUploaded ? 'success' : 'info'">{{
              row.scoreUploaded ? '已录入' : '待录入'
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="110" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click.stop="handleEnterSubject(row)"
              >进入管理</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import {
    fetchProjectScoreSummary,
    type ProjectScoreSummaryItem
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

  const router = useRouter()
  const summaryLoading = ref(false)
  const summaryData = ref<ProjectScoreSummaryItem[]>([])
  const summaryStats = ref<Record<string, number>>({})

  async function loadSummary() {
    if (!props.projectId) return
    summaryLoading.value = true
    try {
      const res = await fetchProjectScoreSummary(props.projectId)
      summaryData.value = res.records ?? []
      summaryStats.value = res.stats ?? {}
    } finally {
      summaryLoading.value = false
    }
  }

  function handleEnterSubject(row: ProjectScoreSummaryItem) {
    router.push({
      name: 'ExamSubjectScore',
      query: {
        projectId: props.projectId,
        subjectName: row.subjectName
      }
    })
  }

  async function reload() {
    await loadSummary()
  }

  watch(
    () => props.projectId,
    () => {
      reload()
    }
  )

  onMounted(reload)

  defineExpose({
    reload
  })
</script>

<style scoped lang="scss">
  .score-panel {
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

  .panel-card {
    border: none;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

    :deep(.el-card__header) {
      background: #fff;
      border-bottom: 1px solid #f0f0f0;
      padding: 16px 20px;
    }

    :deep(.el-card__body) {
      padding: 24px;
    }
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .section-title {
    font-size: 16px;
    font-weight: 700;
    color: #303133;
  }

  .section-desc {
    margin-top: 6px;
    color: #909399;
    font-size: 13px;
  }

  :deep(.el-table__header-wrapper) th {
    background-color: #fafafa;
    color: #606266;
    font-weight: 600;
    height: 50px;
  }

  :deep(.subject-row) {
    cursor: pointer;
    height: 54px;
  }

  @media (max-width: 1100px) {
    .summary-row {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 640px) {
    .summary-row {
      grid-template-columns: 1fr;
    }
  }
</style>
