<template>
  <div class="notification-page art-full-height">
    <!-- 搜索栏 -->
    <ElCard class="mb-4 search-card">
      <ElForm :model="searchForm" inline size="default">
        <ElFormItem label="通知标题">
          <ElInput v-model="searchForm.title" placeholder="请输入通知标题" clearable @keyup.enter="handleSearch" />
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" @click="handleSearch" v-ripple>查询</ElButton>
          <ElButton @click="handleReset" v-ripple>重置</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <ElCard class="art-table-card">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="showDialog('add')" v-ripple>新增系统通知</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data as any"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>

      <!-- 通知弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增系统通知' : '编辑系统通知'"
        width="600px"
        destroy-on-close
      >
        <ElForm :model="formData" label-width="100px" ref="formRef" :rules="rules">
          <ElFormItem label="标题" prop="title">
            <ElInput v-model="formData.title" placeholder="请输入通知标题" />
          </ElFormItem>
          <ElFormItem label="内容" prop="content">
            <ElInput
              v-model="formData.content"
              type="textarea"
              :rows="4"
              placeholder="请输入通知详细内容"
            />
          </ElFormItem>
          <ElFormItem label="通知级别" prop="level">
            <ElSelect v-model="formData.level" placeholder="请选择级别" class="w-full">
              <ElOption label="普通" value="info" />
              <ElOption label="警告" value="warning" />
              <ElOption label="成功" value="success" />
              <ElOption label="紧急" value="error" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="目标用户" prop="targetType">
            <ElRadioGroup v-model="formData.targetType">
              <ElRadio :label="0">全部用户</ElRadio>
              <ElRadio :label="1">指定用户UID</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
          <ElFormItem label="用户UID" v-if="formData.targetType === 1" prop="targetUid">
            <ElInput v-model.number="formData.targetUid" placeholder="请输入接收用户UID" />
          </ElFormItem>
          <ElFormItem label="发布状态">
            <ElSwitch v-model="formData.isPublished" :active-value="1" :inactive-value="0" />
          </ElFormItem>
        </ElForm>
        <template #footer>
          <ElButton @click="dialogVisible = false">取消</ElButton>
          <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">确定</ElButton>
        </template>
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetNotificationList, fetchSaveNotification, fetchDeleteNotification } from '@/api/system/notification'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import { DialogType } from '@/types'

  defineOptions({ name: 'SysNotification' })

  // 搜索表单
  const searchForm = ref({
    title: ''
  })

  // 弹窗相关
  const dialogVisible = ref(false)
  const dialogType = ref<DialogType>('add')
  const submitLoading = ref(false)
  const formRef = ref()
  const formData = ref<any>({
    id: null,
    title: '',
    content: '',
    category: 'system',
    level: 'info',
    targetType: 0,
    targetUid: null,
    isPublished: 1
  })

  const rules = {
    title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
    content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
    level: [{ required: true, message: '请选择级别', trigger: 'change' }]
  }

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    replaceSearchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    core: {
      apiFn: fetchGetNotificationList,
      apiParams: {
        current: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        { prop: 'title', label: '标题', minWidth: 150 },
        { prop: 'content', label: '内容', minWidth: 250, showOverflowTooltip: true },
        {
          prop: 'level',
          label: '级别',
          width: 80,
          formatter: (row: any) => {
            const maps: any = {
              info: 'info',
              warning: 'warning',
              success: 'success',
              error: 'danger'
            }
            return h(ElTag, { type: maps[row.level] || 'info' }, () => row.level)
          }
        },
        {
          prop: 'targetType',
          label: '发送范围',
          width: 100,
          formatter: (row: any) => {
            return row.targetType === 0 ? '全部用户' : `UID: ${row.targetUid || '未指定'}`
          }
        },
        {
          prop: 'isPublished',
          label: '状态',
          width: 80,
          formatter: (row: any) => {
            return h(
              ElTag,
              { type: row.isPublished === 1 ? 'success' : 'info' },
              () => (row.isPublished === 1 ? '已发布' : '草稿')
            )
          }
        },
        { prop: 'createTime', label: '创建时间', width: 170 },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right',
          formatter: (row: any) =>
            h('div', [
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => handleDelete(row)
              })
            ])
        }
      ]
    }
  })

  const handleSearch = () => {
    replaceSearchParams({ ...searchForm.value })
    refreshData()
  }

  const handleReset = () => {
    searchForm.value.title = ''
    resetSearchParams()
    refreshData()
  }

  const showDialog = (type: DialogType, row?: any) => {
    dialogType.value = type
    if (type === 'edit' && row) {
      formData.value = { ...row }
    } else {
      formData.value = {
        id: null,
        title: '',
        content: '',
        category: 'system',
        level: 'info',
        targetType: 0,
        targetUid: null,
        isPublished: 1
      }
    }
    dialogVisible.value = true
  }

  const handleDelete = (row: any) => {
    ElMessageBox.confirm(`确定要删除通知《${row.title}》吗？`, '删除确认', {
      type: 'warning'
    }).then(async () => {
      await fetchDeleteNotification(row.id)
      ElMessage.success('删除成功')
      refreshData()
    })
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid: boolean) => {
      if (valid) {
        submitLoading.value = true
        try {
          const payload = {
            ...formData.value,
            category: 'system',
            actionText: null,
            actionPath: null
          }
          await fetchSaveNotification(payload)
          ElMessage.success('保存成功')
          dialogVisible.value = false
          refreshData()
        } finally {
          submitLoading.value = false
        }
      }
    })
  }
</script>

<style lang="scss" scoped>
  .notification-page {
    .search-card {
      :deep(.el-card__body) {
        padding-bottom: 2px;
      }
    }
  }
</style>
