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
        <view class="card-header">
          <view>
            <view class="card-title">AI 成绩报告</view>
            <view class="card-subtitle">只总结强势点、薄弱点，并定向推送错题</view>
          </view>
          <view class="meta-wrap">
            <text class="meta-tag">{{ reportData.cached ? '缓存报告' : '新生成' }}</text>
            <text class="meta-text">{{ reportData.generatedAt }}</text>
          </view>
        </view>
        <view class="overall-text">{{ reportData.summary?.overallComment || '暂无总结' }}</view>
      </view>

      <view class="report-card">
        <view class="section-title">强势点</view>
        <view class="tag-list">
          <view v-for="item in reportData.summary?.strengths || []" :key="item" class="tag tag-good">
            {{ item }}
          </view>
        </view>
      </view>

      <view class="report-card">
        <view class="section-title">薄弱点</view>
        <view class="tag-list">
          <view v-for="item in reportData.summary?.weaknesses || []" :key="item" class="tag tag-warn">
            {{ item }}
          </view>
        </view>
      </view>

      <view class="report-card" v-if="(reportData.summary?.focusPoints || []).length">
        <view class="section-title">重点关注</view>
        <view v-for="item in reportData.summary?.focusPoints || []" :key="item" class="focus-item">
          {{ item }}
        </view>
      </view>

      <view class="report-card" v-if="(reportData.subjectInsights || []).length">
        <view class="section-title">学科洞察</view>
        <view
          v-for="item in reportData.subjectInsights || []"
          :key="item.subjectName"
          class="subject-card"
        >
          <view class="subject-name">{{ item.subjectName }}</view>
          <view class="subject-line"><text class="label">优势</text>{{ item.strength }}</view>
          <view class="subject-line"><text class="label">短板</text>{{ item.weakness }}</view>
          <view class="subject-line"><text class="label">对比</text>{{ item.comparison }}</view>
        </view>
      </view>

      <view class="report-card" v-if="(reportData.wrongQuestionPushes || []).length">
        <view class="section-title">错题定向推送</view>
        <view
          v-for="(item, index) in reportData.wrongQuestionPushes || []"
          :key="`${item.subjectName}-${item.questionNo}-${index}`"
          class="wrong-card"
        >
          <view class="wrong-head">
            <text class="wrong-subject">{{ item.subjectName }}</text>
            <text class="wrong-no">{{ item.questionNo }}</text>
          </view>
          <view class="wrong-knowledge" v-if="item.knowledgePoint">
            关联知识点：{{ item.knowledgePoint }}
          </view>
          <view class="wrong-line"><text class="label">问题原因</text>{{ item.reason }}</view>
          <view class="wrong-line"><text class="label">改进建议</text>{{ item.suggestion }}</view>
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
const staticBaseUrl = __VITE_STATIC_BASEURL__
defineProps<{
  loading: boolean
  hasAccess: boolean
  reportData: any
}>()

defineEmits<{
  upgrade: []
}>()
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
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
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

  &.svip-badge {
    background: linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%);
  }

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

.loading-desc,
.empty-desc,
.card-subtitle,
.meta-text,
.wrong-knowledge {
  font-size: 24rpx;
  color: #8b94a7;
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
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    opacity: 0.8;
    transform: scale(0.98);
  }
}

.loading-title,
.empty-title,
.card-title,
.section-title,
.subject-name,
.wrong-subject {
  font-size: 32rpx;
  font-weight: 700;
  color: #1f2d3d;
}

.hero-card {
  background: linear-gradient(180deg, #f7fbff 0%, #ffffff 100%);
}

.card-header {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.meta-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
}

.meta-tag {
  font-size: 22rpx;
  color: #2563eb;
  background: #e8f0ff;
  border-radius: 999rpx;
  padding: 6rpx 16rpx;
}

.overall-text,
.focus-item,
.subject-line,
.wrong-line {
  font-size: 26rpx;
  line-height: 1.7;
  color: #3a4658;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag {
  padding: 12rpx 18rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
}

.tag-good {
  background: #edf8f1;
  color: #1f9d55;
}

.tag-warn {
  background: #fff3ec;
  color: #e67e22;
}

.focus-item,
.subject-card,
.wrong-card {
  background: #f8fafc;
  border-radius: 18rpx;
  padding: 22rpx;
  margin-top: 18rpx;
}

.label {
  color: #2563eb;
  font-weight: 600;
  margin-right: 12rpx;
}

.wrong-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.wrong-no {
  font-size: 24rpx;
  color: #2563eb;
  background: #e8f0ff;
  border-radius: 999rpx;
  padding: 6rpx 16rpx;
}
</style>
