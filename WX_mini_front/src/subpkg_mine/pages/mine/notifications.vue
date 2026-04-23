<template>
  <view class="notification-page">
    <!-- 顶部状态栏占位 -->
    <view class="status-bar"></view>
    
    <view class="page-header">
      <view class="header-main">
        <view class="title-group">
          <text class="title-text">消息通知</text>
          <view class="unread-dot" v-if="unreadCount > 0">{{ unreadCount }}</view>
        </view>
        <view class="header-actions" v-if="notifications.length > 0" @click="handleMarkAllRead">
          <wd-icon name="check-outline" size="18px" />
          <text>全部已读</text>
        </view>
      </view>
      
      <!-- 分类切换 -->
      <view class="category-tabs">
        <view 
          v-for="tab in categories" 
          :key="tab.value"
          class="tab-item"
          :class="{ active: currentCategory === tab.value }"
          @click="currentCategory = tab.value"
        >
          <text>{{ tab.label }}</text>
          <view class="active-line" v-if="currentCategory === tab.value"></view>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="content-scroll">
      <view v-if="filteredNotifications.length" class="notification-list">
        <view v-for="(group, date) in groupedNotifications" :key="date" class="date-group">
          <view class="date-header">
            <view class="date-line"></view>
            <text class="date-text">{{ formatGroupDate(date) }}</text>
            <view class="date-line"></view>
          </view>
          
          <view
            v-for="item in group"
            :key="item.id"
            class="msg-card"
            :class="{ 'is-new': item.isNew }"
            @click="handleNotificationClick(item)"
          >
            <view class="msg-content">
              <view class="msg-top">
                <text class="msg-title">{{ item.title }}</text>
                <text class="msg-time">{{ formatTimeOnly(item.time) }}</text>
              </view>
              <text class="msg-body">{{ item.content }}</text>
              <view class="msg-footer">
                <view class="action-btn" @click.stop="handleViewDetail(item)">
                  <text>查看详细</text>
                  <wd-icon name="arrow-right" size="12px" />
                </view>
              </view>
            </view>
            
            <view class="new-indicator" v-if="item.isNew"></view>
          </view>
        </view>
      </view>

      <view v-else class="empty-state">
        <image src="/static/images/empty_msg.png" mode="aspectFit" class="empty-img" />
        <text class="empty-tip">暂无相关通知消息</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getMineNotificationsApi, getUserInfoApi, markNotificationReadApi, markAllNotificationsReadApi } from '@/api/mine'

interface NotificationItem {
  id: string
  category: string
  level: string
  title: string
  content: string
  time: string
  actionText?: string
  actionPath?: string
  isNew?: boolean
}

const NOTIFICATION_DETAIL_STORAGE_KEY = 'mine_notification_detail'
const DETAIL_PAGE_URL = '/subpkg_mine/pages/mine/notification-detail'
const notifications = ref<NotificationItem[]>([])
const currentUid = ref<string | number>('guest')
const currentCategory = ref('all')

const categories = [
  { label: '全部', value: 'all' },
  { label: '学习', value: 'study' },
  { label: '订单', value: 'order' },
  { label: '系统', value: 'system' }
]

const unreadCount = computed(() => notifications.value.filter(item => item.isNew).length)

const filteredNotifications = computed(() => {
  if (currentCategory.value === 'all') return notifications.value
  
  return notifications.value.filter(item => {
    if (currentCategory.value === 'study') return ['score', 'course'].includes(item.category)
    if (currentCategory.value === 'order') return ['print', 'delivery', 'vip'].includes(item.category)
    if (currentCategory.value === 'system') return !['score', 'course', 'print', 'delivery', 'vip'].includes(item.category)
    return true
  })
})

const groupedNotifications = computed(() => {
  const groups: Record<string, NotificationItem[]> = {}
  filteredNotifications.value.forEach(item => {
    const date = item.time.split(' ')[0]
    if (!groups[date]) groups[date] = []
    groups[date].push(item)
  })
  return groups
})

