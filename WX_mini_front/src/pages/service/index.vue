<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getFaqCategoryApi, getFaqListApi } from '@/api/service'
import { getWechatQrByLocationApi } from '@/api/index'
import { resolveUploadSrc } from '@/utils/upload'
import { useToast } from 'wot-design-uni'

const toast = useToast()
const searchValue = ref('')
const currentTab = ref<string | null>(null)
const categories = ref<Array<{ id: string; name: string }>>([])
const faqs = ref<any[]>([])
const activeFaq = ref<string[]>([])
const isLoading = ref(false)

const staticBaseUrl = __VITE_SERVER_BASEURL__ + '/static'

// 二维码弹窗相关
const showQrPopup = ref(false)
const currentQrCode = ref('')
const qrGroupName = ref('')

const handleContactClick = async () => {
  try {
    toast.loading('请稍后...')
    const res = await getWechatQrByLocationApi('HELP_SERVICE')
    if (res.code === 200) {
      currentQrCode.value = resolveUploadSrc(res.data.qrCodePath, true)
      qrGroupName.value = res.data.groupName
      showQrPopup.value = true
    } else {
      // 如果没有配置专用二维码，则回退到普通联系客服
      uni.showModal({
        title: '联系客服',
        content: '暂无专用二维码，是否进入在线客服聊天？',
        success: (modalRes) => {
          if (modalRes.confirm) {
            // 此处无法直接触发 button 的 open-type，通常建议直接在页面放二维码
          }
        }
      })
    }
  } catch (e) {
    toast.error('获取信息失败')
  } finally {
    toast.close()
  }
}

const normalizeCategoryName = (category: any) => {
  if (typeof category === 'string') return category
  return category?.name || category?.categoryName || category?.label || ''
}

// 核心：手动加载 FAQ 方法
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
    console.error('获取 FAQ 列表失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 初始化获取分类
const getCategories = async () => {
  try {
    const res = await getFaqCategoryApi()
    if (res.code === 200) {
      const categoryNames = (res.data || [])
        .map(normalizeCategoryName)
        .filter(Boolean)
      const catList = ['全部', ...categoryNames]
      categories.value = catList.map(name => ({ id: name, name }))
      
      currentTab.value = '全部'
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
  // 修正：wd-tabs 的 change 事件返回的是对象 { name, index }
  const newId = e.name
  if (currentTab.value !== newId) {
    currentTab.value = newId
    loadFaqData()
  }
}

onLoad(() => {
  uni.setNavigationBarTitle({
    title: '客服帮助'
  })
})

onMounted(() => {
  getCategories()
})
</script>

<template>
  <view class="service-container">
    <!-- 顶部大面积柔和渐变 -->
    <view class="header-section">
      <view class="header-content">
        <view class="title-row">
          <text class="page-title">帮助中心</text>
          <view class="online-status">
            <view class="status-dot"></view>
            <text>客服在线</text>
          </view>
        </view>
        <text class="page-subtitle">遇见问题？我们会竭诚为您解答</text>
      </view>
      
      <!-- 悬浮搜索框 -->
      <wd-search 
        v-model="searchValue" 
        placeholder="搜索您想了解的问题" 
        hide-cancel 
        @search="handleSearch" 
        @clear="handleSearch" 
        custom-style="margin-top: 28rpx; border-radius: 44rpx; bg-color=#fff;"
      />
    </view>

    <view class="content-body animate-fade-in">
      <!-- 快捷分类 - 采用胶囊样式 -->
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

      <!-- FAQ 卡片容器 -->
      <view class="faq-card-container">
        <view class="faq-card-header">
          <wd-icon name="chat" size="18px" color="#1a5f8e" />
          <text class="faq-card-title">常见问题解答</text>
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
            <text class="empty-text">未找到相关问题，您可以尝试更换关键词</text>
          </view>
        </view>
      </view>
    </view>

    <view class="contact-footer">
      <view class="contact-box" @click="handleContactClick">
        <view class="contact-btn-inner">
          <wd-icon name="chat" size="24px" color="#fff" />
          <view class="btn-text-group">
            <text class="main-text">添加客服微信 (推荐)</text>
            <text class="sub-text">1对1 专属咨询服务</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 微信二维码弹窗 -->
    <wd-popup v-model="showQrPopup" custom-style="padding: 40rpx; border-radius: 32rpx; width: 80%;" position="center">
      <view class="qr-popup-content">
        <view class="qr-title-text">{{ qrGroupName || '添加客服微信' }}</view>
        <view class="qr-desc-text">长按识别二维码或保存到相册</view>
        <image :src="currentQrCode" mode="widthFix" class="qr-img-box" show-menu-by-longpress />
        <wd-button block @click="showQrPopup = false" custom-style="margin-top: 30rpx; border-radius: 40rpx;">关闭</wd-button>
      </view>
    </wd-popup>

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

/* 顶部大背景 - 采用与名校试卷类似的轻盈风格 */
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

.content-body {
  position: relative;
  z-index: 1;
  padding: 34rpx 30rpx 30rpx;
}

/* 快捷分类 */
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

/* FAQ 卡片 */
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
  padding: 10rpx 10rpx 10rpx;
  
  .answer-text {
    font-size: 26rpx;
    color: #666;
    line-height: 1.6;
  }
}

/* 空状态 */
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

/* 底部联系按钮 */
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

/* 二维码弹窗样式 */
.qr-popup-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .qr-title-text {
    font-size: 34rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 12rpx;
  }
  
  .qr-desc-text {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 32rpx;
  }
  
  .qr-img-box {
    width: 440rpx;
    height: 440rpx;
    border-radius: 20rpx;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
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
