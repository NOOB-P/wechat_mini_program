<template>
  <view class="settings-container">
    <view class="section-group">
      <view class="section-header">账号安全</view>
      <wd-cell-group border>
        <wd-cell title="手机号" :value="userInfo.phone || '未设置'" is-link @click="showChangePhonePopup = true" />
        <wd-cell title="微信绑定" is-link @click="handleWechatBindingClick">
          <view class="wechat-bind-value" :class="{ bound: isWechatLinked }">
            <text class="bind-text">{{ wechatBindText }}</text>
            <wd-icon name="wechat" size="18px" />
          </view>
        </wd-cell>
        <wd-cell title="修改密码" is-link @click="showChangePasswordPopup = true" />
      </wd-cell-group>
    </view>

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

    <view class="section-group">
      <view class="section-header">系统支持</view>
      <wd-cell-group border>
        <wd-cell title="版本更新" :value="settingsInfo.version" is-link @click="handleCheckUpdate" />
      </wd-cell-group>
    </view>

    <view class="logout-btn-container">
      <text class="logout-text" @click="handleLogout">退出登录</text>
    </view>

    <wd-popup v-model="showStudentDetailPopup" position="bottom" :custom-style="bottomPopupStyle">
      <view class="popup-content">
        <view class="popup-title">学生详情</view>
        <view class="detail-list">
          <view class="detail-item">
            <text class="label">学生姓名</text>
            <text class="value">{{ userInfo.boundStudentInfo?.name || '--' }}</text>
          </view>
          <view class="detail-item">
            <text class="label">所在学校</text>
            <text class="value">{{ userInfo.boundStudentInfo?.school || '--' }}</text>
          </view>
          <view class="detail-item">
            <text class="label">所在班级</text>
            <text class="value">
              {{ `${userInfo.boundStudentInfo?.grade || ''}${userInfo.boundStudentInfo?.className || ''}` || '--' }}
            </text>
          </view>
          <view class="detail-item">
            <text class="label">学生学号</text>
            <text class="value">{{ userInfo.boundStudentInfo?.studentNo || '--' }}</text>
          </view>
        </view>
        <view class="action-btn">
          <wd-button type="error" block plain @click="handleUnbindStudent">解除绑定</wd-button>
        </view>
      </view>
    </wd-popup>

    <wd-popup v-model="showChangePhonePopup" position="bottom" :custom-style="bottomPopupStyle">
      <view class="popup-content">
        <view class="popup-title">修改手机号</view>
        <view class="input-group">
          <wd-input v-model="phoneForm.newPhone" placeholder="请输入新手机号" type="number" :maxlength="11" no-border />
          <view class="code-wrapper">
            <wd-input
              v-model="phoneForm.code"
              placeholder="请输入验证码"
              type="number"
              :maxlength="6"
              use-suffix-slot
              no-border
            >
              <template #suffix>
                <view
                  class="code-btn-text"
                  :class="{ disabled: phoneCountdown > 0 }"
                  @click="phoneCountdown === 0 && sendPhoneCode()"
                >
                  {{ phoneCountdown > 0 ? `${phoneCountdown}s后重试` : '获取验证码' }}
                </view>
              </template>
            </wd-input>
          </view>
        </view>
        <view v-if="phoneErrorMessage" class="form-error-tip">{{ phoneErrorMessage }}</view>
        <view class="action-btn">
          <wd-button type="primary" block @click="handleChangePhone">确认修改</wd-button>
        </view>
      </view>
    </wd-popup>

    <wd-popup v-model="showChangePasswordPopup" position="bottom" :custom-style="bottomPopupStyle">
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
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useToast } from 'wot-design-uni'

import { sendSmsCode } from '@/api/login'
import {
  getMineInfoApi,
  logoutApi,
  unbindStudentApi,
  updateMineInfoApi,
  updatePasswordApi
} from '@/api/mine'
import {
  ensureWechatBound,
  isWechatBound,
  maskWechatIdentifier,
  unbindWechatAccount
} from '@/utils/wechat-bind'

const toast = useToast()
const bottomPopupStyle = 'height: 60%; padding: 40rpx; border-radius: 32rpx 32rpx 0 0;'

const userInfo = reactive({
  phone: '',
  nickname: '',
  email: '',
  wxid: '',
  isBoundStudent: 0,
  boundStudentInfo: null as Record<string, any> | null
})

const settingsInfo = reactive({
  version: '1.0.0'
})

const showStudentDetailPopup = ref(false)
const showChangePhonePopup = ref(false)
const showChangePasswordPopup = ref(false)

const phoneCountdown = ref(0)
const phoneErrorMessage = ref('')
let phoneTimer: ReturnType<typeof setInterval> | null = null

