<template>
  <view class="sync-container">
    <!-- 极简清爽头部 -->
    <view class="header-wrap">
      <view class="grade-pill-box">
        <picker @change="onGradeChange" :value="gradeIndex" :range="grades">
          <view class="grade-pill">
            <text>{{ grades[gradeIndex] || '选择年级' }}</text>
            <wd-icon name="caret-down-small" size="14px" color="#1a5f8e" />
          </view>
        </picker>
      </view>
      
      <view class="tabs-box">
        <wd-tabs 
          v-model="currentSubject" 
          @change="onSubjectChange" 
          active-color="#1a5f8e" 
          line-color="#1a5f8e"
          :line-width="20"
        >
          <wd-tab v-for="sub in subjects" :key="sub" :title="sub" :name="sub"></wd-tab>
        </wd-tabs>
      </view>
    </view>

    <scroll-view scroll-y class="list-scroll-view">
      <view class="course-list-content animate-fade-in" v-if="list.length > 0">
        <view 
          class="course-card-item" 
          v-for="(item, index) in list" 
          :key="item.id" 
          @click="handleItemClick(item)"
          :style="{ animationDelay: (index * 0.05) + 's' }"
        >
          <view class="card-left">
            <image 
              :src="item.cover || 'https://img.yzcdn.cn/vant/cat.jpeg'" 
              mode="aspectFill"
              class="course-cover" 
            />
            <view class="play-icon-box">
              <wd-icon name="play-circle-filled" size="24px" color="#fff" />
            </view>
          </view>
          
          <view class="card-right">
            <view class="title-section">
              <text class="course-title-text">{{ item.title }}</text>
              <view class="tag-row">
                <text class="type-tag">{{ currentSubject }}</text>
                <text class="grade-tag">{{ grades[gradeIndex] }}</text>
              </view>
            </view>
            
            <view class="stats-section">
              <view class="stat-item">
                <wd-icon name="video" size="14px" color="#999" />
                <text>共 {{ item.episodes }} 节课</text>
              </view>
              <view class="learn-btn">开始学习</view>
            </view>
          </view>
        </view>
      </view>

      <view class="empty-wrap" v-else>
        <wd-img
          :width="120"
          :height="120"
          src="https://img.yzcdn.cn/vant/empty-image-default.png"
        />
        <text class="empty-hint">暂无{{ grades[gradeIndex] }}{{ currentSubject }}课程数据~</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getSyncCourseListApi, getSyncCourseOptionsApi } from '@/api/resource'

const grades = ref<string[]>([])
const gradeIndex = ref(0)

const subjects = ref<string[]>([])
const currentSubject = ref('')

const list = ref<any[]>([])

const loadOptions = async () => {
  try {
    const res = await getSyncCourseOptionsApi()
    if (res.code === 200) {
      grades.value = res.data.grades.map((item: any) => item.label) || []
      subjects.value = res.data.subjects.map((item: any) => item.label) || []
      
      if (grades.value.length > 0) gradeIndex.value = 0
      if (subjects.value.length > 0) currentSubject.value = subjects.value[0]
      loadData()
    }
  } catch (e) {
    console.error(e)
  }
}

const loadData = async () => {
  if (!currentSubject.value) return
  try {
    const res = await getSyncCourseListApi({ 
      subject: currentSubject.value,
      grade: grades.value[gradeIndex.value]
    })
    if (res.code === 200) {
      const formattedList = res.data.map((item: any) => {
        if (item.cover && !item.cover.startsWith('http')) {
          item.cover = __VITE_SERVER_BASEURL__ + item.cover
        }
        return item
      })
      list.value = formattedList
    }
  } catch (e) {
    console.error(e)
  }
}

const onGradeChange = (e: any) => {
  gradeIndex.value = e.detail.value
  loadData()
}

const onSubjectChange = (item: any) => {
  const newSub = item.name !== undefined ? item.name : item
  if (currentSubject.value !== newSub) {
    currentSubject.value = newSub
    loadData()
  }
}

const handleItemClick = (item: any) => {
  uni.navigateTo({
    url: `/pages/course/detail?id=${item.id}`
  })
}

onLoad(() => {
  uni.setNavigationBarTitle({
    title: '同步/专题课'
  })
})

onMounted(() => loadOptions())
</script>

<style lang="scss" scoped>
.sync-container {
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* 极简头部 */
.header-wrap {
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
}

.grade-pill-box {
  display: flex;
  justify-content: center;
  padding: 24rpx 0 10rpx;
}

.grade-pill {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: #f0f6ff;
  padding: 10rpx 32rpx;
  border-radius: 40rpx;
  color: #1a5f8e;
  font-size: 28rpx;
  font-weight: 600;
  border: 1rpx solid rgba(26, 95, 142, 0.1);
  transition: all 0.2s;
  
  &:active {
    background: #e1eeff;
    transform: scale(0.96);
  }
}

.tabs-box {
  padding: 0 10rpx;
}

/* 列表区 */
.list-scroll-view {
  height: calc(100vh - 180rpx);
}

.course-list-content {
  padding: 24rpx 30rpx;
}

.course-card-item {
  display: flex;
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.02);
  animation: slideIn 0.4s ease-out forwards;
  opacity: 0;
  
  &:active {
    transform: scale(0.98);
    background: #fafbfc;
  }
}

.card-left {
  position: relative;
  width: 220rpx;
  height: 150rpx;
  border-radius: 16rpx;
  overflow: hidden;
  flex-shrink: 0;
  background: #f0f3f5;
  
  .course-cover {
    width: 100%;
    height: 100%;
  }
  
  .play-icon-box {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    width: 60rpx;
    height: 60rpx;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(2px);
  }
}

.card-right {
  flex: 1;
  margin-left: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 4rpx 0;
}

.course-title-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.tag-row {
  display: flex;
  gap: 12rpx;
  margin-top: 8rpx;
}

.type-tag, .grade-tag {
  font-size: 20rpx;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
}

.type-tag {
  background: #eef5ff;
  color: #1a5f8e;
}

.grade-tag {
  background: #f0fdf4;
  color: #00897b;
}

.stats-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
  
  .stat-item {
    display: flex;
    align-items: center;
    gap: 6rpx;
    font-size: 22rpx;
    color: #999;
  }
  
  .learn-btn {
    color: #1a5f8e;
    font-size: 24rpx;
    font-weight: 600;
    padding: 8rpx 24rpx;
    border-radius: 30rpx;
    background: #f0f6ff;
  }
}

.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
  
  .empty-hint {
    margin-top: 30rpx;
    font-size: 26rpx;
    color: #999;
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-20rpx); }
  to { opacity: 1; transform: translateX(0); }
}
</style>


