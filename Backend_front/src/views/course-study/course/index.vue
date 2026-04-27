<template>
  <div class="page-container">
    <div v-if="!showDetail && !showEpisodeManagement">
      <el-card shadow="never">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-bold">课程分类管理</span>
          </div>
        </template>
        <el-table :data="categoryData" border>
          <el-table-column prop="id" label="分类 ID" width="120" />
          <el-table-column prop="name" label="分类名称" min-width="150" />
          <el-table-column prop="count" label="课程数量" width="120" />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="enterCategory(row)">进入管理</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <div v-else-if="showDetail && !showEpisodeManagement">
      <el-card shadow="never">
        <template #header>
          <div class="flex items-center justify-between gap-4 flex-wrap">
            <div class="flex items-center">
              <el-button link @click="showDetail = false">
                <el-icon><ArrowLeft /></el-icon>
                返回分类
              </el-button>
              <span class="ml-4 font-bold">{{ currentCategory.name }} - 课程列表</span>
            </div>
            <div class="flex items-center gap-3 flex-wrap">
              <el-radio-group v-model="courseScope" size="small" @change="handleCourseScopeChange">
                <el-radio-button v-for="option in courseScopeOptions" :key="option.value" :label="option.value">
                  {{ option.label }}
                </el-radio-button>
              </el-radio-group>
              <el-button type="primary" @click="handleAdd">新增课程</el-button>
            </div>
          </div>
        </template>
        <el-table :data="tableData" border v-loading="loading">
          <el-table-column prop="title" label="课程名称" min-width="180" />
          <el-table-column prop="type" label="类型" width="120">
            <template #default="{ row }">
              <el-tag v-if="row.type === 'general'">常规</el-tag>
              <el-tag v-else-if="row.type === 'sync'" type="success">同步</el-tag>
              <el-tag v-else-if="row.type === 'family'" type="warning">家教</el-tag>
              <el-tag v-else-if="row.type === 'talk'" type="danger">学霸说</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="subject" label="科目" width="80" />
          <el-table-column prop="grade" label="年级" width="100" />
          <el-table-column prop="midasProductId" label="道具 ID" width="120" show-overflow-tooltip />
          <el-table-column prop="price" label="价格" width="100">
            <template #default="{ row }">
              <span class="price-text">￥{{ Number(row.price || 0).toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="isSvipOnly" label="SVIP" width="80">
            <template #default="{ row }">
              <el-tag :type="row.isSvipOnly ? 'danger' : 'info'" size="small">
                {{ row.isSvipOnly ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="封面" width="120">
            <template #default="{ row }">
              <el-image :src="row.coverPreview" class="w-20 h-12 rounded" fit="cover">
                <template #error>
                  <div class="empty-cover">暂无封面</div>
                </template>
              </el-image>
            </template>
          </el-table-column>
          <el-table-column prop="isRecommend" label="今日推荐" width="100">
            <template #default="{ row }">
              <el-tag :type="row.isRecommend === 1 ? 'success' : 'info'">
                {{ row.isRecommend === 1 ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'">
                {{ row.status === 1 ? '已上架' : '已下架' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180" />
          <el-table-column label="操作" width="280" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="enterCourseManagement(row)">进入管理</el-button>
              <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
              <el-button link :type="row.status === 1 ? 'warning' : 'success'" @click="handleStatus(row)">
                {{ row.status === 1 ? '下架' : '上架' }}
              </el-button>
              <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <div v-else-if="showEpisodeManagement && !showEpisodeVideoManagement">
      <el-card shadow="never">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <el-button link @click="showEpisodeManagement = false">
                <el-icon><ArrowLeft /></el-icon>
                返回课程列表
              </el-button>
              <span class="ml-4 font-bold">{{ currentCourse.title }} - 章节列表</span>
            </div>
            <el-button type="primary" @click="handleAddEpisode">新增章节</el-button>
          </div>
        </template>
        <el-table :data="episodeData" border v-loading="episodeLoading">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="title" label="章节名称" min-width="200" />
          <el-table-column prop="videoUrl" label="视频地址" min-width="250" show-overflow-tooltip>
            <template #default="{ row }">
              <el-tag v-if="row.videoUrl" type="success" size="small">已上传</el-tag>
              <el-tag v-else type="info" size="small">待上传</el-tag>
              <span class="ml-2 text-xs text-gray-400">{{ row.videoUrl }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="sortOrder" label="排序" width="80" />
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="enterEpisodeVideoManagement(row)">进入管理</el-button>
              <el-button link type="primary" @click="handleEditEpisode(row)">编辑</el-button>
              <el-button link type="danger" @click="handleDeleteEpisode(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <div v-else-if="showEpisodeVideoManagement">
      <el-card shadow="never">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <el-button link @click="showEpisodeVideoManagement = false">
                <el-icon><ArrowLeft /></el-icon>
                返回章节列表
              </el-button>
              <span class="ml-4 font-bold">章节管理 - {{ currentEpisode.title }}</span>
            </div>
            <el-button type="primary" @click="handleAddVideo">新增视频/集数</el-button>
          </div>
        </template>
        <el-table :data="combinedVideoData" border v-loading="videoLoading">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="title" label="视频名称" min-width="200" />
          <el-table-column prop="videoUrl" label="视频地址" min-width="300" show-overflow-tooltip>
            <template #default="{ row }">
              <div v-if="row.status === 'uploading' || row.status === 'saving'" class="flex w-full flex-col">
                <div class="mb-1 flex items-center justify-between">
                  <span class="text-xs text-blue-500">
                    {{ row.status === 'saving' ? '正在保存地址...' : '正在上传...' }}
                  </span>
                  <span class="text-xs font-bold text-blue-500">{{ row.progress }}%</span>
                </div>
                <el-progress :percentage="row.progress" :stroke-width="6" :show-text="false" striped striped-flow />
                <span class="mt-1 text-xs text-gray-500">{{ row.videoUrl }}</span>
              </div>
              <div v-else-if="row.status === 'error'" class="flex w-full flex-col">
                <span class="mb-1 text-xs text-red-500">上传失败</span>
                <span class="text-xs text-gray-500">{{ row.errorMessage || row.videoUrl }}</span>
              </div>
              <div v-else class="flex items-center">
                <el-icon class="mr-1 text-green-500"><VideoPlay /></el-icon>
                <span class="text-xs text-gray-500">{{ row.videoUrl }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="sortOrder" label="排序" width="80" />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <div v-if="row.status === 'uploading' || row.status === 'saving'">
                <el-button v-if="row.status === 'uploading'" link type="danger" @click="handleCancelUpload(row)">取消</el-button>
                <el-button v-else link disabled>保存中</el-button>
              </div>
              <div v-else-if="row.status === 'error'">
                <el-button link type="danger" @click="handleDismissUploadTask(row)">移除</el-button>
              </div>
              <div v-else>
                <el-button link type="primary" @click="handleEditVideo(row)">编辑</el-button>
                <el-button link type="danger" @click="handleDeleteVideo(row)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
    <CourseDialog v-model:visible="dialogVisible" :isEdit="isEdit" :data="editData" @success="handleSuccess" />
    <EpisodeDialog v-model:visible="episodeDialogVisible" :isEdit="isEpisodeEdit" :data="episodeEditData" :courseId="currentCourse?.id" @success="handleEpisodeSuccess" />
    <VideoDialog v-model:visible="videoDialogVisible" :isEdit="isVideoEdit" :data="videoEditData" :episodeId="currentEpisode?.id" @success="handleVideoSuccess" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, VideoPlay } from '@element-plus/icons-vue'
import {
  addCourse,
  addEpisode,
  addVideo,
  changeCourseStatus,
  deleteCourse,
  deleteEpisode,
  deleteVideo,
  getCourseList,
  getEpisodeList,
  getVideoList,
  updateCourse,
  updateEpisode,
  updateVideo,
  type CourseListParams
} from '@/api/course-study/course/index'
import { useUploadStore } from '@/store/modules/upload'
import { DEFAULT_COURSE_COVER, resolveUploadUrl } from '@/utils/upload-url'
import CourseDialog from './modules/course-dialog.vue'
import EpisodeDialog from './modules/episode-dialog.vue'
import VideoDialog from './modules/video-dialog.vue'
import { createCourseCategories, courseScopeOptions, type CourseCategory, type CourseScope } from './modules/course-config'

const uploadStore = useUploadStore()
const { uploadTasks } = storeToRefs(uploadStore)

const loading = ref(false)
const episodeLoading = ref(false)
const videoLoading = ref(false)
const dialogVisible = ref(false)
const episodeDialogVisible = ref(false)
const videoDialogVisible = ref(false)
const isEdit = ref(false)
const isEpisodeEdit = ref(false)
const isVideoEdit = ref(false)
const showDetail = ref(false)
const showEpisodeManagement = ref(false)
const showEpisodeVideoManagement = ref(false)
const tableData = ref<any[]>([])
const episodeData = ref<any[]>([])
const videoData = ref<any[]>([])
const editData = ref<Record<string, any>>({})
const episodeEditData = ref<Record<string, any> | undefined>(undefined)
const videoEditData = ref<Record<string, any> | undefined>(undefined)
const currentCourse = ref<Record<string, any>>({ id: '', title: '' })
const currentEpisode = ref<Record<string, any>>({ id: '', title: '', sortOrder: 0 })
const currentCategory = ref<CourseCategory>({ id: '', name: '', count: 0 })
const categoryData = ref(createCourseCategories())
const courseScope = ref<CourseScope>('all')
const queryParams = ref<CourseListParams>({ current: 1, size: 10, type: '' })
const combinedVideoData = computed(() => {
  const currentEpisodeTasks = uploadTasks.value.filter(task => task.episodeId === currentEpisode.value.id)
  return [...currentEpisodeTasks, ...videoData.value]
})
const normalizeCourseRow = (row: any) => ({
  ...row,
  coverPreview: resolveUploadUrl(row?.cover) || DEFAULT_COURSE_COVER
})

const buildListParams = (): CourseListParams => {
  const params: CourseListParams = { ...queryParams.value }
  if (courseScope.value === 'normal') {
    params.isSvipOnly = false
  } else if (courseScope.value === 'svip') {
    params.isSvipOnly = true
  } else {
    delete params.isSvipOnly
  }
  return params
}

const handleDismissUploadTask = (task: any) => uploadStore.removeTask(task.id)
const handleCancelUpload = (task: any) => uploadStore.cancelTask(task.id)

const enterCategory = (row: CourseCategory) => {
  currentCategory.value = { ...row }
  queryParams.value.type = row.id
  showDetail.value = true
  loadData()
}

const handleCourseScopeChange = () => {
  if (showDetail.value) {
    loadData()
  }
}
const enterCourseManagement = (row: any) => {
  currentCourse.value = row
  showEpisodeManagement.value = true
  loadEpisodes()
}
const enterEpisodeVideoManagement = (row: any) => {
  currentEpisode.value = { ...row }
  showEpisodeVideoManagement.value = true
  loadVideos()
}
const loadCategories = async () => {
  try {
    const data = await getCourseList({ current: 1, size: 1000 })
    const courses = Array.isArray(data) ? data : (data.list || [])
    categoryData.value = createCourseCategories().map(category => ({
      ...category,
      count: courses.filter((course: any) => course.type === category.id).length
    }))
  } catch (error) {
    console.error('加载课程分类统计失败:', error)
  }
}
const loadData = async () => {
  loading.value = true
  try {
    const data = await getCourseList(buildListParams())
    if (Array.isArray(data)) {
      tableData.value = data.map(normalizeCourseRow)
      return
    }
    tableData.value = Array.isArray(data?.list) ? data.list.map(normalizeCourseRow) : []
  } catch (error) {
    console.error('加载课程数据失败:', error)
  } finally {
    loading.value = false
  }
}
const loadEpisodes = async () => {
  episodeLoading.value = true
  try {
    const res = await getEpisodeList(currentCourse.value.id)
    episodeData.value = res || []
  } catch (error) {
    console.error('加载章节失败:', error)
  } finally {
    episodeLoading.value = false
  }
}
const loadVideos = async () => {
  videoLoading.value = true
  try {
    const res = await getVideoList(currentEpisode.value.id)
    videoData.value = res || []
  } catch (error) {
    console.error('加载视频失败:', error)
  } finally {
    videoLoading.value = false
  }
}
const handleAdd = () => {
  isEdit.value = false
  editData.value = {
    type: currentCategory.value.id || 'general',
    price: 0,
    isSvipOnly: courseScope.value === 'svip',
    status: 1
  }
  dialogVisible.value = true
}
const handleEdit = (row: any) => {
  isEdit.value = true
  editData.value = row
  dialogVisible.value = true
}
const handleSuccess = async (formData: any) => {
  try {
    if (isEdit.value) {
      await updateCourse(formData)
    } else {
      await addCourse(formData)
    }
    ElMessage.success(isEdit.value ? '更新成功' : '新增成功')
    loadData()
    loadCategories()
  } catch (error) {}
}
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该课程吗?', '提示', { type: 'warning' }).then(async () => {
    try {
      await deleteCourse(row.id)
      ElMessage.success('删除成功')
      loadData()
      loadCategories()
    } catch (error) {}
  })
}
const handleStatus = async (row: any) => {
  const status = row.status === 1 ? 0 : 1
  try {
    await changeCourseStatus(row.id, status)
    ElMessage.success(status === 1 ? '上架成功' : '下架成功')
    loadData()
    loadCategories()
  } catch (error) {}
}
const handleAddEpisode = () => {
  isEpisodeEdit.value = false
  const maxSort = episodeData.value.reduce((max, item) => Math.max(max, item.sortOrder || 0), 0)
  episodeEditData.value = {
    courseId: currentCourse.value.id,
    sortOrder: maxSort + 1,
    title: ''
  }
  episodeDialogVisible.value = true
}
const handleEditEpisode = (row: any) => {
  isEpisodeEdit.value = true
  episodeEditData.value = { ...row }
  episodeDialogVisible.value = true
}
const handleEpisodeSuccess = async (formData: any) => {
  try {
    if (isEpisodeEdit.value) {
      await updateEpisode(formData)
    } else {
      await addEpisode(formData)
    }
    ElMessage.success(isEpisodeEdit.value ? '更新成功' : '新增成功')
    loadEpisodes()
  } catch (error) {}
}
const handleDeleteEpisode = (row: any) => {
  ElMessageBox.confirm('确定要删除该章节吗?', '提示', { type: 'warning' }).then(async () => {
    try {
      await deleteEpisode(row.id)
      ElMessage.success('删除成功')
      loadEpisodes()
    } catch (error) {}
  })
}
const handleAddVideo = () => {
  isVideoEdit.value = false
  const maxSort = videoData.value.reduce((max, item) => Math.max(max, item.sortOrder || 0), 0)
  videoEditData.value = {
    episodeId: currentEpisode.value.id,
    sortOrder: maxSort + 1,
    title: '',
    videoUrl: ''
  }
  videoDialogVisible.value = true
}
const handleEditVideo = (row: any) => {
  isVideoEdit.value = true
  videoEditData.value = { ...row }
  videoDialogVisible.value = true
}
const handleVideoSuccess = async (formData: any, file?: File) => {
  try {
    if (!file) {
      if (isVideoEdit.value) {
        await updateVideo(formData)
      } else {
        await addVideo(formData)
      }
      ElMessage.success(isVideoEdit.value ? '更新成功' : '新增成功')
      loadVideos()
      return
    }

    uploadStore.addTask(formData, file, isVideoEdit.value).then(success => {
      if (success) {
        loadVideos()
      }
    })
  } catch (error) {}
}
const handleDeleteVideo = (row: any) => {
  ElMessageBox.confirm('确定要删除该视频吗?', '提示', { type: 'warning' }).then(async () => {
    try {
      await deleteVideo(row.id)
      ElMessage.success('删除成功')
      loadVideos()
    } catch (error) {}
  })
}
onMounted(() => {
  loadCategories()
})
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;
}

.price-text {
  color: #f56c6c;
  font-weight: 700;
}

.empty-cover {
  display: flex;
  height: 3rem;
  width: 5rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  background: #f3f4f6;
  color: #9ca3af;
  font-size: 12px;
}
</style>
