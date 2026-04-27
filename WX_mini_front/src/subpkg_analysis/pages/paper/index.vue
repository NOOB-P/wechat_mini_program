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
        <view class="section-title">小题得分对比</view>
        <view class="score-table">
          <view class="table-header">
            <text class="col">题号</text>
            <text class="col">我</text>
            <text class="col">班级</text>
            <text class="col">年级</text>
            <text class="col">学校</text>
            <text class="col">联考</text>
          </view>
          <view class="table-row" v-for="(ans, index) in paperData.questionScores" :key="index">
            <view class="col q-no-col">
              <text class="no">{{ ans.questionNo }}</text>
              <text class="type" v-if="ans.type">({{ ans.type }})</text>
            </view>
            <text class="col my-score-col" :class="{ 'perfect': ans.myScore >= ans.highestScore && ans.highestScore > 0 }">
              {{ formatScore(ans.myScore) }}/{{ formatScore(ans.highestScore) }}
            </text>
            <text class="col">{{ formatScore(ans.classAvgScore) }}</text>
            <text class="col">{{ formatScore(ans.gradeAvgScore) }}</text>
            <text class="col">{{ formatScore(ans.schoolAvgScore) }}</text>
            <text class="col">{{ formatScore(ans.projectAvgScore) }}</text>
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
    uni.showLoading({ title: '加载中...', mask: true })
    const res = await getPaperDetailApi({
      examId: routeParams.value.examId,
      subject: routeParams.value.subject
    })
    uni.hideLoading()
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
        originalDownloadUrl: resolveAssetUrl(res.data?.originalDownloadUrl || res.data?.downloadUrl)
      }
    } else {
      toast.error(res.msg || '获取试卷失败')
    }
  } catch (error: any) {
    uni.hideLoading()
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
  const downloadUrl = paperData.value?.originalDownloadUrl
  if (!downloadUrl) {
    return toast.show('暂无下载链接')
  }
  
  uni.showLoading({ title: '下载中...', mask: true })
  
  uni.downloadFile({
    url: downloadUrl,
    success: (res) => {
      if (res.statusCode === 200) {
        const filePath = res.tempFilePath
        const isImage = /\.(png|jpg|jpeg|webp|bmp)$/i.test(downloadUrl)
        if (isImage) {
          uni.saveImageToPhotosAlbum({
            filePath,
            success: () => {
              uni.hideLoading()
              toast.success('原卷已保存到相册')
            },
            fail: (err) => {
              uni.hideLoading()
              console.error('保存原卷失败:', err)
              toast.error('保存原卷失败')
            }
          })
          return
        }
        uni.openDocument({
          filePath: filePath,
          showMenu: true, // 允许转发/保存
          success: () => {
            uni.hideLoading()
          },
          fail: (err) => {
            uni.hideLoading()
            console.error('打开文件失败:', err)
            toast.error('无法打开该类型文件')
          }
        })
      } else {
        uni.hideLoading()
        toast.error('下载失败')
      }
    },
    fail: (err) => {
      uni.hideLoading()
      console.error('下载文件错误:', err)
      toast.error('网络错误，下载失败')
    }
  })
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
    gap: 20rpx;

    .score-text {
      flex: 1;
      min-width: 0;
      font-size: 28rpx;
      color: #666;
      .highlight {
        font-size: 40rpx;
        font-weight: bold;
        color: #1a5f8e;
        margin: 0 10rpx;
      }
    }

    :deep(.wd-button) {
      margin-left: auto;
      flex-shrink: 0;
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

.score-table {
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.02);

  .table-header {
    display: flex;
    background-color: #f8fafc;
    border-bottom: 1rpx solid #e2e8f0;
    
    .col {
      font-weight: 600;
      color: #64748b;
      font-size: 22rpx;
      text-transform: uppercase;
      letter-spacing: 1rpx;
    }
  }

  .table-row {
    display: flex;
    border-bottom: 1rpx solid #f1f5f9;
    transition: background-color 0.2s;
    
    &:nth-child(even) {
      background-color: #fafcfe;
    }

    &:last-child {
      border-bottom: none;
    }
  }

  .col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20rpx 4rpx;
    font-size: 24rpx;
    color: #334155;
    border-right: 1rpx solid #f1f5f9;
    text-align: center;
    min-height: 90rpx;

    &:last-child {
      border-right: none;
    }

    &.q-no-col {
      background-color: rgba(248, 250, 252, 0.5);
      .no {
        font-weight: 700;
        color: #1e293b;
      }
      .type {
        font-size: 18rpx;
        color: #94a3b8;
        margin-top: 2rpx;
      }
    }

    &.my-score-col {
      font-weight: 700;
      color: #ef4444; // 现代红
      background-color: rgba(254, 242, 242, 0.3);
      
      &.perfect {
        color: #10b981; // 现代绿
        background-color: rgba(236, 253, 245, 0.3);
      }
    }
  }
}
</style>
