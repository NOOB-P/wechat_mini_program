<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useToast } from 'wot-design-uni'
import WelcomeCard from './components/WelcomeCard.vue'
import FunctionBanner from './components/FunctionBanner.vue'
import BannerSwiper from './components/BannerSwiper.vue'
import EvalSection from './components/EvalSection.vue'
import RecommendList from './components/RecommendList.vue'
import {
  getHomeStatsApi,
  getHomeBannersApi,
  getHomePublicCoursesApi,
  getWechatCustomerServiceByLocationApi
} from '@/api/index'
import { getCourseListApi } from '@/api/course'
import { getUserInfoApi } from '@/api/mine'
import { openEnterpriseCustomerServiceChat } from '@/utils/customer-service'

const toast = useToast()

const stats = ref({
  paperCount: 0,
  wrongCount: 0,
  analysisProgress: 0
})

const banners = ref<any[]>([])
const publicCourses = ref<any[]>([])
const recommendCourses = ref<any[]>([])
const isSVIPUser = ref(false)
const userInfo = ref<any>({})

const staticBaseUrl = __VITE_SERVER_BASEURL__ + '/static'
const systemInfo = uni.getSystemInfoSync()
const statusBarHeight = ref(systemInfo.statusBarHeight || 44)

const handleBannerClick = async () => {
  try {
    toast.loading('加载中...')
    const res = await getWechatCustomerServiceByLocationApi('HOME_BANNER')
    if (res.code !== 200 || !res.data) {
      toast.show(res.msg || '客服暂不可用')
      return
    }
    await openEnterpriseCustomerServiceChat(res.data)
  } catch (error) {
    console.error('Failed to open customer service chat:', error)
    toast.error((error as any)?.msg || '无法打开客服会话')
  } finally {
    toast.close()
  }
}

const loadData = async () => {
  try {
    const [statsRes, bannersRes, publicRes, coursesRes, userRes] = await Promise.all([
      getHomeStatsApi(),
      getHomeBannersApi(),
      getHomePublicCoursesApi(),
      getCourseListApi({ isRecommend: 1 }),
      getUserInfoApi()
    ])
    if (statsRes.code === 200) stats.value = statsRes.data
    if (bannersRes.code === 200) banners.value = bannersRes.data
    if (publicRes.code === 200) publicCourses.value = publicRes.data
    if (coursesRes.code === 200) {
      recommendCourses.value = coursesRes.data.map((item: any) => ({
        ...item,
        name: item.title,
        image:
          item.cover && !item.cover.startsWith('http')
            ? __VITE_SERVER_BASEURL__ + item.cover
            : item.cover
      }))
    }
    if (userRes.code === 200) {
      isSVIPUser.value = userRes.data.isSvip === 1
      userInfo.value = userRes.data
      uni.setStorageSync('userInfo', userRes.data)
    }
  } catch (error) {
    console.error('Failed to load home data:', error)
  }
}

onShow(() => {
  loadData()
})

const handleGridClick = (type: string) => {
  if (type === 'analysis') {
    uni.navigateTo({ url: `/subpkg_analysis/pages/score/index?phone=${userInfo.value.phone || ''}` })
  } else if (type === 'academic') {
    uni.navigateTo({ url: '/subpkg_resource/pages/paper' })
  } else if (type === 'character' || type === 'homework') {
    toast.show('敬请期待')
  }
}

const navTo = (url: string) => {
  const subpkgMap: Record<string, string> = {
    '/pages/course/index': '/subpkg_course/pages/course/index'
  }
  uni.navigateTo({ url: subpkgMap[url] || url })
}

const goToRecharge = () => {
  uni.navigateTo({ url: '/subpkg_course/pages/vip/recharge' })
}

const joinRoom = () => {
  toast.loading('正在分配座位...')
  setTimeout(() => {
    toast.success('加入成功')
  }, 1500)
}

const handleCourseClick = (course: any) => {
  if (course.isPublic || isSVIPUser.value) {
    uni.navigateTo({
      url: `/subpkg_course/pages/course/detail?id=${course.id}`
    })
  } else {
    uni.showModal({
      title: 'SVIP 课程',
      content: '此课程需要 SVIP 权限才能访问。',
      confirmText: '去升级',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({ url: '/subpkg_course/pages/vip/recharge?type=SVIP' })
        }
      }
    })
  }
}
</script>

<template>
  <view class="index-container">
    <image class="page-bg" :src="staticBaseUrl + '/home/page_bg.png'" mode="widthFix" />
    <wd-toast id="wd-toast" />

    <view class="content">
      <WelcomeCard :userInfo="userInfo" :staticBaseUrl="staticBaseUrl" />

      <FunctionBanner :staticBaseUrl="staticBaseUrl" @click="handleGridClick('analysis')" />

      <BannerSwiper :staticBaseUrl="staticBaseUrl" @click="handleBannerClick" />

      <EvalSection :staticBaseUrl="staticBaseUrl" @click="handleGridClick" />

      <RecommendList
        :recommendCourses="recommendCourses"
        :isSVIPUser="isSVIPUser"
        @click="handleCourseClick"
        @more="navTo('/pages/course/index')"
      />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.index-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 10rpx 24rpx 30rpx;
  position: relative;
}

.page-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 0;
}

.content {
  position: relative;
  z-index: 1;
}
</style>
