<template>
  <div class="course-order-container p-5">
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
        <el-table-column label="订单号" prop="order_no" min-width="180" align="center" />
        <el-table-column label="用户信息" min-width="150">
          <template #default="scope">
            <div class="user-info">
              <div class="font-bold">{{ scope.row.user_name }}</div>
              <div class="text-xs text-gray-400">{{ scope.row.user_phone }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="课程名称" prop="course_title" min-width="200" align="center" show-overflow-tooltip />
        <el-table-column label="订单金额" width="100" align="center">
          <template #default="scope">
            <span class="text-red-500 font-bold">¥{{ scope.row.price?.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="支付方式" prop="payment_method" width="120" align="center">
          <template #default="scope">
            {{ scope.row.payment_method || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="支付状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.payment_status)">
              {{ getStatusText(scope.row.payment_status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" prop="create_time" width="180" align="center" />
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

    <!-- 订单详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="订单详情"
      width="600px"
      destroy-on-close
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="订单编号">{{ currentOrder.order_no }}</el-descriptions-item>
        <el-descriptions-item label="用户姓名">{{ currentOrder.user_name }}</el-descriptions-item>
        <el-descriptions-item label="手机号码">{{ currentOrder.user_phone }}</el-descriptions-item>
        <el-descriptions-item label="课程名称">{{ currentOrder.course_title }}</el-descriptions-item>
        <el-descriptions-item label="订单金额">
          <span class="text-red-500 font-bold">¥{{ currentOrder.price?.toFixed(2) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="支付方式">{{ currentOrder.payment_method || '-' }}</el-descriptions-item>
        <el-descriptions-item label="支付状态">
          <el-tag :type="getStatusTag(currentOrder.payment_status)">
            {{ getStatusText(currentOrder.payment_status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ currentOrder.create_time }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentOrder.update_time || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { fetchCourseOrderList } from '@/api/order'
  import { onMounted, reactive, ref } from 'vue'

  const loading = ref(false)
  const orderList = ref<any[]>([])
  const total = ref(0)
  
  // 详情弹窗相关
  const detailVisible = ref(false)
  const currentOrder = ref<any>({})

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
      const res = await fetchCourseOrderList(queryParams)
      if (res) {
        const data = res.data || res
        orderList.value = data.records || []
        total.value = data.total || 0
      }
    } catch (error) {
      console.error('获取课程订单列表失败:', error)
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
    currentOrder.value = { ...row }
    detailVisible.value = true
  }

  const getStatusTag = (status: number): 'success' | 'info' => {
    switch (status) {
      case 1: return 'success'
      case 0: return 'info'
      default: return 'info'
    }
  }

  const getStatusText = (status: number) => {
    switch (status) {
      case 1: return '已支付'
      case 0: return '待支付'
      default: return '未知'
    }
  }

  onMounted(() => {
    getList()
  })
</script>

<style scoped lang="scss">
.course-order-container {
  .user-info {
    line-height: 1.2;
  }
}
</style>
