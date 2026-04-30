<template>
  <view class="ai-report-panel">
    <view v-if="!hasAccess" class="svip-lock">
      <view class="lock-icon-wrapper svip-badge">
        <text class="svip-badge-text">SVIP</text>
      </view>
      <view class="lock-text">此专区为 SVIP 专属功能</view>
      <wd-button custom-class="upgrade-btn" @click="$emit('upgrade')">立即升级 SVIP</wd-button>
    </view>

    <view v-else-if="loading" class="loading-card">
      <view class="loading-title">AI 正在生成本次考试报告...</view>
      <view class="loading-desc">首次生成后会自动缓存，下次进入会直接展示。</view>
    </view>

    <view v-else-if="reportData" class="report-content">
      <view class="report-card hero-card">
        <view class="hero-top">
          <view>
            <view class="card-title">AI 成绩报告</view>
            <view class="card-subtitle">{{ examTitle }}</view>
          </view>
          <view class="meta-wrap">
            <view class="meta-actions">
              <text class="meta-tag">{{ reportData.cached ? '缓存报告' : '新生成' }}</text>
              <wd-button size="small" plain @click="$emit('export')">导出报告</wd-button>
            </view>
            <text class="meta-text">{{ reportData.generatedAt }}</text>
          </view>
        </view>
        <view class="hero-summary">{{ reportData.summary?.overallComment || '暂无总结' }}</view>
        <view class="metric-grid" v-if="subjectRows.length">
          <view class="metric-card">
            <text class="metric-label">科目数量</text>
            <text class="metric-value">{{ subjectRows.length }}</text>
          </view>
          <view class="metric-card">
            <text class="metric-label">优势标签</text>
            <text class="metric-value">{{ (reportData.summary?.strengths || []).length }}</text>
          </view>
          <view class="metric-card">
            <text class="metric-label">薄弱标签</text>
            <text class="metric-value">{{ (reportData.summary?.weaknesses || []).length }}</text>
          </view>
          <view class="metric-card">
            <text class="metric-label">错题推送</text>
            <text class="metric-value">{{ (reportData.wrongQuestionPushes || []).length }}</text>
          </view>
        </view>
      </view>

      <view class="report-card">
        <view class="section-title">一、总体诊断</view>
        <view class="summary-block">
          <view class="summary-subtitle">强势点</view>
          <view class="pill-list">
            <view v-for="item in reportData.summary?.strengths || []" :key="`s-${item}`" class="pill good">
              {{ item }}
            </view>
          </view>
        </view>
        <view class="summary-block">
          <view class="summary-subtitle">薄弱点</view>
          <view class="pill-list">
            <view v-for="item in reportData.summary?.weaknesses || []" :key="`w-${item}`" class="pill warn">
              {{ item }}
            </view>
          </view>
        </view>
        <view class="summary-block" v-if="(reportData.summary?.focusPoints || []).length">
          <view class="summary-subtitle">重点关注</view>
          <view v-for="item in reportData.summary?.focusPoints || []" :key="`f-${item}`" class="focus-item">
            {{ item }}
          </view>
        </view>
      </view>

      <view class="report-card" v-if="subjectRows.length">
        <view class="section-title">二、各科成绩概览</view>
        <view class="subject-table">
          <view class="table-head table-row">
            <text class="col subject">科目</text>
            <text class="col score">个人得分</text>
            <text class="col level">等级</text>
            <text class="col insight">AI洞察</text>
          </view>
          <view v-for="item in subjectRows" :key="item.name" class="table-row">
            <text class="col subject">{{ item.name }}</text>
            <text class="col score">{{ item.score }}/{{ item.fullScore }}</text>
            <text class="col level">{{ item.level || '-' }}</text>
            <text class="col insight ellipsis-2">{{ item.insight }}</text>
          </view>
        </view>
      </view>

      <view class="report-card" v-if="(reportData.subjectInsights || []).length">
        <view class="section-title">三、学科能力分析</view>
        <view
          v-for="item in reportData.subjectInsights || []"
          :key="item.subjectName"
          class="subject-analysis-card"
        >
          <view class="subject-analysis-title">{{ item.subjectName }}</view>
          <view class="subject-analysis-line"><text class="label">优势</text>{{ item.strength || '暂无' }}</view>
          <view class="subject-analysis-line"><text class="label">短板</text>{{ item.weakness || '暂无' }}</view>
          <view class="subject-analysis-line"><text class="label">对比</text>{{ item.comparison || '暂无' }}</view>
        </view>
      </view>

      <view class="report-card" v-if="groupedPushes.length">
        <view class="section-title">四、错题与薄弱点分析</view>
        <view v-for="group in groupedPushes" :key="group.subject" class="wrong-group">
          <view class="wrong-group-title">{{ group.subject }}</view>
          <view
            v-for="(item, index) in group.items"
            :key="`${group.subject}-${item.questionNo}-${index}`"
            class="wrong-card"
          >
            <view class="wrong-head">
              <text class="wrong-no">{{ item.questionNo }}</text>
              <text class="wrong-kp" v-if="item.knowledgePoint">{{ item.knowledgePoint }}</text>
            </view>
            <view class="wrong-line"><text class="label">问题原因</text>{{ item.reason }}</view>
            <view class="wrong-line"><text class="label">改进建议</text>{{ item.suggestion }}</view>
          </view>
        </view>
      </view>

      <view class="report-card" v-if="actionList.length">
        <view class="section-title">五、提分建议与复习方向</view>
        <view v-for="(item, index) in actionList" :key="`a-${index}`" class="action-item">
          <view class="action-index">{{ index + 1 }}</view>
          <text class="action-text">{{ item }}</text>
        </view>
      </view>

      <view class="report-card final-card">
        <view class="section-title">六、结语</view>
        <view class="final-text">
          {{ finalSummary }}
        </view>
      </view>
    </view>

    <view v-else class="empty-card">
      <view class="empty-title">暂时还没有 AI 报告</view>
      <view class="empty-desc">切换考试后会自动尝试生成，若失败请稍后重试。</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  loading: boolean
  hasAccess: boolean
  reportData: any
  scoreData?: any
}>()

