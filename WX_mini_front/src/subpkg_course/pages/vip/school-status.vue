<template>
  <view class="school-status-page">
    <view class="hero-card">
      <view class="hero-badge">{{ text.heroBadge }}</view>
      <view class="hero-title">{{ heroTitle }}</view>
      <view class="hero-desc">
        <text>{{ heroDesc }}</text>
      </view>
    </view>

    <view v-if="hasBoundStudent" class="status-section">
      <view class="section-title">{{ text.openDescTitle }}</view>
      <view class="status-card active">
        <view class="status-name">{{ text.openCardTitle }}</view>
        <view class="status-copy">{{ text.openCardDesc }}</view>
      </view>

      <view class="month-card">
        <view class="month-header">
          <view class="month-title">{{ text.monthTitle }}</view>
          <view class="month-value">{{ selectedMonthText }}</view>
        </view>
        <wd-picker
          :columns="monthOptions"
          :label="text.monthPickerLabel"
          v-model="selectedMonth"
          :placeholder="text.monthPickerPlaceholder"
          align-right
          @confirm="handleMonthConfirm"
        />
        <view class="month-tip">{{ monthTip }}</view>
      </view>
    </view>

    <view class="tips-panel">
      <view class="section-title">{{ text.processTitle }}</view>
      <view class="tip-row">
        <text class="tip-index">01</text>
        <text class="tip-text">{{ text.tipOne }}</text>
      </view>
      <view class="tip-row">
        <text class="tip-index">02</text>
        <text class="tip-text">{{ text.tipTwo }}</text>
      </view>
      <view class="tip-row" v-if="schoolName">
        <text class="tip-index">03</text>
        <text class="tip-text">{{ `${text.schoolDetectedPrefix}${schoolName}` }}</text>
      </view>
    </view>

    <view class="action-bar">
      <wd-button
        v-if="!hasBoundStudent"
        type="primary"
        custom-class="action-btn primary-btn centered-btn"
        @click="goBindStudent"
      >
        {{ text.bindStudent }}
      </wd-button>
      <wd-button
        v-else
        type="primary"
        custom-class="action-btn primary-btn centered-btn"
        :loading="submitting"
        @click="handlePrimaryAction"
      >
        {{ text.submitApplication }}
      </wd-button>
    </view>

    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  import { useToast } from 'wot-design-uni'
  import { getUserInfoApi } from '@/api/mine'
  import { openSchoolVipApi } from '@/subpkg_course/api/school-status'

  const text = {
    pageTitle: '\u6821\u8baf\u901a\u72b6\u6001',
    heroBadge: 'VIP \u5f00\u901a\u63d0\u9192',
    heroTitleBound: '\u5b66\u6821\u6682\u672a\u5f00\u653e\u76f4\u63a5\u5f00\u901a',
    heroTitleUnbound: '\u8bf7\u5148\u7ed1\u5b9a\u5b66\u751f\u4fe1\u606f',
    heroDescBoundSuffix: ' \u9700\u8fdb\u5165\u6821\u8baf\u901a\u786e\u8ba4\u6d41\u7a0b\u3002',
    heroDescNoSchool: '\u5f53\u524d\u8d26\u53f7\u6682\u672a\u8bc6\u522b\u5230\u53ef\u5f00\u901a\u5b66\u6821\u3002',
    heroDescUnbound: '\u7cfb\u7edf\u6682\u672a\u83b7\u53d6\u5230\u4f60\u7684\u5b66\u6821\u4fe1\u606f\uff0c\u8bf7\u5148\u7ed1\u5b9a\u5b66\u751f\u540e\u518d\u786e\u8ba4\u662f\u5426\u5df2\u5f00\u901a\u6821\u8baf\u901a\u3002',
    openDescTitle: '\u5f00\u901a\u8bf4\u660e',
    openCardTitle: '\u6211\u8981\u5f00\u901a\u6821\u8baf\u901a',
    openCardDesc: '\u60a8\u7684\u5f00\u901a\u7533\u8bf7\u4f1a\u540c\u6b65\u5230\u6821\u8baf\u901a\u6d41\u7a0b\uff0c\u5e76\u7acb\u5373\u8d60\u9001\u5bf9\u5e94\u65f6\u957f\u7684 VIP \u6743\u76ca\u3002',
    monthTitle: '\u8d60\u9001\u65f6\u957f',
    monthPickerLabel: '\u9009\u62e9\u6708\u6570',
    monthPickerPlaceholder: '\u8bf7\u9009\u62e9\u5f00\u901a\u6708\u6570',
    monthSuffix: '\u4e2a\u6708',
    monthLabelSuffix: '\u6708',
    monthTipPrefix: '\u63d0\u4ea4\u540e\u4f1a\u7acb\u5373\u5f00\u901a ',
    monthTipMiddle: ' VIP\uff0c\u5e76\u540c\u6b65\u751f\u6210\u540e\u53f0\u8ba2\u5355\u8bb0\u5f55\u3002',
    processTitle: '\u6d41\u7a0b\u8bf4\u660e',
    tipOne: '\u63d0\u4ea4\u5f00\u901a\u7533\u8bf7\u540e\uff0c\u60a8\u7684\u4fe1\u606f\u4f1a\u540c\u6b65\u5230\u6821\u8baf\u901a\u6d41\u7a0b\u4e2d\u5904\u7406\u3002',
    tipTwo: '\u63d0\u4ea4\u6210\u529f\u540e\uff0c\u4f1a\u7acb\u5373\u8d60\u9001\u60a8\u5df2\u9009\u62e9\u65f6\u957f\u7684 VIP \u6743\u76ca\u3002',
    schoolDetectedPrefix: '\u8bc6\u522b\u5230\u5b66\u6821\uff1a',
    bindStudent: '\u53bb\u7ed1\u5b9a\u5b66\u751f',
    submitApplication: '\u63d0\u4ea4\u5f00\u901a\u7533\u8bf7',
    loading: '\u6b63\u5728\u5f00\u901a\u6821\u8baf\u901a...',
    openFailed: '\u5f00\u901a\u5931\u8d25',
    openSuccessPrefix: '\u5df2\u8d60\u9001 ',
    networkError: '\u7f51\u7edc\u9519\u8bef\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5'
  }

  const toast = useToast()
  const schoolName = ref('')
  const hasBoundStudent = ref(true)
  const selectedMonth = ref('1')
  const submitting = ref(false)
  const monthOptions = Array.from({ length: 12 }, (_, index) => ({
    label: `${index + 1}${text.monthLabelSuffix}`,
    value: String(index + 1)
  }))

  const selectedMonthText = computed(() => `${selectedMonth.value}${text.monthSuffix}`)
  const heroTitle = computed(() => (hasBoundStudent.value ? text.heroTitleBound : text.heroTitleUnbound))
  const heroDesc = computed(() => {
    if (!hasBoundStudent.value) {
      return text.heroDescUnbound
    }
    return schoolName.value ? `${schoolName.value}${text.heroDescBoundSuffix}` : text.heroDescNoSchool
  })
  const monthTip = computed(() => `${text.monthTipPrefix}${selectedMonthText.value}${text.monthTipMiddle}`)

  onLoad((options) => {
    uni.setNavigationBarTitle({ title: text.pageTitle })
    schoolName.value = options?.schoolName ? decodeURIComponent(String(options.schoolName)) : ''
    hasBoundStudent.value = String(options?.hasBoundStudent || '1') === '1'
  })

  const goBindStudent = () => {
    uni.navigateTo({ url: '/pages/auth/bind-student' })
  }

  const goBack = () => {
  uni.redirectTo({ url: '/subpkg_course/pages/vip/index' })
}

  const handleMonthConfirm = (event: any) => {
    const value = Array.isArray(event?.value) ? event.value[0] : event?.value
    if (value) {
      selectedMonth.value = String(value)
    }
  }

  const refreshUserInfo = async () => {
    const userRes = await getUserInfoApi()
    if (userRes.code === 200) {
      uni.setStorageSync('userInfo', userRes.data)
    }
  }

  const handlePrimaryAction = async () => {
    if (!hasBoundStudent.value) {
      goBindStudent()
      return
    }
    if (submitting.value) {
      return
    }

    submitting.value = true
    toast.loading(text.loading)

    try {
      const res = await openSchoolVipApi({
        months: Number(selectedMonth.value)
      })

      if (res.code !== 200) {
        toast.error(res.msg || text.openFailed)
        return
      }

      await refreshUserInfo()
      toast.success(`${text.openSuccessPrefix}${selectedMonthText.value} VIP`)

      setTimeout(() => {
        goVipPage()
      }, 1500)
    } catch (error: any) {
      console.error('open school vip failed', error)
      toast.error(error?.msg || text.networkError)
    } finally {
      submitting.value = false
    }
  }
