<script setup lang="ts">
defineProps<{
  recommendCourses: any[]
  isSVIPUser: boolean
}>()

const emit = defineEmits(['click', 'more'])
</script>

<template>
  <view class="recommend-section">
    <view class="section-header">
      <text class="section-title">推荐课程</text>
      <text class="section-more" @click="emit('more')">更多</text>
    </view>

    <view class="recommend-list">
      <view
        class="recommend-item"
        v-for="course in recommendCourses"
        :key="course.id"
        @click="emit('click', course)"
      >
        <view class="img-wrap">
          <image :src="course.image" mode="aspectFill" class="item-img" />
          <view class="svip-tag" v-if="!isSVIPUser">SVIP</view>
        </view>
        <view class="item-info">
          <view class="name-wrap">
            <text class="item-name">{{ course.name }}</text>
          </view>
          <view class="item-bottom">
            <text class="item-price">￥{{ course.price }}</text>
            <wd-button type="primary" size="small" plain>去学习</wd-button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }

  .section-more {
    font-size: 24rpx;
    color: #999;
  }
}

.recommend-list {
  .recommend-item {
    background-color: #fff;
    border-radius: 20rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    display: flex;
    gap: 24rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.02);

    .img-wrap {
      position: relative;
      width: 220rpx;
      height: 132rpx;
      border-radius: 16rpx;
      overflow: hidden;
      flex-shrink: 0;

      .item-img {
        width: 100%;
        height: 100%;
        display: block;
      }

      .svip-tag {
        position: absolute;
        top: 0;
        left: 0;
        background: linear-gradient(135deg, #333 0%, #1a1a1a 100%);
        color: #f6d365;
        font-size: 20rpx;
        padding: 4rpx 12rpx;
        border-radius: 16rpx 0 16rpx 0;
        z-index: 1;
      }
    }

    .item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 132rpx;
      overflow: hidden;

      .name-wrap {
        display: flex;
        align-items: flex-start;
        margin-bottom: 8rpx;
        width: 100%;
        min-width: 0;
      }

      .item-name {
        width: 100%;
        font-size: 30rpx;
        font-weight: 500;
        color: #333;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        word-break: break-all;
      }

      .item-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: auto;
        width: 100%;
        gap: 20rpx;

        .item-price {
          font-size: 32rpx;
          font-weight: bold;
          color: #f44336;
          flex-shrink: 0;
        }

        :deep(.wd-button) {
          margin: 0 !important;
          margin-left: auto !important;
          flex-shrink: 0;
          min-width: 112rpx;
        }
      }
    }
  }
}
</style>
