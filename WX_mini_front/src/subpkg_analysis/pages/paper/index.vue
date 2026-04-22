<template>
  <view class="paper-container">
    <scroll-view scroll-y class="content" v-if="paperData">
      <!-- 试卷头部信息 -->
      <view class="paper-header">
        <text class="exam-title">{{ paperData.examName }}</text>
        <view class="score-info">
          <text class="score-text">得分: <text class="highlight">{{ paperData.score }}</text> / {{ paperData.fullScore }}</text>
          <wd-button type="primary" size="small" plain @click="downloadPaper">下载试卷</wd-button>
        </view>
      </view>

      <!-- 老师评语 -->
      <view class="section comment-section" v-if="paperData.teacherComment">
        <view class="section-title">
          <wd-icon name="edit" size="18px" custom-class="title-icon" /> 老师评语
        </view>
        <view class="comment-content">{{ paperData.teacherComment }}</view>
      </view>

      <!-- 试卷图片展示区 (Tab切换原卷/电子版) -->
      <view class="section">
        <wd-tabs v-model="currentTab">
          <wd-tab title="我的答卷" name="original">
            <view class="image-list" v-if="paperData.myPaperImages && paperData.myPaperImages.length > 0">
              <image 
                v-for="(img, index) in paperData.myPaperImages" 
                :key="'orig_'+index" 
                :src="img" 
                mode="widthFix" 
                class="paper-img"
                @click="previewImage(paperData.myPaperImages, index)"
              />
            </view>
            <view class="empty-images" v-else>
              <wd-icon name="image-error" size="48px" color="#ccc" />
              <text class="empty-text">暂无我的答卷图片</text>
            </view>
          </wd-tab>
          <wd-tab title="考试题目" name="electronic">
            <view class="image-list" v-if="paperData.examPaperImages && paperData.examPaperImages.length > 0">
              <image 
                v-for="(img, index) in paperData.examPaperImages" 
                :key="'elec_'+index" 
                :src="img" 
                mode="widthFix" 
                class="paper-img"
                @click="previewImage(paperData.examPaperImages, index)"
              />
            </view>
            <view class="empty-images" v-else>
              <wd-icon name="image-error" size="48px" color="#ccc" />
              <text class="empty-text">暂无考试题目图片</text>
            </view>
          </wd-tab>
        </wd-tabs>
      </view>

      <!-- 小题得分 -->
      <view class="section">
        <view class="section-title">小题得分</view>
        <view class="answer-list">
          <view class="answer-item" v-for="(ans, index) in paperData.questionScores" :key="index">
            <view class="ans-header">
              <text class="q-no">第 {{ ans.questionNo }} 题</text>
              <text class="q-type">({{ ans.type }})</text>
              <text class="status" :class="ans.isBest ? 'right' : 'wrong'">
                {{ ans.isBest ? '最佳' : '待提升' }}
              </text>
            </view>
            <view class="ans-detail">
              <view class="ans-row">
                <text class="label">我的得分</text>
                <text class="val wrong-text">{{ formatScore(ans.myScore) }} 分</text>
              </view>
              <view class="ans-row">
                <text class="label">小题最高分</text>
                <text class="val correct-text">{{ formatScore(ans.highestScore) }} 分</text>
              </view>
              <view class="ans-row">
                <text class="label">班级小题均分</text>
                <text class="val">{{ formatScore(ans.classAvgScore) }} 分</text>
              </view>
              <view class="ans-row">
                <text class="label">全校小题均分</text>
                <text class="val">{{ formatScore(ans.schoolAvgScore) }} 分</text>
              </view>
              <view class="ans-row">
                <text class="label">年级小题均分</text>
                <text class="val">{{ formatScore(ans.gradeAvgScore) }} 分</text>
              </view>
              <view class="ans-row">
                <text class="label">项目小题均分</text>
                <text class="val">{{ formatScore(ans.projectAvgScore) }} 分</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useToast } from 'wot-design-uni'
import { getPaperDetailApi } from '@/subpkg_analysis/api/paper'

const toast = useToast()
const paperData = ref<any>(null)
const currentTab = ref('original')
const routeParams = ref({
  examId: '',
  subject: ''
})

