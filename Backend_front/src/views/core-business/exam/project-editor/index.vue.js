/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Back, Edit, Refresh, Reading, User, Document } from '@element-plus/icons-vue';
import ProjectDialog from '../project/components/ProjectDialog.vue';
import OverviewPanel from './components/OverviewPanel.vue';
import ScorePanel from './components/ScorePanel.vue';
import StudentPanel from './components/StudentPanel.vue';
import { fetchProjectDetail, fetchProjectOptions } from '@/api/core-business/exam/project';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const route = useRoute();
const router = useRouter();
const loading = ref(false);
const activeTab = ref(String(route.query.tab || 'overview'));
const detail = ref(null);
const isEditingPaper = ref(false);
const dialogVisible = ref(false);
const dialogProject = ref(null);
const projectOptions = ref({
    schools: [],
    classes: [],
    subjects: []
});
const studentPanelRef = ref(null);
const scorePanelRef = ref(null);
const projectId = computed(() => String(route.query.projectId || ''));
async function loadDetail() {
    if (!projectId.value) {
        ElMessage.error('缺少项目ID');
        router.push({ name: 'ExamProject' });
        return;
    }
    loading.value = true;
    try {
        detail.value = await fetchProjectDetail(projectId.value);
    }
    finally {
        loading.value = false;
    }
}
async function loadOptions() {
    const res = await fetchProjectOptions();
    projectOptions.value = {
        schools: res.schools ?? [],
        classes: res.classes ?? [],
        subjects: res.subjects ?? []
    };
}
function goBack() {
    router.push({ name: 'ExamProject' });
}
function handleEdit() {
    if (!detail.value)
        return;
    dialogProject.value = {
        id: detail.value.project.id,
        name: detail.value.project.name,
        examType: detail.value.project.examType,
        schoolIds: detail.value.project.selectedSchoolIds,
        classIds: detail.value.project.selectedClassIds,
        subjects: detail.value.project.subjects,
        benchmarks: detail.value.benchmarks || {}
    };
    dialogVisible.value = true;
}
async function handleSaved() {
    await loadDetail();
    await Promise.all([studentPanelRef.value?.reload?.(), scorePanelRef.value?.reload?.()]);
}
onMounted(async () => {
    await Promise.all([loadOptions(), loadDetail()]);
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
    __VLS_styleScopedClasses['header-content'];
    __VLS_styleScopedClasses['header-actions'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("editor-page") }, ...{ class: (({ 'is-editing': __VLS_ctx.isEditingPaper })) }, });
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.loading) }, null, null);
    if (__VLS_ctx.detail && !__VLS_ctx.isEditingPaper) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("editor-top") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.goBack) }, ...{ class: ("editor-back") }, });
        const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ class: ("editor-back__icon") }, }));
        const __VLS_2 = __VLS_1({ ...{ class: ("editor-back__icon") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.Back;
        /** @type { [typeof __VLS_components.Back, ] } */
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({}));
        const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
        __VLS_nonNullable(__VLS_5.slots).default;
        var __VLS_5;
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("header-card") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("header-content") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("header-copy") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("header-title") }, });
        (__VLS_ctx.detail.project.name || '考试项目编辑');
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("header-meta") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("meta-item") }, });
        const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
        const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
        const __VLS_18 = __VLS_resolvedLocalAndGlobalComponents.Reading;
        /** @type { [typeof __VLS_components.Reading, ] } */
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({}));
        const __VLS_20 = __VLS_19({}, ...__VLS_functionalComponentArgsRest(__VLS_19));
        __VLS_nonNullable(__VLS_17.slots).default;
        var __VLS_17;
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("highlight") }, });
        (__VLS_ctx.detail.project.subjectCount);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("meta-divider") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("meta-item") }, });
        const __VLS_24 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
        const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
        const __VLS_30 = __VLS_resolvedLocalAndGlobalComponents.User;
        /** @type { [typeof __VLS_components.User, ] } */
        // @ts-ignore
        const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({}));
        const __VLS_32 = __VLS_31({}, ...__VLS_functionalComponentArgsRest(__VLS_31));
        __VLS_nonNullable(__VLS_29.slots).default;
        var __VLS_29;
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("highlight") }, });
        (__VLS_ctx.detail.project.studentCount);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("meta-divider") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("meta-item") }, });
        const __VLS_36 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
        const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
        const __VLS_42 = __VLS_resolvedLocalAndGlobalComponents.Document;
        /** @type { [typeof __VLS_components.Document, ] } */
        // @ts-ignore
        const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({}));
        const __VLS_44 = __VLS_43({}, ...__VLS_functionalComponentArgsRest(__VLS_43));
        __VLS_nonNullable(__VLS_41.slots).default;
        var __VLS_41;
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("highlight") }, });
        (__VLS_ctx.detail.stats.scoreRecordCount ?? 0);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("header-actions") }, });
        const __VLS_48 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({ ...{ 'onClick': {} }, icon: ((__VLS_ctx.Refresh)), }));
        const __VLS_50 = __VLS_49({ ...{ 'onClick': {} }, icon: ((__VLS_ctx.Refresh)), }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        let __VLS_54;
        const __VLS_55 = {
            onClick: (__VLS_ctx.loadDetail)
        };
        let __VLS_51;
        let __VLS_52;
        __VLS_nonNullable(__VLS_53.slots).default;
        var __VLS_53;
        const __VLS_56 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({ ...{ 'onClick': {} }, type: ("primary"), icon: ((__VLS_ctx.Edit)), }));
        const __VLS_58 = __VLS_57({ ...{ 'onClick': {} }, type: ("primary"), icon: ((__VLS_ctx.Edit)), }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        let __VLS_62;
        const __VLS_63 = {
            onClick: (__VLS_ctx.handleEdit)
        };
        let __VLS_59;
        let __VLS_60;
        __VLS_nonNullable(__VLS_61.slots).default;
        var __VLS_61;
        const __VLS_64 = __VLS_resolvedLocalAndGlobalComponents.ElTabs;
        /** @type { [typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, ] } */
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({ modelValue: ((__VLS_ctx.activeTab)), ...{ class: ("editor-tabs") }, }));
        const __VLS_66 = __VLS_65({ modelValue: ((__VLS_ctx.activeTab)), ...{ class: ("editor-tabs") }, }, ...__VLS_functionalComponentArgsRest(__VLS_65));
        const __VLS_70 = __VLS_resolvedLocalAndGlobalComponents.ElTabPane;
        /** @type { [typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ] } */
        // @ts-ignore
        const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({ label: ("项目概览"), name: ("overview"), }));
        const __VLS_72 = __VLS_71({ label: ("项目概览"), name: ("overview"), }, ...__VLS_functionalComponentArgsRest(__VLS_71));
        const __VLS_76 = __VLS_resolvedLocalAndGlobalComponents.ElTabPane;
        /** @type { [typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ] } */
        // @ts-ignore
        const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({ label: ("考生管理"), name: ("students"), }));
        const __VLS_78 = __VLS_77({ label: ("考生管理"), name: ("students"), }, ...__VLS_functionalComponentArgsRest(__VLS_77));
        const __VLS_82 = __VLS_resolvedLocalAndGlobalComponents.ElTabPane;
        /** @type { [typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ] } */
        // @ts-ignore
        const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({ label: ("成绩管理"), name: ("scores"), }));
        const __VLS_84 = __VLS_83({ label: ("成绩管理"), name: ("scores"), }, ...__VLS_functionalComponentArgsRest(__VLS_83));
        __VLS_nonNullable(__VLS_69.slots).default;
        var __VLS_69;
    }
    if (__VLS_ctx.detail) {
        // @ts-ignore
        [OverviewPanel,];
        // @ts-ignore
        const __VLS_88 = __VLS_asFunctionalComponent(OverviewPanel, new OverviewPanel({ detail: ((__VLS_ctx.detail)), }));
        const __VLS_89 = __VLS_88({ detail: ((__VLS_ctx.detail)), }, ...__VLS_functionalComponentArgsRest(__VLS_88));
        __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.activeTab === 'overview' && !__VLS_ctx.isEditingPaper) }, null, null);
        // @ts-ignore
        [StudentPanel,];
        // @ts-ignore
        const __VLS_93 = __VLS_asFunctionalComponent(StudentPanel, new StudentPanel({ ref: ("studentPanelRef"), projectId: ((__VLS_ctx.projectId)), schools: ((__VLS_ctx.detail.schools)), classes: ((__VLS_ctx.detail.classes)), }));
        const __VLS_94 = __VLS_93({ ref: ("studentPanelRef"), projectId: ((__VLS_ctx.projectId)), schools: ((__VLS_ctx.detail.schools)), classes: ((__VLS_ctx.detail.classes)), }, ...__VLS_functionalComponentArgsRest(__VLS_93));
        __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.activeTab === 'students' && !__VLS_ctx.isEditingPaper) }, null, null);
        // @ts-ignore navigation for `const studentPanelRef = ref()`
        __VLS_ctx.studentPanelRef;
        var __VLS_98 = {};
        var __VLS_97;
        // @ts-ignore
        [ScorePanel,];
        // @ts-ignore
        const __VLS_99 = __VLS_asFunctionalComponent(ScorePanel, new ScorePanel({ ...{ 'onUpdate:isEditingPaper': {} }, ref: ("scorePanelRef"), projectId: ((__VLS_ctx.projectId)), schools: ((__VLS_ctx.detail.schools)), classes: ((__VLS_ctx.detail.classes)), }));
        const __VLS_100 = __VLS_99({ ...{ 'onUpdate:isEditingPaper': {} }, ref: ("scorePanelRef"), projectId: ((__VLS_ctx.projectId)), schools: ((__VLS_ctx.detail.schools)), classes: ((__VLS_ctx.detail.classes)), }, ...__VLS_functionalComponentArgsRest(__VLS_99));
        __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.activeTab === 'scores') }, null, null);
        // @ts-ignore navigation for `const scorePanelRef = ref()`
        __VLS_ctx.scorePanelRef;
        var __VLS_104 = {};
        let __VLS_105;
        const __VLS_106 = {
            'onUpdate:isEditingPaper': ((val) => (__VLS_ctx.isEditingPaper = val))
        };
        let __VLS_101;
        let __VLS_102;
        var __VLS_103;
    }
    // @ts-ignore
    [ProjectDialog,];
    // @ts-ignore
    const __VLS_107 = __VLS_asFunctionalComponent(ProjectDialog, new ProjectDialog({ ...{ 'onSaved': {} }, modelValue: ((__VLS_ctx.dialogVisible)), mode: ("edit"), project: ((__VLS_ctx.dialogProject)), options: ((__VLS_ctx.projectOptions)), }));
    const __VLS_108 = __VLS_107({ ...{ 'onSaved': {} }, modelValue: ((__VLS_ctx.dialogVisible)), mode: ("edit"), project: ((__VLS_ctx.dialogProject)), options: ((__VLS_ctx.projectOptions)), }, ...__VLS_functionalComponentArgsRest(__VLS_107));
    let __VLS_112;
    const __VLS_113 = {
        onSaved: (__VLS_ctx.handleSaved)
    };
    let __VLS_109;
    let __VLS_110;
    var __VLS_111;
    __VLS_styleScopedClasses['editor-page'];
    __VLS_styleScopedClasses['is-editing'];
    __VLS_styleScopedClasses['editor-top'];
    __VLS_styleScopedClasses['editor-back'];
    __VLS_styleScopedClasses['editor-back__icon'];
    __VLS_styleScopedClasses['header-card'];
    __VLS_styleScopedClasses['header-content'];
    __VLS_styleScopedClasses['header-copy'];
    __VLS_styleScopedClasses['header-title'];
    __VLS_styleScopedClasses['header-meta'];
    __VLS_styleScopedClasses['meta-item'];
    __VLS_styleScopedClasses['highlight'];
    __VLS_styleScopedClasses['meta-divider'];
    __VLS_styleScopedClasses['meta-item'];
    __VLS_styleScopedClasses['highlight'];
    __VLS_styleScopedClasses['meta-divider'];
    __VLS_styleScopedClasses['meta-item'];
    __VLS_styleScopedClasses['highlight'];
    __VLS_styleScopedClasses['header-actions'];
    __VLS_styleScopedClasses['editor-tabs'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "studentPanelRef": __VLS_98,
        "scorePanelRef": __VLS_104,
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
            Edit: Edit,
            Refresh: Refresh,
            Reading: Reading,
            User: User,
            Document: Document,
            ProjectDialog: ProjectDialog,
            OverviewPanel: OverviewPanel,
            ScorePanel: ScorePanel,
            StudentPanel: StudentPanel,
            loading: loading,
            activeTab: activeTab,
            detail: detail,
            isEditingPaper: isEditingPaper,
            dialogVisible: dialogVisible,
            dialogProject: dialogProject,
            projectOptions: projectOptions,
            studentPanelRef: studentPanelRef,
            scorePanelRef: scorePanelRef,
            projectId: projectId,
            loadDetail: loadDetail,
            goBack: goBack,
            handleEdit: handleEdit,
            handleSaved: handleSaved,
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