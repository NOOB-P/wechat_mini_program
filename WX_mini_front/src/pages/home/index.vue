<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useToast } from 'wot-design-uni'
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

    <view class="header">
      <text class="title">首页</text>
    </view>

    <view class="content">
      <view class="welcome-card">
        <image class="welcome-bg" :src="staticBaseUrl + '/home/bg.png'" mode="aspectFill" />
        <view class="welcome-info">
          <view class="user-header">
            <text class="user-name">{{ userInfo.nickname || '用户' }}</text>
            <view class="grade-tag" v-if="userInfo.isBoundStudent === 1">{{ userInfo.grade }}</view>
          </view>
          <text class="welcome-title">欢迎回来</text>
          <text class="welcome-desc">开启今日专注计划。</text>
          <view class="logo-box">LOGO</view>
        </view>
      </view>

      <view class="function-banner" @click="handleGridClick('analysis')">
        <view class="banner-content">
          <image class="banner-icon-img" :src="staticBaseUrl + '/home/analysis.png'" mode="aspectFit" />
          <view class="banner-text-wrap">
            <text class="banner-title">学情分析</text>
            <text class="banner-desc">查看近期考试趋势和学科表现。</text>
          </view>
        </view>
        <wd-icon name="expand" size="20px" color="#ccc" />
      </view>

      <view class="banner-swiper-wrap">
        <swiper
          class="banner-swiper"
          circular
          autoplay
          :interval="3000"
          :duration="500"
          indicator-dots
          indicator-color="rgba(255, 255, 255, 0.5)"
          indicator-active-color="#ffffff"
        >
          <swiper-item
            v-for="(img, index) in [staticBaseUrl + '/home/banner_bg.png', staticBaseUrl + '/home/banner_bg.png']"
            :key="index"
          >
            <image class="swiper-img" :src="img" mode="aspectFill" @click="handleBannerClick" />
          </swiper-item>
        </swiper>
      </view>

      <view class="eval-section">
        <view class="eval-grid">
          <view class="eval-item" @click="handleGridClick('academic')">
            <image class="eval-icon" :src="staticBaseUrl + '/home/academic_eval.png'" mode="widthFix" />
            <text class="eval-text">试卷库</text>
          </view>
          <view class="eval-item" @click="handleGridClick('character')">
            <image class="eval-icon" :src="staticBaseUrl + '/home/character_eval.png'" mode="widthFix" />
            <text class="eval-text">个人档案</text>
          </view>
          <view class="eval-item" @click="handleGridClick('homework')">
            <image class="eval-icon" :src="staticBaseUrl + '/home/homework_check.png'" mode="widthFix" />
            <text class="eval-text">作业检查</text>
          </view>
        </view>
      </view>

      <view class="section-header">
        <text class="section-title">推荐课程</text>
        <text class="section-more" @click="navTo('/pages/course/index')">更多</text>
      </view>

      <view class="recommend-list">
        <view
          class="recommend-item"
          v-for="course in recommendCourses"
          :key="course.id"
          @click="handleCourseClick(course)"
        >
          <view class="img-wrap">
            <wd-img :src="course.image" :width="160" :height="100" round class="item-img" />
            <view class="svip-tag" v-if="!isSVIPUser">SVIP</view>
          </view>
          <view class="item-info">
            <view class="name-wrap">
              <text class="item-name">{{ course.name }}</text>
              <wd-icon
                v-if="!isSVIPUser"
                name="lock-on"
                size="14px"
                color="#f6d365"
                style="margin-left: 8rpx;"
              />
            </view>
            <view class="item-bottom">
              <text class="item-price">￥{{ course.price }}</text>
              <wd-button type="primary" size="small" plain>去学习</wd-button>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.index-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 0 30rpx 40rpx;
  position: relative;
}

.page-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 0;
}

.header {
  position: relative;
  z-index: 1;
  padding: 40rpx 0 20rpx;
  display: flex;
  justify-content: center;
  align-items: center;

  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
}

