<template>
  <div class="paper-manage">
    <!-- 第一层：类型管理 -->
    <div v-if="currentLevel === 1">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <span class="title">名校试卷管理 - 类型</span>
            <div class="actions">
              <el-button type="success" @click="handleSubjectManage">全局科目管理</el-button>
            </div>
          </div>
        </template>
        <el-table :data="typeData" border stripe v-loading="loading">
          <el-table-column prop="id" label="类型ID" width="120" align="center" />
          <el-table-column prop="name" label="类型名称" min-width="150" />
          <el-table-column prop="count" label="试卷数量" width="120" align="center" />
          <el-table-column label="操作" width="150" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="enterGrade(row)">进入管理</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 第二层：年级管理 -->
    <div v-else-if="currentLevel === 2">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <div class="flex items-center">
              <el-button link @click="currentLevel = 1">
                <el-icon><ArrowLeft /></el-icon> 返回类型列表
              </el-button>
              <span class="title ml-4">{{ currentTypeName }} - 年级列表</span>
            </div>
            <div class="actions">
              <el-button type="primary" @click="handleAddNewGrade">新增年级</el-button>
            </div>
          </div>
        </template>
        <el-table :data="gradeData" border stripe v-loading="loading">
          <el-table-column prop="name" label="年级名称" min-width="150" />
          <el-table-column prop="count" label="试卷数量" width="120" align="center" />
          <el-table-column label="操作" width="150" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="enterSubject(row)">进入管理</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 第三层：科目管理 -->
    <div v-else-if="currentLevel === 3">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <div class="flex items-center">
              <el-button link @click="currentLevel = 2">
                <el-icon><ArrowLeft /></el-icon> 返回年级列表
              </el-button>
              <span class="title ml-4">{{ currentTypeName }} - {{ currentGradeName }} - 科目列表</span>
            </div>
          </div>
        </template>
        <el-table :data="subjectData" border stripe v-loading="loading">
          <el-table-column prop="name" label="科目名称" min-width="150" />
          <el-table-column prop="count" label="试卷数量" width="120" align="center" />
          <el-table-column label="操作" width="150" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="enterPaperList(row)">进入管理</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 第四层：试卷列表管理 -->
    <div v-else-if="currentLevel === 4">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <div class="flex items-center">
              <el-button link @click="currentLevel = 3">
                <el-icon><ArrowLeft /></el-icon> 返回科目列表
              </el-button>
              <span class="title ml-4">{{ currentTypeName }} - {{ currentGradeName }} - {{ currentSubjectName }} - 试卷列表</span>
            </div>
            <div class="actions">
              <el-button type="primary" @click="handleAdd">新增试卷</el-button>
            </div>
          </div>
        </template>

        <!-- 搜索栏 -->
        <div class="search-bar">
          <el-form :inline="true" :model="queryParams">
            <el-form-item label="关键词">
              <el-input v-model="queryParams.keyword" placeholder="搜索标题" clearable @clear="handleQuery" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleQuery">查询</el-button>
              <el-button @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 数据表格 -->
        <el-table :data="paperList" v-loading="loading" border stripe>
          <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
          <el-table-column prop="title" label="试卷标题" min-width="250" show-overflow-tooltip />
          <el-table-column prop="year" label="年份" width="100" align="center" />
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
    </div>

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
        <el-form-item label="排序号" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="1" />
        </el-form-item>
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
import { ArrowLeft } from '@element-plus/icons-vue'
import {
  getPaperListApi,
  savePaperApi,
  deletePaperApi,
  getSubjectsApi,
  saveSubjectApi,
  deleteSubjectApi,
  uploadPaperApi,
  getTypeStatsApi,
  getGradeStatsApi,
  getSubjectStatsApi
} from '@/api/course-study/paper'

const loading = ref(false)
const uploadLoading = ref(false)
const submitLoading = ref(false)
const total = ref(0)
const paperList = ref<any[]>([])
const subjects = ref<any[]>([])

const typeMap: Record<string, string> = {
  FAMOUS: '名校试卷',
  MONTHLY: '月考试卷',
  JOINT: '联考试卷'
}

// 年级排序权重
const gradeWeightMap: Record<string, number> = {
  '一年级': 10, '小学一年级': 10,
  '二年级': 20, '小学二年级': 20,
  '三年级': 30, '小学三年级': 30,
  '四年级': 40, '小学四年级': 40,
  '五年级': 50, '小学五年级': 50,
  '六年级': 60, '小学六年级': 60,
  '初一': 70, '七年级': 70,
  '初二': 80, '八年级': 80,
  '初三': 90, '九年级': 90,
  '高一': 100,
  '高二': 110,
  '高三': 120
}

const getGradeWeight = (name: string) => {
  for (const key in gradeWeightMap) {
    if (name.includes(key)) return gradeWeightMap[key]
  }
  return 999 // 未知年级排最后
}

// 排序函数
const sortGrades = (list: any[]) => {
  return list.sort((a, b) => getGradeWeight(a.name) - getGradeWeight(b.name))
}

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  subject: '',
  grade: '',
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
  isRecommend: false,
  sortOrder: 1
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

// 加载类型统计
const loadTypeStats = async () => {
  loading.value = true
  try {
    const res = await getTypeStatsApi()
    if (res) {
      typeData.value = res
    }
  } catch (error) {
    console.error('获取类型统计失败:', error)
  } finally {
    loading.value = false
  }
}

