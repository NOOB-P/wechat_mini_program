<template>
  <view class="recharge-container">
    <wd-toast id="wd-toast" />

    <view v-if="isLoaded && currentConfig">
      <view class="top-card" :class="currentTab === 'SVIP' ? 'svip-bg' : 'vip-bg'">
        <view class="user-info">
          <wd-img src="https://img.yzcdn.cn/vant/cat.jpeg" :width="100" :height="100" round />
          <view class="info-text">
            <text class="name">学习达人</text>
            <text class="status">{{ getStatusText() }}</text>
          </view>
        </view>
      </view>

      <view class="type-switch" v-if="vipConfigs.length > 0">
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

      <view class="privilege-section" v-if="currentPrivileges.length > 0">
        <view class="section-title">专属特权</view>
        <view class="privilege-tags">
          <view class="tag-item" v-for="(item, index) in currentPrivileges" :key="index">
            {{ item }}
          </view>
        </view>
      </view>

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

      <view class="bottom-bar">
        <view class="price-info">
          <text class="label">总计:</text>
          <text class="symbol">￥</text>
          <text class="num">{{ currentPlans[selectedPlanIndex]?.price || 0 }}</text>
        </view>
        <wd-button type="primary" custom-class="pay-btn" :class="currentTab === 'SVIP' ? 'svip-btn' : ''" @click="handlePay">
          立即开通
        </wd-button>
      </view>
    </view>

    <view v-else-if="isLoaded" class="empty-box">
      <text class="empty-title">暂无可开通套餐</text>
      <text class="empty-desc">当前学校暂未开放会员开通，请稍后再试。</text>
    </view>

    <view v-else class="loading-box">
      <wd-loading size="24px" />
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useToast } from 'wot-design-uni'
import { createVipOrderApi, getVipRechargeConfigApi, simulatePayCallbackApi } from '@/api/vip'
import { getUserInfoApi } from '@/api/mine'

const toast = useToast()
const isLoaded = ref(false)
const currentTab = ref('VIP')
const selectedPlanIndex = ref(0)
const vipConfigs = ref<any[]>([])
const urlType = ref('')
const redirecting = ref(false)

onLoad((options) => {
  uni.setNavigationBarTitle({ title: '会员充值' })
  if (options?.type) {
    urlType.value = String(options.type).toUpperCase()
  }
})

const currentConfig = computed(() => {
  return vipConfigs.value.find(config => config.tierCode === currentTab.value)
})

const getStatusText = () => {
  const userInfo = uni.getStorageSync('userInfo')
  if (userInfo?.isSvip === 1) return '您当前是 SVIP 用户'
  if (userInfo?.isVip === 1) return '您当前是 VIP 用户'
  return '未开通会员'
}

const currentPrivileges = computed(() => {
  if (!currentConfig.value?.benefits) return []
  try {
    const benefits = typeof currentConfig.value.benefits === 'string'
      ? JSON.parse(currentConfig.value.benefits)
      : currentConfig.value.benefits
    return Array.isArray(benefits) ? benefits : []
  } catch {
    return []
  }
})

const currentPlans = computed(() => {
  if (!Array.isArray(currentConfig.value?.pricings)) return []
  return currentConfig.value.pricings.map((item: any) => ({
    id: item.id,
    duration: item.pkgName,
    price: item.currentPrice,
    originalPrice: item.originalPrice,
    tag: item.pkgDesc || (item.isBestValue ? '推荐' : '')
  }))
})

watch(currentTab, () => {
  selectedPlanIndex.value = 0
})

const redirectToSchoolStatus = (configData: any) => {
  redirecting.value = true
  const schoolName = encodeURIComponent(configData?.userSchoolName || '')
  const hasBoundStudent = configData?.hasBoundStudent ? 1 : 0
  uni.redirectTo({
    url: `/subpkg_course/pages/vip/school-status?schoolName=${schoolName}&hasBoundStudent=${hasBoundStudent}`
  })
}

const fetchConfigs = async () => {
  try {
    const res = await getVipRechargeConfigApi()
    if (res.code !== 200) {
      toast.error(res.msg || '获取会员配置失败')
      isLoaded.value = true
      return
    }

    const configData = res.data || {}
    if (!configData.showRechargePage) {
      redirectToSchoolStatus(configData)
      return
    }

    vipConfigs.value = Array.isArray(configData.vipConfigs) ? configData.vipConfigs : []
    if (vipConfigs.value.length > 0) {
      const matchedConfig = vipConfigs.value.find(item => item.tierCode === urlType.value)
      if (matchedConfig) {
        currentTab.value = matchedConfig.tierCode
      } else {
        if (urlType.value) {
          redirectToSchoolStatus(configData)
          return
        }
        currentTab.value = vipConfigs.value[0].tierCode
      }
    }
  } catch (error: any) {
    toast.error(error?.msg || '获取会员配置失败')
  } finally {
    if (!redirecting.value) {
      isLoaded.value = true
    }
  }
}

onMounted(() => {
  fetchConfigs()
})

const handlePay = async () => {
  const selectedPlan = currentPlans.value[selectedPlanIndex.value]
  if (!selectedPlan || !currentConfig.value) return

  toast.loading('正在创建订单...')
  try {
    const res = await createVipOrderApi({
      packageType: currentConfig.value.title,
      tierCode: currentConfig.value.tierCode,
      period: selectedPlan.duration,
      price: selectedPlan.price,
      pricingId: selectedPlan.id
    })

    if (res.code !== 200) {
      toast.error(res.msg || '创建订单失败')
      return
    }

    const orderNo = res.data.orderNo
    toast.loading('正在调起支付...')

    setTimeout(async () => {
      const payRes = await simulatePayCallbackApi(orderNo)
      if (payRes.code !== 200) {
        toast.error(payRes.msg || '支付处理失败')
        return
      }

      const userRes = await getUserInfoApi()
      if (userRes.code === 200) {
        uni.setStorageSync('userInfo', userRes.data)
      }

      toast.success('开通成功')
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }, 1500)
  } catch (error) {
    console.error('pay vip failed', error)
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

      .name {
        font-size: 36rpx;
        font-weight: bold;
      }

      .status {
        font-size: 24rpx;
        opacity: 0.8;
      }
    }
  }
}

.type-switch {
  position: relative;
  z-index: 2;
  display: flex;
  margin: -40rpx 40rpx 0;
  overflow: hidden;
  border-radius: 16rpx;
  background: #fff;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);

  .switch-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
    padding: 30rpx 0;
    font-size: 30rpx;
    font-weight: bold;
    color: #666;
    transition: all 0.3s;

    .icon {
      font-size: 36rpx;
    }

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

.section-title {
  margin-bottom: 30rpx;
  padding-left: 20rpx;
  border-left: 8rpx solid #1a5f8e;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.privilege-section,
.plan-section {
  margin-top: 20rpx;
  background: #fff;
  padding: 40rpx;
}

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

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 120rpx;
  background: #fff;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
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

.loading-box,
.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
  text-align: center;
}

.loading-text {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #999;
}

.empty-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #222;
}

.empty-desc {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #999;
}
</style>
