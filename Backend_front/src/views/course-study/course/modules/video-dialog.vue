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
            :auto-upload="false"
            :on-change="handleFileChange"
            accept=".mp4"
          >
            <!-- 已选择待上传或已存在视频预览 -->
            <div v-if="selectedFile || form.videoUrl" class="video-preview-box">
              <div class="video-info">
                <el-icon class="video-icon"><VideoPlay /></el-icon>
                <span class="video-name" :title="selectedFile ? selectedFile.name : form.videoUrl">
                  {{ selectedFile ? selectedFile.name : getVideoName(form.videoUrl) }}
                </span>
                <el-tag v-if="selectedFile" size="small" type="warning" class="ml-2">待上传</el-tag>
              </div>
              <el-button type="primary" link size="small">更换视频</el-button>
            </div>

            <!-- 初始上传占位 -->
            <div v-else class="upload-placeholder">
              <el-icon class="upload-icon"><Plus /></el-icon>
              <span>点击选择视频文件</span>
              <span class="upload-tip">支持 MP4，选择后点击确定开始上传</span>
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
import { uploadCourseVideoByOss } from '@/utils/course-video-oss'

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
const selectedFile = ref<File | null>(null)

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
  videoUrl: [{ 
    validator: (_rule: any, _value: any, callback: any) => {
      if (!form.value.videoUrl && !selectedFile.value) {
        callback(new Error('请上传视频'))
      } else {
        callback()
      }
    }, 
    trigger: 'change' 
  }]
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
  selectedFile.value = null
  formRef.value?.resetFields()
}

const handleClosed = () => {
  resetForm()
}

const handleFileChange = (uploadFile: any) => {
  const file = uploadFile.raw as File
  const isMp4 = file.type === 'video/mp4' || file.name.toLowerCase().endsWith('.mp4')
  if (!isMp4) {
    ElMessage.error('仅支持 MP4 格式')
    return false
  }
  selectedFile.value = file
  formRef.value?.validateField('videoUrl')
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      emit('success', { ...form.value }, selectedFile.value)
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
  padding: 16px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;

  .video-info {
    display: flex;
    align-items: center;
    flex: 1;
    overflow: hidden;

    .video-icon {
      font-size: 24px;
      color: var(--el-color-primary);
      margin-right: 12px;
    }

    .video-name {
      font-size: 14px;
      color: #606266;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.w-full {
  width: 100%;
}
</style>
