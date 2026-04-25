<template>
  <view class="order-list-container">
    <wd-toast id="wd-toast" />
    
    <view class="header">
      <view class="tabs-wrap">
        <view 
          v-for="tab in tabs" 
          :key="tab.value" 
          class="tab-item" 
          :class="{ active: currentTab === tab.value }"
          @click="handleTabChange(tab.value)"
        >
          <text>{{ tab.label }}</text>
          <view class="active-line" v-if="currentTab === tab.value"></view>
        </view>
      </view>
    </view>

    <view class="content">
      <!-- 已购课程列表 -->
      <view v-if="currentTab === 'course'" class="order-section animate-fade-in">
        <view v-if="courses.length > 0">
          <view v-for="item in courses" :key="item.id + (item.orderNo || '')" class="course-card" @click="handleCourseClick(item)">
            <view class="card-inner">
              <image :src="item.cover || 'https://img.yzcdn.cn/vant/cat.jpeg'" mode="aspectFill" class="course-img" />
              <view class="course-info">
                <view class="top-info">
                  <view class="title-row">
                    <text class="course-name">{{ item.title }}</text>
                    <view class="course-tag">{{ getTypeName(item.type) }}</view>
                  </view>
                  <view v-if="item.paymentStatus === 0" class="countdown-row">
                    <wd-icon name="time" size="12px" color="#f44336" />
                    <text class="countdown-text">支付倒计时: {{ item.countdownText || '计算中...' }}</text>
                  </view>
                </view>
                <view class="bottom-info">
                  <text class="price-tag" :class="{ 'pending': item.paymentStatus === 0 }">
                    {{ item.paymentStatus === 0 ? '待支付' : '已支付' }}
                  </text>
                  <view class="actions-group">
                    <view v-if="item.paymentStatus === 0" class="cancel-btn" @click.stop="handleCancelOrder(item, 'course')">
                      取消
                    </view>
                    <view class="action-link" :class="{ 'pay-btn': item.paymentStatus === 0 }">
                      <text>{{ item.paymentStatus === 0 ? '去支付' : '立即学习' }}</text>
                      <wd-icon name="arrow-right" size="14px" v-if="item.paymentStatus !== 0" />
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view v-else class="empty-state">
          <image src="https://img.yzcdn.cn/vant/empty-image-default.png" mode="aspectFit" class="empty-img" />
          <text class="empty-text">暂无已购课程数据哦~</text>
        </view>
      </view>

      <!-- 会员充值列表 -->
      <view v-if="currentTab === 'vip'" class="order-section animate-fade-in">
        <view v-if="vipOrders.length > 0">
          <view v-for="item in vipOrders" :key="item.orderNo" class="course-card" @click="handleVipClick(item)">
            <view class="card-inner">
              <view class="vip-icon-box">
                <wd-icon name="vip" size="32px" color="#f1c40f" />
              </view>
              <view class="course-info">
                <view class="top-info">
                  <view class="title-row">
                    <text class="course-name">会员充值 - {{ item.packageType }}</text>
                    <view class="course-tag vip">{{ item.period }}</view>
                  </view>
                  <view v-if="item.paymentStatus === 0" class="countdown-row">
                    <wd-icon name="time" size="12px" color="#f44336" />
                    <text class="countdown-text">支付倒计时: {{ item.countdownText || '计算中...' }}</text>
                  </view>
                </view>
                <view class="bottom-info">
                  <text class="price-tag" :class="{ 'pending': item.paymentStatus === 0 }">
                    {{ item.paymentStatus === 0 ? '待支付' : '已支付' }}
                  </text>
                  <view class="actions-group">
                    <view v-if="item.paymentStatus === 0" class="cancel-btn" @click.stop="handleCancelOrder(item, 'vip')">
                      取消
                    </view>
                    <view class="action-link" :class="{ 'pay-btn': item.paymentStatus === 0 }">
                      <text>{{ item.paymentStatus === 0 ? '去支付' : '详情' }}</text>
                      <wd-icon name="arrow-right" size="14px" v-if="item.paymentStatus !== 0" />
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view v-else class="empty-state">
          <image src="https://img.yzcdn.cn/vant/empty-image-default.png" mode="aspectFit" class="empty-img" />
          <text class="empty-text">暂无会员充值记录哦~</text>
        </view>
      </view>

      <!-- 打印记录列表 -->
      <view v-if="currentTab === 'print'" class="order-section animate-fade-in">
        <view v-if="printOrders.length > 0">
          <view v-for="item in printOrders" :key="item.orderNo" class="course-card" @click="handlePrintClick(item)">
            <view class="card-inner">
              <view class="print-icon-box">
                <wd-icon name="print" size="32px" color="#1a5f8e" />
              </view>
              <view class="course-info">
                <view class="top-info">
                  <view class="title-row">
                    <text class="course-name">{{ item.documentName }}</text>
                    <view class="course-tag print">{{ item.pages }}页</view>
                  </view>
                  <view v-if="item.orderStatus === 1" class="countdown-row">
                    <wd-icon name="time" size="12px" color="#f44336" />
                    <text class="countdown-text">支付倒计时: {{ item.countdownText || '计算中...' }}</text>
                  </view>
                </view>
                <view class="bottom-info">
                  <text class="price-tag" :class="{ 'pending': item.orderStatus === 1, 'expired': item.orderStatus === 0 }">
                    {{ getPrintStatusText(item.orderStatus) }}
                  </text>
                  <view class="actions-group">
                    <view v-if="item.orderStatus === 1" class="action-link" :class="{ 'pay-btn': item.orderStatus === 1 }">
                      <text>{{ item.orderStatus === 1 ? '去支付' : '详情' }}</text>
                      <wd-icon name="arrow-right" size="14px" v-if="item.orderStatus !== 1" />
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view v-else class="empty-state">
          <image src="https://img.yzcdn.cn/vant/empty-image-default.png" mode="aspectFit" class="empty-img" />
          <text class="empty-text">还没有打印过试卷呢~</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getPurchasedCoursesApi, getMyPrintOrdersApi, getMyVipOrdersApi } from '@/api/order'
