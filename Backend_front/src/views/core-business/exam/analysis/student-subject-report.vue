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
          <div class="metric-footer">满分: {{ subjectDetail.fullScore }} | 及格分: {{ subjectDetail.passScore }}</div>
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
          <div class="metric-title">班级对比</div>
          <div class="metric-value text-success">
            {{ subjectDetail.classAvg }} <small>平均</small>
          </div>
          <div class="metric-footer">班及格率: {{ subjectDetail.classPassRate }}% | 优秀率: {{ subjectDetail.classExcellentRate }}%</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="metric-card">
          <div class="metric-title">全校对比</div>
          <div class="metric-value text-warning">
            {{ subjectDetail.schoolAvg }} <small>平均</small>
          </div>
          <div class="metric-footer">校及格率: {{ subjectDetail.schoolPassRate }}% | 优秀率: {{ subjectDetail.schoolExcellentRate }}%</div>
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
        <el-card shadow="never" header="知识点掌握情况 (得分率)">
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
      <el-table :data="wrongQuestions" border style="width: 100%" size="small">
        <el-table-column prop="questionNo" label="题号" width="80" align="center" />
        <el-table-column prop="type" label="题型" width="100" align="center" />
        <el-table-column label="得分情况" align="center">
          <el-table-column prop="score" label="个人得分" width="80" align="center">
            <template #default="{ row }">
              <span :class="row.score === 0 ? 'text-danger' : ''">{{ row.score }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="fullScore" label="满分" width="80" align="center" />
          <el-table-column prop="avgScore" label="全校平均" width="80" align="center" />
        </el-table-column>
        <el-table-column prop="knowledgePoint" label="考察知识点" min-width="150" align="left" />
        <el-table-column prop="difficulty" label="难度" width="100" align="center">
          <template #default="{ row }">
            <el-rate v-model="row.difficulty" disabled :max="3" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default>
            <el-button type="primary" link>查看解析</el-button>
            <el-button type="success" link>加入错题本</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as echarts from 'echarts'

const route = useRoute()
const router = useRouter()

const projectId = route.query.projectId as string
const projectName = route.query.projectName as string
const schoolId = route.query.schoolId as string
const schoolName = route.query.schoolName as string
const classId = route.query.classId as string
const className = route.query.className as string
const studentId = route.query.studentId as string
const studentName = route.query.studentName as string
const subjectName = route.query.subjectName as string

const distChart = ref<HTMLElement>()
const knowledgeChart = ref<HTMLElement>()
let chartInstances: echarts.ECharts[] = []

const subjectDetail = ref({
  score: 142,
  grade: 'A',
  fullScore: 150,
  passScore: 90,
  classRank: 1,
  schoolRank: 12,
  classAvg: 105.5,
  classPassRate: 92.5,
  classExcellentRate: 35.2,
  schoolAvg: 98.4,
  schoolPassRate: 88.6,
  schoolExcellentRate: 28.5
})

const wrongQuestions = ref([
  { questionNo: '12', type: '选择题', score: 0, fullScore: 5, avgScore: 3.2, knowledgePoint: '导数单调性与极值', difficulty: 3 },
  { questionNo: '16', type: '填空题', score: 4, fullScore: 12, avgScore: 7.8, knowledgePoint: '圆锥曲线离心率', difficulty: 3 },
  { questionNo: '21', type: '解答题', score: 8, fullScore: 12, avgScore: 6.5, knowledgePoint: '立体几何体积计算', difficulty: 2 }
])

const getGradeColor = (grade: string) => {
  const colors: Record<string, string> = {
    'A': '#67C23A',
    'B': '#409EFF',
    'C': '#E6A23C',
    'D': '#F56C6C'
  }
  return colors[grade] || '#333'
}

const goBack = () => {
  router.push({
    name: 'ExamAnalysisStudentReport',
    query: { projectId, projectName, schoolId, schoolName, classId, className, studentId, studentName }
  })
}

const handlePrint = () => {
  window.print()
}

const initDistChart = () => {
  if (!distChart.value) return
  const chart = echarts.init(distChart.value)
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
    xAxis: { type: 'category', data: ['0-30', '30-60', '60-90', '90-120', '120-150'] },
    yAxis: { type: 'value', name: '人数' },
    series: [
      {
        name: '班级人数分布',
        type: 'bar',
        data: [2, 5, 12, 25, 6],
        itemStyle: { color: '#409eff' },
        markPoint: {
          data: [{ name: '个人得分位置', coord: [4, 6], value: '我', itemStyle: { color: '#f56c6c' } }]
        }
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
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
    yAxis: { type: 'category', data: ['导数', '圆锥曲线', '立体几何', '三角函数', '集合与函数'] },
    series: [
      {
        name: '个人得分率',
        type: 'bar',
        data: [65, 72, 85, 95, 100],
        itemStyle: {
          color: function(params: any) {
            return params.value < 60 ? '#f56c6c' : params.value < 85 ? '#e6a23c' : '#67c23a'
          }
        },
        label: { show: true, position: 'right', formatter: '{c}%' }
      }
    ]
  }
  chart.setOption(option)
  chartInstances.push(chart)
}

const handleResize = () => {
  chartInstances.forEach(instance => instance.resize())
}

onMounted(() => {
  initDistChart()
  initKnowledgeChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstances.forEach(instance => instance.dispose())
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
.text-success { color: #67C23A; }
.text-warning { color: #E6A23C; }
.text-primary { color: #409EFF; }
.text-danger { color: #F56C6C; }
.chart-box {
  height: 400px;
  width: 100%;
}

@media print {
  .page-container { background-color: #fff !important; padding: 0 !important; }
  .el-page-header { display: none; }
}
</style>
