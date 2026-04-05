<template>
  <div class="page-container">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card mb-4">
      <el-form :inline="true" :model="searchForm" class="search-form-inline">
        <el-form-item label="班级ID">
          <el-input 
            v-model="searchForm.classid" 
            placeholder="请输入班级ID" 
            clearable 
            @keyup.enter="handleSearch"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="年级">
          <el-input 
            v-model="searchForm.grade" 
            placeholder="请输入年级" 
            clearable 
            @keyup.enter="handleSearch"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="main-card">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-bold">全局班级管理</span>
          <el-button type="primary" @click="handleAddClass">添加班级</el-button>
        </div>
      </template>

      <el-table 
        :data="tableData" 
        border 
        style="width: 100%" 
        v-loading="loading"
      >
        <el-table-column prop="id" label="内部ID" width="100" align="center" />
        <el-table-column prop="classid" label="班级唯一标识" min-width="150" align="center" />
        <el-table-column prop="grade" label="年级" width="150" align="center" />
        <el-table-column prop="alias" label="班级别名" min-width="150" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEditClass(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDeleteClass(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 弹窗：添加/编辑班级 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加班级' : '编辑班级'"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="班级唯一标识" prop="classid">
          <el-input v-model="formData.classid" placeholder="请输入班级唯一标识ID" />
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-input v-model="formData.grade" placeholder="请输入年级 (如: 初一, 高二)" />
        </el-form-item>
        <el-form-item label="班级别名" prop="alias">
          <el-input v-model="formData.alias" placeholder="请输入班级别名 (如: 1班, 理科班)" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getClassList, addClass, updateClass, deleteClass } from '@/api/core-business/sys-class'

const searchForm = reactive({
  classid: '',
  grade: ''
})

const tableData = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive({
  id: undefined as number | undefined,
  classid: '',
  grade: '',
  alias: ''
})

const rules = reactive<FormRules>({
  classid: [{ required: true, message: '请输入班级唯一标识', trigger: 'blur' }],
  grade: [{ required: true, message: '请输入年级', trigger: 'blur' }]
})

const fetchList = async () => {
  loading.value = true
  try {
    const res: any = await getClassList({
      page: page.value,
      size: pageSize.value,
      classid: searchForm.classid || undefined,
      grade: searchForm.grade || undefined
    })
    if (res) {
      const records = res.records || []
      tableData.value = records.map((item: any) => {
        if (item.createTime) {
          const d = new Date(item.createTime)
          item.createTime = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
        }
        return item
      })
      total.value = res.total || 0
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  fetchList()
}

const resetSearch = () => {
  searchForm.classid = ''
  searchForm.grade = ''
  handleSearch()
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchList()
}

const handleCurrentChange = (val: number) => {
  page.value = val
  fetchList()
}

const handleAddClass = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
}

const handleEditClass = (row: any) => {
  dialogType.value = 'edit'
  formData.id = row.id
  formData.classid = row.classid
  formData.grade = row.grade
  formData.alias = row.alias
  dialogVisible.value = true
}

const handleDeleteClass = (row: any) => {
  ElMessageBox.confirm('确认删除该班级吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteClass(row.id)
      ElMessage.success('删除成功')
      fetchList()
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败')
    }
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (dialogType.value === 'add') {
          await addClass(formData)
          ElMessage.success('添加成功')
        } else {
          await updateClass(formData.id!, formData)
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        fetchList()
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  formData.id = undefined
  formData.classid = ''
  formData.grade = ''
  formData.alias = ''
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.mb-4 {
  margin-bottom: 16px;
}
.mr-4 {
  margin-right: 16px;
}
.flex {
  display: flex;
}
.justify-between {
  justify-content: space-between;
}
.justify-end {
  justify-content: flex-end;
}
.items-center {
  align-items: center;
}
.font-bold {
  font-weight: bold;
}
.mt-4 {
  margin-top: 16px;
}
</style>
