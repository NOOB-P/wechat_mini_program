<template>
  <el-dialog
    :title="isEdit ? '管理章节视频' : '新增章节'"
    v-model="visible"
    width="500px"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="章节名称" prop="title">
        <el-input v-model="form.title" placeholder="请输入章节名称" />
      </el-form-item>
      <el-form-item v-if="isEdit" label="课程视频" prop="videoUrl">
        <el-upload
          class="video-uploader"
          action="/api/system/course/upload-video"
          :headers="uploadHeaders"
          :show-file-list="false"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :before-upload="beforeUpload"
          v-loading="uploading"
        >
          <div v-if="form.videoUrl" class="video-preview">
            <el-icon class="text-green-500 mr-1"><VideoPlay /></el-icon>
            <span class="text-xs truncate max-w-[150px]">{{ form.videoUrl }}</span>
          </div>
          <el-button v-else type="primary" size="small">上传视频</el-button>
        </el-upload>
        <div class="text-xs text-gray-400 mt-1">支持 mp4 格式，文件大小建议不超过 500MB</div>
      </el-form-item>
      <el-form-item label="排序" prop="sortOrder">
        <el-input-number v-model="form.sortOrder" :min="1" class="w-full" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { VideoPlay } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'

const props = defineProps({
  visible: Boolean,
  isEdit: Boolean,
  data: Object,
  courseId: String
})

const emit = defineEmits(['update:visible', 'success'])

const userStore = useUserStore()
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${userStore.accessToken}`
}))

const visible = ref(false)
const formRef = ref<FormInstance>()
const uploading = ref(false)

interface EpisodeForm {
  id: string
  courseId: string
  title: string
  videoUrl: string
  sortOrder: number
}

const form = ref<EpisodeForm>({
  id: '',
  courseId: '',
  title: '',
  videoUrl: '',
  sortOrder: 0
})

const rules = {
  title: [{ required: true, message: '请输入章节名称', trigger: 'blur' }],
  videoUrl: [{ 
    validator: (rule: any, value: any, callback: any) => {
      if (props.isEdit && !value) {
        callback(new Error('请上传课程视频'))
      } else {
        callback()
      }
    }, 
    trigger: 'change' 
  }]
}

watch(() => props.visible, (val) => {
  visible.value = val
  if (val) {
    if (props.isEdit && props.data) {
      form.value = { ...form.value, ...(props.data as any) }
    } else {
      resetForm()
      form.value.courseId = props.courseId || ''
    }
  }
})

watch(visible, (val) => {
  emit('update:visible', val)
})

const resetForm = () => {
  form.value = {
    id: '',
    courseId: '',
    title: '',
    videoUrl: '',
    sortOrder: 0
  }
  formRef.value?.resetFields()
}

const handleClosed = () => {
  resetForm()
}

const handleUploadSuccess = (res: any) => {
  uploading.value = false
  if (res.code === 200) {
    form.value.videoUrl = res.data
    formRef.value?.validateField('videoUrl')
    ElMessage.success('视频上传成功')
  } else {
    ElMessage.error(res.msg || '视频上传失败')
  }
}

const handleUploadError = (err: any) => {
  uploading.value = false
  console.error('上传失败:', err)
  ElMessage.error('视频上传失败，可能是文件过大或网络问题')
}

const beforeUpload = (file: File) => {
  const isMp4 = file.type === 'video/mp4'
  if (!isMp4) {
    ElMessage.error('上传视频只能是 MP4 格式!')
    return false
  }
  const isLt500M = file.size / 1024 / 1024 < 500
  if (!isLt500M) {
    ElMessage.error('上传视频大小不能超过 500MB!')
    return false
  }
  uploading.value = true
  return isMp4 && isLt500M
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      emit('success', { ...form.value })
      visible.value = false
    }
  })
}
</script>

<style scoped>
.video-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 250px;
  min-height: 32px;
  display: flex;
  align-items: center;
  padding: 0 10px;
}
.video-uploader:hover {
  border-color: #409eff;
}
.video-preview {
  display: flex;
  align-items: center;
  color: #606266;
}
.w-full {
  width: 100%;
}
</style>