import { cancelCourseOrderApi } from '@/api/course'
import { cancelVipOrderApi } from '@/api/vip'
import { useToast } from 'wot-design-uni'

const toast = useToast()
const currentTab = ref('course')
const tabs = [
  { label: '已购课程', value: 'course' },
  { label: '会员充值', value: 'vip' },
  { label: '打印记录', value: 'print' }
]

const courses = ref<any[]>([])
const vipOrders = ref<any[]>([])
const printOrders = ref<any[]>([])
let timer: any = null

const handleTabChange = (value: string) => {
  currentTab.value = value
  loadData()
}

const getTypeName = (type: string) => {
  switch (type) {
    case 'general': return '精品课'
    case 'sync': return '同步辅导'
    case 'family': return '家庭教育'
    default: return '课程'
  }
}

const getPrintStatusText = (status: number) => {
  switch (status) {
    case 0: return '已取消'
    case 1: return '待支付'
    case 2: return '待打印'
    case 3: return '待配送'
    case 4: return '已完成'
    default: return '未知'
  }
}

const handleCancelOrder = async (item: any, type: 'course' | 'vip' | 'print') => {
  try {
    const confirm = await new Promise((resolve) => {
      uni.showModal({
        title: '提示',
        content: '确定要取消该订单吗？',
        success: (res) => {
          if (res.confirm) resolve(true)
          else resolve(false)
        }
      })
    })

    if (!confirm) return

    let res: any
    if (type === 'course') {
      res = await cancelCourseOrderApi(item.orderNo)
    } else if (type === 'vip') {
      res = await cancelVipOrderApi(item.orderNo)
    } else {
      // 打印订单暂不支持取消接口，或者需要单独实现
      uni.showToast({ title: '暂不支持取消打印订单', icon: 'none' })
      return
    }

    if (res.code === 200) {
      uni.showToast({ title: '订单已取消' })
      loadData()
    } else {
      uni.showToast({ title: res.msg || '取消失败', icon: 'none' })
    }
  } catch (error) {
    console.error('取消订单失败', error)
  }
}

const startCountdown = () => {
  stopCountdown()
  timer = setInterval(() => {
    const now = new Date().getTime()
    let hasActiveCountdown = false

    // 处理课程订单
    courses.value = courses.value.map(item => {
      if (item.paymentStatus === 0 && item.orderCreateTime) {
        const createTime = new Date(item.orderCreateTime.replace('T', ' ')).getTime()
        const expireTime = createTime + 10 * 60 * 1000
        const remaining = expireTime - now
        if (remaining <= 0) return null
        const minutes = Math.floor(remaining / 1000 / 60)
        const seconds = Math.floor((remaining / 1000) % 60)
        item.countdownText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
        hasActiveCountdown = true
      }
      return item
    }).filter(item => item !== null)

    // 处理 VIP 订单
    vipOrders.value = vipOrders.value.map(item => {
      if (item.paymentStatus === 0 && item.createTime) {
        const createTime = new Date(item.createTime.replace('T', ' ')).getTime()
        const expireTime = createTime + 10 * 60 * 1000
        const remaining = expireTime - now
        if (remaining <= 0) return null
        const minutes = Math.floor(remaining / 1000 / 60)
        const seconds = Math.floor((remaining / 1000) % 60)
        item.countdownText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
        hasActiveCountdown = true
      }
      return item
    }).filter(item => item !== null)

    // 处理打印订单
    printOrders.value = printOrders.value.map(item => {
      if (item.orderStatus === 1 && item.createTime) {
        const createTime = new Date(item.createTime.replace('T', ' ')).getTime()
        const expireTime = createTime + 10 * 60 * 1000
        const remaining = expireTime - now
        if (remaining <= 0) return null
        const minutes = Math.floor(remaining / 1000 / 60)
        const seconds = Math.floor((remaining / 1000) % 60)
        item.countdownText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
        hasActiveCountdown = true
      }
      return item
    }).filter(item => item !== null)

    if (!hasActiveCountdown) {
      // 如果没有正在进行的倒计时，但不一定停止，因为后续可能会加载新数据
    }
  }, 1000)
}

