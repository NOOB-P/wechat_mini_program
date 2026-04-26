<template>
  <div class="student-select">
    <ElInput
      v-model="displayValue"
      placeholder="请点击选择学生"
      readonly
      class="student-input"
      @click="openDialog"
    >
      <template #append>
        <ElButton @click="openDialog">
          <ElIcon><Search /></ElIcon>
          选择
        </ElButton>
      </template>
    </ElInput>

    <ElDialog
      v-model="visible"
      title="选择学生"
      width="700px"
      align-center
      append-to-body
      destroy-on-close
      class="student-select-dialog"
    >
      <div class="dialog-content">
        <!-- 级联选择区域 -->
        <div class="cascade-section mb-4">
          <ElRow :gutter="10">
            <ElCol :span="6">
              <ElSelect v-model="selectedProvince" placeholder="省份" clearable size="small" @change="handleProvinceChange">
                <ElOption v-for="item in provinces" :key="item.id" :label="item.name" :value="item.name" />
              </ElSelect>
            </ElCol>
            <ElCol :span="6">
              <ElSelect v-model="selectedCity" placeholder="城市" clearable size="small" :disabled="!selectedProvince" @change="handleCityChange">
                <ElOption v-for="item in cities" :key="item.id" :label="item.name" :value="item.name" />
              </ElSelect>
            </ElCol>
            <ElCol :span="6">
              <ElSelect v-model="selectedSchoolId" placeholder="学校" clearable size="small" :disabled="!selectedCity" @change="handleSchoolChange">
                <ElOption v-for="item in schools" :key="item.id" :label="item.name" :value="item.id" />
              </ElSelect>
            </ElCol>
            <ElCol :span="6">
              <ElSelect v-model="selectedClassId" placeholder="班级" clearable size="small" :disabled="!selectedSchoolId" @change="handleClassChange">
                <ElOption v-for="item in classes" :key="item.id" :label="item.name" :value="item.id" />
              </ElSelect>
            </ElCol>
          </ElRow>
          <ElRow class="mt-2">
            <ElCol :span="24">
              <ElInput
                v-model="searchKeyword"
                placeholder="学生姓名搜索"
                clearable
                size="small"
                @keyup.enter="handleSearch"
              >
                <template #append>
                  <ElButton size="small" @click="handleSearch">
                    <ElIcon><Search /></ElIcon>
                  </ElButton>
                </template>
              </ElInput>
            </ElCol>
          </ElRow>
        </div>

        <!-- 选择结果显示区域 -->
        <div class="selection-result mb-2" v-if="hasSelection">
          <span class="result-label text-xs">当前筛选：</span>
          <ElTag v-if="selectedProvince" size="small" closable @close="clearProvince" class="mr-1">{{ selectedProvince }}</ElTag>
          <ElTag v-if="selectedCity" size="small" closable @close="clearCity" class="mr-1">{{ selectedCity }}</ElTag>
          <ElTag v-if="selectedSchoolName" size="small" closable @close="clearSchool" class="mr-1">{{ selectedSchoolName }}</ElTag>
          <ElTag v-if="selectedClassName" size="small" closable @close="clearClass" class="mr-1">{{ selectedClassName }}</ElTag>
        </div>

        <!-- 学生列表 -->
        <ElTable
          v-loading="loading"
          :data="studentList"
          height="280px"
          highlight-current-row
          size="small"
          row-class-name="student-table-row"
          @current-change="handleCurrentChange"
        >
          <ElTableColumn prop="name" label="姓名" width="100" />
          <ElTableColumn prop="school" label="学校" show-overflow-tooltip />
          <ElTableColumn prop="className" label="班级" width="100" />
          <ElTableColumn prop="studentNo" label="学号" width="120" />
        </ElTable>

        <!-- 分页 -->
        <div class="pagination-container mt-4 flex justify-end">
          <ElPagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.size"
            :total="pagination.total"
            layout="total, prev, pager, next"
            @current-change="handlePageChange"
          />
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="visible = false">取消</ElButton>
          <ElButton type="primary" :disabled="!currentRow" @click="handleConfirm">确定</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, reactive, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { fetchGetSchoolTree } from '@/api/core-business/school'
import { getClassOptions } from '@/api/core-business/sys-class'
import { fetchGetStudentList } from '@/api/core-business/student'

const props = defineProps<{
  modelValue?: string | number
  initialName?: string
}>()

const emit = defineEmits(['update:modelValue', 'change'])

const visible = ref(false)
const loading = ref(false)
const displayValue = ref(props.initialName || '')
const searchKeyword = ref('')

// 级联数据
const provinces = ref<any[]>([])
const cities = ref<any[]>([])
const schools = ref<any[]>([])
const classes = ref<any[]>([])
const studentList = ref<any[]>([])

// 选中值
const selectedProvince = ref('')
const selectedCity = ref('')
const selectedSchoolId = ref('')
const selectedClassId = ref('')
const currentRow = ref<any>(null)

