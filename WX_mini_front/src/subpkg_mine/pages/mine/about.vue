<template>
  <view class="about-container">
    <!-- 顶部 Logo 区域 -->
    <view class="logo-section">
      <image class="logo" :src="staticBaseUrl + '/tabbar/logo.png'" mode="aspectFit" />
      <text class="app-name">优题慧</text>
      <text class="version">v1.0.0</text>
    </view>

    <!-- 产品简介 -->
    <view class="section">
      <view class="section-title">产品简介</view>
      <view class="section-content">
        <text>优题慧致力于为广大用户提供高效、智能的核心功能，如：学情分析与教学辅助方案。我们通过数据驱动和创新的交互设计，帮助用户在历次考试分析中获得卓越体验。</text>
      </view>
    </view>

    <!-- 核心价值 -->
    <view class="section">
      <view class="section-title">核心价值</view>
      <wd-cell-group border>
        <wd-cell title="专业度" label="核心团队深耕教育多年，拥有丰富的行业积淀。" />
        <wd-cell title="智能化" label="采用先进的数据处理技术，让复杂流程变得简单。" />
        <wd-cell title="安全保障" label="我们高度重视您的隐私与数据安全，采用多重加密保障。" />
      </wd-cell-group>
    </view>

    <!-- 联系我们 -->
    <view class="section">
      <view class="section-title">联系我们</view>
      <wd-cell-group border>
        <wd-cell title="官方客服" value="[电话/微信号]" is-link @click="copyText('[电话/微信号]')" />
        <wd-cell title="商务合作" value="[邮箱地址]" is-link @click="copyText('[邮箱地址]')" />
      </wd-cell-group>
    </view>

    <!-- 底部版权 -->
    <view class="footer">
      <text>© 2026-2027 优题慧 版权所有</text>
    </view>
    
    <wd-toast />
  </view>
</template>

<script setup lang="ts">
import { useToast } from 'wot-design-uni'

const staticBaseUrl = __VITE_STATIC_BASEURL__
const toast = useToast()

const copyText = (text: string) => {
  uni.setClipboardData({
    data: text,
    success: () => {
      toast.success('已复制到剪贴板')
    }
  })
}
</script>

<style lang="scss" scoped>
.about-container {
  min-height: 100vh;
  background-color: #f8f8f8;
  padding: 40rpx 30rpx;
  box-sizing: border-box;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
  
  .logo {
    width: 160rpx;
    height: 160rpx;
    margin-bottom: 20rpx;
  }
  
  .app-name {
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 10rpx;
  }
  
  .version {
    font-size: 24rpx;
    color: #999;
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
  
  .section-content {
    background-color: #fff;
    padding: 30rpx;
    border-radius: 12rpx;
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  }
}

:deep(.wd-cell-group) {
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.footer {
  margin-top: 80rpx;
  text-align: center;
  
  text {
    font-size: 24rpx;
    color: #ccc;
  }
}
</style>
