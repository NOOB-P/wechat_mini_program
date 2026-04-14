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
            <ElButton @click="handleOpenParentImport" v-ripple>家长批量导入</ElButton>
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

      <ElDialog v-model="parentImportVisible" title="批量导入家长账号" width="560px">
        <div class="import-container">
          <div class="flex justify-start mb-4">
            <el-tooltip placement="right" effect="light">
              <template #content>
                <div class="text-xs leading-6 text-gray-600 p-2">
                  <p>1. 仅导入家长账号，角色固定为“家长”。</p>
                  <p>2. 模板必填列：用户名、昵称、手机号；密码留空默认 `123456`。</p>
                  <p>3. `VIP`、`SVIP` 列支持填写“是/否”，`学生学号` 为可选绑定字段。</p>
                  <p>4. 若用户名或手机号已存在，系统会自动跳过并在结果里提示。</p>
                </div>
              </template>
              <div class="instructions-trigger">
                <el-icon class="mr-1"><InfoFilled /></el-icon>
                <span>导入操作说明 (鼠标悬停查看)</span>
              </div>
            </el-tooltip>
          </div>

          <el-upload
            ref="parentUploadRef"
            class="upload-demo"
            drag
            action="#"
            multiple
            :auto-upload="false"
            :on-change="handleParentFileChange"
            :file-list="parentFileList"
            :on-remove="handleParentRemove"
            :show-file-list="false"
            accept=".xlsx, .xls"
          >
            <div v-if="parentFileList.length === 0" class="upload-empty-content">
              <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
              </div>
              <div class="el-upload__tip mt-2">
                仅支持 .xlsx / .xls 格式文件
              </div>
            </div>

            <div v-else class="upload-list-content" @click.stop>
              <div class="flex justify-between items-center mb-2 px-2">
                <span class="text-xs font-bold text-gray-500">待处理队列 ({{ parentFileList.length }})</span>
                <el-button link type="danger" size="small" @click="parentFileList = []">清空</el-button>
              </div>
              <el-table :data="parentFileList" size="small" border max-height="180" class="import-table">
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
                        <el-icon><Loading /></el-icon>
                      </el-tag>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="50" align="center">
                  <template #default="{ $index }">
                    <el-button link type="danger" :icon="Delete" @click="parentFileList.splice($index, 1)" />
                  </template>
                </el-table-column>
              </el-table>
              <div class="mt-2 text-center">
                <el-button link type="primary" size="small" @click="handleContinueParentUpload">
                  <el-icon class="mr-1"><Plus /></el-icon>继续添加文件
                </el-button>
              </div>
            </div>
          </el-upload>

          <div class="mt-8 flex flex-col gap-3">
            <el-button
              type="primary"
              size="large"
              class="w-full start-import-btn"
              :loading="parentImportLoading"
              :disabled="parentFileList.length === 0"
              @click="submitParentImport"
            >
              <template #icon v-if="!parentImportLoading">
                <el-icon><Upload /></el-icon>
              </template>
              {{ parentImportLoading ? '正在导入家长账号...' : '确认开始批量导入' }}
            </el-button>
            <div class="flex justify-center mt-1">
              <el-button link type="primary" @click="downloadParentTemplate" class="download-link">
                <el-icon class="mr-1"><Document /></el-icon>还没有模板？点击下载家长导入模板.xlsx
              </el-button>
            </div>
          </div>
        </div>
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetUserList, fetchDeleteUser, fetchImportParentUsers, fetchDownloadParentTemplate } from '@/api/system/user'
  import defaultAvatar from '@/assets/images/avatar/avatar.webp'
  import UserSearch from './modules/user-search.vue'
  import UserDialog from './modules/user-dialog.vue'
  import { ElTag, ElMessageBox, ElImage, ElMessage } from 'element-plus'
  import { DialogType } from '@/types'
  import { fetchGetRoleList } from '@/api/system/role'
  import { onMounted } from 'vue'
  import { UploadFilled, Loading, Delete, Upload, Document, InfoFilled, Plus } from '@element-plus/icons-vue'

  defineOptions({ name: 'User' })

  type UserListItem = Api.SystemManage.UserListItem

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentUserData = ref<Partial<UserListItem>>({})
  const parentImportVisible = ref(false)
  const parentImportLoading = ref(false)
  const parentFileList = ref<any[]>([])
  const parentUploadRef = ref<any>()

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
    userName: '',
    userPhone: '',
    roleId: '',
    schoolName: '',
    className: ''
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
            const avatar = row.avatar || defaultAvatar
            return h('div', { class: 'user flex-c' }, [
              h(ElImage, {
                class: 'size-9.5 rounded-md',
                src: avatar,
                previewSrcList: [avatar],
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
          prop: 'isVip',
          label: 'VIP',
          width: 80,
          align: 'center',
          formatter: (row) => {
            return h(
              ElTag,
              { type: row.isVip === 1 ? 'success' : 'info', effect: row.isVip === 1 ? 'dark' : 'plain' },
              () => (row.isVip === 1 ? '是' : '否')
            )
          }
        },
        {
          prop: 'isSvip',
          label: 'SVIP',
          width: 80,
          align: 'center',
          formatter: (row) => {
            return h(
              ElTag,
              { type: row.isSvip === 1 ? 'warning' : 'info', effect: row.isSvip === 1 ? 'dark' : 'plain' },
              () => (row.isSvip === 1 ? '是' : '否')
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
              if (row.boundStudents && row.boundStudents.length > 0) {
                row.boundStudents.forEach((s: any) => {
                  info.push(h('p', `学生: ${s.name} (${s.school} / ${s.className || '未设置'})`))
                })
              } else if (row.schoolName && row.className && row.studentName) {
                // 向后兼容之前的单条数据格式
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
    }
  })

  /**
   * 搜索
   */
  const handleSearch = (params: any) => {
    // 过滤掉空字符串，避免发送无效参数
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== '')
    )
    replaceSearchParams(filteredParams)
    refreshData()
  }

  /**
   * 重置
   */
  const handleReset = () => {
    resetSearchParams()
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

  const handleOpenParentImport = () => {
    parentFileList.value = []
    parentImportVisible.value = true
  }

  const handleParentFileChange = (uploadFile: any, uploadFiles: any) => {
    parentFileList.value = uploadFiles
  }

  const handleParentRemove = (file: any, uploadFiles: any) => {
    parentFileList.value = uploadFiles
  }

  const handleContinueParentUpload = () => {
    if (parentUploadRef.value) {
      const input = parentUploadRef.value.$el.querySelector('input[type="file"]')
      if (input) {
        input.click()
      }
    }
  }

  const submitParentImport = async () => {
    const readyFiles = parentFileList.value.filter((f) => f.status === 'ready' || f.status === 'fail')
    if (readyFiles.length === 0) {
      ElMessage.warning('没有待导入的文件')
      return
    }

    parentImportLoading.value = true
    try {
      // 逐个文件并行导入
      const results = await Promise.allSettled(
        readyFiles.map(async (file) => {
          file.status = 'uploading'
          try {
            const formData = new FormData()
            formData.append('file', file.raw)
            // fetchImportParentUsers 内部使用 request，非 200 会抛出异常进入 catch
            const res = await fetchImportParentUsers(formData)
            
            file.status = 'success'
            file.errorMsg = ''
            return { name: file.name, success: true, message: res?.message || '导入成功' }
          } catch (error: any) {
            file.status = 'fail'
            file.errorMsg = error.message || '网络错误'
            return { name: file.name, success: false, message: error.message }
          }
        })
      )

      // 统计结果并给出提示
      const successItems = results.filter((r: any) => r.value?.success)
      if (successItems.length > 0) {
        ElMessage.success(`成功导入 ${successItems.length} 个文件`)
        refreshData()
      }
      
      const failItems = results.filter((r: any) => !r.value?.success)
      if (failItems.length > 0) {
        ElMessage.error(`${failItems.length} 个文件导入失败，请查看明细`)
      }
    } catch (error: any) {
      console.error(error)
      ElMessage.error('导入任务处理异常')
    } finally {
      parentImportLoading.value = false
    }
  }

  const downloadParentTemplate = async () => {
    try {
      await fetchDownloadParentTemplate()
    } catch (error) {
      console.error(error)
    }
  }
</script>

<style scoped>
  .user-page {
    padding: 0;
  }

  .instructions-trigger {
    display: inline-flex;
    align-items: center;
    color: var(--el-color-primary);
    cursor: help;
    font-size: 13px;
    font-weight: 500;
  }

  .upload-empty-content {
    padding: 20px 0;
  }

  .upload-list-content {
    padding: 10px;
    text-align: left;
  }

  .import-table {
    border-radius: 8px;
    overflow: hidden;
  }

  .status-tag-mini {
    padding: 0 4px;
    height: 18px;
    line-height: 16px;
    font-size: 10px;
  }

  .tag-success-simple {
    background-color: #f0f9eb;
    border-color: #e1f3d8;
    color: #67c23a;
  }

  .start-import-btn {
    height: 48px;
    font-size: 16px;
    font-weight: bold;
    border-radius: 12px;
  }

  .download-link {
    font-size: 13px;
    text-decoration: underline;
  }

  .rotating {
    animation: rotate 2s linear infinite;
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>