// 计算属性：选中项的名称，用于显示
const selectedSchoolName = computed(() => {
  if (!selectedSchoolId.value) return ''
  const school = schools.value.find(s => s.id === selectedSchoolId.value)
  return school ? school.name : ''
})

const selectedClassName = computed(() => {
  if (!selectedClassId.value) return ''
  const cls = classes.value.find(c => c.id === selectedClassId.value)
  return cls ? cls.name : ''
})

const hasSelection = computed(() => {
  return selectedProvince.value || selectedCity.value || selectedSchoolId.value || selectedClassId.value
})

// 分页
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 原始树数据
let rawTree: any[] = []

const openDialog = () => {
  visible.value = true
  if (rawTree.length === 0) {
    loadTreeData()
  }
}

const loadTreeData = async () => {
  try {
    const res = await fetchGetSchoolTree()
    if (res) {
      rawTree = res
      provinces.value = res
    }
  } catch (error) {
    console.error('Failed to load school tree:', error)
  }
}

const handleProvinceChange = (val: string) => {
  selectedCity.value = ''
  selectedSchoolId.value = ''
  selectedClassId.value = ''
  cities.value = []
  schools.value = []
  classes.value = []
  
  if (val) {
    const provinceNode = rawTree.find(p => p.name === val)
    cities.value = provinceNode?.children || []
  }
  
  handleClassChange() // 立即刷新列表
}

const handleCityChange = (val: string) => {
  selectedSchoolId.value = ''
  selectedClassId.value = ''
  schools.value = []
  classes.value = []
  
  if (val) {
    const cityNode = cities.value.find(c => c.name === val)
    schools.value = cityNode?.children || []
  }
  
  handleClassChange() // 立即刷新列表
}

const handleSchoolChange = async (val: string) => {
  selectedClassId.value = ''
  classes.value = []
  
  if (val) {
    try {
      const res = await getClassOptions(val)
      if (res) {
        classes.value = res.map((item: any) => ({
          id: item.id,
          name: item.name
        }))
      }
    } catch (error) {
      console.error('Failed to load classes:', error)
    }
  }
  
  handleClassChange() // 立即刷新列表
}

const clearProvince = () => {
  selectedProvince.value = ''
  handleProvinceChange('')
}

const clearCity = () => {
  selectedCity.value = ''
  handleCityChange('')
}

const clearSchool = () => {
  selectedSchoolId.value = ''
  handleSchoolChange('')
}

const clearClass = () => {
  selectedClassId.value = ''
  handleClassChange()
}

const handleClassChange = () => {
  pagination.current = 1
  loadStudents()
}

const handleSearch = () => {
  pagination.current = 1
  // 搜索时清空级联选择，除非用户希望搜索是在当前选择范围内（通常搜索是全局的或带条件的）
  // 这里我们保持当前选择的条件，如果用户输入了搜索词，则加上搜索词
  loadStudents()
}

const loadStudents = async () => {
  loading.value = true
  try {
    const params = {
      current: pagination.current,
      size: pagination.size,
      keyword: searchKeyword.value,
      schoolId: selectedSchoolId.value,
      classId: selectedClassId.value
    }
    const res = await fetchGetStudentList(params)
    if (res) {
      studentList.value = res.records || []
      pagination.total = res.total || 0
    }
  } catch (error) {
    console.error('Failed to load students:', error)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (val: number) => {
  pagination.current = val
  loadStudents()
}

const handleCurrentChange = (val: any) => {
  currentRow.value = val
}

const handleConfirm = () => {
  if (currentRow.value) {
    displayValue.value = `${currentRow.value.name} (${currentRow.value.school})`
    emit('update:modelValue', currentRow.value.id)
    emit('change', currentRow.value)
    visible.value = false
  }
}

watch(() => props.initialName, (val) => {
  displayValue.value = val || ''
})

onMounted(() => {
  loadStudents()
})
</script>

<style scoped>
.mb-4 {
  margin-bottom: 1rem;
}
.mt-4 {
  margin-top: 1rem;
}
.flex {
  display: flex;
}
.justify-end {
  justify-content: flex-end;
}
.student-input :deep(.el-input__wrapper) {
  cursor: pointer;
}
.student-input :deep(.el-input__inner) {
  cursor: pointer;
}
.dialog-content {
  padding: 0 20px 10px;
}
.cascade-section {
  padding: 15px 0 10px;
}
.selection-result {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 15px;
}
.result-label {
  font-size: 13px;
  color: #606266;
  margin-right: 8px;
}
.mr-2 {
  margin-right: 0.5rem;
}
:deep(.student-table-row) {
  cursor: pointer;
}
:deep(.el-table) {
  border-radius: 4px;
}
.student-select-dialog :deep(.el-dialog__body) {
  padding: 10px 20px !important;
}
</style>
