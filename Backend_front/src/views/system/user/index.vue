<!-- 用户管理页面 -->
<!-- art-full-height 自动计算出页面剩余高度 -->
<!-- art-table-card 一个符合系统样式的 class，同时自动撑满剩余高度 -->
<!-- 更多 useTable 使用示例请移步至 功能示例 下面的高级表格示例或者查看官方文档 -->
<!-- useTable 文档：https://www.artd.pro/docs/zh/guide/hooks/use-table.html -->
<template>
  <div class="user-page art-full-height">
    <!-- 搜索栏 -->
    <UserSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams"></UserSearch>

    <ElCard class="art-table-card">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>新增用户</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>

      <!-- 用户弹窗 -->
      <UserDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :user-data="currentUserData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { ACCOUNT_TABLE_DATA } from '@/mock/temp/formData'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetUserList, fetchDeleteUser } from '@/api/system/user'
  import UserSearch from './modules/user-search.vue'
  import UserDialog from './modules/user-dialog.vue'
  import { ElTag, ElMessageBox, ElImage } from 'element-plus'
  import { DialogType } from '@/types'
  import { fetchGetRoleList } from '@/api/system/role'
  import { onMounted } from 'vue'

  defineOptions({ name: 'User' })

  type UserListItem = Api.SystemManage.UserListItem

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentUserData = ref<Partial<UserListItem>>({})

  // 角色列表缓存，用于表格渲染
  const roleMap = ref<Record<string, string>>({})
  const getRoleMap = async () => {
    try {
      const res = await fetchGetRoleList({ current: 1, size: 100 })
      if (res && res.records) {
        const map: Record<string, string> = {}
        res.records.forEach((r: any) => {
          map[String(r.id)] = r.roleName
        })
        roleMap.value = map
      }
    } catch (e) {
      console.error(e)
    }
  }

  onMounted(() => {
    getRoleMap()
  })

  // 选中行
  const selectedRows = ref<UserListItem[]>([])

  // 搜索表单
  const searchForm = ref({
    userName: undefined,
    userGender: undefined,
    userPhone: undefined,
    userEmail: undefined,
    status: '1'
  })

  // 用户状态配置
  const USER_STATUS_CONFIG = {
    '1': { type: 'success' as const, text: '在线' },
    '2': { type: 'info' as const, text: '离线' },
    '3': { type: 'warning' as const, text: '异常' },
    '4': { type: 'danger' as const, text: '注销' }
  } as const

  /**
   * 获取用户状态配置
   */
  const getUserStatusConfig = (status: string) => {
    return (
      USER_STATUS_CONFIG[status as keyof typeof USER_STATUS_CONFIG] || {
        type: 'info' as const,
        text: '未知'
      }
    )
  }

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    searchParams,
    getData,
    replaceSearchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    // 核心配置
    core: {
      apiFn: fetchGetUserList,
      apiParams: {
        current: 1,
        size: 20,
        ...searchForm.value
      },
      // 自定义分页字段映射，未设置时将使用全局配置 tableConfig.ts 中的 paginationKey
      // paginationKey: {
      //   current: 'pageNum',
      //   size: 'pageSize'
      // },
      columnsFactory: () => [
        { type: 'selection' }, // 勾选列
        { type: 'index', width: 60, label: '序号' }, // 序号
        {
          prop: 'userInfo',
          label: '用户信息',
          width: 200,
          formatter: (row) => {
            return h('div', { class: 'user flex-c' }, [
              h(ElImage, {
                class: 'size-9.5 rounded-md',
                src: row.avatar,
                previewSrcList: [row.avatar],
                previewTeleported: true
              }),
              h('div', { class: 'ml-2' }, [
                h('p', { class: 'user-name font-bold' }, row.userName),
                h('p', { class: 'text-xs text-gray-400' }, row.nickName)
              ])
            ])
          }
        },
        {
          prop: 'userType',
          label: '角色类型',
          width: 100,
          formatter: (row) => {
            // 根据接口返回的角色字典进行映射
            const roleName = roleMap.value[row.userType] || '未知角色'
            // 根据角色类型简单分配颜色（这里依然按 ID 粗略分配）
            const colors: Record<string, string> = { '1': 'danger', '2': 'primary', '3': 'success', '4': 'warning' }
            return h(
              ElTag,
              { type: (colors[row.userType] || 'info') as any },
              () => roleName
            )
          }
        },
        {
          prop: 'bindingInfo',
          label: '绑定详情',
          minWidth: 250,
          formatter: (row) => {
            const info = []
            if (row.userType === '1' || row.userType === '2') {
              // 管理员和后台管理不需要绑定
              info.push(h('p', '-'))
            } else if (row.userType === '5') {
              // 假设 5 是学校用户（目前代码中并未定义5，保留以前逻辑兼容）
              info.push(h('p', `绑定学校: ${row.schoolName || '未绑定'}`))
            } else if (row.userType === '3') {
              // 家长用户
              const bound = row.schoolName && row.className && row.studentName
              if (bound) {
                info.push(h('p', `学校班级: ${row.schoolName} / ${row.className}`))
                info.push(h('p', `关联学生: ${row.studentName}`))
              } else {
                info.push(h('p', { class: 'text-red-500' }, '未绑定'))
              }
            } else if (row.userType === '4') {
              // 学生用户
              info.push(h('p', `学校班级: ${row.schoolName || '未设置'} / ${row.className || '未设置'}`))
              info.push(h('p', `关联家长: ${row.parentName || '无'}`))
            } else {
              info.push(h('p', '-'))
            }
            return h('div', { class: 'text-xs' }, info)
          }
        },
        { prop: 'userPhone', label: '手机号', width: 120 },
        {
          prop: 'status',
          label: '状态',
          width: 80,
          formatter: (row) => {
            const statusConfig = getUserStatusConfig(row.status)
            return h(ElTag, { type: statusConfig.type }, () => statusConfig.text)
          }
        },
        {
          prop: 'createTime',
          label: '创建日期',
          width: 160,
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right', // 固定列
          formatter: (row) =>
            h('div', [
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => deleteUser(row)
              })
            ])
        }
      ]
    },
    // 数据处理
    transform: {
      // 数据转换器 - 替换头像
      dataTransformer: (records) => {
        // 类型守卫检查
        if (!Array.isArray(records)) {
          console.warn('数据转换器: 期望数组类型，实际收到:', typeof records)
          return []
        }

        // 使用本地头像替换接口返回的头像
        return records.map((item, index: number) => {
          return {
            ...item,
            avatar: ACCOUNT_TABLE_DATA[index % ACCOUNT_TABLE_DATA.length].avatar
          }
        })
      }
    }
  })

  /**
   * 搜索
   */
  const handleSearch = (params: any) => {
    Object.assign(searchParams, params)
    refreshData()
  }

  /**
   * 重置
   */
  const handleReset = () => {
    Object.keys(searchParams).forEach((key) => {
      if (key !== 'current' && key !== 'size') {
        ;(searchParams as any)[key] = undefined
      }
    })
    refreshData()
  }

  /**
   * 显示用户弹窗
   */
  const showDialog = (type: DialogType, row?: UserListItem): void => {
    console.log('打开弹窗:', { type, row })
    dialogType.value = type
    currentUserData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  /**
   * 删除用户
   */
  const deleteUser = (row: UserListItem): void => {
    ElMessageBox.confirm(`确定要删除该用户 ${row.userName} 吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(async () => {
      try {
        await fetchDeleteUser(row.id as number)
        ElMessage.success('删除成功')
        refreshData()
      } catch (error) {
        // ...
      }
    }).catch(() => {})
  }

  /**
   * 处理弹窗提交事件
   */
  const handleDialogSubmit = async () => {
    try {
      dialogVisible.value = false
      currentUserData.value = {}
      refreshData()
    } catch (error) {
      console.error('提交失败:', error)
    }
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: UserListItem[]): void => {
    selectedRows.value = selection
    console.log('选中行数据:', selectedRows.value)
  }
</script>
