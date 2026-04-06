<template>
  <view class="paper-container">
    <view class="search-wrap">
      <wd-search v-model="keyword" placeholder="输入你感兴趣的学校名称" hide-cancel @search="loadData" @clear="loadData" />
    </view>

    <view class="subject-grid">
      <view class="sub-item" v-for="sub in subjects" :key="sub.name" @click="selectSubject(sub.name)">
        <view class="sub-icon-wrap" :style="{ background: sub.color + '1a' }">
          <wd-icon :name="sub.icon" size="22px" :color="sub.color" />
        </view>
        <text class="sub-name">{{ sub.name }}</text>
      </view>
    </view>

    <view class="special-section">
      <view class="section-header">
        <text class="sec-title">专题卷</text>
        <text class="sec-more">更多专辑 ></text>
      </view>
      <view class="special-cards">
        <view class="card-large">
          <view class="card-content">
            <text class="c-title">名校试卷</text>
            <text class="c-desc">名校资源共享 每日更新</text>
            <view class="c-btn" @click="handleSpecial('FAMOUS')">去下载</view>
          </view>
        </view>
        <view class="card-col">
          <view class="card-small blue" @click="handleSpecial('MONTHLY')">
            <text class="c-title">月考测试专栏</text>
            <text class="c-desc">阶段性巩固 提升复习效率</text>
          </view>
          <view class="card-small purple" @click="handleSpecial('JOINT')">
            <text class="c-title">联考试卷专辑</text>
            <text class="c-desc">了解命题趋势 适应大考节奏</text>
          </view>
        </view>
      </view>
    </view>

    <view class="list-section">
      <view class="section-header-tabs">
        <view 
          class="sec-tab" 
          :class="{ active: currentTab === 'all' }" 
          @click="currentTab = 'all'"
        >考卷订阅</view>
        <view 
          class="sec-tab" 
          :class="{ active: currentTab === 'recommend' }" 
          @click="currentTab = 'recommend'"
        >推荐</view>
      </view>
      
      <view class="paper-list">
        <view class="paper-item" v-for="item in filteredList" :key="item.id" @click="handleItemClick(item)">
          <text class="p-title">{{ item.title }}</text>
          <view class="p-tags">
            <text class="tag" v-for="tag in formatTags(item.tags)" :key="tag">{{ tag }}</text>
          </view>
          <view class="p-bottom">
            <text class="p-info">{{ item.year }} | {{ item.grade }}</text>
            <text class="p-downloads">下载: {{ item.downloads }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getPaperListApi, getPaperSubjectsApi, incrementPaperDownloadApi } from '@/api/resource'

const keyword = ref('')
const list = ref<any[]>([])
const subjects = ref<any[]>([])
const currentTab = ref('all')

const filteredList = computed(() => {
  if (currentTab.value === 'recommend') {
    return list.value.filter(item => item.isRecommend)
  }
  return list.value
})

const formatTags = (tags: any) => {
  if (typeof tags === 'string') {
    return tags.split(',').filter((t: string) => t.trim())
  }
  return tags || []
}

const loadData = async (type?: string) => {
  try {
    const params: any = { keyword: keyword.value }
    if (type) params.type = type
    const res = await getPaperListApi(params)
    if (res.code === 200) {
      list.value = res.data
    }
  } catch (e) {
    console.error(e)
  }
}

const loadSubjects = async () => {
  try {
    const res = await getPaperSubjectsApi()
    if (res.code === 200) {
      subjects.value = res.data
    }
  } catch (e) {
    console.error(e)
  }
}

const selectSubject = (name: string) => {
  keyword.value = name
  loadData()
}

const handleSpecial = (type: string) => {
  loadData(type)
}

const handleItemClick = async (item: any) => {
  // 试卷详情逻辑，如果是本地路径，拼接完整 URL
  if (item.filePath) {
    // 增加下载计数
    try {
      await incrementPaperDownloadApi(item.id)
      // UI 层面手动增加 1，或者重新加载列表
      item.downloads = (item.downloads || 0) + 1
    } catch (e) {
      console.error('更新下载计数失败', e)
    }

    // 假设后端运行在 8082 端口
    const baseUrl = 'http://localhost:8082'
    const fullUrl = item.filePath.startsWith('http') ? item.filePath : baseUrl + item.filePath
    
    uni.downloadFile({
      url: fullUrl,
      success: (res) => {
        const filePath = res.tempFilePath
        uni.openDocument({
          filePath: filePath,
          success: () => console.log('打开文档成功'),
          fail: (err) => {
            console.error('打开文档失败', err)
            uni.showToast({ title: '无法打开此文件', icon: 'none' })
          }
        })
      },
      fail: (err) => {
        console.error('下载失败', err)
        uni.showToast({ title: '下载失败', icon: 'none' })
      }
    })
  }
}

