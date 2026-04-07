<template>
  <view class="resource-container">
    <image class="page-bg" src="/static/home/page_bg.png" mode="widthFix" />
    <wd-toast id="wd-toast" />
    
    <view class="content animate-fade-in">
      <!-- 顶部标题 -->
      <view class="top-header">
        <text class="page-title">学习资源</text>
        <text class="page-subtitle">探索更多优质学习内容</text>
      </view>

      <view class="grid-wrap">
        <view class="grid-item" @click="navTo('/pages/resource/paper')">
          <view class="icon-box paper">
            <image class="grid-icon" src="/static/resource/paper.png" mode="aspectFit" />
          </view>
          <view class="info">
            <text class="main-title">名校试卷</text>
            <text class="sub-title">高效学习</text>
          </view>
        </view>
        
        <view class="grid-item" @click="navTo('/pages/resource/student-talk')">
          <view class="icon-box student">
            <image class="grid-icon" src="/static/resource/student.png" mode="aspectFit" />
          </view>
          <view class="info">
            <text class="main-title">学霸说</text>
            <text class="sub-title">经验分享</text>
          </view>
        </view>
        
        <view class="grid-item" @click="navTo('/pages/resource/family-edu')">
          <view class="icon-box family">
            <image class="grid-icon" src="/static/resource/family.png" mode="aspectFit" />
          </view>
          <view class="info">
            <text class="main-title">家庭教育</text>
            <text class="sub-title">科学育儿</text>
          </view>
        </view>
        
        <view class="grid-item" @click="navTo('/pages/resource/sync-course')">
          <view class="icon-box course">
            <image class="grid-icon" src="/static/resource/course.png" mode="aspectFit" />
          </view>
          <view class="info">
            <text class="main-title">同步/专题课</text>
            <text class="sub-title">巩固复习</text>
          </view>
        </view>
      </view>

    <!-- 精选推荐区域 -->
    <view class="recommend-section">
      <view class="section-header">
        <view class="title-wrap">
          <view class="title-icon"></view>
          <text class="section-title">精选推荐</text>
        </view>
      </view>
      <view class="recommend-grid">
        <view class="recommend-item" @click="navTo('/pages/course/index')">
          <image class="recommend-img" src="/static/resource/recommend_ai.png" mode="aspectFill" />
          <text class="recommend-text">精选AI</text>
        </view>
        <view class="recommend-item" @click="navTo('/pages/course/index')">
          <image class="recommend-img" src="/static/resource/recommend_tutor.png" mode="aspectFill" />
          <text class="recommend-text">精选家教</text>
        </view>
        <view class="recommend-item" @click="navTo('/pages/course/index')">
          <image class="recommend-img" src="/static/resource/recommend_course.png" mode="aspectFill" />
          <text class="recommend-text">精选课程</text>
        </view>
      </view>
    </view>

    <!-- AI自习室区域 -->
    <view class="recommend-section">
      <view class="section-header">
        <view class="title-wrap">
          <view class="title-icon"></view>
          <text class="section-title">AI自习室</text>
        </view>
      </view>
      <view class="recommend-grid">
        <view class="recommend-item" @click="navTo('/pages/course/index')">
          <image class="recommend-img" src="/static/resource/ai_study_1.png" mode="aspectFill" />
        </view>
        <view class="recommend-item" @click="navTo('/pages/course/index')">
          <image class="recommend-img" src="/static/resource/ai_study_2.png" mode="aspectFill" />
        </view>
        <view class="recommend-item" @click="navTo('/pages/course/index')">
          <image class="recommend-img" src="/static/resource/ai_study_3.png" mode="aspectFill" />
        </view>
      </view>
    </view>

    <!-- AI智能自习室区域 -->
    <view class="recommend-section ai-smart-section">
      <view class="section-header">
        <view class="title-wrap">
          <view class="title-icon"></view>
          <text class="section-title">AI智能自习室</text>
        </view>
        <text class="section-desc">智能辅导/专注训练/计划管理</text>
      </view>
      <view class="ai-smart-content">
        <view class="status-wrap">
          <view class="status-dot"></view>
          <text class="status-text">当前开放中 (08:00-23:00)</text>
        </view>
        <view class="join-btn" @click="joinStudyRoom">
          <text class="btn-text">一键报名进入自习室</text>
        </view>
      </view>
    </view>
  </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getCourseListApi } from '@/api/course'
import { onShow } from '@dcloudio/uni-app'
import { getUserInfoApi } from '@/api/mine'
import { useToast } from 'wot-design-uni'

const courses = ref<any[]>([])
const searchKeyword = ref('')
const isSVIPUser = ref(false)
const toast = useToast()

const joinStudyRoom = () => {
  toast.loading('正在为您分配座位...')
  setTimeout(() => {
    toast.success('报名成功，即将进入自习室')
  }, 1500)
}

// 获取系统状态栏高度，用于自定义导航栏适配
const systemInfo = uni.getSystemInfoSync()
const statusBarHeight = ref(systemInfo.statusBarHeight || 44)

