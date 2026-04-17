<template>
  <view class="course-list-container">
    <wd-toast id="wd-toast" />
    
    <view class="course-list" v-if="courses.length > 0">
      <view v-for="item in courses" :key="item.id" class="course-card" @click="goToDetail(item.id)">
        <view class="card-inner">
          <image 
            :src="item.cover || 'https://img.yzcdn.cn/vant/cat.jpeg'" 
            mode="aspectFill"
            class="course-img" 
          />
          <view class="course-info">
            <view class="top-section">
              <text class="course-name">{{ item.title }}</text>
              <view class="course-tag">{{ getTypeName(item.type) }}</view>
            </view>
            
            <view class="bottom-section">
              <view class="progress-wrap" v-if="currentType === 'record'">
                <view class="progress-text">已学 {{ item.progress || 0 }}%</view>
                <view class="progress-bar">
                  <view class="progress-inner" :style="{ width: (item.progress || 0) + '%' }"></view>
                </view>
              </view>
              <view class="action-btn">
                <text>{{ currentType === 'record' ? '继续学习' : '查看详情' }}</text>
                <wd-icon name="arrow-right" size="14px" />
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <view class="empty-state" v-else>
      <wd-icon name="info-circle" size="64px" color="#e0e5ed" />
      <text class="empty-text">暂时还没有相关课程哦~</text>
      <wd-button type="primary" size="small" plain custom-class="go-study-btn" @click="goHome">去发现好课</wd-button>
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
    uni.setNavigationBarTitle({
      title: pageTitle.value
    })
  }
})

onShow(() => {
  loadData()
})

const goToDetail = (id: string) => {
  uni.navigateTo({
    url: `/subpkg_course/pages/course/detail?id=${id}`
  })
}

const goToResource = () => {
  uni.switchTab({
    url: '/pages/resource/index'
  })
}
</script>

<style lang="scss" scoped>
.course-list-container {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 20rpx 30rpx;
  box-sizing: border-box;
}

.course-list {
  position: relative;
  z-index: 1;
}

.course-card {
  background-color: #fff;
  border-radius: 24rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(26, 95, 142, 0.04);
  transition: all 0.3s;

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }

  .card-inner {
    display: flex;
    padding: 24rpx;
    gap: 24rpx;
  }

  .course-img {
    width: 200rpx;
    height: 140rpx;
    border-radius: 16rpx;
    flex-shrink: 0;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  }

  .course-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 0;

    .top-section {
      .course-name {
        font-size: 30rpx;
        font-weight: 600;
        color: #2c3e50;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        overflow: hidden;
        margin-bottom: 12rpx;
      }

      .course-tag {
        display: inline-block;
        font-size: 22rpx;
        color: #1a5f8e;
        background: rgba(26, 95, 142, 0.08);
        padding: 4rpx 16rpx;
        border-radius: 8rpx;
        font-weight: 500;
      }
    }

    .bottom-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 10rpx;

      .progress-wrap {
        flex: 1;
        margin-right: 20rpx;

        .progress-text {
          font-size: 22rpx;
          color: #7a8ba6;
          margin-bottom: 8rpx;
        }

        .progress-bar {
          height: 8rpx;
          background: #f0f4f9;
          border-radius: 10rpx;
          overflow: hidden;

          .progress-inner {
            height: 100%;
            background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
            border-radius: 10rpx;
          }
        }
      }

      .action-btn {
        display: flex;
        align-items: center;
        font-size: 24rpx;
        color: #1a5f8e;
        font-weight: 600;
        
        text {
          margin-right: 4rpx;
        }
      }
    }
  }
}

.empty-state {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 260rpx;
  
  .empty-text {
    margin-top: 30rpx;
    color: #aab4c3;
    font-size: 28rpx;
    margin-bottom: 40rpx;
  }

  .go-study-btn {
    width: 240rpx;
    border-radius: 100rpx !important;
  }
}
</style>
