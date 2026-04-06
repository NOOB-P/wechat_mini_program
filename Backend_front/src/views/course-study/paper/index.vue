<template>
  <div class="paper-manage">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">名校试卷管理</span>
          <div class="actions">
            <el-button type="primary" @click="handleAdd">新增试卷</el-button>
            <el-button type="success" @click="handleSubjectManage">科目管理</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="queryParams">
          <el-form-item label="关键词">
            <el-input v-model="queryParams.keyword" placeholder="搜索标题" clearable @clear="handleQuery" />
          </el-form-item>
          <el-form-item label="科目">
            <el-select v-model="queryParams.subject" placeholder="选择科目" clearable style="width: 150px">
              <el-option v-for="item in subjects" :key="item.id" :label="item.name" :value="item.name" />
            </el-select>
          </el-form-item>
          <el-form-item label="类型">
            <el-select v-model="queryParams.type" placeholder="选择类型" clearable style="width: 150px">
              <el-option label="名校试卷" value="FAMOUS" />
              <el-option label="月考试卷" value="MONTHLY" />
              <el-option label="联考试卷" value="JOINT" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 数据表格 -->
      <el-table :data="paperList" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="title" label="试卷标题" min-width="250" show-overflow-tooltip />
        <el-table-column prop="subject" label="科目" width="100" align="center" />
        <el-table-column prop="grade" label="年级" width="100" align="center" />
        <el-table-column prop="year" label="年份" width="100" align="center" />
        <el-table-column prop="type" label="类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">{{ typeMap[row.type] || row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="downloads" label="下载量" width="100" align="center" />
        <el-table-column prop="isRecommend" label="推荐" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.isRecommend" @change="handleStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="getList"
          @current-change="getList"
        />
      </div>
    </el-card>

    <!-- 试卷编辑弹窗 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="600px" append-to-body>
      <el-form ref="paperFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="试卷标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入试卷标题" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="科目" prop="subject">
              <el-select v-model="form.subject" placeholder="选择科目" style="width: 100%">
                <el-option v-for="item in subjects" :key="item.id" :label="item.name" :value="item.name" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年级" prop="grade">
              <el-input v-model="form.grade" placeholder="如：高三" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="年份" prop="year">
              <el-input v-model="form.year" placeholder="如：2024" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="试卷类型" prop="type">
              <el-select v-model="form.type" placeholder="选择类型" style="width: 100%">
                <el-option label="名校试卷" value="FAMOUS" />
                <el-option label="月考试卷" value="MONTHLY" />
                <el-option label="联考试卷" value="JOINT" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="文件路径" prop="filePath">
          <div style="display: flex; gap: 10px; width: 100%">
            <el-input v-model="form.filePath" placeholder="上传 PDF/Word 或输入路径" />
            <el-upload
              action=""
              :show-file-list="false"
              :http-request="handleUpload"
              :before-upload="beforeUpload"
              :disabled="uploadLoading"
            >
              <el-button type="primary" :loading="uploadLoading">上传文件</el-button>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-input v-model="form.tags" placeholder="多个标签用逗号分隔，如：真题,重点,解析" />
        </el-form-item>
        <el-form-item label="是否推荐">
          <el-radio-group v-model="form.isRecommend">
            <el-radio :label="true">推荐</el-radio>
            <el-radio :label="false">不推荐</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialog.visible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 科目管理弹窗 -->
    <el-dialog title="科目管理" v-model="subjectDialog.visible" width="700px">
      <div style="margin-bottom: 20px">
        <el-button type="primary" size="small" @click="handleAddSubject">新增科目</el-button>
      </div>
      <el-table :data="subjects" border size="small">
        <el-table-column prop="name" label="科目名称" />
        <el-table-column prop="icon" label="图标" />
        <el-table-column prop="color" label="颜色" />
        <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEditSubject(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDeleteSubject(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 科目编辑弹窗 -->
    <el-dialog :title="subjectEditDialog.title" v-model="subjectEditDialog.visible" width="400px" append-to-body>
      <el-form :model="subjectForm" label-width="80px">
        <el-form-item label="科目名称">
          <el-input v-model="subjectForm.name" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="subjectForm.icon" placeholder="图标名称" />
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="subjectForm.color" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="subjectForm.sortOrder" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="subjectEditDialog.visible = false">取 消</el-button>
        <el-button type="primary" @click="submitSubjectForm">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getPaperListApi,
  savePaperApi,
  deletePaperApi,
  getSubjectsApi,
  saveSubjectApi,
  deleteSubjectApi,
  uploadPaperApi
} from '@/api/course-study/paper'

const loading = ref(false)
const uploadLoading = ref(false)
const submitLoading = ref(false)
const total = ref(0)
const paperList = ref([])
const subjects = ref([])

const typeMap = {
  FAMOUS: '名校试卷',
  MONTHLY: '月考试卷',
  JOINT: '联考试卷'
}

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  subject: '',
  type: '',
  isRecommend: null
})

const dialog = reactive({
  title: '',
  visible: false
})

const form = ref({
  id: null,
  title: '',
  subject: '',
  grade: '',
  year: '',
  type: 'FAMOUS',
  tags: '',
  filePath: '',
  isRecommend: false
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  subject: [{ required: true, message: '请选择科目', trigger: 'change' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }]
}

const paperFormRef = ref()

// 科目管理相关
const subjectDialog = reactive({
  visible: false
})
const subjectEditDialog = reactive({
  title: '',
  visible: false
})
const subjectForm = ref({
  id: null,
  name: '',
  icon: '',
  color: '#409EFF',
  sortOrder: 0
})

const getList = async () => {
  loading.value = true
  try {
    const res = await getPaperListApi(queryParams)
    // 后端 api 已经脱壳处理，res 直接就是 data 部分 (即 Page 对象)
    if (res) {
      paperList.value = res.content
      total.value = res.totalElements
    }
  } catch (error) {
    console.error('获取试卷列表失败:', error)
  } finally {
    loading.value = false
  }
}

const getSubjects = async () => {
  try {
    const res = await getSubjectsApi()
    if (res) {
      subjects.value = res
    }
  } catch (error) {
    console.error('获取科目列表失败:', error)
  }
}

const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

const resetQuery = () => {
  queryParams.keyword = ''
  queryParams.subject = ''
  queryParams.type = ''
  handleQuery()
}

const handleAdd = () => {
  form.value = {
    id: null,
    title: '',
    subject: '',
    grade: '',
    year: '',
    type: 'FAMOUS',
    tags: '',
    filePath: '',
    isRecommend: false
  }
  dialog.title = '新增试卷'
  dialog.visible = true
}

const beforeUpload = (file: any) => {
  const isAllowed = 
    file.type === 'application/pdf' || 
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.type === 'application/msword'
  
  if (!isAllowed) {
    ElMessage.error('只能上传 PDF 或 Word 文件!')
  }
  return isAllowed
}

const handleUpload = async (options: any) => {
  const { file } = options
  const formData = new FormData()
  formData.append('file', file)
  
  uploadLoading.value = true
  try {
    const res = await uploadPaperApi(formData)
    if (res) {
      form.value.filePath = res
      ElMessage.success('上传成功')
    }
  } catch (error) {
    console.error('上传失败:', error)
  } finally {
    uploadLoading.value = false
  }
}

const handleEdit = (row: any) => {
  form.value = { ...row }
  dialog.title = '编辑试卷'
  dialog.visible = true
}

const submitForm = async () => {
  await paperFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitLoading.value = true
      try {
        const res = await savePaperApi(form.value)
        if (res) {
          ElMessage.success('试卷保存成功')
          dialog.visible = false
          getList()
        } else {
          ElMessage.error('试卷保存失败')
        }
      } catch (error: any) {
        console.error('保存试卷异常:', error)
        ElMessage.error(error.message || '保存失败，请检查网络或参数')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除该试卷吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deletePaperApi(row.id)
      if (res) {
        ElMessage.success('试卷删除成功')
        getList()
      } else {
        ElMessage.error('试卷删除失败')
      }
    } catch (error: any) {
      console.error('删除试卷异常:', error)
      ElMessage.error(error.message || '删除失败')
    }
  })
}

