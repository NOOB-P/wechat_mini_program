<template>
  <ElDialog v-model="visible" title="选择接收用户" width="500px" align-center destroy-on-close>
    <div class="mb-4 flex items-center gap-2">
      <ElInput
        v-model="keyword"
        placeholder="搜索账号、昵称或手机号"
        clearable
        size="small"
        @keyup.enter="handleSearch"
      />
      <ElButton type="primary" size="small" @click="handleSearch">查询</ElButton>
    </div>

    <ElTable
      v-loading="loading"
      :data="tableData"
      border
      height="350"
      highlight-current-row
      size="small"
      @current-change="handleCurrentChange"
      @row-dblclick="handleRowConfirm"
    >
      <ElTableColumn prop="userName" label="账号" min-width="120" show-overflow-tooltip />
      <ElTableColumn prop="nickName" label="昵称" min-width="120" show-overflow-tooltip />
      <ElTableColumn prop="userType" label="角色" width="100">
        <template #default="{ row }">
          {{ roleMap[row.userType] || `角色${row.userType}` }}
        </template>
      </ElTableColumn>
      <ElTableColumn label="操作" width="70" fixed="right">
        <template #default="{ row }">
          <ElButton link type="primary" size="small" @click="handleRowConfirm(row)">选择</ElButton>
        </template>
      </ElTableColumn>
    </ElTable>

    <div class="mt-4 flex items-center justify-between">
      <div class="text-sm text-gray-500">
        共 {{ total }} 条
      </div>
      <ElPagination
        background
        layout="prev, pager, next"
        :current-page="current"
        :page-size="size"
        :total="total"
        @current-change="handlePageChange"
      />
    </div>

    <template #footer>
      <ElButton @click="visible = false">取消</ElButton>
      <ElButton type="primary" :disabled="!selectedUser" @click="confirmSelection">确定</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { fetchGetUserList } from '@/api/system/user'
  import { fetchGetRoleList } from '@/api/system/role'

  interface Props {
    modelValue: boolean
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'select', value: any): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false
  })

  const emit = defineEmits<Emits>()

  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const loading = ref(false)
  const keyword = ref('')
  const current = ref(1)
  const size = ref(10)
  const total = ref(0)
  const tableData = ref<any[]>([])
  const selectedUser = ref<any>(null)
  const roleMap = ref<Record<string, string>>({})

  const loadRoleMap = async () => {
    if (Object.keys(roleMap.value).length > 0) return
    const res = await fetchGetRoleList({ current: 1, size: 100 })
    const map: Record<string, string> = {}
    ;(res?.records || []).forEach((item: any) => {
      map[String(item.id)] = item.roleName
    })
    roleMap.value = map
  }

  const loadUsers = async () => {
    loading.value = true
    try {
      const trimmedKeyword = keyword.value.trim()
      const params: Record<string, any> = {
        current: current.value,
        size: size.value
      }

      if (trimmedKeyword) {
        if (/^\d{6,}$/.test(trimmedKeyword)) {
          params.userPhone = trimmedKeyword
        } else {
          params.userName = trimmedKeyword
        }
      }

      const res = await fetchGetUserList(params as any)
      tableData.value = res?.records || []
      total.value = res?.total || 0
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    current.value = 1
    loadUsers()
  }

  const handleReset = () => {
    keyword.value = ''
    selectedUser.value = null
    current.value = 1
    loadUsers()
  }

  const handlePageChange = (page: number) => {
    current.value = page
    loadUsers()
  }

  const handleCurrentChange = (row: any) => {
    selectedUser.value = row || null
  }

  const handleRowConfirm = (row: any) => {
    selectedUser.value = row
    confirmSelection()
  }

  const confirmSelection = () => {
    if (!selectedUser.value) return
    emit('select', selectedUser.value)
    visible.value = false
  }

  watch(
    () => visible.value,
    async (value) => {
      if (!value) return
      selectedUser.value = null
      current.value = 1
      await loadRoleMap()
      await loadUsers()
    }
  )
</script>
