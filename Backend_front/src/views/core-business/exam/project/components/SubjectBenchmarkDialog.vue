<template>
  <el-dialog
    :model-value="modelValue"
    title="学科基准分数设置"
    width="800px"
    class="benchmark-dialog"
    append-to-body
    align-center
    destroy-on-close
    @close="handleClose"
  >
    <div class="benchmark-layout">
      <!-- 左侧学科列表 -->
      <div class="subject-sidebar">
        <div
          v-for="subject in subjects"
          :key="subject"
          class="subject-nav-item"
          :class="{ active: activeSubject === subject }"
          @click="activeSubject = subject"
        >
          {{ subject }}
        </div>
      </div>

      <!-- 右侧分数设置区 -->
      <div class="benchmark-main">
        <div v-if="activeSubject" class="settings-container">
          <div class="setting-section">
            <div class="section-title">学科满分:</div>
            <el-input-number
              v-model="currentConfig.totalScore"
              :min="0"
              :precision="1"
              class="total-score-input"
              placeholder="请输入学科满分"
            />
          </div>

          <el-divider />

          <div class="setting-section">
            <div class="section-title">小题满分设置:</div>
            <div class="batch-setting-panel">
              <div class="batch-setting-fields">
                <el-input-number
                  v-model="batchForm.startNo"
                  :min="1"
                  :precision="0"
                  placeholder="起始题号"
                />
                <span class="batch-separator">至</span>
                <el-input-number
                  v-model="batchForm.endNo"
                  :min="1"
                  :precision="0"
                  placeholder="结束题号"
                />
                <span class="batch-separator">每题</span>
                <el-input-number
                  v-model="batchForm.score"
                  :min="0"
                  :precision="1"
                  placeholder="分值"
                />
              </div>
              <div class="batch-setting-actions">
                <el-button type="primary" plain @click="applyBatchScore">批量应用</el-button>
                <el-button @click="clearQuestionScores">清空小题</el-button>
              </div>
              <div class="batch-setting-tip">适合连续多道题同分的场景，会自动补齐缺少的小题。</div>
            </div>
            <div class="question-list">
              <div v-for="(q, index) in currentConfig.questions" :key="index" class="question-item">
                <span class="question-no">{{ index + 1 }}</span>
                <el-input-number
                  v-model="q.score"
                  :min="0"
                  :precision="1"
                  class="question-score-input"
                  placeholder="分值"
                />
                <el-button type="danger" link :icon="Delete" @click="removeQuestion(index)" />
              </div>
              <div class="add-question" @click="addQuestion">
                <el-icon><Plus /></el-icon>
                <span>点击添加</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <el-empty description="请选择左侧学科进行设置" />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, watch, reactive } from 'vue'
  import { Plus, Delete } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'

  interface QuestionConfig {
    score: number
  }

  interface SubjectConfig {
    totalScore: number
    questions: QuestionConfig[]
  }

  const props = defineProps<{
    modelValue: boolean
    subjects: string[]
    initialBenchmarks?: Record<string, SubjectConfig>
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    confirm: [benchmarks: Record<string, SubjectConfig>]
  }>()

  const activeSubject = ref('')
  const benchmarks = reactive<Record<string, SubjectConfig>>({})
  const batchForm = reactive({
    startNo: 1,
    endNo: 5,
    score: 0
  })

  // 初始化 benchmarks 数据
  watch(
    () => props.modelValue,
    (val) => {
      if (val) {
        // 重置数据
        Object.keys(benchmarks).forEach((key) => delete benchmarks[key])

        // 填充初始数据或默认数据
        props.subjects.forEach((s) => {
          if (props.initialBenchmarks && props.initialBenchmarks[s]) {
            benchmarks[s] = JSON.parse(JSON.stringify(props.initialBenchmarks[s]))
          } else {
            benchmarks[s] = {
              totalScore: 100,
              questions: []
            }
          }
        })

        if (props.subjects.length > 0) {
          activeSubject.value = props.subjects[0]
        }
      }
    }
  )

  const currentConfig = ref<SubjectConfig>({ totalScore: 100, questions: [] })

  watch(activeSubject, (newSubject) => {
    if (newSubject && benchmarks[newSubject]) {
      currentConfig.value = benchmarks[newSubject]
      batchForm.startNo = 1
      batchForm.endNo = Math.max(benchmarks[newSubject].questions.length || 0, 5)
    }
  })

  function addQuestion() {
    if (activeSubject.value) {
      benchmarks[activeSubject.value].questions.push({ score: 0 })
    }
  }

  function ensureQuestionLength(length: number) {
    if (!activeSubject.value) return
    while (benchmarks[activeSubject.value].questions.length < length) {
      benchmarks[activeSubject.value].questions.push({ score: 0 })
    }
  }

  function removeQuestion(index: number) {
    if (activeSubject.value) {
      benchmarks[activeSubject.value].questions.splice(index, 1)
    }
  }

  function applyBatchScore() {
    if (!activeSubject.value) {
      return
    }

    const startNo = Number(batchForm.startNo || 0)
    const endNo = Number(batchForm.endNo || 0)
    if (startNo <= 0 || endNo <= 0) {
      ElMessage.warning('请输入有效的题号区间')
      return
    }

    const rangeStart = Math.min(startNo, endNo)
    const rangeEnd = Math.max(startNo, endNo)
    ensureQuestionLength(rangeEnd)

    for (let index = rangeStart - 1; index < rangeEnd; index += 1) {
      benchmarks[activeSubject.value].questions[index].score = Number(batchForm.score || 0)
    }
  }

  function clearQuestionScores() {
    if (!activeSubject.value) {
      return
    }
    benchmarks[activeSubject.value].questions = []
  }

  function handleClose() {
    emit('update:modelValue', false)
  }

  function handleConfirm() {
    emit('confirm', JSON.parse(JSON.stringify(benchmarks)))
    handleClose()
  }
