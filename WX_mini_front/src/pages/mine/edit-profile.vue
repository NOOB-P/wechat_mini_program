<template>
  <view class="edit-profile-container">
    <wd-toast id="wd-toast" />
    
    <!-- 头部头像区域 -->
    <view class="avatar-card">
      <view class="avatar-wrapper" @click="chooseAvatar">
        <image
          :key="avatarRenderKey"
          class="avatar-image"
          :src="profileForm.avatarPreview || DEFAULT_AVATAR"
          mode="aspectFill"
        />
        <view class="camera-icon">
          <wd-icon name="camera" size="20px" color="#fff" />
        </view>
      </view>
      <text class="avatar-hint">点击更换头像</text>
    </view>

    <!-- 表单信息区域 -->
    <view class="form-card">
      <view class="form-item">
        <view class="item-label">
          <wd-icon name="user" size="18px" color="#666" class="label-icon" />
          <text>昵称</text>
        </view>
        <view class="item-content">
          <wd-input
            v-model="profileForm.nickname"
            placeholder="请输入您的昵称"
            no-border
            clearable
            custom-style="padding: 0;"
          />
        </view>
      </view>

      <view class="form-item">
        <view class="item-label">
          <wd-icon name="mail" size="18px" color="#666" class="label-icon" />
          <text>邮箱</text>
        </view>
        <view class="item-content">
          <wd-input
            v-model="profileForm.email"
            placeholder="请输入您的邮箱"
            no-border
            clearable
            custom-style="padding: 0;"
          />
        </view>
      </view>

      <view class="form-item readonly">
        <view class="item-label">
          <wd-icon name="mobile" size="18px" color="#666" class="label-icon" />
          <text>手机号</text>
        </view>
        <view class="item-content">
          <text class="phone-text">{{ profileForm.phone }}</text>
          <text class="tip-text">不可修改</text>
        </view>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="footer-action">
      <wd-button type="primary" block size="large" @click="handleSave">保存修改</wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { getMineInfoApi, updateMineInfoApi, uploadAvatarApi } from '@/api/mine'
import { getAvatarPath, resolveAvatarSrc } from '@/utils/avatar'
import { useToast } from 'wot-design-uni'

const toast = useToast()
const DEFAULT_AVATAR = 'https://img.yzcdn.cn/vant/cat.jpeg'
const avatarRenderKey = ref(0)

const profileForm = reactive({
  nickname: '',
  avatar: '',
  avatarPreview: '',
  email: '',
  phone: ''
})

const updateAvatarPreview = (value: string, bustCache = false) => {
  profileForm.avatarPreview = resolveAvatarSrc(value, bustCache)
  avatarRenderKey.value += 1
}

const fetchProfile = async () => {
  try {
    const res = await getMineInfoApi()
    if (res.code === 200) {
      profileForm.nickname = res.data.nickname
      profileForm.avatar = getAvatarPath(res.data.avatar)
      updateAvatarPreview(profileForm.avatar)
      profileForm.email = res.data.email
      profileForm.phone = res.data.phone
    }
  } catch (error) {
    console.error('获取个人资料失败:', error)
  }
}

// 选择并上传头像
const chooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const previousAvatar = profileForm.avatar
      const previousAvatarPreview = profileForm.avatarPreview
      const tempFilePath = res.tempFilePaths[0]
      profileForm.avatarPreview = tempFilePath
      avatarRenderKey.value += 1
      try {
        toast.loading('上传中...')
        const uploadRes: any = await uploadAvatarApi(tempFilePath)
        if (uploadRes.code === 200) {
          profileForm.avatar = getAvatarPath(uploadRes.data)
          toast.success('头像上传成功')
        } else {
          profileForm.avatar = previousAvatar
          profileForm.avatarPreview = previousAvatarPreview
          avatarRenderKey.value += 1
          toast.error(uploadRes.msg || '头像上传失败')
        }
      } catch (error) {
        profileForm.avatar = previousAvatar
        profileForm.avatarPreview = previousAvatarPreview
        avatarRenderKey.value += 1
        console.error('上传头像错误:', error)
        toast.error('网络错误')
      }
    }
  })
}

