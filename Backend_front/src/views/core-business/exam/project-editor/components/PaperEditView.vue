<template>
  <div class="paper-edit-view">
    <!-- 顶部页签与操作栏 -->
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
          <div class="tab-item desc">说明</div>
        </div>
      </div>
      <div class="header-right">
        <span class="subject-name">{{ subjectName }}</span>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="view-body" v-loading="loading">
      <!-- 样板答题卡/原卷展示 -->
      <template v-if="activeTab === 'template' || activeTab === 'original'">
        <div v-if="hasFile(activeTab)" class="file-viewer">
          <div class="viewer-actions">
            <el-upload
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              accept=".pdf,.png,.jpg,.jpeg"
              :on-change="(file: any) => handleFileUpload(activeTab, file)"
            >
              <el-button type="primary" size="small">重新上传</el-button>
            </el-upload>
          </div>
          <div class="image-content">
            <img
              v-if="!isPdf(getFileUrl(activeTab))"
              :src="resolveFileUrl(getFileUrl(activeTab))"
              alt="试卷内容"
            />
            <iframe v-else :src="resolveFileUrl(getFileUrl(activeTab))" class="pdf-iframe"></iframe>
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

      <!-- 考生列表 -->
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
                <span class="text-secondary">未切分</span>
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

        <!-- 考生单人原卷展示 -->
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
            <div class="viewer-actions">
              <el-upload
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                accept=".pdf,.png,.jpg,.jpeg"
                :on-change="(file: any) => handleStudentUpload(file)"
              >
                <el-button type="primary" size="small">重新上传</el-button>
              </el-upload>
            </div>
            <div class="image-content">
              <img
                v-if="!isPdf(selectedStudent.answerSheetUrl)"
                :src="resolveFileUrl(selectedStudent.answerSheetUrl)"
                alt="考生原卷"
              />
              <iframe
                v-else
                :src="resolveFileUrl(selectedStudent.answerSheetUrl)"
                class="pdf-iframe"
              ></iframe>
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
  import { ref, onMounted, watch } from 'vue'
  import { UploadFilled, Back, ArrowLeft, Search } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import {
    fetchProjectScoreList,
    fetchUploadStudentAnswerSheet,
    fetchPaperConfig,
    fetchUploadPublicPaper
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

  // 搜索和分页
  const searchKeyword = ref('')
  const currentPage = ref(1)
  const pageSize = ref(20)
  const totalStudents = ref(0)

  const paperConfig = ref({
    templateUrl: null as string | null,
    originalUrl: null as string | null
  })

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
      paperConfig.value = res
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

  function enterStudentPaper(student: any) {
    selectedStudent.value = student
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
    padding: 0 20px;
    border-bottom: 1px solid #f0f0f0;
    background: #fff;
    height: 64px;
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
      margin-left: 20px;
      color: #909399;
      cursor: default;
      &:hover {
        color: #909399;
      }
    }
  }

  .subject-name {
    font-size: 14px;
    color: #409eff;
    font-weight: 600;
    background: rgba(64, 158, 255, 0.1);
    padding: 6px 16px;
    border-radius: 4px;
  }

  .view-body {
    flex: 1;
    overflow: hidden;
    padding: 0;
    background-color: #f5f7fa;
  }

  .file-viewer {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 24px;

    .viewer-actions {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 16px;
    }

    .image-content {
      flex: 1;
      overflow-y: auto;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      background: #fff;
      display: flex;
      justify-content: center;
      padding: 32px;

      img {
        max-width: 100%;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      }

      .pdf-iframe {
        width: 100%;
        height: 100%;
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

    .viewer-header {
      padding: 16px 24px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      align-items: center;
      gap: 24px;
      background: #fff;

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
</style>
