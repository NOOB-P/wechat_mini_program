<template>
  <view class="list-container">
    <!-- 顶部背景渐变 -->
    <view class="header-bg"></view>

    <view class="sticky-header">
      <view class="page-title">家庭教育</view>
      <view class="page-desc">科学育儿，与孩子共同成长</view>
    </view>

    <scroll-view scroll-y class="list-scroll-view animate-fade-in">
      <view class="list-content" v-if="list.length > 0">
        <view 
          class="edu-card" 
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
            <view class="type-tag">亲子</view>
          </view>
          
          <view class="card-right">
            <view class="top-info">
              <text class="item-title-text">{{ item.title }}</text>
              <view class="author-row">
                <wd-icon name="user" size="14px" color="#1a5f8e" />
                <text class="author-name">{{ item.author || '教育专家' }}</text>
              </view>
            </view>
            
            <view class="bottom-info">
              <view class="stats-box">
                <text class="learn-count">{{ item.buyers || 0 }}人已学</text>
                <text class="dot">·</text>
                <text class="lesson-count">{{ item.episodes || 1 }}节课</text>
              </view>
              <view class="price-box">
                <text class="price-val" :class="{ free: item.price <= 0 }">
                  {{ item.price > 0 ? '￥' + item.price : '免费' }}
                </text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="empty-state" v-else>
        <wd-img :width="120" :height="120" src="https://img.yzcdn.cn/vant/empty-image-default.png" />
        <text class="empty-text">暂时还没有相关教育课程哦~</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getFamilyEduListApi } from '@/api/resource'

const list = ref<any[]>([])

const loadData = async () => {
  try {
    const res = await getFamilyEduListApi()
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

const handleItemClick = (item: any) => {
  uni.navigateTo({
    url: `/pages/course/detail?id=${item.id}`
  })
}

onLoad(() => {
  uni.setNavigationBarTitle({
    title: '家庭教育'
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
  background: linear-gradient(135deg, #eef5ff 0%, #f7f8fa 100%);
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

.edu-card {
  display: flex;
  background: #ffffff;
  border-radius: 32rpx;
  padding: 24rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(26, 95, 142, 0.05);
  animation: slideIn 0.5s ease-out forwards;
  opacity: 0;
  
  &:active {
    transform: scale(0.98);
    background: #f8fbff;
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
    background: rgba(26, 95, 142, 0.9);
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
  
  .author-name {
    font-size: 24rpx;
    color: #1a5f8e;
    font-weight: 500;
  }
}

.bottom-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  
  .stats-box {
    display: flex;
    align-items: center;
    font-size: 22rpx;
    color: #999;
    
    .dot {
      margin: 0 8rpx;
    }
  }
  
  .price-box {
    .price-val {
      font-size: 32rpx;
      font-weight: bold;
      color: #ff6b6b;
      
      &.free {
        color: #52c41a;
      }
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