const loadNotifications = async () => {
  try {
    const userRes = await getUserInfoApi()
    if (userRes.code === 200) {
      currentUid.value = userRes.data?.uid || 'guest'
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }

  try {
    const notificationRes = await getMineNotificationsApi(50)

    if (notificationRes.code === 200) {
      notifications.value = (Array.isArray(notificationRes.data) ? notificationRes.data : []).map((item: NotificationItem) => ({
        ...item,
        isNew: !!item.isNew
      }))
    } else {
      notifications.value = []
    }
  } catch (error) {
    console.error('获取通知失败:', error)
    notifications.value = []
  }
}

const handleMarkAllRead = async () => {
  try {
    const res = await markAllNotificationsReadApi()
    if (res.code === 200) {
      notifications.value = notifications.value.map(item => ({ ...item, isNew: false }))
      uni.showToast({ title: '已全部标为已读', icon: 'none' })
    }
  } catch (error) {
    console.error('标记全部已读失败:', error)
  }
}

const markNotificationAsRead = async (item: NotificationItem) => {
  if (item.isNew) {
    item.isNew = false
    try {
      markNotificationReadApi(item.id).catch(err => {
        console.error('标记已读失败:', err)
      })
    } catch (error) {
      console.error('处理已读逻辑出错:', error)
    }
  }
}

const openNotificationDetail = async (item: NotificationItem) => {
  await markNotificationAsRead(item)
  uni.setStorageSync(NOTIFICATION_DETAIL_STORAGE_KEY, item)
  uni.navigateTo({ url: DETAIL_PAGE_URL as any })
}

const handleNotificationClick = async (item: NotificationItem) => {
  await openNotificationDetail(item)
}

const handleViewDetail = async (item: NotificationItem) => {
  await openNotificationDetail(item)
}

const formatGroupDate = (dateStr: string) => {
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  
  if (dateStr === today) return '今天'
  if (dateStr === yesterday) return '昨天'
  return dateStr.replace(/-/g, '/')
}

const formatTimeOnly = (timeStr: string) => {
  if (!timeStr) return ''
  return timeStr.split(' ')[1]?.slice(0, 5) || ''
}
onShow(() => {
  loadNotifications()
})
</script>

<style lang="scss" scoped>
.notification-page {
  min-height: 100vh;
  background: #f4f7fa;
  display: flex;
  flex-direction: column;
}

.status-bar {
  height: var(--status-bar-height);
  background: #fff;
}

.page-header {
  background: #fff;
  padding: 30rpx 40rpx 0;
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.02);
  z-index: 10;

  .header-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40rpx;
  }

  .title-group {
    display: flex;
    align-items: center;
    gap: 12rpx;

    .title-text {
      font-size: 44rpx;
      font-weight: 800;
      color: #1a1a1a;
      letter-spacing: 2rpx;
    }

    .unread-dot {
      background: #ff4d4f;
      color: #fff;
      font-size: 22rpx;
      font-weight: bold;
      padding: 2rpx 14rpx;
      border-radius: 20rpx;
      box-shadow: 0 4rpx 10rpx rgba(255, 77, 79, 0.3);
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 6rpx;
    font-size: 26rpx;
    color: #666;
    background: #f5f5f5;
    padding: 10rpx 24rpx;
    border-radius: 30rpx;
    transition: all 0.2s;

    &:active {
      background: #eee;
      transform: scale(0.95);
    }
  }

  .category-tabs {
    display: flex;
    gap: 60rpx;
    padding-bottom: 20rpx;

    .tab-item {
      position: relative;
      font-size: 30rpx;
      color: #999;
      font-weight: 500;
      padding: 10rpx 0;

      &.active {
        color: #1a1a1a;
        font-weight: 700;
      }

      .active-line {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 32rpx;
        height: 6rpx;
        background: #2f54eb;
        border-radius: 4rpx;
      }
    }
  }
}

.content-scroll {
  flex: 1;
  height: 0;
}

.notification-list {
  padding: 20rpx 30rpx 40rpx;
}

.date-group {
  margin-bottom: 50rpx;

  .date-header {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 40rpx;
    margin-bottom: 36rpx;

    .date-line {
      flex: 1;
      height: 2rpx;
      background: rgba(0, 0, 0, 0.05);
    }

    .date-text {
      font-size: 22rpx;
      color: #999;
      font-weight: 600;
      padding: 0 24rpx;
      letter-spacing: 1rpx;
    }
  }
}

.msg-card {
  background: #ffffff;
  border-radius: 40rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  display: flex;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.02);
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.03);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &:active {
    transform: scale(0.985);
    background: #fafafa;
  }

  &.is-new {
    box-shadow: 0 16rpx 48rpx rgba(47, 84, 235, 0.08);
    border-color: rgba(47, 84, 235, 0.05);
  }

  .msg-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .msg-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12rpx;

    .msg-title {
      font-size: 36rpx;
      font-weight: 700;
      color: #1a1a1a;
      line-height: 1.3;
      padding-right: 20rpx;
    }

    .msg-time {
      font-size: 22rpx;
      color: #bfbfbf;
      white-space: nowrap;
      margin-top: 8rpx;
    }
  }

  .msg-body {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
    margin-bottom: 24rpx;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
  }

  .msg-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: auto;

    .action-btn {
      display: flex;
      align-items: center;
      gap: 4rpx;
      font-size: 24rpx;
      color: #2f54eb;
      font-weight: 700;
      background: rgba(47, 84, 235, 0.04);
      padding: 10rpx 28rpx;
      border-radius: 99rpx;
      transition: all 0.2s;

      &:active {
        background: rgba(47, 84, 235, 0.1);
        transform: scale(0.96);
      }
    }
  }

  .new-indicator {
    position: absolute;
    top: 32rpx;
    left: 12rpx;
    width: 14rpx;
    height: 14rpx;
    background: #ff4d4f;
    border-radius: 50%;
    border: 3rpx solid #fff;
    box-shadow: 0 2rpx 8rpx rgba(255, 77, 79, 0.3);
  }
}

.empty-state {
  padding-top: 240rpx;
  display: flex;
  flex-direction: column;
  align-items: center;

  .empty-img {
    width: 320rpx;
    height: 320rpx;
    margin-bottom: 40rpx;
    opacity: 0.5;
  }

  .empty-tip {
    font-size: 28rpx;
    color: #999;
    font-weight: 500;
  }
}
</style>
