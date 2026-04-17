<template>
  <div class="page-container report-container">
    <el-page-header @back="goBack" class="mb-6">
      <template #content>
        <span class="text-large font-bold mr-3"> 学生分析报告 </span>
        <span class="text-sm mr-2" style="color: var(--el-text-color-regular)">
          {{ studentName }} ({{ schoolName }} | {{ className }})
        </span>
      </template>
      <template #extra>
        <el-button type="primary" size="small" @click="handlePrint">打印报告</el-button>
      </template>
    </el-page-header>

    <!-- 核心指标 -->
    <el-row :gutter="20" class="mb-6">
      <el-col :span="6">
        <el-card shadow="never" class="metric-card">
          <div class="metric-title">总分</div>
          <div class="metric-value">{{ overview.totalScore }}</div>
          <div class="metric-footer"
            >全校排名: {{ overview.schoolRank }} | 班级排名: {{ overview.classRank }}</div
          >
        </el-card>
      </el-col>
      <el-col :span="6" v-for="rate in personalRates" :key="rate.label">
        <el-card shadow="never" class="metric-card">
          <div class="metric-title">{{ rate.label }}</div>
          <div class="metric-status" :class="getStatusClass(rate.status)">{{ rate.text }}</div>
          <div class="metric-footer">{{ rate.desc }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 单科成绩详细分析 -->
    <el-card shadow="never" class="mb-6">
      <template #header>
        <span class="font-bold">单科成绩详细对比分析</span>
      </template>
      <el-table :data="subjectStats" border style="width: 100%" size="small">
        <el-table-column prop="subject" label="科目" width="100" align="center" fixed>
          <template #default="{ row }">
            <el-button type="primary" link @click="handleSubjectDetail(row.subject)">{{
              row.subject
            }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="分数对比" align="center">
          <el-table-column prop="score" label="个人得分" width="80" align="center">
            <template #default="{ row }">
              <span
                class="font-bold"
                :class="row.score >= row.passScore ? 'text-success' : 'text-danger'"
                >{{ row.score }}</span
              >
            </template>
          </el-table-column>
          <el-table-column prop="avgScore" label="班级平均" width="80" align="center" />
          <el-table-column prop="schoolAvg" label="全校平均" width="80" align="center" />
        </el-table-column>
        <el-table-column label="排名对比" align="center">
          <el-table-column prop="classRank" label="班级排名" width="80" align="center" />
          <el-table-column prop="schoolRank" label="全校排名" width="80" align="center" />
        </el-table-column>
        <el-table-column label="及格率对比" align="center">
          <el-table-column prop="status" label="及格状态" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="row.score >= row.passScore ? 'success' : 'danger'" size="small">
                {{ row.score >= row.passScore ? '及格' : '不及格' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="classPassRate" label="班级及格率" width="100" align="center">
            <template #default="{ row }">{{ row.classPassRate }}%</template>
          </el-table-column>
          <el-table-column prop="schoolPassRate" label="全校及格率" width="100" align="center">
            <template #default="{ row }">{{ row.schoolPassRate }}%</template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="优势分析" align="left">
          <template #default="{ row }">
            <span class="text-xs">{{ row.analysis }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-row :gutter="20" class="mb-6">
      <!-- 学科均衡分析 -->
      <el-col :span="12">
        <el-card shadow="never" header="学科得分雷达图 (均衡性分析)">
          <div ref="radarChart" class="chart-box"></div>
        </el-card>
      </el-col>
      <!-- 分数对比分析 -->
      <el-col :span="12">
        <el-card shadow="never" header="个人得分 vs 班级/全校平均">
          <div ref="compareBarChart" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, nextTick } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import * as echarts from 'echarts'
  import { ElMessage } from 'element-plus'
  import { fetchAnalysisStudentReport } from '@/api/core-business/exam/analysis/student-report'

  const route = useRoute()
  const router = useRouter()

  const projectId = route.query.projectId as string
  const projectName = route.query.projectName as string
  const schoolId = route.query.schoolId as string
  const schoolName = route.query.schoolName as string
  const classId = route.query.classId as string
  const className = route.query.className as string
  const studentNo = String(route.query.studentNo || route.query.studentId || '')
  const studentName = route.query.studentName as string

  const radarChart = ref<HTMLElement>()
  const compareBarChart = ref<HTMLElement>()

  let chartInstances: echarts.ECharts[] = []

  const overview = ref({ totalScore: 0, classRank: 0, schoolRank: 0 })
  const personalRates = ref<any[]>([])
  const subjectStats = ref<any[]>([])

  const getStatusClass = (status: string) => {
    const classes: Record<string, string> = {
      pass: 'text-success',
      excel: 'text-warning',
      safe: 'text-primary',
      warn: 'text-danger'
    }
    return classes[status] || ''
  }
  const goBack = () => {
    router.push({
      name: 'ExamAnalysisClassDashboard',
      query: { projectId, projectName, schoolId, schoolName, classId, className }
    })
  }

  const handleSubjectDetail = (subject: string) => {
    router.push({
      name: 'ExamAnalysisStudentSubjectReport',
      query: {
        projectId,
        projectName,
        schoolId,
        schoolName,
        classId,
        className,
        studentNo,
        studentName,
        subjectName: subject
      }
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const initRadarChart = () => {
    if (!radarChart.value) return
    const chart = echarts.init(radarChart.value)
    const option = {
      tooltip: { trigger: 'item' },
      legend: { bottom: 0, left: 'center' },
      radar: {
        indicator: subjectStats.value.map((item) => ({
          name: item.subject,
          max: Math.max(item.score, item.avgScore, item.schoolAvg, item.passScore, 100)
        })),
        axisName: { color: '#333' }
      },
      series: [
        {
          name: '成绩对比',
          type: 'radar',
          data: [
            {
              value: subjectStats.value.map((item) => item.score),
              name: '个人得分',
              itemStyle: { color: '#409eff' },
              areaStyle: { opacity: 0.3 }
            },
            {
              value: subjectStats.value.map((item) => item.avgScore),
              name: '班级平均',
              itemStyle: { color: '#67c23a' },
              lineStyle: { type: 'dashed' }
            }
          ]
        }
      ]
    }
    chart.setOption(option)
    chartInstances.push(chart)
  }

  const initBarChart = () => {
    if (!compareBarChart.value) return
    const chart = echarts.init(compareBarChart.value)
    const option = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { bottom: 0, left: 'center' },
      grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        data: subjectStats.value.map((item) => item.subject)
      },
      yAxis: {
        type: 'value',
        name: '分数'
      },
      series: [
        {
          name: '个人得分',
          type: 'bar',
          data: subjectStats.value.map((item) => item.score),
          itemStyle: { color: '#409eff' }
        },
        {
          name: '班级平均',
          type: 'bar',
          data: subjectStats.value.map((item) => item.avgScore),
          itemStyle: { color: '#67c23a' }
        },
        {
          name: '全校平均',
          type: 'bar',
          data: subjectStats.value.map((item) => item.schoolAvg),
          itemStyle: { color: '#e6a23c' }
        }
      ]
    }
    chart.setOption(option)
    chartInstances.push(chart)
  }

  const handleResize = () => {
    chartInstances.forEach((instance) => instance.resize())
  }

  onMounted(() => {
    fetchAnalysisStudentReport({ projectId, classId, studentNo })
      .then(async (res) => {
        overview.value = res.overview || overview.value
        personalRates.value = res.statusCards || []
        subjectStats.value = res.subjectStats || []
        await nextTick()
        initRadarChart()
        initBarChart()
      })
      .catch((error: any) => {
        ElMessage.error(error.message || '加载学生分析报告失败')
      })
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    chartInstances.forEach((instance) => instance.dispose())
  })
</script>

<style scoped>
  .page-container {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: 100vh;
  }
  .metric-card {
    text-align: center;
  }
  .metric-title {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    margin-bottom: 12px;
  }
  .metric-value {
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 8px;
    color: var(--el-color-primary);
  }
  .metric-status {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 8px;
  }
  .metric-footer {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
  .text-success {
    color: #67c23a;
  }
  .text-warning {
    color: #e6a23c;
  }
  .text-primary {
    color: #409eff;
  }
  .text-danger {
    color: #f56c6c;
  }
  .chart-box {
    height: 400px;
    width: 100%;
  }

  @media print {
    .page-container {
      background-color: #fff !important;
      padding: 0 !important;
    }
    .el-page-header {
      display: none;
    }
  }
</style>
