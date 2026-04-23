<template>
  <div class="page-container subject-report-page">
    <el-page-header class="mb-6" @back="goBack">
      <template #content>
        <span class="text-large font-bold mr-3">单科报表</span>
        <span class="text-sm page-subtitle">{{ projectName }}</span>
      </template>
    </el-page-header>

    <div class="report-header mb-6">
      <div class="header-main">
        <div class="project-info">
          <h1 class="project-title">{{ projectName }}</h1>
          <p class="project-desc">按学科切换查看项目级单科分析，覆盖全校、各班、小题分与高频失分题对比。</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" class="refresh-btn" @click="loadData(currentSubject)">
            <el-icon class="mr-1"><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </div>
      
      <div class="subject-selector">
        <div 
          v-for="subject in subjects" 
          :key="subject.name"
          class="subject-item"
          :class="{ active: subject.name === currentSubject }"
          @click="handleSubjectChange(subject.name)"
        >
          <div class="subject-content">
            <span class="name">{{ subject.name }}</span>
            <div class="meta">
              <span class="score">{{ subject.avgScore }}<small>分</small></span>
              <span class="divider"></span>
              <span class="rate">及格率 {{ subject.passRate }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-row :gutter="20" class="mb-6">
      <el-col v-for="card in overviewCards" :key="card.label" :xs="12" :sm="8" :lg="4">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-label">{{ card.label }}</div>
          <div class="metric-value" :style="{ color: card.color }">
            {{ card.value }}<small v-if="card.unit">{{ card.unit }}</small>
          </div>
          <div class="metric-desc">{{ card.desc }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-tabs v-model="activeTab" class="report-tabs">
      <el-tab-pane label="全校对比" name="general">
        <el-row :gutter="20" class="mb-6">
          <el-col :xs="24" :xl="10">
            <el-card shadow="never" header="分数段分布">
              <div ref="distributionChartRef" class="chart-box"></div>
            </el-card>
          </el-col>
          <el-col :xs="24" :xl="14">
            <el-card shadow="never" header="各班单科均分对比">
              <div ref="classChartRef" class="chart-box"></div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="mb-6">
          <el-col :xs="24" :xl="12">
            <el-card shadow="never" header="全校单科对比">
              <el-table :data="schoolRanking" border size="small" max-height="360">
                <el-table-column prop="schoolName" label="学校" min-width="140" align="center" />
                <el-table-column prop="participantCount" label="人数" align="center" />
                <el-table-column prop="avgScore" label="均分" align="center" />
                <el-table-column prop="passRate" label="及格率" align="center">
                  <template #default="{ row }">{{ row.passRate }}%</template>
                </el-table-column>
                <el-table-column prop="excellentRate" label="优秀率" align="center">
                  <template #default="{ row }">{{ row.excellentRate }}%</template>
                </el-table-column>
                <el-table-column prop="lowRate" label="低分率" align="center">
                  <template #default="{ row }">{{ row.lowRate }}%</template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
          <el-col :xs="24" :xl="12">
            <el-card shadow="never" header="每班单科对比">
              <el-table :data="classRanking" border size="small" max-height="360">
                <el-table-column type="index" label="排名" align="center" />
                <el-table-column prop="schoolName" label="学校" min-width="120" align="center" />
                <el-table-column prop="className" label="班级" min-width="110" align="center" />
                <el-table-column prop="participantCount" label="人数" align="center" />
                <el-table-column prop="avgScore" label="均分" align="center" />
                <el-table-column prop="passRate" label="及格率" align="center">
                  <template #default="{ row }">{{ row.passRate }}%</template>
                </el-table-column>
                <el-table-column prop="excellentRate" label="优秀率" align="center">
                  <template #default="{ row }">{{ row.excellentRate }}%</template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <el-tab-pane label="小题分析" name="questions">
        <el-row :gutter="20" class="mb-6">
          <el-col :span="24">
            <el-card shadow="never" header="小题得分对比">
              <div ref="questionChartRef" class="chart-box question-chart"></div>
              <el-table :data="questionAnalysis" border size="small" max-height="420">
                <el-table-column prop="questionLabel" label="题目" align="center" />
                <el-table-column prop="type" label="题型" align="center" />
                <el-table-column prop="fullScore" label="满分" align="center" />
                <el-table-column prop="avgScore" label="项目均分" align="center" />
                <el-table-column prop="scoreRate" label="得分率" align="center">
                  <template #default="{ row }">{{ row.scoreRate }}%</template>
                </el-table-column>
                <el-table-column prop="zeroRate" label="零分率" align="center">
                  <template #default="{ row }">{{ row.zeroRate }}%</template>
                </el-table-column>
                <el-table-column prop="difficulty" label="难度" align="center" />
                <el-table-column
                  prop="weakestClassName"
                  label="薄弱班级"
                  min-width="160"
                  show-overflow-tooltip
                  align="center"
                />
                <el-table-column
                  prop="strongestClassName"
                  label="优势班级"
                  min-width="160"
                  show-overflow-tooltip
                  align="center"
                />
                <el-table-column prop="classGap" label="班级差值" align="center">
                  <template #default="{ row }">{{ row.classGap }}%</template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <el-tab-pane label="重点关注" name="focus">
        <el-card shadow="never" header="高频失分题聚焦">
          <el-table :data="wrongQuestionFocus" border size="small">
            <el-table-column prop="questionNo" label="题号" align="center" />
            <el-table-column prop="type" label="题型" align="center" />
            <el-table-column prop="fullScore" label="满分" align="center" />
            <el-table-column prop="avgScore" label="项目均分" align="center" />
            <el-table-column prop="lossRate" label="失分率" align="center">
              <template #default="{ row }">{{ row.lossRate }}%</template>
            </el-table-column>
            <el-table-column prop="zeroRate" label="零分率" align="center">
              <template #default="{ row }">{{ row.zeroRate }}%</template>
            </el-table-column>
            <el-table-column prop="difficulty" label="难度" align="center" />
            <el-table-column
              prop="weakestClassName"
              label="重点关注班级"
              min-width="180"
              show-overflow-tooltip
              align="center"
            />
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import * as echarts from 'echarts'
  import { ElMessage } from 'element-plus'
  import { Refresh } from '@element-plus/icons-vue'
  import { fetchAnalysisSubjectReport } from '@/api/core-business/exam/analysis/subject-report'

  const route = useRoute()
  const router = useRouter()

  const projectId = String(route.query.projectId || '')
  const projectName = ref(String(route.query.projectName || '考试项目'))
  const currentSubject = ref(String(route.query.subjectName || ''))
  const activeTab = ref('general')

  watch(activeTab, () => {
    initCharts()
  })

  const subjects = ref<any[]>([])
  const overviewCards = ref<any[]>([])
  const scoreDistribution = ref<any[]>([])
  const schoolRanking = ref<any[]>([])
  const classRanking = ref<any[]>([])
  const questionAnalysis = ref<any[]>([])
  const wrongQuestionFocus = ref<any[]>([])

  const distributionChartRef = ref<HTMLElement>()
  const classChartRef = ref<HTMLElement>()
  const questionChartRef = ref<HTMLElement>()
  const chartInstances = ref<echarts.ECharts[]>([])

  const topClasses = computed(() => classRanking.value.slice(0, 12))
  const topQuestions = computed(() => questionAnalysis.value.slice(0, 12))

  const goBack = () => {
    router.push({ name: 'ExamAnalysisList' })
  }

  const syncRouteSubject = (subjectName: string) => {
    router.replace({
      name: 'ExamAnalysisSubjectReport',
      query: {
        projectId,
        projectName: projectName.value,
        subjectName
      }
    })
  }

  const handleSubjectChange = (subjectName: string) => {
    if (!subjectName || subjectName === currentSubject.value) return
    currentSubject.value = subjectName
    syncRouteSubject(subjectName)
    loadData(subjectName)
  }

  const disposeCharts = () => {
    chartInstances.value.forEach((instance) => instance.dispose())
    chartInstances.value = []
  }

  const initDistributionChart = () => {
    if (!distributionChartRef.value) return
    const chart = echarts.init(distributionChartRef.value)
    chart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: { color: '#1e293b' }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: scoreDistribution.value.map((item) => item.label),
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#64748b' }
      },
      yAxis: {
        type: 'value',
        name: '人数',
        splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
        axisLabel: { color: '#64748b' }
      },
      series: [
        {
          name: '人数',
          type: 'bar',
          barWidth: 28,
          data: scoreDistribution.value.map((item) => item.count),
          itemStyle: {
            color: '#409eff',
            borderRadius: [2, 2, 0, 0]
          }
        }
      ]
    })
    chartInstances.value.push(chart)
  }

  const initClassChart = () => {
    if (!classChartRef.value) return
    const chart = echarts.init(classChartRef.value)
    const chartData = topClasses.value
    chart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: { color: '#1e293b' }
      },
      legend: { bottom: 0, icon: 'circle', textStyle: { color: '#64748b' } },
      grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: chartData.length > 8 ? (8 / chartData.length) * 100 : 100
        },
        {
          type: 'slider',
          show: chartData.length > 8,
          height: 20,
          bottom: 30,
          start: 0,
          end: chartData.length > 8 ? (8 / chartData.length) * 100 : 100
        }
      ],
      xAxis: {
        type: 'category',
        data: chartData.map((item) => item.className),
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { 
          color: '#64748b',
          interval: 0,
          rotate: chartData.length > 6 ? 30 : 0
        }
      },
      yAxis: [
        {
          type: 'value',
          name: '均分',
          splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
          axisLabel: { color: '#64748b' }
        },
        {
          type: 'value',
          name: '比率',
          axisLabel: { formatter: '{value}%', color: '#64748b' },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: '均分',
          type: 'bar',
          data: chartData.map((item) => item.avgScore),
          itemStyle: {
            color: '#409eff',
            borderRadius: [2, 2, 0, 0]
          }
        },
        {
          name: '及格率',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: chartData.map((item) => item.passRate),
          itemStyle: { color: '#67c23a' },
          lineStyle: { width: 2.5 }
        },
        {
          name: '优秀率',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: chartData.map((item) => item.excellentRate),
          itemStyle: { color: '#e6a23c' },
          lineStyle: { width: 2.5 }
        }
      ]
    })
    chartInstances.value.push(chart)
  }

  const initQuestionChart = () => {
    if (!questionChartRef.value) return
    const chart = echarts.init(questionChartRef.value)
    const chartData = topQuestions.value
    chart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: { color: '#1e293b' }
      },
      legend: { bottom: 0, icon: 'circle', textStyle: { color: '#64748b' } },
      grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: chartData.length > 10 ? (10 / chartData.length) * 100 : 100
        },
        {
          type: 'slider',
          show: chartData.length > 10,
          height: 20,
          bottom: 30,
          start: 0,
          end: chartData.length > 10 ? (10 / chartData.length) * 100 : 100
        }
      ],
      xAxis: {
        type: 'category',
        data: chartData.map((item) => item.questionLabel),
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#64748b', interval: 0 }
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: { formatter: '{value}%', color: '#64748b' },
        splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } }
      },
      series: [
        {
          name: '项目得分率',
          type: 'bar',
          data: chartData.map((item) => item.scoreRate),
          itemStyle: {
            color: function (params: any) {
              return params.value < 60 ? '#f56c6c' : params.value < 80 ? '#e6a23c' : '#409eff'
            },
            borderRadius: [2, 2, 0, 0]
          }
        },
        {
          name: '零分率',
          type: 'line',
          smooth: true,
          data: chartData.map((item) => item.zeroRate),
          itemStyle: { color: '#909399' },
          lineStyle: { width: 2, type: 'dashed' }
        }
      ]
    })
    chartInstances.value.push(chart)
  }

  const initCharts = async () => {
    await nextTick()
    disposeCharts()
    initDistributionChart()
    initClassChart()
    initQuestionChart()
  }

  const loadData = async (subjectName?: string) => {
    if (!projectId) {
      ElMessage.error('缺少考试项目ID')
      return
    }
    try {
      const res = await fetchAnalysisSubjectReport({
        projectId,
        subjectName: subjectName || currentSubject.value || undefined
      })
      projectName.value = res.project?.name || projectName.value
      subjects.value = res.subjects || []
      overviewCards.value = res.overviewCards || []
      scoreDistribution.value = res.scoreDistribution || []
      schoolRanking.value = res.schoolRanking || []
      classRanking.value = res.classRanking || []
      questionAnalysis.value = res.questionAnalysis || []
      wrongQuestionFocus.value = res.wrongQuestionFocus || []
      currentSubject.value =
        res.currentSubject || currentSubject.value || subjects.value[0]?.name || ''
      if (String(route.query.subjectName || '') !== currentSubject.value) {
        syncRouteSubject(currentSubject.value)
      }
      await initCharts()
    } catch (error: any) {
      ElMessage.error(error.message || '加载单科报表失败')
    }
  }

  const handleResize = () => {
    chartInstances.value.forEach((instance) => instance.resize())
  }

  onMounted(() => {
    loadData()
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    disposeCharts()
  })
