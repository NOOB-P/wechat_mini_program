<template>
  <view class="edit-profile-container">
    <view class="form-group">
      <view class="avatar-section" @click="chooseAvatar">
        <wd-img
          :width="80"
          :height="80"
          round
          :src="profileForm.avatar || 'https://img.yzcdn.cn/vant/cat.jpeg'"
          class="avatar-img"
        />
        <text class="change-avatar-hint">点击更换头像</text>
      </view>

      <wd-cell-group border>
        <wd-input
          label="昵称"
          v-model="profileForm.nickname"
          placeholder="请输入昵称"
          clearable
        />
        <wd-input
          label="邮箱"
          v-model="profileForm.email"
          placeholder="请输入邮箱"
          clearable
        />
        <wd-input
          label="手机号"
          v-model="profileForm.phone"
          readonly
          no-border
        />
      </wd-cell-group>
    </view>

    <view class="save-btn-container">
      <wd-button type="primary" block @click="handleSave">保存修改</wd-button>
    </view>

    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { getMineInfoApi, updateMineInfoApi, uploadAvatarApi } from '@/api/mine'
import { useToast } from 'wot-design-uni'

const toast = useToast()

const profileForm = reactive({
  nickname: '',
  avatar: '',
  email: '',
  phone: ''
})

const fetchProfile = async () => {
  try {
    const res = await getMineInfoApi()
    if (res.code === 200) {
      profileForm.nickname = res.data.nickname
      profileForm.avatar = res.data.avatar && !res.data.avatar.startsWith('http') ? __VITE_SERVER_BASEURL__ + res.data.avatar : res.data.avatar
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
      const tempFilePath = res.tempFilePaths[0]
      try {
        toast.loading('上传中...')
        const uploadRes: any = await uploadAvatarApi(tempFilePath)
        if (uploadRes.code === 200) {
          const path = uploadRes.data
          profileForm.avatar = path.startsWith('http') ? path : __VITE_SERVER_BASEURL__ + path
          toast.success('头像上传成功')
        }
      } catch (error) {
        console.error('上传头像错误:', error)
        toast.error('网络错误')
      }
    }
  })
}

onMounted(() => {
  fetchProfile()
})

const handleSave = async () => {
  if (!profileForm.nickname) {
    toast.show('昵称不能为空')
    return
  }
  
  try {
    toast.loading('保存中...')
    
    // 修正：保存时去除 BaseURL 前缀，只存相对路径
    let avatarPath = profileForm.avatar
    if (avatarPath && avatarPath.startsWith(__VITE_SERVER_BASEURL__)) {
      avatarPath = avatarPath.replace(__VITE_SERVER_BASEURL__, '')
    }

    const res = await updateMineInfoApi({
      nickname: profileForm.nickname,
      email: profileForm.email,
      avatar: avatarPath
    })
    
    if (res.code === 200) {
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
  background-color: #f8f9fa;
  padding: 20rpx 0;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
  background-color: #fff;
  margin-bottom: 20rpx;
  
  .change-avatar-hint {
    font-size: 24rpx;
    color: #999;
    margin-top: 20rpx;
  }
}

.form-group {
  margin-bottom: 60rpx;
}

.save-btn-container {
  padding: 0 40rpx;
}

:deep(.wd-cell) {
  padding: 32rpx !important;
}

:deep(.wd-input__label) {
  font-size: 30rpx;
  color: #333;
}
</style>
