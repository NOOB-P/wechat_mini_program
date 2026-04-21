<template>
  <div class="print-order-container p-5">
    <div class="search-wrapper bg-white p-5 rounded-lg mb-5 shadow-sm">
      <el-form :model="queryParams" ref="queryFormRef" :inline="true">
        <el-form-item label="订单号" prop="orderNo">
          <el-input
            v-model="queryParams.orderNo"
            placeholder="请输入订单号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="用户名" prop="userName">
          <el-input
            v-model="queryParams.userName"
            placeholder="请输入用户名"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="订单状态" prop="orderStatus">
          <el-select
            v-model="queryParams.orderStatus"
            placeholder="订单状态"
            clearable
            style="width: 150px"
          >
            <el-option label="待支付" :value="1" />
            <el-option label="待打印" :value="2" />
            <el-option label="待配送" :value="3" />
            <el-option label="已完成" :value="4" />
            <el-option label="已取消" :value="0" />
            <el-option label="已过期" :value="-1" />
          </el-select>
        </el-form-item>
        <el-form-item label="下单日期" prop="dateRange">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item class="action-buttons">
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
          <el-button
            type="success"
            plain
            :loading="exportLoading"
            @click="handleExport"
            >导出</el-button
          >
        </el-form-item>
      </el-form>
    </div>

    <div class="table-wrapper bg-white p-5 rounded-lg shadow-sm">
      <el-table v-loading="loading" :data="orderList" border stripe style="width: 100%">
        <el-table-column label="订单号" prop="orderNo" min-width="180" align="center" />
        <el-table-column label="下单用户" min-width="150" align="center">
          <template #default="scope">
            <div class="user-info flex flex-col items-center">
              <div class="font-bold">{{ scope.row.userName }}</div>
              <div class="text-xs text-gray-400">{{ scope.row.userPhone }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="文档名称"
          prop="documentName"
          min-width="180"
          align="center"
          :show-overflow-tooltip="true"
        />
        <el-table-column label="打印规格" width="120" align="center">
          <template #default="scope">
            <el-tag size="small" effect="plain">{{ scope.row.printType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="页数" prop="pages" width="80" align="center" />
        <el-table-column label="配送方式" prop="deliveryMethod" width="100" align="center" />
        <el-table-column label="订单总额" width="100" align="center">
          <template #default="scope">
            <span class="text-red-500 font-bold">¥{{ (scope.row.totalPrice || 0).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="订单状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.orderStatus)">
              {{ getStatusText(scope.row.orderStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" prop="createTime" width="180" align="center" />
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleDetail(scope.row)">详情</el-button>
            <el-button
              v-if="scope.row.orderStatus === 2"
              link
              type="success"
              @click="handlePrint(scope.row)"
              >完成打印</el-button
            >
          </template>
        </el-table-column>
      </el-table>

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
  </div>
</template>

<script setup lang="ts">
  import { onMounted, reactive, ref } from 'vue'
  import { exportPrintOrderList, fetchPrintOrderList, updatePrintOrderStatus } from '@/api/order'
  import { ElMessage, ElMessageBox } from 'element-plus'

  const loading = ref(false)
  const exportLoading = ref(false)
  const orderList = ref<any[]>([])
  const total = ref(0)
  const dateRange = ref<[string, string] | []>([])

  const queryParams = reactive({
    current: 1,
    size: 10,
    orderNo: '',
    userName: '',
    orderStatus: undefined,
    startDate: '',
    endDate: ''
  })

  const getList = async () => {
    loading.value = true
    try {
      const res = await fetchPrintOrderList(queryParams)
      if (res) {
        orderList.value = res.records || []
        total.value = res.total || 0
      }
    } catch (error) {
      console.error('获取打印订单列表失败:', error)
      ElMessage.error('获取打印订单列表失败')
    } finally {
      loading.value = false
    }
  }

  const handleQuery = () => {
    queryParams.current = 1
    queryParams.startDate = dateRange.value[0] || ''
    queryParams.endDate = dateRange.value[1] || ''
    getList()
  }

  const resetQuery = () => {
    queryParams.orderNo = ''
    queryParams.userName = ''
    queryParams.orderStatus = undefined
    queryParams.startDate = ''
    queryParams.endDate = ''
    dateRange.value = []
    handleQuery()
  }

  const handleDetail = (row: any) => {
    ElMessage.info(`查看订单 ${row.orderNo} 的详情`)
  }

  const handleExport = async () => {
    exportLoading.value = true
    try {
      const blob = await exportPrintOrderList(queryParams)
      downloadFile(blob, `打印订单_${buildTimestamp()}.xlsx`)
      ElMessage.success('导出成功')
    } catch (error) {
      console.error('导出打印订单失败:', error)
      ElMessage.error('导出打印订单失败')
    } finally {
      exportLoading.value = false
    }
  }

  const handlePrint = (row: any) => {
    ElMessageBox.confirm(
      `确定订单 ${row.orderNo} 已完成打印吗？完成后将进入待配送状态。`,
      '确认提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
      .then(async () => {
        try {
          loading.value = true
          // 2 (待打印) -> 3 (待配送)
          await updatePrintOrderStatus(row.id, 3)
          ElMessage.success('订单已标记为待配送')
          getList()
        } finally {
          loading.value = false
        }
      })
      .catch(() => {})
  }

  const getStatusTag = (status: number): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
    switch (status) {
      case 1:
        return 'info' // 待支付
      case 2:
        return 'warning' // 待打印
      case 3:
        return 'primary' // 待配送
      case 4:
        return 'success' // 已完成
      case 0:
      case -1:
        return 'danger' // 已取消/已过期
      default:
        return 'info'
    }
  }

  const getStatusText = (status: number) => {
    switch (status) {
      case 1:
        return '待支付'
      case 2:
        return '待打印'
      case 3:
        return '待配送'
      case 4:
        return '已完成'
      case 0:
        return '已取消'
      case -1:
        return '已过期'
      default:
        return '未知'
    }
  }

  const downloadFile = (blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  const buildTimestamp = () => {
    const now = new Date()
    const pad = (value: number) => String(value).padStart(2, '0')
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  }

  onMounted(() => {
    getList()
  })
</script>

<style scoped lang="scss">
  .print-order-container {
    .action-buttons {
      :deep(.el-form-item__content) {
        display: flex;
        align-items: center;
        gap: 12px;
        justify-content: center;
      }

      :deep(.el-button) {
        min-width: 88px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
</style>
