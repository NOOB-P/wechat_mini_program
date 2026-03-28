<template>
  <view class="forgot-password-page">
    <view class="header">
      <view class="title">忘记密码</view>
    </view>

    <view class="form-container">
      <view class="input-group">
        <wd-input
          v-model="phone"
          placeholder="请输入手机号"
          clearable
          type="number"
          maxlength="11"
        />
      </view>
      
      <view class="action-btn">
        <wd-button type="primary" block @click="handleNext">下一步</wd-button>
      </view>

      <view class="sub-actions">
        <text class="link" @click="gotoForgotAccount">忘记学生账号？</text>
      </view>
    </view>
    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'wot-design-uni'
import { verifyPhoneAccountApi } from '@/api/auth/forgot-password'

const toast = useToast()
const phone = ref('13800000000')

const goBack = () => {
  uni.navigateBack()
}

const handleNext = async () => {
  if (!phone.value || phone.value.length !== 11) {
    toast.show('请输入正确的手机号')
    return
  }
  
  try {
    toast.loading('验证中...')
    const res = await verifyPhoneAccountApi(phone.value)
    if (res.code === 200) {
      toast.close()
      uni.navigateTo({ url: `/pages/auth/reset-password?phone=${phone.value}` })
    } else {
      toast.error(res.msg || '手机号未注册')
    }
  } catch (error: any) {
    toast.error(error.msg || '验证失败')
  }
}

const gotoForgotAccount = () => {
  uni.navigateTo({ url: '/pages/auth/forgot-account' })
}
</script>

<style lang="scss" scoped>
.forgot-password-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 40rpx 32rpx 32rpx; // 增加了顶部的 padding (原来是 32rpx) 避免被刘海屏挡住
  box-sizing: border-box;
}

.header {
  display: flex;
  align-items: center;
  padding: 40rpx 0; // 增加了内边距
  margin-bottom: 60rpx; // 增加与下方卡片的距离
  position: relative; // 增加定位以便于扩大点击区域而不影响布局
  z-index: 10;
  .back-icon {
    font-size: 44rpx !important; // 稍微放大一点图标
    color: #333;
    padding: 20rpx; // 增加点击区域
    margin-left: -20rpx; // 抵消 padding 带来的位移
  }
  .title {
    font-size: 56rpx;
    font-weight: bold;
    color: #333;
  }
}

.form-container {
  flex: 1;

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 30rpx;
  }

  .action-btn {
    margin-top: 80rpx;
  }

  .sub-actions {
    display: flex;
    justify-content: center;
    margin-top: 40rpx;
    padding: 0 10rpx;

    .link {
      font-size: 28rpx;
      color: #666;
      
      &:active {
        color: #1a5f8e;
      }
    }
  }
}
</style>
