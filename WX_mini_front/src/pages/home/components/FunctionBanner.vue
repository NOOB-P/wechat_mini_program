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
  background: linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%);
  border-radius: 32rpx;
  padding: 40rpx 32rpx;
  margin: 24rpx 0;
  box-shadow: 0 8rpx 24rpx rgba(26, 95, 142, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(26, 95, 142, 0.05);

  .banner-content {
    display: flex;
    align-items: center;
    gap: 32rpx;
  }

  .banner-icon-img {
    width: 140rpx;
    height: 140rpx;
    filter: drop-shadow(0 4rpx 8rpx rgba(0, 0, 0, 0.1));
  }

  .banner-text-wrap {
    display: flex;
    flex-direction: column;
    gap: 12rpx;

    .banner-title {
      font-size: 40rpx;
      font-weight: 800;
      color: #1a5f8e;
      letter-spacing: 2rpx;
    }

    .banner-desc {
      font-size: 26rpx;
      color: #666;
      max-width: 400rpx;
      line-height: 1.4;
    }
  }
}
</style>
