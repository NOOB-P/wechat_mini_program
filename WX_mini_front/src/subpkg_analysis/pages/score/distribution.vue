<template>
  <view class="score-container">
    <!-- 学科切换 -->
    <view class="subject-tabs">
      <scroll-view scroll-x class="tabs-scroll" show-scrollbar="false">
        <view 
          v-for="sub in subjects" 
          :key="sub"
          class="tab-item"
          :class="{ active: currentSubject === sub }"
          @tap="switchSubject(sub)"
        >
          {{ sub }}
        </view>
      </scroll-view>
    </view>

    <view v-if="loading" class="loading-state">
      <wd-loading />
      <text>正在深度分析分数分布...</text>
    </view>

    <block v-else-if="distributionData">
      <!-- 核心概览卡片 -->
      <view class="analysis-card overview-card">
        <view class="overview-header">
          <view class="header-left">
            <text class="title">分数分布统计</text>
            <view class="rank-badge">年级排名: 第{{ distributionData.rank }}名</view>
          </view>
          <view class="overall-level">
            综合等级 <text class="level-val">{{ distributionData.overallLevel }}</text>
          </view>
        </view>

        <!-- 柱状图区域 -->
        <view class="dist-chart">
          <view class="dist-bar" v-for="(item, index) in distributionData.levels" :key="index">
            <view class="bar-val">{{ item.count }}人</view>
            <view class="bar-track">
              <view 
                class="bar-fill" 
                :style="{ 
                  height: (item.count / getMaxCount(distributionData.levels) * 100) + '%',
                  background: item.color 
                }"
              ></view>
            </view>
            <view class="bar-label">{{ item.level }}</view>
            <view class="bar-range">{{ item.label }}</view>
          </view>
        </view>
      </view>

      <!-- 统计指标网格 -->
      <view class="stats-grid">
         <view class="stats-card" v-for="(stat, index) in distributionData.stats" :key="index" :class="'card-' + index">
           <view class="stats-icon-wrap" :class="'icon-' + index">
             <wd-icon :name="stat.icon" size="20px" />
           </view>
           <view class="stats-info">
             <view class="val-row">
               <text class="stats-val">{{ stat.value }}</text>
               <text 
                 v-if="stat.compare" 
                 class="stats-compare" 
                 :class="{ up: stat.compare.includes('+'), neutral: !stat.compare.includes('+') && !stat.compare.includes('-') }"
               >
                 {{ stat.compare }}
               </text>
             </view>
             <text class="stats-name">{{ stat.name }}</text>
           </view>
         </view>
       </view>

      <!-- 个人定位与均分对比 (新增) -->
      <view class="analysis-card compare-card">
        <view class="card-header">
          <text class="card-title">个人定位分析</text>
        </view>
        <view class="compare-body">
          <view class="compare-visual">
            <view class="circle-chart">
              <view class="circle-val">
                <text class="num">{{ Math.round((1 - distributionData.rank / distributionData.studentCount) * 100) }}%</text>
                <text class="label">击败同级</text>
              </view>
            </view>
          </view>
          <view class="compare-details">
            <view class="detail-item">
              <text class="d-label">高于年级平均</text>
              <text class="d-val">{{ (distributionData.score - distributionData.gradeAverageScore) >= 0 ? '+' : '' }}{{ (distributionData.score - distributionData.gradeAverageScore).toFixed(1) }}分</text>
            </view>
            <view class="detail-item">
              <text class="d-label">距离最高分</text>
              <text class="d-val">{{ (distributionData.highestScore - distributionData.score) === 0 ? '已达最高' : (distributionData.highestScore - distributionData.score).toFixed(1) + '分' }}</text>
            </view>
            <view class="progress-line">
              <view class="line-bg">
                <view 
                  class="line-fill" 
                  :style="{ width: Math.round((1 - distributionData.rank / distributionData.studentCount) * 100) + '%' }"
                ></view>
              </view>
              <text class="line-desc">当前水平：{{ getLevelText(distributionData.rank / distributionData.studentCount) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 智能分布洞察 -->
      <view class="analysis-card insight-card">
        <view class="card-header">
          <text class="card-title">多维度诊断</text>
        </view>
        <view class="insight-content">
          <view class="insight-item" v-for="(item, index) in diagnosisCards" :key="`${currentSubject}-${index}`">
            <view class="insight-icon"><wd-icon :name="item.icon" size="16px" :color="item.color" /></view>
            <view class="insight-text">
              <view class="i-title">{{ item.title }}</view>
              <view class="i-desc">{{ item.desc }}</view>
            </view>
          </view>
        </view>
      </view>

      <!-- 推荐提升路径 (新增) -->
      <view class="analysis-card path-card">
        <view class="card-header">
          <text class="card-title">个性化提升建议</text>
        </view>
        <view class="path-list">
          <view class="path-item" v-for="(item, index) in improvementSuggestions" :key="`${currentSubject}-suggest-${index}`">
            <view class="p-num">{{ String(index + 1).padStart(2, '0') }}</view>
            <view class="p-content">
              <text class="p-title">{{ currentSubject === '总分' ? `总分提升建议 ${index + 1}` : `${currentSubject}专项建议 ${index + 1}` }}</text>
              <text class="p-desc">{{ item }}</text>
            </view>
          </view>
        </view>
      </view>
    </block>

    <view v-else class="empty-state">
      <wd-status-tip image="content" title="暂无分布数据" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getAiExamReportApi, getScoreDistributionApi } from '@/subpkg_analysis/api/score'
import { useToast } from 'wot-design-uni'

const subjects = ref(['总分', '语文', '数学', '英语', '物理', '化学', '生物'])
const currentSubject = ref('总分')
const distributionData = ref<any>(null)
const aiReportData = ref<any>(null)
const loading = ref(false)
const examId = ref('')
const toast = useToast()

const currentAiInsight = computed(() => {
  return (aiReportData.value?.subjectInsights || []).find((item: any) => item.subjectName === currentSubject.value) || null
})

const currentAiWrongPushes = computed(() => {
  return (aiReportData.value?.wrongQuestionPushes || []).filter((item: any) => item.subjectName === currentSubject.value)
})

const diagnosisCards = computed(() => {
  if (!distributionData.value) return []

  const cards = [
    {
      icon: 'user',
      color: '#4364f7',
      title: '群体参与',
      desc: `本次共有 ${distributionData.value.studentCount} 名同学参与，样本覆盖全面。`
    },
    {
      icon: 'chart-bar',
      color: '#fa9d3b',
      title: '分布重心',
      desc: `当前成绩主要集中在 ${getMostPopulatedRange(distributionData.value.levels)} 区间，能够反映本次整体竞争强度。`
    }
  ]

  if (currentSubject.value === '总分') {
    const focusPoints = aiReportData.value?.summary?.focusPoints || []
    const overallComment = aiReportData.value?.summary?.overallComment || ''
    cards.push({
      icon: 'check-circle',
      color: '#07c160',
      title: 'AI 总评',
      desc: focusPoints[0] || overallComment || 'AI 正在持续观察本次总分表现，建议结合整体报告继续调整节奏。'
    })
    return cards
  }

  if (currentAiInsight.value) {
    cards.push({
      icon: 'check-circle',
      color: '#07c160',
      title: 'AI 学科洞察',
      desc: [currentAiInsight.value.strength, currentAiInsight.value.weakness, currentAiInsight.value.comparison]
        .filter(Boolean)
        .join(' ')
    })
  } else {
    cards.push({
      icon: 'check-circle',
      color: '#07c160',
      title: '进阶建议',
      desc: '建议继续围绕当前学科的失分点做定向巩固，逐步提升稳定性与上限。'
    })
  }

  return cards
})

const improvementSuggestions = computed(() => {
  if (currentSubject.value === '总分') {
    const focusPoints = aiReportData.value?.summary?.focusPoints || []
    if (focusPoints.length) {
      return focusPoints
    }
  }

  const aiSuggestions = currentAiWrongPushes.value
    .map((item: any) => item.suggestion)
    .filter(Boolean)
  if (aiSuggestions.length) {
    return Array.from(new Set(aiSuggestions))
  }

  if (currentAiInsight.value) {
    return [currentAiInsight.value.weakness, currentAiInsight.value.comparison].filter(Boolean)
  }

  return [
    '保持当前节奏，优先巩固基础题与中档题得分稳定性。',
    '针对高频失分点做专题训练，并及时复盘错题原因。'
  ]
})

const fetchDistributionData = async (subject: string) => {
  loading.value = true
  try {
    const res: any = await getScoreDistributionApi({ examId: examId.value, subject })
    if (res.code === 200) {
      distributionData.value = res.data
    }
  } catch (e: any) {
    distributionData.value = null
    toast.error(e?.msg || '获取分数分布统计失败')
    console.error('获取分布数据失败:', e)
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
  fetchDistributionData(sub)
}

const getMaxCount = (levels: any[]) => {
  return Math.max(...levels.map(l => l.count)) || 1
}

const getMostPopulatedRange = (levels: any[]) => {
  const most = levels.reduce((prev, current) => (prev.count > current.count) ? prev : current)
  return most ? `${most.level}级 (${most.label})` : '未知'
}

const getLevelText = (ratio: number) => {
  const percent = (1 - ratio) * 100
  if (percent >= 90) return '拔尖'
  if (percent >= 70) return '优秀'
  if (percent >= 50) return '良好'
  if (percent >= 30) return '及格'
  return '需努力'
}

onLoad((options) => {
  const currentScoreData = uni.getStorageSync('currentScoreData')
  examId.value = options?.examId || currentScoreData?.examId || ''
})

onMounted(() => {
  const historyData = uni.getStorageSync('currentAnalysisData')
  if (historyData && historyData.subjects) {
    const subjectNames = historyData.subjects.map((s: any) => s.name).filter(Boolean)
    subjects.value = ['总分', ...subjectNames]
  }
  fetchAiReport()
  fetchDistributionData(currentSubject.value)
})
</script>

<style lang="scss" scoped>
.score-container {
  min-height: 100vh;
  background-color: #f6f8fc;
  padding: 20rpx 30rpx 50rpx;
  box-sizing: border-box;
}

/* 学科切换 */
.subject-tabs {
  margin-bottom: 30rpx;
  .tabs-scroll { white-space: nowrap; width: 100%; }
  .tab-item {
    display: inline-block;
    padding: 12rpx 36rpx;
    margin-right: 20rpx;
    background: #fff;
    border-radius: 40rpx;
    font-size: 28rpx;
    color: #666;
    transition: all 0.3s;
    border: 1px solid transparent;

    &.active {
      background: #eef2ff;
      color: #4364f7;
      font-weight: bold;
      border-color: #4364f7;
      box-shadow: 0 4rpx 12rpx rgba(67, 100, 247, 0.1);
    }
  }
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
  padding: 34rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(149, 157, 165, 0.08);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    
    .card-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #1a1a1a;
      position: relative;
      padding-left: 20rpx;
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 10%;
        height: 80%;
        width: 6rpx;
        background: #4364f7;
        border-radius: 4rpx;
      }
    }
  }
}

