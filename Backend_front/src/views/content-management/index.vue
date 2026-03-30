<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-bold">内容管理 - 权限分配</span>
          <div class="flex gap-4">
            <el-input 
              v-model="searchForm.userName" 
              placeholder="请输入用户名" 
              style="width: 200px"
              clearable
              @keyup.enter="handleSearch"
            />
            <el-button type="primary" @click="handleSearch">查询</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" border v-loading="loading" style="width: 100%">
        <el-table-column prop="userName" label="用户名" width="120" />
        <el-table-column prop="nickName" label="昵称" width="120" />
        <el-table-column label="所属角色" width="150">
          <template #default="{ row }">
            <el-tag v-for="role in row.userRoles" :key="role" class="mr-1">{{ role }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="已分配模块" min-width="300">
          <template #default="{ row }">
            <div class="flex flex-wrap gap-2">
              <el-tag 
                v-for="path in row.allowedModules" 
                :key="path" 
                type="success" 
                effect="plain"
              >
                {{ getModuleTitle(path) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">设置管理模块</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 设置权限弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="`设置管理内容 - ${currentUser?.nickName || ''}`"
      width="600px"
    >
      <el-form label-position="top">
        <el-form-item label="允许访问的模块">
          <el-checkbox-group v-model="selectedModules">
            <el-checkbox 
              v-for="module in allModules" 
              :key="module.path" 
              :label="module.path"
              class="mb-2"
              style="width: 120px"
            >
              <div class="flex items-center">
                <ArtSvgIcon :icon="module.icon" class="mr-1" v-if="module.icon" />
                <span>{{ module.title }}</span>
              </div>
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave" :loading="saveLoading">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  fetchGetAllModules, 
  fetchGetUserPermissions, 
  fetchUpdateUserPermissions 
} from '@/api/system/content-management'

defineOptions({ name: 'ContentManagement' })

const loading = ref(false)
const tableData = ref<Api.ContentManage.UserModulePermission[]>([])
const allModules = ref<Api.ContentManage.ModuleItem[]>([])
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const searchForm = reactive({
  userName: ''
})

const dialogVisible = ref(false)
const saveLoading = ref(false)
const currentUser = ref<Api.ContentManage.UserModulePermission | null>(null)
const selectedModules = ref<string[]>([])

/**
 * 获取模块名称
 */
const getModuleTitle = (path: string) => {
  return allModules.value.find(m => m.path === path)?.title || path
}

/**
 * 获取模块列表
 */
const getAllModules = async () => {
  const res = await fetchGetAllModules()
  if (res.code === 200) {
    allModules.value = res.data
  }
}

/**
 * 加载列表数据
 */
const loadData = async () => {
  loading.value = true
  try {
    const res = await fetchGetUserPermissions({
      current: pagination.current,
      size: pagination.size,
      userName: searchForm.userName
    })
    if (res.code === 200) {
      tableData.value = res.data.records
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('加载失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 搜索
 */
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

/**
 * 修改页码
 */
const handleCurrentChange = (val: number) => {
  pagination.current = val
  loadData()
}

/**
 * 修改每页条数
 */
const handleSizeChange = (val: number) => {
  pagination.size = val
  loadData()
}

/**
 * 编辑
 */
const handleEdit = (row: Api.ContentManage.UserModulePermission) => {
  currentUser.value = row
  selectedModules.value = [...row.allowedModules]
  dialogVisible.value = true
}

/**
 * 保存
 */
const handleSave = async () => {
  if (!currentUser.value) return
  saveLoading.value = true
  try {
    const res = await fetchUpdateUserPermissions(currentUser.value.id, selectedModules.value)
    if (res.code === 200) {
      ElMessage.success('设置成功')
      dialogVisible.value = false
      loadData()
    }
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saveLoading.value = false
  }
}

onMounted(() => {
  getAllModules()
  loadData()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.dialog-footer {
  padding-top: 20px;
}
</style>
