/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { useUserStore } from '@/store/modules/user';
import { ElMessage } from 'element-plus';
import { fetchUpdateBasicInfo, fetchUpdatePassword } from '@/api/auth/login';
import { useRouter } from 'vue-router';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'UserCenter' });
const userStore = useUserStore();
const router = useRouter();
const userInfo = computed(() => userStore.getUserInfo);
const isEdit = ref(false);
const isEditPwd = ref(false);
const date = ref('');
const ruleFormRef = ref();
const pwdFormRef = ref();
/**
 * 角色名称映射
 */
const roleName = computed(() => {
    const roles = userInfo.value.roles || [];
    if (roles.includes('R_SUPER'))
        return '超级管理员';
    if (roles.includes('R_ADMIN'))
        return '管理员';
    if (roles.includes('R_SCHOOL'))
        return '学校管理员';
    if (roles.includes('R_PARENT'))
        return '家长';
    if (roles.includes('R_STUDENT'))
        return '学生';
    return '普通用户';
});
/**
 * 随机默认头像
 */
const userAvatar = computed(() => {
    if (userInfo.value.avatar)
        return userInfo.value.avatar;
    const seeds = ['Felix', 'Aneka', 'Mia', 'Jack', 'Oliver'];
    const seed = seeds[Math.floor(Math.random() * seeds.length)];
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
});
/**
 * 用户信息表单
 */
// 这里需要跟后端实体类的属性名对应，但根据之前代码，这里的 form 绑定了前端的 nickName 和 userPhone
// 因此我们在初始化时从 userStore (包含了登录后获取的信息) 中读取
const form = reactive({
    userName: userInfo.value.userName || '',
    nickName: userInfo.value.nickname || userInfo.value.nickName || '',
    userPhone: userInfo.value.phone || userInfo.value.userPhone || '', // 确保从 phone 字段读取
    email: userInfo.value.email || '',
    schoolName: userInfo.value.schoolName || ''
});
/**
 * 监听用户信息变化，同步到表单
 */
watch(() => userInfo.value, (val) => {
    form.userName = val.userName || '';
    form.nickName = val.nickname || val.nickName || '';
    form.email = val.email || '';
    form.userPhone = val.phone || val.userPhone || '';
    form.schoolName = val.schoolName || '';
}, { deep: true });
/**
 * 密码修改表单
 */
const pwdForm = reactive({
    password: '',
    newPassword: '',
    confirmPassword: ''
});
/**
 * 密码验证规则
 */
const pwdRules = reactive({
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
                    callback(new Error('两次输入的密码不一致'));
                }
                else {
                    callback();
                }
            },
            trigger: 'blur'
        }
    ]
});
/**
 * 表单验证规则
 */
