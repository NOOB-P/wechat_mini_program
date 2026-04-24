<template>
  <div class="page-container p-5">
    <div class="art-card rounded-xl bg-white p-6 shadow-sm">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <span class="text-lg font-bold text-g-800">企业微信客服配置</span>
          <p class="mt-1 text-xs text-g-400">
            小程序根据展示位置读取配置并打开原生客服会话。
          </p>
        </div>
        <el-button type="primary" @click="handleAdd">
          <template #icon><ArtSvgIcon icon="ri:add-line" /></template>
          添加配置
        </el-button>
      </div>

      <el-table :data="configList" border v-loading="loading">
        <el-table-column prop="groupName" label="名称" min-width="160" />
        <el-table-column prop="corpId" label="企业 ID" min-width="180" />
        <el-table-column label="客服链接" min-width="260">
          <template #default="{ row }">
            <el-link :href="row.customerServiceUrl" target="_blank" type="primary" class="link-cell">
              {{ row.customerServiceUrl }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="展示位置" width="150" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.displayLocation === 'HOME_BANNER'" type="warning">首页横幅</el-tag>
            <el-tag v-else-if="row.displayLocation === 'HELP_SERVICE'" type="success">帮助中心</el-tag>
            <el-tag v-else-if="row.displayLocation === 'STUDY_ROOM'" type="primary">自习室客服</el-tag>
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
        <el-table-column prop="updateTime" label="更新时间" width="180" align="center" />
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑配置' : '添加配置'" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="130px">
        <el-form-item label="名称" prop="groupName">
          <el-input v-model="form.groupName" placeholder="请输入配置名称" />
        </el-form-item>

        <el-form-item label="企业 ID" prop="corpId">
          <el-input v-model="form.corpId" placeholder="请输入企业 ID" />
        </el-form-item>

        <el-form-item label="客服链接" prop="customerServiceUrl">
          <el-input
            v-model="form.customerServiceUrl"
            placeholder="请输入客服链接"
            type="textarea"
            :rows="3"
          />
        </el-form-item>

        <el-form-item label="展示位置" prop="displayLocation">
          <el-select v-model="form.displayLocation" placeholder="请选择展示位置" class="w-full">
            <el-option label="自习室客服" value="STUDY_ROOM" />
            <el-option label="首页横幅" value="HOME_BANNER" />
            <el-option label="帮助中心" value="HELP_SERVICE" />
          </el-select>
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
        <el-button type="primary" :loading="saving" @click="submit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  fetchAddWechatConfig,
  fetchDeleteWechatConfig,
  fetchGetWechatConfigList,
  fetchUpdateWechatConfig
} from '@/api/support-interaction/index'

defineOptions({ name: 'WechatConfig' })

interface WechatConfigForm {
  id?: number
  groupName: string
  corpId: string
  customerServiceUrl: string
  displayLocation: 'NONE' | 'HOME_BANNER' | 'HELP_SERVICE' | 'STUDY_ROOM'
  status: 0 | 1
}

const createDefaultForm = (): WechatConfigForm => ({
  id: undefined,
  groupName: '',
  corpId: '',
  customerServiceUrl: '',
  displayLocation: 'STUDY_ROOM',
  status: 1
})

const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const configList = ref<WechatConfigForm[]>([])
const form = ref<WechatConfigForm>(createDefaultForm())

const rules: FormRules<WechatConfigForm> = {
  groupName: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  corpId: [{ required: true, message: '请输入企业 ID', trigger: 'blur' }],
  customerServiceUrl: [{ required: true, message: '请输入客服链接', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await fetchGetWechatConfigList()
    configList.value = Array.isArray(res) ? res : []
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  form.value = createDefaultForm()
  dialogVisible.value = true
}

const handleEdit = (row: WechatConfigForm) => {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row: WechatConfigForm) => {
  ElMessageBox.confirm(`确定删除配置 "${row.groupName}" 吗？`, '确认', {
    type: 'warning'
  })
    .then(async () => {
      await fetchDeleteWechatConfig(row.id as number)
      ElMessage.success('已删除')
      loadData()
    })
    .catch(() => {})
}

const submit = async () => {
  if (!formRef.value) return

  await formRef.value.validate()
  saving.value = true
  try {
    const api = isEdit.value ? fetchUpdateWechatConfig : fetchAddWechatConfig
    await api(form.value)
    ElMessage.success(isEdit.value ? '已更新' : '已创建')
    dialogVisible.value = false
    loadData()
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page-container {
  background-color: #f8fafc;
}

.link-cell {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
