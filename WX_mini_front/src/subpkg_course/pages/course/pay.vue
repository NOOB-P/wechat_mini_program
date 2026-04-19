<template>
  <view class="pay-container">
    <wd-toast id="wd-toast" />

    <view class="order-info-card">
      <view class="course-brief">
        <image :src="course.cover" mode="aspectFill" class="cover" />
        <view class="info">
          <text class="title">{{ course.title }}</text>
          <text class="price">￥{{ order.price }}</text>
        </view>
      </view>

      <view class="order-detail">
        <view class="detail-item">
          <text class="label">订单编号</text>
          <text class="value">{{ order.orderNo }}</text>
        </view>
        <view class="detail-item">
          <text class="label">下单时间</text>
          <text class="value">{{ formatTime(order.createTime) }}</text>
        </view>
      </view>
    </view>

    <view class="pay-methods">
      <text class="section-title">支付方式</text>
      <view class="method-item">
        <wd-icon name="wechat" size="20px" color="#07c160" />
        <text class="method-name">微信支付</text>
      </view>
    </view>

    <view class="bottom-bar">
      <view class="total">
        <text>合计：</text>
        <text class="amount">￥{{ order.price }}</text>
      </view>
      <wd-button type="primary" block :loading="loading" @click="handlePay">立即支付</wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useToast } from 'wot-design-uni'
import { createCoursePayApi, getCourseDetailApi } from '@/api/course'
import { ensureWechatPayBound, requestWechatPay } from '@/utils/wechat-pay'

const toast = useToast()
const loading = ref(false)
const order = ref<any>({})
const course = ref<any>({})

onLoad((options: any) => {
  if (!options.order) {
    toast.error('订单信息缺失')
    return
  }
  order.value = JSON.parse(decodeURIComponent(options.order))
  loadCourseDetail(order.value.courseId)
})

const loadCourseDetail = async (id: string) => {
  try {
    const res = await getCourseDetailApi(id)
    if (res.code === 200) {
      course.value = res.data || {}
    }
  } catch (error) {
    console.error('load course detail failed', error)
  }
}

const fetchPayParams = async () => {
  try {
    return await createCoursePayApi(order.value.orderNo)
  } catch (error: any) {
    if (error?.code === 40101) {
      await ensureWechatPayBound()
      return createCoursePayApi(order.value.orderNo)
    }
    throw error
  }
}

const handlePay = async () => {
  if (!order.value?.orderNo) {
    toast.error('订单信息无效')
    return
  }

  loading.value = true
  try {
    toast.loading('正在准备支付...')
    await ensureWechatPayBound()
    const payRes = await fetchPayParams()
    await requestWechatPay(payRes.data?.payParams || {})
    toast.success('支付成功')
    setTimeout(() => {
      uni.redirectTo({
        url: '/subpkg_mine/pages/mine/order-list?tab=course'
      })
    }, 1200)
  } catch (error: any) {
    if (error?.code === 'PAY_CANCEL') {
      toast.show('已取消支付')
      return
    }
    toast.error(error?.msg || error?.message || '支付失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const formatTime = (time?: string) => {
  if (!time) return ''
  return time.replace('T', ' ').slice(0, 19)
}
</script>

<style lang="scss" scoped>
.pay-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 30rpx;
  padding-bottom: 120rpx;
}

.order-info-card {
  margin-bottom: 30rpx;
  padding: 30rpx;
  border-radius: 20rpx;
  background: #fff;
}

.course-brief {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
  padding-bottom: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.cover {
  width: 160rpx;
  height: 120rpx;
  border-radius: 12rpx;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.price {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff5252;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
  font-size: 26rpx;
}

.label {
  color: #999;
}

.value {
  color: #333;
}

.pay-methods {
  padding: 30rpx;
  border-radius: 20rpx;
  background: #fff;
}

.section-title {
  display: block;
  margin-bottom: 20rpx;
  padding-left: 10rpx;
  font-size: 28rpx;
  color: #666;
}

.method-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx 10rpx;
}

.method-name {
  font-size: 28rpx;
  color: #333;
}

.bottom-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 40rpx;
  background: #fff;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.total {
  font-size: 28rpx;
  color: #333;
}

.amount {
  font-size: 36rpx;
  font-weight: bold;
  color: #ff5252;
}

.bottom-bar :deep(.wd-button) {
  width: 240rpx;
}
</style>
