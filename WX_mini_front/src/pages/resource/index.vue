<template>
  <view class="resource-container">
    <view class="grid-wrap">
      <view class="grid-item" @click="navTo('/pages/resource/paper')">
        <wd-icon name="view-list" size="40px" color="#9b88ed" />
        <view class="info">
          <text class="main-title">名校试卷</text>
          <text class="sub-title">高效学习</text>
        </view>
      </view>
      
      <view class="grid-item" @click="navTo('/pages/resource/student-talk')">
        <wd-icon name="user" size="40px" color="#ff7575" />
        <view class="info">
          <text class="main-title">学霸说</text>
          <text class="sub-title">经验学习</text>
        </view>
      </view>
      
      <view class="grid-item" @click="navTo('/pages/resource/family-edu')">
        <wd-icon name="heart" size="40px" color="#4fc3f7" />
        <view class="info">
          <text class="main-title">家庭教育</text>
          <text class="sub-title">科学育儿</text>
        </view>
      </view>
      
      <view class="grid-item" @click="navTo('/pages/resource/sync-course')">
        <wd-icon name="video" size="40px" color="#ffb74d" />
        <view class="info">
          <text class="main-title">同步/专题课</text>
          <text class="sub-title">巩固复习</text>
        </view>
      </view>
    </view>

    <!-- 课程列表区域 -->
    <view class="course-section">
      <view class="section-header">
        <text class="section-title">精选课程</text>
      </view>
      <view class="course-list">
        <view v-for="(item, index) in courses" :key="index" class="course-card" @click="handleCourseClick(item)">
          <wd-img :src="item.image" :width="120" :height="80" round class="course-img" />
          <view class="course-info">
            <text class="course-name">{{ item.name }}</text>
            <text class="course-desc">{{ item.desc }}</text>
            <view class="course-bottom">
              <text class="course-price">￥{{ item.price }}</text>
              <wd-button type="primary" size="small" plain>立即学习</wd-button>
            </view>
          </view>
        </view>
      </view>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCourseListApi } from '@/api/course'

const courses = ref<any[]>([])

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

const navTo = (url: string) => {
  uni.navigateTo({ url })
}

const handleCourseClick = (course: any) => {
  const token = uni.getStorageSync('token') || ''
  const isSVIP = token.includes('13688888888')
  
  if (isSVIP) {
    uni.showToast({ title: `正在进入: ${course.name}`, icon: 'none' })
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
  padding: 20rpx 30rpx;
}
.grid-wrap {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20rpx;
  margin-top: 20rpx;
}
.grid-item {
  width: 48%;
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx 20rpx;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.03);
  
  .info {
    margin-left: 16rpx;
    display: flex;
    flex-direction: column;
    
    .main-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 6rpx;
    }
    
    .sub-title {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.course-section {
  margin-top: 40rpx;
  
  .section-header {
    margin-bottom: 20rpx;
    .section-title {
      font-size: 34rpx;
      font-weight: bold;
      color: #333;
    }
  }
}

.course-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 24rpx;
  display: flex;
  gap: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);

  .course-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
    .course-name {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 8rpx;
    }
    
    .course-desc {
      font-size: 24rpx;
      color: #666;
      margin-bottom: 12rpx;
    }
    
    .course-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .course-price {
        font-size: 32rpx;
        font-weight: bold;
        color: #f44336;
      }
    }
  }
}
</style>
