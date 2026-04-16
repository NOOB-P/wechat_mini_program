/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { fetchPrintOrderList, updatePrintOrderStatus } from '@/api/order';
import { ElMessage, ElMessageBox } from 'element-plus';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const loading = ref(false);
const orderList = ref([]);
const total = ref(0);
const queryParams = reactive({
    current: 1,
    size: 10,
    orderNo: '',
    userName: '',
    orderStatus: undefined
});
const getList = async () => {
    loading.value = true;
    try {
        const res = await fetchPrintOrderList(queryParams);
        orderList.value = res.records;
        total.value = res.total;
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
    queryParams.orderStatus = undefined;
    handleQuery();
};
const handleDetail = (row) => {
    ElMessage.info(`查看订单 ${row.orderNo} 的详情`);
};
const handlePrint = (row) => {
    ElMessageBox.confirm(`确定订单 ${row.orderNo} 已完成打印吗？完成后将进入待配送状态。`, '确认提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        try {
            loading.value = true;
            // 2 (待打印) -> 3 (待配送)
            await updatePrintOrderStatus(row.id, 3);
            ElMessage.success('订单已标记为待配送');
            getList();
        }
        finally {
            loading.value = false;
        }
    }).catch(() => { });
};
const getStatusTag = (status) => {
    switch (status) {
        case 1: return 'info'; // 待支付
        case 2: return 'warning'; // 待打印
        case 3: return 'primary'; // 待配送
        case 4: return 'success'; // 已完成
        case 0: return 'danger'; // 已取消
        default: return 'info';
    }
};
const getStatusText = (status) => {
    switch (status) {
        case 1: return '待支付';
        case 2: return '待打印';
        case 3: return '待配送';
        case 4: return '已完成';
        case 0: return '已取消';
        default: return '未知';
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
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("print-order-container p-5") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("search-wrapper bg-white p-5 rounded-lg mb-5 shadow-sm") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ model: ((__VLS_ctx.queryParams)), ref: ("queryFormRef"), inline: ((true)), }));
    const __VLS_2 = __VLS_1({ model: ((__VLS_ctx.queryParams)), ref: ("queryFormRef"), inline: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    // @ts-ignore navigation for `const queryFormRef = ref()`
    __VLS_ctx.queryFormRef;
    var __VLS_6 = {};
    const __VLS_7 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({ label: ("订单号"), prop: ("orderNo"), }));
    const __VLS_9 = __VLS_8({ label: ("订单号"), prop: ("orderNo"), }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    const __VLS_13 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({ modelValue: ((__VLS_ctx.queryParams.orderNo)), placeholder: ("请输入订单号"), clearable: (true), ...{ style: ({}) }, }));
    const __VLS_15 = __VLS_14({ modelValue: ((__VLS_ctx.queryParams.orderNo)), placeholder: ("请输入订单号"), clearable: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    __VLS_nonNullable(__VLS_12.slots).default;
    var __VLS_12;
    const __VLS_19 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({ label: ("用户名"), prop: ("userName"), }));
    const __VLS_21 = __VLS_20({ label: ("用户名"), prop: ("userName"), }, ...__VLS_functionalComponentArgsRest(__VLS_20));
    const __VLS_25 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({ modelValue: ((__VLS_ctx.queryParams.userName)), placeholder: ("请输入用户名"), clearable: (true), ...{ style: ({}) }, }));
    const __VLS_27 = __VLS_26({ modelValue: ((__VLS_ctx.queryParams.userName)), placeholder: ("请输入用户名"), clearable: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    __VLS_nonNullable(__VLS_24.slots).default;
    var __VLS_24;
    const __VLS_31 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({ label: ("订单状态"), prop: ("orderStatus"), }));
    const __VLS_33 = __VLS_32({ label: ("订单状态"), prop: ("orderStatus"), }, ...__VLS_functionalComponentArgsRest(__VLS_32));
    const __VLS_37 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
    /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({ modelValue: ((__VLS_ctx.queryParams.orderStatus)), placeholder: ("订单状态"), clearable: (true), ...{ style: ({}) }, }));
    const __VLS_39 = __VLS_38({ modelValue: ((__VLS_ctx.queryParams.orderStatus)), placeholder: ("订单状态"), clearable: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    const __VLS_43 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({ label: ("待支付"), value: ((1)), }));
    const __VLS_45 = __VLS_44({ label: ("待支付"), value: ((1)), }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    const __VLS_49 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({ label: ("待打印"), value: ((2)), }));
    const __VLS_51 = __VLS_50({ label: ("待打印"), value: ((2)), }, ...__VLS_functionalComponentArgsRest(__VLS_50));
    const __VLS_55 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({ label: ("待配送"), value: ((3)), }));
    const __VLS_57 = __VLS_56({ label: ("待配送"), value: ((3)), }, ...__VLS_functionalComponentArgsRest(__VLS_56));
    const __VLS_61 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({ label: ("已完成"), value: ((4)), }));
    const __VLS_63 = __VLS_62({ label: ("已完成"), value: ((4)), }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    const __VLS_67 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({ label: ("已取消"), value: ((0)), }));
    const __VLS_69 = __VLS_68({ label: ("已取消"), value: ((0)), }, ...__VLS_functionalComponentArgsRest(__VLS_68));
    __VLS_nonNullable(__VLS_42.slots).default;
    var __VLS_42;
    __VLS_nonNullable(__VLS_36.slots).default;
    var __VLS_36;
    const __VLS_73 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({}));
    const __VLS_75 = __VLS_74({}, ...__VLS_functionalComponentArgsRest(__VLS_74));
    const __VLS_79 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_80 = __VLS_asFunctionalComponent(__VLS_79, new __VLS_79({ ...{ 'onClick': {} }, type: ("primary"), icon: ("Search"), }));
    const __VLS_81 = __VLS_80({ ...{ 'onClick': {} }, type: ("primary"), icon: ("Search"), }, ...__VLS_functionalComponentArgsRest(__VLS_80));
    let __VLS_85;
    const __VLS_86 = {
        onClick: (__VLS_ctx.handleQuery)
    };
    let __VLS_82;
    let __VLS_83;
    __VLS_nonNullable(__VLS_84.slots).default;
    var __VLS_84;
    const __VLS_87 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_88 = __VLS_asFunctionalComponent(__VLS_87, new __VLS_87({ ...{ 'onClick': {} }, icon: ("Refresh"), }));
    const __VLS_89 = __VLS_88({ ...{ 'onClick': {} }, icon: ("Refresh"), }, ...__VLS_functionalComponentArgsRest(__VLS_88));
    let __VLS_93;
    const __VLS_94 = {
        onClick: (__VLS_ctx.resetQuery)
    };
    let __VLS_90;
    let __VLS_91;
    __VLS_nonNullable(__VLS_92.slots).default;
    var __VLS_92;
    __VLS_nonNullable(__VLS_78.slots).default;
    var __VLS_78;
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("table-wrapper bg-white p-5 rounded-lg shadow-sm") }, });
    const __VLS_95 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
    // @ts-ignore
    const __VLS_96 = __VLS_asFunctionalComponent(__VLS_95, new __VLS_95({ data: ((__VLS_ctx.orderList)), border: (true), stripe: (true), ...{ style: ({}) }, }));
    const __VLS_97 = __VLS_96({ data: ((__VLS_ctx.orderList)), border: (true), stripe: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_96));
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.loading) }, null, null);
    const __VLS_101 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({ label: ("订单号"), prop: ("orderNo"), minWidth: ("180"), align: ("center"), }));
    const __VLS_103 = __VLS_102({ label: ("订单号"), prop: ("orderNo"), minWidth: ("180"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_102));
    const __VLS_107 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_108 = __VLS_asFunctionalComponent(__VLS_107, new __VLS_107({ label: ("下单用户"), minWidth: ("150"), }));
    const __VLS_109 = __VLS_108({ label: ("下单用户"), minWidth: ("150"), }, ...__VLS_functionalComponentArgsRest(__VLS_108));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_112.slots);
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("user-info") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("font-bold") }, });
        (scope.row.userName);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("text-xs text-gray-400") }, });
        (scope.row.userPhone);
    }
    var __VLS_112;
    const __VLS_113 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({ label: ("文档名称"), prop: ("documentName"), minWidth: ("180"), showOverflowTooltip: ((true)), }));
    const __VLS_115 = __VLS_114({ label: ("文档名称"), prop: ("documentName"), minWidth: ("180"), showOverflowTooltip: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_114));
    const __VLS_119 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_120 = __VLS_asFunctionalComponent(__VLS_119, new __VLS_119({ label: ("打印规格"), width: ("120"), align: ("center"), }));
    const __VLS_121 = __VLS_120({ label: ("打印规格"), width: ("120"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_120));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_124.slots);
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_125 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
        /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
        // @ts-ignore
        const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({ size: ("small"), effect: ("plain"), }));
        const __VLS_127 = __VLS_126({ size: ("small"), effect: ("plain"), }, ...__VLS_functionalComponentArgsRest(__VLS_126));
        (scope.row.printType);
        __VLS_nonNullable(__VLS_130.slots).default;
        var __VLS_130;
    }
    var __VLS_124;
    const __VLS_131 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_132 = __VLS_asFunctionalComponent(__VLS_131, new __VLS_131({ label: ("页数"), prop: ("pages"), width: ("80"), align: ("center"), }));
    const __VLS_133 = __VLS_132({ label: ("页数"), prop: ("pages"), width: ("80"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_132));
    const __VLS_137 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_138 = __VLS_asFunctionalComponent(__VLS_137, new __VLS_137({ label: ("配送方式"), prop: ("deliveryMethod"), width: ("100"), align: ("center"), }));
    const __VLS_139 = __VLS_138({ label: ("配送方式"), prop: ("deliveryMethod"), width: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_138));
    const __VLS_143 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_144 = __VLS_asFunctionalComponent(__VLS_143, new __VLS_143({ label: ("订单总额"), width: ("100"), align: ("center"), }));
    const __VLS_145 = __VLS_144({ label: ("订单总额"), width: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_144));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_148.slots);
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-red-500 font-bold") }, });
        (scope.row.totalPrice.toFixed(2));
    }
    var __VLS_148;
    const __VLS_149 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({ label: ("订单状态"), width: ("100"), align: ("center"), }));
    const __VLS_151 = __VLS_150({ label: ("订单状态"), width: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_150));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_154.slots);
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_155 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
        /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
        // @ts-ignore
        const __VLS_156 = __VLS_asFunctionalComponent(__VLS_155, new __VLS_155({ type: ((__VLS_ctx.getStatusTag(scope.row.orderStatus))), }));
        const __VLS_157 = __VLS_156({ type: ((__VLS_ctx.getStatusTag(scope.row.orderStatus))), }, ...__VLS_functionalComponentArgsRest(__VLS_156));
        (__VLS_ctx.getStatusText(scope.row.orderStatus));
        __VLS_nonNullable(__VLS_160.slots).default;
        var __VLS_160;
    }
    var __VLS_154;
    const __VLS_161 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_162 = __VLS_asFunctionalComponent(__VLS_161, new __VLS_161({ label: ("下单时间"), prop: ("createTime"), width: ("180"), align: ("center"), }));
    const __VLS_163 = __VLS_162({ label: ("下单时间"), prop: ("createTime"), width: ("180"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_162));
    const __VLS_167 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_168 = __VLS_asFunctionalComponent(__VLS_167, new __VLS_167({ label: ("操作"), width: ("120"), align: ("center"), fixed: ("right"), }));
    const __VLS_169 = __VLS_168({ label: ("操作"), width: ("120"), align: ("center"), fixed: ("right"), }, ...__VLS_functionalComponentArgsRest(__VLS_168));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_172.slots);
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_173 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_174 = __VLS_asFunctionalComponent(__VLS_173, new __VLS_173({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }));
        const __VLS_175 = __VLS_174({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_174));
        let __VLS_179;
        const __VLS_180 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleDetail(scope.row);
            }
        };
        let __VLS_176;
        let __VLS_177;
        __VLS_nonNullable(__VLS_178.slots).default;
        var __VLS_178;
        if (scope.row.orderStatus === 2) {
            const __VLS_181 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_182 = __VLS_asFunctionalComponent(__VLS_181, new __VLS_181({ ...{ 'onClick': {} }, link: (true), type: ("success"), }));
            const __VLS_183 = __VLS_182({ ...{ 'onClick': {} }, link: (true), type: ("success"), }, ...__VLS_functionalComponentArgsRest(__VLS_182));
            let __VLS_187;
            const __VLS_188 = {
                onClick: (...[$event]) => {
                    if (!((scope.row.orderStatus === 2)))
                        return;
                    __VLS_ctx.handlePrint(scope.row);
                }
            };
            let __VLS_184;
            let __VLS_185;
            __VLS_nonNullable(__VLS_186.slots).default;
            var __VLS_186;
        }
    }
    var __VLS_172;
    __VLS_nonNullable(__VLS_100.slots).default;
    var __VLS_100;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("pagination-wrapper flex justify-end mt-5") }, });
    const __VLS_189 = __VLS_resolvedLocalAndGlobalComponents.ElPagination;
    /** @type { [typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ] } */
    // @ts-ignore
    const __VLS_190 = __VLS_asFunctionalComponent(__VLS_189, new __VLS_189({ ...{ 'onSizeChange': {} }, ...{ 'onCurrentChange': {} }, currentPage: ((__VLS_ctx.queryParams.current)), pageSize: ((__VLS_ctx.queryParams.size)), pageSizes: (([10, 20, 30, 50])), layout: ("total, sizes, prev, pager, next, jumper"), total: ((__VLS_ctx.total)), }));
    const __VLS_191 = __VLS_190({ ...{ 'onSizeChange': {} }, ...{ 'onCurrentChange': {} }, currentPage: ((__VLS_ctx.queryParams.current)), pageSize: ((__VLS_ctx.queryParams.size)), pageSizes: (([10, 20, 30, 50])), layout: ("total, sizes, prev, pager, next, jumper"), total: ((__VLS_ctx.total)), }, ...__VLS_functionalComponentArgsRest(__VLS_190));
    let __VLS_195;
    const __VLS_196 = {
        onSizeChange: (__VLS_ctx.getList)
    };
    const __VLS_197 = {
        onCurrentChange: (__VLS_ctx.getList)
    };
    let __VLS_192;
    let __VLS_193;
    var __VLS_194;
    __VLS_styleScopedClasses['print-order-container'];
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
            loading: loading,
            orderList: orderList,
            total: total,
            queryParams: queryParams,
            getList: getList,
            handleQuery: handleQuery,
            resetQuery: resetQuery,
            handleDetail: handleDetail,
            handlePrint: handlePrint,
            getStatusTag: getStatusTag,
            getStatusText: getStatusText,
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