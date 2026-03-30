<!-- 个人中心页面 -->
<template>
  <div class="w-full h-full p-0 bg-transparent border-none shadow-none">
    <div class="relative flex-b mt-2.5 max-md:block max-md:mt-1">
      <div class="w-112 mr-5 max-md:w-full max-md:mr-0">
        <div class="art-card-sm relative p-9 pb-6 overflow-hidden text-center">
          <img class="absolute top-0 left-0 w-full h-50 object-cover" src="@imgs/user/bg.webp" />
          <img
            class="relative z-10 w-20 h-20 mt-30 mx-auto object-cover border-2 border-white rounded-full"
            :src="userAvatar"
          />
          <h2 class="mt-5 text-xl font-normal">{{ userInfo.nickName || userInfo.userName }}</h2>
          <p class="mt-5 text-sm">欢迎回来，{{ date }}</p>

          <div class="w-75 mx-auto mt-7.5 text-left">
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:user-star-line" class="text-g-700" />
              <span class="ml-2 text-sm">{{ roleName }}</span>
            </div>
            <div class="mt-2.5" v-if="userInfo.schoolName">
              <ArtSvgIcon icon="ri:building-line" class="text-g-700" />
              <span class="ml-2 text-sm">{{ userInfo.schoolName }}</span>
            </div>
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:phone-line" class="text-g-700" />
              <span class="ml-2 text-sm">{{ userInfo.userPhone || '未设置' }}</span>
            </div>
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:mail-line" class="text-g-700" />
              <span class="ml-2 text-sm">{{ userInfo.email || '未设置' }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-1 overflow-hidden max-md:w-full max-md:mt-3.5">
        <div class="art-card-sm">
          <h1 class="p-4 text-xl font-normal border-b border-g-300">基本设置</h1>

          <ElForm
            :model="form"
            class="box-border p-5 [&>.el-row_.el-form-item]:w-[calc(50%-10px)] [&>.el-row_.el-input]:w-full [&>.el-row_.el-select]:w-full"
            ref="ruleFormRef"
            :rules="rules"
            label-width="86px"
            label-position="top"
          >
            <ElRow>
              <ElFormItem label="登录账号" prop="userName">
                <ElInput v-model="form.userName" disabled />
              </ElFormItem>
              <ElFormItem label="昵称" prop="nickName" class="ml-5">
                <ElInput v-model="form.nickName" :disabled="!isEdit" />
              </ElFormItem>
            </ElRow>

            <ElRow>
              <ElFormItem label="手机" prop="userPhone">
                <ElInput v-model="form.userPhone" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem label="邮箱" prop="email" class="ml-5">
                <ElInput v-model="form.email" :disabled="!isEdit" />
              </ElFormItem>
            </ElRow>

            <ElRow v-if="userInfo.schoolName">
              <ElFormItem label="管理学校" prop="schoolName">
                <ElInput v-model="form.schoolName" disabled />
              </ElFormItem>
            </ElRow>

            <div class="flex-c justify-end [&_.el-button]:!w-27.5">
              <ElButton type="primary" class="w-22.5" v-ripple @click="edit">
                {{ isEdit ? '保存' : '编辑' }}
              </ElButton>
            </div>
          </ElForm>
        </div>

        <div class="art-card-sm my-5">
          <h1 class="p-4 text-xl font-normal border-b border-g-300">更改密码</h1>

          <ElForm
            :model="pwdForm"
            :rules="pwdRules"
            ref="pwdFormRef"
            class="box-border p-5"
            label-width="86px"
            label-position="top"
          >
            <ElFormItem label="当前密码" prop="password">
              <ElInput
                v-model="pwdForm.password"
                type="password"
                :disabled="!isEditPwd"
                show-password
                placeholder="请输入当前密码"
              />
            </ElFormItem>

            <ElFormItem label="新密码" prop="newPassword">
              <ElInput
                v-model="pwdForm.newPassword"
                type="password"
                :disabled="!isEditPwd"
                show-password
                placeholder="请输入新密码"
              />
            </ElFormItem>

            <ElFormItem label="确认新密码" prop="confirmPassword">
              <ElInput
                v-model="pwdForm.confirmPassword"
                type="password"
                :disabled="!isEditPwd"
                show-password
                placeholder="请再次输入新密码"
              />
            </ElFormItem>

            <div class="flex-c justify-end [&_.el-button]:!w-27.5">
              <ElButton type="primary" class="w-22.5" v-ripple @click="editPwd">
                {{ isEditPwd ? '保存' : '编辑' }}
              </ElButton>
            </div>
          </ElForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useUserStore } from '@/store/modules/user'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import { fetchUpdateBasicInfo } from '@/api/auth/login'

  defineOptions({ name: 'UserCenter' })

  const userStore = useUserStore()
  const userInfo = computed(() => userStore.getUserInfo)

  const isEdit = ref(false)
  const isEditPwd = ref(false)
  const date = ref('')
  const ruleFormRef = ref<FormInstance>()
  const pwdFormRef = ref<FormInstance>()

  /**
   * 角色名称映射
   */
  const roleName = computed(() => {
    const roles = userInfo.value.roles || []
    if (roles.includes('R_SUPER')) return '超级管理员'
    if (roles.includes('R_ADMIN')) return '管理员'
    if (roles.includes('R_SCHOOL')) return '学校管理员'
    if (roles.includes('R_PARENT')) return '家长'
    if (roles.includes('R_STUDENT')) return '学生'
    return '普通用户'
  })

  /**
   * 随机默认头像
   */
  const userAvatar = computed(() => {
    if (userInfo.value.avatar) return userInfo.value.avatar
    const seeds = ['Felix', 'Aneka', 'Mia', 'Jack', 'Oliver']
    const seed = seeds[Math.floor(Math.random() * seeds.length)]
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
  })

  /**
   * 用户信息表单
   */
  // 这里需要跟后端实体类的属性名对应，但根据之前代码，这里的 form 绑定了前端的 nickName 和 userPhone
  // 因此我们在初始化时从 userStore (包含了登录后获取的信息) 中读取
  const form = reactive({
    userName: userInfo.value.userName || '',
    nickName: (userInfo.value as any).nickname || userInfo.value.nickName || '',
    email: userInfo.value.email || '',
    userPhone: (userInfo.value as any).phone || userInfo.value.userPhone || '',
    schoolName: userInfo.value.schoolName || ''
  })

  /**
   * 监听用户信息变化，同步到表单
   */
  watch(
    () => userInfo.value,
    (val: any) => {
      form.userName = val.userName || ''
      form.nickName = val.nickname || val.nickName || ''
      form.email = val.email || ''
      form.userPhone = val.phone || val.userPhone || ''
      form.schoolName = val.schoolName || ''
    },
    { deep: true }
  )

  /**
   * 密码修改表单
   */
  const pwdForm = reactive({
    password: '',
    newPassword: '',
    confirmPassword: ''
  })

  /**
   * 密码验证规则
   */
  const pwdRules = reactive<FormRules>({
    password: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
    newPassword: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: '请再次输入新密码', trigger: 'blur' },
      {
        validator: (_rule, value, callback) => {
          if (value !== pwdForm.newPassword) {
            callback(new Error('两次输入的密码不一致'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ]
  })

  /**
   * 表单验证规则
   */
  const rules = reactive<FormRules>({
    nickName: [
      { required: true, message: '请输入昵称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
    userPhone: [{ required: true, message: '请输入手机号码', trigger: 'blur' }]
  })

  onMounted(() => {
    getDate()
  })

  /**
   * 根据当前时间获取问候语
   */
  const getDate = () => {
    const h = new Date().getHours()

    if (h >= 6 && h < 9) date.value = '早上好'
    else if (h >= 9 && h < 11) date.value = '上午好'
    else if (h >= 11 && h < 13) date.value = '中午好'
    else if (h >= 13 && h < 18) date.value = '下午好'
    else if (h >= 18 && h < 24) date.value = '晚上好'
    else date.value = '很晚了，早点睡'
  }

  /**
   * 切换用户信息编辑状态
   */
  const edit = async () => {
    if (isEdit.value) {
      // 保存逻辑
      if (!ruleFormRef.value) return
      await ruleFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            // 调用真实后端更新 API
            await fetchUpdateBasicInfo(userInfo.value.uid || userInfo.value.userId, {
              nickname: form.nickName,
              phone: form.userPhone,
              email: form.email
            })
            
            ElMessage.success('保存成功')
            // 更新本地 store
            const newUserInfo = { 
              ...userInfo.value, 
              ...form,
              nickname: form.nickName,
              phone: form.userPhone
            }
            userStore.setUserInfo(newUserInfo as Api.Auth.UserInfo)
            isEdit.value = false
          } catch (error: any) {
            ElMessage.error(error.message || '保存失败')
          }
        }
      })
    } else {
      isEdit.value = true
    }
  }

  /**
   * 切换密码编辑状态
   */
  const editPwd = async () => {
    if (isEditPwd.value) {
      if (!pwdFormRef.value) return
      await pwdFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            // 模拟调用修改密码 API
            // const res = await fetchUpdatePassword(pwdForm)
            // if (res.code === 200) {
            //   ElMessage.success('密码修改成功')
            //   isEditPwd.value = false
            //   // 清空表单
            //   pwdForm.password = ''
            //   pwdForm.newPassword = ''
            //   pwdForm.confirmPassword = ''
            // }

            ElMessage.success('密码修改成功')
            isEditPwd.value = false
            pwdForm.password = ''
            pwdForm.newPassword = ''
            pwdForm.confirmPassword = ''
          } catch (error) {
            ElMessage.error('密码修改失败')
          }
        }
      })
    } else {
      isEditPwd.value = true
    }
  }
</script>
