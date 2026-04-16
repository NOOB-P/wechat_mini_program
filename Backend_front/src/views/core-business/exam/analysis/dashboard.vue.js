/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { fetchAnalysisProjectDashboard } from '@/api/core-business/exam/analysis/dashboard';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const router = useRouter();
const route = useRoute();
const projectId = ref(String(route.query.projectId || ''));
const projectName = ref(route.query.projectName || '未知考试项目');
const coreMetrics = ref([]);
const schoolRanking = ref([]);
const classRanking = ref([]);
const scoreDistribution = ref([]);
const subjectPassRates = ref([]);
const scoreDistChart = ref();
const subjectPassChart = ref();
let chartInstances = [];
const initCharts = () => {
    if (scoreDistChart.value) {
        const chart = echarts.init(scoreDistChart.value);
        chart.setOption({
            tooltip: { trigger: 'axis' },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: { type: 'category', data: scoreDistribution.value.map((item) => item.label) },
            yAxis: { type: 'value', name: '人数' },
            series: [
                {
                    data: scoreDistribution.value.map((item) => item.count),
                    type: 'line',
                    smooth: true,
                    areaStyle: { opacity: 0.3 },
                    color: '#409EFF'
                }
            ]
        });
        chartInstances.push(chart);
    }
    if (subjectPassChart.value) {
        const chart = echarts.init(subjectPassChart.value);
        chart.setOption({
            radar: {
                indicator: subjectPassRates.value.map((item) => ({ name: item.subjectName, max: 100 }))
            },
            series: [
                {
                    type: 'radar',
                    data: [
                        {
                            value: subjectPassRates.value.map((item) => item.passRate),
                            name: '及格率',
                            areaStyle: { color: 'rgba(103, 194, 58, 0.5)' },
                            lineStyle: { color: '#67C23A' }
                        }
                    ]
                }
            ]
        });
        chartInstances.push(chart);
    }
};
const handleResize = () => {
    chartInstances.forEach((instance) => instance.resize());
};
const goBack = () => {
    router.push({ name: 'ExamAnalysisList' });
};
const loadData = async () => {
    if (!projectId.value) {
        ElMessage.error('缺少项目ID');
        return;
    }
    try {
        const res = await fetchAnalysisProjectDashboard(projectId.value);
        projectName.value = res.project?.name || projectName.value;
        coreMetrics.value = res.coreMetrics || [];
        schoolRanking.value = res.schoolRanking || [];
        classRanking.value = res.classRanking || [];
        scoreDistribution.value = res.scoreDistribution || [];
        subjectPassRates.value = res.subjectPassRates || [];
        await nextTick();
        chartInstances.forEach((instance) => instance.dispose());
        chartInstances = [];
        initCharts();
    }
    catch (error) {
        ElMessage.error(error.message || '加载分析大屏失败');
    }
};
onMounted(() => {
    loadData();
    window.addEventListener('resize', handleResize);
});
onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    chartInstances.forEach((instance) => instance.dispose());
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("page-container dashboard-container") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElPageHeader;
    /** @type { [typeof __VLS_components.ElPageHeader, typeof __VLS_components.elPageHeader, typeof __VLS_components.ElPageHeader, typeof __VLS_components.elPageHeader, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onBack': {} }, ...{ class: ("mb-4") }, }));
    const __VLS_2 = __VLS_1({ ...{ 'onBack': {} }, ...{ class: ("mb-4") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
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
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-sm mr-2") }, ...{ style: ({}) }, });
        (__VLS_ctx.projectName);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { extra: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex items-center") }, });
        const __VLS_8 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({ type: ("primary"), size: ("small"), }));
        const __VLS_10 = __VLS_9({ type: ("primary"), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_9));
        __VLS_nonNullable(__VLS_13.slots).default;
        var __VLS_13;
    }
    var __VLS_5;
    const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ gutter: ((20)), ...{ class: ("mb-6") }, }));
    const __VLS_16 = __VLS_15({ gutter: ((20)), ...{ class: ("mb-6") }, }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.coreMetrics))) {
        const __VLS_20 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({ span: ((6)), key: ((item.label)), }));
        const __VLS_22 = __VLS_21({ span: ((6)), key: ((item.label)), }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        const __VLS_26 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
        // @ts-ignore
        const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({ shadow: ("never"), ...{ class: ("metric-card") }, }));
        const __VLS_28 = __VLS_27({ shadow: ("never"), ...{ class: ("metric-card") }, }, ...__VLS_functionalComponentArgsRest(__VLS_27));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("metric-content") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("metric-label") }, });
        (item.label);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("metric-value") }, ...{ style: (({ color: item.color })) }, });
        (item.value);
        (item.unit || '');
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("metric-footer") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ((item.trend >= 0 ? 'text-success' : 'text-danger')) }, });
        (item.trend >= 0 ? '↑' : '↓');
        (Math.abs(item.trend));
        __VLS_nonNullable(__VLS_31.slots).default;
        var __VLS_31;
        __VLS_nonNullable(__VLS_25.slots).default;
        var __VLS_25;
    }
    __VLS_nonNullable(__VLS_19.slots).default;
    var __VLS_19;
    const __VLS_32 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({ gutter: ((20)), ...{ class: ("mb-6") }, }));
    const __VLS_34 = __VLS_33({ gutter: ((20)), ...{ class: ("mb-6") }, }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    const __VLS_38 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({ span: ((16)), }));
    const __VLS_40 = __VLS_39({ span: ((16)), }, ...__VLS_functionalComponentArgsRest(__VLS_39));
    const __VLS_44 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({ shadow: ("never"), header: ("成绩分布趋势"), }));
    const __VLS_46 = __VLS_45({ shadow: ("never"), header: ("成绩分布趋势"), }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ref: ("scoreDistChart"), ...{ class: ("chart-box") }, });
    // @ts-ignore navigation for `const scoreDistChart = ref()`
    __VLS_ctx.scoreDistChart;
    __VLS_nonNullable(__VLS_49.slots).default;
    var __VLS_49;
    __VLS_nonNullable(__VLS_43.slots).default;
    var __VLS_43;
    const __VLS_50 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({ span: ((8)), }));
    const __VLS_52 = __VLS_51({ span: ((8)), }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    const __VLS_56 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({ shadow: ("never"), header: ("科目合格率对比"), }));
    const __VLS_58 = __VLS_57({ shadow: ("never"), header: ("科目合格率对比"), }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ref: ("subjectPassChart"), ...{ class: ("chart-box") }, });
    // @ts-ignore navigation for `const subjectPassChart = ref()`
    __VLS_ctx.subjectPassChart;
    __VLS_nonNullable(__VLS_61.slots).default;
    var __VLS_61;
    __VLS_nonNullable(__VLS_55.slots).default;
    var __VLS_55;
    __VLS_nonNullable(__VLS_37.slots).default;
    var __VLS_37;
    const __VLS_62 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({ gutter: ((20)), }));
    const __VLS_64 = __VLS_63({ gutter: ((20)), }, ...__VLS_functionalComponentArgsRest(__VLS_63));
    const __VLS_68 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({ span: ((12)), }));
    const __VLS_70 = __VLS_69({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    const __VLS_74 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({ shadow: ("never"), }));
    const __VLS_76 = __VLS_75({ shadow: ("never"), }, ...__VLS_functionalComponentArgsRest(__VLS_75));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { header: __VLS_thisSlot } = __VLS_nonNullable(__VLS_79.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-between items-center") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("font-bold") }, });
        const __VLS_80 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({ link: (true), type: ("primary"), }));
        const __VLS_82 = __VLS_81({ link: (true), type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_81));
        __VLS_nonNullable(__VLS_85.slots).default;
        var __VLS_85;
    }
    const __VLS_86 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
    // @ts-ignore
    const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({ data: ((__VLS_ctx.schoolRanking)), size: ("small"), border: (true), ...{ style: ({}) }, }));
    const __VLS_88 = __VLS_87({ data: ((__VLS_ctx.schoolRanking)), size: ("small"), border: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_87));
    const __VLS_92 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({ type: ("index"), label: ("排名"), width: ("60"), align: ("center"), }));
    const __VLS_94 = __VLS_93({ type: ("index"), label: ("排名"), width: ("60"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_93));
    const __VLS_98 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({ prop: ("name"), label: ("学校名称"), minWidth: ("150"), }));
    const __VLS_100 = __VLS_99({ prop: ("name"), label: ("学校名称"), minWidth: ("150"), }, ...__VLS_functionalComponentArgsRest(__VLS_99));
    const __VLS_104 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({ prop: ("avgScore"), label: ("平均分"), minWidth: ("90"), align: ("center"), sortable: (true), }));
    const __VLS_106 = __VLS_105({ prop: ("avgScore"), label: ("平均分"), minWidth: ("90"), align: ("center"), sortable: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_105));
    const __VLS_110 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({ prop: ("passRate"), label: ("及格率"), minWidth: ("90"), align: ("center"), sortable: (true), }));
    const __VLS_112 = __VLS_111({ prop: ("passRate"), label: ("及格率"), minWidth: ("90"), align: ("center"), sortable: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_111));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_115.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        (row.passRate);
    }
    var __VLS_115;
    const __VLS_116 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({ prop: ("excellentRate"), label: ("优秀率"), minWidth: ("90"), align: ("center"), sortable: (true), }));
    const __VLS_118 = __VLS_117({ prop: ("excellentRate"), label: ("优秀率"), minWidth: ("90"), align: ("center"), sortable: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_117));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_121.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        (row.excellentRate);
    }
    var __VLS_121;
    const __VLS_122 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_123 = __VLS_asFunctionalComponent(__VLS_122, new __VLS_122({ prop: ("lowRate"), label: ("低分率"), minWidth: ("90"), align: ("center"), sortable: (true), }));
    const __VLS_124 = __VLS_123({ prop: ("lowRate"), label: ("低分率"), minWidth: ("90"), align: ("center"), sortable: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_123));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_127.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        (row.lowRate);
    }
    var __VLS_127;
    __VLS_nonNullable(__VLS_91.slots).default;
    var __VLS_91;
    var __VLS_79;
    __VLS_nonNullable(__VLS_73.slots).default;
    var __VLS_73;
    const __VLS_128 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({ span: ((12)), }));
    const __VLS_130 = __VLS_129({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_129));
    const __VLS_134 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_135 = __VLS_asFunctionalComponent(__VLS_134, new __VLS_134({ shadow: ("never"), }));
    const __VLS_136 = __VLS_135({ shadow: ("never"), }, ...__VLS_functionalComponentArgsRest(__VLS_135));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { header: __VLS_thisSlot } = __VLS_nonNullable(__VLS_139.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-between items-center") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("font-bold") }, });
        const __VLS_140 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({ link: (true), type: ("primary"), }));
        const __VLS_142 = __VLS_141({ link: (true), type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_141));
        __VLS_nonNullable(__VLS_145.slots).default;
        var __VLS_145;
    }
    const __VLS_146 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
    // @ts-ignore
    const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({ data: ((__VLS_ctx.classRanking)), size: ("small"), border: (true), ...{ style: ({}) }, }));
    const __VLS_148 = __VLS_147({ data: ((__VLS_ctx.classRanking)), size: ("small"), border: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_147));
    const __VLS_152 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({ type: ("index"), label: ("排名"), width: ("60"), align: ("center"), }));
    const __VLS_154 = __VLS_153({ type: ("index"), label: ("排名"), width: ("60"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_153));
    const __VLS_158 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158({ prop: ("className"), label: ("学校/班级"), minWidth: ("150"), }));
    const __VLS_160 = __VLS_159({ prop: ("className"), label: ("学校/班级"), minWidth: ("150"), }, ...__VLS_functionalComponentArgsRest(__VLS_159));
    const __VLS_164 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({ prop: ("avgScore"), label: ("平均分"), minWidth: ("90"), align: ("center"), sortable: (true), }));
    const __VLS_166 = __VLS_165({ prop: ("avgScore"), label: ("平均分"), minWidth: ("90"), align: ("center"), sortable: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_165));
    const __VLS_170 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_171 = __VLS_asFunctionalComponent(__VLS_170, new __VLS_170({ prop: ("passRate"), label: ("及格率"), minWidth: ("90"), align: ("center"), sortable: (true), }));
    const __VLS_172 = __VLS_171({ prop: ("passRate"), label: ("及格率"), minWidth: ("90"), align: ("center"), sortable: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_171));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_175.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        (row.passRate);
    }
    var __VLS_175;
    const __VLS_176 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({ prop: ("excellentRate"), label: ("优秀率"), minWidth: ("90"), align: ("center"), sortable: (true), }));
    const __VLS_178 = __VLS_177({ prop: ("excellentRate"), label: ("优秀率"), minWidth: ("90"), align: ("center"), sortable: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_177));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_181.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        (row.excellentRate);
    }
    var __VLS_181;
    const __VLS_182 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_183 = __VLS_asFunctionalComponent(__VLS_182, new __VLS_182({ prop: ("lowRate"), label: ("低分率"), minWidth: ("90"), align: ("center"), sortable: (true), }));
    const __VLS_184 = __VLS_183({ prop: ("lowRate"), label: ("低分率"), minWidth: ("90"), align: ("center"), sortable: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_183));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_187.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        (row.lowRate);
    }
    var __VLS_187;
    __VLS_nonNullable(__VLS_151.slots).default;
    var __VLS_151;
    var __VLS_139;
    __VLS_nonNullable(__VLS_133.slots).default;
    var __VLS_133;
    __VLS_nonNullable(__VLS_67.slots).default;
    var __VLS_67;
    __VLS_styleScopedClasses['page-container'];
    __VLS_styleScopedClasses['dashboard-container'];
    __VLS_styleScopedClasses['mb-4'];
    __VLS_styleScopedClasses['text-large'];
    __VLS_styleScopedClasses['font-600'];
    __VLS_styleScopedClasses['mr-3'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['mr-2'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['mb-6'];
    __VLS_styleScopedClasses['metric-card'];
    __VLS_styleScopedClasses['metric-content'];
    __VLS_styleScopedClasses['metric-label'];
    __VLS_styleScopedClasses['metric-value'];
    __VLS_styleScopedClasses['metric-footer'];
    __VLS_styleScopedClasses['mb-6'];
    __VLS_styleScopedClasses['chart-box'];
    __VLS_styleScopedClasses['chart-box'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['font-bold'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "scoreDistChart": __VLS_nativeElements['div'],
        "subjectPassChart": __VLS_nativeElements['div'],
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
            projectName: projectName,
            coreMetrics: coreMetrics,
            schoolRanking: schoolRanking,
            classRanking: classRanking,
            scoreDistChart: scoreDistChart,
            subjectPassChart: subjectPassChart,
            goBack: goBack,
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
//# sourceMappingURL=dashboard.vue.js.map