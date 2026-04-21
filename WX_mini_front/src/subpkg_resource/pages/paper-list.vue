<template>
  <view class="paper-list-page">
    <wd-toast id="wd-toast" />
    
    <!-- 顶部固定区域 -->
    <view class="fixed-header">
      <view class="search-section">
        <wd-search 
          v-model="keyword" 
          placeholder="搜索试卷名称或学校" 
          hide-cancel 
          @search="handleSearch" 
          @clear="handleSearch"
        />
      </view>
      
      <view class="tab-section">
        <view 
          class="tab-item" 
          :class="{ active: currentTab === 'all' }" 
          @click="handleTabChange('all')"
        >全部试卷</view>
        <view 
          class="tab-item" 
          :class="{ active: currentTab === 'recommend' }" 
          @click="handleTabChange('recommend')"
        >编辑精选</view>
      </view>
    </view>

    <!-- 列表滚动区域 -->
    <scroll-view scroll-y class="list-scroll" @scrolltolower="loadMore">
      <view class="paper-list animate-fade-in" v-if="filteredList.length > 0">
        <view 
          class="paper-card" 
          v-for="item in filteredList" 
          :key="item.id" 
          @click="handleItemClick(item)"
        >
          <view class="p-icon">
            <wd-icon name="file-word" size="28px" color="#1a5f8e" />
          </view>
          <view class="p-info">
            <text class="p-title">{{ item.title }}</text>
            <view class="p-tags">
              <text class="tag" v-for="tag in formatTags(item.tags)" :key="tag">{{ tag }}</text>
            </view>
            <view class="p-meta">
              <text class="meta-text">{{ item.year }} · {{ item.grade }}</text>
              <view class="p-stats">
                <wd-icon name="download" size="12px" color="#999" />
                <text>{{ item.downloads || 0 }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-else>
        <wd-status-tip image="content" title="暂无相关试卷资源~" />
      </view>
      
      <view class="loading-more" v-if="loading">加载中...</view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getPaperListApi, incrementPaperDownloadApi } from '@/subpkg_resource/api/resource'

const keyword = ref('')
const subject = ref('')
const type = ref('')
const currentTab = ref('all')
const list = ref<any[]>([])
const loading = ref(false)

onLoad((options: any) => {
  if (options.subject) {
    subject.value = options.subject
    uni.setNavigationBarTitle({ title: options.subject + '试卷' })
  } else if (options.type) {
    type.value = options.type
    const titleMap: any = {
      'FAMOUS': '名校真题',
      'MONTHLY': '月考专栏',
      'JOINT': '联考专辑'
    }
    uni.setNavigationBarTitle({ title: titleMap[options.type] || '试卷列表' })
  }
  loadData()
})

const filteredList = computed(() => {
  if (currentTab.value === 'recommend') {
    return list.value.filter(item => item.isRecommend)
  }
  return list.value
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getPaperListApi({
      keyword: keyword.value,
      subject: subject.value,
      type: type.value
    })
    if (res.code === 200) {
      list.value = res.data
    }
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  loadData()
}

const handleTabChange = (tab: string) => {
  currentTab.value = tab
}

const formatTags = (tags: any) => {
  if (typeof tags === 'string') return tags.split(',').filter((t: string) => t.trim())
  return tags || []
}

const handleItemClick = async (item: any) => {
  if (item.filePath) {
    try {
      await incrementPaperDownloadApi(item.id)
      item.downloads = (item.downloads || 0) + 1
    } catch (e) {}

    const fullUrl = item.filePath.startsWith('http') ? item.filePath : __VITE_SERVER_BASEURL__ + item.filePath
    uni.showLoading({ title: '正在准备试卷...' })
    uni.downloadFile({
      url: fullUrl,
      success: (res) => {
        uni.openDocument({
          filePath: res.tempFilePath,
          success: () => uni.hideLoading(),
          fail: () => {
            uni.hideLoading()
            uni.showToast({ title: '无法打开此文件', icon: 'none' })
          }
        })
      },
      fail: () => {
        uni.hideLoading()
        uni.showToast({ title: '下载失败', icon: 'none' })
      }
    })
  }
}

const loadMore = () => {
  // 目前后端是一次性返回，暂不处理分页
}
</script>

<script lang="ts">
export default {
  options: {
    styleIsolation: 'shared'
  }
}
</script>

<style lang="scss" scoped>
.paper-list-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
}

.fixed-header {
  background-color: #fff;
  z-index: 10;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
}

.search-section {
  padding: 20rpx 30rpx;
}

.tab-section {
  display: flex;
  padding: 0 30rpx 20rpx;
  gap: 40rpx;

  .tab-item {
    font-size: 28rpx;
    color: #666;
    position: relative;
    padding-bottom: 10rpx;

    &.active {
      color: #1a5f8e;
      font-weight: bold;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 40rpx;
        height: 4rpx;
        background: #1a5f8e;
        border-radius: 2rpx;
      }
    }
  }
}

.list-scroll {
  flex: 1;
  height: 0;
}

.paper-list {
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.paper-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  display: flex;
  gap: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.02);
  transition: all 0.2s;

  &:active {
    transform: scale(0.98);
    background: #fcfcfc;
  }

  .p-icon {
    width: 90rpx;
    height: 90rpx;
    background: #f0f7ff;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .p-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;

    .p-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 12rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .p-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;
      margin-bottom: 16rpx;

      .tag {
        font-size: 20rpx;
        color: #1a5f8e;
        background: #eef5ff;
        padding: 4rpx 16rpx;
        border-radius: 6rpx;
      }
    }

    .p-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .meta-text {
        font-size: 24rpx;
        color: #999;
      }

      .p-stats {
        display: flex;
        align-items: center;
        gap: 6rpx;
        font-size: 22rpx;
        color: #999;
      }
    }
  }
}

.empty-state {
  padding-top: 200rpx;
}

.loading-more {
  text-align: center;
  padding: 30rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
