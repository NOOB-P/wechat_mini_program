<template>
  <div class="search-form">
    <el-form :inline="true" :model="formModel">
      <el-form-item label="用户名">
        <el-input v-model="formModel.userName" placeholder="请输入用户名" clearable @keyup.enter="handleSearch" />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="formModel.userPhone" placeholder="请输入手机号" clearable @keyup.enter="handleSearch" />
      </el-form-item>
      <el-form-item label="用户类型">
        <el-select v-model="formModel.roleId" placeholder="请选择类型" clearable style="width: 150px">
          <el-option v-for="role in roles" :key="role.id" :label="role.roleName" :value="role.id" />
        </el-select>
      </el-form-item>

      <!-- 联动显示学校和班级筛选 (仅针对家长角色) -->
      <template v-if="isParent">
        <el-form-item label="学校">
          <el-select v-model="formModel.schoolId" placeholder="请选择学校" clearable style="width: 180px" @change="handleSchoolChange">
            <el-option v-for="school in schools" :key="school.id" :label="school.name" :value="school.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="formModel.classId" placeholder="请选择班级" clearable style="width: 180px" :disabled="!formModel.schoolId">
            <el-option v-for="cls in classes" :key="cls.id" :label="`${cls.grade} ${cls.name}`" :value="cls.id" />
          </el-select>
        </el-form-item>
      </template>

      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
  import { reactive, watch, ref, onMounted, computed } from 'vue'
  import { fetchGetRoleOptions } from '@/api/system/role'
  import { fetchGetSchoolOptions } from '@/api/core-business/school'
  import { getClassOptions } from '@/api/core-business/sys-class'

  const props = defineProps<{
    modelValue: any
  }>()

  interface Emits {
    (e: 'update:modelValue', value: any): void
    (e: 'search', params: any): void
    (e: 'reset'): void
  }

  const emit = defineEmits<Emits>()

  const formModel = reactive({ ...props.modelValue })

  // 监听外部 modelValue 的变化
  watch(
    () => props.modelValue,
    (val) => {
      Object.assign(formModel, val)
    },
    { deep: true }
  )

  // 监听内部 formModel 的变化并更新外部
  watch(
    formModel,
    (val) => {
      emit('update:modelValue', val)
    },
    { deep: true }
  )

  const roles = ref<any[]>([])
  const schools = ref<any[]>([])
  const classes = ref<any[]>([])

  // 计算当前选中的角色是否是家长
  const isParent = computed(() => {
    if (!formModel.roleId) return false
    const role = roles.value.find((r) => r.id === formModel.roleId)
    if (!role) return false
    const code = String(role.roleCode || '').toLowerCase()
    return code === 'parent' || code === 'r_parent' || role.roleName === '家长'
  })

  // 加载角色和学校选项
  onMounted(async () => {
    try {
      const [roleRes, schoolRes] = await Promise.all([fetchGetRoleOptions(), fetchGetSchoolOptions()])
      roles.value = roleRes || []
      schools.value = schoolRes || []
    } catch (error) {
      console.error('加载选项失败', error)
    }
  })

  // 学校切换时加载班级
  const handleSchoolChange = async (schoolId: string) => {
    formModel.classId = ''
    classes.value = []
    if (schoolId) {
      try {
        const res = await getClassOptions(schoolId)
        classes.value = res || []
      } catch (error) {
        console.error('加载班级失败', error)
      }
    }
  }

  // 当切换用户类型时，如果不是家长，清空学校和班级筛选
  watch(
    () => isParent.value,
    (val) => {
      if (!val) {
        formModel.schoolId = ''
        formModel.classId = ''
        classes.value = []
      }
    }
  )

  const handleSearch = () => {
    emit('search', { ...formModel })
  }

  const handleReset = () => {
    formModel.userName = ''
    formModel.userPhone = ''
    formModel.roleId = null
    formModel.schoolId = ''
    formModel.classId = ''
    classes.value = []
    emit('reset')
  }
</script>

<style scoped>
  .search-form {
    background-color: #f8f9fa;
    padding: 18px 18px 0;
    border-radius: 4px;
    margin-bottom: 20px;
  }
</style>
