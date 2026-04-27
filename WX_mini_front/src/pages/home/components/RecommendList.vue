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
      <view class="title-left">
        <view class="title-line"></view>
        <text class="section-title">推荐课程</text>
      </view>
      <view class="section-more" @click="emit('more')">
        <text>查看全部</text>
        <wd-icon name="arrow-right" size="14px" color="#999" />
      </view>
    </view>

    <view class="recommend-grid">
      <view
        class="course-card"
        v-for="course in recommendCourses"
        :key="course.id"
        @click="emit('click', course)"
      >
        <view class="card-top">
          <image :src="course.image" mode="aspectFill" class="course-img" />
          <view class="svip-badge" v-if="!isSVIPUser">
            <text class="badge-text">SVIP</text>
          </view>
        </view>
        <view class="card-content">
          <text class="course-name">{{ course.name }}</text>
          <view class="card-footer">
            <view class="price-box">
              <text class="currency">￥</text>
              <text class="price">{{ course.price }}</text>
            </view>
            <view class="action-btn">
              <text>去学习</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.recommend-section {
  width: 100%;
  margin-top: 40rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  padding: 0 4rpx;

  .title-left {
    display: flex;
    align-items: center;
    
    .title-line {
      width: 8rpx;
      height: 32rpx;
      background: linear-gradient(180deg, #4d80f0 0%, #2b5ae1 100%);
      border-radius: 4rpx;
      margin-right: 16rpx;
    }

    .section-title {
      font-size: 34rpx;
      font-weight: 600;
      color: #1a1a1a;
      letter-spacing: 1rpx;
    }
  }

  .section-more {
    display: flex;
    align-items: center;
    font-size: 26rpx;
    color: #999;
    
    text {
      margin-right: 4rpx;
    }
  }
}

.recommend-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  width: 100%;

  .course-card {
    width: 100%;
    background: #ffffff;
    border-radius: 24rpx;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.04);
    transition: transform 0.2s ease;

    &:active {
      transform: scale(0.98);
    }

    .card-top {
      position: relative;
      width: 100%;
      height: 200rpx;
      background-color: #f0f2f5;

      .course-img {
        width: 100%;
        height: 100%;
        display: block;
      }

      .svip-badge {
        position: absolute;
        top: 0;
        left: 0;
        background: linear-gradient(135deg, #3a3a3a 0%, #1a1a1a 100%);
        padding: 4rpx 16rpx;
        border-radius: 0 0 16rpx 0;
        box-shadow: 2rpx 2rpx 8rpx rgba(0,0,0,0.2);

        .badge-text {
          color: #f6d365;
          font-size: 20rpx;
          font-weight: bold;
          font-style: italic;
        }
      }
    }

    .card-content {
      padding: 20rpx;
      display: flex;
      flex-direction: column;
      flex: 1;

      .course-name {
        font-size: 28rpx;
        color: #333333;
        font-weight: 500;
        line-height: 1.5;
        height: 84rpx; // 保持两行高度
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin-bottom: 16rpx;
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: auto;

        .price-box {
          display: flex;
          align-items: baseline;
          color: #ff4d4f;

          .currency {
            font-size: 24rpx;
            font-weight: bold;
          }

          .price {
            font-size: 34rpx;
            font-weight: bold;
          }
        }

        .action-btn {
          background: #f0f4ff;
          color: #2b5ae1;
          font-size: 22rpx;
          padding: 8rpx 20rpx;
          border-radius: 30rpx;
          font-weight: 500;
        }
      }
    }
  }
}
</style>
