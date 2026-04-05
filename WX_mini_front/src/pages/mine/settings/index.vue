<template>
  <view class="settings-container">
    <!-- 模块一：账号安全 -->
    <view class="section-group">
      <view class="section-header">账号安全</view>
      <wd-cell-group border>
        <wd-cell title="手机号" :value="userInfo.phone" is-link @click="showChangePhonePopup = true" />
        <wd-cell title="修改密码" is-link @click="showChangePasswordPopup = true" />
        <wd-cell title="账户注销" is-link @click="handleCancelAccount" />
      </wd-cell-group>
    </view>

    <!-- 模块二：学生管理 -->
    <view class="section-group">
      <view class="section-header">学生管理</view>
      <wd-cell-group border>
        <wd-cell 
          v-if="userInfo.isBoundStudent === 1" 
          title="绑定学生" 
          :value="userInfo.boundStudentInfo?.name" 
          is-link 
          @click="showStudentDetailPopup = true" 
        />
        <wd-cell 
          v-else 
          title="绑定学生" 
          value="未绑定" 
          is-link 
          @click="handleGoToBind" 
        />
      </wd-cell-group>
    </view>

    <!-- 模块三：系统支持 -->
    <view class="section-group">
      <view class="section-header">系统支持</view>
      <wd-cell-group border>
        <wd-cell title="上传日志" is-link @click="handleUploadLogs" />
        <wd-cell title="版本更新" :value="settingsInfo.version" is-link @click="handleCheckUpdate" />
      </wd-cell-group>
    </view>

    <view class="logout-btn-container">
      <text class="logout-text" @click="handleLogout">退出登录</text>
    </view>

    <!-- 学生信息详情弹窗 -->
    <wd-popup v-model="showStudentDetailPopup" position="bottom" custom-style="height: 60%; padding: 40rpx; border-radius: 32rpx 32rpx 0 0;">
      <view class="popup-content">
        <view class="popup-title">学生详情</view>
        <view class="detail-list">
          <view class="detail-item">
            <text class="label">学生姓名</text>
            <text class="value">{{ userInfo.boundStudentInfo?.name }}</text>
          </view>
          <view class="detail-item">
            <text class="label">所在学校</text>
            <text class="value">{{ userInfo.boundStudentInfo?.school }}</text>
          </view>
          <view class="detail-item">
            <text class="label">所在班级</text>
            <text class="value">{{ userInfo.boundStudentInfo?.grade }}{{ userInfo.boundStudentInfo?.className }}</text>
          </view>
          <view class="detail-item">
            <text class="label">学生学号</text>
            <text class="value">{{ userInfo.boundStudentInfo?.studentNo }}</text>
          </view>
        </view>
        <view class="action-btn">
          <wd-button type="error" block plain @click="handleUnbindStudent">解除绑定</wd-button>
        </view>
      </view>
    </wd-popup>

    <!-- 修改手机号弹窗 -->
    <wd-popup v-model="showChangePhonePopup" position="bottom" custom-style="height: 60%; padding: 40rpx; border-radius: 32rpx 32rpx 0 0;">
      <view class="popup-content">
        <view class="popup-title">修改手机号</view>
        <view class="input-group">
          <wd-input v-model="phoneForm.newPhone" placeholder="请输入新手机号" type="number" maxlength="11" no-border />
          <view class="code-wrapper">
            <wd-input v-model="phoneForm.code" placeholder="请输入验证码" type="number" maxlength="6" use-suffix-slot no-border>
              <template #suffix>
                <view class="code-btn-text" :class="{ disabled: phoneCountdown > 0 }" @click="phoneCountdown === 0 && sendPhoneCode()">
                  {{ phoneCountdown > 0 ? `${phoneCountdown}s后重试` : '获取验证码' }}
                </view>
              </template>
            </wd-input>
          </view>
        </view>
        <view class="action-btn">
          <wd-button type="primary" block @click="handleChangePhone">确认修改</wd-button>
        </view>
      </view>
    </wd-popup>

    <!-- 修改密码弹窗 -->
    <wd-popup v-model="showChangePasswordPopup" position="bottom" custom-style="height: 60%; padding: 40rpx; border-radius: 32rpx 32rpx 0 0;">
      <view class="popup-content">
        <view class="popup-title">修改密码</view>
        <view class="input-group">
          <wd-input v-model="passwordForm.oldPassword" placeholder="请输入旧密码" show-password type="text" no-border />
          <wd-input v-model="passwordForm.newPassword" placeholder="请输入新密码" show-password type="text" no-border />
          <wd-input v-model="passwordForm.confirmPassword" placeholder="请再次输入新密码" show-password type="text" no-border />
        </view>
        <view class="action-btn">
          <wd-button type="primary" block @click="handleChangePassword">确认修改</wd-button>
        </view>
      </view>
    </wd-popup>

    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { getMineInfoApi, updateMineInfoApi, updatePasswordApi, logoutApi, unbindStudentApi } from '@/api/mine'
import { sendSmsCode } from '@/api/login'
import { useToast } from 'wot-design-uni'

const toast = useToast()

// 用户信息
const userInfo = reactive({
  phone: '',
  nickname: '',
  email: '',
  isBoundStudent: 0,
  boundStudentInfo: null as any
})

// 设置信息
const settingsInfo = reactive({
  version: '1.0.0'
})

// 学生详情弹窗
const showStudentDetailPopup = ref(false)

// 修改手机号相关
const showChangePhonePopup = ref(false)
const phoneCountdown = ref(0)
let phoneTimer: ReturnType<typeof setInterval> | null = null
const phoneForm = reactive({
  newPhone: '',
  code: ''
})

