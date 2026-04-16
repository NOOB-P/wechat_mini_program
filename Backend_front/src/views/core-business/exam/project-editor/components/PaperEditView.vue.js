/// <reference types="../../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { computed, ref, onMounted, watch } from 'vue';
import { UploadFilled, Back, ArrowLeft, Search, Tools, ArrowDown, InfoFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import PaperRegionEditor from './PaperRegionEditor.vue';
import { fetchSavePaperLayout, fetchProjectScoreList, fetchUploadStudentAnswerSheet, fetchPaperConfig, fetchUploadPublicPaper, normalizePaperRegions } from '@/api/core-business/exam/project-editor';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps();
const emit = defineEmits();
const activeTab = ref('template');
const studentList = ref([]);
const selectedStudent = ref(null);
const loading = ref(false);
const regionEditorRef = ref(null);
// 搜索和分页
const searchKeyword = ref('');
const currentPage = ref(1);
const pageSize = ref(20);
const totalStudents = ref(0);
const paperConfig = ref({
    templateUrl: null,
    originalUrl: null,
    templateRegions: [],
    originalRegions: []
});
const showIntegratedToolbar = computed(() => activeTab.value !== 'student');
const canUseEditor = computed(() => showIntegratedToolbar.value && hasFile(activeTab.value) && !isPdf(getFileUrl(activeTab.value)));
function handleToolboxCommand(command) {
    regionEditorRef.value?.handleToolboxCommand(command);
}
function handleSaveRegions() {
    regionEditorRef.value?.save();
}
const studentSplitLabel = computed(() => paperConfig.value.templateRegions.length > 0 ? '已切分' : '未切分');
onMounted(() => {
    reloadCurrentView();
});
watch(() => [props.projectId, props.subjectName], () => {
    selectedStudent.value = null;
    reloadCurrentView();
});
watch(activeTab, (tab) => {
    if (tab !== 'student') {
        selectedStudent.value = null;
        return;
    }
    loadStudents();
});
async function loadConfig() {
    try {
        const res = await fetchPaperConfig({
            projectId: props.projectId,
            subjectName: props.subjectName
        });
        paperConfig.value = {
            templateUrl: res.templateUrl || null,
            originalUrl: res.originalUrl || null,
            templateRegions: normalizePaperRegions(res.templateRegions),
            originalRegions: normalizePaperRegions(res.originalRegions)
        };
    }
    catch (e) {
        console.error(e);
        ElMessage.error(e.message || '获取试卷配置失败');
    }
}
async function loadStudents() {
    loading.value = true;
    try {
        const res = await fetchProjectScoreList({
            projectId: props.projectId,
            subjectName: props.subjectName,
            current: currentPage.value,
            size: pageSize.value,
            keyword: searchKeyword.value
        });
        studentList.value = res.records;
        totalStudents.value = res.total;
        syncSelectedStudent();
    }
    catch (e) {
        console.error(e);
        ElMessage.error(e.message || '获取考生原卷列表失败');
    }
    finally {
        loading.value = false;
    }
}
function handleSearch() {
    currentPage.value = 1;
    loadStudents();
}
function handleSizeChange(val) {
    pageSize.value = val;
    currentPage.value = 1;
    loadStudents();
}
function handleCurrentChange(val) {
    currentPage.value = val;
    loadStudents();
}
function hasFile(tab) {
    if (tab === 'template')
        return !!paperConfig.value.templateUrl;
    if (tab === 'original')
        return !!paperConfig.value.originalUrl;
    return false;
}
function getFileUrl(tab) {
    if (tab === 'template')
        return paperConfig.value.templateUrl || '';
    if (tab === 'original')
        return paperConfig.value.originalUrl || '';
    return '';
}
function getRegions(tab) {
    return tab === 'template'
        ? paperConfig.value.templateRegions
        : paperConfig.value.originalRegions;
}
function handleRegionsChange(tab, regions) {
    const normalizedRegions = normalizePaperRegions(regions);
    if (tab === 'template') {
        paperConfig.value.templateRegions = normalizedRegions;
    }
    else if (tab === 'original') {
        paperConfig.value.originalRegions = normalizedRegions;
    }
}
function isPdf(url) {
    return url && url.toLowerCase().endsWith('.pdf');
}
function resolveFileUrl(url) {
    if (!url)
        return '';
    if (/^(https?:)?\/\//.test(url) || url.startsWith('blob:') || url.startsWith('data:')) {
        return url;
    }
    const baseUrl = String(import.meta.env.VITE_API_URL || '');
    if (baseUrl) {
        try {
            const apiOrigin = new URL(baseUrl, window.location.origin).origin;
            return new URL(url.startsWith('/') ? url : `/${url}`, apiOrigin).toString();
        }
        catch (error) {
            console.warn('解析试卷资源地址失败，回退为原始地址', error);
        }
    }
    return url;
}
function validatePaperFile(rawFile) {
    if (!rawFile) {
        ElMessage.warning('未检测到上传文件');
        return false;
    }
    const fileName = rawFile.name.toLowerCase();
    const isValid = ['.pdf', '.png', '.jpg', '.jpeg'].some((ext) => fileName.endsWith(ext));
    if (!isValid) {
        ElMessage.error('仅支持上传 pdf、png、jpg、jpeg 格式文件');
        return false;
    }
    return true;
}
function syncSelectedStudent() {
    if (!selectedStudent.value)
        return;
    const matched = studentList.value.find((item) => item.studentNo === selectedStudent.value.studentNo);
    if (matched) {
        selectedStudent.value = { ...matched };
    }
}
async function reloadCurrentView() {
    await Promise.all([loadConfig(), loadStudents()]);
}
async function handleFileUpload(type, file) {
    if (!validatePaperFile(file.raw))
        return;
    loading.value = true;
    try {
        await fetchUploadPublicPaper({
            projectId: props.projectId,
            subjectName: props.subjectName,
            type: type,
            file: file.raw
        });
        ElMessage.success('上传成功');
        await loadConfig();
        emit('saved');
    }
    catch (e) {
        console.error(e);
        ElMessage.error(e.message || '上传试卷失败');
    }
    finally {
        loading.value = false;
    }
}
async function savePaperRegions(type, regions) {
    loading.value = true;
    try {
        const normalizedRegions = normalizePaperRegions(regions);
        await fetchSavePaperLayout({
            projectId: props.projectId,
            subjectName: props.subjectName,
            type: type,
            regions: normalizedRegions
        });
        ElMessage.success('框选坐标保存成功');
        await loadConfig();
        emit('saved');
    }
    catch (e) {
        console.error(e);
        ElMessage.error(e.message || '保存框选坐标失败');
    }
    finally {
        loading.value = false;
    }
}
function enterStudentPaper(student) {
    selectedStudent.value = { ...student };
}
async function handleStudentUpload(file) {
    if (!selectedStudent.value) {
        ElMessage.warning('请先选择考生');
        return;
    }
    if (!validatePaperFile(file.raw))
        return;
    loading.value = true;
    try {
        const url = await fetchUploadStudentAnswerSheet({
            projectId: props.projectId,
            subjectName: props.subjectName,
            studentNo: selectedStudent.value.studentNo,
            file: file.raw
        });
        ElMessage.success('上传成功');
        selectedStudent.value.hasAnswerSheet = true;
        selectedStudent.value.answerSheetUrl = url;
        await loadStudents();
        emit('saved');
    }
    catch (e) {
        console.error(e);
        ElMessage.error(e.message || '上传考生原卷失败');
    }
    finally {
        loading.value = false;
    }
}
function handleBack() {
    emit('back');
}
; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_fnComponent = (await import('vue')).defineComponent({
    __typeEmits: {},
});
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
    __VLS_styleScopedClasses['view-header'];
    __VLS_styleScopedClasses['view-body'];
    __VLS_styleScopedClasses['workspace-toolbar'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("paper-edit-view") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("view-header") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("header-left") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onClick': {} }, link: (true), ...{ class: ("back-btn") }, }));
    const __VLS_2 = __VLS_1({ ...{ 'onClick': {} }, link: (true), ...{ class: ("back-btn") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_6;
    const __VLS_7 = {
        onClick: (__VLS_ctx.handleBack)
    };
    let __VLS_3;
    let __VLS_4;
    const __VLS_8 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
    /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
    const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ArrowLeft;
    /** @type { [typeof __VLS_components.ArrowLeft, ] } */
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({}));
    const __VLS_16 = __VLS_15({}, ...__VLS_functionalComponentArgsRest(__VLS_15));
    __VLS_nonNullable(__VLS_13.slots).default;
    var __VLS_13;
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("divider") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("tabs-list") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                __VLS_ctx.activeTab = 'template';
            } }, ...{ class: ("tab-item") }, ...{ class: (({ active: __VLS_ctx.activeTab === 'template' })) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                __VLS_ctx.activeTab = 'original';
            } }, ...{ class: ("tab-item") }, ...{ class: (({ active: __VLS_ctx.activeTab === 'original' })) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                __VLS_ctx.activeTab = 'student';
            } }, ...{ class: ("tab-item") }, ...{ class: (({ active: __VLS_ctx.activeTab === 'student' })) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("tab-item desc") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("header-right") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("view-body") }, });
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.loading) }, null, null);
    if (__VLS_ctx.activeTab === 'template' || __VLS_ctx.activeTab === 'original') {
        if (__VLS_ctx.hasFile(__VLS_ctx.activeTab)) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("file-viewer") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("workspace-toolbar") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("workspace-toolbar__left") }, });
            const __VLS_20 = __VLS_resolvedLocalAndGlobalComponents.ElButtonGroup;
            /** @type { [typeof __VLS_components.ElButtonGroup, typeof __VLS_components.elButtonGroup, typeof __VLS_components.ElButtonGroup, typeof __VLS_components.elButtonGroup, ] } */
            // @ts-ignore
            const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
            const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
            const __VLS_26 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({ ...{ 'onClick': {} }, size: ("small"), type: ((__VLS_ctx.regionEditorRef?.tool === 'draw' ? 'primary' : 'default')), disabled: ((!__VLS_ctx.canUseEditor)), }));
            const __VLS_28 = __VLS_27({ ...{ 'onClick': {} }, size: ("small"), type: ((__VLS_ctx.regionEditorRef?.tool === 'draw' ? 'primary' : 'default')), disabled: ((!__VLS_ctx.canUseEditor)), }, ...__VLS_functionalComponentArgsRest(__VLS_27));
            let __VLS_32;
            const __VLS_33 = {
                onClick: (...[$event]) => {
                    if (!((__VLS_ctx.activeTab === 'template' || __VLS_ctx.activeTab === 'original')))
                        return;
                    if (!((__VLS_ctx.hasFile(__VLS_ctx.activeTab))))
                        return;
                    __VLS_ctx.handleToolboxCommand('drawMode');
                }
            };
            let __VLS_29;
            let __VLS_30;
            __VLS_nonNullable(__VLS_31.slots).default;
            var __VLS_31;
            const __VLS_34 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({ ...{ 'onClick': {} }, size: ("small"), type: ((__VLS_ctx.regionEditorRef?.tool === 'adjust' ? 'primary' : 'default')), disabled: ((!__VLS_ctx.canUseEditor)), }));
            const __VLS_36 = __VLS_35({ ...{ 'onClick': {} }, size: ("small"), type: ((__VLS_ctx.regionEditorRef?.tool === 'adjust' ? 'primary' : 'default')), disabled: ((!__VLS_ctx.canUseEditor)), }, ...__VLS_functionalComponentArgsRest(__VLS_35));
            let __VLS_40;
            const __VLS_41 = {
                onClick: (...[$event]) => {
                    if (!((__VLS_ctx.activeTab === 'template' || __VLS_ctx.activeTab === 'original')))
                        return;
                    if (!((__VLS_ctx.hasFile(__VLS_ctx.activeTab))))
                        return;
                    __VLS_ctx.handleToolboxCommand('adjustMode');
                }
            };
            let __VLS_37;
            let __VLS_38;
            __VLS_nonNullable(__VLS_39.slots).default;
            var __VLS_39;
            const __VLS_42 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({ ...{ 'onClick': {} }, size: ("small"), type: ((__VLS_ctx.regionEditorRef?.tool === 'pan' ? 'primary' : 'default')), disabled: ((!__VLS_ctx.canUseEditor)), }));
            const __VLS_44 = __VLS_43({ ...{ 'onClick': {} }, size: ("small"), type: ((__VLS_ctx.regionEditorRef?.tool === 'pan' ? 'primary' : 'default')), disabled: ((!__VLS_ctx.canUseEditor)), }, ...__VLS_functionalComponentArgsRest(__VLS_43));
            let __VLS_48;
            const __VLS_49 = {
                onClick: (...[$event]) => {
                    if (!((__VLS_ctx.activeTab === 'template' || __VLS_ctx.activeTab === 'original')))
                        return;
                    if (!((__VLS_ctx.hasFile(__VLS_ctx.activeTab))))
                        return;
                    __VLS_ctx.handleToolboxCommand('panMode');
                }
            };
            let __VLS_45;
            let __VLS_46;
            __VLS_nonNullable(__VLS_47.slots).default;
            var __VLS_47;
            const __VLS_50 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({ ...{ 'onClick': {} }, size: ("small"), type: ((__VLS_ctx.regionEditorRef?.tool === 'select' ? 'primary' : 'default')), disabled: ((!__VLS_ctx.canUseEditor)), }));
            const __VLS_52 = __VLS_51({ ...{ 'onClick': {} }, size: ("small"), type: ((__VLS_ctx.regionEditorRef?.tool === 'select' ? 'primary' : 'default')), disabled: ((!__VLS_ctx.canUseEditor)), }, ...__VLS_functionalComponentArgsRest(__VLS_51));
            let __VLS_56;
            const __VLS_57 = {
                onClick: (...[$event]) => {
                    if (!((__VLS_ctx.activeTab === 'template' || __VLS_ctx.activeTab === 'original')))
                        return;
                    if (!((__VLS_ctx.hasFile(__VLS_ctx.activeTab))))
                        return;
                    __VLS_ctx.handleToolboxCommand('selectMode');
                }
            };
            let __VLS_53;
            let __VLS_54;
            __VLS_nonNullable(__VLS_55.slots).default;
            var __VLS_55;
            __VLS_nonNullable(__VLS_25.slots).default;
            var __VLS_25;
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("toolbar-divider") }, });
            const __VLS_58 = __VLS_resolvedLocalAndGlobalComponents.ElTooltip;
            /** @type { [typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ] } */
            // @ts-ignore
            const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({ content: ((__VLS_ctx.regionEditorRef?.currentHintText || '请先上传图片格式试卷后开始编辑')), placement: ("bottom"), }));
            const __VLS_60 = __VLS_59({ content: ((__VLS_ctx.regionEditorRef?.currentHintText || '请先上传图片格式试卷后开始编辑')), placement: ("bottom"), }, ...__VLS_functionalComponentArgsRest(__VLS_59));
            const __VLS_64 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({ size: ("small"), ...{ class: ("tool-btn") }, disabled: ((!__VLS_ctx.canUseEditor)), }));
            const __VLS_66 = __VLS_65({ size: ("small"), ...{ class: ("tool-btn") }, disabled: ((!__VLS_ctx.canUseEditor)), }, ...__VLS_functionalComponentArgsRest(__VLS_65));
            const __VLS_70 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
            /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
            // @ts-ignore
            const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({}));
            const __VLS_72 = __VLS_71({}, ...__VLS_functionalComponentArgsRest(__VLS_71));
            const __VLS_76 = __VLS_resolvedLocalAndGlobalComponents.InfoFilled;
            /** @type { [typeof __VLS_components.InfoFilled, ] } */
            // @ts-ignore
            const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({}));
            const __VLS_78 = __VLS_77({}, ...__VLS_functionalComponentArgsRest(__VLS_77));
            __VLS_nonNullable(__VLS_75.slots).default;
            var __VLS_75;
            __VLS_nonNullable(__VLS_69.slots).default;
            var __VLS_69;
            __VLS_nonNullable(__VLS_63.slots).default;
            var __VLS_63;
            const __VLS_82 = __VLS_resolvedLocalAndGlobalComponents.ElDropdown;
            /** @type { [typeof __VLS_components.ElDropdown, typeof __VLS_components.elDropdown, typeof __VLS_components.ElDropdown, typeof __VLS_components.elDropdown, ] } */
            // @ts-ignore
            const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({ ...{ 'onCommand': {} }, trigger: ("hover"), }));
            const __VLS_84 = __VLS_83({ ...{ 'onCommand': {} }, trigger: ("hover"), }, ...__VLS_functionalComponentArgsRest(__VLS_83));
            let __VLS_88;
            const __VLS_89 = {
                onCommand: (__VLS_ctx.handleToolboxCommand)
            };
            let __VLS_85;
            let __VLS_86;
            const __VLS_90 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({ size: ("small"), ...{ class: ("tool-btn") }, disabled: ((!__VLS_ctx.canUseEditor)), }));
            const __VLS_92 = __VLS_91({ size: ("small"), ...{ class: ("tool-btn") }, disabled: ((!__VLS_ctx.canUseEditor)), }, ...__VLS_functionalComponentArgsRest(__VLS_91));
            const __VLS_96 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
            /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
            // @ts-ignore
            const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({}));
            const __VLS_98 = __VLS_97({}, ...__VLS_functionalComponentArgsRest(__VLS_97));
            const __VLS_102 = __VLS_resolvedLocalAndGlobalComponents.Tools;
            /** @type { [typeof __VLS_components.Tools, ] } */
            // @ts-ignore
            const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({}));
            const __VLS_104 = __VLS_103({}, ...__VLS_functionalComponentArgsRest(__VLS_103));
            __VLS_nonNullable(__VLS_101.slots).default;
            var __VLS_101;
            const __VLS_108 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
            /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
            // @ts-ignore
            const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({ ...{ class: ("el-icon--right") }, }));
            const __VLS_110 = __VLS_109({ ...{ class: ("el-icon--right") }, }, ...__VLS_functionalComponentArgsRest(__VLS_109));
            const __VLS_114 = __VLS_resolvedLocalAndGlobalComponents.ArrowDown;
            /** @type { [typeof __VLS_components.ArrowDown, ] } */
            // @ts-ignore
            const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({}));
            const __VLS_116 = __VLS_115({}, ...__VLS_functionalComponentArgsRest(__VLS_115));
            __VLS_nonNullable(__VLS_113.slots).default;
            var __VLS_113;
            __VLS_nonNullable(__VLS_95.slots).default;
            var __VLS_95;
            __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
            {
                const { dropdown: __VLS_thisSlot } = __VLS_nonNullable(__VLS_87.slots);
                const __VLS_120 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownMenu;
                /** @type { [typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.elDropdownMenu, typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.elDropdownMenu, ] } */
                // @ts-ignore
                const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({}));
                const __VLS_122 = __VLS_121({}, ...__VLS_functionalComponentArgsRest(__VLS_121));
                const __VLS_126 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
                /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ] } */
                // @ts-ignore
                const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({ command: ("drawMode"), }));
                const __VLS_128 = __VLS_127({ command: ("drawMode"), }, ...__VLS_functionalComponentArgsRest(__VLS_127));
                __VLS_nonNullable(__VLS_131.slots).default;
                var __VLS_131;
                const __VLS_132 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
                /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ] } */
                // @ts-ignore
                const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({ command: ("adjustMode"), }));
                const __VLS_134 = __VLS_133({ command: ("adjustMode"), }, ...__VLS_functionalComponentArgsRest(__VLS_133));
                __VLS_nonNullable(__VLS_137.slots).default;
                var __VLS_137;
                const __VLS_138 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
                /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ] } */
                // @ts-ignore
                const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({ command: ("panMode"), }));
                const __VLS_140 = __VLS_139({ command: ("panMode"), }, ...__VLS_functionalComponentArgsRest(__VLS_139));
                __VLS_nonNullable(__VLS_143.slots).default;
                var __VLS_143;
                const __VLS_144 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
                /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ] } */
                // @ts-ignore
                const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({ command: ("selectMode"), }));
                const __VLS_146 = __VLS_145({ command: ("selectMode"), }, ...__VLS_functionalComponentArgsRest(__VLS_145));
                __VLS_nonNullable(__VLS_149.slots).default;
                var __VLS_149;
                const __VLS_150 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
                /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ] } */
                // @ts-ignore
                const __VLS_151 = __VLS_asFunctionalComponent(__VLS_150, new __VLS_150({ divided: (true), command: ("addRegion"), }));
                const __VLS_152 = __VLS_151({ divided: (true), command: ("addRegion"), }, ...__VLS_functionalComponentArgsRest(__VLS_151));
                __VLS_nonNullable(__VLS_155.slots).default;
                var __VLS_155;
                const __VLS_156 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
                /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ] } */
                // @ts-ignore
                const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({ command: ("modifyRegion"), }));
                const __VLS_158 = __VLS_157({ command: ("modifyRegion"), }, ...__VLS_functionalComponentArgsRest(__VLS_157));
                __VLS_nonNullable(__VLS_161.slots).default;
                var __VLS_161;
                const __VLS_162 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
                /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ] } */
                // @ts-ignore
                const __VLS_163 = __VLS_asFunctionalComponent(__VLS_162, new __VLS_162({ command: ("editRegion"), }));
                const __VLS_164 = __VLS_163({ command: ("editRegion"), }, ...__VLS_functionalComponentArgsRest(__VLS_163));
                __VLS_nonNullable(__VLS_167.slots).default;
                var __VLS_167;
                const __VLS_168 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
                /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ] } */
                // @ts-ignore
                const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({ command: ("deleteRegion"), }));
                const __VLS_170 = __VLS_169({ command: ("deleteRegion"), }, ...__VLS_functionalComponentArgsRest(__VLS_169));
                __VLS_nonNullable(__VLS_173.slots).default;
                var __VLS_173;
                const __VLS_174 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
                /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ] } */
                // @ts-ignore
                const __VLS_175 = __VLS_asFunctionalComponent(__VLS_174, new __VLS_174({ divided: (true), command: ("zoomIn"), }));
                const __VLS_176 = __VLS_175({ divided: (true), command: ("zoomIn"), }, ...__VLS_functionalComponentArgsRest(__VLS_175));
                __VLS_nonNullable(__VLS_179.slots).default;
                var __VLS_179;
                const __VLS_180 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
                /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ] } */
                // @ts-ignore
                const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({ command: ("zoomOut"), }));
                const __VLS_182 = __VLS_181({ command: ("zoomOut"), }, ...__VLS_functionalComponentArgsRest(__VLS_181));
                __VLS_nonNullable(__VLS_185.slots).default;
                var __VLS_185;
                const __VLS_186 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
                /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ] } */
                // @ts-ignore
                const __VLS_187 = __VLS_asFunctionalComponent(__VLS_186, new __VLS_186({ command: ("fitView"), }));
                const __VLS_188 = __VLS_187({ command: ("fitView"), }, ...__VLS_functionalComponentArgsRest(__VLS_187));
                __VLS_nonNullable(__VLS_191.slots).default;
                var __VLS_191;
                const __VLS_192 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
                /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ] } */
                // @ts-ignore
                const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({ command: ("resetView"), }));
                const __VLS_194 = __VLS_193({ command: ("resetView"), }, ...__VLS_functionalComponentArgsRest(__VLS_193));
                __VLS_nonNullable(__VLS_197.slots).default;
                var __VLS_197;
                __VLS_nonNullable(__VLS_125.slots).default;
                var __VLS_125;
            }
            var __VLS_87;
            if (__VLS_ctx.regionEditorRef?.scale) {
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("zoom-indicator") }, });
                (Math.round(__VLS_ctx.regionEditorRef.scale * 100));
            }
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("workspace-toolbar__right") }, });
            const __VLS_198 = __VLS_resolvedLocalAndGlobalComponents.ElUpload;
            /** @type { [typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ] } */
            // @ts-ignore
            const __VLS_199 = __VLS_asFunctionalComponent(__VLS_198, new __VLS_198({ action: ("#"), autoUpload: ((false)), showFileList: ((false)), accept: (".pdf,.png,.jpg,.jpeg"), onChange: (((file) => __VLS_ctx.handleFileUpload(__VLS_ctx.activeTab, file))), }));
            const __VLS_200 = __VLS_199({ action: ("#"), autoUpload: ((false)), showFileList: ((false)), accept: (".pdf,.png,.jpg,.jpeg"), onChange: (((file) => __VLS_ctx.handleFileUpload(__VLS_ctx.activeTab, file))), }, ...__VLS_functionalComponentArgsRest(__VLS_199));
            const __VLS_204 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({ size: ("small"), }));
            const __VLS_206 = __VLS_205({ size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_205));
            __VLS_nonNullable(__VLS_209.slots).default;
            var __VLS_209;
            __VLS_nonNullable(__VLS_203.slots).default;
            var __VLS_203;
            const __VLS_210 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_211 = __VLS_asFunctionalComponent(__VLS_210, new __VLS_210({ ...{ 'onClick': {} }, size: ("small"), type: ("primary"), disabled: ((!__VLS_ctx.canUseEditor)), }));
            const __VLS_212 = __VLS_211({ ...{ 'onClick': {} }, size: ("small"), type: ("primary"), disabled: ((!__VLS_ctx.canUseEditor)), }, ...__VLS_functionalComponentArgsRest(__VLS_211));
            let __VLS_216;
            const __VLS_217 = {
                onClick: (__VLS_ctx.handleSaveRegions)
            };
            let __VLS_213;
            let __VLS_214;
            __VLS_nonNullable(__VLS_215.slots).default;
            var __VLS_215;
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("subject-name") }, });
            (__VLS_ctx.subjectName);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("image-content") }, });
            if (!__VLS_ctx.isPdf(__VLS_ctx.getFileUrl(__VLS_ctx.activeTab))) {
                // @ts-ignore
                [PaperRegionEditor, PaperRegionEditor,];
                // @ts-ignore
                const __VLS_218 = __VLS_asFunctionalComponent(PaperRegionEditor, new PaperRegionEditor({ ...{ 'onUpdate:regions': {} }, ...{ 'onSave': {} }, ref: ("regionEditorRef"), key: ((`${__VLS_ctx.activeTab}-${__VLS_ctx.getFileUrl(__VLS_ctx.activeTab)}`)), imageUrl: ((__VLS_ctx.resolveFileUrl(__VLS_ctx.getFileUrl(__VLS_ctx.activeTab)))), regions: ((__VLS_ctx.getRegions(__VLS_ctx.activeTab))), subjectName: ((__VLS_ctx.subjectName)), hideToolbar: ((true)), }));
                const __VLS_219 = __VLS_218({ ...{ 'onUpdate:regions': {} }, ...{ 'onSave': {} }, ref: ("regionEditorRef"), key: ((`${__VLS_ctx.activeTab}-${__VLS_ctx.getFileUrl(__VLS_ctx.activeTab)}`)), imageUrl: ((__VLS_ctx.resolveFileUrl(__VLS_ctx.getFileUrl(__VLS_ctx.activeTab)))), regions: ((__VLS_ctx.getRegions(__VLS_ctx.activeTab))), subjectName: ((__VLS_ctx.subjectName)), hideToolbar: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_218));
                // @ts-ignore navigation for `const regionEditorRef = ref()`
                __VLS_ctx.regionEditorRef;
                var __VLS_223 = {};
                let __VLS_224;
                const __VLS_225 = {
                    'onUpdate:regions': ((regions) => __VLS_ctx.handleRegionsChange(__VLS_ctx.activeTab, regions))
                };
                const __VLS_226 = {
                    onSave: ((regions) => __VLS_ctx.savePaperRegions(__VLS_ctx.activeTab, regions))
                };
                let __VLS_220;
                let __VLS_221;
                var __VLS_222;
            }
            else {
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("pdf-preview-wrapper") }, });
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("preview-toolbar") }, });
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("preview-toolbar-left") }, });
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("pdf-mode-tag") }, });
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("preview-toolbar-right") }, });
                const __VLS_227 = __VLS_resolvedLocalAndGlobalComponents.ElUpload;
                /** @type { [typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ] } */
                // @ts-ignore
                const __VLS_228 = __VLS_asFunctionalComponent(__VLS_227, new __VLS_227({ action: ("#"), autoUpload: ((false)), showFileList: ((false)), accept: (".pdf,.png,.jpg,.jpeg"), onChange: (((file) => __VLS_ctx.handleFileUpload(__VLS_ctx.activeTab, file))), }));
                const __VLS_229 = __VLS_228({ action: ("#"), autoUpload: ((false)), showFileList: ((false)), accept: (".pdf,.png,.jpg,.jpeg"), onChange: (((file) => __VLS_ctx.handleFileUpload(__VLS_ctx.activeTab, file))), }, ...__VLS_functionalComponentArgsRest(__VLS_228));
                const __VLS_233 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
                /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
                // @ts-ignore
                const __VLS_234 = __VLS_asFunctionalComponent(__VLS_233, new __VLS_233({ size: ("small"), }));
                const __VLS_235 = __VLS_234({ size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_234));
                __VLS_nonNullable(__VLS_238.slots).default;
                var __VLS_238;
                __VLS_nonNullable(__VLS_232.slots).default;
                var __VLS_232;
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("preview-subject") }, });
                (__VLS_ctx.subjectName);
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("pdf-notice") }, });
                __VLS_elementAsFunction(__VLS_intrinsicElements.iframe, __VLS_intrinsicElements.iframe)({ src: ((__VLS_ctx.resolveFileUrl(__VLS_ctx.getFileUrl(__VLS_ctx.activeTab)))), ...{ class: ("pdf-iframe") }, });
            }
        }
        else {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("empty-upload") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("empty-message") }, });
            (__VLS_ctx.activeTab === 'template' ? '样板答题卡' : '原卷');
            const __VLS_239 = __VLS_resolvedLocalAndGlobalComponents.ElUpload;
            /** @type { [typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ] } */
            // @ts-ignore
            const __VLS_240 = __VLS_asFunctionalComponent(__VLS_239, new __VLS_239({ drag: (true), action: ("#"), autoUpload: ((false)), showFileList: ((false)), accept: (".pdf,.png,.jpg,.jpeg"), onChange: (((file) => __VLS_ctx.handleFileUpload(__VLS_ctx.activeTab, file))), }));
            const __VLS_241 = __VLS_240({ drag: (true), action: ("#"), autoUpload: ((false)), showFileList: ((false)), accept: (".pdf,.png,.jpg,.jpeg"), onChange: (((file) => __VLS_ctx.handleFileUpload(__VLS_ctx.activeTab, file))), }, ...__VLS_functionalComponentArgsRest(__VLS_240));
            const __VLS_245 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
            /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
            // @ts-ignore
            const __VLS_246 = __VLS_asFunctionalComponent(__VLS_245, new __VLS_245({ ...{ class: ("el-icon--upload") }, }));
            const __VLS_247 = __VLS_246({ ...{ class: ("el-icon--upload") }, }, ...__VLS_functionalComponentArgsRest(__VLS_246));
            const __VLS_251 = __VLS_resolvedLocalAndGlobalComponents.UploadFilled;
            /** @type { [typeof __VLS_components.UploadFilled, typeof __VLS_components.uploadFilled, ] } */
            // @ts-ignore
            const __VLS_252 = __VLS_asFunctionalComponent(__VLS_251, new __VLS_251({}));
            const __VLS_253 = __VLS_252({}, ...__VLS_functionalComponentArgsRest(__VLS_252));
            __VLS_nonNullable(__VLS_250.slots).default;
            var __VLS_250;
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("el-upload__text") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.em, __VLS_intrinsicElements.em)({});
            __VLS_nonNullable(__VLS_244.slots).default;
            var __VLS_244;
        }
    }
    else if (__VLS_ctx.activeTab === 'student') {
        if (!__VLS_ctx.selectedStudent) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("student-list-view") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("search-bar") }, });
            const __VLS_257 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
            /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
            // @ts-ignore
            const __VLS_258 = __VLS_asFunctionalComponent(__VLS_257, new __VLS_257({ ...{ 'onInput': {} }, modelValue: ((__VLS_ctx.searchKeyword)), placeholder: ("搜索学号或姓名"), ...{ style: ({}) }, clearable: (true), }));
            const __VLS_259 = __VLS_258({ ...{ 'onInput': {} }, modelValue: ((__VLS_ctx.searchKeyword)), placeholder: ("搜索学号或姓名"), ...{ style: ({}) }, clearable: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_258));
            let __VLS_263;
            const __VLS_264 = {
                onInput: (__VLS_ctx.handleSearch)
            };
            let __VLS_260;
            let __VLS_261;
            __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
            {
                const { prefix: __VLS_thisSlot } = __VLS_nonNullable(__VLS_262.slots);
                const __VLS_265 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
                /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
                // @ts-ignore
                const __VLS_266 = __VLS_asFunctionalComponent(__VLS_265, new __VLS_265({}));
                const __VLS_267 = __VLS_266({}, ...__VLS_functionalComponentArgsRest(__VLS_266));
                const __VLS_271 = __VLS_resolvedLocalAndGlobalComponents.Search;
                /** @type { [typeof __VLS_components.Search, ] } */
                // @ts-ignore
                const __VLS_272 = __VLS_asFunctionalComponent(__VLS_271, new __VLS_271({}));
                const __VLS_273 = __VLS_272({}, ...__VLS_functionalComponentArgsRest(__VLS_272));
                __VLS_nonNullable(__VLS_270.slots).default;
                var __VLS_270;
            }
            var __VLS_262;
            const __VLS_277 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
            /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
            // @ts-ignore
            const __VLS_278 = __VLS_asFunctionalComponent(__VLS_277, new __VLS_277({ data: ((__VLS_ctx.studentList)), stripe: (true), height: ("calc(100vh - 250px)"), ...{ style: ({}) }, }));
            const __VLS_279 = __VLS_278({ data: ((__VLS_ctx.studentList)), stripe: (true), height: ("calc(100vh - 250px)"), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_278));
            const __VLS_283 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
            /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
            // @ts-ignore
            const __VLS_284 = __VLS_asFunctionalComponent(__VLS_283, new __VLS_283({ prop: ("studentNo"), label: ("学号"), minWidth: ("150"), }));
            const __VLS_285 = __VLS_284({ prop: ("studentNo"), label: ("学号"), minWidth: ("150"), }, ...__VLS_functionalComponentArgsRest(__VLS_284));
            const __VLS_289 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
            /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
            // @ts-ignore
            const __VLS_290 = __VLS_asFunctionalComponent(__VLS_289, new __VLS_289({ prop: ("studentName"), label: ("姓名"), minWidth: ("120"), }));
            const __VLS_291 = __VLS_290({ prop: ("studentName"), label: ("姓名"), minWidth: ("120"), }, ...__VLS_functionalComponentArgsRest(__VLS_290));
            const __VLS_295 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
            /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
            // @ts-ignore
            const __VLS_296 = __VLS_asFunctionalComponent(__VLS_295, new __VLS_295({ prop: ("totalScore"), label: ("总分"), minWidth: ("100"), align: ("center"), }));
            const __VLS_297 = __VLS_296({ prop: ("totalScore"), label: ("总分"), minWidth: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_296));
            const __VLS_301 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
            /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
            // @ts-ignore
            const __VLS_302 = __VLS_asFunctionalComponent(__VLS_301, new __VLS_301({ label: ("答题卡"), minWidth: ("120"), align: ("center"), }));
            const __VLS_303 = __VLS_302({ label: ("答题卡"), minWidth: ("120"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_302));
            __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
            {
                const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_306.slots);
                const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
                const __VLS_307 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_308 = __VLS_asFunctionalComponent(__VLS_307, new __VLS_307({ type: ((row.hasAnswerSheet ? 'success' : 'info')), size: ("small"), }));
                const __VLS_309 = __VLS_308({ type: ((row.hasAnswerSheet ? 'success' : 'info')), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_308));
                (row.hasAnswerSheet ? '已上传' : '未上传');
                __VLS_nonNullable(__VLS_312.slots).default;
                var __VLS_312;
            }
            var __VLS_306;
            const __VLS_313 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
            /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
            // @ts-ignore
            const __VLS_314 = __VLS_asFunctionalComponent(__VLS_313, new __VLS_313({ label: ("ocr"), minWidth: ("100"), align: ("center"), }));
            const __VLS_315 = __VLS_314({ label: ("ocr"), minWidth: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_314));
            __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
            {
                const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_318.slots);
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-secondary") }, });
            }
            var __VLS_318;
            const __VLS_319 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
            /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
            // @ts-ignore
            const __VLS_320 = __VLS_asFunctionalComponent(__VLS_319, new __VLS_319({ label: ("切分"), minWidth: ("100"), align: ("center"), }));
            const __VLS_321 = __VLS_320({ label: ("切分"), minWidth: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_320));
            __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
            {
                const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_324.slots);
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-secondary") }, });
                (__VLS_ctx.studentSplitLabel);
            }
            var __VLS_324;
            const __VLS_325 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
            /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
            // @ts-ignore
            const __VLS_326 = __VLS_asFunctionalComponent(__VLS_325, new __VLS_325({ label: ("操作"), width: ("100"), align: ("center"), fixed: ("right"), }));
            const __VLS_327 = __VLS_326({ label: ("操作"), width: ("100"), align: ("center"), fixed: ("right"), }, ...__VLS_functionalComponentArgsRest(__VLS_326));
            __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
            {
                const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_330.slots);
                const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
                const __VLS_331 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
                /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
                // @ts-ignore
                const __VLS_332 = __VLS_asFunctionalComponent(__VLS_331, new __VLS_331({ ...{ 'onClick': {} }, type: ("primary"), link: (true), }));
                const __VLS_333 = __VLS_332({ ...{ 'onClick': {} }, type: ("primary"), link: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_332));
                let __VLS_337;
                const __VLS_338 = {
                    onClick: (...[$event]) => {
                        if (!(!((__VLS_ctx.activeTab === 'template' || __VLS_ctx.activeTab === 'original'))))
                            return;
                        if (!((__VLS_ctx.activeTab === 'student')))
                            return;
                        if (!((!__VLS_ctx.selectedStudent)))
                            return;
                        __VLS_ctx.enterStudentPaper(row);
                    }
                };
                let __VLS_334;
                let __VLS_335;
                __VLS_nonNullable(__VLS_336.slots).default;
                var __VLS_336;
            }
            var __VLS_330;
            __VLS_nonNullable(__VLS_282.slots).default;
            var __VLS_282;
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("pagination-container") }, });
            const __VLS_339 = __VLS_resolvedLocalAndGlobalComponents.ElPagination;
            /** @type { [typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ] } */
            // @ts-ignore
            const __VLS_340 = __VLS_asFunctionalComponent(__VLS_339, new __VLS_339({ ...{ 'onSizeChange': {} }, ...{ 'onCurrentChange': {} }, currentPage: ((__VLS_ctx.currentPage)), pageSize: ((__VLS_ctx.pageSize)), total: ((__VLS_ctx.totalStudents)), pageSizes: (([10, 20, 50, 100])), layout: ("total, sizes, prev, pager, next, jumper"), }));
            const __VLS_341 = __VLS_340({ ...{ 'onSizeChange': {} }, ...{ 'onCurrentChange': {} }, currentPage: ((__VLS_ctx.currentPage)), pageSize: ((__VLS_ctx.pageSize)), total: ((__VLS_ctx.totalStudents)), pageSizes: (([10, 20, 50, 100])), layout: ("total, sizes, prev, pager, next, jumper"), }, ...__VLS_functionalComponentArgsRest(__VLS_340));
            let __VLS_345;
            const __VLS_346 = {
                onSizeChange: (__VLS_ctx.handleSizeChange)
            };
            const __VLS_347 = {
                onCurrentChange: (__VLS_ctx.handleCurrentChange)
            };
            let __VLS_342;
            let __VLS_343;
            var __VLS_344;
        }
        else {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("student-paper-view") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("viewer-header") }, });
            const __VLS_348 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_349 = __VLS_asFunctionalComponent(__VLS_348, new __VLS_348({ ...{ 'onClick': {} }, link: (true), }));
            const __VLS_350 = __VLS_349({ ...{ 'onClick': {} }, link: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_349));
            let __VLS_354;
            const __VLS_355 = {
                onClick: (...[$event]) => {
                    if (!(!((__VLS_ctx.activeTab === 'template' || __VLS_ctx.activeTab === 'original'))))
                        return;
                    if (!((__VLS_ctx.activeTab === 'student')))
                        return;
                    if (!(!((!__VLS_ctx.selectedStudent))))
                        return;
                    __VLS_ctx.selectedStudent = null;
                }
            };
            let __VLS_351;
            let __VLS_352;
            const __VLS_356 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
            /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
            // @ts-ignore
            const __VLS_357 = __VLS_asFunctionalComponent(__VLS_356, new __VLS_356({}));
            const __VLS_358 = __VLS_357({}, ...__VLS_functionalComponentArgsRest(__VLS_357));
            const __VLS_362 = __VLS_resolvedLocalAndGlobalComponents.Back;
            /** @type { [typeof __VLS_components.Back, ] } */
            // @ts-ignore
            const __VLS_363 = __VLS_asFunctionalComponent(__VLS_362, new __VLS_362({}));
            const __VLS_364 = __VLS_363({}, ...__VLS_functionalComponentArgsRest(__VLS_363));
            __VLS_nonNullable(__VLS_361.slots).default;
            var __VLS_361;
            __VLS_nonNullable(__VLS_353.slots).default;
            var __VLS_353;
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("current-student") }, });
            (__VLS_ctx.selectedStudent.studentName);
            (__VLS_ctx.selectedStudent.studentNo);
            if (__VLS_ctx.selectedStudent.hasAnswerSheet) {
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("file-viewer") }, });
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("image-content") }, });
                if (!__VLS_ctx.isPdf(__VLS_ctx.selectedStudent.answerSheetUrl)) {
                    // @ts-ignore
                    [PaperRegionEditor, PaperRegionEditor,];
                    // @ts-ignore
                    const __VLS_368 = __VLS_asFunctionalComponent(PaperRegionEditor, new PaperRegionEditor({ key: ((`${__VLS_ctx.selectedStudent.studentNo}-${__VLS_ctx.selectedStudent.answerSheetUrl}`)), imageUrl: ((__VLS_ctx.resolveFileUrl(__VLS_ctx.selectedStudent.answerSheetUrl))), regions: ((__VLS_ctx.paperConfig.templateRegions)), subjectName: ((__VLS_ctx.subjectName)), initialTool: ("pan"), showSave: ((false)), readonly: (true), }));
                    const __VLS_369 = __VLS_368({ key: ((`${__VLS_ctx.selectedStudent.studentNo}-${__VLS_ctx.selectedStudent.answerSheetUrl}`)), imageUrl: ((__VLS_ctx.resolveFileUrl(__VLS_ctx.selectedStudent.answerSheetUrl))), regions: ((__VLS_ctx.paperConfig.templateRegions)), subjectName: ((__VLS_ctx.subjectName)), initialTool: ("pan"), showSave: ((false)), readonly: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_368));
                    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
                    {
                        const { "toolbar-extra": __VLS_thisSlot } = __VLS_nonNullable(__VLS_372.slots);
                        const __VLS_373 = __VLS_resolvedLocalAndGlobalComponents.ElUpload;
                        /** @type { [typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ] } */
                        // @ts-ignore
                        const __VLS_374 = __VLS_asFunctionalComponent(__VLS_373, new __VLS_373({ action: ("#"), autoUpload: ((false)), showFileList: ((false)), accept: (".pdf,.png,.jpg,.jpeg"), onChange: (((file) => __VLS_ctx.handleStudentUpload(file))), }));
                        const __VLS_375 = __VLS_374({ action: ("#"), autoUpload: ((false)), showFileList: ((false)), accept: (".pdf,.png,.jpg,.jpeg"), onChange: (((file) => __VLS_ctx.handleStudentUpload(file))), }, ...__VLS_functionalComponentArgsRest(__VLS_374));
                        const __VLS_379 = __VLS_resolvedLocalAndGlobalComponents.ElTooltip;
                        /** @type { [typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ] } */
                        // @ts-ignore
                        const __VLS_380 = __VLS_asFunctionalComponent(__VLS_379, new __VLS_379({ content: ("重新上传当前考生原卷"), placement: ("bottom"), }));
                        const __VLS_381 = __VLS_380({ content: ("重新上传当前考生原卷"), placement: ("bottom"), }, ...__VLS_functionalComponentArgsRest(__VLS_380));
                        const __VLS_385 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
                        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
                        // @ts-ignore
                        const __VLS_386 = __VLS_asFunctionalComponent(__VLS_385, new __VLS_385({ size: ("small"), }));
                        const __VLS_387 = __VLS_386({ size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_386));
                        __VLS_nonNullable(__VLS_390.slots).default;
                        var __VLS_390;
                        __VLS_nonNullable(__VLS_384.slots).default;
                        var __VLS_384;
                        __VLS_nonNullable(__VLS_378.slots).default;
                        var __VLS_378;
                    }
                    var __VLS_372;
                }
                else {
                    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("pdf-preview-wrapper") }, });
                    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("preview-toolbar") }, });
                    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("preview-toolbar-left") }, });
                    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("pdf-mode-tag") }, });
                    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("preview-toolbar-right") }, });
                    const __VLS_391 = __VLS_resolvedLocalAndGlobalComponents.ElUpload;
                    /** @type { [typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ] } */
                    // @ts-ignore
                    const __VLS_392 = __VLS_asFunctionalComponent(__VLS_391, new __VLS_391({ action: ("#"), autoUpload: ((false)), showFileList: ((false)), accept: (".pdf,.png,.jpg,.jpeg"), onChange: (((file) => __VLS_ctx.handleStudentUpload(file))), }));
                    const __VLS_393 = __VLS_392({ action: ("#"), autoUpload: ((false)), showFileList: ((false)), accept: (".pdf,.png,.jpg,.jpeg"), onChange: (((file) => __VLS_ctx.handleStudentUpload(file))), }, ...__VLS_functionalComponentArgsRest(__VLS_392));
                    const __VLS_397 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
                    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
                    // @ts-ignore
                    const __VLS_398 = __VLS_asFunctionalComponent(__VLS_397, new __VLS_397({ size: ("small"), }));
                    const __VLS_399 = __VLS_398({ size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_398));
                    __VLS_nonNullable(__VLS_402.slots).default;
                    var __VLS_402;
                    __VLS_nonNullable(__VLS_396.slots).default;
                    var __VLS_396;
                    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("preview-subject") }, });
                    (__VLS_ctx.subjectName);
                    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("pdf-notice") }, });
                    __VLS_elementAsFunction(__VLS_intrinsicElements.iframe, __VLS_intrinsicElements.iframe)({ src: ((__VLS_ctx.resolveFileUrl(__VLS_ctx.selectedStudent.answerSheetUrl))), ...{ class: ("pdf-iframe") }, });
                }
            }
            else {
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("empty-upload") }, });
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("empty-message") }, });
                const __VLS_403 = __VLS_resolvedLocalAndGlobalComponents.ElUpload;
                /** @type { [typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ] } */
                // @ts-ignore
                const __VLS_404 = __VLS_asFunctionalComponent(__VLS_403, new __VLS_403({ drag: (true), action: ("#"), autoUpload: ((false)), showFileList: ((false)), accept: (".pdf,.png,.jpg,.jpeg"), onChange: (((file) => __VLS_ctx.handleStudentUpload(file))), }));
                const __VLS_405 = __VLS_404({ drag: (true), action: ("#"), autoUpload: ((false)), showFileList: ((false)), accept: (".pdf,.png,.jpg,.jpeg"), onChange: (((file) => __VLS_ctx.handleStudentUpload(file))), }, ...__VLS_functionalComponentArgsRest(__VLS_404));
                const __VLS_409 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
                /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
                // @ts-ignore
                const __VLS_410 = __VLS_asFunctionalComponent(__VLS_409, new __VLS_409({ ...{ class: ("el-icon--upload") }, }));
                const __VLS_411 = __VLS_410({ ...{ class: ("el-icon--upload") }, }, ...__VLS_functionalComponentArgsRest(__VLS_410));
                const __VLS_415 = __VLS_resolvedLocalAndGlobalComponents.UploadFilled;
                /** @type { [typeof __VLS_components.UploadFilled, typeof __VLS_components.uploadFilled, ] } */
                // @ts-ignore
                const __VLS_416 = __VLS_asFunctionalComponent(__VLS_415, new __VLS_415({}));
                const __VLS_417 = __VLS_416({}, ...__VLS_functionalComponentArgsRest(__VLS_416));
                __VLS_nonNullable(__VLS_414.slots).default;
                var __VLS_414;
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("el-upload__text") }, });
                __VLS_nonNullable(__VLS_408.slots).default;
                var __VLS_408;
            }
        }
    }
    __VLS_styleScopedClasses['paper-edit-view'];
    __VLS_styleScopedClasses['view-header'];
    __VLS_styleScopedClasses['header-left'];
    __VLS_styleScopedClasses['back-btn'];
    __VLS_styleScopedClasses['divider'];
    __VLS_styleScopedClasses['tabs-list'];
    __VLS_styleScopedClasses['tab-item'];
    __VLS_styleScopedClasses['active'];
    __VLS_styleScopedClasses['tab-item'];
    __VLS_styleScopedClasses['active'];
    __VLS_styleScopedClasses['tab-item'];
    __VLS_styleScopedClasses['active'];
    __VLS_styleScopedClasses['tab-item'];
    __VLS_styleScopedClasses['desc'];
    __VLS_styleScopedClasses['header-right'];
    __VLS_styleScopedClasses['view-body'];
    __VLS_styleScopedClasses['file-viewer'];
    __VLS_styleScopedClasses['workspace-toolbar'];
    __VLS_styleScopedClasses['workspace-toolbar__left'];
    __VLS_styleScopedClasses['toolbar-divider'];
    __VLS_styleScopedClasses['tool-btn'];
    __VLS_styleScopedClasses['tool-btn'];
    __VLS_styleScopedClasses['el-icon--right'];
    __VLS_styleScopedClasses['zoom-indicator'];
    __VLS_styleScopedClasses['workspace-toolbar__right'];
    __VLS_styleScopedClasses['subject-name'];
    __VLS_styleScopedClasses['image-content'];
    __VLS_styleScopedClasses['pdf-preview-wrapper'];
    __VLS_styleScopedClasses['preview-toolbar'];
    __VLS_styleScopedClasses['preview-toolbar-left'];
    __VLS_styleScopedClasses['pdf-mode-tag'];
    __VLS_styleScopedClasses['preview-toolbar-right'];
    __VLS_styleScopedClasses['preview-subject'];
    __VLS_styleScopedClasses['pdf-notice'];
    __VLS_styleScopedClasses['pdf-iframe'];
    __VLS_styleScopedClasses['empty-upload'];
    __VLS_styleScopedClasses['empty-message'];
    __VLS_styleScopedClasses['el-icon--upload'];
    __VLS_styleScopedClasses['el-upload__text'];
    __VLS_styleScopedClasses['student-list-view'];
    __VLS_styleScopedClasses['search-bar'];
    __VLS_styleScopedClasses['text-secondary'];
    __VLS_styleScopedClasses['text-secondary'];
    __VLS_styleScopedClasses['pagination-container'];
    __VLS_styleScopedClasses['student-paper-view'];
    __VLS_styleScopedClasses['viewer-header'];
    __VLS_styleScopedClasses['current-student'];
    __VLS_styleScopedClasses['file-viewer'];
    __VLS_styleScopedClasses['image-content'];
    __VLS_styleScopedClasses['pdf-preview-wrapper'];
    __VLS_styleScopedClasses['preview-toolbar'];
    __VLS_styleScopedClasses['preview-toolbar-left'];
    __VLS_styleScopedClasses['pdf-mode-tag'];
    __VLS_styleScopedClasses['preview-toolbar-right'];
    __VLS_styleScopedClasses['preview-subject'];
    __VLS_styleScopedClasses['pdf-notice'];
    __VLS_styleScopedClasses['pdf-iframe'];
    __VLS_styleScopedClasses['empty-upload'];
    __VLS_styleScopedClasses['empty-message'];
    __VLS_styleScopedClasses['el-icon--upload'];
    __VLS_styleScopedClasses['el-upload__text'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "regionEditorRef": __VLS_223,
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
            UploadFilled: UploadFilled,
            Back: Back,
            ArrowLeft: ArrowLeft,
            Search: Search,
            Tools: Tools,
            ArrowDown: ArrowDown,
            InfoFilled: InfoFilled,
            PaperRegionEditor: PaperRegionEditor,
            activeTab: activeTab,
            studentList: studentList,
            selectedStudent: selectedStudent,
            loading: loading,
            regionEditorRef: regionEditorRef,
            searchKeyword: searchKeyword,
            currentPage: currentPage,
            pageSize: pageSize,
            totalStudents: totalStudents,
            paperConfig: paperConfig,
            canUseEditor: canUseEditor,
            handleToolboxCommand: handleToolboxCommand,
            handleSaveRegions: handleSaveRegions,
            studentSplitLabel: studentSplitLabel,
            handleSearch: handleSearch,
            handleSizeChange: handleSizeChange,
            handleCurrentChange: handleCurrentChange,
            hasFile: hasFile,
            getFileUrl: getFileUrl,
            getRegions: getRegions,
            handleRegionsChange: handleRegionsChange,
            isPdf: isPdf,
            resolveFileUrl: resolveFileUrl,
            handleFileUpload: handleFileUpload,
            savePaperRegions: savePaperRegions,
            enterStudentPaper: enterStudentPaper,
            handleStudentUpload: handleStudentUpload,
            handleBack: handleBack,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=PaperEditView.vue.js.map