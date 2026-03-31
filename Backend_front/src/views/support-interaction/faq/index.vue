<template>
  <div class="page-container p-5">
    <div class="art-card p-5 rounded-xl bg-white shadow-sm">
      <div class="flex justify-between items-center mb-5">
        <span class="font-bold text-lg text-g-800">FAQ 管理</span>
        <el-button type="primary" @click="handleAdd">
          <template #icon><ArtSvgIcon icon="ri:add-line" /></template>
          新增问题
        </el-button>
      </div>

      <el-table :data="tableData" border v-loading="loading">
        <el-table-column prop="question" label="常见问题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="answer" label="解答内容" min-width="300" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '已启用' : '已禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑 FAQ' : '新增 FAQ'"
      width="600px"
    >
      <el-form :model="form" label-width="80px" :rules="rules" ref="formRef">
        <el-form-item label="问题" prop="question">
          <el-input v-model="form.question" placeholder="请输入常见问题描述" />
        </el-form-item>
        <el-form-item label="解答" prop="answer">
          <el-input
            v-model="form.answer"
            type="textarea"
            :rows="4"
            placeholder="请输入详细的解答内容"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchGetFaqList, fetchAddFaq, fetchUpdateFaq, fetchDeleteFaq } from '@/api/support-interaction/index'
import { ElMessage, ElMessageBox } from 'element-plus'

defineOptions({ name: 'FaqManage' })

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

const form = ref({
  id: '',
  question: '',
  answer: '',
  status: 1
})

const rules = {
  question: [{ required: true, message: '请输入问题', trigger: 'blur' }],
  answer: [{ required: true, message: '请输入解答内容', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await fetchGetFaqList({ current: 1, size: 50 })
    if (res && res.records) {
      tableData.value = res.records
    }
  } catch (error) {
    console.error(error)
  }
  loading.value = false
}

const handleAdd = () => {
  isEdit.value = false
  form.value = { id: '', question: '', answer: '', status: 1 }
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该 FAQ 吗?', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await fetchDeleteFaq(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {}
  }).catch(() => {})
}

const submit = async () => {
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const api = isEdit.value ? fetchUpdateFaq : fetchAddFaq
        await api(form.value)
        ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
        dialogVisible.value = false
        loadData()
      } catch (error) {}
    }
  })
}

onMounted(() => {
  loadData()
})
</script>
