/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { fetchAnalysisStudentSubjectReport } from '@/api/core-business/exam/analysis/student-subject-report';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const route = useRoute();
const router = useRouter();
const projectId = route.query.projectId;
const projectName = route.query.projectName;
const schoolId = route.query.schoolId;
const schoolName = route.query.schoolName;
const classId = route.query.classId;
const className = route.query.className;
const studentNo = String(route.query.studentNo || route.query.studentId || '');
const studentName = route.query.studentName;
const subjectName = route.query.subjectName;
const distChart = ref();
const knowledgeChart = ref();
let chartInstances = [];
const subjectDetail = ref({
    score: 0,
    grade: 'C',
    fullScore: 100,
    passScore: 60,
    classRank: 0,
    schoolRank: 0,
    classAvg: 0,
    classPassRate: 0,
    classExcellentRate: 0,
    schoolAvg: 0,
    schoolPassRate: 0,
    schoolExcellentRate: 0,
    excellentScore: 80
});
const scoreDistribution = ref([]);
const questionRates = ref([]);
const wrongQuestions = ref([]);
const getGradeColor = (grade) => {
    const colors = {
        A: '#67C23A',
        B: '#409EFF',
        C: '#E6A23C',
        D: '#F56C6C'
    };
    return colors[grade] || '#333';
};
const goBack = () => {
    router.push({
        name: 'ExamAnalysisStudentReport',
        query: {
            projectId,
            projectName,
            schoolId,
            schoolName,
            classId,
            className,
            studentNo,
            studentName
        }
    });
};
const handlePrint = () => {
    window.print();
};
const compareLabel = (score, average, target) => {
    const diff = Number((Number(score || 0) - Number(average || 0)).toFixed(1));
    if (diff === 0)
        return `与${target}持平`;
    return diff > 0 ? `高于${target} ${diff} 分` : `低于${target} ${Math.abs(diff)} 分`;
};
const initDistChart = () => {
    if (!distChart.value)
        return;
    const chart = echarts.init(distChart.value);
    const option = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { bottom: 0 },
        grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
        xAxis: { type: 'category', data: scoreDistribution.value.map((item) => item.label) },
        yAxis: { type: 'value', name: '人数' },
        series: [
            {
                name: '班级人数分布',
                type: 'bar',
                data: scoreDistribution.value.map((item) => item.count),
                itemStyle: { color: '#409eff' },
                markPoint: { data: [] }
            }
        ]
    };
    chart.setOption(option);
    chartInstances.push(chart);
};
const initKnowledgeChart = () => {
    if (!knowledgeChart.value)
        return;
    const chart = echarts.init(knowledgeChart.value);
    const option = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { bottom: 0 },
        grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
        xAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
        yAxis: { type: 'category', data: questionRates.value.map((item) => item.name) },
        series: [
            {
                name: '个人得分率',
                type: 'bar',
                data: questionRates.value.map((item) => item.rate),
                itemStyle: {
                    color: function (params) {
                        return params.value < 60 ? '#f56c6c' : params.value < 85 ? '#e6a23c' : '#67c23a';
                    }
                },
                label: { show: true, position: 'right', formatter: '{c}%' }
            },
            {
                name: '班级得分率',
                type: 'bar',
                data: questionRates.value.map((item) => item.classRate),
                itemStyle: { color: '#409eff' }
            },
            {
                name: '全校得分率',
                type: 'bar',
                data: questionRates.value.map((item) => item.schoolRate),
                itemStyle: { color: '#909399' }
            }
        ]
    };
    chart.setOption(option);
    chartInstances.push(chart);
};
const handleResize = () => {
    chartInstances.forEach((instance) => instance.resize());
};
onMounted(() => {
    fetchAnalysisStudentSubjectReport({ projectId, classId, studentNo, subjectName })
        .then(async (res) => {
        subjectDetail.value = res.subjectDetail || subjectDetail.value;
        scoreDistribution.value = res.scoreDistribution || [];
        questionRates.value = res.knowledgeRates || [];
        wrongQuestions.value = res.wrongQuestions || [];
        await nextTick();
        initDistChart();
        initKnowledgeChart();
    })
        .catch((error) => {
        ElMessage.error(error.message || '加载学生单科分析失败');
    });
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
    __VLS_styleScopedClasses['metric-value'];
    __VLS_styleScopedClasses['page-container'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("page-container report-container") }, });
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
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-large font-bold mr-3") }, });
        (__VLS_ctx.subjectName);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-sm mr-2") }, ...{ style: ({}) }, });
        (__VLS_ctx.studentName);
        (__VLS_ctx.schoolName);
        (__VLS_ctx.className);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { extra: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        const __VLS_8 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({ ...{ 'onClick': {} }, type: ("primary"), size: ("small"), }));
        const __VLS_10 = __VLS_9({ ...{ 'onClick': {} }, type: ("primary"), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_9));
        let __VLS_14;
        const __VLS_15 = {
            onClick: (__VLS_ctx.handlePrint)
        };
        let __VLS_11;
        let __VLS_12;
        __VLS_nonNullable(__VLS_13.slots).default;
        var __VLS_13;
    }
    var __VLS_5;
    const __VLS_16 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({ gutter: ((20)), ...{ class: ("mb-6") }, }));
    const __VLS_18 = __VLS_17({ gutter: ((20)), ...{ class: ("mb-6") }, }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    const __VLS_22 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({ span: ((6)), }));
    const __VLS_24 = __VLS_23({ span: ((6)), }, ...__VLS_functionalComponentArgsRest(__VLS_23));
    const __VLS_28 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({ shadow: ("never"), ...{ class: ("metric-card") }, }));
    const __VLS_30 = __VLS_29({ shadow: ("never"), ...{ class: ("metric-card") }, }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("metric-title") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("metric-value") }, ...{ style: (({ color: __VLS_ctx.getGradeColor(__VLS_ctx.subjectDetail.grade) })) }, });
    (__VLS_ctx.subjectDetail.score);
    __VLS_elementAsFunction(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
    (__VLS_ctx.subjectDetail.grade);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("metric-footer") }, });
    (__VLS_ctx.subjectDetail.fullScore);
    (__VLS_ctx.subjectDetail.passScore);
    (__VLS_ctx.subjectDetail.excellentScore);
    __VLS_nonNullable(__VLS_33.slots).default;
    var __VLS_33;
    __VLS_nonNullable(__VLS_27.slots).default;
    var __VLS_27;
    const __VLS_34 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({ span: ((6)), }));
    const __VLS_36 = __VLS_35({ span: ((6)), }, ...__VLS_functionalComponentArgsRest(__VLS_35));
    const __VLS_40 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({ shadow: ("never"), ...{ class: ("metric-card") }, }));
    const __VLS_42 = __VLS_41({ shadow: ("never"), ...{ class: ("metric-card") }, }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("metric-title") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("metric-value text-primary") }, });
    (__VLS_ctx.subjectDetail.classRank);
    __VLS_elementAsFunction(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
    (__VLS_ctx.subjectDetail.schoolRank);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("metric-footer") }, });
    __VLS_nonNullable(__VLS_45.slots).default;
    var __VLS_45;
    __VLS_nonNullable(__VLS_39.slots).default;
    var __VLS_39;
    const __VLS_46 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({ span: ((6)), }));
    const __VLS_48 = __VLS_47({ span: ((6)), }, ...__VLS_functionalComponentArgsRest(__VLS_47));
    const __VLS_52 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({ shadow: ("never"), ...{ class: ("metric-card") }, }));
    const __VLS_54 = __VLS_53({ shadow: ("never"), ...{ class: ("metric-card") }, }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("metric-title") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("metric-value text-success") }, });
    (__VLS_ctx.subjectDetail.classAvg);
    __VLS_elementAsFunction(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("metric-footer") }, });
    (__VLS_ctx.compareLabel(__VLS_ctx.subjectDetail.score, __VLS_ctx.subjectDetail.classAvg, '班均'));
    (__VLS_ctx.subjectDetail.classPassRate);
    (__VLS_ctx.subjectDetail.classExcellentRate);
    __VLS_nonNullable(__VLS_57.slots).default;
    var __VLS_57;
    __VLS_nonNullable(__VLS_51.slots).default;
    var __VLS_51;
    const __VLS_58 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({ span: ((6)), }));
    const __VLS_60 = __VLS_59({ span: ((6)), }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    const __VLS_64 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({ shadow: ("never"), ...{ class: ("metric-card") }, }));
    const __VLS_66 = __VLS_65({ shadow: ("never"), ...{ class: ("metric-card") }, }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("metric-title") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("metric-value text-warning") }, });
    (__VLS_ctx.subjectDetail.schoolAvg);
    __VLS_elementAsFunction(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("metric-footer") }, });
    (__VLS_ctx.compareLabel(__VLS_ctx.subjectDetail.score, __VLS_ctx.subjectDetail.schoolAvg, '校均'));
    (__VLS_ctx.subjectDetail.schoolPassRate);
    (__VLS_ctx.subjectDetail.schoolExcellentRate);
    __VLS_nonNullable(__VLS_69.slots).default;
    var __VLS_69;
    __VLS_nonNullable(__VLS_63.slots).default;
    var __VLS_63;
    __VLS_nonNullable(__VLS_21.slots).default;
    var __VLS_21;
    const __VLS_70 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({ gutter: ((20)), ...{ class: ("mb-6") }, }));
    const __VLS_72 = __VLS_71({ gutter: ((20)), ...{ class: ("mb-6") }, }, ...__VLS_functionalComponentArgsRest(__VLS_71));
    const __VLS_76 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({ span: ((12)), }));
    const __VLS_78 = __VLS_77({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    const __VLS_82 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({ shadow: ("never"), header: ("班级成绩分布对比"), }));
    const __VLS_84 = __VLS_83({ shadow: ("never"), header: ("班级成绩分布对比"), }, ...__VLS_functionalComponentArgsRest(__VLS_83));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ref: ("distChart"), ...{ class: ("chart-box") }, });
    // @ts-ignore navigation for `const distChart = ref()`
    __VLS_ctx.distChart;
    __VLS_nonNullable(__VLS_87.slots).default;
    var __VLS_87;
    __VLS_nonNullable(__VLS_81.slots).default;
    var __VLS_81;
    const __VLS_88 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({ span: ((12)), }));
    const __VLS_90 = __VLS_89({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    const __VLS_94 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({ shadow: ("never"), header: ("小题掌握情况 (得分率)"), }));
    const __VLS_96 = __VLS_95({ shadow: ("never"), header: ("小题掌握情况 (得分率)"), }, ...__VLS_functionalComponentArgsRest(__VLS_95));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ref: ("knowledgeChart"), ...{ class: ("chart-box") }, });
    // @ts-ignore navigation for `const knowledgeChart = ref()`
    __VLS_ctx.knowledgeChart;
    __VLS_nonNullable(__VLS_99.slots).default;
    var __VLS_99;
    __VLS_nonNullable(__VLS_93.slots).default;
    var __VLS_93;
    __VLS_nonNullable(__VLS_75.slots).default;
    var __VLS_75;
    const __VLS_100 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({ shadow: ("never"), ...{ class: ("mb-6") }, }));
    const __VLS_102 = __VLS_101({ shadow: ("never"), ...{ class: ("mb-6") }, }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { header: __VLS_thisSlot } = __VLS_nonNullable(__VLS_105.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-between items-center") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("font-bold") }, });
        (__VLS_ctx.subjectName);
    }
    const __VLS_106 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
    // @ts-ignore
    const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({ data: ((__VLS_ctx.wrongQuestions)), border: (true), ...{ style: ({}) }, size: ("small"), emptyText: ("当前学科暂无错题"), }));
    const __VLS_108 = __VLS_107({ data: ((__VLS_ctx.wrongQuestions)), border: (true), ...{ style: ({}) }, size: ("small"), emptyText: ("当前学科暂无错题"), }, ...__VLS_functionalComponentArgsRest(__VLS_107));
    const __VLS_112 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({ prop: ("questionNo"), label: ("题号"), width: ("80"), align: ("center"), }));
    const __VLS_114 = __VLS_113({ prop: ("questionNo"), label: ("题号"), width: ("80"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_113));
    const __VLS_118 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({ prop: ("type"), label: ("题型"), width: ("100"), align: ("center"), }));
    const __VLS_120 = __VLS_119({ prop: ("type"), label: ("题型"), width: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_119));
    const __VLS_124 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({ label: ("得分情况"), align: ("center"), }));
    const __VLS_126 = __VLS_125({ label: ("得分情况"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_125));
    const __VLS_130 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({ prop: ("score"), label: ("个人得分"), width: ("80"), align: ("center"), }));
    const __VLS_132 = __VLS_131({ prop: ("score"), label: ("个人得分"), width: ("80"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_131));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_135.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ((row.score === 0 ? 'text-danger' : '')) }, });
        (row.score);
    }
    var __VLS_135;
    const __VLS_136 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({ prop: ("fullScore"), label: ("满分"), width: ("80"), align: ("center"), }));
    const __VLS_138 = __VLS_137({ prop: ("fullScore"), label: ("满分"), width: ("80"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_137));
    const __VLS_142 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_143 = __VLS_asFunctionalComponent(__VLS_142, new __VLS_142({ prop: ("avgScore"), label: ("班级平均"), width: ("80"), align: ("center"), }));
    const __VLS_144 = __VLS_143({ prop: ("avgScore"), label: ("班级平均"), width: ("80"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_143));
    const __VLS_148 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({ prop: ("schoolAvg"), label: ("全校平均"), width: ("80"), align: ("center"), }));
    const __VLS_150 = __VLS_149({ prop: ("schoolAvg"), label: ("全校平均"), width: ("80"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_149));
    __VLS_nonNullable(__VLS_129.slots).default;
    var __VLS_129;
    const __VLS_154 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_155 = __VLS_asFunctionalComponent(__VLS_154, new __VLS_154({ prop: ("lostScore"), label: ("失分"), width: ("80"), align: ("center"), }));
    const __VLS_156 = __VLS_155({ prop: ("lostScore"), label: ("失分"), width: ("80"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_155));
    const __VLS_160 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({ prop: ("difficulty"), label: ("难度"), width: ("100"), align: ("center"), }));
    const __VLS_162 = __VLS_161({ prop: ("difficulty"), label: ("难度"), width: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_161));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_165.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_166 = __VLS_resolvedLocalAndGlobalComponents.ElRate;
        /** @type { [typeof __VLS_components.ElRate, typeof __VLS_components.elRate, ] } */
        // @ts-ignore
        const __VLS_167 = __VLS_asFunctionalComponent(__VLS_166, new __VLS_166({ modelValue: ((row.difficulty)), disabled: (true), max: ((3)), }));
        const __VLS_168 = __VLS_167({ modelValue: ((row.difficulty)), disabled: (true), max: ((3)), }, ...__VLS_functionalComponentArgsRest(__VLS_167));
    }
    var __VLS_165;
    const __VLS_172 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({ prop: ("explanation"), label: ("失分分析及建议"), minWidth: ("340"), showOverflowTooltip: (true), }));
    const __VLS_174 = __VLS_173({ prop: ("explanation"), label: ("失分分析及建议"), minWidth: ("340"), showOverflowTooltip: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_173));
    __VLS_nonNullable(__VLS_111.slots).default;
    var __VLS_111;
    var __VLS_105;
    __VLS_styleScopedClasses['page-container'];
    __VLS_styleScopedClasses['report-container'];
    __VLS_styleScopedClasses['mb-6'];
    __VLS_styleScopedClasses['text-large'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['mr-3'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['mr-2'];
    __VLS_styleScopedClasses['mb-6'];
    __VLS_styleScopedClasses['metric-card'];
    __VLS_styleScopedClasses['metric-title'];
    __VLS_styleScopedClasses['metric-value'];
    __VLS_styleScopedClasses['metric-footer'];
    __VLS_styleScopedClasses['metric-card'];
    __VLS_styleScopedClasses['metric-title'];
    __VLS_styleScopedClasses['metric-value'];
    __VLS_styleScopedClasses['text-primary'];
    __VLS_styleScopedClasses['metric-footer'];
    __VLS_styleScopedClasses['metric-card'];
    __VLS_styleScopedClasses['metric-title'];
    __VLS_styleScopedClasses['metric-value'];
    __VLS_styleScopedClasses['text-success'];
    __VLS_styleScopedClasses['metric-footer'];
    __VLS_styleScopedClasses['metric-card'];
    __VLS_styleScopedClasses['metric-title'];
    __VLS_styleScopedClasses['metric-value'];
    __VLS_styleScopedClasses['text-warning'];
    __VLS_styleScopedClasses['metric-footer'];
    __VLS_styleScopedClasses['mb-6'];
    __VLS_styleScopedClasses['chart-box'];
    __VLS_styleScopedClasses['chart-box'];
    __VLS_styleScopedClasses['mb-6'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['font-bold'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "distChart": __VLS_nativeElements['div'],
        "knowledgeChart": __VLS_nativeElements['div'],
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
            schoolName: schoolName,
            className: className,
            studentName: studentName,
            subjectName: subjectName,
            distChart: distChart,
            knowledgeChart: knowledgeChart,
            subjectDetail: subjectDetail,
            wrongQuestions: wrongQuestions,
            getGradeColor: getGradeColor,
            goBack: goBack,
            handlePrint: handlePrint,
            compareLabel: compareLabel,
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
//# sourceMappingURL=student-subject-report.vue.js.map