const loadData = async () => {
  try {
    toast.loading('加载中...')
    const res = await getPaperDetailApi({
      examId: routeParams.value.examId,
      subject: routeParams.value.subject
    })
    if (res.code === 200) {
      const myPaperImages = ((res.data?.myPaperImages || res.data?.originalPaperImages || []) as string[])
        .map(resolveAssetUrl)
        .filter(Boolean)
      const examPaperImages = ((res.data?.examPaperImages || res.data?.electronicPaperImages || []) as string[])
        .map(resolveAssetUrl)
        .filter(Boolean)
      paperData.value = {
        ...res.data,
        myPaperImages,
        examPaperImages,
        questionScores: res.data?.questionScores || res.data?.answers || [],
        downloadUrl: resolveAssetUrl(res.data?.downloadUrl)
      }
      toast.close()
    } else {
      toast.error(res.msg || '获取试卷失败')
    }
  } catch (error: any) {
    toast.error(error.msg || '网络错误')
  }
}

onLoad((query: Record<string, string>) => {
  routeParams.value.examId = decodeURIComponent(query.examId || query.exam || '')
  routeParams.value.subject = decodeURIComponent(query.subject || '')
  loadData()
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

const formatScore = (value: unknown) => {
  const num = Number(value)
  if (Number.isFinite(num)) {
    return num % 1 === 0 ? String(num) : num.toFixed(1)
  }
  return '0'
}

const previewImage = (urls: string[], current: number) => {
  uni.previewImage({
    urls,
    current,
    fail: () => {
      toast.error('预览图片失败')
    }
  })
}

const downloadPaper = () => {
  if (!paperData.value?.downloadUrl) {
    return toast.show('暂无下载链接')
  }
  
  toast.loading('准备下载...')
  
  // 模拟下载过程
  setTimeout(() => {
    // 实际环境应使用 uni.downloadFile 和 uni.saveFile/uni.openDocument
    // uni.downloadFile({ url: paperData.value.downloadUrl, success: (res) => { ... } })
    toast.success('试卷已保存')
  }, 1500)
}
</script>

<style lang="scss" scoped>
.paper-container {
  min-height: 100vh;
  background-color: #f7f8fa;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 30rpx;
  box-sizing: border-box;
}

.paper-header {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);

  .exam-title {
    font-size: 34rpx;
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 20rpx;
  }

  .score-info {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .score-text {
      font-size: 28rpx;
      color: #666;
      .highlight {
        font-size: 40rpx;
        font-weight: bold;
        color: #1a5f8e;
        margin: 0 10rpx;
      }
    }
  }
}

.section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 24rpx;
    display: flex;
    align-items: center;
    
    .title-icon {
      margin-right: 10rpx;
      color: #1a5f8e;
    }
  }
}

.comment-section {
  background: linear-gradient(to right, #f0f7fa, #fff);
  border-left: 8rpx solid #1a5f8e;
  
  .comment-content {
    font-size: 28rpx;
    color: #555;
    line-height: 1.6;
  }
}

.image-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 20rpx;

  .paper-img {
    width: 100%;
    border-radius: 12rpx;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
  }
}

.empty-images {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  background: #f9f9f9;
  border-radius: 12rpx;
  margin-top: 20rpx;
  
  .empty-text {
    font-size: 28rpx;
    color: #999;
    margin-top: 20rpx;
  }
}

.answer-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;

  .answer-item {
    background: #fafafa;
    border-radius: 12rpx;
    padding: 20rpx;

    .ans-header {
      display: flex;
      align-items: center;
      margin-bottom: 16rpx;
      padding-bottom: 16rpx;
      border-bottom: 1rpx solid #eee;

      .q-no {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
      }
      .q-type {
        font-size: 24rpx;
        color: #999;
        margin-left: 10rpx;
        flex: 1;
      }
      .status {
        font-size: 26rpx;
        font-weight: bold;
        &.right { color: #00c853; }
        &.wrong { color: #f44336; }
      }
    }

    .ans-detail {
      .ans-row {
        display: flex;
        margin-bottom: 8rpx;
        font-size: 28rpx;

        .label {
          color: #666;
          width: 140rpx;
        }
        .val {
          flex: 1;
          color: #333;
          
          &.wrong-text { color: #f44336; font-weight: bold; }
          &.correct-text { color: #00c853; font-weight: bold; }
        }
      }
    }
  }
}
</style>
