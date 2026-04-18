<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getFaqCategoryApi, getFaqListApi } from '@/subpkg_mine/api/service'
import { getWechatCustomerServiceByLocationApi } from '@/api/index'
import { openEnterpriseCustomerServiceChat } from '@/utils/customer-service'
import { useToast } from 'wot-design-uni'

const toast = useToast()
const searchValue = ref('')
const currentTab = ref<string | null>(null)
const categories = ref<Array<{ id: string; name: string }>>([])
const faqs = ref<any[]>([])
const activeFaq = ref<string[]>([])
const isLoading = ref(false)

const handleContactClick = async () => {
  try {
    toast.loading('加载中...')
    const res = await getWechatCustomerServiceByLocationApi('HELP_SERVICE')
    if (res.code !== 200 || !res.data) {
      toast.show(res.msg || '客服暂不可用')
      return
    }
    await openEnterpriseCustomerServiceChat(res.data)
  } catch (error) {
    console.error('Failed to open customer service chat:', error)
    toast.error((error as any)?.msg || '无法打开客服会话')
  } finally {
    toast.close()
  }
}

const normalizeCategoryName = (category: any) => {
  if (typeof category === 'string') return category
  return category?.name || category?.categoryName || category?.label || ''
}

const loadFaqData = async () => {
  if (isLoading.value || currentTab.value === null) return

  isLoading.value = true
  try {
    const params: { categoryName?: string; question?: string } = {}
    const keyword = searchValue.value.trim()

    if (currentTab.value && currentTab.value !== '全部') {
      params.categoryName = currentTab.value
    }
    if (keyword) {
      params.question = keyword
    }

    const res = await getFaqListApi(params)
    if (res.code === 200) {
      faqs.value = res.data.records || []
      activeFaq.value = []
    }
  } catch (error) {
    console.error('Failed to load FAQ list:', error)
  } finally {
    isLoading.value = false
  }
}

const getCategories = async () => {
  try {
    const res = await getFaqCategoryApi()
    if (res.code === 200) {
      const categoryNames = (res.data || []).map(normalizeCategoryName).filter(Boolean)
      const catList = ['全部', ...categoryNames]
      categories.value = catList.map((name) => ({ id: name, name }))

      currentTab.value = '全部'
      loadFaqData()
    }
  } catch (error) {
    console.error('Failed to load FAQ categories:', error)
  }
}

const handleSearch = () => {
  loadFaqData()
}

const onTabChange = (e: any) => {
  const newId = e.name
  if (currentTab.value !== newId) {
    currentTab.value = newId
    loadFaqData()
  }
}

onLoad(() => {
  uni.setNavigationBarTitle({
    title: '客服与帮助'
  })
})

onMounted(() => {
  getCategories()
})
</script>

<template>
  <view class="service-container">
    <view class="header-section">
      <view class="header-content">
        <view class="title-row">
          <text class="page-title">帮助中心</text>
          <view class="online-status">
            <view class="status-dot"></view>
            <text>在线</text>
          </view>
        </view>
        <text class="page-subtitle">搜索常见问题或直接联系在线客服。</text>
      </view>

      <view class="search-box-wrap">
        <wd-search
          v-model="searchValue"
          placeholder="搜索问题"
          hide-cancel
          @search="handleSearch"
          @clear="handleSearch"
          custom-style="background: transparent;"
        />
      </view>
    </view>

    <view class="content-body animate-fade-in">
      <view class="category-scroll-wrap">
        <scroll-view scroll-x class="category-scroll" show-scrollbar="false">
          <view class="category-list">
            <view
              v-for="cat in categories"
              :key="cat.id"
              class="category-pill"
              :class="{ active: currentTab === cat.id }"
              @click="onTabChange({ name: cat.id })"
            >
              <text>{{ cat.name }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="faq-card-container">
        <view class="faq-card-header">
          <wd-icon name="chat" size="18px" color="#1a5f8e" />
          <text class="faq-card-title">常见问题</text>
        </view>

        <view class="faq-list-wrap">
          <template v-if="faqs.length > 0">
            <wd-collapse v-model="activeFaq" :accordion="true">
              <wd-collapse-item
                v-for="faq in faqs"
                :key="faq.id"
                :title="faq.question"
                :name="String(faq.id)"
                custom-class="faq-collapse-item"
              >
                <view class="faq-answer-content">
                  <view class="answer-inner">
                    <text class="answer-text">{{ faq.answer }}</text>
                  </view>
                </view>
              </wd-collapse-item>
            </wd-collapse>
          </template>

          <view v-else-if="!isLoading" class="empty-state">
            <image class="empty-img" src="https://img.yzcdn.cn/vant/empty-image-default.png" mode="aspectFit" />
            <text class="empty-text">未找到匹配的问题。</text>
          </view>
        </view>
      </view>
    </view>

    <view class="contact-footer">
      <view class="contact-box" @click="handleContactClick">
        <view class="contact-btn-inner">
          <wd-icon name="chat" size="24px" color="#fff" />
          <view class="btn-text-group">
            <text class="main-text">开启在线客服</text>
            <text class="sub-text">一对一专业支持</text>
          </view>
        </view>
      </view>
    </view>

    <wd-toast id="wd-toast" />
  </view>
</template>

<style lang="scss" scoped>
.service-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  position: relative;
  padding-bottom: 240rpx;
}

