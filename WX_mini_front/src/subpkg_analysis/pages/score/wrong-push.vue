<template>
  <view class="wrong-push-page">
    <view class="source-card" v-if="sourceItem">
      <view class="card-top">
        <view class="subject-badge">{{ sourceItem.subject }}</view>
        <view class="source-pill">{{ sourceItem.source || '当前试卷' }}</view>
        <view class="score-badge">
          <text class="score-main">{{ formatScore(sourceItem.myScore) }}/{{ formatScore(sourceItem.fullScore ?? sourceItem.highestScore) }}</text>
          <text class="score-caption">得分</text>
        </view>
        <view class="meta-stack">
          <text class="meta-text">{{ sourceItem.time }}</text>
          <text class="meta-text">第{{ sourceItem.questionNo }}题</text>
        </view>
      </view>

      <view class="image-shell" v-if="sourceItem.displaySliceImageUrl">
        <image
          class="slice-image"
          :src="sourceItem.displaySliceImageUrl"
          mode="widthFix"
          @click="previewSliceImage(sourceItem.displaySliceImageUrl)"
        />
      </view>

      <view class="question-text-content" v-if="hasQuestionText">
        <view class="text-body">
          <MarkdownRender :content="sourceItem.question" />
        </view>
      </view>

      <view class="card-bottom">
        <view v-if="sourceItem.difficulty" class="info-chip">
          <text class="chip-label">难度</text>
          <text class="chip-value">{{ sourceItem.difficulty }}</text>
        </view>
        <view v-if="sourceItem.tags?.length" class="info-chip">
          <text class="chip-label">知识点</text>
          <text class="chip-value">{{ sourceItem.tags[0] }}</text>
        </view>
      </view>

      <view class="match-line" v-if="recommendData?.sourceQuestion">
        <text>匹配方式：{{ recommendData.sourceQuestion.matchedBy === 'image' ? '题图' : '题干' }}</text>
      </view>
    </view>

    <view v-if="loading" class="status-card">
      <text>正在获取举一反三推荐...</text>
    </view>

    <view v-else-if="errorText" class="status-card error">
      <text>{{ errorText }}</text>
      <wd-button size="small" type="primary" @click="loadRecommend">重新获取</wd-button>
    </view>

    <view v-else-if="recommendList.length" class="recommend-list">
      <view v-for="(rec, index) in recommendList" :key="rec.questionId || index" class="recommend-item">
        <view class="recommend-head">
          <text class="recommend-title">{{ rec.typeName || '推荐题' }}</text>
          <text v-if="rec.similarity !== undefined && rec.similarity !== null" class="recommend-similarity">
            相似度 {{ Number(rec.similarity).toFixed(1) }}
          </text>
        </view>

        <view class="recommend-block" v-if="rec.stem">
          <text class="block-label">题目</text>
          <MarkdownRender :content="rec.stem" />
        </view>

        <view class="recommend-block" v-if="rec.answer">
          <text class="block-label">答案</text>
          <MarkdownRender :content="rec.answer" />
        </view>

        <view class="recommend-block" v-if="rec.explanation">
          <text class="block-label">解析</text>
          <MarkdownRender :content="rec.explanation" />
        </view>
      </view>
    </view>

    <view v-else class="status-card">
      <text>暂无推荐结果</text>
    </view>

    <view class="switch-row" v-if="questionList.length > 1">
      <wd-button size="small" plain :disabled="!hasPrev" @click="switchQuestion(-1)">上一题</wd-button>
      <text class="switch-text">{{ currentIndex + 1 }}/{{ questionList.length }}</text>
      <wd-button size="small" plain :disabled="!hasNext" @click="switchQuestion(1)">下一题</wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getWrongPushRecommendApi } from '@/subpkg_analysis/api/wrong-push'

import MarkdownRender from '@/components/MarkdownRender/index.vue'

const STORAGE_KEY = 'currentWrongPushItem'
const LIST_STORAGE_KEY = 'currentWrongPushList'
const INDEX_STORAGE_KEY = 'currentWrongPushIndex'

const loading = ref(false)
const errorText = ref('')
const sourceItem = ref<Record<string, any> | null>(null)
const recommendData = ref<Record<string, any> | null>(null)
const questionList = ref<Record<string, any>[]>([])
const currentIndex = ref(0)
const examId = ref('')
const subject = ref('')
const questionNo = ref('')

const recommendList = computed(() => recommendData.value?.recommendations || [])
const hasPrev = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < questionList.value.length - 1)
const hasQuestionText = computed(() => {
  const q = sourceItem.value?.question
  if (!q) return false
  return q !== `第${sourceItem.value?.questionNo}题`
})

