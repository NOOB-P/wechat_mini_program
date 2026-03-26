<template>
  <view class="settings-container">
    <wd-cell-group border class="settings-group">
      <wd-cell title="手机号" :value="userInfo.phone" is-link @click="handleCellClick('手机号')" />
      <wd-cell title="修改密码" is-link @click="handleCellClick('修改密码')" />
      <wd-cell title="账户注销" is-link @click="handleCellClick('账户注销')" />
    </wd-cell-group>

    <wd-cell-group border class="settings-group">
      <wd-cell title="实名认证" is-link @click="handleCellClick('实名认证')" />
    </wd-cell-group>

    <wd-cell-group border class="settings-group">
      <wd-cell title="上传日志" is-link @click="handleCellClick('上传日志')" />
      <wd-cell title="版本更新" :value="settingsInfo.version" is-link @click="handleCellClick('版本更新')" />
    </wd-cell-group>

    <view class="logout-btn-container">
      <text class="logout-text" @click="handleLogout">退出登录</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { getUserInfoApi } from '@/api/mine'
import request from '@/utils/request'

// 用户信息
const userInfo = reactive({
  phone: ''
})

// 设置信息
const settingsInfo = reactive({
  version: ''
})

// 获取数据
const fetchData = async () => {
  try {
    // 获取用户信息
    const userRes = await getUserInfoApi()
    if (userRes.code === 200) {
      userInfo.phone = userRes.data.phone
    }

<<<<<<< HEAD
    // 获取设置信息 (Mock)
    const settingsRes = await request({ url: '/mine/settings', method: 'GET' })
=======
    // 获取设置信息
    const settingsRes = await getSettingsInfoApi()
>>>>>>> 9ad6c498d119f7f02d79c837023d866551bcb152
    if (settingsRes.code === 200) {
      settingsInfo.version = settingsRes.data.version
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

onMounted(() => {
  fetchData()
})

// 处理点击
const handleCellClick = (title: string) => {
  uni.showToast({
    title: `点击了${title}`,
    icon: 'none'
  })
}

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.clearStorageSync()
        uni.reLaunch({
          url: '/pages/login/index'
        })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.settings-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-top: 20rpx;
}

.settings-group {
  margin-bottom: 20rpx;
  background-color: #fff;
}

.logout-btn-container {
  margin-top: 40rpx;
  background-color: #fff;
  height: 100rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logout-text {
  color: #fa4350;
  font-size: 32rpx;
}

:deep(.wd-cell) {
  padding: 32rpx !important;
}

:deep(.wd-cell__title) {
  font-size: 30rpx;
  color: #333;
}

:deep(.wd-cell__value) {
  font-size: 28rpx;
  color: #999;
}
</style>
