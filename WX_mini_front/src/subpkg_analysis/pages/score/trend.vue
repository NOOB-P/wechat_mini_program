<template>
  <view class="score-container">
    <view v-if="loading" class="loading-state">
      <wd-loading />
      <text>正在深度加载趋势分析...</text>
    </view>

    <block v-else-if="trendData">
      <!-- 趋势核心图表卡片 -->
      <view class="analysis-card trend-card">
        <view class="card-header">
          <view class="header-left">
            <text class="card-title">近六次考试趋势</text>
            <view class="volatility-tag" v-if="currentSubject === '总分'">
              波动最大：{{ trendData.volatility }}
            </view>
          </view>
          <view class="header-right">
            <view class="compare-badge" :class="trendData.insight.status">
              {{ getTrendSummary() }}
            </view>
          </view>
        </view>
        
        <!-- 学科/总分切换 -->
        <view class="chart-tabs">
          <scroll-view scroll-x class="tabs-scroll" show-scrollbar="false">
            <view 
              class="tab-item" 
              :class="{ active: currentSubject === '总分' }"
              @tap="switchSubject('总分')"
            >总分趋势</view>
            <view 
              class="tab-item" 
              v-for="(sub, idx) in trendData.subjects" 
              :key="idx"
              :class="{ active: currentSubject === sub }"
              @tap="switchSubject(sub)"
            >{{ sub }}</view>
          </scroll-view>
        </view>
        
        <!-- 趋势图表 -->
        <view class="trend-chart">
          <view class="bar-item" v-for="(item, idx) in trendData.history" :key="idx" @tap="showDetail(item)">
            <view class="bar-val">{{ getChartValue(item) }}</view>
            <view class="bar-track">
              <view 
                class="bar-fill" 
                :style="{ 
                  height: getChartHeight(item),
                  background: getChartColor(idx)
                }"
              >
                <view class="fill-light"></view>
              </view>
            </view>
            <view class="bar-label">
              <text v-for="(line, lIdx) in formatLabel(item.period)" :key="lIdx">{{ line }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 学科强弱分析 (新增，替代目标线) -->
      <view class="analysis-card strength-card" v-if="currentSubject === '总分'">
        <view class="card-header">
          <text class="card-title">学科均衡性分析</text>
        </view>
        <view class="strength-grid">
          <view class="strength-item positive">
            <view class="s-icon-wrap"><wd-icon name="chart-bar" size="20px" color="#07c160" /></view>
            <view class="s-info">
              <text class="s-label">优势学科</text>
              <view class="s-tags">
                <text class="s-tag" v-for="s in trendData.strengths" :key="s">{{ s }}</text>
              </view>
            </view>
          </view>
          <view class="strength-item negative">
            <view class="s-icon-wrap"><wd-icon name="warning" size="20px" color="#ee0a24" /></view>
            <view class="s-info">
              <text class="s-label">待提升学科</text>
              <view class="s-tags">
                <text class="s-tag" v-for="s in trendData.improvements" :key="s">{{ s }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 排名趋势分析 -->
      <view class="analysis-card rank-trend-card">
        <view class="card-header">
          <text class="card-title">年级排名走势</text>
          <view class="rank-now">当前排名: 第{{ trendData.history[trendData.history.length-1].rank }}名</view>
        </view>
        <view class="rank-chart">
          <view class="rank-point-wrap" v-for="(item, idx) in trendData.history" :key="idx">
            <view class="rank-point-container">
              <view 
                class="rank-point" 
                :style="{ bottom: (1 - item.rank / 250) * 100 + '%' }"
              >
                <text class="point-val">{{ item.rank }}</text>
              </view>
            </view>
            <text class="point-label">{{ item.period }}</text>
          </view>
          <view class="rank-line-bg"></view>
        </view>
      </view>

      <!-- 趋势总结卡片 -->
      <view class="analysis-card summary-card">
        <view class="summary-header">
          <text class="summary-title">智能诊断</text>
          <wd-icon name="chat" size="20px" color="#4364f7" />
        </view>
        <view class="summary-content">
          <text class="insight-text">{{ trendDiagnosisText }}</text>
        </view>
      </view>

      <!-- 里程碑 -->
      <view class="milestones-card analysis-card">
        <view class="card-header">
          <text class="card-title">{{ currentSubject === '总分' ? '关键变化速览' : `${currentSubject}关键变化` }}</text>
        </view>
        <view class="milestone-list">
          <view 
            class="milestone-item" 
            v-for="(ms, idx) in trendActionItems" 
            :key="`${currentSubject}-${idx}`"
            :class="ms.status"
          >
            <view class="ms-icon">
              <wd-icon :name="ms.status === 'completed' ? 'check-circle' : 'time-circle'" size="18px" />
            </view>
            <view class="ms-info">
              <text class="ms-name">{{ ms.name || ms.title }}</text>
              <text class="ms-date">{{ ms.date || ms.desc }}</text>
            </view>
          </view>
        </view>
      </view>
    </block>

    <view v-else class="empty-state">
      <wd-status-tip image="content" title="暂无趋势数据" />
    </view>

    <!-- 考试详情弹窗 -->
    <wd-popup v-model="showPopup" position="bottom" custom-style="padding: 40rpx 30rpx; border-radius: 32rpx 32rpx 0 0;">
      <view class="popup-content" v-if="selectedExam">
        <view class="popup-header">
          <view class="p-header-left">
            <text class="popup-title">{{ selectedExam.period }}</text>
            <text class="popup-desc">全科成绩汇总</text>
          </view>
          <view class="p-header-right">
            <text class="popup-score">{{ selectedExam.score }}</text>
            <text class="popup-unit">分</text>
          </view>
        </view>
        <view class="popup-subjects">
          <view class="sub-item" v-for="(val, name) in selectedExam.subjects" :key="name">
            <text class="sub-name">{{ name }}</text>
            <text class="sub-val">{{ val }}</text>
          </view>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getAiExamReportApi, getScoreTrendApi } from '@/subpkg_analysis/api/score'
import { useToast } from 'wot-design-uni'

const trendData = ref<any>(null)
const aiReportData = ref<any>(null)
const currentSubject = ref('总分')
const loading = ref(false)
const showPopup = ref(false)
const selectedExam = ref<any>(null)
const examId = ref('')
const subjectFullScoreMap = ref<Record<string, number>>({})
const toast = useToast()

const currentAiInsight = computed(() => {
  return (aiReportData.value?.subjectInsights || []).find((item: any) => item.subjectName === currentSubject.value) || null
})

const currentAiWrongPushes = computed(() => {
  return (aiReportData.value?.wrongQuestionPushes || []).filter((item: any) => item.subjectName === currentSubject.value)
})

const trendDiagnosisText = computed(() => {
  if (currentSubject.value === '总分') {
    return aiReportData.value?.summary?.overallComment || trendData.value?.insight?.text || '暂无趋势诊断'
  }
  if (currentAiInsight.value) {
    return [currentAiInsight.value.strength, currentAiInsight.value.weakness, currentAiInsight.value.comparison]
      .filter(Boolean)
      .join(' ')
  }
  return trendData.value?.insight?.text || '暂无趋势诊断'
})

const trendActionItems = computed(() => {
  const latestHistory = trendData.value?.history?.[trendData.value.history.length - 1]
  const previousHistory = trendData.value?.history?.[trendData.value.history.length - 2]

  if (currentSubject.value === '总分') {
    const items = []
    if (latestHistory) {
      const latestScore = Number(latestHistory.score || 0)
      const previousScore = Number(previousHistory?.score || 0)
      const scoreDiff = latestScore - previousScore
      items.push({
        title: '最近变化',
        desc: previousHistory
          ? `最近一次总分 ${latestScore} 分，较上一次${scoreDiff >= 0 ? '提升' : '下降'} ${Math.abs(scoreDiff)} 分。`
          : `当前仅记录到一次考试，总分为 ${latestScore} 分。`,
        status: scoreDiff >= 0 ? 'completed' : 'pending'
      })
    }
    if (trendData.value?.volatility) {
      items.push({
        title: '波动学科',
        desc: `近六次考试中波动最大的学科是「${trendData.value.volatility}」，后续应重点观察该学科稳定性。`,
        status: 'pending'
      })
    }
    if (latestHistory?.rank) {
      const previousRank = Number(previousHistory?.rank || 0)
      const rankDiff = previousRank > 0 ? previousRank - latestHistory.rank : 0
      items.push({
        title: '排名位置',
        desc: previousHistory
          ? `当前总分排名第 ${latestHistory.rank} 名，较上一次${rankDiff >= 0 ? '前进' : '后退'} ${Math.abs(rankDiff)} 名。`
          : `当前总分排名为第 ${latestHistory.rank} 名。`,
        status: rankDiff >= 0 ? 'completed' : 'pending'
      })
    }
    const bestScore = Math.max(...(trendData.value?.history || []).map((item: any) => Number(item.score || 0)), 0)
    if (bestScore > 0) {
      items.push({
        title: '阶段峰值',
        desc: `当前近六次考试中的最高总分为 ${bestScore} 分，可对照当次状态复盘有效做法。`,
        status: 'completed'
      })
    }
    return items.length ? items : (trendData.value?.milestones || [])
  }

  const items = []

  if (latestHistory) {
    const latestSubjectScore = Number(latestHistory.subjects?.[currentSubject.value] || 0)
    const previousSubjectScore = Number(previousHistory?.subjects?.[currentSubject.value] || 0)
    const subjectDiff = latestSubjectScore - previousSubjectScore
    items.push({
      title: `${currentSubject.value}最近变化`,
      desc: previousHistory
        ? `最近一次得分 ${latestSubjectScore} 分，较上一次${subjectDiff >= 0 ? '提升' : '下降'} ${Math.abs(subjectDiff)} 分。`
        : `当前仅记录到一次考试，该学科得分为 ${latestSubjectScore} 分。`,
      status: subjectDiff >= 0 ? 'completed' : 'pending'
    })
  }

  if (currentAiInsight.value) {
    items.push({
      title: `${currentSubject.value}对比观察`,
      desc: currentAiInsight.value.comparison || '建议持续观察该学科在历次考试中的波动情况',
      status: 'pending'
    })
  }

  if (currentAiWrongPushes.value.length) {
    items.push({
      title: `${currentSubject.value}失分关注`,
      desc: currentAiWrongPushes.value
        .map((item: any) => item.knowledgePoint || item.questionNo || '')
        .filter(Boolean)
        .slice(0, 2)
        .join('、') || '建议重点关注高频失分点',
      status: 'pending'
    })
  }

  if (latestHistory) {
    items.push({
      title: `${currentSubject.value}阶段峰值`,
      desc: `近六次考试中该学科最高分为 ${Math.max(...(trendData.value?.history || []).map((item: any) => Number(item.subjects?.[currentSubject.value] || 0)), 0)} 分。`,
      status: 'completed'
    })
  }

  return items.length ? items : (trendData.value?.milestones || [])
})

const fetchTrendData = async () => {
  loading.value = true
  try {
    const res: any = await getScoreTrendApi({ examId: examId.value })
    if (res.code === 200) {
      trendData.value = res.data
    }
  } catch (e: any) {
    trendData.value = null
    toast.error(e?.msg || '获取趋势分析失败')
    console.error('获取趋势数据失败:', e)
  } finally {
    loading.value = false
  }
}

const fetchAiReport = async () => {
  if (!examId.value) return
  try {
    const res: any = await getAiExamReportApi({ examId: examId.value })
    if (res.code === 200) {
      aiReportData.value = res.data
    }
  } catch (e) {
    console.error('获取 AI 成绩报告失败:', e)
  }
}

const switchSubject = (sub: string) => {
  currentSubject.value = sub
}

const showDetail = (exam: any) => {
  selectedExam.value = exam
  showPopup.value = true
}

const formatLabel = (period: string) => {
  if (!period) return []
  // 按照空格、横杠或者学年学期关键字进行拆分，模拟图二竖直正面显示效果
  // 比如 "2023-2024学年第一学期期中考试" 拆分为几段
  const year = period.match(/\d{4}-\d{4}/)?.[0] || ''
  let rest = period.replace(year, '').trim()
  
  const result = []
  if (year) result.push(year)
  
  // 进一步拆分剩余部分，比如“第一学期”和“期中考试”
  if (rest.includes('学期')) {
    const termIdx = rest.indexOf('学期') + 2
    result.push(rest.substring(0, termIdx))
    result.push(rest.substring(termIdx))
  } else {
    result.push(rest)
  }
  return result.filter(item => item.length > 0)
}

const getTrendSummary = () => {
  if (!trendData.value || !trendData.value.history || trendData.value.history.length === 0) return ''
  const history = trendData.value.history
  const latest = history[history.length - 1].score
  if (history.length < 2) return '首考记录'
  const prev = history[history.length - 2].score
  const diff = latest - prev
  return diff >= 0 ? `+${diff}分` : `${diff}分`
}

const getChartValue = (item: any) => {
  if (currentSubject.value === '总分') {
    return item.score
  }
  return item.subjects?.[currentSubject.value] || 0
}

const getChartHeight = (item: any) => {
  const val = getChartValue(item)
  const max = currentSubject.value === '总分'
    ? Object.values(subjectFullScoreMap.value).reduce((sum, score) => sum + Number(score || 0), 0) || 750
    : Number(subjectFullScoreMap.value[currentSubject.value] || 100)
  return (val / max * 100) + '%'
}

const getChartColor = (index: number) => {
  if (index === (trendData.value?.history.length - 1)) {
    return 'linear-gradient(to top, #00f2fe 0%, #4facfe 100%)' // 最后一项高亮
  }
  return 'linear-gradient(to top, #4364f7 0%, #6fb1fc 100%)'
}

onLoad((options) => {
  const currentScoreData = uni.getStorageSync('currentScoreData')
  examId.value = options?.examId || currentScoreData?.examId || ''
  const subjects = Array.isArray(currentScoreData?.subjects) ? currentScoreData.subjects : []
  subjectFullScoreMap.value = subjects.reduce((acc: Record<string, number>, item: any) => {
    if (item?.name) {
      acc[item.name] = Number(item.fullScore || 0)
    }
    return acc
  }, {})
})

onMounted(() => {
  fetchAiReport()
  fetchTrendData()
})
</script>

<style lang="scss" scoped>
.score-container {
  min-height: 100vh;
  background-color: #f6f8fc;
  padding: 20rpx 30rpx 50rpx;
  box-sizing: border-box;
}

.loading-state, .empty-state {
  padding-top: 200rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #999;
  font-size: 28rpx;
  text { margin-top: 20rpx; }
}

.analysis-card {
  background: #fff;
  border-radius: 32rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(149, 157, 165, 0.06);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 30rpx;
    
    .header-left {
      display: flex;
      flex-direction: column;
      .card-title { font-size: 32rpx; font-weight: bold; color: #1a1a1a; margin-bottom: 8rpx; }
      .volatility-tag { font-size: 20rpx; color: #fa9d3b; background: #fff7e6; padding: 2rpx 12rpx; border-radius: 6rpx; width: fit-content; }
    }
    
    .compare-badge {
      font-size: 24rpx;
      font-weight: bold;
      padding: 4rpx 20rpx;
      border-radius: 20rpx;
      &.positive { background: #e6f7ef; color: #07c160; }
      &.negative { background: #fff1f0; color: #ee0a24; }
    }
  }
}

/* 切换标签 */
.chart-tabs {
  margin-bottom: 40rpx;
  .tabs-scroll { white-space: nowrap; width: 100%; }
  .tab-item {
    display: inline-block;
    padding: 12rpx 32rpx;
    margin-right: 16rpx;
    font-size: 24rpx;
    color: #666;
    background: #f4f6f9;
    border-radius: 30rpx;
    transition: all 0.3s;
    
    &.active {
      background: #4364f7;
      color: #fff;
      font-weight: bold;
      box-shadow: 0 4rpx 12rpx rgba(67, 100, 247, 0.2);
    }
  }
}

/* 趋势图表 */
.trend-chart {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 440rpx;
  padding-bottom: 120rpx;
  position: relative;
  margin-top: 20rpx;

  .bar-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    position: relative;
    z-index: 2;
    
    .bar-val { 
      font-size: 24rpx; 
      color: #333; 
      margin-bottom: 12rpx; 
      font-weight: bold;
      background: rgba(255, 255, 255, 0.8);
      padding: 0 4rpx;
      border-radius: 4rpx;
    }
    
    .bar-track {
      width: 48rpx;
      flex: 1;
      background: #f0f2f5;
      border-radius: 24rpx;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      overflow: hidden;
      
      .bar-fill {
        width: 100%;
        border-radius: 24rpx;
        transition: height 1s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        .fill-light {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(90deg, rgba(255,255,255,0.1), transparent, rgba(255,255,255,0.1));
        }
      }
    }
    
    .bar-label {
      position: absolute;
      bottom: -110rpx;
      font-size: 20rpx;
      color: #888;
      text-align: center;
      width: 100rpx;
      line-height: 1.4;
      white-space: normal;
      word-break: break-all;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
    }
  }
}

/* 学科强弱分析 (新增) */
.strength-card {
  .strength-grid {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
    
    .strength-item {
      display: flex;
      align-items: center;
      padding: 24rpx;
      border-radius: 20rpx;
      
      &.positive { background: #f0fdf4; border: 1rpx solid #dcfce7; }
      &.negative { background: #fef2f2; border: 1rpx solid #fee2e2; }
      
      .s-icon-wrap {
        width: 72rpx;
        height: 72rpx;
        background: #fff;
        border-radius: 16rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 24rpx;
        box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.02);
      }
      
      .s-info {
        flex: 1;
        .s-label { font-size: 24rpx; color: #666; margin-bottom: 8rpx; display: block; }
        .s-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 12rpx;
          .s-tag {
            font-size: 26rpx;
            font-weight: bold;
            color: #333;
            background: #fff;
            padding: 2rpx 16rpx;
            border-radius: 8rpx;
          }
        }
      }
    }
  }
}

/* 排名走势 */
.rank-trend-card {
  .rank-now { font-size: 22rpx; color: #4364f7; background: #eef2ff; padding: 4rpx 16rpx; border-radius: 20rpx; font-weight: bold; }
  .rank-chart {
    height: 200rpx;
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    padding: 40rpx 0 60rpx;
    position: relative;
    
    .rank-point-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      flex: 1;
      position: relative;
      z-index: 2;
      
      .rank-point-container {
        flex: 1;
        width: 100%;
        position: relative;
        .rank-point {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 16rpx;
          height: 16rpx;
          background: #4364f7;
          border: 4rpx solid #fff;
          border-radius: 50%;
          box-shadow: 0 2rpx 8rpx rgba(67, 100, 247, 0.3);
          transition: bottom 1s;
          .point-val { position: absolute; top: -30rpx; left: 50%; transform: translateX(-50%); font-size: 20rpx; color: #4364f7; font-weight: bold; }
        }
      }
      .point-label { font-size: 20rpx; color: #999; margin-top: 10rpx; }
    }
    .rank-line-bg { position: absolute; left: 0; right: 0; top: 50%; height: 2rpx; background: #f0f2f5; z-index: 1; }
  }
}

/* 总结卡片 */
.summary-card {
  .summary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    .summary-title { font-size: 28rpx; font-weight: bold; color: #4364f7; }
  }
  .insight-text { font-size: 26rpx; color: #4a4a4a; line-height: 1.6; }
}

/* 里程碑 */
.milestones-card {
  .milestone-list {
    .milestone-item {
      display: flex;
      align-items: center;
      padding: 24rpx 0;
      border-bottom: 1rpx solid #f0f2f5;
      &:last-child { border-bottom: none; }
      
      .ms-icon { width: 48rpx; height: 48rpx; display: flex; align-items: center; justify-content: center; margin-right: 20rpx; color: #ccc; }
      .ms-info {
        flex: 1;
        .ms-name { font-size: 26rpx; color: #666; display: block; }
        .ms-date { font-size: 20rpx; color: #999; margin-top: 4rpx; }
      }
      
      &.completed {
        .ms-icon { color: #07c160; }
        .ms-name { color: #333; font-weight: 500; }
      }
    }
  }
}

/* 弹窗内容 */
.popup-content {
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #f0f2f5;
    .p-header-left {
      .popup-title { font-size: 32rpx; font-weight: bold; display: block; color: #333; }
      .popup-desc { font-size: 22rpx; color: #999; margin-top: 4rpx; }
    }
    .p-header-right {
      text-align: right;
      .popup-score { font-size: 48rpx; font-weight: bold; color: #4364f7; line-height: 1; }
      .popup-unit { font-size: 24rpx; color: #4364f7; margin-left: 4rpx; }
    }
  }
  .popup-subjects {
    display: flex;
    flex-wrap: wrap;
    .sub-item {
      width: 33.33%;
      margin-bottom: 30rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      .sub-name { font-size: 24rpx; color: #999; margin-bottom: 8rpx; }
      .sub-val { font-size: 30rpx; font-weight: bold; color: #333; }
    }
  }
}
</style>
