<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getUserInfoApi } from '@/api/mine'
import { resolveAvatarSrc } from '@/utils/avatar'

// 用户信息
const userInfo = reactive({
  avatar: 'https://img.yzcdn.cn/vant/cat.jpeg', // 设置默认头像
  nickname: '',
  grade: '',
  role: 'normal',
  roleName: '普通用户',
  isVip: 0,
  isSvip: 0
})

// 菜单组一
const menuGroup1 = [
  { label: '我的课程', icon: 'books', value: 'courses' },
  { label: '已购订单', icon: 'cart', value: 'purchased' },
  { label: '我的收藏', icon: 'star', value: 'favorites' },
  { label: '学习记录', icon: 'time', value: 'history' }
]

// 菜单组二
const menuGroup2 = [
  { label: '个人设置', icon: 'setting', value: 'settings' },
  { label: '帮助与客服', icon: 'chat', value: 'service' },
  { label: '关于我们', icon: 'info-circle', value: 'about' }
]

// 获取用户信息
const getUserInfo = async () => {
  try {
    const res = await getUserInfoApi()
    if (res.code === 200) {
      const updatedData = { ...res.data }
      if (updatedData.avatar) {
        updatedData.avatar = resolveAvatarSrc(updatedData.avatar)
      } else {
        delete updatedData.avatar
      }
      Object.assign(userInfo, updatedData)
      
      // 处理 VIP/SVIP 逻辑
      userInfo.isVip = res.data.isVip || 0
      userInfo.isSvip = res.data.isSvip || 0
      
      if (userInfo.isSvip) {
        userInfo.role = 'svip'
        userInfo.roleName = 'SVIP会员'
      } else if (userInfo.isVip) {
        userInfo.role = 'vip'
        userInfo.roleName = 'VIP会员'
      } else {
        userInfo.role = 'normal'
        userInfo.roleName = '普通用户'
      }
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
  const type = item.value
  console.log('Menu clicked:', type)
  if (type === 'courses') {
    uni.navigateTo({ url: '/subpkg_mine/pages/mine/course-list?type=course' })
  } else if (type === 'purchased') {
    console.log('Navigating to order-list')
    uni.navigateTo({ url: '/subpkg_mine/pages/mine/order-list' })
  } else if (type === 'favorites') {
    uni.navigateTo({ url: '/subpkg_mine/pages/mine/course-list?type=collection' })
  } else if (type === 'history') {
    uni.navigateTo({ url: '/subpkg_mine/pages/mine/course-list?type=record' })
  } else if (type === 'settings') {
    uni.navigateTo({ url: '/subpkg_mine/pages/mine/settings/index' })
  } else if (type === 'service') {
    uni.navigateTo({ url: '/subpkg_mine/pages/service/index' })
  } else {
    uni.showToast({ title: `点击了${item.label}`, icon: 'none' })
  }
}

const handleEditProfile = () => {
  uni.navigateTo({ url: '/subpkg_mine/pages/mine/edit-profile' })
}

const goToVip = () => {
  uni.navigateTo({ url: '/subpkg_course/pages/vip/recharge' })
}
</script>

<template>
  <view class="mine-container">
    <!-- 头部背景渐变 -->
    <view class="header-bg"></view>

    <!-- 头部用户信息 -->
    <view class="header-content">
      <view class="nav-bar">
        <!-- <wd-icon name="notification" size="24px" class="notice-icon" /> -->
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
          <view class="tags-row">
            <text class="grade">{{ userInfo.grade }}</text>
            <view class="vip-tag" :class="userInfo.role" @click.stop="goToVip">
              <wd-icon :name="userInfo.role === 'svip' ? 'crown' : 'vip'" size="14px" />
              <text class="vip-text">{{ userInfo.roleName }}</text>
            </view>
          </view>
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
  background: linear-gradient(135deg, #d4f9f2 0%, #eef5ff 100%);
  opacity: 0.8;
}

.header-content {
    position: relative;
    z-index: 1;
    padding: 0 40rpx 40rpx;

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
        margin-bottom: 12rpx;
        
        .nickname {
          font-size: 40rpx;
          font-weight: bold;
          color: #333;
          margin-right: 12rpx;
        }
      }
      
      .tags-row {
        display: flex;
        align-items: center;
        gap: 16rpx;

        .grade {
          display: inline-block;
          padding: 4rpx 16rpx;
          background-color: rgba(0,0,0,0.05);
          border-radius: 20rpx;
          font-size: 24rpx;
          color: #666;
        }

        .vip-tag {
          display: flex;
          align-items: center;
          padding: 4rpx 16rpx;
          border-radius: 20rpx;
          
          &.vip {
            background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
            box-shadow: 0 4rpx 10rpx rgba(253, 160, 133, 0.3);
            color: #fff;
          }
          
          &.svip {
            background: linear-gradient(135deg, #333333 0%, #1a1a1a 100%);
            box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.3);
            color: #f6d365;
          }
          
          &.normal {
            background: #eee;
            color: #999;
          }
          
          .vip-text {
            font-size: 22rpx;
            font-weight: bold;
            margin-left: 4rpx;
          }
        }
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
