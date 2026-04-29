<template>
  <div class="paper-edit-view">
    <div class="view-header">
      <div class="header-left">
        <el-button link @click="handleBack" class="back-btn">
          <el-icon><ArrowLeft /></el-icon> 返回科目管理
        </el-button>
        <div class="divider"></div>
        <div class="tabs-list">
          <div
            class="tab-item"
            :class="{ active: activeTab === 'template' }"
            @click="activeTab = 'template'"
          >
            答案解析
          </div>
          <div
            class="tab-item"
            :class="{ active: activeTab === 'original' }"
            @click="activeTab = 'original'"
          >
            导入试卷和答案
          </div>
          <div
            class="tab-item"
            :class="{ active: activeTab === 'student' }"
            @click="activeTab = 'student'"
          >
            考生原卷
          </div>
          <!-- <div class="tab-item desc">说明</div>-->
        </div>
      </div>

      <div class="header-right"></div>
    </div>

    <div class="view-body" v-loading="loading">
      <template v-if="activeTab === 'template' || activeTab === 'original'">
        <div v-if="hasFile(activeTab)" class="file-viewer">
          <div class="workspace-toolbar">
            <div class="workspace-toolbar__left">
              <el-button-group>
                <el-button
                  size="small"
                  :type="regionEditorRef?.tool === 'pan' ? 'primary' : 'default'"
                  :disabled="!canUseEditor || ocrLoading"
                  @click="handleToolboxCommand('panMode')"
                >
                  移动试卷
                </el-button>
                <el-button
                  size="small"
                  :type="regionEditorRef?.tool === 'draw' ? 'primary' : 'default'"
                  :disabled="!canUseEditor || ocrLoading"
                  @click="handleToolboxCommand('drawMode')"
                >
                  创建选框
                </el-button>
                <el-button
                  size="small"
                  :type="regionEditorRef?.tool === 'adjust' ? 'primary' : 'default'"
                  :disabled="!canUseEditor || ocrLoading"
                  @click="handleToolboxCommand('adjustMode')"
                >
                  编辑选框
                </el-button>
              </el-button-group>

              <div class="manual-no-setter" v-if="canUseEditor">
                  <span class="setter-label">题号:</span>
                  <el-input-number
                    v-model="manualQuestionNo"
                    size="small"
                    :min="1"
                    :precision="0"
                    :controls="false"
                    class="no-input"
                  />
                </div>

              <div class="toolbar-divider"></div>

              <el-tooltip
                :content="regionEditorRef?.currentHintText || '请先上传图片格式试卷后开始编辑'"
                placement="bottom"
              >
                <el-button size="small" class="tool-btn" :disabled="!canUseEditor || ocrLoading">
                  <el-icon><InfoFilled /></el-icon> 提示
                </el-button>
              </el-tooltip>

              <el-button
                size="small"
                type="primary"
                plain
                :loading="ocrLoading"
                :disabled="!canUseEditor || ocrLoading"
                @click="handleAutoCut"
              >
                AI识别
              </el-button>

              <div class="zoom-indicator" v-if="regionEditorRef?.scale">
                {{ Math.round(regionEditorRef.scale * 100) }}%
              </div>
            </div>

            <div class="workspace-toolbar__right">
              <el-upload
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                :disabled="ocrLoading"
                accept=".pdf,.png,.jpg,.jpeg"
                :on-change="(file: any) => handleFileUpload(activeTab, file)"
              >
                <el-button size="small" :disabled="ocrLoading">重新上传</el-button>
              </el-upload>

              <el-button
                size="small"
                type="primary"
                :disabled="!canUseEditor || ocrLoading"
                @click="handleSaveRegions"
              >
                保存
              </el-button>

              <span class="subject-name">{{ subjectName }}</span>
            </div>
          </div>

          <div class="image-content">
            <PaperRegionEditor
              v-if="!isPdf(getFileUrl(activeTab))"
              ref="regionEditorRef"
              v-model:manual-question-no="manualQuestionNo"
              :key="`${activeTab}-${getFileUrl(activeTab)}`"
              :image-url="resolveFileUrl(getFileUrl(activeTab))"
              :regions="getRegions(activeTab)"
              :subject-name="subjectName"
              :hide-toolbar="true"
              initial-tool="pan"
              :interaction-locked="ocrLoading"
              :region-ocr-loading="questionOcrLoading"
              @update:regions="(regions) => handleRegionsChange(activeTab, regions)"
              @save="(regions) => savePaperRegions(activeTab, regions)"
              @ocr-region="handleRegionOcr"
              @analyze-region="handleRegionAnalyze"
            >
            </PaperRegionEditor>
            <div v-if="ocrLoading && !isPdf(getFileUrl(activeTab))" class="editor-lock-mask">
              <div class="ocr-progress-panel">
                <div class="ocr-progress-title">{{ ocrProgress.title }}</div>
                <div class="ocr-progress-detail">{{ ocrProgress.detail }}</div>
                <el-progress
                  :percentage="ocrProgress.percentage"
                  :stroke-width="16"
                  :show-text="false"
                  striped
                  striped-flow
                />
                <div class="ocr-progress-percent">{{ ocrProgress.percentage }}%</div>
              </div>
            </div>
            <div v-else-if="isPdf(getFileUrl(activeTab))" class="pdf-preview-wrapper">
              <div class="preview-toolbar">
                <div class="preview-toolbar-left">
                  <span class="pdf-mode-tag">PDF 预览模式</span>
                </div>
                <div class="preview-toolbar-right">
                  <el-upload
                    action="#"
                    :auto-upload="false"
                    :show-file-list="false"
                    accept=".pdf,.png,.jpg,.jpeg"
                    :on-change="(file: any) => handleFileUpload(activeTab, file)"
                  >
                    <el-button size="small">重新上传</el-button>
                  </el-upload>
                  <span class="preview-subject">{{ subjectName }}</span>
                </div>
              </div>
              <div class="pdf-notice">
                当前资源仍是旧版 PDF 记录，建议重新上传。系统会在上传后自动转换成长图 PNG，
                再进入框选编辑。
              </div>
              <iframe :src="resolveFileUrl(getFileUrl(activeTab))" class="pdf-iframe"></iframe>
            </div>
          </div>
        </div>
        <div v-else class="empty-upload">
          <div class="empty-message">
            {{ activeTab === 'template' ? '答案解析' : '试卷' }}未上传，请上传后编辑
          </div>
          <el-upload
            drag
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            accept=".pdf,.png,.jpg,.jpeg"
            :on-change="(file: any) => handleFileUpload(activeTab, file)"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text"> 将文件拖到此处，或 <em>点击上传</em> </div>
          </el-upload>
        </div>
      </template>

      <template v-else-if="activeTab === 'student'">
        <div v-if="!selectedStudent" class="student-list-view">
          <div class="search-bar">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索学号或姓名"
              style="width: 240px"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <el-table :data="studentList" stripe height="calc(100vh - 250px)" style="width: 100%">
            <el-table-column prop="studentNo" label="学号" min-width="150" />
            <el-table-column prop="studentName" label="姓名" min-width="120" />
            <el-table-column prop="totalScore" label="总分" min-width="100" align="center" />
            <el-table-column label="答题卡" min-width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="row.hasAnswerSheet ? 'success' : 'info'" size="small">
                  {{ row.hasAnswerSheet ? '已上传' : '未上传' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="ocr" min-width="100" align="center">
              <template #default>
                <span class="text-secondary">未识别</span>
              </template>
            </el-table-column>
            <el-table-column label="切分" min-width="100" align="center">
              <template #default>
                <span class="text-secondary">{{ studentSplitLabel }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="enterStudentPaper(row)">进入</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="totalStudents"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>

        <div v-else class="student-paper-view">
          <div class="viewer-header">
            <el-button link @click="selectedStudent = null">
              <el-icon><Back /></el-icon> 返回列表
            </el-button>
            <span class="current-student"
              >当前考生：{{ selectedStudent.studentName }} ({{ selectedStudent.studentNo }})</span
            >
          </div>
          <div v-if="selectedStudent.hasAnswerSheet" class="file-viewer">
            <div class="workspace-toolbar">
              <div class="workspace-toolbar__left">
                <el-button-group>
                  <el-button
                    size="small"
                    :type="studentRegionEditorRef?.tool === 'pan' ? 'primary' : 'default'"
                    :disabled="ocrLoading"
                    @click="handleStudentToolboxCommand('panMode')"
                  >
                    移动试卷
                  </el-button>
                  <el-button
                    size="small"
                    :type="studentRegionEditorRef?.tool === 'draw' ? 'primary' : 'default'"
                    :disabled="ocrLoading"
                    @click="handleStudentToolboxCommand('drawMode')"
                  >
                    创建选框
                  </el-button>
                  <el-button
                    size="small"
                    :type="studentRegionEditorRef?.tool === 'adjust' ? 'primary' : 'default'"
                    :disabled="ocrLoading"
                    @click="handleStudentToolboxCommand('adjustMode')"
                  >
                    编辑选框
                  </el-button>
                </el-button-group>

                <div class="manual-no-setter" v-if="selectedStudent">
                  <span class="setter-label">题号:</span>
                  <el-input-number
                    v-model="manualQuestionNo"
                    size="small"
                    :min="1"
                    :precision="0"
                    :controls="false"
                    class="no-input"
                  />
                </div>

                <div class="toolbar-divider"></div>

                <el-tooltip
                  :content="studentRegionEditorRef?.currentHintText || '请先上传考生原卷后开始编辑'"
                  placement="bottom"
                >
                  <el-button size="small" class="tool-btn" :disabled="ocrLoading">
                    <el-icon><InfoFilled /></el-icon> 提示
                  </el-button>
                </el-tooltip>

                <div class="zoom-indicator" v-if="studentRegionEditorRef?.scale">
                  {{ Math.round(studentRegionEditorRef.scale * 100) }}%
                </div>
              </div>

              <div class="workspace-toolbar__right">
                <el-button
                  size="small"
                  type="success"
                  plain
                  :disabled="ocrLoading"
                  @click="applyStudentTemplate"
                >
                  设置模板
                </el-button>

                <el-upload
                  action="#"
                  :auto-upload="false"
                  :show-file-list="false"
                  :disabled="ocrLoading"
                  accept=".pdf,.png,.jpg,.jpeg"
                  :on-change="(file: any) => handleStudentUpload(file)"
                >
                  <el-button size="small" :disabled="ocrLoading">重新上传</el-button>
                </el-upload>

                <el-button
                  size="small"
                  type="primary"
                  :disabled="ocrLoading"
                  @click="handleStudentAutoCut"
                >
                  AI识别
                </el-button>

                <el-button
                  size="small"
                  type="primary"
                  :disabled="ocrLoading"
                  @click="saveStudentPaperRegions(studentRegions, false)"
                >
                  保存
                </el-button>

                <span class="subject-name">{{ subjectName }}</span>
              </div>
            </div>

            <div class="image-content">
              <PaperRegionEditor
                v-if="!isPdf(selectedStudent.answerSheetUrl)"
                ref="studentRegionEditorRef"
                v-model:manual-question-no="manualQuestionNo"
                :key="`${selectedStudent.studentNo}-${selectedStudent.answerSheetUrl}-${selectedStudentLayoutVersion}`"
                :image-url="resolveFileUrl(selectedStudent.answerSheetUrl)"
                :regions="studentRegions"
                :subject-name="subjectName"
                :hide-toolbar="true"
                initial-tool="pan"
                :interaction-locked="ocrLoading"
                :region-ocr-loading="questionOcrLoading"
                @update:regions="handleStudentRegionsChange"
                @save="(regions) => saveStudentPaperRegions(regions, false)"
                @ocr-region="handleStudentRegionOcr"
                @analyze-region="handleStudentRegionAnalyze"
              >
              </PaperRegionEditor>
              <div v-else class="pdf-preview-wrapper">
                <div class="preview-toolbar">
                  <div class="preview-toolbar-left">
                    <span class="pdf-mode-tag">PDF 预览模式</span>
                  </div>
                  <div class="preview-toolbar-right">
                    <el-upload
                      action="#"
                      :auto-upload="false"
                      :show-file-list="false"
                      accept=".pdf,.png,.jpg,.jpeg"
                      :on-change="(file: any) => handleStudentUpload(file)"
                    >
                      <el-button size="small">重新上传</el-button>
                    </el-upload>
                    <span class="preview-subject">{{ subjectName }}</span>
                  </div>
                </div>
                <div class="pdf-notice">
                  当前资源仍是旧版 PDF 记录，建议重新上传。系统会在上传后自动转换成长图 PNG，
                  并继续沿用当前考生原卷框选结果。
                </div>
                <iframe
                  :src="resolveFileUrl(selectedStudent.answerSheetUrl)"
                  class="pdf-iframe"
                ></iframe>
              </div>
            </div>
          </div>
          <div v-else class="empty-upload">
            <div class="empty-message">考生原卷未上传，请上传后查看</div>
            <el-upload
              drag
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              accept=".pdf,.png,.jpg,.jpeg"
              :on-change="(file: any) => handleStudentUpload(file)"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text"> 点击或拖拽上传考生原卷 </div>
            </el-upload>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted, watch } from 'vue'
  import { UploadFilled, Back, ArrowLeft, Search, InfoFilled } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import PaperRegionEditor from './PaperRegionEditor.vue'
  import {
    fetchAnalyzePaperQuestion,
    fetchAutoCutPaperLayout,
    fetchOcrPaperLayoutPage,
    fetchOcrPaperQuestion,
    fetchSavePaperLayout,
    fetchProjectScoreList,
    fetchUploadStudentAnswerSheet,
    fetchPaperConfig,
    fetchUploadPublicPaper,
    fetchStartAutoCutTask,
    fetchOcrTaskStatus,
    normalizePaperRegions,
    type PaperMergeInfo,
    type PaperRegionItem
  } from '@/api/core-business/exam/project-editor'

  const props = defineProps<{
    projectId: string
    subjectName: string
  }>()

  const emit = defineEmits<{
    back: []
    saved: []
  }>()

  const activeTab = ref('template')
  const studentList = ref<any[]>([])
  const selectedStudent = ref<any>(null)
  const loading = ref(false)
  const ocrLoading = ref(false)
  const questionOcrLoading = ref(false)
  const regionEditorRef = ref<any>(null)
  const studentRegionEditorRef = ref<any>(null)
  const latestAutoCutRegionCount = ref(0)
  const manualQuestionNo = ref(1)
  const PAPER_RESULT_CONFIRM_INTERVAL = 2000
  const PAPER_RESULT_CONFIRM_ATTEMPTS = 15
  const studentsLoaded = ref(false)
  const studentRegions = ref<PaperRegionItem[]>([])
  const selectedStudentLayoutVersion = ref(0)

  // 搜索和分页
  const searchKeyword = ref('')
  const currentPage = ref(1)
  const pageSize = ref(20)
  const totalStudents = ref(0)

  const paperConfig = ref({
    templateUrl: null as string | null,
    originalUrl: null as string | null,
    templateMergeInfo: emptyMergeInfo(),
    originalMergeInfo: emptyMergeInfo(),
    templateRegions: [] as PaperRegionItem[],
    originalRegions: [] as PaperRegionItem[]
  })

  const ocrProgress = ref({
    title: 'AI识别中',
    detail: '系统正在准备识别任务...',
    percentage: 0
  })

  const showIntegratedToolbar = computed(() => activeTab.value !== 'student')
  const canUseEditor = computed(
    () =>
      showIntegratedToolbar.value && hasFile(activeTab.value) && !isPdf(getFileUrl(activeTab.value))
  )

  type PaperTab = 'template' | 'original'
  type PaperConfigState = {
    templateUrl: string | null
    originalUrl: string | null
    templateMergeInfo: PaperMergeInfo
    originalMergeInfo: PaperMergeInfo
    templateRegions: PaperRegionItem[]
    originalRegions: PaperRegionItem[]
  }

  function emptyMergeInfo(): PaperMergeInfo {
    return {
      sourceType: '',
      imageWidth: 0,
      imageHeight: 0,
      pageCount: 0,
      pages: []
    }
  }

  function syncPaperConfig(config: PaperConfigState) {
    paperConfig.value = {
      templateUrl: config.templateUrl || null,
      originalUrl: config.originalUrl || null,
      templateMergeInfo: config.templateMergeInfo || emptyMergeInfo(),
      originalMergeInfo: config.originalMergeInfo || emptyMergeInfo(),
      templateRegions: normalizePaperRegions(config.templateRegions),
      originalRegions: normalizePaperRegions(config.originalRegions)
    }
    return paperConfig.value
  }

  function getPaperUrlByType(config: PaperConfigState, type: PaperTab) {
    return type === 'template' ? config.templateUrl || '' : config.originalUrl || ''
  }

  function getPaperRegionsByType(config: PaperConfigState, type: PaperTab) {
    return type === 'template' ? config.templateRegions : config.originalRegions
  }

  function updatePaperUrl(type: PaperTab, url: string | null) {
    if (type === 'template') {
      paperConfig.value.templateUrl = url
      return
    }
    paperConfig.value.originalUrl = url
  }

  function getRegionSignature(regions: PaperRegionItem[]) {
    return JSON.stringify(normalizePaperRegions(regions))
  }

  function shouldConfirmPaperResult(error: any) {
    const message = String(error?.message || '').toLowerCase()
    return ['网络', '连接异常', 'timeout', '超时', 'gateway'].some((keyword) =>
      message.includes(keyword.toLowerCase())
    )
  }

  function getErrorMessage(error: any, fallback: string) {
    return String(error?.message || fallback)
  }

  function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  function handleToolboxCommand(command: string) {
    regionEditorRef.value?.handleToolboxCommand(command)
  }

  function handleStudentToolboxCommand(command: string) {
    studentRegionEditorRef.value?.handleToolboxCommand(command)
  }

  function handleSaveRegions() {
    regionEditorRef.value?.save()
  }

  function getMergeInfo(tab: PaperTab) {
    return tab === 'template' ? paperConfig.value.templateMergeInfo : paperConfig.value.originalMergeInfo
  }

  function updateOcrProgress(title: string, detail: string, percentage: number) {
    ocrProgress.value = {
      title,
      detail,
      percentage: Math.max(0, Math.min(100, Math.round(percentage)))
    }
  }

  function resetOcrProgress() {
    updateOcrProgress('AI识别中', '系统正在准备识别任务...', 0)
  }

  async function runPagedAutoCut(
    type: PaperTab | 'student',
    mergeInfo: PaperMergeInfo,
    studentNo?: string
  ) {
    const totalPages = Math.max(mergeInfo.pageCount || mergeInfo.pages?.length || 0, 1)
    const isOriginal = type === 'original'
    const totalSteps = isOriginal ? totalPages + 1 : totalPages
    
    updateOcrProgress('分页中', `正在还原 PDF 分页信息，共 ${totalPages} 页...`, 5)
    await wait(300)

    const mergedRegions: PaperRegionItem[] = []
    for (let pageIndex = 1; pageIndex <= totalPages; pageIndex++) {
      updateOcrProgress(
        'AI识别中',
        `正在识别第 ${pageIndex}/${totalPages} 页...`,
        (pageIndex / totalSteps) * 90
      )
      const res = await fetchOcrPaperLayoutPage({
        projectId: props.projectId,
        subjectName: props.subjectName,
        type: type as any,
        studentNo,
        pageIndex
      })
      mergedRegions.push(...res.regions)
      latestAutoCutRegionCount.value = mergedRegions.length
    }

    if (isOriginal) {
      updateOcrProgress(
        'AI识别中',
        `正在识别知识点/分数 (${totalPages + 1}/${totalSteps})...`,
        95
      )
      // 这里可以调用后端的批量分析接口，或者在保存时由后端自动触发
      // 目前逻辑是后端在 autoCutPaperLayoutByOcr 中处理，分页模式下我们需要手动触发一次保存并让后端分析
      await fetchSavePaperLayout({
        projectId: props.projectId,
        subjectName: props.subjectName,
        type: 'original',
        regions: mergedRegions
      })
      // 重新加载以获取后端分析后的结果
      const config = await refreshConfigSilently()
      if (config) {
        mergedRegions.length = 0
        mergedRegions.push(...config.originalRegions)
      }
    }

    return normalizePaperRegions(
      mergedRegions.map((region, index) => ({
        ...region,
        sortOrder: index + 1
      }))
    )
  }

  async function handleStudentAutoCut() {
    if (!selectedStudent.value?.hasAnswerSheet) {
      ElMessage.warning('请先上传考生答题卡后再执行 AI识别')
      return
    }

    if (studentRegions.value.length > 0) {
      try {
        await ElMessageBox.confirm('AI识别会覆盖当前答题卡已有的框选结果，是否继续？', '覆盖确认', {
          type: 'warning',
          confirmButtonText: '继续识别',
          cancelButtonText: '取消'
        })
      } catch {
        return
      }
    }

    ocrLoading.value = true
    try {
      const mergeInfo = selectedStudent.value.answerMergeInfo
      let recognizedRegions: PaperRegionItem[] = []
      if ((mergeInfo?.pageCount || 0) > 1) {
        recognizedRegions = await runPagedAutoCut(
          'student',
          mergeInfo,
          selectedStudent.value.studentNo
        )
      } else {
        updateOcrProgress('AI识别中', '正在识别当前答题卡...', 35)
        const res = await fetchAutoCutPaperLayout({
          projectId: props.projectId,
          subjectName: props.subjectName,
          type: 'student',
          studentNo: selectedStudent.value.studentNo
        })
        recognizedRegions = res.regions
      }
      studentRegions.value = recognizedRegions
      await saveStudentPaperRegions(recognizedRegions, false)
      studentRegionEditorRef.value?.handleToolboxCommand('adjustMode')
      updateOcrProgress('AI识别完成', `已识别 ${recognizedRegions.length} 个题目区域`, 100)
      ElMessage.success(`AI识别完成，已识别 ${recognizedRegions.length} 个题目区域`)
      emit('saved')
    } catch (e: any) {
      console.error(e)
      ElMessage.error(getErrorMessage(e, 'AI识别失败'))
    } finally {
      ocrLoading.value = false
      resetOcrProgress()
    }
  }

  async function handleAutoCut() {
    if (!canUseEditor.value) {
      ElMessage.warning('请先上传图片格式试卷后再执行 AI识别')
      return
    }

    const currentType = activeTab.value as PaperTab
    const currentRegions = getRegions(currentType)
    if (currentRegions.length > 0) {
      try {
        await ElMessageBox.confirm('AI识别会覆盖当前试卷已有的框选结果，是否继续？', '覆盖确认', {
          type: 'warning',
          confirmButtonText: '继续识别',
          cancelButtonText: '取消'
        })
      } catch {
        return
      }
    }

    ocrLoading.value = true
    try {
      const taskId = await fetchStartAutoCutTask({
        projectId: props.projectId,
        subjectName: props.subjectName,
        type: currentType
      })
      
      localStorage.setItem(`ocr_task_${props.projectId}_${props.subjectName}_${currentType}`, taskId)
      await pollOcrTask(taskId, currentType)
    } catch (e: any) {
      console.error(e)
      ElMessage.error(getErrorMessage(e, 'AI识别启动失败'))
      ocrLoading.value = false
    }
  }

  async function pollOcrTask(taskId: string, type: PaperTab) {
    const MAX_RETRIES = 60
    const INTERVAL = 3000
    
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const task = await fetchOcrTaskStatus(taskId)
        updateOcrProgress('AI识别中', task.message || '系统正在识别中...', task.progress || 10)
        
        if (task.status === 'COMPLETED') {
          const recognizedRegions = normalizePaperRegions(task.result?.regions || [])
          handleRegionsChange(type, recognizedRegions)
          await refreshConfigSilently()
          regionEditorRef.value?.handleToolboxCommand('adjustMode')
          updateOcrProgress('AI识别完成', `已识别 ${recognizedRegions.length} 个题目区域`, 100)
          ElMessage.success(`AI识别完成，已识别 ${recognizedRegions.length} 个题目区域`)
          localStorage.removeItem(`ocr_task_${props.projectId}_${props.subjectName}_${type}`)
          ocrLoading.value = false
          emit('saved')
          return
        }
        
        if (task.status === 'FAILED') {
          throw new Error(task.message || '识别任务失败')
        }
      } catch (e: any) {
        console.error('轮询 OCR 任务失败:', e)
        if (i === MAX_RETRIES - 1) {
          ElMessage.error(getErrorMessage(e, 'AI识别任务超时或失败'))
          ocrLoading.value = false
        }
      }
      await wait(INTERVAL)
    }
  }

  async function checkPendingOcrTask() {
    const types: PaperTab[] = ['template', 'original']
    for (const type of types) {
      const taskId = localStorage.getItem(`ocr_task_${props.projectId}_${props.subjectName}_${type}`)
      if (taskId) {
        ocrLoading.value = true
        activeTab.value = type
        pollOcrTask(taskId, type)
      }
    }
  }

  const studentSplitLabel = computed(() =>
    paperConfig.value.templateRegions.length > 0 ? '已切分' : '未切分'
  )

  onMounted(() => {
    reloadCurrentView()
    checkPendingOcrTask()
  })

  watch(
    () => [props.projectId, props.subjectName],
    () => {
      selectedStudent.value = null
      studentsLoaded.value = false
      reloadCurrentView()
    }
  )

  watch(activeTab, (tab) => {
    if (tab !== 'student') {
      selectedStudent.value = null
      return
    }
    loadStudents()
  })

  async function loadConfig(options: { silent?: boolean } = {}) {
    try {
      const res = await fetchPaperConfig({
        projectId: props.projectId,
        subjectName: props.subjectName
      })
      return syncPaperConfig({
        templateUrl: res.templateUrl || null,
        originalUrl: res.originalUrl || null,
        templateMergeInfo: res.templateMergeInfo || emptyMergeInfo(),
        originalMergeInfo: res.originalMergeInfo || emptyMergeInfo(),
        templateRegions: res.templateRegions,
        originalRegions: res.originalRegions
      })
    } catch (e: any) {
      console.error(e)
      if (!options.silent) {
        ElMessage.error(getErrorMessage(e, '获取试卷配置失败'))
      }
      throw e
    }
  }

  async function refreshConfigSilently() {
    try {
      return await loadConfig({ silent: true })
    } catch {
      return null
    }
  }

  async function confirmPaperState(
    predicate: (config: PaperConfigState) => boolean,
    options: { initialDelay?: number; attempts?: number; interval?: number } = {}
  ) {
    const initialDelay = options.initialDelay ?? 1500
    const attempts = options.attempts ?? PAPER_RESULT_CONFIRM_ATTEMPTS
    const interval = options.interval ?? PAPER_RESULT_CONFIRM_INTERVAL

    for (let attempt = 0; attempt < attempts; attempt++) {
      await wait(attempt === 0 ? initialDelay : interval)
      const latestConfig = await refreshConfigSilently()
      if (latestConfig && predicate(latestConfig)) {
        return latestConfig
      }
    }
    return null
  }

  async function confirmAutoCutResult(
    type: PaperTab,
    previousSignature: string,
    minimumRegionCount = 0
  ) {
    return confirmPaperState((config) => {
      const regions = getPaperRegionsByType(config, type)
      if (!regions.length) {
        return false
      }
      if (minimumRegionCount > 0 && regions.length < minimumRegionCount) {
        return false
      }
      const currentSignature = getRegionSignature(regions)
      return (!previousSignature || currentSignature !== previousSignature) && regions.length >= minimumRegionCount
    })
  }

  async function confirmPaperUploadResult(type: PaperTab, previousUrl: string) {
    return confirmPaperState((config) => {
      const currentUrl = getPaperUrlByType(config, type)
      return !!currentUrl && (!previousUrl || currentUrl !== previousUrl)
    })
  }

  async function loadStudents(options: { force?: boolean } = {}) {
    if (!options.force && studentsLoaded.value) {
      syncSelectedStudent()
      return
    }
    loading.value = true
    try {
      const res = await fetchProjectScoreList({
        projectId: props.projectId,
        subjectName: props.subjectName,
        current: currentPage.value,
        size: pageSize.value,
        keyword: searchKeyword.value
      })
      studentList.value = res.records
      totalStudents.value = res.total
      studentsLoaded.value = true
      syncSelectedStudent()
    } catch (e: any) {
      console.error(e)
      ElMessage.error(e.message || '获取考生原卷列表失败')
    } finally {
      loading.value = false
    }
  }

  function handleSearch() {
    currentPage.value = 1
    loadStudents({ force: true })
  }

  function handleSizeChange(val: number) {
    pageSize.value = val
    currentPage.value = 1
    loadStudents({ force: true })
  }

  function handleCurrentChange(val: number) {
    currentPage.value = val
    loadStudents({ force: true })
  }

  function hasFile(tab: string) {
    if (tab === 'template') return !!paperConfig.value.templateUrl
    if (tab === 'original') return !!paperConfig.value.originalUrl
    return false
  }

  function getFileUrl(tab: string) {
    if (tab === 'template') return paperConfig.value.templateUrl || ''
    if (tab === 'original') return paperConfig.value.originalUrl || ''
    return ''
  }

  function getRegions(tab: string) {
    return tab === 'template'
      ? paperConfig.value.templateRegions
      : paperConfig.value.originalRegions
  }

  function handleRegionsChange(tab: string, regions: PaperRegionItem[]) {
    const normalizedRegions = normalizePaperRegions(regions)
    if (tab === 'template') {
      paperConfig.value.templateRegions = normalizedRegions
    } else if (tab === 'original') {
      paperConfig.value.originalRegions = normalizedRegions
    }
  }

  function isPdf(url: string) {
    return url && url.toLowerCase().endsWith('.pdf')
  }

  function resolveFileUrl(url?: string | null) {
    if (!url) return ''
    if (/^(https?:)?\/\//.test(url) || url.startsWith('blob:') || url.startsWith('data:')) {
      return url
    }
    const baseUrl = String(import.meta.env.VITE_API_URL || '')
    if (baseUrl) {
      try {
        const apiOrigin = new URL(baseUrl, window.location.origin).origin
        return new URL(url.startsWith('/') ? url : `/${url}`, apiOrigin).toString()
      } catch (error) {
        console.warn('解析试卷资源地址失败，回退为原始地址', error)
      }
    }
    return url
  }

  function validatePaperFile(rawFile?: File | null) {
    if (!rawFile) {
      ElMessage.warning('未检测到上传文件')
      return false
    }
    const fileName = rawFile.name.toLowerCase()
    const isValid = ['.pdf', '.png', '.jpg', '.jpeg'].some((ext) => fileName.endsWith(ext))
    if (!isValid) {
      ElMessage.error('仅支持上传 pdf、png、jpg、jpeg 格式文件')
      return false
    }
    return true
  }

  function syncSelectedStudent() {
    if (!selectedStudent.value) return
    const matched = studentList.value.find(
      (item) => item.studentNo === selectedStudent.value.studentNo
    )
    if (matched) {
      selectedStudent.value = { ...matched }
      syncStudentRegions(selectedStudent.value)
    }
  }

  function parseStudentLayouts(layouts?: string | null) {
    if (!layouts) {
      return normalizePaperRegions(paperConfig.value.templateRegions)
    }
    try {
      return normalizePaperRegions(JSON.parse(layouts))
    } catch (error) {
      console.warn('解析考生原卷布局失败，回退为空布局', error)
      return normalizePaperRegions(paperConfig.value.templateRegions)
    }
  }

  function syncStudentRegions(student: any) {
    studentRegions.value = parseStudentLayouts(student?.answerSheetLayouts)
    selectedStudentLayoutVersion.value += 1
  }

  async function reloadCurrentView() {
    await loadConfig()
    if (activeTab.value === 'student') {
      await loadStudents({ force: true })
    }
  }

  async function handleFileUpload(type: string, file: any) {
    if (!validatePaperFile(file.raw)) return
    const currentType = type as PaperTab
    const previousUrl = getFileUrl(currentType)
    loading.value = true
    try {
      const uploadedUrl = await fetchUploadPublicPaper({
        projectId: props.projectId,
        subjectName: props.subjectName,
        type: currentType,
        file: file.raw
      })
      updatePaperUrl(currentType, uploadedUrl)
      await refreshConfigSilently()
      ElMessage.success('上传成功')
      emit('saved')
    } catch (e: any) {
      console.error(e)
      if (shouldConfirmPaperResult(e)) {
        ElMessage.info('上传响应较慢，正在确认试卷是否已经处理完成...')
        const confirmedConfig = await confirmPaperUploadResult(currentType, previousUrl)
        if (confirmedConfig) {
          ElMessage.success('试卷上传已完成')
          emit('saved')
          return
        }
        ElMessage.error('试卷上传请求超时，暂未确认最终结果，请稍后刷新查看')
        return
      }
      ElMessage.error(getErrorMessage(e, '上传试卷失败'))
    } finally {
      loading.value = false
    }
  }

  async function savePaperRegions(type: string, regions: PaperRegionItem[]) {
    loading.value = true
    try {
      const normalizedRegions = normalizePaperRegions(regions)
      await fetchSavePaperLayout({
        projectId: props.projectId,
        subjectName: props.subjectName,
        type: type as 'template' | 'original',
        regions: normalizedRegions
      })
      ElMessage.success('框选坐标保存成功')
      await loadConfig()
      emit('saved')
    } catch (e: any) {
      console.error(e)
      ElMessage.error(e.message || '保存框选坐标失败')
    } finally {
      loading.value = false
    }
  }

  function enterStudentPaper(student: any) {
    selectedStudent.value = { ...student }
    syncStudentRegions(student)
  }

  function handleStudentRegionsChange(regions: PaperRegionItem[]) {
    studentRegions.value = normalizePaperRegions(regions)
  }

  async function saveStudentPaperRegions(regions: PaperRegionItem[], applyToAllStudents: boolean) {
    if (!selectedStudent.value) {
      ElMessage.warning('请先选择考生')
      return
    }
    loading.value = true
    try {
      const normalizedRegions = normalizePaperRegions(regions)
      await fetchSavePaperLayout({
        projectId: props.projectId,
        subjectName: props.subjectName,
        type: 'student',
        studentNo: selectedStudent.value.studentNo,
        applyToAllStudents,
        regions: normalizedRegions
      })
      studentRegions.value = normalizedRegions
      selectedStudent.value.answerSheetLayouts = JSON.stringify(normalizedRegions)
      ElMessage.success(applyToAllStudents ? '模板已应用到全部学生试卷' : '当前考生原卷框选已保存')
      await loadStudents({ force: true })
      emit('saved')
    } catch (error: any) {
      console.error(error)
      ElMessage.error(error.message || '保存考生原卷框选失败')
    } finally {
      loading.value = false
    }
  }

  async function applyStudentTemplate() {
    if (!selectedStudent.value) {
      ElMessage.warning('请先选择考生')
      return
    }
    try {
      await ElMessageBox.confirm(
        '将当前考生原卷的全部框选坐标设为模板，并同步到该学科所有学生原卷，是否继续？',
        '设置模板',
        {
          type: 'warning',
          confirmButtonText: '确认同步',
          cancelButtonText: '取消'
        }
      )
      await saveStudentPaperRegions(studentRegions.value, true)
    } catch {
      return
    }
  }

  async function handleStudentUpload(file: any) {
    if (!selectedStudent.value) {
      ElMessage.warning('请先选择考生')
      return
    }
    if (!validatePaperFile(file.raw)) return
    loading.value = true
    try {
      const url = await fetchUploadStudentAnswerSheet({
        projectId: props.projectId,
        subjectName: props.subjectName,
        studentNo: selectedStudent.value.studentNo,
        file: file.raw
      })
      ElMessage.success('上传成功')
      selectedStudent.value.hasAnswerSheet = true
      selectedStudent.value.answerSheetUrl = url
      syncStudentRegions(selectedStudent.value)
      await loadStudents({ force: true })
      emit('saved')
    } catch (e: any) {
      console.error(e)
      ElMessage.error(e.message || '上传考生原卷失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 对于数学学科，自动将非中文部分用 $$ 包裹（排除题号）
   */
  function formatMathOcrText(text: string) {
    if (!text) return text
    // 1. 提取题号 (例如 "20." 或 "第20题")
    const qNoMatch = text.match(/^(\d+[\.、\s]|第\d+题)/)
    let qNo = ''
    let rest = text
    if (qNoMatch) {
      qNo = qNoMatch[0]
      rest = text.substring(qNo.length)
    }

    // 2. 处理剩余文本：将非中文字段用 $$ 包裹
    // 匹配中文作为分隔符（不包括标点）
    const chineseRegex = /([\u4e00-\u9fa5]+)/
    const parts = rest.split(chineseRegex)

    const processedRest = parts
      .map((part) => {
        if (!part) return ''
        // 如果不是中文，且包含非空白内容
        if (!/[\u4e00-\u9fa5]/.test(part) && part.trim()) {
          const trimmed = part.trim()
          
          // 如果只是单纯的标点符号（中英文标点），不进行 $$ 包裹
          if (/^[，。？！；：、《》…（）(),.?;:!\"']+$/.test(trimmed)) {
            return part
          }

          // 自动转换常见的希腊字母为 LaTeX 指令，防止渲染失败
          let mathContent = trimmed
            .replace(/α/g, '\\alpha')
            .replace(/β/g, '\\beta')
            .replace(/γ/g, '\\gamma')
            .replace(/δ/g, '\\delta')
            .replace(/θ/g, '\\theta')
            .replace(/π/g, '\\pi')
            .replace(/Π/g, '\\Pi')
            .replace(/ω/g, '\\omega')
            .replace(/φ/g, '\\phi')
            .replace(/ε/g, '\\epsilon')
            .replace(/σ/g, '\\sigma')
            .replace(/λ/g, '\\lambda')
            .replace(/μ/g, '\\mu')

          // 避免重复包裹
          if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
            return part
          }
          // 保持原有的前后空格，仅包裹内容
          const leadingSpace = part.match(/^\s*/)?.[0] || ''
          const trailingSpace = part.match(/\s*$/)?.[0] || ''
          return `${leadingSpace}$$${mathContent}$$${trailingSpace}`
        }
        return part
      })
      .join('')

    return qNo + processedRest
  }

  async function handleRegionOcr(region: PaperRegionItem) {
    if (questionOcrLoading.value) {
      return
    }
    const currentType = activeTab.value as PaperTab
    questionOcrLoading.value = true
    try {
      const res = await fetchOcrPaperQuestion({
        projectId: props.projectId,
        subjectName: props.subjectName,
        type: currentType,
        partTitle: region.partTitle,
        x: region.x,
        y: region.y,
        width: region.width,
        height: region.height
      })

      let questionText = res.questionText
      // 只有数学学科才进行 LaTeX 自动包裹处理
      if (props.subjectName === '数学' && questionText) {
        questionText = formatMathOcrText(questionText)
      }

      regionEditorRef.value?.applyOcrRegionMeta({
        questionText: questionText,
        questionType: res.questionType,
        knowledgePoint: res.knowledgePoint,
        score: res.score
      })
      ElMessage.success('题目 OCR 内容已回填')
    } catch (e: any) {
      console.error(e)
      ElMessage.error(getErrorMessage(e, '题目识别失败'))
    } finally {
      questionOcrLoading.value = false
    }
  }

  async function handleRegionAnalyze(region: PaperRegionItem) {
    if (questionOcrLoading.value) {
      return
    }
    const currentType = activeTab.value as PaperTab
    questionOcrLoading.value = true
    try {
      const res = await fetchAnalyzePaperQuestion({
        projectId: props.projectId,
        subjectName: props.subjectName,
        type: currentType,
        partTitle: region.partTitle,
        x: region.x,
        y: region.y,
        width: region.width,
        height: region.height
      })

      let questionText = res.questionText
      if (props.subjectName === '数学' && questionText) {
        questionText = formatMathOcrText(questionText)
      }

      regionEditorRef.value?.applyOcrRegionMeta({
        questionText,
        questionType: res.questionType,
        knowledgePoint: res.knowledgePoint,
        score: res.score
      })
      ElMessage.success('分值与知识点已回填')
    } catch (error: any) {
      console.error(error)
      ElMessage.error(getErrorMessage(error, '题目分析失败'))
    } finally {
      questionOcrLoading.value = false
    }
  }

  async function handleStudentRegionOcr(region: PaperRegionItem) {
    if (!selectedStudent.value || questionOcrLoading.value) {
      return
    }
    questionOcrLoading.value = true
    try {
      const res = await fetchOcrPaperQuestion({
        projectId: props.projectId,
        subjectName: props.subjectName,
        type: 'student',
        studentNo: selectedStudent.value.studentNo,
        partTitle: region.partTitle,
        x: region.x,
        y: region.y,
        width: region.width,
        height: region.height
      })

      let questionText = res.questionText
      if (props.subjectName === '数学' && questionText) {
        questionText = formatMathOcrText(questionText)
      }
      studentRegionEditorRef.value?.applyOcrRegionMeta({
        questionText,
        questionType: res.questionType,
        knowledgePoint: res.knowledgePoint,
        score: res.score
      })
      ElMessage.success('题目 OCR 内容已回填')
    } catch (error: any) {
      console.error(error)
      ElMessage.error(getErrorMessage(error, '题目识别失败'))
    } finally {
      questionOcrLoading.value = false
    }
  }

  async function handleStudentRegionAnalyze(region: PaperRegionItem) {
    if (!selectedStudent.value || questionOcrLoading.value) {
      return
    }
    questionOcrLoading.value = true
    try {
      const res = await fetchAnalyzePaperQuestion({
        projectId: props.projectId,
        subjectName: props.subjectName,
        type: 'student',
        studentNo: selectedStudent.value.studentNo,
        partTitle: region.partTitle,
        x: region.x,
        y: region.y,
        width: region.width,
        height: region.height
      })

      let questionText = res.questionText
      if (props.subjectName === '数学' && questionText) {
        questionText = formatMathOcrText(questionText)
      }
      studentRegionEditorRef.value?.applyOcrRegionMeta({
        questionText,
        questionType: res.questionType,
        knowledgePoint: res.knowledgePoint,
        score: res.score
      })
      ElMessage.success('分值与知识点已回填')
    } catch (error: any) {
      console.error(error)
      ElMessage.error(getErrorMessage(error, '题目分析失败'))
    } finally {
      questionOcrLoading.value = false
    }
  }

  function handleBack() {
    emit('back')
  }
</script>

<style scoped lang="scss">
  .paper-edit-view {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #fff;
  }

  .view-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 0 20px;
    border-bottom: 1px solid #f0f0f0;
    background: #fff;
    min-height: 72px;
    flex-shrink: 0;

    .header-left {
      display: flex;
      align-items: center;
      height: 100%;

      .back-btn {
        font-size: 14px;
        color: #606266;
        padding: 0 12px;
        &:hover {
          color: #409eff;
        }
      }

      .divider {
        width: 1px;
        height: 20px;
        background: #e0e0e0;
        margin: 0 16px;
      }
    }
  }

  .tabs-list {
    display: flex;
    align-items: center;
    height: 100%;
  }

  .tab-item {
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 24px;
    cursor: pointer;
    font-size: 15px;
    color: #606266;
    transition: all 0.2s;
    border-bottom: 3px solid transparent;

    &:hover {
      color: #409eff;
    }

    &.active {
      color: #409eff;
      font-weight: 600;
      border-bottom-color: #409eff;
    }

    &.desc {
      margin-left: 12px;
      color: #909399;
      cursor: default;
      border-bottom-color: transparent;

      &:hover {
        color: #909399;
      }
    }
  }

  .subject-name {
    flex-shrink: 0;
    font-size: 14px;
    color: #409eff;
    font-weight: 600;
    background: rgba(64, 158, 255, 0.1);
    padding: 6px 16px;
    border-radius: 4px;
  }

  .header-right {
    flex: 1;
    min-width: 0;
  }

  .view-body {
    flex: 1;
    overflow: hidden;
    min-height: 0;
    padding: 16px;
    background-color: #f5f7fa;
    display: flex;
    flex-direction: column;
  }

  .workspace-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
    padding: 18px 22px;
    background: #fff;
    border: 1px solid #dbe7f5;
    border-radius: 22px;
    box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08);
    flex-wrap: wrap;
    flex-shrink: 0;

    &__left,
    &__right {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .manual-no-setter {
      display: flex;
      align-items: center;
      padding: 0 10px;
      height: 32px;
      background: #f8fbff;
      border: 1px solid #dbe7f5;
      border-radius: 8px;

      .setter-label {
        font-size: 13px;
        color: #64748b;
        font-weight: 500;
        margin-right: 4px;
      }

      .no-input {
        width: 40px;

        :deep(.el-input__wrapper) {
          box-shadow: none !important;
          background: transparent;
          padding: 0;
        }

        :deep(.el-input__inner) {
          text-align: left;
          color: #2563eb;
          font-weight: 600;
        }
      }
    }

    .toolbar-divider {
      width: 1px;
      height: 24px;
      background: #ebeef5;
      margin: 0 2px;
    }

    .tool-btn {
      background: #fff;
      border-color: #dcdfe6;
      color: #606266;
      &:hover {
        border-color: #409eff;
        color: #409eff;
      }
    }

    .zoom-indicator {
      font-size: 14px;
      font-weight: 600;
      color: #409eff;
      min-width: 56px;
      text-align: center;
      background: #ecf5ff;
      padding: 4px 10px;
      border-radius: 6px;
    }
  }

  .file-viewer {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;

    .image-content {
      flex: 1;
      position: relative;
      width: 100%;
      overflow: hidden;
      border: 1px solid #e4e7ed;
      border-radius: 16px;
      background: #fff;
      display: flex;
      justify-content: center;
      align-items: stretch;
      min-height: 0;
      padding: 0;

      .pdf-preview-wrapper {
        flex: 1;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px;
        min-height: 0;
      }

      .preview-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 16px;
        border-radius: 14px;
        border: 1px solid #dbe7f5;
        background: linear-gradient(180deg, #f8fbff 0%, #f2f6fb 100%);
        flex-wrap: wrap;
      }

      .preview-toolbar-left,
      .preview-toolbar-right {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      .pdf-mode-tag {
        display: inline-flex;
        align-items: center;
        height: 32px;
        padding: 0 12px;
        border-radius: 999px;
        background: #eff6ff;
        color: #2563eb;
        font-size: 13px;
        font-weight: 600;
      }

      .preview-subject {
        display: inline-flex;
        align-items: center;
        height: 32px;
        padding: 0 14px;
        border-radius: 10px;
        background: rgba(59, 130, 246, 0.12);
        color: #2563eb;
        font-size: 13px;
        font-weight: 700;
      }

      .pdf-notice {
        padding: 12px 16px;
        border-radius: 10px;
        background: #fff7ed;
        color: #9a3412;
        font-size: 13px;
        border: 1px solid #fed7aa;
      }

      .pdf-iframe {
        width: 100%;
        flex: 1;
        min-height: 0;
        border: none;
      }

      .editor-lock-mask {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: inherit;
        background: rgba(255, 255, 255, 0.72);
        backdrop-filter: blur(2px);
        z-index: 10;
      }

      .ocr-progress-panel {
        width: min(420px, calc(100% - 48px));
        padding: 24px 24px 20px;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.96);
        border: 1px solid rgba(59, 130, 246, 0.18);
        box-shadow: 0 18px 48px rgba(37, 99, 235, 0.12);
        text-align: center;
      }

      .ocr-progress-title {
        color: #1d4ed8;
        font-size: 18px;
        font-weight: 700;
      }

      .ocr-progress-detail {
        margin: 10px 0 18px;
        color: #475569;
        font-size: 14px;
      }

      .ocr-progress-percent {
        margin-top: 12px;
        color: #2563eb;
        font-size: 22px;
        font-weight: 700;
      }
    }
  }

  .empty-upload {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-bottom: 100px;
    background: #fff;

    .empty-message {
      font-size: 20px;
      color: #303133;
      margin-bottom: 40px;
      font-weight: 500;
    }

    :deep(.el-upload-dragger) {
      width: 480px;
      padding: 40px;
    }
  }

  .student-list-view {
    padding: 24px;
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;

    .search-bar {
      margin-bottom: 16px;
      display: flex;
      justify-content: flex-start;
    }

    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }

    :deep(.el-table) {
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      flex: 1;
    }
  }

  .student-paper-view {
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;

    .viewer-header {
      padding: 0 0 16px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      align-items: center;
      gap: 24px;
      background: transparent;

      .current-student {
        font-size: 15px;
        color: #303133;
        font-weight: 600;
      }
    }
  }

  .text-secondary {
    color: #909399;
    font-size: 13px;
  }

  @media (max-width: 1280px) {
    .view-header {
      align-items: flex-start;
      padding: 16px 20px;
    }
  }

  @media (max-width: 960px) {
    .view-body {
      padding: 12px;
    }

    .workspace-toolbar {
      padding: 14px 16px;
      border-radius: 18px;
    }
  }
</style>