</script>

<style lang="scss" scoped>
  .school-status-page {
    min-height: 100vh;
    padding: 36rpx 28rpx 200rpx;
    background:
      radial-gradient(circle at top right, rgba(77, 128, 240, 0.1), transparent 30%),
      linear-gradient(180deg, #f8faff 0%, #f7f8fa 42%, #ffffff 100%);
    box-sizing: border-box;
  }

  .hero-card {
    padding: 40rpx;
    border-radius: 32rpx;
    background: linear-gradient(135deg, #4d80f0 0%, #2e5bc9 100%);
    color: #fff;
    box-shadow: 0 20rpx 40rpx rgba(77, 128, 240, 0.15);
  }

  .hero-badge {
    display: inline-flex;
    padding: 8rpx 20rpx;
    border-radius: 12rpx;
    background: rgba(255, 255, 255, 0.2);
    font-size: 22rpx;
    font-weight: 500;
  }

  .hero-title {
    margin-top: 24rpx;
    font-size: 44rpx;
    font-weight: 700;
    line-height: 1.3;
  }

  .hero-desc {
    margin-top: 20rpx;
    font-size: 26rpx;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.85);
  }

  .status-section,
  .tips-panel {
    margin-top: 32rpx;
    padding: 32rpx;
    border-radius: 28rpx;
    background: #fff;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
  }

  .section-title {
    margin-bottom: 24rpx;
    font-size: 30rpx;
    font-weight: 700;
    color: #1a1a1a;
  }

  .status-card {
    border: 2rpx solid #edf2f7;
    border-radius: 24rpx;
    padding: 30rpx 26rpx;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

    &.active {
      border-color: #4d80f0;
      background: rgba(77, 128, 240, 0.04);
      transform: translateY(-2rpx);
      box-shadow: 0 8rpx 16rpx rgba(77, 128, 240, 0.08);

      .status-name {
        color: #4d80f0;
      }
    }
  }

  .status-name {
    font-size: 32rpx;
    font-weight: 600;
    color: #2d3748;
    transition: color 0.2s;
  }

  .status-copy {
    margin-top: 12rpx;
    font-size: 24rpx;
    line-height: 1.5;
    color: #718096;
  }

  .month-card {
    margin-top: 24rpx;
    padding: 28rpx 26rpx;
    border-radius: 24rpx;
    background: #f8fbff;
    border: 2rpx solid rgba(77, 128, 240, 0.12);
  }

  .month-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18rpx;
  }

  .month-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1f2d3d;
  }

  .month-value {
    font-size: 26rpx;
    font-weight: 700;
    color: #4d80f0;
  }

  .month-tip {
    margin-top: 20rpx;
    font-size: 24rpx;
    line-height: 1.6;
    color: #5b6b7f;
  }

  .tip-row {
    display: flex;
    align-items: flex-start;

    & + .tip-row {
      margin-top: 20rpx;
    }
  }

  .tip-index {
    margin-right: 20rpx;
    font-size: 24rpx;
    font-weight: 800;
    color: #4d80f0;
    opacity: 0.8;
  }

  .tip-text {
    flex: 1;
    font-size: 26rpx;
    line-height: 1.6;
    color: #4a5568;
  }

  .action-bar {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30rpx 40rpx 60rpx;
    border-top: 1rpx solid #edf2f7;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20rpx);
    box-sizing: border-box;
    z-index: 100;
  }

  .action-btn {
    width: 85%;
    height: 100rpx !important;
    border-radius: 50rpx !important;
    font-size: 32rpx !important;
    font-weight: 600 !important;
    box-shadow: 0 10rpx 20rpx rgba(77, 128, 240, 0.2);
  }

  .primary-btn {
    border: none !important;
    background: linear-gradient(135deg, #4d80f0 0%, #3b66cf 100%) !important;
    color: #ffffff !important;
  }
</style>
