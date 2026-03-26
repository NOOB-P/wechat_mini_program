<template>
  <ElRow :gutter="20">
    <ElCol :xs="24" :md="12">
      <div class="art-card h-80 p-5 box-border mb-5 max-sm:mb-4">
        <div class="flex justify-between items-center mb-4">
          <span class="font-bold text-lg">试卷处理任务队列</span>
          <el-tag type="primary">实时</el-tag>
        </div>
        <div class="flex flex-col space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-500">正在解析</span>
            <span class="font-bold text-blue-500">{{ props.data?.taskQueue?.processing }}</span>
          </div>
          <el-progress
            :percentage="100"
            status="success"
            :indeterminate="true"
            :duration="2"
            :stroke-width="12"
          />

          <div class="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div class="text-center">
              <div class="text-xs text-gray-400 mb-1">等待中</div>
              <div class="text-lg font-bold">{{ props.data?.taskQueue?.waiting }}</div>
            </div>
            <div class="text-center">
              <div class="text-xs text-gray-400 mb-1">已完成</div>
              <div class="text-lg font-bold">{{ props.data?.taskQueue?.completed }}</div>
            </div>
            <div class="text-center">
              <div class="text-xs text-gray-400 mb-1">今日总计</div>
              <div class="text-lg font-bold">{{ props.data?.taskQueue?.total }}</div>
            </div>
          </div>
        </div>
      </div>
    </ElCol>

    <ElCol :xs="24" :md="12">
      <div class="art-card h-80 p-5 box-border mb-5 max-sm:mb-4">
        <div class="flex justify-between items-center mb-4">
          <span class="font-bold text-lg">存储空间使用率</span>
          <el-tag type="warning">监控中</el-tag>
        </div>
        <div class="flex flex-col items-center justify-center space-y-4 py-2">
          <el-progress
            type="dashboard"
            :percentage="props.data?.storage?.percentage"
            :color="customColors"
            :width="130"
            :stroke-width="10"
          >
            <template #default="{ percentage }">
              <div class="flex flex-col items-center">
                <span class="text-2xl font-bold">{{ percentage }}%</span>
                <span class="text-xs text-gray-400">已用空间</span>
              </div>
            </template>
          </el-progress>
          <div class="text-sm text-gray-500">
            已用 {{ props.data?.storage?.used }} GB / 总量 {{ props.data?.storage?.total }} GB
          </div>
        </div>
      </div>
    </ElCol>
  </ElRow>
</template>

<script setup lang="ts">
  const props = defineProps({
    data: {
      type: Object as any,
      default: () => ({})
    }
  })

  const customColors = [
    { color: '#5D87FF', percentage: 20 },
    { color: '#e6a23c', percentage: 40 },
    { color: '#f56c6c', percentage: 60 },
    { color: '#f56c6c', percentage: 80 },
    { color: '#f56c6c', percentage: 100 }
  ]
</script>

