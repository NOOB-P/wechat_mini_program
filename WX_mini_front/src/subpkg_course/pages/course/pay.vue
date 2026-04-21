<template>
  <view class="pay-container">
    <wd-toast id="wd-toast" />

    <view class="order-info-card">
      <view class="course-brief">
        <image v-if="order.type !== 'VIP'" :src="course.cover" mode="aspectFill" class="cover" />
        <view v-else class="vip-icon-box">
          <wd-icon :name="order.tierCode === 'SVIP' ? 'diamond' : 'sketch'" size="32px" color="#fff" />
        </view>
        <view class="info">
          <text class="title">{{ order.type === 'VIP' ? order.title : course.title }}</text>
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
        <text>合计： </text>
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
import { createCoursePayApi, getCourseDetailApi, confirmCourseVirtualPayApi } from '@/api/course'
import { createVipPayApi } from '@/api/vip'
import { getUserInfoApi } from '@/api/mine'
import { ensureWechatPayBound, requestWechatPaymentByType } from '@/utils/wechat-pay'

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
  if (order.value.type !== 'VIP') {
    loadCourseDetail(order.value.courseId)
  }
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

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const confirmCourseVirtualPayWithRetry = async (orderNo: string, security: Record<string, any>) => {
  for (let index = 0; index < 3; index += 1) {
    try {
      const res = await confirmCourseVirtualPayApi(orderNo, security)
      if (res.code === 200) {
        return res
      }
    } catch (error) {
      if (index === 2) {
        throw {
          code: 'PAY_CONFIRM_FAILED',
          msg: '支付已完成，但订单状态同步失败，请稍后刷新订单列表'
        }
      }
      await wait(800)
    }
  }
}

const fetchPayParams = async () => {
  const isVip = order.value.type === 'VIP'
  const payApi = isVip ? createVipPayApi : createCoursePayApi

  try {
    return await payApi(order.value.orderNo)
  } catch (error: any) {
    if (error?.code === 40101) {
      await ensureWechatPayBound()
      return payApi(order.value.orderNo)
    }
    throw error
  }
}

const refreshUserInfo = async () => {
  try {
    const res = await getUserInfoApi()
    if (res.code === 200) {
      uni.setStorageSync('userInfo', res.data)
    }
  } catch (error) {
    console.error('refresh user info failed', error)
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
    const paymentType = payRes.data?.paymentType
    const payParams = payRes.data?.payParams || {}

    await requestWechatPaymentByType(paymentType, payParams)

    if (paymentType === 'VIRTUAL') {
      try {
        await confirmCourseVirtualPayWithRetry(order.value.orderNo, payRes.data?.security || {})
      } catch (confirmError) {
        console.warn('Course pay confirm failed, relying on backend notify', confirmError)
        toast.show('支付成功，正在解锁课程...')
        await wait(2000)
      }
    }

    if (order.value.type === 'VIP') {
      await refreshUserInfo()
    }

    toast.success('支付成功')
    setTimeout(() => {
      if (order.value.type === 'VIP') {
        uni.switchTab({ url: '/pages/home/index' })
      } else {
        uni.redirectTo({
          url: '/subpkg_mine/pages/mine/order-list?tab=course'
        })
      }
    }, 1200)
  } catch (error: any) {
    if (error?.code === 'PAY_CANCEL') {
      toast.show('已取消支付')
      return
    }
    if (error?.code === 'PAY_CONFIRM_FAILED') {
      toast.error(error.msg)
      return
    }
    toast.error(error?.msg || error?.message || '支付失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const formatTime = (time?: string) => {
  if (!time) {
    return ''
  }
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
  width: 140rpx;
  height: 140rpx;
  border-radius: 12rpx;
  margin-right: 24rpx;
}

.vip-icon-box {
  width: 140rpx;
  height: 140rpx;
  border-radius: 12rpx;
  margin-right: 24rpx;
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  display: flex;
  justify-content: center;
  align-items: center;
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
