/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { fetchLogList, deleteLogs, exportLogs } from '@/api/log';
import LogSearch from './modules/log-search.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const loading = ref(false);
const logList = ref([]);
const total = ref(0);
const selectedIds = ref([]);
const open = ref(false);
const form = ref({});
const queryParams = reactive({
    current: 1,
    size: 10,
    userName: '',
    operation: '',
    status: undefined
});
const getList = async () => {
    loading.value = true;
    try {
        const res = await fetchLogList(queryParams);
        logList.value = res.records || [];
        total.value = res.total || 0;
    }
    catch (error) {
        console.error('Failed to fetch logs:', error);
        logList.value = [];
        total.value = 0;
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
    queryParams.userName = '';
    queryParams.operation = '';
    queryParams.status = undefined;
    handleQuery();
};
const handleSelectionChange = (selection) => {
    selectedIds.value = selection.map((item) => item.id);
};
const handleBatchDelete = () => {
    if (!selectedIds.value.length)
        return;
    ElMessageBox.confirm(`是否确认删除日志编号为 "${selectedIds.value.join(',')}" 的数据项?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        try {
            await deleteLogs(selectedIds.value);
            ElMessage.success('删除成功');
            getList();
        }
        catch (error) {
            // 如果 error 里有 code 或 message 也可以在这里做针对性处理
            // 不过由于 utils/http 内部通常已经拦截报错了，这里可以只是做个 fallback
            // ElMessage.error(error.message || '删除失败，请检查权限')
        }
    }).catch(() => { });
};
const handleExport = async () => {
    const res = await exportLogs(queryParams);
    if (res.code === 200) {
        ElMessage.success(res.msg);
    }
};
const handleView = (row) => {
    form.value = { ...row };
    open.value = true;
};
const getMethodTagType = (method) => {
    switch (method) {
        case 'GET': return 'info';
        case 'POST': return 'success';
        case 'PUT': return 'warning';
        case 'DELETE': return 'danger';
        default: return '';
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("log-container p-5") }, });
    // @ts-ignore
    [LogSearch,];
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(LogSearch, new LogSearch({ ...{ 'onQuery': {} }, ...{ 'onReset': {} }, queryParams: ((__VLS_ctx.queryParams)), }));
    const __VLS_1 = __VLS_0({ ...{ 'onQuery': {} }, ...{ 'onReset': {} }, queryParams: ((__VLS_ctx.queryParams)), }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    let __VLS_5;
    const __VLS_6 = {
        onQuery: (__VLS_ctx.handleQuery)
    };
    const __VLS_7 = {
        onReset: (__VLS_ctx.resetQuery)
    };
    let __VLS_2;
    let __VLS_3;
    var __VLS_4;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("table-toolbar flex justify-between items-center mb-4") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("left-btns") }, });
    const __VLS_8 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({ ...{ 'onClick': {} }, type: ("danger"), plain: (true), icon: ("Delete"), disabled: ((!__VLS_ctx.selectedIds.length)), }));
    const __VLS_10 = __VLS_9({ ...{ 'onClick': {} }, type: ("danger"), plain: (true), icon: ("Delete"), disabled: ((!__VLS_ctx.selectedIds.length)), }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_14;
    const __VLS_15 = {
        onClick: (__VLS_ctx.handleBatchDelete)
    };
    let __VLS_11;
    let __VLS_12;
    __VLS_nonNullable(__VLS_13.slots).default;
    var __VLS_13;
    const __VLS_16 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({ ...{ 'onClick': {} }, type: ("warning"), plain: (true), icon: ("Download"), }));
    const __VLS_18 = __VLS_17({ ...{ 'onClick': {} }, type: ("warning"), plain: (true), icon: ("Download"), }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    let __VLS_22;
    const __VLS_23 = {
        onClick: (__VLS_ctx.handleExport)
    };
    let __VLS_19;
    let __VLS_20;
    __VLS_nonNullable(__VLS_21.slots).default;
    var __VLS_21;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("right-btns") }, });
    const __VLS_24 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({ ...{ 'onClick': {} }, icon: ("Refresh"), circle: (true), }));
    const __VLS_26 = __VLS_25({ ...{ 'onClick': {} }, icon: ("Refresh"), circle: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    let __VLS_30;
    const __VLS_31 = {
        onClick: (__VLS_ctx.getList)
    };
    let __VLS_27;
    let __VLS_28;
    var __VLS_29;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("table-wrapper bg-white dark:bg-dark-800 p-5 rounded-lg shadow-sm") }, });
    const __VLS_32 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({ ...{ 'onSelectionChange': {} }, data: ((__VLS_ctx.logList)), ...{ style: ({}) }, }));
    const __VLS_34 = __VLS_33({ ...{ 'onSelectionChange': {} }, data: ((__VLS_ctx.logList)), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.loading) }, null, null);
    let __VLS_38;
    const __VLS_39 = {
        onSelectionChange: (__VLS_ctx.handleSelectionChange)
    };
    let __VLS_35;
    let __VLS_36;
    const __VLS_40 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({ type: ("selection"), width: ("55"), align: ("center"), }));
    const __VLS_42 = __VLS_41({ type: ("selection"), width: ("55"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    const __VLS_46 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({ prop: ("id"), label: ("日志编号"), width: ("100"), }));
    const __VLS_48 = __VLS_47({ prop: ("id"), label: ("日志编号"), width: ("100"), }, ...__VLS_functionalComponentArgsRest(__VLS_47));
    const __VLS_52 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({ prop: ("operation"), label: ("操作模块"), minWidth: ("150"), }));
    const __VLS_54 = __VLS_53({ prop: ("operation"), label: ("操作模块"), minWidth: ("150"), }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    const __VLS_58 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({ prop: ("userName"), label: ("操作人员"), minWidth: ("120"), }));
    const __VLS_60 = __VLS_59({ prop: ("userName"), label: ("操作人员"), minWidth: ("120"), }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_63.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex flex-col") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (row.nickName || row.nickname || '未知');
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-xs text-gray-400") }, });
        (row.userName || row.username);
    }
    var __VLS_63;
    const __VLS_64 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({ prop: ("method"), label: ("请求方式"), width: ("100"), }));
    const __VLS_66 = __VLS_65({ prop: ("method"), label: ("请求方式"), width: ("100"), }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_69.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_70 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
        /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
        // @ts-ignore
        const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({ type: ((row.method === 'GET' ? 'info' : 'success')), }));
        const __VLS_72 = __VLS_71({ type: ((row.method === 'GET' ? 'info' : 'success')), }, ...__VLS_functionalComponentArgsRest(__VLS_71));
        (row.method);
        __VLS_nonNullable(__VLS_75.slots).default;
        var __VLS_75;
    }
    var __VLS_69;
    const __VLS_76 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({ prop: ("ip"), label: ("操作地址"), minWidth: ("150"), }));
    const __VLS_78 = __VLS_77({ prop: ("ip"), label: ("操作地址"), minWidth: ("150"), }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    const __VLS_82 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({ prop: ("location"), label: ("操作地点"), minWidth: ("120"), }));
    const __VLS_84 = __VLS_83({ prop: ("location"), label: ("操作地点"), minWidth: ("120"), }, ...__VLS_functionalComponentArgsRest(__VLS_83));
    const __VLS_88 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({ prop: ("status"), label: ("操作状态"), width: ("100"), }));
    const __VLS_90 = __VLS_89({ prop: ("status"), label: ("操作状态"), width: ("100"), }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_93.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_94 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
        /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
        // @ts-ignore
        const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({ type: ((row.status === 200 ? 'success' : 'danger')), }));
        const __VLS_96 = __VLS_95({ type: ((row.status === 200 ? 'success' : 'danger')), }, ...__VLS_functionalComponentArgsRest(__VLS_95));
        (row.status === 200 ? '成功' : '失败');
        __VLS_nonNullable(__VLS_99.slots).default;
        var __VLS_99;
    }
    var __VLS_93;
    const __VLS_100 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({ prop: ("createTime"), label: ("操作时间"), minWidth: ("180"), }));
    const __VLS_102 = __VLS_101({ prop: ("createTime"), label: ("操作时间"), minWidth: ("180"), }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_105.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        (row.createTime ? new Date(row.createTime).toLocaleString() : '');
    }
    var __VLS_105;
    const __VLS_106 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({ label: ("操作"), align: ("center"), className: ("small-padding fixed-width"), width: ("100"), }));
    const __VLS_108 = __VLS_107({ label: ("操作"), align: ("center"), className: ("small-padding fixed-width"), width: ("100"), }, ...__VLS_functionalComponentArgsRest(__VLS_107));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_111.slots);
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_112 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({ ...{ 'onClick': {} }, link: (true), type: ("primary"), icon: ("View"), }));
        const __VLS_114 = __VLS_113({ ...{ 'onClick': {} }, link: (true), type: ("primary"), icon: ("View"), }, ...__VLS_functionalComponentArgsRest(__VLS_113));
        let __VLS_118;
        const __VLS_119 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleView(scope.row);
            }
        };
        let __VLS_115;
        let __VLS_116;
        __VLS_nonNullable(__VLS_117.slots).default;
        var __VLS_117;
    }
    var __VLS_111;
    __VLS_nonNullable(__VLS_37.slots).default;
    var __VLS_37;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("pagination-wrapper flex justify-end mt-5") }, });
    const __VLS_120 = __VLS_resolvedLocalAndGlobalComponents.ElPagination;
    /** @type { [typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ] } */
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({ ...{ 'onSizeChange': {} }, ...{ 'onCurrentChange': {} }, currentPage: ((__VLS_ctx.queryParams.current)), pageSize: ((__VLS_ctx.queryParams.size)), pageSizes: (([10, 20, 30, 50])), layout: ("total, sizes, prev, pager, next, jumper"), total: ((__VLS_ctx.total)), }));
    const __VLS_122 = __VLS_121({ ...{ 'onSizeChange': {} }, ...{ 'onCurrentChange': {} }, currentPage: ((__VLS_ctx.queryParams.current)), pageSize: ((__VLS_ctx.queryParams.size)), pageSizes: (([10, 20, 30, 50])), layout: ("total, sizes, prev, pager, next, jumper"), total: ((__VLS_ctx.total)), }, ...__VLS_functionalComponentArgsRest(__VLS_121));
    let __VLS_126;
    const __VLS_127 = {
        onSizeChange: (__VLS_ctx.getList)
    };
    const __VLS_128 = {
        onCurrentChange: (__VLS_ctx.getList)
    };
    let __VLS_123;
    let __VLS_124;
    var __VLS_125;
    const __VLS_129 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */
    // @ts-ignore
    const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({ title: ("操作日志详情"), modelValue: ((__VLS_ctx.open)), width: ("700px"), appendToBody: (true), }));
    const __VLS_131 = __VLS_130({ title: ("操作日志详情"), modelValue: ((__VLS_ctx.open)), width: ("700px"), appendToBody: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_130));
    const __VLS_135 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */
    // @ts-ignore
    const __VLS_136 = __VLS_asFunctionalComponent(__VLS_135, new __VLS_135({ model: ((__VLS_ctx.form)), labelWidth: ("100px"), size: ("default"), }));
    const __VLS_137 = __VLS_136({ model: ((__VLS_ctx.form)), labelWidth: ("100px"), size: ("default"), }, ...__VLS_functionalComponentArgsRest(__VLS_136));
    const __VLS_141 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */
    // @ts-ignore
    const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({}));
    const __VLS_143 = __VLS_142({}, ...__VLS_functionalComponentArgsRest(__VLS_142));
    const __VLS_147 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_148 = __VLS_asFunctionalComponent(__VLS_147, new __VLS_147({ span: ((12)), }));
    const __VLS_149 = __VLS_148({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_148));
    const __VLS_153 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_154 = __VLS_asFunctionalComponent(__VLS_153, new __VLS_153({ label: ("操作人员："), }));
    const __VLS_155 = __VLS_154({ label: ("操作人员："), }, ...__VLS_functionalComponentArgsRest(__VLS_154));
    (__VLS_ctx.form.nickName);
    (__VLS_ctx.form.userName);
    __VLS_nonNullable(__VLS_158.slots).default;
    var __VLS_158;
    __VLS_nonNullable(__VLS_152.slots).default;
    var __VLS_152;
    const __VLS_159 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_160 = __VLS_asFunctionalComponent(__VLS_159, new __VLS_159({ span: ((12)), }));
    const __VLS_161 = __VLS_160({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_160));
    const __VLS_165 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_166 = __VLS_asFunctionalComponent(__VLS_165, new __VLS_165({ label: ("操作地址："), }));
    const __VLS_167 = __VLS_166({ label: ("操作地址："), }, ...__VLS_functionalComponentArgsRest(__VLS_166));
    (__VLS_ctx.form.ip);
    (__VLS_ctx.form.location);
    __VLS_nonNullable(__VLS_170.slots).default;
    var __VLS_170;
    __VLS_nonNullable(__VLS_164.slots).default;
    var __VLS_164;
    const __VLS_171 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_172 = __VLS_asFunctionalComponent(__VLS_171, new __VLS_171({ span: ((24)), }));
    const __VLS_173 = __VLS_172({ span: ((24)), }, ...__VLS_functionalComponentArgsRest(__VLS_172));
    const __VLS_177 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_178 = __VLS_asFunctionalComponent(__VLS_177, new __VLS_177({ label: ("请求地址："), }));
    const __VLS_179 = __VLS_178({ label: ("请求地址："), }, ...__VLS_functionalComponentArgsRest(__VLS_178));
    (__VLS_ctx.form.url);
    __VLS_nonNullable(__VLS_182.slots).default;
    var __VLS_182;
    __VLS_nonNullable(__VLS_176.slots).default;
    var __VLS_176;
    const __VLS_183 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_184 = __VLS_asFunctionalComponent(__VLS_183, new __VLS_183({ span: ((12)), }));
    const __VLS_185 = __VLS_184({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_184));
    const __VLS_189 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_190 = __VLS_asFunctionalComponent(__VLS_189, new __VLS_189({ label: ("请求方式："), }));
    const __VLS_191 = __VLS_190({ label: ("请求方式："), }, ...__VLS_functionalComponentArgsRest(__VLS_190));
    (__VLS_ctx.form.method);
    __VLS_nonNullable(__VLS_194.slots).default;
    var __VLS_194;
    __VLS_nonNullable(__VLS_188.slots).default;
    var __VLS_188;
    const __VLS_195 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_196 = __VLS_asFunctionalComponent(__VLS_195, new __VLS_195({ span: ((12)), }));
    const __VLS_197 = __VLS_196({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_196));
    const __VLS_201 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_202 = __VLS_asFunctionalComponent(__VLS_201, new __VLS_201({ label: ("操作状态："), }));
    const __VLS_203 = __VLS_202({ label: ("操作状态："), }, ...__VLS_functionalComponentArgsRest(__VLS_202));
    const __VLS_207 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
    /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
    // @ts-ignore
    const __VLS_208 = __VLS_asFunctionalComponent(__VLS_207, new __VLS_207({ type: ((__VLS_ctx.form.status === 200 ? 'success' : 'danger')), }));
    const __VLS_209 = __VLS_208({ type: ((__VLS_ctx.form.status === 200 ? 'success' : 'danger')), }, ...__VLS_functionalComponentArgsRest(__VLS_208));
    (__VLS_ctx.form.status === 200 ? '成功' : '失败');
    __VLS_nonNullable(__VLS_212.slots).default;
    var __VLS_212;
    __VLS_nonNullable(__VLS_206.slots).default;
    var __VLS_206;
    __VLS_nonNullable(__VLS_200.slots).default;
    var __VLS_200;
    const __VLS_213 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_214 = __VLS_asFunctionalComponent(__VLS_213, new __VLS_213({ span: ((24)), }));
    const __VLS_215 = __VLS_214({ span: ((24)), }, ...__VLS_functionalComponentArgsRest(__VLS_214));
    const __VLS_219 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_220 = __VLS_asFunctionalComponent(__VLS_219, new __VLS_219({ label: ("操作内容："), }));
    const __VLS_221 = __VLS_220({ label: ("操作内容："), }, ...__VLS_functionalComponentArgsRest(__VLS_220));
    (__VLS_ctx.form.operation);
    __VLS_nonNullable(__VLS_224.slots).default;
    var __VLS_224;
    __VLS_nonNullable(__VLS_218.slots).default;
    var __VLS_218;
    const __VLS_225 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_226 = __VLS_asFunctionalComponent(__VLS_225, new __VLS_225({ span: ((24)), }));
    const __VLS_227 = __VLS_226({ span: ((24)), }, ...__VLS_functionalComponentArgsRest(__VLS_226));
    const __VLS_231 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_232 = __VLS_asFunctionalComponent(__VLS_231, new __VLS_231({ label: ("操作时间："), }));
    const __VLS_233 = __VLS_232({ label: ("操作时间："), }, ...__VLS_functionalComponentArgsRest(__VLS_232));
    (__VLS_ctx.form.createTime);
    __VLS_nonNullable(__VLS_236.slots).default;
    var __VLS_236;
    __VLS_nonNullable(__VLS_230.slots).default;
    var __VLS_230;
    __VLS_nonNullable(__VLS_146.slots).default;
    var __VLS_146;
    __VLS_nonNullable(__VLS_140.slots).default;
    var __VLS_140;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_134.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("dialog-footer") }, });
        const __VLS_237 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_238 = __VLS_asFunctionalComponent(__VLS_237, new __VLS_237({ ...{ 'onClick': {} }, }));
        const __VLS_239 = __VLS_238({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_238));
        let __VLS_243;
        const __VLS_244 = {
            onClick: (...[$event]) => {
                __VLS_ctx.open = false;
            }
        };
        let __VLS_240;
        let __VLS_241;
        __VLS_nonNullable(__VLS_242.slots).default;
        var __VLS_242;
    }
    var __VLS_134;
    __VLS_styleScopedClasses['log-container'];
    __VLS_styleScopedClasses['p-5'];
    __VLS_styleScopedClasses['table-toolbar'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['mb-4'];
    __VLS_styleScopedClasses['left-btns'];
    __VLS_styleScopedClasses['right-btns'];
    __VLS_styleScopedClasses['table-wrapper'];
    __VLS_styleScopedClasses['bg-white'];
    __VLS_styleScopedClasses['dark:bg-dark-800'];
    __VLS_styleScopedClasses['p-5'];
    __VLS_styleScopedClasses['rounded-lg'];
    __VLS_styleScopedClasses['shadow-sm'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['flex-col'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-gray-400'];
    __VLS_styleScopedClasses['pagination-wrapper'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-end'];
    __VLS_styleScopedClasses['mt-5'];
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
            LogSearch: LogSearch,
            loading: loading,
            logList: logList,
            total: total,
            selectedIds: selectedIds,
            open: open,
            form: form,
            queryParams: queryParams,
            getList: getList,
            handleQuery: handleQuery,
            resetQuery: resetQuery,
            handleSelectionChange: handleSelectionChange,
            handleBatchDelete: handleBatchDelete,
            handleExport: handleExport,
            handleView: handleView,
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