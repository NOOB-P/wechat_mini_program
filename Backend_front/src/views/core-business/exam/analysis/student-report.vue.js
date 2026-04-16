/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { fetchAnalysisStudentReport } from '@/api/core-business/exam/analysis/student-report';
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
const radarChart = ref();
const compareBarChart = ref();
let chartInstances = [];
const overview = ref({ totalScore: 0, classRank: 0, schoolRank: 0 });
const personalRates = ref([]);
const subjectStats = ref([]);
const getStatusClass = (status) => {
    const classes = {
        pass: 'text-success',
        excel: 'text-warning',
        safe: 'text-primary',
        warn: 'text-danger'
    };
    return classes[status] || '';
};
const goBack = () => {
    router.push({
        name: 'ExamAnalysisClassDashboard',
        query: { projectId, projectName, schoolId, schoolName, classId, className }
    });
};
const handleSubjectDetail = (subject) => {
    router.push({
        name: 'ExamAnalysisStudentSubjectReport',
        query: {
            projectId,
            projectName,
            schoolId,
            schoolName,
            classId,
            className,
            studentNo,
            studentName,
            subjectName: subject
        }
    });
};
const handlePrint = () => {
    window.print();
};
const initRadarChart = () => {
    if (!radarChart.value)
        return;
    const chart = echarts.init(radarChart.value);
    const option = {
        tooltip: { trigger: 'item' },
        legend: { bottom: 0, left: 'center' },
        radar: {
            indicator: subjectStats.value.map((item) => ({
                name: item.subject,
                max: Math.max(item.score, item.avgScore, item.schoolAvg, item.passScore, 100)
            })),
            axisName: { color: '#333' }
        },
        series: [
            {
                name: '成绩对比',
                type: 'radar',
                data: [
                    {
                        value: subjectStats.value.map((item) => item.score),
                        name: '个人得分',
                        itemStyle: { color: '#409eff' },
                        areaStyle: { opacity: 0.3 }
                    },
                    {
                        value: subjectStats.value.map((item) => item.avgScore),
                        name: '班级平均',
                        itemStyle: { color: '#67c23a' },
                        lineStyle: { type: 'dashed' }
                    }
                ]
            }
        ]
    };
    chart.setOption(option);
    chartInstances.push(chart);
};
const initBarChart = () => {
    if (!compareBarChart.value)
        return;
    const chart = echarts.init(compareBarChart.value);
    const option = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { bottom: 0, left: 'center' },
        grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
        xAxis: {
            type: 'category',
            data: subjectStats.value.map((item) => item.subject)
        },
        yAxis: {
            type: 'value',
            name: '分数'
        },
        series: [
            {
                name: '个人得分',
                type: 'bar',
                data: subjectStats.value.map((item) => item.score),
                itemStyle: { color: '#409eff' }
            },
            {
                name: '班级平均',
                type: 'bar',
                data: subjectStats.value.map((item) => item.avgScore),
                itemStyle: { color: '#67c23a' }
            },
            {
                name: '全校平均',
                type: 'bar',
                data: subjectStats.value.map((item) => item.schoolAvg),
                itemStyle: { color: '#e6a23c' }
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
    fetchAnalysisStudentReport({ projectId, classId, studentNo })
        .then(async (res) => {
        overview.value = res.overview || overview.value;
        personalRates.value = res.statusCards || [];
        subjectStats.value = res.subjectStats || [];
        await nextTick();
        initRadarChart();
        initBarChart();
    })
        .catch((error) => {
        ElMessage.error(error.message || '加载学生分析报告失败');
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("metric-value") }, });
    (__VLS_ctx.overview.totalScore);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("metric-footer") }, });
    (__VLS_ctx.overview.schoolRank);
    (__VLS_ctx.overview.classRank);
    __VLS_nonNullable(__VLS_33.slots).default;
    var __VLS_33;
    __VLS_nonNullable(__VLS_27.slots).default;
    var __VLS_27;
    for (const [rate] of __VLS_getVForSourceType((__VLS_ctx.personalRates))) {
        const __VLS_34 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
        // @ts-ignore
        const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({ span: ((6)), key: ((rate.label)), }));
        const __VLS_36 = __VLS_35({ span: ((6)), key: ((rate.label)), }, ...__VLS_functionalComponentArgsRest(__VLS_35));
        const __VLS_40 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({ shadow: ("never"), ...{ class: ("metric-card") }, }));
        const __VLS_42 = __VLS_41({ shadow: ("never"), ...{ class: ("metric-card") }, }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("metric-title") }, });
        (rate.label);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("metric-status") }, ...{ class: ((__VLS_ctx.getStatusClass(rate.status))) }, });
        (rate.text);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("metric-footer") }, });
        (rate.desc);
        __VLS_nonNullable(__VLS_45.slots).default;
        var __VLS_45;
        __VLS_nonNullable(__VLS_39.slots).default;
        var __VLS_39;
    }
    __VLS_nonNullable(__VLS_21.slots).default;
    var __VLS_21;
    const __VLS_46 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({ shadow: ("never"), ...{ class: ("mb-6") }, }));
    const __VLS_48 = __VLS_47({ shadow: ("never"), ...{ class: ("mb-6") }, }, ...__VLS_functionalComponentArgsRest(__VLS_47));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { header: __VLS_thisSlot } = __VLS_nonNullable(__VLS_51.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("font-bold") }, });
    }
    const __VLS_52 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({ data: ((__VLS_ctx.subjectStats)), border: (true), ...{ style: ({}) }, size: ("small"), }));
    const __VLS_54 = __VLS_53({ data: ((__VLS_ctx.subjectStats)), border: (true), ...{ style: ({}) }, size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    const __VLS_58 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({ prop: ("subject"), label: ("科目"), width: ("100"), align: ("center"), fixed: (true), }));
    const __VLS_60 = __VLS_59({ prop: ("subject"), label: ("科目"), width: ("100"), align: ("center"), fixed: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_63.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_64 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({ ...{ 'onClick': {} }, type: ("primary"), link: (true), }));
        const __VLS_66 = __VLS_65({ ...{ 'onClick': {} }, type: ("primary"), link: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_65));
        let __VLS_70;
        const __VLS_71 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleSubjectDetail(row.subject);
            }
        };
        let __VLS_67;
        let __VLS_68;
        (row.subject);
        __VLS_nonNullable(__VLS_69.slots).default;
        var __VLS_69;
    }
    var __VLS_63;
    const __VLS_72 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({ label: ("分数对比"), align: ("center"), }));
    const __VLS_74 = __VLS_73({ label: ("分数对比"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    const __VLS_78 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({ prop: ("score"), label: ("个人得分"), width: ("80"), align: ("center"), }));
    const __VLS_80 = __VLS_79({ prop: ("score"), label: ("个人得分"), width: ("80"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_79));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_83.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("font-bold") }, ...{ class: ((row.score >= row.passScore ? 'text-success' : 'text-danger')) }, });
        (row.score);
    }
    var __VLS_83;
    const __VLS_84 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({ prop: ("avgScore"), label: ("班级平均"), width: ("80"), align: ("center"), }));
    const __VLS_86 = __VLS_85({ prop: ("avgScore"), label: ("班级平均"), width: ("80"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    const __VLS_90 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({ prop: ("schoolAvg"), label: ("全校平均"), width: ("80"), align: ("center"), }));
    const __VLS_92 = __VLS_91({ prop: ("schoolAvg"), label: ("全校平均"), width: ("80"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_91));
    __VLS_nonNullable(__VLS_77.slots).default;
    var __VLS_77;
    const __VLS_96 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({ label: ("排名对比"), align: ("center"), }));
    const __VLS_98 = __VLS_97({ label: ("排名对比"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    const __VLS_102 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({ prop: ("classRank"), label: ("班级排名"), width: ("80"), align: ("center"), }));
    const __VLS_104 = __VLS_103({ prop: ("classRank"), label: ("班级排名"), width: ("80"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_103));
    const __VLS_108 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({ prop: ("schoolRank"), label: ("全校排名"), width: ("80"), align: ("center"), }));
    const __VLS_110 = __VLS_109({ prop: ("schoolRank"), label: ("全校排名"), width: ("80"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_109));
    __VLS_nonNullable(__VLS_101.slots).default;
    var __VLS_101;
    const __VLS_114 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({ label: ("及格率对比"), align: ("center"), }));
    const __VLS_116 = __VLS_115({ label: ("及格率对比"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_115));
    const __VLS_120 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({ prop: ("status"), label: ("及格状态"), width: ("80"), align: ("center"), }));
    const __VLS_122 = __VLS_121({ prop: ("status"), label: ("及格状态"), width: ("80"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_121));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_125.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_126 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
        /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
        // @ts-ignore
        const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({ type: ((row.score >= row.passScore ? 'success' : 'danger')), size: ("small"), }));
        const __VLS_128 = __VLS_127({ type: ((row.score >= row.passScore ? 'success' : 'danger')), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_127));
        (row.score >= row.passScore ? '及格' : '不及格');
        __VLS_nonNullable(__VLS_131.slots).default;
        var __VLS_131;
    }
    var __VLS_125;
    const __VLS_132 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({ prop: ("classPassRate"), label: ("班级及格率"), width: ("100"), align: ("center"), }));
    const __VLS_134 = __VLS_133({ prop: ("classPassRate"), label: ("班级及格率"), width: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_133));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_137.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        (row.classPassRate);
    }
    var __VLS_137;
    const __VLS_138 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({ prop: ("schoolPassRate"), label: ("全校及格率"), width: ("100"), align: ("center"), }));
    const __VLS_140 = __VLS_139({ prop: ("schoolPassRate"), label: ("全校及格率"), width: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_139));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_143.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        (row.schoolPassRate);
    }
    var __VLS_143;
    __VLS_nonNullable(__VLS_119.slots).default;
    var __VLS_119;
    const __VLS_144 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({ label: ("优势分析"), align: ("left"), }));
    const __VLS_146 = __VLS_145({ label: ("优势分析"), align: ("left"), }, ...__VLS_functionalComponentArgsRest(__VLS_145));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_149.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-xs") }, });
        (row.analysis);
    }
    var __VLS_149;
    __VLS_nonNullable(__VLS_57.slots).default;
    var __VLS_57;
    var __VLS_51;
    const __VLS_150 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */
    // @ts-ignore
    const __VLS_151 = __VLS_asFunctionalComponent(__VLS_150, new __VLS_150({ gutter: ((20)), ...{ class: ("mb-6") }, }));
    const __VLS_152 = __VLS_151({ gutter: ((20)), ...{ class: ("mb-6") }, }, ...__VLS_functionalComponentArgsRest(__VLS_151));
    const __VLS_156 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({ span: ((12)), }));
    const __VLS_158 = __VLS_157({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_157));
    const __VLS_162 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_163 = __VLS_asFunctionalComponent(__VLS_162, new __VLS_162({ shadow: ("never"), header: ("学科得分雷达图 (均衡性分析)"), }));
    const __VLS_164 = __VLS_163({ shadow: ("never"), header: ("学科得分雷达图 (均衡性分析)"), }, ...__VLS_functionalComponentArgsRest(__VLS_163));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ref: ("radarChart"), ...{ class: ("chart-box") }, });
    // @ts-ignore navigation for `const radarChart = ref()`
    __VLS_ctx.radarChart;
    __VLS_nonNullable(__VLS_167.slots).default;
    var __VLS_167;
    __VLS_nonNullable(__VLS_161.slots).default;
    var __VLS_161;
    const __VLS_168 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({ span: ((12)), }));
    const __VLS_170 = __VLS_169({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_169));
    const __VLS_174 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_175 = __VLS_asFunctionalComponent(__VLS_174, new __VLS_174({ shadow: ("never"), header: ("个人得分 vs 班级/全校平均"), }));
    const __VLS_176 = __VLS_175({ shadow: ("never"), header: ("个人得分 vs 班级/全校平均"), }, ...__VLS_functionalComponentArgsRest(__VLS_175));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ref: ("compareBarChart"), ...{ class: ("chart-box") }, });
    // @ts-ignore navigation for `const compareBarChart = ref()`
    __VLS_ctx.compareBarChart;
    __VLS_nonNullable(__VLS_179.slots).default;
    var __VLS_179;
    __VLS_nonNullable(__VLS_173.slots).default;
    var __VLS_173;
    __VLS_nonNullable(__VLS_155.slots).default;
    var __VLS_155;
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
    __VLS_styleScopedClasses['metric-status'];
    __VLS_styleScopedClasses['metric-footer'];
    __VLS_styleScopedClasses['mb-6'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['mb-6'];
    __VLS_styleScopedClasses['chart-box'];
    __VLS_styleScopedClasses['chart-box'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "radarChart": __VLS_nativeElements['div'],
        "compareBarChart": __VLS_nativeElements['div'],
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
            radarChart: radarChart,
            compareBarChart: compareBarChart,
            overview: overview,
            personalRates: personalRates,
            subjectStats: subjectStats,
            getStatusClass: getStatusClass,
            goBack: goBack,
            handleSubjectDetail: handleSubjectDetail,
            handlePrint: handlePrint,
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
//# sourceMappingURL=student-report.vue.js.map