/* 概览卡片优化 */
.overview-card {
  .overview-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 40rpx;
    
    .header-left {
      display: flex;
      flex-direction: column;
      .title { font-size: 36rpx; font-weight: bold; color: #333; margin-bottom: 12rpx; }
      .rank-badge {
        display: inline-block;
        font-size: 22rpx;
        color: #4364f7;
        background: #eef2ff;
        padding: 4rpx 16rpx;
        border-radius: 8rpx;
        width: fit-content;
        font-weight: 500;
      }
    }
    
    .overall-level {
      text-align: right;
      font-size: 24rpx;
      color: #999;
      .level-val {
        display: block;
        font-size: 56rpx;
        font-weight: bold;
        color: #4364f7;
        line-height: 1;
        margin-top: 12rpx;
      }
    }
  }
}

/* 柱状图优化 */
.dist-chart {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 400rpx;
  padding: 20rpx 0 60rpx;

  .dist-bar {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    position: relative;
    
    .bar-val { font-size: 22rpx; color: #666; margin-bottom: 12rpx; }
    
    .bar-track {
      width: 56rpx;
      flex: 1;
      background: #f4f6f9;
      border-radius: 28rpx;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      overflow: hidden;
      
      .bar-fill {
        width: 100%;
        border-radius: 28rpx;
        transition: height 1s cubic-bezier(0.4, 0, 0.2, 1);
      }
    }
    
    .bar-label { margin-top: 20rpx; font-size: 28rpx; color: #333; font-weight: bold; }
    .bar-range { position: absolute; bottom: -40rpx; font-size: 20rpx; color: #999; white-space: nowrap; }
  }
}

/* 统计网格优化 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 30rpx;
  
  .stats-card {
    background: #fff;
    padding: 24rpx 20rpx;
    border-radius: 28rpx;
    display: flex;
    align-items: center;
    box-shadow: 0 4rpx 12rpx rgba(149, 157, 165, 0.05);
    
    .stats-icon-wrap {
      width: 72rpx;
      height: 72rpx;
      background: #f0f4ff;
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .stats-info {
      margin-left: 16rpx;
      flex: 1;
      overflow: hidden;
      
      .val-row {
        display: flex;
        align-items: baseline;
        .stats-val { font-size: 34rpx; font-weight: bold; color: #333; }
        .stats-compare {
          font-size: 20rpx;
          margin-left: 6rpx;
          color: #ee0a24;
          &.up { color: #07c160; }
          &.neutral { color: #999; }
        }
      }
      .stats-name { font-size: 22rpx; color: #999; margin-top: 4rpx; }
    }
    
    /* 图标与背景色差异化 */
    &.card-0 .stats-icon-wrap { background: #eef2ff; color: #4364f7; }
    &.card-1 .stats-icon-wrap { background: #fff7e6; color: #ffa940; }
    &.card-2 .stats-icon-wrap { background: #f6ffed; color: #73d13d; }
    &.card-3 .stats-icon-wrap { background: #fff1f0; color: #ff4d4f; }
  }
}

/* 对比卡片优化 */
.compare-card {
  .compare-body {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
  }
  .compare-visual {
    width: 200rpx;
    height: 200rpx;
    margin-right: 40rpx;
    .circle-chart {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 12rpx solid #eef2ff;
      border-top-color: #4364f7;
      display: flex;
      align-items: center;
      justify-content: center;
      .circle-val {
        text-align: center;
        .num { font-size: 36rpx; font-weight: bold; color: #4364f7; display: block; }
        .label { font-size: 20rpx; color: #999; }
      }
    }
  }
  .compare-details {
    flex: 1;
    .detail-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20rpx;
      .d-label { font-size: 24rpx; color: #666; }
      .d-val { font-size: 26rpx; font-weight: bold; color: #333; }
    }
    .progress-line {
      margin-top: 30rpx;
      .line-bg { height: 8rpx; background: #f4f6f9; border-radius: 4rpx; margin-bottom: 12rpx; }
      .line-fill { height: 100%; background: #4364f7; border-radius: 4rpx; }
      .line-desc { font-size: 22rpx; color: #4364f7; font-weight: 500; }
    }
  }
}

/* 洞察卡片优化 */
.insight-card {
  .insight-content {
    .insight-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 24rpx;
      background: #f8fafc;
      padding: 24rpx;
      border-radius: 24rpx;
      
      &:last-child { margin-bottom: 0; }
      
      .insight-icon {
        width: 56rpx;
        height: 56rpx;
        background: #fff;
        border-radius: 16rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 24rpx;
        flex-shrink: 0;
        box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.02);
      }
      
      .insight-text { flex: 1; }
      .i-title { font-size: 28rpx; font-weight: bold; color: #333; margin-bottom: 6rpx; }
      .i-desc { font-size: 24rpx; color: #666; line-height: 1.5; }
      .bold { font-weight: bold; color: #333; margin: 0 4rpx; }
    }
  }
}

/* 路径卡片 (新增) */
.path-card {
  .path-list {
    .path-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 30rpx;
      &:last-child { margin-bottom: 0; }
      
      .p-num {
        width: 44rpx;
        height: 44rpx;
        background: #eef2ff;
        color: #4364f7;
        font-size: 22rpx;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12rpx;
        margin-right: 24rpx;
        flex-shrink: 0;
      }
      .p-content {
        flex: 1;
        .p-title { font-size: 28rpx; font-weight: bold; color: #333; margin-bottom: 8rpx; display: block; }
        .p-desc { font-size: 24rpx; color: #666; line-height: 1.5; }
      }
    }
  }
}
</style>
