<template>
  <view class="wrong-card">
    <view class="card-top">
      <view class="subject-badge">{{ item.subject }}</view>
      <view class="source-pill">{{ item.source || '当前试卷' }}</view>
      <view class="score-badge">
        <text class="score-main">{{ formatScore(item.myScore) }}/{{ formatScore(item.highestScore) }}</text>
        <text class="score-caption">分数</text>
      </view>
      <view class="meta-stack">
        <text class="meta-text">{{ item.time }}</text>
        <text class="meta-text">第{{ item.questionNo }}题</text>
      </view>
    </view>

    <view class="image-shell" v-if="item.displaySliceImageUrl">
      <image
        class="slice-image"
        :src="item.displaySliceImageUrl"
        mode="widthFix"
        @click="emit('preview', item.displaySliceImageUrl)"
      />
    </view>

    <!-- 题目文字显示 -->
    <view class="question-text-content" v-if="hasQuestionText">
      <view class="text-body">
        <rich-text :nodes="formatQuestionText(item.question)"></rich-text>
      </view>
    </view>

    <view class="card-bottom">
      <view class="info-chip">
        <text class="chip-label">我的得分</text>
        <text class="chip-value danger">{{ formatScore(item.myScore) }} 分</text>
      </view>
      <view class="info-chip">
        <text class="chip-label">小题最高分</text>
        <text class="chip-value success">{{ formatScore(item.highestScore) }} 分</text>
      </view>
      <view v-if="item.difficulty" class="tag-chip danger-soft">{{ item.difficulty }}</view>
      <view v-if="item.tags?.length" class="tag-chip">{{ item.tags[0] }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  item: Record<string, any>
}>()

const emit = defineEmits<{
  preview: [url: string]
}>()

const hasQuestionText = computed(() => {
  const q = props.item.question
  if (!q) return false
  // 排除默认生成的“第x题”文本，只显示识别出的实际题目
  return q !== `第${props.item.questionNo}题`
})

/**
 * 对题目文本进行基础渲染，支持 Markdown 和 LaTeX
 */
const formatQuestionText = (text: string) => {
  if (!text) return ''
  
  let formatted = text
  
  // 1. 处理 LaTeX 公式 - 转换为图片显示 (使用更融合的颜色和 DPI)
  // 块级公式 $$...$$
  formatted = formatted.replace(/\$\$(.*?)\$\$/g, (match, formula) => {
    const encoded = encodeURIComponent(formula.trim())
    // 使用 #334155 (Slate 700) 匹配正文颜色，微调 DPI 保持字号一致
    return `<img src="https://latex.codecogs.com/png.latex?\\dpi{130}\\color[rgb]{0.2,0.25,0.33}${encoded}" style="max-width: 100%; vertical-align: middle; margin: 2px 0; transform: scale(0.95);" mode="widthFix" />`
  })
  
  // 行内公式 $...$
  formatted = formatted.replace(/\$(.*?)\$/g, (match, formula) => {
    const encoded = encodeURIComponent(formula.trim())
    return `<img src="https://latex.codecogs.com/png.latex?\\dpi{130}\\color[rgb]{0.2,0.25,0.33}${encoded}" style="max-width: 100%; vertical-align: middle; margin: 0 2px; transform: scale(0.95);" mode="widthFix" />`
  })
  
  // 2. 处理基础 Markdown
  // 粗体 **text**
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<b style="color: #1e293b;">$1</b>')
  // 斜体 *text*
  formatted = formatted.replace(/\*(.*?)\*\*/g, '<i style="color: #475569;">$1</i>')
  
  // 3. 处理换行符
  formatted = formatted.replace(/\n/g, '<br/>')
  
  return formatted
}

const formatScore = (value: unknown) => {
  const num = Number(value)
  if (Number.isFinite(num)) {
    return num % 1 === 0 ? String(num) : num.toFixed(1)
  }
  return '0'
}
</script>

<style lang="scss" scoped>
.wrong-card {
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
  /* 移除固定高度，完全由图片高度决定 */
  min-height: auto;
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

  .text-body {
    font-size: 28rpx;
    color: #334155;
    line-height: 1.6;
    word-break: break-all;
    /* 允许数学公式中的特殊字符换行 */
    white-space: pre-wrap;
  }
}

.card-bottom {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 20rpx;
}

.info-chip {
  min-width: 180rpx;
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

  &.danger {
    color: #ef4444;
  }

  &.success {
    color: #16a34a;
  }
}

.tag-chip {
  padding: 0 18rpx;
  min-height: 72rpx;
  border-radius: 18rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #eff4ff;
  color: #4d63a8;
  font-size: 24rpx;

  &.danger-soft {
    background: #fff1f2;
    color: #ef4444;
  }
}
</style>
