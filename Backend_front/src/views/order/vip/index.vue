<template>
  <div class="vip-order-container p-5">
    <div class="search-wrapper bg-white p-5 rounded-lg mb-5 shadow-sm">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item :label="text.keyword" prop="keyword">
          <el-input
            v-model="queryParams.keyword"
            :placeholder="text.keywordPlaceholder"
            clearable
            style="width: 300px"
          />
        </el-form-item>
        <el-form-item :label="text.sourceType" prop="sourceType">
          <el-select
            v-model="queryParams.sourceType"
            :placeholder="text.sourceType"
            clearable
            style="width: 150px"
          >
            <el-option :label="text.onlinePurchase" value="ONLINE_PURCHASE" />
            <el-option :label="text.schoolGift" value="SCHOOL_GIFT" />
          </el-select>
        </el-form-item>
        <el-form-item :label="text.paymentStatus" prop="paymentStatus">
          <el-select
            v-model="queryParams.paymentStatus"
            :placeholder="text.paymentStatus"
            clearable
            style="width: 150px"
          >
            <el-option :label="text.pending" :value="0" />
            <el-option :label="text.paid" :value="1" />
            <el-option :label="text.refunded" :value="2" />
            <el-option :label="text.expired" :value="-1" />
          </el-select>
        </el-form-item>
        <el-form-item :label="text.dateRange" prop="dateRange">
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
          <el-button type="primary" @click="handleQuery">{{ text.search }}</el-button>
          <el-button @click="resetQuery">{{ text.reset }}</el-button>
          <el-button
            type="success"
            plain
            :loading="exportLoading"
            @click="handleExport"
            >{{ text.export }}</el-button
          >
        </el-form-item>
      </el-form>
    </div>

    <div class="table-wrapper bg-white p-5 rounded-lg shadow-sm">
      <el-table v-loading="loading" :data="orderList" border stripe style="width: 100%">
        <el-table-column :label="text.orderNo" prop="orderNo" min-width="180" align="center" />
        <el-table-column :label="text.userInfo" min-width="160" align="center">
          <template #default="scope">
            <div class="user-info flex flex-col items-center">
              <div class="font-bold">{{ scope.row.userName || '-' }}</div>
              <div class="text-xs text-gray-400">{{ scope.row.userPhone || '-' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="text.packageType" prop="packageType" width="120" align="center" />
        <el-table-column :label="text.school" prop="schoolName" min-width="150" align="center" />
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
            <span class="text-red-500 font-bold">{{
              `${moneySymbol}${formatPrice(scope.row.price)}`
            }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="text.paymentStatus" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.paymentStatus)">
              {{ getStatusText(scope.row.paymentStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :label="text.paymentMethod"
          prop="paymentMethod"
          width="120"
          align="center"
        />
        <el-table-column :label="text.createTime" prop="createTime" width="180" align="center" />
        <el-table-column :label="text.action" width="100" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleDetail(scope.row)">{{
              text.detail
            }}</el-button>
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
        <el-descriptions-item :label="text.orderNo">{{
          currentOrder.orderNo || '-'
        }}</el-descriptions-item>
        <el-descriptions-item :label="text.userName">{{
          currentOrder.userName || '-'
        }}</el-descriptions-item>
        <el-descriptions-item :label="text.userPhone">{{
          currentOrder.userPhone || '-'
        }}</el-descriptions-item>
        <el-descriptions-item :label="text.packageType">
          <el-tag size="small">{{ currentOrder.packageType || '-' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="text.school">
          {{ currentOrder.schoolName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="text.period">{{
          currentOrder.period || '-'
        }}</el-descriptions-item>
        <el-descriptions-item :label="text.sourceType">
          <el-tag size="small" :type="getSourceMeta(currentOrder.sourceType).type">
            {{ getSourceMeta(currentOrder.sourceType).label }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="text.price">
          <span class="text-red-500 font-bold">{{
            `${moneySymbol}${formatPrice(currentOrder.price)}`
          }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="text.paymentStatus">
          <el-tag :type="getStatusTag(currentOrder.paymentStatus)">
            {{ getStatusText(currentOrder.paymentStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="text.paymentMethod">{{
          currentOrder.paymentMethod || '-'
        }}</el-descriptions-item>
        <el-descriptions-item :label="text.createTime">{{
          currentOrder.createTime || '-'
        }}</el-descriptions-item>
        <el-descriptions-item :label="text.updateTime">{{
          currentOrder.updateTime || '-'
        }}</el-descriptions-item>
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
  import { exportVipOrderList, fetchVipOrderList } from '@/api/order'

  type TagType = 'success' | 'info' | 'warning' | 'danger'

  const text = {
    keyword: '关键词',
    keywordPlaceholder: '请输入订单号/用户名/手机号/学校',
    orderNo: '订单号',
    userName: '用户名',
    school: '学校',
    userInfo: '用户信息',
    userPhone: '手机号',
    packageType: '套餐类型',
    period: '购买周期',
    sourceType: '开通来源',
    price: '订单金额',
    paymentMethod: '支付方式',
    paymentStatus: '支付状态',
    dateRange: '下单日期',
    createTime: '下单时间',
    updateTime: '更新时间',
    action: '操作',
    search: '查询',
    reset: '重置',
    export: '导出',
    detail: '详情',
    detailTitle: '订单详情',
    close: '关闭',
    pending: '待支付',
    paid: '已支付',
    refunded: '已退款',
    expired: '已过期',
    onlinePurchase: '在线购买',
    schoolGift: '校讯通赠送',
    loadFailed: '获取 VIP 订单列表失败',
    exportSuccess: '导出成功',
    exportFailed: '导出 VIP 订单失败'
  }

  const moneySymbol = '\uFFE5'
  const loading = ref(false)
  const exportLoading = ref(false)
  const orderList = ref<any[]>([])
  const total = ref(0)
  const detailVisible = ref(false)
  const currentOrder = ref<any>({})

  const queryParams = reactive({
    current: 1,
    size: 10,
    keyword: '',
    sourceType: '',
    paymentStatus: undefined as number | undefined,
    startDate: '',
    endDate: ''
  })

  const dateRange = ref<[string, string] | []>([])

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
      if (res) {
        const data = res.data || res
        orderList.value = Array.isArray(data.records) ? data.records : []
        total.value = Number(data.total || 0)
      }
    } catch (error) {
      console.error('fetch vip orders failed:', error)
      ElMessage.error(text.loadFailed)
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
    queryParams.keyword = ''
    queryParams.sourceType = ''
    queryParams.paymentStatus = undefined
    queryParams.startDate = ''
    queryParams.endDate = ''
    dateRange.value = []
    handleQuery()
  }

  const handleDetail = (row: any) => {
    currentOrder.value = { ...row }
    detailVisible.value = true
  }

  const handleExport = async () => {
    exportLoading.value = true
    try {
      const blob = await exportVipOrderList(queryParams)
      downloadFile(blob, `VIP订单_${buildTimestamp()}.xlsx`)
      ElMessage.success(text.exportSuccess)
    } catch (error) {
      console.error('export vip orders failed:', error)
      ElMessage.error(text.exportFailed)
    } finally {
      exportLoading.value = false
    }
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
      case -1:
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
      case -1:
        return text.expired
      default:
        return text.pending
    }
  }

  const formatPrice = (price: number | string | undefined) => {
    const numericPrice = Number(price ?? 0)
    return Number.isNaN(numericPrice) ? '0.00' : numericPrice.toFixed(2)
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
  .vip-order-container {
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
