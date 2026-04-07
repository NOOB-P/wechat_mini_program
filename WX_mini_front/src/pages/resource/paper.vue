<template>
  <view class="paper-container">
    <!-- 顶部背景渐变 -->
    <view class="header-bg"></view>

    <view class="sticky-header">
      <view class="search-wrap">
        <wd-search 
          v-model="keyword" 
          placeholder="搜索试卷、学校或年份" 
          hide-cancel 
          @search="loadData" 
          @clear="loadData" 
          custom-style="background: transparent;"
        />
      </view>
    </view>

    <view class="content-body animate-fade-in">
      <view class="subject-grid-card">
        <view class="grid-title">科目分类</view>
        <view class="grid-content">
          <view class="sub-item" v-for="sub in subjects" :key="sub.name" @click="selectSubject(sub.name)">
            <view class="sub-icon-wrap" :style="{ background: sub.color + '1a' }">
              <wd-icon :name="sub.icon" size="20px" :color="sub.color" />
            </view>
            <text class="sub-name">{{ sub.name }}</text>
          </view>
        </view>
      </view>

      <view class="special-section-card">
        <view class="section-header">
          <view class="title-left">
            <view class="title-indicator"></view>
            <text class="sec-title">专题试卷</text>
          </view>
          <text class="sec-more">更多专辑 <wd-icon name="arrow-right" size="12px" /></text>
        </view>
        
        <view class="special-layout">
          <view class="card-featured" @click="handleSpecial('FAMOUS')">
            <view class="card-inner">
              <view class="card-text">
                <text class="c-title">名校真题</text>
                <text class="c-desc">同步全国名校 实时更新</text>
              </view>
              <view class="card-badge">HOT</view>
              <view class="c-btn">进入</view>
            </view>
          </view>
          
          <view class="card-column">
            <view class="card-mini blue" @click="handleSpecial('MONTHLY')">
              <text class="c-title">月考专栏</text>
              <text class="c-desc">阶段提升 查漏补缺</text>
            </view>
            <view class="card-mini purple" @click="handleSpecial('JOINT')">
              <text class="c-title">联考专辑</text>
              <text class="c-desc">掌握趋势 提前备考</text>
            </view>
          </view>
        </view>
      </view>

      <view class="list-section-card">
        <view class="tabs-header">
          <view 
            class="tab-item" 
            :class="{ active: currentTab === 'all' }" 
            @click="currentTab = 'all'"
          >
            <text>全部试卷</text>
            <view class="active-line"></view>
          </view>
          <view 
            class="tab-item" 
            :class="{ active: currentTab === 'recommend' }" 
            @click="currentTab = 'recommend'"
          >
            <text>编辑精选</text>
            <view class="active-line"></view>
          </view>
        </view>
        
        <view class="paper-list-wrap">
          <view 
            class="paper-card" 
            v-for="(item, index) in filteredList" 
            :key="item.id" 
            @click="handleItemClick(item)"
          >
            <view class="paper-header">
              <view class="paper-type-icon">
                <wd-icon name="file-word" size="20px" color="#1a5f8e" />
              </view>
              <text class="p-title-text">{{ item.title }}</text>
            </view>
            
            <view class="p-tags-row">
              <view class="tag-item" v-for="tag in formatTags(item.tags)" :key="tag">{{ tag }}</view>
            </view>
            
            <view class="p-footer">
              <view class="footer-left">
                <text class="footer-info">{{ item.year }} · {{ item.grade }}</text>
              </view>
              <view class="footer-right">
                <wd-icon name="download" size="14px" color="#999" />
                <text class="download-count">{{ item.downloads || 0 }}次下载</text>
              </view>
            </view>
          </view>
        </view>

        <view class="empty-state" v-if="filteredList.length === 0">
          <wd-img :width="100" :height="100" src="https://img.yzcdn.cn/vant/empty-image-default.png" />
          <text class="empty-text">没有找到符合条件的试卷~</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
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

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 380rpx;
  background: linear-gradient(135deg, #d4f9f2 0%, #eef5ff 100%);
  z-index: 0;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  padding: 20rpx 30rpx;
}

.search-wrap {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 40rpx;
  padding: 4rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.content-body {
  position: relative;
  z-index: 1;
  padding: 20rpx 30rpx;
}

/* 科目分类卡片 */
.subject-grid-card {
  background: #fff;
  border-radius: 32rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.03);

  .grid-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 24rpx;
  }

  .grid-content {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20rpx;
  }

  .sub-item {
    display: flex;
    align-items: center;
    background: #f8fbff;
    padding: 20rpx 16rpx;
    border-radius: 16rpx;
    transition: all 0.3s;

    &:active {
      transform: scale(0.96);
      background: #f0f6ff;
    }

    .sub-icon-wrap {
      width: 56rpx;
      height: 56rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12rpx;
      margin-right: 12rpx;
      flex-shrink: 0;
    }

    .sub-name {
      font-size: 26rpx;
      color: #333;
      font-weight: 500;
    }
  }
}

