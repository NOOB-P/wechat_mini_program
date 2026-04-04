<template>
  <div class="page-container">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card mb-4">
      <el-form :inline="true" :model="searchForm" class="search-form-inline">
        <el-form-item label="综合搜索">
          <el-input 
            v-model="searchForm.keyword" 
            placeholder="搜索学校/省份/城市" 
            clearable 
            @keyup.enter="handleSearch"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="省份">
          <el-select v-model="searchForm.province" placeholder="请选择省份" clearable @change="handleProvinceChange" style="width: 150px">
            <el-option v-for="p in provinces" :key="p" :label="p" :value="p" />
          </el-select>
        </el-form-item>
        <el-form-item label="城市">
          <el-select v-model="searchForm.city" placeholder="请选择城市" clearable :disabled="!searchForm.province" @change="handleCityChange" style="width: 150px">
            <el-option v-for="c in cities" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="学校">
          <el-select v-model="searchForm.name" placeholder="请选择学校" clearable :disabled="!searchForm.city" style="width: 200px">
            <el-option v-for="s in schoolsInCity" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="20">
      <!-- 左侧：学校架构展示 -->
      <el-col :span="16">
        <el-card shadow="never" class="main-card">
          <template #header>
            <div class="flex justify-between items-center">
              <div class="flex items-center">
                <span class="font-bold mr-4">学校架构管理</span>
                <el-radio-group v-model="viewType" size="small">
                  <el-radio-button label="tree">树形视图</el-radio-button>
                  <el-radio-button label="list">列表视图</el-radio-button>
                </el-radio-group>
              </div>
              <el-button type="primary" @click="handleAddSchool">添加学校</el-button>
            </div>
          </template>

          <!-- 树形视图 -->
          <div v-if="viewType === 'tree'" class="tree-container">
            <el-tree
              ref="treeRef"
              :data="treeData"
              :props="defaultProps"
              default-expand-all
              highlight-current
              :expand-on-click-node="false"
              :filter-node-method="filterNode"
            >
              <template #default="{ node, data }">
                <span class="custom-tree-node">
                  <div class="node-label">
                    <el-tag 
                      v-if="data.type === 'province'" 
                      size="small" 
                      type="danger" 
                      class="mr-2"
                    >省份</el-tag>
                    <el-tag 
                      v-else-if="data.type === 'city'" 
                      size="small" 
                      type="info" 
                      class="mr-2"
                    >城市</el-tag>
                    <el-tag 
                      v-else-if="data.type === 'school'" 
                      size="small" 
                      type="primary" 
                      class="mr-2"
                    >学校</el-tag>
                    <span>{{ node.label }}</span>
                  </div>
                </span>
              </template>
            </el-tree>
          </div>

          <!-- 列表视图 -->
          <div v-else class="list-container">
            <el-table 
              :data="listData" 
              border 
              style="width: 100%" 
              v-loading="loading"
              height="400"
            >
              <el-table-column prop="province" label="省份" width="120" align="center" />
              <el-table-column prop="city" label="城市" width="120" align="center" />
              <el-table-column prop="name" label="学校名称" min-width="200" />
              <el-table-column label="操作" width="150" align="center" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" link size="small" @click="handleEditSchool(row)">编辑</el-button>
                  <el-button type="danger" link size="small" @click="handleDeleteSchool(row)">删除</el-button>
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
          </div>
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
              
              <div class="import-buttons mt-6">
                <el-button type="primary" :loading="importLoading" @click="submitImport">
                  开始导入
                </el-button>
                <el-button @click="downloadTemplate">
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
        <el-form-item label="省份" prop="province">
          <el-input v-model="form.province" placeholder="请输入省份" />
        </el-form-item>
        <el-form-item label="城市" prop="city">
          <el-input v-model="form.city" placeholder="请输入城市" />
        </el-form-item>
        <el-form-item label="学校名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入学校名称" />
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
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { 
  fetchGetSchoolTree, 
  fetchGetSchoolList,
  fetchAddSchool, 
  fetchUpdateSchool, 
  fetchDeleteSchool,
  fetchImportExcel 
} from '@/api/core-business/school/index'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'

const viewType = ref<'tree' | 'list'>('tree')
const loading = ref(false)
const treeRef = ref<any>(null)
const treeData = ref<Api.School.ArchitectureNode[]>([])
const listData = ref<any[]>([])
const allSchools = ref<any[]>([]) // 存储原始所有数据，用于筛选
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const defaultProps = {
  children: 'children',
  label: 'name'
}