const stopCountdown = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const loadData = async () => {
  try {
    if (currentTab.value === 'course') {
      const res = await getPurchasedCoursesApi()
      if (res.code === 200) {
        courses.value = res.data
      }
    } else if (currentTab.value === 'vip') {
      const res = await getMyVipOrdersApi()
      if (res.code === 200) {
        vipOrders.value = res.data
      }
    } else {
      const res = await getMyPrintOrdersApi()
      if (res.code === 200) {
        printOrders.value = res.data
      }
    }
    startCountdown()
  } catch (e) {
    console.error('加载失败', e)
  }
}

const handleVipClick = (item: any) => {
  if (item.paymentStatus === 0) {
    const orderData = encodeURIComponent(JSON.stringify({
      orderNo: item.orderNo,
      price: item.price,
      title: `会员充值 - ${item.packageType}`,
      packageType: item.packageType,
      period: item.period,
      createTime: item.createTime
    }))
    uni.navigateTo({
      url: `/subpkg_course/pages/course/pay?order=${orderData}&type=vip`
    })
  } else {
    uni.showToast({ title: '会员订单已支付', icon: 'none' })
  }
}

const handlePrintClick = (item: any) => {
  if (item.orderStatus === 1) {
    const orderData = encodeURIComponent(JSON.stringify({
      orderNo: item.orderNo,
      price: item.totalPrice,
      title: `试卷打印 - ${item.documentName}`,
      createTime: item.createTime
    }))
    uni.navigateTo({
      url: `/subpkg_course/pages/course/pay?order=${orderData}&type=print`
    })
  } else {
    uni.showToast({ title: '请查看打印订单详情', icon: 'none' })
  }
}

const handleCourseClick = (item: any) => {
  if (item.paymentStatus === 0) {
    // 如果是待支付，跳转到支付页面
    const orderData = encodeURIComponent(JSON.stringify({
      orderNo: item.orderNo,
      price: item.price,
      courseId: item.id,
      title: item.title,
      createTime: item.orderCreateTime
    }))
    uni.navigateTo({
      url: `/subpkg_course/pages/course/pay?order=${orderData}`
    })
  } else {
    // 已支付，跳转到详情页
    uni.navigateTo({
      url: `/subpkg_course/pages/course/detail?id=${item.id}`
    })
  }
}

const formatTime = (time: string) => {
  if (!time) return ''
  return time.replace('T', ' ').substring(0, 16)
}

onLoad((options: any) => {
  if (options.tab) {
    currentTab.value = options.tab
  }
  if (options.type === 'purchased') {
    currentTab.value = 'course'
  }
  uni.setNavigationBarTitle({
    title: '已购订单'
  })
})

onShow(() => {
  loadData()
})

onUnmounted(() => {
  stopCountdown()
})
</script>

<style lang="scss" scoped>
.order-list-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.header {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: 10rpx 30rpx 0;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.02);
  
  .tabs-wrap {
    display: flex;
    align-items: center;
    gap: 60rpx;
    
    .tab-item {
      padding: 24rpx 0;
      font-size: 30rpx;
      color: #7a8ba6;
      position: relative;
      flex-shrink: 0;
      transition: all 0.3s;
      
      &.active {
        color: #1a5f8e;
        font-weight: bold;
        transform: scale(1.05);
      }
      
      .active-line {
        position: absolute;
        bottom: 4rpx;
        left: 20%;
        right: 20%;
        height: 6rpx;
        background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
        border-radius: 10rpx;
      }
    }
  }
}

.content {
  position: relative;
  z-index: 1;
  padding: 30rpx;
}

