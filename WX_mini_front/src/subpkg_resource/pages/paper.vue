<template>
  <view class="paper-container">
    <!-- 顶部大面积柔和渐变 -->
    <view class="header-section">
      <view class="header-content">
        <text class="page-title">名校试卷</text>
        <text class="page-subtitle">汇聚全国名校真题 · 助力高效提分</text>
      </view>
      
      <!-- 悬浮搜索框 -->
      <view class="search-box-wrap">
        <wd-search 
          v-model="keyword" 
          placeholder="搜索试卷、学校或年份" 
          hide-cancel 
          @search="handleSearch" 
          @clear="keyword = ''" 
          custom-style="background: transparent;"
        />
      </view>
    </view>

    <view class="content-body animate-fade-in">
      <!-- 科目导航 - 采用横向滑动或精简网格 -->
      <view class="section-block">
        <view class="section-header">
          <text class="section-title">科目分类</text>
        </view>
        <view class="subject-grid">
          <view 
            class="sub-card" 
            v-for="sub in subjects" 
            :key="sub.name" 
            @click="selectSubject(sub.name)"
          >
            <view class="sub-icon-box" :style="{ background: sub.color + '12' }">
              <wd-icon :name="sub.icon" size="22px" :color="sub.color" />
            </view>
            <text class="sub-label">{{ sub.name }}</text>
          </view>
        </view>
      </view>

      <!-- 专题区域 - 更加精致的卡片 -->
      <view class="section-block">
        <view class="section-header">
          <text class="section-title">专题专辑</text>
        </view>
        
        <view class="special-flex">
          <view 
            class="featured-card" 
            @click="handleSpecial('FAMOUS')"
          >
            <view class="f-content">
              <text class="f-tag">HOT</text>
              <text class="f-title">名校真题</text>
              <text class="f-desc">同步全国名校 实时更新资源</text>
              <view class="f-btn">立即进入</view>
            </view>
            <view class="f-decoration"></view>
          </view>
          
          <view class="side-column">
            <view 
              class="mini-card blue" 
              @click="handleSpecial('MONTHLY')"
            >
              <text class="m-title">月考专栏</text>
              <text class="m-desc">阶段提升 查漏补缺</text>
            </view>
            <view 
              class="mini-card purple" 
              @click="handleSpecial('JOINT')"
            >
              <text class="m-title">联考专辑</text>
              <text class="m-desc">掌握趋势 提前备考</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 列表区域 - 极简白卡片 -->
      <view class="list-container">
        <view class="section-header">
          <text class="section-title">精选推荐</text>
        </view>
        
        <view class="paper-list">
          <view 
          class="paper-item-card" 
          v-for="item in filteredList" 
          :key="item.id" 
          @click="handleItemClick(item)"
        >
            <view class="p-left">
              <view class="p-icon-bg">
                <wd-icon name="file-word" size="24px" color="#1a5f8e" />
              </view>
            </view>
            <view class="p-right">
              <text class="p-name">{{ item.title }}</text>
              <view class="p-tags">
                <text class="p-tag-item" v-for="tag in formatTags(item.tags)" :key="tag">{{ tag }}</text>
              </view>
              <view class="p-meta">
                <text class="p-info-text">{{ item.year }} · {{ item.grade }}</text>
                <view class="p-count">
                  <wd-icon name="download" size="12px" color="#999" />
                  <text>{{ item.downloads || 0 }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="empty-box" v-if="filteredList.length === 0">
          <wd-img :width="100" :height="100" src="https://img.yzcdn.cn/vant/empty-image-default.png" />
          <text class="empty-text">暂无相关试卷资源~</text>
        </view>
      </view>
    </view>
  </view>
</template>


<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getPaperListApi, getPaperSubjectsApi, incrementPaperDownloadApi } from '@/subpkg_resource/api/resource'

const keyword = ref('')
const list = ref<any[]>([])
const subjects = ref<any[]>([])

const filteredList = computed(() => {
  return list.value.filter(item => item.isRecommend)
})