// 搜索相关
const searchForm = ref({
  keyword: '',
  province: '',
  city: '',
  name: ''
})

// 三级联动数据
const provinces = computed(() => {
  const set = new Set(allSchools.value.map(s => s.province).filter(Boolean))
  return Array.from(set)
})

const cities = computed(() => {
  if (!searchForm.value.province) return []
  const set = new Set(
    allSchools.value
      .filter(s => s.province === searchForm.value.province)
      .map(s => s.city)
      .filter(Boolean)
  )
  return Array.from(set)
})

const schoolsInCity = computed(() => {
  if (!searchForm.value.city) return []
  return allSchools.value
    .filter(s => s.province === searchForm.value.province && s.city === searchForm.value.city)
    .map(s => s.name)
})

const handleProvinceChange = () => {
  searchForm.value.city = ''
  searchForm.value.name = ''
}

const handleCityChange = () => {
  searchForm.value.name = ''
}

const filterNode = (value: any, data: any, node: any) => {
  if (!value) return true
  
  const { keyword, province, city, name } = value

  // 定义一个递归函数，检查当前节点或其子节点是否匹配所有筛选条件
  const checkMatch = (d: any, n: any): boolean => {
    let m = true
    
    // 1. 综合搜索
    if (keyword) {
      m = m && d.name.toLowerCase().includes(keyword.toLowerCase())
    }
    
    // 2. 省份筛选
    if (province) {
      // 检查当前节点是否属于该省份，或者当前节点本身就是该省份
      let current = n
      let provinceMatch = false
      while (current && current.data) {
        if (current.data.type === 'province' && current.data.name === province) {
          provinceMatch = true
          break
        }
        current = current.parent
      }
      m = m && provinceMatch
    }
    
    // 3. 城市筛选
    if (city) {
      let current = n
      let cityMatch = false
      while (current && current.data) {
        if (current.data.type === 'city' && current.data.name === city) {
          cityMatch = true
          break
        }
        current = current.parent
      }
      m = m && cityMatch
    }
    
    // 4. 学校名称筛选
    if (name) {
      m = m && (d.type === 'school' && d.name === name)
    }
    
    return m
  }

  // 如果当前节点匹配，则返回 true
  if (checkMatch(data, node)) return true

  // 如果当前节点不匹配，但它的任何子节点匹配，也应该返回 true（显示父节点）
  const hasMatchingChild = (children: any[]): boolean => {
    if (!children) return false
    // 注意：这里需要构造虚拟的 node 对象来配合 checkMatch，或者简化逻辑
    // 对于 el-tree，如果子节点匹配，父节点会自动显示。
    // 所以我们只需要判断：
    // 如果是省份节点，且筛选了城市/学校，只要它下面有匹配的城市/学校，它就应该显示。
    return children.some(child => {
      // 递归检查子节点
      let childMatch = true
      if (keyword) childMatch = childMatch && child.name.toLowerCase().includes(keyword.toLowerCase())
      if (province) {
        // 这里的逻辑有点绕，因为 province 是顶层。
        // 如果当前是省份节点，我们已经检查过了。
      }
      // 简化逻辑：如果子节点名称匹配 keyword，或者子节点是指定的 city/name
      if (keyword && child.name.toLowerCase().includes(keyword.toLowerCase())) return true
      if (city && child.type === 'city' && child.name === city) return true
      if (name && child.type === 'school' && child.name === name) return true
      
      return hasMatchingChild(child.children)
    })
  }

  return hasMatchingChild(data.children)
}

const handleSearch = () => {
  if (viewType.value === 'tree') {
    treeRef.value?.filter(searchForm.value)
  } else {
    loadData()
  }
}

const resetSearch = () => {
  searchForm.value = {
    keyword: '',
    province: '',
    city: '',
    name: ''
  }
  if (viewType.value === 'tree') {
    treeRef.value?.filter(null)
  } else {
    loadData()
  }
}

// 弹窗相关
const dialogVisible = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const isEdit = ref(false)
const form = ref({
  id: '',
  province: '',
  city: '',
  name: ''
})

const rules = {
  province: [{ required: true, message: '请输入省份', trigger: 'blur' }],
  city: [{ required: true, message: '请输入城市', trigger: 'blur' }],
  name: [{ required: true, message: '请输入学校名称', trigger: 'blur' }]
}

const dialogTitle = computed(() => `${isEdit.value ? '编辑' : '添加'}学校`)

// 导入相关
const importLoading = ref(false)
const selectedFile = ref<File | null>(null)

