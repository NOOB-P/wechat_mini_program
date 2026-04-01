<template>
  <div class="page-container p-5">
    <div class="art-card p-5 rounded-xl bg-white shadow-sm">
      <div class="flex justify-between items-center mb-5">
        <div class="flex items-center space-x-4">
          <span class="font-bold text-lg text-g-800">FAQ 管理</span>
          <el-select v-model="filterCategory" placeholder="按模块筛选" clearable @change="loadData" style="width: 150px">
            <el-option v-for="item in categoryOptions" :key="item" :label="item" :value="item" />
          </el-select>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索问题关键词"
            clearable
            @keyup.enter="loadData"
            @clear="loadData"
            style="width: 250px"
          >
            <template #prefix>
              <ArtSvgIcon icon="ri:search-line" />
            </template>
          </el-input>
          <el-button type="primary" @click="loadData">查询</el-button>
        </div>
        <div class="flex items-center space-x-2">
          <el-button @click="handleManageCategory">
            <template #icon><ArtSvgIcon icon="ri:settings-4-line" /></template>
            模块管理
          </el-button>
          <el-button type="primary" @click="handleAdd">
            <template #icon><ArtSvgIcon icon="ri:add-line" /></template>
            新增问题
          </el-button>
        </div>
      </div>

      <el-table :data="tableData" border v-loading="loading">
        <el-table-column prop="categoryName" label="所属模块" width="120" />
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
        <el-form-item label="所属模块" prop="categoryName">
          <el-select
            v-model="form.categoryName"
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入新模块名称"
            style="width: 100%"
          >
            <el-option v-for="item in categoryOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
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

    <!-- 模块管理弹窗 -->
    <el-dialog
      v-model="categoryDialogVisible"
      title="模块管理"
      width="700px"
    >
      <div class="mb-4 flex justify-end">
        <el-button type="primary" size="small" @click="handleAddCategory">
          <template #icon><ArtSvgIcon icon="ri:add-line" /></template>
          新增模块
        </el-button>
      </div>

      <el-table :data="categoryList" border size="small">
        <el-table-column label="模块名称" min-width="150">
          <template #default="{ row }">
            <el-input v-if="row.isEdit" v-model="row.name" size="small" style="width: 100%" />
            <span v-else>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="排序" width="120">
          <template #default="{ row }">
            <el-input-number v-if="row.isEdit" v-model="row.sort" :min="0" size="small" controls-position="right" style="width: 100%" />
            <span v-else>{{ row.sort }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-if="row.isEdit"
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              size="small"
            />
            <el-tag v-else :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row, $index }">
            <template v-if="row.isEdit">
              <el-button link type="primary" size="small" @click="saveCategory(row)">保存</el-button>
              <el-button link size="small" @click="cancelEditCategory(row, $index)">取消</el-button>
            </template>
            <template v-else>
              <el-button link type="primary" size="small" @click="row.isEdit = true">编辑</el-button>
              <el-button link type="danger" size="small" @click="handleDeleteCategory(row)">删除</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchGetFaqList, fetchGetFaqCategories, fetchAddFaq, fetchUpdateFaq, fetchDeleteFaq, fetchAddFaqCategory, fetchGetFaqCategoryList, fetchUpdateFaqCategory, fetchDeleteFaqCategory } from '@/api/support-interaction/index'
import { ElMessage, ElMessageBox } from 'element-plus'

defineOptions({ name: 'FaqManage' })

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const categoryOptions = ref<string[]>([])
const filterCategory = ref('')
const searchKeyword = ref('')

// 分类管理相关
const categoryDialogVisible = ref(false)
const categoryList = ref<any[]>([])
const originalCategories = new Map() // 用于取消编辑时还原数据

const handleManageCategory = async () => {
  categoryDialogVisible.value = true
  await loadCategoryList()
}

const loadCategoryList = async () => {
  try {
    const res = await fetchGetFaqCategoryList()
    if (res && Array.isArray(res)) {
      categoryList.value = res.map((item: any) => ({
        ...item,
        isEdit: false
      }))
    }
  } catch (error) {
    console.error('获取模块列表失败', error)
  }
}

const handleAddCategory = () => {
  categoryList.value.push({
    id: null,
    name: '',
    sort: 0,
    status: 1,
    isEdit: true
  })
}

const saveCategory = async (row: any) => {
  if (!row.name) {
    ElMessage.warning('模块名称不能为空')
    return
  }
  try {
    const api = row.id ? fetchUpdateFaqCategory : fetchAddFaqCategory
    await api(row)
    ElMessage.success(row.id ? '更新成功' : '新增成功')
    await loadCategoryList()
    fetchCategories() // 更新主页面的下拉选项
  } catch (error) {}
}

const cancelEditCategory = (row: any, index: number) => {
  if (!row.id) {
    categoryList.value.splice(index, 1)
  } else {
    row.isEdit = false
    loadCategoryList() // 简单处理：直接重新加载
  }
}

const handleDeleteCategory = (row: any) => {
  ElMessageBox.confirm(`确定要删除模块 "${row.name}" 吗?`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await fetchDeleteFaqCategory(row.id)
      ElMessage.success('删除成功')
      await loadCategoryList()
      fetchCategories()
    } catch (error) {}
  }).catch(() => {})
}

const form = ref({
  id: '',
  categoryName: '',
  question: '',
  answer: '',
  status: 1
})

const rules = {
  categoryName: [{ required: true, message: '请输入或选择模块名称', trigger: 'blur' }],
  question: [{ required: true, message: '请输入问题', trigger: 'blur' }],
  answer: [{ required: true, message: '请输入解答内容', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await fetchGetFaqList({ 
      current: 1, 
      size: 50,
      categoryName: filterCategory.value || undefined,
      question: searchKeyword.value || undefined
    })
    if (res && res.records) {
      tableData.value = res.records
    }
    
    // 获取分类
    fetchCategories()
  } catch (error) {
    console.error(error)
  }
  loading.value = false
}

const fetchCategories = async () => {
  try {
    const catRes = await fetchGetFaqCategories()
    // 由于后端接口 Result.success 会被 axios 拦截器处理为直接返回 data 部分
    // catRes 此时已经是 List<String> 数组了
    if (catRes && Array.isArray(catRes)) {
      categoryOptions.value = catRes
    }
  } catch (error) {
    console.error('获取分类失败', error)
  }
}

const handleAdd = () => {
  isEdit.value = false
  form.value = { id: '', categoryName: '', question: '', answer: '', status: 1 }
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
