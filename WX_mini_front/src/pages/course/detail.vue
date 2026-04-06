<template>
  <view class="course-detail-container">
    <wd-toast id="wd-toast" />
    
    <!-- 顶部视频播放区 -->
    <view class="video-section">
      <video 
        v-if="courseInfo.videoUrl"
        class="course-video"
        :src="courseInfo.videoUrl"
        :poster="courseInfo.cover"
        controls
        object-fit="cover"
        @error="onVideoError"
      ></video>
      <view v-else class="video-placeholder">
        <wd-img :src="courseInfo.cover || 'https://img.yzcdn.cn/vant/cat.jpeg'" width="100%" height="100%" mode="aspectFill" />
        <view class="play-icon-mask">
          <wd-icon name="play-circle-filled" size="64px" color="rgba(255,255,255,0.8)" />
        </view>
      </view>
    </view>

    <!-- 课程信息区 -->
    <view class="info-section">
      <view class="title-row">
        <text class="c-title">{{ courseInfo.title || '加载中...' }}</text>
        <text class="c-price" v-if="courseInfo.price > 0">￥{{ courseInfo.price }}</text>
        <text class="c-price free" v-else>免费</text>
      </view>
      <view class="meta-row">
        <text class="meta-item"><wd-icon name="user" size="14px" /> {{ courseInfo.studentCount || 0 }}人已学习</text>
        <text class="meta-item"><wd-icon name="time" size="14px" /> 共 {{ courseInfo.chapterCount || 1 }} 节</text>
      </view>
    </view>

    <!-- 课程简介与大纲 Tab -->
    <view class="detail-section">
      <wd-tabs v-model="currentTab">
        <wd-tab title="课程简介" name="intro">
          <view class="intro-content">
            <view class="intro-title">课程概述</view>
            <view class="intro-text" v-if="courseInfo.content">
              <rich-text :nodes="courseInfo.content"></rich-text>
            </view>
            <view class="intro-text" v-else>
              这是一门精心打磨的高质量课程，由资深名师亲自授课，深入浅出地剖析核心知识点。无论你是基础薄弱想要稳扎稳打，还是寻求突破冲击高分，这门课程都能为你提供针对性的指导与帮助。
            </view>
            
            <view class="intro-title" style="margin-top: 30rpx;">适合人群</view>
            <view class="intro-text">
              - 想要系统性复习该模块知识的学生<br>
              - 遇到瓶颈，需要掌握解题技巧的学生<br>
              - 希望拓展思维，提升综合应用能力的学生
            </view>
          </view>
        </wd-tab>
        <wd-tab title="课程大纲" name="outline">
          <view class="outline-content">
            <view class="chapter-item" v-for="(chapter, index) in chapters" :key="index">
              <view class="chapter-info">
                <text class="chapter-index">第 {{ index + 1 }} 讲</text>
                <text class="chapter-name">{{ chapter.title }}</text>
              </view>
              <view class="chapter-status" :class="{ 'is-playing': currentChapter === index }" @click="playChapter(index)">
                <wd-icon :name="currentChapter === index ? 'pause-circle' : 'play-circle'" size="20px" />
                <text>{{ currentChapter === index ? '播放中' : '去学习' }}</text>
              </view>
            </view>
          </view>
        </wd-tab>
      </wd-tabs>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="action-icons">
        <view class="icon-item" @click="handleCollect">
          <wd-icon :name="isCollected ? 'star-on' : 'star'" size="22px" :color="isCollected ? '#f6d365' : '#666'" />
          <text>收藏</text>
        </view>
        <view class="icon-item">
          <wd-icon name="share" size="22px" color="#666" />
          <text>分享</text>
        </view>
      </view>
      <wd-button type="primary" custom-class="study-btn" @click="handleAction">
        {{ (courseInfo.price > 0 && !isPurchased) ? '立即购买' : '立即学习' }}
      </wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useToast } from 'wot-design-uni'
import { getCourseDetailApi, collectCourseApi, recordLearningApi, buyCourseApi } from '@/api/course'

const toast = useToast()

const courseInfo = ref<any>({})
const currentTab = ref('intro')
const isCollected = ref(false)
const isPurchased = ref(false)
const currentChapter = ref(0)
const chapters = ref<any[]>([
  { title: '课程介绍与学习指南' },
  { title: '核心知识点深度解析' },
  { title: '实战案例演练' },
  { title: '总结与提升' }
])

const loadCourseDetail = async (id: string) => {
  try {
    toast.loading('加载中...')
    const res = await getCourseDetailApi(id)
    if (res.code === 200) {
      const data = res.data
      // 修正：处理图片和视频的服务器 BaseURL
      if (data.cover && !data.cover.startsWith('http')) {
        data.cover = __VITE_SERVER_BASEURL__ + data.cover
      }
      if (data.videoUrl && !data.videoUrl.startsWith('http')) {
        data.videoUrl = __VITE_SERVER_BASEURL__ + data.videoUrl
      }
      
      courseInfo.value = data
      isCollected.value = !!data.isCollected
      isPurchased.value = !!data.isPurchased
      // 模拟一些详情页需要的数据，如果后端没有的话
      if (!courseInfo.value.studentCount) courseInfo.value.studentCount = Math.floor(Math.random() * 1000)
      if (!courseInfo.value.chapterCount) courseInfo.value.chapterCount = chapters.value.length
    }
    toast.close()
  } catch (e) {
    toast.error('获取课程详情失败')
  }
}

