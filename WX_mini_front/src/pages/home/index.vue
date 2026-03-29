<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useToast } from 'wot-design-uni'
import { getHomeStatsApi, getRecommendCoursesApi } from '@/api/index'

const toast = useToast()

const stats = ref({
  paperCount: 0,
  wrongCount: 0,
  analysisProgress: 0
})

const recommendCourses = ref<any[]>([])
const isSVIPUser = ref(false)

const loadData = async () => {
  try {
    const token = uni.getStorageSync('token') || ''
    isSVIPUser.value = token.includes('13688888888')

    const [statsRes, coursesRes] = await Promise.all([
      getHomeStatsApi(),
      getRecommendCoursesApi()
    ])
    console.log('首页统计数据:', statsRes)
    console.log('今日推荐课程:', coursesRes)
    if (statsRes.code === 200) stats.value = statsRes.data
    if (coursesRes.code === 200) recommendCourses.value = coursesRes.data
  } catch (error) {
    console.error('加载首页数据失败:', error)
  }
}

onShow(() => {
  loadData()
})

const handleGridClick = (type: string) => {
  if (type === 'analysis') {
    uni.navigateTo({ url: '/pages/score/index' })
  }
}

const goToRecharge = () => {
  uni.navigateTo({ url: '/pages/vip/recharge' })
}

const joinRoom = () => {
  toast.loading('正在为您分配座位...')
  setTimeout(() => {
    toast.success('报名成功，即将进入自习室')
  }, 1500)
}

const handleCourseClick = (course: any) => {
  uni.showToast({ title: `正在进入: ${course.name}`, icon: 'none' })
  // 这里可以跳转到真正的课程播放页面
}
</script>

<template>
  <view class="index-container">
    <wd-toast id="wd-toast" />
    <view class="header">
      <text class="title">教育学习平台</text>
    </view>
    
    <view class="content">
      <!-- 欢迎卡片 -->
      <view class="welcome-card">
        <view class="welcome-info">
          <text class="welcome-title">欢迎回来，开启学习之旅</text>
          <text class="welcome-desc">今天也要加油鸭！</text>
        </view>
        <wd-icon name="chart" size="64px" color="rgba(255,255,255,0.2)" class="card-bg-icon" />
      </view>
      
      <!-- 核心功能：成绩分析 -->
      <view class="function-banner" @click="handleGridClick('analysis')">
        <view class="banner-content">
          <view class="banner-icon-wrap">
            <wd-icon name="chart-line" size="32px" color="#fff" />
          </view>
          <view class="banner-text-wrap">
            <text class="banner-title">成绩分析</text>
            <text class="banner-desc">查看近期考试趋势与各科综合表现</text>
          </view>
        </view>
        <wd-icon name="arrow-right" size="20px" color="#999" />
      </view>

      <!-- 新增：课程宣传轮播图 -->
      <view class="banner-swiper">
        <swiper class="swiper-box" indicator-dots autoplay circular :interval="3000" :duration="500">
          <swiper-item>
            <view class="swiper-item-content banner-1">
              <text class="b-title">心理健康微课堂</text>
              <text class="b-desc">解读青春期烦恼，走进孩子内心世界</text>
            </view>
          </swiper-item>
          <swiper-item>
            <view class="swiper-item-content banner-2">
              <text class="b-title">家长必修课</text>
              <text class="b-desc">如何构建和谐的亲子沟通桥梁</text>
            </view>
          </swiper-item>
        </swiper>
      </view>

      <!-- 错题推送 (仅保留 AI 公益课程) 迁移至首页 -->
      <view class="svip-content">
        <!-- AI 课程 (不再限制 SVIP) -->
        <view class="card svip-card">
          <view class="card-title"><wd-icon name="video" class="icon" /> AI 公益课程</view>
          <view class="desc">由专家与算法联合设计，实时更新</view>
          <view class="course-grid">
            <view class="c-item" @click="handleCourseClick({name: '高中数学压轴'})">
              <view class="c-icon math">数</view>
              <text>高中数学压轴</text>
            </view>
            <view class="c-item" @click="handleCourseClick({name: '外教口语特训'})">
              <view class="c-icon eng">英</view>
              <text>外教口语特训</text>
            </view>
            <view class="c-item" @click="handleCourseClick({name: '力学实验全解'})">
              <view class="c-icon phy">物</view>
              <text>力学实验全解</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section-header">
        <text class="section-title">今日推荐</text>
        <text class="section-more">查看更多</text>
      </view>

      <view class="recommend-list">
        <view class="recommend-item" v-for="course in recommendCourses" :key="course.id" @click="handleCourseClick(course)">
          <wd-img :src="course.image" :width="160" :height="100" round class="item-img" />
          <view class="item-info">
            <text class="item-name">{{ course.name }}</text>
            <view class="item-bottom">
              <text class="item-price">￥{{ course.price }}</text>
              <wd-button type="primary" size="small" plain>学习</wd-button>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.index-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 0 30rpx 40rpx;
}

