<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getHomeStatsApi, getRecommendCoursesApi } from '@/api/index'

const stats = ref({
  paperCount: 0,
  wrongCount: 0,
  analysisProgress: 0
})

const recommendCourses = ref<any[]>([])

const loadData = async () => {
  try {
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
  console.log('点击了:', type)
}
</script>

<template>
  <view class="index-container">
    <view class="status-bar"></view>
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
      
      <!-- 功能网格 -->
      <view class="function-grid">
        <wd-grid :column="3" :border="false">
          <wd-grid-item @click="handleGridClick('paper')">
            <template #icon>
              <view class="grid-icon-wrap paper">
                <wd-icon name="edit" size="24px" color="#fff" />
              </view>
            </template>
            <template #text>
              <view class="grid-text-wrap">
                <text class="grid-label">试卷报告</text>
                <text class="grid-value">{{ stats.paperCount }}份</text>
              </view>
            </template>
          </wd-grid-item>
          <wd-grid-item @click="handleGridClick('wrong')">
            <template #icon>
              <view class="grid-icon-wrap wrong">
                <wd-icon name="close-circle" size="24px" color="#fff" />
              </view>
            </template>
            <template #text>
              <view class="grid-text-wrap">
                <text class="grid-label">错题本</text>
                <text class="grid-value">{{ stats.wrongCount }}道</text>
              </view>
            </template>
          </wd-grid-item>
          <wd-grid-item @click="handleGridClick('analysis')">
            <template #icon>
              <view class="grid-icon-wrap analysis">
                <wd-icon name="chart-line" size="24px" color="#fff" />
              </view>
            </template>
            <template #text>
              <view class="grid-text-wrap">
                <text class="grid-label">总体分析</text>
                <text class="grid-value">{{ stats.analysisProgress }}%</text>
              </view>
            </template>
          </wd-grid-item>
        </wd-grid>
      </view>

      <view class="section-header">
        <text class="section-title">今日推荐</text>
        <text class="section-more">查看更多</text>
      </view>

      <view class="recommend-list">
        <view class="recommend-item" v-for="course in recommendCourses" :key="course.id">
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

.status-bar {
  height: var(--status-bar-height);
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
  
  .function-grid {
    background: #fff;
    border-radius: 24rpx;
    padding: 30rpx 10rpx;
    margin-bottom: 40rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);

    .grid-icon-wrap {
      width: 80rpx;
      height: 80rpx;
      border-radius: 24rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16rpx;
      
      &.paper { background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%); }
      &.wrong { background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%); }
      &.analysis { background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); }
    }

    .grid-text-wrap {
      text-align: center;
      .grid-label {
        display: block;
        font-size: 26rpx;
        color: #666;
        margin-bottom: 4rpx;
      }
      .grid-value {
        font-size: 24rpx;
        color: #999;
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