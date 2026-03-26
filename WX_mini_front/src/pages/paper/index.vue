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
          <wd-tab title="原卷查看" name="original">
            <view class="image-list">
              <image 
                v-for="(img, index) in paperData.originalPaperImages" 
                :key="'orig_'+index" 
                :src="img" 
                mode="widthFix" 
                class="paper-img"
                @click="previewImage(paperData.originalPaperImages, index)"
              />
            </view>
          </wd-tab>
          <wd-tab title="电子版解析" name="electronic">
            <view class="image-list">
              <image 
                v-for="(img, index) in paperData.electronicPaperImages" 
                :key="'elec_'+index" 
                :src="img" 
                mode="widthFix" 
                class="paper-img"
                @click="previewImage(paperData.electronicPaperImages, index)"
              />
            </view>
          </wd-tab>
        </wd-tabs>
      </view>

      <!-- 具体答题详情 -->
      <view class="section">
        <view class="section-title">答题详情</view>
        <view class="answer-list">
          <view class="answer-item" v-for="(ans, index) in paperData.answers" :key="index">
            <view class="ans-header">
              <text class="q-no">第 {{ ans.questionNo }} 题</text>
              <text class="q-type">({{ ans.type }})</text>
              <text class="status" :class="ans.isRight ? 'right' : 'wrong'">
                {{ ans.isRight ? '正确' : '错误' }}
              </text>
            </view>
            <view class="ans-detail">
              <view class="ans-row">
                <text class="label">你的答案：</text>
                <text class="val" :class="!ans.isRight ? 'wrong-text' : ''">{{ ans.studentAnswer }}</text>
              </view>
              <view class="ans-row">
                <text class="label">正确答案：</text>
                <text class="val correct-text">{{ ans.correctAnswer }}</text>
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
import { ref, onMounted } from 'vue'
import { useToast } from 'wot-design-uni'
import { getPaperDetailApi } from '@/api/paper'

const toast = useToast()
const paperData = ref<any>(null)
const currentTab = ref('original')

const loadData = async () => {
  try {
    toast.loading('加载中...')
    const res = await getPaperDetailApi()
    if (res.code === 200) {
      paperData.value = res.data
      toast.close()
    } else {
      toast.error(res.msg || '获取试卷失败')
    }
  } catch (error: any) {
    toast.error(error.msg || '网络错误')
  }
}

onMounted(() => {
  loadData()
})

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
    toast.success('试卷已保存 (Mock)')
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
          
          &.wrong-text { color: #f44336; }
          &.correct-text { color: #00c853; font-weight: bold; }
        }
      }
    }
  }
}
</style>