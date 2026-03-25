<template>
  <view class="bind-student-page">
    <view class="header">
      <wd-icon name="arrow-left" custom-class="back-icon" @click="goBack" />
      <view class="title">绑定学生账号</view>
      <text class="skip-btn" @click="skipBinding">跳过</text>
    </view>

    <view class="notice-bar">
      <wd-notice-bar
        text="请勿恶意绑定其他用户账号，所有绑定记录均已进行备案，一经查出，我司将保留追究其法律责任的权利。"
        prefix="warn-bold"
        type="warning"
        closable
      />
    </view>

    <view class="form-card">
      <wd-input v-model="form.studentName" label="学生姓名" placeholder="请输入学生真实姓名" />
      <wd-input v-model="form.studentId" label="学生账号" placeholder="请输入学生用户/准考证" />
      <wd-input v-model="form.password" label="账号密码" placeholder="请输入密码" type="password" show-password />
      <wd-input v-model="form.phone" label="手机号" :value="phone" disabled />
      <view class="code-input-wrapper">
        <wd-input v-model="form.code" label="验证码" placeholder="请输入验证码" />
        <wd-button class="code-btn" type="primary" plain size="small" @click="sendCode" :disabled="countdown > 0">
          {{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}
        </wd-button>
      </view>

      <wd-button type="primary" block custom-class="bind-btn" @click="handleBind">确认绑定</wd-button>

      <view class="form-links">
        <text class="link" @click="gotoForgotAccount">忘记账号</text>
        <text class="link" @click="gotoForgotPassword">忘记密码</text>
      </view>
    </view>

    <view class="footer-notice">
      提醒：家长最多可以绑定5个学生账号，如果超过上限，请先进入「我的-绑定学生账号」点击解绑。
    </view>
    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useToast } from 'wot-design-uni'

const toast = useToast()
const phone = ref('13800000000') // MOCK: 假设从上个页面或缓存中获取
const countdown = ref(0)

const form = reactive({
  studentName: '',
  studentId: '',
  password: '',
  phone: phone.value,
  code: ''
})

const goBack = () => uni.navigateBack()
const skipBinding = () => uni.switchTab({ url: '/pages/home/index' })

const sendCode = () => {
  toast.loading('发送中...')
  // MOCK: 模拟发送验证码
  setTimeout(() => {
    toast.success('验证码已发送')
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(timer)
    }, 1000)
  }, 1000)
}

const handleBind = () => {
  const { studentName, studentId, password, code } = form
  if (!studentName || !studentId || !password || !code) {
    return toast.show('请填写完整信息')
  }
  toast.loading('绑定中...')
  // MOCK: 模拟绑定请求
  setTimeout(() => {
    toast.success('绑定成功')
    setTimeout(() => uni.switchTab({ url: '/pages/home/index' }), 1500)
  }, 1000)
}

const gotoForgotAccount = () => uni.navigateTo({ url: '/pages/auth/forgot-account' })
const gotoForgotPassword = () => uni.navigateTo({ url: '/pages/auth/forgot-password' })

</script>

<style lang="scss" scoped>
.bind-student-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 32rpx;
  box-sizing: border-box;
}

.header {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
  .back-icon {
    font-size: 40rpx !important;
    color: #333;
  }
  .title {
    flex: 1;
    text-align: center;
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
  .skip-btn {
    font-size: 28rpx;
    color: #666;
  }
}

.notice-bar {
  margin-bottom: 20rpx;
}

.form-card {
  background-color: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;

  .code-input-wrapper {
    display: flex;
    align-items: center;
    gap: 20rpx;
    .code-btn {
      flex-shrink: 0;
    }
  }

  .bind-btn {
    margin-top: 20rpx;
    --wd-button-primary-bg-color: #00c8a0;
    --wd-button-primary-border-color: #00c8a0;
  }

  .form-links {
    display: flex;
    justify-content: space-between;
    margin-top: 20rpx;
    font-size: 28rpx;
    .link {
      color: #007aff;
    }
  }
}

.footer-notice {
  margin-top: 40rpx;
  font-size: 24rpx;
  color: #999;
  text-align: center;
  padding: 0 20rpx;
}
</style>