defineEmits<{
  upgrade: []
  export: []
}>()

const examTitle = computed(() => {
  return props.scoreData?.examName || '本次考试'
})

const subjectRows = computed(() => {
  const insights = props.reportData?.subjectInsights || []
  const insightMap = new Map(insights.map((item: any) => [item.subjectName, item]))
  return (props.scoreData?.subjects || []).map((item: any) => {
    const insight = insightMap.get(item.name)
    return {
      name: item.name,
      score: item.score ?? '-',
      fullScore: item.fullScore ?? '-',
      level: item.level ?? '-',
      insight: insight
        ? [insight.strength, insight.weakness, insight.comparison].filter(Boolean).join(' ')
        : '暂无专项洞察'
    }
  })
})

const groupedPushes = computed(() => {
  const groups = new Map<string, any[]>()
  for (const item of props.reportData?.wrongQuestionPushes || []) {
    const subject = item.subjectName || '未分类'
    if (!groups.has(subject)) {
      groups.set(subject, [])
    }
    groups.get(subject)?.push(item)
  }
  return Array.from(groups.entries()).map(([subject, items]) => ({ subject, items }))
})

const actionList = computed(() => {
  const list: string[] = []
  const focusPoints = props.reportData?.summary?.focusPoints || []
  const weaknesses = props.reportData?.summary?.weaknesses || []
  const suggestions = (props.reportData?.wrongQuestionPushes || [])
    .map((item: any) => item.suggestion)
    .filter(Boolean)

  list.push(...focusPoints)
  list.push(...weaknesses)
  list.push(...suggestions)

  return Array.from(new Set(list)).slice(0, 8)
})

const finalSummary = computed(() => {
  const strengths = props.reportData?.summary?.strengths || []
  const weaknesses = props.reportData?.summary?.weaknesses || []
  if (strengths.length || weaknesses.length) {
    return `当前报告显示你已经具备${strengths.length ? '明显优势学科与稳定得分点' : '一定基础'}，同时在${weaknesses.length ? '部分薄弱知识点和失分题型' : '细节稳定性'}上仍有提升空间。建议围绕上面的重点关注与错题推送持续复盘，逐步把优势保持住、把短板补起来。`
  }
  return props.reportData?.summary?.overallComment || '保持当前复习节奏，结合错题与学科洞察持续优化。'
})
</script>

