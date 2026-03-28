<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑课程' : '新增课程'"
    width="800px"
    @close="handleClose"
  >
    <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
      <el-form-item label="课程名称" prop="title">
        <el-input v-model="form.title" placeholder="请输入课程名称" />
      </el-form-item>
      <el-form-item label="视频链接" prop="videoUrl">
        <el-input v-model="form.videoUrl" placeholder="请输入视频链接" />
      </el-form-item>
      <el-form-item label="课程封面">
        <el-input v-model="form.cover" placeholder="请输入封面图片地址" />
      </el-form-item>
      <el-form-item label="课程内容" prop="content">
        <div style="border: 1px solid #ccc; width: 100%">
          <Toolbar
            style="border-bottom: 1px solid #ccc"
            :editor="editorRef"
            :defaultConfig="toolbarConfig"
            mode="default"
          />
          <Editor
            style="height: 300px; overflow-y: hidden"
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
      <el-button type="primary" @click="submit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, shallowRef, onBeforeUnmount } from 'vue'
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { ElMessage } from 'element-plus'

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

const formRef = ref()
const form = ref({
  id: '',
  title: '',
  cover: '',
  videoUrl: '',
  content: ''
})

const rules = {
  title: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  content: [{ required: true, message: '请输入课程内容', trigger: 'blur' }]
}

// 富文本编辑器配置
const editorRef = shallowRef()
const toolbarConfig = {}
const editorConfig = { placeholder: '请输入内容...' }

const handleCreated = (editor: any) => {
  editorRef.value = editor
  if (props.isEdit && props.data) {
    form.value = { ...props.data }
  }
}

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const handleClose = () => {
  form.value = { id: '', title: '', cover: '', videoUrl: '', content: '' }
  if (editorRef.value) {
    editorRef.value.setHtml('')
  }
}

const submit = async () => {
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      emit('success', form.value)
      dialogVisible.value = false
    }
  })
}
</script>
