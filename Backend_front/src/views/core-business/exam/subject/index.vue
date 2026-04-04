<template>
  <div class="page-container">
    <el-page-header @back="goBack" class="mb-4">
      <template #content>
        <span class="text-large font-600 mr-3"> 科目管理 </span>
        <span class="text-sm mr-2" style="color: var(--el-text-color-regular)">
          当前班级: {{ className }}
        </span>
      </template>
    </el-page-header>

    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-bold">科目列表</span>
          <el-button type="primary" @click="handleAddSubject">添加科目</el-button>
        </div>
      </template>

      <el-table :data="tableData" border style="width: 100%" v-loading="loading">
        <el-table-column prop="subjectName" label="科目名称" width="120" align="center" />
        <el-table-column label="试卷状态" min-width="150" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.paperUrl" type="success">已上传</el-tag>
            <el-tag v-else type="info">未上传</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="答案状态" min-width="150" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.answerUrl" type="success">已上传</el-tag>
            <el-tag v-else type="info">未上传</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="成绩状态" min-width="150" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.scoreUploaded" type="success">已同步</el-tag>
            <el-tag v-else type="info">待同步</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="数据管理" width="350" align="center" fixed="right">
          <template #default="{ row }">
            <el-upload
              class="inline-block mr-2"
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              @change="(file) => handleUpload(row, 'paper', file)"
            >
              <el-button type="primary" link>上传试卷</el-button>
            </el-upload>
            <el-upload
              class="inline-block mr-2"
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              @change="(file) => handleUpload(row, 'answer', file)"
            >
              <el-button type="primary" link>上传答案</el-button>
            </el-upload>
            <el-upload
              class="inline-block mr-2"
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              @change="(file) => handleUpload(row, 'score', file)"
            >
              <el-button type="primary" link>上传小题分</el-button>
            </el-upload>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加科目弹窗 -->
    <el-dialog v-model="dialogVisible" title="添加科目" width="400px">
      <el-form :model="form" ref="formRef" :rules="rules" label-width="80px">
        <el-form-item label="科目" prop="subjectName">
          <el-select v-model="form.subjectName" placeholder="请选择科目" class="w-full">
            <el-option v-for="s in subjectOptions" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'

const router = useRouter()
const route = useRoute()
const className = ref(route.query.className || '未指定班级')
const projectId = ref(route.query.projectId)

const loading = ref(false)
const tableData = ref([
  { id: '1', subjectName: '语文', paperUrl: 'xxx', answerUrl: 'yyy', scoreUploaded: true },
  { id: '2', subjectName: '数学', paperUrl: '', answerUrl: '', scoreUploaded: false },
  { id: '3', subjectName: '英语', paperUrl: 'zzz', answerUrl: '', scoreUploaded: false }
])

const subjectOptions = ['语文', '数学', '英语', '物理', '化学', '生物', '政治', '历史', '地理']

const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const form = ref({
  subjectName: ''
})

const rules = {
  subjectName: [{ required: true, message: '请选择科目', trigger: 'change' }]
}

const goBack = () => {
  router.push({ 
    name: 'ExamClass', 
    query: { projectId: projectId.value } 
  })
}

const handleAddSubject = () => {
  form.value.subjectName = ''
  dialogVisible.value = true
}

const handleUpload = (row: any, type: string, file: any) => {
  const typeMap: Record<string, string> = {
    paper: '试卷',
    answer: '答案',
    score: '小题得分'
  }
  ElMessage.success(`[${row.subjectName}] ${typeMap[type]}上传成功: ${file.name}`)
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除科目 [${row.subjectName}] 吗？`, '警告', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  })
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('添加成功')
      dialogVisible.value = false
    }
  })
}
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.inline-block {
  display: inline-block;
}
.w-full {
  width: 100%;
}
</style>