onLoad((options: any) => {
  if (options.id) {
    loadCourseDetail(options.id)
  }
})

const onVideoError = (e: any) => {
  console.error('视频播放错误:', e)
  toast.show('视频加载失败，请稍后重试')
}

const handleCollect = async () => {
  try {
    const nextStatus = !isCollected.value
    const res = await collectCourseApi({
      courseId: courseInfo.value.id,
      isCollect: nextStatus
    })
    if (res.code === 200) {
      isCollected.value = nextStatus
      toast.success(isCollected.value ? '已收藏' : '已取消收藏')
    }
  } catch (e) {
    toast.error('操作失败')
  }
}

const handleAction = async () => {
  if (courseInfo.value.price > 0 && !isPurchased.value) {
    // 需要购买
    try {
      toast.loading('正在下单...')
      const res = await buyCourseApi(courseInfo.value.id)
      if (res.code === 200) {
        // 跳转到支付页面
        const orderData = encodeURIComponent(JSON.stringify(res.data))
        uni.navigateTo({
          url: `/pages/course/pay?order=${orderData}`
        })
      } else {
        toast.error(res.msg || '下单失败')
      }
    } catch (e) {
      toast.error('网络错误')
    }
  } else {
    // 直接学习
    startLearning()
  }
}

const playChapter = (index: number) => {
  if (courseInfo.value.price > 0 && !isPurchased.value) {
    toast.info('请先购买课程')
    return
  }
  currentChapter.value = index
  toast.show(`正在切换至：${chapters.value[index].title}`)
  // 点击具体章节也算开始学习
  startLearning()
}

const startLearning = async () => {
  currentTab.value = 'outline'
  try {
    // 记录学习进度，简单传个 10 表示已开始
    await recordLearningApi({
      courseId: courseInfo.value.id,
      progress: 10
    })
  } catch (e) {
    console.error('记录学习失败:', e)
  }
}
</script>

<style lang="scss" scoped>
.course-detail-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 120rpx;
}

/* 视频区域 */
.video-section {
  width: 100%;
  height: 420rpx;
  background-color: #000;
  position: relative;

  .course-video {
    width: 100%;
    height: 100%;
  }

  .video-placeholder {
    width: 100%;
    height: 100%;
    position: relative;
    
    .play-icon-mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

/* 课程信息区 */
.info-section {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .title-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20rpx;

    .c-title {
      flex: 1;
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
      line-height: 1.4;
      margin-right: 20rpx;
    }
    
    .c-price {
      font-size: 40rpx;
      font-weight: bold;
      color: #f44336;
      white-space: nowrap;
      
      &.free {
        color: #4cd964;
        font-size: 36rpx;
      }
    }
  }

  .meta-row {
    display: flex;
    gap: 30rpx;
    
    .meta-item {
      font-size: 24rpx;
      color: #999;
      display: flex;
      align-items: center;
      gap: 6rpx;
    }
  }
}

/* 详情区 */
.detail-section {
  background: #fff;
  min-height: 500rpx;

  .intro-content {
    padding: 30rpx;
    
    .intro-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 20rpx;
      padding-left: 16rpx;
      border-left: 8rpx solid #1a5f8e;
    }
    
    .intro-text {
      font-size: 28rpx;
      color: #666;
      line-height: 1.6;
    }
  }

  .outline-content {
    padding: 20rpx 30rpx;
    
    .chapter-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 30rpx 0;
      border-bottom: 1rpx solid #eee;
      
      &:last-child {
        border-bottom: none;
      }

      .chapter-info {
        flex: 1;
        display: flex;
        align-items: center;
        
        .chapter-index {
          font-size: 24rpx;
          color: #999;
          margin-right: 20rpx;
          white-space: nowrap;
        }
        
        .chapter-name {
          font-size: 28rpx;
          color: #333;
        }
      }

      .chapter-status {
        display: flex;
        align-items: center;
        gap: 8rpx;
        font-size: 24rpx;
        color: #999;
        padding: 8rpx 20rpx;
        border-radius: 30rpx;
        background: #f5f5f5;
        
        &.is-playing {
          color: #1a5f8e;
          background: rgba(26, 95, 142, 0.1);
        }
      }
    }
  }
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #fff;
  box-shadow: 0 -4rpx 16rpx rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15rpx 30rpx calc(15rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  z-index: 100;

  .action-icons {
    display: flex;
    align-items: center;
    gap: 40rpx;
    
    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6rpx;
      line-height: 1;
      
      text {
        font-size: 22rpx;
        color: #666;
      }
    }
  }

  :deep(.study-btn) {
    width: 400rpx !important;
    height: 80rpx !important;
    line-height: 80rpx !important;
    border-radius: 40rpx !important;
    background: linear-gradient(135deg, #1a5f8e 0%, #00897b 100%) !important;
    border: none !important;
    font-size: 30rpx !important;
    margin: 0 !important;
    padding: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
}
</style>
