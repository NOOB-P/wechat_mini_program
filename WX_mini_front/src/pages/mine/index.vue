<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getUserInfoApi } from '@/api/mine'

// 用户信息
const userInfo = reactive({
  avatar: '',
  nickname: '',
  grade: ''
})

// 菜单组一
const menuGroup1 = [
  { label: '我的课程', icon: 'books', value: 'courses' },
  { label: '我的收藏', icon: 'star', value: 'favorites' },
  { label: '学习记录', icon: 'time', value: 'history' }
]

// 菜单组二
const menuGroup2 = [
  { label: '个人设置', icon: 'setting', value: 'settings' },
  { label: '关于我们', icon: 'info-circle', value: 'about' }
]

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

onShow(() => {
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.reLaunch({ url: '/pages/login/index' })
  } else {
    getUserInfo()
  }
})

onMounted(() => {
  // 初始加载由 onShow 处理，如果需要其他逻辑可以放在这里
})

const handleMenuClick = (item: any) => {
  if (item.value === 'settings') {
    uni.navigateTo({ url: '/pages/mine/settings/index' })
  } else {
    uni.showToast({ title: `点击了${item.label}`, icon: 'none' })
  }
}

const handleEditProfile = () => {
  uni.showToast({ title: '编辑个人资料', icon: 'none' })
}
</script>

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
  height: 400rpx;
  background: linear-gradient(180deg, #1a5f8e 0%, #f8f9fa 100%);
  opacity: 0.1;
}

.header-content {
  position: relative;
  padding: 0 40rpx 40rpx;
  
  .status-bar {
    height: var(--status-bar-height);
  }
  
  .nav-bar {
    height: 88rpx;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    .notice-icon {
      color: #333;
    }
  }
  
  .user-info-section {
    display: flex;
    align-items: center;
    margin-top: 20rpx;
    
    .user-avatar {
      border: 4rpx solid #fff;
      box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.1);
    }
    
    .user-text {
      margin-left: 30rpx;
      .nickname-row {
        display: flex;
        align-items: center;
        margin-bottom: 8rpx;
        .nickname {
          font-size: 40rpx;
          font-weight: bold;
          margin-right: 8rpx;
        }
      }
      .grade {
        font-size: 24rpx;
        color: #666;
        background: rgba(0,0,0,0.05);
        padding: 4rpx 16rpx;
        border-radius: 20rpx;
      }
    }
  }
}

.menu-content {
  padding: 0 30rpx 40rpx;
  .menu-card {
    background: #fff;
    border-radius: 24rpx;
    overflow: hidden;
    margin-bottom: 30rpx;
    box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.02);
    
    .menu-icon {
      margin-right: 20rpx;
      color: #1a5f8e;
    }
    
    :deep(.wd-cell) {
      padding: 30rpx 24rpx;
    }
  }
}
</style>