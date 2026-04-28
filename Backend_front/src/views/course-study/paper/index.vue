<template>
  <div class="paper-manage">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">名校试卷管理</span>
          <div class="actions">
            <el-button type="success" @click="handleSubjectManage">全局科目管理</el-button>
            <el-button type="primary" @click="handleAdd">新增试卷</el-button>
          </div>
        </div>
      </template>

      <div class="search-bar">
        <el-form :inline="true" :model="queryParams">
          <el-form-item label="类型">
            <el-select v-model="queryParams.type" placeholder="全部类型" clearable style="width: 160px">
              <el-option v-for="item in paperTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="年级">
            <el-select
              v-model="queryParams.grade"
              placeholder="全部年级"
              clearable
              filterable
              style="width: 160px"
            >
              <el-option v-for="item in gradeOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item label="科目">
            <el-select
              v-model="queryParams.subject"
              placeholder="全部科目"
              clearable
              filterable
              style="width: 160px"
            >
              <el-option v-for="item in subjects" :key="item.id" :label="item.name" :value="item.name" />
            </el-select>
          </el-form-item>
          <el-form-item label="推荐">
            <el-select v-model="queryParams.isRecommend" placeholder="全部" clearable style="width: 120px">
              <el-option label="推荐" :value="true" />
              <el-option label="不推荐" :value="false" />
            </el-select>
          </el-form-item>
          <el-form-item label="关键词">
            <el-input
              v-model="queryParams.keyword"
              placeholder="搜索标题"
              clearable
              style="width: 220px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="paperList" v-loading="loading" border stripe>
        <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
        <el-table-column prop="title" label="试卷标题" min-width="260" show-overflow-tooltip />
        <el-table-column label="类型" width="120" align="center">
          <template #default="{ row }">
            <span>{{ getTypeLabel(row.type) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="grade" label="年级" min-width="110" align="center" show-overflow-tooltip />
        <el-table-column prop="subject" label="科目" width="110" align="center" />
        <el-table-column prop="year" label="年份" width="100" align="center" />
        <el-table-column prop="downloads" label="下载量" width="100" align="center" />
        <el-table-column prop="isRecommend" label="推荐" width="90" align="center">
          <template #default="{ row }">
            <span>{{ row.isRecommend ? '是' : '否' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

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

    <el-dialog :title="dialog.title" v-model="dialog.visible" width="600px" append-to-body>
      <el-form ref="paperFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="试卷标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入试卷标题" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="科目" prop="subject">
              <el-input
                v-model="form.subject"
                placeholder="请选择科目"
                readonly
                @click="openSubjectPicker"
                class="cursor-pointer"
              >
                <template #suffix>
                  <el-icon class="cursor-pointer" @click.stop="openSubjectPicker"><ArrowRight /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年级" prop="grade">
              <el-select v-model="form.grade" placeholder="请选择年级" style="width: 100%">
                <el-option v-for="item in formGradeOptions" :key="item" :label="item" :value="item" />
              </el-select>
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
                <el-option v-for="item in paperTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
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
            <el-radio :value="true">推荐</el-radio>
            <el-radio :value="false">不推荐</el-radio>
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

    <el-dialog
      v-model="subjectPickerVisible"
      title="选择学科"
      width="520px"
      append-to-body
      align-center
      class="subject-select-dialog"
    >
      <div class="subject-select-content">
        <el-input
          v-model="subjectSearchKeyword"
          placeholder="搜索学科"
          clearable
          :prefix-icon="Search"
          class="mb-4"
        />
        <div class="subject-grid">
          <div
            v-for="item in filteredSubjectOptions"
            :key="item"
            class="subject-item"
            :class="{ active: form.subject === item }"
            @click="selectSubject(item)"
          >
            {{ item }}
            <el-icon v-if="form.subject === item" class="check-icon"><Check /></el-icon>
          </div>
        </div>
      </div>
    </el-dialog>

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
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowRight, Check, Search } from '@element-plus/icons-vue'
import {
  deletePaperApi,
  deleteSubjectApi,
  getGradeStatsApi,
  getPaperListApi,
  getSubjectsApi,
  savePaperApi,
  saveSubjectApi,
  uploadPaperApi
} from '@/api/course-study/paper'

type PaperTypeValue = 'FAMOUS' | 'MONTHLY' | 'JOINT'

const paperTypeOptions: Array<{ label: string; value: PaperTypeValue }> = [
  { label: '名校试卷', value: 'FAMOUS' },
  { label: '月考试卷', value: 'MONTHLY' },
  { label: '联考试卷', value: 'JOINT' }
]

const defaultSubjectOptions = [
  '语文',
  '数学',
  '英语',
  '物理',
  '化学',
  '生物',
  '政治',
  '历史',
  '地理',
  '科学',
  '信息技术',
  '音乐',
  '美术',
  '体育',
  '劳动',
  '综合实践'
]

const formGradeOptions = [
  '一年级',
  '二年级',
  '三年级',
  '四年级',
  '五年级',
  '六年级',
  '初一',
  '初二',
  '初三',
  '七年级',
  '八年级',
  '九年级',
  '高一',
  '高二',
  '高三'
]

const paperTypeLabelMap = paperTypeOptions.reduce<Record<string, string>>((map, item) => {
  map[item.value] = item.label
  return map
}, {})

const loading = ref(false)
const uploadLoading = ref(false)
const submitLoading = ref(false)
const total = ref(0)
const paperList = ref<any[]>([])
const subjects = ref<any[]>([])
const gradeOptions = ref<string[]>([])

const gradeWeightMap: Record<string, number> = {
  '一年级': 10,
  '小学一年级': 10,
  '二年级': 20,
  '小学二年级': 20,
  '三年级': 30,
  '小学三年级': 30,
  '四年级': 40,
  '小学四年级': 40,
  '五年级': 50,
  '小学五年级': 50,
  '六年级': 60,
  '小学六年级': 60,
  '初一': 70,
  '七年级': 70,
  '初二': 80,
  '八年级': 80,
  '初三': 90,
  '九年级': 90,
  '高一': 100,
  '高二': 110,
  '高三': 120
}

const queryParams = reactive<{
  pageNum: number
  pageSize: number
  keyword: string
  subject: string
  grade: string
  type: string
  isRecommend: boolean | null
}>({
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
  id: null as number | null,
  title: '',
  subject: '',
  grade: '',
  year: '',
  type: 'FAMOUS' as PaperTypeValue,
  tags: '',
  filePath: '',
  isRecommend: false,
  sortOrder: 1
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  subject: [{ required: true, message: '请选择科目', trigger: 'change' }],
  grade: [{ required: true, message: '请选择年级', trigger: 'change' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }]
}

const paperFormRef = ref()
const subjectPickerVisible = ref(false)
const subjectSearchKeyword = ref('')

const subjectDialog = reactive({
  visible: false
})

const subjectEditDialog = reactive({
  title: '',
  visible: false
})

const subjectForm = ref({
  id: null as number | null,
  name: '',
  icon: '',
  color: '#409EFF',
  sortOrder: 0
})

const subjectPickerOptions = computed(() => {
  const names = subjects.value.map((item) => item.name).filter(Boolean)
  return Array.from(new Set([...names, ...defaultSubjectOptions]))
})

const filteredSubjectOptions = computed(() => {
  const keyword = subjectSearchKeyword.value.trim()
  if (!keyword) {
    return subjectPickerOptions.value
  }
  return subjectPickerOptions.value.filter((item) => item.includes(keyword))
})

const getGradeWeight = (name: string) => {
  for (const key in gradeWeightMap) {
    if (name.includes(key)) {
      return gradeWeightMap[key]
    }
  }
  return 999
}

const getTypeLabel = (type: string) => paperTypeLabelMap[type] || type || '-'

const loadGradeOptions = async () => {
  try {
    const results = await Promise.allSettled(paperTypeOptions.map((item) => getGradeStatsApi(item.value)))
    const grades = new Set<string>()
    results.forEach((result) => {
      if (result.status !== 'fulfilled' || !Array.isArray(result.value)) {
        return
      }
      result.value.forEach((item: any) => {
        if (item?.name) {
          grades.add(item.name)
        }
      })
    })
    gradeOptions.value = Array.from(grades).sort((a, b) => {
      const weightDiff = getGradeWeight(a) - getGradeWeight(b)
      return weightDiff !== 0 ? weightDiff : a.localeCompare(b, 'zh-CN')
    })
  } catch (error) {
    console.error('获取年级筛选项失败:', error)
  }
}

const getList = async () => {
  loading.value = true
  try {
    const res = await getPaperListApi(queryParams)
    paperList.value = res?.records || []
    total.value = res?.total || 0
  } finally {
    loading.value = false
  }
}

const loadSubjects = async () => {
  const res = await getSubjectsApi()
  subjects.value = res || []
}

const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

const resetQuery = () => {
  queryParams.keyword = ''
  queryParams.subject = ''
  queryParams.grade = ''
  queryParams.type = ''
  queryParams.isRecommend = null
  handleQuery()
}

const resetForm = () => {
  form.value = {
    id: null,
    title: '',
    subject: queryParams.subject || '',
    grade: queryParams.grade || '',
    year: new Date().getFullYear().toString(),
    type: (queryParams.type as PaperTypeValue) || 'FAMOUS',
    tags: '',
    filePath: '',
    isRecommend: false,
    sortOrder: 1
  }
  subjectSearchKeyword.value = ''
  paperFormRef.value?.clearValidate()
}

const handleAdd = () => {
  resetForm()
  dialog.title = '新增试卷'
  dialog.visible = true
}

const handleEdit = (row: any) => {
  form.value = {
    id: row.id ?? null,
    title: row.title || '',
    subject: row.subject || '',
    grade: row.grade || '',
    year: row.year || '',
    type: row.type || 'FAMOUS',
    tags: row.tags || '',
    filePath: row.filePath || '',
    isRecommend: !!row.isRecommend,
    sortOrder: row.sortOrder || 1
  }
  subjectSearchKeyword.value = ''
  paperFormRef.value?.clearValidate()
  dialog.title = '编辑试卷'
  dialog.visible = true
}

const openSubjectPicker = () => {
  subjectSearchKeyword.value = ''
  subjectPickerVisible.value = true
}

const selectSubject = (subject: string) => {
  form.value.subject = subject
  subjectPickerVisible.value = false
  paperFormRef.value?.validateField?.('subject')
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该试卷吗？', '警告', {
    type: 'warning'
  }).then(async () => {
    await deletePaperApi(row.id)
    ElMessage.success('删除成功')
    getList()
    loadGradeOptions()
  })
}

const submitForm = async () => {
  paperFormRef.value.validate(async (valid: boolean) => {
    if (!valid) {
      return
    }
    submitLoading.value = true
    try {
      await savePaperApi(form.value)
      ElMessage.success('保存成功')
      dialog.visible = false
      await Promise.all([getList(), loadGradeOptions()])
    } finally {
      submitLoading.value = false
    }
  })
}

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

const handleSubjectManage = () => {
  subjectDialog.visible = true
  loadSubjects()
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
    await loadSubjects()
    if (queryParams.subject === row.name) {
      queryParams.subject = ''
      getList()
    }
  })
}

onMounted(() => {
  getList()
  loadSubjects()
  loadGradeOptions()
})
</script>

<style scoped lang="scss">
.paper-manage {
  padding: 20px;

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .title {
      font-size: 18px;
      font-weight: bold;
    }

    .actions {
      display: flex;
      gap: 12px;
    }
  }

  .search-bar {
    margin-bottom: 20px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 4px;
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
}

.cursor-pointer {
  cursor: pointer;

  :deep(input) {
    cursor: pointer;
  }
}

.subject-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding: 4px;
}

.subject-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;

  &:hover {
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary);
  }

  &.active {
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary);
    font-weight: bold;
  }
}

.check-icon {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 12px;
}
</style>
