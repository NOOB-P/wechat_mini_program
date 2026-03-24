<script setup lang="ts">
onShow(() => {
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.reLaunch({ url: '/pages/login/index' })
  }
})
</script>

<template>
  <view class="main">
    <text>这里是首页</text>
  </view>
</template>

<style lang="scss" scoped>
</style>
