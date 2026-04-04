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
        <el-tab-pane v-for="school in schoolList" :key="school.id" :label="school.name" :name="school.id">
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
                        <el-tag size="small" :type="cls.passRate >= 60 ? 'success' : 'warning'">{{ cls.passRate }}%</el-tag>
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

const route = useRoute()
const router = useRouter()

const projectId = route.query.projectId as string
const projectName = route.query.projectName as string

const activeSchool = ref('1')

const schoolList = ref([
  {
    id: '1',
    name: '实验中学',
    classes: [
      { id: '101', name: '高三(1)班', studentCount: 45, avgScore: 562.5, passRate: 98.2 },
      { id: '102', name: '高三(2)班', studentCount: 48, avgScore: 545.2, passRate: 95.8 },
      { id: '103', name: '高三(3)班', studentCount: 42, avgScore: 530.1, passRate: 92.5 },
      { id: '104', name: '高三(4)班', studentCount: 46, avgScore: 555.8, passRate: 97.1 }
    ]
  },
  {
    id: '2',
    name: '第一中学',
    classes: [
      { id: '201', name: '高三(1)班', studentCount: 50, avgScore: 540.2, passRate: 94.5 },
      { id: '202', name: '高三(2)班', studentCount: 52, avgScore: 528.5, passRate: 91.2 }
    ]
  }
])

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
  if (schoolList.value.length > 0) {
    activeSchool.value = schoolList.value[0].id
  }
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
