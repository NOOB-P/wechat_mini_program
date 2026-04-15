<template>
  <el-dialog
    :title="isEdit ? '管理章节视频' : '新增章节'"
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
      <el-form-item label="章节名称" prop="title">
        <el-input v-model="form.title" placeholder="请输入章节名称" />
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
  courseId: String
})

const emit = defineEmits(['update:visible', 'success'])

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

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
  sortOrder: 1
})

const rules = {
  title: [{ required: true, message: '请输入章节名称', trigger: 'blur' }]
}

watch(() => props.visible, (val) => {
  if (val) {
    if (props.isEdit && props.data) {
      form.value = { ...form.value, ...(props.data as any) }
    } else {
      resetForm()
      form.value.courseId = props.courseId || ''
    }
  }
})

const resetForm = () => {
  form.value = {
    id: '',
    courseId: '',
    title: '',
    sortOrder: 1
  }
  formRef.value?.resetFields()
}

const handleClosed = () => {
  resetForm()
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
.w-full {
  width: 100%;
}
</style>
