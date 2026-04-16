/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, onMounted } from 'vue';
import { fetchGetStudyRoomApplyList, fetchHandleStudyRoomApply } from '@/api/course-study/study-room/index';
import { ElMessage, ElMessageBox } from 'element-plus';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const loading = ref(false);
const tableData = ref([]);
const loadData = async () => {
    loading.value = true;
    const res = await fetchGetStudyRoomApplyList({});
    if (res.code === 200) {
        tableData.value = res.data.list;
    }
    loading.value = false;
};
const statusTypeMap = {
    pending: 'warning',
    confirmed: 'success',
    rejected: 'danger'
};
const getStatusType = (status) => {
    return statusTypeMap[status] || 'info';
};
const getStatusLabel = (status) => {
    const labels = {
        pending: '待处理',
        confirmed: '已确认',
        rejected: '已拒绝'
    };
    return labels[status] || '未知';
};
const handleApply = (row, status) => {
    const action = status === 'confirmed' ? '确认' : '拒绝';
    ElMessageBox.confirm(`确定要${action}该家长的报名申请吗?`, '提示', {
        type: status === 'confirmed' ? 'success' : 'warning'
    }).then(async () => {
        const res = await fetchHandleStudyRoomApply(row.id, status);
        if (res.code === 200) {
            ElMessage.success(res.msg);
            loadData();
        }
    });
};
onMounted(() => {
    loadData();
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("page-container") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ shadow: ("never"), }));
    const __VLS_2 = __VLS_1({ shadow: ("never"), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { header: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("font-bold") }, });
    }
    const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ data: ((__VLS_ctx.tableData)), border: (true), }));
    const __VLS_8 = __VLS_7({ data: ((__VLS_ctx.tableData)), border: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.loading) }, null, null);
    const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ prop: ("parentName"), label: ("家长姓名"), width: ("120"), }));
    const __VLS_14 = __VLS_13({ prop: ("parentName"), label: ("家长姓名"), width: ("120"), }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    const __VLS_18 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({ prop: ("studentName"), label: ("学生姓名"), width: ("120"), }));
    const __VLS_20 = __VLS_19({ prop: ("studentName"), label: ("学生姓名"), width: ("120"), }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    const __VLS_24 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({ prop: ("phone"), label: ("联系电话"), width: ("150"), }));
    const __VLS_26 = __VLS_25({ prop: ("phone"), label: ("联系电话"), width: ("150"), }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    const __VLS_30 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({ prop: ("applyTime"), label: ("报名时间"), width: ("180"), }));
    const __VLS_32 = __VLS_31({ prop: ("applyTime"), label: ("报名时间"), width: ("180"), }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    const __VLS_36 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({ label: ("状态"), width: ("100"), }));
    const __VLS_38 = __VLS_37({ label: ("状态"), width: ("100"), }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_41.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_42 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
        /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
        // @ts-ignore
        const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({ type: ((__VLS_ctx.getStatusType(row.status))), }));
        const __VLS_44 = __VLS_43({ type: ((__VLS_ctx.getStatusType(row.status))), }, ...__VLS_functionalComponentArgsRest(__VLS_43));
        (__VLS_ctx.getStatusLabel(row.status));
        __VLS_nonNullable(__VLS_47.slots).default;
        var __VLS_47;
    }
    var __VLS_41;
    const __VLS_48 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({ prop: ("remark"), label: ("备注"), minWidth: ("150"), showOverflowTooltip: (true), }));
    const __VLS_50 = __VLS_49({ prop: ("remark"), label: ("备注"), minWidth: ("150"), showOverflowTooltip: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    const __VLS_54 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({ label: ("操作"), width: ("180"), fixed: ("right"), }));
    const __VLS_56 = __VLS_55({ label: ("操作"), width: ("180"), fixed: ("right"), }, ...__VLS_functionalComponentArgsRest(__VLS_55));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_59.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        if (row.status === 'pending') {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
            const __VLS_60 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }));
            const __VLS_62 = __VLS_61({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_61));
            let __VLS_66;
            const __VLS_67 = {
                onClick: (...[$event]) => {
                    if (!((row.status === 'pending')))
                        return;
                    __VLS_ctx.handleApply(row, 'confirmed');
                }
            };
            let __VLS_63;
            let __VLS_64;
            __VLS_nonNullable(__VLS_65.slots).default;
            var __VLS_65;
            const __VLS_68 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({ ...{ 'onClick': {} }, link: (true), type: ("danger"), }));
            const __VLS_70 = __VLS_69({ ...{ 'onClick': {} }, link: (true), type: ("danger"), }, ...__VLS_functionalComponentArgsRest(__VLS_69));
            let __VLS_74;
            const __VLS_75 = {
                onClick: (...[$event]) => {
                    if (!((row.status === 'pending')))
                        return;
                    __VLS_ctx.handleApply(row, 'rejected');
                }
            };
            let __VLS_71;
            let __VLS_72;
            __VLS_nonNullable(__VLS_73.slots).default;
            var __VLS_73;
        }
        else {
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-gray-400 text-sm") }, });
        }
    }
    var __VLS_59;
    __VLS_nonNullable(__VLS_11.slots).default;
    var __VLS_11;
    var __VLS_5;
    __VLS_styleScopedClasses['page-container'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['text-gray-400'];
    __VLS_styleScopedClasses['text-sm'];
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
            loading: loading,
            tableData: tableData,
            getStatusType: getStatusType,
            getStatusLabel: getStatusLabel,
            handleApply: handleApply,
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