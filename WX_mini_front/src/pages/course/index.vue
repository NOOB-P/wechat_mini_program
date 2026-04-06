<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getCourseListApi, buyCourseApi } from '@/api/course'

const searchValue = ref('')
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

const handleCourseClick = (course: any) => {
  // 如果是免费或者是已购买，直接跳转到详情学习
  if (course.price <= 0 || course.isPurchased) {
    uni.navigateTo({
      url: `/pages/course/detail?id=${course.id}`
    })
  } else {
    // 跳转到详情，详情页也会有购买逻辑
    uni.navigateTo({
      url: `/pages/course/detail?id=${course.id}`
    })
  }
}

const handleBuy = async (e: any, course: any) => {
  e.stopPropagation()
  // 如果是已购买或者是免费课程，直接进入详情学习
  if (course.isPurchased || course.price <= 0) {
    uni.navigateTo({ url: `/pages/course/detail?id=${course.id}` })
    return
  }

  try {
    const res = await buyCourseApi(course.id)
    if (res.code === 200) {
      // 跳转到支付页面
      const orderData = encodeURIComponent(JSON.stringify(res.data))
      uni.navigateTo({
        url: `/pages/course/pay?order=${orderData}`
      })
    } else {
      uni.showToast({ title: res.msg || '下单失败', icon: 'none' })
    }
  } catch (error) {
    uni.showToast({ title: '网络错误', icon: 'none' })
  }
}

onShow(() => {
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.reLaunch({ url: '/pages/login/index' })
  } else {
    getCourseList()
  }
})
</script>

<template>
  <view class="course-container">
    <view class="header">
      <view class="search-bar">
        <wd-search v-model="searchValue" placeholder="搜索课程" hide-cancel />
      </view>
    </view>

    <view class="course-list">
      <view v-for="(item, index) in courses" :key="item.id" class="course-card" @click="handleCourseClick(item)">
        <wd-img :src="item.cover || 'https://img.yzcdn.cn/vant/cat.jpeg'" :width="120" :height="80" round class="course-img" />
        <view class="course-info">
          <text class="course-name">{{ item.title }}</text>
          <text class="course-desc" v-if="item.content">{{ item.content.replace(/<[^>]+>/g, '').substring(0, 30) }}...</text>
          <view class="course-bottom">
            <text class="course-price" v-if="item.price > 0">￥{{ item.price }}</text>
            <text class="course-price free" v-else>免费</text>
            <wd-button 
              type="primary" 
              size="small" 
              plain 
              @click="handleBuy($event, item)"
            >
              {{ (item.price > 0 && !item.isPurchased) ? '立即购买' : '立即学习' }}
            </wd-button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.course-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 0 30rpx 40rpx;
}

.header {
  padding: 10rpx 0 20rpx;
}

.course-list {
  margin-top: 20rpx;
}

.course-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
  display: flex;
  gap: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);
}

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
</style>