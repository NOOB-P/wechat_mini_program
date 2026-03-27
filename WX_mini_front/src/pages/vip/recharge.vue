<template>
  <view class="recharge-container">
    <view class="header">
      <wd-icon name="arrow-left" custom-class="back-icon" @click="goBack" />
      <view class="title">开通会员</view>
    </view>

    <view class="content">
      <!-- VIP 类型选择 -->
      <view class="vip-types">
        <view 
          class="type-card vip" 
          :class="{ active: currentType === 'vip' }"
          @click="currentType = 'vip'"
        >
          <view class="type-name">VIP会员</view>
          <view class="type-price">￥<text class="num">199</text>/年</view>
          <view class="type-desc">基础数据分析 + 错题本</view>
          <wd-icon v-if="currentType === 'vip'" name="check-bold" class="check-icon" />
        </view>
        
        <view 
          class="type-card svip" 
          :class="{ active: currentType === 'svip' }"
          @click="currentType = 'svip'"
        >
          <view class="type-name">SVIP会员</view>
          <view class="type-price">￥<text class="num">399</text>/年</view>
          <view class="type-desc">包含VIP所有权益 + AI自习室/课程</view>
          <wd-icon v-if="currentType === 'svip'" name="check-bold" class="check-icon" />
        </view>
      </view>

      <!-- 权益对比 -->
      <view class="privilege-box">
        <view class="p-title">会员权益对比</view>
        <view class="p-list">
          <view class="p-item">
            <text class="p-name">数据分析与错题本</text>
            <view class="p-status">
              <wd-icon name="check" color="#f6d365" size="18px" />
              <wd-icon name="check" color="#f6d365" size="18px" />
            </view>
          </view>
          <view class="p-item">
            <text class="p-name">高清试卷解析</text>
            <view class="p-status">
              <wd-icon name="check" color="#f6d365" size="18px" />
              <wd-icon name="check" color="#f6d365" size="18px" />
            </view>
          </view>
          <view class="p-item highlight">
            <text class="p-name">全学科AI名师课程</text>
            <view class="p-status">
              <wd-icon name="close" color="#ccc" size="18px" />
              <wd-icon name="check" color="#f6d365" size="18px" />
            </view>
          </view>
          <view class="p-item highlight">
            <text class="p-name">AI专属学习计划</text>
            <view class="p-status">
              <wd-icon name="close" color="#ccc" size="18px" />
              <wd-icon name="check" color="#f6d365" size="18px" />
            </view>
          </view>
        </view>
      </view>

      <!-- 支付按钮 -->
      <view class="pay-btn-wrapper">
        <wd-button type="primary" block custom-class="pay-btn" @click="handlePay">
          立即开通 {{ currentType.toUpperCase() }}
        </wd-button>
      </view>
    </view>
    
    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'wot-design-uni'

const toast = useToast()
const currentType = ref('svip') // 默认推荐 SVIP

const goBack = () => {
  uni.navigateBack()
}

const handlePay = () => {
  toast.loading('正在支付...')
  setTimeout(() => {
    toast.success('支付成功 (Mock)')
    // 模拟更新权限逻辑
    const phone = currentType.value === 'svip' ? '13688888888' : '13800000000'
    uni.setStorageSync('token', `mock-token-${phone}`)
    setTimeout(() => {
      uni.switchTab({ url: '/pages/mine/index' })
    }, 1500)
  }, 1500)
}
</script>

<style lang="scss" scoped>
.recharge-container {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 120rpx 32rpx 32rpx; // 增加了顶部的 padding 避免被刘海屏挡住
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  padding: 40rpx 0 30rpx;
  margin-bottom: 20rpx;
  position: relative;
  z-index: 10;
  
  .back-icon {
    font-size: 44rpx !important;
    color: #333;
    padding: 20rpx;
    margin-left: -20rpx; // 抵消 padding 带来的位移
  }
  
  .title {
    flex: 1;
    text-align: center;
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    transform: translateX(-20rpx);
  }
}

.content {
  padding: 0 10rpx;
}

.vip-types {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
  margin-bottom: 50rpx;
  
  .type-card {
    position: relative;
    padding: 40rpx;
    border-radius: 24rpx;
    border: 4rpx solid transparent;
    transition: all 0.3s;
    
    &.vip {
      background: linear-gradient(135deg, #fff9e6 0%, #fff0b3 100%);
      color: #b38000;
    }
    
    &.svip {
      background: linear-gradient(135deg, #333333 0%, #1a1a1a 100%);
      color: #f6d365;
      .type-desc { color: #aaa; }
    }
    
    &.active {
      border-color: #f6d365;
      transform: scale(1.02);
      box-shadow: 0 10rpx 30rpx rgba(246, 211, 101, 0.3);
    }
    
    .type-name {
      font-size: 32rpx;
      font-weight: bold;
      margin-bottom: 10rpx;
    }
    
    .type-price {
      font-size: 28rpx;
      margin-bottom: 10rpx;
      .num { font-size: 56rpx; font-weight: bold; }
    }
    
    .type-desc {
      font-size: 24rpx;
    }
    
    .check-icon {
      position: absolute;
      right: 30rpx;
      top: 50%;
      transform: translateY(-50%);
      font-size: 48rpx;
      color: #f6d365;
    }
  }
}

.privilege-box {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
  
  .p-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 30rpx;
    text-align: center;
  }
  
  .p-list {
    .p-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 2rpx dashed #eee;
      
      &.highlight .p-name {
        color: #1a5f8e;
        font-weight: bold;
      }
      
      .p-name {
        font-size: 28rpx;
        color: #666;
        flex: 1;
      }
      
      .p-status {
        display: flex;
        width: 120rpx;
        justify-content: space-between;
      }
    }
  }
}

.pay-btn-wrapper {
  margin-top: 60rpx;
  
  .pay-btn {
    height: 96rpx;
    border-radius: 48rpx;
    font-size: 34rpx;
    font-weight: bold;
    background: linear-gradient(to right, #f6d365, #fda085) !important;
    border: none !important;
    color: #333 !important;
  }
}
</style>