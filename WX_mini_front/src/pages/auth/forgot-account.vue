<template>
  <view class="forgot-account-page">
    <view class="header">
      <wd-icon name="arrow-left" custom-class="back-icon" @click="goBack" />
      <view class="title">忘记账号</view>
    </view>

    <view class="form-card">
      <wd-input
        v-model="studentName"
        label="学生姓名"
        placeholder="请输入学生真实姓名"
        clearable
      />
      <wd-picker
        v-model="school"
        :columns="schoolColumns"
        label="学校信息"
        placeholder="请选择所在的学校"
        @confirm="onSchoolConfirm"
      />
      <wd-button type="primary" block custom-class="next-btn" @click="handleNext">下一步</wd-button>
    </view>
    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'wot-design-uni'

const toast = useToast()
const studentName = ref('')
const school = ref('')

// MOCK: 模拟学校列表数据
const schoolColumns = ref([
  { label: '第一中学', value: '1' },
  { label: '第二实验小学', value: '2' },
  { label: '第三国际学校', value: '3' },
])

const goBack = () => {
  uni.navigateBack()
}

const onSchoolConfirm = (event: any) => {
  const { value } = event.detail
  school.value = value
}

const handleNext = () => {
  if (!studentName.value) {
    toast.show('请输入学生姓名')
    return
  }
  if (!school.value) {
    toast.show('请选择学校')
    return
  }
  toast.loading('正在查询...')
  // MOCK: 模拟查询账号
  setTimeout(() => {
    toast.success('查询成功，账号已通过短信发送')
    // 可以在这里跳转到结果页或返回登录页
    setTimeout(() => uni.navigateBack(), 1500)
  }, 1000)
}
</script>

<style lang="scss" scoped>
.forgot-account-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 32rpx;
  box-sizing: border-box;
}

.header {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  margin-bottom: 40rpx;
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
    transform: translateX(-20rpx);
  }
}

.form-card {
  background-color: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;

  .next-btn {
    margin-top: 20rpx;
    --wd-button-primary-bg-color: #00c8a0;
    --wd-button-primary-border-color: #00c8a0;
  }
}
</style>
