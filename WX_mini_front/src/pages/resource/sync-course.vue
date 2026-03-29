<template>
  <view class="sync-container">
    <view class="nav-bar">
      <picker @change="onGradeChange" :value="gradeIndex" :range="grades">
        <view class="grade-picker">
          <text>{{ grades[gradeIndex] }}</text>
          <wd-icon name="arrow-down" size="14px" color="#333" />
        </view>
      </picker>
    </view>

    <view class="tabs-wrap">
      <wd-tabs v-model="currentSubject" @change="onSubjectChange">
        <wd-tab v-for="sub in subjects" :key="sub" :title="sub" :name="sub"></wd-tab>
      </wd-tabs>
    </view>

    <scroll-view scroll-y class="list-wrap">
      <view class="list-item" v-for="item in list" :key="item.id">
        <wd-img :src="item.cover" width="160rpx" height="120rpx" radius="12rpx" mode="aspectFill" />
        <view class="item-info">
          <text class="item-title">{{ item.title }}</text>
          <text class="item-episodes">共{{ item.episodes }}节</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSyncCourseListApi } from '@/api/resource'

const grades = ['七年级', '八年级', '九年级']
const gradeIndex = ref(1)

const subjects = ['语文', '数学', '英语', '物理', '生物', '道德与法治', '历史']
const currentSubject = ref('语文')

const list = ref<any[]>([])

const loadData = async () => {
  try {
    const res = await getSyncCourseListApi({ subject: currentSubject.value })
    if (res.code === 200) {
      list.value = res.data
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

onMounted(() => loadData())
</script>

<style lang="scss" scoped>
.sync-container { min-height: 100vh; background: #f8f9fa; }
.nav-bar {
  display: flex; align-items: center; justify-content: center;
  height: 88rpx; background: #fff; padding: 0 32rpx; position: sticky; top: 0; z-index: 100;
  .grade-picker { display: flex; align-items: center; font-size: 32rpx; font-weight: bold; gap: 8rpx; color: #333; }
}
.tabs-wrap { background: #fff; margin-top: 2rpx; }
.list-wrap { padding: 20rpx; height: calc(100vh - 88rpx - 100rpx); box-sizing: border-box; }
.list-item {
  display: flex; background: #fff; border-radius: 16rpx; padding: 20rpx; margin-bottom: 20rpx; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.02);
  .item-info {
    margin-left: 20rpx; display: flex; flex-direction: column; justify-content: space-between; padding: 10rpx 0;
    .item-title { font-size: 30rpx; font-weight: bold; color: #333; }
    .item-episodes { font-size: 24rpx; color: #999; }
  }
}
</style>
