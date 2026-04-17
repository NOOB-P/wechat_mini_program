/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { fetchAddUser, fetchEditUser } from '@/api/system/user';
import { fetchGetRoleList } from '@/api/system/role';
import { fetchGetStudentList } from '@/api/core-business/student';
import { onMounted, ref, reactive, computed, watch, nextTick } from 'vue';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps();
const emit = defineEmits();
const submitLoading = ref(false);
// 角色列表
const roleList = ref([]);
// 学生列表 (用于家长绑定)
const studentList = ref([]);
const getRoles = async () => {
    try {
        const res = await fetchGetRoleList({ current: 1, size: 100 });
        if (res && res.records) {
            roleList.value = res.records;
        }
    }
    catch (error) {
        console.error('获取角色列表失败', error);
    }
};
const getStudents = async (query) => {
    try {
        const res = await fetchGetStudentList({ current: 1, size: 50, keyword: query });
        if (res && res.records) {
            studentList.value = res.records;
        }
    }
    catch (error) {
        console.error('获取学生列表失败', error);
    }
};
onMounted(() => {
    getRoles();
    getStudents();
});
// 对话框显示控制
const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
});
const dialogType = computed(() => props.type);
// 表单实例
const formRef = ref();
// 表单数据
const formData = reactive({
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
});
// 表单验证规则
const rules = computed(() => {
    const baseRules = {
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
    };
    if (formData.userType === '3') {
        baseRules.studentId = [{ required: true, message: '请选择关联学生', trigger: 'change' }];
    }
    return baseRules;
});
/**
 * 初始化表单数据
 * 根据对话框类型（新增/编辑）填充表单
 */
const initFormData = () => {
    const isEdit = props.type === 'edit' && props.userData;
    const row = props.userData;
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
        });
    }
    else {
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
        });
    }
};
/**
 * 监听对话框状态变化
 * 当对话框打开时初始化表单数据并清除验证状态
 */
watch(() => [props.visible, props.type, props.userData], ([visible]) => {
    if (visible) {
        initFormData();
        nextTick(() => {
            formRef.value?.clearValidate();
        });
    }
}, { immediate: true });
/**
 * 提交表单
 * 验证通过后触发提交事件
 */