const rules = reactive({
    nickName: [
        { required: true, message: '请输入昵称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
    userPhone: [{ required: true, message: '请输入手机号码', trigger: 'blur' }]
});
onMounted(() => {
    getDate();
});
/**
 * 根据当前时间获取问候语
 */
const getDate = () => {
    const h = new Date().getHours();
    if (h >= 6 && h < 9)
        date.value = '早上好';
    else if (h >= 9 && h < 11)
        date.value = '上午好';
    else if (h >= 11 && h < 13)
        date.value = '中午好';
    else if (h >= 13 && h < 18)
        date.value = '下午好';
    else if (h >= 18 && h < 24)
        date.value = '晚上好';
    else
        date.value = '很晚了，早点睡';
};
/**
 * 切换用户信息编辑状态
 */
const edit = async () => {
    if (isEdit.value) {
        // 保存逻辑
        if (!ruleFormRef.value)
            return;
        await ruleFormRef.value.validate(async (valid) => {
            if (valid) {
                try {
                    // 调用真实后端更新 API
                    await fetchUpdateBasicInfo(userInfo.value.uid || userInfo.value.userId, {
                        nickname: form.nickName,
                        phone: form.userPhone,
                        email: form.email
                    });
                    ElMessage.success('保存成功');
                    // 更新本地 store
                    const newUserInfo = {
                        ...userInfo.value,
                        ...form,
                        nickname: form.nickName,
                        phone: form.userPhone
                    };
                    userStore.setUserInfo(newUserInfo);
                    isEdit.value = false;
                }
                catch (error) {
                    ElMessage.error(error.message || '保存失败');
                }
            }
        });
    }
    else {
        isEdit.value = true;
    }
};
/**
 * 切换密码编辑状态
 */
const editPwd = async () => {
    if (isEditPwd.value) {
        if (!pwdFormRef.value)
            return;
        await pwdFormRef.value.validate(async (valid) => {
            if (valid) {
                try {
                    // 调用真实修改密码 API
                    await fetchUpdatePassword({
                        oldPassword: pwdForm.password,
                        newPassword: pwdForm.newPassword
                    });
                    ElMessage.success('密码修改成功，请重新登录');
                    isEditPwd.value = false;
                    pwdForm.password = '';
                    pwdForm.newPassword = '';
                    pwdForm.confirmPassword = '';
                    // 修改成功后跳转到登录页
                    setTimeout(() => {
                        userStore.logOut();
                        router.push('/login');
                    }, 1500);
                }
                catch (error) {
                    ElMessage.error(error.message || '密码修改失败');
                }
            }
        });
    }
    else {
        isEditPwd.value = true;
    }
}; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_fnComponent = (await import('vue')).defineComponent({});
;
let __VLS_functionalComponentProps;
function __VLS_template() {
    const __VLS_ctx = {};
    const __VLS_localComponents = {
        ...{},
        ...{},
        ...__VLS_ctx,
    };
    let __VLS_components;
    const __VLS_localDirectives = {
        ...{},
        ...__VLS_ctx,
    };
    let __VLS_directives;
    let __VLS_styleScopedClasses;
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("w-full h-full p-0 bg-transparent border-none shadow-none") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("relative flex-b mt-2.5 max-md:block max-md:mt-1") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("w-112 mr-5 max-md:w-full max-md:mr-0") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-card-sm relative p-9 pb-6 overflow-hidden text-center") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({ ...{ class: ("absolute top-0 left-0 w-full h-50 object-cover") }, src: ("@imgs/user/bg.webp"), });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({ ...{ class: ("relative z-10 w-20 h-20 mt-30 mx-auto object-cover border-2 border-white rounded-full") }, src: ((__VLS_ctx.userAvatar)), });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({ ...{ class: ("mt-5 text-xl font-normal") }, });
    (__VLS_ctx.userInfo.nickName || __VLS_ctx.userInfo.userName);
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("mt-5 text-sm") }, });
    (__VLS_ctx.date);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("w-75 mx-auto mt-7.5 text-left") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-2.5") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
    /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ icon: ("ri:user-star-line"), ...{ class: ("text-g-700") }, }));
    const __VLS_2 = __VLS_1({ icon: ("ri:user-star-line"), ...{ class: ("text-g-700") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("ml-2 text-sm") }, });
    (__VLS_ctx.roleName);
    if (__VLS_ctx.userInfo.schoolName) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-2.5") }, });
        const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ icon: ("ri:building-line"), ...{ class: ("text-g-700") }, }));
        const __VLS_8 = __VLS_7({ icon: ("ri:building-line"), ...{ class: ("text-g-700") }, }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("ml-2 text-sm") }, });
        (__VLS_ctx.userInfo.schoolName);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-2.5") }, });
    const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
    /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ icon: ("ri:phone-line"), ...{ class: ("text-g-700") }, }));
    const __VLS_14 = __VLS_13({ icon: ("ri:phone-line"), ...{ class: ("text-g-700") }, }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("ml-2 text-sm") }, });
    (__VLS_ctx.userInfo.userPhone || '未设置');
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-2.5") }, });
    const __VLS_18 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
    /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({ icon: ("ri:mail-line"), ...{ class: ("text-g-700") }, }));
    const __VLS_20 = __VLS_19({ icon: ("ri:mail-line"), ...{ class: ("text-g-700") }, }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("ml-2 text-sm") }, });
    (__VLS_ctx.userInfo.email || '未设置');
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-1 overflow-hidden max-md:w-full max-md:mt-3.5") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-card-sm") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({ ...{ class: ("p-4 text-xl font-normal border-b border-g-300") }, });
    const __VLS_24 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.ElForm, ] } */
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({ model: ((__VLS_ctx.form)), ...{ class: ("box-border p-5 [&>.el-row_.el-form-item]:w-[calc(50%-10px)] [&>.el-row_.el-input]:w-full [&>.el-row_.el-select]:w-full") }, ref: ("ruleFormRef"), rules: ((__VLS_ctx.rules)), labelWidth: ("86px"), labelPosition: ("top"), }));
    const __VLS_26 = __VLS_25({ model: ((__VLS_ctx.form)), ...{ class: ("box-border p-5 [&>.el-row_.el-form-item]:w-[calc(50%-10px)] [&>.el-row_.el-input]:w-full [&>.el-row_.el-select]:w-full") }, ref: ("ruleFormRef"), rules: ((__VLS_ctx.rules)), labelWidth: ("86px"), labelPosition: ("top"), }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    // @ts-ignore navigation for `const ruleFormRef = ref()`
    __VLS_ctx.ruleFormRef;
    var __VLS_30 = {};
    const __VLS_31 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.ElRow, ] } */
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({}));
    const __VLS_33 = __VLS_32({}, ...__VLS_functionalComponentArgsRest(__VLS_32));
    const __VLS_37 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({ label: ("登录账号"), prop: ("userName"), }));
    const __VLS_39 = __VLS_38({ label: ("登录账号"), prop: ("userName"), }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    const __VLS_43 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({ modelValue: ((__VLS_ctx.form.userName)), disabled: (true), }));
    const __VLS_45 = __VLS_44({ modelValue: ((__VLS_ctx.form.userName)), disabled: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    __VLS_nonNullable(__VLS_42.slots).default;
    var __VLS_42;
    const __VLS_49 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({ label: ("昵称"), prop: ("nickName"), ...{ class: ("ml-5") }, }));
    const __VLS_51 = __VLS_50({ label: ("昵称"), prop: ("nickName"), ...{ class: ("ml-5") }, }, ...__VLS_functionalComponentArgsRest(__VLS_50));
    const __VLS_55 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({ modelValue: ((__VLS_ctx.form.nickName)), disabled: ((!__VLS_ctx.isEdit)), }));
    const __VLS_57 = __VLS_56({ modelValue: ((__VLS_ctx.form.nickName)), disabled: ((!__VLS_ctx.isEdit)), }, ...__VLS_functionalComponentArgsRest(__VLS_56));
    __VLS_nonNullable(__VLS_54.slots).default;
    var __VLS_54;
    __VLS_nonNullable(__VLS_36.slots).default;
    var __VLS_36;
    const __VLS_61 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.ElRow, ] } */
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({}));
    const __VLS_63 = __VLS_62({}, ...__VLS_functionalComponentArgsRest(__VLS_62));
    const __VLS_67 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({ label: ("手机"), prop: ("userPhone"), }));
    const __VLS_69 = __VLS_68({ label: ("手机"), prop: ("userPhone"), }, ...__VLS_functionalComponentArgsRest(__VLS_68));
    const __VLS_73 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({ modelValue: ((__VLS_ctx.form.userPhone)), disabled: ((!__VLS_ctx.isEdit)), }));
    const __VLS_75 = __VLS_74({ modelValue: ((__VLS_ctx.form.userPhone)), disabled: ((!__VLS_ctx.isEdit)), }, ...__VLS_functionalComponentArgsRest(__VLS_74));
    __VLS_nonNullable(__VLS_72.slots).default;
    var __VLS_72;
    const __VLS_79 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_80 = __VLS_asFunctionalComponent(__VLS_79, new __VLS_79({ label: ("邮箱"), prop: ("email"), ...{ class: ("ml-5") }, }));
    const __VLS_81 = __VLS_80({ label: ("邮箱"), prop: ("email"), ...{ class: ("ml-5") }, }, ...__VLS_functionalComponentArgsRest(__VLS_80));
    const __VLS_85 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({ modelValue: ((__VLS_ctx.form.email)), disabled: ((!__VLS_ctx.isEdit)), }));
    const __VLS_87 = __VLS_86({ modelValue: ((__VLS_ctx.form.email)), disabled: ((!__VLS_ctx.isEdit)), }, ...__VLS_functionalComponentArgsRest(__VLS_86));
    __VLS_nonNullable(__VLS_84.slots).default;
    var __VLS_84;
    __VLS_nonNullable(__VLS_66.slots).default;
    var __VLS_66;
    if (__VLS_ctx.userInfo.schoolName) {
        const __VLS_91 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
        /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.ElRow, ] } */
        // @ts-ignore
        const __VLS_92 = __VLS_asFunctionalComponent(__VLS_91, new __VLS_91({}));
        const __VLS_93 = __VLS_92({}, ...__VLS_functionalComponentArgsRest(__VLS_92));
        const __VLS_97 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({ label: ("管理学校"), prop: ("schoolName"), }));
        const __VLS_99 = __VLS_98({ label: ("管理学校"), prop: ("schoolName"), }, ...__VLS_functionalComponentArgsRest(__VLS_98));
        const __VLS_103 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, ] } */
        // @ts-ignore
        const __VLS_104 = __VLS_asFunctionalComponent(__VLS_103, new __VLS_103({ modelValue: ((__VLS_ctx.form.schoolName)), disabled: (true), }));
        const __VLS_105 = __VLS_104({ modelValue: ((__VLS_ctx.form.schoolName)), disabled: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_104));
        __VLS_nonNullable(__VLS_102.slots).default;
        var __VLS_102;
        __VLS_nonNullable(__VLS_96.slots).default;
        var __VLS_96;
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-c justify-end [&_.el-button]:!w-27.5") }, });
    const __VLS_109 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
    // @ts-ignore
    const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({ ...{ 'onClick': {} }, type: ("primary"), ...{ class: ("w-22.5") }, }));
    const __VLS_111 = __VLS_110({ ...{ 'onClick': {} }, type: ("primary"), ...{ class: ("w-22.5") }, }, ...__VLS_functionalComponentArgsRest(__VLS_110));
    __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
    let __VLS_115;
    const __VLS_116 = {
        onClick: (__VLS_ctx.edit)
    };
    let __VLS_112;
    let __VLS_113;
    (__VLS_ctx.isEdit ? '保存' : '编辑');
    __VLS_nonNullable(__VLS_114.slots).default;
    var __VLS_114;
    __VLS_nonNullable(__VLS_29.slots).default;
    var __VLS_29;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-card-sm my-5") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({ ...{ class: ("p-4 text-xl font-normal border-b border-g-300") }, });
    const __VLS_117 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.ElForm, ] } */
    // @ts-ignore
    const __VLS_118 = __VLS_asFunctionalComponent(__VLS_117, new __VLS_117({ model: ((__VLS_ctx.pwdForm)), rules: ((__VLS_ctx.pwdRules)), ref: ("pwdFormRef"), ...{ class: ("box-border p-5") }, labelWidth: ("86px"), labelPosition: ("top"), }));
    const __VLS_119 = __VLS_118({ model: ((__VLS_ctx.pwdForm)), rules: ((__VLS_ctx.pwdRules)), ref: ("pwdFormRef"), ...{ class: ("box-border p-5") }, labelWidth: ("86px"), labelPosition: ("top"), }, ...__VLS_functionalComponentArgsRest(__VLS_118));
    // @ts-ignore navigation for `const pwdFormRef = ref()`
    __VLS_ctx.pwdFormRef;
    var __VLS_123 = {};
    const __VLS_124 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({ label: ("当前密码"), prop: ("password"), }));
    const __VLS_126 = __VLS_125({ label: ("当前密码"), prop: ("password"), }, ...__VLS_functionalComponentArgsRest(__VLS_125));
    const __VLS_130 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({ modelValue: ((__VLS_ctx.pwdForm.password)), type: ("password"), disabled: ((!__VLS_ctx.isEditPwd)), showPassword: (true), placeholder: ("请输入当前密码"), }));
    const __VLS_132 = __VLS_131({ modelValue: ((__VLS_ctx.pwdForm.password)), type: ("password"), disabled: ((!__VLS_ctx.isEditPwd)), showPassword: (true), placeholder: ("请输入当前密码"), }, ...__VLS_functionalComponentArgsRest(__VLS_131));
    __VLS_nonNullable(__VLS_129.slots).default;
    var __VLS_129;
    const __VLS_136 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({ label: ("新密码"), prop: ("newPassword"), }));
    const __VLS_138 = __VLS_137({ label: ("新密码"), prop: ("newPassword"), }, ...__VLS_functionalComponentArgsRest(__VLS_137));
    const __VLS_142 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_143 = __VLS_asFunctionalComponent(__VLS_142, new __VLS_142({ modelValue: ((__VLS_ctx.pwdForm.newPassword)), type: ("password"), disabled: ((!__VLS_ctx.isEditPwd)), showPassword: (true), placeholder: ("请输入新密码"), }));
    const __VLS_144 = __VLS_143({ modelValue: ((__VLS_ctx.pwdForm.newPassword)), type: ("password"), disabled: ((!__VLS_ctx.isEditPwd)), showPassword: (true), placeholder: ("请输入新密码"), }, ...__VLS_functionalComponentArgsRest(__VLS_143));
    __VLS_nonNullable(__VLS_141.slots).default;
    var __VLS_141;
    const __VLS_148 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({ label: ("确认新密码"), prop: ("confirmPassword"), }));
    const __VLS_150 = __VLS_149({ label: ("确认新密码"), prop: ("confirmPassword"), }, ...__VLS_functionalComponentArgsRest(__VLS_149));
    const __VLS_154 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_155 = __VLS_asFunctionalComponent(__VLS_154, new __VLS_154({ modelValue: ((__VLS_ctx.pwdForm.confirmPassword)), type: ("password"), disabled: ((!__VLS_ctx.isEditPwd)), showPassword: (true), placeholder: ("请再次输入新密码"), }));
    const __VLS_156 = __VLS_155({ modelValue: ((__VLS_ctx.pwdForm.confirmPassword)), type: ("password"), disabled: ((!__VLS_ctx.isEditPwd)), showPassword: (true), placeholder: ("请再次输入新密码"), }, ...__VLS_functionalComponentArgsRest(__VLS_155));
    __VLS_nonNullable(__VLS_153.slots).default;
    var __VLS_153;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-c justify-end [&_.el-button]:!w-27.5") }, });
    const __VLS_160 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
    // @ts-ignore
    const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({ ...{ 'onClick': {} }, type: ("primary"), ...{ class: ("w-22.5") }, }));
    const __VLS_162 = __VLS_161({ ...{ 'onClick': {} }, type: ("primary"), ...{ class: ("w-22.5") }, }, ...__VLS_functionalComponentArgsRest(__VLS_161));
    __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
    let __VLS_166;
    const __VLS_167 = {
        onClick: (__VLS_ctx.editPwd)
    };
    let __VLS_163;
    let __VLS_164;
    (__VLS_ctx.isEditPwd ? '保存' : '编辑');
    __VLS_nonNullable(__VLS_165.slots).default;
    var __VLS_165;
    __VLS_nonNullable(__VLS_122.slots).default;
    var __VLS_122;
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['h-full'];
    __VLS_styleScopedClasses['p-0'];
    __VLS_styleScopedClasses['bg-transparent'];
    __VLS_styleScopedClasses['border-none'];
    __VLS_styleScopedClasses['shadow-none'];
    __VLS_styleScopedClasses['relative'];
    __VLS_styleScopedClasses['flex-b'];
    __VLS_styleScopedClasses['mt-2.5'];
    __VLS_styleScopedClasses['max-md:block'];
    __VLS_styleScopedClasses['max-md:mt-1'];
    __VLS_styleScopedClasses['w-112'];
    __VLS_styleScopedClasses['mr-5'];
    __VLS_styleScopedClasses['max-md:w-full'];
    __VLS_styleScopedClasses['max-md:mr-0'];
    __VLS_styleScopedClasses['art-card-sm'];
    __VLS_styleScopedClasses['relative'];
    __VLS_styleScopedClasses['p-9'];
    __VLS_styleScopedClasses['pb-6'];
    __VLS_styleScopedClasses['overflow-hidden'];
    __VLS_styleScopedClasses['text-center'];
    __VLS_styleScopedClasses['absolute'];
    __VLS_styleScopedClasses['top-0'];
    __VLS_styleScopedClasses['left-0'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['h-50'];
    __VLS_styleScopedClasses['object-cover'];
    __VLS_styleScopedClasses['relative'];
    __VLS_styleScopedClasses['z-10'];
    __VLS_styleScopedClasses['w-20'];
    __VLS_styleScopedClasses['h-20'];
    __VLS_styleScopedClasses['mt-30'];
    __VLS_styleScopedClasses['mx-auto'];
    __VLS_styleScopedClasses['object-cover'];
    __VLS_styleScopedClasses['border-2'];
    __VLS_styleScopedClasses['border-white'];
    __VLS_styleScopedClasses['rounded-full'];
    __VLS_styleScopedClasses['mt-5'];
    __VLS_styleScopedClasses['text-xl'];
    __VLS_styleScopedClasses['font-normal'];
    __VLS_styleScopedClasses['mt-5'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['w-75'];
    __VLS_styleScopedClasses['mx-auto'];
    __VLS_styleScopedClasses['mt-7.5'];
    __VLS_styleScopedClasses['text-left'];
    __VLS_styleScopedClasses['mt-2.5'];
    __VLS_styleScopedClasses['text-g-700'];
    __VLS_styleScopedClasses['ml-2'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['mt-2.5'];
    __VLS_styleScopedClasses['text-g-700'];
    __VLS_styleScopedClasses['ml-2'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['mt-2.5'];
    __VLS_styleScopedClasses['text-g-700'];
    __VLS_styleScopedClasses['ml-2'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['mt-2.5'];
    __VLS_styleScopedClasses['text-g-700'];
    __VLS_styleScopedClasses['ml-2'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['flex-1'];
    __VLS_styleScopedClasses['overflow-hidden'];
    __VLS_styleScopedClasses['max-md:w-full'];
    __VLS_styleScopedClasses['max-md:mt-3.5'];
    __VLS_styleScopedClasses['art-card-sm'];
    __VLS_styleScopedClasses['p-4'];
    __VLS_styleScopedClasses['text-xl'];
    __VLS_styleScopedClasses['font-normal'];
    __VLS_styleScopedClasses['border-b'];
    __VLS_styleScopedClasses['border-g-300'];
    __VLS_styleScopedClasses['box-border'];
    __VLS_styleScopedClasses['p-5'];
    __VLS_styleScopedClasses['[&>.el-row_.el-form-item]:w-[calc(50%-10px)]'];
    __VLS_styleScopedClasses['[&>.el-row_.el-input]:w-full'];
    __VLS_styleScopedClasses['[&>.el-row_.el-select]:w-full'];
    __VLS_styleScopedClasses['ml-5'];
    __VLS_styleScopedClasses['ml-5'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['justify-end'];
    __VLS_styleScopedClasses['[&_.el-button]:!w-27.5'];
    __VLS_styleScopedClasses['w-22.5'];
    __VLS_styleScopedClasses['art-card-sm'];
    __VLS_styleScopedClasses['my-5'];
    __VLS_styleScopedClasses['p-4'];
    __VLS_styleScopedClasses['text-xl'];
    __VLS_styleScopedClasses['font-normal'];
    __VLS_styleScopedClasses['border-b'];
    __VLS_styleScopedClasses['border-g-300'];
    __VLS_styleScopedClasses['box-border'];
    __VLS_styleScopedClasses['p-5'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['justify-end'];
    __VLS_styleScopedClasses['[&_.el-button]:!w-27.5'];
    __VLS_styleScopedClasses['w-22.5'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "ruleFormRef": __VLS_30,
        "pwdFormRef": __VLS_123,
    };
    var $refs;
    var $el;
    return {
        attrs: {},
        slots: __VLS_slots,
        refs: $refs,
        rootEl: $el,
    };
}
;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            userInfo: userInfo,
            isEdit: isEdit,
            isEditPwd: isEditPwd,
            date: date,
            ruleFormRef: ruleFormRef,
            pwdFormRef: pwdFormRef,
            roleName: roleName,
            userAvatar: userAvatar,
            form: form,
            pwdForm: pwdForm,
            pwdRules: pwdRules,
            rules: rules,
            edit: edit,
            editPwd: editPwd,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map