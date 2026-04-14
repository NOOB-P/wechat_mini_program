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
          <el-option label="管理员" value="1" />
          <el-option label="学校" value="2" />
          <el-option label="家长" value="3" />
          <el-option label="学生" value="4" />
        </el-select>
      </el-form-item>

      <!-- 联动显示学校和班级筛选 -->
      <template v-if="formModel.roleId === '3' || formModel.roleId === '4'">
        <el-form-item label="学校">
          <el-select v-model="formModel.schoolName" placeholder="请选择学校" clearable style="width: 180px">
            <el-option
              v-for="school in schoolOptions"
              :key="school.id"
              :label="school.name"
              :value="school.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="formModel.className" placeholder="请选择班级" clearable style="width: 150px">
            <el-option
              v-for="item in classOptions"
              :key="item.id"
              :label="`${item.grade} / ${item.alias}`"
              :value="item.alias"
            />
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
  import { watch, onMounted, ref } from 'vue'
  import { fetchGetAllSchools } from '@/api/core-business/school'
  import { getClassList } from '@/api/core-business/sys-class'

  interface Emits {
    (e: 'search', params: any): void
    (e: 'reset'): void
  }

  const emit = defineEmits<Emits>()

  const formModel = defineModel<any>({
    default: () => ({
      userName: '',
      userPhone: '',
      roleId: '',
      schoolName: '',
      className: ''
    })
  })

  // 学校选项
  const schoolOptions = ref<any[]>([])
  // 班级选项
  const classOptions = ref<any[]>([])

  const getSchools = async () => {
    try {
      const res = await fetchGetAllSchools()
      // res 已经是后端 Result.data.data 的内容（即学校数组）
      schoolOptions.value = res || []
    } catch (error) {
      console.error('获取学校列表失败:', error)
    }
  }

  const getClasses = async (schoolName: string) => {
    if (!schoolName) {
      classOptions.value = []
      return
    }
    const school = schoolOptions.value.find((s) => s.name === schoolName)
    if (!school) return

    try {
      const res = await getClassList({ schoolId: school.schoolId, size: 1000 })
      // res 已经是后端 Result.data.data 的内容（即包含 records 的分页对象）
      classOptions.value = res?.records || []
    } catch (error) {
      console.error('获取班级列表失败:', error)
    }
  }

  onMounted(() => {
    getSchools()
  })

  // 当选择学校变化时，获取班级列表
  watch(
    () => formModel.value.schoolName,
    (val) => {
      formModel.value.className = ''
      getClasses(val)
    }
  )

  // 当切换用户类型时，如果不是家长或学生，清空学校和班级筛选
  watch(
    () => formModel.value.roleId,
    (val) => {
      if (val !== '3' && val !== '4') {
        formModel.value.schoolName = ''
        formModel.value.className = ''
      }
    }
  )

  const handleSearch = () => {
    emit('search', { ...formModel.value })
  }

  const handleReset = () => {
    Object.keys(formModel.value).forEach((key) => {
      ;(formModel.value as any)[key] = ''
    })
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
