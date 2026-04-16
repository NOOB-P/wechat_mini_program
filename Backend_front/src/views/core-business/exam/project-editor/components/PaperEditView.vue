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
            样板答题卡
          </div>
          <div
            class="tab-item"
            :class="{ active: activeTab === 'original' }"
            @click="activeTab = 'original'"
          >
            原卷
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
                  :type="regionEditorRef?.tool === 'draw' ? 'primary' : 'default'"
                  :disabled="!canUseEditor"
                  @click="handleToolboxCommand('drawMode')"
                >
                  框选框
                </el-button>
                <el-button
                  size="small"
                  :type="regionEditorRef?.tool === 'adjust' ? 'primary' : 'default'"
                  :disabled="!canUseEditor"
                  @click="handleToolboxCommand('adjustMode')"
                >
                  调整框选
                </el-button>
                <el-button
                  size="small"
                  :type="regionEditorRef?.tool === 'pan' ? 'primary' : 'default'"
                  :disabled="!canUseEditor"
                  @click="handleToolboxCommand('panMode')"
                >
                  移动画布
                </el-button>
                <el-button
                  size="small"
                  :type="regionEditorRef?.tool === 'select' ? 'primary' : 'default'"
                  :disabled="!canUseEditor"
                  @click="handleToolboxCommand('selectMode')"
                >
                  选择题目
                </el-button>
              </el-button-group>

              <div class="toolbar-divider"></div>

              <el-tooltip
                :content="regionEditorRef?.currentHintText || '请先上传图片格式试卷后开始编辑'"
                placement="bottom"
              >
                <el-button size="small" class="tool-btn" :disabled="!canUseEditor">
                  <el-icon><InfoFilled /></el-icon> 提示
                </el-button>
              </el-tooltip>

              <el-dropdown trigger="hover" @command="handleToolboxCommand">
                <el-button size="small" class="tool-btn" :disabled="!canUseEditor">
                  <el-icon><Tools /></el-icon> 工具箱
                  <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="drawMode">框选框</el-dropdown-item>
                    <el-dropdown-item command="adjustMode">调整框选</el-dropdown-item>
                    <el-dropdown-item command="panMode">移动画布</el-dropdown-item>
                    <el-dropdown-item command="selectMode">选择题目</el-dropdown-item>
                    <el-dropdown-item divided command="addRegion">添加框选框</el-dropdown-item>
                    <el-dropdown-item command="modifyRegion">修改框选框</el-dropdown-item>
                    <el-dropdown-item command="editRegion">题目属性</el-dropdown-item>
                    <el-dropdown-item command="deleteRegion">删除框选</el-dropdown-item>
                    <el-dropdown-item divided command="zoomIn">放大试卷</el-dropdown-item>
                    <el-dropdown-item command="zoomOut">缩小试卷</el-dropdown-item>
                    <el-dropdown-item command="fitView">铺满视图</el-dropdown-item>
                    <el-dropdown-item command="resetView">恢复原始比例</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>

              <div class="zoom-indicator" v-if="regionEditorRef?.scale">
                {{ Math.round(regionEditorRef.scale * 100) }}%
              </div>
            </div>

            <div class="workspace-toolbar__right">
              <el-upload
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                accept=".pdf,.png,.jpg,.jpeg"
                :on-change="(file: any) => handleFileUpload(activeTab, file)"
              >
                <el-button size="small">重新上传</el-button>
              </el-upload>

              <el-button
                size="small"
                type="primary"
                :disabled="!canUseEditor"
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
              :key="`${activeTab}-${getFileUrl(activeTab)}`"
              :image-url="resolveFileUrl(getFileUrl(activeTab))"
              :regions="getRegions(activeTab)"
              :subject-name="subjectName"
              :hide-toolbar="true"
              @update:regions="(regions) => handleRegionsChange(activeTab, regions)"
              @save="(regions) => savePaperRegions(activeTab, regions)"
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
            {{ activeTab === 'template' ? '样板答题卡' : '原卷' }}未上传，请上传后编辑
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
            <div class="image-content">
              <PaperRegionEditor
                v-if="!isPdf(selectedStudent.answerSheetUrl)"
                :key="`${selectedStudent.studentNo}-${selectedStudent.answerSheetUrl}`"
                :image-url="resolveFileUrl(selectedStudent.answerSheetUrl)"
                :regions="paperConfig.templateRegions"
                :subject-name="subjectName"
                initial-tool="pan"
                :show-save="false"
                readonly
              >
                <template #toolbar-extra>
                  <el-upload
                    action="#"
                    :auto-upload="false"
                    :show-file-list="false"
                    accept=".pdf,.png,.jpg,.jpeg"
                    :on-change="(file: any) => handleStudentUpload(file)"
                  >
                    <el-tooltip content="重新上传当前考生原卷" placement="bottom">
                      <el-button size="small">重新上传</el-button>
                    </el-tooltip>
                  </el-upload>
                </template>
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
                  并继续沿用样板答题卡的框选结果。
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
  import {
    UploadFilled,
    Back,
    ArrowLeft,
    Search,
    Tools,
    ArrowDown,
    InfoFilled
  } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import PaperRegionEditor from './PaperRegionEditor.vue'
  import {
    fetchSavePaperLayout,
    fetchProjectScoreList,
    fetchUploadStudentAnswerSheet,
    fetchPaperConfig,
    fetchUploadPublicPaper,
    normalizePaperRegions,
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
  const regionEditorRef = ref<any>(null)

  // 搜索和分页
  const searchKeyword = ref('')
  const currentPage = ref(1)
  const pageSize = ref(20)
  const totalStudents = ref(0)

  const paperConfig = ref({
    templateUrl: null as string | null,
    originalUrl: null as string | null,
    templateRegions: [] as PaperRegionItem[],
    originalRegions: [] as PaperRegionItem[]
  })

  const showIntegratedToolbar = computed(() => activeTab.value !== 'student')
  const canUseEditor = computed(
    () =>
      showIntegratedToolbar.value && hasFile(activeTab.value) && !isPdf(getFileUrl(activeTab.value))
  )

  function handleToolboxCommand(command: string) {
    regionEditorRef.value?.handleToolboxCommand(command)
  }

  function handleSaveRegions() {
    regionEditorRef.value?.save()
  }

  const studentSplitLabel = computed(() =>
    paperConfig.value.templateRegions.length > 0 ? '已切分' : '未切分'
  )

  onMounted(() => {
    reloadCurrentView()
  })

  watch(
    () => [props.projectId, props.subjectName],
    () => {
      selectedStudent.value = null
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

  async function loadConfig() {
    try {
      const res = await fetchPaperConfig({
        projectId: props.projectId,
        subjectName: props.subjectName
      })
      paperConfig.value = {
        templateUrl: res.templateUrl || null,
        originalUrl: res.originalUrl || null,
        templateRegions: normalizePaperRegions(res.templateRegions),
        originalRegions: normalizePaperRegions(res.originalRegions)
      }
    } catch (e: any) {
      console.error(e)
      ElMessage.error(e.message || '获取试卷配置失败')
    }
  }

  async function loadStudents() {
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
    loadStudents()
  }

  function handleSizeChange(val: number) {
    pageSize.value = val
    currentPage.value = 1
    loadStudents()
  }

  function handleCurrentChange(val: number) {
    currentPage.value = val
    loadStudents()
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
    }
  }

  async function reloadCurrentView() {
    await Promise.all([loadConfig(), loadStudents()])
  }

  async function handleFileUpload(type: string, file: any) {
    if (!validatePaperFile(file.raw)) return
    loading.value = true
    try {
      await fetchUploadPublicPaper({
        projectId: props.projectId,
        subjectName: props.subjectName,
        type: type as 'template' | 'original',
        file: file.raw
      })
      ElMessage.success('上传成功')
      await loadConfig()
      emit('saved')
    } catch (e: any) {
      console.error(e)
      ElMessage.error(e.message || '上传试卷失败')
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
      await loadStudents()
      emit('saved')
    } catch (e: any) {
      console.error(e)
      ElMessage.error(e.message || '上传考生原卷失败')
    } finally {
      loading.value = false
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
