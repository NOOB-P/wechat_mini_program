<template>
  <el-dialog
    :title="isEdit ? '编辑视频' : '新增视频'"
    v-model="dialogVisible"
    width="500px"
    align-center
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="视频名称" prop="title">
        <el-input v-model="form.title" placeholder="请输入视频名称" />
      </el-form-item>
      
      <el-form-item label="视频文件" prop="videoUrl">
        <div class="upload-container">
          <el-upload
            class="video-uploader-trigger"
            :show-file-list="false"
            :http-request="handleVideoUploadRequest"
            :before-upload="beforeUpload"
            v-loading="uploading"
          >
            <div v-if="form.videoUrl" class="video-preview-box">
              <div class="video-info">
                <el-icon class="video-icon"><VideoPlay /></el-icon>
                <span class="video-name" :title="form.videoUrl">{{ getVideoName(form.videoUrl) }}</span>
              </div>
              <el-button type="primary" link size="small">更换视频</el-button>
            </div>
            <div v-else class="upload-placeholder">
              <el-icon class="upload-icon"><Plus /></el-icon>
              <span>点击上传视频文件</span>
              <span class="upload-tip">支持 MP4 格式</span>
            </div>
          </el-upload>
        </div>
      </el-form-item>

      <el-form-item label="排序" prop="sortOrder">
        <el-input-number v-model="form.sortOrder" :min="1" class="w-full" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { FormInstance, UploadRequestOptions } from 'element-plus'
import { ElMessage } from 'element-plus'
import { VideoPlay, Plus } from '@element-plus/icons-vue'
import { uploadCourseVideo } from '@/api/course-study/course'

const props = defineProps({
  visible: Boolean,
  isEdit: Boolean,
  data: Object,
  episodeId: String
})

const emit = defineEmits(['update:visible', 'success'])

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 获取视频文件名
const getVideoName = (url: string) => {
  if (!url) return ''
  const parts = url.split('/')
  return parts[parts.length - 1]
}

const formRef = ref<FormInstance>()
const uploading = ref(false)

interface VideoForm {
  id: string
  episodeId: string
  title: string
  videoUrl: string
  sortOrder: number
}

const form = ref<VideoForm>({
  id: '',
  episodeId: '',
  title: '',
  videoUrl: '',
  sortOrder: 1
})

const rules = {
  title: [{ required: true, message: '请输入视频名称', trigger: 'blur' }],
  videoUrl: [{ required: true, message: '请上传视频', trigger: 'change' }]
}

watch(() => props.visible, (val) => {
  if (val) {
    if (props.isEdit && props.data) {
      form.value = { ...form.value, ...(props.data as any) }
    } else {
      resetForm()
      form.value.episodeId = props.episodeId || ''
    }
  }
})

const resetForm = () => {
  form.value = {
    id: '',
    episodeId: props.episodeId || '',
    title: '',
    videoUrl: '',
    sortOrder: 1
  }
  formRef.value?.resetFields()
}

const handleClosed = () => {
  resetForm()
}

const beforeUpload = (file: File) => {
  const isMp4 = file.type === 'video/mp4'
  if (!isMp4) {
    ElMessage.error('仅支持 MP4 格式')
    return false
  }
  uploading.value = true
  return true
}

const handleVideoUploadRequest = async (options: UploadRequestOptions) => {
  try {
    const file = options.file as File
    const videoUrl = await uploadCourseVideo(file)
    options.onProgress?.({ percent: 100 } as any)
    form.value.videoUrl = videoUrl
    ElMessage.success('视频上传成功')
    options.onSuccess?.({ url: videoUrl } as any)
  } catch (error: any) {
    ElMessage.error(error.message || '上传失败')
    options.onError?.(error)
  } finally {
    uploading.value = false
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      emit('success', { ...form.value })
      dialogVisible.value = false
    }
  })
}
</script>

<style scoped lang="scss">
.upload-container {
  width: 100%;
}

.video-uploader-trigger {
  width: 100%;
  
  :deep(.el-upload) {
    width: 100%;
    display: block;
  }
}

.upload-placeholder {
  width: 100%;
  height: 120px;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  background-color: #fafafa;
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
  }

  .upload-icon {
    font-size: 28px;
    margin-bottom: 8px;
  }

  span {
    font-size: 14px;
  }

  .upload-tip {
    font-size: 12px;
    margin-top: 4px;
    color: #c0c4cc;
  }
}

.video-preview-box {
  width: 100%;
  height: 60px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background-color: #fff;
  transition: all 0.3s;

  &:hover {
    border-color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
  }

  .video-info {
    display: flex;
    align-items: center;
    overflow: hidden;
    flex: 1;
    margin-right: 12px;
  }

  .video-icon {
    font-size: 20px;
    color: #67c23a;
    margin-right: 8px;
  }

  .video-name {
    font-size: 13px;
    color: #606266;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.w-full {
  width: 100%;
}
</style>
