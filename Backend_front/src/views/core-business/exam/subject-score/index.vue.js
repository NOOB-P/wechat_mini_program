/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { onMounted, reactive, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Back, Search, Refresh, Upload, Download, InfoFilled, UploadFilled, Delete, Plus, Document, Loading as LoadingIcon } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import ScoreEditDialog from './components/ScoreEditDialog.vue';
import { fetchProjectScoreList, fetchDownloadScoreTemplate, fetchImportScore, fetchImportAnswerSheetZip, fetchUploadStudentAnswerSheet } from '@/api/core-business/exam/project-editor';
import { fetchProjectOptions } from '@/api/core-business/exam/project';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const route = useRoute();
const router = useRouter();
const loading = ref(false);
const projectId = computed(() => String(route.query.projectId || ''));
const subjectName = computed(() => String(route.query.subjectName || ''));
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const tableData = ref([]);
const scoreEditVisible = ref(false);
const currentStudent = ref(null);
const schoolOptions = ref([]);
const classOptions = ref([]);
const searchForm = reactive({
    schoolId: '',
    classId: '',
    keyword: ''
});
// 导入相关
const importVisible = ref(false);
const importLoading = ref(false);
const importType = ref('answerSheet');
const fileList = ref([]);
const uploadRef = ref();
const importTitle = computed(() => importType.value === 'answerSheet' ? '批量导入试卷答题卡' : '批量导入成绩');
async function loadOptions() {
    try {
        const res = await fetchProjectOptions();
        schoolOptions.value = res.schools?.map(s => ({ id: s.id, name: s.label })) || [];
        classOptions.value = res.classes?.map(c => ({ id: c.id, name: c.label })) || [];
    }
    catch (error) {
        console.error('加载选项失败', error);
    }
}
async function loadData() {
    if (!projectId.value || !subjectName.value)
        return;
    loading.value = true;
    try {
        const res = await fetchProjectScoreList({
            projectId: projectId.value,
            subjectName: subjectName.value,
            current: page.value,
            size: pageSize.value,
            schoolId: searchForm.schoolId || undefined,
            classId: searchForm.classId || undefined,
            keyword: searchForm.keyword
        });
        tableData.value = res.records || [];
        total.value = res.total || 0;
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
    searchForm.schoolId = '';
    searchForm.classId = '';
    searchForm.keyword = '';
    page.value = 1;
    loadData();
}
function handleSizeChange() {
    page.value = 1;
    loadData();
}
function handleEditScore(row) {
    currentStudent.value = row;
    scoreEditVisible.value = true;
}
async function handleUploadAnswerSheet(row, file) {
    const rawFile = file?.raw;
    if (!rawFile) {
        ElMessage.error('未获取到试卷文件');
        return;
    }
    try {
        await fetchUploadStudentAnswerSheet({
            projectId: projectId.value,
            subjectName: subjectName.value,
            studentNo: row.studentNo,
            file: rawFile
        });
        row.hasAnswerSheet = true;
        await loadData();
    }
    catch (error) {
        ElMessage.error(error.message || '试卷上传失败');
    }
}
function handleBatchUpload(type) {
    importType.value = type;
    fileList.value = [];
    importVisible.value = true;
}
function handleFileChange(file) {
    if (importType.value === 'answerSheet') {
        const isZip = /\.zip$/i.test(file.name || '');
        if (!isZip) {
            ElMessage.error('试卷批量导入仅支持 zip 压缩包');
            return;
        }
    }
    fileList.value.push(file);
}
function handleContinueUpload() {
    uploadRef.value?.$el.querySelector('input').click();
}
async function submitImport() {
    if (fileList.value.length === 0)
        return;
    importLoading.value = true;
    try {
        if (importType.value === 'score') {
            for (const file of fileList.value) {
                file.status = 'uploading';
                try {
                    await fetchImportScore({
                        projectId: projectId.value,
                        subjectName: subjectName.value,
                        file: file.raw
                    });
                    file.status = 'success';
                }
                catch (error) {
                    file.status = 'fail';
                    ElMessage.error(`${file.name} 导入失败: ${error.message || '未知错误'}`);
                }
            }
            const allSuccess = fileList.value.every(f => f.status === 'success');
            if (allSuccess) {
                ElMessage.success('全部成绩导入成功');
                importVisible.value = false;
                await loadData();
            }
        }
        else {
            for (const file of fileList.value) {
                file.status = 'uploading';
                try {
                    await fetchImportAnswerSheetZip({
                        projectId: projectId.value,
                        subjectName: subjectName.value,
                        file: file.raw
                    });
                    file.status = 'success';
                }
                catch (error) {
                    file.status = 'fail';
                    ElMessage.error(`${file.name} 导入失败: ${error.message || '未知错误'}`);
                }
            }
            const allSuccess = fileList.value.every(f => f.status === 'success');
            if (allSuccess) {
                ElMessage.success('全部试卷导入成功');
                importVisible.value = false;
                await loadData();
            }
        }
    }
    finally {
        importLoading.value = false;
    }
}
async function downloadTemplate() {
    try {
        const blob = await fetchDownloadScoreTemplate();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', '成绩导入模板.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
    catch (error) {
        ElMessage.error('模板下载失败');
    }
}
function handleExport() {
    ElMessage.info('导出功能开发中...');
}
function goBack() {
    router.push({
        name: 'ExamProjectEditor',
        query: {
            projectId: projectId.value,
            tab: 'scores'
        }
    });
}
onMounted(() => {
    loadOptions();
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
    __VLS_styleScopedClasses['el-card__body'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("subject-score-page") }, });
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.loading) }, null, null);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("header-section") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.goBack) }, ...{ class: ("back-link") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
    /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.Back;
    /** @type { [typeof __VLS_components.Back, ] } */
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({}));
    const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ shadow: ("never"), ...{ class: ("search-card") }, }));
    const __VLS_14 = __VLS_13({ shadow: ("never"), ...{ class: ("search-card") }, }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    const __VLS_18 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({ ...{ 'onSubmit': {} }, inline: ((true)), model: ((__VLS_ctx.searchForm)), ...{ class: ("search-form") }, }));
    const __VLS_20 = __VLS_19({ ...{ 'onSubmit': {} }, inline: ((true)), model: ((__VLS_ctx.searchForm)), ...{ class: ("search-form") }, }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    let __VLS_24;
    const __VLS_25 = {
        onSubmit: () => { }
    };
    let __VLS_21;
    let __VLS_22;
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
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.schoolOptions))) {
        const __VLS_38 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
        /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
        // @ts-ignore
        const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({ key: ((item.id)), label: ((item.name)), value: ((item.id)), }));
        const __VLS_40 = __VLS_39({ key: ((item.id)), label: ((item.name)), value: ((item.id)), }, ...__VLS_functionalComponentArgsRest(__VLS_39));
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
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.classOptions))) {
        const __VLS_56 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
        /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({ key: ((item.id)), label: ((item.name)), value: ((item.id)), }));
        const __VLS_58 = __VLS_57({ key: ((item.id)), label: ((item.name)), value: ((item.id)), }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    }
    __VLS_nonNullable(__VLS_55.slots).default;
    var __VLS_55;
    __VLS_nonNullable(__VLS_49.slots).default;
    var __VLS_49;
    const __VLS_62 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({ label: ("关键词"), }));
    const __VLS_64 = __VLS_63({ label: ("关键词"), }, ...__VLS_functionalComponentArgsRest(__VLS_63));
    const __VLS_68 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.searchForm.keyword)), clearable: (true), placeholder: ("姓名 / 考号"), }));
    const __VLS_70 = __VLS_69({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.searchForm.keyword)), clearable: (true), placeholder: ("姓名 / 考号"), }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    let __VLS_74;
    const __VLS_75 = {
        onKeyup: (__VLS_ctx.handleSearch)
    };
    let __VLS_71;
    let __VLS_72;
    var __VLS_73;
    __VLS_nonNullable(__VLS_67.slots).default;
    var __VLS_67;
    const __VLS_76 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({}));
    const __VLS_78 = __VLS_77({}, ...__VLS_functionalComponentArgsRest(__VLS_77));
    const __VLS_82 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({ ...{ 'onClick': {} }, type: ("primary"), icon: ((__VLS_ctx.Search)), }));
    const __VLS_84 = __VLS_83({ ...{ 'onClick': {} }, type: ("primary"), icon: ((__VLS_ctx.Search)), }, ...__VLS_functionalComponentArgsRest(__VLS_83));
    let __VLS_88;
    const __VLS_89 = {
        onClick: (__VLS_ctx.handleSearch)
    };
    let __VLS_85;
    let __VLS_86;
    __VLS_nonNullable(__VLS_87.slots).default;
    var __VLS_87;
    const __VLS_90 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({ ...{ 'onClick': {} }, icon: ((__VLS_ctx.Refresh)), }));
    const __VLS_92 = __VLS_91({ ...{ 'onClick': {} }, icon: ((__VLS_ctx.Refresh)), }, ...__VLS_functionalComponentArgsRest(__VLS_91));
    let __VLS_96;
    const __VLS_97 = {
        onClick: (__VLS_ctx.handleReset)
    };
    let __VLS_93;
    let __VLS_94;
    __VLS_nonNullable(__VLS_95.slots).default;
    var __VLS_95;
    __VLS_nonNullable(__VLS_81.slots).default;
    var __VLS_81;
    __VLS_nonNullable(__VLS_23.slots).default;
    var __VLS_23;
    __VLS_nonNullable(__VLS_17.slots).default;
    var __VLS_17;
    const __VLS_98 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({ shadow: ("never"), ...{ class: ("list-card") }, }));
    const __VLS_100 = __VLS_99({ shadow: ("never"), ...{ class: ("list-card") }, }, ...__VLS_functionalComponentArgsRest(__VLS_99));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("list-header") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("list-header__left") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({ ...{ class: ("list-title") }, });
    (__VLS_ctx.subjectName);
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("list-count") }, });
    (__VLS_ctx.projectId);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("list-header__right") }, });
    const __VLS_104 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({ ...{ 'onClick': {} }, type: ("success"), icon: ((__VLS_ctx.Upload)), }));
    const __VLS_106 = __VLS_105({ ...{ 'onClick': {} }, type: ("success"), icon: ((__VLS_ctx.Upload)), }, ...__VLS_functionalComponentArgsRest(__VLS_105));
    let __VLS_110;
    const __VLS_111 = {
        onClick: (...[$event]) => {
            __VLS_ctx.handleBatchUpload('answerSheet');
        }
    };
    let __VLS_107;
    let __VLS_108;
    __VLS_nonNullable(__VLS_109.slots).default;
    var __VLS_109;
    const __VLS_112 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({ ...{ 'onClick': {} }, type: ("warning"), icon: ((__VLS_ctx.Upload)), }));
    const __VLS_114 = __VLS_113({ ...{ 'onClick': {} }, type: ("warning"), icon: ((__VLS_ctx.Upload)), }, ...__VLS_functionalComponentArgsRest(__VLS_113));
    let __VLS_118;
    const __VLS_119 = {
        onClick: (...[$event]) => {
            __VLS_ctx.handleBatchUpload('score');
        }
    };
    let __VLS_115;
    let __VLS_116;
    __VLS_nonNullable(__VLS_117.slots).default;
    var __VLS_117;
    const __VLS_120 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({ ...{ 'onClick': {} }, type: ("primary"), icon: ((__VLS_ctx.Download)), }));
    const __VLS_122 = __VLS_121({ ...{ 'onClick': {} }, type: ("primary"), icon: ((__VLS_ctx.Download)), }, ...__VLS_functionalComponentArgsRest(__VLS_121));
    let __VLS_126;
    const __VLS_127 = {
        onClick: (__VLS_ctx.handleExport)
    };
    let __VLS_123;
    let __VLS_124;
    __VLS_nonNullable(__VLS_125.slots).default;
    var __VLS_125;
    const __VLS_128 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({ data: ((__VLS_ctx.tableData)), stripe: (true), ...{ class: ("custom-table") }, }));
    const __VLS_130 = __VLS_129({ data: ((__VLS_ctx.tableData)), stripe: (true), ...{ class: ("custom-table") }, }, ...__VLS_functionalComponentArgsRest(__VLS_129));
    const __VLS_134 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_135 = __VLS_asFunctionalComponent(__VLS_134, new __VLS_134({ prop: ("studentNo"), label: ("考号"), width: ("140"), }));
    const __VLS_136 = __VLS_135({ prop: ("studentNo"), label: ("考号"), width: ("140"), }, ...__VLS_functionalComponentArgsRest(__VLS_135));
    const __VLS_140 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({ prop: ("studentName"), label: ("姓名"), width: ("120"), }));
    const __VLS_142 = __VLS_141({ prop: ("studentName"), label: ("姓名"), width: ("120"), }, ...__VLS_functionalComponentArgsRest(__VLS_141));
    const __VLS_146 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({ prop: ("school"), label: ("学校"), minWidth: ("180"), }));
    const __VLS_148 = __VLS_147({ prop: ("school"), label: ("学校"), minWidth: ("180"), }, ...__VLS_functionalComponentArgsRest(__VLS_147));
    const __VLS_152 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({ prop: ("className"), label: ("班级"), width: ("150"), }));
    const __VLS_154 = __VLS_153({ prop: ("className"), label: ("班级"), width: ("150"), }, ...__VLS_functionalComponentArgsRest(__VLS_153));
    const __VLS_158 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158({ label: ("试卷录入"), width: ("120"), align: ("center"), }));
    const __VLS_160 = __VLS_159({ label: ("试卷录入"), width: ("120"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_159));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_163.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_164 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
        /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
        // @ts-ignore
        const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({ type: ((row.hasAnswerSheet ? 'success' : 'info')), effect: ("light"), }));
        const __VLS_166 = __VLS_165({ type: ((row.hasAnswerSheet ? 'success' : 'info')), effect: ("light"), }, ...__VLS_functionalComponentArgsRest(__VLS_165));
        (row.hasAnswerSheet ? '已上传' : '未上传');
        __VLS_nonNullable(__VLS_169.slots).default;
        var __VLS_169;
    }
    var __VLS_163;
    const __VLS_170 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_171 = __VLS_asFunctionalComponent(__VLS_170, new __VLS_170({ label: ("成绩录入"), width: ("120"), align: ("center"), }));
    const __VLS_172 = __VLS_171({ label: ("成绩录入"), width: ("120"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_171));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_175.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_176 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
        /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
        // @ts-ignore
        const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({ type: ((row.hasScore ? 'success' : 'info')), effect: ("light"), }));
        const __VLS_178 = __VLS_177({ type: ((row.hasScore ? 'success' : 'info')), effect: ("light"), }, ...__VLS_functionalComponentArgsRest(__VLS_177));
        (row.hasScore ? '已录入' : '未录入');
        __VLS_nonNullable(__VLS_181.slots).default;
        var __VLS_181;
    }
    var __VLS_175;
    const __VLS_182 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_183 = __VLS_asFunctionalComponent(__VLS_182, new __VLS_182({ label: ("操作"), width: ("200"), align: ("center"), fixed: ("right"), }));
    const __VLS_184 = __VLS_183({ label: ("操作"), width: ("200"), align: ("center"), fixed: ("right"), }, ...__VLS_functionalComponentArgsRest(__VLS_183));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_187.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("action-buttons") }, });
        const __VLS_188 = __VLS_resolvedLocalAndGlobalComponents.ElUpload;
        /** @type { [typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ] } */
        // @ts-ignore
        const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({ action: ("#"), autoUpload: ((false)), showFileList: ((false)), accept: (".pdf,.png,.jpg,.jpeg"), onChange: (((file) => __VLS_ctx.handleUploadAnswerSheet(row, file))), }));
        const __VLS_190 = __VLS_189({ action: ("#"), autoUpload: ((false)), showFileList: ((false)), accept: (".pdf,.png,.jpg,.jpeg"), onChange: (((file) => __VLS_ctx.handleUploadAnswerSheet(row, file))), }, ...__VLS_functionalComponentArgsRest(__VLS_189));
        const __VLS_194 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_195 = __VLS_asFunctionalComponent(__VLS_194, new __VLS_194({ type: ("primary"), link: (true), }));
        const __VLS_196 = __VLS_195({ type: ("primary"), link: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_195));
        __VLS_nonNullable(__VLS_199.slots).default;
        var __VLS_199;
        __VLS_nonNullable(__VLS_193.slots).default;
        var __VLS_193;
        const __VLS_200 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({ ...{ 'onClick': {} }, type: ("primary"), link: (true), }));
        const __VLS_202 = __VLS_201({ ...{ 'onClick': {} }, type: ("primary"), link: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_201));
        let __VLS_206;
        const __VLS_207 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleEditScore(row);
            }
        };
        let __VLS_203;
        let __VLS_204;
        __VLS_nonNullable(__VLS_205.slots).default;
        var __VLS_205;
    }
    var __VLS_187;
    __VLS_nonNullable(__VLS_133.slots).default;
    var __VLS_133;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("pagination-wrap") }, });
    const __VLS_208 = __VLS_resolvedLocalAndGlobalComponents.ElPagination;
    /** @type { [typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ] } */
    // @ts-ignore
    const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({ ...{ 'onSizeChange': {} }, ...{ 'onCurrentChange': {} }, currentPage: ((__VLS_ctx.page)), pageSize: ((__VLS_ctx.pageSize)), total: ((__VLS_ctx.total)), pageSizes: (([10, 20, 50, 100])), layout: ("total, sizes, prev, pager, next, jumper"), }));
    const __VLS_210 = __VLS_209({ ...{ 'onSizeChange': {} }, ...{ 'onCurrentChange': {} }, currentPage: ((__VLS_ctx.page)), pageSize: ((__VLS_ctx.pageSize)), total: ((__VLS_ctx.total)), pageSizes: (([10, 20, 50, 100])), layout: ("total, sizes, prev, pager, next, jumper"), }, ...__VLS_functionalComponentArgsRest(__VLS_209));
    let __VLS_214;
    const __VLS_215 = {
        onSizeChange: (__VLS_ctx.handleSizeChange)
    };
    const __VLS_216 = {
        onCurrentChange: (__VLS_ctx.loadData)
    };
    let __VLS_211;
    let __VLS_212;
    var __VLS_213;
    __VLS_nonNullable(__VLS_103.slots).default;
    var __VLS_103;
    const __VLS_217 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */
    // @ts-ignore
    const __VLS_218 = __VLS_asFunctionalComponent(__VLS_217, new __VLS_217({ modelValue: ((__VLS_ctx.importVisible)), title: ((__VLS_ctx.importTitle)), width: ("550px"), }));
    const __VLS_219 = __VLS_218({ modelValue: ((__VLS_ctx.importVisible)), title: ((__VLS_ctx.importTitle)), width: ("550px"), }, ...__VLS_functionalComponentArgsRest(__VLS_218));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("import-container") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-start mb-4") }, });
    const __VLS_223 = __VLS_resolvedLocalAndGlobalComponents.ElTooltip;
    /** @type { [typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ] } */
    // @ts-ignore
    const __VLS_224 = __VLS_asFunctionalComponent(__VLS_223, new __VLS_223({ placement: ("right"), effect: ("light"), }));
    const __VLS_225 = __VLS_224({ placement: ("right"), effect: ("light"), }, ...__VLS_functionalComponentArgsRest(__VLS_224));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { content: __VLS_thisSlot } = __VLS_nonNullable(__VLS_228.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("text-xs leading-6 text-gray-600 p-2") }, });
        if (__VLS_ctx.importType === 'answerSheet') {
            __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        }
        else {
            __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            __VLS_elementAsFunction(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("instructions-trigger") }, });
    const __VLS_229 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
    /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
    // @ts-ignore
    const __VLS_230 = __VLS_asFunctionalComponent(__VLS_229, new __VLS_229({ ...{ class: ("mr-1") }, }));
    const __VLS_231 = __VLS_230({ ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_230));
    const __VLS_235 = __VLS_resolvedLocalAndGlobalComponents.InfoFilled;
    /** @type { [typeof __VLS_components.InfoFilled, typeof __VLS_components.infoFilled, ] } */
    // @ts-ignore
    const __VLS_236 = __VLS_asFunctionalComponent(__VLS_235, new __VLS_235({}));
    const __VLS_237 = __VLS_236({}, ...__VLS_functionalComponentArgsRest(__VLS_236));
    __VLS_nonNullable(__VLS_234.slots).default;
    var __VLS_234;
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    var __VLS_228;
    const __VLS_241 = __VLS_resolvedLocalAndGlobalComponents.ElUpload;
    /** @type { [typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ] } */
    // @ts-ignore
    const __VLS_242 = __VLS_asFunctionalComponent(__VLS_241, new __VLS_241({ ref: ("uploadRef"), ...{ class: ("upload-demo") }, drag: (true), action: ("#"), multiple: (true), autoUpload: ((false)), onChange: ((__VLS_ctx.handleFileChange)), fileList: ((__VLS_ctx.fileList)), showFileList: ((false)), accept: ((__VLS_ctx.importType === 'answerSheet' ? '.zip' : '.xlsx, .xls')), }));
    const __VLS_243 = __VLS_242({ ref: ("uploadRef"), ...{ class: ("upload-demo") }, drag: (true), action: ("#"), multiple: (true), autoUpload: ((false)), onChange: ((__VLS_ctx.handleFileChange)), fileList: ((__VLS_ctx.fileList)), showFileList: ((false)), accept: ((__VLS_ctx.importType === 'answerSheet' ? '.zip' : '.xlsx, .xls')), }, ...__VLS_functionalComponentArgsRest(__VLS_242));
    // @ts-ignore navigation for `const uploadRef = ref()`
    __VLS_ctx.uploadRef;
    var __VLS_247 = {};
    if (__VLS_ctx.fileList.length === 0) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("upload-empty-content") }, });
        const __VLS_248 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({ ...{ class: ("el-icon--upload") }, }));
        const __VLS_250 = __VLS_249({ ...{ class: ("el-icon--upload") }, }, ...__VLS_functionalComponentArgsRest(__VLS_249));
        const __VLS_254 = __VLS_resolvedLocalAndGlobalComponents.UploadFilled;
        /** @type { [typeof __VLS_components.UploadFilled, typeof __VLS_components.uploadFilled, ] } */
        // @ts-ignore
        const __VLS_255 = __VLS_asFunctionalComponent(__VLS_254, new __VLS_254({}));
        const __VLS_256 = __VLS_255({}, ...__VLS_functionalComponentArgsRest(__VLS_255));
        __VLS_nonNullable(__VLS_253.slots).default;
        var __VLS_253;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("el-upload__text") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.em, __VLS_intrinsicElements.em)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("el-upload__tip mt-2") }, });
        (__VLS_ctx.importType === 'answerSheet' ? '仅支持 .zip 压缩包' : '仅支持 .xlsx / .xls 格式文件');
    }
    else {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: () => { } }, ...{ class: ("upload-list-content") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-between items-center mb-2 px-2") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-xs font-bold text-gray-500") }, });
        (__VLS_ctx.fileList.length);
        const __VLS_260 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_261 = __VLS_asFunctionalComponent(__VLS_260, new __VLS_260({ ...{ 'onClick': {} }, link: (true), type: ("danger"), size: ("small"), }));
        const __VLS_262 = __VLS_261({ ...{ 'onClick': {} }, link: (true), type: ("danger"), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_261));
        let __VLS_266;
        const __VLS_267 = {
            onClick: (...[$event]) => {
                if (!(!((__VLS_ctx.fileList.length === 0))))
                    return;
                __VLS_ctx.fileList = [];
            }
        };
        let __VLS_263;
        let __VLS_264;
        __VLS_nonNullable(__VLS_265.slots).default;
        var __VLS_265;
        const __VLS_268 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
        /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
        // @ts-ignore
        const __VLS_269 = __VLS_asFunctionalComponent(__VLS_268, new __VLS_268({ data: ((__VLS_ctx.fileList)), size: ("small"), border: (true), maxHeight: ("180"), ...{ class: ("import-table") }, }));
        const __VLS_270 = __VLS_269({ data: ((__VLS_ctx.fileList)), size: ("small"), border: (true), maxHeight: ("180"), ...{ class: ("import-table") }, }, ...__VLS_functionalComponentArgsRest(__VLS_269));
        const __VLS_274 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_275 = __VLS_asFunctionalComponent(__VLS_274, new __VLS_274({ prop: ("name"), label: ("文件名"), showOverflowTooltip: (true), }));
        const __VLS_276 = __VLS_275({ prop: ("name"), label: ("文件名"), showOverflowTooltip: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_275));
        const __VLS_280 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_281 = __VLS_asFunctionalComponent(__VLS_280, new __VLS_280({ label: ("状态"), width: ("90"), align: ("center"), }));
        const __VLS_282 = __VLS_281({ label: ("状态"), width: ("90"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_281));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_285.slots);
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("status-cell") }, });
            if (row.status === 'ready') {
                const __VLS_286 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_287 = __VLS_asFunctionalComponent(__VLS_286, new __VLS_286({ type: ("info"), size: ("small"), ...{ class: ("status-tag-mini") }, }));
                const __VLS_288 = __VLS_287({ type: ("info"), size: ("small"), ...{ class: ("status-tag-mini") }, }, ...__VLS_functionalComponentArgsRest(__VLS_287));
                __VLS_nonNullable(__VLS_291.slots).default;
                var __VLS_291;
            }
            else if (row.status === 'success') {
                const __VLS_292 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_293 = __VLS_asFunctionalComponent(__VLS_292, new __VLS_292({ type: ("success"), size: ("small"), ...{ class: ("status-tag-mini tag-success-simple") }, }));
                const __VLS_294 = __VLS_293({ type: ("success"), size: ("small"), ...{ class: ("status-tag-mini tag-success-simple") }, }, ...__VLS_functionalComponentArgsRest(__VLS_293));
                __VLS_nonNullable(__VLS_297.slots).default;
                var __VLS_297;
            }
            else if (row.status === 'fail') {
                const __VLS_298 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_299 = __VLS_asFunctionalComponent(__VLS_298, new __VLS_298({ type: ("danger"), size: ("small"), ...{ class: ("status-tag-mini") }, }));
                const __VLS_300 = __VLS_299({ type: ("danger"), size: ("small"), ...{ class: ("status-tag-mini") }, }, ...__VLS_functionalComponentArgsRest(__VLS_299));
                __VLS_nonNullable(__VLS_303.slots).default;
                var __VLS_303;
            }
            else {
                const __VLS_304 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_305 = __VLS_asFunctionalComponent(__VLS_304, new __VLS_304({ type: ("primary"), size: ("small"), ...{ class: ("status-tag-mini rotating") }, }));
                const __VLS_306 = __VLS_305({ type: ("primary"), size: ("small"), ...{ class: ("status-tag-mini rotating") }, }, ...__VLS_functionalComponentArgsRest(__VLS_305));
                const __VLS_310 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
                /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
                // @ts-ignore
                const __VLS_311 = __VLS_asFunctionalComponent(__VLS_310, new __VLS_310({}));
                const __VLS_312 = __VLS_311({}, ...__VLS_functionalComponentArgsRest(__VLS_311));
                const __VLS_316 = __VLS_resolvedLocalAndGlobalComponents.LoadingIcon;
                /** @type { [typeof __VLS_components.LoadingIcon, typeof __VLS_components.loadingIcon, ] } */
                // @ts-ignore
                const __VLS_317 = __VLS_asFunctionalComponent(__VLS_316, new __VLS_316({}));
                const __VLS_318 = __VLS_317({}, ...__VLS_functionalComponentArgsRest(__VLS_317));
                __VLS_nonNullable(__VLS_315.slots).default;
                var __VLS_315;
                __VLS_nonNullable(__VLS_309.slots).default;
                var __VLS_309;
            }
        }
        var __VLS_285;
        const __VLS_322 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_323 = __VLS_asFunctionalComponent(__VLS_322, new __VLS_322({ label: ("操作"), width: ("50"), align: ("center"), }));
        const __VLS_324 = __VLS_323({ label: ("操作"), width: ("50"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_323));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_327.slots);
            const [{ $index }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_328 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_329 = __VLS_asFunctionalComponent(__VLS_328, new __VLS_328({ ...{ 'onClick': {} }, link: (true), type: ("danger"), icon: ((__VLS_ctx.Delete)), }));
            const __VLS_330 = __VLS_329({ ...{ 'onClick': {} }, link: (true), type: ("danger"), icon: ((__VLS_ctx.Delete)), }, ...__VLS_functionalComponentArgsRest(__VLS_329));
            let __VLS_334;
            const __VLS_335 = {
                onClick: (...[$event]) => {
                    if (!(!((__VLS_ctx.fileList.length === 0))))
                        return;
                    __VLS_ctx.fileList.splice($index, 1);
                }
            };
            let __VLS_331;
            let __VLS_332;
            var __VLS_333;
        }
        var __VLS_327;
        __VLS_nonNullable(__VLS_273.slots).default;
        var __VLS_273;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-2 text-center") }, });
        const __VLS_336 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_337 = __VLS_asFunctionalComponent(__VLS_336, new __VLS_336({ ...{ 'onClick': {} }, link: (true), type: ("primary"), size: ("small"), }));
        const __VLS_338 = __VLS_337({ ...{ 'onClick': {} }, link: (true), type: ("primary"), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_337));
        let __VLS_342;
        const __VLS_343 = {
            onClick: (__VLS_ctx.handleContinueUpload)
        };
        let __VLS_339;
        let __VLS_340;
        const __VLS_344 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_345 = __VLS_asFunctionalComponent(__VLS_344, new __VLS_344({ ...{ class: ("mr-1") }, }));
        const __VLS_346 = __VLS_345({ ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_345));
        const __VLS_350 = __VLS_resolvedLocalAndGlobalComponents.plus;
        /** @type { [typeof __VLS_components.Plus, typeof __VLS_components.plus, ] } */
        // @ts-ignore
        const __VLS_351 = __VLS_asFunctionalComponent(__VLS_350, new __VLS_350({}));
        const __VLS_352 = __VLS_351({}, ...__VLS_functionalComponentArgsRest(__VLS_351));
        __VLS_nonNullable(__VLS_349.slots).default;
        var __VLS_349;
        __VLS_nonNullable(__VLS_341.slots).default;
        var __VLS_341;
    }
    __VLS_nonNullable(__VLS_246.slots).default;
    var __VLS_246;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-8 flex flex-col gap-3") }, });
    const __VLS_356 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_357 = __VLS_asFunctionalComponent(__VLS_356, new __VLS_356({ ...{ 'onClick': {} }, type: ("primary"), size: ("large"), ...{ class: ("w-full start-import-btn") }, loading: ((__VLS_ctx.importLoading)), disabled: ((__VLS_ctx.fileList.length === 0)), }));
    const __VLS_358 = __VLS_357({ ...{ 'onClick': {} }, type: ("primary"), size: ("large"), ...{ class: ("w-full start-import-btn") }, loading: ((__VLS_ctx.importLoading)), disabled: ((__VLS_ctx.fileList.length === 0)), }, ...__VLS_functionalComponentArgsRest(__VLS_357));
    let __VLS_362;
    const __VLS_363 = {
        onClick: (__VLS_ctx.submitImport)
    };
    let __VLS_359;
    let __VLS_360;
    if (!__VLS_ctx.importLoading) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { icon: __VLS_thisSlot } = __VLS_nonNullable(__VLS_361.slots);
            const __VLS_364 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
            /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
            // @ts-ignore
            const __VLS_365 = __VLS_asFunctionalComponent(__VLS_364, new __VLS_364({}));
            const __VLS_366 = __VLS_365({}, ...__VLS_functionalComponentArgsRest(__VLS_365));
            const __VLS_370 = __VLS_resolvedLocalAndGlobalComponents.Upload;
            /** @type { [typeof __VLS_components.Upload, ] } */
            // @ts-ignore
            const __VLS_371 = __VLS_asFunctionalComponent(__VLS_370, new __VLS_370({}));
            const __VLS_372 = __VLS_371({}, ...__VLS_functionalComponentArgsRest(__VLS_371));
            __VLS_nonNullable(__VLS_369.slots).default;
            var __VLS_369;
        }
    }
    (__VLS_ctx.importLoading ? '正在处理中...' : '确认开始批量导入');
    var __VLS_361;
    if (__VLS_ctx.importType === 'score') {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-center mt-1") }, });
        const __VLS_376 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_377 = __VLS_asFunctionalComponent(__VLS_376, new __VLS_376({ ...{ 'onClick': {} }, link: (true), type: ("primary"), ...{ class: ("download-link") }, }));
        const __VLS_378 = __VLS_377({ ...{ 'onClick': {} }, link: (true), type: ("primary"), ...{ class: ("download-link") }, }, ...__VLS_functionalComponentArgsRest(__VLS_377));
        let __VLS_382;
        const __VLS_383 = {
            onClick: (__VLS_ctx.downloadTemplate)
        };
        let __VLS_379;
        let __VLS_380;
        const __VLS_384 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_385 = __VLS_asFunctionalComponent(__VLS_384, new __VLS_384({ ...{ class: ("mr-1") }, }));
        const __VLS_386 = __VLS_385({ ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_385));
        const __VLS_390 = __VLS_resolvedLocalAndGlobalComponents.Document;
        /** @type { [typeof __VLS_components.Document, ] } */
        // @ts-ignore
        const __VLS_391 = __VLS_asFunctionalComponent(__VLS_390, new __VLS_390({}));
        const __VLS_392 = __VLS_391({}, ...__VLS_functionalComponentArgsRest(__VLS_391));
        __VLS_nonNullable(__VLS_389.slots).default;
        var __VLS_389;
        __VLS_nonNullable(__VLS_381.slots).default;
        var __VLS_381;
    }
    __VLS_nonNullable(__VLS_222.slots).default;
    var __VLS_222;
    // @ts-ignore
    [ScoreEditDialog,];
    // @ts-ignore
    const __VLS_396 = __VLS_asFunctionalComponent(ScoreEditDialog, new ScoreEditDialog({ ...{ 'onSaved': {} }, modelValue: ((__VLS_ctx.scoreEditVisible)), projectId: ((__VLS_ctx.projectId)), subjectName: ((__VLS_ctx.subjectName)), student: ((__VLS_ctx.currentStudent)), }));
    const __VLS_397 = __VLS_396({ ...{ 'onSaved': {} }, modelValue: ((__VLS_ctx.scoreEditVisible)), projectId: ((__VLS_ctx.projectId)), subjectName: ((__VLS_ctx.subjectName)), student: ((__VLS_ctx.currentStudent)), }, ...__VLS_functionalComponentArgsRest(__VLS_396));
    let __VLS_401;
    const __VLS_402 = {
        onSaved: (__VLS_ctx.loadData)
    };
    let __VLS_398;
    let __VLS_399;
    var __VLS_400;
    __VLS_styleScopedClasses['subject-score-page'];
    __VLS_styleScopedClasses['header-section'];
    __VLS_styleScopedClasses['back-link'];
    __VLS_styleScopedClasses['search-card'];
    __VLS_styleScopedClasses['search-form'];
    __VLS_styleScopedClasses['list-card'];
    __VLS_styleScopedClasses['list-header'];
    __VLS_styleScopedClasses['list-header__left'];
    __VLS_styleScopedClasses['list-title'];
    __VLS_styleScopedClasses['list-count'];
    __VLS_styleScopedClasses['list-header__right'];
    __VLS_styleScopedClasses['custom-table'];
    __VLS_styleScopedClasses['action-buttons'];
    __VLS_styleScopedClasses['pagination-wrap'];
    __VLS_styleScopedClasses['import-container'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-start'];
    __VLS_styleScopedClasses['mb-4'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['leading-6'];
    __VLS_styleScopedClasses['text-gray-600'];
    __VLS_styleScopedClasses['p-2'];
    __VLS_styleScopedClasses['instructions-trigger'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['upload-demo'];
    __VLS_styleScopedClasses['upload-empty-content'];
    __VLS_styleScopedClasses['el-icon--upload'];
    __VLS_styleScopedClasses['el-upload__text'];
    __VLS_styleScopedClasses['el-upload__tip'];
    __VLS_styleScopedClasses['mt-2'];
    __VLS_styleScopedClasses['upload-list-content'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['mb-2'];
    __VLS_styleScopedClasses['px-2'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['text-gray-500'];
    __VLS_styleScopedClasses['import-table'];
    __VLS_styleScopedClasses['status-cell'];
    __VLS_styleScopedClasses['status-tag-mini'];
    __VLS_styleScopedClasses['status-tag-mini'];
    __VLS_styleScopedClasses['tag-success-simple'];
    __VLS_styleScopedClasses['status-tag-mini'];
    __VLS_styleScopedClasses['status-tag-mini'];
    __VLS_styleScopedClasses['rotating'];
    __VLS_styleScopedClasses['mt-2'];
    __VLS_styleScopedClasses['text-center'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['mt-8'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['flex-col'];
    __VLS_styleScopedClasses['gap-3'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['start-import-btn'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-center'];
    __VLS_styleScopedClasses['mt-1'];
    __VLS_styleScopedClasses['download-link'];
    __VLS_styleScopedClasses['mr-1'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "uploadRef": __VLS_247,
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
            Back: Back,
            Search: Search,
            Refresh: Refresh,
            Upload: Upload,
            Download: Download,
            InfoFilled: InfoFilled,
            UploadFilled: UploadFilled,
            Delete: Delete,
            Plus: Plus,
            Document: Document,
            LoadingIcon: LoadingIcon,
            ScoreEditDialog: ScoreEditDialog,
            loading: loading,
            projectId: projectId,
            subjectName: subjectName,
            page: page,
            pageSize: pageSize,
            total: total,
            tableData: tableData,
            scoreEditVisible: scoreEditVisible,
            currentStudent: currentStudent,
            schoolOptions: schoolOptions,
            classOptions: classOptions,
            searchForm: searchForm,
            importVisible: importVisible,
            importLoading: importLoading,
            importType: importType,
            fileList: fileList,
            uploadRef: uploadRef,
            importTitle: importTitle,
            loadData: loadData,
            handleSearch: handleSearch,
            handleReset: handleReset,
            handleSizeChange: handleSizeChange,
            handleEditScore: handleEditScore,
            handleUploadAnswerSheet: handleUploadAnswerSheet,
            handleBatchUpload: handleBatchUpload,
            handleFileChange: handleFileChange,
            handleContinueUpload: handleContinueUpload,
            submitImport: submitImport,
            downloadTemplate: downloadTemplate,
            handleExport: handleExport,
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
//# sourceMappingURL=index.vue.js.map