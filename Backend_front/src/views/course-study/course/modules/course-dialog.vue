<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑课程' : '新增课程'"
    width="800px"
    @close="handleClose"
  >
    <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="课程名称" prop="title">
            <el-input v-model="form.title" placeholder="请输入课程名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="课程类型" prop="type">
            <el-select v-model="form.type" placeholder="请选择课程类型" style="width: 100%">
              <el-option label="常规课程" value="general" />
              <el-option label="同步课程" value="sync" />
              <el-option label="家庭教育" value="family" />
              <el-option label="学霸说" value="talk" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="今日推荐" prop="isRecommend">
            <el-switch
              v-model="form.isRecommend"
              :active-value="1"
              :inactive-value="0"
              active-text="是"
              inactive-text="否"
            />
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
            <el-input-number v-model="form.price" :precision="2" :step="0.1" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="SVIP专享" prop="isSvipOnly">
            <el-switch v-model="form.isSvipOnly" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="作者/讲师" prop="author">
            <el-input v-model="form.author" placeholder="请输入作者或讲师名称" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="已学人数" prop="buyers">
            <el-input-number v-model="form.buyers" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="总节数" prop="episodes">
            <el-input-number v-model="form.episodes" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

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
import { ref, computed, shallowRef, onBeforeUnmount, watch } from 'vue'
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
  content: '',
  type: 'general',
  subject: '',
  grade: '',
  price: 0,
  isSvipOnly: false,
  status: 1,
  author: '',
  buyers: 0,
  episodes: 0
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
  // 确保在编辑器创建后加载数据，否则 content 可能无法正确显示
  if (props.visible && props.data) {
    form.value = { ...form.value, ...props.data }
    if (form.value.content) {
      editor.setHtml(form.value.content)
    }
  }
}

// 监听 visible 和 data 的变化，以便在编辑时更新表单
watch(() => [props.visible, props.data], ([visible, data]) => {
  if (visible && data) {
    form.value = { ...form.value, ...data }
    if (editorRef.value && data.content) {
      editorRef.value.setHtml(data.content)
    }
  } else if (!visible) {
    handleClose()
  }
}, { immediate: true })

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const handleClose = () => {
  form.value = {
    id: '',
    title: '',
    cover: '',
    videoUrl: '',
    content: '',
    type: 'general',
    subject: '',
    grade: '',
    price: 0,
    isSvipOnly: false,
    status: 1,
    author: '',
    buyers: 0,
    episodes: 0,
    isRecommend: 0
  }
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
