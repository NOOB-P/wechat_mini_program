<template>
  <div class="empty-page-container">
    <el-result
      icon="warning"
      title="暂无分析数据"
      sub-title="该考试项目尚未设置学科或尚未导入学生成绩，暂无法进行数据分析。"
    >
      <template #extra>
        <el-button type="primary" @click="goBack">返回分析列表</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'

  const router = useRouter()

  const goBack = () => {
    router.push({ name: 'ExamAnalysisList' })
  }
</script>

<style scoped>
  .empty-page-container {
    height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--el-bg-color);
  }
</style>
