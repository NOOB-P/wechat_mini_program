<template>
  <div class="page-container report-container">
    <el-page-header @back="goBack" class="mb-6">
      <template #content>
        <span class="text-large font-bold mr-3"> 学生单科分析报告 - {{ subjectName }} </span>
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
          <div class="metric-title">得分 / 等级</div>
          <div class="metric-value" :style="{ color: getGradeColor(subjectDetail.grade) }">
            {{ subjectDetail.score }} <small>/ {{ subjectDetail.grade }}级</small>
          </div>
          <div class="metric-footer">
            满分: {{ subjectDetail.fullScore }} | 及格分: {{ subjectDetail.passScore }} | 优秀分:
            {{ subjectDetail.excellentScore }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="metric-card">
          <div class="metric-title">排名对比</div>
          <div class="metric-value text-primary">
            {{ subjectDetail.classRank }} <small>/ {{ subjectDetail.schoolRank }}</small>
          </div>
          <div class="metric-footer">班级排名 | 全校排名</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="metric-card">
          <div class="metric-title">班级均分</div>
          <div class="metric-value text-success">
            {{ subjectDetail.classAvg }} <small>分</small>
          </div>
          <div class="metric-footer">
            {{ compareLabel(subjectDetail.score, subjectDetail.classAvg, '班均') }} | 班及格率:
            {{ subjectDetail.classPassRate }}% | 优秀率: {{ subjectDetail.classExcellentRate }}%
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="metric-card">
          <div class="metric-title">校级均分</div>
          <div class="metric-value text-warning">
            {{ subjectDetail.schoolAvg }} <small>分</small>
          </div>
          <div class="metric-footer">
            {{ compareLabel(subjectDetail.score, subjectDetail.schoolAvg, '校均') }} | 校及格率:
            {{ subjectDetail.schoolPassRate }}% | 优秀率: {{ subjectDetail.schoolExcellentRate }}%
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mb-6">
      <!-- 成绩趋势/分布图 -->
      <el-col :span="12">
        <el-card shadow="never" header="班级成绩分布对比">
          <div ref="distChart" class="chart-box"></div>
        </el-card>
      </el-col>
      <!-- 知识点得分率 -->
      <el-col :span="12">
        <el-card shadow="never" header="小题掌握情况 (得分率)">
          <div ref="knowledgeChart" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 错题明细 -->
    <el-card shadow="never" class="mb-6">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-bold">{{ subjectName }} 错题明细及解析</span>
        </div>
      </template>
      <el-table
        :data="wrongQuestions"
        border
        style="width: 100%"
        size="small"
        empty-text="当前学科暂无错题"
      >
        <el-table-column prop="questionNo" label="题号" width="80" align="center" />
        <el-table-column prop="type" label="题型" width="100" align="center" />
        <el-table-column label="得分情况" align="center">
          <el-table-column prop="score" label="个人得分" width="80" align="center">
            <template #default="{ row }">
              <span :class="row.score === 0 ? 'text-danger' : ''">{{ row.score }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="fullScore" label="满分" width="80" align="center" />
          <el-table-column prop="avgScore" label="班级平均" width="80" align="center" />
          <el-table-column prop="schoolAvg" label="全校平均" width="80" align="center" />
        </el-table-column>
        <el-table-column prop="lostScore" label="失分" width="80" align="center" />
        <el-table-column prop="difficulty" label="难度" width="100" align="center">
          <template #default="{ row }">
            <el-rate v-model="row.difficulty" disabled :max="3" />
          </template>
        </el-table-column>
        <el-table-column
          prop="explanation"
          label="失分分析及建议"
          min-width="340"
          show-overflow-tooltip
        />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, nextTick } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { echarts } from '@/plugins/echarts'
  import { ElMessage } from 'element-plus'
  import { fetchAnalysisStudentSubjectReport } from '@/api/core-business/exam/analysis/student-subject-report'

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
  const subjectName = route.query.subjectName as string

  const distChart = ref<HTMLElement>()
  const knowledgeChart = ref<HTMLElement>()
  let chartInstances: echarts.ECharts[] = []

  const subjectDetail = ref<any>({
    score: 0,
    grade: 'C',
    fullScore: 100,
    passScore: 60,
    classRank: 0,
    schoolRank: 0,
    classAvg: 0,
    classPassRate: 0,
    classExcellentRate: 0,
    schoolAvg: 0,
    schoolPassRate: 0,
    schoolExcellentRate: 0,
    excellentScore: 80
  })
  const scoreDistribution = ref<any[]>([])
  const questionRates = ref<any[]>([])
  const wrongQuestions = ref<any[]>([])

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      A: '#67C23A',
      B: '#409EFF',
      C: '#E6A23C',
      D: '#F56C6C'
    }
    return colors[grade] || '#333'
  }

  const goBack = () => {
    router.push({
      name: 'ExamAnalysisStudentReport',
      query: {
        projectId,
        projectName,
        schoolId,
        schoolName,
        classId,
        className,
        studentNo,
        studentName
      }
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const compareLabel = (score: number, average: number, target: string) => {
    const diff = Number((Number(score || 0) - Number(average || 0)).toFixed(1))
    if (diff === 0) return `与${target}持平`
    return diff > 0 ? `高于${target} ${diff} 分` : `低于${target} ${Math.abs(diff)} 分`
  }

  const initDistChart = () => {
    if (!distChart.value) return
    const chart = echarts.init(distChart.value)
    const option = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { bottom: 0 },
      grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
      xAxis: { type: 'category', data: scoreDistribution.value.map((item) => item.label) },
      yAxis: { type: 'value', name: '人数' },
      series: [
        {
          name: '班级人数分布',
          type: 'bar',
          data: scoreDistribution.value.map((item) => item.count),
          itemStyle: { color: '#409eff' },
          markPoint: { data: [] }
        }
      ]
    }
    chart.setOption(option)
    chartInstances.push(chart)
  }

  const initKnowledgeChart = () => {
    if (!knowledgeChart.value) return
    const chart = echarts.init(knowledgeChart.value)
    const option = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { bottom: 0 },
      grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
      xAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
      yAxis: { type: 'category', data: questionRates.value.map((item) => item.name) },
      series: [
        {
          name: '个人得分率',
          type: 'bar',
          data: questionRates.value.map((item) => item.rate),
          itemStyle: {
            color: function (params: any) {
              return params.value < 60 ? '#f56c6c' : params.value < 85 ? '#e6a23c' : '#67c23a'
            }
          },
          label: { show: true, position: 'right', formatter: '{c}%' }
        },
        {
          name: '班级得分率',
          type: 'bar',
          data: questionRates.value.map((item) => item.classRate),
          itemStyle: { color: '#409eff' }
        },
        {
          name: '全校得分率',
          type: 'bar',
          data: questionRates.value.map((item) => item.schoolRate),
          itemStyle: { color: '#909399' }
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
    fetchAnalysisStudentSubjectReport({ projectId, classId, studentNo, subjectName })
      .then(async (res) => {
        subjectDetail.value = res.subjectDetail || subjectDetail.value
        scoreDistribution.value = res.scoreDistribution || []
        questionRates.value = res.knowledgeRates || []
        wrongQuestions.value = res.wrongQuestions || []
        await nextTick()
        initDistChart()
        initKnowledgeChart()
      })
      .catch((error: any) => {
        ElMessage.error(error.message || '加载学生单科分析失败')
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
  }
  .metric-value small {
    font-size: 16px;
    font-weight: normal;
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