// 修改密码相关
const showChangePasswordPopup = ref(false)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 获取数据
const fetchData = async () => {
  try {
    const res = await getMineInfoApi()
    if (res.code === 200) {
      userInfo.phone = res.data.phone
      userInfo.nickname = res.data.nickname
      userInfo.email = res.data.email
      userInfo.isBoundStudent = res.data.isBoundStudent
      userInfo.boundStudentInfo = res.data.boundStudentInfo
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

onMounted(() => {
  fetchData()
})

// 发送验证码
const sendPhoneCode = async () => {
  if (!phoneForm.newPhone || phoneForm.newPhone.length !== 11) {
    toast.show('请输入正确的手机号')
    return
  }
  try {
    await sendSmsCode(phoneForm.newPhone)
    toast.success('验证码已发送')
    phoneCountdown.value = 60
    phoneTimer = setInterval(() => {
      phoneCountdown.value--
      if (phoneCountdown.value <= 0) {
        clearInterval(phoneTimer!)
      }
    }, 1000)
  } catch (error) {
    console.error('发送验证码失败:', error)
  }
}

// 修改手机号
const handleChangePhone = async () => {
  if (!phoneForm.newPhone || !phoneForm.code) {
    toast.show('请填写完整信息')
    return
  }
  try {
    // 后端 updateMineInfoApi 支持更新手机号，需要传递新手机号和验证码
    const res = await updateMineInfoApi({ 
      phone: phoneForm.newPhone,
      code: phoneForm.code 
    })
    if (res.code === 200) {
      toast.success('修改成功')
      userInfo.phone = phoneForm.newPhone
      showChangePhonePopup.value = false
      // 重置表单
      phoneForm.newPhone = ''
      phoneForm.code = ''
    }
  } catch (error) {
    console.error('修改手机号失败:', error)
  }
}

// 修改密码
const handleChangePassword = async () => {
  if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
    toast.show('请填写完整信息')
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    toast.show('两次输入的新密码不一致')
    return
  }
  try {
    const res = await updatePasswordApi({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    if (res.code === 200) {
      toast.success('修改成功')
      showChangePasswordPopup.value = false
      // 重置表单
      passwordForm.oldPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    }
  } catch (error) {
    console.error('修改密码失败:', error)
  }
}

// 账户注销
const handleCancelAccount = () => {
  uni.showModal({
    title: '账户注销',
    content: '注销后账户信息将无法找回，确定要注销吗？',
    confirmColor: '#fa4350',
    success: (res) => {
      if (res.confirm) {
        toast.show('暂不支持在线注销，请联系客服')
      }
    }
  })
}

// 跳转至绑定页面
const handleGoToBind = () => {
  uni.navigateTo({ 
    url: `/pages/auth/bind-student?phone=${userInfo.phone}` 
  })
}

// 解绑学生
const handleUnbindStudent = () => {
  uni.showModal({
    title: '解绑确认',
    content: `确定要解绑学生 [${userInfo.boundStudentInfo?.name}] 吗？`,
    confirmColor: '#fa4350',
    success: async (res) => {
      if (res.confirm) {
        try {
          toast.loading('正在解绑...')
          const res = await unbindStudentApi()
          if (res.code === 200) {
            toast.success('解绑成功')
            userInfo.isBoundStudent = 0
            userInfo.boundStudentInfo = null
            showStudentDetailPopup.value = false // 关闭详情弹窗
            setTimeout(() => {
              uni.redirectTo({ url: '/pages/auth/bind-student' })
            }, 1000)
          }
        } catch (error: any) {
          toast.error(error.msg || '解绑失败')
        }
      }
    }
  })
}

// 上传日志
const handleUploadLogs = () => {
  toast.loading('正在上传日志...')
  setTimeout(() => {
    toast.success('上传成功')
  }, 1500)
}

// 版本更新
const handleCheckUpdate = () => {
  toast.loading('正在检查更新...')
  setTimeout(() => {
    toast.show('当前已是最新版本')
  }, 1000)
}

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await logoutApi()
        } catch (e) {}
        uni.clearStorageSync()
        uni.reLaunch({
          url: '/pages/login/index'
        })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.settings-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20rpx 0;
}

.section-group {
  margin-bottom: 30rpx;
  
  .section-header {
    padding: 20rpx 32rpx;
    font-size: 26rpx;
    color: #999;
    background-color: #f8f9fa;
  }
}

.logout-btn-container {
  margin: 60rpx 0;
  background-color: #fff;
  height: 100rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logout-text {
  color: #fa4350;
  font-size: 32rpx;
}

.popup-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  
  .popup-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    text-align: center;
    margin-bottom: 60rpx;
  }

  .detail-list {
    flex: 1;
    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 30rpx 0;
      border-bottom: 1rpx solid #f5f5f5;
      
      .label {
        font-size: 30rpx;
        color: #666;
      }
      
      .value {
        font-size: 30rpx;
        color: #333;
        font-weight: 500;
      }
    }
  }
  
  .input-group {
    background: #f5f6f7;
    border-radius: 24rpx;
    padding: 10rpx 20rpx;
    margin-bottom: 60rpx;
    
    :deep(.wd-input) {
      background: transparent;
      padding: 30rpx 10rpx;
    }
    
    .code-wrapper {
      border-top: 1rpx solid #eee;
      
      .code-btn-text {
        font-size: 28rpx;
        color: #1a5f8e;
        padding: 0 20rpx;
        
        &.disabled {
          color: #999;
        }
      }
    }
  }
  
  .action-btn {
    margin-top: auto;
    padding: 40rpx 0;
  }
}

:deep(.wd-cell) {
  padding: 32rpx !important;
}

:deep(.wd-cell__title) {
  font-size: 30rpx;
  color: #333;
}

:deep(.wd-cell__value) {
  font-size: 28rpx;
  color: #999;
}
</style>
