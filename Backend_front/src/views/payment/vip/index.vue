<template>
  <div class="vip-package-container p-5">
    <div class="page-header mb-5 flex justify-between items-center bg-white p-5 rounded-lg shadow-sm">
      <div class="left">
        <h2 class="text-xl font-bold text-gray-800">会员套餐设置</h2>
        <p class="text-sm text-gray-500 mt-1">配置 VIP 与 SVIP 的功能权限、展示信息及多周期价格体系</p>
      </div>
      <el-button type="primary" icon="Plus" disabled>新增套餐</el-button>
    </div>

    <div v-loading="loading" class="package-list grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="pkg in packages"
        :key="pkg.id"
        class="package-card bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-lg"
      >
        <div :class="['card-header p-6', pkg.type === 'SVIP' ? 'bg-indigo-600' : 'bg-blue-500']">
          <div class="flex justify-between items-start">
            <div class="title-info">
              <span class="type-tag bg-white/20 text-white text-xs px-2 py-0.5 rounded-full mb-2 inline-block">
                {{ pkg.type }}
              </span>
              <h3 class="text-2xl font-bold text-white">{{ pkg.name }}</h3>
            </div>
            <el-switch
              v-model="pkg.status"
              :active-value="1"
              :inactive-value="0"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="handleStatusChange(pkg)"
            />
          </div>
          <p class="text-white/80 mt-2 text-sm">{{ pkg.description }}</p>
        </div>

        <div class="card-content p-6">
          <div class="features-section mb-6">
            <h4 class="text-sm font-bold text-gray-700 mb-3 flex items-center">
              <el-icon class="mr-2 text-blue-500"><CircleCheck /></el-icon> 功能权益
            </h4>
            <div class="feature-tags flex wrap gap-2">
              <el-tag
                v-for="feature in pkg.features"
                :key="feature"
                size="small"
                effect="plain"
                type="info"
              >
                {{ feature }}
              </el-tag>
            </div>
          </div>

          <div class="price-section bg-gray-50 rounded-lg p-4 mb-6">
            <h4 class="text-sm font-bold text-gray-700 mb-4 flex items-center justify-between">
              <span class="flex items-center">
                <el-icon class="mr-2 text-orange-500"><Money /></el-icon> 价格体系
              </span>
              <el-button link type="primary" icon="Edit" @click="handleEditPrice(pkg)">修改价格</el-button>
            </h4>
            <div class="price-grid grid grid-cols-3 gap-4">
              <div v-for="price in pkg.prices" :key="price.id" class="price-item text-center border-r last:border-r-0 border-gray-200">
                <div class="period text-xs text-gray-500 mb-1">{{ price.periodName }}</div>
                <div class="current-price text-lg font-bold text-red-500">¥{{ price.price }}</div>
                <div class="old-price text-xs text-gray-400 line-through">¥{{ price.originalPrice }}</div>
              </div>
            </div>
          </div>

          <div class="actions flex justify-end gap-3">
            <el-button icon="Setting" @click="handleEditPackage(pkg)">编辑权益</el-button>
            <el-button type="primary" plain icon="Share" disabled>营销配置</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 价格修改弹窗 -->
    <PriceDialog
      v-model="priceVisible"
      :package-data="currentPackage"
      @success="getList"
    />
  </div>
</template>

<script setup lang="ts">
  import { fetchVipPackages, updateVipPackage } from '@/api/payment'
  import PriceDialog from './modules/price-dialog.vue'
  import { ElMessage } from 'element-plus'
  import { CircleCheck, Money, Setting, Plus, Share } from '@element-plus/icons-vue'

  const loading = ref(false)
  const packages = ref([])
  const priceVisible = ref(false)
  const currentPackage = ref<any>(null)

  const getList = async () => {
    loading.value = true
    try {
      const res = await fetchVipPackages()
      if (res.code === 200) {
        packages.value = res.data
      }
    } finally {
      loading.value = false
    }
  }

  const handleStatusChange = async (pkg: any) => {
    try {
      const res = await updateVipPackage({ id: pkg.id, status: pkg.status })
      if (res.code === 200) {
        ElMessage.success(`${pkg.name} 状态已更新`)
      }
    } catch {
      pkg.status = pkg.status === 1 ? 0 : 1
    }
  }

  const handleEditPrice = (pkg: any) => {
    currentPackage.value = pkg
    priceVisible.value = true
  }

  const handleEditPackage = (pkg: any) => {
    ElMessage.info(`即将开放：${pkg.name} 的权益详情编辑`)
  }

  onMounted(() => {
    getList()
  })
</script>

<style scoped lang="scss">
  .vip-package-container {
    .package-card {
      .card-header {
        position: relative;
        &::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 20px;
          background: linear-gradient(to bottom right, transparent 50%, #ffffff 50%);
        }
      }
    }
  }
</style>
