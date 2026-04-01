<template>
  <view class="score-container">
    <view class="analysis-card detail-card" v-if="analysisData && analysisData.composition">
      <view class="card-header">
        <text class="card-title">成绩构成分析</text>
      </view>
      <view class="desc">各科成绩结构（基础 / 综合 / 难题）</view>
      
      <view class="pie-chart-mock">
        <view class="pie-slice" v-for="(item, index) in analysisData.composition" :key="index">
          <text class="label">{{ item.name }} ({{ item.level }})</text>
          <view class="bar-bg">
            <view class="bar-fill" :style="{ width: item.value + '%' }"></view>
          </view>
          <text class="value">{{ item.value }}%</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const analysisData = ref<any>(null)

onMounted(() => {
  const data = uni.getStorageSync('currentAnalysisData')
  if (data) {
    analysisData.value = data
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
  .desc {
    font-size: 24rpx;
    color: #666;
    margin-bottom: 30rpx;
  }
}
.pie-chart-mock {
  .pie-slice {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    
    .label {
      width: 140rpx;
      font-size: 26rpx;
      color: #666;
    }
    
    .bar-bg {
      flex: 1;
      height: 16rpx;
      background: #f0f0f0;
      border-radius: 8rpx;
      margin: 0 20rpx;
      overflow: hidden;
      
      .bar-fill {
        height: 100%;
        background: linear-gradient(to right, #6fb1fc, #4364f7);
        border-radius: 8rpx;
      }
    }
    
    .value {
      width: 80rpx;
      text-align: right;
      font-size: 26rpx;
      font-weight: bold;
      color: #333;
    }
  }
}
</style>