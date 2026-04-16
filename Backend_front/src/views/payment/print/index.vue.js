/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { fetchPrintConfig, updatePaperPrices, updateDeliveryConfig, deleteDeliveryConfig } from '@/api/payment/print';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Document, Van, Plus, Delete, InfoFilled, QuestionFilled } from '@element-plus/icons-vue';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const loading = ref(false);
const config = reactive({
    paperPrices: [],
    deliveryConfigs: []
});
const getList = async () => {
    loading.value = true;
    try {
        const data = await fetchPrintConfig();
        Object.assign(config, data);
    }
    finally {
        loading.value = false;
    }
};
const handleUpdatePaper = async () => {
    try {
        loading.value = true;
        await updatePaperPrices(config.paperPrices);
        ElMessage.success('纸张价格配置已更新');
        getList();
    }
    finally {
        loading.value = false;
    }
};
const handleAddDelivery = () => {
    config.deliveryConfigs.push({
        name: '',
        price: 0,
        freeLimit: 0,
        description: ''
    });
};
const handleDeleteDelivery = async (index, row) => {
    if (!row.id) {
        config.deliveryConfigs.splice(index, 1);
        return;
    }
    try {
        await ElMessageBox.confirm('确认删除该配送方式吗？', '提示', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning'
        });
        loading.value = true;
        await deleteDeliveryConfig(row.id);
        ElMessage.success('配送方式已删除');
        getList();
    }
    catch (e) {
        // 用户取消删除
    }
    finally {
        loading.value = false;
    }
};
const handleUpdateDelivery = async () => {
    try {
        // 简单校验
        if (config.deliveryConfigs.some(d => !d.name)) {
            ElMessage.warning('请输入配送方式名称');
            return;
        }
        loading.value = true;
        await updateDeliveryConfig(config.deliveryConfigs);
        ElMessage.success('配送费用配置已更新');
        getList();
    }
    finally {
        loading.value = false;
    }
};
onMounted(() => {
    getList();
}); /* PartiallyEnd: #3632/scriptSetup.vue */
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
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("print-config-container p-5") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("page-header mb-5 flex justify-between items-center bg-white p-5 rounded-lg shadow-sm") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("left") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({ ...{ class: ("text-xl font-bold text-gray-800") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("text-sm text-gray-500 mt-1") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onClick': {} }, type: ("primary"), icon: ("Refresh"), }));
    const __VLS_2 = __VLS_1({ ...{ 'onClick': {} }, type: ("primary"), icon: ("Refresh"), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_6;
    const __VLS_7 = {
        onClick: (__VLS_ctx.getList)
    };
    let __VLS_3;
    let __VLS_4;
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    const __VLS_8 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({ gutter: ((20)), }));
    const __VLS_10 = __VLS_9({ gutter: ((20)), }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ span: ((18)), }));
    const __VLS_16 = __VLS_15({ span: ((18)), }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    const __VLS_20 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({ ...{ class: ("mb-5 shadow-sm") }, }));
    const __VLS_22 = __VLS_21({ ...{ class: ("mb-5 shadow-sm") }, }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { header: __VLS_thisSlot } = __VLS_nonNullable(__VLS_25.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("card-header flex justify-between items-center") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("font-bold flex items-center") }, });
        const __VLS_26 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({ ...{ class: ("mr-2 text-blue-500") }, }));
        const __VLS_28 = __VLS_27({ ...{ class: ("mr-2 text-blue-500") }, }, ...__VLS_functionalComponentArgsRest(__VLS_27));
        const __VLS_32 = __VLS_resolvedLocalAndGlobalComponents.Document;
        /** @type { [typeof __VLS_components.Document, ] } */
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({}));
        const __VLS_34 = __VLS_33({}, ...__VLS_functionalComponentArgsRest(__VLS_33));
        __VLS_nonNullable(__VLS_31.slots).default;
        var __VLS_31;
        const __VLS_38 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({ ...{ 'onClick': {} }, type: ("primary"), link: (true), }));
        const __VLS_40 = __VLS_39({ ...{ 'onClick': {} }, type: ("primary"), link: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_39));
        let __VLS_44;
        const __VLS_45 = {
            onClick: (__VLS_ctx.handleUpdatePaper)
        };
        let __VLS_41;
        let __VLS_42;
        __VLS_nonNullable(__VLS_43.slots).default;
        var __VLS_43;
    }
    const __VLS_46 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
    // @ts-ignore
    const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({ data: ((__VLS_ctx.config.paperPrices)), border: (true), stripe: (true), ...{ style: ({}) }, }));
    const __VLS_48 = __VLS_47({ data: ((__VLS_ctx.config.paperPrices)), border: (true), stripe: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_47));
    const __VLS_52 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({ prop: ("type"), label: ("纸张规格"), width: ("100"), align: ("center"), }));
    const __VLS_54 = __VLS_53({ prop: ("type"), label: ("纸张规格"), width: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_57.slots);
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_58 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
        /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
        // @ts-ignore
        const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({ size: ("small"), }));
        const __VLS_60 = __VLS_59({ size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_59));
        (scope.row.type);
        __VLS_nonNullable(__VLS_63.slots).default;
        var __VLS_63;
    }
    var __VLS_57;
    const __VLS_64 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({ prop: ("side"), label: ("单/双面"), width: ("100"), align: ("center"), }));
    const __VLS_66 = __VLS_65({ prop: ("side"), label: ("单/双面"), width: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    const __VLS_70 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({ prop: ("color"), label: ("颜色"), width: ("100"), align: ("center"), }));
    const __VLS_72 = __VLS_71({ prop: ("color"), label: ("颜色"), width: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_71));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_75.slots);
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_76 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
        /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
        // @ts-ignore
        const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({ type: ((scope.row.color === '彩色' ? 'danger' : 'info')), size: ("small"), }));
        const __VLS_78 = __VLS_77({ type: ((scope.row.color === '彩色' ? 'danger' : 'info')), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_77));
        (scope.row.color);
        __VLS_nonNullable(__VLS_81.slots).default;
        var __VLS_81;
    }
    var __VLS_75;
    const __VLS_82 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({ label: ("单价(元/张)"), align: ("center"), }));
    const __VLS_84 = __VLS_83({ label: ("单价(元/张)"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_83));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_87.slots);
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_88 = __VLS_resolvedLocalAndGlobalComponents.ElInputNumber;
        /** @type { [typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ] } */
        // @ts-ignore
        const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({ modelValue: ((scope.row.price)), precision: ((2)), step: ((0.05)), min: ((0)), size: ("small"), }));
        const __VLS_90 = __VLS_89({ modelValue: ((scope.row.price)), precision: ((2)), step: ((0.05)), min: ((0)), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    }
    var __VLS_87;
    const __VLS_94 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({ label: ("起印数量"), align: ("center"), width: ("120"), }));
    const __VLS_96 = __VLS_95({ label: ("起印数量"), align: ("center"), width: ("120"), }, ...__VLS_functionalComponentArgsRest(__VLS_95));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_99.slots);
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_100 = __VLS_resolvedLocalAndGlobalComponents.ElInputNumber;
        /** @type { [typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ] } */
        // @ts-ignore
        const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({ modelValue: ((scope.row.minQuantity)), min: ((1)), size: ("small"), ...{ style: ({}) }, }));
        const __VLS_102 = __VLS_101({ modelValue: ((scope.row.minQuantity)), min: ((1)), size: ("small"), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    }
    var __VLS_99;
    __VLS_nonNullable(__VLS_51.slots).default;
    var __VLS_51;
    var __VLS_25;
    const __VLS_106 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({ ...{ class: ("shadow-sm") }, }));
    const __VLS_108 = __VLS_107({ ...{ class: ("shadow-sm") }, }, ...__VLS_functionalComponentArgsRest(__VLS_107));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { header: __VLS_thisSlot } = __VLS_nonNullable(__VLS_111.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("card-header flex justify-between items-center") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("font-bold flex items-center") }, });
        const __VLS_112 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({ ...{ class: ("mr-2 text-orange-500") }, }));
        const __VLS_114 = __VLS_113({ ...{ class: ("mr-2 text-orange-500") }, }, ...__VLS_functionalComponentArgsRest(__VLS_113));
        const __VLS_118 = __VLS_resolvedLocalAndGlobalComponents.Van;
        /** @type { [typeof __VLS_components.Van, ] } */
        // @ts-ignore
        const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({}));
        const __VLS_120 = __VLS_119({}, ...__VLS_functionalComponentArgsRest(__VLS_119));
        __VLS_nonNullable(__VLS_117.slots).default;
        var __VLS_117;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("actions") }, });
        const __VLS_124 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({ ...{ 'onClick': {} }, type: ("success"), link: (true), icon: ((__VLS_ctx.Plus)), }));
        const __VLS_126 = __VLS_125({ ...{ 'onClick': {} }, type: ("success"), link: (true), icon: ((__VLS_ctx.Plus)), }, ...__VLS_functionalComponentArgsRest(__VLS_125));
        let __VLS_130;
        const __VLS_131 = {
            onClick: (__VLS_ctx.handleAddDelivery)
        };
        let __VLS_127;
        let __VLS_128;
        __VLS_nonNullable(__VLS_129.slots).default;
        var __VLS_129;
        const __VLS_132 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({ ...{ 'onClick': {} }, type: ("primary"), link: (true), ...{ style: ({}) }, }));
        const __VLS_134 = __VLS_133({ ...{ 'onClick': {} }, type: ("primary"), link: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_133));
        let __VLS_138;
        const __VLS_139 = {
            onClick: (__VLS_ctx.handleUpdateDelivery)
        };
        let __VLS_135;
        let __VLS_136;
        __VLS_nonNullable(__VLS_137.slots).default;
        var __VLS_137;
    }
    const __VLS_140 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
    // @ts-ignore
    const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({ data: ((__VLS_ctx.config.deliveryConfigs)), border: (true), stripe: (true), ...{ style: ({}) }, }));
    const __VLS_142 = __VLS_141({ data: ((__VLS_ctx.config.deliveryConfigs)), border: (true), stripe: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_141));
    const __VLS_146 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({ prop: ("name"), label: ("配送方式"), width: ("150"), align: ("center"), }));
    const __VLS_148 = __VLS_147({ prop: ("name"), label: ("配送方式"), width: ("150"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_147));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_151.slots);
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_152 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
        // @ts-ignore
        const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({ modelValue: ((scope.row.name)), size: ("small"), placeholder: ("如：标准快递"), }));
        const __VLS_154 = __VLS_153({ modelValue: ((scope.row.name)), size: ("small"), placeholder: ("如：标准快递"), }, ...__VLS_functionalComponentArgsRest(__VLS_153));
    }
    var __VLS_151;
    const __VLS_158 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158({ label: ("基础运费(元)"), width: ("150"), align: ("center"), }));
    const __VLS_160 = __VLS_159({ label: ("基础运费(元)"), width: ("150"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_159));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_163.slots);
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_164 = __VLS_resolvedLocalAndGlobalComponents.ElInputNumber;
        /** @type { [typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ] } */
        // @ts-ignore
        const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({ modelValue: ((scope.row.price)), precision: ((2)), step: ((1)), min: ((0)), size: ("small"), }));
        const __VLS_166 = __VLS_165({ modelValue: ((scope.row.price)), precision: ((2)), step: ((1)), min: ((0)), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_165));
    }
    var __VLS_163;
    const __VLS_170 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_171 = __VLS_asFunctionalComponent(__VLS_170, new __VLS_170({ label: ("免运费额度(元)"), width: ("150"), align: ("center"), }));
    const __VLS_172 = __VLS_171({ label: ("免运费额度(元)"), width: ("150"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_171));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_175.slots);
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_176 = __VLS_resolvedLocalAndGlobalComponents.ElInputNumber;
        /** @type { [typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ] } */
        // @ts-ignore
        const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({ modelValue: ((scope.row.freeLimit)), precision: ((2)), step: ((10)), min: ((0)), size: ("small"), }));
        const __VLS_178 = __VLS_177({ modelValue: ((scope.row.freeLimit)), precision: ((2)), step: ((10)), min: ((0)), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_177));
    }
    var __VLS_175;
    const __VLS_182 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_183 = __VLS_asFunctionalComponent(__VLS_182, new __VLS_182({ prop: ("description"), label: ("描述说明"), showOverflowTooltip: ((true)), }));
    const __VLS_184 = __VLS_183({ prop: ("description"), label: ("描述说明"), showOverflowTooltip: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_183));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_187.slots);
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_188 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
        // @ts-ignore
        const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({ modelValue: ((scope.row.description)), size: ("small"), }));
        const __VLS_190 = __VLS_189({ modelValue: ((scope.row.description)), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_189));
    }
    var __VLS_187;
    const __VLS_194 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_195 = __VLS_asFunctionalComponent(__VLS_194, new __VLS_194({ label: ("操作"), width: ("80"), align: ("center"), }));
    const __VLS_196 = __VLS_195({ label: ("操作"), width: ("80"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_195));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_199.slots);
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_200 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({ ...{ 'onClick': {} }, type: ("danger"), link: (true), icon: ((__VLS_ctx.Delete)), }));
        const __VLS_202 = __VLS_201({ ...{ 'onClick': {} }, type: ("danger"), link: (true), icon: ((__VLS_ctx.Delete)), }, ...__VLS_functionalComponentArgsRest(__VLS_201));
        let __VLS_206;
        const __VLS_207 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleDeleteDelivery(scope.$index, scope.row);
            }
        };
        let __VLS_203;
        let __VLS_204;
        __VLS_nonNullable(__VLS_205.slots).default;
        var __VLS_205;
    }
    var __VLS_199;
    __VLS_nonNullable(__VLS_145.slots).default;
    var __VLS_145;
    var __VLS_111;
    __VLS_nonNullable(__VLS_19.slots).default;
    var __VLS_19;
    const __VLS_208 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({ span: ((6)), }));
    const __VLS_210 = __VLS_209({ span: ((6)), }, ...__VLS_functionalComponentArgsRest(__VLS_209));
    const __VLS_214 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_215 = __VLS_asFunctionalComponent(__VLS_214, new __VLS_214({ ...{ class: ("shadow-sm info-card") }, }));
    const __VLS_216 = __VLS_215({ ...{ class: ("shadow-sm info-card") }, }, ...__VLS_functionalComponentArgsRest(__VLS_215));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { header: __VLS_thisSlot } = __VLS_nonNullable(__VLS_219.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("font-bold flex items-center") }, });
        const __VLS_220 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({ ...{ class: ("mr-2 text-info") }, }));
        const __VLS_222 = __VLS_221({ ...{ class: ("mr-2 text-info") }, }, ...__VLS_functionalComponentArgsRest(__VLS_221));
        const __VLS_226 = __VLS_resolvedLocalAndGlobalComponents.InfoFilled;
        /** @type { [typeof __VLS_components.InfoFilled, ] } */
        // @ts-ignore
        const __VLS_227 = __VLS_asFunctionalComponent(__VLS_226, new __VLS_226({}));
        const __VLS_228 = __VLS_227({}, ...__VLS_functionalComponentArgsRest(__VLS_227));
        __VLS_nonNullable(__VLS_225.slots).default;
        var __VLS_225;
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("tip-content") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("mb-3 text-gray-600 leading-6") }, });
    const __VLS_232 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
    /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
    // @ts-ignore
    const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({ size: ("small"), type: ("success"), ...{ class: ("mr-1") }, }));
    const __VLS_234 = __VLS_233({ size: ("small"), type: ("success"), ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_233));
    __VLS_nonNullable(__VLS_237.slots).default;
    var __VLS_237;
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("mb-3 text-gray-600 leading-6") }, });
    const __VLS_238 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
    /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
    // @ts-ignore
    const __VLS_239 = __VLS_asFunctionalComponent(__VLS_238, new __VLS_238({ size: ("small"), type: ("warning"), ...{ class: ("mr-1") }, }));
    const __VLS_240 = __VLS_239({ size: ("small"), type: ("warning"), ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_239));
    __VLS_nonNullable(__VLS_243.slots).default;
    var __VLS_243;
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("text-gray-600 leading-6") }, });
    const __VLS_244 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
    /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
    // @ts-ignore
    const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({ size: ("small"), type: ("danger"), ...{ class: ("mr-1") }, }));
    const __VLS_246 = __VLS_245({ size: ("small"), type: ("danger"), ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_245));
    __VLS_nonNullable(__VLS_249.slots).default;
    var __VLS_249;
    var __VLS_219;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-5 p-4 bg-blue-50 rounded-lg border border-blue-100 text-blue-700 text-sm") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("font-bold mb-2 flex items-center") }, });
    const __VLS_250 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
    /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
    // @ts-ignore
    const __VLS_251 = __VLS_asFunctionalComponent(__VLS_250, new __VLS_250({ ...{ class: ("mr-1") }, }));
    const __VLS_252 = __VLS_251({ ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_251));
    const __VLS_256 = __VLS_resolvedLocalAndGlobalComponents.QuestionFilled;
    /** @type { [typeof __VLS_components.QuestionFilled, ] } */
    // @ts-ignore
    const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({}));
    const __VLS_258 = __VLS_257({}, ...__VLS_functionalComponentArgsRest(__VLS_257));
    __VLS_nonNullable(__VLS_255.slots).default;
    var __VLS_255;
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_nonNullable(__VLS_213.slots).default;
    var __VLS_213;
    __VLS_nonNullable(__VLS_13.slots).default;
    var __VLS_13;
    __VLS_styleScopedClasses['print-config-container'];
    __VLS_styleScopedClasses['p-5'];
    __VLS_styleScopedClasses['page-header'];
    __VLS_styleScopedClasses['mb-5'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['bg-white'];
    __VLS_styleScopedClasses['p-5'];
    __VLS_styleScopedClasses['rounded-lg'];
    __VLS_styleScopedClasses['shadow-sm'];
    __VLS_styleScopedClasses['left'];
    __VLS_styleScopedClasses['text-xl'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['text-gray-800'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['text-gray-500'];
    __VLS_styleScopedClasses['mt-1'];
    __VLS_styleScopedClasses['mb-5'];
    __VLS_styleScopedClasses['shadow-sm'];
    __VLS_styleScopedClasses['card-header'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['mr-2'];
    __VLS_styleScopedClasses['text-blue-500'];
    __VLS_styleScopedClasses['shadow-sm'];
    __VLS_styleScopedClasses['card-header'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['mr-2'];
    __VLS_styleScopedClasses['text-orange-500'];
    __VLS_styleScopedClasses['actions'];
    __VLS_styleScopedClasses['shadow-sm'];
    __VLS_styleScopedClasses['info-card'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['mr-2'];
    __VLS_styleScopedClasses['text-info'];
    __VLS_styleScopedClasses['tip-content'];
    __VLS_styleScopedClasses['mb-3'];
    __VLS_styleScopedClasses['text-gray-600'];
    __VLS_styleScopedClasses['leading-6'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['mb-3'];
    __VLS_styleScopedClasses['text-gray-600'];
    __VLS_styleScopedClasses['leading-6'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['text-gray-600'];
    __VLS_styleScopedClasses['leading-6'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['mt-5'];
    __VLS_styleScopedClasses['p-4'];
    __VLS_styleScopedClasses['bg-blue-50'];
    __VLS_styleScopedClasses['rounded-lg'];
    __VLS_styleScopedClasses['border'];
    __VLS_styleScopedClasses['border-blue-100'];
    __VLS_styleScopedClasses['text-blue-700'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['mb-2'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['mr-1'];
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
            Document: Document,
            Van: Van,
            Plus: Plus,
            Delete: Delete,
            InfoFilled: InfoFilled,
            QuestionFilled: QuestionFilled,
            config: config,
            getList: getList,
            handleUpdatePaper: handleUpdatePaper,
            handleAddDelivery: handleAddDelivery,
            handleDeleteDelivery: handleDeleteDelivery,
            handleUpdateDelivery: handleUpdateDelivery,
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