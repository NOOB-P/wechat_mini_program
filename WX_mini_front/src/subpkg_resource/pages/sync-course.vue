<template>
  <view class="sync-container">
    <wd-toast id="wd-toast" />
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
              <view class="action-section">
                <view class="price-box-bottom" v-if="item.isPurchased">
                  <text class="price-val">已购买</text>
                </view>
                <view class="price-box-bottom" v-else-if="item.price > 0">
                  <text class="price-val">￥{{ item.price }}</text>
                </view>
                <view class="price-box-bottom free" v-else>
                  <text class="price-val">免费</text>
                </view>
                <view class="action-btn" @click.stop="handleAction(item)">
                  <text>{{ (item.price > 0 && !item.isPurchased) ? '立即购买' : '开始学习' }}</text>
                </view>
              </view>
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
import { getSyncCourseListApi, getSyncCourseOptionsApi } from '@/subpkg_resource/api/resource'
import { buyCourseApi } from '@/api/course'
import { useToast } from 'wot-design-uni'

const grades = ref<string[]>([])
const standardGradeOrder = [
  '一年级', '二年级', '三年级', '四年级', '五年级', '六年级',
  '初一', '初二', '初三',
  '高一', '高二', '高三'
]
const gradeIndex = ref(0)

const subjects = ref<string[]>([])
const allSubjects = ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '政治', '地理']
const currentSubject = ref('')

const list = ref<any[]>([])
const toast = useToast()

// 根据年级获取可用科目
const getSubjectsByGrade = (grade: string) => {
  if (!grade) return []
  // 如果是小学（包含“一年级”到“六年级”或者“小学”字样）
  if (grade.includes('一') || grade.includes('二') || grade.includes('三') || grade.includes('四') || grade.includes('五') || grade.includes('六') || grade.includes('小学')) {
    // 排除掉一年级到六年级以外的情况，比如初一也带“一”
    if (!grade.includes('初') && !grade.includes('高')) {
      return ['语文', '数学', '英语']
    }
  }
  // 其他（初中、高中）返回全科目
  return allSubjects
}

const loadOptions = async () => {
  try {
    // 直接使用标准年级列表，确保所有年级都能展示
    grades.value = [...standardGradeOrder]
    
    if (grades.value.length > 0) {
      gradeIndex.value = 0
      // 初始化当前年级的科目
      subjects.value = getSubjectsByGrade(grades.value[gradeIndex.value])
      if (subjects.value.length > 0) {
        currentSubject.value = subjects.value[0]
      }
    }
    loadData()
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

const handleAction = async (item: any) => {
  if (item.price > 0 && !item.isPurchased) {
    try {
      const res = await buyCourseApi(item.id)
      if (res.code === 200) {
        const orderData = encodeURIComponent(JSON.stringify(res.data))
        uni.navigateTo({
          url: `/subpkg_course/pages/course/pay?order=${orderData}`
        })
      } else {
        toast.error(res.msg || '下单失败')
      }
    } catch (e) {
      toast.error('网络错误')
    }
  } else {
    handleItemClick(item)
  }
}

const onGradeChange = (e: any) => {
  gradeIndex.value = e.detail.value
  // 根据新选中的年级更新科目列表
  subjects.value = getSubjectsByGrade(grades.value[gradeIndex.value])
  // 如果当前科目不在新的科目列表中，默认选中第一个
  if (!subjects.value.includes(currentSubject.value)) {
    currentSubject.value = subjects.value[0] || ''
  }
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
    url: `/subpkg_course/pages/course/detail?id=${item.id}`
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

  .action-section {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4rpx;
  }

  .price-box-bottom {
    margin-right: 12rpx;
    margin-bottom: 2rpx;
    .price-val {
      font-size: 24rpx;
      font-weight: bold;
      color: #ff6b6b;
    }
    &.free {
      .price-val {
        color: #52c41a;
      }
    }
  }
  
  .action-btn {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    padding: 10rpx 32rpx;
    border-radius: 30rpx;
    box-shadow: 0 6rpx 16rpx rgba(79, 172, 254, 0.24);
    
    text {
      color: #fff;
      font-size: 22rpx;
      font-weight: bold;
    }
    
    &:active {
      transform: scale(0.96);
      opacity: 0.9;
    }
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


