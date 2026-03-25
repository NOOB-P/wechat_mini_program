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
      <wd-input v-model="form.phone" label="手机号" disabled />
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
import { onLoad } from '@dcloudio/uni-app'
import { useToast } from 'wot-design-uni'

const toast = useToast()
const countdown = ref(0)

const form = reactive({
  studentName: '',
  studentId: '',
  password: '',
  phone: '', // 初始为空，由 onLoad 获取
  code: ''
})

// 生命周期：获取登录页传来的手机号
onLoad((options) => {
  if (options && options.phone) {
    form.phone = options.phone
  }
})

const goBack = () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    // 如果有上一页（比如从注册页过来的），正常后退
    uni.navigateBack()
  } else {
    // 如果是第一页（从登录页重定向过来的），则重定向回登录页
    uni.reLaunch({ url: '/pages/login/index' })
  }
}

const skipBinding = () => {
  // 首页在 TabBar 中，必须使用 switchTab
  uni.switchTab({ url: '/pages/home/index' })
}

const sendCode = () => {
  if (!form.phone) return toast.show('手机号不能为空')
  
  toast.loading('发送中...')
  // MOCK: 模拟发送验证码逻辑
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
  // MOCK: 模拟异步绑定请求
  setTimeout(() => {
    toast.success('绑定成功')
    // 绑定成功后，销毁当前页进入首页
    setTimeout(() => {
      uni.switchTab({ url: '/pages/home/index' })
    }, 1500)
  }, 1000)
}

const gotoForgotAccount = () => {
  uni.navigateTo({ url: '/pages/auth/forgot-account' })
}

const gotoForgotPassword = () => {
  uni.navigateTo({ url: '/pages/auth/forgot-password' })
}
</script>

<style lang="scss" scoped>
.bind-student-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 120rpx 32rpx 32rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  padding: 40rpx 0 30rpx;
  margin-bottom: 60rpx;
  .back-icon {
    font-size: 44rpx !important;
    color: #333;
  }
  .title {
    flex: 1;
    text-align: center;
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
  }
  .skip-btn {
    font-size: 30rpx;
    color: #666;
  }
}

.notice-bar {
  margin-bottom: 60rpx;
}

.form-card {
  background-color: #fff;
  border-radius: 32rpx;
  padding: 60rpx 40rpx; // 稍微缩小了内边距以适应移动端屏幕
  display: flex;
  flex-direction: column;
  gap: 40rpx;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.08);
  margin: 0 10rpx;

  :deep(.wd-input) {
    --wd-input-label-width: 160rpx;
  }

  .code-input-wrapper {
    display: flex;
    align-items: center;
    gap: 20rpx;
    .code-btn {
      flex-shrink: 0;
      min-width: 180rpx;
    }
  }

  .bind-btn {
    margin-top: 40rpx;
    height: 96rpx;
    border-radius: 48rpx;
    font-size: 34rpx;
    font-weight: bold;
    // 建议使用你项目的主色调
    --wd-button-primary-bg-color: #1a5f8e;
    --wd-button-primary-border-color: #1a5f8e;
  }

  .form-links {
    display: flex;
    justify-content: space-between;
    margin-top: 20rpx;
    padding: 0 20rpx;
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