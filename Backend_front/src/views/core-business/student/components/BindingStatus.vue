<template>
  <el-tag :type="isBound ? 'success' : 'info'" effect="light">
    {{ isBound ? '已绑定' : '未绑定' }}
  </el-tag>
</template>

<script setup lang="ts">
defineProps({
  isBound: {
    type: Boolean,
    default: false
  }
})
</script>
