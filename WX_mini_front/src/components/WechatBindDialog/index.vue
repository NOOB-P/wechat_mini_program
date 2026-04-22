<script setup lang="ts">
import { useWechatBindPopup } from '@/utils/wechat-bind'

const { popupState, confirmWechatBind, cancelWechatBind } = useWechatBindPopup()
</script>

<template>
  <wd-popup
    v-model="popupState.visible"
    position="center"
    :close-on-click-modal="!popupState.force"
    custom-style="width: 650rpx; border-radius: 32rpx; overflow: hidden;"
  >
    <view class="wechat-bind-dialog">
      <view class="dialog-hero">
        <view class="icon-box">
          <wd-icon name="wechat" size="28px" color="#07c160" />
        </view>
        <text class="dialog-title">{{ popupState.title }}</text>
        <text class="dialog-subtitle">{{ popupState.subtitle }}</text>
      </view>

      <view class="reason-list">
        <view v-for="reason in popupState.reasons" :key="reason" class="reason-item">
          <wd-icon name="check-outline" size="16px" color="#07c160" />
          <text>{{ reason }}</text>
        </view>
      </view>

      <view class="dialog-tip">
        {{ popupState.force ? '完成绑定后才能继续当前操作。' : '你也可以稍后到设置页完成绑定。' }}
      </view>

      <view class="action-group">
        <wd-button type="primary" block :loading="popupState.loading" @click="confirmWechatBind">
          {{ popupState.confirmText }}
        </wd-button>
        <wd-button block plain @click="cancelWechatBind">
          {{ popupState.cancelText }}
        </wd-button>
      </view>
    </view>
  </wd-popup>
</template>

<style lang="scss" scoped>
@import './index.scss';
</style>
