<template>
  <view class="pay-container">
    <wd-toast id="wd-toast" />
    
    <view class="order-info-card">
      <view class="course-brief">
        <image :src="course.cover" mode="aspectFill" class="cover" />
        <view class="info">
          <text class="title">{{ course.title }}</text>
          <text class="price">￥{{ course.price }}</text>
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
      <wd-radio-group v-model="payMethod" cell>
        <wd-radio value="mock">
          <view class="method-item">
            <wd-icon name="undertake" size="20px" color="#1a5f8e" />
            <text class="method-name">模拟支付 (测试用)</text>
          </view>
        </wd-radio>
        <wd-radio value="wechat" disabled>
          <view class="method-item">
            <wd-icon name="wechat" size="20px" color="#07c160" />
            <text class="method-name">微信支付 (暂未对接)</text>
          </view>
        </wd-radio>
      </wd-radio-group>
    </view>

    <view class="bottom-bar">
      <view class="total">
        <text>合计：</text>
        <text class="amount">￥{{ order.price }}</text>
      </view>
      <wd-button type="primary" block @click="handlePay" :loading="loading">立即支付</wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCourseDetailApi, payMockApi } from '@/api/course'
import { useToast } from 'wot-design-uni'

const toast = useToast()
const loading = ref(false)
const payMethod = ref('mock')
const order = ref<any>({})
const course = ref<any>({})

onLoad((options: any) => {
  if (options.order) {
    order.value = JSON.parse(decodeURIComponent(options.order))
    loadCourseDetail(order.value.courseId)
  }
})

const loadCourseDetail = async (id: string) => {
  try {
    const res = await getCourseDetailApi(id)
    if (res.code === 200) {
      course.value = res.data
    }
  } catch (e) {
    console.error(e)
  }
}

const handlePay = async () => {
  if (payMethod.value !== 'mock') {
    toast.info('暂不支持该支付方式')
    return
  }

  loading.value = true
  try {
    toast.loading('支付中...')
    const res = await payMockApi(order.value.orderNo)
    if (res.code === 200) {
      toast.success('支付成功')
      setTimeout(() => {
        uni.redirectTo({
          url: '/subpkg_mine/pages/mine/order-list?tab=course'
        })
      }, 1500)
    } else {
      toast.error(res.msg || '支付失败')
    }
  } catch (e) {
    toast.error('网络错误')
  } finally {
    loading.value = false
  }
}

const formatTime = (time: string) => {
  if (!time) return ''
  return time.replace('T', ' ').substring(0, 19)
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
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  
  .course-brief {
    display: flex;
    gap: 20rpx;
    padding-bottom: 30rpx;
    border-bottom: 1rpx solid #eee;
    margin-bottom: 30rpx;
    
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
      
      .title {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
      }
      
      .price {
        font-size: 32rpx;
        color: #ff5252;
        font-weight: bold;
      }
    }
  }
  
  .order-detail {
    .detail-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16rpx;
      font-size: 26rpx;
      
      .label { color: #999; }
      .value { color: #333; }
    }
  }
}

.pay-methods {
  .section-title {
    font-size: 28rpx;
    color: #666;
    margin-bottom: 20rpx;
    display: block;
    padding-left: 10rpx;
  }
  
  .method-item {
    display: flex;
    align-items: center;
    gap: 16rpx;
    
    .method-name {
      font-size: 28rpx;
      color: #333;
    }
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -4rpx 12rpx rgba(0,0,0,0.05);
  
  .total {
    font-size: 28rpx;
    color: #333;
    
    .amount {
      font-size: 36rpx;
      color: #ff5252;
      font-weight: bold;
    }
  }
  
  :deep(.wd-button) {
    width: 240rpx;
  }
}
</style>
