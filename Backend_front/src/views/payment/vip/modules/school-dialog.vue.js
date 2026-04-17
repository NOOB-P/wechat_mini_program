/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ElMessage } from 'element-plus';
import { updateVipPackage } from '@/api/payment/vip';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps();
const emit = defineEmits(['update:modelValue', 'success']);
const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});
const loading = ref(false);
const selectedSchoolIds = ref([]);
watch(() => props.packageData, (val) => {
    if (!val || !Array.isArray(val.schools)) {
        selectedSchoolIds.value = [];
        return;
    }
    selectedSchoolIds.value = val.schools.map((item) => item?.schoolId).filter(Boolean);
}, { immediate: true });
const getSchoolName = (schoolId) => {
    const school = props.schoolOptions.find(item => item.id === schoolId);
    return school?.name || schoolId;
};
const removeSchool = (schoolId) => {
    selectedSchoolIds.value = selectedSchoolIds.value.filter(item => item !== schoolId);
};
const handleClose = () => {
    visible.value = false;
};
const handleSubmit = async () => {
    if (!props.packageData?.id) {
        return ElMessage.warning('当前套餐信息无效');
    }
    loading.value = true;
    try {
        await updateVipPackage({
            ...props.packageData,
            schools: selectedSchoolIds.value.map(schoolId => ({ schoolId }))
        });
        ElMessage.success('开通学校已更新');
        emit('success');
        visible.value = false;
    }
    finally {
        loading.value = false;
    }
}; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_fnComponent = (await import('vue')).defineComponent({
    emits: {},
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
    let __VLS_resolvedLocalAndGlobalComponents;
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.visible)), title: ((`选择开通学校 - ${__VLS_ctx.packageData?.title || ''}`)), width: ("640px"), }));
    const __VLS_2 = __VLS_1({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.visible)), title: ((`选择开通学校 - ${__VLS_ctx.packageData?.title || ''}`)), width: ("640px"), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_6 = {};
    let __VLS_7;
    const __VLS_8 = {
        onClose: (__VLS_ctx.handleClose)
    };
    let __VLS_3;
    let __VLS_4;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mb-4 text-sm leading-6 text-gray-500") }, });
    const __VLS_9 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({ labelWidth: ("90px"), }));
    const __VLS_11 = __VLS_10({ labelWidth: ("90px"), }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    const __VLS_15 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({ label: ("学校范围"), }));
    const __VLS_17 = __VLS_16({ label: ("学校范围"), }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    const __VLS_21 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
    /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({ modelValue: ((__VLS_ctx.selectedSchoolIds)), multiple: (true), filterable: (true), collapseTags: (true), collapseTagsTooltip: (true), placeholder: ("请选择学校"), ...{ style: ({}) }, }));
    const __VLS_23 = __VLS_22({ modelValue: ((__VLS_ctx.selectedSchoolIds)), multiple: (true), filterable: (true), collapseTags: (true), collapseTagsTooltip: (true), placeholder: ("请选择学校"), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    for (const [school] of __VLS_getVForSourceType((__VLS_ctx.schoolOptions))) {
        const __VLS_27 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
        /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
        // @ts-ignore
        const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({ key: ((school.id)), label: ((school.name)), value: ((school.id)), }));
        const __VLS_29 = __VLS_28({ key: ((school.id)), label: ((school.name)), value: ((school.id)), }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    }
    __VLS_nonNullable(__VLS_26.slots).default;
    var __VLS_26;
    __VLS_nonNullable(__VLS_20.slots).default;
    var __VLS_20;
    __VLS_nonNullable(__VLS_14.slots).default;
    var __VLS_14;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("rounded-lg bg-gray-50 p-4") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mb-3 flex items-center justify-between text-sm text-gray-600") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.selectedSchoolIds.length);
    const __VLS_33 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }));
    const __VLS_35 = __VLS_34({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    let __VLS_39;
    const __VLS_40 = {
        onClick: (...[$event]) => {
            __VLS_ctx.selectedSchoolIds = [];
        }
    };
    let __VLS_36;
    let __VLS_37;
    __VLS_nonNullable(__VLS_38.slots).default;
    var __VLS_38;
    if (__VLS_ctx.selectedSchoolIds.length) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex flex-wrap gap-2") }, });
        for (const [schoolId] of __VLS_getVForSourceType((__VLS_ctx.selectedSchoolIds))) {
            const __VLS_41 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
            /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
            // @ts-ignore
            const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({ ...{ 'onClose': {} }, key: ((schoolId)), closable: (true), type: ("success"), effect: ("plain"), }));
            const __VLS_43 = __VLS_42({ ...{ 'onClose': {} }, key: ((schoolId)), closable: (true), type: ("success"), effect: ("plain"), }, ...__VLS_functionalComponentArgsRest(__VLS_42));
            let __VLS_47;
            const __VLS_48 = {
                onClose: (...[$event]) => {
                    if (!((__VLS_ctx.selectedSchoolIds.length)))
                        return;
                    __VLS_ctx.removeSchool(schoolId);
                }
            };
            let __VLS_44;
            let __VLS_45;
            (__VLS_ctx.getSchoolName(schoolId));
            __VLS_nonNullable(__VLS_46.slots).default;
            var __VLS_46;
        }
    }
    else {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("text-sm text-gray-400") }, });
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("dialog-footer") }, });
        const __VLS_49 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({ ...{ 'onClick': {} }, }));
        const __VLS_51 = __VLS_50({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_50));
        let __VLS_55;
        const __VLS_56 = {
            onClick: (...[$event]) => {
                __VLS_ctx.visible = false;
            }
        };
        let __VLS_52;
        let __VLS_53;
        __VLS_nonNullable(__VLS_54.slots).default;
        var __VLS_54;
        const __VLS_57 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.loading)), }));
        const __VLS_59 = __VLS_58({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.loading)), }, ...__VLS_functionalComponentArgsRest(__VLS_58));
        let __VLS_63;
        const __VLS_64 = {
            onClick: (__VLS_ctx.handleSubmit)
        };
        let __VLS_60;
        let __VLS_61;
        __VLS_nonNullable(__VLS_62.slots).default;
        var __VLS_62;
    }
    var __VLS_5;
    __VLS_styleScopedClasses['mb-4'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['leading-6'];
    __VLS_styleScopedClasses['text-gray-500'];
    __VLS_styleScopedClasses['rounded-lg'];
    __VLS_styleScopedClasses['bg-gray-50'];
    __VLS_styleScopedClasses['p-4'];
    __VLS_styleScopedClasses['mb-3'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['text-gray-600'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['flex-wrap'];
    __VLS_styleScopedClasses['gap-2'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['text-gray-400'];
    __VLS_styleScopedClasses['dialog-footer'];
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
            visible: visible,
            loading: loading,
            selectedSchoolIds: selectedSchoolIds,
            getSchoolName: getSchoolName,
            removeSchool: removeSchool,
            handleClose: handleClose,
            handleSubmit: handleSubmit,
        };
    },
    emits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    __typeProps: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=school-dialog.vue.js.map