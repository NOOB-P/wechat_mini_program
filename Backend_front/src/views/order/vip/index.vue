<template>
  <div class="vip-order-container p-5">
    <div class="search-wrapper bg-white p-5 rounded-lg mb-5 shadow-sm">
      <el-form :model="queryParams" ref="queryFormRef" :inline="true">
        <el-form-item label="订单号" prop="orderNo">
          <el-input v-model="queryParams.orderNo" placeholder="请输入订单号" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="queryParams.userName" placeholder="请输入用户名" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="支付状态" prop="paymentStatus">
          <el-select v-model="queryParams.paymentStatus" placeholder="支付状态" clearable style="width: 150px">
            <el-option label="待支付" :value="0" />
            <el-option label="已支付" :value="1" />
            <el-option label="已退款" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-wrapper bg-white p-5 rounded-lg shadow-sm">
      <el-table v-loading="loading" :data="orderList" border stripe style="width: 100%">
        <el-table-column label="订单号" prop="orderNo" min-width="180" align="center" />
        <el-table-column label="用户信息" min-width="150">
          <template #default="scope">
            <div class="user-info">
              <div class="font-bold">{{ scope.row.userName }}</div>
              <div class="text-xs text-gray-400">{{ scope.row.userPhone }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="套餐类型" prop="packageType" width="120" align="center" />
        <el-table-column label="订购周期" prop="period" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getPeriodTag(scope.row.period)">{{ scope.row.period }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="订单金额" width="100" align="center">
          <template #default="scope">
            <span class="text-red-500 font-bold">¥{{ scope.row.price.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="支付方式" prop="paymentMethod" width="120" align="center" />
        <el-table-column label="支付状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.paymentStatus)">
              {{ getStatusText(scope.row.paymentStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" prop="createTime" width="180" align="center" />
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleDetail(scope.row)">详情</el-button>
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
  import { fetchVipOrderList } from '@/api/order'
  import { ElMessage } from 'element-plus'

  const loading = ref(false)
  const orderList = ref([])
  const total = ref(0)

  const queryParams = reactive({
    current: 1,
    size: 10,
    orderNo: '',
    userName: '',
    paymentStatus: undefined
  })

  const getList = async () => {
    loading.value = true
    try {
      const res = await fetchVipOrderList(queryParams)
      if (res.code === 200) {
        orderList.value = res.data.records
        total.value = res.data.total
      }
    } finally {
      loading.value = false
    }
  }

  const handleQuery = () => {
    queryParams.current = 1
    getList()
  }

  const resetQuery = () => {
    queryParams.orderNo = ''
    queryParams.userName = ''
    queryParams.paymentStatus = undefined
    handleQuery()
  }

  const handleDetail = (row: any) => {
    ElMessage.info(`查看订单 ${row.orderNo} 的详情`)
  }

  const getPeriodTag = (period: string) => {
    switch (period) {
      case '年包': return 'warning'
      case '季包(一学期)': return 'success'
      default: return 'info'
    }
  }

  const getStatusTag = (status: number) => {
    switch (status) {
      case 1: return 'success'
      case 0: return 'info'
      case 2: return 'danger'
      default: return ''
    }
  }

  const getStatusText = (status: number) => {
    switch (status) {
      case 1: return '已支付'
      case 0: return '待支付'
      case 2: return '已退款'
      default: return '未知'
    }
  }

  onMounted(() => {
    getList()
  })
</script>
