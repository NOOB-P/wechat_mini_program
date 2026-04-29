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
      <text>加载分析数据中...</text>
    </view>

    <block v-else-if="compositionData">
      <!-- 核心概览卡片 -->
      <view class="analysis-card overview-card">
        <view class="score-circle">
          <view class="circle-content">
            <text class="score-num">{{ compositionData.score }}</text>
            <text class="score-total">/ {{ compositionData.fullScore }}</text>
            <text class="subject-label">{{ compositionData.subject || currentSubject }}</text>
          </view>
        </view>
        <view class="rank-info">
          <view class="rank-item">
            <text class="rank-val">{{ compositionData.rank }}</text>
            <text class="rank-label">全级排名</text>
          </view>
          <view class="rank-divider"></view>
          <view class="rank-item">
            <text class="rank-val">{{ Math.round((1 - compositionData.rank / compositionData.totalStudents) * 100) }}%</text>
            <text class="rank-label">超过同级</text>
          </view>
        </view>
      </view>

      <!-- 构成分析卡片 -->
      <view class="analysis-card">
        <view class="card-header">
          <text class="card-title">分项能力表现</text>
          <text class="card-subtitle">维度分析</text>
        </view>
        <view class="composition-list">
          <view class="comp-item" v-for="(item, index) in compositionData.composition" :key="index">
            <view class="comp-info">
              <text class="comp-name">{{ item.name }}</text>
              <text class="comp-level" :style="{ color: item.color }">{{ item.level }}</text>
            </view>
            <view class="comp-bar-container">
              <view class="comp-bar-bg">
                <view 
                  class="comp-bar-fill" 
                  :style="{ width: item.value + '%', backgroundColor: item.color }"
                ></view>
              </view>
              <text class="comp-value">{{ item.value }}%</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 知识点掌握卡片 -->
      <view class="analysis-card" v-if="compositionData.knowledgePoints && compositionData.knowledgePoints.length > 0">
        <view class="card-header">
          <text class="card-title">核心知识点掌握度</text>
        </view>
        <view class="knowledge-grid">
          <view class="knowledge-item" v-for="(kp, index) in compositionData.knowledgePoints" :key="index">
            <view class="kp-mastery">
              <wd-progress :percentage="kp.mastery" :color="getMasteryColor(kp.status)" hide-text />
            </view>
            <view class="kp-detail">
              <text class="kp-name">{{ kp.name }}</text>
              <text class="kp-status" :class="kp.status">{{ getStatusText(kp.status) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 专家诊断卡片 -->
      <view class="analysis-card diagnostic-card">
        <view class="card-header">
          <text class="card-title">学情诊断分析</text>
          <wd-icon name="chart-bar" size="20px" color="#4364f7" />
        </view>
        <view class="diagnostic-content">
          <text class="analysis-text">{{ displayAnalysisText }}</text>
        </view>
      </view>

      <!-- 提分建议卡片 -->
      <view class="analysis-card advice-card">
        <view class="card-header">
          <text class="card-title">针对性提分建议</text>
          <text class="advice-count">{{ displayAdviceList.length }}条</text>
        </view>
        <view class="advice-list">
          <view class="advice-item" v-for="(adv, index) in displayAdviceList" :key="`${currentSubject}-${index}`">
            <view class="advice-index">{{ index + 1 }}</view>
            <text class="advice-text">{{ adv }}</text>
          </view>
        </view>
      </view>

      <view v-if="hasAiReportSection" class="analysis-card ai-report-card">
        <view class="card-header">
          <text class="card-title">AI 成绩报告</text>
          <text class="card-subtitle">{{ currentSubject === '总分' ? '整体分析' : `${currentSubject}专项分析` }}</text>
        </view>

        <view v-if="currentSubject === '总分'">
          <view class="ai-section" v-if="aiReportData?.summary?.strengths?.length">
            <text class="ai-section-title">强势点</text>
            <view class="ai-tag-list">
              <view v-for="item in aiReportData.summary.strengths" :key="`s-${item}`" class="ai-tag good">{{ item }}</view>
            </view>
          </view>

          <view class="ai-section" v-if="aiReportData?.summary?.weaknesses?.length">
            <text class="ai-section-title">薄弱点</text>
            <view class="ai-tag-list">
              <view v-for="item in aiReportData.summary.weaknesses" :key="`w-${item}`" class="ai-tag warn">{{ item }}</view>
            </view>
          </view>

          <view class="ai-section" v-if="aiReportData?.summary?.focusPoints?.length">
            <text class="ai-section-title">重点关注</text>
            <view v-for="item in aiReportData.summary.focusPoints" :key="`f-${item}`" class="ai-focus-item">{{ item }}</view>
          </view>

          <view class="ai-section" v-if="aiReportData?.subjectInsights?.length">
            <text class="ai-section-title">学科洞察</text>
            <view v-for="item in aiReportData.subjectInsights" :key="item.subjectName" class="ai-insight-card">
              <view class="ai-insight-title">{{ item.subjectName }}</view>
              <view class="ai-insight-line"><text class="ai-label">优势</text>{{ item.strength }}</view>
              <view class="ai-insight-line"><text class="ai-label">短板</text>{{ item.weakness }}</view>
              <view class="ai-insight-line"><text class="ai-label">对比</text>{{ item.comparison }}</view>
            </view>
          </view>
        </view>

        <view v-else>
          <view v-if="currentAiInsight" class="ai-insight-card single">
            <view class="ai-insight-title">{{ currentAiInsight.subjectName }}</view>
            <view class="ai-insight-line"><text class="ai-label">优势</text>{{ currentAiInsight.strength }}</view>
            <view class="ai-insight-line"><text class="ai-label">短板</text>{{ currentAiInsight.weakness }}</view>
            <view class="ai-insight-line"><text class="ai-label">对比</text>{{ currentAiInsight.comparison }}</view>
          </view>
          <view v-if="currentAiWrongPushes.length">
            <text class="ai-section-title">错题定向推送</text>
            <view v-for="(item, index) in currentAiWrongPushes" :key="`${item.questionNo}-${index}`" class="ai-wrong-card">
              <view class="ai-wrong-head">
                <text>{{ item.questionNo }}</text>
                <text class="ai-wrong-kp" v-if="item.knowledgePoint">{{ item.knowledgePoint }}</text>
              </view>
              <view class="ai-insight-line"><text class="ai-label">问题原因</text>{{ item.reason }}</view>
              <view class="ai-insight-line"><text class="ai-label">改进建议</text>{{ item.suggestion }}</view>
            </view>
          </view>
        </view>
      </view>
    </block>

    <view v-else class="empty-state">
      <wd-status-tip image="content" title="暂无分析数据" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getAiExamReportApi, getScoreCompositionApi } from '@/subpkg_analysis/api/score'
import { useToast } from 'wot-design-uni'

const subjects = ref(['总分', '语文', '数学', '英语', '物理', '化学', '生物'])
const currentSubject = ref('总分')
const compositionData = ref<any>(null)
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

const displayAnalysisText = computed(() => {
  if (currentSubject.value === '总分') {
    return aiReportData.value?.summary?.overallComment || compositionData.value?.analysis || '暂无分析'
  }
  if (currentAiInsight.value) {
    return [currentAiInsight.value.strength, currentAiInsight.value.weakness, currentAiInsight.value.comparison]
      .filter(Boolean)
      .join(' ')
  }
  return compositionData.value?.analysis || '暂无分析'
})

const displayAdviceList = computed(() => {
  if (currentSubject.value === '总分') {
    const focusPoints = aiReportData.value?.summary?.focusPoints || []
    return focusPoints.length ? focusPoints : (compositionData.value?.advice || [])
  }
  const subjectSuggestions = currentAiWrongPushes.value
    .map((item: any) => item.suggestion)
    .filter(Boolean)
  if (subjectSuggestions.length) {
    return Array.from(new Set(subjectSuggestions))
  }
  return compositionData.value?.advice || []
})

const hasAiReportSection = computed(() => {
  if (!aiReportData.value) return false
  if (currentSubject.value === '总分') return true
  return !!currentAiInsight.value || currentAiWrongPushes.value.length > 0
})

const fetchCompositionData = async (subject: string) => {
  loading.value = true
  try {
    const res: any = await getScoreCompositionApi({ examId: examId.value, subject })
    if (res.code === 200) {
      compositionData.value = res.data
    }
  } catch (e: any) {
    compositionData.value = null
    toast.error(e?.msg || '获取成绩构成分析失败')
    console.error('获取构成分析失败:', e)
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
  fetchCompositionData(sub)
}

const getMasteryColor = (status: string) => {
  switch (status) {
    case 'mastered': return '#07c160'
    case 'warning': return '#fa9d3b'
    case 'danger': return '#ee0a24'
    default: return '#4364f7'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'mastered': return '已掌握'
    case 'warning': return '需加强'
    case 'danger': return '薄弱项'
    default: return '学习中'
  }
}

onLoad((options) => {
  const currentScoreData = uni.getStorageSync('currentScoreData')
  examId.value = options?.examId || currentScoreData?.examId || ''
})

onMounted(() => {
  // 尝试从缓存中读取当前考试的学科列表，如果没有则用默认的
  const historyData = uni.getStorageSync('currentAnalysisData')
  if (historyData && historyData.subjects) {
    const subjectNames = historyData.subjects.map((s: any) => s.name).filter(Boolean)
    subjects.value = ['总分', ...subjectNames]
  }
  fetchAiReport()
  fetchCompositionData(currentSubject.value)
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
  .tabs-scroll {
    white-space: nowrap;
    width: 100%;
  }
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
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(149, 157, 165, 0.1);

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
    .card-subtitle {
      font-size: 24rpx;
      color: #999;
    }
  }
}

/* 核心概览卡片 */
.overview-card {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 40rpx 30rpx;
  background: linear-gradient(135deg, #4364f7, #6fb1fc);
  color: #fff;

  .score-circle {
    width: 200rpx;
    height: 200rpx;
    border-radius: 50%;
    border: 8rpx solid rgba(255, 255, 255, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    
    .circle-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      .score-num { font-size: 60rpx; font-weight: bold; line-height: 1; }
      .score-total { font-size: 24rpx; opacity: 0.8; margin: 4rpx 0; }
      .subject-label { font-size: 26rpx; background: rgba(255, 255, 255, 0.2); padding: 2rpx 16rpx; border-radius: 20rpx; }
    }
  }

  .rank-info {
    flex: 1;
    display: flex;
    justify-content: space-around;
    align-items: center;
    
    .rank-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      .rank-val { font-size: 40rpx; font-weight: bold; }
      .rank-label { font-size: 24rpx; opacity: 0.8; margin-top: 8rpx; }
    }
    .rank-divider {
      width: 2rpx;
      height: 60rpx;
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

/* 构成列表 */
.composition-list {
  .comp-item {
    margin-bottom: 24rpx;
    &:last-child { margin-bottom: 0; }
    
    .comp-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12rpx;
      .comp-name { font-size: 28rpx; color: #333; }
      .comp-level { font-size: 24rpx; font-weight: bold; }
    }
    
    .comp-bar-container {
      display: flex;
      align-items: center;
      .comp-bar-bg {
        flex: 1;
        height: 12rpx;
        background: #f0f2f5;
        border-radius: 6rpx;
        overflow: hidden;
        .comp-bar-fill { height: 100%; border-radius: 6rpx; transition: width 0.6s ease-out; }
      }
      .comp-value { width: 80rpx; text-align: right; font-size: 26rpx; color: #666; font-weight: 500; }
    }
  }
}

/* 知识点网格 */
.knowledge-grid {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10rpx;
  
  .knowledge-item {
    width: 50%;
    padding: 10rpx;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    margin-bottom: 20rpx;
    
    .kp-mastery { margin-bottom: 12rpx; }
    .kp-detail {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .kp-name { font-size: 26rpx; color: #444; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .kp-status {
        font-size: 20rpx;
        padding: 2rpx 10rpx;
        border-radius: 4rpx;
        margin-left: 10rpx;
        &.mastered { background: #e6f7ef; color: #07c160; }
        &.warning { background: #fff7e6; color: #fa9d3b; }
        &.danger { background: #fff1f0; color: #ee0a24; }
      }
    }
  }
}

/* 诊断分析 */
.diagnostic-card {
  .analysis-text {
    font-size: 28rpx;
    color: #4a4a4a;
    line-height: 1.8;
    text-align: justify;
  }
}

/* 提分建议 */
.advice-card {
  .advice-count { font-size: 24rpx; color: #4364f7; background: #eef2ff; padding: 2rpx 12rpx; border-radius: 8rpx; }
  .advice-list {
    .advice-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 20rpx;
      background: #f8f9fc;
      padding: 20rpx;
      border-radius: 16rpx;
      
      .advice-index {
        width: 36rpx;
        height: 36rpx;
        background: #4364f7;
        color: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20rpx;
        margin-right: 20rpx;
        flex-shrink: 0;
        margin-top: 4rpx;
      }
      .advice-text { font-size: 26rpx; color: #333; line-height: 1.5; }
    }
  }
}

.ai-report-card {
  .ai-section {
    margin-bottom: 24rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .ai-section-title {
    display: block;
    font-size: 28rpx;
    font-weight: 700;
    color: #1f2d3d;
    margin-bottom: 14rpx;
  }

  .ai-tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 14rpx;
  }

  .ai-tag {
    padding: 10rpx 18rpx;
    border-radius: 16rpx;
    font-size: 24rpx;

    &.good {
      background: #edf8f1;
      color: #1f9d55;
    }

    &.warn {
      background: #fff3ec;
      color: #e67e22;
    }
  }

  .ai-focus-item,
  .ai-insight-card,
  .ai-wrong-card {
    background: #f8fafc;
    border-radius: 18rpx;
    padding: 22rpx;
    margin-top: 14rpx;
  }

  .ai-insight-title {
    font-size: 28rpx;
    font-weight: 700;
    color: #1f2d3d;
    margin-bottom: 12rpx;
  }

  .ai-insight-line,
  .ai-focus-item {
    font-size: 25rpx;
    line-height: 1.7;
    color: #3a4658;
  }

  .ai-label {
    color: #2563eb;
    font-weight: 600;
    margin-right: 10rpx;
  }

  .ai-wrong-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10rpx;
    font-size: 25rpx;
    font-weight: 600;
    color: #1f2d3d;
  }

  .ai-wrong-kp {
    font-size: 22rpx;
    color: #2563eb;
    background: #e8f0ff;
    border-radius: 999rpx;
    padding: 4rpx 14rpx;
  }
}
</style>
