<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getFaqCategoryApi, getFaqListApi } from '@/api/service'

const searchValue = ref('')
const currentTab = ref<number | null>(null) // 初始化为 null，避免与默认值 1 冲突
const categories = ref<any[]>([])
const faqs = ref<any[]>([])
const activeFaq = ref<number[]>([])
const isLoading = ref(false) // 增加请求锁，防止并发

// 核心：手动加载 FAQ 方法
const loadFaqData = async () => {
  if (isLoading.value || currentTab.value === null) return
  
  isLoading.value = true
  try {
    const res = await getFaqListApi({
      categoryId: currentTab.value,
      keyword: searchValue.value
    })
    if (res.code === 200) {
      faqs.value = res.data
      activeFaq.value = [] 
    }
  } catch (error) {
    console.error('获取 FAQ 列表失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 初始化获取分类
const getCategories = async () => {
  try {
    const res = await getFaqCategoryApi()
    if (res.code === 200 && res.data.length > 0) {
      categories.value = res.data
      // 设置初始 Tab 并手动触发第一次加载
      currentTab.value = res.data[0].id
      loadFaqData()
    }
  } catch (error) {
    console.error('获取 FAQ 分类失败:', error)
  }
}

// 搜索处理
const handleSearch = () => {
  loadFaqData()
}

// Tab 切换处理：由组件事件显式触发
const onTabChange = (e: any) => {
  // e.value 是 wd-tabs 传出的当前选中项的 name (即我们的 cat.id)
  const newId = e.value
  if (currentTab.value !== newId) {
    currentTab.value = newId
    loadFaqData()
  }
}

onMounted(() => {
  getCategories()
})

const goBack = () => {
  uni.navigateBack()
}
</script>

<template>
  <view class="service-container">
    <view class="status-bar"></view>
    
    <view class="nav-bar">
      <view class="back-btn" @click="goBack">
        <wd-icon name="arrow-left" size="40rpx" color="#333" />
      </view>
      <text class="title">家长咨询与服务</text>
      <view class="placeholder"></view>
    </view>

    <view class="search-box">
      <wd-search 
        v-model="searchValue" 
        placeholder="搜索您想了解的问题" 
        hide-cancel 
        @search="handleSearch" 
        @clear="handleSearch" 
      />
    </view>

    <view class="faq-section">
      <view class="section-title">常见问题 (FAQ)</view>
      
      <!-- 关键修改：使用 :model-value 和 @change 显式控制，去掉 v-model -->
      <wd-tabs 
        :model-value="currentTab" 
        @change="onTabChange" 
        sticky 
        :offset-top="88"
      >
        <wd-tab 
          v-for="cat in categories" 
          :key="cat.id" 
          :title="cat.name" 
          :name="cat.id"
        ></wd-tab>
      </wd-tabs>

      <scroll-view scroll-y class="faq-list">
        <template v-if="faqs.length > 0">
          <wd-collapse v-model="activeFaq">
            <wd-collapse-item v-for="faq in faqs" :key="faq.id" :title="faq.question" :name="faq.id">
              <view class="faq-answer">{{ faq.answer }}</view>
            </wd-collapse-item>
          </wd-collapse>
        </template>
        <view v-else-if="!isLoading" class="empty-state">
          <wd-status-tip image="search" tip="未找到相关问题" />
        </view>
        <!-- 可以在此处增加 loading 状态展示 -->
      </scroll-view>
    </view>

    <view class="contact-footer">
      <button class="cs-btn" open-type="contact">
        <wd-icon name="chat" size="40rpx" class="btn-icon" />
        <text>在线客服 (7×24小时)</text>
      </button>
      <text class="cs-tip">提供文字、语音、视频等多种实时沟通方式</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.service-container {
  min-height: 100vh;
  background-color: #f5f6f8;
  padding-bottom: 200rpx; /* 留出底部按钮空间 */
}

.status-bar {
  height: var(--status-bar-height);
  background-color: #fff;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  background-color: #fff;
  padding: 0 32rpx;
  position: sticky;
  top: var(--status-bar-height);
  z-index: 100;
  
  .back-btn {
    padding: 20rpx;
    margin: -20rpx;
    position: relative;
    z-index: 10;
  }
  
  .title {
    font-size: 34rpx;
    font-weight: 600;
    color: #333;
  }
  
  .placeholder {
    width: 40rpx;
  }
}

.search-box {
  background-color: #fff;
  padding: 10rpx 0 20rpx;
}

.faq-section {
  background-color: #fff;
  margin-top: 20rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    padding: 30rpx 32rpx 10rpx;
  }
}

.faq-list {
  height: calc(100vh - var(--status-bar-height) - 88rpx - 120rpx - 100rpx - 200rpx);
  padding: 10rpx 0;
}

.faq-answer {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  background-color: #f9f9f9;
  padding: 20rpx;
  border-radius: 12rpx;
}

.empty-state {
  padding-top: 100rpx;
}

.contact-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 30rpx 40rpx 40rpx;
  box-shadow: 0 -4rpx 16rpx rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 999;
  
  .cs-btn {
    width: 100%;
    height: 90rpx;
    background: linear-gradient(90deg, #4b89ff, #3266ff);
    color: #fff;
    border-radius: 45rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 32rpx;
    font-weight: bold;
    border: none;
    
    &::after {
      border: none;
    }
    
    .btn-icon {
      margin-right: 12rpx;
    }
  }
  
  .cs-tip {
    font-size: 24rpx;
    color: #999;
    margin-top: 16rpx;
  }
}
</style>
