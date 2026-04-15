<template>
  <div class="page-container p-5">
    <div class="art-card p-6 rounded-xl bg-white shadow-sm">
      <div class="flex justify-between items-center mb-6">
        <div>
          <span class="font-bold text-lg text-g-800">微信群二维码配置</span>
          <p class="text-xs text-g-400 mt-1">小程序端将动态拉取已启用的二维码供用户扫码入群</p>
        </div>
        <el-button type="primary" @click="handleAdd">
          <template #icon><ArtSvgIcon icon="ri:add-line" /></template>
          新增微信群
        </el-button>
      </div>

      <el-table :data="configList" border v-loading="loading">
        <el-table-column prop="groupName" label="微信群名称" min-width="150" />
        <el-table-column label="二维码" width="120" align="center">
          <template #default="{ row }">
            <el-image
              :src="row.qrCodePath"
              class="w-12 h-12 rounded shadow-sm cursor-pointer"
              fit="cover"
              :preview-src-list="[row.qrCodePath]"
              preview-teleported
            />
          </template>
        </el-table-column>
        <el-table-column label="展示位置" width="150" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.displayLocation === 'HOME_BANNER'" type="warning">首页轮播图</el-tag>
            <el-tag v-else-if="row.displayLocation === 'HELP_SERVICE'" type="success">帮助与客服</el-tag>
            <el-tag v-else type="info">不展示</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="最后更新" width="180" align="center" />
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑微信群' : '新增微信群'"
      width="500px"
    >
      <el-form :model="form" label-width="80px" :rules="rules" ref="formRef">
        <el-form-item label="群名称" prop="groupName">
          <el-input v-model="form.groupName" placeholder="请输入微信群名称" />
        </el-form-item>

        <el-form-item label="展示位置" prop="displayLocation">
          <el-select v-model="form.displayLocation" placeholder="请选择展示位置" class="w-full">
            <el-option label="不展示" value="NONE" />
            <el-option label="首页轮播图" value="HOME_BANNER" />
            <el-option label="帮助与客服" value="HELP_SERVICE" />
          </el-select>
        </el-form-item>

        <el-form-item label="二维码" prop="qrCodePath">
          <div class="flex flex-col items-center w-full p-4 border-2 border-dashed border-g-200 rounded-lg bg-g-50">
            <el-image
              v-if="form.qrCodePath"
              :src="form.qrCodePath"
              class="w-32 h-32 rounded shadow-sm mb-3"
              fit="contain"
            />
            <el-upload
              class="upload-demo"
              action="/api/customer/wechat/upload"
              name="file"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleUploadSuccess"
              :before-upload="beforeUpload"
            >
              <el-button type="primary" plain size="small">
                <template #icon><ArtSvgIcon icon="ri:image-edit-line" /></template>
                {{ form.qrCodePath ? '更换二维码' : '上传二维码' }}
              </el-button>
            </el-upload>
            <p class="text-[10px] text-g-400 mt-2 text-center">建议 500x500px，支持 JPG、PNG</p>
          </div>
        </el-form-item>

        <el-form-item label="状态">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit" :loading="saving">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { fetchGetWechatConfigList, fetchAddWechatConfig, fetchUpdateWechatConfig, fetchDeleteWechatConfig } from '@/api/support-interaction/index'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'

defineOptions({ name: 'WechatConfig' })

const userStore = useUserStore()
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const configList = ref<any[]>([])

const form = ref({
  id: undefined,
  groupName: '',
  qrCodePath: '',
  displayLocation: 'NONE',
  status: 1
})

const rules = {
  groupName: [{ required: true, message: '请输入群名称', trigger: 'blur' }],
  qrCodePath: [{ required: true, message: '请上传二维码图片', trigger: 'change' }]
}

const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${userStore.accessToken}`
}))

const loadData = async () => {
  loading.value = true
  try {
    const res = await fetchGetWechatConfigList()
    if (res && Array.isArray(res)) {
      configList.value = res
    }
  } catch (error) {
    console.error(error)
  }
  loading.value = false
}

const handleAdd = () => {
  isEdit.value = false
  form.value = { id: undefined, groupName: '', qrCodePath: '', displayLocation: 'NONE', status: 1 }
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除微信群 "${row.groupName}" 吗?`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await fetchDeleteWechatConfig(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {}
  }).catch(() => {})
}

const beforeUpload = (file: any) => {
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('上传图片只能是 JPG 或 PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
  }
  return isImage && isLt2M
}

const handleUploadSuccess = (res: any) => {
  if (res.code === 200) {
    form.value.qrCodePath = res.data
    ElMessage.success('二维码上传成功')
  } else {
    ElMessage.error(res.msg || '上传失败')
  }
}

const submit = async () => {
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      saving.value = true
      try {
        const api = isEdit.value ? fetchUpdateWechatConfig : fetchAddWechatConfig
        await api(form.value)
        ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
        dialogVisible.value = false
        loadData()
      } catch (error) {}
      saving.value = false
    }
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page-container {
  background-color: #f8fafc;
}
</style>
