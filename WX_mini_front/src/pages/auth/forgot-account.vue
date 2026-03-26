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
  
  try {
    toast.loading('正在查询...')
    const res = await findAccountByStudentInfo({
      studentName: studentName.value,
      schoolId: school.value
    })
    
    if (res.code === 200) {
      toast.success(res.msg || '查询成功，账号已通过短信发送')
      setTimeout(() => uni.navigateBack(), 1500)
    } else {
      toast.error(res.msg || '查询失败')
    }
  } catch (error: any) {
    toast.error(error.msg || '查询失败')
  }
}
</script>

<style lang="scss" scoped>
.forgot-account-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 120rpx 32rpx 32rpx; // 增加了顶部的 padding (原来是 32rpx) 避免被刘海屏挡住
  box-sizing: border-box;
}

.header {
  display: flex;
  align-items: center;
  padding: 40rpx 0; // 增加了内边距
  margin-bottom: 60rpx; // 增加与下方卡片的距离
  position: relative; // 增加定位以便于扩大点击区域而不影响布局
  z-index: 10;
  .back-icon {
    font-size: 44rpx !important; // 稍微放大一点图标
    color: #333;
    padding: 20rpx; // 增加点击区域
    margin-left: -20rpx; // 抵消 padding 带来的位移
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
