<template>
  <div class="overview-panel">
    <div class="stats-grid">
      <el-card v-for="(item, index) in statCards" :key="item.label" shadow="never" class="stat-card" :class="`stat-card--${index}`">
        <div class="stat-card-inner">
          <div class="stat-content">
            <div class="stat-card__label">{{ item.label }}</div>
            <div class="stat-card__value">
              <span class="value-text">{{ item.value }}</span>
            </div>
            <div class="stat-card__desc">{{ item.desc }}</div>
          </div>
          <div class="stat-icon-wrapper">
            <el-icon class="stat-icon"><component :is="item.icon" /></el-icon>
          </div>
        </div>
      </el-card>
    </div>

    <div class="content-grid">
      <el-card shadow="never" class="section-card">
        <template #header>
          <div class="section-title">
            <el-icon class="title-icon"><School /></el-icon>
            参与学校
          </div>
        </template>
        <el-table :data="detail.schools" class="custom-table">
          <el-table-column prop="schoolName" label="学校" min-width="180">
            <template #default="{ row }">
              <span class="fw-medium">{{ row.schoolName }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="classCount" label="班级数" width="100" align="center" />
          <el-table-column prop="studentCount" label="学生数" width="100" align="center" />
        </el-table>
      </el-card>

      <el-card shadow="never" class="section-card">
        <template #header>
          <div class="section-title">
            <el-icon class="title-icon"><Reading /></el-icon>
            考试科目
          </div>
        </template>
        <el-table :data="detail.subjects" class="custom-table">
          <el-table-column prop="subjectName" label="科目" min-width="120">
            <template #default="{ row }">
              <span class="fw-medium">{{ row.subjectName }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="classCount" label="班级数" width="90" align="center" />
          <el-table-column prop="studentCount" label="学生数" width="90" align="center" />
          <el-table-column prop="scoreCount" label="成绩条数" width="110" align="center" />
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.scoreUploaded ? 'success' : 'info'" effect="light" class="status-tag">{{
                row.scoreUploaded ? '已录入' : '待录入'
              }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <el-card shadow="never" class="section-card">
      <template #header>
        <div class="section-title">
          <el-icon class="title-icon"><OfficeBuilding /></el-icon>
          参与班级
        </div>
      </template>
      <el-table :data="detail.classes" class="custom-table">
        <el-table-column prop="school" label="学校" min-width="180">
          <template #default="{ row }">
            <span class="fw-medium">{{ row.school }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="grade" label="年级" width="120" align="center" />
        <el-table-column prop="className" label="班级" width="120" align="center" />
        <el-table-column prop="studentCount" label="学生数" width="120" align="center" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { School, Reading, OfficeBuilding, User, Document, DocumentCopy } from '@element-plus/icons-vue'
  import type { ExamProjectDetailData } from '@/api/core-business/exam/project'

  const props = defineProps<{
    detail: ExamProjectDetailData
  }>()

  const statCards = computed(() => [
    {
      label: '覆盖学校',
      value: props.detail.stats.schoolCount ?? 0,
      desc: '当前项目纳入的学校总数',
      icon: 'School'
    },
    {
      label: '参与班级',
      value: props.detail.stats.classCount ?? 0,
      desc: '按当前配置自动生成的班级范围',
      icon: 'OfficeBuilding'
    },
    {
      label: '项目考生',
      value: props.detail.stats.studentCount ?? 0,
      desc: '将进入考生管理与成绩管理的数据池',
      icon: 'User'
    },
    {
      label: '成绩记录',
      value: props.detail.stats.scoreRecordCount ?? 0,
      desc: '当前项目已经录入的总成绩条数',
      icon: 'Document'
    }
  ])
</script>

<style scoped lang="scss">
  .overview-panel {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding-bottom: 24px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 20px;
  }

  .stat-card {
    border: none;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    background: #fff;
    transition: transform 0.3s, box-shadow 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.08);
    }

    :deep(.el-card__body) {
      padding: 20px;
    }
  }

  .stat-card-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stat-content {
    flex: 1;
    min-width: 0;
  }

  .stat-card__label {
    color: #909399;
    font-size: 14px;
    font-weight: 500;
  }

  .stat-card__value {
    margin-top: 8px;
    font-size: 24px;
    font-weight: 700;
    color: #303133;
    line-height: 1.2;
  }

  .stat-card__desc {
    margin-top: 8px;
    color: #c0c4cc;
    font-size: 12px;
    line-height: 1.4;
  }

  .stat-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 8px;
    background-color: #f5f7fa;
  }

  .stat-icon {
    font-size: 20px;
    color: #409eff;
  }

  .content-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .section-card {
    border: none;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    background: #fff;

    :deep(.el-card__header) {
      background: #fff;
      border-bottom: 1px solid #f0f0f0;
      padding: 16px 20px;
    }

    :deep(.el-card__body) {
      padding: 20px;
    }
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 700;
    color: #303133;
  }

  .title-icon {
    color: #409eff;
    font-size: 18px;
  }

  .custom-table {
    :deep(.el-table__header-wrapper) th {
      background-color: #fafafa;
      color: #606266;
      font-weight: 600;
    }
  }

  .fw-medium {
    font-weight: 500;
    color: #606266;
  }

  .status-tag {
    border-radius: 4px;
    border: none;
  }

  @media (max-width: 1100px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .content-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
