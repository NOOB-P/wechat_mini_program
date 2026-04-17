/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchGetDashboardAnalysis } from '@/api/dashboard/analysis';
import AnalysisStats from './modules/AnalysisStats.vue';
import SystemMonitor from './modules/SystemMonitor.vue';
import GrowthChart from './modules/GrowthChart.vue';
import UserDistribution from './modules/UserDistribution.vue';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'Analysis' });
const router = useRouter();
const analysisData = ref({
    stats: [],
    systemMonitor: {},
    userGrowthTrend: {},
    userDistribution: [],
    todayActivities: [],
    notices: []
});
const loadData = async () => {
    try {
        const res = await fetchGetDashboardAnalysis();
        if (res) {
            analysisData.value = res;
        }
    }
    catch (error) {
        console.error('加载仪表盘数据失败:', error);
    }
};
const goPage = (name) => {
    router.push({ name });
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
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    // @ts-ignore
    [AnalysisStats,];
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(AnalysisStats, new AnalysisStats({ data: ((__VLS_ctx.analysisData.stats)), }));
    const __VLS_1 = __VLS_0({ data: ((__VLS_ctx.analysisData.stats)), }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    const __VLS_5 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.ElRow, ] } */
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({ gutter: ((20)), }));
    const __VLS_7 = __VLS_6({ gutter: ((20)), }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    const __VLS_11 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent(__VLS_11, new __VLS_11({ xs: ((24)), lg: ((16)), }));
    const __VLS_13 = __VLS_12({ xs: ((24)), lg: ((16)), }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    // @ts-ignore
    [GrowthChart,];
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(GrowthChart, new GrowthChart({ data: ((__VLS_ctx.analysisData.userGrowthTrend)), }));
    const __VLS_18 = __VLS_17({ data: ((__VLS_ctx.analysisData.userGrowthTrend)), }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-card p-5 rounded-xl bg-white shadow-sm mb-5 max-sm:mb-4") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-between items-center mb-6") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("font-bold text-lg") }, });
    const __VLS_22 = __VLS_resolvedLocalAndGlobalComponents.ElLink;
    /** @type { [typeof __VLS_components.ElLink, typeof __VLS_components.elLink, typeof __VLS_components.ElLink, typeof __VLS_components.elLink, ] } */
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({ type: ("primary"), }));
    const __VLS_24 = __VLS_23({ type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_23));
    __VLS_nonNullable(__VLS_27.slots).default;
    var __VLS_27;
    const __VLS_28 = __VLS_resolvedLocalAndGlobalComponents.ElTimeline;
    /** @type { [typeof __VLS_components.ElTimeline, typeof __VLS_components.elTimeline, typeof __VLS_components.ElTimeline, typeof __VLS_components.elTimeline, ] } */
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
    const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
    for (const [activity, index] of __VLS_getVForSourceType((__VLS_ctx.analysisData.todayActivities))) {
        const __VLS_34 = __VLS_resolvedLocalAndGlobalComponents.ElTimelineItem;
        /** @type { [typeof __VLS_components.ElTimelineItem, typeof __VLS_components.elTimelineItem, typeof __VLS_components.ElTimelineItem, typeof __VLS_components.elTimelineItem, ] } */
        // @ts-ignore
        const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({ key: ((index)), timestamp: ((activity.time)), type: ((activity.color === 'blue' ? 'primary' : activity.color === 'green' ? 'success' : activity.color === 'orange' ? 'warning' : 'info')), }));
        const __VLS_36 = __VLS_35({ key: ((index)), timestamp: ((activity.time)), type: ((activity.color === 'blue' ? 'primary' : activity.color === 'green' ? 'success' : activity.color === 'orange' ? 'warning' : 'info')), }, ...__VLS_functionalComponentArgsRest(__VLS_35));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex flex-col") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("font-bold text-sm") }, });
        (activity.title);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-xs text-gray-500 mt-1") }, });
        (activity.content);
        __VLS_nonNullable(__VLS_39.slots).default;
        var __VLS_39;
    }
    __VLS_nonNullable(__VLS_33.slots).default;
    var __VLS_33;
    // @ts-ignore
    [SystemMonitor,];
    // @ts-ignore
    const __VLS_40 = __VLS_asFunctionalComponent(SystemMonitor, new SystemMonitor({ data: ((__VLS_ctx.analysisData.systemMonitor)), }));
    const __VLS_41 = __VLS_40({ data: ((__VLS_ctx.analysisData.systemMonitor)), }, ...__VLS_functionalComponentArgsRest(__VLS_40));
    __VLS_nonNullable(__VLS_16.slots).default;
    var __VLS_16;
    const __VLS_45 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({ xs: ((24)), lg: ((8)), }));
    const __VLS_47 = __VLS_46({ xs: ((24)), lg: ((8)), }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    // @ts-ignore
    [UserDistribution,];
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent(UserDistribution, new UserDistribution({ data: ((__VLS_ctx.analysisData.userDistribution)), }));
    const __VLS_52 = __VLS_51({ data: ((__VLS_ctx.analysisData.userDistribution)), }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-card p-5 rounded-xl bg-white shadow-sm mb-5 max-sm:mb-4") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-between items-center mb-4") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("font-bold text-lg") }, });
    const __VLS_56 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
    /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({ size: ("small"), type: ("danger"), }));
    const __VLS_58 = __VLS_57({ size: ("small"), type: ("danger"), }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    __VLS_nonNullable(__VLS_61.slots).default;
    var __VLS_61;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("space-y-3") }, });
    for (const [notice, index] of __VLS_getVForSourceType((__VLS_ctx.analysisData.notices))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ key: ((index)), ...{ class: ("p-3 bg-gray-50 rounded-lg border-l-4 border-blue-400 text-sm text-gray-600 hover:bg-gray-100 transition-colors") }, });
        (notice);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-card p-5 rounded-xl bg-white shadow-sm mb-5 max-sm:mb-4 h-80") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-between items-center mb-6") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("font-bold text-lg") }, });
    const __VLS_62 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
    /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({ type: ("info"), plain: (true), }));
    const __VLS_64 = __VLS_63({ type: ("info"), plain: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_63));
    __VLS_nonNullable(__VLS_67.slots).default;
    var __VLS_67;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("grid grid-cols-2 gap-4") }, });
    const __VLS_68 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({ ...{ 'onClick': {} }, type: ("primary"), size: ("large"), ...{ class: ("!h-12 w-full") }, plain: (true), }));
    const __VLS_70 = __VLS_69({ ...{ 'onClick': {} }, type: ("primary"), size: ("large"), ...{ class: ("!h-12 w-full") }, plain: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    let __VLS_74;
    const __VLS_75 = {
        onClick: (...[$event]) => {
            __VLS_ctx.goPage('PaperManage');
        }
    };
    let __VLS_71;
    let __VLS_72;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { icon: __VLS_thisSlot } = __VLS_nonNullable(__VLS_73.slots);
        const __VLS_76 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({ icon: ("ri:file-paper-2-line"), }));
        const __VLS_78 = __VLS_77({ icon: ("ri:file-paper-2-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    }
    var __VLS_73;
    const __VLS_82 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({ ...{ 'onClick': {} }, type: ("success"), size: ("large"), ...{ class: ("!h-12 w-full") }, plain: (true), }));
    const __VLS_84 = __VLS_83({ ...{ 'onClick': {} }, type: ("success"), size: ("large"), ...{ class: ("!h-12 w-full") }, plain: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_83));
    let __VLS_88;
    const __VLS_89 = {
        onClick: (...[$event]) => {
            __VLS_ctx.goPage('CourseManage');
        }
    };
    let __VLS_85;
    let __VLS_86;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { icon: __VLS_thisSlot } = __VLS_nonNullable(__VLS_87.slots);
        const __VLS_90 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({ icon: ("ri:book-open-line"), }));
        const __VLS_92 = __VLS_91({ icon: ("ri:book-open-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_91));
    }
    var __VLS_87;
    const __VLS_96 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({ ...{ 'onClick': {} }, type: ("warning"), size: ("large"), ...{ class: ("!h-12 w-full") }, plain: (true), }));
    const __VLS_98 = __VLS_97({ ...{ 'onClick': {} }, type: ("warning"), size: ("large"), ...{ class: ("!h-12 w-full") }, plain: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    let __VLS_102;
    const __VLS_103 = {
        onClick: (...[$event]) => {
            __VLS_ctx.goPage('StudentProfile');
        }
    };
    let __VLS_99;
    let __VLS_100;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { icon: __VLS_thisSlot } = __VLS_nonNullable(__VLS_101.slots);
        const __VLS_104 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({ icon: ("ri:user-add-line"), }));
        const __VLS_106 = __VLS_105({ icon: ("ri:user-add-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_105));
    }
    var __VLS_101;
    const __VLS_110 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({ ...{ 'onClick': {} }, type: ("info"), size: ("large"), ...{ class: ("!h-12 w-full") }, plain: (true), }));
    const __VLS_112 = __VLS_111({ ...{ 'onClick': {} }, type: ("info"), size: ("large"), ...{ class: ("!h-12 w-full") }, plain: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_111));
    let __VLS_116;
    const __VLS_117 = {
        onClick: (...[$event]) => {
            __VLS_ctx.goPage('SchoolOrg');
        }
    };
    let __VLS_113;
    let __VLS_114;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { icon: __VLS_thisSlot } = __VLS_nonNullable(__VLS_115.slots);
        const __VLS_118 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({ icon: ("ri:building-line"), }));
        const __VLS_120 = __VLS_119({ icon: ("ri:building-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_119));
    }
    var __VLS_115;
    __VLS_nonNullable(__VLS_50.slots).default;
    var __VLS_50;
    __VLS_nonNullable(__VLS_10.slots).default;
    var __VLS_10;
    __VLS_styleScopedClasses['art-card'];
    __VLS_styleScopedClasses['p-5'];
    __VLS_styleScopedClasses['rounded-xl'];
    __VLS_styleScopedClasses['bg-white'];
    __VLS_styleScopedClasses['shadow-sm'];
    __VLS_styleScopedClasses['mb-5'];
    __VLS_styleScopedClasses['max-sm:mb-4'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['mb-6'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['text-lg'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['flex-col'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-gray-500'];
    __VLS_styleScopedClasses['mt-1'];
    __VLS_styleScopedClasses['art-card'];
    __VLS_styleScopedClasses['p-5'];
    __VLS_styleScopedClasses['rounded-xl'];
    __VLS_styleScopedClasses['bg-white'];
    __VLS_styleScopedClasses['shadow-sm'];
    __VLS_styleScopedClasses['mb-5'];
    __VLS_styleScopedClasses['max-sm:mb-4'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['mb-4'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['text-lg'];
    __VLS_styleScopedClasses['space-y-3'];
    __VLS_styleScopedClasses['p-3'];
    __VLS_styleScopedClasses['bg-gray-50'];
    __VLS_styleScopedClasses['rounded-lg'];
    __VLS_styleScopedClasses['border-l-4'];
    __VLS_styleScopedClasses['border-blue-400'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['text-gray-600'];
    __VLS_styleScopedClasses['hover:bg-gray-100'];
    __VLS_styleScopedClasses['transition-colors'];
    __VLS_styleScopedClasses['art-card'];
    __VLS_styleScopedClasses['p-5'];
    __VLS_styleScopedClasses['rounded-xl'];
    __VLS_styleScopedClasses['bg-white'];
    __VLS_styleScopedClasses['shadow-sm'];
    __VLS_styleScopedClasses['mb-5'];
    __VLS_styleScopedClasses['max-sm:mb-4'];
    __VLS_styleScopedClasses['h-80'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['mb-6'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['text-lg'];
    __VLS_styleScopedClasses['grid'];
    __VLS_styleScopedClasses['grid-cols-2'];
    __VLS_styleScopedClasses['gap-4'];
    __VLS_styleScopedClasses['!h-12'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['!h-12'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['!h-12'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['!h-12'];
    __VLS_styleScopedClasses['w-full'];
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
            AnalysisStats: AnalysisStats,
            SystemMonitor: SystemMonitor,
            GrowthChart: GrowthChart,
            UserDistribution: UserDistribution,
            analysisData: analysisData,
            goPage: goPage,
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