<template>
  <div class="page-container" v-loading="loading">
    <el-page-header @back="goBack" class="mb-4">
      <template #content>
        <span class="text-large font-600 mr-3">考试科目管理</span>
        <span class="text-sm mr-2 page-subtitle">当前项目：{{ projectName || projectId || '未指定项目' }}</span>
      </template>
    </el-page-header>

    <el-card shadow="never">
      <template #header>
        <div class="header-row">
          <span class="font-bold">项目科目列表</span>
          <el-button type="primary" @click="handleAddSubject">添加科目</el-button>
        </div>
      </template>

      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="subjectName" label="科目名称" width="140" align="center" />
        <el-table-column label="试卷和答案状态" min-width="140" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.paperUrl" type="success">已上传</el-tag>
            <el-tag v-else type="info">未上传</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="模板状态" min-width="140" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.answerUrl" type="success">已上传</el-tag>
            <el-tag v-else type="info">未上传</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="成绩状态" min-width="140" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.scoreUploaded" type="success">已同步</el-tag>
            <el-tag v-else type="info">待同步</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-upload
              class="inline-block mr-2"
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              accept=".pdf,.png,.jpg,.jpeg"
              :on-change="(file) => handleUpload(row, 'paper', file)"
            >
              <el-button type="primary" link>导入试卷和答案</el-button>
            </el-upload>
            <el-upload
              class="inline-block mr-2"
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              accept=".pdf,.png,.jpg,.jpeg"
              :on-change="(file) => handleUpload(row, 'answer', file)"
            >
              <el-button type="primary" link>上传模板</el-button>
            </el-upload>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="添加科目" width="420px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="科目" prop="subjectName">
          <el-select v-model="form.subjectName" placeholder="请选择科目" class="w-full">
            <el-option v-for="s in availableSubjectOptions" :key="s" :label="s" :value="s" />
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
  import { computed, onMounted, reactive, ref } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { ElMessage, ElMessageBox, type FormInstance, type UploadFile } from 'element-plus'
  import {
    fetchAddExamSubject,
    fetchDeleteExamSubject,
    fetchExamSubjectList,
    fetchUploadExamSubjectFile,
    type ExamSubjectItem
  } from '@/api/core-business/exam/subject'
  import { fetchProjectOptions } from '@/api/core-business/exam/project'

  const router = useRouter()
  const route = useRoute()
  const projectId = computed(() => String(route.query.projectId || ''))
  const projectName = computed(() => String(route.query.projectName || ''))

  const loading = ref(false)
  const tableData = ref<ExamSubjectItem[]>([])
  const subjectOptions = ref<string[]>([])
  const dialogVisible = ref(false)
  const formRef = ref<FormInstance>()
  const form = reactive({
    subjectName: ''
  })

  const rules = {
    subjectName: [{ required: true, message: '请选择科目', trigger: 'change' }]
  }

  const availableSubjectOptions = computed(() => {
    const existingNames = new Set(tableData.value.map((item) => item.subjectName))
    return subjectOptions.value.filter((item) => !existingNames.has(item))
  })

  async function loadData() {
    if (!projectId.value) {
      ElMessage.error('缺少项目ID')
      return
    }
    loading.value = true
    try {
      const res = await fetchExamSubjectList(projectId.value)
      tableData.value = res.records || []
    } finally {
      loading.value = false
    }
  }

  async function loadOptions() {
    const res = await fetchProjectOptions()
    subjectOptions.value = res.subjects || []
  }

  function goBack() {
    router.push({
      name: 'ExamProjectEditor',
      query: { projectId: projectId.value, tab: 'scores' }
    })
  }

  function handleAddSubject() {
    form.subjectName = ''
    dialogVisible.value = true
  }

  async function handleUpload(row: ExamSubjectItem, type: 'paper' | 'answer', file: UploadFile) {
    const rawFile = file.raw
    if (!rawFile) {
      ElMessage.error('未获取到上传文件')
      return
    }
    try {
      await fetchUploadExamSubjectFile({
        subjectId: row.id,
        type,
        file: rawFile
      })
      ElMessage.success(type === 'paper' ? '试卷和答案上传成功' : '模板上传成功')
      await loadData()
    } catch (error: any) {
      ElMessage.error(error.message || '文件上传失败')
    }
  }

  async function handleDelete(row: ExamSubjectItem) {
    await ElMessageBox.confirm(`确定删除科目 [${row.subjectName}] 吗？`, '警告', {
      type: 'warning'
    })
    await fetchDeleteExamSubject(row.id)
    ElMessage.success('删除成功')
    await loadData()
  }

  async function submitForm() {
    if (!formRef.value || !projectId.value) return
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return
    await fetchAddExamSubject({
      projectId: projectId.value,
      subjectName: form.subjectName
    })
    ElMessage.success('添加成功')
    dialogVisible.value = false
    await loadData()
  }

  onMounted(async () => {
    await Promise.all([loadOptions(), loadData()])
  })
</script>

<style scoped>
  .page-container {
    padding: 20px;
  }

  .page-subtitle {
    color: var(--el-text-color-regular);
  }

  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .inline-block {
    display: inline-block;
  }

  .w-full {
    width: 100%;
  }
</style>
