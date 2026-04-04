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
          <div class="metric-value">685</div>
          <div class="metric-footer">全校排名: 12 | 班级排名: 1</div>
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
            <el-button type="primary" link @click="handleSubjectDetail(row.subject)">{{ row.subject }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="分数对比" align="center">
          <el-table-column prop="score" label="个人得分" width="80" align="center">
            <template #default="{ row }">
              <span class="font-bold" :class="row.score >= row.passScore ? 'text-success' : 'text-danger'">{{ row.score }}</span>
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

    <!-- 错题分析 -->
    <el-card shadow="never" class="mb-6">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-bold">小题错题及知识点分析</span>
          <el-select v-model="selectedSubject" size="small" style="width: 120px">
            <el-option label="全部科目" value="all" />
            <el-option label="语文" value="chinese" />
            <el-option label="数学" value="math" />
          </el-select>
        </div>
      </template>
      <el-table :data="wrongQuestions" border style="width: 100%" size="small">
        <el-table-column prop="subject" label="科目" width="80" align="center" />
        <el-table-column prop="questionNo" label="题号" width="60" align="center" />
        <el-table-column label="得分对比" align="center">
          <el-table-column prop="score" label="个人得分" width="80" align="center">
            <template #default="{ row }">
              <span :class="row.score === 0 ? 'text-danger' : ''">{{ row.score }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="fullScore" label="满分" width="60" align="center" />
          <el-table-column prop="avgScore" label="班级平均" width="80" align="center" />
        </el-table-column>
        <el-table-column label="得分率对比" align="center">
          <el-table-column prop="classRate" label="班级得分率" width="100" align="center">
            <template #default="{ row }">{{ row.classRate }}%</template>
          </el-table-column>
          <el-table-column prop="schoolRate" label="全校得分率" width="100" align="center">
            <template #default="{ row }">{{ row.schoolRate }}%</template>
          </el-table-column>
        </el-table-column>
        <el-table-column prop="knowledgePoint" label="考察知识点" min-width="150" align="left" />
        <el-table-column prop="difficulty" label="难度" width="100" align="center">
          <template #default="{ row }">
            <el-rate v-model="row.difficulty" disabled :max="3" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleSubjectDetail(row.subject)">查看详情</el-button>
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

const radarChart = ref<HTMLElement>()
const compareBarChart = ref<HTMLElement>()
const selectedSubject = ref('all')

let chartInstances: echarts.ECharts[] = []

const personalRates = ref([
  { label: '及格状态', text: '已及格', desc: '超过及格线125分', status: 'pass' },
  { label: '优秀状态', text: '达到优秀', desc: '进入全校前5%', status: 'excel' },
  { label: '临界分析', text: '非临界生', desc: '成绩稳居高分段', status: 'safe' }
])

const subjectStats = ref([
  { subject: '语文', score: 125, avgScore: 110, schoolAvg: 105, classRank: 5, schoolRank: 45, passScore: 90, classPassRate: 98, schoolPassRate: 95, analysis: '学科表现稳定，处于班级领先水平' },
  { subject: '数学', score: 142, avgScore: 105, schoolAvg: 98, classRank: 1, schoolRank: 12, passScore: 90, classPassRate: 92, schoolPassRate: 88, analysis: '数学优势明显，具有较强的学科竞争力' },
  { subject: '英语', score: 138, avgScore: 108, schoolAvg: 102, classRank: 3, schoolRank: 28, passScore: 90, classPassRate: 95, schoolPassRate: 92, analysis: '英语成绩优异，是主要的拉分学科' },
  { subject: '物理', score: 95, avgScore: 75, schoolAvg: 70, classRank: 4, schoolRank: 35, passScore: 60, classPassRate: 85, schoolPassRate: 82, analysis: '物理基础扎实，能够较好地应对复杂题型' },
  { subject: '化学', score: 92, avgScore: 78, schoolAvg: 72, classRank: 6, schoolRank: 52, passScore: 60, classPassRate: 88, schoolPassRate: 85, analysis: '化学表现良好，但仍有较大的提升空间' },
  { subject: '生物', score: 93, avgScore: 80, schoolAvg: 75, classRank: 5, schoolRank: 48, passScore: 60, classPassRate: 90, schoolPassRate: 87, analysis: '生物成绩均衡，在班级中游偏上' }
])

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pass: 'text-success',
    excel: 'text-warning',
    safe: 'text-primary'
  }
  return classes[status] || ''
}

const wrongQuestions = ref([
  { subject: '数学', questionNo: '12', score: 0, fullScore: 5, avgScore: 3.2, classRate: 64, schoolRate: 58, knowledgePoint: '导数单调性与极值', difficulty: 3 },
  { subject: '物理', questionNo: '8', score: 2, fullScore: 6, avgScore: 4.5, classRate: 75, schoolRate: 72, knowledgePoint: '电磁感应定律', difficulty: 2 },
  { subject: '数学', questionNo: '16', score: 4, fullScore: 12, avgScore: 7.8, classRate: 65, schoolRate: 62, knowledgePoint: '圆锥曲线离心率', difficulty: 3 },
  { subject: '化学', questionNo: '5', score: 0, fullScore: 6, avgScore: 5.1, classRate: 85, schoolRate: 82, knowledgePoint: '有机化学反应类型', difficulty: 1 }
])

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
      studentId,
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
      indicator: [
        { name: '语文', max: 150 },
        { name: '数学', max: 150 },
        { name: '英语', max: 150 },
        { name: '物理', max: 100 },
        { name: '化学', max: 100 },
        { name: '生物', max: 100 }
      ],
      axisName: { color: '#333' }
    },
    series: [
      {
        name: '成绩对比',
        type: 'radar',
        data: [
          {
            value: [125, 142, 138, 95, 92, 93],
            name: '个人得分',
            itemStyle: { color: '#409eff' },
            areaStyle: { opacity: 0.3 }
          },
          {
            value: [110, 105, 108, 75, 78, 80],
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
      data: ['语文', '数学', '英语', '物理', '化学', '生物']
    },
    yAxis: {
      type: 'value',
      name: '分数'
    },
    series: [
      {
        name: '个人得分',
        type: 'bar',
        data: [125, 142, 138, 95, 92, 93],
        itemStyle: { color: '#409eff' }
      },
      {
        name: '班级平均',
        type: 'bar',
        data: [110, 105, 108, 75, 78, 80],
        itemStyle: { color: '#67c23a' }
      },
      {
        name: '全校平均',
        type: 'bar',
        data: [105, 98, 102, 70, 72, 75],
        itemStyle: { color: '#e6a23c' }
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
  initRadarChart()
  initBarChart()
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
.text-success { color: #67C23A; }
.text-warning { color: #E6A23C; }
.text-primary { color: #409EFF; }
.chart-box {
  height: 400px;
  width: 100%;
}

@media print {
  .page-container { background-color: #fff !important; padding: 0 !important; }
  .el-page-header { display: none; }
}
</style>
