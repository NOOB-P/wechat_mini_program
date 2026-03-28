<template>
  <div class="page-container">
    <el-row :gutter="20">
      <!-- 左侧：学校架构树 -->
      <el-col :span="16">
        <el-card shadow="never" class="tree-card">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold">学校架构管理</span>
              <el-button type="primary" @click="handleAddNode('school')">新增学校</el-button>
            </div>
          </template>
          <el-tree
            :data="treeData"
            :props="defaultProps"
            default-expand-all
            highlight-current
            :expand-on-click-node="false"
          >
            <template #default="{ node, data }">
              <span class="custom-tree-node">
                <div class="node-label">
                  <el-tag 
                    v-if="data.type === 'school'" 
                    size="small" 
                    type="primary" 
                    class="mr-2"
                  >学校</el-tag>
                  <el-tag 
                    v-else-if="data.type === 'grade'" 
                    size="small" 
                    type="success" 
                    class="mr-2"
                  >年级</el-tag>
                  <el-tag 
                    v-else-if="data.type === 'class'" 
                    size="small" 
                    type="warning" 
                    class="mr-2"
                  >班级</el-tag>
                  <span>{{ node.label }}</span>
                </div>
                <div class="node-actions">
                  <!-- 只有学校可以新增年级 -->
                  <el-button 
                    v-if="data.type === 'school'" 
                    type="primary" 
                    link 
                    size="small" 
                    @click.stop="handleAddNode('grade', data)"
                  >新增年级</el-button>
                  <!-- 只有年级可以新增班级 -->
                  <el-button 
                    v-if="data.type === 'grade'" 
                    type="primary" 
                    link 
                    size="small" 
                    @click.stop="handleAddNode('class', data)"
                  >新增班级</el-button>
                  
                  <el-button type="primary" link size="small" @click.stop="handleEditNode(data)">编辑</el-button>
                  <el-button type="danger" link size="small" @click.stop="handleDeleteNode(data)">删除</el-button>
                </div>
              </span>
            </template>
          </el-tree>
        </el-card>
      </el-col>

      <!-- 右侧：导入模块 -->
      <el-col :span="8">
        <el-card shadow="never" class="import-card">
          <template #header>
            <span class="font-bold">批量导入架构</span>
          </template>
          <div class="import-content">
            <el-alert
              title="导入说明"
              type="info"
              description="请先下载模板，按格式填写后上传 Excel 文件。系统将自动解析并更新学校架构。"
              show-icon
              :closable="false"
              class="mb-4"
            />
            <div class="flex flex-col items-center py-4">
              <el-upload
                class="upload-demo"
                drag
                action="#"
                :auto-upload="false"
                :on-change="handleFileChange"
                accept=".xlsx, .xls"
              >
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                  将文件拖到此处，或<em>点击上传</em>
                </div>
                <template #tip>
                  <div class="el-upload__tip text-center">
                    支持 .xlsx, .xls 格式文件，大小不超过 5MB
                  </div>
                </template>
              </el-upload>
              
              <div class="mt-4 w-full">
                <el-button type="primary" class="w-full" :loading="importLoading" @click="submitImport">
                  开始导入
                </el-button>
                <el-button type="default" class="w-full mt-2" @click="downloadTemplate">
                  下载导入模板
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 新增/编辑弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogTitle"
      width="450px"
    >
      <el-form :model="form" label-width="80px" ref="formRef" :rules="rules">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" :placeholder="`请输入${typeName}名称`" />
        </el-form-item>
        <el-form-item v-if="form.parentName" label="所属上级">
          <el-input v-model="form.parentName" disabled />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  fetchGetSchoolTree, 
  fetchAddNode, 
  fetchUpdateNode, 
  fetchDeleteNode,
  fetchImportExcel 
} from '@/api/core-business/school/index'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'

const treeData = ref<Api.School.ArchitectureNode[]>([])
const defaultProps = {
  children: 'children',
  label: 'name'
}

// 弹窗相关
const dialogVisible = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const isEdit = ref(false)
const form = ref<Api.School.NodeParams>({
  id: '',
  name: '',
  type: 'school',
  parentId: '',
  parentName: ''
})

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
}

const dialogTitle = computed(() => `${isEdit.value ? '编辑' : '新增'}${typeName.value}`)
const typeName = computed(() => {
  switch (form.value.type) {
    case 'school': return '学校'
    case 'grade': return '年级'
    case 'class': return '班级'
    default: return ''
  }
})

// 导入相关
const importLoading = ref(false)
const selectedFile = ref<File | null>(null)

const loadData = async () => {
  const res = await fetchGetSchoolTree()
  if (res.code === 200) {
    treeData.value = res.data
  }
}

// 节点操作
const handleAddNode = (type: Api.School.NodeType, parent?: Api.School.ArchitectureNode) => {
  isEdit.value = false
  form.value = {
    id: '',
    name: '',
    type,
    parentId: parent?.id || '',
    parentName: parent?.name || ''
  }
  dialogVisible.value = true
}

const handleEditNode = (data: Api.School.ArchitectureNode) => {
  isEdit.value = true
  form.value = {
    id: data.id,
    name: data.name,
    type: data.type,
    parentId: '', 
    parentName: ''
  }
  dialogVisible.value = true
}

const handleDeleteNode = (data: Api.School.ArchitectureNode) => {
  ElMessageBox.confirm(`确定要删除 ${data.name} 吗？如果其下有子节点也将一并删除。`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await fetchDeleteNode(data.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadData()
    }
  })
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        const action = isEdit.value ? fetchUpdateNode : fetchAddNode
        const res = await action(form.value)
        if (res.code === 200) {
          ElMessage.success(`${isEdit.value ? '修改' : '添加'}成功`)
          dialogVisible.value = false
          loadData()
        }
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 导入逻辑
const handleFileChange = (uploadFile: any) => {
  selectedFile.value = uploadFile.raw
}

const submitImport = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }
  importLoading.value = true
  try {
    const res = await fetchImportExcel(selectedFile.value)
    if (res.code === 200) {
      ElMessage.success('导入成功')
      loadData()
    }
  } finally {
    importLoading.value = false
  }
}

const downloadTemplate = () => {
  ElMessage.info('正在下载模板...')
  // 模拟下载
  setTimeout(() => {
    ElMessage.success('模板下载完成')
  }, 1000)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 120px);
}

.tree-card, .import-card {
  height: 100%;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.node-label {
  display: flex;
  align-items: center;
}

.mr-2 {
  margin-right: 8px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-4 {
  margin-top: 16px;
}

.mt-2 {
  margin-top: 8px;
}

.w-full {
  width: 100%;
}

.import-content {
  display: flex;
  flex-direction: column;
}

:deep(.el-upload-dragger) {
  width: 100%;
}
</style>
