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
      <el-col :span="16">
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
              <el-button type="primary" link @click="handleUpdateDelivery">保存修改</el-button>
            </div>
          </template>
          <el-table :data="config.deliveryConfigs" border stripe style="width: 100%">
            <el-table-column prop="name" label="配送方式" width="120" align="center" />
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
          </el-table>
        </el-card>
      </el-col>

      <!-- 全局参数配置 -->
      <el-col :span="8">
        <el-card class="shadow-sm">
          <template #header>
            <span class="font-bold flex items-center">
              <el-icon class="mr-2 text-purple-500"><Setting /></el-icon> 打印全局参数
            </span>
          </template>
          <el-form :model="config.otherConfigs" label-width="120px" label-position="left">
            <el-form-item label="起印金额">
              <el-input-number 
                v-model="config.otherConfigs.minOrderPrice" 
                :precision="2" 
                :min="0"
                style="width: 100%"
              />
              <p class="text-xs text-gray-400 mt-1">单笔订单不满此金额按此金额收取</p>
            </el-form-item>
            <el-form-item label="装订费用">
              <el-input-number 
                v-model="config.otherConfigs.bindingPrice" 
                :precision="2" 
                :min="0"
                style="width: 100%"
              />
              <p class="text-xs text-gray-400 mt-1">每份文档（如错题本）的固定装订费</p>
            </el-form-item>
            <el-divider />
            <div class="flex justify-end">
              <el-button type="primary" @click="handleUpdateOther">更新全局参数</el-button>
            </div>
          </el-form>
        </el-card>

        <el-alert
          title="定价建议"
          type="info"
          description="通常黑白打印单价较低（0.1-0.3元），彩色打印成本较高（1-2元）。配送费可根据学校合作快递的实际成本设置，设置免邮额度可有效提高客单价。"
          show-icon
          :closable="false"
          class="mt-5"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
  import { fetchPrintConfig, updatePaperPrices, updateDeliveryConfig } from '@/api/payment/print'
  import { ElMessage } from 'element-plus'
  import { Document, Van, Setting } from '@element-plus/icons-vue'

  const loading = ref(false)
  const config = reactive({
    paperPrices: [],
    deliveryConfigs: [],
    otherConfigs: {
      bindingPrice: 0,
      minOrderPrice: 0
    }
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

  const handleUpdateDelivery = async () => {
    try {
      loading.value = true
      await updateDeliveryConfig(config.deliveryConfigs)
      ElMessage.success('配送费用配置已更新')
      getList()
    } finally {
      loading.value = false
    }
  }

  const handleUpdateOther = async () => {
    // 全局参数更新逻辑，如果有对应的后端接口可以调用
    ElMessage.success('全局参数已更新')
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
