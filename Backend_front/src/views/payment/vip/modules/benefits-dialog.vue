<template>
  <el-dialog
    :title="`编辑权益 - ${packageData?.title}`"
    v-model="visible"
    width="500px"
    @close="handleClose"
  >
    <div class="benefits-edit">
      <div v-for="(benefit, index) in localBenefits" :key="index" class="flex items-center mb-3">
        <el-input v-model="localBenefits[index]" placeholder="请输入权益描述" class="flex-1" />
        <el-button
          type="danger"
          icon="Delete"
          circle
          link
          class="ml-2"
          @click="removeBenefit(index)"
        />
      </div>
      <el-button type="primary" icon="Plus" plain class="w-full mt-2" @click="addBenefit">
        添加权益项
      </el-button>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit"> 保存设置 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { updateVipPackage } from '@/api/payment/vip'
  import { ElMessage } from 'element-plus'
  import { Plus, Delete } from '@element-plus/icons-vue'

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
  const localBenefits = ref<string[]>([])

  watch(
    () => props.packageData,
    (val) => {
      if (val) {
        const benefits = typeof val.benefits === 'string' ? JSON.parse(val.benefits) : val.benefits
        localBenefits.value = Array.isArray(benefits) ? [...benefits] : []
      }
    },
    { immediate: true }
  )

  const addBenefit = () => {
    localBenefits.value.push('')
  }

  const removeBenefit = (index: number) => {
    localBenefits.value.splice(index, 1)
  }

  const handleClose = () => {
    visible.value = false
  }

  const handleSubmit = async () => {
    if (localBenefits.value.some((b) => !b.trim())) {
      return ElMessage.warning('权益描述不能为空')
    }

    loading.value = true
    try {
      const updateData = {
        ...props.packageData,
        benefits: JSON.stringify(localBenefits.value)
      }
      await updateVipPackage(updateData)
      ElMessage.success('权益更新成功')
      emit('success')
      visible.value = false
    } catch (error) {
      console.error('Failed to update benefits:', error)
    } finally {
      loading.value = false
    }
  }
</script>
