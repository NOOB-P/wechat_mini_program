<template>
  <el-dialog
    :model-value="modelValue"
    title="选取学生"
    width="1000px"
    align-center
    append-to-body
    class="student-select-dialog"
    @close="handleClose"
  >
    <div class="student-select-layout">
      <!-- 左侧选择区 -->
      <div class="select-main">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索学校、班级或学生"
          prefix-icon="Search"
          clearable
          class="mb-4"
        />

        <el-tabs v-model="activeTab" class="select-tabs">
          <el-tab-pane label="选取学校" name="school">
            <el-scrollbar max-height="450px">
              <div class="list-container">
                <div
                  v-for="item in filteredSchools"
                  :key="item.id"
                  class="list-item"
                  :class="{ active: isSchoolSelected(item.id) }"
                  @click="toggleSchool(item)"
                >
                  <div class="item-info">
                    <div class="item-title">{{ item.label }}</div>
                    <div class="item-meta">{{ item.classCount }} 个班级 · {{ item.studentCount }} 名学生</div>
                  </div>
                  <el-icon v-if="isSchoolSelected(item.id)"><Check /></el-icon>
                </div>
              </div>
            </el-scrollbar>
          </el-tab-pane>

          <el-tab-pane label="选取班级" name="class">
            <el-scrollbar max-height="450px">
              <div class="list-container">
                <div
                  v-for="item in filteredClasses"
                  :key="item.id"
                  class="list-item"
                  :class="{ active: isClassSelected(item.id) }"
                  @click="toggleProjectClass(item)"
                >
                  <div class="item-info">
                    <div class="item-title">{{ item.schoolName }} - {{ item.grade }}{{ item.className }}</div>
                    <div class="item-meta">{{ item.studentCount }} 名学生</div>
                  </div>
                  <el-icon v-if="isClassSelected(item.id)"><Check /></el-icon>
                </div>
              </div>
            </el-scrollbar>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 右侧预览区 -->
      <div class="select-side">
        <div class="side-header">
          <span class="side-title">已选取</span>
          <el-button link type="primary" @click="clearAll">清空</el-button>
        </div>
        
        <el-scrollbar max-height="500px">
          <el-tree
            :data="treeData"
            :props="treeProps"
            node-key="key"
            default-expand-all
            class="selected-tree"
          >
            <template #default="{ node, data }">
              <div class="tree-node">
                <span class="node-label">{{ node.label }}</span>
                <el-icon class="node-delete" @click.stop="removeNode(data)"><Close /></el-icon>
              </div>
            </template>
          </el-tree>
          <el-empty v-if="treeData.length === 0" description="暂未选取" :image-size="60" />
        </el-scrollbar>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <div class="selection-summary">
          已选取 <span class="highlight">{{ treeSchoolCount }}</span> 所学校，
          <span class="highlight">{{ selectedClassIds.length }}</span> 个班级
        </div>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { Search, Check, Close } from '@element-plus/icons-vue'
  import type { ProjectSchoolOption, ProjectClassOption } from '@/api/core-business/exam/project'

  const props = defineProps<{
    modelValue: boolean
    schools: ProjectSchoolOption[]
    classes: ProjectClassOption[]
    initialSchools: string[]
    initialClasses: string[]
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'confirm': [selection: { schoolIds: string[], classIds: string[] }]
  }>()

  const activeTab = ref('school')
  const searchKeyword = ref('')
  const selectedSchoolIds = ref<string[]>([])
  const selectedClassIds = ref<string[]>([])

  const treeProps = {
    label: 'label',
    children: 'children'
  }

  watch(() => props.modelValue, (val) => {
    if (val) {
      selectedSchoolIds.value = [...props.initialSchools]
      selectedClassIds.value = [...props.initialClasses]
      searchKeyword.value = ''
    }
  })

  const filteredSchools = computed(() => {
    if (!searchKeyword.value) return props.schools
    const kw = searchKeyword.value.toLowerCase()
    return props.schools.filter(s => s.label.toLowerCase().includes(kw))
  })

  const filteredClasses = computed(() => {
    if (!searchKeyword.value) return props.classes
    const kw = searchKeyword.value.toLowerCase()
    return props.classes.filter(c => 
      c.label.toLowerCase().includes(kw) || 
      c.schoolName.toLowerCase().includes(kw)
    )
  })

  const schoolMap = computed(() => {
    const map = new Map<string, ProjectClassOption[]>()
    selectedClassIds.value.forEach(cid => {
      const cls = props.classes.find(c => c.id === cid)
      if (cls) {
        if (!map.has(cls.schoolId)) {
          map.set(cls.schoolId, [])
        }
        map.get(cls.schoolId)!.push(cls)
      }
    })
    return map
  })

  const treeSchoolCount = computed(() => schoolMap.value.size)

  const treeData = computed(() => {
    const data: any[] = []
    schoolMap.value.forEach((classes, schoolId) => {
      const school = props.schools.find(s => s.id === schoolId)
      if (school) {
        data.push({
          key: `school-${schoolId}`,
          type: 'school',
          id: schoolId,
          label: school.label,
          children: classes.map(c => ({
            key: `class-${c.id}`,
            type: 'class',
            id: c.id,
            label: `${c.grade}${c.className}`
          }))
        })
      }
    })
    return data
  })

  function isSchoolSelected(id: string) {
    return selectedSchoolIds.value.includes(id)
  }

  function isClassSelected(id: string) {
    return selectedClassIds.value.includes(id)
  }

  function toggleSchool(school: ProjectSchoolOption) {
    const index = selectedSchoolIds.value.indexOf(school.id)
    const schoolClasses = props.classes.filter(c => c.schoolId === school.id)
    const schoolClassIds = schoolClasses.map(c => c.id)

    if (index >= 0) {
      // 取消选中学校
      selectedSchoolIds.value.splice(index, 1)
      // 同时取消选中该学校下的所有班级
      selectedClassIds.value = selectedClassIds.value.filter(id => !schoolClassIds.includes(id))
    } else {
      // 选中学校
      selectedSchoolIds.value.push(school.id)
      // 同时选中该学校下的所有班级
      schoolClassIds.forEach(id => {
        if (!selectedClassIds.value.includes(id)) {
          selectedClassIds.value.push(id)
        }
      })
    }
  }

  function toggleProjectClass(cls: ProjectClassOption) {
    const index = selectedClassIds.value.indexOf(cls.id)
    if (index >= 0) {
      // 取消选中班级
      selectedClassIds.value.splice(index, 1)
      // 如果该学校之前是全选状态，现在也要取消全选状态
      const sIndex = selectedSchoolIds.value.indexOf(cls.schoolId)
      if (sIndex >= 0) {
        selectedSchoolIds.value.splice(sIndex, 1)
      }
    } else {
      // 选中班级
      selectedClassIds.value.push(cls.id)
      // 检查该学校下的所有班级是否都已选中
      const schoolClasses = props.classes.filter(c => c.schoolId === cls.schoolId)
      const allSelected = schoolClasses.every(c => selectedClassIds.value.includes(c.id))
      if (allSelected && !selectedSchoolIds.value.includes(cls.schoolId)) {
        selectedSchoolIds.value.push(cls.schoolId)
      }
    }
  }

  function removeNode(data: any) {
    if (data.type === 'school') {
      const school = props.schools.find(s => s.id === data.id)
      if (school) toggleSchool(school)
    } else if (data.type === 'class') {
      const cls = props.classes.find(c => c.id === data.id)
      if (cls) toggleProjectClass(cls)
    }
  }

  function clearAll() {
    selectedSchoolIds.value = []
    selectedClassIds.value = []
  }

  function handleClose() {
    emit('update:modelValue', false)
  }

  function handleConfirm() {
    emit('confirm', {
      schoolIds: [...selectedSchoolIds.value],
      classIds: [...selectedClassIds.value]
    })
    handleClose()
  }
