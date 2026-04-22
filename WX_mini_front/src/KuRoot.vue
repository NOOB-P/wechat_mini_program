<!--
 * @Description: 全局挂载
-->
<script setup lang="ts">
// 顶部消息提示
import GlobalNotify from '@/components/GlobalNotify/index.vue';
import WechatBindDialog from '@/components/WechatBindDialog/index.vue'
</script>

<template>
  <GlobalNotify />
  <WechatBindDialog />
  <KuRootView />
</template>
