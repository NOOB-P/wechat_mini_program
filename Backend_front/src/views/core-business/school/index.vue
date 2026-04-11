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

    <el-card shadow="never" class="main-card">
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex items-center">
            <span class="font-bold mr-4">学校架构管理</span>
            <el-radio-group v-model="viewType" size="small">
              <el-radio-button label="list">列表视图</el-radio-button>
              <el-radio-button label="tree">树形视图</el-radio-button>
            </el-radio-group>
          </div>
          <div>
            <el-button 
              v-if="viewType === 'list' && !isBatchDeleting"
              type="danger"
              @click="isBatchDeleting = true"
            >
              批量删除
            </el-button>
            <el-button 
              v-if="viewType === 'list' && isBatchDeleting"
              :type="selectedIds.length > 0 ? 'danger' : 'default'"
              @click="handleBatchDelete"
            >
              {{ selectedIds.length > 0 ? '开始删除' : '取消删除' }}
            </el-button>
            <el-button type="primary" plain @click="handleOpenImport">批量导入</el-button>
            <el-button type="primary" @click="handleAddSchool">添加学校</el-button>
          </div>
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
                    <span>{{ node.label }} <span v-if="data.type === 'school'" class="text-gray-400 ml-2 text-xs">({{ data.id }})</span></span>
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
              @selection-change="handleSelectionChange"
            >
              <el-table-column v-if="isBatchDeleting" type="selection" width="55" align="center" />
              <el-table-column prop="id" label="内部ID" width="80" align="center" />
              <el-table-column prop="schoolId" label="唯一标识(ID)" width="180" align="center" />
              <el-table-column prop="province" label="省份" width="150" align="center" />
              <el-table-column prop="city" label="城市" width="150" align="center" />
              <el-table-column prop="name" label="学校名称" min-width="200" />
              <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
              <el-table-column label="操作" width="200" align="center" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" link size="small" @click="handleEnterSchool(row)">进入</el-button>
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

    <!-- 导入弹窗 -->
    <el-dialog v-model="importVisible" title="导入学校架构" width="550px">
      <div class="import-container">
        <div class="flex justify-start mb-4">
          <el-tooltip placement="right" effect="light">
            <template #content>
              <div class="text-xs leading-6 text-gray-600 p-2">
                <p>1. 请先<b>下载导入模板</b>，按照模板格式填写学校架构信息。</p>
                <p>2. 支持<b>多文件批量上传</b>，系统将自动解析并更新学校架构。</p>
                <p>3. 若学校已存在，系统将自动<b>忽略</b>现有学校信息。</p>
              </div>
            </template>
            <div class="instructions-trigger">
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
          <div v-if="fileList.length === 0" class="upload-empty-content">
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <div class="el-upload__tip mt-2">
              仅支持 .xlsx / .xls 格式文件
            </div>
          </div>
          
          <div v-else class="upload-list-content" @click.stop>
            <div class="flex justify-between items-center mb-2 px-2">
              <span class="text-xs font-bold text-gray-500">待处理队列 ({{ fileList.length }})</span>
              <el-button link type="danger" size="small" @click="fileList = []">清空</el-button>
            </div>
            <el-table :data="fileList" size="small" border max-height="180" class="import-table">
              <el-table-column prop="name" label="文件名" show-overflow-tooltip />
              <el-table-column label="状态" width="90" align="center">
                <template #default="{ row }">
                  <div class="status-cell">
                    <el-tag v-if="row.status === 'ready'" type="info" size="small" class="status-tag-mini">等待中</el-tag>
                    <el-tag v-else-if="row.status === 'success'" type="success" size="small" class="status-tag-mini tag-success-simple">已导入</el-tag>
                    <el-tag v-else-if="row.status === 'fail'" type="danger" size="small" class="status-tag-mini">
                      <el-tooltip v-if="row.errorMsg" :content="row.errorMsg" placement="top">
                        <span>失败</span>
                      </el-tooltip>
                      <span v-else>失败</span>
                    </el-tag>
                    <el-tag v-else type="primary" size="small" class="status-tag-mini rotating">
                      <el-icon><loading-icon /></el-icon>
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
            <div class="mt-2 text-center">
              <el-button link type="primary" size="small" @click="handleContinueUpload">
                <el-icon class="mr-1"><plus /></el-icon>继续添加文件
              </el-button>
            </div>
          </div>
        </el-upload>

        <div class="mt-8 flex flex-col gap-3">
          <el-button 
            type="primary" 
            size="large"
            class="w-full start-import-btn" 
            :loading="importLoading" 
            :disabled="fileList.length === 0"
            @click="submitImport"
          >
            <template #icon v-if="!importLoading">
              <el-icon><upload /></el-icon>
            </template>
            {{ importLoading ? '正在解析并写入数据库...' : '确认开始批量导入' }}
          </el-button>
          <div class="flex justify-center mt-1">
            <a href="file:///c:/Users/admin/Desktop/wechat_mini_program-master/JavaSB_back/src/main/assests/学校导入模板.zip" download="学校导入模板.zip">
              <el-button link type="primary" class="download-link">
                <el-icon class="mr-1"><document /></el-icon>还没有模板？点击下载学校架构模板.zip
              </el-button>
            </a>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 新增/编辑弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogTitle"
      width="450px"
    >
      <el-form :model="form" label-width="100px" ref="formRef" :rules="rules">
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
  fetchBatchDeleteSchools,
  fetchImportExcel,
  fetchDownloadSchoolTemplate
} from '@/api/core-business/school/index'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import { 
  UploadFilled, 
  Loading as LoadingIcon, 
  Delete,
  Upload,
  Document,
  InfoFilled,
  Plus
} from '@element-plus/icons-vue'