const handleSubmit = async () => {
    if (!formRef.value)
        return;
    await formRef.value.validate(async (valid) => {
        if (valid) {
            submitLoading.value = true;
            try {
                if (dialogType.value === 'add') {
                    await fetchAddUser(formData);
                    ElMessage.success('添加成功');
                }
                else {
                    await fetchEditUser(formData.id, formData);
                    ElMessage.success('更新成功');
                }
                dialogVisible.value = false;
                emit('submit');
            }
            catch (error) {
                // ElMessage.error(error.message || '操作失败')
            }
            finally {
                submitLoading.value = false;
            }
        }
    });
}; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_fnComponent = (await import('vue')).defineComponent({
    __typeEmits: {},
});
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
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.ElDialog, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ modelValue: ((__VLS_ctx.dialogVisible)), title: ((__VLS_ctx.dialogType === 'add' ? '添加用户' : '编辑用户')), width: ("450px"), alignCenter: (true), }));
    const __VLS_2 = __VLS_1({ modelValue: ((__VLS_ctx.dialogVisible)), title: ((__VLS_ctx.dialogType === 'add' ? '添加用户' : '编辑用户')), width: ("450px"), alignCenter: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_6 = {};
    const __VLS_7 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.ElForm, ] } */
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({ ref: ("formRef"), model: ((__VLS_ctx.formData)), rules: ((__VLS_ctx.rules)), labelWidth: ("100px"), }));
    const __VLS_9 = __VLS_8({ ref: ("formRef"), model: ((__VLS_ctx.formData)), rules: ((__VLS_ctx.rules)), labelWidth: ("100px"), }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    // @ts-ignore navigation for `const formRef = ref()`
    __VLS_ctx.formRef;
    var __VLS_13 = {};
    const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ label: ("用户名"), prop: ("userName"), }));
    const __VLS_16 = __VLS_15({ label: ("用户名"), prop: ("userName"), }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    const __VLS_20 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({ modelValue: ((__VLS_ctx.formData.userName)), placeholder: ("请输入登录账号"), disabled: ((__VLS_ctx.dialogType === 'edit')), }));
    const __VLS_22 = __VLS_21({ modelValue: ((__VLS_ctx.formData.userName)), placeholder: ("请输入登录账号"), disabled: ((__VLS_ctx.dialogType === 'edit')), }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_nonNullable(__VLS_19.slots).default;
    var __VLS_19;
    const __VLS_26 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({ label: ("姓名/昵称"), prop: ("nickName"), }));
    const __VLS_28 = __VLS_27({ label: ("姓名/昵称"), prop: ("nickName"), }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    const __VLS_32 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({ modelValue: ((__VLS_ctx.formData.nickName)), placeholder: ("请输入姓名或昵称"), }));
    const __VLS_34 = __VLS_33({ modelValue: ((__VLS_ctx.formData.nickName)), placeholder: ("请输入姓名或昵称"), }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_nonNullable(__VLS_31.slots).default;
    var __VLS_31;
    if (__VLS_ctx.dialogType === 'add') {
        const __VLS_38 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({ label: ("密码"), prop: ("password"), }));
        const __VLS_40 = __VLS_39({ label: ("密码"), prop: ("password"), }, ...__VLS_functionalComponentArgsRest(__VLS_39));
        const __VLS_44 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, ] } */
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({ modelValue: ((__VLS_ctx.formData.password)), placeholder: ("请输入密码(默认123456)"), type: ("password"), showPassword: (true), }));
        const __VLS_46 = __VLS_45({ modelValue: ((__VLS_ctx.formData.password)), placeholder: ("请输入密码(默认123456)"), type: ("password"), showPassword: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        __VLS_nonNullable(__VLS_43.slots).default;
        var __VLS_43;
    }
    else {
        const __VLS_50 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({ label: ("重置密码"), prop: ("password"), }));
        const __VLS_52 = __VLS_51({ label: ("重置密码"), prop: ("password"), }, ...__VLS_functionalComponentArgsRest(__VLS_51));
        const __VLS_56 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, ] } */
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({ modelValue: ((__VLS_ctx.formData.password)), placeholder: ("不填则不修改"), type: ("password"), showPassword: (true), }));
        const __VLS_58 = __VLS_57({ modelValue: ((__VLS_ctx.formData.password)), placeholder: ("不填则不修改"), type: ("password"), showPassword: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        __VLS_nonNullable(__VLS_55.slots).default;
        var __VLS_55;
    }
    const __VLS_62 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({ label: ("手机号"), prop: ("userPhone"), }));
    const __VLS_64 = __VLS_63({ label: ("手机号"), prop: ("userPhone"), }, ...__VLS_functionalComponentArgsRest(__VLS_63));
    const __VLS_68 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({ modelValue: ((__VLS_ctx.formData.userPhone)), placeholder: ("请输入手机号"), }));
    const __VLS_70 = __VLS_69({ modelValue: ((__VLS_ctx.formData.userPhone)), placeholder: ("请输入手机号"), }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    __VLS_nonNullable(__VLS_67.slots).default;
    var __VLS_67;
    const __VLS_74 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({ label: ("角色类型"), prop: ("userType"), }));
    const __VLS_76 = __VLS_75({ label: ("角色类型"), prop: ("userType"), }, ...__VLS_functionalComponentArgsRest(__VLS_75));
    const __VLS_80 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
    /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.ElSelect, ] } */
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({ modelValue: ((__VLS_ctx.formData.userType)), placeholder: ("请选择角色类型"), ...{ class: ("w-full") }, }));
    const __VLS_82 = __VLS_81({ modelValue: ((__VLS_ctx.formData.userType)), placeholder: ("请选择角色类型"), ...{ class: ("w-full") }, }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    for (const [role] of __VLS_getVForSourceType((__VLS_ctx.roleList))) {
        const __VLS_86 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
        /** @type { [typeof __VLS_components.ElOption, ] } */
        // @ts-ignore
        const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({ key: ((role.id)), label: ((role.roleName)), value: ((String(role.id))), }));
        const __VLS_88 = __VLS_87({ key: ((role.id)), label: ((role.roleName)), value: ((String(role.id))), }, ...__VLS_functionalComponentArgsRest(__VLS_87));
    }
    __VLS_nonNullable(__VLS_85.slots).default;
    var __VLS_85;
    __VLS_nonNullable(__VLS_79.slots).default;
    var __VLS_79;
    if (__VLS_ctx.formData.userType === '2') {
        const __VLS_92 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({ label: ("绑定学校"), prop: ("schoolName"), }));
        const __VLS_94 = __VLS_93({ label: ("绑定学校"), prop: ("schoolName"), }, ...__VLS_functionalComponentArgsRest(__VLS_93));
        const __VLS_98 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, ] } */
        // @ts-ignore
        const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({ modelValue: ((__VLS_ctx.formData.schoolName)), placeholder: ("请输入学校名称"), }));
        const __VLS_100 = __VLS_99({ modelValue: ((__VLS_ctx.formData.schoolName)), placeholder: ("请输入学校名称"), }, ...__VLS_functionalComponentArgsRest(__VLS_99));
        __VLS_nonNullable(__VLS_97.slots).default;
        var __VLS_97;
    }
    if (__VLS_ctx.formData.userType === '3') {
        const __VLS_104 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({ label: ("关联学生"), prop: ("studentId"), }));
        const __VLS_106 = __VLS_105({ label: ("关联学生"), prop: ("studentId"), }, ...__VLS_functionalComponentArgsRest(__VLS_105));
        const __VLS_110 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
        /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.ElSelect, ] } */
        // @ts-ignore
        const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({ modelValue: ((__VLS_ctx.formData.studentId)), placeholder: ("请搜索并选择学生"), filterable: (true), remote: (true), remoteMethod: ((__VLS_ctx.getStudents)), ...{ class: ("w-full") }, clearable: (true), }));
        const __VLS_112 = __VLS_111({ modelValue: ((__VLS_ctx.formData.studentId)), placeholder: ("请搜索并选择学生"), filterable: (true), remote: (true), remoteMethod: ((__VLS_ctx.getStudents)), ...{ class: ("w-full") }, clearable: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_111));
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.studentList))) {
            const __VLS_116 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
            /** @type { [typeof __VLS_components.ElOption, ] } */
            // @ts-ignore
            const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({ key: ((item.id)), label: ((`${item.name} (${item.school} / ${item.className || '未设置班级'})`)), value: ((item.id)), }));
            const __VLS_118 = __VLS_117({ key: ((item.id)), label: ((`${item.name} (${item.school} / ${item.className || '未设置班级'})`)), value: ((item.id)), }, ...__VLS_functionalComponentArgsRest(__VLS_117));
        }
        __VLS_nonNullable(__VLS_115.slots).default;
        var __VLS_115;
        __VLS_nonNullable(__VLS_109.slots).default;
        var __VLS_109;
    }
    if (__VLS_ctx.formData.userType === '4') {
        const __VLS_122 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_123 = __VLS_asFunctionalComponent(__VLS_122, new __VLS_122({ label: ("就读学校"), prop: ("schoolName"), }));
        const __VLS_124 = __VLS_123({ label: ("就读学校"), prop: ("schoolName"), }, ...__VLS_functionalComponentArgsRest(__VLS_123));
        const __VLS_128 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, ] } */
        // @ts-ignore
        const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({ modelValue: ((__VLS_ctx.formData.schoolName)), placeholder: ("请输入学校名称"), }));
        const __VLS_130 = __VLS_129({ modelValue: ((__VLS_ctx.formData.schoolName)), placeholder: ("请输入学校名称"), }, ...__VLS_functionalComponentArgsRest(__VLS_129));
        __VLS_nonNullable(__VLS_127.slots).default;
        var __VLS_127;
        const __VLS_134 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_135 = __VLS_asFunctionalComponent(__VLS_134, new __VLS_134({ label: ("就读班级"), prop: ("className"), }));
        const __VLS_136 = __VLS_135({ label: ("就读班级"), prop: ("className"), }, ...__VLS_functionalComponentArgsRest(__VLS_135));
        const __VLS_140 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, ] } */
        // @ts-ignore
        const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({ modelValue: ((__VLS_ctx.formData.className)), placeholder: ("请输入班级名称"), }));
        const __VLS_142 = __VLS_141({ modelValue: ((__VLS_ctx.formData.className)), placeholder: ("请输入班级名称"), }, ...__VLS_functionalComponentArgsRest(__VLS_141));
        __VLS_nonNullable(__VLS_139.slots).default;
        var __VLS_139;
        const __VLS_146 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({ label: ("关联家长"), prop: ("parentName"), }));
        const __VLS_148 = __VLS_147({ label: ("关联家长"), prop: ("parentName"), }, ...__VLS_functionalComponentArgsRest(__VLS_147));
        const __VLS_152 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, ] } */
        // @ts-ignore
        const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({ modelValue: ((__VLS_ctx.formData.parentName)), placeholder: ("请输入家长姓名"), }));
        const __VLS_154 = __VLS_153({ modelValue: ((__VLS_ctx.formData.parentName)), placeholder: ("请输入家长姓名"), }, ...__VLS_functionalComponentArgsRest(__VLS_153));
        __VLS_nonNullable(__VLS_151.slots).default;
        var __VLS_151;
    }
    const __VLS_158 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158({ label: ("状态"), prop: ("status"), }));
    const __VLS_160 = __VLS_159({ label: ("状态"), prop: ("status"), }, ...__VLS_functionalComponentArgsRest(__VLS_159));
    const __VLS_164 = __VLS_resolvedLocalAndGlobalComponents.ElRadioGroup;
    /** @type { [typeof __VLS_components.ElRadioGroup, typeof __VLS_components.ElRadioGroup, ] } */
    // @ts-ignore
    const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({ modelValue: ((__VLS_ctx.formData.status)), }));
    const __VLS_166 = __VLS_165({ modelValue: ((__VLS_ctx.formData.status)), }, ...__VLS_functionalComponentArgsRest(__VLS_165));
    const __VLS_170 = __VLS_resolvedLocalAndGlobalComponents.ElRadio;
    /** @type { [typeof __VLS_components.ElRadio, typeof __VLS_components.ElRadio, ] } */
    // @ts-ignore
    const __VLS_171 = __VLS_asFunctionalComponent(__VLS_170, new __VLS_170({ label: ("1"), }));
    const __VLS_172 = __VLS_171({ label: ("1"), }, ...__VLS_functionalComponentArgsRest(__VLS_171));
    __VLS_nonNullable(__VLS_175.slots).default;
    var __VLS_175;
    const __VLS_176 = __VLS_resolvedLocalAndGlobalComponents.ElRadio;
    /** @type { [typeof __VLS_components.ElRadio, typeof __VLS_components.ElRadio, ] } */
    // @ts-ignore
    const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({ label: ("2"), }));
    const __VLS_178 = __VLS_177({ label: ("2"), }, ...__VLS_functionalComponentArgsRest(__VLS_177));
    __VLS_nonNullable(__VLS_181.slots).default;
    var __VLS_181;
    __VLS_nonNullable(__VLS_169.slots).default;
    var __VLS_169;
    __VLS_nonNullable(__VLS_163.slots).default;
    var __VLS_163;
    const __VLS_182 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_183 = __VLS_asFunctionalComponent(__VLS_182, new __VLS_182({ label: ("VIP权限"), }));
    const __VLS_184 = __VLS_183({ label: ("VIP权限"), }, ...__VLS_functionalComponentArgsRest(__VLS_183));
    const __VLS_188 = __VLS_resolvedLocalAndGlobalComponents.ElSpace;
    /** @type { [typeof __VLS_components.ElSpace, typeof __VLS_components.ElSpace, ] } */
    // @ts-ignore
    const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({}));
    const __VLS_190 = __VLS_189({}, ...__VLS_functionalComponentArgsRest(__VLS_189));
    const __VLS_194 = __VLS_resolvedLocalAndGlobalComponents.ElSwitch;
    /** @type { [typeof __VLS_components.ElSwitch, ] } */
    // @ts-ignore
    const __VLS_195 = __VLS_asFunctionalComponent(__VLS_194, new __VLS_194({ modelValue: ((__VLS_ctx.formData.isVip)), activeValue: ((1)), inactiveValue: ((0)), activeText: ("VIP"), }));
    const __VLS_196 = __VLS_195({ modelValue: ((__VLS_ctx.formData.isVip)), activeValue: ((1)), inactiveValue: ((0)), activeText: ("VIP"), }, ...__VLS_functionalComponentArgsRest(__VLS_195));
    const __VLS_200 = __VLS_resolvedLocalAndGlobalComponents.ElSwitch;
    /** @type { [typeof __VLS_components.ElSwitch, ] } */
    // @ts-ignore
    const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({ modelValue: ((__VLS_ctx.formData.isSvip)), activeValue: ((1)), inactiveValue: ((0)), activeText: ("SVIP"), ...{ style: ({}) }, }));
    const __VLS_202 = __VLS_201({ modelValue: ((__VLS_ctx.formData.isSvip)), activeValue: ((1)), inactiveValue: ((0)), activeText: ("SVIP"), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_201));
    __VLS_nonNullable(__VLS_193.slots).default;
    var __VLS_193;
    __VLS_nonNullable(__VLS_187.slots).default;
    var __VLS_187;
    __VLS_nonNullable(__VLS_12.slots).default;
    var __VLS_12;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("dialog-footer") }, });
        const __VLS_206 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_207 = __VLS_asFunctionalComponent(__VLS_206, new __VLS_206({ ...{ 'onClick': {} }, }));
        const __VLS_208 = __VLS_207({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_207));
        let __VLS_212;
        const __VLS_213 = {
            onClick: (...[$event]) => {
                __VLS_ctx.dialogVisible = false;
            }
        };
        let __VLS_209;
        let __VLS_210;
        __VLS_nonNullable(__VLS_211.slots).default;
        var __VLS_211;
        const __VLS_214 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_215 = __VLS_asFunctionalComponent(__VLS_214, new __VLS_214({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.submitLoading)), }));
        const __VLS_216 = __VLS_215({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.submitLoading)), }, ...__VLS_functionalComponentArgsRest(__VLS_215));
        let __VLS_220;
        const __VLS_221 = {
            onClick: (__VLS_ctx.handleSubmit)
        };
        let __VLS_217;
        let __VLS_218;
        __VLS_nonNullable(__VLS_219.slots).default;
        var __VLS_219;
    }
    var __VLS_5;
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['dialog-footer'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "formRef": __VLS_13,
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
            submitLoading: submitLoading,
            roleList: roleList,
            studentList: studentList,
            getStudents: getStudents,
            dialogVisible: dialogVisible,
            dialogType: dialogType,
            formRef: formRef,
            formData: formData,
            rules: rules,
            handleSubmit: handleSubmit,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=user-dialog.vue.js.map