</script>

<style scoped lang="scss">
  .benchmark-dialog {
    :deep(.el-dialog__body) {
      padding: 20px 24px;
    }
  }

  .benchmark-layout {
    display: flex;
    height: 480px;
    border: 1px solid #f1f5f9;
    border-radius: 8px;
    overflow: hidden;
  }

  .subject-sidebar {
    width: 160px;
    background: #f8fafc;
    border-right: 1px solid #f1f5f9;
    overflow-y: auto;

    .subject-nav-item {
      padding: 16px 20px;
      cursor: pointer;
      font-size: 14px;
      color: #475569;
      transition: all 0.2s;

      &:hover {
        background: #f1f5f9;
        color: #409eff;
      }

      &.active {
        background: #ffffff;
        color: #409eff;
        font-weight: 600;
        position: relative;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: #409eff;
        }
      }
    }
  }

  .benchmark-main {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    background: #fff;
  }

  .setting-section {
    .section-title {
      font-size: 15px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 16px;
    }
  }

  .total-score-input {
    width: 200px;
  }

  .question-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .batch-setting-panel {
    margin-bottom: 18px;
    padding: 16px;
    border-radius: 12px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
  }

  .batch-setting-fields {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  }

  .batch-separator {
    font-size: 13px;
    color: #64748b;
  }

  .batch-setting-actions {
    display: flex;
    gap: 12px;
    margin-top: 12px;
  }

  .batch-setting-tip {
    margin-top: 10px;
    font-size: 12px;
    color: #64748b;
  }

  .question-item {
    display: flex;
    align-items: center;
    gap: 16px;

    .question-no {
      width: 24px;
      font-size: 14px;
      color: #64748b;
    }

    .question-score-input {
      width: 160px;
    }
  }

  .add-question {
    margin-top: 16px;
    padding: 12px;
    border: 1px dashed #e2e8f0;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: #409eff;
      color: #409eff;
      background: #f0f7ff;
    }
  }

  .empty-state {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dialog-footer {
    padding-top: 20px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
</style>