const viewType = ref<'tree' | 'list'>('list')
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

const selectedIds = ref<number[]>([])
const isBatchDeleting = ref(false)

const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map(item => item.id)
}

const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) {
    // 没选择时点击，因为文案是"取消删除"，清空选择并隐藏复选框
    isBatchDeleting.value = false
    selectedIds.value = []
    return
  }
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedIds.value.length} 个学校吗？`,
    '批量删除警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        const res = await fetchBatchDeleteSchools(selectedIds.value)
        console.log('学校批量删除返回数据:', res)
        
        // 修复：由于 axios 拦截器可能会直接返回 res.data 的 data 字段，也可能返回完整的 response
        // 如果后端返回的是 Result.success(msg, data) 且拦截器直接返回了 data
        // 那么这里的 res 实际上就是后端 data 里面的内容（即我们想要的详细信息字符串）
        let msg = ''
        if (typeof res === 'string') {
          msg = res
        } else {
          msg = (res as any)?.msg || (res as any)?.data?.msg
        }
        
        console.log('后端返回的详细 msg:', msg)
        
        if (msg && msg.includes('未能删除')) {
          ElMessage.warning(msg)
        } else {
          ElMessage.success(msg || '批量删除成功')
        }
        selectedIds.value = []
        isBatchDeleting.value = false
        loadData(true)
      } catch (error: any) {
        console.error('学校批量删除异常:', error)
        ElMessage.error(error.message || '批量删除失败')
      }
    })
    .catch(() => {})
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
  schoolId: '',
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
const importVisible = ref(false)
const importLoading = ref(false)
const fileList = ref<any[]>([])
const uploadRef = ref<any>()

const handleOpenImport = () => {
  fileList.value = []
  importVisible.value = true
}

const handleFileChange = (uploadFile: any, uploadFiles: any) => {
  fileList.value = uploadFiles
}

const handleRemove = (file: any, uploadFiles: any) => {
  fileList.value = uploadFiles
}

const handleContinueUpload = () => {
  if (uploadRef.value) {
    const input = uploadRef.value.$el.querySelector('input[type="file"]')
    if (input) {
      input.click()
    }
  }
}

const submitImport = async () => {
  const readyFiles = fileList.value.filter(f => f.status === 'ready' || f.status === 'fail')
  if (readyFiles.length === 0) {
    ElMessage.warning('没有待导入的文件')
    return
  }
  
  importLoading.value = true
  let successCount = 0
  let failCount = 0

  for (const fileItem of readyFiles) {
    fileItem.status = 'uploading'
    fileItem.errorMsg = ''
    
    try {
      await fetchImportExcel(fileItem.raw)
      fileItem.status = 'success'
      successCount++
    } catch (error: any) {
      fileItem.status = 'fail'
      fileItem.errorMsg = error.message || '导入失败'
      failCount++
    }
  }

  if (failCount === 0) {
    ElMessage.success(`成功导入 ${successCount} 个文件`)
    setTimeout(() => {
      importVisible.value = false
      fileList.value = []
      loadData(true)
    }, 1500)
  } else {
    ElMessage.warning(`导入完成：${successCount} 个成功，${failCount} 个失败`)
    loadData(true) // 部分成功也要刷新列表
  }
  importLoading.value = false
}

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
        listData.value = res.records.map((item: any) => {
          if (item.createTime) {
            const d = new Date(item.createTime)
            item.createTime = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
          }
          return item
        })
        total.value = res.total
      } else if (res && res.code === 200) {
        listData.value = res.data.records.map((item: any) => {
          if (item.createTime) {
            const d = new Date(item.createTime)
            item.createTime = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
          }
          return item
        })
        total.value = res.data.total
      }
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}

watch(viewType, () => {
  loadData()
})

import { useRouter } from 'vue-router'

const router = useRouter()

const handleEnterSchool = (row: any) => {
  const schoolId = row.schoolId || row.id
  if (schoolId) {
    router.push({
      path: '/core-business/sys-class',
      query: { schoolId, schoolName: row.name }
    })
  } else {
    ElMessage.warning('无法获取学校ID')
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
    schoolId: '',
    province: '',
    city: '',
    name: ''
  }
  dialogVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

const handleEditSchool = (data: any) => {
  isEdit.value = true
  // 如果是树节点，需要尝试从 allSchools 中获取完整的省市信息
  let schoolInfo = { ...data }
  const dataId = data.id || data.schoolId
  if (!data.province) {
    const found = allSchools.value.find(s => (s.id || s.schoolId) === dataId)
    if (found) {
      schoolInfo = { ...found }
    } else {
      // 如果数据还没加载，可能需要先加载或者提示用户
      // 这里先尝试加载列表数据，如果还是没有，则只能编辑名称
      fetchGetSchoolList({ current: 1, size: 10000 }).then(res => {
        const list = res?.records || res?.data?.records || (Array.isArray(res) ? res : (res?.data || []))
        allSchools.value = list
        const f = list.find((s: any) => (s.id || s.schoolId) === dataId)
        if (f) {
          form.value = {
            id: f.id || f.schoolId,
            schoolId: f.schoolId || '',
            province: f.province || '',
            city: f.city || '',
            name: f.name
          }
        }
      })
    }
  }
  
  form.value = {
    id: schoolInfo.id || schoolInfo.schoolId,
    schoolId: schoolInfo.schoolId || '',
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
      const deleteId = data.id || data.schoolId
      await fetchDeleteSchool(deleteId)
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

const downloadTemplate = () => {
  fetchDownloadSchoolTemplate()
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

.upload-demo {
  width: 100%;
}
:deep(.el-upload-dragger) {
  width: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 180px;
}
.upload-empty-content {
  padding: 30px 0;
}
.upload-list-content {
  padding: 15px;
  cursor: default;
}
.import-container {
  padding: 0 10px;
}
.import-table {
  border-radius: 4px;
  overflow: hidden;
}
.status-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}
.status-tag-mini {
  min-width: 60px;
  height: 24px;
  line-height: 22px;
  padding: 0 8px;
  border-radius: 12px;
}
.start-import-btn {
  height: 48px;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 1px;
}
.download-link {
  font-size: 13px;
  color: #409eff;
}
.mr-1 {
  margin-right: 4px;
}

/* 动画效果 */
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(103, 194, 58, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(103, 194, 58, 0); }
  100% { box-shadow: 0 0 0 0 rgba(103, 194, 58, 0); }
}
.pulse-success {
  animation: pulse 2s infinite;
  background-color: #f0f9eb;
  border-color: #e1f3d8;
  color: #67c23a;
}
.tag-success-simple {
  background-color: #f0f9eb;
  border-color: #e1f3d8;
  color: #67c23a;
}
.instructions-trigger {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #409eff;
  cursor: help;
  padding: 4px 8px;
  background-color: #ecf5ff;
  border-radius: 4px;
  transition: all 0.3s;
}
.instructions-trigger:hover {
  background-color: #d9ecff;
}
</style>
