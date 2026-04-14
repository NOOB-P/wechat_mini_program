<template>
  <div>
    <!-- 数据概览 -->
    <AnalysisStats :data="analysisData.stats" />

    <!-- 系统监控与图表 -->
    <ElRow :gutter="20">
      <ElCol :xs="24" :lg="16">
        <GrowthChart :data="analysisData.userGrowthTrend" />
        
        <!-- 今日动态 -->
        <div class="art-card p-5 rounded-xl bg-white shadow-sm mb-5 max-sm:mb-4">
          <div class="flex justify-between items-center mb-6">
            <span class="font-bold text-lg">今日业务动态</span>
            <el-link type="primary">查看全部</el-link>
          </div>
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in analysisData.todayActivities"
              :key="index"
              :timestamp="activity.time"
              :type="activity.color === 'blue' ? 'primary' : activity.color === 'green' ? 'success' : activity.color === 'orange' ? 'warning' : 'info'"
            >
              <div class="flex flex-col">
                <span class="font-bold text-sm">{{ activity.title }}</span>
                <span class="text-xs text-gray-500 mt-1">{{ activity.content }}</span>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>

        <SystemMonitor :data="analysisData.systemMonitor" />
      </ElCol>
      <ElCol :xs="24" :lg="8">
        <UserDistribution :data="analysisData.userDistribution" />
        
        <!-- 系统公告 -->
        <div class="art-card p-5 rounded-xl bg-white shadow-sm mb-5 max-sm:mb-4">
          <div class="flex justify-between items-center mb-4">
            <span class="font-bold text-lg">系统公告</span>
            <el-tag size="small" type="danger">New</el-tag>
          </div>
          <div class="space-y-3">
            <div 
              v-for="(notice, index) in analysisData.notices" 
              :key="index"
              class="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-400 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {{ notice }}
            </div>
          </div>
        </div>

        <!-- 快速入口 (参考工作台风格) -->
        <div class="art-card p-5 rounded-xl bg-white shadow-sm mb-5 max-sm:mb-4 h-80">
          <div class="flex justify-between items-center mb-6">
            <span class="font-bold text-lg">常用操作</span>
            <el-tag type="info" plain>快捷方式</el-tag>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <el-button
              type="primary"
              size="large"
              class="!h-12 w-full"
              plain
              @click="goPage('PaperManage')"
            >
              <template #icon><ArtSvgIcon icon="ri:file-paper-2-line" /></template>
              试卷管理
            </el-button>
            <el-button
              type="success"
              size="large"
              class="!h-12 w-full"
              plain
              @click="goPage('CourseManage')"
            >
              <template #icon><ArtSvgIcon icon="ri:book-open-line" /></template>
              课程管理
            </el-button>
            <el-button
              type="warning"
              size="large"
              class="!h-12 w-full"
              plain
              @click="goPage('StudentProfile')"
            >
              <template #icon><ArtSvgIcon icon="ri:user-add-line" /></template>
              学生数据
            </el-button>
            <el-button
              type="info"
              size="large"
              class="!h-12 w-full"
              plain
              @click="goPage('SchoolOrg')"
            >
              <template #icon><ArtSvgIcon icon="ri:building-line" /></template>
              学校数据
            </el-button>
          </div>
        </div>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { mockAnalysisData } from '@/mock/dashboard/analysis'
  import AnalysisStats from './modules/AnalysisStats.vue'
  import SystemMonitor from './modules/SystemMonitor.vue'
  import GrowthChart from './modules/GrowthChart.vue'
  import UserDistribution from './modules/UserDistribution.vue'

  defineOptions({ name: 'Analysis' })

  const router = useRouter()
  const analysisData = ref<any>({
    stats: [],
    systemMonitor: {},
    userGrowthTrend: {},
    userDistribution: [],
    todayActivities: [],
    notices: []
  })

  const loadData = async () => {
    // 暂时使用 Mock 数据
    analysisData.value = mockAnalysisData
  }

  const goPage = (name: string) => {
    router.push({ name })
  }

  onMounted(() => {
    loadData()
  })
</script>

