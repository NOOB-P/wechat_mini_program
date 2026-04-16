/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { fetchVipOrderList } from '@/api/order';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const text = {
    orderNo: '\u8ba2\u5355\u53f7',
    orderNoPlaceholder: '\u8bf7\u8f93\u5165\u8ba2\u5355\u53f7',
    userName: '\u7528\u6237\u540d',
    userNamePlaceholder: '\u8bf7\u8f93\u5165\u7528\u6237\u540d',
    userInfo: '\u7528\u6237\u4fe1\u606f',
    userPhone: '\u624b\u673a\u53f7',
    packageType: '\u5957\u9910\u7c7b\u578b',
    period: '\u8d2d\u4e70\u5468\u671f',
    sourceType: '\u5f00\u901a\u6765\u6e90',
    price: '\u8ba2\u5355\u91d1\u989d',
    paymentMethod: '\u652f\u4ed8\u65b9\u5f0f',
    paymentStatus: '\u652f\u4ed8\u72b6\u6001',
    createTime: '\u4e0b\u5355\u65f6\u95f4',
    updateTime: '\u66f4\u65b0\u65f6\u95f4',
    action: '\u64cd\u4f5c',
    search: '\u67e5\u8be2',
    reset: '\u91cd\u7f6e',
    detail: '\u8be6\u60c5',
    detailTitle: '\u8ba2\u5355\u8be6\u60c5',
    close: '\u5173\u95ed',
    pending: '\u5f85\u652f\u4ed8',
    paid: '\u5df2\u652f\u4ed8',
    refunded: '\u5df2\u9000\u6b3e',
    onlinePurchase: '\u5728\u7ebf\u8d2d\u4e70',
    schoolGift: '\u6821\u8baf\u901a\u8d60\u9001',
    loadFailed: '\u83b7\u53d6 VIP \u8ba2\u5355\u5217\u8868\u5931\u8d25'
};
const moneySymbol = '\uFFE5';
const loading = ref(false);
const orderList = ref([]);
const total = ref(0);
const detailVisible = ref(false);
const currentOrder = ref({});
const queryParams = reactive({
    current: 1,
    size: 10,
    orderNo: '',
    userName: '',
    paymentStatus: undefined
});
const sourceMetaMap = {
    ONLINE_PURCHASE: {
        label: text.onlinePurchase,
        type: 'success'
    },
    SCHOOL_GIFT: {
        label: text.schoolGift,
        type: 'warning'
    }
};
const getList = async () => {
    loading.value = true;
    try {
        const res = await fetchVipOrderList(queryParams);
        const data = res?.data || res || {};
        orderList.value = Array.isArray(data.records) ? data.records : [];
        total.value = Number(data.total || 0);
    }
    catch (error) {
        console.error('fetch vip orders failed:', error);
        ElMessage.error(text.loadFailed);
    }
    finally {
        loading.value = false;
    }
};
const handleQuery = () => {
    queryParams.current = 1;
    getList();
};
const resetQuery = () => {
    queryParams.orderNo = '';
    queryParams.userName = '';
    queryParams.paymentStatus = undefined;
    handleQuery();
};
const handleDetail = (row) => {
    currentOrder.value = { ...row };
    detailVisible.value = true;
};
const getPeriodTag = (period) => {
    if (!period) {
        return 'info';
    }
    if (period.includes('\u5e74')) {
        return 'warning';
    }
    if (period.includes('\u5b63')) {
        return 'success';
    }
    return 'info';
};
const getSourceMeta = (sourceType) => {
    return sourceMetaMap[sourceType || 'ONLINE_PURCHASE'] || sourceMetaMap.ONLINE_PURCHASE;
};
const getStatusTag = (status) => {
    switch (status) {
        case 1:
            return 'success';
        case 2:
            return 'danger';
        default:
            return 'info';
    }
};
const getStatusText = (status) => {
    switch (status) {
        case 1:
            return text.paid;
        case 2:
            return text.refunded;
        default:
            return text.pending;
    }
};
const formatPrice = (price) => {
    const numericPrice = Number(price ?? 0);
    return Number.isNaN(numericPrice) ? '0.00' : numericPrice.toFixed(2);
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
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("vip-order-container p-5") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("search-wrapper bg-white p-5 rounded-lg mb-5 shadow-sm") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ref: ("queryFormRef"), model: ((__VLS_ctx.queryParams)), inline: ((true)), }));
    const __VLS_2 = __VLS_1({ ref: ("queryFormRef"), model: ((__VLS_ctx.queryParams)), inline: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    // @ts-ignore navigation for `const queryFormRef = ref()`
    __VLS_ctx.queryFormRef;
    var __VLS_6 = {};
    const __VLS_7 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({ label: ((__VLS_ctx.text.orderNo)), prop: ("orderNo"), }));
    const __VLS_9 = __VLS_8({ label: ((__VLS_ctx.text.orderNo)), prop: ("orderNo"), }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    const __VLS_13 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({ modelValue: ((__VLS_ctx.queryParams.orderNo)), placeholder: ((__VLS_ctx.text.orderNoPlaceholder)), clearable: (true), ...{ style: ({}) }, }));
    const __VLS_15 = __VLS_14({ modelValue: ((__VLS_ctx.queryParams.orderNo)), placeholder: ((__VLS_ctx.text.orderNoPlaceholder)), clearable: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    __VLS_nonNullable(__VLS_12.slots).default;
    var __VLS_12;
    const __VLS_19 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({ label: ((__VLS_ctx.text.userName)), prop: ("userName"), }));
    const __VLS_21 = __VLS_20({ label: ((__VLS_ctx.text.userName)), prop: ("userName"), }, ...__VLS_functionalComponentArgsRest(__VLS_20));
    const __VLS_25 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({ modelValue: ((__VLS_ctx.queryParams.userName)), placeholder: ((__VLS_ctx.text.userNamePlaceholder)), clearable: (true), ...{ style: ({}) }, }));
    const __VLS_27 = __VLS_26({ modelValue: ((__VLS_ctx.queryParams.userName)), placeholder: ((__VLS_ctx.text.userNamePlaceholder)), clearable: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    __VLS_nonNullable(__VLS_24.slots).default;
    var __VLS_24;
    const __VLS_31 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({ label: ((__VLS_ctx.text.paymentStatus)), prop: ("paymentStatus"), }));
    const __VLS_33 = __VLS_32({ label: ((__VLS_ctx.text.paymentStatus)), prop: ("paymentStatus"), }, ...__VLS_functionalComponentArgsRest(__VLS_32));
    const __VLS_37 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
    /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({ modelValue: ((__VLS_ctx.queryParams.paymentStatus)), placeholder: ((__VLS_ctx.text.paymentStatus)), clearable: (true), ...{ style: ({}) }, }));
    const __VLS_39 = __VLS_38({ modelValue: ((__VLS_ctx.queryParams.paymentStatus)), placeholder: ((__VLS_ctx.text.paymentStatus)), clearable: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    const __VLS_43 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({ label: ((__VLS_ctx.text.pending)), value: ((0)), }));
    const __VLS_45 = __VLS_44({ label: ((__VLS_ctx.text.pending)), value: ((0)), }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    const __VLS_49 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({ label: ((__VLS_ctx.text.paid)), value: ((1)), }));
    const __VLS_51 = __VLS_50({ label: ((__VLS_ctx.text.paid)), value: ((1)), }, ...__VLS_functionalComponentArgsRest(__VLS_50));
    const __VLS_55 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({ label: ((__VLS_ctx.text.refunded)), value: ((2)), }));
    const __VLS_57 = __VLS_56({ label: ((__VLS_ctx.text.refunded)), value: ((2)), }, ...__VLS_functionalComponentArgsRest(__VLS_56));
    __VLS_nonNullable(__VLS_42.slots).default;
    var __VLS_42;
    __VLS_nonNullable(__VLS_36.slots).default;
    var __VLS_36;
    const __VLS_61 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({}));
    const __VLS_63 = __VLS_62({}, ...__VLS_functionalComponentArgsRest(__VLS_62));
    const __VLS_67 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({ ...{ 'onClick': {} }, type: ("primary"), icon: ("Search"), }));
    const __VLS_69 = __VLS_68({ ...{ 'onClick': {} }, type: ("primary"), icon: ("Search"), }, ...__VLS_functionalComponentArgsRest(__VLS_68));
    let __VLS_73;
    const __VLS_74 = {
        onClick: (__VLS_ctx.handleQuery)
    };
    let __VLS_70;
    let __VLS_71;
    (__VLS_ctx.text.search);
    __VLS_nonNullable(__VLS_72.slots).default;
    var __VLS_72;
    const __VLS_75 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_76 = __VLS_asFunctionalComponent(__VLS_75, new __VLS_75({ ...{ 'onClick': {} }, icon: ("Refresh"), }));
    const __VLS_77 = __VLS_76({ ...{ 'onClick': {} }, icon: ("Refresh"), }, ...__VLS_functionalComponentArgsRest(__VLS_76));
    let __VLS_81;
    const __VLS_82 = {
        onClick: (__VLS_ctx.resetQuery)
    };
    let __VLS_78;
    let __VLS_79;
    (__VLS_ctx.text.reset);
    __VLS_nonNullable(__VLS_80.slots).default;
    var __VLS_80;
    __VLS_nonNullable(__VLS_66.slots).default;
    var __VLS_66;
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("table-wrapper bg-white p-5 rounded-lg shadow-sm") }, });
    const __VLS_83 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
    // @ts-ignore
    const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({ data: ((__VLS_ctx.orderList)), border: (true), stripe: (true), ...{ style: ({}) }, }));
    const __VLS_85 = __VLS_84({ data: ((__VLS_ctx.orderList)), border: (true), stripe: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_84));
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.loading) }, null, null);
    const __VLS_89 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({ label: ((__VLS_ctx.text.orderNo)), prop: ("orderNo"), minWidth: ("180"), align: ("center"), }));
    const __VLS_91 = __VLS_90({ label: ((__VLS_ctx.text.orderNo)), prop: ("orderNo"), minWidth: ("180"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_90));
    const __VLS_95 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_96 = __VLS_asFunctionalComponent(__VLS_95, new __VLS_95({ label: ((__VLS_ctx.text.userInfo)), minWidth: ("160"), }));
    const __VLS_97 = __VLS_96({ label: ((__VLS_ctx.text.userInfo)), minWidth: ("160"), }, ...__VLS_functionalComponentArgsRest(__VLS_96));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_100.slots);
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("user-info") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("font-bold") }, });
        (scope.row.userName || '-');
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("text-xs text-gray-400") }, });
        (scope.row.userPhone || '-');
    }
    var __VLS_100;
    const __VLS_101 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({ label: ((__VLS_ctx.text.packageType)), prop: ("packageType"), width: ("120"), align: ("center"), }));
    const __VLS_103 = __VLS_102({ label: ((__VLS_ctx.text.packageType)), prop: ("packageType"), width: ("120"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_102));
    const __VLS_107 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_108 = __VLS_asFunctionalComponent(__VLS_107, new __VLS_107({ label: ((__VLS_ctx.text.period)), prop: ("period"), width: ("120"), align: ("center"), }));
    const __VLS_109 = __VLS_108({ label: ((__VLS_ctx.text.period)), prop: ("period"), width: ("120"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_108));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_112.slots);
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_113 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
        /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
        // @ts-ignore
        const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({ type: ((__VLS_ctx.getPeriodTag(scope.row.period))), }));
        const __VLS_115 = __VLS_114({ type: ((__VLS_ctx.getPeriodTag(scope.row.period))), }, ...__VLS_functionalComponentArgsRest(__VLS_114));
        (scope.row.period || '-');
        __VLS_nonNullable(__VLS_118.slots).default;
        var __VLS_118;
    }
    var __VLS_112;
    const __VLS_119 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_120 = __VLS_asFunctionalComponent(__VLS_119, new __VLS_119({ label: ((__VLS_ctx.text.sourceType)), width: ("130"), align: ("center"), }));
    const __VLS_121 = __VLS_120({ label: ((__VLS_ctx.text.sourceType)), width: ("130"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_120));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_124.slots);
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_125 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
        /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
        // @ts-ignore
        const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({ type: ((__VLS_ctx.getSourceMeta(scope.row.sourceType).type)), }));
        const __VLS_127 = __VLS_126({ type: ((__VLS_ctx.getSourceMeta(scope.row.sourceType).type)), }, ...__VLS_functionalComponentArgsRest(__VLS_126));
        (__VLS_ctx.getSourceMeta(scope.row.sourceType).label);
        __VLS_nonNullable(__VLS_130.slots).default;
        var __VLS_130;
    }
    var __VLS_124;
    const __VLS_131 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_132 = __VLS_asFunctionalComponent(__VLS_131, new __VLS_131({ label: ((__VLS_ctx.text.price)), width: ("110"), align: ("center"), }));
    const __VLS_133 = __VLS_132({ label: ((__VLS_ctx.text.price)), width: ("110"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_132));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_136.slots);
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-red-500 font-bold") }, });
        (`${__VLS_ctx.moneySymbol}${__VLS_ctx.formatPrice(scope.row.price)}`);
    }
    var __VLS_136;
    const __VLS_137 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_138 = __VLS_asFunctionalComponent(__VLS_137, new __VLS_137({ label: ((__VLS_ctx.text.paymentMethod)), prop: ("paymentMethod"), width: ("120"), align: ("center"), }));
    const __VLS_139 = __VLS_138({ label: ((__VLS_ctx.text.paymentMethod)), prop: ("paymentMethod"), width: ("120"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_138));
    const __VLS_143 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_144 = __VLS_asFunctionalComponent(__VLS_143, new __VLS_143({ label: ((__VLS_ctx.text.paymentStatus)), width: ("100"), align: ("center"), }));
    const __VLS_145 = __VLS_144({ label: ((__VLS_ctx.text.paymentStatus)), width: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_144));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_148.slots);
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_149 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
        /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
        // @ts-ignore
        const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({ type: ((__VLS_ctx.getStatusTag(scope.row.paymentStatus))), }));
        const __VLS_151 = __VLS_150({ type: ((__VLS_ctx.getStatusTag(scope.row.paymentStatus))), }, ...__VLS_functionalComponentArgsRest(__VLS_150));
        (__VLS_ctx.getStatusText(scope.row.paymentStatus));
        __VLS_nonNullable(__VLS_154.slots).default;
        var __VLS_154;
    }
    var __VLS_148;
    const __VLS_155 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_156 = __VLS_asFunctionalComponent(__VLS_155, new __VLS_155({ label: ((__VLS_ctx.text.createTime)), prop: ("createTime"), width: ("180"), align: ("center"), }));
    const __VLS_157 = __VLS_156({ label: ((__VLS_ctx.text.createTime)), prop: ("createTime"), width: ("180"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_156));
    const __VLS_161 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_162 = __VLS_asFunctionalComponent(__VLS_161, new __VLS_161({ label: ((__VLS_ctx.text.action)), width: ("100"), align: ("center"), fixed: ("right"), }));
    const __VLS_163 = __VLS_162({ label: ((__VLS_ctx.text.action)), width: ("100"), align: ("center"), fixed: ("right"), }, ...__VLS_functionalComponentArgsRest(__VLS_162));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_166.slots);
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_167 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_168 = __VLS_asFunctionalComponent(__VLS_167, new __VLS_167({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }));
        const __VLS_169 = __VLS_168({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_168));
        let __VLS_173;
        const __VLS_174 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleDetail(scope.row);
            }
        };
        let __VLS_170;
        let __VLS_171;
        (__VLS_ctx.text.detail);
        __VLS_nonNullable(__VLS_172.slots).default;
        var __VLS_172;
    }
    var __VLS_166;
    __VLS_nonNullable(__VLS_88.slots).default;
    var __VLS_88;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("pagination-wrapper flex justify-end mt-5") }, });
    const __VLS_175 = __VLS_resolvedLocalAndGlobalComponents.ElPagination;
    /** @type { [typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ] } */
    // @ts-ignore
    const __VLS_176 = __VLS_asFunctionalComponent(__VLS_175, new __VLS_175({ ...{ 'onSizeChange': {} }, ...{ 'onCurrentChange': {} }, currentPage: ((__VLS_ctx.queryParams.current)), pageSize: ((__VLS_ctx.queryParams.size)), pageSizes: (([10, 20, 30, 50])), layout: ("total, sizes, prev, pager, next, jumper"), total: ((__VLS_ctx.total)), }));
    const __VLS_177 = __VLS_176({ ...{ 'onSizeChange': {} }, ...{ 'onCurrentChange': {} }, currentPage: ((__VLS_ctx.queryParams.current)), pageSize: ((__VLS_ctx.queryParams.size)), pageSizes: (([10, 20, 30, 50])), layout: ("total, sizes, prev, pager, next, jumper"), total: ((__VLS_ctx.total)), }, ...__VLS_functionalComponentArgsRest(__VLS_176));
    let __VLS_181;
    const __VLS_182 = {
        onSizeChange: (__VLS_ctx.getList)
    };
    const __VLS_183 = {
        onCurrentChange: (__VLS_ctx.getList)
    };
    let __VLS_178;
    let __VLS_179;
    var __VLS_180;
    const __VLS_184 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */
    // @ts-ignore
    const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({ modelValue: ((__VLS_ctx.detailVisible)), title: ((__VLS_ctx.text.detailTitle)), width: ("600px"), destroyOnClose: (true), }));
    const __VLS_186 = __VLS_185({ modelValue: ((__VLS_ctx.detailVisible)), title: ((__VLS_ctx.text.detailTitle)), width: ("600px"), destroyOnClose: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_185));
    const __VLS_190 = __VLS_resolvedLocalAndGlobalComponents.ElDescriptions;
    /** @type { [typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, ] } */
    // @ts-ignore
    const __VLS_191 = __VLS_asFunctionalComponent(__VLS_190, new __VLS_190({ column: ((1)), border: (true), }));
    const __VLS_192 = __VLS_191({ column: ((1)), border: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_191));
    const __VLS_196 = __VLS_resolvedLocalAndGlobalComponents.ElDescriptionsItem;
    /** @type { [typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ] } */
    // @ts-ignore
    const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({ label: ((__VLS_ctx.text.orderNo)), }));
    const __VLS_198 = __VLS_197({ label: ((__VLS_ctx.text.orderNo)), }, ...__VLS_functionalComponentArgsRest(__VLS_197));
    (__VLS_ctx.currentOrder.orderNo || '-');
    __VLS_nonNullable(__VLS_201.slots).default;
    var __VLS_201;
    const __VLS_202 = __VLS_resolvedLocalAndGlobalComponents.ElDescriptionsItem;
    /** @type { [typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ] } */
    // @ts-ignore
    const __VLS_203 = __VLS_asFunctionalComponent(__VLS_202, new __VLS_202({ label: ((__VLS_ctx.text.userName)), }));
    const __VLS_204 = __VLS_203({ label: ((__VLS_ctx.text.userName)), }, ...__VLS_functionalComponentArgsRest(__VLS_203));
    (__VLS_ctx.currentOrder.userName || '-');
    __VLS_nonNullable(__VLS_207.slots).default;
    var __VLS_207;
    const __VLS_208 = __VLS_resolvedLocalAndGlobalComponents.ElDescriptionsItem;
    /** @type { [typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ] } */
    // @ts-ignore
    const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({ label: ((__VLS_ctx.text.userPhone)), }));
    const __VLS_210 = __VLS_209({ label: ((__VLS_ctx.text.userPhone)), }, ...__VLS_functionalComponentArgsRest(__VLS_209));
    (__VLS_ctx.currentOrder.userPhone || '-');
    __VLS_nonNullable(__VLS_213.slots).default;
    var __VLS_213;
    const __VLS_214 = __VLS_resolvedLocalAndGlobalComponents.ElDescriptionsItem;
    /** @type { [typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ] } */
    // @ts-ignore
    const __VLS_215 = __VLS_asFunctionalComponent(__VLS_214, new __VLS_214({ label: ((__VLS_ctx.text.packageType)), }));
    const __VLS_216 = __VLS_215({ label: ((__VLS_ctx.text.packageType)), }, ...__VLS_functionalComponentArgsRest(__VLS_215));
    const __VLS_220 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
    /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
    // @ts-ignore
    const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({ size: ("small"), }));
    const __VLS_222 = __VLS_221({ size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_221));
    (__VLS_ctx.currentOrder.packageType || '-');
    __VLS_nonNullable(__VLS_225.slots).default;
    var __VLS_225;
    __VLS_nonNullable(__VLS_219.slots).default;
    var __VLS_219;
    const __VLS_226 = __VLS_resolvedLocalAndGlobalComponents.ElDescriptionsItem;
    /** @type { [typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ] } */
    // @ts-ignore
    const __VLS_227 = __VLS_asFunctionalComponent(__VLS_226, new __VLS_226({ label: ((__VLS_ctx.text.period)), }));
    const __VLS_228 = __VLS_227({ label: ((__VLS_ctx.text.period)), }, ...__VLS_functionalComponentArgsRest(__VLS_227));
    (__VLS_ctx.currentOrder.period || '-');
    __VLS_nonNullable(__VLS_231.slots).default;
    var __VLS_231;
    const __VLS_232 = __VLS_resolvedLocalAndGlobalComponents.ElDescriptionsItem;
    /** @type { [typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ] } */
    // @ts-ignore
    const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({ label: ((__VLS_ctx.text.sourceType)), }));
    const __VLS_234 = __VLS_233({ label: ((__VLS_ctx.text.sourceType)), }, ...__VLS_functionalComponentArgsRest(__VLS_233));
    const __VLS_238 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
    /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
    // @ts-ignore
    const __VLS_239 = __VLS_asFunctionalComponent(__VLS_238, new __VLS_238({ size: ("small"), type: ((__VLS_ctx.getSourceMeta(__VLS_ctx.currentOrder.sourceType).type)), }));
    const __VLS_240 = __VLS_239({ size: ("small"), type: ((__VLS_ctx.getSourceMeta(__VLS_ctx.currentOrder.sourceType).type)), }, ...__VLS_functionalComponentArgsRest(__VLS_239));
    (__VLS_ctx.getSourceMeta(__VLS_ctx.currentOrder.sourceType).label);
    __VLS_nonNullable(__VLS_243.slots).default;
    var __VLS_243;
    __VLS_nonNullable(__VLS_237.slots).default;
    var __VLS_237;
    const __VLS_244 = __VLS_resolvedLocalAndGlobalComponents.ElDescriptionsItem;
    /** @type { [typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ] } */
    // @ts-ignore
    const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({ label: ((__VLS_ctx.text.price)), }));
    const __VLS_246 = __VLS_245({ label: ((__VLS_ctx.text.price)), }, ...__VLS_functionalComponentArgsRest(__VLS_245));
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-red-500 font-bold") }, });
    (`${__VLS_ctx.moneySymbol}${__VLS_ctx.formatPrice(__VLS_ctx.currentOrder.price)}`);
    __VLS_nonNullable(__VLS_249.slots).default;
    var __VLS_249;
    const __VLS_250 = __VLS_resolvedLocalAndGlobalComponents.ElDescriptionsItem;
    /** @type { [typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ] } */
    // @ts-ignore
    const __VLS_251 = __VLS_asFunctionalComponent(__VLS_250, new __VLS_250({ label: ((__VLS_ctx.text.paymentMethod)), }));
    const __VLS_252 = __VLS_251({ label: ((__VLS_ctx.text.paymentMethod)), }, ...__VLS_functionalComponentArgsRest(__VLS_251));
    (__VLS_ctx.currentOrder.paymentMethod || '-');
    __VLS_nonNullable(__VLS_255.slots).default;
    var __VLS_255;
    const __VLS_256 = __VLS_resolvedLocalAndGlobalComponents.ElDescriptionsItem;
    /** @type { [typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ] } */
    // @ts-ignore
    const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({ label: ((__VLS_ctx.text.paymentStatus)), }));
    const __VLS_258 = __VLS_257({ label: ((__VLS_ctx.text.paymentStatus)), }, ...__VLS_functionalComponentArgsRest(__VLS_257));
    const __VLS_262 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
    /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
    // @ts-ignore
    const __VLS_263 = __VLS_asFunctionalComponent(__VLS_262, new __VLS_262({ type: ((__VLS_ctx.getStatusTag(__VLS_ctx.currentOrder.paymentStatus))), }));
    const __VLS_264 = __VLS_263({ type: ((__VLS_ctx.getStatusTag(__VLS_ctx.currentOrder.paymentStatus))), }, ...__VLS_functionalComponentArgsRest(__VLS_263));
    (__VLS_ctx.getStatusText(__VLS_ctx.currentOrder.paymentStatus));
    __VLS_nonNullable(__VLS_267.slots).default;
    var __VLS_267;
    __VLS_nonNullable(__VLS_261.slots).default;
    var __VLS_261;
    const __VLS_268 = __VLS_resolvedLocalAndGlobalComponents.ElDescriptionsItem;
    /** @type { [typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ] } */
    // @ts-ignore
    const __VLS_269 = __VLS_asFunctionalComponent(__VLS_268, new __VLS_268({ label: ((__VLS_ctx.text.createTime)), }));
    const __VLS_270 = __VLS_269({ label: ((__VLS_ctx.text.createTime)), }, ...__VLS_functionalComponentArgsRest(__VLS_269));
    (__VLS_ctx.currentOrder.createTime || '-');
    __VLS_nonNullable(__VLS_273.slots).default;
    var __VLS_273;
    const __VLS_274 = __VLS_resolvedLocalAndGlobalComponents.ElDescriptionsItem;
    /** @type { [typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ] } */
    // @ts-ignore
    const __VLS_275 = __VLS_asFunctionalComponent(__VLS_274, new __VLS_274({ label: ((__VLS_ctx.text.updateTime)), }));
    const __VLS_276 = __VLS_275({ label: ((__VLS_ctx.text.updateTime)), }, ...__VLS_functionalComponentArgsRest(__VLS_275));
    (__VLS_ctx.currentOrder.updateTime || '-');
    __VLS_nonNullable(__VLS_279.slots).default;
    var __VLS_279;
    __VLS_nonNullable(__VLS_195.slots).default;
    var __VLS_195;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_189.slots);
        const __VLS_280 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_281 = __VLS_asFunctionalComponent(__VLS_280, new __VLS_280({ ...{ 'onClick': {} }, }));
        const __VLS_282 = __VLS_281({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_281));
        let __VLS_286;
        const __VLS_287 = {
            onClick: (...[$event]) => {
                __VLS_ctx.detailVisible = false;
            }
        };
        let __VLS_283;
        let __VLS_284;
        (__VLS_ctx.text.close);
        __VLS_nonNullable(__VLS_285.slots).default;
        var __VLS_285;
    }
    var __VLS_189;
    __VLS_styleScopedClasses['vip-order-container'];
    __VLS_styleScopedClasses['p-5'];
    __VLS_styleScopedClasses['search-wrapper'];
    __VLS_styleScopedClasses['bg-white'];
    __VLS_styleScopedClasses['p-5'];
    __VLS_styleScopedClasses['rounded-lg'];
    __VLS_styleScopedClasses['mb-5'];
    __VLS_styleScopedClasses['shadow-sm'];
    __VLS_styleScopedClasses['table-wrapper'];
    __VLS_styleScopedClasses['bg-white'];
    __VLS_styleScopedClasses['p-5'];
    __VLS_styleScopedClasses['rounded-lg'];
    __VLS_styleScopedClasses['shadow-sm'];
    __VLS_styleScopedClasses['user-info'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-gray-400'];
    __VLS_styleScopedClasses['text-red-500'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['pagination-wrapper'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-end'];
    __VLS_styleScopedClasses['mt-5'];
    __VLS_styleScopedClasses['text-red-500'];
    __VLS_styleScopedClasses['font-bold'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "queryFormRef": __VLS_6,
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
            text: text,
            moneySymbol: moneySymbol,
            loading: loading,
            orderList: orderList,
            total: total,
            detailVisible: detailVisible,
            currentOrder: currentOrder,
            queryParams: queryParams,
            getList: getList,
            handleQuery: handleQuery,
            resetQuery: resetQuery,
            handleDetail: handleDetail,
            getPeriodTag: getPeriodTag,
            getSourceMeta: getSourceMeta,
            getStatusTag: getStatusTag,
            getStatusText: getStatusText,
            formatPrice: formatPrice,
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