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
      <view class="welcome-text-area">
        <text class="welcome-title">欢迎回来</text>
        <text class="welcome-desc">开启今日专注计划。</text>
      </view>
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
    height: 100%;

    .user-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12rpx;

      .user-name {
        font-size: 38rpx;
        font-weight: 800;
        color: #0052d9;
        margin-right: 20rpx;
        letter-spacing: 1rpx;
      }

      .grade-tag {
        font-size: 24rpx;
        color: #fff;
        background: linear-gradient(90deg, #6ea3ff, #1a74ff);
        padding: 6rpx 28rpx;
        border-radius: 30rpx;
        border: 2rpx solid rgba(255, 255, 255, 0.8);
        box-shadow: 0 6rpx 12rpx rgba(77, 141, 245, 0.2);
        font-weight: bold;
      }
    }

    .welcome-text-area {
      display: flex;
      flex-direction: column;
      margin-bottom: 24rpx;
      max-width: 70%; // 限制宽度防止重叠右侧装饰

      .welcome-title {
        color: #333;
        font-size: 30rpx;
        font-weight: 600;
        margin-bottom: 4rpx;
      }

      .welcome-desc {
        color: #666;
        font-size: 26rpx;
        opacity: 0.85;
      }
    }

    .logo-box {
      width: 90rpx;
      height: 90rpx;
      background: linear-gradient(135deg, #7ab0ff, #4d8df5);
      color: #fff;
      font-size: 22rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 20rpx;
      font-weight: 900;
      box-shadow: 0 4rpx 10rpx rgba(0, 122, 255, 0.2);
      margin-top: 4rpx;
    }
  }
}
</style>
