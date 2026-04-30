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
      <wd-cell-group border custom-class="cell-group-custom">
        <wd-picker 
          :columns="provinces" 
          label="省份" 
          v-model="selectedProvince" 
          placeholder="请选择省份" 
          @confirm="handleProvinceConfirm" 
          align-right
        />
        <wd-picker 
          :columns="cities" 
          label="城市" 
          v-model="selectedCity" 
          placeholder="请选择城市" 
          :disabled="!selectedProvince" 
          @confirm="handleCityConfirm" 
          align-right
        />
        <wd-picker 
          :columns="schools" 
          label="学校" 
          v-model="selectedSchool" 
          placeholder="请选择学校" 
          :disabled="!selectedCity" 
          @confirm="handleSchoolConfirm" 
          align-right
        />
        <wd-picker 
          :columns="grades" 
          label="年级" 
          v-model="selectedGrade" 
          placeholder="请选择年级" 
          :disabled="!selectedSchool" 
          @confirm="handleGradeConfirm" 
          align-right
        />
        <wd-picker 
          :columns="classes" 
          label="班级" 
          v-model="selectedClass" 
          placeholder="请选择班级" 
          :disabled="!selectedGrade" 
          @confirm="handleClassConfirm" 
          align-right
        />
        <wd-picker 
          :columns="students" 
          label="学生" 
          v-model="selectedStudentId" 
          placeholder="请选择学生" 
          :disabled="!selectedClass" 
          align-right
        />
      </wd-cell-group>

      <view class="parent-info-section">
        <wd-cell-group border custom-class="cell-group-custom">
          <wd-input v-model="form.phone" label="手机号" placeholder="请输入手机号" disabled align-right />
        </wd-cell-group>
      </view>

      <view class="action-btn">
        <wd-button type="primary" block custom-class="bind-btn" @click="handleBind">确认绑定</wd-button>
      </view>

      <!-- <view class="sub-actions">
        <text class="link" @click="gotoForgotAccount">忘记账号？</text>
        <text class="link" @click="gotoForgotPassword">忘记密码？</text>
      </view> -->
    </view>

    <view class="footer-notice">
      提醒：一个手机号只能绑定1个学生账号，一个学生可以多个手机号绑定，如果超过上限，请先进入「我的-绑定学生账号」点击解绑。
    </view>
    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { onLoad, onNavigationBarButtonTap } from '@dcloudio/uni-app'
import { useToast } from 'wot-design-uni'
import { 
  bindStudentAccount, 
  getProvinces, 
  getCities, 
  getSchools, 
  getGrades, 
  getClasses, 
  getStudents 
} from '@/api/auth/bind-student'

const toast = useToast()

// 级联选择数据
const provinces = ref<any[]>([])
const cities = ref<any[]>([])
const schools = ref<any[]>([])
const grades = ref<any[]>([])
const classes = ref<any[]>([])
const students = ref<any[]>([])

// 选中值
const selectedProvince = ref('')
const selectedCity = ref('')
const selectedSchool = ref('')
const selectedGrade = ref('')
const selectedClass = ref('')
const selectedStudentId = ref('')

const props = defineProps<{
  phone?: string
}>()

const form = reactive({
  phone: props.phone || ''
})

onMounted(async () => {
  // 如果 props 中没有 phone，尝试从当前页面 options 获取（兼容 onLoad）
  if (!form.phone) {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1] as any
    const options = currentPage.options || currentPage.$page?.options
    if (options && options.phone) {
      form.phone = options.phone
    }
  }
  
  // 页面加载时获取省份
  const res = await getProvinces()
  if (res.code === 200) {
    provinces.value = res.data.map((p: string) => ({ label: p, value: p }))
  }
})

// 处理省份选择
const handleProvinceConfirm = async (e: any) => {
  const province = Array.isArray(e.value) ? e.value[0] : e.value
  if (!province) return

  selectedCity.value = ''
  selectedSchool.value = ''
  selectedGrade.value = ''
  selectedClass.value = ''
  selectedStudentId.value = ''
  
  const res = await getCities(province)
  if (res.code === 200) {
    cities.value = res.data.map((c: string) => ({ label: c, value: c }))
  }
}

// 处理城市选择
const handleCityConfirm = async (e: any) => {
  const city = Array.isArray(e.value) ? e.value[0] : e.value
  if (!city) return

  selectedSchool.value = ''
  selectedGrade.value = ''
  selectedClass.value = ''
  selectedStudentId.value = ''

  const res = await getSchools(city)
  if (res.code === 200) {
    schools.value = res.data.map((s: any) => ({ label: s.name, value: s.schoolId }))
  }
}

// 处理学校选择
const handleSchoolConfirm = async (e: any) => {
  const schoolId = Array.isArray(e.value) ? e.value[0] : e.value
  if (!schoolId) return

  selectedGrade.value = ''
  selectedClass.value = ''
  selectedStudentId.value = ''

  const res = await getGrades(schoolId)
  if (res.code === 200) {
    grades.value = res.data.map((g: string) => ({ label: g, value: g }))
  }
}

// 处理年级选择
const handleGradeConfirm = async (e: any) => {
  const grade = Array.isArray(e.value) ? e.value[0] : e.value
  if (!grade) return

  selectedClass.value = ''
  selectedStudentId.value = ''

  const res = await getClasses(selectedSchool.value, grade)
  if (res.code === 200) {
    classes.value = res.data.map((c: string) => ({ label: c, value: c }))
  }
}

// 处理班级选择
const handleClassConfirm = async (e: any) => {
  const className = Array.isArray(e.value) ? e.value[0] : e.value
  if (!className) return

  selectedStudentId.value = ''

  const res = await getStudents(selectedSchool.value, selectedGrade.value, className)
  if (res.code === 200) {
    students.value = res.data.map((s: any) => ({ label: s.name, value: s.id }))
  }
}

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

const handleBind = async () => {
  const { phone } = form
  const studentId = selectedStudentId.value
  
  if (!studentId) {
    uni.showToast({ title: '请选择学生', icon: 'none' })
    return
  }
  
  uni.showLoading({ title: '绑定中...', mask: true })
  try {
    const res = await bindStudentAccount({
      studentId,
      phone
    })
    
    if (res.code === 200) {
      uni.hideLoading()
      uni.showToast({ title: '绑定成功', icon: 'success' })
      // 绑定成功后，销毁当前页进入首页
      setTimeout(() => {
        uni.switchTab({ url: '/pages/home/index' })
      }, 1500)
    } else {
      uni.hideLoading()
      uni.showToast({ title: res.msg || '绑定失败', icon: 'none' })
    }
  } catch (error: any) {
    uni.hideLoading()
    uni.showToast({ title: error.msg || '绑定失败', icon: 'none' })
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

  .cell-group-custom {
    border-radius: 16rpx;
    overflow: hidden;
    background-color: #fff;
  }

  .parent-info-section {
    margin-top: 30rpx;
  }

  .action-btn {
    margin-top: 60rpx;
    padding: 0 20rpx;
  }

  .sub-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 40rpx;
    padding: 0 30rpx;

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
