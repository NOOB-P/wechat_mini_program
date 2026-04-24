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

      <view v-if="vipConfigs.length > 0" class="type-switch">
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

      <view v-if="currentPrivileges.length > 0" class="privilege-section">
        <view class="section-title">专属特权</view>
        <view class="privilege-tags">
          <view v-for="(item, index) in currentPrivileges" :key="index" class="tag-item">
            {{ item }}
          </view>
        </view>
      </view>

      <view v-if="currentPlans.length > 0" class="plan-section">
        <view class="section-title">选择套餐</view>
        <view class="plan-grid">
          <view
            v-for="(plan, index) in currentPlans"
            :key="plan.id || index"
            class="plan-item"
            :class="{ active: selectedPlanIndex === index }"
            @click="selectedPlanIndex = index"
          >
            <view v-if="plan.tag" class="tag">{{ plan.tag }}</view>
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
          <text class="label">合计:</text>
          <text class="symbol">￥</text>
          <text class="num">{{ currentPlans[selectedPlanIndex]?.price || 0 }}</text>
        </view>
        <wd-button
          type="primary"
          custom-class="pay-btn"
          :class="currentTab === 'SVIP' ? 'svip-btn' : ''"
          :loading="submitting"
          @click="handlePay"
        >
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

import {
  confirmVipVirtualPayApi,
  createVipOrderApi,
  createVipPayApi,
  getVipRechargeConfigApi
} from '@/api/vip'
import {
  PAYMENT_WECHAT_BIND_OPTIONS,
  refreshWechatUserInfo,
  runWithWechatBindGuard
} from '@/utils/wechat-bind'
import { requestWechatPaymentByType } from '@/utils/wechat-pay'

const toast = useToast()
const isLoaded = ref(false)
const submitting = ref(false)
const currentTab = ref('VIP')
const selectedPlanIndex = ref(0)
const vipConfigs = ref<any[]>([])
const urlType = ref('')
const redirectSource = ref('')
const redirecting = ref(false)

const redirectAfterSuccess = () => {
  setTimeout(() => {
    if (redirectSource.value === 'score') {
      uni.navigateBack({ delta: 1 })
      return
    }
    uni.switchTab({ url: '/pages/home/index' })
  }, 1200)
}

onLoad((options) => {
  uni.setNavigationBarTitle({ title: '会员充值' })
  if (options?.type) {
    urlType.value = String(options.type).toUpperCase()
  }
  if (options?.redirect) {
    redirectSource.value = options.redirect
  }
})

const currentConfig = computed(() => vipConfigs.value.find(config => config.tierCode === currentTab.value))

const currentPrivileges = computed(() => {
  if (!currentConfig.value?.benefits) {
    return []
  }
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
  if (!Array.isArray(currentConfig.value?.pricings)) {
    return []
  }
  return currentConfig.value.pricings.map((item: any) => ({
    id: item.id,
    duration: item.pkgName,
    durationMonths: item.durationMonths,
    price: item.currentPrice,
    originalPrice: item.originalPrice,
    tag: item.pkgDesc || (item.isBestValue ? '推荐' : '')
  }))
})

watch(currentTab, () => {
  selectedPlanIndex.value = 0
})

const getStatusText = () => {
  const userInfo = uni.getStorageSync('userInfo')
  if (userInfo?.isSvip === 1) {
    return '您当前是 SVIP 用户'
  }
  if (userInfo?.isVip === 1) {
    return '您当前是 VIP 用户'
  }
  return '暂未开通会员'
}

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
      } else if (urlType.value) {
        redirectToSchoolStatus(configData)
        return
      } else {
        currentTab.value = vipConfigs.value[0].tierCode
      }
    }
  } catch (error: any) {
    // API 错误已在 request.ts 中通过 uni.showToast 提示，此处不再重复使用 toast.error
  } finally {
    if (!redirecting.value) {
      isLoaded.value = true
    }
  }
}

onMounted(() => {
  fetchConfigs()
})

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const refreshUserInfoAfterPay = async () => {
  for (let index = 0; index < 3; index += 1) {
    try {
      await refreshWechatUserInfo()
      return
    } catch (error) {
      console.error('refresh user info failed', error)
    }
    await wait(800)
  }
}

const confirmVipVirtualPayWithRetry = async (orderNo: string, security: Record<string, any>) => {
  for (let index = 0; index < 3; index += 1) {
    try {
      return await confirmVipVirtualPayApi(orderNo, security)
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

const handlePay = async () => {
  const selectedPlan = currentPlans.value[selectedPlanIndex.value]
  if (!selectedPlan || !currentConfig.value || submitting.value) {
    return
  }

  try {
    const { createRes, payRes } = await runWithWechatBindGuard(async () => {
      submitting.value = true
      const createRes = await createVipOrderApi({
        packageType: currentConfig.value.title,
        tierCode: currentConfig.value.tierCode,
        period: selectedPlan.duration,
        durationMonths: selectedPlan.durationMonths,
        price: selectedPlan.price,
        pricingId: selectedPlan.id
      })
      const orderNo = createRes?.data?.orderNo
      if (!orderNo) {
        throw new Error(createRes?.msg || '会员订单创建失败')
      }
      const payRes = await createVipPayApi(orderNo)
      return { createRes, payRes }
    }, PAYMENT_WECHAT_BIND_OPTIONS)
    const orderNo = createRes?.data?.orderNo
    if (!orderNo) {
      throw new Error(createRes?.msg || '会员订单创建失败')
    }
    await requestWechatPaymentByType(payRes.data?.paymentType, payRes.data?.payParams || {})

    if (payRes.data?.paymentType === 'VIRTUAL' || payRes.data?.paymentType === 'FREE') {
      try {
        await confirmVipVirtualPayWithRetry(orderNo, payRes.data?.security || {})
      } catch (confirmError) {
        console.warn('Payment confirm failed, relying on backend notify', confirmError)
        toast.show('支付已提交，会员状态更新中...')
        await wait(2000)
      }
    }

    await refreshUserInfoAfterPay()
    toast.success('开通成功')
    redirectAfterSuccess()
  } catch (error: any) {
    if (error?.code === 'WECHAT_BIND_CANCELLED' || error?.code === 'WECHAT_BIND_REQUIRED') {
      return
    }
    if (error?.code === 'PAY_CANCEL') {
      toast.show('已取消支付')
      return
    }
    if (error?.code === 'PAY_CONFIRM_FAILED') {
      uni.showToast({ title: error.msg, icon: 'none' })
      return
    }
    console.error('pay vip failed', error)
    // API 错误已在 request.ts 中通过 uni.showToast 提示，此处不再重复使用 toast.error
  } finally {
    submitting.value = false
  }
}
</script>

<style src="./recharge.scss" lang="scss" scoped></style>
