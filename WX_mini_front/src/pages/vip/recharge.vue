<template>
  <view class="recharge-container">
    <wd-toast id="wd-toast" />
    
    <!-- 顶部卡片：根据选中的 tab 切换背景风格 -->
    <view class="top-card" :class="currentTab === 'vip' ? 'vip-bg' : 'svip-bg'">
      <view class="user-info">
        <wd-img src="https://img.yzcdn.cn/vant/cat.jpeg" :width="100" :height="100" round />
        <view class="info-text">
          <text class="name">学习达人</text>
          <text class="status">{{ getStatusText() }}</text>
        </view>
      </view>
    </view>

    <!-- 充值类型切换 -->
    <view class="type-switch">
      <view 
        class="switch-item" 
        :class="{ active: currentTab === 'vip' }"
        @click="currentTab = 'vip'"
      >
        <wd-icon name="sketch" size="20px" class="icon" />
        普通 VIP
      </view>
      <view 
        class="switch-item" 
        :class="{ active: currentTab === 'svip' }"
        @click="currentTab = 'svip'"
      >
        <wd-icon name="diamond" size="20px" class="icon" />
        超级 SVIP
      </view>
    </view>

    <!-- 权益对比 (特权列表) -->
    <view class="privilege-section">
      <view class="section-title">专属特权</view>
      <view class="privilege-list">
        <view class="p-item" v-for="(item, index) in currentPrivileges" :key="index">
          <wd-icon :name="item.icon" size="24px" class="p-icon" />
          <text class="p-text">{{ item.name }}</text>
        </view>
      </view>
    </view>

    <!-- 套餐选择 (网格布局) -->
    <view class="plan-section">
      <view class="section-title">选择套餐</view>
      <view class="plan-grid">
        <view 
          v-for="(plan, index) in currentPlans" 
          :key="index"
          class="plan-item"
          :class="{ active: selectedPlanIndex === index }"
          @click="selectedPlanIndex = index"
        >
          <view class="tag" v-if="plan.tag">{{ plan.tag }}</view>
          <view class="plan-duration">{{ plan.duration }}</view>
          <view class="plan-price">
            <text class="symbol">￥</text>
            <text class="num">{{ plan.price }}</text>
          </view>
          <view class="plan-origin">￥{{ plan.originalPrice }}</view>
        </view>
      </view>
    </view>

    <!-- 底部支付栏 -->
    <view class="bottom-bar">
      <view class="price-info">
        <text class="label">总计:</text>
        <text class="symbol">￥</text>
        <text class="num">{{ currentPlans[selectedPlanIndex]?.price || 0 }}</text>
      </view>
      <wd-button 
        type="primary" 
        custom-class="pay-btn" 
        :class="currentTab === 'svip' ? 'svip-btn' : ''"
        @click="handlePay"
      >
        立即开通
      </wd-button>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from 'wot-design-uni'
import { createVipOrderApi, simulatePayCallbackApi } from '@/api/vip'
import { getUserInfoApi } from '@/api/mine'

const toast = useToast()
const currentTab = ref('vip')
const selectedPlanIndex = ref(1) // 默认选中中间的套餐（季卡/半年卡等推荐项）

// 动态获取状态文本
const getStatusText = () => {
  const userInfo = uni.getStorageSync('userInfo')
  if (userInfo) {
    if (userInfo.isSvip === 1) return '您当前是 SVIP 用户'
    if (userInfo.isVip === 1) return '您当前是 VIP 用户'
  }
  return '未开通会员'
}

// 模拟特权数据
const vipPrivileges = [
  { icon: 'chart-bar', name: '成绩深度分析' },
  { icon: 'view-list', name: '错题集解锁' },
  { icon: 'print', name: '错题纸质打印' }
]

const svipPrivileges = [
  ...vipPrivileges,
  { icon: 'video', name: 'AI 公益课程' },
  { icon: 'time', name: 'AI 智能自习室' },
  { icon: 'star', name: '专属学习建议' }
]

const currentPrivileges = computed(() => {
  return currentTab.value === 'vip' ? vipPrivileges : svipPrivileges
})

// 模拟套餐数据
const vipPlans = [
  { duration: '月包', price: 19, originalPrice: 30, tag: '' },
  { duration: '季包', price: 45, originalPrice: 90, tag: '推荐' },
  { duration: '年包', price: 168, originalPrice: 360, tag: '省192' }
]

const svipPlans = [
  { duration: '月包', price: 49, originalPrice: 80, tag: '' },
  { duration: '季包', price: 128, originalPrice: 240, tag: '推荐' },
  { duration: '年包', price: 398, originalPrice: 960, tag: '省562' }
]

const currentPlans = computed(() => {
  return currentTab.value === 'vip' ? vipPlans : svipPlans
})

