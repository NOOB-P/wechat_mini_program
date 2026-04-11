<template>
  <el-dialog
    :model-value="modelValue"
    title="选取学科"
    width="600px"
    align-center
    append-to-body
    @close="handleClose"
  >
    <div class="subject-select-container">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索学科名称"
        prefix-icon="Search"
        clearable
        class="mb-4"
      />
      
      <div class="subject-header">
        <span>可选学科</span>
        <span class="selected-count">已选中: <span class="highlight">{{ localSelected.length }}</span> 个学科</span>
      </div>

      <el-scrollbar max-height="400px">
        <div class="subject-grid">
          <div
            v-for="subject in filteredSubjects"
            :key="subject"
            class="subject-item"
            :class="{ active: localSelected.includes(subject) }"
            @click="toggleSubject(subject)"
          >
            <span>{{ subject }}</span>
            <el-icon v-if="localSelected.includes(subject)"><Check /></el-icon>
          </div>
        </div>
      </el-scrollbar>
    </div>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { Search, Check } from '@element-plus/icons-vue'

  const props = defineProps<{
    modelValue: boolean
    subjects: string[]
    selected: string[]
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'confirm': [selected: string[]]
  }>()

  const searchKeyword = ref('')
  const localSelected = ref<string[]>([])

  watch(() => props.modelValue, (val) => {
    if (val) {
      localSelected.value = [...props.selected]
      searchKeyword.value = ''
    }
  })

  const filteredSubjects = computed(() => {
    if (!searchKeyword.value) return props.subjects
    return props.subjects.filter(s => s.toLowerCase().includes(searchKeyword.value.toLowerCase()))
  })

  function toggleSubject(subject: string) {
    const index = localSelected.value.indexOf(subject)
    if (index >= 0) {
      localSelected.value.splice(index, 1)
    } else {
      localSelected.value.push(subject)
    }
  }

  function handleClose() {
    emit('update:modelValue', false)
  }

  function handleConfirm() {
    emit('confirm', [...localSelected.value])
    handleClose()
  }
</script>

<style scoped lang="scss">
  .subject-select-container {
    padding: 10px 0;
  }

  .subject-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    font-weight: 600;
    color: #606266;

    .selected-count {
      font-size: 13px;
      font-weight: normal;
      .highlight {
        color: #409eff;
        font-weight: 600;
      }
    }
  }

  .subject-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .subject-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border: 1px solid #dcdfe6;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 14px;

    &:hover {
      border-color: #409eff;
      color: #409eff;
    }

    &.active {
      background-color: #f0f7ff;
      border-color: #409eff;
      color: #409eff;
      font-weight: 600;
    }
  }

  .mb-4 {
    margin-bottom: 16px;
  }
</style>
