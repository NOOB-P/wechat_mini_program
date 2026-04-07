<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getCourseListApi, buyCourseApi } from '@/api/course'

const searchValue = ref('')
const courses = ref<any[]>([])

const filteredCourses = computed(() => {
  if (!searchValue.value) return courses.value
  return courses.value.filter(item => 
    item.title.toLowerCase().includes(searchValue.value.toLowerCase()) ||
    (item.content && item.content.toLowerCase().includes(searchValue.value.toLowerCase()))
  )
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

const handleCourseClick = (course: any) => {
  uni.navigateTo({
    url: `/pages/course/detail?id=${course.id}`
  })
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
  uni.setNavigationBarTitle({
    title: '精选课程'
  })
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
    <!-- 顶部背景渐变 -->
    <view class="header-bg"></view>

    <view class="sticky-header">
      <view class="search-bar-wrap">
        <wd-search 
          v-model="searchValue" 
          placeholder="搜索您感兴趣的课程" 
          hide-cancel 
          custom-style="background: transparent;"
        />
      </view>
    </view>

    <view class="course-list-wrap animate-fade-in" v-if="filteredCourses.length > 0">
      <view v-for="(item, index) in filteredCourses" :key="item.id" class="course-card" @click="handleCourseClick(item)">
        <image 
          :src="item.cover || 'https://img.yzcdn.cn/vant/cat.jpeg'" 
          mode="aspectFill"
          class="course-img" 
        />
        <view class="course-info">
          <view class="top-info">
            <view class="title-row">
              <text class="course-title">{{ item.title }}</text>
              <view class="tag-new" v-if="index < 2">NEW</view>
            </view>
            <text class="course-desc" v-if="item.content">{{ item.content.replace(/<[^>]+>/g, '').substring(0, 35) }}...</text>
          </view>
          
          <view class="course-bottom">
            <view class="price-box">
              <block v-if="item.price > 0">
                <text class="symbol">￥</text>
                <text class="price">{{ item.price }}</text>
              </block>
              <text class="price-free" v-else>免费</text>
            </view>
            
            <view class="action-btn" :class="{ 'purchased': item.isPurchased || item.price <= 0 }" @click.stop="handleBuy($event, item)">
              <text>{{ (item.price > 0 && !item.isPurchased) ? '立即购买' : '开始学习' }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="empty-state animate-fade-in" v-else>
      <wd-img
        :width="120"
        :height="120"
        src="https://img.yzcdn.cn/vant/empty-image-default.png"
      />
      <text class="empty-text">没有找到相关课程~</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
// 辅助 Mixin
@mixin ellipsis($lines: 1) {
  @if $lines == 1 {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  } @else {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: $lines;
    overflow: hidden;
  }
}

.course-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  position: relative;
  padding-bottom: 40rpx;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 360rpx;
  background: linear-gradient(135deg, #d4f9f2 0%, #eef5ff 100%);
  z-index: 0;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 20rpx 30rpx;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.search-bar-wrap {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 40rpx;
  padding: 4rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.course-list-wrap {
  position: relative;
  z-index: 1;
  padding: 20rpx 30rpx;
}

.course-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 30rpx;
  display: flex;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
    background: #fdfdfd;
  }
}

.course-img {
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.course-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 4rpx 0;
}

.title-row {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.course-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
  @include ellipsis(1);
}

.tag-new {
  font-size: 18rpx;
  color: #fff;
  background: linear-gradient(90deg, #ff6b6b, #ff8787);
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
  margin-left: 12rpx;
  font-weight: bold;
}

.course-desc {
  font-size: 24rpx;
  color: #8c8c8c;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.course-bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 16rpx;
}

.price-box {
  .symbol {
    font-size: 24rpx;
    color: #ff4d4f;
    font-weight: bold;
  }
  .price {
    font-size: 40rpx;
    color: #ff4d4f;
    font-weight: bold;
  }
  .price-free {
    font-size: 32rpx;
    color: #52c41a;
    font-weight: bold;
  }
}

.action-btn {
  background: linear-gradient(135deg, #2ed573, #7bed9f);
  color: #fff;
  padding: 12rpx 32rpx;
  border-radius: 32rpx;
  font-size: 24rpx;
  font-weight: 500;
  box-shadow: 0 6rpx 16rpx rgba(46, 213, 115, 0.2);
  
  &.purchased {
    background: linear-gradient(135deg, #1e90ff, #70a1ff);
    box-shadow: 0 6rpx 16rpx rgba(30, 144, 255, 0.2);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
  
  .empty-text {
    margin-top: 30rpx;
    font-size: 28rpx;
    color: #999;
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>