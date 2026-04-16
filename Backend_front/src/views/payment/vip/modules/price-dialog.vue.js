/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { updatePackagePrice } from '@/api/payment/vip';
import { ElMessage } from 'element-plus';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps();
const emit = defineEmits(['update:modelValue', 'success']);
const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});
const loading = ref(false);
const localPrices = ref([]);
watch(() => props.packageData, (val) => {
    if (val && val.pricings) {
        localPrices.value = JSON.parse(JSON.stringify(val.pricings));
    }
}, { immediate: true });
const handleClose = () => {
    visible.value = false;
};
const handleSubmit = async () => {
    loading.value = true;
    try {
        // 遍历更新每一个套餐价格
        for (const item of localPrices.value) {
            // 确保字段名正确
            await updatePackagePrice(item);
        }
        ElMessage.success('价格更新成功');
        emit('success');
        visible.value = false;
    }
    catch (error) {
        console.error('Failed to update prices:', error);
        ElMessage.error('价格更新失败，请检查网络');
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
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onClose': {} }, title: ((`价格设置 - ${__VLS_ctx.packageData?.title}`)), modelValue: ((__VLS_ctx.visible)), width: ("600px"), }));
    const __VLS_2 = __VLS_1({ ...{ 'onClose': {} }, title: ((`价格设置 - ${__VLS_ctx.packageData?.title}`)), modelValue: ((__VLS_ctx.visible)), width: ("600px"), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_6 = {};
    let __VLS_7;
    const __VLS_8 = {
        onClose: (__VLS_ctx.handleClose)
    };
    let __VLS_3;
    let __VLS_4;
    const __VLS_9 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({ data: ((__VLS_ctx.localPrices)), border: (true), ...{ style: ({}) }, }));
    const __VLS_11 = __VLS_10({ data: ((__VLS_ctx.localPrices)), border: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    const __VLS_15 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({ prop: ("pkgName"), label: ("套餐名称"), width: ("150"), align: ("center"), }));
    const __VLS_17 = __VLS_16({ prop: ("pkgName"), label: ("套餐名称"), width: ("150"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    const __VLS_21 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({ label: ("现价(元)"), align: ("center"), }));
    const __VLS_23 = __VLS_22({ label: ("现价(元)"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_26.slots);
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_27 = __VLS_resolvedLocalAndGlobalComponents.ElInputNumber;
        /** @type { [typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ] } */
        // @ts-ignore
        const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({ modelValue: ((scope.row.currentPrice)), precision: ((2)), step: ((10)), min: ((0)), ...{ style: ({}) }, }));
        const __VLS_29 = __VLS_28({ modelValue: ((scope.row.currentPrice)), precision: ((2)), step: ((10)), min: ((0)), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    }
    var __VLS_26;
    const __VLS_33 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({ label: ("原价(元)"), align: ("center"), }));
    const __VLS_35 = __VLS_34({ label: ("原价(元)"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_38.slots);
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_39 = __VLS_resolvedLocalAndGlobalComponents.ElInputNumber;
        /** @type { [typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ] } */
        // @ts-ignore
        const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({ modelValue: ((scope.row.originalPrice)), precision: ((2)), step: ((10)), min: ((0)), ...{ style: ({}) }, }));
        const __VLS_41 = __VLS_40({ modelValue: ((scope.row.originalPrice)), precision: ((2)), step: ((10)), min: ((0)), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_40));
    }
    var __VLS_38;
    __VLS_nonNullable(__VLS_14.slots).default;
    var __VLS_14;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("dialog-footer") }, });
        const __VLS_45 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({ ...{ 'onClick': {} }, }));
        const __VLS_47 = __VLS_46({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_46));
        let __VLS_51;
        const __VLS_52 = {
            onClick: (...[$event]) => {
                __VLS_ctx.visible = false;
            }
        };
        let __VLS_48;
        let __VLS_49;
        __VLS_nonNullable(__VLS_50.slots).default;
        var __VLS_50;
        const __VLS_53 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.loading)), }));
        const __VLS_55 = __VLS_54({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.loading)), }, ...__VLS_functionalComponentArgsRest(__VLS_54));
        let __VLS_59;
        const __VLS_60 = {
            onClick: (__VLS_ctx.handleSubmit)
        };
        let __VLS_56;
        let __VLS_57;
        __VLS_nonNullable(__VLS_58.slots).default;
        var __VLS_58;
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
            localPrices: localPrices,
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
//# sourceMappingURL=price-dialog.vue.js.map