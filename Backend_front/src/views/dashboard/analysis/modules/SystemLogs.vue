<template>
  <div class="art-card p-5 rounded-xl bg-white shadow-sm mb-5 max-sm:mb-4">
    <div class="flex justify-between items-center mb-6">
      <span class="font-bold text-lg">最近操作日志</span>
      <el-link type="primary" @click="goLogPage">查看更多</el-link>
    </div>

    <div class="h-[563px]">
      <el-scrollbar>
        <div class="space-y-4 pr-3">
          <div v-if="loading" class="flex justify-center py-4">
            <el-icon class="is-loading"><Loading /></el-icon>
          </div>
          <template v-else>
            <div 
              v-for="(item, index) in logs" 
              :key="index"
              class="flex items-center justify-between text-sm border-b border-gray-50 pb-3 last:border-0 last:pb-0"
            >
              <div class="flex items-center gap-3">
                <el-avatar :size="32" :src="item.avatar">
                  {{ item.userName?.charAt(0).toUpperCase() }}
                </el-avatar>
                <div class="flex flex-col">
                  <span class="font-medium text-gray-700">{{ item.userName }}</span>
                  <span class="text-xs text-gray-400">{{ item.operation }}</span>
                </div>
              </div>
              <span class="text-xs text-gray-400">{{ item.createTime }}</span>
            </div>
            <el-empty v-if="logs.length === 0" description="暂无操作日志" :image-size="60" />
          </template>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { Loading } from '@element-plus/icons-vue'
  import { fetchLogList } from '@/api/log/index'

  const router = useRouter()
  const logs = ref<any[]>([])
  const loading = ref(true)

  const loadLogs = async () => {
    try {
      loading.value = true
      
      const res = await fetchLogList({ page: 1, pageSize: 20 })
      
      // http 封装层已经处理了 res.data.data，所以这里的 res 直接就是业务数据
      if (res && res.records) {
        logs.value = res.records
      } else if (Array.isArray(res)) {
        // 兼容直接返回数组的情况
        logs.value = res.slice(0, 20)
      }
    } catch (error) {
      console.error('加载日志失败:', error)
    } finally {
      loading.value = false
    }
  }

  const goLogPage = () => {
    router.push({ name: 'Log' })
  }

  onMounted(() => {
    loadLogs()
  })
</script>