const checkVipStatus = async () => {
  try {
    const res = await getUserInfoApi()
    if (res.code === 200) {
      isSVIPUser.value = res.data.isSvip === 1
      uni.setStorageSync('userInfo', res.data)
    }
  } catch (error) {
    console.error('获取VIP状态失败:', error)
  }
}

onShow(() => {
  checkVipStatus()
})

const getCourseList = async () => {
  try {
    const res = await getCourseListApi()
    if (res.code === 200) {
      courses.value = res.data
    }
  } catch (error) {
    console.error('获取课程列表失败:', error)
  }
}

// 搜索过滤逻辑
const filteredCourses = computed(() => {
  if (!searchKeyword.value) {
    return courses.value
  }
  return courses.value.filter((course: any) => 
    course.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) || 
    (course.desc && course.desc.toLowerCase().includes(searchKeyword.value.toLowerCase()))
  )
})

const onSearch = () => {
  // 触发 computed 更新，实际逻辑在 computed 中已处理
}

const navTo = (url: string) => {
  uni.navigateTo({ url })
}

const handleCourseClick = (course: any) => {
  if (isSVIPUser.value) {
    uni.navigateTo({ 
      url: `/pages/course/detail?name=${encodeURIComponent(course.name)}&price=${course.price || ''}&image=${encodeURIComponent(course.image || '')}&desc=${encodeURIComponent(course.desc || '')}` 
    })
  } else {
    uni.showModal({
      title: 'SVIP 专属课程',
      content: '此为 AI 名师精品课程，开通 SVIP 即可无限畅学！',
      confirmText: '去开通',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({ url: '/pages/vip/recharge' })
        }
      }
    })
  }
}

onMounted(() => {
  getCourseList()
})
</script>

<style lang="scss" scoped>
.resource-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 0 30rpx 60rpx;
  position: relative;
}

.page-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 0;
}

.content {
  position: relative;
  z-index: 1;
  padding-top: 40rpx;
}

.top-header {
  margin-bottom: 40rpx;
  padding: 0 10rpx;
  
  .page-title {
    font-size: 40rpx;
    font-weight: bold;
    color: #1a1a1a;
    display: block;
    margin-bottom: 8rpx;
  }
  
  .page-subtitle {
    font-size: 24rpx;
    color: #999;
  }
}

.grid-wrap {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 24rpx;
}

.grid-item {
  width: calc(50% - 12rpx);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 32rpx;
  padding: 30rpx 24rpx;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.96);
    background: #fff;
  }
  
  .icon-box {
    width: 88rpx;
    height: 88rpx;
    border-radius: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    
    &.paper { background: #eef5ff; }
    &.student { background: #fff5f5; }
    &.family { background: #f0fdf4; }
    &.course { background: #fffbeb; }
  }
  
  .grid-icon {
    width: 60rpx;
    height: 60rpx;
  }
  
  .info {
    margin-left: 20rpx;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    
    .main-title {
      font-size: 28rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 4rpx;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .sub-title {
      font-size: 22rpx;
      color: #999;
    }
  }
}

.recommend-section {
  margin-top: 40rpx;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.03);
  
  .section-header {
    margin-bottom: 30rpx;
    
    .title-wrap {
      display: flex;
      align-items: center;
      
      .title-icon {
        width: 8rpx;
        height: 32rpx;
        background-color: #4facfe;
        border-radius: 4rpx;
        margin-right: 16rpx;
      }
      
      .section-title {
        font-size: 34rpx;
        font-weight: bold;
        color: #333;
      }
    }
  }

  .recommend-grid {
    display: flex;
    justify-content: space-between;
    gap: 16rpx;
    
    .recommend-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .recommend-img {
        width: 100%;
        height: 200rpx;
        border-radius: 16rpx;
        margin-bottom: 16rpx;
      }
      
      .recommend-text {
        font-size: 26rpx;
        color: #333;
      }
    }
  }

  &.ai-smart-section {
    .section-header {
      margin-bottom: 20rpx;
      
      .section-desc {
        font-size: 24rpx;
        color: #999;
        margin-top: 10rpx;
        margin-left: 24rpx;
        display: block;
      }
    }

    .ai-smart-content {
      background-color: #f8fbff;
      border-radius: 16rpx;
      padding: 24rpx;
      
      .status-wrap {
        display: flex;
        align-items: center;
        margin-bottom: 24rpx;
        background-color: #fff;
        padding: 16rpx 24rpx;
        border-radius: 12rpx;
        
        .status-dot {
          width: 12rpx;
          height: 12rpx;
          border-radius: 50%;
          background-color: #4facfe;
          margin-right: 12rpx;
        }
        
        .status-text {
          font-size: 26rpx;
          color: #333;
          font-weight: 500;
        }
      }
      
      .join-btn {
        background: linear-gradient(90deg, #7ab0ff, #4facfe);
        border-radius: 40rpx;
        padding: 20rpx 0;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 0 8rpx 16rpx rgba(79, 172, 254, 0.3);
        
        .btn-text {
          color: #fff;
          font-size: 30rpx;
          font-weight: bold;
        }
      }
    }
  }
}
</style>
