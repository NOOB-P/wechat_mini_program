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
          <wd-img :src="course.image" :width="160" :height="100" round class="item-img" />
          <view class="svip-tag" v-if="!isSVIPUser">SVIP</view>
        </view>
        <view class="item-info">
          <view class="name-wrap">
            <text class="item-name">{{ course.name }}</text>
            <wd-icon
              v-if="!isSVIPUser"
              name="lock-on"
              size="14px"
              color="#f6d365"
              style="margin-left: 8rpx;"
            />
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
    padding: 20rpx;
    margin-bottom: 20rpx;
    display: flex;
    gap: 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.02);

    .img-wrap {
      position: relative;

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
      justify-content: space-between;

      .name-wrap {
        display: flex;
        align-items: center;
        margin-bottom: 8rpx;
      }

      .item-name {
        font-size: 30rpx;
        font-weight: 500;
        color: #333;
      }

      .item-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .item-price {
          font-size: 32rpx;
          font-weight: bold;
          color: #f44336;
        }
      }
    }
  }
}
</style>
