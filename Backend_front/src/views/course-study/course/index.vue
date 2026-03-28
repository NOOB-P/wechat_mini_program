<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-bold">公益课程管理</span>
          <el-button type="primary" @click="handleAdd">新增课程</el-button>
        </div>
      </template>

      <el-table :data="tableData" border v-loading="loading">
        <el-table-column prop="title" label="课程名称" min-width="180" />
        <el-table-column label="封面" width="120">
          <template #default="{ row }">
            <el-image :src="row.cover" class="w-20 h-12 rounded" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '已上架' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button 
              link 
              :type="row.status === 1 ? 'warning' : 'success'" 
              @click="handleStatus(row)"
            >
              {{ row.status === 1 ? '下架' : '上架' }}
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <CourseDialog 
      v-model:visible="dialogVisible" 
      :isEdit="isEdit" 
      :data="editData" 
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchGetCourseList, fetchDeleteCourse, fetchChangeCourseStatus } from '@/api/course-study/course/index'
import { ElMessage, ElMessageBox } from 'element-plus'
import CourseDialog from './modules/course-dialog.vue'

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editData = ref(null)

const loadData = async () => {
  loading.value = true
  const res = await fetchGetCourseList({})
  if (res.code === 200) {
    tableData.value = res.data.list
  }
  loading.value = false
}

const handleAdd = () => {
  isEdit.value = false
  editData.value = null
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  editData.value = row
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该课程吗?', '提示', {
    type: 'warning'
  }).then(async () => {
    const res = await fetchDeleteCourse(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadData()
    }
  })
}

const handleStatus = async (row: any) => {
  const newStatus = row.status === 1 ? 0 : 1
  const res = await fetchChangeCourseStatus(row.id, newStatus)
  if (res.code === 200) {
    ElMessage.success(res.msg)
    loadData()
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
</style>
