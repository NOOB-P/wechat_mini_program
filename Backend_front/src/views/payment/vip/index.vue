<template>
  <div class="vip-package-container p-5">
    <div class="page-header mb-5 flex items-center justify-between rounded-lg bg-white p-5 shadow-sm">
      <div>
        <h2 class="text-xl font-bold text-gray-800">会员套餐设置</h2>
        <p class="mt-1 text-sm text-gray-500">配置 VIP 和 SVIP 的权益、价格以及适用学校范围。</p>
      </div>
      <el-button type="primary" :icon="Plus" disabled>新增套餐</el-button>
    </div>

    <div v-loading="loading" class="package-list grid grid-cols-1 gap-6 md:grid-cols-2">
      <div
        v-for="pkg in packages"
        :key="pkg.id"
        class="package-card overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md transition-all hover:shadow-lg"
      >
        <div :class="['card-header p-6', pkg.tierCode === 'SVIP' ? 'bg-indigo-600' : 'bg-blue-500']">
          <div class="flex items-start justify-between">
            <div>
              <span class="mb-2 inline-block rounded-full bg-white/20 px-2 py-0.5 text-xs text-white">
                {{ pkg.tierCode }} / Lv.{{ pkg.typeValue }}
              </span>
              <h3 class="text-2xl font-bold text-white">{{ pkg.title }}</h3>
            </div>
            <el-switch
              v-model="pkg.isEnabled"
              :active-value="1"
              :inactive-value="0"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="handleStatusChange(pkg)"
            />
          </div>
          <p class="mt-2 text-sm text-white/80">{{ pkg.subTitle }}</p>
        </div>

        <div class="p-6">
          <div class="mb-6">
            <h4 class="mb-3 flex items-center text-sm font-bold text-gray-700">
              <el-icon class="mr-2 text-blue-500"><CircleCheck /></el-icon>
              功能权益
            </h4>
            <div class="flex flex-wrap gap-2">
              <el-tag
                v-for="feature in parseBenefits(pkg.benefits)"
                :key="feature"
                size="small"
                effect="plain"
                type="info"
              >
                {{ feature }}
              </el-tag>
            </div>
          </div>

          <div class="mb-6 rounded-lg bg-gray-50 p-4">
            <h4 class="mb-4 flex items-center justify-between text-sm font-bold text-gray-700">
              <span class="flex items-center">
                <el-icon class="mr-2 text-orange-500"><Money /></el-icon>
                价格体系
              </span>
              <el-button link type="primary" :icon="Edit" @click="handleEditPrice(pkg)">修改价格</el-button>
            </h4>
            <div class="grid grid-cols-3 gap-4">
              <div
                v-for="price in pkg.pricings"
                :key="price.id"
                class="border-r border-gray-200 text-center last:border-r-0"
              >
                <div class="mb-1 text-xs text-gray-500">{{ price.pkgName }}</div>
                <div class="text-lg font-bold text-red-500">￥{{ price.currentPrice }}</div>
                <div class="text-xs text-gray-400 line-through">￥{{ price.originalPrice }}</div>
              </div>
            </div>
          </div>

          <div class="mb-6">
            <h4 class="mb-3 flex items-center justify-between text-sm font-bold text-gray-700">
              <span class="flex items-center">
                <el-icon class="mr-2 text-emerald-500"><School /></el-icon>
                开通学校
              </span>
              <span class="text-xs text-gray-400">已选 {{ getSchoolIds(pkg).length }} 所</span>
            </h4>
            <div v-if="getSchoolIds(pkg).length" class="flex flex-wrap gap-2">
              <el-tag
                v-for="schoolId in getSchoolIds(pkg).slice(0, 4)"
                :key="schoolId"
                size="small"
                effect="plain"
                type="success"
              >
                {{ getSchoolName(schoolId) }}
              </el-tag>
              <span v-if="getSchoolIds(pkg).length > 4" class="text-xs leading-6 text-gray-400">
                +{{ getSchoolIds(pkg).length - 4 }}
              </span>
            </div>
            <div v-else class="text-sm text-gray-400">未配置开通学校，小程序将展示校讯通引导页。</div>
          </div>

          <div class="flex justify-between border-t border-gray-100 bg-gray-50/50 p-6">
            <el-button @click="handleEditBenefits(pkg)">编辑权益</el-button>
            <el-button type="primary" plain @click="handleEditSchools(pkg)">选择开通学校</el-button>
          </div>
        </div>
      </div>
    </div>

    <PriceDialog v-model="priceVisible" :package-data="currentPackage" @success="getList" />
    <BenefitsDialog v-model="benefitsVisible" :package-data="currentPackage" @success="getList" />
    <PackageDialog v-model="packageVisible" :package-data="currentPackage" @success="getList" />
    <SchoolDialog
      v-model="schoolVisible"
      :package-data="currentPackage"
      :school-options="schoolOptions"
      @success="getList"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { CircleCheck, Edit, Money, Plus, School } from '@element-plus/icons-vue'
  import { fetchGetSchoolOptions } from '@/api/core-business/school'
  import { fetchVipPackages, toggleVipStatus } from '@/api/payment/vip'
  import BenefitsDialog from './modules/benefits-dialog.vue'
  import PackageDialog from './modules/package-dialog.vue'
  import PriceDialog from './modules/price-dialog.vue'
  import SchoolDialog from './modules/school-dialog.vue'

  const loading = ref(false)
  const packages = ref<any[]>([])
  const schoolOptions = ref<any[]>([])
  const priceVisible = ref(false)
  const benefitsVisible = ref(false)
  const packageVisible = ref(false)
  const schoolVisible = ref(false)
  const currentPackage = ref<any>(null)

  const parseBenefits = (benefits: string | string[]) => {
    if (Array.isArray(benefits)) return benefits
    try {
      const parsed = JSON.parse(benefits || '[]')
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const getSchoolIds = (pkg: any) => {
    if (!Array.isArray(pkg?.schools)) return []
    return pkg.schools.map((item: any) => item?.schoolId).filter(Boolean)
  }

  const getSchoolName = (schoolId: string) => {
    const school = schoolOptions.value.find(item => item.id === schoolId)
    return school?.name || schoolId
  }

  const getList = async () => {
    loading.value = true
    try {
      const [packageRes, schoolRes] = await Promise.all([fetchVipPackages(), fetchGetSchoolOptions()])
      packages.value = Array.isArray(packageRes) ? packageRes : []
      schoolOptions.value = Array.isArray(schoolRes) ? schoolRes : []
    } finally {
      loading.value = false
    }
  }

  const handleStatusChange = async (pkg: any) => {
    try {
      await toggleVipStatus(pkg.id, pkg.isEnabled)
      ElMessage.success(`${pkg.title} 状态已更新`)
    } catch {
      pkg.isEnabled = pkg.isEnabled === 1 ? 0 : 1
    }
  }

  const handleEditPrice = (pkg: any) => {
    currentPackage.value = pkg
    priceVisible.value = true
  }

  const handleEditBenefits = (pkg: any) => {
    currentPackage.value = pkg
    benefitsVisible.value = true
  }

  const handleEditSchools = (pkg: any) => {
    currentPackage.value = pkg
    schoolVisible.value = true
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
          right: 0;
          bottom: -1px;
          left: 0;
          height: 20px;
          background: linear-gradient(to bottom right, transparent 50%, #ffffff 50%);
        }
      }
    }
  }
</style>