const phoneForm = reactive({
  newPhone: '',
  code: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const isWechatLinked = computed(() => isWechatBound(userInfo))
const wechatBindText = computed(() => (isWechatLinked.value ? '已绑定' : '去绑定'))
const maskedWechatId = computed(() => maskWechatIdentifier(userInfo.wxid))

const syncCachedUserInfo = (data: Record<string, any>) => {
  const cachedUserInfo = uni.getStorageSync('userInfo') || {}
  uni.setStorageSync('userInfo', {
    ...cachedUserInfo,
    ...data
  })
}

const assignUserInfo = (data: Record<string, any> = {}) => {
  const cachedUserInfo = uni.getStorageSync('userInfo') || {}
  const mergedUserInfo = {
    ...cachedUserInfo,
    ...data
  }

  userInfo.phone = mergedUserInfo.phone || ''
  userInfo.nickname = mergedUserInfo.nickname || ''
  userInfo.email = mergedUserInfo.email || ''
  userInfo.wxid = mergedUserInfo.wxid || mergedUserInfo.openid || ''
  userInfo.isBoundStudent = Number(mergedUserInfo.isBoundStudent || 0)
  userInfo.boundStudentInfo = mergedUserInfo.boundStudentInfo || null

  syncCachedUserInfo(mergedUserInfo)
}

const fetchData = async () => {
  try {
    const res = await getMineInfoApi()
    assignUserInfo(res.data || {})
  } catch (error) {
    console.error('fetch mine info failed', error)
  }
}

const resetPhoneForm = () => {
  phoneForm.newPhone = ''
  phoneForm.code = ''
  phoneErrorMessage.value = ''
}

const resetPasswordForm = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

watch(showChangePhonePopup, (visible) => {
  if (!visible) {
    resetPhoneForm()
  }
})

watch(showChangePasswordPopup, (visible) => {
  if (!visible) {
    resetPasswordForm()
  }
})

watch(
  () => [phoneForm.newPhone, phoneForm.code],
  () => {
    if (phoneErrorMessage.value) {
      phoneErrorMessage.value = ''
    }
  }
)

onMounted(() => {
  fetchData()
})

onUnmounted(() => {
  if (phoneTimer) {
    clearInterval(phoneTimer)
    phoneTimer = null
  }
})

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
      phoneCountdown.value -= 1
      if (phoneCountdown.value <= 0 && phoneTimer) {
        clearInterval(phoneTimer)
        phoneTimer = null
      }
    }, 1000)
  } catch (error: any) {
    phoneErrorMessage.value = error?.msg || '验证码发送失败，请稍后重试'
    toast.error(phoneErrorMessage.value)
  }
}

const handleChangePhone = async () => {
  if (!phoneForm.newPhone || !phoneForm.code) {
    toast.show('请填写完整信息')
    return
  }
  if (phoneForm.newPhone === userInfo.phone) {
    toast.show('新手机号不能与当前手机号相同')
    return
  }

  try {
    await updateMineInfoApi({
      phone: phoneForm.newPhone,
      code: phoneForm.code
    })
    toast.success('修改成功')
    await fetchData()
    showChangePhonePopup.value = false
  } catch (error: any) {
    phoneErrorMessage.value = error?.msg || '修改手机号失败，请稍后重试'
    toast.error(phoneErrorMessage.value)
  }
}

const handleWechatBindingClick = async () => {
  if (isWechatLinked.value) {
    uni.showModal({
      title: '解绑确认',
      content: maskedWechatId.value
        ? `确定要解除与微信 [${maskedWechatId.value}] 的绑定吗？解绑后将无法使用微信登录。`
        : '确定要解除微信绑定吗？解绑后将无法使用微信登录。',
      success: async (res) => {
        if (res.confirm) {
          try {
            toast.loading('正在解绑...')
            const latestUserInfo = await unbindWechatAccount()
            toast.success('解绑成功')
            assignUserInfo(latestUserInfo || {})
          } catch (error: any) {
            toast.error(error?.msg || error?.message || '解绑失败')
          }
        }
      }
    })
    return
  }

  try {
    const latestUserInfo = await ensureWechatBound({
      title: '绑定微信',
      subtitle: '绑定后可接收课程提醒、同步多端学习进度，并保障支付安全。',
      cancelText: '暂不绑定'
    })
    assignUserInfo(latestUserInfo || {})
  } catch (error: any) {
    if (error?.code === 'WECHAT_BIND_CANCELLED') {
      return
    }
    toast.error(error?.msg || error?.message || '微信绑定失败')
  }
}

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
    await updatePasswordApi({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    toast.success('修改成功')
    showChangePasswordPopup.value = false
  } catch (error: any) {
    toast.error(error?.msg || error?.message || '修改密码失败')
  }
}

const handleCancelAccount = () => {
  uni.showModal({
    title: '账户注销',
    content: '注销后账户信息将无法找回，确定要注销吗？',
    confirmColor: '#fa4350',
    success: (res) => {
      if (res.confirm) {
        toast.show('暂不支持在线注销，请联系客服处理')
      }
    }
  })
}

// 跳转至绑定页面
const handleGoToBind = () => {
  const phone = userInfo.phone || uni.getStorageSync('userInfo')?.phone || ''
  uni.navigateTo({
    url: `/pages/auth/bind-student?phone=${phone}`
  })
}

const handleUnbindStudent = () => {
  uni.showModal({
    title: '解绑确认',
    content: `确定要解绑学生 [${userInfo.boundStudentInfo?.name || ''}] 吗？`,
    confirmColor: '#fa4350',
    success: async (res) => {
      if (!res.confirm) {
        return
      }

      try {
        toast.loading('正在解绑...')
        await unbindStudentApi()
        toast.success('解绑成功')
        userInfo.isBoundStudent = 0
        userInfo.boundStudentInfo = null
        syncCachedUserInfo({
          isBoundStudent: 0,
          boundStudentInfo: null
        })
        showStudentDetailPopup.value = false
        setTimeout(() => {
          const phone = userInfo.phone || uni.getStorageSync('userInfo')?.phone || ''
          uni.redirectTo({ url: `/pages/auth/bind-student?phone=${phone}` })
        }, 1000)
      } catch (error: any) {
        toast.error(error?.msg || error?.message || '解绑失败')
      }
    }
  })
}

const handleCheckUpdate = () => {
  toast.loading('正在检查更新...')
  setTimeout(() => {
    toast.show('当前已是最新版本')
  }, 1000)
}

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (!res.confirm) {
        return
      }

      try {
        await logoutApi()
      } catch (error) {
        console.error('logout failed', error)
      }

      uni.clearStorageSync()
      uni.reLaunch({
        url: '/pages/login/index'
      })
    }
  })
}
</script>

<style src="./index.scss" lang="scss" scoped></style>
