<template>
  <view class="list-container">
    <scroll-view scroll-y class="list-wrap">
      <view class="list-item" v-for="item in list" :key="item.id" @click="handleItemClick(item)">
        <wd-img :src="item.cover" width="200rpx" height="150rpx" radius="12rpx" mode="aspectFill" />
        <view class="item-info">
          <text class="item-title">{{ item.title }}</text>
          <text class="item-author">{{ item.author }}</text>
          <view class="item-bottom">
            <text class="item-buyers">{{ item.buyers }}人已购买</text>
            <view class="item-price-wrap">
              <text class="item-episodes">{{ item.episodes }}节 / </text>
              <text class="item-price">{{ item.price }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getFamilyEduListApi } from '@/api/resource'

const list = ref<any[]>([])

const loadData = async () => {
  try {
    const res = await getFamilyEduListApi()
    if (res.code === 200) {
      list.value = res.data
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

onMounted(() => loadData())
</script>

<style lang="scss" scoped>
.list-container {
  min-height: 100vh;
  background: #f8f9fa;
}
.list-wrap {
  padding: 20rpx;
  height: 100vh;
  box-sizing: border-box;
}
.list-item {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.03);
  
  .item-info {
    flex: 1;
    margin-left: 20rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
    .item-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }
    .item-author {
      font-size: 24rpx;
      color: #ff5252;
      margin-top: 10rpx;
    }
    .item-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16rpx;
      
      .item-buyers {
        font-size: 24rpx;
        color: #999;
      }
      .item-price-wrap {
        font-size: 24rpx;
        .item-episodes { color: #999; }
        .item-price { color: #ff5252; font-weight: bold; }
      }
    }
  }
}
</style>