const handleStatusChange = async (row: any) => {
  try {
    const res = await savePaperApi(row)
    if (res) {
      ElMessage.success('推荐状态更新成功')
    } else {
      ElMessage.error('推荐状态更新失败')
      row.isRecommend = !row.isRecommend
    }
  } catch (error) {
    ElMessage.error('状态更新异常')
    row.isRecommend = !row.isRecommend
  }
}

const getTypeTag = (type: string) => {
  switch (type) {
    case 'FAMOUS': return 'danger'
    case 'MONTHLY': return 'success'
    case 'JOINT': return 'warning'
    default: return 'info'
  }
}

// 科目管理
const handleSubjectManage = () => {
  subjectDialog.visible = true
}

const handleAddSubject = () => {
  subjectForm.value = { id: null, name: '', icon: '', color: '#409EFF', sortOrder: 0 }
  subjectEditDialog.title = '新增科目'
  subjectEditDialog.visible = true
}

const handleEditSubject = (row: any) => {
  subjectForm.value = { ...row }
  subjectEditDialog.title = '编辑科目'
  subjectEditDialog.visible = true
}

const submitSubjectForm = async () => {
  try {
    const res = await saveSubjectApi(subjectForm.value)
    if (res) {
      ElMessage.success('科目保存成功')
      subjectEditDialog.visible = false
      getSubjects()
    } else {
      ElMessage.error('科目保存失败')
    }
  } catch (error: any) {
    console.error('保存科目异常:', error)
    ElMessage.error(error.message || '保存科目失败')
  }
}

const handleDeleteSubject = (row: any) => {
  ElMessageBox.confirm('确认删除该科目吗?', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteSubjectApi(row.id)
      if (res) {
        ElMessage.success('科目删除成功')
        getSubjects()
      } else {
        ElMessage.error('科目删除失败')
      }
    } catch (error: any) {
      console.error('删除科目异常:', error)
      ElMessage.error(error.message || '删除科目失败')
    }
  })
}

onMounted(() => {
  getList()
  getSubjects()
})
</script>

<style lang="scss" scoped>
.paper-manage {
  padding: 20px;
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .title {
      font-weight: bold;
      font-size: 16px;
    }
  }
  .search-bar {
    margin-bottom: 20px;
  }
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