const resolveAssetUrl = (url?: string) => {
  if (!url) return ''
  if (/^(https?:)?\/\//.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
    return url
  }
  const staticBaseUrl = String(__VITE_STATIC_BASEURL__ || '')
  if (url.startsWith('/uploads/') && staticBaseUrl) {
    const cdnRoot = staticBaseUrl.replace(/\/static\/?$/i, '')
    if (cdnRoot) {
      return `${cdnRoot}${url}`
    }
  }
  const baseUrl = String(import.meta.env.VITE_SERVER_BASEURL || '')
  if (!baseUrl) return url
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  return url.startsWith('/') ? `${normalizedBase}${url}` : `${normalizedBase}/${url}`
}

const previewSliceImage = (url?: string) => {
  const imageUrl = resolveAssetUrl(url)
  if (!imageUrl) return
  uni.previewImage({
    urls: [imageUrl],
    current: imageUrl
  })
}


const formatScore = (value: unknown) => {
  const num = Number(value)
  if (Number.isFinite(num)) {
    return num % 1 === 0 ? String(num) : num.toFixed(1)
  }
  return '0'
}

const applyQuestion = (item: Record<string, any> | null, index: number) => {
  if (!item) return
  currentIndex.value = index
  subject.value = String(item.subject || '')
  questionNo.value = String(item.questionNo || '')
  sourceItem.value = {
    ...item,
    displaySliceImageUrl: resolveAssetUrl(item.displaySliceImageUrl || item.sliceImageUrl)
  }
  uni.setStorageSync(STORAGE_KEY, sourceItem.value)
  uni.setStorageSync(INDEX_STORAGE_KEY, currentIndex.value)
}

const loadRecommend = async () => {
  if (!examId.value || !subject.value || !questionNo.value) {
    errorText.value = '错题参数不完整'
    return
  }
  loading.value = true
  errorText.value = ''
  try {
    const res = await getWrongPushRecommendApi({
      examId: examId.value,
      subject: subject.value,
      questionNo: questionNo.value,
      count: 3
    })
    if (res.code === 200) {
      recommendData.value = res.data || null
      return
    }
    errorText.value = res.msg || '获取推荐失败'
  } catch (error: any) {
    errorText.value = error.msg || '获取推荐失败'
  } finally {
    loading.value = false
  }
}

const switchQuestion = (step: number) => {
  const targetIndex = currentIndex.value + step
  if (targetIndex < 0 || targetIndex >= questionList.value.length) return
  recommendData.value = null
  errorText.value = ''
  applyQuestion(questionList.value[targetIndex], targetIndex)
  loadRecommend()
}

onLoad((options: any) => {
  examId.value = String(options?.examId || '')
  subject.value = decodeURIComponent(String(options?.subject || ''))
  questionNo.value = decodeURIComponent(String(options?.questionNo || ''))

  const rawList = uni.getStorageSync(LIST_STORAGE_KEY)
  if (Array.isArray(rawList)) {
    questionList.value = rawList
  }

  const rawIndex = Number(uni.getStorageSync(INDEX_STORAGE_KEY))
  currentIndex.value = Number.isFinite(rawIndex) && rawIndex >= 0 ? rawIndex : 0

  const rawItem = uni.getStorageSync(STORAGE_KEY)
  if (rawItem) {
    applyQuestion(rawItem, currentIndex.value)
  } else if (questionList.value.length) {
    applyQuestion(questionList.value[currentIndex.value] || questionList.value[0], currentIndex.value)
  }

  loadRecommend()
})
</script>

<style scoped lang="scss">
.wrong-push-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #e0effe 0%, #f7f8fa 500rpx, #f7f8fa 100%);
  padding: 24rpx;
  box-sizing: border-box;
}

.source-card,
.status-card,
.recommend-item {
  background: #ffffff;
  border-radius: 28rpx;
  padding: 24rpx;
  box-shadow: 0 10rpx 28rpx rgba(15, 23, 42, 0.06);
  border: 1rpx solid rgba(67, 100, 247, 0.08);
}

.status-card {
  margin-top: 24rpx;
  min-height: 240rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  font-size: 28rpx;
  color: #738399;
}

.status-card.error {
  color: #e25b5b;
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

.text-body,
.recommend-block {
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

.match-line {
  margin-top: 24rpx;
  font-size: 24rpx;
  color: #7b8aa2;
  text-align: right;
}

.recommend-list {
  margin-top: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.recommend-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 16rpx;
}

.recommend-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #1f3b77;
}

.recommend-similarity {
  font-size: 22rpx;
  color: #2456d3;
}

.block-label {
  display: block;
  margin-bottom: 10rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: #6a7a8d;
}

.recommend-block + .recommend-block {
  margin-top: 16rpx;
}

.switch-row {
  margin-top: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.switch-text {
  flex: 1;
  text-align: center;
  font-size: 24rpx;
  color: #6a7a8d;
}
</style>
