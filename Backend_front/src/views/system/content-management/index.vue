<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-bold">角色权限管理</span>
          <div class="flex gap-4">
            <el-input
              v-model="searchForm.roleName"
              placeholder="请输入角色名称"
              style="width: 220px"
              clearable
              @keyup.enter="handleSearch"
            />
            <el-button type="primary" @click="handleSearch">查询</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" border v-loading="loading" style="width: 100%">
        <el-table-column prop="roleName" label="角色名称" width="180" />
        <el-table-column prop="roleCode" label="角色编码" width="180" />
        <el-table-column prop="description" label="描述" min-width="220" />
        <el-table-column label="已分配权限" min-width="360">
          <template #default="{ row }">
            <div class="flex flex-wrap gap-2">
              <template v-for="code in row.permissionCodes" :key="code">
                <el-tag v-if="getPermissionTitle(code) !== code" type="success" effect="plain">
                  {{ getPermissionTitle(code) }}
                </el-tag>
              </template>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">设置权限</el-button>
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

    <el-dialog
      v-model="dialogVisible"
      :title="`设置角色权限 - ${currentRole?.roleName || ''}`"
      width="680px"
    >
      <el-form label-position="top">
        <el-form-item label="允许访问的页面">
          <el-checkbox-group v-model="selectedPermissions">
            <el-checkbox
              v-for="permission in permissionOptions"
              :key="permission.menuPermission"
              :label="permission.menuPermission"
              class="mb-2"
              style="width: 180px"
            >
              <div class="flex items-center">
                <ArtSvgIcon :icon="permission.icon" class="mr-1" v-if="permission.icon" />
                <span>{{ permission.title }}</span>
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
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  fetchGetPermissionOptions,
  fetchGetRolePermissions,
  fetchUpdateRolePermissions
} from '@/api/system/content-management'

defineOptions({ name: 'ContentManagement' })

const loading = ref(false)
const tableData = ref<Api.ContentManage.RolePermissionItem[]>([])
const permissionOptions = ref<Api.ContentManage.PermissionOption[]>([])
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const searchForm = reactive({
  roleName: ''
})

const dialogVisible = ref(false)
const saveLoading = ref(false)
const currentRole = ref<Api.ContentManage.RolePermissionItem | null>(null)
const selectedPermissions = ref<string[]>([])

const getPermissionTitle = (code: string) => {
  return permissionOptions.value.find(item => item.menuPermission === code)?.title || code
}

const loadPermissionOptions = async () => {
  const res = await fetchGetPermissionOptions()
  if (res) {
    permissionOptions.value = res
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await fetchGetRolePermissions({
      current: pagination.current,
      size: pagination.size,
      roleName: searchForm.roleName
    })
    if (res) {
      tableData.value = res.records
      pagination.total = res.total
    }
  } catch (error) {
    console.error('加载失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  loadData()
}

const handleCurrentChange = (val: number) => {
  pagination.current = val
  loadData()
}

const handleSizeChange = (val: number) => {
  pagination.size = val
  loadData()
}

const handleEdit = (row: Api.ContentManage.RolePermissionItem) => {
  currentRole.value = row
  selectedPermissions.value = [...(row.permissionCodes || [])]
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!currentRole.value) return

  saveLoading.value = true
  try {
    await fetchUpdateRolePermissions(currentRole.value.id, selectedPermissions.value)
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请稍后重试')
  } finally {
    saveLoading.value = false
  }
}

onMounted(async () => {
  await loadPermissionOptions()
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
