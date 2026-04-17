<template>
  <div class="log-container p-5">
    <!-- 搜索区域 -->
    <LogSearch :query-params="queryParams" @query="handleQuery" @reset="resetQuery" />

    <!-- 工具栏 -->
    <div class="table-toolbar flex justify-between items-center mb-4">
      <div class="left-btns">
        <el-button
          type="danger"
          plain
          :disabled="!selectedIds.length"
          @click="handleBatchDelete"
        >
          <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
          批量删除
        </el-button>
        <el-button type="warning" plain @click="handleExport">
          <ArtSvgIcon icon="ri:download-2-line" class="mr-1" />
          导出日志
        </el-button>
      </div>
      <div class="right-btns">
        <ArtIconButton icon="ri:refresh-line" @click="getList" />
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-wrapper bg-white dark:bg-dark-800 p-5 rounded-lg shadow-sm">
      <el-table
        v-loading="loading"
        :data="logList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="日志编号" width="100" />
        <el-table-column prop="operation" label="操作模块" min-width="150" />
        <el-table-column prop="userName" label="操作人员" min-width="120">
          <template #default="{ row }">
            <div class="flex flex-col">
              <span>{{ row.nickName || row.nickname || '未知' }}</span>
              <span class="text-xs text-gray-400">({{ row.userName || row.username }})</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="method" label="请求方式" width="100">
          <template #default="{ row }">
            <el-tag :type="row.method === 'GET' ? 'info' : 'success'">{{ row.method }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="操作地址" min-width="150" />
        <el-table-column prop="location" label="操作地点" min-width="120" />
        <el-table-column prop="status" label="操作状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 200 ? 'success' : 'danger'">
              {{ row.status === 200 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="操作时间" min-width="180">
          <template #default="{ row }">
            <!-- 简单格式化，如果需要可以用 dayjs -->
            {{ row.createTime ? new Date(row.createTime).toLocaleString() : '' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="100">
          <template #default="scope">
            <el-button link type="primary" @click="handleView(scope.row)">
              <ArtSvgIcon icon="ri:eye-line" class="mr-1" />
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper flex justify-end mt-5">
        <el-pagination
          v-model:current-page="queryParams.current"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="getList"
          @current-change="getList"
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog title="操作日志详情" v-model="open" width="700px" append-to-body>
      <el-form :model="form" label-width="100px" size="default">
        <el-row>
          <el-col :span="12">
            <el-form-item label="操作人员：">{{ form.nickName }} / {{ form.userName }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作地址：">{{ form.ip }} ({{ form.location }})</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="请求地址：">{{ form.url }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="请求方式：">{{ form.method }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作状态：">
              <el-tag :type="form.status === 200 ? 'success' : 'danger'">
                {{ form.status === 200 ? '成功' : '失败' }}
              </el-tag>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="操作内容：">{{ form.operation }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="操作时间：">{{ form.createTime }}</el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="open = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { fetchLogList, deleteLogs, exportLogs } from '@/api/log'
  import LogSearch from './modules/log-search.vue'
  import { ElMessage, ElMessageBox } from 'element-plus'

  const loading = ref(false)
  const logList = ref<any[]>([])
  const total = ref(0)
  const selectedIds = ref<number[]>([])
  const open = ref(false)
  const form = ref<any>({})

  const queryParams = reactive({
    current: 1,
    size: 10,
    userName: '',
    operation: '',
    status: undefined
  })

  const getList = async () => {
    loading.value = true
    try {
      const res = await fetchLogList(queryParams)
      logList.value = res.records || []
      total.value = res.total || 0
    } catch (error) {
      console.error('Failed to fetch logs:', error)
      logList.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  const handleQuery = () => {
    queryParams.current = 1
    getList()
  }

  const resetQuery = () => {
    queryParams.userName = ''
    queryParams.operation = ''
    queryParams.status = undefined
    handleQuery()
  }

  const handleSelectionChange = (selection: any[]) => {
    selectedIds.value = selection.map((item) => item.id)
  }

  const handleBatchDelete = () => {
    if (!selectedIds.value.length) return
    ElMessageBox.confirm(`是否确认删除日志编号为 "${selectedIds.value.join(',')}" 的数据项?`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await deleteLogs(selectedIds.value)
        ElMessage.success('删除成功')
        getList()
      } catch (error: any) {
        // 如果 error 里有 code 或 message 也可以在这里做针对性处理
        // 不过由于 utils/http 内部通常已经拦截报错了，这里可以只是做个 fallback
        // ElMessage.error(error.message || '删除失败，请检查权限')
      }
    }).catch(() => {})
  }

  const handleExport = async () => {
    const res = await exportLogs(queryParams)
    if (res.code === 200) {
      ElMessage.success(res.msg)
    }
  }

  const handleView = (row: any) => {
    form.value = { ...row }
    open.value = true
  }

  const getMethodTagType = (method: string) => {
    switch (method) {
      case 'GET': return 'info'
      case 'POST': return 'success'
      case 'PUT': return 'warning'
      case 'DELETE': return 'danger'
      default: return ''
    }
  }

  onMounted(() => {
    getList()
  })
</script>

<style scoped lang="scss">
  .log-container {
    .table-toolbar {
      .left-btns {
        .el-button {
          margin-right: 10px;
        }
      }
    }
  }
</style>
