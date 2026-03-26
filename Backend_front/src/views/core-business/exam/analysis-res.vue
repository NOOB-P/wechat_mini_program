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

    <el-card shadow="never">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="成功匹配" name="success">
          <el-table :data="successList" border style="width: 100%">
            <el-table-column prop="studentNo" label="学号" />
            <el-table-column prop="name" label="姓名" />
            <el-table-column prop="score" label="得分" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="匹配失败 (需手动处理)" name="fail">
          <el-table :data="failList" border style="width: 100%">
            <el-table-column prop="studentNo" label="未知学号" />
            <el-table-column prop="reason" label="失败原因" />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleBind(row)">手动绑定学生</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="dialogVisible" title="手动绑定学生">
      <el-form label-width="100px">
        <el-form-item label="当前异常学号">
          <el-input :value="currentFailItem?.studentNo" disabled />
        </el-form-item>
        <el-form-item label="选择真实学生">
          <el-select v-model="bindStudentId" placeholder="请选择或搜索学生" filterable>
            <!-- 模拟数据，实际应调用接口获取 -->
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchGetAnalysisResult, fetchBindStudent } from '@/api/core-business/exam/analysis-res'
import { ElMessage } from 'element-plus'
import { Back } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const activeTab = ref('fail')
const successList = ref<any[]>([])
const failList = ref<any[]>([])

const dialogVisible = ref(false)
const currentFailItem = ref<any>(null)
const bindStudentId = ref('')

const loadData = async () => {
  const examId = route.query.id as string
  if (!examId) return
  const res = await fetchGetAnalysisResult(examId)
  if (res.code === 200) {
    successList.value = res.data.successList
    failList.value = res.data.failList
    if (failList.value.length === 0) {
      activeTab.value = 'success'
    }
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
</style>
