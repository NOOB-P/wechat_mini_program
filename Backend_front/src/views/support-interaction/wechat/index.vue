<template>
  <div class="page-container p-5 flex justify-center">
    <div class="art-card p-8 rounded-xl bg-white shadow-sm max-w-xl w-full">
      <div class="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <span class="font-bold text-xl text-g-800">微信群二维码配置</span>
          <p class="text-xs text-g-400 mt-2">小程序端将动态拉取此二维码供用户扫码入群</p>
        </div>
        <el-tag type="info" size="small">最后更新：{{ config.updateTime }}</el-tag>
      </div>

      <el-form :model="config" label-position="top">
        <el-form-item label="群名称">
          <el-input v-model="config.groupName" placeholder="请输入微信群名称" />
        </el-form-item>

        <el-form-item label="二维码图片">
          <div class="flex flex-col items-center p-6 border-2 border-dashed border-g-200 rounded-xl bg-g-50">
            <el-image
              v-if="config.qrCodeUrl"
              :src="config.qrCodeUrl"
              class="w-48 h-48 rounded shadow-md mb-4"
              fit="contain"
            />
            <el-upload
              class="upload-demo"
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleUpload"
            >
              <el-button type="primary" plain size="small">
                <template #icon><ArtSvgIcon icon="ri:image-edit-line" /></template>
                {{ config.qrCodeUrl ? '更换二维码' : '上传二维码' }}
              </el-button>
            </el-upload>
            <p class="text-xs text-g-400 mt-3">建议尺寸 500x500px，支持 JPG、PNG 格式</p>
          </div>
        </el-form-item>

        <div class="flex justify-center mt-10">
          <el-button type="primary" size="large" class="!px-12" @click="handleSave" :loading="saving">
            保存配置
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchGetWechatConfig, fetchUpdateWechatConfig } from '@/api/support-interaction/index'
import { ElMessage } from 'element-plus'

defineOptions({ name: 'WechatConfig' })

const saving = ref(false)
const config = ref({
  groupName: '',
  qrCodeUrl: '',
  updateTime: ''
})

const loadData = async () => {
  const res = await fetchGetWechatConfig()
  if (res.code === 200) {
    config.value = res.data
  }
}

const handleUpload = (file: any) => {
  // 模拟图片上传
  const reader = new FileReader()
  reader.readAsDataURL(file.raw)
  reader.onload = () => {
    config.value.qrCodeUrl = reader.result as string
    ElMessage.success('二维码预览已更新，请点击保存')
  }
}

const handleSave = async () => {
  saving.value = true
  const res = await fetchUpdateWechatConfig(config.value)
  if (res.code === 200) {
    ElMessage.success('保存配置成功')
    loadData()
  }
  saving.value = false
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page-container {
  min-height: calc(100vh - 120px);
  background-color: #f8fafc;
}
</style>
