/// <reference types="../../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { onMounted, reactive, ref, watch } from 'vue';
import { fetchProjectStudents } from '@/api/core-business/exam/project-editor';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps();
const loading = ref(false);
const tableData = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const stats = ref({});
const searchForm = reactive({
    keyword: '',
    schoolId: '',
    classId: ''
});
const statusTypeMap = {
    已完成: 'success',
    录入中: 'warning',
    待录入: 'info'
};
async function loadData() {
    if (!props.projectId)
        return;
    loading.value = true;
    try {
        const res = await fetchProjectStudents({
            projectId: props.projectId,
            current: page.value,
            size: pageSize.value,
            keyword: searchForm.keyword,
            schoolId: searchForm.schoolId || undefined,
            classId: searchForm.classId || undefined
        });
        tableData.value = res.records ?? [];
        total.value = res.total ?? 0;
        stats.value = res.stats ?? {};
    }
    finally {
        loading.value = false;
    }
}
function handleSearch() {
    page.value = 1;
    loadData();
}
function handleReset() {
    searchForm.keyword = '';
    searchForm.schoolId = '';
    searchForm.classId = '';
    page.value = 1;
    loadData();
}
watch(() => props.projectId, () => {
    page.value = 1;
    loadData();
});
onMounted(loadData);
const __VLS_exposed = {
    reload: loadData
};
defineExpose({
    reload: loadData
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
    __VLS_styleScopedClasses['summary-pill'];
    __VLS_styleScopedClasses['summary-pill'];
    __VLS_styleScopedClasses['summary-row'];
    __VLS_styleScopedClasses['filter-form'];
    __VLS_styleScopedClasses['el-form-item'];
    __VLS_styleScopedClasses['summary-row'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("student-panel") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("summary-row") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("summary-pill") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.stats.schoolCount ?? 0);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("summary-pill") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.stats.classCount ?? 0);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("summary-pill") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.stats.studentCount ?? 0);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("summary-pill") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.stats.completedCount ?? 0);
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ shadow: ("never"), ...{ class: ("filter-card") }, }));
    const __VLS_2 = __VLS_1({ shadow: ("never"), ...{ class: ("filter-card") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ inline: ((true)), model: ((__VLS_ctx.searchForm)), ...{ class: ("filter-form") }, }));
    const __VLS_8 = __VLS_7({ inline: ((true)), model: ((__VLS_ctx.searchForm)), ...{ class: ("filter-form") }, }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ label: ("关键词"), }));
    const __VLS_14 = __VLS_13({ label: ("关键词"), }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    const __VLS_18 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.searchForm.keyword)), clearable: (true), placeholder: ("姓名 / 考号"), }));
    const __VLS_20 = __VLS_19({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.searchForm.keyword)), clearable: (true), placeholder: ("姓名 / 考号"), }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    let __VLS_24;
    const __VLS_25 = {
        onKeyup: (__VLS_ctx.handleSearch)
    };
    let __VLS_21;
    let __VLS_22;
    var __VLS_23;
    __VLS_nonNullable(__VLS_17.slots).default;
    var __VLS_17;
    const __VLS_26 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({ label: ("学校"), }));
    const __VLS_28 = __VLS_27({ label: ("学校"), }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    const __VLS_32 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
    /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({ modelValue: ((__VLS_ctx.searchForm.schoolId)), clearable: (true), placeholder: ("全部学校"), ...{ style: ({}) }, }));
    const __VLS_34 = __VLS_33({ modelValue: ((__VLS_ctx.searchForm.schoolId)), clearable: (true), placeholder: ("全部学校"), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.schools))) {
        const __VLS_38 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
        /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
        // @ts-ignore
        const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({ key: ((item.schoolId)), label: ((item.schoolName)), value: ((item.schoolId)), }));
        const __VLS_40 = __VLS_39({ key: ((item.schoolId)), label: ((item.schoolName)), value: ((item.schoolId)), }, ...__VLS_functionalComponentArgsRest(__VLS_39));
    }
    __VLS_nonNullable(__VLS_37.slots).default;
    var __VLS_37;
    __VLS_nonNullable(__VLS_31.slots).default;
    var __VLS_31;
    const __VLS_44 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({ label: ("班级"), }));
    const __VLS_46 = __VLS_45({ label: ("班级"), }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    const __VLS_50 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
    /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({ modelValue: ((__VLS_ctx.searchForm.classId)), clearable: (true), placeholder: ("全部班级"), ...{ style: ({}) }, }));
    const __VLS_52 = __VLS_51({ modelValue: ((__VLS_ctx.searchForm.classId)), clearable: (true), placeholder: ("全部班级"), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.classes))) {
        const __VLS_56 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
        /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({ key: ((item.sourceClassId)), label: ((`${item.school} / ${item.grade}${item.className}`)), value: ((item.sourceClassId)), }));
        const __VLS_58 = __VLS_57({ key: ((item.sourceClassId)), label: ((`${item.school} / ${item.grade}${item.className}`)), value: ((item.sourceClassId)), }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    }
    __VLS_nonNullable(__VLS_55.slots).default;
    var __VLS_55;
    __VLS_nonNullable(__VLS_49.slots).default;
    var __VLS_49;
    const __VLS_62 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({}));
    const __VLS_64 = __VLS_63({}, ...__VLS_functionalComponentArgsRest(__VLS_63));
    const __VLS_68 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({ ...{ 'onClick': {} }, type: ("primary"), }));
    const __VLS_70 = __VLS_69({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    let __VLS_74;
    const __VLS_75 = {
        onClick: (__VLS_ctx.handleSearch)
    };
    let __VLS_71;
    let __VLS_72;
    __VLS_nonNullable(__VLS_73.slots).default;
    var __VLS_73;
    const __VLS_76 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({ ...{ 'onClick': {} }, }));
    const __VLS_78 = __VLS_77({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    let __VLS_82;
    const __VLS_83 = {
        onClick: (__VLS_ctx.handleReset)
    };
    let __VLS_79;
    let __VLS_80;
    __VLS_nonNullable(__VLS_81.slots).default;
    var __VLS_81;
    __VLS_nonNullable(__VLS_67.slots).default;
    var __VLS_67;
    __VLS_nonNullable(__VLS_11.slots).default;
    var __VLS_11;
    const __VLS_84 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({ data: ((__VLS_ctx.tableData)), stripe: (true), ...{ class: ("custom-table") }, }));
    const __VLS_86 = __VLS_85({ data: ((__VLS_ctx.tableData)), stripe: (true), ...{ class: ("custom-table") }, }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.loading) }, null, null);
    const __VLS_90 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({ prop: ("studentNo"), label: ("考号"), width: ("150"), }));
    const __VLS_92 = __VLS_91({ prop: ("studentNo"), label: ("考号"), width: ("150"), }, ...__VLS_functionalComponentArgsRest(__VLS_91));
    const __VLS_96 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({ prop: ("studentName"), label: ("姓名"), width: ("120"), }));
    const __VLS_98 = __VLS_97({ prop: ("studentName"), label: ("姓名"), width: ("120"), }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    const __VLS_102 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({ prop: ("school"), label: ("学校"), minWidth: ("180"), }));
    const __VLS_104 = __VLS_103({ prop: ("school"), label: ("学校"), minWidth: ("180"), }, ...__VLS_functionalComponentArgsRest(__VLS_103));
    const __VLS_108 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({ prop: ("grade"), label: ("年级"), width: ("100"), align: ("center"), }));
    const __VLS_110 = __VLS_109({ prop: ("grade"), label: ("年级"), width: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_109));
    const __VLS_114 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({ prop: ("className"), label: ("班级"), width: ("100"), align: ("center"), }));
    const __VLS_116 = __VLS_115({ prop: ("className"), label: ("班级"), width: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_115));
    const __VLS_120 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({ label: ("完成进度"), width: ("130"), align: ("center"), }));
    const __VLS_122 = __VLS_121({ label: ("完成进度"), width: ("130"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_121));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_125.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        (row.completedSubjectCount);
        (row.subjectCount);
    }
    var __VLS_125;
    const __VLS_126 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({ label: ("状态"), width: ("110"), align: ("center"), }));
    const __VLS_128 = __VLS_127({ label: ("状态"), width: ("110"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_127));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_131.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_132 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
        /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
        // @ts-ignore
        const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({ type: ((__VLS_ctx.statusTypeMap[row.status] ?? 'info')), }));
        const __VLS_134 = __VLS_133({ type: ((__VLS_ctx.statusTypeMap[row.status] ?? 'info')), }, ...__VLS_functionalComponentArgsRest(__VLS_133));
        (row.status);
        __VLS_nonNullable(__VLS_137.slots).default;
        var __VLS_137;
    }
    var __VLS_131;
    __VLS_nonNullable(__VLS_89.slots).default;
    var __VLS_89;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("pagination-wrap") }, });
    const __VLS_138 = __VLS_resolvedLocalAndGlobalComponents.ElPagination;
    /** @type { [typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ] } */
    // @ts-ignore
    const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({ ...{ 'onSizeChange': {} }, ...{ 'onCurrentChange': {} }, currentPage: ((__VLS_ctx.page)), pageSize: ((__VLS_ctx.pageSize)), total: ((__VLS_ctx.total)), pageSizes: (([10, 20, 50, 100])), layout: ("total, sizes, prev, pager, next, jumper"), background: (true), }));
    const __VLS_140 = __VLS_139({ ...{ 'onSizeChange': {} }, ...{ 'onCurrentChange': {} }, currentPage: ((__VLS_ctx.page)), pageSize: ((__VLS_ctx.pageSize)), total: ((__VLS_ctx.total)), pageSizes: (([10, 20, 50, 100])), layout: ("total, sizes, prev, pager, next, jumper"), background: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_139));
    let __VLS_144;
    const __VLS_145 = {
        onSizeChange: (__VLS_ctx.handleSearch)
    };
    const __VLS_146 = {
        onCurrentChange: (__VLS_ctx.loadData)
    };
    let __VLS_141;
    let __VLS_142;
    var __VLS_143;
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    __VLS_styleScopedClasses['student-panel'];
    __VLS_styleScopedClasses['summary-row'];
    __VLS_styleScopedClasses['summary-pill'];
    __VLS_styleScopedClasses['summary-pill'];
    __VLS_styleScopedClasses['summary-pill'];
    __VLS_styleScopedClasses['summary-pill'];
    __VLS_styleScopedClasses['filter-card'];
    __VLS_styleScopedClasses['filter-form'];
    __VLS_styleScopedClasses['custom-table'];
    __VLS_styleScopedClasses['pagination-wrap'];
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
            total: total,
            page: page,
            pageSize: pageSize,
            stats: stats,
            searchForm: searchForm,
            statusTypeMap: statusTypeMap,
            loadData: loadData,
            handleSearch: handleSearch,
            handleReset: handleReset,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    __typeProps: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=StudentPanel.vue.js.map