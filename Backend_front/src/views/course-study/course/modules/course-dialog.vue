<template>
  <el-dialog
    :title="isEdit ? '编辑课程' : '新增课程'"
    v-model="dialogVisible"
    width="750px"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="course-form"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="课程名称" prop="title">
            <el-input v-model="form.title" placeholder="请输入课程名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="课程类型" prop="type">
            <el-select v-model="form.type" placeholder="请选择类型" class="w-full">
              <el-option label="常规课程" value="general" />
              <el-option label="学霸说" value="talk" />
              <el-option label="家庭教育" value="family" />
              <el-option label="同步/专题课" value="sync" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="今日推荐">
            <el-switch v-model="form.isRecommend" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="SVIP专享">
            <el-switch v-model="form.isSvipOnly" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="科目" prop="subject">
            <el-input v-model="form.subject" placeholder="如：数学、英语" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="年级" prop="grade">
            <el-input v-model="form.grade" placeholder="如：七年级、八年级" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="价格" prop="price">
            <el-input-number v-model="form.price" :min="0" :precision="2" class="w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="作者/讲师" prop="author">
            <el-input v-model="form.author" placeholder="请输入作者姓名" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="课程封面" prop="cover">
            <el-upload
              class="cover-uploader"
              action="/api/system/course/upload-cover"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleUploadSuccess"
              :before-upload="beforeUpload"
            >
              <img v-if="form.cover" :src="form.cover" class="cover-img" />
              <el-icon v-else class="uploader-icon"><Plus /></el-icon>
            </el-upload>
            <div class="text-xs text-gray-400 mt-1">建议尺寸 400x240，支持 jpg/png</div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="课程视频" prop="videoUrl">
            <el-upload
              class="video-uploader"
              action="/api/system/course/upload-video"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleVideoUploadSuccess"
              :on-error="handleVideoUploadError"
              :before-upload="beforeVideoUpload"
              v-loading="videoUploading"
            >
              <div v-if="form.videoUrl" class="video-preview">
                <el-icon class="text-green-500 mr-1"><VideoPlay /></el-icon>
                <span class="text-xs truncate max-w-[150px]">{{ form.videoUrl }}</span>
              </div>
              <el-button v-else type="primary" size="small">上传视频</el-button>
            </el-upload>
            <div class="text-xs text-gray-400 mt-1">文件大小建议不超过 500MB</div>
          </el-form-item>
          <el-form-item label="已学人数" prop="buyers">
            <el-input-number v-model="form.buyers" :min="0" />
          </el-form-item>
          <el-form-item label="总节数" prop="episodes">
            <el-input-number v-model="form.episodes" :min="0" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="课程内容" prop="content">
        <div style="border: 1px solid #ccc; width: 100%">
          <Toolbar
            style="border-bottom: 1px solid #ccc"
            :editor="editorRef"
            :defaultConfig="toolbarConfig"
            mode="default"
          />
          <Editor
            style="height: 300px; overflow-y: hidden;"
            v-model="form.content"
            :defaultConfig="editorConfig"
            mode="default"
            @onCreated="handleCreated"
          />
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, shallowRef, onBeforeUnmount, computed, nextTick } from 'vue'
import { Plus, VideoPlay } from '@element-plus/icons-vue'
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'

const props = defineProps({
  visible: Boolean,
  isEdit: Boolean,
  data: Object
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

const formRef = ref()
const editorRef = shallowRef()
const videoUploading = ref(false)

const buildDefaultForm = () => ({
  id: '',
  title: '',
  type: 'general',
  isRecommend: 0,
  subject: '',
  grade: '',
  price: 0,
  isSvipOnly: false,
  author: '',
  buyers: 0,
  studentCount: 0,
  episodes: 0,
  cover: '',
  videoUrl: '',
  content: ''
})

const form = ref(buildDefaultForm())

const rules = {
  title: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择课程类型', trigger: 'change' }],
  content: [{ required: true, message: '请输入课程内容', trigger: 'blur' }]
}

const toolbarConfig = {}
const editorConfig = { placeholder: '请输入课程详情内容...' }

const handleCreated = (editor: any) => {
  editorRef.value = editor
}
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const syncFromProps = async () => {
  if (!props.visible) return
  const merged = props.data ? { ...buildDefaultForm(), ...props.data } : buildDefaultForm()
  form.value = merged

  await nextTick()
  if (editorRef.value) {
    editorRef.value.setHtml(form.value.content || '')
  }
}

watch(() => props.visible, () => {
  syncFromProps()
})

watch(() => props.data, () => {
  syncFromProps()
})

const handleUploadSuccess = (res: any) => {
  if (res.code === 200) {
    form.value.cover = res.data
    ElMessage.success('封面上传成功')
  }
}

const handleVideoUploadSuccess = (res: any) => {
  videoUploading.value = false
  if (res.code === 200) {
    form.value.videoUrl = res.data
    formRef.value?.validateField('videoUrl')
    ElMessage.success('视频上传成功')
  } else {
    ElMessage.error(res.msg || '视频上传失败')
  }
}

const handleVideoUploadError = (err: any) => {
  videoUploading.value = false
  console.error('上传失败:', err)
  ElMessage.error('视频上传失败，可能是文件过大或网络问题')
}

const beforeUpload = (file: File) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    ElMessage.error('上传头像图片只能是 JPG 或 PNG 格式!')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!')
    return false
  }
  return true
}

const beforeVideoUpload = (file: File) => {
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
  videoUploading.value = true
  return isMp4 && isLt500M
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      emit('success', form.value)
      dialogVisible.value = false
    }
  })
}

const handleClosed = () => {
  form.value = buildDefaultForm()
  if (editorRef.value) {
    editorRef.value.setHtml('')
  }
  videoUploading.value = false
}
</script>

<style scoped>
.cover-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 200px;
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.cover-uploader:hover {
  border-color: #409eff;
}
.uploader-icon {
  font-size: 28px;
  color: #8c939d;
}
.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.video-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 200px;
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
