<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
    width="30%"
    align-center
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="120px">
      <ElFormItem label="角色名称" prop="roleName">
        <ElInput v-model="form.roleName" placeholder="请输入角色名称" />
      </ElFormItem>
      <ElFormItem label="角色编码" prop="roleCode">
        <ElInput v-model="form.roleCode" placeholder="请输入角色编码" />
      </ElFormItem>
      <ElFormItem label="描述" prop="description">
        <ElInput
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入角色描述"
        />
      </ElFormItem>
      <ElFormItem label="启用">
        <ElSwitch v-model="form.enabled" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">提交</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import { fetchAddRole, fetchUpdateRole } from '@/api/system/role'

  type RoleListItem = Api.SystemManage.RoleListItem

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    roleData?: RoleListItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    dialogType: 'add',
    roleData: undefined
  })

  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)

  /**
   * 弹窗显示状态双向绑定
   */
  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  /**
   * 表单验证规则
   */
  const rules = reactive<FormRules>({
    roleName: [
      { required: true, message: '请输入角色名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    roleCode: [
      { required: true, message: '请输入角色编码', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
      {
        validator: (_rule, value, callback) => {
          if (value === form.roleName) {
            callback(new Error('角色编码不能与角色名称相同'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ],
    description: [{ required: true, message: '请输入角色描述', trigger: 'blur' }]
  })

  /**
   * 表单数据
   */
  const form = reactive<any>({
    id: undefined,
    roleName: '',
    roleCode: '',
    description: '',
    enabled: true
  })

  /**
   * 监听弹窗打开，初始化表单数据
   */
  watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal) initForm()
    }
  )

  /**
   * 监听角色数据变化，更新表单
   */
  watch(
    () => props.roleData,
    (newData) => {
      if (newData && props.modelValue) initForm()
    },
    { deep: true }
  )

  /**
   * 初始化表单数据
   * 根据弹窗类型填充表单或重置表单
   */
  const initForm = () => {
    if (props.dialogType === 'edit' && props.roleData) {
      Object.assign(form, {
        id: props.roleData.id ?? props.roleData.roleId,
        roleName: props.roleData.roleName,
        roleCode: props.roleData.roleCode,
        description: props.roleData.description,
        enabled:
          props.roleData.status != null ? props.roleData.status === 1 : !!props.roleData.enabled
      })
    } else {
      Object.assign(form, {
        id: undefined,
        roleName: '',
        roleCode: '',
        description: '',
        enabled: true
      })
    }
  }

  /**
   * 关闭弹窗并重置表单
   */
  const handleClose = () => {
    visible.value = false
    formRef.value?.resetFields()
  }

  /**
   * 提交表单
   * 验证通过后调用接口保存数据
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      submitLoading.value = true
      
      // 后端需要的字段转换
      const submitData = {
        roleName: form.roleName,
        roleCode: form.roleCode,
        description: form.description,
        status: form.enabled ? 1 : 0
      }
      
      const res = props.dialogType === 'add' 
        ? await fetchAddRole(submitData)
        : await fetchUpdateRole(form.id, submitData)

      // 模板封装的 api 会在拦截器中处理 code !== 200 的情况并抛出错误
      // 如果能执行到这里，说明请求是成功的
      const message = props.dialogType === 'add' ? '新增成功' : '修改成功'
      ElMessage.success(message)
      emit('success')
      handleClose()
    } catch (error: any) {
      console.log('操作失败:', error)
      // 错误消息通常由拦截器统一提示，这里如果需要额外提示可以加上
      // ElMessage.error(error.message || '操作失败')
    } finally {
      submitLoading.value = false
    }
  }
</script>
