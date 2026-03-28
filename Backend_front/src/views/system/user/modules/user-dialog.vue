<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
    width="450px"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="用户名" prop="userName">
        <ElInput v-model="formData.userName" placeholder="请输入用户名" />
      </ElFormItem>
      <ElFormItem label="手机号" prop="userPhone">
        <ElInput v-model="formData.userPhone" placeholder="请输入手机号" />
      </ElFormItem>
      <ElFormItem label="用户类型" prop="userType">
        <ElSelect v-model="formData.userType" placeholder="请选择用户类型" class="w-full">
          <ElOption label="管理员" value="1" />
          <ElOption label="学校" value="2" />
          <ElOption label="家长" value="3" />
          <ElOption label="学生" value="4" />
        </ElSelect>
      </ElFormItem>

      <!-- 学校用户特有字段 -->
      <template v-if="formData.userType === '2'">
        <ElFormItem label="绑定学校" prop="schoolName">
          <ElInput v-model="formData.schoolName" placeholder="请输入学校名称" />
        </ElFormItem>
      </template>

      <!-- 家长用户特有字段 -->
      <template v-if="formData.userType === '3'">
        <ElFormItem label="绑定学校" prop="schoolName">
          <ElInput v-model="formData.schoolName" placeholder="请输入学校名称" />
        </ElFormItem>
        <ElFormItem label="绑定班级" prop="className">
          <ElInput v-model="formData.className" placeholder="请输入班级名称" />
        </ElFormItem>
        <ElFormItem label="关联学生" prop="studentName">
          <ElInput v-model="formData.studentName" placeholder="请输入学生姓名" />
        </ElFormItem>
      </template>

      <!-- 学生用户特有字段 -->
      <template v-if="formData.userType === '4'">
        <ElFormItem label="就读学校" prop="schoolName">
          <ElInput v-model="formData.schoolName" placeholder="请输入学校名称" />
        </ElFormItem>
        <ElFormItem label="就读班级" prop="className">
          <ElInput v-model="formData.className" placeholder="请输入班级名称" />
        </ElFormItem>
        <ElFormItem label="关联家长" prop="parentName">
          <ElInput v-model="formData.parentName" placeholder="请输入家长姓名" />
        </ElFormItem>
      </template>

      <ElFormItem label="状态" prop="status">
        <ElRadioGroup v-model="formData.status">
          <ElRadio label="1">正常</ElRadio>
          <ElRadio label="2">禁用</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { fetchAddUser, fetchUpdateUser } from '@/api/system/user'

  interface Props {
    visible: boolean
    type: string
    userData?: Partial<Api.SystemManage.UserListItem>
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const submitLoading = ref(false)

  // 对话框显示控制
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)

  // 表单实例
  const formRef = ref<FormInstance>()

  // 表单数据
  const formData = reactive<Partial<Api.SystemManage.UserListItem>>({
    id: undefined,
    userName: '',
    userPhone: '',
    userType: '1',
    status: '1',
    schoolName: '',
    gradeName: '',
    className: '',
    studentName: '',
    parentName: ''
  })

  // 表单验证规则
  const rules: FormRules = {
    userName: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    userPhone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
    ],
    userType: [{ required: true, message: '请选择用户类型', trigger: 'change' }]
  }

  /**
   * 初始化表单数据
   * 根据对话框类型（新增/编辑）填充表单
   */
  const initFormData = () => {
    const isEdit = props.type === 'edit' && props.userData
    const row = props.userData

    if (isEdit && row) {
      Object.assign(formData, {
        id: row.id,
        userName: row.userName || '',
        userPhone: row.userPhone || '',
        userType: row.userType || '1',
        status: row.status || '1',
        schoolName: row.schoolName || '',
        gradeName: row.gradeName || '',
        className: row.className || '',
        studentName: row.studentName || '',
        parentName: row.parentName || ''
      })
    } else {
      Object.assign(formData, {
        id: undefined,
        userName: '',
        userPhone: '',
        userType: '1',
        status: '1',
        schoolName: '',
        gradeName: '',
        className: '',
        studentName: '',
        parentName: ''
      })
    }
  }

  /**
   * 监听对话框状态变化
   * 当对话框打开时初始化表单数据并清除验证状态
   */
  watch(
    () => [props.visible, props.type, props.userData],
    ([visible]) => {
      if (visible) {
        initFormData()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    },
    { immediate: true }
  )

  /**
   * 提交表单
   * 验证通过后触发提交事件
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        submitLoading.value = true
        try {
          const api = dialogType.value === 'add' ? fetchAddUser : fetchUpdateUser
          const res = await api(formData)
          if (res.code === 200) {
            ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
            dialogVisible.value = false
            emit('submit')
          }
        } finally {
          submitLoading.value = false
        }
      }
    })
  }
</script>

<style scoped>
  .w-full {
    width: 100%;
  }
</style>
