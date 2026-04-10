<template>
  <el-dialog
    :model-value="modelValue"
    :title="dialogTitle"
    width="1080px"
    align-center
    destroy-on-close
    class="project-dialog"
    @close="handleClose"
  >
    <div class="dialog-layout">
      <div class="dialog-main">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          class="dialog-form"
        >
          <el-form-item label="项目名称" prop="name">
            <el-input
              v-model="form.name"
              maxlength="50"
              placeholder="请输入考试项目名称"
              show-word-limit
            />
          </el-form-item>

          <div class="target-grid">
            <el-form-item label="纳入学校">
              <el-select-v2
                v-model="form.schoolIds"
                :options="schoolSelectOptions"
                class="w-full"
                collapse-tags
                filterable
                multiple
                placeholder="请选择考试学校"
              />
              <div class="field-tip">选中学校后，会自动纳入该学校下全部班级和学生。</div>
            </el-form-item>

            <el-form-item label="补充班级">
              <el-select-v2
                v-model="form.classIds"
                :options="classSelectOptions"
                class="w-full"
                collapse-tags
                filterable
                multiple
                placeholder="请选择补充班级"
              />
              <div class="field-tip"
                >可额外补充指定班级；若已被所选学校覆盖，会在统计时自动去重。</div
              >
            </el-form-item>
          </div>

          <el-form-item label="考试科目" prop="subjects">
            <div class="subject-grid">
              <div
                v-for="subject in options.subjects"
                :key="subject"
                class="subject-item"
                :class="{ active: form.subjects.includes(subject) }"
                @click="toggleSubject(subject)"
              >
                <span>{{ subject }}</span>
                <el-icon v-if="form.subjects.includes(subject)"><Check /></el-icon>
              </div>
            </div>
          </el-form-item>
        </el-form>

        <div class="selection-section">
          <div class="selection-header">
            <div>
              <div class="selection-title">已选范围</div>
              <div class="selection-desc">
                已选 {{ selectedSchoolRows.length }} 所学校，{{ selectedClassRows.length }}
                个补充班级
              </div>
            </div>
            <el-button text type="primary" @click="clearSelection">清空</el-button>
          </div>

          <div class="selection-grid">
            <div class="selection-group">
              <div class="selection-group__title">学校</div>
              <el-empty
                v-if="selectedSchoolRows.length === 0"
                description="暂未选择学校"
                :image-size="52"
              />
              <el-scrollbar v-else max-height="140px">
                <div class="selected-list">
                  <div v-for="item in selectedSchoolRows" :key="item.id" class="selected-card">
                    <div class="selected-card__title">{{ item.title }}</div>
                    <div class="selected-card__meta">{{ item.meta }}</div>
                    <div class="selected-card__count">{{ item.countText }}</div>
                  </div>
                </div>
              </el-scrollbar>
            </div>

            <div class="selection-group">
              <div class="selection-group__title">补充班级</div>
              <el-empty
                v-if="selectedClassRows.length === 0"
                description="暂未补充班级"
                :image-size="52"
              />
              <el-scrollbar v-else max-height="140px">
                <div class="selected-list">
                  <div v-for="item in selectedClassRows" :key="item.id" class="selected-card">
                    <div class="selected-card__title">{{ item.title }}</div>
                    <div class="selected-card__meta">{{ item.meta }}</div>
                    <div class="selected-card__count">{{ item.countText }}</div>
                  </div>
                </div>
              </el-scrollbar>
            </div>
          </div>
        </div>
      </div>

      <div class="dialog-side">
        <div class="summary-panel">
          <div class="summary-title">配置概览</div>
          <div class="summary-highlight">预计覆盖 {{ summary.studentCount }} 名考生</div>

          <div class="summary-grid">
            <div class="summary-item">
              <span>已选学校</span>
              <strong>{{ selectedSchoolRows.length }}</strong>
            </div>
            <div class="summary-item">
              <span>补充班级</span>
              <strong>{{ selectedClassRows.length }}</strong>
            </div>
            <div class="summary-item">
              <span>覆盖学校</span>
              <strong>{{ summary.schoolCount }}</strong>
            </div>
            <div class="summary-item">
              <span>覆盖班级</span>
              <strong>{{ summary.classCount }}</strong>
            </div>
            <div class="summary-item">
              <span>考试科目</span>
              <strong>{{ form.subjects.length }}</strong>
            </div>
          </div>
        </div>

        <div class="summary-note">
          学校会自动纳入该校全部班级和学生，补充班级会与学校覆盖范围合并并自动去重。
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ submitText }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { Check } from '@element-plus/icons-vue'
  import { computed, reactive, ref, watch } from 'vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import type {
    ExamProjectForm,
    ProjectClassOption,
    ProjectSchoolOption
  } from '@/api/core-business/exam/project'
  import { fetchAddProject, fetchUpdateProject } from '@/api/core-business/exam/project'

  interface Props {
    modelValue: boolean
    mode: 'create' | 'edit'
    project?: Partial<ExamProjectForm> | null
    options: {
      schools: ProjectSchoolOption[]
      classes: ProjectClassOption[]
      subjects: string[]
    }
  }

  interface SelectionRow {
    id: string
    title: string
    meta: string
    countText: string
  }

  const props = defineProps<Props>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    saved: []
  }>()

  const formRef = ref<FormInstance>()
  const submitting = ref(false)
  const form = reactive<ExamProjectForm>({
    name: '',
    examType: 'NORMAL',
    schoolIds: [],
    classIds: [],
    subjects: []
  })

  const rules: FormRules<ExamProjectForm> = {
    name: [{ required: true, message: '请输入考试项目名称', trigger: 'blur' }],
    subjects: [
      { required: true, type: 'array', min: 1, message: '请至少选择一个科目', trigger: 'change' }
    ]
  }

  const schoolMap = computed<Record<string, ProjectSchoolOption>>(() =>
    Object.fromEntries(props.options.schools.map((item) => [item.id, item]))
  )

  const classMap = computed<Record<string, ProjectClassOption>>(() =>
    Object.fromEntries(props.options.classes.map((item) => [item.id, item]))
  )

  const schoolSelectOptions = computed(() =>
    props.options.schools.map((item) => ({
      label: `${item.label} · ${item.classCount} 个班级 / ${item.studentCount} 名学生`,
      value: item.id
    }))
  )

  const classSelectOptions = computed(() =>
    props.options.classes.map((item) => ({
      label: `${item.label} · ${item.studentCount} 名学生`,
      value: item.id
    }))
  )

  const dialogTitle = computed(() => (props.mode === 'create' ? '创建考试项目' : '编辑考试项目'))
  const submitText = computed(() => (props.mode === 'create' ? '创建项目' : '保存项目'))

  const selectedSchoolRows = computed<SelectionRow[]>(() =>
    form.schoolIds
      .map((id) => schoolMap.value[id])
      .filter((item): item is ProjectSchoolOption => Boolean(item))
      .map((item) => ({
        id: item.id,
        title: item.name,
        meta: `${item.province || ''}${item.city || ''}` || '已选学校',
        countText: `${item.classCount} 个班级 / ${item.studentCount} 名学生`
      }))
  )

  const selectedClassRows = computed<SelectionRow[]>(() =>
    form.classIds
      .map((id) => classMap.value[id])
      .filter((item): item is ProjectClassOption => Boolean(item))
      .map((item) => ({
        id: item.id,
        title: `${item.schoolName} ${item.grade}${item.className}`,
        meta: `班级编号：${item.id}`,
        countText: `${item.studentCount} 名学生`
      }))
  )

  const resolvedClasses = computed(() => {
    const rows = new Map<string, ProjectClassOption>()
    for (const schoolId of form.schoolIds) {
      props.options.classes
        .filter((item) => item.schoolId === schoolId)
        .forEach((item) => rows.set(item.id, item))
    }
    for (const classId of form.classIds) {
      const target = classMap.value[classId]
      if (target) rows.set(target.id, target)
    }
    return [...rows.values()]
  })

  const summary = computed(() => ({
    schoolCount: new Set(resolvedClasses.value.map((item) => item.schoolId)).size,
    classCount: resolvedClasses.value.length,
    studentCount: resolvedClasses.value.reduce((sum, item) => sum + item.studentCount, 0)
  }))

  watch(
    () => [props.modelValue, props.project],
    ([visible]) => {
      if (visible) resetForm()
    },
    { immediate: true, deep: true }
  )

  function resetForm() {
    const legacyJoint = props.project?.examType === 'JOINT'
    form.name = props.project?.name ?? ''
    form.examType = 'NORMAL'
    form.schoolIds = [...(props.project?.schoolIds ?? [])]
    form.classIds = legacyJoint ? [] : [...(props.project?.classIds ?? [])]
    form.subjects = [...(props.project?.subjects ?? [])]
    formRef.value?.clearValidate()
  }

  function toggleSubject(subject: string) {
    const index = form.subjects.indexOf(subject)
    if (index >= 0) {
      form.subjects.splice(index, 1)
    } else {
      form.subjects.push(subject)
    }
  }

  function clearSelection() {
    form.schoolIds = []
    form.classIds = []
  }

  function handleClose() {
    emit('update:modelValue', false)
  }

  async function handleSubmit() {
    if (!formRef.value) return
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return
    if (form.schoolIds.length === 0 && form.classIds.length === 0) {
      ElMessage.warning('请至少选择一个学校或班级')
      return
    }

    const payload: ExamProjectForm = {
      id: props.project?.id,
      name: form.name.trim(),
      examType: 'NORMAL',
      schoolIds: [...form.schoolIds],
      classIds: [...form.classIds],
      subjects: [...form.subjects]
    }

    submitting.value = true
    try {
      if (props.mode === 'create') {
        await fetchAddProject(payload)
        ElMessage.success('考试项目创建成功')
      } else {
        await fetchUpdateProject(payload)
        ElMessage.success('考试项目已更新')
      }
      emit('saved')
      emit('update:modelValue', false)
    } catch {
      // 错误提示由 http 拦截器统一处理，这里只阻止未捕获异常继续冒泡。
    } finally {
      submitting.value = false
    }
  }
