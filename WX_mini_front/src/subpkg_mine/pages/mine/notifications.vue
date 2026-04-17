<template>
  <view class="notification-page">
    <view class="hero-card">
      <view class="hero-copy">
        <text class="hero-title">消息中心</text>
        <text class="hero-desc">成绩发布、课程购买、会员到期、打印配送等提醒，都会集中显示在这里。</text>
      </view>
      <view class="hero-pill">
        <text class="hero-pill-count">{{ unreadCount }}</text>
        <text class="hero-pill-text">条未读</text>
      </view>
    </view>

    <view v-if="notifications.length" class="notification-list">
      <view
        v-for="item in notifications"
        :key="item.id"
        class="notification-card"
        :class="[`level-${item.level}`, { unread: item.isNew }]"
        @click="handleNotificationClick(item)"
      >
        <view class="accent-line"></view>
        <view class="card-body">
          <view class="card-head">
            <view class="head-left">
              <view class="category-chip" :class="`chip-${item.category}`">{{ getCategoryLabel(item.category) }}</view>
              <text class="card-title">{{ item.title }}</text>
              <text v-if="item.isNew" class="new-tag">NEW</text>
            </view>
            <text class="card-time">{{ formatDisplayTime(item.time) }}</text>
          </view>

          <text class="card-content">{{ item.content }}</text>

          <view class="card-foot">
            <text class="action-text">{{ item.actionText || '查看详情' }}</text>
            <wd-icon name="arrow-right" size="14px" color="#7a8ba6" />
          </view>
        </view>
      </view>
    </view>

    <view v-else class="empty-wrap">
      <Empty tip="暂时还没有通知提醒" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getMineNotificationsApi, getUserInfoApi } from '@/api/mine'
import Empty from '@/components/Empty/index.vue'

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

const notifications = ref<NotificationItem[]>([])
const currentUid = ref<string | number>('guest')

const unreadCount = computed(() => notifications.value.filter(item => item.isNew).length)

const loadNotifications = async () => {
  try {
    const userRes = await getUserInfoApi()

    if (userRes.code === 200) {
      currentUid.value = userRes.data?.uid || 'guest'
    }

    const lastReadAt = getLastReadAt()
    const notificationRes = await getMineNotificationsApi(50)

    if (notificationRes.code === 200) {
      notifications.value = (Array.isArray(notificationRes.data) ? notificationRes.data : []).map((item: NotificationItem) => ({
        ...item,
        isNew: parseTimeToMs(item.time) > lastReadAt
      }))
      markAsRead()
    } else {
      notifications.value = []
    }
  } catch (error) {
    console.error('获取通知失败:', error)
    notifications.value = []
  }
}

const handleNotificationClick = (item: NotificationItem) => {
  if (!item.actionPath) {
    return
  }
  uni.navigateTo({
    url: item.actionPath
  })
}

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'score':
      return '成绩'
    case 'course':
      return '课程'
    case 'vip':
      return '会员'
    case 'expire':
      return '到期'
    case 'print':
      return '打印'
    case 'delivery':
      return '配送'
    default:
      return '通知'
  }
}

const getStorageKey = () => {
  return `mine_notification_last_read_${currentUid.value || 'guest'}`
}

const getLastReadAt = () => {
  const value = Number(uni.getStorageSync(getStorageKey()) || 0)
  return Number.isNaN(value) ? 0 : value
}

const markAsRead = () => {
  uni.setStorageSync(getStorageKey(), Date.now())
}

const parseTimeToMs = (time?: string) => {
  if (!time) {
    return 0
  }
  return new Date(time.replace(/-/g, '/')).getTime() || 0
}

const formatDisplayTime = (time?: string) => {
  if (!time) {
    return ''
  }
  return time.slice(5, 16)
}

onShow(() => {
  loadNotifications()
})
</script>

