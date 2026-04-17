/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { computed, ref, watch } from 'vue';
import { updateVipPackage } from '@/api/payment/vip';
import { ElMessage } from 'element-plus';
import { Plus, Delete } from '@element-plus/icons-vue';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps();
const emit = defineEmits(['update:modelValue', 'success']);
const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});
const loading = ref(false);
const localBenefits = ref([]);
watch(() => props.packageData, (val) => {
    if (val) {
        const benefits = typeof val.benefits === 'string' ? JSON.parse(val.benefits) : val.benefits;
        localBenefits.value = Array.isArray(benefits) ? [...benefits] : [];
    }
}, { immediate: true });
const addBenefit = () => {
    localBenefits.value.push('');
};
const removeBenefit = (index) => {
    localBenefits.value.splice(index, 1);
};
const handleClose = () => {
    visible.value = false;
};
const handleSubmit = async () => {
    if (localBenefits.value.some((b) => !b.trim())) {
        return ElMessage.warning('权益描述不能为空');
    }
    loading.value = true;
    try {
        const updateData = {
            ...props.packageData,
            benefits: JSON.stringify(localBenefits.value)
        };
        await updateVipPackage(updateData);
        ElMessage.success('权益更新成功');
        emit('success');
        visible.value = false;
    }
    catch (error) {
        console.error('Failed to update benefits:', error);
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
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onClose': {} }, title: ((`编辑权益 - ${__VLS_ctx.packageData?.title}`)), modelValue: ((__VLS_ctx.visible)), width: ("500px"), }));
    const __VLS_2 = __VLS_1({ ...{ 'onClose': {} }, title: ((`编辑权益 - ${__VLS_ctx.packageData?.title}`)), modelValue: ((__VLS_ctx.visible)), width: ("500px"), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_6 = {};
    let __VLS_7;
    const __VLS_8 = {
        onClose: (__VLS_ctx.handleClose)
    };
    let __VLS_3;
    let __VLS_4;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("benefits-edit") }, });
    for (const [benefit, index] of __VLS_getVForSourceType((__VLS_ctx.localBenefits))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ key: ((index)), ...{ class: ("flex items-center mb-3") }, });
        const __VLS_9 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
        // @ts-ignore
        const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({ modelValue: ((__VLS_ctx.localBenefits[index])), placeholder: ("请输入权益描述"), ...{ class: ("flex-1") }, }));
        const __VLS_11 = __VLS_10({ modelValue: ((__VLS_ctx.localBenefits[index])), placeholder: ("请输入权益描述"), ...{ class: ("flex-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_10));
        const __VLS_15 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({ ...{ 'onClick': {} }, type: ("danger"), icon: ((__VLS_ctx.Delete)), circle: (true), link: (true), ...{ class: ("ml-2 flex-shrink-0") }, }));
        const __VLS_17 = __VLS_16({ ...{ 'onClick': {} }, type: ("danger"), icon: ((__VLS_ctx.Delete)), circle: (true), link: (true), ...{ class: ("ml-2 flex-shrink-0") }, }, ...__VLS_functionalComponentArgsRest(__VLS_16));
        let __VLS_21;
        const __VLS_22 = {
            onClick: (...[$event]) => {
                __VLS_ctx.removeBenefit(index);
            }
        };
        let __VLS_18;
        let __VLS_19;
        var __VLS_20;
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex items-center mt-2") }, });
    const __VLS_23 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_24 = __VLS_asFunctionalComponent(__VLS_23, new __VLS_23({ ...{ 'onClick': {} }, type: ("primary"), icon: ((__VLS_ctx.Plus)), plain: (true), ...{ class: ("flex-1") }, }));
    const __VLS_25 = __VLS_24({ ...{ 'onClick': {} }, type: ("primary"), icon: ((__VLS_ctx.Plus)), plain: (true), ...{ class: ("flex-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_24));
    let __VLS_29;
    const __VLS_30 = {
        onClick: (__VLS_ctx.addBenefit)
    };
    let __VLS_26;
    let __VLS_27;
    __VLS_nonNullable(__VLS_28.slots).default;
    var __VLS_28;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("ml-2 w-[32px] flex-shrink-0") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("dialog-footer") }, });
        const __VLS_31 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({ ...{ 'onClick': {} }, }));
        const __VLS_33 = __VLS_32({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_32));
        let __VLS_37;
        const __VLS_38 = {
            onClick: (...[$event]) => {
                __VLS_ctx.visible = false;
            }
        };
        let __VLS_34;
        let __VLS_35;
        __VLS_nonNullable(__VLS_36.slots).default;
        var __VLS_36;
        const __VLS_39 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.loading)), }));
        const __VLS_41 = __VLS_40({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.loading)), }, ...__VLS_functionalComponentArgsRest(__VLS_40));
        let __VLS_45;
        const __VLS_46 = {
            onClick: (__VLS_ctx.handleSubmit)
        };
        let __VLS_42;
        let __VLS_43;
        __VLS_nonNullable(__VLS_44.slots).default;
        var __VLS_44;
    }
    var __VLS_5;
    __VLS_styleScopedClasses['benefits-edit'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['mb-3'];
    __VLS_styleScopedClasses['flex-1'];
    __VLS_styleScopedClasses['ml-2'];
    __VLS_styleScopedClasses['flex-shrink-0'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['mt-2'];
    __VLS_styleScopedClasses['flex-1'];
    __VLS_styleScopedClasses['ml-2'];
    __VLS_styleScopedClasses['w-[32px]'];
    __VLS_styleScopedClasses['flex-shrink-0'];
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
            Plus: Plus,
            Delete: Delete,
            visible: visible,
            loading: loading,
            localBenefits: localBenefits,
            addBenefit: addBenefit,
            removeBenefit: removeBenefit,
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
//# sourceMappingURL=benefits-dialog.vue.js.map