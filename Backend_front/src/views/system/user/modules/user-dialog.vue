<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
    width="450px"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="用户名" prop="userName">
        <ElInput v-model="formData.userName" placeholder="请输入登录账号" :disabled="dialogType === 'edit'" />
      </ElFormItem>
      <ElFormItem label="姓名/昵称" prop="nickName">
        <ElInput v-model="formData.nickName" placeholder="请输入姓名或昵称" />
      </ElFormItem>
      <ElFormItem v-if="dialogType === 'add'" label="密码" prop="password">
        <ElInput v-model="formData.password" placeholder="请输入密码(默认123456)" type="password" show-password />
      </ElFormItem>
      <ElFormItem v-else label="重置密码" prop="password">
        <ElInput v-model="formData.password" placeholder="不填则不修改" type="password" show-password />
      </ElFormItem>
      <ElFormItem label="手机号" prop="userPhone">
        <ElInput v-model="formData.userPhone" placeholder="请输入手机号" />
      </ElFormItem>
      <ElFormItem label="角色类型" prop="userType">
        <ElSelect v-model="formData.userType" placeholder="请选择角色类型" class="w-full">
          <ElOption
            v-for="role in roleList"
            :key="role.id"
            :label="role.roleName"
            :value="String(role.id)"
          />
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
        <ElFormItem label="关联学生" prop="studentId">
          <ElSelect
            v-model="formData.studentId"
            placeholder="请搜索并选择学生"
            filterable
            remote
            :remote-method="getStudents"
            class="w-full"
            clearable
          >
            <ElOption
              v-for="item in studentList"
              :key="item.id"
              :label="`${item.name} (${item.school} / ${item.className || '未设置班级'})`"
              :value="item.id"
            />
          </ElSelect>
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

      <ElFormItem label="VIP权限">
        <ElSpace>
          <ElSwitch
            v-model="formData.isVip"
            :active-value="1"
            :inactive-value="0"
            active-text="VIP"
          />
          <ElSwitch
            v-model="formData.isSvip"
            :active-value="1"
            :inactive-value="0"
            active-text="SVIP"
            style="--el-switch-on-color: #e6a23c"
          />
        </ElSpace>
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
  import { fetchAddUser, fetchEditUser } from '@/api/system/user'
  import { fetchGetRoleList } from '@/api/system/role'
  import { fetchGetStudentList } from '@/api/core-business/student'
  import { onMounted, ref, reactive, computed, watch, nextTick } from 'vue'

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
  
  // 角色列表
  const roleList = ref<any[]>([])
  // 学生列表 (用于家长绑定)
  const studentList = ref<any[]>([])

  const getRoles = async () => {
    try {
      const res = await fetchGetRoleList({ current: 1, size: 100 })
      if (res && res.records) {
        roleList.value = res.records
      }
    } catch (error) {
      console.error('获取角色列表失败', error)
    }
  }

  const getStudents = async (query?: string) => {
    try {
      const res = await fetchGetStudentList({ current: 1, size: 50, keyword: query })
      if (res && res.records) {
        studentList.value = res.records
      }
    } catch (error) {
      console.error('获取学生列表失败', error)
    }
  }

  onMounted(() => {
    getRoles()
    getStudents()
  })

  // 对话框显示控制
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)

  // 表单实例
  const formRef = ref<FormInstance>()

  // 表单数据
  const formData = reactive<any>({
    id: undefined,
    userName: '',
    nickName: '',
    password: '',
    userPhone: '',
    userType: '1',
    status: '1',
    isVip: 0,
    isSvip: 0,
    schoolName: '',
    gradeName: '',
    className: '',
    studentName: '',
    studentId: '',
    parentName: ''
  })

  // 表单验证规则
  const rules = computed<FormRules>(() => {
    const baseRules: FormRules = {
      userName: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
      ],
      nickName: [
        { required: true, message: '请输入昵称', trigger: 'blur' }
      ],
      userPhone: [
        { required: false, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
      ],
      userType: [{ required: true, message: '请选择用户类型', trigger: 'change' }]
    }

    if (formData.userType === '3') {
      baseRules.studentId = [{ required: true, message: '请选择关联学生', trigger: 'change' }]
    }

    return baseRules
  })

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
        nickName: row.nickName || '',
        password: '', // 编辑时不返回密码，重置为空
        userPhone: row.userPhone || '',
        userType: row.userType || '1',
        status: row.status || '1',
        isVip: row.isVip || 0,
        isSvip: row.isSvip || 0,
        schoolName: row.schoolName || '',
        gradeName: row.gradeName || '',
        className: row.className || '',
        studentName: row.studentName || '',
        studentId: (row.boundStudents && row.boundStudents.length > 0) ? row.boundStudents[0].id : '',
        parentName: row.parentName || ''
      })
    } else {
      Object.assign(formData, {
        id: undefined,
        userName: '',
        nickName: '',
        password: '',
        userPhone: '',
        userType: '1',
        status: '1',
        isVip: 0,
        isSvip: 0,
        schoolName: '',
        gradeName: '',
        className: '',
        studentName: '',
        studentId: '',
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
          if (dialogType.value === 'add') {
            await fetchAddUser(formData)
            ElMessage.success('添加成功')
          } else {
            await fetchEditUser(formData.id, formData)
            ElMessage.success('更新成功')
          }
          dialogVisible.value = false
          emit('submit')
        } catch (error: any) {
          // ElMessage.error(error.message || '操作失败')
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
