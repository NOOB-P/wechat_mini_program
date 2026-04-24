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
              <span class="trend ml-2" :class="stat.trend >= 0 ? 'text-success' : 'text-danger'">
                {{ stat.trend >= 0 ? '↑' : '↓' }} {{ Math.abs(stat.trend) }}%
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
            <el-input
              v-model="searchQuery"
              placeholder="搜索姓名/学号"
              size="small"
              style="width: 200px"
              clearable
            />
            <el-button type="primary" size="small">导出报表</el-button>
          </div>
        </div>
      </template>
      <el-table :data="filteredStudentData" border style="width: 100%" height="calc(100vh - 450px)" size="small">
        <el-table-column prop="rank" label="班级排名" min-width="100" align="center" sortable />
        <el-table-column prop="schoolRank" label="全校排名" min-width="100" align="center" />
        <el-table-column prop="studentName" label="姓名" min-width="120" align="center" />
        <el-table-column prop="studentNo" label="学号" min-width="150" align="center" />
        <el-table-column prop="totalScore" label="总分" min-width="100" align="center" sortable />
        <el-table-column
          v-for="column in subjectColumns"
          :key="column.key"
          :label="column.label"
          min-width="90"
          align="center"
        >
          <template #default="{ row }">
            {{ row.subjectScores?.[column.key] ?? '-' }}
          </template>
        </el-table-column>
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
  import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { echarts } from '@/plugins/echarts'
  import { ElMessage } from 'element-plus'
  import { fetchAnalysisClassDashboard } from '@/api/core-business/exam/analysis/class-dashboard'

  const route = useRoute()
  const router = useRouter()

  const projectId = String(route.query.projectId || '')
  const projectName = ref(String(route.query.projectName || ''))
  const schoolId = String(route.query.schoolId || '')
  const schoolName = ref(String(route.query.schoolName || ''))
  const classId = String(route.query.classId || '')
  const className = ref(String(route.query.className || ''))

  const sortType = ref('desc')
  const searchQuery = ref('')
  const scoreCompareChart = ref<HTMLElement>()
  const distChart = ref<HTMLElement>()

  let chartInstances: echarts.ECharts[] = []

  const statsCards = ref<any[]>([])

  const getStatColor = (type: string) => {
    const colors: Record<string, string> = {
      avg: '#409EFF',
      pass: '#67C23A',
      excel: '#E6A23C',
      top: '#F56C6C'
    }
    return colors[type] || '#409EFF'
  }

  const studentData = ref<any[]>([])
  const subjectColumns = ref<any[]>([])
  const scoreSeries = ref<any[]>([])
  const scoreDistribution = ref<any[]>([])

  const filteredStudentData = computed(() => {
    if (!searchQuery.value) return studentData.value
    return studentData.value.filter(
      (s) => s.studentName.includes(searchQuery.value) || s.studentNo.includes(searchQuery.value)
    )
  })

  const goBack = () => {
    router.push({
      name: 'ExamAnalysisClassSelect',
      query: { projectId, projectName: projectName.value }
    })
  }

  const handleStudentReport = (student: any) => {
    router.push({
      name: 'ExamAnalysisStudentReport',
      query: {
        projectId,
        projectName: projectName.value,
        schoolId,
        schoolName: schoolName.value,
        classId,
        className: className.value,
        studentId: student.studentNo,
        studentNo: student.studentNo,
        studentName: student.studentName
      }
    })
  }

  const initScoreChart = () => {
    if (!scoreCompareChart.value) return
    const existingInstance = echarts.getInstanceByDom(scoreCompareChart.value)
    if (existingInstance) existingInstance.dispose()

    const chart = echarts.init(scoreCompareChart.value)

    const data = [...scoreSeries.value]
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
        data: data.map((s) => s.studentName)
      },
      yAxis: {
        type: 'value',
        name: '总分'
      },
      series: [
        {
          name: '总分',
          type: 'bar',
          data: data.map((s) => s.totalScore),
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
          data: scoreDistribution.value.map((item) => ({ value: item.count, name: item.label }))
        }
      ]
    }
    chart.setOption(option)
    chartInstances.push(chart)
  }

  const handleResize = () => {
    chartInstances.forEach((instance) => instance.resize())
  }

  const loadData = async () => {
    try {
      const res = await fetchAnalysisClassDashboard({ projectId, classId })
      if (res.classInfo) {
        schoolName.value = res.classInfo.schoolName || schoolName.value
        className.value = res.classInfo.className || className.value
      }
      statsCards.value = res.statsCards || []
      scoreSeries.value = res.scoreSeries || []
      scoreDistribution.value = res.scoreDistribution || []
      subjectColumns.value = res.subjectColumns || []
      studentData.value = res.students || []
      await nextTick()
      chartInstances.forEach((instance) => instance.dispose())
      chartInstances = []
      initScoreChart()
      initDistChart()
    } catch (error: any) {
      ElMessage.error(error.message || '加载班级分析失败')
    }
  }

  onMounted(() => {
    loadData()
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
  .text-success {
    color: #67c23a;
  }
  .text-danger {
    color: #f56c6c;
  }
  .chart-box {
    height: 400px;
    width: 100%;
  }
</style>
