<template>
  <view class="bind-student-page">
    <view class="header">
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
      <wd-input v-model="form.phone" label="手机号" placeholder="请输入手机号" />
      <view class="code-input-wrapper">
        <wd-input v-model="form.code" label="验证码" placeholder="请输入验证码" />
        <wd-button class="code-btn" type="primary" plain size="small" @click="sendCode" :disabled="countdown > 0">
          {{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}
        </wd-button>
      </view>

      <view class="input-group">
        <wd-input v-model="form.studentName" placeholder="请输入学生真实姓名" clearable />
        <wd-input v-model="form.studentId" placeholder="请输入学生用户/准考证" clearable />
        <wd-input v-model="form.password" placeholder="请输入密码" clearable show-password type="text" />
        <wd-input v-model="form.phone" placeholder="手机号" disabled clearable />
        <view class="code-wrapper">
          <wd-input v-model="form.code" placeholder="请输入验证码" clearable type="number" maxlength="6" />
          <wd-button class="code-btn" type="primary" plain size="small" @click="sendCode" :disabled="countdown > 0">
            {{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}
          </wd-button>
        </view>
      </view>

      <view class="action-btn">
        <wd-button type="primary" block @click="handleBind">确认绑定</wd-button>
      </view>

      <view class="sub-actions">
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

.header {
  display: flex;
  align-items: center;
  padding: 40rpx 0 30rpx;
  margin-bottom: 60rpx;
  position: relative;
  z-index: 10;
  .back-icon {
    font-size: 44rpx !important;
    color: #333;
    padding: 20rpx; // 增加点击区域
    margin-left: -20rpx; // 抵消 padding 带来的位移
  }
  .title {
    font-size: 56rpx;
    font-weight: bold;
    color: #333;
  }
  .skip-btn {
    position: absolute;
    right: 0;
    bottom: 0;
    font-size: 30rpx;
    color: #666;
  }
}

.form-container {
  flex: 1;

  .notice-bar {
    margin-bottom: 40rpx;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 30rpx;
  }

  .code-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    
    :deep(.wd-input) {
      flex: 1;
    }
    
    .code-btn {
      margin-left: 20rpx;
      min-width: 200rpx;
    }
  }

  .action-btn {
    margin-top: 80rpx;
  }

  .sub-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 60rpx;
    padding: 0 10rpx;
    font-size: 28rpx;
    .link {
      color: #007aff;
      padding: 20rpx; /* 增加点击区域，防止按不到 */
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