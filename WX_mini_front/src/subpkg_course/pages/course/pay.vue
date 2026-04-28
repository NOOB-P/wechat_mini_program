<template>
  <view class="pay-container">
    <wd-toast id="wd-toast" />

    <view class="order-info-card">
      <view class="course-brief">
        <image v-if="order.type === 'course'" :src="course.cover" mode="aspectFill" class="cover" />
        <view v-else-if="order.type === 'VIP'" class="vip-icon-box">
          <wd-icon :name="order.tierCode === 'SVIP' ? 'diamond' : 'sketch'" size="32px" color="#fff" />
        </view>
        <view v-else class="print-icon-box">
          <wd-icon name="print" size="32px" color="#1a5f8e" />
        </view>
        <view class="info">
          <text class="title">{{ order.type === 'course' ? course.title : order.title }}</text>
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

import { cancelCourseOrderApi, confirmCourseVirtualPayApi, createCoursePayApi, getCourseDetailApi } from '@/api/course'
import { cancelVipOrderApi, confirmVipVirtualPayApi, createVipPayApi } from '@/api/vip'
import { confirmPrintVirtualPayApi, createPrintPayApi } from '@/api/order'
import {
  PAYMENT_WECHAT_BIND_OPTIONS,
  refreshWechatUserInfo,
  runWithWechatBindGuard,
  syncWechatSessionKey
} from '@/utils/wechat-bind'
import { requestWechatPaymentByType } from '@/utils/wechat-pay'

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
  order.value.type = options.type === 'vip' ? 'VIP' : options.type === 'print' ? 'print' : 'course'
  if (order.value.type === 'course') {
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

const getOrderTab = () => {
  return order.value.type === 'VIP' ? 'vip' : order.value.type === 'print' ? 'print' : 'course'
}

const redirectToOrderList = () => {
  uni.redirectTo({
    url: `/subpkg_mine/pages/mine/order-list?tab=${getOrderTab()}`
  })
}

const cancelClosedVirtualOrder = async () => {
  if (!order.value?.orderNo) {
    return
  }

  if (order.value.type === 'VIP') {
    await cancelVipOrderApi(order.value.orderNo, { silent: true })
    return
  }

  if (order.value.type === 'course') {
    await cancelCourseOrderApi(order.value.orderNo, { silent: true })
  }
}

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
          msg: '支付已完成，但课程订单状态同步失败，请稍后刷新订单列表'
        }
      }
      await wait(800)
    }
  }
}

const confirmVipVirtualPayWithRetry = async (orderNo: string, security: Record<string, any>) => {
  for (let index = 0; index < 3; index += 1) {
    try {
      const res = await confirmVipVirtualPayApi(orderNo, security)
      if (res.code === 200) {
        return res
      }
    } catch (error) {
      if (index === 2) {
        throw {
          code: 'PAY_CONFIRM_FAILED',
          msg: '支付已完成，但会员状态同步失败，请稍后刷新页面'
        }
      }
      await wait(800)
    }
  }
}

const confirmPrintVirtualPayWithRetry = async (orderNo: string, security: Record<string, any>) => {
  for (let index = 0; index < 3; index += 1) {
    try {
      const res = await confirmPrintVirtualPayApi(orderNo, security)
      if (res.code === 200) {
        return res
      }
    } catch (error) {
      if (index === 2) {
        throw {
          code: 'PAY_CONFIRM_FAILED',
          msg: '支付已完成，但打印订单状态同步失败，请稍后刷新订单列表'
        }
      }
      await wait(800)
    }
  }
}

const fetchPayParams = async () => {
  const payApi =
    order.value.type === 'VIP'
      ? createVipPayApi
      : order.value.type === 'print'
        ? createPrintPayApi
        : createCoursePayApi
  return runWithWechatBindGuard(async () => {
    loading.value = true
    await syncWechatSessionKey()
    return await payApi(order.value.orderNo)
  }, PAYMENT_WECHAT_BIND_OPTIONS)
}

