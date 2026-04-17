<template>
  <el-dialog
    :title="form.id ? '编辑套餐' : '新增套餐'"
    v-model="visible"
    width="500px"
    @close="handleClose"
  >
    <el-form :model="form" label-width="100px">
      <el-form-item label="等级代码" required>
        <el-input v-model="form.tierCode" placeholder="如 VIP, SVIP" :disabled="!!form.id" />
      </el-form-item>
      <el-form-item label="显示标题" required>
        <el-input v-model="form.title" placeholder="如 VIP 基础版" />
      </el-form-item>
      <el-form-item label="副标题">
        <el-input v-model="form.subTitle" placeholder="请输入描述信息" />
      </el-form-item>
      <el-form-item label="排序权重">
        <el-input-number v-model="form.sortOrder" :min="0" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit"> 确定 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { updateVipPackage } from '@/api/payment/vip'
  import { ElMessage } from 'element-plus'

  const props = defineProps<{
    modelValue: boolean
    packageData?: any
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])

  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const loading = ref(false)
  const form = ref({
    id: undefined,
    tierCode: '',
    title: '',
    subTitle: '',
    sortOrder: 0,
    benefits: '[]',
    isEnabled: 1
  })

  watch(
    () => props.packageData,
    (val) => {
      if (val) {
        form.value = { ...val }
      } else {
        form.value = {
          id: undefined,
          tierCode: '',
          title: '',
          subTitle: '',
          sortOrder: 0,
          benefits: '[]',
          isEnabled: 1
        }
      }
    },
    { immediate: true }
  )

  const handleClose = () => {
    visible.value = false
  }

  const handleSubmit = async () => {
    if (!form.value.tierCode || !form.value.title) {
      return ElMessage.warning('请填写必填项')
    }

    loading.value = true
    try {
      await updateVipPackage(form.value)
      ElMessage.success(form.value.id ? '保存成功' : '新增成功')
      emit('success')
      visible.value = false
    } catch (error) {
      console.error('Failed to save package:', error)
    } finally {
      loading.value = false
    }
  }
</script>
