<template>
  <view class="score-container">
    <scroll-view scroll-y class="content" v-if="scoreData">
      <!-- 考试概览 -->
      <view class="overview-card">
        <view class="exam-info">
          <text class="exam-name">{{ scoreData.examName }}</text>
          <text class="exam-date">{{ scoreData.examDate }}</text>
        </view>
        <view class="score-main">
          <view class="score-item">
            <text class="label">总分</text>
            <text class="value">{{ scoreData.totalScore }}</text>
          </view>
          <view class="divider"></view>
          <view class="score-item">
            <text class="label">综合等级</text>
            <text class="value level">{{ scoreData.totalLevel }}</text>
          </view>
        </view>
      </view>

      <!-- 各科成绩 -->
      <view class="section">
        <view class="section-title">各科成绩</view>
        <view class="subject-grid">
          <view class="subject-card" v-for="(sub, index) in scoreData.subjects" :key="index">
            <view class="sub-header">
              <text class="sub-name">{{ sub.name }}</text>
              <text class="sub-level" :class="'level-' + sub.level">{{ sub.level }}</text>
            </view>
            <view class="sub-score">
              <text class="score">{{ sub.score }}</text>
              <text class="full-score">/ {{ sub.fullScore }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 历史成绩趋势 (CSS柱状图实现) -->
      <view class="section">
        <view class="section-title">历次考试总分趋势</view>
        <view class="chart-card">
          <view class="bar-chart">
            <view class="bar-item" v-for="(item, index) in scoreData.history" :key="index">
              <view class="bar-value">{{ item.score }}</view>
              <view class="bar-track">
                <!-- 假设满分 750 计算百分比 -->
                <view class="bar-fill" :style="{ height: (item.score / 750 * 100) + '%' }"></view>
              </view>
              <view class="bar-label">{{ item.period }}</view>
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
import { getStudentScoresApi } from '@/api/score'

const toast = useToast()
const scoreData = ref<any>(null)

const loadData = async () => {
  try {
    toast.loading('加载中...')
    const res = await getStudentScoresApi()
    if (res.code === 200) {
      scoreData.value = res.data
      toast.close()
    } else {
      toast.error(res.msg || '获取数据失败')
    }
  } catch (error: any) {
    toast.error(error.msg || '网络错误')
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.score-container {
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

.overview-card {
  background: linear-gradient(135deg, #1a5f8e 0%, #2b7aab 100%);
  border-radius: 24rpx;
  padding: 40rpx;
  color: #fff;
  margin-bottom: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(26, 95, 142, 0.3);

  .exam-info {
    margin-bottom: 30rpx;
    .exam-name {
      display: block;
      font-size: 32rpx;
      font-weight: bold;
      margin-bottom: 10rpx;
    }
    .exam-date {
      font-size: 24rpx;
      opacity: 0.8;
    }
  }

  .score-main {
    display: flex;
    align-items: center;
    justify-content: space-around;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 16rpx;
    padding: 30rpx 0;

    .score-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10rpx;

      .label {
        font-size: 26rpx;
        opacity: 0.9;
      }
      .value {
        font-size: 56rpx;
        font-weight: bold;
      }
      .level {
        color: #ffd700;
      }
    }

    .divider {
      width: 2rpx;
      height: 80rpx;
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

.section {
  margin-bottom: 40rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
    padding-left: 10rpx;
    border-left: 8rpx solid #1a5f8e;
  }
}

.subject-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;

  .subject-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);

    .sub-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;

      .sub-name {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
      }
      .sub-level {
        font-size: 24rpx;
        padding: 4rpx 12rpx;
        border-radius: 8rpx;
        font-weight: bold;
        
        &.level-A { color: #00c853; background: rgba(0, 200, 83, 0.1); }
        &.level-B { color: #2196f3; background: rgba(33, 150, 243, 0.1); }
        &.level-C { color: #ff9800; background: rgba(255, 152, 0, 0.1); }
        &.level-D { color: #f44336; background: rgba(244, 67, 54, 0.1); }
      }
    }

    .sub-score {
      display: flex;
      align-items: baseline;
      
      .score {
        font-size: 40rpx;
        font-weight: bold;
        color: #1a5f8e;
      }
      .full-score {
        font-size: 24rpx;
        color: #999;
        margin-left: 8rpx;
      }
    }
  }
}

.chart-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);

  .bar-chart {
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    height: 400rpx;
    padding-top: 40rpx;

    .bar-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;

      .bar-value {
        font-size: 24rpx;
        color: #666;
        margin-bottom: 10rpx;
      }

      .bar-track {
        width: 40rpx;
        flex: 1;
        background: #f0f0f0;
        border-radius: 20rpx;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        overflow: hidden;

        .bar-fill {
          width: 100%;
          background: linear-gradient(to top, #1a5f8e, #4da8da);
          border-radius: 20rpx;
          transition: height 0.5s ease-out;
        }
      }

      .bar-label {
        font-size: 24rpx;
        color: #999;
        margin-top: 16rpx;
      }
    }
  }
}
</style>