/* 专题卷区域 */
.special-section-card {
  background: #fff;
  border-radius: 32rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.03);

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .title-left {
      display: flex;
      align-items: center;
      
      .title-indicator {
        width: 8rpx;
        height: 32rpx;
        background: linear-gradient(180deg, #1a5f8e, #00897b);
        border-radius: 4rpx;
        margin-right: 16rpx;
      }
      
      .sec-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #1a1a1a;
      }
    }
    
    .sec-more {
      font-size: 24rpx;
      color: #999;
      display: flex;
      align-items: center;
      gap: 4rpx;
    }
  }

  .special-layout {
    display: flex;
    gap: 20rpx;
    height: 300rpx;

    .card-featured {
      flex: 1.2;
      background: linear-gradient(135deg, #fff9f0, #ffe8d1);
      border-radius: 24rpx;
      position: relative;
      overflow: hidden;
      
      .card-inner {
        height: 100%;
        padding: 30rpx;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .c-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #855e3a;
        margin-bottom: 8rpx;
        display: block;
      }

      .c-desc {
        font-size: 22rpx;
        color: #a68465;
      }

      .card-badge {
        position: absolute;
        top: 0;
        right: 0;
        background: #ff6b6b;
        color: #fff;
        font-size: 18rpx;
        font-weight: bold;
        padding: 4rpx 12rpx;
        border-bottom-left-radius: 12rpx;
      }

      .c-btn {
        background: #855e3a;
        color: #fff;
        font-size: 22rpx;
        padding: 10rpx 30rpx;
        border-radius: 30rpx;
        align-self: flex-start;
      }
    }

    .card-column {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 20rpx;

      .card-mini {
        flex: 1;
        border-radius: 24rpx;
        padding: 20rpx;
        display: flex;
        flex-direction: column;
        justify-content: center;

        &.blue { background: linear-gradient(135deg, #f0f7ff, #e1f0ff); }
        &.purple { background: linear-gradient(135deg, #f8f0ff, #f0e1ff); }

        .c-title {
          font-size: 26rpx;
          font-weight: bold;
          color: #333;
          margin-bottom: 4rpx;
        }

        .c-desc {
          font-size: 20rpx;
          color: #8c8c8c;
        }
      }
    }
  }
}

/* 列表卡片区域 */
.list-section-card {
  background: #fff;
  border-radius: 32rpx;
  padding: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.03);

  .tabs-header {
    display: flex;
    gap: 48rpx;
    margin-bottom: 30rpx;
    border-bottom: 2rpx solid #f5f5f5;

    .tab-item {
      padding-bottom: 20rpx;
      position: relative;
      font-size: 30rpx;
      color: #8c8c8c;
      transition: all 0.3s;

      &.active {
        color: #1a5f8e;
        font-weight: bold;
        
        .active-line {
          position: absolute;
          bottom: -2rpx;
          left: 0;
          width: 100%;
          height: 6rpx;
          background: linear-gradient(90deg, #1a5f8e, #00897b);
          border-radius: 4rpx;
        }
      }
    }
  }

  .paper-card {
    background: #fcfdfe;
    border: 2rpx solid #f0f5ff;
    border-radius: 20rpx;
    padding: 24rpx;
    margin-bottom: 24rpx;
    transition: all 0.3s;

    &:active {
      background: #f5f9ff;
      transform: scale(0.99);
    }

    .paper-header {
      display: flex;
      gap: 16rpx;
      margin-bottom: 16rpx;

      .paper-type-icon {
        background: rgba(26, 95, 142, 0.1);
        width: 44rpx;
        height: 44rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8rpx;
        flex-shrink: 0;
      }

      .p-title-text {
        font-size: 30rpx;
        font-weight: 600;
        color: #1a1a1a;
        line-height: 1.4;
      }
    }

    .p-tags-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;
      margin-bottom: 20rpx;

      .tag-item {
        font-size: 20rpx;
        color: #00897b;
        background: rgba(0, 137, 123, 0.08);
        padding: 4rpx 14rpx;
        border-radius: 6rpx;
      }
    }

    .p-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16rpx;
      border-top: 2rpx dashed #f0f0f0;

      .footer-info {
        font-size: 22rpx;
        color: #999;
      }

      .footer-right {
        display: flex;
        align-items: center;
        gap: 6rpx;
        
        .download-count {
          font-size: 22rpx;
          color: #999;
        }
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
  
  .empty-text {
    margin-top: 20rpx;
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
</style>