.header {
  padding: 40rpx 0 20rpx;
  .title {
    font-size: 48rpx;
    font-weight: 800;
    color: #1a1a1a;
  }
}

.content {
  .welcome-card {
    position: relative;
    background: linear-gradient(135deg, #2b5876 0%, #4e4376 100%);
    padding: 60rpx 40rpx;
    border-radius: 32rpx;
    margin-bottom: 40rpx;
    overflow: hidden;
    box-shadow: 0 12rpx 32rpx rgba(43, 88, 118, 0.2);
    
    .welcome-info {
      position: relative;
      z-index: 1;
      .welcome-title {
        display: block;
        color: #fff;
        font-size: 36rpx;
        font-weight: 600;
        margin-bottom: 12rpx;
      }
      .welcome-desc {
        color: rgba(255, 255, 255, 0.8);
        font-size: 24rpx;
      }
    }
    
    .card-bg-icon {
      position: absolute;
      right: -20rpx;
      bottom: -20rpx;
      z-index: 0;
    }
  }

  .function-banner {
    background: #fff;
    border-radius: 24rpx;
    padding: 40rpx 30rpx;
    margin-bottom: 40rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
    display: flex;
    justify-content: space-between;
    align-items: center;

    .banner-content {
      display: flex;
      align-items: center;
      gap: 30rpx;
    }

    .banner-icon-wrap {
      width: 100rpx;
      height: 100rpx;
      border-radius: 30rpx;
      background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8rpx 20rpx rgba(132, 250, 176, 0.4);
    }

    .banner-text-wrap {
      display: flex;
      flex-direction: column;
      gap: 8rpx;
      
      .banner-title {
        font-size: 34rpx;
        font-weight: bold;
        color: #333;
      }
      .banner-desc {
        font-size: 24rpx;
        color: #999;
      }
    }
  }

  .banner-swiper {
    margin-bottom: 40rpx;
    border-radius: 20rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);

    .swiper-box {
      height: 200rpx;
    }

    .swiper-item-content {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 0 40rpx;
      box-sizing: border-box;
      
      &.banner-1 {
        background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
      }
      &.banner-2 {
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%);
      }

      .b-title {
        font-size: 36rpx;
        font-weight: bold;
        color: #fff;
        margin-bottom: 10rpx;
      }
      .b-desc {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.9);
      }
    }
  }

  // 错题推送 (原 SVIP 专区) 样式
  .svip-content {
    margin-bottom: 40rpx;
  }

  .svip-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.03);

    .card-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 10rpx;
      display: flex;
      align-items: center;
      .icon { color: #f6d365; margin-right: 10rpx; }
    }

    .desc {
      font-size: 24rpx;
      color: #999;
      margin-bottom: 30rpx;
    }

    .course-grid {
      display: flex;
      justify-content: space-between;
      
      .c-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16rpx;
        font-size: 24rpx;
        color: #333;
        
        .c-icon {
          width: 100rpx;
          height: 100rpx;
          border-radius: 24rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36rpx;
          font-weight: bold;
          color: #fff;
          
          &.math { background: linear-gradient(135deg, #4facfe, #00f2fe); }
          &.eng { background: linear-gradient(135deg, #ff0844, #ffb199); }
          &.phy { background: linear-gradient(135deg, #43e97b, #38f9d7); }
        }
      }
    }
  }

  .section-header {
      display: flex;
      justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    .section-title {
      font-size: 34rpx;
      font-weight: bold;
      color: #333;
    }
    .section-more {
      font-size: 24rpx;
      color: #999;
    }
  }

  .recommend-list {
    .recommend-item {
      background-color: #fff;
      border-radius: 20rpx;
      padding: 24rpx;
      margin-bottom: 24rpx;
      display: flex;
      gap: 24rpx;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.02);
      
      .item-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        
        .item-name {
          font-size: 30rpx;
          font-weight: 500;
          color: #333;
        }
        
        .item-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          .item-price {
            font-size: 32rpx;
            font-weight: bold;
            color: #f44336;
          }
        }
      }
    }
  }
}
</style>