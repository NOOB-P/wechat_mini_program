<script setup lang="ts">
defineProps<{
  staticBaseUrl: string
}>()

const emit = defineEmits(['click'])
</script>

<template>
  <view class="function-banner" @click="emit('click')">
    <view class="banner-content">
      <image class="banner-icon-img" :src="staticBaseUrl + '/home/analysis.png'" mode="aspectFit" />
      <view class="banner-text-wrap">
        <text class="banner-title">学情分析</text>
        <text class="banner-desc">查看近期考试趋势和学科表现。</text>
      </view>
    </view>
    <wd-icon name="expand" size="20px" color="#ccc" />
  </view>
</template>

<style lang="scss" scoped>
.function-banner {
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  display: flex;
  justify-content: space-between;
  align-items: center;

  .banner-content {
    display: flex;
    align-items: center;
    gap: 20rpx;
  }

  .banner-icon-img {
    width: 100rpx;
    height: 100rpx;
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
</style>
