<script setup lang="ts">
defineProps<{
  staticBaseUrl: string
}>()

const emit = defineEmits(['click'])
</script>

<template>
  <view class="eval-section">
    <view class="eval-grid">
      <view class="eval-item" @click="emit('click', 'academic')">
        <image class="eval-icon" :src="staticBaseUrl + '/home/academic_eval.png'" mode="widthFix" />
        <text class="eval-text">试卷库</text>
      </view>
      <view class="eval-item" @click="emit('click', 'character')">
        <image class="eval-icon" :src="staticBaseUrl + '/home/character_eval.png'" mode="widthFix" />
        <text class="eval-text">性格测评</text>
      </view>
      <view class="eval-item" @click="emit('click', 'homework')">
        <image class="eval-icon" :src="staticBaseUrl + '/home/homework_check.png'" mode="widthFix" />
        <text class="eval-text">作业批改</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.eval-section {
  margin-bottom: 24rpx;

  .eval-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20rpx;

    .eval-item {
      background-color: transparent;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;

      .eval-icon {
        width: 100%;
        display: block;
      }

      .eval-text {
        position: absolute;
        bottom: 20rpx;
        font-size: 26rpx;
        color: #333;
        font-weight: 500;
      }
    }
  }
}
</style>
