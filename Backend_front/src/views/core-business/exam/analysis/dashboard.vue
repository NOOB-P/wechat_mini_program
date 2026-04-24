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
            <div class="metric-value" :style="{ color: item.color }"
              >{{ item.value }}{{ item.unit || '' }}</div
            >
            <div class="metric-footer">
              较上次
              <span :class="item.trend >= 0 ? 'text-success' : 'text-danger'">
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
          <el-table :data="schoolRanking" size="small" border style="width: 100%">
            <el-table-column type="index" label="排名" width="60" align="center" />
            <el-table-column prop="name" label="学校名称" min-width="150" />
            <el-table-column prop="avgScore" label="平均分" min-width="90" align="center" sortable />
            <el-table-column prop="passRate" label="及格率" min-width="90" align="center" sortable>
              <template #default="{ row }">{{ row.passRate }}%</template>
            </el-table-column>
            <el-table-column
              prop="excellentRate"
              label="优秀率"
              min-width="90"
              align="center"
              sortable
            >
              <template #default="{ row }">{{ row.excellentRate }}%</template>
            </el-table-column>
            <el-table-column prop="lowRate" label="低分率" min-width="90" align="center" sortable>
              <template #default="{ row }">{{ row.lowRate }}%</template>
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
          <el-table :data="classRanking" size="small" border style="width: 100%">
            <el-table-column type="index" label="排名" width="60" align="center" />
            <el-table-column prop="className" label="学校/班级" min-width="150" />
            <el-table-column prop="avgScore" label="平均分" min-width="90" align="center" sortable />
            <el-table-column prop="passRate" label="及格率" min-width="90" align="center" sortable>
              <template #default="{ row }">{{ row.passRate }}%</template>
            </el-table-column>
            <el-table-column
              prop="excellentRate"
              label="优秀率"
              min-width="90"
              align="center"
              sortable
            >
              <template #default="{ row }">{{ row.excellentRate }}%</template>
            </el-table-column>
            <el-table-column prop="lowRate" label="低分率" min-width="90" align="center" sortable>
              <template #default="{ row }">{{ row.lowRate }}%</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, nextTick } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { echarts } from '@/plugins/echarts'
  import { ElMessage } from 'element-plus'
  import { fetchAnalysisProjectDashboard } from '@/api/core-business/exam/analysis/dashboard'

  const router = useRouter()
  const route = useRoute()
  const projectId = ref(String(route.query.projectId || ''))
  const projectName = ref(route.query.projectName || '未知考试项目')

  const coreMetrics = ref<any[]>([])
  const schoolRanking = ref<any[]>([])
  const classRanking = ref<any[]>([])
  const scoreDistribution = ref<any[]>([])
  const subjectPassRates = ref<any[]>([])

  const scoreDistChart = ref<HTMLElement>()
  const subjectPassChart = ref<HTMLElement>()
  let chartInstances: echarts.ECharts[] = []

  const initCharts = () => {
    if (scoreDistChart.value) {
      const chart = echarts.init(scoreDistChart.value)
      chart.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', data: scoreDistribution.value.map((item) => item.label) },
        yAxis: { type: 'value', name: '人数' },
        series: [
          {
            data: scoreDistribution.value.map((item) => item.count),
            type: 'line',
            smooth: true,
            areaStyle: { opacity: 0.3 },
            color: '#409EFF'
          }
        ]
      })
      chartInstances.push(chart)
    }

    if (subjectPassChart.value) {
      const chart = echarts.init(subjectPassChart.value)
      chart.setOption({
        radar: {
          indicator: subjectPassRates.value.map((item) => ({ name: item.subjectName, max: 100 }))
        },
        series: [
          {
            type: 'radar',
            data: [
              {
                value: subjectPassRates.value.map((item) => item.passRate),
                name: '及格率',
                areaStyle: { color: 'rgba(103, 194, 58, 0.5)' },
                lineStyle: { color: '#67C23A' }
              }
            ]
          }
        ]
      })
      chartInstances.push(chart)
    }
  }

  const handleResize = () => {
    chartInstances.forEach((instance) => instance.resize())
  }

  const goBack = () => {
    router.push({ name: 'ExamAnalysisList' })
  }

  const loadData = async () => {
    if (!projectId.value) {
      ElMessage.error('缺少项目ID')
      return
    }
    try {
      const res = await fetchAnalysisProjectDashboard(projectId.value)
      projectName.value = res.project?.name || projectName.value
      coreMetrics.value = res.coreMetrics || []
      schoolRanking.value = res.schoolRanking || []
      classRanking.value = res.classRanking || []
      scoreDistribution.value = res.scoreDistribution || []
      subjectPassRates.value = res.subjectPassRates || []
      await nextTick()
      chartInstances.forEach((instance) => instance.dispose())
      chartInstances = []
      initCharts()
    } catch (error: any) {
      ElMessage.error(error.message || '加载分析大屏失败')
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
  .text-success {
    color: #67c23a;
  }
  .text-danger {
    color: #f56c6c;
  }
  .chart-box {
    height: 350px;
    width: 100%;
  }
  .dashboard-container :deep(.el-card__header) {
    padding: 12px 20px;
    border-bottom: 1px solid #ebeef5;
  }
</style>
