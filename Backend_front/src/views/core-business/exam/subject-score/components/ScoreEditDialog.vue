<template>
  <el-dialog
    :model-value="modelValue"
    title="编辑学生成绩"
    width="500px"
    destroy-on-close
    @close="handleClose"
  >
    <div class="score-edit-container">
      <div class="student-info">
        <div class="info-item">
          <span class="label">学生姓名:</span>
          <span class="value">{{ student?.studentName }}</span>
        </div>
        <div class="info-item">
          <span class="label">考号:</span>
          <span class="value">{{ student?.studentNo }}</span>
        </div>
      </div>

      <el-divider />

      <div class="section-title">小题满分设置:</div>
      <div class="question-list">
        <div v-for="(score, index) in questionScores" :key="index" class="question-item">
          <span class="question-no">{{ index + 1 }}</span>
          <el-input-number
            v-model="questionScores[index]"
            :min="0"
            :precision="1"
            class="score-input"
            placeholder="分值"
          />
          <el-button
            type="danger"
            link
            :icon="Delete"
            @click="removeQuestion(index)"
          />
        </div>
        <div class="add-question" @click="addQuestion">
          <el-icon><Plus /></el-icon>
          <span>点击添加</span>
        </div>
      </div>

      <div class="total-summary">
        <span class="label">总分:</span>
        <span class="value">{{ totalScore }}</span>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { Plus, Delete } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import { fetchSaveStudentScore } from '@/api/core-business/exam/project-editor'

  const props = defineProps<{
    modelValue: boolean
    projectId: string
    subjectName: string
    student: any | null
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'saved': []
  }>()

  const saving = ref(false)
  const questionScores = ref<number[]>([])

  watch(
    () => props.modelValue,
    (val) => {
      if (val && props.student) {
        // 如果已有小题分数据，则显示
        if (props.student.questionScores && Array.isArray(props.student.questionScores)) {
          questionScores.value = [...props.student.questionScores]
        } else if (typeof props.student.questionScores === 'string') {
          try {
            questionScores.value = JSON.parse(props.student.questionScores)
          } catch (e) {
            questionScores.value = []
          }
        } else {
          questionScores.value = []
        }
      }
    }
  )

  const totalScore = computed(() => {
    return questionScores.value.reduce((sum, s) => sum + (s || 0), 0).toFixed(1)
  })

  function addQuestion() {
    questionScores.value.push(0)
  }

  function removeQuestion(index: number) {
    questionScores.value.splice(index, 1)
  }

  function handleClose() {
    emit('update:modelValue', false)
  }

  async function handleSave() {
    if (!props.student) return

    saving.value = true
    try {
      await fetchSaveStudentScore({
        projectId: props.projectId,
        subjectName: props.subjectName,
        studentNo: props.student.studentNo,
        questionScores: questionScores.value
      })
      ElMessage.success('成绩保存成功')
      emit('saved')
      handleClose()
    } catch (error: any) {
      ElMessage.error(error.message || '保存失败')
    } finally {
      saving.value = false
    }
  }
</script>

<style scoped lang="scss">
  .score-edit-container {
    padding: 0 10px;
  }

  .student-info {
    display: flex;
    gap: 24px;
    margin-bottom: 10px;

    .info-item {
      .label {
        color: #64748b;
        margin-right: 8px;
      }
      .value {
        font-weight: 600;
        color: #1e293b;
      }
    }
  }

  .section-title {
    font-size: 15px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 16px;
  }

  .question-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 400px;
    overflow-y: auto;
    padding-right: 10px;
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

    .score-input {
      flex: 1;
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

  .total-summary {
    margin-top: 24px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;

    .label {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    .value {
      font-size: 24px;
      font-weight: 700;
      color: #409eff;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
</style>
