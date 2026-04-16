/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { fetchCourseOrderList } from '@/api/order';
import { onMounted, reactive, ref } from 'vue';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const loading = ref(false);
const orderList = ref([]);
const total = ref(0);
// 详情弹窗相关
const detailVisible = ref(false);
const currentOrder = ref({});
const queryParams = reactive({
    current: 1,
    size: 10,
    orderNo: '',
    userName: '',
    paymentStatus: undefined
});
const getList = async () => {
    loading.value = true;
    try {
        const res = await fetchCourseOrderList(queryParams);
        if (res) {
            const data = res.data || res;
            orderList.value = data.records || [];
            total.value = data.total || 0;
        }
    }
    catch (error) {
        console.error('获取课程订单列表失败:', error);
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
const getStatusTag = (status) => {
    switch (status) {
        case 1: return 'success';
        case 0: return 'info';
        default: return 'info';
    }
};
const getStatusText = (status) => {
    switch (status) {
        case 1: return '已支付';
        case 0: return '待支付';
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
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("course-order-container p-5") }, });
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
    const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({ label: ("支付状态"), prop: ("paymentStatus"), }));
    const __VLS_33 = __VLS_32({ label: ("支付状态"), prop: ("paymentStatus"), }, ...__VLS_functionalComponentArgsRest(__VLS_32));
    const __VLS_37 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
    /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({ modelValue: ((__VLS_ctx.queryParams.paymentStatus)), placeholder: ("支付状态"), clearable: (true), ...{ style: ({}) }, }));
    const __VLS_39 = __VLS_38({ modelValue: ((__VLS_ctx.queryParams.paymentStatus)), placeholder: ("支付状态"), clearable: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    const __VLS_43 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({ label: ("待支付"), value: ((0)), }));
    const __VLS_45 = __VLS_44({ label: ("待支付"), value: ((0)), }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    const __VLS_49 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({ label: ("已支付"), value: ((1)), }));
    const __VLS_51 = __VLS_50({ label: ("已支付"), value: ((1)), }, ...__VLS_functionalComponentArgsRest(__VLS_50));
    __VLS_nonNullable(__VLS_42.slots).default;
    var __VLS_42;
    __VLS_nonNullable(__VLS_36.slots).default;
    var __VLS_36;
    const __VLS_55 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({}));
    const __VLS_57 = __VLS_56({}, ...__VLS_functionalComponentArgsRest(__VLS_56));
    const __VLS_61 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({ ...{ 'onClick': {} }, type: ("primary"), icon: ("Search"), }));
    const __VLS_63 = __VLS_62({ ...{ 'onClick': {} }, type: ("primary"), icon: ("Search"), }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    let __VLS_67;
    const __VLS_68 = {
        onClick: (__VLS_ctx.handleQuery)
    };
    let __VLS_64;
    let __VLS_65;
    __VLS_nonNullable(__VLS_66.slots).default;
    var __VLS_66;
    const __VLS_69 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({ ...{ 'onClick': {} }, icon: ("Refresh"), }));
    const __VLS_71 = __VLS_70({ ...{ 'onClick': {} }, icon: ("Refresh"), }, ...__VLS_functionalComponentArgsRest(__VLS_70));
    let __VLS_75;
    const __VLS_76 = {
        onClick: (__VLS_ctx.resetQuery)
    };
    let __VLS_72;
    let __VLS_73;
    __VLS_nonNullable(__VLS_74.slots).default;
    var __VLS_74;
    __VLS_nonNullable(__VLS_60.slots).default;
    var __VLS_60;
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("table-wrapper bg-white p-5 rounded-lg shadow-sm") }, });
    const __VLS_77 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
    // @ts-ignore
    const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({ data: ((__VLS_ctx.orderList)), border: (true), stripe: (true), ...{ style: ({}) }, }));
    const __VLS_79 = __VLS_78({ data: ((__VLS_ctx.orderList)), border: (true), stripe: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_78));
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.loading) }, null, null);
    const __VLS_83 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({ label: ("订单号"), prop: ("order_no"), minWidth: ("180"), align: ("center"), }));
    const __VLS_85 = __VLS_84({ label: ("订单号"), prop: ("order_no"), minWidth: ("180"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_84));
    const __VLS_89 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({ label: ("用户信息"), minWidth: ("150"), }));
    const __VLS_91 = __VLS_90({ label: ("用户信息"), minWidth: ("150"), }, ...__VLS_functionalComponentArgsRest(__VLS_90));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_94.slots);
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("user-info") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("font-bold") }, });
        (scope.row.user_name);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("text-xs text-gray-400") }, });
        (scope.row.user_phone);
    }
    var __VLS_94;
    const __VLS_95 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_96 = __VLS_asFunctionalComponent(__VLS_95, new __VLS_95({ label: ("课程名称"), prop: ("course_title"), minWidth: ("200"), align: ("center"), showOverflowTooltip: (true), }));
    const __VLS_97 = __VLS_96({ label: ("课程名称"), prop: ("course_title"), minWidth: ("200"), align: ("center"), showOverflowTooltip: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_96));
    const __VLS_101 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({ label: ("订单金额"), width: ("100"), align: ("center"), }));
    const __VLS_103 = __VLS_102({ label: ("订单金额"), width: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_102));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_106.slots);
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-red-500 font-bold") }, });
        (scope.row.price?.toFixed(2));
    }
    var __VLS_106;
    const __VLS_107 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_108 = __VLS_asFunctionalComponent(__VLS_107, new __VLS_107({ label: ("支付方式"), prop: ("payment_method"), width: ("120"), align: ("center"), }));
    const __VLS_109 = __VLS_108({ label: ("支付方式"), prop: ("payment_method"), width: ("120"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_108));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_112.slots);
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        (scope.row.payment_method || '-');
    }
    var __VLS_112;
    const __VLS_113 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({ label: ("支付状态"), width: ("100"), align: ("center"), }));
    const __VLS_115 = __VLS_114({ label: ("支付状态"), width: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_114));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_118.slots);
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_119 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
        /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
        // @ts-ignore
        const __VLS_120 = __VLS_asFunctionalComponent(__VLS_119, new __VLS_119({ type: ((__VLS_ctx.getStatusTag(scope.row.payment_status))), }));
        const __VLS_121 = __VLS_120({ type: ((__VLS_ctx.getStatusTag(scope.row.payment_status))), }, ...__VLS_functionalComponentArgsRest(__VLS_120));
        (__VLS_ctx.getStatusText(scope.row.payment_status));
        __VLS_nonNullable(__VLS_124.slots).default;
        var __VLS_124;
    }
    var __VLS_118;
    const __VLS_125 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({ label: ("下单时间"), prop: ("create_time"), width: ("180"), align: ("center"), }));
    const __VLS_127 = __VLS_126({ label: ("下单时间"), prop: ("create_time"), width: ("180"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_126));
    const __VLS_131 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_132 = __VLS_asFunctionalComponent(__VLS_131, new __VLS_131({ label: ("操作"), width: ("100"), align: ("center"), fixed: ("right"), }));
    const __VLS_133 = __VLS_132({ label: ("操作"), width: ("100"), align: ("center"), fixed: ("right"), }, ...__VLS_functionalComponentArgsRest(__VLS_132));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_136.slots);
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_137 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_138 = __VLS_asFunctionalComponent(__VLS_137, new __VLS_137({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }));
        const __VLS_139 = __VLS_138({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_138));
        let __VLS_143;
        const __VLS_144 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleDetail(scope.row);
            }
        };
        let __VLS_140;
        let __VLS_141;
        __VLS_nonNullable(__VLS_142.slots).default;
        var __VLS_142;
    }
    var __VLS_136;
    __VLS_nonNullable(__VLS_82.slots).default;
    var __VLS_82;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("pagination-wrapper flex justify-end mt-5") }, });
    const __VLS_145 = __VLS_resolvedLocalAndGlobalComponents.ElPagination;
    /** @type { [typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ] } */
    // @ts-ignore
    const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({ ...{ 'onSizeChange': {} }, ...{ 'onCurrentChange': {} }, currentPage: ((__VLS_ctx.queryParams.current)), pageSize: ((__VLS_ctx.queryParams.size)), pageSizes: (([10, 20, 30, 50])), layout: ("total, sizes, prev, pager, next, jumper"), total: ((__VLS_ctx.total)), }));
    const __VLS_147 = __VLS_146({ ...{ 'onSizeChange': {} }, ...{ 'onCurrentChange': {} }, currentPage: ((__VLS_ctx.queryParams.current)), pageSize: ((__VLS_ctx.queryParams.size)), pageSizes: (([10, 20, 30, 50])), layout: ("total, sizes, prev, pager, next, jumper"), total: ((__VLS_ctx.total)), }, ...__VLS_functionalComponentArgsRest(__VLS_146));
    let __VLS_151;
    const __VLS_152 = {
        onSizeChange: (__VLS_ctx.getList)
    };
    const __VLS_153 = {
        onCurrentChange: (__VLS_ctx.getList)
    };
    let __VLS_148;
    let __VLS_149;
    var __VLS_150;
    const __VLS_154 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */
    // @ts-ignore
    const __VLS_155 = __VLS_asFunctionalComponent(__VLS_154, new __VLS_154({ modelValue: ((__VLS_ctx.detailVisible)), title: ("订单详情"), width: ("600px"), destroyOnClose: (true), }));
    const __VLS_156 = __VLS_155({ modelValue: ((__VLS_ctx.detailVisible)), title: ("订单详情"), width: ("600px"), destroyOnClose: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_155));
    const __VLS_160 = __VLS_resolvedLocalAndGlobalComponents.ElDescriptions;
    /** @type { [typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, ] } */
    // @ts-ignore
    const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({ column: ((1)), border: (true), }));
    const __VLS_162 = __VLS_161({ column: ((1)), border: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_161));
    const __VLS_166 = __VLS_resolvedLocalAndGlobalComponents.ElDescriptionsItem;
    /** @type { [typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ] } */
    // @ts-ignore
    const __VLS_167 = __VLS_asFunctionalComponent(__VLS_166, new __VLS_166({ label: ("订单编号"), }));
    const __VLS_168 = __VLS_167({ label: ("订单编号"), }, ...__VLS_functionalComponentArgsRest(__VLS_167));
    (__VLS_ctx.currentOrder.order_no);
    __VLS_nonNullable(__VLS_171.slots).default;
    var __VLS_171;
    const __VLS_172 = __VLS_resolvedLocalAndGlobalComponents.ElDescriptionsItem;
    /** @type { [typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ] } */
    // @ts-ignore
    const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({ label: ("用户姓名"), }));
    const __VLS_174 = __VLS_173({ label: ("用户姓名"), }, ...__VLS_functionalComponentArgsRest(__VLS_173));
    (__VLS_ctx.currentOrder.user_name);
    __VLS_nonNullable(__VLS_177.slots).default;
    var __VLS_177;
    const __VLS_178 = __VLS_resolvedLocalAndGlobalComponents.ElDescriptionsItem;
    /** @type { [typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ] } */
    // @ts-ignore
    const __VLS_179 = __VLS_asFunctionalComponent(__VLS_178, new __VLS_178({ label: ("手机号码"), }));
    const __VLS_180 = __VLS_179({ label: ("手机号码"), }, ...__VLS_functionalComponentArgsRest(__VLS_179));
    (__VLS_ctx.currentOrder.user_phone);
    __VLS_nonNullable(__VLS_183.slots).default;
    var __VLS_183;
    const __VLS_184 = __VLS_resolvedLocalAndGlobalComponents.ElDescriptionsItem;
    /** @type { [typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ] } */
    // @ts-ignore
    const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({ label: ("课程名称"), }));
    const __VLS_186 = __VLS_185({ label: ("课程名称"), }, ...__VLS_functionalComponentArgsRest(__VLS_185));
    (__VLS_ctx.currentOrder.course_title);
    __VLS_nonNullable(__VLS_189.slots).default;
    var __VLS_189;
    const __VLS_190 = __VLS_resolvedLocalAndGlobalComponents.ElDescriptionsItem;
    /** @type { [typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ] } */
    // @ts-ignore
    const __VLS_191 = __VLS_asFunctionalComponent(__VLS_190, new __VLS_190({ label: ("订单金额"), }));
    const __VLS_192 = __VLS_191({ label: ("订单金额"), }, ...__VLS_functionalComponentArgsRest(__VLS_191));
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-red-500 font-bold") }, });
    (__VLS_ctx.currentOrder.price?.toFixed(2));
    __VLS_nonNullable(__VLS_195.slots).default;
    var __VLS_195;
    const __VLS_196 = __VLS_resolvedLocalAndGlobalComponents.ElDescriptionsItem;
    /** @type { [typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ] } */
    // @ts-ignore
    const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({ label: ("支付方式"), }));
    const __VLS_198 = __VLS_197({ label: ("支付方式"), }, ...__VLS_functionalComponentArgsRest(__VLS_197));
    (__VLS_ctx.currentOrder.payment_method || '-');
    __VLS_nonNullable(__VLS_201.slots).default;
    var __VLS_201;
    const __VLS_202 = __VLS_resolvedLocalAndGlobalComponents.ElDescriptionsItem;
    /** @type { [typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ] } */
    // @ts-ignore
    const __VLS_203 = __VLS_asFunctionalComponent(__VLS_202, new __VLS_202({ label: ("支付状态"), }));
    const __VLS_204 = __VLS_203({ label: ("支付状态"), }, ...__VLS_functionalComponentArgsRest(__VLS_203));
    const __VLS_208 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
    /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
    // @ts-ignore
    const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({ type: ((__VLS_ctx.getStatusTag(__VLS_ctx.currentOrder.payment_status))), }));
    const __VLS_210 = __VLS_209({ type: ((__VLS_ctx.getStatusTag(__VLS_ctx.currentOrder.payment_status))), }, ...__VLS_functionalComponentArgsRest(__VLS_209));
    (__VLS_ctx.getStatusText(__VLS_ctx.currentOrder.payment_status));
    __VLS_nonNullable(__VLS_213.slots).default;
    var __VLS_213;
    __VLS_nonNullable(__VLS_207.slots).default;
    var __VLS_207;
    const __VLS_214 = __VLS_resolvedLocalAndGlobalComponents.ElDescriptionsItem;
    /** @type { [typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ] } */
    // @ts-ignore
    const __VLS_215 = __VLS_asFunctionalComponent(__VLS_214, new __VLS_214({ label: ("下单时间"), }));
    const __VLS_216 = __VLS_215({ label: ("下单时间"), }, ...__VLS_functionalComponentArgsRest(__VLS_215));
    (__VLS_ctx.currentOrder.create_time);
    __VLS_nonNullable(__VLS_219.slots).default;
    var __VLS_219;
    const __VLS_220 = __VLS_resolvedLocalAndGlobalComponents.ElDescriptionsItem;
    /** @type { [typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ] } */
    // @ts-ignore
    const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({ label: ("更新时间"), }));
    const __VLS_222 = __VLS_221({ label: ("更新时间"), }, ...__VLS_functionalComponentArgsRest(__VLS_221));
    (__VLS_ctx.currentOrder.update_time || '-');
    __VLS_nonNullable(__VLS_225.slots).default;
    var __VLS_225;
    __VLS_nonNullable(__VLS_165.slots).default;
    var __VLS_165;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_159.slots);
        const __VLS_226 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_227 = __VLS_asFunctionalComponent(__VLS_226, new __VLS_226({ ...{ 'onClick': {} }, }));
        const __VLS_228 = __VLS_227({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_227));
        let __VLS_232;
        const __VLS_233 = {
            onClick: (...[$event]) => {
                __VLS_ctx.detailVisible = false;
            }
        };
        let __VLS_229;
        let __VLS_230;
        __VLS_nonNullable(__VLS_231.slots).default;
        var __VLS_231;
    }
    var __VLS_159;
    __VLS_styleScopedClasses['course-order-container'];
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