const formatTags = (tags: any) => {
  if (typeof tags === 'string') {
    return tags.split(',').filter((t: string) => t.trim())
  }
  return tags || []
}

const loadData = async () => {
  try {
    // 首页列表不带关键词过滤，显示全部或精选
    const res = await getPaperListApi({})
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

const handleSearch = () => {
  if (!keyword.value.trim()) return
  uni.navigateTo({
    url: `/subpkg_resource/pages/paper-list?keyword=${keyword.value.trim()}`
  })
}

const selectSubject = (name: string) => {
  uni.navigateTo({
    url: `/subpkg_resource/pages/paper-list?subject=${name}`
  })
}

const handleSpecial = (type: string) => {
  uni.navigateTo({
    url: `/subpkg_resource/pages/paper-list?type=${type}`
  })
}

const handleItemClick = async (item: any) => {
  if (item.filePath) {
    try {
      await incrementPaperDownloadApi(item.id)
      item.downloads = (item.downloads || 0) + 1
    } catch (e) {
      console.error('更新下载计数失败', e)
    }

    const fullUrl = item.filePath.startsWith('http') ? item.filePath : __VITE_SERVER_BASEURL__ + item.filePath
    
    uni.showLoading({ title: '正在准备试卷...' })
    uni.downloadFile({
      url: fullUrl,
      success: (res) => {
        const filePath = res.tempFilePath
        uni.openDocument({
          filePath: filePath,
          success: () => {
            uni.hideLoading()
            console.log('打开文档成功')
          },
          fail: (err) => {
            uni.hideLoading()
            console.error('打开文档失败', err)
            uni.showToast({ title: '无法打开此文件', icon: 'none' })
          }
        })
      },
      fail: (err) => {
        uni.hideLoading()
        console.error('下载失败', err)
        uni.showToast({ title: '试卷获取失败', icon: 'none' })
      }
    })
  }
}

onLoad(() => {
  uni.setNavigationBarTitle({
    title: '名校试卷'
  })
})

onMounted(() => {
  loadSubjects()
  loadData()
})
</script>

<style lang="scss" scoped>
.paper-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  position: relative;
  padding-bottom: 60rpx;
}

/* 顶部大背景 */
.header-section {
  height: 280rpx;
  background: linear-gradient(135deg, #eefaf6 0%, #eef5ff 100%);
  padding: 40rpx 40rpx 0;
  box-sizing: border-box;
  position: relative;
  border-bottom-left-radius: 60rpx;
  border-bottom-right-radius: 60rpx;
  z-index: 5;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 90% 10%, rgba(255,255,255,0.6) 0%, transparent 40%);
    z-index: -1;
  }
}

.header-content {
  color: #333;
  margin-bottom: 20rpx;
  
  .page-title {
    font-size: 40rpx;
    font-weight: bold;
    display: block;
    margin-bottom: 8rpx;
    letter-spacing: 2rpx;
    color: #1a5f8e;
  }
  
  .page-subtitle {
    font-size: 22rpx;
    color: #666;
  }
}

/* 悬浮搜索框 */
.search-box-wrap {
  position: absolute;
  bottom: -44rpx;
  left: 40rpx;
  right: 40rpx;
  background: #fff;
  border-radius: 44rpx;
  box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.08);
  padding: 4rpx;
  z-index: 10;
}

.content-body {
  position: relative;
  z-index: 1;
  padding: 60rpx 30rpx 30rpx;
}

.section-block {
  margin-bottom: 48rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  padding: 0 10rpx;

  .section-title {
    font-size: 34rpx;
    font-weight: bold;
    color: #1a1a1a;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -4rpx;
      left: 0;
      width: 40%;
      height: 6rpx;
      background: #2ed573;
      border-radius: 3rpx;
      opacity: 0.6;
    }
  }
  
  .header-more {
    font-size: 24rpx;
    color: #999;
    display: flex;
    align-items: center;
    gap: 4rpx;
  }
}

/* 科目网格 */
.subject-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
}

