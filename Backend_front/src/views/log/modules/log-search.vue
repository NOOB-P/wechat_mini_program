<template>
  <div class="search-wrapper bg-white dark:bg-dark-800 p-5 rounded-lg mb-5 shadow-sm">
    <el-form :model="queryParams" ref="queryFormRef" :inline="true">
      <el-form-item label="操作用户" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入操作用户"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="操作内容" prop="operation">
        <el-input
          v-model="queryParams.operation"
          placeholder="请输入操作内容"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="状态" clearable style="width: 150px">
          <el-option label="成功" :value="200" />
          <el-option label="失败" :value="500" />
          <el-option label="禁止" :value="403" />
          <el-option label="未授权" :value="401" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
  const props = defineProps<{
    queryParams: any
  }>()

  const emit = defineEmits(['query', 'reset'])

  const handleQuery = () => {
    emit('query')
  }

  const resetQuery = () => {
    emit('reset')
  }
</script>

<style scoped lang="scss">
  .search-wrapper {
    :deep(.el-form-item) {
      margin-bottom: 0;
    }
  }
</style>
