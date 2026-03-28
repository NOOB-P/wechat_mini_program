<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <span>学生档案管理</span>
          <div>
            <el-button type="primary" @click="handleImport">导入学生</el-button>
            <el-button type="success" @click="handleAdd">新增学生</el-button>
          </div>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="mb-4">
        <el-form-item label="姓名">
          <el-input v-model="searchForm.name" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="学号">
          <el-input v-model="searchForm.studentNo" placeholder="请输入学号" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border style="width: 100%" v-loading="loading">
        <el-table-column prop="studentNo" label="学号" width="150" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="grade" label="年级" width="120" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="parentPhone" label="家长手机号" width="150" />
        <el-table-column label="绑定状态" width="120">
          <template #default="{ row }">
            <BindingStatus :isBound="row.isBound" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑学生' : '新增学生'">
      <el-form :model="form" label-width="100px">
        <el-form-item label="学号">
          <el-input v-model="form.studentNo" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="form.gender">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchGetStudentList, fetchAddStudent, fetchUpdateStudent, fetchDeleteStudent } from '@/api/core-business/student/index'
import { ElMessage, ElMessageBox } from 'element-plus'
import BindingStatus from './components/BindingStatus.vue'

const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const searchForm = ref({
  name: '',
  studentNo: ''
})

const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({
  id: '',
  studentNo: '',
  name: '',
  gender: '男'
})

const loadData = async () => {
  loading.value = true
  const res = await fetchGetStudentList({
    page: page.value,
    pageSize: pageSize.value,
    ...searchForm.value
  })
  if (res.code === 200) {
    const start = (page.value - 1) * pageSize.value
    const end = start + pageSize.value
    let list = res.data.list
    if (searchForm.value.name) {
      list = list.filter((item: any) => item.name.includes(searchForm.value.name))
    }
    if (searchForm.value.studentNo) {
      list = list.filter((item: any) => item.studentNo.includes(searchForm.value.studentNo))
    }
    tableData.value = list.slice(start, end)
    total.value = list.length
  }
  loading.value = false
}

const resetSearch = () => {
  searchForm.value = { name: '', studentNo: '' }
  page.value = 1
  loadData()
}

const handleAdd = () => {
  isEdit.value = false
  form.value = { id: '', studentNo: '', name: '', gender: '男' }
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该学生吗?', '提示', {
    type: 'warning'
  }).then(async () => {
    const res = await fetchDeleteStudent({ id: row.id })
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadData()
    }
  })
}

const submitForm = async () => {
  const api = isEdit.value ? fetchUpdateStudent : fetchAddStudent
  const res = await api(form.value)
  if (res.code === 200) {
    ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
    dialogVisible.value = false
    loadData()
  }
}

const handleImport = () => {
  ElMessage.info('导入功能待实现')
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
