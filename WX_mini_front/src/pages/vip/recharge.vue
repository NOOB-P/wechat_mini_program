<template>
  <view class="recharge-container">
    <wd-toast id="wd-toast" />
    
    <!-- 增加一个总体的 v-if 控制，确保数据加载完再渲染，避免 [渲染层错误] -->
    <view v-if="isLoaded">
      <!-- 顶部卡片：根据选中的 tab 切换背景风格 -->
      <view class="top-card" :class="currentTab === 'SVIP' ? 'svip-bg' : 'vip-bg'">
        <view class="user-info">
          <wd-img src="https://img.yzcdn.cn/vant/cat.jpeg" :width="100" :height="100" round />
          <view class="info-text">
            <text class="name">学习达人</text>
            <text class="status">{{ getStatusText() }}</text>
          </view>
        </view>
      </view>

      <!-- 充值类型切换 -->
      <view class="type-switch" v-if="vipConfigs && vipConfigs.length > 0">
        <view 
          v-for="config in vipConfigs"
          :key="config.id"
          class="switch-item" 
          :class="{ 
            active: currentTab === config.tierCode,
            'svip-active': currentTab === config.tierCode && config.tierCode === 'SVIP'
          }"
          @click="currentTab = config.tierCode"
        >
          <wd-icon :name="config.tierCode === 'SVIP' ? 'diamond' : 'sketch'" size="20px" class="icon" />
          {{ config.title }}
        </view>
      </view>

      <!-- 权益对比 (特权列表) -->
      <view class="privilege-section" v-if="currentPrivileges.length > 0">
        <view class="section-title">专属特权</view>
        <view class="privilege-tags">
          <view class="tag-item" v-for="(item, index) in currentPrivileges" :key="index">
            {{ item }}
          </view>
        </view>
      </view>

      <!-- 套餐选择 (网格布局) -->
      <view class="plan-section" v-if="currentPlans.length > 0">
        <view class="section-title">选择套餐</view>
        <view class="plan-grid">
          <view 
            v-for="(plan, index) in currentPlans" 
            :key="plan.id || index"
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
    
    <!-- 加载中状态 -->
    <view v-else class="loading-box">
      <wd-loading size="24px" />
      <text class="loading-text">加载中...</text>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useToast } from 'wot-design-uni'
import { createVipOrderApi, simulatePayCallbackApi, getVipOptionsApi } from '@/api/vip'
import { getUserInfoApi } from '@/api/mine'

const toast = useToast()
const isLoaded = ref(false)
const currentTab = ref('VIP') // 默认值，会被 onLoad 或 fetchConfigs 覆盖
const selectedPlanIndex = ref(0)
const vipConfigs = ref<any[]>([])
const urlType = ref('') // 记录从 URL 传进来的类型

onLoad((options) => {
  if (options && options.type) {
    urlType.value = options.type.toUpperCase()
  }
})

// 获取远程配置
const fetchConfigs = async () => {
  try {
    const res = await getVipOptionsApi()
    if (res.code === 200) {
      vipConfigs.value = res.data
      if (vipConfigs.value.length > 0) {
        // 优先匹配从 URL 传进来的类型，否则取第一个
        const matched = vipConfigs.value.find(c => c.tierCode === urlType.value)
        if (matched) {
          currentTab.value = matched.tierCode
        } else {
          currentTab.value = vipConfigs.value[0].tierCode
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch vip configs:', error)
  } finally {
    isLoaded.value = true
  }
}

onMounted(() => {
  fetchConfigs()
})

const currentConfig = computed(() => {
  return vipConfigs.value.find(c => c.tierCode === currentTab.value)
})

// 动态获取状态文本
const getStatusText = () => {
  const userInfo = uni.getStorageSync('userInfo')
  if (userInfo) {
    if (userInfo.isSvip === 1) return '您当前是 SVIP 用户'
    if (userInfo.isVip === 1) return '您当前是 VIP 用户'
  }
  return '未开通会员'
}

const currentPrivileges = computed(() => {
  if (!currentConfig.value || !currentConfig.value.benefits) return []
  
  let benefits = []
  try {
    benefits = typeof currentConfig.value.benefits === 'string' 
      ? JSON.parse(currentConfig.value.benefits) 
      : currentConfig.value.benefits
  } catch (e) {
    console.error('Parse benefits error:', e)
  }
  
  return Array.isArray(benefits) ? benefits : []
})

const currentPlans = computed(() => {
  if (!currentConfig.value || !currentConfig.value.pricings) return []
  return currentConfig.value.pricings.map((p: any) => ({
    id: p.id,
    duration: p.pkgName,
    price: p.currentPrice,
    originalPrice: p.originalPrice,
    tag: p.pkgDesc || (p.isBestValue ? '推荐' : '')
  }))
})

const handlePay = async () => {
  const selectedPlan = currentPlans.value[selectedPlanIndex.value]
  if (!selectedPlan) return

  const packageType = currentConfig.value?.title || '会员'
  const tierCode = currentConfig.value?.tierCode || 'VIP'
  
  toast.loading('正在创建订单...')
  
  try {
    const res = await createVipOrderApi({
      packageType,
      tierCode, // 增加 tierCode 传递
      period: selectedPlan.duration,
      price: selectedPlan.price,
      pricingId: selectedPlan.id // 传递具体套餐ID
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
      
      &.svip-active {
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

/* 权益列表 (改为标签模式) */
.privilege-section {
  padding: 40rpx;
  background: #fff;
  margin-top: 20rpx;

  .privilege-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;

    .tag-item {
      background: #f0f4f8;
      color: #1a5f8e;
      font-size: 24rpx;
      padding: 12rpx 24rpx;
      border-radius: 32rpx;
      border: 1px solid #e1e8f0;
      transition: all 0.3s;
      
      &:active {
        background: #e1e8f0;
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

.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
  
  .loading-text {
    margin-top: 20rpx;
    font-size: 28rpx;
    color: #999;
  }
}
</style>