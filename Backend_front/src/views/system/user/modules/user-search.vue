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
        <el-select v-model="formModel.userType" placeholder="请选择类型" clearable style="width: 150px">
          <el-option label="管理员" value="1" />
          <el-option label="学校" value="2" />
          <el-option label="家长" value="3" />
          <el-option label="学生" value="4" />
        </el-select>
      </el-form-item>

      <!-- 联动显示学校和班级筛选 -->
      <template v-if="formModel.userType === '3' || formModel.userType === '4'">
        <el-form-item label="学校">
          <el-select v-model="formModel.schoolName" placeholder="请选择学校" clearable style="width: 180px">
            <el-option label="第一中学" value="第一中学" />
            <el-option label="第二中学" value="第二中学" />
            <el-option label="第三实验学校" value="第三实验学校" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="formModel.className" placeholder="请选择班级" clearable style="width: 150px">
            <el-option label="1班" value="1班" />
            <el-option label="2班" value="2班" />
            <el-option label="3班" value="3班" />
            <el-option label="4班" value="4班" />
            <el-option label="实验1班" value="实验1班" />
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
  import { reactive, watch } from 'vue'

  interface Emits {
    (e: 'search', params: any): void
    (e: 'reset'): void
  }

  const emit = defineEmits<Emits>()

  const formModel = reactive({
    userName: '',
    userPhone: '',
    userType: '',
    schoolName: '',
    className: ''
  })

  // 当切换用户类型时，如果不是家长或学生，清空学校和班级筛选
  watch(
    () => formModel.userType,
    (val) => {
      if (val !== '3' && val !== '4') {
        formModel.schoolName = ''
        formModel.className = ''
      }
    }
  )

  const handleSearch = () => {
    emit('search', { ...formModel })
  }

  const handleReset = () => {
    Object.keys(formModel).forEach((key) => {
      ;(formModel as any)[key] = ''
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
