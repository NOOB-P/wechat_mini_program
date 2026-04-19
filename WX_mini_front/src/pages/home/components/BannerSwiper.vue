<script setup lang="ts">
defineProps<{
  staticBaseUrl: string
}>()

const emit = defineEmits(['click'])
</script>

<template>
  <view class="banner-swiper-wrap">
    <swiper
      class="banner-swiper"
      circular
      autoplay
      :interval="3000"
      :duration="500"
      indicator-dots
      indicator-color="rgba(255, 255, 255, 0.5)"
      indicator-active-color="#ffffff"
    >
      <swiper-item
        v-for="(img, index) in [staticBaseUrl + '/home/广告位.jpg', staticBaseUrl + '/home/banner_bg.png']"
        :key="index"
      >
        <image class="swiper-img" :src="img" mode="aspectFill" @click="emit('click')" />
      </swiper-item>
    </swiper>
  </view>
</template>

<style lang="scss" scoped>
.banner-swiper-wrap {
  margin-bottom: 24rpx;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  transform: translateY(0);

  .banner-swiper {
    width: 100%;
    height: 220rpx;

    .swiper-img {
      width: 100%;
      height: 100%;
      display: block;
    }
  }
}
</style>
