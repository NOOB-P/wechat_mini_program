<template>
  <div class="page-container">
    <el-page-header @back="goBack" class="mb-6">
      <template #content>
        <span class="text-large font-600 mr-3"> 选择班级进行分析 </span>
        <span class="text-sm text-gray-500"> {{ projectName }} </span>
      </template>
    </el-page-header>

    <el-card shadow="never" class="mb-4">
      <el-tabs v-model="activeSchool">
        <el-tab-pane
          v-for="school in schoolList"
          :key="school.id"
          :label="school.name"
          :name="school.id"
        >
          <div class="class-grid">
            <el-row :gutter="20">
              <el-col :span="6" v-for="cls in school.classes" :key="cls.id" class="mb-4">
                <el-card shadow="hover" class="class-card" @click="handleClassClick(school, cls)">
                  <div class="class-info">
                    <div class="class-name">{{ cls.name }}</div>
                    <div class="class-stats mt-4">
                      <div class="flex justify-between items-center mb-2">
                        <span class="label">考生人数:</span>
                        <span class="value">{{ cls.studentCount }}人</span>
                      </div>
                      <div class="flex justify-between items-center mb-2">
                        <span class="label">平均分:</span>
                        <span class="value">{{ cls.avgScore }}</span>
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="label">及格率:</span>
                        <el-tag size="small" :type="cls.passRate >= 70 ? 'success' : 'warning'"
                          >{{ cls.passRate }}%</el-tag
                        >
                      </div>
                    </div>
                  </div>
                  <div class="mt-4 text-center">
                    <el-button type="primary" size="small">进入班级分析</el-button>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { fetchAnalysisClassSelect } from '@/api/core-business/exam/analysis/class-select'

  const route = useRoute()
  const router = useRouter()

  const projectId = route.query.projectId as string
  const projectName = route.query.projectName as string

  const activeSchool = ref('1')

  const schoolList = ref<any[]>([])

  const goBack = () => {
    router.push({ name: 'ExamAnalysisList' })
  }

  const handleClassClick = (school: any, cls: any) => {
    router.push({
      name: 'ExamAnalysisClassDashboard',
      query: {
        projectId,
        projectName,
        schoolId: school.id,
        schoolName: school.name,
        classId: cls.id,
        className: cls.name
      }
    })
  }

  onMounted(() => {
    fetchAnalysisClassSelect(projectId)
      .then((res) => {
        schoolList.value = res.schools || []
        if (schoolList.value.length > 0) {
          activeSchool.value = schoolList.value[0].id
        }
      })
      .catch((error: any) => {
        ElMessage.error(error.message || '加载班级分析数据失败')
      })
  })
</script>

<style scoped>
  .page-container {
    padding: 20px;
  }
  .class-card {
    cursor: pointer;
    transition: all 0.3s;
  }
  .class-card:hover {
    transform: translateY(-5px);
    border-color: var(--el-color-primary);
  }
  .class-name {
    font-size: 16px;
    font-weight: bold;
    color: var(--el-text-color-primary);
  }
  .label {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
  .value {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
  .class-grid {
    padding: 10px 0;
  }
</style>
