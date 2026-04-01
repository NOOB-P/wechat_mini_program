<template>
  <view class="score-container">
    <view class="analysis-card detail-card" v-if="analysisData && analysisData.distribution">
      <view class="card-header">
        <text class="card-title">分数分布统计</text>
      </view>
      <view class="desc" v-if="analysisData.distribution.rankInfo">
        班级相对位置：<text class="highlight">{{ analysisData.distribution.rankInfo }}</text> | 综合等级：<text class="highlight">{{ analysisData.distribution.overallLevel }}</text>
      </view>
      
      <view class="dist-chart">
        <!-- 适配两种结构（原版 levels 或 percentage）-->
        <template v-if="analysisData.distribution.levels">
          <view class="dist-bar" v-for="(item, index) in analysisData.distribution.levels" :key="index">
            <view class="bar-val">{{ item.count }}人</view>
            <view class="bar-track">
              <view class="bar-fill" :style="{ height: (item.count / 20 * 100) + '%' }"></view>
            </view>
            <view class="bar-label">{{ item.level }}</view>
          </view>
        </template>
        <template v-else>
          <view class="dist-bar" v-for="(item, index) in analysisData.distribution" :key="index">
            <text class="bar-val">{{ item.count }}</text>
            <view class="bar-track">
              <view class="bar-fill" :style="{ height: item.percentage + '%' }"></view>
            </view>
            <text class="bar-label">{{ item.range }}</text>
          </view>
        </template>
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
    .highlight {
      color: #1a5f8e;
      font-weight: bold;
    }
  }
}

.dist-chart {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 300rpx;
  padding-top: 20rpx;

  .dist-bar {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    
    .bar-val {
      font-size: 24rpx;
      color: #666;
      margin-bottom: 8rpx;
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
        background: linear-gradient(to top, #f6d365, #fda085);
        border-radius: 8rpx;
        transition: height 0.3s;
      }
    }
    
    .bar-label {
      margin-top: 12rpx;
      font-size: 24rpx;
      color: #333;
      font-weight: bold;
    }
  }
}
</style>