.content {
  position: relative;
  z-index: 1;

  .welcome-card {
    position: relative;
    padding: 40rpx;
    border-radius: 20rpx;
    margin-bottom: 30rpx;
    overflow: hidden;
    box-shadow: 0 8rpx 24rpx rgba(0, 122, 255, 0.1);
    background-color: #eaf3ff;

    .welcome-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
    }

    .welcome-info {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      width: 100%;

      .user-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20rpx;

        .user-name {
          font-size: 36rpx;
          font-weight: bold;
          color: #0052d9;
          margin-right: 20rpx;
        }

        .grade-tag {
          font-size: 24rpx;
          color: #fff;
          background: linear-gradient(90deg, #8cb8ff, #5a94ff);
          padding: 6rpx 24rpx;
          border-radius: 30rpx;
          border: 2rpx solid #ffffff;
          box-shadow: 0 4rpx 8rpx rgba(77, 141, 245, 0.2);
        }
      }

      .welcome-title {
        color: #333;
        font-size: 28rpx;
        margin-bottom: 8rpx;
      }

      .welcome-desc {
        color: #666;
        font-size: 24rpx;
        margin-bottom: 20rpx;
      }

      .logo-box {
        width: 80rpx;
        height: 80rpx;
        background: linear-gradient(135deg, #7ab0ff, #4d8df5);
        color: #fff;
        font-size: 20rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 16rpx;
        font-weight: bold;
      }
    }
  }

  .function-banner {
    background: #fff;
    border-radius: 24rpx;
    padding: 40rpx 30rpx;
    margin-bottom: 40rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
    display: flex;
    justify-content: space-between;
    align-items: center;

    .banner-content {
      display: flex;
      align-items: center;
      gap: 30rpx;
    }

    .banner-icon-img {
      width: 120rpx;
      height: 120rpx;
    }

    .banner-text-wrap {
      display: flex;
      flex-direction: column;
      gap: 8rpx;

      .banner-title {
        font-size: 34rpx;
        font-weight: bold;
        color: #333;
      }

      .banner-desc {
        font-size: 24rpx;
        color: #999;
      }
    }
  }

  .banner-swiper-wrap {
    margin-bottom: 40rpx;
    border-radius: 24rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
    transform: translateY(0);

    .banner-swiper {
      width: 100%;
      height: 220rpx;

      .swiper-img {
        width: 100%;
        height: 100%;
        display: block;
      }
    }
  }

  .eval-section {
    margin-bottom: 40rpx;

    .eval-grid {
      display: flex;
      justify-content: space-between;
      gap: 20rpx;

      .eval-item {
        flex: 1;
        background-color: transparent;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;

        .eval-icon {
          width: 100%;
          display: block;
        }

        .eval-text {
          position: absolute;
          bottom: 20rpx;
          font-size: 26rpx;
          color: #333;
          font-weight: 500;
        }
      }
    }
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .section-title {
      font-size: 34rpx;
      font-weight: bold;
      color: #333;
    }

    .section-more {
      font-size: 24rpx;
      color: #999;
    }
  }

  .recommend-list {
    .recommend-item {
      background-color: #fff;
      border-radius: 20rpx;
      padding: 24rpx;
      margin-bottom: 24rpx;
      display: flex;
      gap: 24rpx;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.02);

      .img-wrap {
        position: relative;

        .svip-tag {
          position: absolute;
          top: 0;
          left: 0;
          background: linear-gradient(135deg, #333 0%, #1a1a1a 100%);
          color: #f6d365;
          font-size: 20rpx;
          padding: 4rpx 12rpx;
          border-radius: 16rpx 0 16rpx 0;
          z-index: 1;
        }
      }

      .item-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .name-wrap {
          display: flex;
          align-items: center;
          margin-bottom: 8rpx;
        }

        .item-name {
          font-size: 30rpx;
          font-weight: 500;
          color: #333;
        }

        .item-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .item-price {
            font-size: 32rpx;
            font-weight: bold;
            color: #f44336;
          }
        }
      }
    }
  }
}
</style>
