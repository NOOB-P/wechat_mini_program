<template>
  <div class="page-container dashboard-container">
    <el-page-header @back="goBack" class="mb-6">
      <template #content>
        <span class="text-large font-bold mr-3"> 班级分析大屏 </span>
        <span class="text-sm mr-2" style="color: var(--el-text-color-regular)">
          {{ schoolName }} - {{ className }} (项目: {{ projectName }})
        </span>
      </template>
    </el-page-header>

    <!-- 一分三率看板 -->
    <el-row :gutter="20" class="mb-6">
      <el-col :span="6" v-for="stat in statsCards" :key="stat.title">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-label">{{ stat.title }}</div>
            <div class="stat-value" :style="{ color: getStatColor(stat.type) }">
              {{ stat.value }}<small v-if="stat.unit">{{ stat.unit }}</small>
            </div>
            <div class="stat-footer">
              <span>全校排名: {{ stat.rank }}</span>
              <span class="trend ml-2" :class="stat.trend > 0 ? 'text-success' : 'text-danger'">
                {{ stat.trend > 0 ? '↑' : '↓' }} {{ Math.abs(stat.trend) }}%
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mb-6">
      <!-- 班级成绩对比图 -->
      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold">班级学生总分对比</span>
              <el-radio-group v-model="sortType" size="small" @change="initScoreChart">
                <el-radio-button label="desc">从高到低</el-radio-button>
                <el-radio-button label="asc">从低到高</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="scoreCompareChart" class="chart-box"></div>
        </el-card>
      </el-col>

      <!-- 成绩分布 -->
      <el-col :span="8">
        <el-card shadow="never" header="分数段人数分布">
          <div ref="distChart" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 学生列表 -->
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-bold">学生成绩明细表</span>
          <div class="flex gap-4">
            <el-input v-model="searchQuery" placeholder="搜索姓名/学号" size="small" style="width: 200px" clearable />
            <el-button type="primary" size="small">导出报表</el-button>
          </div>
        </div>
      </template>
      <el-table :data="filteredStudentData" border style="width: 100%" height="400" size="small">
        <el-table-column prop="rank" label="班级排名" width="100" align="center" sortable />
        <el-table-column prop="schoolRank" label="全校排名" width="100" align="center" />
        <el-table-column prop="name" label="姓名" width="120" align="center" />
        <el-table-column prop="studentId" label="学号" width="150" align="center" />
        <el-table-column prop="totalScore" label="总分" width="100" align="center" sortable />
        <el-table-column prop="chinese" label="语文" width="80" align="center" />
        <el-table-column prop="math" label="数学" width="80" align="center" />
        <el-table-column prop="english" label="英语" width="80" align="center" />
        <el-table-column prop="physics" label="物理" width="80" align="center" />
        <el-table-column prop="chemistry" label="化学" width="80" align="center" />
        <el-table-column prop="biology" label="生物" width="80" align="center" />
        <el-table-column label="操作" fixed="right" width="120" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleStudentReport(row)">分析报告</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
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

const sortType = ref('desc')
const searchQuery = ref('')
const scoreCompareChart = ref<HTMLElement>()
const distChart = ref<HTMLElement>()

let chartInstances: echarts.ECharts[] = []

const statsCards = ref([
  { title: '平均分', value: '562.5', unit: '分', rank: '2', trend: 5.2, type: 'avg' },
  { title: '及格率', value: '98.2', unit: '%', rank: '1', trend: 1.5, type: 'pass' },
  { title: '优秀率', value: '35.6', unit: '%', rank: '3', trend: -2.1, type: 'excel' },
  { title: '高分率', value: '12.4', unit: '%', rank: '5', trend: 0.8, type: 'top' }
])

const getStatColor = (type: string) => {
  const colors: Record<string, string> = {
    avg: '#409EFF',
    pass: '#67C23A',
    excel: '#E6A23C',
    top: '#F56C6C'
  }
  return colors[type] || '#409EFF'
}

const studentData = ref([
  { rank: 1, schoolRank: 12, name: '张三', studentId: '2021001', totalScore: 685, chinese: 125, math: 142, english: 138, physics: 95, chemistry: 92, biology: 93 },
  { rank: 2, schoolRank: 25, name: '李四', studentId: '2021002', totalScore: 672, chinese: 118, math: 145, english: 132, physics: 92, chemistry: 90, biology: 95 },
  { rank: 3, schoolRank: 45, name: '王五', studentId: '2021003', totalScore: 658, chinese: 132, math: 128, english: 125, physics: 88, chemistry: 95, biology: 90 },
  { rank: 4, schoolRank: 78, name: '赵六', studentId: '2021004', totalScore: 642, chinese: 115, math: 135, english: 128, physics: 85, chemistry: 88, biology: 91 },
  { rank: 5, schoolRank: 112, name: '孙七', studentId: '2021005', totalScore: 625, chinese: 110, math: 130, english: 122, physics: 82, chemistry: 91, biology: 90 }
])

const filteredStudentData = computed(() => {
  if (!searchQuery.value) return studentData.value
  return studentData.value.filter(s => 
    s.name.includes(searchQuery.value) || s.studentId.includes(searchQuery.value)
  )
})

const goBack = () => {
  router.push({
    name: 'ExamAnalysisClassSelect',
    query: { projectId, projectName }
  })
}

const handleStudentReport = (student: any) => {
  router.push({
    name: 'ExamAnalysisStudentReport',
    query: {
      projectId,
      projectName,
      schoolId,
      schoolName,
      classId,
      className,
      studentId: student.studentId,
      studentName: student.name
    }
  })
}

const initScoreChart = () => {
  if (!scoreCompareChart.value) return
  const existingInstance = echarts.getInstanceByDom(scoreCompareChart.value)
  if (existingInstance) existingInstance.dispose()
  
  const chart = echarts.init(scoreCompareChart.value)
  
  const data = [...studentData.value]
  if (sortType.value === 'desc') {
    data.sort((a, b) => b.totalScore - a.totalScore)
  } else {
    data.sort((a, b) => a.totalScore - b.totalScore)
  }

  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map(s => s.name)
    },
    yAxis: {
      type: 'value',
      name: '总分'
    },
    series: [
      {
        name: '总分',
        type: 'bar',
        data: data.map(s => s.totalScore),
        itemStyle: { color: '#409eff' },
        label: { show: true, position: 'top' }
      }
    ]
  }
  chart.setOption(option)
  chartInstances.push(chart)
}

const initDistChart = () => {
  if (!distChart.value) return
  const existingInstance = echarts.getInstanceByDom(distChart.value)
  if (existingInstance) existingInstance.dispose()
  
  const chart = echarts.init(distChart.value)
  const option = {
    tooltip: { trigger: 'item' },
    legend: { bottom: '0', left: 'center' },
    series: [
      {
        name: '分数段',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: '16', fontWeight: 'bold' } },
        labelLine: { show: false },
        data: [
          { value: 15, name: '600分以上' },
          { value: 20, name: '500-600分' },
          { value: 8, name: '400-500分' },
          { value: 2, name: '400分以下' }
        ]
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
  initScoreChart()
  initDistChart()
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
.stat-card {
  text-align: center;
}
.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}
.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}
.stat-value small {
  font-size: 14px;
  margin-left: 4px;
}
.stat-footer {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.text-success { color: #67C23A; }
.text-danger { color: #F56C6C; }
.chart-box {
  height: 400px;
  width: 100%;
}
</style>
