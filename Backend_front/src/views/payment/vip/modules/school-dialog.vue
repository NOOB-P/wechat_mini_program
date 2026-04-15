<template>
  <el-dialog
    v-model="visible"
    :title="`选择开通学校 - ${packageData?.title || ''}`"
    width="640px"
    @close="handleClose"
  >
    <div class="mb-4 text-sm leading-6 text-gray-500">
      只有所选学校的用户才会在小程序看到原会员开通页；未选学校将进入校讯通引导页。
    </div>

    <el-form label-width="90px">
      <el-form-item label="学校范围">
        <el-select
          v-model="selectedSchoolIds"
          multiple
          filterable
          collapse-tags
          collapse-tags-tooltip
          placeholder="请选择学校"
          style="width: 100%"
        >
          <el-option
            v-for="school in schoolOptions"
            :key="school.id"
            :label="school.name"
            :value="school.id"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <div class="rounded-lg bg-gray-50 p-4">
      <div class="mb-3 flex items-center justify-between text-sm text-gray-600">
        <span>已选择 {{ selectedSchoolIds.length }} 所学校</span>
        <el-button link type="primary" @click="selectedSchoolIds = []">清空</el-button>
      </div>
      <div v-if="selectedSchoolIds.length" class="flex flex-wrap gap-2">
        <el-tag
          v-for="schoolId in selectedSchoolIds"
          :key="schoolId"
          closable
          type="success"
          effect="plain"
          @close="removeSchool(schoolId)"
        >
          {{ getSchoolName(schoolId) }}
        </el-tag>
      </div>
      <div v-else class="text-sm text-gray-400">当前未选择学校。</div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">保存设置</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { updateVipPackage } from '@/api/payment/vip'

  const props = defineProps<{
    modelValue: boolean
    packageData?: any
    schoolOptions: any[]
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])

  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const loading = ref(false)
  const selectedSchoolIds = ref<string[]>([])

  watch(
    () => props.packageData,
    (val) => {
      if (!val || !Array.isArray(val.schools)) {
        selectedSchoolIds.value = []
        return
      }
      selectedSchoolIds.value = val.schools.map((item: any) => item?.schoolId).filter(Boolean)
    },
    { immediate: true }
  )

  const getSchoolName = (schoolId: string) => {
    const school = props.schoolOptions.find(item => item.id === schoolId)
    return school?.name || schoolId
  }

  const removeSchool = (schoolId: string) => {
    selectedSchoolIds.value = selectedSchoolIds.value.filter(item => item !== schoolId)
  }

  const handleClose = () => {
    visible.value = false
  }

  const handleSubmit = async () => {
    if (!props.packageData?.id) {
      return ElMessage.warning('当前套餐信息无效')
    }

    loading.value = true
    try {
      await updateVipPackage({
        ...props.packageData,
        schools: selectedSchoolIds.value.map(schoolId => ({ schoolId }))
      })
      ElMessage.success('开通学校已更新')
      emit('success')
      visible.value = false
    } finally {
      loading.value = false
    }
  }
</script>
