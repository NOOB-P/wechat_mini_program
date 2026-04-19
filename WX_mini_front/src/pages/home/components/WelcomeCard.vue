<script setup lang="ts">
defineProps<{
  userInfo: any
  staticBaseUrl: string
}>()
</script>

<template>
  <view class="welcome-card">
    <image class="welcome-bg" :src="staticBaseUrl + '/home/bg.png'" mode="aspectFill" />
    <view class="welcome-info">
      <view class="user-header">
        <text class="user-name">{{ userInfo.nickname || '用户' }}</text>
        <view class="grade-tag" v-if="userInfo.isBoundStudent === 1">{{ userInfo.grade }}</view>
      </view>
      <text class="welcome-title">欢迎回来</text>
      <text class="welcome-desc">开启今日专注计划。</text>
      <view class="logo-box">LOGO</view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.welcome-card {
  position: relative;
  padding: 30rpx;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0, 122, 255, 0.1);
  background-color: #eaf3ff;

  .welcome-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  .welcome-info {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    width: 100%;

    .user-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20rpx;

      .user-name {
        font-size: 36rpx;
        font-weight: bold;
        color: #0052d9;
        margin-right: 20rpx;
      }

      .grade-tag {
        font-size: 24rpx;
        color: #fff;
        background: linear-gradient(90deg, #8cb8ff, #5a94ff);
        padding: 6rpx 24rpx;
        border-radius: 30rpx;
        border: 2rpx solid #ffffff;
        box-shadow: 0 4rpx 8rpx rgba(77, 141, 245, 0.2);
      }
    }

    .welcome-title {
      color: #333;
      font-size: 28rpx;
      margin-bottom: 8rpx;
    }

    .welcome-desc {
      color: #666;
      font-size: 24rpx;
      margin-bottom: 20rpx;
    }

    .logo-box {
      width: 80rpx;
      height: 80rpx;
      background: linear-gradient(135deg, #7ab0ff, #4d8df5);
      color: #fff;
      font-size: 20rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 16rpx;
      font-weight: bold;
    }
  }
}
</style>