const refreshUserInfo = async () => {
  try {
    await refreshWechatUserInfo()
  } catch (error) {
    console.error('refresh user info failed', error)
  }
}

const handlePay = async () => {
  if (!order.value?.orderNo) {
    toast.error('订单信息无效')
    return
  }

  let currentPaymentType = ''

  try {
    const payRes = await fetchPayParams()
    const paymentType = payRes.data?.paymentType
    currentPaymentType = paymentType
    const payParams = payRes.data?.payParams || {}
    await requestWechatPaymentByType(paymentType, payParams)

    if (paymentType === 'VIRTUAL' || paymentType === 'FREE') {
      try {
        if (order.value.type === 'VIP') {
          await confirmVipVirtualPayWithRetry(order.value.orderNo, payRes.data?.security || {})
        } else if (order.value.type === 'print') {
          await confirmPrintVirtualPayWithRetry(order.value.orderNo, payRes.data?.security || {})
        } else {
          await confirmCourseVirtualPayWithRetry(order.value.orderNo, payRes.data?.security || {})
        }
      } catch (confirmError) {
        console.warn('Pay confirm failed, relying on backend notify', confirmError)
        toast.show('支付成功，正在同步状态...')
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
        return
      }

      if (order.value.type === 'print') {
        uni.redirectTo({
          url: '/subpkg_mine/pages/mine/order-list?tab=print'
        })
        return
      }

      uni.redirectTo({
        url: '/subpkg_mine/pages/mine/order-list?tab=course'
      })
    }, 1200)
  } catch (error: any) {
    if (error?.code === 'WECHAT_BIND_CANCELLED' || error?.code === 'WECHAT_BIND_REQUIRED') {
      return
    }
    if (error?.code === 'ORDER_CLOSED') {
      toast.show('支付已超时或失败，订单已保存至待支付列表')
      setTimeout(() => {
        redirectToOrderList()
      }, 1000)
      return
    }
    if (error?.code === 'PAY_CANCEL') {
      if (order.value.type === 'VIP') {
        try {
          await cancelVipOrderApi(order.value.orderNo, { silent: true })
        } catch (e) {
          console.warn('cancel vip order failed', e)
        }
        toast.show('已取消支付')
        setTimeout(() => {
          uni.navigateBack()
        }, 1000)
        return
      }
      if (order.value.type === 'print') {
        toast.show('已取消支付')
        setTimeout(() => {
          uni.navigateBack()
        }, 1000)
        return
      }
      toast.show('已取消支付，订单已保存至待支付列表')
      setTimeout(() => {
        redirectToOrderList()
      }, 1000)
      return
    }
    if (error?.code === 'PAY_CONFIRM_FAILED') {
      uni.showToast({ title: error.msg, icon: 'none' })
      setTimeout(() => {
        redirectToOrderList()
      }, 1000)
      return
    }
    console.error('pay failed', error)
    // 其他错误也跳转到订单列表，因为订单已经创建了
    if (error?.msg) {
      uni.showToast({ title: error.msg, icon: 'none' })
      setTimeout(() => {
        redirectToOrderList()
      }, 1000)
    }
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
  padding: 30rpx;
  padding-bottom: 120rpx;
  background-color: #f8f9fa;
}

.order-info-card {
  margin-bottom: 30rpx;
  padding: 30rpx;
  background: #fff;
  border-radius: 20rpx;
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
  margin-right: 24rpx;
  border-radius: 12rpx;
}

.vip-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 140rpx;
  height: 140rpx;
  margin-right: 24rpx;
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  border-radius: 12rpx;
}

.print-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 140rpx;
  height: 140rpx;
  margin-right: 24rpx;
  background: #eef5ff;
  border-radius: 12rpx;
}

.info {
  display: flex;
  flex: 1;
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
  background: #fff;
  border-radius: 20rpx;
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
  align-items: center;
  justify-content: space-between;
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
