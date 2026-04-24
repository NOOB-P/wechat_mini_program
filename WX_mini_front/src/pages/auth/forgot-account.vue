<template>
  <view class="forgot-account-page">
    <view class="form-container">
      <view class="input-group">
        <wd-input
          v-model="studentName"
          placeholder="请输入学生真实姓名"
          no-border
        />

        <wd-picker
          v-model="school"
          :columns="schoolColumns"
          placeholder="请选择所在的学校"
          @confirm="onSchoolConfirm"
          no-border
        />
      </view>
      <view class="action-btn">
        <wd-button type="primary" block @click="handleNext">下一步</wd-button>
      </view>
    </view>
    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'wot-design-uni'
import { getSchoolList, findAccountByStudentInfo } from '@/api/auth/forgot-account'

const toast = useToast()
const studentName = ref('')
const school = ref('')

const schoolColumns = ref<any[]>([])

const fetchSchoolList = async () => {
  try {
    const res = await getSchoolList()
    if (res.code === 200) {
      schoolColumns.value = res.data
    }
  } catch (error) {
    console.error('获取学校列表失败', error)
  }
}

onMounted(() => {
  fetchSchoolList()
})

const goBack = () => {
  uni.navigateBack()
}

const onSchoolConfirm = (event: any) => {
  const { value } = event.detail
  school.value = value
}

const handleNext = async () => {
  if (!studentName.value) {
    toast.show('请输入学生姓名')
    return
  }
  if (!school.value) {
    toast.show('请选择学校')
    return
  }
  
  uni.showLoading({ title: '正在查询...', mask: true })
  try {
    const res = await findAccountByStudentInfo({
      studentName: studentName.value,
      schoolId: school.value
    })
    
    if (res.code === 200) {
      toast.success(res.msg || '查询成功，账号已通过短信发送')
      setTimeout(() => {
        uni.hideLoading()
        uni.navigateBack()
      }, 1500)
    } else {
      uni.hideLoading()
      toast.error(res.msg || '查询失败')
    }
  } catch (error: any) {
    uni.hideLoading()
    toast.error(error.msg || '查询失败')
  }
}
</script>

<style lang="scss" scoped>
.forgot-account-page {
  min-height: 100vh;
  background-color: #fff;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
}

.form-container {
  flex: 1;
  margin-top: 40rpx;

  .input-group {
    display: flex;
    flex-direction: column;
    
    :deep(.wd-input), :deep(.wd-picker) {
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

  .action-btn {
    margin-top: 80rpx;
  }
}
</style>
