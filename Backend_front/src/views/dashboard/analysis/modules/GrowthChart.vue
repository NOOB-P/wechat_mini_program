<template>
  <div class="art-card h-105 p-4 box-border mb-5 max-sm:mb-4">
    <div class="flex justify-between items-center px-2 pt-2">
      <span class="font-bold text-lg">近30天用户增长趋势</span>
      <el-tag type="success">增长中</el-tag>
    </div>
    <ArtLineChart
      v-if="props.data?.dates"
      :data="props.data?.values"
      :xAxisData="props.data?.dates"
      height="18rem"
      :lineWidth="3"
      :showAreaColor="true"
      :smooth="true"
    />
  </div>
</template>

<script setup lang="ts">
  const props = defineProps({
    data: {
      type: Object as any,
      default: () => ({})
    }
  })
</script>

