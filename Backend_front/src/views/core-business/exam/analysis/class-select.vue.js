/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { fetchAnalysisClassSelect } from '@/api/core-business/exam/analysis/class-select';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const route = useRoute();
const router = useRouter();
const projectId = route.query.projectId;
const projectName = route.query.projectName;
const activeSchool = ref('1');
const schoolList = ref([]);
const goBack = () => {
    router.push({ name: 'ExamAnalysisList' });
};
const handleClassClick = (school, cls) => {
    router.push({
        name: 'ExamAnalysisClassDashboard',
        query: {
            projectId,
            projectName,
            schoolId: school.id,
            schoolName: school.name,
            classId: cls.id,
            className: cls.name
        }
    });
};
onMounted(() => {
    fetchAnalysisClassSelect(projectId)
        .then((res) => {
        schoolList.value = res.schools || [];
        if (schoolList.value.length > 0) {
            activeSchool.value = schoolList.value[0].id;
        }
    })
        .catch((error) => {
        ElMessage.error(error.message || '加载班级分析数据失败');
    });
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
    __VLS_styleScopedClasses['class-card'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("page-container") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElPageHeader;
    /** @type { [typeof __VLS_components.ElPageHeader, typeof __VLS_components.elPageHeader, typeof __VLS_components.ElPageHeader, typeof __VLS_components.elPageHeader, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onBack': {} }, ...{ class: ("mb-6") }, }));
    const __VLS_2 = __VLS_1({ ...{ 'onBack': {} }, ...{ class: ("mb-6") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_6;
    const __VLS_7 = {
        onBack: (__VLS_ctx.goBack)
    };
    let __VLS_3;
    let __VLS_4;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { content: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-large font-600 mr-3") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-sm text-gray-500") }, });
        (__VLS_ctx.projectName);
    }
    var __VLS_5;
    const __VLS_8 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({ shadow: ("never"), ...{ class: ("mb-4") }, }));
    const __VLS_10 = __VLS_9({ shadow: ("never"), ...{ class: ("mb-4") }, }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ElTabs;
    /** @type { [typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, ] } */
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ modelValue: ((__VLS_ctx.activeSchool)), }));
    const __VLS_16 = __VLS_15({ modelValue: ((__VLS_ctx.activeSchool)), }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    for (const [school] of __VLS_getVForSourceType((__VLS_ctx.schoolList))) {
        const __VLS_20 = __VLS_resolvedLocalAndGlobalComponents.ElTabPane;
        /** @type { [typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ] } */
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({ key: ((school.id)), label: ((school.name)), name: ((school.id)), }));
        const __VLS_22 = __VLS_21({ key: ((school.id)), label: ((school.name)), name: ((school.id)), }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("class-grid") }, });
        const __VLS_26 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
        /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */
        // @ts-ignore
        const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({ gutter: ((20)), }));
        const __VLS_28 = __VLS_27({ gutter: ((20)), }, ...__VLS_functionalComponentArgsRest(__VLS_27));
        for (const [cls] of __VLS_getVForSourceType((school.classes))) {
            const __VLS_32 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
            /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
            // @ts-ignore
            const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({ span: ((6)), key: ((cls.id)), ...{ class: ("mb-4") }, }));
            const __VLS_34 = __VLS_33({ span: ((6)), key: ((cls.id)), ...{ class: ("mb-4") }, }, ...__VLS_functionalComponentArgsRest(__VLS_33));
            const __VLS_38 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
            /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
            // @ts-ignore
            const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({ ...{ 'onClick': {} }, shadow: ("hover"), ...{ class: ("class-card") }, }));
            const __VLS_40 = __VLS_39({ ...{ 'onClick': {} }, shadow: ("hover"), ...{ class: ("class-card") }, }, ...__VLS_functionalComponentArgsRest(__VLS_39));
            let __VLS_44;
            const __VLS_45 = {
                onClick: (...[$event]) => {
                    __VLS_ctx.handleClassClick(school, cls);
                }
            };
            let __VLS_41;
            let __VLS_42;
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("class-info") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("class-name") }, });
            (cls.name);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("class-stats mt-4") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-between items-center mb-2") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("label") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("value") }, });
            (cls.studentCount);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-between items-center mb-2") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("label") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("value") }, });
            (cls.avgScore);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-between items-center") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("label") }, });
            const __VLS_46 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
            /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
            // @ts-ignore
            const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({ size: ("small"), type: ((cls.passRate >= 70 ? 'success' : 'warning')), }));
            const __VLS_48 = __VLS_47({ size: ("small"), type: ((cls.passRate >= 70 ? 'success' : 'warning')), }, ...__VLS_functionalComponentArgsRest(__VLS_47));
            (cls.passRate);
            __VLS_nonNullable(__VLS_51.slots).default;
            var __VLS_51;
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-4 text-center") }, });
            const __VLS_52 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({ type: ("primary"), size: ("small"), }));
            const __VLS_54 = __VLS_53({ type: ("primary"), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_53));
            __VLS_nonNullable(__VLS_57.slots).default;
            var __VLS_57;
            __VLS_nonNullable(__VLS_43.slots).default;
            var __VLS_43;
            __VLS_nonNullable(__VLS_37.slots).default;
            var __VLS_37;
        }
        __VLS_nonNullable(__VLS_31.slots).default;
        var __VLS_31;
        __VLS_nonNullable(__VLS_25.slots).default;
        var __VLS_25;
    }
    __VLS_nonNullable(__VLS_19.slots).default;
    var __VLS_19;
    __VLS_nonNullable(__VLS_13.slots).default;
    var __VLS_13;
    __VLS_styleScopedClasses['page-container'];
    __VLS_styleScopedClasses['mb-6'];
    __VLS_styleScopedClasses['text-large'];
    __VLS_styleScopedClasses['font-600'];
    __VLS_styleScopedClasses['mr-3'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['text-gray-500'];
    __VLS_styleScopedClasses['mb-4'];
    __VLS_styleScopedClasses['class-grid'];
    __VLS_styleScopedClasses['mb-4'];
    __VLS_styleScopedClasses['class-card'];
    __VLS_styleScopedClasses['class-info'];
    __VLS_styleScopedClasses['class-name'];
    __VLS_styleScopedClasses['class-stats'];
    __VLS_styleScopedClasses['mt-4'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['mb-2'];
    __VLS_styleScopedClasses['label'];
    __VLS_styleScopedClasses['value'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['mb-2'];
    __VLS_styleScopedClasses['label'];
    __VLS_styleScopedClasses['value'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['label'];
    __VLS_styleScopedClasses['mt-4'];
    __VLS_styleScopedClasses['text-center'];
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
            projectName: projectName,
            activeSchool: activeSchool,
            schoolList: schoolList,
            goBack: goBack,
            handleClassClick: handleClassClick,
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
//# sourceMappingURL=class-select.vue.js.map