<style scoped lang="scss">
.ai-report-panel {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.svip-lock,
.loading-card,
.empty-card,
.report-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 8rpx 20rpx rgba(31, 91, 160, 0.06);
}

.svip-lock {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(4px);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 24rpx;
}

.lock-icon-wrapper {
  width: 160rpx;
  height: 160rpx;
  background: linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(92, 107, 192, 0.25);
  border: 4rpx solid #fff;

  .svip-badge-text {
    font-size: 36rpx;
    font-weight: 900;
    background: linear-gradient(135deg, #5c6bc0 0%, #7986cb 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 2rpx;
  }
}

.lock-text {
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 40rpx;
  letter-spacing: 2rpx;
}

.upgrade-btn {
  width: 320rpx !important;
  height: 88rpx !important;
  background: linear-gradient(135deg, #4d80f0 0%, #6a9df8 100%) !important;
  color: #ffffff !important;
  border: none !important;
  border-radius: 44rpx !important;
  font-size: 30rpx !important;
  font-weight: bold !important;
  box-shadow: 0 8rpx 20rpx rgba(77, 128, 240, 0.3) !important;
}

.hero-card {
  background: linear-gradient(180deg, #f7fbff 0%, #ffffff 100%);
}

.hero-top,
.wrong-head {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.card-title,
.section-title,
.subject-analysis-title,
.wrong-group-title,
.empty-title,
.loading-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1f2d3d;
}

.card-subtitle,
.meta-text,
.loading-desc,
.empty-desc {
  font-size: 24rpx;
  color: #8b94a7;
}

.meta-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
}

.meta-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.meta-tag {
  font-size: 22rpx;
  color: #2563eb;
  background: #e8f0ff;
  border-radius: 999rpx;
  padding: 6rpx 16rpx;
}

.hero-summary,
.focus-item,
.subject-analysis-line,
.wrong-line,
.final-text,
.action-text {
  font-size: 26rpx;
  line-height: 1.7;
  color: #3a4658;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 24rpx;
}

.metric-card {
  background: #f8fafc;
  border-radius: 18rpx;
  padding: 20rpx;
}

.metric-label {
  display: block;
  font-size: 22rpx;
  color: #8b94a7;
}

.metric-value {
  display: block;
  margin-top: 8rpx;
  font-size: 34rpx;
  font-weight: 700;
  color: #2563eb;
}

.summary-block + .summary-block {
  margin-top: 28rpx;
}

.summary-subtitle {
  margin-bottom: 14rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: #1f2d3d;
}

.pill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.pill {
  padding: 12rpx 18rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
}

.pill.good {
  background: #edf8f1;
  color: #1f9d55;
}

.pill.warn {
  background: #fff3ec;
  color: #e67e22;
}

.focus-item,
.subject-analysis-card,
.wrong-card,
.action-item {
  background: #f8fafc;
  border-radius: 18rpx;
  padding: 22rpx;
  margin-top: 18rpx;
}

.subject-table {
  border: 2rpx solid #edf2f7;
  border-radius: 20rpx;
  overflow: hidden;
}

.table-row {
  display: flex;
  border-bottom: 2rpx solid #edf2f7;
}

.table-row:last-child {
  border-bottom: none;
}

.table-head {
  background: #f8fafc;
}

.col {
  padding: 20rpx 16rpx;
  font-size: 24rpx;
  color: #3a4658;
}

.col.subject {
  width: 18%;
  font-weight: 600;
}

.col.score {
  width: 22%;
}

.col.level {
  width: 16%;
}

.col.insight {
  flex: 1;
}

.ellipsis-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.label {
  color: #2563eb;
  font-weight: 600;
  margin-right: 12rpx;
}

.wrong-group + .wrong-group {
  margin-top: 26rpx;
}

.wrong-kp {
  font-size: 22rpx;
  color: #2563eb;
  background: #e8f0ff;
  border-radius: 999rpx;
  padding: 6rpx 16rpx;
}

.action-item {
  display: flex;
  gap: 18rpx;
  align-items: flex-start;
}

.action-index {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: #2563eb;
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.final-card {
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}
</style>
