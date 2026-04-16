<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getCourseListApi, buyCourseApi } from '@/api/course'
import { resolveUploadSrc } from '@/utils/upload'

type CourseFilter = 'all' | 'free' | 'paid' | 'purchased'

const DEFAULT_COVER = 'https://img.yzcdn.cn/vant/cat.jpeg'

const searchValue = ref('')
const activeFilter = ref<CourseFilter>('all')
const isLoading = ref(false)
const courses = ref<any[]>([])
const topShellHeight = ref(320)

const filterOptions: Array<{ label: string; value: CourseFilter }> = [
  { label: '全部课程', value: 'all' },
  { label: '免费内容', value: 'free' },
  { label: '付费精品', value: 'paid' },
  { label: '已购课程', value: 'purchased' }
]

const toPlainText = (value?: string) =>
  (value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

const normalizeCourse = (item: any) => ({
  ...item,
  price: Number(item.price || 0),
  cover: item.cover ? resolveUploadSrc(item.cover) : DEFAULT_COVER,
  plainContent: toPlainText(item.content)
})

const filteredCourses = computed(() => {
  const keyword = searchValue.value.trim().toLowerCase()

  return courses.value.filter((item) => {
    const matchesKeyword =
      !keyword ||
      (item.title || '').toLowerCase().includes(keyword) ||
      item.plainContent.toLowerCase().includes(keyword)

    if (!matchesKeyword) return false

    if (activeFilter.value === 'free') return item.price <= 0
    if (activeFilter.value === 'paid') return item.price > 0
    if (activeFilter.value === 'purchased') return !!item.isPurchased
    return true
  })
})

const totalCount = computed(() => courses.value.length)
const freeCount = computed(() => courses.value.filter((item) => item.price <= 0).length)
const purchasedCount = computed(() => courses.value.filter((item) => item.isPurchased).length)

const measureTopShell = () => {
  nextTick(() => {
    const query = uni.createSelectorQuery()
    query.select('#course-top-shell').boundingClientRect((rect: any) => {
      if (rect?.height) {
        topShellHeight.value = rect.height + 12
      }
    }).exec()
  })
}

const getCourseList = async () => {
  isLoading.value = true
  try {
    const res = await getCourseListApi()
    if (res.code === 200) {
      courses.value = (res.data || []).map(normalizeCourse)
    }
  } catch (error) {
    console.error('获取课程列表失败:', error)
    uni.showToast({ title: '课程加载失败', icon: 'none' })
  } finally {
    isLoading.value = false
  }
}

const handleCourseClick = (course: any) => {
  uni.navigateTo({
    url: `/pages/course/detail?id=${course.id}`
  })
}

const handleBuy = async (event: any, course: any) => {
  event.stopPropagation()

  if (course.isPurchased || course.price <= 0) {
    uni.navigateTo({ url: `/pages/course/detail?id=${course.id}` })
    return
  }

  try {
    const res = await buyCourseApi(course.id)
    if (res.code === 200) {
      const orderData = encodeURIComponent(JSON.stringify(res.data))
      uni.navigateTo({
        url: `/pages/course/pay?order=${orderData}`
      })
    } else {
      uni.showToast({ title: res.msg || '下单失败', icon: 'none' })
    }
  } catch (error) {
    console.error('课程下单失败:', error)
    uni.showToast({ title: '网络错误', icon: 'none' })
  }
}

const getActionText = (course: any) => {
  if (course.price > 0 && !course.isPurchased) return '立即购买'
  return '开始学习'
}

const getPriceText = (course: any) => {
  if (course.price <= 0) return '免费'
  return `￥${course.price}`
}

const getBadgeText = (course: any) => {
  if (course.isPurchased) return '已购'
  if (course.price <= 0) return '公益'
  return '精选'
}

onShow(() => {
  uni.setNavigationBarTitle({
    title: '精选课程'
  })

  const token = uni.getStorageSync('token')
  if (!token) {
    uni.reLaunch({ url: '/pages/login/index' })
    return
  }

  getCourseList()
  measureTopShell()
})

onMounted(() => {
  measureTopShell()
})
</script>

<template>
  <view class="course-page">
    <view class="page-glow glow-a"></view>
    <view class="page-glow glow-b"></view>

    <view id="course-top-shell" class="top-shell">
      <view class="hero-card">
        <view class="hero-copy">
          <text class="hero-eyebrow">COURSE PICKS</text>
          <text class="hero-title">找到一门真正适合孩子的课</text>
          <text class="hero-subtitle">搜索、筛选、购买都集中在顶部，课程内容独立滚动</text>
        </view>

        <view class="stats-row">
          <view class="stat-pill">
            <text class="stat-number">{{ totalCount }}</text>
            <text class="stat-label">全部</text>
          </view>
          <view class="stat-pill stat-pill-accent">
            <text class="stat-number">{{ freeCount }}</text>
            <text class="stat-label">免费</text>
          </view>
          <view class="stat-pill">
            <text class="stat-number">{{ purchasedCount }}</text>
            <text class="stat-label">已购</text>
          </view>
        </view>

        <view class="search-shell">
          <wd-search
            v-model="searchValue"
            placeholder="搜索课程名称或课程内容"
            hide-cancel
            custom-style="background: transparent;"
          />
        </view>

        <scroll-view scroll-x class="filter-scroll" show-scrollbar="false">
          <view class="filter-row">
            <view
              v-for="item in filterOptions"
              :key="item.value"
              class="filter-chip"
              :class="{ active: activeFilter === item.value }"
              @click="activeFilter = item.value"
            >
              <text>{{ item.label }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <scroll-view
      scroll-y
      class="course-scroll"
      enhanced
      show-scrollbar="false"
      :style="{ top: `${topShellHeight}px` }"
    >
      <view class="scroll-inner">
        <view class="result-bar">
          <view>
            <text class="result-title">课程列表</text>
            <text class="result-subtitle">当前为您找到 {{ filteredCourses.length }} 门课程</text>
          </view>
          <text class="result-keyword" v-if="searchValue">{{ searchValue }}</text>
        </view>

        <view class="loading-list" v-if="isLoading">
          <view v-for="index in 3" :key="index" class="skeleton-card"></view>
        </view>

        <view class="course-list" v-else-if="filteredCourses.length > 0">
          <view
            v-for="course in filteredCourses"
            :key="course.id"
            class="course-card"
            @click="handleCourseClick(course)"
          >
            <view class="cover-wrap">
              <image :src="course.cover" mode="aspectFill" class="course-cover" />
              <view class="cover-badge" :class="{ purchased: course.isPurchased, free: course.price <= 0 }">
                {{ getBadgeText(course) }}
              </view>
            </view>

            <view class="course-main">
              <view class="course-head">
                <text class="course-title">{{ course.title }}</text>
                <view class="course-status" :class="{ purchased: course.isPurchased }">
                  {{ course.isPurchased ? '已解锁' : course.price > 0 ? '待购买' : '可直接学习' }}
                </view>
              </view>

              <text class="course-desc">
                {{ course.plainContent || '课程详情正在完善中，点击进入可查看完整内容。' }}
              </text>

              <view class="course-meta">
                <view class="meta-chip">
                  <text>{{ course.price <= 0 ? '公益课程' : '精品课程' }}</text>
                </view>
                <view class="meta-chip meta-chip-soft" v-if="course.isPurchased">
                  <text>已购可反复学习</text>
                </view>
              </view>

              <view class="course-foot">
                <text class="course-price" :class="{ free: course.price <= 0 }">
                  {{ getPriceText(course) }}
                </text>
                <view
                  class="action-btn"
                  :class="{ purchased: course.isPurchased || course.price <= 0 }"
                  @click.stop="handleBuy($event, course)"
                >
                  <text>{{ getActionText(course) }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="empty-state" v-else>
          <wd-img
            :width="120"
            :height="120"
            src="https://img.yzcdn.cn/vant/empty-image-default.png"
          />
          <text class="empty-title">没有找到匹配课程</text>
          <text class="empty-text">可以换个关键词，或者切换上面的筛选条件试试看</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
@mixin ellipsis($lines: 1) {
  @if $lines == 1 {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  } @else {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: $lines;
    overflow: hidden;
  }
}

.course-page {
  height: 100vh;
  overflow: hidden;
  position: relative;
  background:
    radial-gradient(circle at top left, rgba(135, 206, 250, 0.2) 0, transparent 36%),
    linear-gradient(180deg, #edf8ff 0%, #f7f8fa 42%, #f7f8fa 100%);
}

.page-glow {
  position: absolute;
  border-radius: 999rpx;
  filter: blur(30rpx);
  opacity: 0.55;
  pointer-events: none;
}

.glow-a {
  width: 220rpx;
  height: 220rpx;
  background: rgba(0, 194, 255, 0.18);
  top: 20rpx;
  right: -40rpx;
}

.glow-b {
  width: 180rpx;
  height: 180rpx;
  background: rgba(120, 255, 214, 0.18);
  top: 220rpx;
  left: -20rpx;
}

.top-shell {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1200;
  padding: 22rpx 24rpx 0;
  box-sizing: border-box;
}

.hero-card {
  border-radius: 36rpx;
  padding: 28rpx 24rpx 22rpx;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(24rpx);
  box-shadow: 0 16rpx 44rpx rgba(21, 92, 141, 0.08);
  border: 1rpx solid rgba(255, 255, 255, 0.7);
}

.hero-copy {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.hero-eyebrow {
  font-size: 20rpx;
  font-weight: 700;
  letter-spacing: 3rpx;
  color: #4f8ecb;
}

.hero-title {
  font-size: 42rpx;
  line-height: 1.22;
  font-weight: 700;
  color: #17334d;
}

.hero-subtitle {
  font-size: 24rpx;
  line-height: 1.5;
  color: #6f859a;
}

.stats-row {
  display: flex;
  gap: 14rpx;
  margin-top: 22rpx;
}

.stat-pill {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  padding: 18rpx 18rpx 16rpx;
  border-radius: 24rpx;
  background: rgba(244, 250, 255, 0.95);
}

.stat-pill-accent {
  background: linear-gradient(135deg, rgba(229, 255, 247, 0.95) 0%, rgba(240, 252, 255, 0.95) 100%);
}

.stat-number {
  font-size: 34rpx;
  font-weight: 700;
  color: #1f4d75;
}

.stat-label {
  font-size: 22rpx;
  color: #7a8fa4;
}

.search-shell {
  margin-top: 22rpx;
  padding: 8rpx;
  border-radius: 999rpx;
  background: rgba(248, 251, 255, 0.96);
  box-shadow: inset 0 0 0 1rpx rgba(97, 151, 197, 0.08);
}

.filter-scroll {
  margin-top: 18rpx;
  white-space: nowrap;
}

.filter-row {
  display: inline-flex;
  gap: 14rpx;
  padding-right: 8rpx;
}

.filter-chip {
  min-width: 148rpx;
  padding: 14rpx 22rpx;
  border-radius: 999rpx;
  background: rgba(241, 247, 252, 0.95);
  color: #65809a;
  font-size: 24rpx;
  text-align: center;
  transition: all 0.2s ease;

  &.active {
    background: linear-gradient(135deg, #3ea7ff 0%, #5d8dff 100%);
    color: #fff;
    box-shadow: 0 10rpx 24rpx rgba(62, 167, 255, 0.24);
    font-weight: 600;
  }
}

.course-scroll {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.scroll-inner {
  padding: 24rpx 24rpx calc(48rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.result-bar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 22rpx;
  padding: 0 6rpx;
}

.result-title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #16324c;
}

.result-subtitle {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #7d90a1;
}

.result-keyword {
  max-width: 220rpx;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.88);
  color: #4f78a1;
  font-size: 22rpx;
  @include ellipsis(1);
}

.loading-list {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
}

.skeleton-card {
  height: 248rpx;
  border-radius: 32rpx;
  background: linear-gradient(90deg, rgba(239, 244, 248, 0.9) 25%, rgba(248, 251, 253, 1) 50%, rgba(239, 244, 248, 0.9) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.3s linear infinite;
}

.course-list {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
}

.course-card {
  display: flex;
  gap: 22rpx;
  padding: 22rpx;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 12rpx 30rpx rgba(23, 73, 112, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:active {
    transform: scale(0.985);
    box-shadow: 0 8rpx 20rpx rgba(23, 73, 112, 0.08);
  }
}

.cover-wrap {
  width: 204rpx;
  height: 230rpx;
  position: relative;
  border-radius: 24rpx;
  overflow: hidden;
  flex-shrink: 0;
  background: #edf4f8;
}

.course-cover {
  width: 100%;
  height: 100%;
}

.cover-badge {
  position: absolute;
  top: 14rpx;
  left: 14rpx;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(22, 50, 76, 0.74);
  color: #fff;
  font-size: 20rpx;
  font-weight: 600;

  &.purchased {
    background: rgba(54, 154, 255, 0.88);
  }

  &.free {
    background: rgba(10, 179, 117, 0.88);
  }
}

.course-main {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.course-head {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.course-title {
  font-size: 32rpx;
  line-height: 1.4;
  font-weight: 700;
  color: #172f44;
  @include ellipsis(2);
}

.course-status {
  align-self: flex-start;
  padding: 8rpx 14rpx;
  border-radius: 12rpx;
  background: rgba(255, 152, 0, 0.1);
  color: #cc7b18;
  font-size: 20rpx;
  font-weight: 600;

  &.purchased {
    background: rgba(62, 167, 255, 0.12);
    color: #2f8cd6;
  }
}

.course-desc {
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: #72879a;
  @include ellipsis(3);
}

.course-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 18rpx;
}

.meta-chip {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(62, 167, 255, 0.1);
  color: #317fbe;
  font-size: 20rpx;
}

.meta-chip-soft {
  background: rgba(114, 135, 154, 0.1);
  color: #71859a;
}

.course-foot {
  margin-top: auto;
  padding-top: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.course-price {
  font-size: 38rpx;
  font-weight: 800;
  color: #ff5a5f;

  &.free {
    color: #0aa66f;
  }
}

.action-btn {
  min-width: 172rpx;
  padding: 18rpx 24rpx;
  border-radius: 999rpx;
  text-align: center;
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
  background: linear-gradient(135deg, #ff8f4d 0%, #ff5d6c 100%);
  box-shadow: 0 10rpx 24rpx rgba(255, 98, 111, 0.24);

  &.purchased {
    background: linear-gradient(135deg, #3ea7ff 0%, #5d8dff 100%);
    box-shadow: 0 10rpx 24rpx rgba(62, 167, 255, 0.24);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 40rpx 0;
}

.empty-title {
  margin-top: 28rpx;
  font-size: 32rpx;
  font-weight: 700;
  color: #22364a;
}

.empty-text {
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.6;
  text-align: center;
  color: #7f92a3;
}

@keyframes shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}
</style>
