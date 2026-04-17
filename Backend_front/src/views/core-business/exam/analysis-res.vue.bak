<template>
  <div class="page-container">
    <el-card shadow="never" class="mb-4">
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex items-center">
            <el-button :icon="Back" circle @click="goBack" class="mr-4" />
            <span class="font-bold text-lg">解析结果概览</span>
          </div>
          <el-tag type="success">解析完成</el-tag>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-statistic title="成功匹配人数" :value="successList.length" value-style="color: var(--el-color-success)" />
        </el-col>
        <el-col :span="12">
          <el-statistic title="匹配失败人数" :value="failList.length" value-style="color: var(--el-color-danger)" />
        </el-col>
      </el-row>
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="成功匹配" name="success">
          <!-- 设置 height="500" 固定表头并支持内部滚动 -->
          <el-table 
            :data="successList" 
            border 
            style="width: 100%" 
            v-loading="loading"
            height="550"
          >
            <!-- 固定左侧关键列 -->
            <el-table-column prop="studentNo" label="学号" width="120" align="center" fixed="left" />
            <el-table-column prop="name" label="姓名" width="100" align="center" fixed="left" />
            <el-table-column prop="score" label="总分" width="100" align="center" fixed="left">
              <template #default="{ row }">
                <span class="font-bold text-primary">{{ row.score }}</span>
              </template>
            </el-table-column>
            
            <!-- 动态生成小题得分列，使用 min-width 以支持自适应伸缩 -->
            <el-table-column 
              v-for="(_, index) in maxQuestions" 
              :key="index" 
              :label="`第${index + 1}题`" 
              min-width="90" 
              align="center"
            >
              <template #default="{ row }">
                {{ row.questionScores?.[index] ?? '-' }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="匹配失败 (需手动处理)" name="fail">
          <el-table :data="failList" border style="width: 100%" v-loading="loading" height="550">
            <el-table-column prop="studentNo" label="未知学号" width="150" align="center" fixed="left" />
            <el-table-column prop="reason" label="失败原因" min-width="250" show-overflow-tooltip />
            <el-table-column label="操作" width="150" fixed="right" align="center">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleBind(row)">手动绑定学生</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 手动绑定对话框保持不变 -->
    <el-dialog v-model="dialogVisible" title="手动绑定学生" width="450px">
      <el-form label-width="100px">
        <el-form-item label="当前异常学号">
          <el-input :value="currentFailItem?.studentNo" disabled />
        </el-form-item>
        <el-form-item label="选择真实学生">
          <el-select v-model="bindStudentId" placeholder="请选择或搜索学生" filterable class="w-full">
            <el-option label="学生A (2023001)" value="stu_1" />
            <el-option label="学生B (2023002)" value="stu_2" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBind">确定绑定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchGetAnalysisResult, fetchBindStudent } from '@/api/core-business/exam/analysis-res'
import { ElMessage } from 'element-plus'
import { Back } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const activeTab = ref('success')
const successList = ref<Api.Exam.SuccessItem[]>([])
const failList = ref<Api.Exam.FailItem[]>([])

const dialogVisible = ref(false)
const currentFailItem = ref<any>(null)
const bindStudentId = ref('')

// 计算最大题数，用于动态生成列
const maxQuestions = computed(() => {
  if (successList.value.length === 0) return 0
  return Math.max(...successList.value.map(item => item.questionScores?.length || 0))
})

const loadData = async () => {
  const examId = route.query.id as string
  if (!examId) return
  loading.value = true
  try {
    const res = await fetchGetAnalysisResult(examId)
    if (res.code === 200) {
      successList.value = res.data.successList
      failList.value = res.data.failList
      // 如果有失败项，默认切到失败页
      if (failList.value.length > 0) {
        activeTab.value = 'fail'
      } else {
        activeTab.value = 'success'
      }
    }
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

const handleBind = (row: any) => {
  currentFailItem.value = row
  bindStudentId.value = ''
  dialogVisible.value = true
}

const submitBind = async () => {
  if (!bindStudentId.value) {
    ElMessage.warning('请选择要绑定的学生')
    return
  }
  const res = await fetchBindStudent({
    studentNo: currentFailItem.value.studentNo,
    targetStudentId: bindStudentId.value
  })
  if (res.code === 200) {
    ElMessage.success('绑定成功')
    dialogVisible.value = false
    loadData() // 重新加载数据
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.table-card {
  margin-top: 20px;
}
.text-primary {
  color: var(--el-color-primary);
}
.w-full {
  width: 100%;
}

/* 优化横向滚动条显示 */
:deep(.el-table__body-wrapper::-webkit-scrollbar) {
  height: 10px;
}
:deep(.el-table__body-wrapper::-webkit-scrollbar-thumb) {
  background-color: #ddd;
  border-radius: 5px;
}
:deep(.el-table__fixed-left) {
  box-shadow: 2px 0 10px rgba(0,0,0,0.05);
}
</style>