</script>

<style scoped>
  .page-container {
    min-height: 100vh;
    padding: 24px;
    background-color: #f0f2f5;
  }
  .page-subtitle {
    color: #94a3b8;
    font-weight: 400;
  }

  /* 报表头部样式 */
  .report-header {
    background: #ffffff;
    border-radius: 8px;
    padding: 24px;
    border: 1px solid #dcdfe6;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }

  .header-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid #ebeef5;
  }

  .project-title {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin: 0;
  }

  .project-desc {
    margin-top: 4px;
    color: #909399;
    font-size: 14px;
  }

  .refresh-btn {
    border-radius: 4px;
    font-weight: 500;
  }

  /* 学科选择器样式 */
  .subject-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .subject-item {
    min-width: 180px;
    padding: 16px;
    background: #ffffff;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
  }

  .subject-item:hover {
    border-color: #409eff;
    background: #f5f7fa;
  }

  .subject-item.active {
    background: #ecf5ff;
    border-color: #409eff;
  }

  .subject-item.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: #409eff;
    border-radius: 4px 0 0 4px;
  }

  .subject-content .name {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    display: block;
    margin-bottom: 6px;
  }

  .subject-content .meta {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #606266;
    font-size: 13px;
  }

  .subject-content .score {
    color: #409eff;
    font-weight: 600;
    font-size: 15px;
  }

  .subject-content .score small {
    font-size: 12px;
    margin-left: 2px;
  }

  .subject-content .divider {
    width: 1px;
    height: 10px;
    background: #dcdfe6;
  }

  .subject-item.active .name {
    color: #409eff;
  }

  .report-tabs {
    margin-top: 24px;
    background: #ffffff;
    padding: 0;
    border-radius: 8px;
    border: 1px solid #dcdfe6;
    overflow: hidden;
  }

  :deep(.el-tabs__header) {
    margin-bottom: 0;
    padding: 0 24px;
    background: #fcfcfc;
    border-bottom: 1px solid #ebeef5;
  }

  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }

  :deep(.el-tabs__content) {
    padding: 24px;
  }

  /* 核心指标卡样式 */
  .metric-card {
    height: 110px;
    border-radius: 4px;
    border: 1px solid #ebeef5;
    transition: all 0.2s;
    background: #ffffff;
    margin-bottom: 20px;
  }

  .metric-card:hover {
    box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
    border-color: #409eff;
  }

  :deep(.metric-card .el-card__body) {
    padding: 20px !important;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .metric-label {
    font-size: 14px;
    color: #606266;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .metric-value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
    margin: 0;
    display: flex;
    align-items: baseline;
  }

  .metric-value small {
    margin-left: 4px;
    font-size: 14px;
    font-weight: 500;
    color: #909399;
  }

  .metric-desc {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chart-box {
    width: 100%;
    height: 300px;
  }

  .question-chart {
    height: 280px;
    margin-bottom: 16px;
  }

  :deep(.el-card) {
    border-radius: 4px;
    border: 1px solid #ebeef5;
  }

  :deep(.el-card__header) {
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    font-weight: 600;
    color: #303133;
    font-size: 15px;
    background: #fcfcfc;
  }

  :deep(.el-table) {
    --el-table-border-color: #ebeef5;
    --el-table-header-bg-color: #f5f7fa;
  }

  :deep(.el-table th.el-table__cell) {
    font-weight: 600;
    color: #606266;
  }

  @media (max-width: 992px) {
    .header-main {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
    .metric-card {
      margin-bottom: 16px;
    }
  }
</style>