<style lang="scss" scoped>
.notification-page {
  min-height: 100vh;
  padding: 24rpx 24rpx 40rpx;
  background:
    radial-gradient(circle at top right, rgba(121, 191, 255, 0.18), transparent 34%),
    linear-gradient(180deg, #f4fbff 0%, #f7f8fa 36%, #f7f8fa 100%);
}

.hero-card {
  padding: 30rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #204d68 0%, #3e7ca3 55%, #8fd6ff 100%);
  box-shadow: 0 18rpx 44rpx rgba(45, 88, 114, 0.2);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
  margin-bottom: 24rpx;

  .hero-copy {
    flex: 1;
    min-width: 0;
  }

  .hero-title {
    display: block;
    font-size: 38rpx;
    font-weight: 700;
    color: #fff;
    margin-bottom: 10rpx;
  }

  .hero-desc {
    font-size: 24rpx;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.84);
  }

  .hero-pill {
    min-width: 136rpx;
    padding: 18rpx 18rpx 16rpx;
    border-radius: 22rpx;
    background: rgba(255, 255, 255, 0.14);
    text-align: center;
    backdrop-filter: blur(8rpx);
  }

  .hero-pill-count {
    display: block;
    font-size: 40rpx;
    font-weight: 800;
    color: #fff;
    line-height: 1;
  }

  .hero-pill-text {
    margin-top: 8rpx;
    display: block;
    font-size: 22rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.notification-card {
  position: relative;
  display: flex;
  overflow: hidden;
  border-radius: 26rpx;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10rpx 30rpx rgba(39, 84, 112, 0.07);

  &.unread {
    transform: translateY(-2rpx);
    box-shadow: 0 16rpx 38rpx rgba(39, 84, 112, 0.12);
  }

  .accent-line {
    width: 10rpx;
    background: linear-gradient(180deg, #4facfe 0%, #00c6ff 100%);
    flex-shrink: 0;
  }

  &.level-success .accent-line {
    background: linear-gradient(180deg, #53d769 0%, #20bf55 100%);
  }

  &.level-warning .accent-line {
    background: linear-gradient(180deg, #ffb347 0%, #ff8c42 100%);
  }

  &.level-danger .accent-line {
    background: linear-gradient(180deg, #ff7b7b 0%, #ff4d6d 100%);
  }

  .card-body {
    flex: 1;
    padding: 24rpx 24rpx 22rpx;
  }

  .card-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20rpx;
  }

  .head-left {
    flex: 1;
    min-width: 0;
  }

  .category-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6rpx 14rpx;
    border-radius: 999rpx;
    font-size: 20rpx;
    font-weight: 700;
    margin-bottom: 14rpx;
    background: rgba(79, 172, 254, 0.12);
    color: #2f7fc1;
  }

  .chip-score {
    background: rgba(104, 109, 224, 0.12);
    color: #4b56d2;
  }

  .chip-course {
    background: rgba(83, 215, 105, 0.12);
    color: #1b9b42;
  }

  .chip-vip,
  .chip-expire {
    background: rgba(255, 179, 71, 0.15);
    color: #cf7b1f;
  }

  .chip-print,
  .chip-delivery {
    background: rgba(32, 191, 85, 0.12);
    color: #178045;
  }

  .card-title {
    display: inline;
    font-size: 30rpx;
    font-weight: 700;
    color: #263746;
    line-height: 1.5;
  }

  .new-tag {
    display: inline-flex;
    margin-left: 12rpx;
    padding: 4rpx 10rpx;
    border-radius: 999rpx;
    font-size: 18rpx;
    font-weight: 800;
    color: #fff;
    background: linear-gradient(135deg, #ff6b6b 0%, #ff3b30 100%);
    vertical-align: top;
  }

  .card-time {
    flex-shrink: 0;
    font-size: 22rpx;
    color: #92a1b0;
    margin-top: 6rpx;
  }

  .card-content {
    margin-top: 16rpx;
    display: block;
    font-size: 25rpx;
    line-height: 1.75;
    color: #607080;
  }

  .card-foot {
    margin-top: 18rpx;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8rpx;
  }

  .action-text {
    font-size: 23rpx;
    font-weight: 600;
    color: #607d8b;
  }
}

.empty-wrap {
  padding-top: 180rpx;
}
</style>