const handlePay = async () => {
  const selectedPlan = currentPlans.value[selectedPlanIndex.value]
  const packageType = currentTab.value === 'vip' ? 'VIP基础版' : 'SVIP专业版'
  
  toast.loading('正在创建订单...')
  
  try {
    const res = await createVipOrderApi({
      packageType,
      period: selectedPlan.duration,
      price: selectedPlan.price
    })
    
    if (res.code === 200) {
      const orderNo = res.data.orderNo
      toast.loading('正在调起支付...')
      
      // 模拟支付过程
      setTimeout(async () => {
        const payRes = await simulatePayCallbackApi(orderNo)
        if (payRes.code === 200) {
          // 支付成功后刷新用户信息
          const userRes = await getUserInfoApi()
          if (userRes.code === 200) {
            uni.setStorageSync('userInfo', userRes.data)
          }
          
          toast.success('开通成功！')
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          toast.error(payRes.msg || '支付处理失败')
        }
      }, 1500)
    } else {
      toast.error(res.msg || '创建订单失败')
    }
  } catch (error) {
    console.error('支付失败:', error)
    toast.error('网络错误，请稍后重试')
  }
}
</script>

<style lang="scss" scoped>
.recharge-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 120rpx;
}

/* 顶部卡片 */
.top-card {
  height: 280rpx;
  padding: 40rpx;
  color: #fff;
  transition: background 0.3s ease;
  
  &.vip-bg {
    background: linear-gradient(135deg, #1a5f8e 0%, #00897b 100%);
  }
  
  &.svip-bg {
    background: linear-gradient(135deg, #333333 0%, #1a1a1a 100%);
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 30rpx;
    margin-top: 20rpx;

    .info-text {
      display: flex;
      flex-direction: column;
      gap: 10rpx;

      .name { font-size: 36rpx; font-weight: bold; }
      .status { font-size: 24rpx; opacity: 0.8; }
    }
  }
}

/* 类型切换 */
.type-switch {
  display: flex;
  margin: -40rpx 40rpx 0;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
  position: relative;
  z-index: 2;
  overflow: hidden;

  .switch-item {
    flex: 1;
    text-align: center;
    padding: 30rpx 0;
    font-size: 30rpx;
    font-weight: bold;
    color: #666;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10rpx;
    transition: all 0.3s;

    .icon { font-size: 36rpx; }

    &.active {
      color: #1a5f8e;
      background: rgba(26, 95, 142, 0.05);
      
      // 如果是 svip 激活状态，改变高亮颜色
      &:nth-child(2) {
        color: #f6d365;
        background: rgba(246, 211, 101, 0.1);
      }
    }
  }
}

/* 模块通用标题 */
.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
  padding-left: 20rpx;
  border-left: 8rpx solid #1a5f8e;
}

/* 权益列表 */
.privilege-section {
  padding: 40rpx;
  background: #fff;
  margin-top: 20rpx;

  .privilege-list {
    display: flex;
    flex-wrap: wrap;
    gap: 40rpx 0;

    .p-item {
      width: 33.33%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16rpx;

      .p-icon {
        width: 80rpx;
        height: 80rpx;
        background: rgba(26, 95, 142, 0.1);
        color: #1a5f8e;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .p-text {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}

/* 套餐网格 */
.plan-section {
  padding: 40rpx;
  background: #fff;
  margin-top: 20rpx;

  .plan-grid {
    display: flex;
    justify-content: space-between;
    gap: 20rpx;

    .plan-item {
      flex: 1;
      border: 2rpx solid #eee;
      border-radius: 16rpx;
      padding: 40rpx 20rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      transition: all 0.3s;

      .tag {
        position: absolute;
        top: -16rpx;
        left: -2rpx;
        background: #ff5252;
        color: #fff;
        font-size: 20rpx;
        padding: 4rpx 12rpx;
        border-radius: 16rpx 0 16rpx 0;
      }

      .plan-duration {
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 20rpx;
      }

      .plan-price {
        color: #f44336;
        margin-bottom: 10rpx;
        .symbol { font-size: 24rpx; }
        .num { font-size: 48rpx; font-weight: bold; }
      }

      .plan-origin {
        font-size: 24rpx;
        color: #999;
        text-decoration: line-through;
      }

      &.active {
        background: rgba(246, 211, 101, 0.1);
        border-color: #f6d365;
        
        .plan-duration { color: #8a6d3b; }
      }
    }
  }
}

/* 底部支付栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 120rpx;
  background: #fff;
  box-shadow: 0 -4rpx 16rpx rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40rpx;
  box-sizing: border-box;
  z-index: 100;

  .price-info {
    .label { font-size: 28rpx; color: #333; margin-right: 10rpx; }
    .symbol { font-size: 24rpx; color: #f44336; }
    .num { font-size: 48rpx; color: #f44336; font-weight: bold; }
  }

  .pay-btn {
    width: 240rpx !important;
    border-radius: 40rpx !important;
    background: linear-gradient(135deg, #1a5f8e 0%, #00897b 100%) !important;
    border: none !important;

    &.svip-btn {
      background: linear-gradient(135deg, #333333 0%, #1a1a1a 100%) !important;
      color: #f6d365 !important;
    }
  }
}
</style>