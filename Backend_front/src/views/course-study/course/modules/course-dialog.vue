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
          <el-form-item label="道具ID" prop="midasProductId">
            <el-input v-model="form.midasProductId" placeholder="请输入米大师道具ID" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="作者/讲师" prop="author">
            <el-input v-model="form.author" placeholder="请输入作者姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="已学人数" prop="buyers">
            <el-input-number v-model="form.buyers" :min="0" class="w-full" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="课程封面" prop="cover">
            <ImgCutter
              ref="coverCutterRef"
              class="cover-cutter"
              :isModal="true"
              :tool="true"
              :boxWidth="860"
              :boxHeight="520"
              :cutWidth="400"
              :cutHeight="240"
              :sizeChange="false"
              :moveAble="true"
              :imgMove="true"
              :scaleAble="true"
              fileType="jpeg"
              :quality="0.92"
              @cutDown="handleCoverCutDown"
            >
              <template #choose>
                <div class="cover-uploader" v-loading="coverUploading">
                  <img
                    v-if="form.cover || localCoverPreview || coverPreviewFallback"
                    :src="coverPreviewUrl"
                    class="cover-img"
                    @error="handleCoverPreviewError"
                  />
                  <div v-else class="cover-empty">
                    <el-icon class="uploader-icon"><Plus /></el-icon>
                    <span class="cover-empty-text">点击上传并裁剪</span>
                  </div>
                  <div class="cover-overlay">重新选择</div>
                </div>
              </template>
            </ImgCutter>
            <div class="text-xs text-gray-400 mt-1">建议尺寸 400x240，支持 jpg/png，选图后可裁剪</div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="总节数" prop="episodes">
            <el-input-number v-model="form.episodes" :min="0" class="w-full" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="课程内容" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="10"
          placeholder="请输入课程详情内容..."
        />
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
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ImgCutter from 'vue-img-cutter'
import { uploadCourseCover } from '@/api/course-study/course'
import { DEFAULT_COURSE_COVER, resolveUploadUrl } from '@/utils/upload-url'
import { uploadCourseVideo } from '@/api/course-study/course'

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

const uploadHeaders = computed(() => ({}))

const formRef = ref()
const coverCutterRef = ref()
const coverPreviewFallback = ref(false)
const localCoverPreview = ref('')
const coverUploading = ref(false)

type CutterResult = {
  file?: File
  blob?: Blob
  dataURL?: string
  fileName?: string
}

type CourseForm = {
  id: string
  title: string
  type: string
  isRecommend: number
  subject: string
  grade: string
  price: number
  isSvipOnly: boolean
  author: string
  buyers: number
  studentCount: number
  episodes: number
  midasProductId: string
  cover: string
  content: string
}

const buildDefaultForm = (): CourseForm => ({
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
  midasProductId: '',
  cover: '',
  content: ''
})

const buildFormFromData = (data?: Record<string, any>): CourseForm => {
  const defaultForm = buildDefaultForm()
  if (!data) {
    return defaultForm
  }

  return {
    id: data.id ?? defaultForm.id,
    title: data.title ?? defaultForm.title,
    type: data.type ?? defaultForm.type,
    isRecommend: data.isRecommend ?? defaultForm.isRecommend,
    subject: data.subject ?? defaultForm.subject,
    grade: data.grade ?? defaultForm.grade,
    price: data.price ?? defaultForm.price,
    isSvipOnly: data.isSvipOnly ?? defaultForm.isSvipOnly,
    author: data.author ?? defaultForm.author,
    buyers: data.buyers ?? defaultForm.buyers,
    studentCount: data.studentCount ?? defaultForm.studentCount,
    episodes: data.episodes ?? defaultForm.episodes,
    midasProductId: data.midasProductId ?? defaultForm.midasProductId,
    cover: data.cover ?? defaultForm.cover,
    content: data.content ?? defaultForm.content
  }
}

const form = ref<CourseForm>(buildDefaultForm())

const rules = {
  title: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择课程类型', trigger: 'change' }],
  content: [{ required: true, message: '请输入课程内容', trigger: 'blur' }]
}

const syncFromProps = async () => {
  if (!props.visible) return
  form.value = buildFormFromData(props.data as Record<string, any> | undefined)
  coverPreviewFallback.value = false
  localCoverPreview.value = ''
}

watch(() => props.visible, () => {
  syncFromProps()
})

watch(() => props.data, () => {
  syncFromProps()
})

const coverPreviewUrl = computed(() => {
  if (coverPreviewFallback.value) {
    return DEFAULT_COURSE_COVER
  }
  if (localCoverPreview.value) {
    return localCoverPreview.value
  }
  return resolveUploadUrl(form.value.cover) || DEFAULT_COURSE_COVER
})

const handleCoverPreviewError = () => {
  coverPreviewFallback.value = true
}

const isAllowedCoverFile = (file?: File | Blob | null) => {
  if (!file) return false
  const fileType = file.type || ''
  return ['image/jpeg', 'image/png', 'image/jpg'].includes(fileType)
}

const buildUploadFile = (result: CutterResult) => {
  if (result.file && isAllowedCoverFile(result.file)) {
    return result.file
  }
  if (result.blob && isAllowedCoverFile(result.blob)) {
    const fileName = result.fileName || `course-cover-${Date.now()}.jpg`
    return new File([result.blob], fileName, { type: result.blob.type || 'image/jpeg' })
  }
  return null
}

const handleCoverCutDown = async (result: CutterResult) => {
  const uploadFile = buildUploadFile(result)
  if (!uploadFile) {
    ElMessage.error('裁剪结果无效，请重新选择 JPG/PNG 图片')
    return
  }

  const isLt2M = uploadFile.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('裁剪后的图片大小不能超过 2MB')
    return
  }

  try {
    coverUploading.value = true
    localCoverPreview.value = result.dataURL || ''
    const url = await uploadCourseCover(uploadFile)
    form.value.cover = url
    coverPreviewFallback.value = false
    localCoverPreview.value = ''
    ElMessage.success('封面上传成功')
  } catch (error) {
    ElMessage.error((error as any)?.message || '封面上传失败')
  } finally {
    coverUploading.value = false
  }
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
  coverPreviewFallback.value = false
  localCoverPreview.value = ''
  coverUploading.value = false
}
</script>

<style scoped>
.cover-cutter {
  display: inline-block;
}
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
  background: #fafafa;
}
.cover-uploader:hover .cover-overlay {
  opacity: 1;
}
.cover-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #8c939d;
}
.cover-empty-text {
  font-size: 12px;
}
.uploader-icon {
  font-size: 28px;
  color: #8c939d;
}
.cover-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  font-size: 13px;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.w-full {
  width: 100%;
}
</style>
