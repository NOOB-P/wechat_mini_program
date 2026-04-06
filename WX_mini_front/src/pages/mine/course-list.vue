<template>
  <view class="course-list-container">
    <wd-toast id="wd-toast" />
    <view class="header">
      <text class="title">{{ pageTitle }}</text>
    </view>

    <view class="course-list" v-if="courses.length > 0">
      <view v-for="item in courses" :key="item.id" class="course-card" @click="goToDetail(item.id)">
        <wd-img :src="item.cover || 'https://img.yzcdn.cn/vant/cat.jpeg'" :width="100" :height="70" round class="course-img" />
        <view class="course-info">
          <text class="course-name">{{ item.title }}</text>
          <view class="course-bottom">
            <view class="left-info">
              <text class="course-type">{{ getTypeName(item.type) }}</text>
              <text class="course-progress" v-if="currentType === 'record'">已学 {{ item.progress || 0 }}%</text>
            </view>
            <wd-button type="primary" size="small" plain>{{ currentType === 'record' ? '继续学习' : '查看详情' }}</wd-button>
          </view>
        </view>
      </view>
    </view>
    
    <view class="empty-state" v-else>
      <wd-icon name="info-circle" size="48px" color="#ccc" />
      <text class="empty-text">暂无数据</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getMyCoursesApi, getMyCollectionsApi, getMyStudyRecordsApi, getPurchasedCoursesApi } from '@/api/course'
import { useToast } from 'wot-design-uni'

const toast = useToast()
const courses = ref<any[]>([])
const currentType = ref('')

const pageTitle = computed(() => {
  switch (currentType.value) {
    case 'course': return '我的课程'
    case 'collection': return '我的收藏'
    case 'record': return '学习记录'
    case 'purchased': return '已购课程'
    default: return '课程列表'
  }
})

const getTypeName = (type: string) => {
  switch (type) {
    case 'general': return '精品课'
    case 'sync': return '同步辅导'
    case 'family': return '家庭教育'
    default: return '课程'
  }
}

const loadData = async () => {
  try {
    toast.loading('加载中...')
    let res: any
    if (currentType.value === 'course') {
      res = await getMyCoursesApi()
    } else if (currentType.value === 'collection') {
      res = await getMyCollectionsApi()
    } else if (currentType.value === 'record') {
      res = await getMyStudyRecordsApi()
    } else if (currentType.value === 'purchased') {
      res = await getPurchasedCoursesApi()
    }
    
    if (res && res.code === 200) {
      courses.value = res.data
    }
    toast.close()
  } catch (e) {
    toast.error('加载失败')
  }
}

onLoad((options: any) => {
  if (options.type) {
    currentType.value = options.type
  }
})

onShow(() => {
  loadData()
})

const goToDetail = (id: string) => {
  uni.navigateTo({
    url: `/pages/course/detail?id=${id}`
  })
}
</script>

<style lang="scss" scoped>
.course-list-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 30rpx;
}

.header {
  margin-bottom: 30rpx;
  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
}

.course-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  display: flex;
  gap: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);

  .course-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .course-name {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 10rpx;
    }

    .course-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .left-info {
        display: flex;
        flex-direction: column;
        gap: 8rpx;
      }

      .course-type {
        font-size: 22rpx;
        color: #999;
        background: #f0f2f5;
        padding: 4rpx 12rpx;
        border-radius: 4rpx;
        width: fit-content;
      }

      .course-progress {
        font-size: 24rpx;
        color: #1a5f8e;
        font-weight: 500;
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
  
  .empty-text {
    margin-top: 20rpx;
    color: #999;
    font-size: 28rpx;
  }
}
</style>
