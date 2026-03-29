<template>
  <view class="paper-container">
    <view class="search-wrap">
      <wd-search v-model="keyword" placeholder="输入你感兴趣的学校名称" hide-cancel @search="loadData" @clear="loadData" />
    </view>

    <view class="subject-grid">
      <view class="sub-item" v-for="sub in subjects" :key="sub.name" @click="selectSubject(sub.name)">
        <wd-icon :name="sub.icon" size="24px" :color="sub.color" />
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
          <text class="c-title">名校试卷</text>
          <text class="c-desc">名校资源共享 每日更新</text>
          <view class="c-btn">去下载</view>
        </view>
        <view class="card-col">
          <view class="card-small">
            <text class="c-title">月考测试专栏</text>
            <text class="c-desc">阶段性巩固 提升复习效率</text>
          </view>
          <view class="card-small">
            <text class="c-title">联考试卷专辑</text>
            <text class="c-desc">了解命题趋势 适应大考节奏</text>
          </view>
        </view>
      </view>
    </view>

    <view class="list-section">
      <view class="section-header-tabs">
        <text class="sec-tab active">考卷订阅</text>
        <text class="sec-tab">推荐</text>
      </view>
      
      <view class="paper-list">
        <view class="paper-item" v-for="item in list" :key="item.id">
          <text class="p-title">{{ item.title }}</text>
          <view class="p-tags">
            <text class="tag" v-for="tag in item.tags" :key="tag">{{ tag }}</text>
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
import { ref, onMounted } from 'vue'
import { getPaperListApi } from '@/api/resource'

const keyword = ref('')
const list = ref<any[]>([])

const subjects = [
  { name: '语文', icon: 'read', color: '#ff5252' },
  { name: '数学', icon: 'chart', color: '#4caf50' },
  { name: '英语', icon: 'edit', color: '#2196f3' },
  { name: '物理', icon: 'setting', color: '#00bcd4' },
  { name: '化学', icon: 'filter', color: '#ff9800' },
  { name: '生物', icon: 'share', color: '#3f51b5' },
  { name: '历史', icon: 'time', color: '#ffc107' },
  { name: '地理', icon: 'location', color: '#03a9f4' },
  { name: '道德与法治', icon: 'star', color: '#f44336' }
]

const loadData = async () => {
  try {
    const res = await getPaperListApi({ keyword: keyword.value })
    if (res.code === 200) {
      list.value = res.data
    }
  } catch (e) {
    console.error(e)
  }
}

const selectSubject = (name: string) => {
  keyword.value = name
  loadData()
}

onMounted(() => loadData())
</script>

<style lang="scss" scoped>
.paper-container { min-height: 100vh; background: #f8f9fa; padding-bottom: 40rpx; }
.search-wrap { background: #fff; padding: 10rpx 0; }
.subject-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); background: #fff; padding: 20rpx 30rpx; gap: 20rpx;
  .sub-item {
    display: flex; align-items: center; justify-content: center; gap: 10rpx; background: #f5f7fa; padding: 20rpx 0; border-radius: 12rpx;
    .sub-name { font-size: 26rpx; color: #333; }
  }
}
.special-section {
  background: #fff; margin-top: 20rpx; padding: 30rpx;
  .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20rpx; }
  .sec-title { font-size: 32rpx; font-weight: bold; color: #333; }
  .sec-more { font-size: 24rpx; color: #999; }
  
  .special-cards {
    display: flex; gap: 20rpx;
    .card-large {
      flex: 1; background: linear-gradient(135deg, #fff5e6, #ffe0b2); border-radius: 16rpx; padding: 30rpx; display: flex; flex-direction: column;
      .c-title { font-size: 32rpx; font-weight: bold; color: #333; margin-bottom: 10rpx; }
      .c-desc { font-size: 24rpx; color: #777; margin-bottom: 40rpx; }
      .c-btn { background: #ff9800; color: #fff; font-size: 24rpx; padding: 10rpx 30rpx; border-radius: 30rpx; align-self: flex-start; }
    }
    .card-col {
      flex: 1; display: flex; flex-direction: column; gap: 20rpx;
      .card-small {
        flex: 1; background: linear-gradient(135deg, #f3f8ff, #e1f0ff); border-radius: 16rpx; padding: 20rpx;
        .c-title { font-size: 28rpx; font-weight: bold; color: #333; display: block; margin-bottom: 6rpx; }
        .c-desc { font-size: 22rpx; color: #777; }
      }
    }
  }
}
.list-section {
  background: #fff; margin-top: 20rpx; padding: 30rpx;
  .section-header-tabs {
    display: flex; gap: 40rpx; border-bottom: 1rpx solid #eee; padding-bottom: 20rpx; margin-bottom: 20rpx;
    .sec-tab { font-size: 30rpx; color: #666; position: relative; }
    .sec-tab.active { font-size: 32rpx; font-weight: bold; color: #333; }
    .sec-tab.active::after { content: ''; position: absolute; bottom: -20rpx; left: 20%; width: 60%; height: 4rpx; background: #ff5252; border-radius: 4rpx; }
  }
  .paper-item {
    padding: 30rpx 0; border-bottom: 1rpx solid #f5f5f5;
    .p-title { font-size: 30rpx; font-weight: bold; color: #333; display: block; margin-bottom: 16rpx; }
    .p-tags { display: flex; gap: 10rpx; margin-bottom: 16rpx; }
    .tag { font-size: 22rpx; color: #ff9800; background: rgba(255,152,0,0.1); padding: 4rpx 12rpx; border-radius: 6rpx; }
    .p-bottom { display: flex; justify-content: space-between; font-size: 24rpx; color: #999; }
  }
}
</style>
