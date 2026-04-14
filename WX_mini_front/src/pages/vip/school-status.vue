<template>
  <view class="school-status-page">
    <view class="hero-card">
      <view class="hero-badge">VIP 开通提醒</view>
      <view class="hero-title">
        {{ hasBoundStudent ? '学校暂未开放直接开通' : '请先绑定学生信息' }}
      </view>
      <view class="hero-desc">
        <text v-if="hasBoundStudent">
          {{ schoolName ? `${schoolName} 需进入校讯通确认流程。` : '当前账号未命中可开通学校。' }}
        </text>
        <text v-else>系统暂未获取到你的学校信息，先绑定学生后再确认是否已开通校讯通。</text>
      </view>
    </view>

    <view v-if="hasBoundStudent" class="status-section">
      <view class="section-title">开通说明</view>
      <view class="status-card active">
        <view class="status-name">我要开通校讯通</view>
        <view class="status-copy">您的开通申请将会被移送到移动公司统一处理。</view>
      </view>
    </view>

    <view class="tips-panel">
      <view class="section-title">流程说明</view>
      <view class="tip-row">
        <text class="tip-index">01</text>
        <text class="tip-text">提交开通申请后，您的信息将移送移动公司进行统一激活处理。</text>
      </view>
      <view class="tip-row">
        <text class="tip-index">02</text>
        <text class="tip-text">提交开通申请后，即可享受vip权益。</text>
      </view>
      <view class="tip-row" v-if="schoolName">
        <text class="tip-index">03</text>
        <text class="tip-text">识别到学校：{{ schoolName }}</text>
      </view>
    </view>

    <view class="action-bar">
      <wd-button
        v-if="!hasBoundStudent"
        type="primary"
        custom-class="action-btn primary-btn centered-btn"
        @click="goBindStudent"
      >
        去绑定学生
      </wd-button>
      <wd-button
        v-else
        type="primary"
        custom-class="action-btn primary-btn centered-btn"
        @click="handlePrimaryAction"
      >
        提交开通申请
      </wd-button>
    </view>

    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  import { useToast } from 'wot-design-uni'

  const toast = useToast()
  const schoolName = ref('')
  const hasBoundStudent = ref(true)

  onLoad((options) => {
    uni.setNavigationBarTitle({ title: '校讯通状态' })
    schoolName.value = options?.schoolName ? decodeURIComponent(String(options.schoolName)) : ''
    hasBoundStudent.value = String(options?.hasBoundStudent || '1') === '1'
  })

  const goServicePage = () => {
    uni.navigateTo({ url: '/pages/service/index' })
  }

  const goBindStudent = () => {
    uni.navigateTo({ url: '/pages/auth/bind-student' })
  }

  const handlePrimaryAction = () => {
    // 提交开通申请的流程
    toast.success('申请已提交，我们将尽快为您处理')
    setTimeout(() => {
      goServicePage()
    }, 1500)
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

    & + .status-card {
      margin-top: 20rpx;
    }

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
