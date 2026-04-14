<template>
  <div class="vip-order-container p-5">
    <div class="search-wrapper bg-white p-5 rounded-lg mb-5 shadow-sm">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item :label="text.orderNo" prop="orderNo">
          <el-input v-model="queryParams.orderNo" :placeholder="text.orderNoPlaceholder" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item :label="text.userName" prop="userName">
          <el-input v-model="queryParams.userName" :placeholder="text.userNamePlaceholder" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item :label="text.paymentStatus" prop="paymentStatus">
          <el-select v-model="queryParams.paymentStatus" :placeholder="text.paymentStatus" clearable style="width: 150px">
            <el-option :label="text.pending" :value="0" />
            <el-option :label="text.paid" :value="1" />
            <el-option :label="text.refunded" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">{{ text.search }}</el-button>
          <el-button icon="Refresh" @click="resetQuery">{{ text.reset }}</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-wrapper bg-white p-5 rounded-lg shadow-sm">
      <el-table v-loading="loading" :data="orderList" border stripe style="width: 100%">
        <el-table-column :label="text.orderNo" prop="orderNo" min-width="180" align="center" />
        <el-table-column :label="text.userInfo" min-width="160">
          <template #default="scope">
            <div class="user-info">
              <div class="font-bold">{{ scope.row.userName || '-' }}</div>
              <div class="text-xs text-gray-400">{{ scope.row.userPhone || '-' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="text.packageType" prop="packageType" width="120" align="center" />
        <el-table-column :label="text.period" prop="period" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getPeriodTag(scope.row.period)">{{ scope.row.period || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="text.sourceType" width="130" align="center">
          <template #default="scope">
            <el-tag :type="getSourceMeta(scope.row.sourceType).type">
              {{ getSourceMeta(scope.row.sourceType).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="text.price" width="110" align="center">
          <template #default="scope">
            <span class="text-red-500 font-bold">{{ `${moneySymbol}${formatPrice(scope.row.price)}` }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="text.paymentMethod" prop="paymentMethod" width="120" align="center" />
        <el-table-column :label="text.paymentStatus" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.paymentStatus)">
              {{ getStatusText(scope.row.paymentStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="text.createTime" prop="createTime" width="180" align="center" />
        <el-table-column :label="text.action" width="100" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleDetail(scope.row)">{{ text.detail }}</el-button>
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

    <el-dialog v-model="detailVisible" :title="text.detailTitle" width="600px" destroy-on-close>
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="text.orderNo">{{ currentOrder.orderNo || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="text.userName">{{ currentOrder.userName || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="text.userPhone">{{ currentOrder.userPhone || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="text.packageType">
          <el-tag size="small">{{ currentOrder.packageType || '-' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="text.period">{{ currentOrder.period || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="text.sourceType">
          <el-tag size="small" :type="getSourceMeta(currentOrder.sourceType).type">
            {{ getSourceMeta(currentOrder.sourceType).label }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="text.price">
          <span class="text-red-500 font-bold">{{ `${moneySymbol}${formatPrice(currentOrder.price)}` }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="text.paymentMethod">{{ currentOrder.paymentMethod || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="text.paymentStatus">
          <el-tag :type="getStatusTag(currentOrder.paymentStatus)">
            {{ getStatusText(currentOrder.paymentStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="text.createTime">{{ currentOrder.createTime || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="text.updateTime">{{ currentOrder.updateTime || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">{{ text.close }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, reactive, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { fetchVipOrderList } from '@/api/order'

  type TagType = 'success' | 'info' | 'warning' | 'danger'

  const text = {
    orderNo: '\u8ba2\u5355\u53f7',
    orderNoPlaceholder: '\u8bf7\u8f93\u5165\u8ba2\u5355\u53f7',
    userName: '\u7528\u6237\u540d',
    userNamePlaceholder: '\u8bf7\u8f93\u5165\u7528\u6237\u540d',
    userInfo: '\u7528\u6237\u4fe1\u606f',
    userPhone: '\u624b\u673a\u53f7',
    packageType: '\u5957\u9910\u7c7b\u578b',
    period: '\u8d2d\u4e70\u5468\u671f',
    sourceType: '\u5f00\u901a\u6765\u6e90',
    price: '\u8ba2\u5355\u91d1\u989d',
    paymentMethod: '\u652f\u4ed8\u65b9\u5f0f',
    paymentStatus: '\u652f\u4ed8\u72b6\u6001',
    createTime: '\u4e0b\u5355\u65f6\u95f4',
    updateTime: '\u66f4\u65b0\u65f6\u95f4',
    action: '\u64cd\u4f5c',
    search: '\u67e5\u8be2',
    reset: '\u91cd\u7f6e',
    detail: '\u8be6\u60c5',
    detailTitle: '\u8ba2\u5355\u8be6\u60c5',
    close: '\u5173\u95ed',
    pending: '\u5f85\u652f\u4ed8',
    paid: '\u5df2\u652f\u4ed8',
    refunded: '\u5df2\u9000\u6b3e',
    onlinePurchase: '\u5728\u7ebf\u8d2d\u4e70',
    schoolGift: '\u6821\u8baf\u901a\u8d60\u9001',
    loadFailed: '\u83b7\u53d6 VIP \u8ba2\u5355\u5217\u8868\u5931\u8d25'
  }

  const moneySymbol = '\uFFE5'
  const loading = ref(false)
  const orderList = ref<any[]>([])
  const total = ref(0)
  const detailVisible = ref(false)
  const currentOrder = ref<any>({})

  const queryParams = reactive({
    current: 1,
    size: 10,
    orderNo: '',
    userName: '',
    paymentStatus: undefined as number | undefined
  })

  const sourceMetaMap: Record<string, { label: string; type: TagType }> = {
    ONLINE_PURCHASE: {
      label: text.onlinePurchase,
      type: 'success'
    },
    SCHOOL_GIFT: {
      label: text.schoolGift,
      type: 'warning'
    }
  }

  const getList = async () => {
    loading.value = true
    try {
      const res = await fetchVipOrderList(queryParams)
      const data = (res as any)?.data || res || {}
      orderList.value = Array.isArray(data.records) ? data.records : []
      total.value = Number(data.total || 0)
    } catch (error) {
      console.error('fetch vip orders failed:', error)
      ElMessage.error(text.loadFailed)
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

  const getPeriodTag = (period?: string): TagType => {
    if (!period) {
      return 'info'
    }
    if (period.includes('\u5e74')) {
      return 'warning'
    }
    if (period.includes('\u5b63')) {
      return 'success'
    }
    return 'info'
  }

  const getSourceMeta = (sourceType?: string) => {
    return sourceMetaMap[sourceType || 'ONLINE_PURCHASE'] || sourceMetaMap.ONLINE_PURCHASE
  }

  const getStatusTag = (status?: number): TagType => {
    switch (status) {
      case 1:
        return 'success'
      case 2:
        return 'danger'
      default:
        return 'info'
    }
  }

  const getStatusText = (status?: number) => {
    switch (status) {
      case 1:
        return text.paid
      case 2:
        return text.refunded
      default:
        return text.pending
    }
  }

  const formatPrice = (price: number | string | undefined) => {
    const numericPrice = Number(price ?? 0)
    return Number.isNaN(numericPrice) ? '0.00' : numericPrice.toFixed(2)
  }

  onMounted(() => {
    getList()
  })
</script>
