<template>
  <ElRow :gutter="20">
    <ElCol :xs="24" :md="12">
      <div class="art-card h-80 p-5 box-border mb-5 max-sm:mb-4">
        <div class="flex justify-between items-center mb-4">
          <span class="font-bold text-lg">订单处理统计概览</span>
          <el-tag type="primary">实时</el-tag>
        </div>
        <div class="flex flex-col space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-500">平台总订单量</span>
            <span class="font-bold text-blue-500 text-xl">{{ props.data?.orderStats?.total || 0 }}</span>
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
              <div class="text-xs text-gray-400 mb-1">VIP订单</div>
              <div class="text-lg font-bold">{{ props.data?.orderStats?.vip || 0 }}</div>
            </div>
            <div class="text-center">
              <div class="text-xs text-gray-400 mb-1">课程订单</div>
              <div class="text-lg font-bold">{{ props.data?.orderStats?.course || 0 }}</div>
            </div>
            <div class="text-center">
              <div class="text-xs text-gray-400 mb-1">打印订单</div>
              <div class="text-lg font-bold">{{ props.data?.orderStats?.print || 0 }}</div>
            </div>
          </div>
        </div>
      </div>
    </ElCol>

    <ElCol :xs="24" :md="12">
      <div class="art-card h-80 p-5 box-border mb-5 max-sm:mb-4">
        <div class="flex justify-between items-center mb-4">
          <span class="font-bold text-lg">订单占比分析</span>
          <el-tag type="warning">监控中</el-tag>
        </div>
        <div class="flex flex-col items-center justify-center space-y-4 py-2">
          <el-progress
            type="dashboard"
            :percentage="calculateVipPercentage"
            :color="customColors"
            :width="130"
            :stroke-width="10"
          >
            <template #default="{ percentage }">
              <div class="flex flex-col items-center">
                <span class="text-2xl font-bold">{{ percentage }}%</span>
                <span class="text-xs text-gray-400">VIP订单占比</span>
              </div>
            </template>
          </el-progress>
          <div class="text-sm text-gray-500">
            总营收订单共计 {{ props.data?.orderStats?.total || 0 }} 笔
          </div>
        </div>
      </div>
    </ElCol>
  </ElRow>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = defineProps({
    data: {
      type: Object as any,
      default: () => ({})
    }
  })

  const calculateVipPercentage = computed(() => {
    const total = props.data?.orderStats?.total || 0
    const vip = props.data?.orderStats?.vip || 0
    if (total === 0) return 0
    return Math.round((vip / total) * 100)
  })

  const customColors = [
    { color: '#5D87FF', percentage: 20 },
    { color: '#e6a23c', percentage: 40 },
    { color: '#f56c6c', percentage: 60 },
    { color: '#f56c6c', percentage: 80 },
    { color: '#f56c6c', percentage: 100 }
  ]
</script>

