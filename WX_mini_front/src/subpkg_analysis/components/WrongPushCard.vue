<template>
  <view class="push-card">
    <view class="card-top">
      <view class="subject-badge">{{ itemData.subject }}</view>
      <view class="source-pill">{{ itemData.source || '当前试卷' }}</view>
      <view class="score-badge">
        <text class="score-main">{{ formatScore(itemData.myScore) }}/{{ formatScore(itemData.fullScore ?? itemData.highestScore) }}</text>
        <text class="score-caption">得分</text>
      </view>
      <view class="meta-stack">
        <text class="meta-text">{{ itemData.time }}</text>
        <text class="meta-text">第{{ itemData.questionNo }}题</text>
      </view>
    </view>

    <view class="image-shell" v-if="itemData.displaySliceImageUrl">
      <image
        class="slice-image"
        :src="itemData.displaySliceImageUrl"
        mode="widthFix"
        @click="$emit('preview', itemData.displaySliceImageUrl)"
      />
    </view>

    <view class="question-text-content" v-if="hasQuestionText">
      <view class="text-body">
        <MarkdownRender :content="itemData.question" />
      </view>
    </view>

    <view class="card-bottom">
      <view v-if="itemData.difficulty" class="info-chip compact">
        <text class="chip-label">难度</text>
        <text class="chip-value">{{ itemData.difficulty }}</text>
      </view>
      <view v-if="itemData.tags?.length" class="info-chip compact">
        <text class="chip-label">知识点</text>
        <text class="chip-value">{{ itemData.tags[0] }}</text>
      </view>
    </view>

    <view class="action-row">
      <wd-button size="small" type="primary" @click="$emit('openDetail')">查看举一反三</wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import MarkdownRender from '@/components/MarkdownRender/index.vue'

const props = defineProps<{
  item: Record<string, any>
}>()

defineEmits<{
  preview: [url: string]
  openDetail: []
}>()

const itemData = computed<Record<string, any>>(() => (props.item || {}) as Record<string, any>)

const hasQuestionText = computed(() => {
  const q = itemData.value.question
  if (!q) return false
  return q !== `第${itemData.value.questionNo}题`
})


const formatScore = (value: unknown) => {
  const num = Number(value)
  if (Number.isFinite(num)) {
    return num % 1 === 0 ? String(num) : num.toFixed(1)
  }
  return '0'
}
</script>

<style scoped lang="scss">
.push-card {
  background: #ffffff;
  border-radius: 28rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 10rpx 28rpx rgba(15, 23, 42, 0.06);
  border: 1rpx solid rgba(67, 100, 247, 0.08);
}

.card-top {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 18rpx;
  align-items: start;
  margin-bottom: 22rpx;
}

.subject-badge,
.source-pill,
.score-badge,
.meta-stack {
  min-height: 76rpx;
  border-radius: 18rpx;
  box-sizing: border-box;
}

.subject-badge {
  min-width: 108rpx;
  padding: 0 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #edf5ff;
  color: #2456d3;
  font-size: 28rpx;
  font-weight: 700;
}

.source-pill {
  padding: 18rpx 20rpx;
  background: #f7f9fc;
  color: #6a7a8d;
  font-size: 22rpx;
  line-height: 1.45;
  display: flex;
  align-items: center;
}

.score-badge {
  min-width: 122rpx;
  padding: 12rpx 16rpx;
  background: linear-gradient(180deg, #f9fbff 0%, #eef4ff 100%);
  border: 1rpx solid rgba(67, 100, 247, 0.12);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.score-main {
  font-size: 34rpx;
  font-weight: 800;
  color: #1f3b77;
  line-height: 1;
}

.score-caption {
  margin-top: 8rpx;
  font-size: 20rpx;
  color: #8090a3;
}

.meta-stack {
  min-width: 108rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.meta-text {
  min-height: 34rpx;
  padding: 12rpx 14rpx;
  background: #fafbfd;
  border: 1rpx solid #eef2f7;
  border-radius: 14rpx;
  font-size: 20rpx;
  color: #738399;
  text-align: center;
}

.image-shell {
  border-radius: 16rpx;
  overflow: hidden;
  background: #fbfcfe;
  border: 1rpx solid rgba(67, 100, 247, 0.05);
  margin-bottom: 12rpx;
}

.slice-image {
  width: 100%;
  display: block;
}

.question-text-content {
  padding: 20rpx;
  background: #f9fbff;
  border-radius: 16rpx;
  border: 1rpx dashed rgba(36, 86, 211, 0.2);
  margin-bottom: 20rpx;
}

.text-body {
  font-size: 28rpx;
  color: #334155;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.card-bottom {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 20rpx;
}

.info-chip {
  padding: 18rpx 20rpx;
  border-radius: 18rpx;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.chip-label {
  font-size: 22rpx;
  color: #8b97a6;
}

.chip-value {
  font-size: 28rpx;
  font-weight: 700;
  color: #334155;
}

.action-row {
  margin-top: 24rpx;
  display: flex;
  justify-content: center;
}
</style>
