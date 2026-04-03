<template>
  <el-dialog
    :title="`价格设置 - ${packageData?.title}`"
    v-model="visible"
    width="600px"
    @close="handleClose"
  >
    <el-table :data="localPrices" border style="width: 100%">
      <el-table-column prop="pkgName" label="套餐名称" width="150" align="center" />
      <el-table-column label="现价(元)" align="center">
        <template #default="scope">
          <el-input-number
            v-model="scope.row.currentPrice"
            :precision="2"
            :step="10"
            :min="0"
            style="width: 120px"
          />
        </template>
      </el-table-column>
      <el-table-column label="原价(元)" align="center">
        <template #default="scope">
          <el-input-number
            v-model="scope.row.originalPrice"
            :precision="2"
            :step="10"
            :min="0"
            style="width: 120px"
          />
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit"> 保存设置 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { updatePackagePrice } from '@/api/payment/vip'
  import { ElMessage } from 'element-plus'

  const props = defineProps<{
    modelValue: boolean
    packageData: any
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])

  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const loading = ref(false)
  const localPrices = ref<any[]>([])

  watch(
    () => props.packageData,
    (val) => {
      if (val && val.pricings) {
        localPrices.value = JSON.parse(JSON.stringify(val.pricings))
      }
    },
    { immediate: true }
  )

  const handleClose = () => {
    visible.value = false
  }

  const handleSubmit = async () => {
    loading.value = true
    try {
      // 遍历更新每一个套餐价格
      for (const item of localPrices.value) {
        // 确保字段名正确
        await updatePackagePrice(item)
      }
      ElMessage.success('价格更新成功')
      emit('success')
      visible.value = false
    } catch (error) {
      console.error('Failed to update prices:', error)
      ElMessage.error('价格更新失败，请检查网络')
    } finally {
      loading.value = false
    }
  }
</script>
