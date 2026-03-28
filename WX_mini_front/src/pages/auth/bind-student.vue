<template>
  <view class="bind-student-page">
    <view class="skip-btn" @click="skipBinding">
      跳过
    </view>

    <view class="notice-bar">
      <wd-notice-bar
        text="请勿恶意绑定其他用户账号，所有绑定记录均已进行备案，一经查出，我司将保留追究其法律责任的权利。"
        prefix="warn-bold"
        type="warning"
        closable
      />
    </view>

    <view class="form-container">
      <view class="input-group">
        <wd-input v-model="form.studentName" placeholder="请输入学生真实姓名" no-border />
        <wd-input v-model="form.studentId" placeholder="请输入学生用户/准考证" no-border />
        <wd-input v-model="form.password" placeholder="请输入密码" type="password" show-password no-border />
        <wd-input v-model="form.phone" placeholder="请输入手机号" disabled no-border />
        <view class="code-wrapper">
          <wd-input v-model="form.code" placeholder="请输入验证码" use-suffix-slot no-border>
            <template #suffix>
              <view class="code-btn-text" :class="{ disabled: countdown > 0 }" @click="countdown === 0 && sendCode()">
                {{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}
              </view>
            </template>
          </wd-input>
        </view>
      </view>

      <view class="action-btn">
        <wd-button type="primary" block custom-class="bind-btn" @click="handleBind">确认绑定</wd-button>
      </view>

      <view class="sub-actions">
        <text class="link" @click="gotoForgotAccount">忘记账号？</text>
        <text class="link" @click="gotoForgotPassword">忘记密码？</text>
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
import { onLoad, onNavigationBarButtonTap } from '@dcloudio/uni-app'
import { useToast } from 'wot-design-uni'
import { sendBindStudentCode, bindStudentAccount } from '@/api/auth/bind-student'

const toast = useToast()
const countdown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

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
  // 隐藏左上角返回首页按钮
  // #ifdef MP-WEIXIN
  uni.hideHomeButton()
  // #endif
})

// 处理原生导航栏按钮点击事件
onNavigationBarButtonTap((e) => {
  if (e.index === 0) { // 第0个按钮是“跳过”
    skipBinding()
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

const sendCode = async () => {
  if (!form.phone) return toast.show('手机号不能为空')
  
  try {
    toast.loading('发送中...')
    const res = await sendBindStudentCode(form.phone)
    if (res.code === 200) {
      toast.success('验证码已发送')
      countdown.value = 60
      timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) clearInterval(timer!)
      }, 1000)
    } else {
      toast.error(res.msg || '发送失败')
    }
  } catch (error: any) {
    toast.error(error.msg || '发送失败')
  }
}

const handleBind = async () => {
  const { studentName, studentId, password, code, phone } = form
  if (!studentName || !studentId || !password || !code) {
    return toast.show('请填写完整信息')
  }
  
  try {
    toast.loading('绑定中...')
    const res = await bindStudentAccount({
      studentName,
      studentId,
      password,
      phone,
      code
    })
    
    if (res.code === 200) {
      toast.success('绑定成功')
      // 绑定成功后，销毁当前页进入首页
      setTimeout(() => {
        uni.switchTab({ url: '/pages/home/index' })
      }, 1500)
    } else {
      toast.error(res.msg || '绑定失败')
    }
  } catch (error: any) {
    toast.error(error.msg || '绑定失败')
  }
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
  background-color: #fff;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
}

.skip-btn {
  text-align: right;
  font-size: 28rpx;
  color: #666;
  padding: 10rpx 0 20rpx;
  margin-top: -20rpx;
}

.notice-bar {
  margin-bottom: 40rpx;
}

.form-container {
  flex: 1;

  .input-group {
    display: flex;
    flex-direction: column;
    
    :deep(.wd-input) {
      margin-bottom: 40rpx;
      background-color: #f8f9fa;
      border-radius: 16rpx;
      padding: 0 30rpx;
      height: 100rpx;
      display: flex;
      align-items: center;
    }
    :deep(.wd-input__inner) {
      height: 100rpx;
      line-height: 100rpx;
      display: flex;
      align-items: center;
    }
  }

  .code-wrapper {
    margin-bottom: 40rpx;

    :deep(.wd-input) {
      margin-bottom: 0;
    }

    .code-btn-text {
      font-size: 30rpx;
      color: #1a5f8e;
      padding: 20rpx 10rpx;
      
      &.disabled {
        color: #999;
      }
    }
  }

  .action-btn {
    margin-top: 80rpx;
  }

  .sub-actions {
    display: flex;
    justify-content: space-between;
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

.footer-notice {
  font-size: 24rpx;
  color: #999;
  text-align: center;
  line-height: 1.5;
  padding: 40rpx 20rpx;
  margin-top: auto;
}
</style>