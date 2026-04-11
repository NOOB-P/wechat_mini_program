<template>
  <div v-loading="loading" class="subject-score-page">
    <div class="header-section">
      <div class="back-link" @click="goBack">
        <el-icon><Back /></el-icon>
        返回项目详情
      </div>
    </div>

    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form" @submit.prevent>
        <el-form-item label="学校">
          <el-select v-model="searchForm.schoolId" clearable placeholder="全部学校" style="width: 200px">
            <el-option v-for="item in schoolOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="searchForm.classId" clearable placeholder="全部班级" style="width: 200px">
            <el-option v-for="item in classOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" clearable placeholder="姓名 / 考号" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="list-card">
      <div class="list-header">
        <div class="list-header__left">
          <h2 class="list-title">{{ subjectName }} 单科管理</h2>
          <span class="list-count">项目ID: {{ projectId }}</span>
        </div>
        <div class="list-header__right">
          <el-button type="success" :icon="Upload" @click="handleBatchUpload('answerSheet')">导入试卷</el-button>
          <el-button type="warning" :icon="Upload" @click="handleBatchUpload('score')">导入成绩</el-button>
          <el-button type="primary" :icon="Download" @click="handleExport">导出成绩单</el-button>
        </div>
      </div>

      <el-table :data="tableData" stripe class="custom-table">
        <el-table-column prop="studentNo" label="考号" width="140" />
        <el-table-column prop="studentName" label="姓名" width="120" />
        <el-table-column prop="school" label="学校" min-width="180" />
        <el-table-column prop="className" label="班级" width="150" />
        
        <el-table-column label="试卷录入" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.hasAnswerSheet ? 'success' : 'info'" effect="light">
              {{ row.hasAnswerSheet ? '已上传' : '未上传' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="成绩录入" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.hasScore ? 'success' : 'info'" effect="light">
              {{ row.hasScore ? '已录入' : '未录入' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-upload
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                accept=".pdf,.png,.jpg,.jpeg"
                :on-change="(file) => handleUploadAnswerSheet(row, file)"
              >
                <el-button type="primary" link>上传试卷</el-button>
              </el-upload>
              <el-button type="primary" link @click="handleEditScore(row)">编辑成绩</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <!-- 批量上传弹窗 -->
    <el-dialog v-model="importVisible" :title="importTitle" width="550px">
      <div class="import-container">
        <div class="flex justify-start mb-4">
          <el-tooltip placement="right" effect="light">
            <template #content>
              <div class="text-xs leading-6 text-gray-600 p-2">
                <p v-if="importType === 'answerSheet'">1. 请上传 zip 压缩包，压缩包内试卷命名支持“学号_姓名”、“学号”或“姓名”。</p>
                <p v-else>1. 请先<b>下载导入模板</b>，按照模板格式填写考生成绩信息。</p>
                <p>2. 试卷仅支持 <b>jpg / jpeg / png / pdf</b>，成绩仅支持 <b>xlsx / xls</b>。</p>
                <p>3. 若数据已存在，系统将根据规则进行<b>更新</b>。</p>
              </div>
            </template>
            <div class="instructions-trigger">
              <el-icon class="mr-1"><info-filled /></el-icon>
              <span>导入操作说明 (鼠标悬停查看)</span>
            </div>
          </el-tooltip>
        </div>
        
        <el-upload
          ref="uploadRef"
          class="upload-demo"
          drag
          action="#"
          multiple
          :auto-upload="false"
          :on-change="handleFileChange"
          :file-list="fileList"
          :show-file-list="false"
          :accept="importType === 'answerSheet' ? '.zip' : '.xlsx, .xls'"
        >
          <div v-if="fileList.length === 0" class="upload-empty-content">
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <div class="el-upload__tip mt-2">
              {{ importType === 'answerSheet' ? '仅支持 .zip 压缩包' : '仅支持 .xlsx / .xls 格式文件' }}
            </div>
          </div>
          
          <div v-else class="upload-list-content" @click.stop>
            <div class="flex justify-between items-center mb-2 px-2">
              <span class="text-xs font-bold text-gray-500">待处理队列 ({{ fileList.length }})</span>
              <el-button link type="danger" size="small" @click="fileList = []">清空</el-button>
            </div>
            <el-table :data="fileList" size="small" border max-height="180" class="import-table">
              <el-table-column prop="name" label="文件名" show-overflow-tooltip />
              <el-table-column label="状态" width="90" align="center">
                <template #default="{ row }">
                  <div class="status-cell">
                    <el-tag v-if="row.status === 'ready'" type="info" size="small" class="status-tag-mini">等待中</el-tag>
                    <el-tag v-else-if="row.status === 'success'" type="success" size="small" class="status-tag-mini tag-success-simple">已导入</el-tag>
                    <el-tag v-else-if="row.status === 'fail'" type="danger" size="small" class="status-tag-mini">失败</el-tag>
                    <el-tag v-else type="primary" size="small" class="status-tag-mini rotating">
                      <el-icon><loading-icon /></el-icon>
                    </el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="50" align="center">
                <template #default="{ $index }">
                  <el-button link type="danger" :icon="Delete" @click="fileList.splice($index, 1)" />
                </template>
              </el-table-column>
            </el-table>
            <div class="mt-2 text-center">
              <el-button link type="primary" size="small" @click="handleContinueUpload">
                <el-icon class="mr-1"><plus /></el-icon>继续添加文件
              </el-button>
            </div>
          </div>
        </el-upload>

        <div class="mt-8 flex flex-col gap-3">
          <el-button 
            type="primary" 
            size="large"
            class="w-full start-import-btn" 
            :loading="importLoading" 
            :disabled="fileList.length === 0"
            @click="submitImport"
          >
            <template #icon v-if="!importLoading">
              <el-icon><Upload /></el-icon>
            </template>
            {{ importLoading ? '正在处理中...' : '确认开始批量导入' }}
          </el-button>
          <div v-if="importType === 'score'" class="flex justify-center mt-1">
            <el-button link type="primary" @click="downloadTemplate" class="download-link">
              <el-icon class="mr-1"><Document /></el-icon>还没有模板？点击下载成绩导入模板.xlsx
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <ScoreEditDialog
      v-model="scoreEditVisible"
      :project-id="projectId"
      :subject-name="subjectName"
      :student="currentStudent"
      @saved="loadData"
    />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, reactive, ref, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { 
    Back, Search, Refresh, Upload, Download,
    InfoFilled, UploadFilled, Delete, Plus, Document, Loading as LoadingIcon
  } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import ScoreEditDialog from './components/ScoreEditDialog.vue'
  import { 
    fetchProjectScoreList,
    fetchDownloadScoreTemplate,
    fetchImportScore,
    fetchImportAnswerSheetZip,
    fetchUploadStudentAnswerSheet
  } from '@/api/core-business/exam/project-editor'
  import { fetchProjectOptions } from '@/api/core-business/exam/project'

  const route = useRoute()
  const router = useRouter()
  const loading = ref(false)
  const projectId = computed(() => String(route.query.projectId || ''))
  const subjectName = computed(() => String(route.query.subjectName || ''))

  const page = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  const tableData = ref<any[]>([])
  const scoreEditVisible = ref(false)
  const currentStudent = ref<any>(null)

  const schoolOptions = ref<any[]>([])
  const classOptions = ref<any[]>([])

  const searchForm = reactive({
    schoolId: '',
    classId: '',
    keyword: ''
  })

  // 导入相关
  const importVisible = ref(false)
  const importLoading = ref(false)
  const importType = ref<'answerSheet' | 'score'>('answerSheet')
  const fileList = ref<any[]>([])
  const uploadRef = ref<any>()

  const importTitle = computed(() => importType.value === 'answerSheet' ? '批量导入试卷答题卡' : '批量导入成绩')

  async function loadOptions() {
    try {
      const res = await fetchProjectOptions()
      schoolOptions.value = res.schools?.map(s => ({ id: s.id, name: s.label })) || []
      classOptions.value = res.classes?.map(c => ({ id: c.id, name: c.label })) || []
    } catch (error) {
      console.error('加载选项失败', error)
    }
  }

  async function loadData() {
    if (!projectId.value || !subjectName.value) return
    loading.value = true
    try {
      const res = await fetchProjectScoreList({
        projectId: projectId.value,
        subjectName: subjectName.value,
        current: page.value,
        size: pageSize.value,
        schoolId: searchForm.schoolId || undefined,
        classId: searchForm.classId || undefined,
        keyword: searchForm.keyword
      })
      
      tableData.value = res.records || []
      total.value = res.total || 0
    } finally {
      loading.value = false
    }
  }

  function handleSearch() {
    page.value = 1
    loadData()
  }

  function handleReset() {
    searchForm.schoolId = ''
    searchForm.classId = ''
    searchForm.keyword = ''
    page.value = 1
    loadData()
  }

  function handleSizeChange() {
    page.value = 1
    loadData()
  }

  function handleEditScore(row: any) {
    currentStudent.value = row
    scoreEditVisible.value = true
  }

  async function handleUploadAnswerSheet(row: any, file: any) {
    const rawFile = file?.raw as File | undefined
    if (!rawFile) {
      ElMessage.error('未获取到试卷文件')
      return
    }
    try {
      await fetchUploadStudentAnswerSheet({
        projectId: projectId.value,
        subjectName: subjectName.value,
        studentNo: row.studentNo,
        file: rawFile
      })
      row.hasAnswerSheet = true
      await loadData()
    } catch (error: any) {
      ElMessage.error(error.message || '试卷上传失败')
    }
  }

  function handleBatchUpload(type: 'answerSheet' | 'score') {
    importType.value = type
    fileList.value = []
    importVisible.value = true
  }

  function handleFileChange(file: any) {
    if (importType.value === 'answerSheet') {
      const isZip = /\.zip$/i.test(file.name || '')
      if (!isZip) {
        ElMessage.error('试卷批量导入仅支持 zip 压缩包')
        return
      }
    }
    fileList.value.push(file)
  }

  function handleContinueUpload() {
    uploadRef.value?.$el.querySelector('input').click()
  }

  async function submitImport() {
    if (fileList.value.length === 0) return
    
    importLoading.value = true
    try {
      if (importType.value === 'score') {
        for (const file of fileList.value) {
          file.status = 'uploading'
          try {
            await fetchImportScore({
              projectId: projectId.value,
              subjectName: subjectName.value,
              file: file.raw
            })
            file.status = 'success'
          } catch (error: any) {
            file.status = 'fail'
            ElMessage.error(`${file.name} 导入失败: ${error.message || '未知错误'}`)
          }
        }
        
        const allSuccess = fileList.value.every(f => f.status === 'success')
        if (allSuccess) {
          ElMessage.success('全部成绩导入成功')
          importVisible.value = false
          await loadData()
        }
      } else {
        for (const file of fileList.value) {
          file.status = 'uploading'
          try {
            await fetchImportAnswerSheetZip({
              projectId: projectId.value,
              subjectName: subjectName.value,
              file: file.raw
            })
            file.status = 'success'
          } catch (error: any) {
            file.status = 'fail'
            ElMessage.error(`${file.name} 导入失败: ${error.message || '未知错误'}`)
          }
        }

        const allSuccess = fileList.value.every(f => f.status === 'success')
        if (allSuccess) {
          ElMessage.success('全部试卷导入成功')
          importVisible.value = false
          await loadData()
        }
      }
    } finally {
      importLoading.value = false
    }
  }

  async function downloadTemplate() {
    try {
      const blob = await fetchDownloadScoreTemplate()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', '成绩导入模板.xlsx')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      ElMessage.error('模板下载失败')
    }
  }

  function handleExport() {
    ElMessage.info('导出功能开发中...')
  }

  function goBack() {
    router.push({
      name: 'ExamProjectEditor',
      query: { projectId: projectId.value }
    })
  }

  onMounted(() => {
    loadOptions()
    loadData()
  })
</script>

<style scoped lang="scss">
  .subject-score-page {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .header-section {
    margin-bottom: -8px;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #606266;
    cursor: pointer;
    font-size: 14px;
    transition: color 0.3s;

    &:hover {
      color: #409eff;
    }
  }

  .search-card {
    border: none;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

    :deep(.el-card__body) {
      padding: 20px 24px;
    }
  }

  .search-form {
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    :deep(.el-form-item) {
      margin-bottom: 0;
      margin-right: 24px;

      &:last-child {
        margin-right: 0;
        margin-left: auto;
      }

      .el-form-item__label {
        font-weight: 500;
        color: #606266;
      }
    }
  }

  .list-card {
    border: none;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    flex: 1;

    :deep(.el-card__body) {
      padding: 24px;
    }
  }

  .list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;

    &__left {
      display: flex;
      align-items: baseline;
      gap: 12px;
    }
  }

  .list-title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #303133;
  }

  .list-count {
    font-size: 13px;
    color: #909399;
  }

  .custom-table {
    margin-bottom: 20px;

    :deep(.el-table__header-wrapper) th {
      background-color: #fafafa;
      color: #606266;
      font-weight: 600;
      height: 50px;
    }

    :deep(.el-table__row) {
      height: 60px;
    }
  }

  .score-input {
    :deep(.el-input__inner) {
      text-align: center;
      padding: 0 4px;
    }
  }

  .action-buttons {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .pagination-wrap {
    display: flex;
    justify-content: flex-end;
  }

  .answer-sheet-preview {
    text-align: center;
    img {
      max-width: 100%;
      border-radius: 8px;
    }
  }

  .import-container {
    padding: 10px 20px;

    .instructions-trigger {
      display: flex;
      align-items: center;
      color: #409eff;
      cursor: pointer;
      font-size: 13px;
      padding: 8px 12px;
      background: #f0f7ff;
      border-radius: 4px;
    }

    .upload-demo {
      :deep(.el-upload-dragger) {
        padding: 40px 20px;
        border: 2px dashed #dcdfe6;
        border-radius: 12px;
        background: #fafafa;
        
        &:hover {
          border-color: #409eff;
        }
      }
    }

    .upload-empty-content {
      .el-icon--upload {
        font-size: 48px;
        color: #909399;
        margin-bottom: 16px;
      }
      .el-upload__text {
        color: #606266;
        font-size: 14px;
        em {
          color: #409eff;
          font-style: normal;
          font-weight: 600;
        }
      }
      .el-upload__tip {
        color: #909399;
        font-size: 12px;
      }
    }

    .upload-list-content {
      text-align: left;
    }

    .start-import-btn {
      height: 48px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
    }

    .download-link {
      font-size: 13px;
    }
  }

  .rotating {
    animation: rotate 2s linear infinite;
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>
