<template>
  <view class="list-container">
    <wd-toast id="wd-toast" />
    <!-- 顶部背景渐变 -->
    <view class="header-bg"></view>

    <view class="sticky-header">
      <view class="page-title">学霸经验分享</view>
      <view class="page-desc">听学霸讲述高效学习的秘诀</view>
    </view>

    <scroll-view scroll-y class="list-scroll-view animate-fade-in">
      <view class="list-content" v-if="list.length > 0">
        <view 
          class="experience-card" 
          v-for="(item, index) in list" 
          :key="item.id" 
          @click="handleItemClick(item)"
          :style="{ animationDelay: (index * 0.1) + 's' }"
        >
          <view class="card-left">
            <image 
              :src="item.cover || 'https://img.yzcdn.cn/vant/cat.jpeg'" 
              mode="aspectFill"
              class="cover-img" 
            />
            <view class="type-tag">经验</view>
          </view>
          
          <view class="card-right">
            <view class="top-info">
              <text class="item-title-text">{{ item.title }}</text>
              <view class="author-row">
                <wd-icon name="user" size="14px" color="#ff6b6b" />
                <text class="author-name">{{ item.author || '资深学霸' }}</text>
              </view>
            </view>
            
            <view class="bottom-info">
              <view class="stats-box">
                <text class="learn-count">{{ item.buyers || 0 }}人已学</text>
                <text class="dot">·</text>
                <text class="lesson-count">{{ item.episodes || 1 }}节课</text>
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

      <view class="empty-state" v-else>
        <wd-img :width="120" :height="120" src="https://img.yzcdn.cn/vant/empty-image-default.png" />
        <text class="empty-text">暂时还没有学霸分享哦~</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getStudentTalkListApi } from '@/subpkg_resource/api/resource'
import { buyCourseApi } from '@/api/course'
import { useToast } from 'wot-design-uni'

const list = ref<any[]>([])
const toast = useToast()

const loadData = async () => {
  try {
    const res = await getStudentTalkListApi()
    if (res.code === 200) {
      // 修正：处理图片路径
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
      toast.loading('正在下单...')
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
    } finally {
      toast.close()
    }
  } else {
    handleItemClick(item)
  }
}

const handleItemClick = (item: any) => {
  uni.navigateTo({
    url: `/subpkg_course/pages/course/detail?id=${item.id}`
  })
}

onLoad(() => {
  uni.setNavigationBarTitle({
    title: '学霸说'
  })
})

onMounted(() => loadData())
</script>

<style lang="scss" scoped>
.list-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  position: relative;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 360rpx;
  background: linear-gradient(135deg, #fff5f5 0%, #fff0f0 100%);
  z-index: 0;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 40rpx 40rpx 30rpx;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  
  .page-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 8rpx;
  }
  
  .page-desc {
    font-size: 24rpx;
    color: #999;
  }
}

.list-scroll-view {
  height: calc(100vh - 160rpx);
  position: relative;
  z-index: 1;
}

.list-content {
  padding: 20rpx 30rpx 40rpx;
}

.experience-card {
  display: flex;
  background: #ffffff;
  border-radius: 32rpx;
  padding: 24rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.05);
  animation: slideIn 0.5s ease-out forwards;
  opacity: 0;
  
  &:active {
    transform: scale(0.98);
    background: #fff9f9;
  }
}

.card-left {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  border-radius: 24rpx;
  overflow: hidden;
  flex-shrink: 0;
  
  .cover-img {
    width: 100%;
    height: 100%;
  }
  
  .type-tag {
    position: absolute;
    top: 12rpx;
    left: 12rpx;
    background: rgba(255, 107, 107, 0.9);
    color: #fff;
    font-size: 18rpx;
    padding: 4rpx 12rpx;
    border-radius: 8rpx;
    font-weight: bold;
  }
}

.card-right {
  flex: 1;
  margin-left: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 8rpx 0;
}

.item-title-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  margin-bottom: 16rpx;
}

.author-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 8rpx;
  
  .author-name {
    font-size: 24rpx;
    color: #ff6b6b;
    font-weight: 500;
  }
}

.bottom-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  
  .stats-box {
    display: flex;
    align-items: center;
    font-size: 22rpx;
    color: #999;
    
    .dot {
      margin: 0 8rpx;
    }
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
      font-size: 26rpx;
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
    padding: 12rpx 36rpx;
    border-radius: 40rpx;
    box-shadow: 0 6rpx 16rpx rgba(79, 172, 254, 0.24);
    
    text {
      color: #fff;
      font-size: 26rpx;
      font-weight: bold;
    }
    
    &:active {
      transform: scale(0.96);
      opacity: 0.9;
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
  
  .empty-text {
    margin-top: 30rpx;
    font-size: 28rpx;
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

