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
    <el-dialog v-model="importVisible" :title="importTitle" width="550px" @closed="resetImportState">
      <div class="import-container">
        <div class="flex justify-start mb-4">
          <el-tooltip placement="right" effect="light">
            <template #content>
              <div class="text-xs leading-6 text-gray-600 p-2">
                <p v-if="importType === 'answerSheet'">1. 请上传 zip / rar 压缩包，支持递归扫描多层文件夹，试卷命名支持“学号_姓名”、“学号”或“姓名”。</p>
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
          :multiple="importType === 'score'"
          :auto-upload="false"
          :on-change="handleFileChange"
          :file-list="fileList"
          :show-file-list="false"
          :accept="importType === 'answerSheet' ? '.zip,.rar' : '.xlsx, .xls'"
        >
          <div v-if="fileList.length === 0" class="upload-empty-content">
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <div class="el-upload__tip mt-2">
              {{ importType === 'answerSheet' ? '仅支持 .zip / .rar 压缩包' : '仅支持 .xlsx / .xls 格式文件' }}
            </div>
          </div>
          
          <div v-else class="upload-list-content" @click.stop>
            <div class="flex justify-between items-center mb-2 px-2">
              <span class="text-xs font-bold text-gray-500">待处理队列 ({{ fileList.length }})</span>
              <el-button link type="danger" size="small" @click="resetImportState">清空</el-button>
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

        <!-- 任务进度展示 -->
        <div v-if="taskStatus" class="task-progress-container mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-bold text-gray-700">处理进度</span>
            <span class="text-xs text-gray-500">
              {{ taskStatus.status === 'completed' ? taskStatus.total : taskStatus.current }} / {{ taskStatus.total }}
            </span>
          </div>
          <el-progress 
            :percentage="taskStatus.status === 'completed' ? 100 : (taskStatus.total > 0 ? Math.round((taskStatus.current / taskStatus.total) * 100) : 0)" 
            :status="taskStatus.status === 'failed' ? 'exception' : (taskStatus.status === 'completed' ? 'success' : '')"
            :stroke-width="15"
            striped
            striped-animated
          />
          
          <div v-if="importType === 'answerSheet'" class="mt-4">
            <div class="text-xs font-bold text-gray-500 mb-2 flex items-center">
              <el-icon class="mr-1"><document /></el-icon>处理日志
            </div>
            <div class="task-logs-viewer" ref="logViewerRef">
              <div v-for="(log, index) in taskLogs" :key="index" class="log-item">
                <span class="log-time">[{{ new Date().toLocaleTimeString() }}]</span>
                <span class="log-content">{{ log }}</span>
              </div>
              <div v-if="taskLogs.length === 0" class="text-gray-400 text-xs text-center py-4">
                正在初始化任务...
              </div>
            </div>
          </div>
        </div>

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
            {{ importLoading ? '正在处理中...' : (taskStatus?.status === 'completed' ? '导入完成' : '确认开始批量导入') }}
          </el-button>
          <div v-if="importType === 'score'" class="flex justify-center mt-1">
            <el-button link type="primary" @click="downloadTemplate" class="download-link">
              <el-icon class="mr-1"><Document /></el-icon>还没有模板？点击下载成绩导入模板.xlsx
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="scoreConflictVisible" title="重名成绩手动绑定" width="980px" destroy-on-close>
      <div class="conflict-dialog">
        <el-alert
          type="warning"
          :closable="false"
          show-icon
          title="检测到重名学生，请为每条成绩选择正确学生后再确认保存。"
        />

        <el-table :data="scoreConflictList" border stripe max-height="460" class="conflict-table">
          <el-table-column prop="sourceFileName" label="来源文件" min-width="150" show-overflow-tooltip />
          <el-table-column label="Excel行" width="90" align="center">
            <template #default="{ row }">第{{ row.rowIndex }}行</template>
          </el-table-column>
          <el-table-column prop="studentName" label="姓名" width="120" />
          <el-table-column label="总分" width="90" align="center">
            <template #default="{ row }">
              <span :class="{ 'text-danger font-bold': isOverFullScore(row.totalScore) }">
                {{ formatScore(row.totalScore) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="小题分" min-width="260">
            <template #default="{ row }">
              <div class="question-score-tags">
                <el-tag
                  v-for="(score, index) in row.questionScores"
                  :key="`${row.sourceFileName}-${row.rowIndex}-${index}`"
                  size="small"
                  effect="plain"
                >
                  {{ index + 1 }}题 {{ formatScore(score) }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="绑定到学生" min-width="280">
            <template #default="{ row }">
              <el-select
                v-model="row.selectedStudentNo"
                placeholder="请选择正确学生"
                filterable
                clearable
                class="w-full"
              >
                <el-option
                  v-for="item in row.candidates"
                  :key="`${row.rowIndex}-${item.studentNo}`"
                  :label="formatCandidateLabel(item)"
                  :value="item.studentNo"
                >
                  <div class="candidate-option">
                    <span>{{ item.studentNo }} / {{ item.studentName }}</span>
                    <span class="candidate-meta">{{ formatCandidateMeta(item) }}</span>
                  </div>
                </el-option>
              </el-select>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <template #footer>
        <div class="conflict-footer">
          <el-button @click="scoreConflictVisible = false">暂不处理</el-button>
          <el-button type="primary" :loading="scoreConflictSaving" @click="handleSaveScoreConflicts">
            确认绑定并保存成绩
          </el-button>
        </div>
      </template>
    </el-dialog>

    <ScoreEditDialog
      v-model="scoreEditVisible"
      :project-id="projectId"
      :subject-name="subjectName"
      :student="currentStudent"
      :full-score="currentSubjectBenchmark?.totalScore"
      @saved="loadData"
    />
  </div>
</template>

<script setup lang="ts">
  import { defineAsyncComponent, onMounted, reactive, ref, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { 
    Back, Search, Refresh, Upload, Download,
    InfoFilled, UploadFilled, Delete, Plus, Document, Loading as LoadingIcon
  } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import { 
    fetchProjectScoreList,
    fetchDownloadScoreTemplate,
    fetchImportScore,
    fetchImportAnswerSheetZip,
    fetchSaveStudentScore,
    fetchUploadStudentAnswerSheet,
    fetchTaskProgress
  } from '@/api/core-business/exam/project-editor'
  import type {
    BatchImportResult,
    ScoreImportConflictCandidate,
    ScoreImportConflictItem,
    ScoreImportResult
  } from '@/api/core-business/exam/project-editor'
  import { fetchProjectOptions, fetchProjectDetail } from '@/api/core-business/exam/project'
  const ScoreEditDialog = defineAsyncComponent(() => import('./components/ScoreEditDialog.vue'))

  const route = useRoute()
  const router = useRouter()
  const loading = ref(false)
  const projectId = computed(() => String(route.query.projectId || ''))
  const subjectName = computed(() => String(route.query.subjectName || ''))
  const projectDetail = ref<any>(null)

  const currentSubjectBenchmark = computed(() => {
    if (!projectDetail.value || !subjectName.value) return null
    return projectDetail.value.benchmarks?.[subjectName.value] || null
  })

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
  const scoreConflictVisible = ref(false)
  const scoreConflictSaving = ref(false)
  const scoreConflictList = ref<PendingScoreConflictItem[]>([])

  // 任务进度相关
  const taskStatus = ref<any>(null)
  const pollingTimer = ref<any>(null)
  const taskLogs = ref<string[]>([])
  const logViewerRef = ref<HTMLElement | null>(null)

  const importTitle = computed(() => importType.value === 'answerSheet' ? '批量导入试卷答题卡' : '批量导入成绩')

  interface ImportFileItem {
    name: string
    uid: string | number
    raw?: File
    status?: 'ready' | 'uploading' | 'success' | 'fail'
  }

  interface PendingScoreConflictItem extends ScoreImportConflictItem {
    sourceFileName: string
    selectedStudentNo: string
  }

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
    resetImportState()
    importVisible.value = true
  }

  function resetImportState() {
    fileList.value = []
    uploadRef.value?.clearFiles?.()
    taskStatus.value = null
    taskLogs.value = []
    if (pollingTimer.value) {
      clearInterval(pollingTimer.value)
      pollingTimer.value = null
    }
  }

  async function startPolling(taskId: string) {
    if (pollingTimer.value) clearInterval(pollingTimer.value)
    
    pollingTimer.value = setInterval(async () => {
      try {
        const res = await fetchTaskProgress(taskId)
        taskStatus.value = res
        taskLogs.value = res.logs || []
        
        if (res.status === 'completed') {
          clearInterval(pollingTimer.value)
          pollingTimer.value = null
          importLoading.value = false
          // 更新文件列表状态为成功
          fileList.value.forEach(f => {
            if (f.status === 'uploading') f.status = 'success'
          })
          ElMessage.success('导入任务已完成')
          await loadData()
        } else if (res.status === 'failed') {
          clearInterval(pollingTimer.value)
          pollingTimer.value = null
          importLoading.value = false
          // 更新文件列表状态为失败
          fileList.value.forEach(f => {
            if (f.status === 'uploading') f.status = 'fail'
          })
          ElMessage.error('导入任务失败: ' + (res.logs?.[res.logs.length - 1] || '未知错误'))
        }
      } catch (error) {
        console.error('获取任务进度失败', error)
      }
    }, 2000)
  }

  function handleFileChange(file: ImportFileItem) {
    const rawFile = file?.raw
    if (!rawFile) {
      ElMessage.error('未获取到上传文件')
      return
    }

    if (importType.value === 'answerSheet') {
      const isArchive = /\.(zip|rar)$/i.test(file.name || '')
      if (!isArchive) {
        ElMessage.error('试卷批量导入仅支持 zip / rar 压缩包')
        return
      }
      fileList.value = [{ ...file, status: 'ready' }]
      return
    }

    const isExcel = /\.(xlsx|xls)$/i.test(file.name || '')
    if (!isExcel) {
      ElMessage.error('成绩导入仅支持 xlsx / xls 文件')
      return
    }

    const exists = fileList.value.some((item: ImportFileItem) => item.uid === file.uid)
    if (!exists) {
      fileList.value.push({ ...file, status: 'ready' })
    }
  }

  function handleContinueUpload() {
    uploadRef.value?.$el.querySelector('input').click()
  }

  async function submitImport() {
    if (fileList.value.length === 0) return
    
    importLoading.value = true
    try {
      if (importType.value === 'score') {
        const pendingConflicts: PendingScoreConflictItem[] = []
        let importedFileCount = 0
        let hasScoreWarnings = false
        let hasPollingStarted = false

        for (const file of fileList.value) {
          file.status = 'uploading'
          try {
            const result = await fetchImportScore({
              projectId: projectId.value,
              subjectName: subjectName.value,
              file: file.raw
            })
            
            if ((result as any).taskId) {
              startPolling((result as any).taskId)
              hasPollingStarted = true
              break
            }

            file.status = 'success'
            importedFileCount++

            if (result.conflictCount > 0) {
              pendingConflicts.push(...buildPendingConflicts(file.name, result))
            } else if (result.errorCount > 0 || result.skipCount > 0) {
              hasScoreWarnings = true
              ElMessage.warning(`${file.name}: ${result.summary}`)
            }
          } catch (error: any) {
            file.status = 'fail'
            ElMessage.error(`${file.name} 导入失败: ${error.message || '未知错误'}`)
          }
        }

        if (hasPollingStarted) return

        if (importedFileCount > 0) {
          await loadData()
        }

        if (pendingConflicts.length > 0) {
          scoreConflictList.value = pendingConflicts
          scoreConflictVisible.value = true
          importVisible.value = false
          ElMessage.warning(`发现 ${pendingConflicts.length} 条重名成绩，请手动绑定后保存`)
          return
        }

        const allSuccess = fileList.value.every(f => f.status === 'success')
        if (allSuccess && !hasScoreWarnings) {
          ElMessage.success(importedFileCount > 1 ? '全部成绩导入成功' : '成绩导入成功')
          importVisible.value = false
        } else if (allSuccess) {
          importVisible.value = false
        }
      } else {
        let importedFileCount = 0
        let hasPaperWarnings = false
        let hasPollingStarted = false

        for (const file of fileList.value) {
          file.status = 'uploading'
          try {
            const result = await fetchImportAnswerSheetZip({
              projectId: projectId.value,
              subjectName: subjectName.value,
              file: file.raw
            })
            
            if ((result as any).taskId) {
              startPolling((result as any).taskId)
              hasPollingStarted = true
              break
            }

            file.status = 'success'
            importedFileCount++

            if (result.errorCount > 0 || result.skipCount > 0) {
              hasPaperWarnings = true
              ElMessage.warning(`${file.name}: ${result.summary}`)
            }
          } catch (error: any) {
            file.status = 'fail'
            ElMessage.error(`${file.name} 导入失败: ${error.message || '未知错误'}`)
          }
        }

        if (hasPollingStarted) return

        const allSuccess = fileList.value.every(f => f.status === 'success')
        if (allSuccess && !hasPaperWarnings) {
          ElMessage.success(importedFileCount > 1 ? '全部试卷导入成功' : '试卷导入成功')
          importVisible.value = false
          await loadData()
        } else if (allSuccess) {
          importVisible.value = false
          await loadData()
        }
      }
    } finally {
      if (!pollingTimer.value) {
        importLoading.value = false
      }
    }
  }

  function buildPendingConflicts(fileName: string, result: ScoreImportResult) {
    return (result.conflicts || []).map((item) => ({
      ...item,
      sourceFileName: fileName,
      selectedStudentNo: ''
    }))
  }

  function formatScore(value: number | string | null | undefined) {
    if (value === null || value === undefined || value === '') return '-'
    const numericValue = Number(value)
    return Number.isInteger(numericValue) ? String(numericValue) : numericValue.toFixed(2)
  }

  function isOverFullScore(score: number) {
    const full = currentSubjectBenchmark.value?.totalScore
    return full != null && score > full
  }

  function formatCandidateLabel(item: ScoreImportConflictCandidate) {
    return `${item.studentNo} / ${item.studentName} / ${formatCandidateMeta(item)}`
  }

  function formatCandidateMeta(item: ScoreImportConflictCandidate) {
    return [item.school, item.grade, item.className].filter(Boolean).join(' / ')
  }

  async function handleSaveScoreConflicts() {
    const unselectedItems = scoreConflictList.value.filter((item) => !item.selectedStudentNo)
    if (unselectedItems.length > 0) {
      ElMessage.error(`还有 ${unselectedItems.length} 条重名成绩未选择学生`)
      return
    }

    scoreConflictSaving.value = true
    try {
      for (const item of scoreConflictList.value) {
        await fetchSaveStudentScore({
          projectId: projectId.value,
          subjectName: subjectName.value,
          studentNo: item.selectedStudentNo,
          questionScores: item.questionScores
        })
      }
      scoreConflictVisible.value = false
      scoreConflictList.value = []
      await loadData()
      ElMessage.success('重名成绩已手动绑定并保存')
    } catch (error: any) {
      ElMessage.error(error.message || '重名成绩保存失败')
    } finally {
      scoreConflictSaving.value = false
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
      query: { 
        projectId: projectId.value,
        tab: 'scores'
      }
    })
  }

  onMounted(async () => {
    if (projectId.value) {
      try {
        projectDetail.value = await fetchProjectDetail(projectId.value)
      } catch (error) {
        console.error('加载项目详情失败', error)
      }
    }
    await Promise.all([loadOptions(), loadData()])
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
        transition: all 0.3s;
        &:hover {
          border-color: #409eff;
          background: #f0f7ff;
        }
      }
    }

    .task-logs-viewer {
      height: 120px;
      overflow-y: auto;
      background: #1e1e1e;
      border-radius: 4px;
      padding: 10px;
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px;
      color: #d4d4d4;

      .log-item {
        margin-bottom: 4px;
        line-height: 1.4;
        display: flex;
        gap: 8px;

        .log-time {
          color: #569cd6;
          white-space: nowrap;
        }

        .log-content {
          color: #ce9178;
          word-break: break-all;
        }
      }

      &::-webkit-scrollbar {
        width: 6px;
      }
      &::-webkit-scrollbar-thumb {
        background: #333;
        border-radius: 3px;
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

  .conflict-dialog {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .conflict-table {
    :deep(.el-select) {
      width: 100%;
    }
  }

  .question-score-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .candidate-option {
    display: flex;
    flex-direction: column;
    line-height: 1.5;
    padding: 2px 0;
  }

  .candidate-meta {
    color: #909399;
    font-size: 12px;
  }

  .conflict-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>
