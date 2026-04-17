import { ref, watch, computed } from 'vue';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps({
    visible: Boolean,
    isEdit: Boolean,
    data: Object,
    courseId: String
});
const emit = defineEmits(['update:visible', 'success']);
const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
});
const formRef = ref();
const uploading = ref(false);
const form = ref({
    id: '',
    courseId: '',
    title: '',
    sortOrder: 1
});
const rules = {
    title: [{ required: true, message: '请输入章节名称', trigger: 'blur' }]
};
watch(() => props.visible, (val) => {
    if (val) {
        if (props.isEdit && props.data) {
            form.value = { ...form.value, ...props.data };
        }
        else {
            resetForm();
            form.value.courseId = props.courseId || '';
        }
    }
});
const resetForm = () => {
    form.value = {
        id: '',
        courseId: '',
        title: '',
        sortOrder: 1
    };
    formRef.value?.resetFields();
};
const handleClosed = () => {
    resetForm();
};
const handleSubmit = async () => {
    if (!formRef.value)
        return;
    await formRef.value.validate((valid) => {
        if (valid) {
            emit('success', { ...form.value });
            dialogVisible.value = false;
        }
    });
}; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_fnComponent = (await import('vue')).defineComponent({
    props: {
        visible: Boolean,
        isEdit: Boolean,
        data: Object,
        courseId: String
    },
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
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onClosed': {} }, title: ((__VLS_ctx.isEdit ? '管理章节视频' : '新增章节')), modelValue: ((__VLS_ctx.dialogVisible)), width: ("500px"), }));
    const __VLS_2 = __VLS_1({ ...{ 'onClosed': {} }, title: ((__VLS_ctx.isEdit ? '管理章节视频' : '新增章节')), modelValue: ((__VLS_ctx.dialogVisible)), width: ("500px"), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_6 = {};
    let __VLS_7;
    const __VLS_8 = {
        onClosed: (__VLS_ctx.handleClosed)
    };
    let __VLS_3;
    let __VLS_4;
    const __VLS_9 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({ ref: ("formRef"), model: ((__VLS_ctx.form)), rules: ((__VLS_ctx.rules)), labelWidth: ("80px"), }));
    const __VLS_11 = __VLS_10({ ref: ("formRef"), model: ((__VLS_ctx.form)), rules: ((__VLS_ctx.rules)), labelWidth: ("80px"), }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    // @ts-ignore navigation for `const formRef = ref()`
    __VLS_ctx.formRef;
    var __VLS_15 = {};
    const __VLS_16 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({ label: ("章节名称"), prop: ("title"), }));
    const __VLS_18 = __VLS_17({ label: ("章节名称"), prop: ("title"), }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    const __VLS_22 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({ modelValue: ((__VLS_ctx.form.title)), placeholder: ("请输入章节名称"), }));
    const __VLS_24 = __VLS_23({ modelValue: ((__VLS_ctx.form.title)), placeholder: ("请输入章节名称"), }, ...__VLS_functionalComponentArgsRest(__VLS_23));
    __VLS_nonNullable(__VLS_21.slots).default;
    var __VLS_21;
    const __VLS_28 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({ label: ("排序"), prop: ("sortOrder"), }));
    const __VLS_30 = __VLS_29({ label: ("排序"), prop: ("sortOrder"), }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    const __VLS_34 = __VLS_resolvedLocalAndGlobalComponents.ElInputNumber;
    /** @type { [typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ] } */
    // @ts-ignore
    const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({ modelValue: ((__VLS_ctx.form.sortOrder)), min: ((1)), ...{ class: ("w-full") }, }));
    const __VLS_36 = __VLS_35({ modelValue: ((__VLS_ctx.form.sortOrder)), min: ((1)), ...{ class: ("w-full") }, }, ...__VLS_functionalComponentArgsRest(__VLS_35));
    __VLS_nonNullable(__VLS_33.slots).default;
    var __VLS_33;
    __VLS_nonNullable(__VLS_14.slots).default;
    var __VLS_14;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        const __VLS_40 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({ ...{ 'onClick': {} }, }));
        const __VLS_42 = __VLS_41({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        let __VLS_46;
        const __VLS_47 = {
            onClick: (...[$event]) => {
                __VLS_ctx.dialogVisible = false;
            }
        };
        let __VLS_43;
        let __VLS_44;
        __VLS_nonNullable(__VLS_45.slots).default;
        var __VLS_45;
        const __VLS_48 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_50 = __VLS_49({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        let __VLS_54;
        const __VLS_55 = {
            onClick: (__VLS_ctx.handleSubmit)
        };
        let __VLS_51;
        let __VLS_52;
        __VLS_nonNullable(__VLS_53.slots).default;
        var __VLS_53;
    }
    var __VLS_5;
    __VLS_styleScopedClasses['w-full'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "formRef": __VLS_15,
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
            dialogVisible: dialogVisible,
            formRef: formRef,
            form: form,
            rules: rules,
            handleClosed: handleClosed,
            handleSubmit: handleSubmit,
        };
    },
    emits: {},
    props: {
        visible: Boolean,
        isEdit: Boolean,
        data: Object,
        courseId: String
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    props: {
        visible: Boolean,
        isEdit: Boolean,
        data: Object,
        courseId: String
    },
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=episode-dialog.vue.js.map