.sub-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 0;
  background: #fff;
  border-radius: 20rpx;
  transition: all 0.3s;
  border: 2rpx solid transparent;
  
  &:active {
    transform: scale(0.95);
    background: #fafbfc;
  }

  &.active {
    background: #eefaf6;
    border-color: #4facfe;
    box-shadow: 0 4rpx 12rpx rgba(79, 172, 254, 0.15);
    
    .sub-label {
      color: #1a5f8e;
      font-weight: bold;
    }
  }

  .sub-icon-box {
    width: 80rpx;
    height: 80rpx;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sub-label {
    font-size: 26rpx;
    color: #333;
    font-weight: 500;
  }
}

/* 专题布局 */
.special-flex {
  display: flex;
  gap: 20rpx;
  height: 320rpx;
}

.featured-card {
  flex: 1.2;
  background: linear-gradient(135deg, #fff9f0 0%, #ffe8d1 100%);
  border-radius: 32rpx;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8rpx 20rpx rgba(255, 152, 0, 0.05);
  border: 4rpx solid transparent;
  transition: all 0.3s;

  &.active {
    border-color: #ff6b6b;
    box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.2);
  }

  .f-content {
    padding: 32rpx;
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 2;
  }

  .f-tag {
    background: #ff6b6b;
    color: #fff;
    font-size: 18rpx;
    font-weight: bold;
    padding: 4rpx 16rpx;
    border-radius: 20rpx;
    align-self: flex-start;
    margin-bottom: 16rpx;
  }

  .f-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #855e3a;
    margin-bottom: 8rpx;
  }

  .f-desc {
    font-size: 22rpx;
    color: #a68465;
    margin-bottom: auto;
  }

  .f-btn {
    background: #855e3a;
    color: #fff;
    font-size: 22rpx;
    padding: 12rpx 28rpx;
    border-radius: 30rpx;
    align-self: flex-start;
  }

  .f-decoration {
    position: absolute;
    right: -20rpx;
    bottom: -20rpx;
    width: 120rpx;
    height: 120rpx;
    background: rgba(133, 94, 58, 0.05);
    border-radius: 50%;
    z-index: 1;
  }
}

.side-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.mini-card {
  flex: 1;
  border-radius: 32rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 4rpx solid transparent;
  transition: all 0.3s;

  &.active {
    border-color: currentColor;
    box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.1);
  }
  
  &.blue { 
    background: linear-gradient(135deg, #f0f7ff 0%, #e1f0ff 100%);
    color: #4facfe;
  }
  &.purple { 
    background: linear-gradient(135deg, #f8f0ff 0%, #f0e1ff 100%);
    color: #9b51e0;
  }

  .m-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 4rpx;
  }

  .m-desc {
    font-size: 20rpx;
    color: #8c8c8c;
  }
}

/* 列表容器 */
.list-container {
  margin-top: 20rpx;
}

.paper-item-card {
  display: flex;
  background: #fff;
  border-radius: 28rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.02);
  border: 1rpx solid #f0f3f5;
  transition: all 0.3s;

  &:active {
    transform: scale(0.98);
    background: #fafbfc;
  }

  .p-left {
    margin-right: 24rpx;
    .p-icon-bg {
      width: 88rpx;
      height: 88rpx;
      background: #f0f7ff;
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .p-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .p-name {
    font-size: 30rpx;
    font-weight: 600;
    color: #1a1a1a;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    margin-bottom: 12rpx;
  }

  .p-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-bottom: 16rpx;
  }

  .p-tag-item {
    font-size: 20rpx;
    color: #00897b;
    background: rgba(0, 137, 123, 0.06);
    padding: 4rpx 16rpx;
    border-radius: 8rpx;
  }

  .p-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16rpx;
    border-top: 1rpx solid #f5f7fa;

    .p-info-text {
      font-size: 22rpx;
      color: #999;
    }

    .p-count {
      display: flex;
      align-items: center;
      gap: 6rpx;
      font-size: 22rpx;
      color: #999;
    }
  }
}

.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
  
  .empty-text {
    margin-top: 24rpx;
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


