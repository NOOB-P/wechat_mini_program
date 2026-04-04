<template>
  <el-dialog
    v-model="dialogVisible"
    title="上传考试数据"
    width="500px"
  >
    <el-form :model="form" label-width="100px">
      <el-form-item label="考试名称">
        <el-input v-model="form.name" placeholder="请输入考试名称" />
      </el-form-item>
      
      <el-form-item label="考试原卷">
        <el-upload
          class="upload-demo"
          drag
          action="#"
          :auto-upload="false"
          :limit="1"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">将文件拖到此处，或 <em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">支持 PDF / 压缩包 格式</div>
          </template>
        </el-upload>
      </el-form-item>

      <el-form-item label="得分 Excel">
        <el-upload
          class="upload-demo"
          drag
          action="#"
          :auto-upload="false"
          :limit="1"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">将文件拖到此处，或 <em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">仅支持 Excel 表格</div>
          </template>
        </el-upload>
      </el-form-item>

      <el-form-item label="错题包">
        <el-upload
          class="upload-demo"
          drag
          action="#"
          :auto-upload="false"
          :limit="1"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">将文件拖到此处，或 <em>点击上传</em></div>
        </el-upload>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUpload">开始解析</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { fetchUploadExamFiles } from '@/api/core-business/exam/upload-panel'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible', 'success'])

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const form = ref({
  name: ''
})

const submitUpload = async () => {
  if (!form.value.name) {
    ElMessage.warning('请输入考试名称')
    return
  }
  const res = await fetchUploadExamFiles(form.value)
  if (res.code === 200) {
    ElMessage.success('上传成功，已加入解析队列')
    dialogVisible.value = false
    emit('success')
  }
}
</script>

<style scoped>
.upload-demo {
  width: 100%;
}
</style>
