/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { fetchAnalysisClassDashboard } from '@/api/core-business/exam/analysis/class-dashboard';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const route = useRoute();
const router = useRouter();
const projectId = String(route.query.projectId || '');
const projectName = ref(String(route.query.projectName || ''));
const schoolId = String(route.query.schoolId || '');
const schoolName = ref(String(route.query.schoolName || ''));
const classId = String(route.query.classId || '');
const className = ref(String(route.query.className || ''));
const sortType = ref('desc');
const searchQuery = ref('');
const scoreCompareChart = ref();
const distChart = ref();
let chartInstances = [];
const statsCards = ref([]);
const getStatColor = (type) => {
    const colors = {
        avg: '#409EFF',
        pass: '#67C23A',
        excel: '#E6A23C',
        top: '#F56C6C'
    };
    return colors[type] || '#409EFF';
};
const studentData = ref([]);
const subjectColumns = ref([]);
const scoreSeries = ref([]);
const scoreDistribution = ref([]);
const filteredStudentData = computed(() => {
    if (!searchQuery.value)
        return studentData.value;
    return studentData.value.filter((s) => s.studentName.includes(searchQuery.value) || s.studentNo.includes(searchQuery.value));
});
const goBack = () => {
    router.push({
        name: 'ExamAnalysisClassSelect',
        query: { projectId, projectName: projectName.value }
    });
};
const handleStudentReport = (student) => {
    router.push({
        name: 'ExamAnalysisStudentReport',
        query: {
            projectId,
            projectName: projectName.value,
            schoolId,
            schoolName: schoolName.value,
            classId,
            className: className.value,
            studentId: student.studentNo,
            studentNo: student.studentNo,
            studentName: student.studentName
        }
    });
};
const initScoreChart = () => {
    if (!scoreCompareChart.value)
        return;
    const existingInstance = echarts.getInstanceByDom(scoreCompareChart.value);
    if (existingInstance)
        existingInstance.dispose();
    const chart = echarts.init(scoreCompareChart.value);
    const data = [...scoreSeries.value];
    if (sortType.value === 'desc') {
        data.sort((a, b) => b.totalScore - a.totalScore);
    }
    else {
        data.sort((a, b) => a.totalScore - b.totalScore);
    }
    const option = {
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
            type: 'category',
            data: data.map((s) => s.studentName)
        },
        yAxis: {
            type: 'value',
            name: '总分'
        },
        series: [
            {
                name: '总分',
                type: 'bar',
                data: data.map((s) => s.totalScore),
                itemStyle: { color: '#409eff' },
                label: { show: true, position: 'top' }
            }
        ]
    };
    chart.setOption(option);
    chartInstances.push(chart);
};
const initDistChart = () => {
    if (!distChart.value)
        return;
    const existingInstance = echarts.getInstanceByDom(distChart.value);
    if (existingInstance)
        existingInstance.dispose();
    const chart = echarts.init(distChart.value);
    const option = {
        tooltip: { trigger: 'item' },
        legend: { bottom: '0', left: 'center' },
        series: [
            {
                name: '分数段',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
                label: { show: false, position: 'center' },
                emphasis: { label: { show: true, fontSize: '16', fontWeight: 'bold' } },
                labelLine: { show: false },
                data: scoreDistribution.value.map((item) => ({ value: item.count, name: item.label }))
            }
        ]
    };
    chart.setOption(option);
    chartInstances.push(chart);
};
const handleResize = () => {
    chartInstances.forEach((instance) => instance.resize());
};
const loadData = async () => {
    try {
        const res = await fetchAnalysisClassDashboard({ projectId, classId });
        if (res.classInfo) {
            schoolName.value = res.classInfo.schoolName || schoolName.value;
            className.value = res.classInfo.className || className.value;
        }
        statsCards.value = res.statsCards || [];
        scoreSeries.value = res.scoreSeries || [];
        scoreDistribution.value = res.scoreDistribution || [];
        subjectColumns.value = res.subjectColumns || [];
        studentData.value = res.students || [];
        await nextTick();
        chartInstances.forEach((instance) => instance.dispose());
        chartInstances = [];
        initScoreChart();
        initDistChart();
    }
    catch (error) {
        ElMessage.error(error.message || '加载班级分析失败');
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
    __VLS_styleScopedClasses['stat-value'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("page-container dashboard-container") }, });
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
        (__VLS_ctx.schoolName);
        (__VLS_ctx.className);
        (__VLS_ctx.projectName);
    }
    var __VLS_5;
    const __VLS_8 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({ gutter: ((20)), ...{ class: ("mb-6") }, }));
    const __VLS_10 = __VLS_9({ gutter: ((20)), ...{ class: ("mb-6") }, }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    for (const [stat] of __VLS_getVForSourceType((__VLS_ctx.statsCards))) {
        const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
        // @ts-ignore
        const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ span: ((6)), key: ((stat.title)), }));
        const __VLS_16 = __VLS_15({ span: ((6)), key: ((stat.title)), }, ...__VLS_functionalComponentArgsRest(__VLS_15));
        const __VLS_20 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({ shadow: ("never"), ...{ class: ("stat-card") }, }));
        const __VLS_22 = __VLS_21({ shadow: ("never"), ...{ class: ("stat-card") }, }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stat-content") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stat-label") }, });
        (stat.title);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stat-value") }, ...{ style: (({ color: __VLS_ctx.getStatColor(stat.type) })) }, });
        (stat.value);
        if (stat.unit) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
            (stat.unit);
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stat-footer") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (stat.rank);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("trend ml-2") }, ...{ class: ((stat.trend >= 0 ? 'text-success' : 'text-danger')) }, });
        (stat.trend >= 0 ? '↑' : '↓');
        (Math.abs(stat.trend));
        __VLS_nonNullable(__VLS_25.slots).default;
        var __VLS_25;
        __VLS_nonNullable(__VLS_19.slots).default;
        var __VLS_19;
    }
    __VLS_nonNullable(__VLS_13.slots).default;
    var __VLS_13;
    const __VLS_26 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({ gutter: ((20)), ...{ class: ("mb-6") }, }));
    const __VLS_28 = __VLS_27({ gutter: ((20)), ...{ class: ("mb-6") }, }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    const __VLS_32 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({ span: ((16)), }));
    const __VLS_34 = __VLS_33({ span: ((16)), }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    const __VLS_38 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({ shadow: ("never"), }));
    const __VLS_40 = __VLS_39({ shadow: ("never"), }, ...__VLS_functionalComponentArgsRest(__VLS_39));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { header: __VLS_thisSlot } = __VLS_nonNullable(__VLS_43.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-between items-center") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("font-bold") }, });
        const __VLS_44 = __VLS_resolvedLocalAndGlobalComponents.ElRadioGroup;
        /** @type { [typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ] } */
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({ ...{ 'onChange': {} }, modelValue: ((__VLS_ctx.sortType)), size: ("small"), }));
        const __VLS_46 = __VLS_45({ ...{ 'onChange': {} }, modelValue: ((__VLS_ctx.sortType)), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        let __VLS_50;
        const __VLS_51 = {
            onChange: (__VLS_ctx.initScoreChart)
        };
        let __VLS_47;
        let __VLS_48;
        const __VLS_52 = __VLS_resolvedLocalAndGlobalComponents.ElRadioButton;
        /** @type { [typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, ] } */
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({ label: ("desc"), }));
        const __VLS_54 = __VLS_53({ label: ("desc"), }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        __VLS_nonNullable(__VLS_57.slots).default;
        var __VLS_57;
        const __VLS_58 = __VLS_resolvedLocalAndGlobalComponents.ElRadioButton;
        /** @type { [typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, ] } */
        // @ts-ignore
        const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({ label: ("asc"), }));
        const __VLS_60 = __VLS_59({ label: ("asc"), }, ...__VLS_functionalComponentArgsRest(__VLS_59));
        __VLS_nonNullable(__VLS_63.slots).default;
        var __VLS_63;
        __VLS_nonNullable(__VLS_49.slots).default;
        var __VLS_49;
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ref: ("scoreCompareChart"), ...{ class: ("chart-box") }, });
    // @ts-ignore navigation for `const scoreCompareChart = ref()`
    __VLS_ctx.scoreCompareChart;
    var __VLS_43;
    __VLS_nonNullable(__VLS_37.slots).default;
    var __VLS_37;
    const __VLS_64 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({ span: ((8)), }));
    const __VLS_66 = __VLS_65({ span: ((8)), }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    const __VLS_70 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({ shadow: ("never"), header: ("分数段人数分布"), }));
    const __VLS_72 = __VLS_71({ shadow: ("never"), header: ("分数段人数分布"), }, ...__VLS_functionalComponentArgsRest(__VLS_71));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ref: ("distChart"), ...{ class: ("chart-box") }, });
    // @ts-ignore navigation for `const distChart = ref()`
    __VLS_ctx.distChart;
    __VLS_nonNullable(__VLS_75.slots).default;
    var __VLS_75;
    __VLS_nonNullable(__VLS_69.slots).default;
    var __VLS_69;
    __VLS_nonNullable(__VLS_31.slots).default;
    var __VLS_31;
    const __VLS_76 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({ shadow: ("never"), }));
    const __VLS_78 = __VLS_77({ shadow: ("never"), }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { header: __VLS_thisSlot } = __VLS_nonNullable(__VLS_81.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-between items-center") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("font-bold") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex gap-4") }, });
        const __VLS_82 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
        // @ts-ignore
        const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({ modelValue: ((__VLS_ctx.searchQuery)), placeholder: ("搜索姓名/学号"), size: ("small"), ...{ style: ({}) }, clearable: (true), }));
        const __VLS_84 = __VLS_83({ modelValue: ((__VLS_ctx.searchQuery)), placeholder: ("搜索姓名/学号"), size: ("small"), ...{ style: ({}) }, clearable: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_83));
        const __VLS_88 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({ type: ("primary"), size: ("small"), }));
        const __VLS_90 = __VLS_89({ type: ("primary"), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_89));
        __VLS_nonNullable(__VLS_93.slots).default;
        var __VLS_93;
    }
    const __VLS_94 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
    // @ts-ignore
    const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({ data: ((__VLS_ctx.filteredStudentData)), border: (true), ...{ style: ({}) }, height: ("calc(100vh - 450px)"), size: ("small"), }));
    const __VLS_96 = __VLS_95({ data: ((__VLS_ctx.filteredStudentData)), border: (true), ...{ style: ({}) }, height: ("calc(100vh - 450px)"), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_95));
    const __VLS_100 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({ prop: ("rank"), label: ("班级排名"), minWidth: ("100"), align: ("center"), sortable: (true), }));
    const __VLS_102 = __VLS_101({ prop: ("rank"), label: ("班级排名"), minWidth: ("100"), align: ("center"), sortable: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    const __VLS_106 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({ prop: ("schoolRank"), label: ("全校排名"), minWidth: ("100"), align: ("center"), }));
    const __VLS_108 = __VLS_107({ prop: ("schoolRank"), label: ("全校排名"), minWidth: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_107));
    const __VLS_112 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({ prop: ("studentName"), label: ("姓名"), minWidth: ("120"), align: ("center"), }));
    const __VLS_114 = __VLS_113({ prop: ("studentName"), label: ("姓名"), minWidth: ("120"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_113));
    const __VLS_118 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({ prop: ("studentNo"), label: ("学号"), minWidth: ("150"), align: ("center"), }));
    const __VLS_120 = __VLS_119({ prop: ("studentNo"), label: ("学号"), minWidth: ("150"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_119));
    const __VLS_124 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({ prop: ("totalScore"), label: ("总分"), minWidth: ("100"), align: ("center"), sortable: (true), }));
    const __VLS_126 = __VLS_125({ prop: ("totalScore"), label: ("总分"), minWidth: ("100"), align: ("center"), sortable: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_125));
    for (const [column] of __VLS_getVForSourceType((__VLS_ctx.subjectColumns))) {
        const __VLS_130 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({ key: ((column.key)), label: ((column.label)), minWidth: ("90"), align: ("center"), }));
        const __VLS_132 = __VLS_131({ key: ((column.key)), label: ((column.label)), minWidth: ("90"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_131));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_135.slots);
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            (row.subjectScores?.[column.key] ?? '-');
        }
        var __VLS_135;
    }
    const __VLS_136 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({ label: ("操作"), fixed: ("right"), width: ("120"), align: ("center"), }));
    const __VLS_138 = __VLS_137({ label: ("操作"), fixed: ("right"), width: ("120"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_137));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_141.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_142 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_143 = __VLS_asFunctionalComponent(__VLS_142, new __VLS_142({ ...{ 'onClick': {} }, type: ("primary"), link: (true), }));
        const __VLS_144 = __VLS_143({ ...{ 'onClick': {} }, type: ("primary"), link: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_143));
        let __VLS_148;
        const __VLS_149 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleStudentReport(row);
            }
        };
        let __VLS_145;
        let __VLS_146;
        __VLS_nonNullable(__VLS_147.slots).default;
        var __VLS_147;
    }
    var __VLS_141;
    __VLS_nonNullable(__VLS_99.slots).default;
    var __VLS_99;
    var __VLS_81;
    __VLS_styleScopedClasses['page-container'];
    __VLS_styleScopedClasses['dashboard-container'];
    __VLS_styleScopedClasses['mb-6'];
    __VLS_styleScopedClasses['text-large'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['mr-3'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['mr-2'];
    __VLS_styleScopedClasses['mb-6'];
    __VLS_styleScopedClasses['stat-card'];
    __VLS_styleScopedClasses['stat-content'];
    __VLS_styleScopedClasses['stat-label'];
    __VLS_styleScopedClasses['stat-value'];
    __VLS_styleScopedClasses['stat-footer'];
    __VLS_styleScopedClasses['trend'];
    __VLS_styleScopedClasses['ml-2'];
    __VLS_styleScopedClasses['mb-6'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['chart-box'];
    __VLS_styleScopedClasses['chart-box'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['gap-4'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "scoreCompareChart": __VLS_nativeElements['div'],
        "distChart": __VLS_nativeElements['div'],
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
            schoolName: schoolName,
            className: className,
            sortType: sortType,
            searchQuery: searchQuery,
            scoreCompareChart: scoreCompareChart,
            distChart: distChart,
            statsCards: statsCards,
            getStatColor: getStatColor,
            subjectColumns: subjectColumns,
            filteredStudentData: filteredStudentData,
            goBack: goBack,
            handleStudentReport: handleStudentReport,
            initScoreChart: initScoreChart,
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
//# sourceMappingURL=class-dashboard.vue.js.map