onMounted(() => {
  loadSubjects()
  loadData()
})
</script>

<style lang="scss" scoped>
.paper-container { min-height: 100vh; background: #f8f9fa; padding-bottom: 40rpx; }
.search-wrap { background: #fff; padding: 10rpx 20rpx; }

.subject-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); background: #fff; padding: 20rpx 30rpx; gap: 20rpx;
  max-height: 480rpx; overflow-y: auto; // 允许在科目过多时滚动
  .sub-item {
    display: flex; align-items: center; justify-content: flex-start; gap: 16rpx; background: #f5f7fa; padding: 20rpx 24rpx; border-radius: 12rpx;
    .sub-icon-wrap {
      width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; border-radius: 8rpx;
    }
    .sub-name { font-size: 28rpx; color: #333; font-weight: 500; }
  }
}

.special-section {
  background: #fff; margin-top: 20rpx; padding: 30rpx;
  .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx; }
  .sec-title { font-size: 32rpx; font-weight: bold; color: #333; }
  .sec-more { font-size: 24rpx; color: #999; }
  
  .special-cards {
    display: flex; gap: 20rpx; height: 320rpx;
    .card-large {
      flex: 1.2; background: linear-gradient(135deg, #fff3e0, #ffe0b2); border-radius: 20rpx; padding: 30rpx; position: relative;
      .card-content { display: flex; flex-direction: column; height: 100%; }
      .c-title { font-size: 34rpx; font-weight: bold; color: #333; margin-bottom: 12rpx; }
      .c-desc { font-size: 24rpx; color: #8d6e63; margin-bottom: auto; }
      .c-btn { background: #ff9800; color: #fff; font-size: 26rpx; padding: 12rpx 36rpx; border-radius: 30rpx; align-self: flex-start; box-shadow: 0 4rpx 12rpx rgba(255,152,0,0.3); }
    }
    .card-col {
      flex: 1; display: flex; flex-direction: column; gap: 20rpx;
      .card-small {
        flex: 1; border-radius: 20rpx; padding: 24rpx; display: flex; flex-direction: column; justify-content: center;
        &.blue { background: linear-gradient(135deg, #e3f2fd, #bbdefb); }
        &.purple { background: linear-gradient(135deg, #f3e5f5, #e1bee7); }
        .c-title { font-size: 28rpx; font-weight: bold; color: #333; margin-bottom: 8rpx; }
        .c-desc { font-size: 22rpx; color: #666; }
      }
    }
  }
}

.list-section {
  background: #fff; margin-top: 20rpx; padding: 30rpx;
  .section-header-tabs {
    display: flex; gap: 40rpx; border-bottom: 1rpx solid #eee; padding-bottom: 20rpx; margin-bottom: 20rpx;
    .sec-tab { font-size: 30rpx; color: #666; position: relative; padding: 0 10rpx; transition: all 0.3s; }
    .sec-tab.active { font-size: 32rpx; font-weight: bold; color: #333; }
    .sec-tab.active::after { content: ''; position: absolute; bottom: -20rpx; left: 0; width: 100%; height: 4rpx; background: #ff5252; border-radius: 4rpx; }
  }
  .paper-item {
    padding: 32rpx 0; border-bottom: 1rpx solid #f5f5f5;
    &:last-child { border-bottom: none; }
    .p-title { font-size: 30rpx; font-weight: bold; color: #333; display: block; margin-bottom: 16rpx; line-height: 1.4; }
    .p-tags { display: flex; flex-wrap: wrap; gap: 12rpx; margin-bottom: 16rpx; }
    .tag { font-size: 22rpx; color: #ff9800; background: rgba(255,152,0,0.08); padding: 4rpx 14rpx; border-radius: 6rpx; border: 1rpx solid rgba(255,152,0,0.2); }
    .p-bottom { display: flex; justify-content: space-between; align-items: center; font-size: 24rpx; color: #999; }
    .p-downloads { color: #999; }
  }
}
</style>
