/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { fetchAnalysisProjects } from '@/api/core-business/exam/analysis/list';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const router = useRouter();
const searchForm = ref({
    name: ''
});
const tableData = ref([]);
const loadData = async () => {
    try {
        const res = await fetchAnalysisProjects({ name: searchForm.value.name || undefined });
        tableData.value = res.records || [];
    }
    catch (error) {
        ElMessage.error(error.message || '加载分析项目失败');
    }
};
const handleSearch = () => {
    loadData();
};
const resetSearch = () => {
    searchForm.value.name = '';
    loadData();
};
const handleEnter = (item) => {
    router.push({
        name: 'ExamAnalysisDashboard',
        query: { projectId: item.id, projectName: item.name }
    });
};
const handleSelectClass = (item) => {
    router.push({
        name: 'ExamAnalysisClassSelect',
        query: { projectId: item.id, projectName: item.name }
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
    __VLS_styleScopedClasses['project-card'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("page-container") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ shadow: ("never"), ...{ class: ("search-card mb-4") }, }));
    const __VLS_2 = __VLS_1({ shadow: ("never"), ...{ class: ("search-card mb-4") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { header: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-between items-center") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("font-bold") }, });
    }
    const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ inline: ((true)), model: ((__VLS_ctx.searchForm)), ...{ class: ("search-form-inline") }, }));
    const __VLS_8 = __VLS_7({ inline: ((true)), model: ((__VLS_ctx.searchForm)), ...{ class: ("search-form-inline") }, }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ label: ("考试项目"), }));
    const __VLS_14 = __VLS_13({ label: ("考试项目"), }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    const __VLS_18 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.searchForm.name)), placeholder: ("请输入考试项目名称"), clearable: (true), }));
    const __VLS_20 = __VLS_19({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.searchForm.name)), placeholder: ("请输入考试项目名称"), clearable: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_19));
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
    const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({}));
    const __VLS_28 = __VLS_27({}, ...__VLS_functionalComponentArgsRest(__VLS_27));
    const __VLS_32 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({ ...{ 'onClick': {} }, type: ("primary"), }));
    const __VLS_34 = __VLS_33({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_38;
    const __VLS_39 = {
        onClick: (__VLS_ctx.handleSearch)
    };
    let __VLS_35;
    let __VLS_36;
    __VLS_nonNullable(__VLS_37.slots).default;
    var __VLS_37;
    const __VLS_40 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({ ...{ 'onClick': {} }, }));
    const __VLS_42 = __VLS_41({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    let __VLS_46;
    const __VLS_47 = {
        onClick: (__VLS_ctx.resetSearch)
    };
    let __VLS_43;
    let __VLS_44;
    __VLS_nonNullable(__VLS_45.slots).default;
    var __VLS_45;
    __VLS_nonNullable(__VLS_31.slots).default;
    var __VLS_31;
    __VLS_nonNullable(__VLS_11.slots).default;
    var __VLS_11;
    var __VLS_5;
    const __VLS_48 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({ gutter: ((20)), }));
    const __VLS_50 = __VLS_49({ gutter: ((20)), }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.tableData))) {
        const __VLS_54 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
        // @ts-ignore
        const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({ span: ((8)), key: ((item.id)), ...{ class: ("mb-4") }, }));
        const __VLS_56 = __VLS_55({ span: ((8)), key: ((item.id)), ...{ class: ("mb-4") }, }, ...__VLS_functionalComponentArgsRest(__VLS_55));
        const __VLS_60 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
        // @ts-ignore
        const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({ ...{ 'onClick': {} }, shadow: ("hover"), ...{ class: ("project-card") }, }));
        const __VLS_62 = __VLS_61({ ...{ 'onClick': {} }, shadow: ("hover"), ...{ class: ("project-card") }, }, ...__VLS_functionalComponentArgsRest(__VLS_61));
        let __VLS_66;
        const __VLS_67 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleEnter(item);
            }
        };
        let __VLS_63;
        let __VLS_64;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("project-info") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("project-name") }, });
        (item.name);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("project-meta") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (item.createTime);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("project-stats mt-4 flex justify-around text-center") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stat-value") }, });
        (item.schoolCount);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stat-label") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stat-value") }, });
        (item.classCount);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stat-label") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stat-value") }, });
        (item.studentCount);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stat-label") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-4 text-right flex justify-end gap-2") }, });
        const __VLS_68 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({ ...{ 'onClick': {} }, type: ("primary"), plain: (true), size: ("small"), }));
        const __VLS_70 = __VLS_69({ ...{ 'onClick': {} }, type: ("primary"), plain: (true), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_69));
        let __VLS_74;
        const __VLS_75 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleEnter(item);
            }
        };
        let __VLS_71;
        let __VLS_72;
        __VLS_nonNullable(__VLS_73.slots).default;
        var __VLS_73;
        const __VLS_76 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({ ...{ 'onClick': {} }, type: ("success"), plain: (true), size: ("small"), }));
        const __VLS_78 = __VLS_77({ ...{ 'onClick': {} }, type: ("success"), plain: (true), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_77));
        let __VLS_82;
        const __VLS_83 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleSelectClass(item);
            }
        };
        let __VLS_79;
        let __VLS_80;
        __VLS_nonNullable(__VLS_81.slots).default;
        var __VLS_81;
        __VLS_nonNullable(__VLS_65.slots).default;
        var __VLS_65;
        __VLS_nonNullable(__VLS_59.slots).default;
        var __VLS_59;
    }
    __VLS_nonNullable(__VLS_53.slots).default;
    var __VLS_53;
    __VLS_styleScopedClasses['page-container'];
    __VLS_styleScopedClasses['search-card'];
    __VLS_styleScopedClasses['mb-4'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['search-form-inline'];
    __VLS_styleScopedClasses['mb-4'];
    __VLS_styleScopedClasses['project-card'];
    __VLS_styleScopedClasses['project-info'];
    __VLS_styleScopedClasses['project-name'];
    __VLS_styleScopedClasses['project-meta'];
    __VLS_styleScopedClasses['project-stats'];
    __VLS_styleScopedClasses['mt-4'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-around'];
    __VLS_styleScopedClasses['text-center'];
    __VLS_styleScopedClasses['stat-value'];
    __VLS_styleScopedClasses['stat-label'];
    __VLS_styleScopedClasses['stat-value'];
    __VLS_styleScopedClasses['stat-label'];
    __VLS_styleScopedClasses['stat-value'];
    __VLS_styleScopedClasses['stat-label'];
    __VLS_styleScopedClasses['mt-4'];
    __VLS_styleScopedClasses['text-right'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-end'];
    __VLS_styleScopedClasses['gap-2'];
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
            searchForm: searchForm,
            tableData: tableData,
            handleSearch: handleSearch,
            resetSearch: resetSearch,
            handleEnter: handleEnter,
            handleSelectClass: handleSelectClass,
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
//# sourceMappingURL=list.vue.js.map