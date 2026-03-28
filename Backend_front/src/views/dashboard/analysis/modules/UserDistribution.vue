<template>
  <div class="art-card h-105 p-4 box-border mb-5 max-sm:mb-4">
    <div class="flex justify-between items-center px-2 pt-2">
      <span class="font-bold text-lg">用户会员分布</span>
      <el-tag type="primary">总览</el-tag>
    </div>
    <ArtRingChart
      v-if="props.data"
      :data="props.data"
      height="18rem"
      :showLegend="true"
      :radius="['50%', '70%']"
    />
  </div>
</template>

<script setup lang="ts">
  const props = defineProps({
    data: {
      type: Array as any,
      default: () => []
    }
  })
</script>

