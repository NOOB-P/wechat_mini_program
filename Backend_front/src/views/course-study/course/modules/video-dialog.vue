<template>
  <el-dialog
    :title="isEdit ? '编辑视频' : '新增视频'"
    v-model="dialogVisible"
    width="500px"
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
        <el-upload
          class="video-uploader"
          action="/api/system/course/upload-video"
          :headers="uploadHeaders"
          :show-file-list="false"
          :on-success="handleUploadSuccess"
          :before-upload="beforeUpload"
          v-loading="uploading"
        >
          <div v-if="form.videoUrl" class="video-preview">
            <el-icon class="text-green-500 mr-1"><VideoPlay /></el-icon>
            <span class="text-xs truncate max-w-[150px]">{{ form.videoUrl }}</span>
          </div>
          <el-button v-else type="primary" size="small">上传视频</el-button>
        </el-upload>
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
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { VideoPlay } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'

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

const userStore = useUserStore()
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${userStore.accessToken}`
}))

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

const handleUploadSuccess = (res: any) => {
  uploading.value = false
  if (res.code === 200) {
    form.value.videoUrl = res.data
    ElMessage.success('视频上传成功')
  } else {
    ElMessage.error(res.msg || '上传失败')
  }
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
