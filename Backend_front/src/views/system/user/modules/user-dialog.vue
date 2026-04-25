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
        <div class="flex flex-col gap-4">
          <!-- VIP Row -->
          <div class="vip-row">
            <div class="flex items-center gap-4 mb-2">
              <ElSwitch
                v-model="formData.isVip"
                :active-value="1"
                :inactive-value="0"
                active-text="VIP"
                @change="handleVipChange"
              />
            </div>
            <div v-if="formData.isVip === 1" class="time-inputs flex flex-col gap-2 ml-4">
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-500 w-16">开始时间:</span>
                <ElInput v-model="formData.vipStartTime" readonly size="small" style="width: 180px" />
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-500 w-16">持续时间:</span>
                <ElSelect
                  v-model="formData.vipDurationMonths"
                  placeholder="请选择VIP时长"
                  size="small"
                  style="width: 180px"
                  @change="handleVipDurationChange"
                >
                  <ElOption
                    v-if="formData.vipDurationMonths === 0"
                    :label="vipLegacyDurationLabel || '历史时长'"
                    :value="0"
                  />
                  <ElOption label="一个月" :value="1" />
                  <ElOption label="一个季度" :value="3" />
                  <ElOption label="一年" :value="12" />
                </ElSelect>
              </div>
            </div>
          </div>

          <!-- SVIP Row -->
          <div class="vip-row">
            <div class="flex items-center gap-4 mb-2">
              <ElSwitch
                v-model="formData.isSvip"
                :active-value="1"
                :inactive-value="0"
                active-text="SVIP"
                style="--el-switch-on-color: #e6a23c"
                @change="handleSvipChange"
              />
            </div>
            <div v-if="formData.isSvip === 1" class="time-inputs flex flex-col gap-2 ml-4">
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-500 w-16">开始时间:</span>
                <ElInput v-model="formData.svipStartTime" readonly size="small" style="width: 180px" />
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-500 w-16">持续时间:</span>
                <ElSelect
                  v-model="formData.svipDurationMonths"
                  placeholder="请选择SVIP时长"
                  size="small"
                  style="width: 180px"
                  @change="handleSvipDurationChange"
                >
                  <ElOption
                    v-if="formData.svipDurationMonths === 0"
                    :label="svipLegacyDurationLabel || '历史时长'"
                    :value="0"
                  />
                  <ElOption label="一个月" :value="1" />
                  <ElOption label="一个季度" :value="3" />
                  <ElOption label="一年" :value="12" />
                </ElSelect>
              </div>
            </div>
          </div>
        </div>
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
  const vipDurationTouched = ref(false)
  const svipDurationTouched = ref(false)
  const vipLegacyDurationLabel = ref('')
  const svipLegacyDurationLabel = ref('')
  
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
    vipStartTime: '',
    svipStartTime: '',
    vipExpireTime: '',
    svipExpireTime: '',
    vipDurationMonths: 1,
    svipDurationMonths: 1,
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
    vipDurationTouched.value = false
    svipDurationTouched.value = false

    if (isEdit && row) {
      const vipDurationMonths = resolveDurationMonths(row.vipStartTime, row.vipExpireTime)
      const svipDurationMonths = resolveDurationMonths(row.svipStartTime, row.svipExpireTime)
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
        vipStartTime: row.vipStartTime || '',
        svipStartTime: row.svipStartTime || '',
        vipExpireTime: row.vipExpireTime || '',
        svipExpireTime: row.svipExpireTime || '',
        vipDurationMonths,
        svipDurationMonths,
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
        vipStartTime: '',
        svipStartTime: '',
        vipExpireTime: '',
        svipExpireTime: '',
        vipDurationMonths: 1,
        svipDurationMonths: 1,
        schoolName: '',
        gradeName: '',
        className: '',
        studentName: '',
        studentId: '',
        parentName: ''
      })
    }

    vipLegacyDurationLabel.value = formData.vipDurationMonths === 0 ? describeLegacyDuration(row?.vipStartTime, row?.vipExpireTime) : ''
    svipLegacyDurationLabel.value = formData.svipDurationMonths === 0 ? describeLegacyDuration(row?.svipStartTime, row?.svipExpireTime) : ''
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
   * 格式化日期为 yyyy-MM-dd HH:mm:ss
   */
  const formatDateTime = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const hh = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')
    const ss = String(date.getSeconds()).padStart(2, '0')
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
  }

  const parseDateTime = (value?: string) => {
    if (!value) return null
    const normalized = value.replace(/-/g, '/')
    const date = new Date(normalized)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const addMonths = (value: string, months: number) => {
    const date = parseDateTime(value)
    if (!date) return ''
    const nextDate = new Date(date)
    nextDate.setMonth(nextDate.getMonth() + months)
    return formatDateTime(nextDate)
  }

  const resolveDurationMonths = (startTime?: string, expireTime?: string) => {
    if (!startTime || !expireTime) return 1
    const matched = [1, 3, 12].find((months) => addMonths(startTime, months) === expireTime)
    return matched ?? 0
  }

  const describeLegacyDuration = (startTime?: string, expireTime?: string) => {
    const start = parseDateTime(startTime)
    const expire = parseDateTime(expireTime)
    if (!start || !expire) return '历史时长'
    const diffMs = expire.getTime() - start.getTime()
    if (diffMs <= 0) return '历史时长'
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays >= 365) {
      return `历史时长(${Math.round(diffDays / 365)}年)`
    }
    if (diffDays >= 30) {
      return `历史时长(${Math.round(diffDays / 30)}个月)`
    }
    return `历史时长(${diffDays}天)`
  }

  const ensureVipStartTime = () => {
    if (!formData.vipStartTime) {
      formData.vipStartTime = formatDateTime(new Date())
    }
  }

  const ensureSvipStartTime = () => {
    if (!formData.svipStartTime) {
      formData.svipStartTime = formatDateTime(new Date())
    }
  }

  const handleVipDurationChange = () => {
    vipDurationTouched.value = true
    ensureVipStartTime()
    if (formData.vipDurationMonths > 0) {
      formData.vipExpireTime = addMonths(formData.vipStartTime, formData.vipDurationMonths)
    }
  }

  const handleSvipDurationChange = () => {
    svipDurationTouched.value = true
    ensureSvipStartTime()
    if (formData.svipDurationMonths > 0) {
      formData.svipExpireTime = addMonths(formData.svipStartTime, formData.svipDurationMonths)
    }
  }

  const handleVipChange = (val: any) => {
     if (val === 1) {
       ensureVipStartTime()
       if (!formData.vipDurationMonths) {
         formData.vipDurationMonths = 1
       }
       if (!formData.vipExpireTime || formData.vipDurationMonths > 0) {
         formData.vipExpireTime = addMonths(formData.vipStartTime, formData.vipDurationMonths || 1)
       }
     } else {
       if (formData.isSvip === 1) {
         formData.isVip = 1
         ElMessage.warning('开启SVIP时会自动保留VIP权限')
       }
     }
   }

   const handleSvipChange = (val: any) => {
     if (val === 1) {
       ensureSvipStartTime()
       if (!formData.svipDurationMonths) {
         formData.svipDurationMonths = 1
       }
       if (!formData.svipExpireTime || formData.svipDurationMonths > 0) {
         formData.svipExpireTime = addMonths(formData.svipStartTime, formData.svipDurationMonths || 1)
       }
       formData.isVip = 1
       if (!formData.vipStartTime) {
         formData.vipStartTime = formData.svipStartTime
       }
       if (!formData.vipExpireTime || (parseDateTime(formData.vipExpireTime)?.getTime() || 0) < (parseDateTime(formData.svipExpireTime)?.getTime() || 0)) {
         formData.vipExpireTime = formData.svipExpireTime
       }
     } else {
       // 保留历史值，提交时根据开关决定是否生效
     }
   }

  const buildSubmitData = () => {
    const submitData = {
      ...formData
    }

    if (submitData.isVip === 1) {
      ensureVipStartTime()
      if (submitData.vipDurationMonths > 0) {
        submitData.vipExpireTime = addMonths(submitData.vipStartTime, submitData.vipDurationMonths)
      } else if (dialogType.value === 'add' || vipDurationTouched.value || !submitData.vipExpireTime) {
        submitData.vipDurationMonths = 1
        submitData.vipExpireTime = addMonths(submitData.vipStartTime, 1)
      }
    } else {
      submitData.vipStartTime = ''
      submitData.vipExpireTime = ''
      submitData.vipDurationMonths = null
    }

    if (submitData.isSvip === 1) {
      ensureSvipStartTime()
      submitData.isVip = 1
      if (submitData.svipDurationMonths > 0) {
        submitData.svipExpireTime = addMonths(submitData.svipStartTime, submitData.svipDurationMonths)
      } else if (dialogType.value === 'add' || svipDurationTouched.value || !submitData.svipExpireTime) {
        submitData.svipDurationMonths = 1
        submitData.svipExpireTime = addMonths(submitData.svipStartTime, 1)
      }

      if (!submitData.vipStartTime) {
        submitData.vipStartTime = submitData.svipStartTime
      }
      const vipExpireAt = parseDateTime(submitData.vipExpireTime)?.getTime() || 0
      const svipExpireAt = parseDateTime(submitData.svipExpireTime)?.getTime() || 0
      if (!submitData.vipExpireTime || vipExpireAt < svipExpireAt) {
        submitData.vipExpireTime = submitData.svipExpireTime
      }
    } else {
      submitData.svipStartTime = ''
      submitData.svipExpireTime = ''
      submitData.svipDurationMonths = null
    }

    return submitData
  }

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
          const submitData = buildSubmitData()
          if (dialogType.value === 'add') {
            await fetchAddUser(submitData)
            ElMessage.success('添加成功')
          } else {
            await fetchEditUser(formData.id, submitData)
            ElMessage.success('更新成功')
          }
          dialogVisible.value = false
          emit('submit')
        } catch (error: any) {
          ElMessage.error(error?.message || '操作失败')
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
