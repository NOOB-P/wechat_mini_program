<template>
  <view class="mine-container">
    <!-- 头部背景渐变 -->
    <view class="header-bg"></view>

    <!-- 头部用户信息 -->
    <view class="header-content">
      <view class="status-bar"></view>
      <view class="nav-bar">
        <wd-icon name="notification" size="24px" class="notice-icon" />
      </view>
      
      <view class="user-info-section" @click="handleEditProfile">
        <wd-img
          :width="64"
          :height="64"
          round
          :src="userInfo.avatar"
          class="user-avatar"
        />
        <view class="user-text">
          <view class="nickname-row">
            <text class="nickname">{{ userInfo.nickname }}</text>
            <wd-icon name="arrow-right" size="16px" color="#999" />
          </view>
          <text class="grade">{{ userInfo.grade }}</text>
        </view>
      </view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-content">
      <!-- 菜单组一 -->
      <view class="menu-card">
        <wd-cell-group border>
          <wd-cell 
            v-for="(item, index) in menuGroup1" 
            :key="index"
            :title="item.label" 
            is-link 
            @click="handleMenuClick(item)"
          >
            <template #icon>
              <wd-icon :name="item.icon" size="20px" class="menu-icon" />
            </template>
          </wd-cell>
        </wd-cell-group>
      </view>

      <!-- 菜单组二 -->
      <view class="menu-card">
        <wd-cell-group border>
          <wd-cell 
            v-for="(item, index) in menuGroup2" 
            :key="index"
            :title="item.label" 
            is-link 
            @click="handleMenuClick(item)"
          >
            <template #icon>
              <wd-icon :name="item.icon" size="20px" class="menu-icon" />
            </template>
          </wd-cell>
        </wd-cell-group>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { getUserInfoApi } from '@/api/mine'

// 用户信息
const userInfo = reactive({
  avatar: '',
  nickname: '',
  grade: ''
})

// 获取用户信息
const getUserInfo = async () => {
  try {
    const res = await getUserInfoApi()
    if (res.code === 200) {
      Object.assign(userInfo, res.data)
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

onMounted(() => {
  getUserInfo()
})

// 菜单组一
const menuGroup1 = [
  { label: '绑定公众号', icon: 'check-outline', path: '/pages/mine/bind/wechat' },
  { label: '绑定学生账号', icon: 'link', path: '/pages/mine/bind/student' },
  { label: '收货地址', icon: 'location', path: '/pages/mine/address/index' }
]

// 菜单组二
const menuGroup2 = [
  { label: '客服中心', icon: 'chat', path: '/pages/mine/support/index' },
  { label: '关于我们', icon: 'info-circle', path: '/pages/mine/about/index' },
  { label: '意见反馈', icon: 'edit', path: '/pages/mine/feedback/index' },
  { label: '设置', icon: 'setting', path: '/pages/mine/settings/index' }
]

// 处理菜单点击
const handleMenuClick = (item: any) => {
  console.log('点击了菜单:', item.label)
  uni.navigateTo({
    url: item.path
  })
}

// 处理个人资料编辑
const handleEditProfile = () => {
  console.log('编辑个人资料')
}
</script>

<style lang="scss" scoped>
.mine-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  position: relative;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 280rpx;
  background: linear-gradient(180deg, #e6f1ff 0%, #f8f9fa 100%);
  z-index: 0;
}

.header-content {
  position: relative;
  z-index: 1;
  padding: 0 40rpx;
}

.status-bar {
  height: var(--status-bar-height);
}

.nav-bar {
  height: 88rpx;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.notice-icon {
  color: #333;
}

.user-info-section {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
  margin-bottom: 60rpx;
}

.user-avatar {
  border: 4rpx solid #fff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.user-text {
  margin-left: 24rpx;
  flex: 1;
}

.nickname-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nickname {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}

.grade {
  font-size: 26rpx;
  color: #999;
  margin-top: 8rpx;
  display: block;
}

.menu-content {
  position: relative;
  z-index: 1;
  padding: 0 30rpx;
}

.menu-card {
  background-color: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);
}

.menu-icon {
  margin-right: 20rpx;
  color: #333;
}

/* 深度修改 wot-design 样式以符合卡片风格 */
:deep(.wd-cell-group) {
  background-color: transparent !important;
}

:deep(.wd-cell) {
  padding: 32rpx 32rpx !important;
}
</style>