onMounted(() => {
  fetchProfile()
  uni.setNavigationBarTitle({
    title: '个人信息修改'
  })
})

const handleSave = async () => {
  if (!profileForm.nickname) {
    toast.show('昵称不能为空')
    return
  }
  
  try {
    toast.loading('保存中...')

    const avatarPath = getAvatarPath(profileForm.avatar)

    const res = await updateMineInfoApi({
      nickname: profileForm.nickname,
      email: profileForm.email,
      avatar: avatarPath
    })
    
    if (res.code === 200) {
      const cachedUserInfo = uni.getStorageSync('userInfo') || {}
      uni.setStorageSync('userInfo', {
        ...cachedUserInfo,
        nickname: profileForm.nickname,
        email: profileForm.email,
        avatar: avatarPath
      })
      toast.success('保存成功')
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      toast.error(res.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    toast.error('网络错误，请稍后重试')
  }
}
</script>

<style lang="scss" scoped>
.edit-profile-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #eef5ff 0%, #f7f8fa 300rpx);
  padding: 30rpx;
  box-sizing: border-box;
}

/* 头像区域优化 */
.avatar-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 32rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 24rpx rgba(26, 95, 142, 0.05);

  .avatar-wrapper {
    position: relative;
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    border: 6rpx solid #fff;
    box-shadow: 0 8rpx 32rpx rgba(26, 95, 142, 0.12);
    
    .avatar-image {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }

    .camera-icon {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 52rpx;
      height: 52rpx;
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 4rpx solid #fff;
      box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
    }
  }

  .avatar-hint {
    margin-top: 24rpx;
    font-size: 26rpx;
    color: #7a8ba6;
    font-weight: 500;
  }
}

/* 表单卡片优化 */
.form-card {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 32rpx;
  padding: 10rpx 36rpx;
  box-shadow: 0 4rpx 24rpx rgba(26, 95, 142, 0.05);
  margin-bottom: 60rpx;

  .form-item {
    padding: 36rpx 0;
    border-bottom: 2rpx solid #f0f4f9;
    
    &:last-child {
      border-bottom: none;
    }

    .item-label {
      display: flex;
      align-items: center;
      font-size: 28rpx;
      color: #1a5f8e;
      font-weight: 600;
      margin-bottom: 20rpx;

      .label-icon {
        margin-right: 16rpx;
        opacity: 0.8;
      }
    }

    .item-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 4rpx;

      .phone-text {
        font-size: 30rpx;
        color: #5c6b80;
        letter-spacing: 1rpx;
      }

      .tip-text {
        font-size: 22rpx;
        color: #aab4c3;
        background: #f1f4f8;
        padding: 4rpx 12rpx;
        border-radius: 8rpx;
      }
    }

    &.readonly {
      .item-label {
        color: #7a8ba6;
      }
    }
  }
}

/* 底部按钮 */
.footer-action {
  margin-top: 60rpx;
  padding: 0 20rpx;
  
  :deep(.wd-button) {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
    border: none !important;
    border-radius: 100rpx !important;
    font-weight: bold;
    font-size: 32rpx;
    height: 96rpx !important;
    line-height: 96rpx !important;
    box-shadow: 0 12rpx 24rpx rgba(79, 172, 254, 0.3);
    transition: all 0.3s;

    &:active {
      transform: translateY(2rpx);
      box-shadow: 0 6rpx 12rpx rgba(79, 172, 254, 0.2);
    }
  }
}

/* 深度选择器覆盖 wot 样式 */
:deep(.wd-input) {
  width: 100%;
}
:deep(.wd-input__inner) {
  font-size: 30rpx !important;
  color: #2c3e50 !important;
  font-weight: 500;
}
:deep(.wd-input__placeholder) {
  color: #aab4c3 !important;
}
</style>
