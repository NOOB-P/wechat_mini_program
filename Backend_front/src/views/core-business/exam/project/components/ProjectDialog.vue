<template>
  <el-dialog
    :model-value="modelValue"
    :title="mode === 'create' ? '创建考试项目' : '编辑考试项目'"
    width="900px"
    class="project-dialog"
    destroy-on-close
    @close="handleClose"
  >
    <div class="project-layout">
      <!-- 左侧表单区 -->
      <div class="project-form-container">
        <el-form :model="form" label-position="top" class="project-form">
          <el-form-item label="项目名称" required>
            <el-input v-model="form.name" placeholder="请输入项目名称" clearable />
          </el-form-item>

          <el-form-item label="选取学生" required>
            <div class="selection-box" @click="studentSelectVisible = true">
              <div v-if="hasStudentSelection" class="selection-summary">
                已选取 <span class="highlight">{{ selectedSchoolCount }}</span> 所学校，
                <span class="highlight">{{ selectedClassCount }}</span> 个班级
              </div>
              <div v-else class="placeholder">点击选取参与考试的学校或班级</div>
              <el-icon><ArrowRight /></el-icon>
            </div>
          </el-form-item>

          <el-form-item label="学科选择" required>
            <div class="selection-box subject-box" @click="subjectSelectVisible = true">
              <div v-if="form.subjects.length > 0" class="subject-tags">
                <el-tag
                  v-for="subject in form.subjects"
                  :key="subject"
                  closable
                  size="small"
                  class="subject-tag"
                  @close.stop="removeSubject(subject)"
                >
                  {{ subject }}
                </el-tag>
              </div>
              <div v-else class="placeholder">点击选择考试学科</div>
              <el-icon><Plus /></el-icon>
            </div>
          </el-form-item>

          <el-form-item label="学科基准分数" required>
            <div class="selection-box benchmark-box" @click="benchmarkVisible = true">
              <div v-if="Object.keys(form.benchmarks || {}).length > 0" class="benchmark-summary">
                已设置 <span class="highlight">{{ Object.keys(form.benchmarks || {}).length }}</span> 个学科的分值基准
              </div>
              <div v-else class="placeholder">点击设置各学科满分及小题分值</div>
              <el-icon><ArrowRight /></el-icon>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <!-- 右侧统计区 -->
      <div class="project-info-container">
        <div class="info-card stats-card">
          <div class="card-title">参与规模</div>
          <div class="stats-grid">
            <div class="stats-item">
              <div class="stats-label">学校数</div>
              <div class="stats-value">{{ selectedSchoolCount }}</div>
            </div>
            <div class="stats-item">
              <div class="stats-label">班级数</div>
              <div class="stats-value">{{ selectedClassCount }}</div>
            </div>
            <div class="stats-item">
              <div class="stats-label">学生数</div>
              <div class="stats-value">{{ selectedStudentCount }}</div>
            </div>
          </div>
        </div>

        <div class="info-card subject-stats-card">
          <div class="card-title">学科统计</div>
          <div class="subject-stats">
            <div class="stats-item">
              <div class="stats-label">已选学科</div>
              <div class="stats-value">{{ form.subjects.length }}</div>
            </div>
            <div class="subject-preview">
              <span v-if="form.subjects.length === 0" class="placeholder">暂未选择学科</span>
              <span v-else>{{ form.subjects.join('、') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">确认{{ mode === 'create' ? '创建' : '保存' }}</el-button>
      </div>
    </template>

    <!-- 子弹窗 -->
    <StudentSelectDialog
      v-model="studentSelectVisible"
      :schools="options.schools"
      :classes="options.classes"
      :initial-schools="form.schoolIds"
      :initial-classes="form.classIds"
      @confirm="handleStudentConfirm"
    />

    <SubjectSelectDialog
      v-model="subjectSelectVisible"
      :subjects="options.subjects"
      :selected="form.subjects"
      @confirm="handleSubjectConfirm"
    />

    <SubjectBenchmarkDialog
      v-model="benchmarkVisible"
      :subjects="form.subjects"
      :initial-benchmarks="form.benchmarks"
      @confirm="handleBenchmarkConfirm"
    />
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, reactive, watch, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import { ArrowRight, Plus } from '@element-plus/icons-vue'
  import StudentSelectDialog from './StudentSelectDialog.vue'
  import SubjectSelectDialog from './SubjectSelectDialog.vue'
  import SubjectBenchmarkDialog from './SubjectBenchmarkDialog.vue'
  import { addProject, updateProject } from './ProjectDialog'
  import type { ExamProjectForm, ProjectSchoolOption, ProjectClassOption } from '@/api/core-business/exam/project'

  const props = defineProps<{
    modelValue: boolean
    mode: 'create' | 'edit'
    options: {
      schools: ProjectSchoolOption[]
      classes: ProjectClassOption[]
      subjects: string[]
    }
    project: Partial<ExamProjectForm> | null
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'saved': []
  }>()

  const saving = ref(false)
  const studentSelectVisible = ref(false)
  const subjectSelectVisible = ref(false)
  const benchmarkVisible = ref(false)

  const form = reactive<ExamProjectForm>({
    id: '',
    name: '',
    schoolIds: [],
    classIds: [],
    subjects: [],
    benchmarks: {}
  })

  watch(
    () => props.modelValue,
    (val) => {
      if (val && props.project) {
        Object.assign(form, {
          id: props.project.id || '',
          name: props.project.name || '',
          schoolIds: [...(props.project.schoolIds || [])],
          classIds: [...(props.project.classIds || [])],
          subjects: [...(props.project.subjects || [])],
          benchmarks: props.project.benchmarks || {}
        })
      }
    }
  )

  const hasStudentSelection = computed(() => form.classIds.length > 0)

  const selectedSchoolCount = computed(() => {
    const schoolIds = new Set<string>()
    form.classIds.forEach(cid => {
      const cls = props.options.classes.find(c => c.id === cid)
      if (cls) {
        schoolIds.add(cls.schoolId)
      }
    })
    return schoolIds.size
  })

  const selectedClassCount = computed(() => form.classIds.length)

  const selectedStudentCount = computed(() => {
    let count = 0
    form.classIds.forEach(cid => {
      const cls = props.options.classes.find(c => c.id === cid)
      if (cls) {
        count += cls.studentCount
      }
    })
    return count
  })

  function handleStudentConfirm(selection: { schoolIds: string[]; classIds: string[] }) {
    form.schoolIds = selection.schoolIds
    form.classIds = selection.classIds
  }

  function handleSubjectConfirm(selected: string[]) {
    form.subjects = selected
    // 移除不在已选科目中的基准分数
    if (form.benchmarks) {
      const newBenchmarks: any = {}
      selected.forEach(s => {
        if (form.benchmarks && form.benchmarks[s]) {
          newBenchmarks[s] = form.benchmarks[s]
        }
      })
      form.benchmarks = newBenchmarks
    }
  }

  function handleBenchmarkConfirm(benchmarks: any) {
    form.benchmarks = benchmarks
  }

  function removeSubject(subject: string) {
    form.subjects = form.subjects.filter(s => s !== subject)
    if (form.benchmarks) {
      delete form.benchmarks[subject]
    }
  }

  function handleClose() {
    emit('update:modelValue', false)
  }

  async function handleSave() {
    if (!form.name) {
      return ElMessage.warning('请输入项目名称')
    }
    if (!hasStudentSelection.value) {
      return ElMessage.warning('请选取参与学生')
    }
    if (form.subjects.length === 0) {
      return ElMessage.warning('请至少选择一个学科')
    }
    
    // 检查基准分数是否完整
    const benchmarkCount = Object.keys(form.benchmarks || {}).length
    if (benchmarkCount < form.subjects.length) {
      return ElMessage.warning('请设置所有已选学科的基准分数')
    }

    saving.value = true
    try {
      if (props.mode === 'create') {
        await addProject(form)
        ElMessage.success('创建成功')
      } else {
        await updateProject(form)
        ElMessage.success('更新成功')
      }
      emit('saved')
      handleClose()
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    } finally {
      saving.value = false
    }
  }
</script>

<style scoped lang="scss">
  .project-layout {
    display: flex;
    gap: 24px;
    padding: 10px 0;
  }

  .project-form-container {
    flex: 1;
    min-width: 0;
  }

  .project-info-container {
    width: 320px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .project-form {
    :deep(.el-form-item__label) {
      font-weight: 600;
      color: #303133;
      padding-bottom: 12px;
    }
  }

  .selection-box {
    width: 100%;
    min-height: 48px;
    padding: 12px 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.2s;

    &:hover {
      border-color: #409eff;
      background: #f0f7ff;
    }

    .placeholder {
      color: #94a3b8;
      font-size: 14px;
    }

    .selection-summary {
      font-size: 14px;
      color: #475569;
      .highlight {
        color: #409eff;
        font-weight: 600;
        margin: 0 2px;
      }
    }

    &.subject-box {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      min-height: 120px;
      padding-bottom: 40px;
      position: relative;

      .subject-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .el-icon {
        position: absolute;
        right: 16px;
        bottom: 16px;
        color: #94a3b8;
      }
    }
  }

  .info-card {
    background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
    border: 1px solid #f1f5f9;
    position: relative;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba(64, 158, 255, 0.03) 0%, transparent 70%);
      pointer-events: none;
    }

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      
      &::before {
        content: '';
        width: 4px;
        height: 16px;
        background: #409eff;
        border-radius: 2px;
        margin-right: 8px;
      }
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .stats-item {
    .stats-label {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 8px;
    }
    .stats-value {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
      font-family: 'PingFang SC', sans-serif;
    }
  }

  .subject-stats {
    .stats-item {
      margin-bottom: 16px;
    }
    .subject-preview {
      font-size: 14px;
      color: #64748b;
      line-height: 1.6;
      background: #f8fafc;
      padding: 12px;
      border-radius: 8px;
      min-height: 60px;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 10px;
  }

  .subject-tag {
    border-radius: 6px;
    padding: 0 10px;
    height: 28px;
    line-height: 26px;
  }
</style>