.header-section {
  min-height: 280rpx;
  background: linear-gradient(135deg, #eefaf6 0%, #eef5ff 100%);
  padding: 40rpx 40rpx 30rpx;
  box-sizing: border-box;
  position: relative;
  border-bottom-left-radius: 60rpx;
  border-bottom-right-radius: 60rpx;
  z-index: 0;

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

  .title-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 8rpx;
  }

  .page-title {
    font-size: 44rpx;
    font-weight: bold;
    color: #1a5f8e;
    letter-spacing: 2rpx;
  }

  .online-status {
    display: flex;
    align-items: center;
    gap: 8rpx;
    background: rgba(46, 213, 115, 0.1);
    padding: 4rpx 16rpx;
    border-radius: 20rpx;

    .status-dot {
      width: 10rpx;
      height: 10rpx;
      background: #2ed573;
      border-radius: 50%;
      box-shadow: 0 0 8rpx #2ed573;
    }

    text {
      font-size: 20rpx;
      color: #27ae60;
      font-weight: 500;
    }
  }

  .page-subtitle {
    font-size: 24rpx;
    color: #666;
  }
}

.search-box-wrap {
  margin-top: 28rpx;
  background: #fff;
  border-radius: 44rpx;
  box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.06);
  padding: 4rpx;
}

.content-body {
  position: relative;
  z-index: 1;
  padding: 34rpx 30rpx 30rpx;
}

.category-scroll-wrap {
  margin-bottom: 40rpx;
}

.category-scroll {
  width: 100%;
  white-space: nowrap;
}

.category-list {
  display: flex;
  padding: 10rpx 0;
  gap: 20rpx;
}

.category-pill {
  padding: 12rpx 36rpx;
  background: #fff;
  border-radius: 36rpx;
  font-size: 26rpx;
  color: #666;
  border: 1rpx solid #f0f3f5;
  transition: all 0.3s;

  &.active {
    background: #1a5f8e;
    color: #fff;
    font-weight: bold;
    border-color: #1a5f8e;
    box-shadow: 0 6rpx 16rpx rgba(26, 95, 142, 0.2);
  }
}

.faq-card-container {
  background: #fff;
  border-radius: 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.03);
  overflow: hidden;
  border: 1rpx solid #f0f3f5;
}

.faq-card-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f7fa;

  .faq-card-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
  }
}

.faq-list-wrap {
  min-height: 400rpx;
}

:deep(.faq-collapse-item) {
  .wd-collapse-item__title {
    font-size: 28rpx !important;
    font-weight: 500 !important;
    color: #444 !important;
    padding: 30rpx !important;
    background-color: #fff !important;
  }

  .wd-collapse-item__header {
    border-bottom: 1rpx solid #f9fafb !important;
  }
}

.faq-answer-content {
  padding: 0 30rpx 30rpx;
  background-color: #fff;
}

.answer-inner {
  padding: 10rpx;

  .answer-text {
    font-size: 26rpx;
    color: #666;
    line-height: 1.6;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 40rpx;

  .empty-img {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 30rpx;
    opacity: 0.8;
  }

  .empty-text {
    font-size: 24rpx;
    color: #999;
    text-align: center;
    line-height: 1.5;
  }
}

.contact-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
  background: linear-gradient(to top, #fff 80%, rgba(255, 255, 255, 0));
  z-index: 100;
}

.contact-box {
  width: 100%;
  height: 110rpx;
  background: linear-gradient(135deg, #2ed573, #7bed9f);
  border-radius: 55rpx;
  box-shadow: 0 12rpx 32rpx rgba(46, 213, 115, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;

  &:active {
    transform: scale(0.97);
    box-shadow: 0 6rpx 16rpx rgba(46, 213, 115, 0.2);
  }
}

.contact-btn-inner {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.btn-text-group {
  display: flex;
  flex-direction: column;

  .main-text {
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
    letter-spacing: 2rpx;
  }

  .sub-text {
    color: rgba(255, 255, 255, 0.8);
    font-size: 20rpx;
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
