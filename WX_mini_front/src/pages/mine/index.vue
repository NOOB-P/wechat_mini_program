<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getMineNotificationsApi, getUserInfoApi } from '@/api/mine'
import { resolveAvatarSrc } from '@/utils/avatar'

const userInfo = reactive({
  uid: 0,
  avatar: 'https://img.yzcdn.cn/vant/cat.jpeg',
  nickname: '',
  grade: '',
  role: 'normal',
  roleName: '普通用户',
  isVip: 0,
  isSvip: 0
})

const notificationCount = ref(0)

const menuGroup1 = [
  { label: '我的课程', icon: 'books', value: 'courses' },
  { label: '已购订单', icon: 'cart', value: 'purchased' },
  { label: '我的收藏', icon: 'star', value: 'favorites' },
  { label: '学习记录', icon: 'time', value: 'history' }
]

const menuGroup2 = [
  { label: '个人设置', icon: 'setting', value: 'settings' },
  { label: '帮助与客服', icon: 'chat', value: 'service' },
  { label: '关于我们', icon: 'info-circle', value: 'about' }
]

const notificationBadgeText = computed(() => {
  if (notificationCount.value <= 0) {
    return ''
  }
  return notificationCount.value > 99 ? '99+' : String(notificationCount.value)
})

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

const handleMenuClick = (item: any) => {
  const type = item.value
  if (type === 'courses') {
    uni.navigateTo({ url: '/subpkg_mine/pages/mine/course-list?type=course' })
  } else if (type === 'purchased') {
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

const goToNotifications = () => {
  uni.navigateTo({ url: '/subpkg_mine/pages/mine/notifications' })
}

const getNotificationStorageKey = () => {
  return `mine_notification_last_read_${userInfo.uid || 'guest'}`
}

const getLastReadAt = () => {
  const value = Number(uni.getStorageSync(getNotificationStorageKey()) || 0)
  return Number.isNaN(value) ? 0 : value
}

const parseTimeToMs = (time?: string) => {
  if (!time) {
    return 0
  }
  return new Date(time.replace(/-/g, '/')).getTime() || 0
}

const loadNotificationSummary = async () => {
  try {
    const res = await getMineNotificationsApi(20)
    if (res.code === 200) {
      const list = Array.isArray(res.data) ? res.data : []
      const lastReadAt = getLastReadAt()
      notificationCount.value = list.filter((item: any) => parseTimeToMs(item.time) > lastReadAt).length
    } else {
      notificationCount.value = 0
    }
  } catch (error) {
    console.error('获取通知列表失败:', error)
    notificationCount.value = 0
  }
}

const loadPageData = async () => {
  await getUserInfo()
  await loadNotificationSummary()
}

onShow(() => {
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.reLaunch({ url: '/pages/login/index' })
  } else {
    loadPageData()
  }
})
</script>

<template>
  <view class="mine-container">
    <view class="header-bg"></view>

    <view class="header-content">
      <view class="nav-bar">
        <view class="notice-entry" @click="goToNotifications">
          <wd-icon name="notification" size="24px" class="notice-icon" />
          <view v-if="notificationCount > 0" class="notice-badge">{{ notificationBadgeText }}</view>
        </view>
      </view>

      <view class="user-info-section" @click="handleEditProfile">
        <wd-img :width="64" :height="64" round :src="userInfo.avatar" class="user-avatar" />
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

    <view class="menu-content">
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

    .notice-entry {
      width: 72rpx;
      height: 72rpx;
      border-radius: 999rpx;
      background: rgba(255, 255, 255, 0.86);
      box-shadow: 0 10rpx 30rpx rgba(48, 112, 156, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      backdrop-filter: blur(10rpx);
    }

    .notice-icon {
      color: #2d5872;
    }

    .notice-badge {
      position: absolute;
      top: -8rpx;
      right: -6rpx;
      min-width: 34rpx;
      height: 34rpx;
      padding: 0 8rpx;
      border-radius: 999rpx;
      background: linear-gradient(135deg, #ff6b6b 0%, #ff3b30 100%);
      color: #fff;
      font-size: 20rpx;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8rpx 18rpx rgba(255, 59, 48, 0.28);
    }
  }

  .user-info-section {
    display: flex;
    align-items: center;
    margin-top: 20rpx;

    .user-avatar {
      border: 4rpx solid #fff;
      box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
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
          background-color: rgba(0, 0, 0, 0.05);
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
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.02);

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
