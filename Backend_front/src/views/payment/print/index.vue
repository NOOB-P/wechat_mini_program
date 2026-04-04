<template>
  <div class="print-config-container p-5">
    <div class="page-header mb-5 flex justify-between items-center bg-white p-5 rounded-lg shadow-sm">
      <div class="left">
        <h2 class="text-xl font-bold text-gray-800">打印价格设置</h2>
        <p class="text-sm text-gray-500 mt-1">配置错题、试卷打印的纸张单价及配送费用，支持按纸张规格和颜色差异化定价</p>
      </div>
      <el-button type="primary" icon="Refresh" @click="getList">刷新配置</el-button>
    </div>

    <el-row :gutter="20">
      <!-- 纸张价格配置 -->
      <el-col :span="18">
        <el-card class="mb-5 shadow-sm">
          <template #header>
            <div class="card-header flex justify-between items-center">
              <span class="font-bold flex items-center">
                <el-icon class="mr-2 text-blue-500"><Document /></el-icon> 纸张单价配置
              </span>
              <el-button type="primary" link @click="handleUpdatePaper">保存修改</el-button>
            </div>
          </template>
          <el-table :data="config.paperPrices" border stripe style="width: 100%">
            <el-table-column prop="type" label="纸张规格" width="100" align="center">
              <template #default="scope">
                <el-tag size="small">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="side" label="单/双面" width="100" align="center" />
            <el-table-column prop="color" label="颜色" width="100" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.color === '彩色' ? 'danger' : 'info'" size="small">
                  {{ scope.row.color }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="单价(元/张)" align="center">
              <template #default="scope">
                <el-input-number 
                  v-model="scope.row.price" 
                  :precision="2" 
                  :step="0.05" 
                  :min="0"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column label="起印数量" align="center" width="120">
              <template #default="scope">
                <el-input-number 
                  v-model="scope.row.minQuantity" 
                  :min="1"
                  size="small"
                  style="width: 90px"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <el-card class="shadow-sm">
          <template #header>
            <div class="card-header flex justify-between items-center">
              <span class="font-bold flex items-center">
                <el-icon class="mr-2 text-orange-500"><Van /></el-icon> 配送费用配置
              </span>
              <div class="actions">
                <el-button type="success" link :icon="Plus" @click="handleAddDelivery">添加配送方式</el-button>
                <el-button type="primary" link @click="handleUpdateDelivery" style="margin-left: 10px;">保存修改</el-button>
              </div>
            </div>
          </template>
          <el-table :data="config.deliveryConfigs" border stripe style="width: 100%">
            <el-table-column prop="name" label="配送方式" width="150" align="center">
              <template #default="scope">
                <el-input v-model="scope.row.name" size="small" placeholder="如：标准快递" />
              </template>
            </el-table-column>
            <el-table-column label="基础运费(元)" width="150" align="center">
              <template #default="scope">
                <el-input-number 
                  v-model="scope.row.price" 
                  :precision="2" 
                  :step="1" 
                  :min="0"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column label="免运费额度(元)" width="150" align="center">
              <template #default="scope">
                <el-input-number 
                  v-model="scope.row.freeLimit" 
                  :precision="2" 
                  :step="10" 
                  :min="0"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述说明" :show-overflow-tooltip="true">
              <template #default="scope">
                <el-input v-model="scope.row.description" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center">
              <template #default="scope">
                <el-button 
                  type="danger" 
                  link 
                  :icon="Delete" 
                  @click="handleDeleteDelivery(scope.$index, scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 侧边辅助说明 -->
      <el-col :span="6">
        <el-card class="shadow-sm info-card">
          <template #header>
            <span class="font-bold flex items-center">
              <el-icon class="mr-2 text-info"><InfoFilled /></el-icon> 定价与运营建议
            </span>
          </template>
          <div class="tip-content">
            <p class="mb-3 text-gray-600 leading-6">
              <el-tag size="small" type="success" class="mr-1">纸张</el-tag> 
              通常黑白打印单价较低（0.1-0.3元），彩色打印成本较高（1-2元）。
            </p>
            <p class="mb-3 text-gray-600 leading-6">
              <el-tag size="small" type="warning" class="mr-1">配送</el-tag> 
              配送费可根据学校合作快递的实际成本设置。
            </p>
            <p class="text-gray-600 leading-6">
              <el-tag size="small" type="danger" class="mr-1">免邮</el-tag> 
              合理设置免邮额度可有效提高客单价，建议设置在 30-50 元左右。
            </p>
          </div>
        </el-card>

        <div class="mt-5 p-4 bg-blue-50 rounded-lg border border-blue-100 text-blue-700 text-sm">
          <div class="font-bold mb-2 flex items-center">
            <el-icon class="mr-1"><QuestionFilled /></el-icon> 常见问题
          </div>
          <p>修改配置后，小程序端下单将实时生效。建议在修改大额运费前发布公告通知用户。</p>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
  import { fetchPrintConfig, updatePaperPrices, updateDeliveryConfig, deleteDeliveryConfig } from '@/api/payment/print'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Document, Van, Plus, Delete, InfoFilled, QuestionFilled } from '@element-plus/icons-vue'

  const loading = ref(false)
  const config = reactive({
    paperPrices: [],
    deliveryConfigs: []
  })

  const getList = async () => {
    loading.value = true
    try {
      const data = await fetchPrintConfig()
      Object.assign(config, data)
    } finally {
      loading.value = false
    }
  }

  const handleUpdatePaper = async () => {
    try {
      loading.value = true
      await updatePaperPrices(config.paperPrices)
      ElMessage.success('纸张价格配置已更新')
      getList()
    } finally {
      loading.value = false
    }
  }

  const handleAddDelivery = () => {
    config.deliveryConfigs.push({
      name: '',
      price: 0,
      freeLimit: 0,
      description: ''
    })
  }

  const handleDeleteDelivery = async (index: number, row: any) => {
    if (!row.id) {
      config.deliveryConfigs.splice(index, 1)
      return
    }
    
    try {
      await ElMessageBox.confirm(
        '确认删除该配送方式吗？',
        '提示',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      
      loading.value = true
      await deleteDeliveryConfig(row.id)
      ElMessage.success('配送方式已删除')
      getList()
    } catch (e) {
      // 用户取消删除
    } finally {
      loading.value = false
    }
  }

  const handleUpdateDelivery = async () => {
    try {
      // 简单校验
      if (config.deliveryConfigs.some(d => !d.name)) {
        return ElMessage.warning('请输入配送方式名称')
      }
      
      loading.value = true
      await updateDeliveryConfig(config.deliveryConfigs)
      ElMessage.success('配送费用配置已更新')
      getList()
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    getList()
  })
</script>

<style scoped lang="scss">
  .print-config-container {
    .el-card {
      :deep(.el-card__header) {
        padding: 15px 20px;
        background-color: #f8f9fa;
      }
    }
  }
</style>
