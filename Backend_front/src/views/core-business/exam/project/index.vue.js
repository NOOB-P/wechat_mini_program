/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import ProjectDialog from './components/ProjectDialog.vue';
import { fetchDeleteProject, fetchGetProjectList, fetchProjectOptions, fetchProjectDetail } from '@/api/core-business/exam/project';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const router = useRouter();
const loading = ref(false);
const dialogVisible = ref(false);
const dialogMode = ref('create');
const tableData = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const dialogProject = ref(null);
const projectOptions = ref({
    schools: [],
    classes: [],
    subjects: []
});
const searchForm = reactive({
    name: ''
});
async function loadData() {
    loading.value = true;
    try {
        const res = await fetchGetProjectList({
            current: page.value,
            size: pageSize.value,
            name: searchForm.name
        });
        tableData.value = res.records ?? [];
        total.value = res.total ?? 0;
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
function handleSearch() {
    page.value = 1;
    loadData();
}
function handleSizeChange() {
    page.value = 1;
    loadData();
}
function handleReset() {
    searchForm.name = '';
    page.value = 1;
    loadData();
}
function handleCreate() {
    dialogMode.value = 'create';
    dialogProject.value = {
        name: '',
        schoolIds: [],
        classIds: [],
        subjects: []
    };
    dialogVisible.value = true;
}
async function handleEdit(row) {
    loading.value = true;
    try {
        const res = await fetchProjectDetail(row.id);
        dialogMode.value = 'edit';
        dialogProject.value = {
            id: res.project.id,
            name: res.project.name,
            schoolIds: res.project.selectedSchoolIds || [],
            classIds: res.project.selectedClassIds || [],
            subjects: res.project.subjects || [],
            benchmarks: res.benchmarks || {}
        };
        dialogVisible.value = true;
    }
    finally {
        loading.value = false;
    }
}
function handleEnter(row) {
    router.push({
        name: 'ExamProjectEditor',
        query: {
            projectId: row.id
        }
    });
}
async function handleDelete(row) {
    await ElMessageBox.confirm(`确定删除考试项目“${row.name}”吗？项目下班级、科目和成绩数据会一起删除。`, '删除确认', {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消'
    });
    await fetchDeleteProject(row.id);
    if (tableData.value.length === 1 && page.value > 1) {
        page.value -= 1;
    }
    await loadData();
}
function handleSaved() {
    loadData();
}
function formatDate(value) {
    if (!value)
        return '-';
    if (Array.isArray(value)) {
        const [year, month, date, hour = 0, minute = 0, second = 0] = value;
        return `${year}-${pad(month)}-${pad(date)} ${pad(hour)}:${pad(minute)}:${pad(second)}`;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return String(value);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
function pad(value) {
    return String(value).padStart(2, '0');
}
onMounted(async () => {
    await Promise.all([loadOptions(), loadData()]);
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("project-page") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ shadow: ("never"), ...{ class: ("search-card") }, }));
    const __VLS_2 = __VLS_1({ shadow: ("never"), ...{ class: ("search-card") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ ...{ 'onSubmit': {} }, inline: ((true)), model: ((__VLS_ctx.searchForm)), ...{ class: ("search-form") }, }));
    const __VLS_8 = __VLS_7({ ...{ 'onSubmit': {} }, inline: ((true)), model: ((__VLS_ctx.searchForm)), ...{ class: ("search-form") }, }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    let __VLS_12;
    const __VLS_13 = {
        onSubmit: () => { }
    };
    let __VLS_9;
    let __VLS_10;
    const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ label: ("项目名称"), }));
    const __VLS_16 = __VLS_15({ label: ("项目名称"), }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    const __VLS_20 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.searchForm.name)), clearable: (true), placeholder: ("请输入项目名称"), prefixIcon: ("Search"), }));
    const __VLS_22 = __VLS_21({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.searchForm.name)), clearable: (true), placeholder: ("请输入项目名称"), prefixIcon: ("Search"), }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    let __VLS_26;
    const __VLS_27 = {
        onKeyup: (__VLS_ctx.handleSearch)
    };
    let __VLS_23;
    let __VLS_24;
    var __VLS_25;
    __VLS_nonNullable(__VLS_19.slots).default;
    var __VLS_19;
    const __VLS_28 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
    const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
    const __VLS_34 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({ ...{ 'onClick': {} }, type: ("primary"), }));
    const __VLS_36 = __VLS_35({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_35));
    let __VLS_40;
    const __VLS_41 = {
        onClick: (__VLS_ctx.handleSearch)
    };
    let __VLS_37;
    let __VLS_38;
    __VLS_nonNullable(__VLS_39.slots).default;
    var __VLS_39;
    const __VLS_42 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({ ...{ 'onClick': {} }, }));
    const __VLS_44 = __VLS_43({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_43));
    let __VLS_48;
    const __VLS_49 = {
        onClick: (__VLS_ctx.handleReset)
    };
    let __VLS_45;
    let __VLS_46;
    __VLS_nonNullable(__VLS_47.slots).default;
    var __VLS_47;
    __VLS_nonNullable(__VLS_33.slots).default;
    var __VLS_33;
    __VLS_nonNullable(__VLS_11.slots).default;
    var __VLS_11;
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    const __VLS_50 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({ shadow: ("never"), ...{ class: ("list-card") }, }));
    const __VLS_52 = __VLS_51({ shadow: ("never"), ...{ class: ("list-card") }, }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("list-header") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("list-header__left") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({ ...{ class: ("list-title") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("list-count") }, });
    (__VLS_ctx.total);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("list-header__right") }, });
    const __VLS_56 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({ ...{ 'onClick': {} }, type: ("primary"), }));
    const __VLS_58 = __VLS_57({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    let __VLS_62;
    const __VLS_63 = {
        onClick: (__VLS_ctx.handleCreate)
    };
    let __VLS_59;
    let __VLS_60;
    const __VLS_64 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
    /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({ ...{ class: ("el-icon--left") }, }));
    const __VLS_66 = __VLS_65({ ...{ class: ("el-icon--left") }, }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    const __VLS_70 = __VLS_resolvedLocalAndGlobalComponents.Plus;
    /** @type { [typeof __VLS_components.Plus, ] } */
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({}));
    const __VLS_72 = __VLS_71({}, ...__VLS_functionalComponentArgsRest(__VLS_71));
    __VLS_nonNullable(__VLS_69.slots).default;
    var __VLS_69;
    __VLS_nonNullable(__VLS_61.slots).default;
    var __VLS_61;
    const __VLS_76 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({ data: ((__VLS_ctx.tableData)), stripe: (true), ...{ class: ("custom-table") }, }));
    const __VLS_78 = __VLS_77({ data: ((__VLS_ctx.tableData)), stripe: (true), ...{ class: ("custom-table") }, }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.loading) }, null, null);
    const __VLS_82 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({ prop: ("name"), label: ("考试项目名称"), minWidth: ("220"), }));
    const __VLS_84 = __VLS_83({ prop: ("name"), label: ("考试项目名称"), minWidth: ("220"), }, ...__VLS_functionalComponentArgsRest(__VLS_83));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_87.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.handleEnter(row);
                } }, ...{ class: ("project-name") }, });
        (row.name);
    }
    var __VLS_87;
    const __VLS_88 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({ label: ("考试科目"), minWidth: ("220"), }));
    const __VLS_90 = __VLS_89({ label: ("考试科目"), minWidth: ("220"), }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_93.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("subject-tags") }, });
        for (const [subject] of __VLS_getVForSourceType((row.subjects))) {
            const __VLS_94 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
            /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
            // @ts-ignore
            const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({ key: ((subject)), size: ("small"), effect: ("light"), ...{ class: ("subject-tag") }, }));
            const __VLS_96 = __VLS_95({ key: ((subject)), size: ("small"), effect: ("light"), ...{ class: ("subject-tag") }, }, ...__VLS_functionalComponentArgsRest(__VLS_95));
            (subject);
            __VLS_nonNullable(__VLS_99.slots).default;
            var __VLS_99;
        }
    }
    var __VLS_93;
    const __VLS_100 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({ prop: ("schoolCount"), label: ("学校数"), width: ("100"), align: ("center"), }));
    const __VLS_102 = __VLS_101({ prop: ("schoolCount"), label: ("学校数"), width: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    const __VLS_106 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({ prop: ("classCount"), label: ("班级数"), width: ("100"), align: ("center"), }));
    const __VLS_108 = __VLS_107({ prop: ("classCount"), label: ("班级数"), width: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_107));
    const __VLS_112 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({ prop: ("studentCount"), label: ("考生数"), width: ("100"), align: ("center"), }));
    const __VLS_114 = __VLS_113({ prop: ("studentCount"), label: ("考生数"), width: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_113));
    const __VLS_118 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({ label: ("更新时间"), width: ("180"), align: ("center"), }));
    const __VLS_120 = __VLS_119({ label: ("更新时间"), width: ("180"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_119));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_123.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("time-text") }, });
        (__VLS_ctx.formatDate(row.updateTime || row.createTime));
    }
    var __VLS_123;
    const __VLS_124 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({ label: ("操作"), width: ("200"), align: ("center"), fixed: ("right"), }));
    const __VLS_126 = __VLS_125({ label: ("操作"), width: ("200"), align: ("center"), fixed: ("right"), }, ...__VLS_functionalComponentArgsRest(__VLS_125));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_129.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_130 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({ ...{ 'onClick': {} }, type: ("primary"), link: (true), }));
        const __VLS_132 = __VLS_131({ ...{ 'onClick': {} }, type: ("primary"), link: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_131));
        let __VLS_136;
        const __VLS_137 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleEnter(row);
            }
        };
        let __VLS_133;
        let __VLS_134;
        __VLS_nonNullable(__VLS_135.slots).default;
        var __VLS_135;
        const __VLS_138 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({ ...{ 'onClick': {} }, type: ("primary"), link: (true), }));
        const __VLS_140 = __VLS_139({ ...{ 'onClick': {} }, type: ("primary"), link: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_139));
        let __VLS_144;
        const __VLS_145 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleEdit(row);
            }
        };
        let __VLS_141;
        let __VLS_142;
        __VLS_nonNullable(__VLS_143.slots).default;
        var __VLS_143;
        const __VLS_146 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({ ...{ 'onClick': {} }, type: ("danger"), link: (true), }));
        const __VLS_148 = __VLS_147({ ...{ 'onClick': {} }, type: ("danger"), link: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_147));
        let __VLS_152;
        const __VLS_153 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleDelete(row);
            }
        };
        let __VLS_149;
        let __VLS_150;
        __VLS_nonNullable(__VLS_151.slots).default;
        var __VLS_151;
    }
    var __VLS_129;
    __VLS_nonNullable(__VLS_81.slots).default;
    var __VLS_81;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("pagination-wrap") }, });
    const __VLS_154 = __VLS_resolvedLocalAndGlobalComponents.ElPagination;
    /** @type { [typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ] } */
    // @ts-ignore
    const __VLS_155 = __VLS_asFunctionalComponent(__VLS_154, new __VLS_154({ ...{ 'onSizeChange': {} }, ...{ 'onCurrentChange': {} }, currentPage: ((__VLS_ctx.page)), pageSize: ((__VLS_ctx.pageSize)), total: ((__VLS_ctx.total)), pageSizes: (([10, 20, 50, 100])), layout: ("total, sizes, prev, pager, next, jumper"), background: (true), }));
    const __VLS_156 = __VLS_155({ ...{ 'onSizeChange': {} }, ...{ 'onCurrentChange': {} }, currentPage: ((__VLS_ctx.page)), pageSize: ((__VLS_ctx.pageSize)), total: ((__VLS_ctx.total)), pageSizes: (([10, 20, 50, 100])), layout: ("total, sizes, prev, pager, next, jumper"), background: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_155));
    let __VLS_160;
    const __VLS_161 = {
        onSizeChange: (__VLS_ctx.handleSizeChange)
    };
    const __VLS_162 = {
        onCurrentChange: (__VLS_ctx.loadData)
    };
    let __VLS_157;
    let __VLS_158;
    var __VLS_159;
    __VLS_nonNullable(__VLS_55.slots).default;
    var __VLS_55;
    // @ts-ignore
    [ProjectDialog,];
    // @ts-ignore
    const __VLS_163 = __VLS_asFunctionalComponent(ProjectDialog, new ProjectDialog({ ...{ 'onSaved': {} }, modelValue: ((__VLS_ctx.dialogVisible)), mode: ((__VLS_ctx.dialogMode)), options: ((__VLS_ctx.projectOptions)), project: ((__VLS_ctx.dialogProject)), }));
    const __VLS_164 = __VLS_163({ ...{ 'onSaved': {} }, modelValue: ((__VLS_ctx.dialogVisible)), mode: ((__VLS_ctx.dialogMode)), options: ((__VLS_ctx.projectOptions)), project: ((__VLS_ctx.dialogProject)), }, ...__VLS_functionalComponentArgsRest(__VLS_163));
    let __VLS_168;
    const __VLS_169 = {
        onSaved: (__VLS_ctx.handleSaved)
    };
    let __VLS_165;
    let __VLS_166;
    var __VLS_167;
    __VLS_styleScopedClasses['project-page'];
    __VLS_styleScopedClasses['search-card'];
    __VLS_styleScopedClasses['search-form'];
    __VLS_styleScopedClasses['list-card'];
    __VLS_styleScopedClasses['list-header'];
    __VLS_styleScopedClasses['list-header__left'];
    __VLS_styleScopedClasses['list-title'];
    __VLS_styleScopedClasses['list-count'];
    __VLS_styleScopedClasses['list-header__right'];
    __VLS_styleScopedClasses['el-icon--left'];
    __VLS_styleScopedClasses['custom-table'];
    __VLS_styleScopedClasses['project-name'];
    __VLS_styleScopedClasses['subject-tags'];
    __VLS_styleScopedClasses['subject-tag'];
    __VLS_styleScopedClasses['time-text'];
    __VLS_styleScopedClasses['pagination-wrap'];
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
            Plus: Plus,
            ProjectDialog: ProjectDialog,
            loading: loading,
            dialogVisible: dialogVisible,
            dialogMode: dialogMode,
            tableData: tableData,
            total: total,
            page: page,
            pageSize: pageSize,
            dialogProject: dialogProject,
            projectOptions: projectOptions,
            searchForm: searchForm,
            loadData: loadData,
            handleSearch: handleSearch,
            handleSizeChange: handleSizeChange,
            handleReset: handleReset,
            handleCreate: handleCreate,
            handleEdit: handleEdit,
            handleEnter: handleEnter,
            handleDelete: handleDelete,
            handleSaved: handleSaved,
            formatDate: formatDate,
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