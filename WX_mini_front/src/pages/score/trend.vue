<template>
  <view class="score-container">
    <view class="analysis-card detail-card" v-if="scoreData">
      <view class="card-header">
        <text class="card-title">近六次考试趋势分析</text>
      </view>
      
      <view class="chart-tabs" style="margin-top: 20rpx;">
        <view 
          class="chart-tab" 
          :class="{ active: currentSubject === '总分' }"
          @click="currentSubject = '总分'"
        >总分</view>
        <view 
          class="chart-tab" 
          v-for="(sub, idx) in scoreData.subjects" 
          :key="idx"
          :class="{ active: currentSubject === sub.name }"
          @click="currentSubject = sub.name"
        >{{ sub.name }}</view>
      </view>
      
      <view class="bar-chart-container" style="padding-top: 20rpx; height: 300rpx;">
        <view class="bar-item" v-for="(item, idx) in scoreData.history" :key="idx">
          <view class="bar-val">{{ getChartValue(item) }}</view>
          <view class="bar-track">
            <view class="bar-fill" :style="{ height: getChartHeight(item) }"></view>
          </view>
          <view class="bar-label">{{ item.period }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const scoreData = ref<any>(null)
const currentSubject = ref('总分')

const getChartValue = (item: any) => {
  if (currentSubject.value === '总分') {
    return item.score
  }
  return item.subjects?.[currentSubject.value] || 0
}

const getChartHeight = (item: any) => {
  const val = getChartValue(item)
  const max = currentSubject.value === '总分' ? 750 : 150
  return (val / max * 100) + '%'
}

onMounted(() => {
  const data = uni.getStorageSync('currentScoreData')
  if (data) {
    scoreData.value = data
  }
})
</script>

<style lang="scss" scoped>
.score-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 30rpx;
  box-sizing: border-box;
}
.analysis-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    .card-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
  }
}

.chart-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 20rpx;
  
  .chart-tab {
    padding: 8rpx 24rpx;
    font-size: 26rpx;
    color: #666;
    background: #fff;
    border: 1rpx solid #eee;
    border-radius: 30rpx;
    transition: all 0.3s;
    
    &.active {
      background: #1a5f8e;
      color: #fff;
      border-color: #1a5f8e;
    }
  }
}

.bar-chart-container {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 250rpx;
  padding-top: 40rpx;

  .bar-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    
    .bar-val {
      font-size: 24rpx;
      color: #666;
      margin-bottom: 8rpx;
      font-weight: bold;
    }
    
    .bar-track {
      width: 40rpx;
      flex: 1;
      background: #f0f0f0;
      border-radius: 8rpx;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      
      .bar-fill {
        width: 100%;
        background: linear-gradient(to top, #6fb1fc, #4364f7);
        border-radius: 8rpx;
        transition: height 0.3s;
      }
    }
    
    .bar-label {
      margin-top: 12rpx;
      font-size: 22rpx;
      color: #999;
      writing-mode: vertical-rl;
      text-align: center;
      height: 120rpx;
    }
  }
}
</style>