<template>
  <view class="wrong-toolbar">
    <view class="toolbar-head">
      <view class="toolbar-title-wrap">
        <text class="toolbar-title">错题筛选</text>
        <text class="toolbar-subtitle">{{ sourceLabel || '当前考试' }}</text>
      </view>
      <view class="toolbar-actions">
        <wd-button size="small" plain custom-class="toolbar-btn" @click="emit('export')">下载</wd-button>
        <wd-button size="small" type="primary" plain custom-class="toolbar-btn" @click="emit('print')">委托打印</wd-button>
      </view>
    </view>

    <scroll-view scroll-x class="subject-scroll" show-scrollbar="false">
      <view class="subject-list">
        <view
          v-for="option in options"
          :key="option.value"
          class="subject-pill"
          :class="{ active: option.value === modelValue }"
          @click="emit('update:modelValue', option.value)"
        >
          <text class="pill-label">{{ option.label }}</text>
          <text class="pill-count">{{ option.count }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  sourceLabel?: string
  options: Array<{
    label: string
    value: string
    count: number
  }>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  export: []
  print: []
}>()
</script>

<style lang="scss" scoped>
.wrong-toolbar {
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border-radius: 24rpx;
  padding: 26rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(34, 94, 168, 0.06);
  border: 1rpx solid rgba(67, 100, 247, 0.08);

  .toolbar-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20rpx;
    margin-bottom: 20rpx;
  }

  .toolbar-title-wrap {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    min-width: 0;
  }

  .toolbar-title {
    font-size: 30rpx;
    font-weight: 700;
    color: #16324f;
  }

  .toolbar-subtitle {
    font-size: 22rpx;
    color: #8a97a6;
    line-height: 1.4;
  }

  .toolbar-actions {
    display: flex;
    gap: 12rpx;
    flex-shrink: 0;
  }

  .subject-scroll {
    width: 100%;
    white-space: nowrap;
  }

  .subject-list {
    display: inline-flex;
    gap: 14rpx;
    padding-bottom: 4rpx;
  }

  .subject-pill {
    min-width: 148rpx;
    padding: 16rpx 18rpx;
    border-radius: 18rpx;
    background: #f4f7fb;
    border: 1rpx solid transparent;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12rpx;
    box-sizing: border-box;
    transition: all 0.2s ease;

    &.active {
      background: linear-gradient(135deg, #e8f1ff 0%, #dceafe 100%);
      border-color: rgba(67, 100, 247, 0.18);

      .pill-label,
      .pill-count {
        color: #2456d3;
        font-weight: 700;
      }
    }
  }

  .pill-label {
    font-size: 24rpx;
    color: #516071;
  }

  .pill-count {
    min-width: 42rpx;
    height: 42rpx;
    padding: 0 10rpx;
    border-radius: 999rpx;
    background: rgba(255, 255, 255, 0.85);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 22rpx;
    color: #6b7b8c;
    box-sizing: border-box;
  }
}
</style>
