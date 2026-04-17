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
          <div class="flex items-center">
            <span class="font-bold mr-4">班级管理</span>
            <el-tag v-if="currentSchoolName" type="warning" effect="plain" class="ml-2">
              当前学校: {{ currentSchoolName }}
            </el-tag>
          </div>
          <div>
            <el-button 
              v-if="!isBatchDeleting"
              type="danger"
              @click="isBatchDeleting = true"
            >
              批量删除
            </el-button>
            <el-button 
              v-else
              :type="selectedIds.length > 0 ? 'danger' : 'default'"
              @click="handleBatchDelete"
            >
              {{ selectedIds.length > 0 ? '开始删除' : '取消删除' }}
            </el-button>
            <el-button @click="handleBatchImport">批量导入</el-button>
            <el-button @click="handleBatchAdd">批量添加</el-button>
            <el-button type="primary" @click="handleAddClass">添加班级</el-button>
          </div>
        </div>
      </template>

      <el-table 
        :data="tableData" 
        border 
        style="width: 100%" 
        v-loading="loading"
        height="380"
        @selection-change="handleSelectionChange"
      >
        <el-table-column v-if="isBatchDeleting" type="selection" width="55" align="center" />
        <el-table-column prop="id" label="内部ID" width="80" align="center" />
        <el-table-column prop="classid" label="班级唯一标识" width="220" align="center" />
        <el-table-column prop="schoolId" label="关联学校(schoolId)" width="200" align="center" />
        <el-table-column prop="grade" label="年级" width="100" align="center" />
        <el-table-column prop="alias" label="班级" min-width="150" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEnterClass(row)">进入</el-button>
            <el-button type="primary" link size="small" @click="handleEditClass(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDeleteClass(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container mt-auto flex justify-end pt-4">
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
        <el-form-item label="年级" prop="grade">
          <el-select v-model="formData.grade" placeholder="请选择年级" class="w-full">
            <el-option
              v-for="item in gradeOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="班级" prop="alias">
          <el-input v-model="formData.alias" placeholder="请输入班级名称 (如: 1班, 理科班)" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 弹窗：批量添加 -->
    <el-dialog
      v-model="batchAddVisible"
      title="批量添加班级"
      width="500px"
      @close="resetBatchAddForm"
    >
      <el-form
        ref="batchAddFormRef"
        :model="batchAddForm"
        :rules="batchAddRules"
        label-width="100px"
      >
        <el-form-item label="年级" prop="grade">
          <el-select v-model="batchAddForm.grade" placeholder="请选择年级" class="w-full">
            <el-option
              v-for="item in gradeOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="班级格式" prop="format">
          <template #label>
            <div class="flex items-center">
              <span>班级格式</span>
              <el-tooltip content="使用 $ 代表班级序号。例如输入 '$班'，配合范围 1-10，将生成 '1班' 到 '10班'" placement="top">
                <el-icon class="ml-1 cursor-pointer text-gray-400"><info-filled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <el-input v-model="batchAddForm.format" placeholder="例如: $班" />
        </el-form-item>
        <el-form-item label="班级范围">
          <div class="flex items-center">
            <el-input-number v-model="batchAddForm.classStart" :min="1" />
            <span class="mx-2 px-2">-</span>
            <el-input-number v-model="batchAddForm.classEnd" :min="1" />
          </div>
          <div class="text-xs text-gray-400 mt-1">配合班级格式，将生成对应的班级名称</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchAddVisible = false">取消</el-button>
          <el-button type="primary" @click="handleBatchAddSubmit" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 弹窗：导入班级 -->
    <el-dialog v-model="importVisible" title="导入班级数据" width="550px">
      <div class="import-container" style="padding: 0 10px;">
        <div class="flex justify-start mb-4">
          <el-tooltip placement="right" effect="light">
            <template #content>
              <div class="text-xs leading-6 text-gray-600 p-2">
                <p>1. 请先<b>下载班级导入模板压缩包</b>，压缩包内包含班级、班级-学生两种模板。</p>
                <p>2. 上传流程统一为<b>上传-校验-处理</b>，系统会严格校验表头顺序和必填项。</p>
                <p>3. 使用班级模板时，当前页面所属学校会作为导入归属学校，并自动建立班级、学生关联。</p>
              </div>
            </template>
            <div class="instructions-trigger" style="display: flex; align-items: center; font-size: 13px; color: #409eff; cursor: help; padding: 4px 8px; background-color: #ecf5ff; border-radius: 4px;">
              <el-icon class="mr-1"><info-filled /></el-icon>
              <span>导入操作说明 (鼠标悬停查看)</span>
            </div>
          </el-tooltip>
        </div>
        
        <el-upload
          ref="uploadRef"
          class="upload-demo"
          drag
          action="#"
          multiple
          :auto-upload="false"
          :on-change="handleFileChange"
          :file-list="fileList"
          :on-remove="handleRemove"
          :show-file-list="false"
          accept=".xlsx, .xls"
        >
          <div v-if="fileList.length === 0" class="upload-empty-content" style="padding: 40px 0; text-align: center;">
            <el-icon class="el-icon--upload" style="font-size: 48px; color: #8c939d;"><upload-filled /></el-icon>
            <div class="el-upload__text mt-2">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <div class="el-upload__tip mt-2 text-gray-400">
              仅支持 .xlsx / .xls 格式文件
            </div>
          </div>
          
          <div v-else class="upload-list-content" @click.stop>
            <div class="flex justify-between items-center mb-2 px-2">
              <span class="text-xs font-bold text-gray-500">待处理队列 ({{ fileList.length }})</span>
              <el-button link type="danger" size="small" @click="fileList = []">清空</el-button>
            </div>
            <el-table :data="fileList" size="small" border max-height="180">
              <el-table-column prop="name" label="文件名" show-overflow-tooltip />
              <el-table-column label="状态" width="90" align="center">
                <template #default="{ row }">
                  <div class="flex justify-center items-center">
                    <el-tag v-if="row.status === 'ready'" type="info" size="small">等待中</el-tag>
                    <el-tag v-else-if="row.status === 'success'" type="success" size="small">已导入</el-tag>
                    <el-tag v-else-if="row.status === 'fail'" type="danger" size="small">失败</el-tag>
                    <el-tag v-else type="primary" size="small">
                      <el-icon class="is-loading"><loading /></el-icon>
                    </el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="50" align="center">
                <template #default="{ $index }">
                  <el-button link type="danger" :icon="Delete" @click="fileList.splice($index, 1)" />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-upload>

        <div class="mt-8 flex flex-col gap-3">
          <el-button 
            type="primary" 
            size="large"
            class="w-full" 
            :loading="importLoading" 
            :disabled="fileList.length === 0"
            @click="submitImport"
          >
            <template #icon v-if="!importLoading">
              <el-icon><upload /></el-icon>
            </template>
            {{ importLoading ? '正在上传-校验-处理...' : '确认开始批量导入' }}
          </el-button>
          <div class="flex justify-center mt-1">
            <el-button link type="primary" @click="fetchDownloadClassTemplate" style="font-size: 13px;">
              <el-icon class="mr-1"><document /></el-icon>还没有模板？点击下载班级导入模板.zip
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getClassList, addClass, updateClass, deleteClass, batchDeleteClasses, batchAddClasses, fetchImportClass, fetchDownloadClassTemplate } from '@/api/core-business/sys-class'
import { 
  UploadFilled, 
  Loading as LoadingIcon, 
  Delete,
  Upload,
  Document,
  InfoFilled
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const searchForm = reactive({
  classid: '',
  grade: '',
  schoolId: (route.query.schoolId as string) || ''
})

const currentSchoolName = ref((route.query.schoolName as string) || '')

const tableData = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const batchAddVisible = ref(false)
const batchAddFormRef = ref<FormInstance>()
const batchAddForm = reactive({
  schoolId: (route.query.schoolId as string) || '',
  grade: '',
  format: '$班',
  classStart: 1,
  classEnd: 10
})

const batchAddRules = reactive<FormRules>({
  grade: [{ required: true, message: '请选择年级', trigger: 'change' }],
  format: [{ required: true, message: '请输入班级格式', trigger: 'blur' }]
})

const importVisible = ref(false)
const importLoading = ref(false)
const fileList = ref<any[]>([])
const uploadRef = ref<any>()

const gradeOptions = [
  '一年级', '二年级', '三年级', '四年级', '五年级', '六年级',
  '初一', '初二', '初三',
  '高一', '高二', '高三'
]

const formData = reactive({
  id: undefined as number | undefined,
  classid: '',
  schoolId: (route.query.schoolId as string) || '',
  grade: '',
  alias: ''
})

const rules = reactive<FormRules>({
  schoolId: [{ required: true, message: '请输入关联学校唯一标识(school_id)', trigger: 'blur' }],
  grade: [{ required: true, message: '请输入年级', trigger: 'blur' }]
})

const fetchList = async () => {
  loading.value = true
  try {
    const res: any = await getClassList({
      page: page.value,
      size: pageSize.value,
      classid: searchForm.classid || undefined,
      grade: searchForm.grade || undefined,
      schoolId: searchForm.schoolId || undefined
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
  const currentSchoolId = route.query.schoolId as string
  if (!currentSchoolId) {
    ElMessage.warning('请先从学校管理进入指定学校的班级列表，再添加班级！')
    return
  }
  dialogType.value = 'add'
  formData.id = undefined
  formData.classid = ''
  formData.schoolId = currentSchoolId
  formData.grade = ''
  formData.alias = ''
  dialogVisible.value = true
}

const handleEditClass = (row: any) => {
  dialogType.value = 'edit'
  formData.id = row.id
  formData.classid = row.classid
  formData.schoolId = row.schoolId || ''
  formData.grade = row.grade
  formData.alias = row.alias
  dialogVisible.value = true
}

const handleEnterClass = (row: any) => {
  const schoolId = row.schoolId || searchForm.schoolId
  const classId = row.classid
  if (classId) {
    router.push({
      path: '/core-business/student',
      query: { 
        schoolId, 
        classId,
        schoolName: currentSchoolName.value,
        className: `${row.grade}${row.alias}`
      }
    })
  } else {
    ElMessage.warning('无法获取班级ID')
  }
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

const handleBatchAdd = () => {
  if (!route.query.schoolId) {
    ElMessage.warning('请先从学校管理进入指定学校的班级列表，再批量添加班级！')
    return
  }
  batchAddVisible.value = true
}

const resetBatchAddForm = () => {
  if (batchAddFormRef.value) {
    batchAddFormRef.value.resetFields()
  }
  batchAddForm.schoolId = (route.query.schoolId as string) || ''
  batchAddForm.grade = ''
  batchAddForm.format = '$班'
  batchAddForm.classStart = 1
  batchAddForm.classEnd = 10
}

const handleBatchAddSubmit = async () => {
  if (!batchAddFormRef.value) return
  await batchAddFormRef.value.validate(async (valid) => {
    if (valid) {
      if (!batchAddForm.schoolId) {
        ElMessage.error('缺失关联学校ID，请从学校管理进入当前页面')
        return
      }
      if (batchAddForm.classEnd < batchAddForm.classStart) {
        ElMessage.error('班级范围无效')
        return
      }
      if (!batchAddForm.format.includes('$')) {
        ElMessage.error('班级格式必须包含 $ 符号')
        return
      }
      
      submitLoading.value = true
      try {
        await batchAddClasses(batchAddForm)
        ElMessage.success('批量添加成功')
        batchAddVisible.value = false
        fetchList()
      } catch (error: any) {
        ElMessage.error(error.message || '批量添加失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 批量导入
const handleBatchImport = () => {
  importVisible.value = true
  fileList.value = []
}

const downloadTemplate = () => {
  fetchDownloadClassTemplate()
}

const handleFileChange = (file: any, files: any[]) => {
  if (file.status === 'ready') {
    fileList.value = files.map((f: any) => {
      if (!f.status) f.status = 'ready'
      return f
    })
  }
}

const handleRemove = (file: any, files: any[]) => {
  fileList.value = files
}

const submitImport = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择要导入的文件')
    return
  }

  const pendingFiles = fileList.value.filter(f => f.status === 'ready' || f.status === 'fail')
  if (pendingFiles.length === 0) {
    ElMessage.success('所有文件均已导入成功')
    return
  }

  importLoading.value = true
  
  for (const file of pendingFiles) {
    file.status = 'uploading'
    try {
      await fetchImportClass(file.raw, searchForm.schoolId || undefined)
      file.status = 'success'
    } catch (error: any) {
      file.status = 'fail'
      file.errorMsg = error.message || '解析或导入失败'
      ElMessage.error(`文件 ${file.name} 导入失败: ${file.errorMsg}`)
    }
  }

  importLoading.value = false
  
  const allSuccess = fileList.value.every(f => f.status === 'success')
  if (allSuccess) {
    ElMessage.success('所有文件导入成功')
    setTimeout(() => {
      importVisible.value = false
      fetchList()
    }, 1000)
  } else {
    fetchList()
  }
}

const selectedIds = ref<number[]>([])
const isBatchDeleting = ref(false)

const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map(item => item.id)
}

const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) {
    // 没选择时点击，表示取消删除，退出批量删除模式
    isBatchDeleting.value = false
    selectedIds.value = []
    return
  }
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedIds.value.length} 个班级吗？`,
    '批量删除警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const res: any = await batchDeleteClasses(selectedIds.value)
      console.log('班级批量删除返回数据:', res)
      
      let msg = ''
      if (typeof res === 'string') {
        msg = res
      } else {
        msg = res?.msg || res?.data?.msg
      }
      
      console.log('后端返回的详细 msg:', msg)
      
      if (msg && msg.includes('未能删除')) {
        ElMessage.warning(msg)
      } else {
        ElMessage.success(msg || '批量删除成功')
      }
      selectedIds.value = []
      isBatchDeleting.value = false
      fetchList()
    } catch (error: any) {
      console.error('班级批量删除异常:', error)
      ElMessage.error(error.message || '批量删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 120px);
}
.main-card {
  height: 550px;
  display: flex;
  flex-direction: column;
}
:deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
.import-container {
  padding: 0 10px;
}
.instructions-trigger:hover {
  background-color: #d9ecff;
}
</style>
