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
import { ref, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  isEdit: Boolean,
  data: Object,
  courseId: String
})

const emit = defineEmits(['update:visible', 'success'])

const visible = ref(false)
const formRef = ref(null)

const form = ref({
  id: '',
  courseId: '',
  title: '',
  sortOrder: 1
})

const rules = {
  title: [{ required: true, message: '请输入章节名称', trigger: 'blur' }]
}

watch(() => props.visible, (val) => {
  visible.value = val
  if (val) {
    if (props.isEdit && props.data) {
      form.value = { ...props.data }
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
    sortOrder: 1
  }
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

const handleClosed = () => {
  resetForm()
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
.w-full {
  width: 100%;
}
</style>