// 进入年级管理
const enterGrade = async (row: any) => {
  currentType.value = row.id
  currentTypeName.value = row.name
  loading.value = true
  try {
    const res = await getGradeStatsApi(row.id)
    let list = res || []
    
    // 合并手动新增的年级
    const manual = manualGrades[currentType.value] || []
    manual.forEach(name => {
      if (!list.find((g: any) => g.name === name)) {
        list.push({ name, count: 0 })
      }
    })

    gradeData.value = sortGrades(list)
    currentLevel.value = 2
  } catch (error) {
    console.error('获取年级统计失败:', error)
  } finally {
    loading.value = false
  }
}

// 进入科目管理
const enterSubject = async (row: any) => {
  currentGradeName.value = row.name
  loading.value = true
  try {
    const res = await getSubjectStatsApi(currentType.value, row.name)
    subjectData.value = res || []
    currentLevel.value = 3
  } catch (error) {
    console.error('获取科目统计失败:', error)
  } finally {
    loading.value = false
  }
}

// 进入试卷列表
const enterPaperList = (row: any) => {
  currentSubjectName.value = row.name
  queryParams.type = currentType.value
  queryParams.grade = currentGradeName.value
  queryParams.subject = currentSubjectName.value
  queryParams.pageNum = 1
  currentLevel.value = 4
  getList()
}

// 获取列表数据
const getList = async () => {
  loading.value = true
  try {
    const res = await getPaperListApi(queryParams)
    if (res) {
      paperList.value = res.records
      total.value = res.total
    }
  } finally {
    loading.value = false
  }
}

// 搜索查询
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置查询
const resetQuery = () => {
  queryParams.keyword = ''
  handleQuery()
}

// 状态切换
const handleStatusChange = async (row: any) => {
  try {
    await savePaperApi(row)
    ElMessage.success('操作成功')
  } catch (error) {
    row.isRecommend = !row.isRecommend
  }
}

// 重置表单
const resetForm = () => {
  form.value = {
    id: null,
    title: '',
    subject: currentSubjectName.value || '',
    grade: currentGradeName.value || '',
    year: new Date().getFullYear().toString(),
    type: currentType.value || 'FAMOUS',
    tags: '',
    filePath: '',
    isRecommend: false,
    sortOrder: 1
  }
  if (paperFormRef.value) {
    paperFormRef.value.resetFields()
  }
}

// 新增按钮
const handleAdd = () => {
  resetForm()
  dialog.title = '新增试卷'
  dialog.visible = true
}

// 编辑按钮
const handleEdit = (row: any) => {
  resetForm()
  form.value = { ...row }
  dialog.title = '编辑试卷'
  dialog.visible = true
}

// 删除按钮
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该试卷吗？', '警告', {
    type: 'warning'
  }).then(async () => {
    await deletePaperApi(row.id)
    ElMessage.success('删除成功')
    getList()
  })
}

// 提交表单
const submitForm = async () => {
  paperFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitLoading.value = true
      try {
        await savePaperApi(form.value)
        ElMessage.success('保存成功')
        dialog.visible = false
        getList()
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 上传相关
const beforeUpload = (file: any) => {
  const isLt50M = file.size / 1024 / 1024 < 50
  if (!isLt50M) {
    ElMessage.error('上传文件大小不能超过 50MB!')
  }
  return isLt50M
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
      ElMessage.success('文件上传成功')
    }
  } catch (error) {
    ElMessage.error('上传失败')
  } finally {
    uploadLoading.value = false
  }
}

// 科目管理
const handleSubjectManage = () => {
  subjectDialog.visible = true
  loadSubjects()
}

const loadSubjects = async () => {
  const res = await getSubjectsApi()
  subjects.value = res || []
}

const handleAddSubject = () => {
  subjectForm.value = {
    id: null,
    name: '',
    icon: '',
    color: '#409EFF',
    sortOrder: 0
  }
  subjectEditDialog.title = '新增科目'
  subjectEditDialog.visible = true
}

const handleEditSubject = (row: any) => {
  subjectForm.value = { ...row }
  subjectEditDialog.title = '编辑科目'
  subjectEditDialog.visible = true
}

const submitSubjectForm = async () => {
  await saveSubjectApi(subjectForm.value)
  ElMessage.success('保存成功')
  subjectEditDialog.visible = false
  loadSubjects()
}

const handleDeleteSubject = (row: any) => {
  ElMessageBox.confirm('确定删除该科目吗？', '提示').then(async () => {
    await deleteSubjectApi(row.id)
    ElMessage.success('删除成功')
    loadSubjects()
  })
}

const handleAddNewGrade = () => {
  ElMessageBox.prompt('请输入年级名称（如：高三）', '新增年级', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(({ value }) => {
    if (value) {
      if (!manualGrades[currentType.value]) {
        manualGrades[currentType.value] = []
      }
      if (!manualGrades[currentType.value].includes(value)) {
        manualGrades[currentType.value].push(value)
      }
      enterGrade({ id: currentType.value, name: currentTypeName.value })
    }
  })
}

onMounted(() => {
  loadTypeStats()
  loadSubjects()
})
</script>

<style scoped lang="scss">
.paper-manage {
  padding: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .title {
      font-size: 18px;
      font-weight: bold;
    }
  }

  .search-bar {
    margin-bottom: 20px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 4px;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
