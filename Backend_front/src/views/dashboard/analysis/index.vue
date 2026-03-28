<template>
  <div>
    <!-- 数据概览 -->
    <AnalysisStats :data="analysisData.stats" />

    <!-- 系统监控与图表 -->
    <ElRow :gutter="20">
      <ElCol :xs="24" :lg="16">
        <GrowthChart :data="analysisData.userGrowthTrend" />
        <SystemMonitor :data="analysisData.systemMonitor" />
      </ElCol>
      <ElCol :xs="24" :lg="8">
        <UserDistribution :data="analysisData.userDistribution" />
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
              @click="goPage('ExamDataHub')"
            >
              <template #icon><ArtSvgIcon icon="ri:upload-cloud-2-line" /></template>
              上传试卷
            </el-button>
            <el-button
              type="success"
              size="large"
              class="!h-12 w-full"
              plain
              @click="goPage('StudentProfile')"
            >
              <template #icon><ArtSvgIcon icon="ri:user-add-line" /></template>
              录入学生
            </el-button>
            <el-button
              type="warning"
              size="large"
              class="!h-12 w-full"
              plain
              @click="goPage('SchoolOrg')"
            >
              <template #icon><ArtSvgIcon icon="ri:building-line" /></template>
              班级管理
            </el-button>
            <el-button
              type="info"
              size="large"
              class="!h-12 w-full"
              plain
              @click="goPage('UserCenter')"
            >
              <template #icon><ArtSvgIcon icon="ri:settings-4-line" /></template>
              个人中心
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
  import { fetchGetDashboardAnalysis } from '@/api/dashboard/analysis'
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
    userDistribution: []
  })

  const loadData = async () => {
    const res = await fetchGetDashboardAnalysis()
    if (res.code === 200) {
      analysisData.value = res.data
    }
  }

  const goPage = (name: string) => {
    router.push({ name })
  }

  onMounted(() => {
    loadData()
  })
</script>