</script>

<style scoped lang="scss">
  :global(.project-dialog) {
    max-width: calc(100vw - 32px) !important;
    border-radius: 24px !important;
    display: flex !important;
    flex-direction: column !important;
    max-height: 90vh !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    overflow: hidden !important;
  }

  :global(.project-dialog .el-dialog__body) {
    padding-top: 10px;
    padding-bottom: 18px;
    overflow-y: auto;
    flex: 1;
  }

  .dialog-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 300px;
    gap: 20px;
    align-items: start;
  }

  .dialog-main,
  .dialog-side {
    min-width: 0;
  }

  .dialog-form {
    display: grid;
    gap: 4px;
  }

  .target-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .w-full {
    width: 100%;
  }

  .field-tip {
    margin-top: 8px;
    color: #64748b;
    font-size: 12px;
    line-height: 1.5;
  }

  .subject-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 10px;
    width: 100%;
  }

  .subject-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 42px;
    padding: 0 14px;
    border: 1px solid #d7e3f5;
    border-radius: 12px;
    background: #fff;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .subject-item.active {
    color: #409eff;
    border-color: #409eff;
    background-color: #f0f7ff;
  }

  .selection-section {
    padding: 20px;
    margin-top: 24px;
    background: #fff;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
  }

  .selection-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
  }

  .selection-title {
    font-weight: 700;
    color: #303133;
  }

  .selection-desc {
    margin-top: 4px;
    color: #909399;
    font-size: 12px;
  }

  .selection-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .selection-group {
    min-width: 0;
    padding: 16px;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    background: #fafafa;
  }

  .selection-group__title {
    margin-bottom: 12px;
    font-weight: 600;
    color: #606266;
  }

  .selected-list {
    display: grid;
    gap: 10px;
  }

  .selected-card {
    padding: 12px;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    background: #fff;
  }

  .selected-card__title {
    font-weight: 600;
    color: #303133;
    font-size: 14px;
  }

  .selected-card__meta,
  .selected-card__count {
    margin-top: 4px;
    color: #909399;
    font-size: 12px;
    line-height: 1.5;
  }

  .summary-panel {
    padding: 24px;
    background-color: #409eff;
    border-radius: 8px;
    color: #fff;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
  }

  .summary-title {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 16px;
  }

  .summary-highlight {
    margin-bottom: 20px;
    padding: 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.1);
    font-size: 16px;
    font-weight: 700;
    text-align: center;
  }

  .summary-grid {
    display: grid;
    gap: 12px;
  }

  .summary-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.05);
  }

  .summary-item span {
    color: rgba(255, 255, 255, 0.8);
    font-size: 13px;
  }

  .summary-item strong {
    font-size: 20px;
  }

  .summary-note {
    margin-top: 20px;
    padding: 16px;
    border-radius: 8px;
    background: #fff;
    border: 1px solid #ebeef5;
    color: #909399;
    font-size: 12px;
    line-height: 1.6;
  }

  @media (max-width: 1180px) {
    .dialog-layout {
      grid-template-columns: 1fr;
    }

    .dialog-side {
      order: -1;
    }
  }

  @media (max-width: 860px) {
    .target-grid,
    .selection-grid {
      grid-template-columns: 1fr;
    }

    .subject-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
</style>