</script>

<style scoped lang="scss">
  .student-select-layout {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 24px;
    height: 550px;
  }

  .select-main {
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .select-tabs {
    flex: 1;
    :deep(.el-tabs__content) {
      padding: 10px 0;
    }
  }

  .list-container {
    display: grid;
    gap: 10px;
  }

  .list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background-color: #f9fbff;
      border-color: #409eff;
    }

    &.active {
      background-color: #f0f7ff;
      border-color: #409eff;
      .item-title {
        color: #409eff;
        font-weight: 600;
      }
    }

    .item-title {
      font-size: 15px;
      color: #303133;
      margin-bottom: 4px;
    }

    .item-meta {
      font-size: 12px;
      color: #909399;
    }

    .el-icon {
      color: #409eff;
      font-size: 18px;
    }
  }

  .select-side {
    background-color: #f8fbff;
    border-radius: 8px;
    padding: 16px;
    display: flex;
    flex-direction: column;
  }

  .side-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    .side-title {
      font-weight: 700;
      color: #303133;
    }
  }

  .selected-tree {
    background: transparent;
    :deep(.el-tree-node__content) {
      height: 36px;
      &:hover {
        background-color: #ecf5ff;
      }
    }
  }

  .tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 8px;
    font-size: 14px;
    .node-delete {
      font-size: 14px;
      color: #909399;
      cursor: pointer;
      &:hover {
        color: #f56c6c;
      }
    }
  }

  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .selection-summary {
    font-size: 14px;
    color: #606266;
    .highlight {
      color: #409eff;
      font-weight: 600;
      margin: 0 2px;
    }
  }

  .mb-4 {
    margin-bottom: 16px;
  }
</style>
