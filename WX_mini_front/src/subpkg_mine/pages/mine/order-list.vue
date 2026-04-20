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
      <view v-if="currentTab === 'course'" class="course-list animate-fade-in">
        <view v-if="courses.length > 0">
          <view v-for="item in courses" :key="item.id" class="course-card" @click="goToCourseDetail(item.id)">
            <view class="card-inner">
              <image :src="item.cover || 'https://img.yzcdn.cn/vant/cat.jpeg'" mode="aspectFill" class="course-img" />
              <view class="course-info">
                <view class="top-info">
                  <text class="course-name">{{ item.title }}</text>
                  <view class="course-tag">{{ getTypeName(item.type) }}</view>
                </view>
                <view class="bottom-info">
                  <text class="price-tag">已支付</text>
                  <view class="action-link">
                    <text>立即学习</text>
                    <wd-icon name="arrow-right" size="14px" />
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="empty-state" v-else>
          <wd-icon name="info-circle" size="64px" color="#e0e5ed" />
          <text class="empty-text">暂无已购课程数据哦~</text>
        </view>
      </view>

      <!-- 打印记录列表 -->
      <view v-if="currentTab === 'print'" class="print-list animate-fade-in">
        <view v-if="printOrders.length > 0">
          <view v-for="item in printOrders" :key="item.id" class="print-card">
            <view class="print-header">
              <view class="order-id-box">
                <wd-icon name="order" size="16px" color="#999" />
                <text class="order-no">{{ item.orderNo }}</text>
              </view>
              <text class="order-status" :class="'status-' + item.orderStatus">{{ getPrintStatusText(item.orderStatus) }}</text>
            </view>
            <view class="print-body">
              <view class="doc-info">
                <view class="doc-icon">
                  <wd-icon name="file" size="20px" color="#fff" />
                </view>
                <text class="doc-name">{{ item.documentName }}</text>
              </view>
              <view class="print-details">
                <view class="detail-row">
                  <text class="label">打印类型</text>
                  <text class="value">{{ item.printType }} ({{ item.pages }}页)</text>
                </view>
                <view class="detail-row">
                  <text class="label">配送方式</text>
                  <text class="value">{{ item.deliveryMethod }}</text>
                </view>
              </view>
              <view class="print-footer">
                <text class="order-time">{{ formatTime(item.createTime) }}</text>
                <view class="total-price">
                  <text class="currency">￥</text>
                  <text class="price-num">{{ item.totalPrice.toFixed(2) }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="empty-state" v-else>
          <wd-icon name="info-circle" size="64px" color="#e0e5ed" />
          <text class="empty-text">还没有打印过试卷呢~</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getPurchasedCoursesApi, getMyPrintOrdersApi } from '@/api/order'
import { useToast } from 'wot-design-uni'

const toast = useToast()
const currentTab = ref('course')
const tabs = [
  { label: '已购课程', value: 'course' },
  { label: '打印记录', value: 'print' }
]

const courses = ref<any[]>([])
const printOrders = ref<any[]>([])

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

const loadData = async () => {
  try {
    toast.loading('加载中...')
    if (currentTab.value === 'course') {
      const res = await getPurchasedCoursesApi()
      if (res.code === 200) {
        courses.value = res.data
      }
    } else {
      const res = await getMyPrintOrdersApi()
      if (res.code === 200) {
        printOrders.value = res.data
      }
    }
    toast.close()
  } catch (e) {
    toast.error('加载失败')
  }
}

const goToCourseDetail = (id: string) => {
  uni.navigateTo({
    url: `/subpkg_course/pages/course/detail?id=${id}`
  })
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

onMounted(() => {
  loadData()
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

  .course-img {
    width: 200rpx;
    height: 140rpx;
    border-radius: 16rpx;
    flex-shrink: 0;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  }

  .course-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 0;

    .top-info {
      .course-name {
        font-size: 30rpx;
        font-weight: 600;
        color: #2c3e50;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        overflow: hidden;
        margin-bottom: 12rpx;
      }

      .course-tag {
        display: inline-block;
        font-size: 22rpx;
        color: #1a5f8e;
        background: rgba(26, 95, 142, 0.08);
        padding: 4rpx 16rpx;
        border-radius: 8rpx;
        font-weight: 500;
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
      }

      .action-link {
        display: flex;
        align-items: center;
        font-size: 24rpx;
        color: #1a5f8e;
        font-weight: 600;
        
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