/* 课程卡片样式 */
.course-card {
  background-color: #fff;
  border-radius: 24rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(26, 95, 142, 0.04);
  transition: all 0.3s;

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }

  .card-inner {
    display: flex;
    padding: 24rpx;
    gap: 24rpx;
  }

  .course-img, .vip-icon-box, .print-icon-box {
    width: 160rpx;
    height: 160rpx;
    border-radius: 16rpx;
    flex-shrink: 0;
  }

  .vip-icon-box {
    background: #fff9db;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .print-icon-box {
    background: #eef5ff;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .course-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 4rpx 0;

    .top-info {
      .title-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8rpx;
      }

      .course-name {
        font-size: 30rpx;
        font-weight: 600;
        color: #2c3e50;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        overflow: hidden;
        flex: 1;
        margin-right: 12rpx;
      }

      .course-tag {
        display: inline-block;
        font-size: 22rpx;
        color: #1a5f8e;
        background: rgba(26, 95, 142, 0.08);
        padding: 4rpx 16rpx;
        border-radius: 8rpx;
        font-weight: 500;
        flex-shrink: 0;
      }

      .countdown-row {
        display: flex;
        align-items: center;
        gap: 8rpx;
        margin-top: 4rpx;

        .countdown-text {
          font-size: 22rpx;
          color: #f44336;
          font-weight: 500;
        }
      }
    }

    .bottom-info {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .price-tag {
        font-size: 24rpx;
        color: #4caf50;
        font-weight: 500;

        &.pending {
          color: #ff9800;
        }
      }

      .actions-group {
        display: flex;
        align-items: center;
        gap: 16rpx;
      }

      .cancel-btn {
        font-size: 24rpx;
        color: #999;
        padding: 8rpx 24rpx;
        border-radius: 100rpx;
        border: 1rpx solid #ddd;
        background: #fff;
        font-weight: 500;
      }

      .action-link {
        display: flex;
        align-items: center;
        font-size: 24rpx;
        color: #1a5f8e;
        font-weight: 600;

        &.pay-btn {
          color: #fff;
          background: linear-gradient(90deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%);
          padding: 8rpx 24rpx;
          border-radius: 100rpx;
          box-shadow: 0 4rpx 12rpx rgba(255, 154, 158, 0.3);
        }
        
        text {
          margin-right: 4rpx;
        }
      }
    }
  }
}

/* 打印卡片样式 */
.print-card {
  background-color: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(26, 95, 142, 0.04);
  
  .print-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 20rpx;
    border-bottom: 2rpx solid #f8f9fa;
    margin-bottom: 24rpx;
    
    .order-id-box {
      display: flex;
      align-items: center;
      gap: 8rpx;
      
      .order-no {
        font-size: 24rpx;
        color: #999;
        font-family: monospace;
      }
    }
    
    .order-status {
      font-size: 24rpx;
      font-weight: 600;
      padding: 4rpx 16rpx;
      border-radius: 100rpx;
      
      &.status-1 { color: #f6d365; background: rgba(246, 211, 101, 0.1); } // 待支付
      &.status-2 { color: #1a5f8e; background: rgba(26, 95, 142, 0.1); } // 待打印
      &.status-3 { color: #4facfe; background: rgba(79, 172, 254, 0.1); } // 待配送
      &.status-4 { color: #4caf50; background: rgba(76, 175, 80, 0.1); } // 已完成
      &.status-0 { color: #999; background: rgba(153, 153, 153, 0.1); }    // 已取消
    }
  }
  
  .print-body {
    .doc-info {
      display: flex;
      align-items: center;
      gap: 20rpx;
      margin-bottom: 24rpx;
      
      .doc-icon {
        width: 64rpx;
        height: 64rpx;
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        border-radius: 16rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .doc-name {
        font-size: 28rpx;
        font-weight: 600;
        color: #2c3e50;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    
    .print-details {
      background: #f8f9fa;
      border-radius: 16rpx;
      padding: 20rpx;
      margin-bottom: 24rpx;
      
      .detail-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12rpx;
        
        &:last-child { margin-bottom: 0; }
        
        .label {
          font-size: 24rpx;
          color: #7a8ba6;
        }
        .value {
          font-size: 24rpx;
          color: #2c3e50;
          font-weight: 500;
        }
      }
    }
    
    .print-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .order-time {
        font-size: 24rpx;
        color: #aab4c3;
      }
      
      .total-price {
        display: flex;
        align-items: baseline;
        color: #f44336;
        
        .currency {
          font-size: 22rpx;
          font-weight: bold;
        }
        .price-num {
          font-size: 36rpx;
          font-weight: bold;
        }
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
  
  .empty-text {
    margin-top: 24rpx;
    color: #aab4c3;
    font-size: 28rpx;
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
