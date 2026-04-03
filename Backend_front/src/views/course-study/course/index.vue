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
        <el-table-column prop="type" label="类型">
          <template #default="{ row }">
            <el-tag v-if="row.type === 'general'">常规</el-tag>
            <el-tag v-else-if="row.type === 'sync'" type="success">同步</el-tag>
            <el-tag v-else-if="row.type === 'family'" type="warning">家教</el-tag>
            <el-tag v-else-if="row.type === 'talk'" type="danger">学霸说</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="subject" label="科目" width="80" />
        <el-table-column prop="grade" label="年级" width="100" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: bold">￥{{ row.price?.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="isSvipOnly" label="SVIP" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isSvipOnly ? 'danger' : 'info'" size="small">
              {{ row.isSvipOnly ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="封面" width="120">
          <template #default="{ row }">
            <el-image :src="row.cover" class="w-20 h-12 rounded" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column prop="isRecommend" label="今日推荐" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isRecommend === 1 ? 'success' : 'info'">
              {{ row.isRecommend === 1 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
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
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  getCourseList,
  addCourse,
  updateCourse,
  deleteCourse,
  changeCourseStatus
} from '@/api/course-study/course/index'
import { ElMessage, ElMessageBox } from 'element-plus'
import CourseDialog from './modules/course-dialog.vue'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const queryParams = ref({
  current: 1,
  size: 10,
  isSvipOnly: false
})
const dialogVisible = ref(false)
const isEdit = ref(false)
const editData = ref(null)

const loadData = async () => {
  loading.value = true
  try {
    const data = await getCourseList(queryParams.value)
    // 这里的 data 已经是后端返回的 res.data.data 了
    if (data) {
      if (Array.isArray(data)) {
        tableData.value = data
        total.value = data.length
      } else if (Array.isArray(data.list)) {
        tableData.value = data.list
        total.value = data.total || data.list.length
      }
    }
  } catch (error) {
    console.error('加载课程数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSuccess = async (formData: any) => {
  try {
    isEdit.value ? await updateCourse(formData) : await addCourse(formData)
    ElMessage.success(isEdit.value ? '更新成功' : '新增成功')
    loadData()
  } catch (error) {
    // 错误已由请求拦截器处理并显示消息
  }
}

const handleAdd = () => {
  isEdit.value = false
  editData.value = {
    type: 'general',
    price: 0,
    isSvipOnly: false,
    status: 1
  }
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
    try {
      await deleteCourse(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      // 拦截器已处理
    }
  })
}

const handleStatus = async (row: any) => {
  const newStatus = row.status === 1 ? 0 : 1
  try {
    await changeCourseStatus(row.id, newStatus)
    ElMessage.success('操作成功')
    loadData()
  } catch (error) {
    // 拦截器已处理
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
