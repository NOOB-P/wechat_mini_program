<template>
  <div class="page-container dashboard-container">
    <el-page-header @back="goBack" class="mb-4">
      <template #content>
        <span class="text-large font-600 mr-3"> 考试数据分析大屏 </span>
        <span class="text-sm mr-2" style="color: var(--el-text-color-regular)">
          当前项目: {{ projectName }}
        </span>
      </template>
      <template #extra>
        <div class="flex items-center">
          <el-button type="primary" size="small">导出分析报告</el-button>
        </div>
      </template>
    </el-page-header>

    <!-- 一分三率 核心指标 -->
    <el-row :gutter="20" class="mb-6">
      <el-col :span="6" v-for="item in coreMetrics" :key="item.label">
        <el-card shadow="never" class="metric-card">
          <div class="metric-content">
            <div class="metric-label">{{ item.label }}</div>
            <div class="metric-value" :style="{ color: item.color }">{{ item.value }}</div>
            <div class="metric-footer">
              较上次 <span :class="item.trend >= 0 ? 'text-success' : 'text-danger'">
                {{ item.trend >= 0 ? '↑' : '↓' }} {{ Math.abs(item.trend) }}%
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="mb-6">
      <el-col :span="16">
        <el-card shadow="never" header="成绩分布趋势">
          <div ref="scoreDistChart" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" header="科目合格率对比">
          <div ref="subjectPassChart" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 表格区域 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold">学校排名 (TOP 10)</span>
              <el-button link type="primary">查看全部</el-button>
            </div>
          </template>
          <el-table :data="schoolRanking" size="small" border>
            <el-table-column type="index" label="排名" width="60" align="center" />
            <el-table-column prop="name" label="学校名称" />
            <el-table-column prop="avgScore" label="平均分" width="100" align="center" sortable />
            <el-table-column prop="excellentRate" label="优秀率" width="100" align="center" sortable>
              <template #default="{ row }">{{ row.excellentRate }}%</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold">班级优胜榜</span>
              <el-button link type="primary">查看全部</el-button>
            </div>
          </template>
          <el-table :data="classRanking" size="small" border>
            <el-table-column type="index" label="排名" width="60" align="center" />
            <el-table-column prop="className" label="学校/班级" min-width="150" />
            <el-table-column prop="passRate" label="及格率" width="100" align="center" sortable>
              <template #default="{ row }">{{ row.passRate }}%</template>
            </el-table-column>
            <el-table-column prop="avgScore" label="平均分" width="100" align="center" sortable />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import * as echarts from 'echarts'

const router = useRouter()
const route = useRoute()
const projectName = ref(route.query.projectName || '未知考试项目')

const coreMetrics = [
  { label: '平均分', value: '85.4', trend: 2.5, color: '#409EFF' },
  { label: '优秀率', value: '32.1%', trend: 1.2, color: '#67C23A' },
  { label: '及格率', value: '94.5%', trend: -0.5, color: '#E6A23C' },
  { label: '低分率', value: '1.2%', trend: -0.8, color: '#F56C6C' }
]

const schoolRanking = [
  { name: '第一实验中学', avgScore: 92.5, excellentRate: 45.2 },
  { name: '第二高级中学', avgScore: 88.4, excellentRate: 38.5 },
  { name: '晨曦双语学校', avgScore: 86.2, excellentRate: 32.1 },
  { name: '滨海三中', avgScore: 84.5, excellentRate: 28.4 },
  { name: '阳光初级中学', avgScore: 82.1, excellentRate: 25.6 }
]

const classRanking = [
  { className: '实验中学 高一(3)班', passRate: 100, avgScore: 95.2 },
  { className: '实验中学 高一(1)班', passRate: 98.5, avgScore: 93.1 },
  { className: '滨海三中 初三(2)班', passRate: 96.2, avgScore: 89.4 },
  { className: '晨曦双语 六年级(1)班', passRate: 95.4, avgScore: 88.2 },
  { className: '阳光中学 初二(5)班', passRate: 94.1, avgScore: 86.5 }
]

const scoreDistChart = ref<HTMLElement>()
const subjectPassChart = ref<HTMLElement>()
let chartInstances: echarts.ECharts[] = []

const initCharts = () => {
  if (scoreDistChart.value) {
    const chart = echarts.init(scoreDistChart.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: ['0-20', '20-40', '40-60', '60-80', '80-100', '100-120', '120-150'] },
      yAxis: { type: 'value', name: '人数' },
      series: [{
        data: [12, 45, 120, 450, 890, 620, 210],
        type: 'line',
        smooth: true,
        areaStyle: { opacity: 0.3 },
        color: '#409EFF'
      }]
    })
    chartInstances.push(chart)
  }

  if (subjectPassChart.value) {
    const chart = echarts.init(subjectPassChart.value)
    chart.setOption({
      radar: {
        indicator: [
          { name: '语文', max: 100 },
          { name: '数学', max: 100 },
          { name: '英语', max: 100 },
          { name: '物理', max: 100 },
          { name: '化学', max: 100 }
        ]
      },
      series: [{
        type: 'radar',
        data: [{
          value: [92, 85, 95, 78, 82],
          name: '及格率',
          areaStyle: { color: 'rgba(103, 194, 58, 0.5)' },
          lineStyle: { color: '#67C23A' }
        }]
      }]
    })
    chartInstances.push(chart)
  }
}

const handleResize = () => {
  chartInstances.forEach(instance => instance.resize())
}

const goBack = () => {
  router.push({ name: 'ExamAnalysisList' })
}

onMounted(() => {
  initCharts()
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
.metric-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}
.metric-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}
.metric-footer {
  font-size: 12px;
}
.text-success { color: #67C23A; }
.text-danger { color: #F56C6C; }
.chart-box {
  height: 350px;
  width: 100%;
}
.dashboard-container :deep(.el-card__header) {
  padding: 12px 20px;
  border-bottom: 1px solid #ebeef5;
}
</style>
