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
        <text class="dialog-title">{{ popupState.title }}</text>
      </view>

      <view class="action-group">
        <wd-button type="primary" block :loading="popupState.loading" @click="confirmWechatBind">
          {{ popupState.confirmText }}
        </wd-button>
        <view v-if="!popupState.force" class="cancel-btn" @click="cancelWechatBind">
          {{ popupState.cancelText }}
        </view>
      </view>
    </view>
  </wd-popup>
</template>

<style lang="scss" scoped>
@import './index.scss';
</style>
