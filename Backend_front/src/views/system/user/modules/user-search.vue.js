import { reactive, watch, ref, onMounted, computed } from 'vue';
import { fetchGetRoleOptions } from '@/api/system/role';
import { fetchGetSchoolOptions } from '@/api/core-business/school';
import { getClassOptions } from '@/api/core-business/sys-class';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps();
const emit = defineEmits();
const formModel = reactive({ ...props.modelValue });
// 监听外部 modelValue 的变化
watch(() => props.modelValue, (val) => {
    Object.assign(formModel, val);
}, { deep: true });
// 监听内部 formModel 的变化并更新外部
watch(formModel, (val) => {
    emit('update:modelValue', val);
}, { deep: true });
const roles = ref([]);
const schools = ref([]);
const classes = ref([]);
// 计算当前选中的角色是否是家长
const isParent = computed(() => {
    if (!formModel.roleId)
        return false;
    const role = roles.value.find((r) => r.id === formModel.roleId);
    if (!role)
        return false;
    const code = String(role.roleCode || '').toLowerCase();
    return code === 'parent' || code === 'r_parent' || role.roleName === '家长';
});
// 加载角色和学校选项
onMounted(async () => {
    try {
        const [roleRes, schoolRes] = await Promise.all([fetchGetRoleOptions(), fetchGetSchoolOptions()]);
        roles.value = roleRes || [];
        schools.value = schoolRes || [];
    }
    catch (error) {
        console.error('加载选项失败', error);
    }
});
// 学校切换时加载班级
const handleSchoolChange = async (schoolId) => {
    formModel.classId = '';
    classes.value = [];
    if (schoolId) {
        try {
            const res = await getClassOptions(schoolId);
            classes.value = res || [];
        }
        catch (error) {
            console.error('加载班级失败', error);
        }
    }
};
// 当切换用户类型时，如果不是家长，清空学校和班级筛选
watch(() => isParent.value, (val) => {
    if (!val) {
        formModel.schoolId = '';
        formModel.classId = '';
        classes.value = [];
    }
});
const handleSearch = () => {
    emit('search', { ...formModel });
};
const handleReset = () => {
    formModel.userName = '';
    formModel.userPhone = '';
    formModel.roleId = null;
    formModel.schoolId = '';
    formModel.classId = '';
    classes.value = [];
    emit('reset');
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("search-form") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ inline: ((true)), model: ((__VLS_ctx.formModel)), }));
    const __VLS_2 = __VLS_1({ inline: ((true)), model: ((__VLS_ctx.formModel)), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ label: ("用户名"), }));
    const __VLS_8 = __VLS_7({ label: ("用户名"), }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.formModel.userName)), placeholder: ("请输入用户名"), clearable: (true), }));
    const __VLS_14 = __VLS_13({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.formModel.userName)), placeholder: ("请输入用户名"), clearable: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    let __VLS_18;
    const __VLS_19 = {
        onKeyup: (__VLS_ctx.handleSearch)
    };
    let __VLS_15;
    let __VLS_16;
    var __VLS_17;
    __VLS_nonNullable(__VLS_11.slots).default;
    var __VLS_11;
    const __VLS_20 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({ label: ("手机号"), }));
    const __VLS_22 = __VLS_21({ label: ("手机号"), }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    const __VLS_26 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.formModel.userPhone)), placeholder: ("请输入手机号"), clearable: (true), }));
    const __VLS_28 = __VLS_27({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.formModel.userPhone)), placeholder: ("请输入手机号"), clearable: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    let __VLS_32;
    const __VLS_33 = {
        onKeyup: (__VLS_ctx.handleSearch)
    };
    let __VLS_29;
    let __VLS_30;
    var __VLS_31;
    __VLS_nonNullable(__VLS_25.slots).default;
    var __VLS_25;
    const __VLS_34 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({ label: ("用户类型"), }));
    const __VLS_36 = __VLS_35({ label: ("用户类型"), }, ...__VLS_functionalComponentArgsRest(__VLS_35));
    const __VLS_40 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
    /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({ modelValue: ((__VLS_ctx.formModel.roleId)), placeholder: ("请选择类型"), clearable: (true), ...{ style: ({}) }, }));
    const __VLS_42 = __VLS_41({ modelValue: ((__VLS_ctx.formModel.roleId)), placeholder: ("请选择类型"), clearable: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    for (const [role] of __VLS_getVForSourceType((__VLS_ctx.roles))) {
        const __VLS_46 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
        /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
        // @ts-ignore
        const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({ key: ((role.id)), label: ((role.roleName)), value: ((role.id)), }));
        const __VLS_48 = __VLS_47({ key: ((role.id)), label: ((role.roleName)), value: ((role.id)), }, ...__VLS_functionalComponentArgsRest(__VLS_47));
    }
    __VLS_nonNullable(__VLS_45.slots).default;
    var __VLS_45;
    __VLS_nonNullable(__VLS_39.slots).default;
    var __VLS_39;
    if (__VLS_ctx.isParent) {
        const __VLS_52 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({ label: ("学校"), }));
        const __VLS_54 = __VLS_53({ label: ("学校"), }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        const __VLS_58 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
        /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */
        // @ts-ignore
        const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({ ...{ 'onChange': {} }, modelValue: ((__VLS_ctx.formModel.schoolId)), placeholder: ("请选择学校"), clearable: (true), ...{ style: ({}) }, }));
        const __VLS_60 = __VLS_59({ ...{ 'onChange': {} }, modelValue: ((__VLS_ctx.formModel.schoolId)), placeholder: ("请选择学校"), clearable: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_59));
        let __VLS_64;
        const __VLS_65 = {
            onChange: (__VLS_ctx.handleSchoolChange)
        };
        let __VLS_61;
        let __VLS_62;
        for (const [school] of __VLS_getVForSourceType((__VLS_ctx.schools))) {
            const __VLS_66 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
            /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
            // @ts-ignore
            const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({ key: ((school.id)), label: ((school.name)), value: ((school.id)), }));
            const __VLS_68 = __VLS_67({ key: ((school.id)), label: ((school.name)), value: ((school.id)), }, ...__VLS_functionalComponentArgsRest(__VLS_67));
        }
        __VLS_nonNullable(__VLS_63.slots).default;
        var __VLS_63;
        __VLS_nonNullable(__VLS_57.slots).default;
        var __VLS_57;
        const __VLS_72 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
        // @ts-ignore
        const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({ label: ("班级"), }));
        const __VLS_74 = __VLS_73({ label: ("班级"), }, ...__VLS_functionalComponentArgsRest(__VLS_73));
        const __VLS_78 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
        /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */
        // @ts-ignore
        const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({ modelValue: ((__VLS_ctx.formModel.classId)), placeholder: ("请选择班级"), clearable: (true), ...{ style: ({}) }, disabled: ((!__VLS_ctx.formModel.schoolId)), }));
        const __VLS_80 = __VLS_79({ modelValue: ((__VLS_ctx.formModel.classId)), placeholder: ("请选择班级"), clearable: (true), ...{ style: ({}) }, disabled: ((!__VLS_ctx.formModel.schoolId)), }, ...__VLS_functionalComponentArgsRest(__VLS_79));
        for (const [cls] of __VLS_getVForSourceType((__VLS_ctx.classes))) {
            const __VLS_84 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
            /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
            // @ts-ignore
            const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({ key: ((cls.id)), label: ((`${cls.grade} ${cls.name}`)), value: ((cls.id)), }));
            const __VLS_86 = __VLS_85({ key: ((cls.id)), label: ((`${cls.grade} ${cls.name}`)), value: ((cls.id)), }, ...__VLS_functionalComponentArgsRest(__VLS_85));
        }
        __VLS_nonNullable(__VLS_83.slots).default;
        var __VLS_83;
        __VLS_nonNullable(__VLS_77.slots).default;
        var __VLS_77;
    }
    const __VLS_90 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({}));
    const __VLS_92 = __VLS_91({}, ...__VLS_functionalComponentArgsRest(__VLS_91));
    const __VLS_96 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({ ...{ 'onClick': {} }, type: ("primary"), }));
    const __VLS_98 = __VLS_97({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    let __VLS_102;
    const __VLS_103 = {
        onClick: (__VLS_ctx.handleSearch)
    };
    let __VLS_99;
    let __VLS_100;
    __VLS_nonNullable(__VLS_101.slots).default;
    var __VLS_101;
    const __VLS_104 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({ ...{ 'onClick': {} }, }));
    const __VLS_106 = __VLS_105({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_105));
    let __VLS_110;
    const __VLS_111 = {
        onClick: (__VLS_ctx.handleReset)
    };
    let __VLS_107;
    let __VLS_108;
    __VLS_nonNullable(__VLS_109.slots).default;
    var __VLS_109;
    __VLS_nonNullable(__VLS_95.slots).default;
    var __VLS_95;
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    __VLS_styleScopedClasses['search-form'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {};
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
            formModel: formModel,
            roles: roles,
            schools: schools,
            classes: classes,
            isParent: isParent,
            handleSchoolChange: handleSchoolChange,
            handleSearch: handleSearch,
            handleReset: handleReset,
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
//# sourceMappingURL=user-search.vue.js.map