const loadData = async (forceRefetchAll = false) => {
  loading.value = true
  try {
    // 始终加载全量数据用于筛选框下拉列表（仅在第一次或数据变动时加载）
    if (allSchools.value.length === 0 || forceRefetchAll) {
      const allRes = await fetchGetSchoolList({ current: 1, size: 10000 })
      if (allRes && allRes.records) {
        allSchools.value = allRes.records
      } else if (allRes && allRes.code === 200) {
        allSchools.value = allRes.data.records
      } else {
        allSchools.value = Array.isArray(allRes) ? allRes : (allRes?.data || [])
      }
    }

    if (viewType.value === 'tree') {
      const res = await fetchGetSchoolTree()
      if (Array.isArray(res)) {
        treeData.value = res
      } else if (res && res.code === 200) {
        treeData.value = res.data
      }
      // 如果存在搜索条件，则重新应用过滤
      if (searchForm.value.keyword || searchForm.value.province || searchForm.value.city || searchForm.value.name) {
        nextTick(() => {
          treeRef.value?.filter(searchForm.value)
        })
      }
    } else {
      const res = await fetchGetSchoolList({
        current: page.value,
        size: pageSize.value,
        keyword: searchForm.value.keyword,
        province: searchForm.value.province,
        city: searchForm.value.city,
        name: searchForm.value.name
      })
      if (res && res.records) {
        listData.value = res.records
        total.value = res.total
      } else if (res && res.code === 200) {
        listData.value = res.data.records
        total.value = res.data.total
      }
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  page.value = 1
  loadData()
}

const handleCurrentChange = (val: number) => {
  page.value = val
  loadData()
}

watch(viewType, (newVal) => {
  if (newVal === 'list' && listData.value.length === 0) {
    loadData()
  }
})

// 节点操作
const handleAddSchool = () => {
  isEdit.value = false
  form.value = {
    id: '',
    province: '',
    city: '',
    name: ''
  }
  dialogVisible.value = true
}

const handleEditSchool = (data: any) => {
  isEdit.value = true
  // 如果是树节点，需要尝试从 listData 中获取完整的省市信息
  let schoolInfo = { ...data }
  if (!data.province) {
    const found = listData.value.find(s => s.id === data.id)
    if (found) {
      schoolInfo = { ...found }
    } else {
      // 如果 listData 还没加载，可能需要先加载或者提示用户
      // 这里先尝试加载列表数据，如果还是没有，则只能编辑名称
      fetchGetSchoolList().then(res => {
        const list = Array.isArray(res) ? res : (res?.data || [])
        listData.value = list
        const f = list.find((s: any) => s.id === data.id)
        if (f) {
          form.value = {
            id: f.id,
            province: f.province || '',
            city: f.city || '',
            name: f.name
          }
        }
      })
    }
  }
  
  form.value = {
    id: schoolInfo.id,
    province: schoolInfo.province || '',
    city: schoolInfo.city || '',
    name: schoolInfo.name
  }
  dialogVisible.value = true
}

const handleDeleteSchool = (data: any) => {
  ElMessageBox.confirm(`确定要删除 ${data.name} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await fetchDeleteSchool(data.id)
      ElMessage.success('删除成功')
      loadData(true)
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  })
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        submitLoading.value = true
        if (isEdit.value) {
          await fetchUpdateSchool({
            id: form.value.id,
            province: form.value.province,
            city: form.value.city,
            name: form.value.name
          })
          ElMessage.success('更新成功')
        } else {
          await fetchAddSchool({
            province: form.value.province,
            city: form.value.city,
            name: form.value.name
          })
          ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        loadData(true)
      } catch (error) {
        ElMessage.error('操作失败')
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
      loadData(true) // 强制刷新全量数据
    }
  } finally {
    importLoading.value = false
  }
}

import { useUserStore } from '@/store/modules/user'

const downloadTemplate = () => {
  const token = useUserStore().accessToken || ''
  const baseUrl = import.meta.env.VITE_API_URL === '/' ? '' : import.meta.env.VITE_API_URL || ''
  window.open(`${baseUrl}/api/system/school/download-template?token=${token}`, '_blank')
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

.main-card, .import-card {
  height: 550px;
}

.tree-container {
  height: 450px;
  overflow-y: auto;
}

.list-container {
  height: auto;
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

.mt-6 {
  margin-top: 24px;
}

.import-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.import-buttons .el-button {
  width: 100%;
  margin-left: 0 !important;
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
