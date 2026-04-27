<template>
  <div class="page-container">
    <!-- 第一层：分类管理 -->
    <div v-if="!showDetail && !showEpisodeManagement">
      <el-card shadow="never">
        <template #header>
          <div class="flex justify-between items-center">
            <span class="font-bold">SVIP 课程分类管理</span>
          </div>
        </template>

        <el-table :data="categoryData" border>
          <el-table-column prop="id" label="分类ID" width="120" />
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

    <!-- 第二层：具体课程管理 -->
    <div v-else-if="showDetail && !showEpisodeManagement">
      <el-card shadow="never">
        <template #header>
          <div class="flex justify-between items-center">
            <div class="flex items-center">
              <el-button link @click="showDetail = false">
                <el-icon><ArrowLeft /></el-icon> 返回分类
              </el-button>
              <span class="ml-4 font-bold">{{ currentCategory.name }} (SVIP) - 课程列表</span>
            </div>
            <el-button type="primary" @click="handleAdd">新增课程</el-button>
          </div>
        </template>

        <el-table :data="tableData" border v-loading="loading">
          <el-table-column prop="title" label="课程名称" min-width="180" />
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.type === 'general'">常规</el-tag>
              <el-tag v-else-if="row.type === 'sync'" type="success">同步</el-tag>
              <el-tag v-else-if="row.type === 'family'" type="warning">家教</el-tag>
              <el-tag v-else-if="row.type === 'talk'" type="danger">学霸说</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="subject" label="科目" width="80" />
          <el-table-column prop="grade" label="年级" width="100" />
          <el-table-column prop="midasProductId" label="道具ID" width="120" show-overflow-tooltip />
          <el-table-column prop="price" label="价格" width="100">
            <template #default="{ row }">
              <span style="color: #f56c6c; font-weight: bold">￥{{ row.price?.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="封面" width="120">
            <template #default="{ row }">
              <el-image :src="row.cover" class="w-20 h-12 rounded" fit="cover" />
            </template>
          </el-table-column>
          <el-table-column prop="isRecommend" label="今日推荐" width="100">
            <template #default="{ row }">
              <el-tag :type="row.isRecommend === 1 ? 'success' : 'info'">
                {{ row.isRecommend === 1 ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
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
              <el-button 
                link 
                :type="row.status === 1 ? 'warning' : 'success'" 
                @click="handleStatus(row)"
              >
                {{ row.status === 1 ? '下架' : '上架' }}
              </el-button>
              <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 第三层：具体课程章节/集数管理 -->
    <div v-else-if="showEpisodeManagement && !showEpisodeVideoManagement">
      <el-card shadow="never">
        <template #header>
          <div class="flex justify-between items-center">
            <div class="flex items-center">
              <el-button link @click="showEpisodeManagement = false">
                <el-icon><ArrowLeft /></el-icon> 返回课程列表
              </el-button>
              <span class="ml-4 font-bold">{{ currentCourse.title }} - 章节列表</span>
            </div>
            <div class="flex items-center">
              <el-button type="primary" @click="handleAddEpisode">新增章节</el-button>
            </div>
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
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="enterEpisodeVideoManagement(row)">进入管理</el-button>
              <el-button link type="danger" @click="handleDeleteEpisode(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 第四层：章节视频详情管理 -->
    <div v-else-if="showEpisodeVideoManagement">
      <el-card shadow="never">
        <template #header>
          <div class="flex justify-between items-center">
            <div class="flex items-center">
              <el-button link @click="showEpisodeVideoManagement = false">
                <el-icon><ArrowLeft /></el-icon> 返回章节列表
              </el-button>
              <span class="ml-4 font-bold">章节管理 - {{ currentEpisode.title }}</span>
            </div>
            <el-button type="primary" @click="handleAddVideo">新增视频/集数</el-button>
          </div>
        </template>

        <div class="mb-6 bg-gray-50 p-4 rounded border">
          <el-form :model="currentEpisode" inline>
            <el-form-item label="章节名称">
              <el-input v-model="currentEpisode.title" />
            </el-form-item>
            <el-form-item label="章节排序">
              <el-input-number v-model="currentEpisode.sortOrder" :min="0" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleEpisodeVideoSuccess">保存章节信息</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-table :data="combinedVideoData" border v-loading="videoLoading">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="title" label="视频名称" min-width="200" />
          <el-table-column prop="videoUrl" label="视频地址" min-width="300" show-overflow-tooltip>
            <template #default="{ row }">
              <div v-if="row.status === 'uploading' || row.status === 'saving'" class="flex flex-col w-full">
                <div class="flex justify-between items-center mb-1">
                  <span class="text-xs text-blue-500">{{ row.status === 'saving' ? '正在保存地址...' : '正在上传...' }}</span>
                  <span class="text-xs font-bold text-blue-500">{{ row.progress }}%</span>
                </div>
                <el-progress
                  :percentage="row.progress"
                  :stroke-width="6"
                  :show-text="false"
                  striped
                  striped-flow
                />
                <span class="mt-1 text-xs text-gray-500">{{ row.videoUrl }}</span>
              </div>
              <div v-else-if="row.status === 'error'" class="flex flex-col w-full">
                <span class="text-xs text-red-500 mb-1">上传失败</span>
                <span class="text-xs text-gray-500">{{ row.errorMessage || row.videoUrl }}</span>
              </div>
              <div v-else class="flex items-center">
                <el-icon class="text-green-500 mr-1"><VideoPlay /></el-icon>
                <span class="text-xs text-gray-500">{{ row.videoUrl }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="sortOrder" label="排序" width="80" />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <div v-if="row.status === 'uploading' || row.status === 'saving'">
                <el-button link disabled>{{ row.status === 'saving' ? '保存中' : '上传中' }}</el-button>
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

    <CourseDialog 
      v-model:visible="dialogVisible" 
      :isEdit="isEdit" 
      :data="editData" 
      @success="handleSuccess"
    />

    <EpisodeDialog
      v-model:visible="episodeDialogVisible"
      :isEdit="isEpisodeEdit"
      :data="episodeEditData"
      :courseId="currentCourse?.id"
      @success="handleEpisodeSuccess"
    />

    <VideoDialog
      v-model:visible="videoDialogVisible"
      :isEdit="isVideoEdit"
      :data="videoEditData"
      :episodeId="currentEpisode?.id"
      @success="handleVideoSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { 
  fetchGetSvipCourseList, 
  fetchDeleteSvipCourse, 
  fetchChangeSvipCourseStatus, 
  fetchSaveSvipCourse,
  fetchGetEpisodeList,
  fetchAddEpisode,
  fetchUpdateEpisode,
  fetchDeleteEpisode,
  fetchGetVideoList,
  fetchAddVideo,
  fetchUpdateVideo,
  fetchDeleteVideo
} from '@/api/course-study/svip-course/index'
import { ElMessage, ElMessageBox } from 'element-plus'
import CourseDialog from '../course/modules/course-dialog.vue'
import EpisodeDialog from '../course/modules/episode-dialog.vue'
import VideoDialog from '../course/modules/video-dialog.vue'
import { ArrowLeft, VideoPlay } from '@element-plus/icons-vue'
import { uploadCourseVideoByOss } from '@/utils/course-video-oss'

const loading = ref(false)
const tableData = ref<any[]>([])
const queryParams = ref({
  current: 1,
  size: 10,
  type: '',
  isSvipOnly: true
})
const dialogVisible = ref(false)
const isEdit = ref(false)
const editData = ref<Record<string, any>>({})

// 新增分类管理相关
const showDetail = ref(false)
const currentCategory = ref<{ id: string; name: string; count: number }>({ id: '', name: '', count: 0 })
const categoryData = ref([
  { id: 'general', name: '常规课程', count: 0 },
  { id: 'talk', name: '学霸说', count: 0 },
  { id: 'family', name: '家庭教育', count: 0 },
  { id: 'sync', name: '同步/专题课', count: 0 }
])

// 新增章节管理相关
const showEpisodeManagement = ref(false)
const showEpisodeVideoManagement = ref(false)
const episodeLoading = ref(false)
const currentCourse = ref<Record<string, any>>({ id: '', title: '' })
const currentEpisode = ref<Record<string, any>>({ id: '', title: '', sortOrder: 0 })
const episodeData = ref<any[]>([])
const episodeDialogVisible = ref(false)
const isEpisodeEdit = ref(false)
const episodeEditData = ref<Record<string, any> | undefined>(undefined)

const videoLoading = ref(false)
const videoData = ref<any[]>([])
const videoDialogVisible = ref(false)
const isVideoEdit = ref(false)
const videoEditData = ref<Record<string, any> | undefined>(undefined)

interface UploadTask {
  id: string | number
  episodeId: string
  title: string
  sortOrder: number
  progress: number
  status: 'uploading' | 'saving' | 'error'
  videoUrl: string
  errorMessage?: string
}

const uploadTasks = ref<UploadTask[]>([])

const combinedVideoData = computed(() => {
  const currentEpisodeTasks = uploadTasks.value.filter(t => t.episodeId === currentEpisode.value.id)
  return [...currentEpisodeTasks, ...videoData.value]
})

const handleDismissUploadTask = (task: UploadTask) => {
  uploadTasks.value = uploadTasks.value.filter(t => t.id !== task.id)
}

const enterEpisodeVideoManagement = (row: any) => {
  currentEpisode.value = { ...row }
  showEpisodeVideoManagement.value = true
  loadVideos()
}

const loadVideos = async () => {
  videoLoading.value = true
  try {
    const res = await fetchGetVideoList(currentEpisode.value.id)
    videoData.value = res || []
  } catch (error) {
    console.error('加载视频失败:', error)
  } finally {
    videoLoading.value = false
  }
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
        await fetchUpdateVideo(formData)
      } else {
        await fetchAddVideo(formData)
      }
      ElMessage.success(isVideoEdit.value ? '更新成功' : '新增成功')
      loadVideos()
      return
    }

    const taskId = `upload-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
    uploadTasks.value.unshift({
      id: taskId,
      episodeId: formData.episodeId,
      title: formData.title,
      sortOrder: formData.sortOrder,
      progress: 1,
      status: 'uploading',
      videoUrl: '正在初始化上传...'
    })

    try {
      const videoUrl = await uploadCourseVideoByOss(file, (percent, message) => {
        const targetTask = uploadTasks.value.find(t => t.id === taskId)
        if (!targetTask) {
          return
        }
        targetTask.progress = percent
        targetTask.videoUrl = message || '正在上传...'
      })

      const targetTask = uploadTasks.value.find(t => t.id === taskId)
      if (targetTask) {
        targetTask.progress = 100
        targetTask.status = 'saving'
        targetTask.videoUrl = videoUrl
      }

      if (isVideoEdit.value) {
        await fetchUpdateVideo({ ...formData, videoUrl })
      } else {
        await fetchAddVideo({ ...formData, videoUrl })
      }

      uploadTasks.value = uploadTasks.value.filter(t => t.id !== taskId)
      ElMessage.success(`视频《${formData.title}》上传成功`)
      loadVideos()
    } catch (error: any) {
      const targetTask = uploadTasks.value.find(t => t.id === taskId)
      if (targetTask) {
        targetTask.status = 'error'
        targetTask.errorMessage = error?.message || '上传失败'
        targetTask.videoUrl = '上传失败，请重试'
      }
      ElMessage.error(`视频《${formData.title}》上传失败`)
    }
  } catch (error) {
    // 拦截器处理
  }
}

const handleDeleteVideo = (row: any) => {
  ElMessageBox.confirm('确定要删除该视频吗?', '提示', { type: 'warning' }).then(async () => {
    try {
      await fetchDeleteVideo(row.id)
      ElMessage.success('删除成功')
      loadVideos()
    } catch (error) {
      // 拦截器处理
    }
  })
}

const handleEpisodeVideoSuccess = async () => {
  try {
    await fetchUpdateEpisode(currentEpisode.value)
    ElMessage.success('章节信息保存成功')
    loadEpisodes()
  } catch (error) {
    // 拦截器处理
  }
}

const loadCategories = async () => {
  try {
    const data = await fetchGetSvipCourseList({ current: 1, size: 1000 })
    const courses = Array.isArray(data) ? data : (data.list || [])
    
    // 统计各分类数量
    categoryData.value.forEach(cat => {
      cat.count = courses.filter(c => c.type === cat.id).length
    })
  } catch (error) {
    console.error('加载分类统计失败:', error)
  }
}

const enterCategory = (row: any) => {
  currentCategory.value = row
  queryParams.value.type = row.id
  showDetail.value = true
  loadData()
}

const enterCourseManagement = (row: any) => {
  currentCourse.value = row
  showEpisodeManagement.value = true
  loadEpisodes()
}

const loadEpisodes = async () => {
  episodeLoading.value = true
  try {
    const res = await fetchGetEpisodeList(currentCourse.value.id)
    episodeData.value = res || []
  } catch (error) {
    console.error('加载章节失败:', error)
  } finally {
    episodeLoading.value = false
  }
}

const handleImportSuccess = () => {
  ElMessage.success('批量导入成功')
  loadEpisodes()
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
      await fetchUpdateEpisode(formData)
    } else {
      await fetchAddEpisode(formData)
    }
    ElMessage.success(isEpisodeEdit.value ? '更新成功' : '新增成功')
    loadEpisodes()
  } catch (error) {
    // 错误已由请求拦截器处理
  }
}

const handleDeleteEpisode = (row: any) => {
  ElMessageBox.confirm('确定要删除该章节吗?', '提示', { type: 'warning' }).then(async () => {
    try {
      await fetchDeleteEpisode(row.id)
      ElMessage.success('删除成功')
      loadEpisodes()
    } catch (error) {
      // 拦截器已处理
    }
  })
}

const loadData = async () => {
  loading.value = true
  try {
    const data = await fetchGetSvipCourseList(queryParams.value)
    if (data) {
      if (Array.isArray(data)) {
        tableData.value = data
      } else if (Array.isArray(data.list)) {
        tableData.value = data.list
      }
    }
  } catch (error) {
    console.error('加载 SVIP 课程数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  editData.value = {
    type: currentCategory.value?.id || 'general',
    isSvipOnly: true,
    price: 0,
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
    await fetchSaveSvipCourse(formData)
    ElMessage.success(isEdit.value ? '更新成功' : '新增成功')
    loadData()
    loadCategories()
  } catch (error) {
    // 错误已由请求拦截器处理
  }
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该 SVIP 课程吗?', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await fetchDeleteSvipCourse(row.id)
      ElMessage.success('删除成功')
      loadData()
      loadCategories()
    } catch (error) {
      // 拦截器已处理
    }
  })
}

const handleStatus = async (row: any) => {
  const newStatus = row.status === 1 ? 0 : 1
  try {
    await fetchChangeSvipCourseStatus(row.id, newStatus)
    ElMessage.success('操作成功')
    loadData()
  } catch (error) {
    // 拦截器已处理
  }
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.page-container {
  padding: 0;
}

.video-uploader-large {
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 400px;
  background-color: #fafafa;
  transition: border-color 0.3s;
}

.video-uploader-large:hover {
  border-color: #409eff;
}

.video-info-box, .upload-placeholder {
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.upload-placeholder {
  color: #8c939d;
}

.video-info-box {
  background-color: #f0f9eb;
}

.w-20 {
  width: 5rem;
}
.h-12 {
  height: 3rem;
}
</style>
