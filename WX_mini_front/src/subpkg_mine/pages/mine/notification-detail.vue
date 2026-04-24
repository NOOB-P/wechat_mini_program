<template>
  <view class="detail-page" v-if="detail">
    <view class="status-bar"></view>

    <view class="detail-card" :class="'level-' + (detail.level || 'info')">
      <view class="detail-meta">
        <view class="meta-left">
          <text class="detail-tag">{{ getCategoryLabel(detail.category) }}</text>
          <text class="level-badge" v-if="detail.level && detail.level !== 'info'">{{ getLevelText(detail.level) }}</text>
        </view>
        <text class="detail-time">{{ detail.time }}</text>
      </view>

      <text class="detail-title">{{ detail.title }}</text>

      <view class="detail-content">{{ detail.content }}</view>
    </view>

    <view class="detail-actions">
      <view class="primary-btn" @click="handleBack">
        <text>返回通知列表</text>
      </view>
      <view class="secondary-btn" v-if="detail.actionPath" @click="handleAction">
        <text>{{ detail.actionText || '立即前往' }}</text>
      </view>
    </view>
  </view>

  <view v-else class="empty-page">
    <view class="empty-card">
      <text class="empty-title">通知内容不存在</text>
      <text class="empty-desc">这条通知可能已经失效，请返回列表重新查看。</text>
      <view class="primary-btn" @click="handleBack">
        <text>返回通知列表</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

interface NotificationDetail {
  id: string
  category: string
  level: string
  title: string
  content: string
  time: string
  actionText?: string
  actionPath?: string
}

const NOTIFICATION_DETAIL_STORAGE_KEY = 'mine_notification_detail'
const detail = ref<NotificationDetail | null>(null)

const getCategoryLabel = (category?: string) => {
  switch (category) {
    case 'score':
      return '学习通知'
    case 'course':
      return '课程通知'
    case 'vip':
    case 'expire':
      return '会员通知'
    case 'print':
    case 'delivery':
      return '订单通知'
    default:
      return '系统通知'
  }
}

const getLevelText = (level: string) => {
  switch (level) {
    case 'warning': return '警告'
    case 'error': return '紧急'
    default: return '普通'
  }
}

const handleBack = () => {
  uni.navigateBack()
}

const handleAction = () => {
  if (!detail.value?.actionPath) {
    return
  }
  uni.navigateTo({ url: detail.value.actionPath as any })
}

onLoad(() => {
  const storedDetail = uni.getStorageSync(NOTIFICATION_DETAIL_STORAGE_KEY) as NotificationDetail | undefined
  if (!storedDetail || !storedDetail.id) {
    detail.value = null
    return
  }
  detail.value = storedDetail
})
</script>

<style lang="scss" scoped>
.detail-page,
.empty-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f3f7ff 0%, #f7f8fb 100%);
  padding: 0 28rpx 48rpx;
  box-sizing: border-box;
}

.status-bar {
  height: var(--status-bar-height);
}

.detail-card,
.empty-card {
  background: #fff;
  border-radius: 32rpx;
  padding: 36rpx 32rpx;
  box-shadow: 0 16rpx 40rpx rgba(47, 84, 235, 0.06);
}

.detail-card {
  margin-top: 24rpx;
}

.detail-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 24rpx;

  .meta-left {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }
}

.detail-tag {
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(47, 84, 235, 0.08);
  color: #2f54eb;
  font-size: 24rpx;
  font-weight: 600;
}

.level-badge {
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: bold;
}

// 详情页配色
.detail-card {
  border-left: 10rpx solid transparent;
  
  &.level-warning {
    border-left-color: #faad14;
    .level-badge {
      background: rgba(250, 173, 20, 0.1);
      color: #faad14;
    }
  }

  &.level-error {
    border-left-color: #ff4d4f;
    .level-badge {
      background: rgba(255, 77, 79, 0.1);
      color: #ff4d4f;
    }
  }

  &.level-info {
    border-left-color: #2f54eb;
  }
}

.detail-time {
  color: #999;
  font-size: 24rpx;
}

.detail-title {
  display: block;
  font-size: 38rpx;
  line-height: 1.5;
  color: #1f2329;
  font-weight: 700;
  margin-bottom: 28rpx;
}

.detail-content {
  font-size: 30rpx;
  line-height: 1.9;
  color: #4e5969;
  white-space: pre-wrap;
  word-break: break-all;
}

.detail-actions {
  margin-top: 28rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.primary-btn,
.secondary-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 92rpx;
  border-radius: 24rpx;
  font-size: 30rpx;
  font-weight: 600;
}

.primary-btn {
  background: #2f54eb;
  color: #fff;
}

.secondary-btn {
  background: #fff;
  color: #2f54eb;
  border: 2rpx solid rgba(47, 84, 235, 0.18);
}

.empty-page {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-card {
  width: 100%;
  text-align: center;
}

.empty-title {
  display: block;
  font-size: 34rpx;
  color: #1f2329;
  font-weight: 700;
  margin-bottom: 18rpx;
}

.empty-desc {
  display: block;
  font-size: 28rpx;
  color: #86909c;
  line-height: 1.7;
  margin-bottom: 36rpx;
}
</style>
