import { updateVipPackage } from '@/api/payment/vip';
import { ElMessage } from 'element-plus';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps();
const emit = defineEmits(['update:modelValue', 'success']);
const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});
const loading = ref(false);
const form = ref({
    id: undefined,
    tierCode: '',
    title: '',
    subTitle: '',
    sortOrder: 0,
    benefits: '[]',
    isEnabled: 1
});
watch(() => props.packageData, (val) => {
    if (val) {
        form.value = { ...val };
    }
    else {
        form.value = {
            id: undefined,
            tierCode: '',
            title: '',
            subTitle: '',
            sortOrder: 0,
            benefits: '[]',
            isEnabled: 1
        };
    }
}, { immediate: true });
const handleClose = () => {
    visible.value = false;
};
const handleSubmit = async () => {
    if (!form.value.tierCode || !form.value.title) {
        return ElMessage.warning('请填写必填项');
    }
    loading.value = true;
    try {
        await updateVipPackage(form.value);
        ElMessage.success(form.value.id ? '保存成功' : '新增成功');
        emit('success');
        visible.value = false;
    }
    catch (error) {
        console.error('Failed to save package:', error);
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
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onClose': {} }, title: ((__VLS_ctx.form.id ? '编辑套餐' : '新增套餐')), modelValue: ((__VLS_ctx.visible)), width: ("500px"), }));
    const __VLS_2 = __VLS_1({ ...{ 'onClose': {} }, title: ((__VLS_ctx.form.id ? '编辑套餐' : '新增套餐')), modelValue: ((__VLS_ctx.visible)), width: ("500px"), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_6 = {};
    let __VLS_7;
    const __VLS_8 = {
        onClose: (__VLS_ctx.handleClose)
    };
    let __VLS_3;
    let __VLS_4;
    const __VLS_9 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({ model: ((__VLS_ctx.form)), labelWidth: ("100px"), }));
    const __VLS_11 = __VLS_10({ model: ((__VLS_ctx.form)), labelWidth: ("100px"), }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    const __VLS_15 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({ label: ("等级代码"), required: (true), }));
    const __VLS_17 = __VLS_16({ label: ("等级代码"), required: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    const __VLS_21 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({ modelValue: ((__VLS_ctx.form.tierCode)), placeholder: ("如 VIP, SVIP"), disabled: ((!!__VLS_ctx.form.id)), }));
    const __VLS_23 = __VLS_22({ modelValue: ((__VLS_ctx.form.tierCode)), placeholder: ("如 VIP, SVIP"), disabled: ((!!__VLS_ctx.form.id)), }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    __VLS_nonNullable(__VLS_20.slots).default;
    var __VLS_20;
    const __VLS_27 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({ label: ("显示标题"), required: (true), }));
    const __VLS_29 = __VLS_28({ label: ("显示标题"), required: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    const __VLS_33 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({ modelValue: ((__VLS_ctx.form.title)), placeholder: ("如 VIP 基础版"), }));
    const __VLS_35 = __VLS_34({ modelValue: ((__VLS_ctx.form.title)), placeholder: ("如 VIP 基础版"), }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    __VLS_nonNullable(__VLS_32.slots).default;
    var __VLS_32;
    const __VLS_39 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({ label: ("副标题"), }));
    const __VLS_41 = __VLS_40({ label: ("副标题"), }, ...__VLS_functionalComponentArgsRest(__VLS_40));
    const __VLS_45 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({ modelValue: ((__VLS_ctx.form.subTitle)), placeholder: ("请输入描述信息"), }));
    const __VLS_47 = __VLS_46({ modelValue: ((__VLS_ctx.form.subTitle)), placeholder: ("请输入描述信息"), }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    __VLS_nonNullable(__VLS_44.slots).default;
    var __VLS_44;
    const __VLS_51 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({ label: ("排序权重"), }));
    const __VLS_53 = __VLS_52({ label: ("排序权重"), }, ...__VLS_functionalComponentArgsRest(__VLS_52));
    const __VLS_57 = __VLS_resolvedLocalAndGlobalComponents.ElInputNumber;
    /** @type { [typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ] } */
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({ modelValue: ((__VLS_ctx.form.sortOrder)), min: ((0)), }));
    const __VLS_59 = __VLS_58({ modelValue: ((__VLS_ctx.form.sortOrder)), min: ((0)), }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    __VLS_nonNullable(__VLS_56.slots).default;
    var __VLS_56;
    __VLS_nonNullable(__VLS_14.slots).default;
    var __VLS_14;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("dialog-footer") }, });
        const __VLS_63 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63({ ...{ 'onClick': {} }, }));
        const __VLS_65 = __VLS_64({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_64));
        let __VLS_69;
        const __VLS_70 = {
            onClick: (...[$event]) => {
                __VLS_ctx.visible = false;
            }
        };
        let __VLS_66;
        let __VLS_67;
        __VLS_nonNullable(__VLS_68.slots).default;
        var __VLS_68;
        const __VLS_71 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.loading)), }));
        const __VLS_73 = __VLS_72({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.loading)), }, ...__VLS_functionalComponentArgsRest(__VLS_72));
        let __VLS_77;
        const __VLS_78 = {
            onClick: (__VLS_ctx.handleSubmit)
        };
        let __VLS_74;
        let __VLS_75;
        __VLS_nonNullable(__VLS_76.slots).default;
        var __VLS_76;
    }
    var __VLS_5;
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
            form: form,
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
//# sourceMappingURL=package-dialog.vue.js.map