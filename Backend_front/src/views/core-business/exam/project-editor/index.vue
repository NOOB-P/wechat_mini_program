<template>
  <div v-loading="loading" class="editor-page">
    <div v-if="detail" class="editor-top">
      <div class="editor-back" @click="goBack">
        <el-icon class="editor-back__icon"><Back /></el-icon>
        <span>返回项目列表</span>
      </div>

      <div class="header-card">
        <div class="header-content">
          <div class="header-copy">
            <div class="header-title">{{ detail.project.name || '考试项目编辑' }}</div>
            <div class="header-meta">
              <span class="meta-item">
                <el-icon><Reading /></el-icon>
                共 <span class="highlight">{{ detail.project.subjectCount }}</span> 个科目
              </span>
              <span class="meta-divider">|</span>
              <span class="meta-item">
                <el-icon><User /></el-icon>
                <span class="highlight">{{ detail.project.studentCount }}</span> 名考生
              </span>
              <span class="meta-divider">|</span>
              <span class="meta-item">
                <el-icon><Document /></el-icon>
                <span class="highlight">{{ detail.stats.scoreRecordCount ?? 0 }}</span> 条成绩记录
              </span>
            </div>
          </div>
          <div class="header-actions">
            <el-button @click="loadDetail" :icon="Refresh">刷新</el-button>
            <el-button type="primary" @click="handleEdit" :icon="Edit">修改项目配置</el-button>
          </div>
        </div>

        <el-tabs v-model="activeTab" class="editor-tabs">
          <el-tab-pane label="项目概览" name="overview" />
          <el-tab-pane label="考生管理" name="students" />
          <el-tab-pane label="成绩管理" name="scores" />
        </el-tabs>
      </div>
    </div>

    <template v-if="detail">
      <OverviewPanel v-show="activeTab === 'overview'" :detail="detail" />
      <StudentPanel
        v-show="activeTab === 'students'"
        ref="studentPanelRef"
        :project-id="projectId"
        :schools="detail.schools"
        :classes="detail.classes"
      />
      <ScorePanel
        v-show="activeTab === 'scores'"
        ref="scorePanelRef"
        :project-id="projectId"
        :schools="detail.schools"
        :classes="detail.classes"
      />
    </template>

    <ProjectDialog
      v-model="dialogVisible"
      mode="edit"
      :project="dialogProject"
      :options="projectOptions"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { Back, Edit, Refresh, Reading, User, Document } from '@element-plus/icons-vue'
  import ProjectDialog from '../project/components/ProjectDialog.vue'
  import OverviewPanel from './components/OverviewPanel.vue'
  import ScorePanel from './components/ScorePanel.vue'
  import StudentPanel from './components/StudentPanel.vue'
  import type {
    ExamProjectDetailData,
    ExamProjectForm,
    ProjectClassOption,
    ProjectSchoolOption
  } from '@/api/core-business/exam/project'
  import { fetchProjectDetail, fetchProjectOptions } from '@/api/core-business/exam/project'

  const route = useRoute()
  const router = useRouter()
  const loading = ref(false)
  const activeTab = ref('overview')
  const detail = ref<ExamProjectDetailData | null>(null)
  const dialogVisible = ref(false)
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
  const studentPanelRef = ref<{ reload?: () => Promise<void> } | null>(null)
  const scorePanelRef = ref<{ reload?: () => Promise<void> } | null>(null)

  const projectId = computed(() => String(route.query.projectId || ''))

  async function loadDetail() {
    if (!projectId.value) {
      ElMessage.error('缺少项目ID')
      router.push({ name: 'ExamProject' })
      return
    }
    loading.value = true
    try {
      detail.value = await fetchProjectDetail(projectId.value)
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

  function goBack() {
    router.push({ name: 'ExamProject' })
  }

  function handleEdit() {
    if (!detail.value) return
    dialogProject.value = {
      id: detail.value.project.id,
      name: detail.value.project.name,
      examType: detail.value.project.examType,
      schoolIds: detail.value.project.selectedSchoolIds,
      classIds: detail.value.project.selectedClassIds,
      subjects: detail.value.project.subjects,
      benchmarks: detail.value.benchmarks || {}
    }
    dialogVisible.value = true
  }

  async function handleSaved() {
    await loadDetail()
    await Promise.all([studentPanelRef.value?.reload?.(), scorePanelRef.value?.reload?.()])
  }

  onMounted(async () => {
    await Promise.all([loadOptions(), loadDetail()])
  })
</script>

<style scoped lang="scss">
  .editor-page {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    background-color: #f5f7fa;
    min-height: 100vh;
  }

  .editor-top {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .editor-back {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    width: fit-content;
    color: #606266;
    font-size: 14px;
    cursor: pointer;
    user-select: none;
    transition: color 0.3s;

    &:hover {
      color: #409eff;
    }
  }

  .editor-back__icon {
    font-size: 16px;
  }

  .header-card {
    padding: 24px 24px 0;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    border: none;
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  .header-copy {
    display: flex;
    align-items: baseline;
    gap: 16px;
  }

  .header-title {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #303133;
  }

  .header-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #909399;
    font-size: 13px;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .meta-divider {
    color: #dcdfe6;
  }

  .highlight {
    color: #409eff;
    font-weight: 600;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }

  .editor-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 0;
    }

    :deep(.el-tabs__nav-wrap::after) {
      height: 1px;
      background-color: #f0f0f0;
    }

    :deep(.el-tabs__item) {
      height: 48px;
      line-height: 48px;
      font-size: 15px;
      color: #606266;

      &.is-active {
        color: #409eff;
        font-weight: 600;
      }
    }

    :deep(.el-tabs__active-bar) {
      height: 3px;
      border-radius: 3px 3px 0 0;
    }
  }

  @media (max-width: 900px) {
    .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }

    .header-actions {
      width: 100%;
    }
  }
</style>
