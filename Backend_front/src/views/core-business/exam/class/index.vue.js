/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { InfoFilled, UploadFilled, Document } from '@element-plus/icons-vue';
import { fetchGetClassList, fetchAddClass, fetchUpdateClass, fetchDeleteClass } from '@/api/core-business/exam/class';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const router = useRouter();
const route = useRoute();
const projectName = ref(route.query.projectName || '未指定项目');
const projectId = ref(route.query.projectId);
const loading = ref(false);
const tableData = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const searchForm = ref({
    school: '',
    grade: '',
    className: ''
});
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref();
const form = ref({
    id: '',
    projectId: projectId.value,
    school: '',
    grade: '',
    className: ''
});
const rules = {
    school: [{ required: true, message: '请输入学校名称', trigger: 'blur' }],
    grade: [{ required: true, message: '请输入年级', trigger: 'blur' }],
    className: [{ required: true, message: '请输入班级', trigger: 'blur' }]
};
const importVisible = ref(false);
const importLoading = ref(false);
const fileList = ref([]);
const handleOpenImport = () => {
    fileList.value = [];
    importVisible.value = true;
};
const handleFileChange = (file) => {
    fileList.value.push(file);
};
const submitImport = () => {
    importLoading.value = true;
    setTimeout(() => {
        importLoading.value = false;
        importVisible.value = false;
        ElMessage.success('导入成功');
        loadData();
    }, 1500);
};
const loadData = async () => {
    if (!projectId.value) {
        ElMessage.error('缺少考试项目ID');
        return;
    }
    loading.value = true;
    try {
        const res = await fetchGetClassList({
            current: page.value,
            size: pageSize.value,
            projectId: projectId.value,
            school: searchForm.value.school,
            grade: searchForm.value.grade,
            className: searchForm.value.className
        });
        if (res) {
            tableData.value = res.records || [];
            total.value = res.total || 0;
        }
        else {
            tableData.value = [];
            total.value = 0;
        }
    }
    catch (error) {
        ElMessage.error('加载班级列表失败');
    }
    finally {
        loading.value = false;
    }
};
const goBack = () => {
    router.push({ name: 'ExamProject' });
};
const handleSearch = () => {
    page.value = 1;
    loadData();
};
const resetSearch = () => {
    searchForm.value = { school: '', grade: '', className: '' };
    page.value = 1;
    loadData();
};
const handleAddClass = () => {
    isEdit.value = false;
    form.value = { id: '', projectId: projectId.value, school: '', grade: '', className: '' };
    dialogVisible.value = true;
};
const handleEdit = (row) => {
    isEdit.value = true;
    form.value = {
        id: row.id,
        projectId: row.projectId,
        school: row.school,
        grade: row.grade,
        className: row.className
    };
    dialogVisible.value = true;
};
const handleDelete = (row) => {
    ElMessageBox.confirm(`确定要删除班级 [${row.school} ${row.grade}${row.className}] 吗？`, '危险操作警告', {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
    }).then(async () => {
        try {
            await fetchDeleteClass(row.id);
            ElMessage.success('删除成功');
            if (tableData.value.length === 1 && page.value > 1) {
                page.value -= 1;
            }
            loadData();
        }
        catch (error) {
            ElMessage.error('删除失败');
        }
    });
};
const handleEnter = (row) => {
    router.push({
        name: 'ExamSubject',
        query: {
            projectId: projectId.value,
            classId: row.id,
            className: `${row.school} ${row.grade}${row.className}`
        }
    });
};
const handleCurrentChange = (val) => {
    page.value = val;
    loadData();
};
const submitForm = async () => {
    if (!formRef.value)
        return;
    await formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                if (isEdit.value) {
                    await fetchUpdateClass(form.value);
                }
                else {
                    await fetchAddClass(form.value);
                }
                ElMessage.success(isEdit.value ? '编辑成功' : '创建成功');
                dialogVisible.value = false;
                loadData();
            }
            catch (error) {
                ElMessage.error(isEdit.value ? '编辑失败' : '创建失败');
            }
        }
    });
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
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("page-container") }, });
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
    var __VLS_5;
    const __VLS_8 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({ shadow: ("never"), ...{ class: ("search-card mb-4") }, }));
    const __VLS_10 = __VLS_9({ shadow: ("never"), ...{ class: ("search-card mb-4") }, }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ inline: ((true)), model: ((__VLS_ctx.searchForm)), ...{ class: ("search-form-inline") }, }));
    const __VLS_16 = __VLS_15({ inline: ((true)), model: ((__VLS_ctx.searchForm)), ...{ class: ("search-form-inline") }, }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    const __VLS_20 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({ label: ("学校"), }));
    const __VLS_22 = __VLS_21({ label: ("学校"), }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    const __VLS_26 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({ modelValue: ((__VLS_ctx.searchForm.school)), placeholder: ("学校名称"), clearable: (true), }));
    const __VLS_28 = __VLS_27({ modelValue: ((__VLS_ctx.searchForm.school)), placeholder: ("学校名称"), clearable: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    __VLS_nonNullable(__VLS_25.slots).default;
    var __VLS_25;
    const __VLS_32 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({ label: ("年级"), }));
    const __VLS_34 = __VLS_33({ label: ("年级"), }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    const __VLS_38 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({ modelValue: ((__VLS_ctx.searchForm.grade)), placeholder: ("年级"), clearable: (true), }));
    const __VLS_40 = __VLS_39({ modelValue: ((__VLS_ctx.searchForm.grade)), placeholder: ("年级"), clearable: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_39));
    __VLS_nonNullable(__VLS_37.slots).default;
    var __VLS_37;
    const __VLS_44 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({ label: ("班级"), }));
    const __VLS_46 = __VLS_45({ label: ("班级"), }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    const __VLS_50 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({ modelValue: ((__VLS_ctx.searchForm.className)), placeholder: ("班级"), clearable: (true), }));
    const __VLS_52 = __VLS_51({ modelValue: ((__VLS_ctx.searchForm.className)), placeholder: ("班级"), clearable: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    __VLS_nonNullable(__VLS_49.slots).default;
    var __VLS_49;
    const __VLS_56 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({}));
    const __VLS_58 = __VLS_57({}, ...__VLS_functionalComponentArgsRest(__VLS_57));
    const __VLS_62 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({ ...{ 'onClick': {} }, type: ("primary"), }));
    const __VLS_64 = __VLS_63({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_63));
    let __VLS_68;
    const __VLS_69 = {
        onClick: (__VLS_ctx.handleSearch)
    };
    let __VLS_65;
    let __VLS_66;
    __VLS_nonNullable(__VLS_67.slots).default;
    var __VLS_67;
    const __VLS_70 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({ ...{ 'onClick': {} }, }));
    const __VLS_72 = __VLS_71({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_71));
    let __VLS_76;
    const __VLS_77 = {
        onClick: (__VLS_ctx.resetSearch)
    };
    let __VLS_73;
    let __VLS_74;
    __VLS_nonNullable(__VLS_75.slots).default;
    var __VLS_75;
    __VLS_nonNullable(__VLS_61.slots).default;
    var __VLS_61;
    __VLS_nonNullable(__VLS_19.slots).default;
    var __VLS_19;
    __VLS_nonNullable(__VLS_13.slots).default;
    var __VLS_13;
    const __VLS_78 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({ shadow: ("never"), }));
    const __VLS_80 = __VLS_79({ shadow: ("never"), }, ...__VLS_functionalComponentArgsRest(__VLS_79));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { header: __VLS_thisSlot } = __VLS_nonNullable(__VLS_83.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-between items-center") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("font-bold") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("header-actions") }, });
        const __VLS_84 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({ ...{ 'onClick': {} }, }));
        const __VLS_86 = __VLS_85({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_85));
        let __VLS_90;
        const __VLS_91 = {
            onClick: (__VLS_ctx.handleOpenImport)
        };
        let __VLS_87;
        let __VLS_88;
        __VLS_nonNullable(__VLS_89.slots).default;
        var __VLS_89;
        const __VLS_92 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_94 = __VLS_93({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_93));
        let __VLS_98;
        const __VLS_99 = {
            onClick: (__VLS_ctx.handleAddClass)
        };
        let __VLS_95;
        let __VLS_96;
        __VLS_nonNullable(__VLS_97.slots).default;
        var __VLS_97;
    }
    const __VLS_100 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({ data: ((__VLS_ctx.tableData)), border: (true), ...{ style: ({}) }, }));
    const __VLS_102 = __VLS_101({ data: ((__VLS_ctx.tableData)), border: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.loading) }, null, null);
    const __VLS_106 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({ prop: ("school"), label: ("学校"), minWidth: ("150"), }));
    const __VLS_108 = __VLS_107({ prop: ("school"), label: ("学校"), minWidth: ("150"), }, ...__VLS_functionalComponentArgsRest(__VLS_107));
    const __VLS_112 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({ prop: ("grade"), label: ("年级"), width: ("120"), align: ("center"), }));
    const __VLS_114 = __VLS_113({ prop: ("grade"), label: ("年级"), width: ("120"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_113));
    const __VLS_118 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({ prop: ("className"), label: ("班级"), width: ("120"), align: ("center"), }));
    const __VLS_120 = __VLS_119({ prop: ("className"), label: ("班级"), width: ("120"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_119));
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
    __VLS_nonNullable(__VLS_105.slots).default;
    var __VLS_105;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-4 flex justify-end") }, });
    const __VLS_154 = __VLS_resolvedLocalAndGlobalComponents.ElPagination;
    /** @type { [typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ] } */
    // @ts-ignore
    const __VLS_155 = __VLS_asFunctionalComponent(__VLS_154, new __VLS_154({ ...{ 'onSizeChange': {} }, ...{ 'onCurrentChange': {} }, currentPage: ((__VLS_ctx.page)), pageSize: ((__VLS_ctx.pageSize)), pageSizes: (([10, 20, 50, 100])), layout: ("total, sizes, prev, pager, next, jumper"), total: ((__VLS_ctx.total)), }));
    const __VLS_156 = __VLS_155({ ...{ 'onSizeChange': {} }, ...{ 'onCurrentChange': {} }, currentPage: ((__VLS_ctx.page)), pageSize: ((__VLS_ctx.pageSize)), pageSizes: (([10, 20, 50, 100])), layout: ("total, sizes, prev, pager, next, jumper"), total: ((__VLS_ctx.total)), }, ...__VLS_functionalComponentArgsRest(__VLS_155));
    let __VLS_160;
    const __VLS_161 = {
        onSizeChange: (__VLS_ctx.loadData)
    };
    const __VLS_162 = {
        onCurrentChange: (__VLS_ctx.handleCurrentChange)
    };
    let __VLS_157;
    let __VLS_158;
    var __VLS_159;
    var __VLS_83;
    const __VLS_163 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */
    // @ts-ignore
    const __VLS_164 = __VLS_asFunctionalComponent(__VLS_163, new __VLS_163({ modelValue: ((__VLS_ctx.dialogVisible)), title: ((__VLS_ctx.isEdit ? '编辑班级' : '添加班级')), width: ("450px"), }));
    const __VLS_165 = __VLS_164({ modelValue: ((__VLS_ctx.dialogVisible)), title: ((__VLS_ctx.isEdit ? '编辑班级' : '添加班级')), width: ("450px"), }, ...__VLS_functionalComponentArgsRest(__VLS_164));
    const __VLS_169 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */
    // @ts-ignore
    const __VLS_170 = __VLS_asFunctionalComponent(__VLS_169, new __VLS_169({ model: ((__VLS_ctx.form)), ref: ("formRef"), rules: ((__VLS_ctx.rules)), labelWidth: ("80px"), }));
    const __VLS_171 = __VLS_170({ model: ((__VLS_ctx.form)), ref: ("formRef"), rules: ((__VLS_ctx.rules)), labelWidth: ("80px"), }, ...__VLS_functionalComponentArgsRest(__VLS_170));
    // @ts-ignore navigation for `const formRef = ref()`
    __VLS_ctx.formRef;
    var __VLS_175 = {};
    const __VLS_176 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({ label: ("学校"), prop: ("school"), }));
    const __VLS_178 = __VLS_177({ label: ("学校"), prop: ("school"), }, ...__VLS_functionalComponentArgsRest(__VLS_177));
    const __VLS_182 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_183 = __VLS_asFunctionalComponent(__VLS_182, new __VLS_182({ modelValue: ((__VLS_ctx.form.school)), placeholder: ("请输入学校名称"), }));
    const __VLS_184 = __VLS_183({ modelValue: ((__VLS_ctx.form.school)), placeholder: ("请输入学校名称"), }, ...__VLS_functionalComponentArgsRest(__VLS_183));
    __VLS_nonNullable(__VLS_181.slots).default;
    var __VLS_181;
    const __VLS_188 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({ label: ("年级"), prop: ("grade"), }));
    const __VLS_190 = __VLS_189({ label: ("年级"), prop: ("grade"), }, ...__VLS_functionalComponentArgsRest(__VLS_189));
    const __VLS_194 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_195 = __VLS_asFunctionalComponent(__VLS_194, new __VLS_194({ modelValue: ((__VLS_ctx.form.grade)), placeholder: ("例如: 高一"), }));
    const __VLS_196 = __VLS_195({ modelValue: ((__VLS_ctx.form.grade)), placeholder: ("例如: 高一"), }, ...__VLS_functionalComponentArgsRest(__VLS_195));
    __VLS_nonNullable(__VLS_193.slots).default;
    var __VLS_193;
    const __VLS_200 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({ label: ("班级"), prop: ("className"), }));
    const __VLS_202 = __VLS_201({ label: ("班级"), prop: ("className"), }, ...__VLS_functionalComponentArgsRest(__VLS_201));
    const __VLS_206 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_207 = __VLS_asFunctionalComponent(__VLS_206, new __VLS_206({ modelValue: ((__VLS_ctx.form.className)), placeholder: ("例如: 1班"), }));
    const __VLS_208 = __VLS_207({ modelValue: ((__VLS_ctx.form.className)), placeholder: ("例如: 1班"), }, ...__VLS_functionalComponentArgsRest(__VLS_207));
    __VLS_nonNullable(__VLS_205.slots).default;
    var __VLS_205;
    __VLS_nonNullable(__VLS_174.slots).default;
    var __VLS_174;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_168.slots);
        const __VLS_212 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({ ...{ 'onClick': {} }, }));
        const __VLS_214 = __VLS_213({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_213));
        let __VLS_218;
        const __VLS_219 = {
            onClick: (...[$event]) => {
                __VLS_ctx.dialogVisible = false;
            }
        };
        let __VLS_215;
        let __VLS_216;
        __VLS_nonNullable(__VLS_217.slots).default;
        var __VLS_217;
        const __VLS_220 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_222 = __VLS_221({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_221));
        let __VLS_226;
        const __VLS_227 = {
            onClick: (__VLS_ctx.submitForm)
        };
        let __VLS_223;
        let __VLS_224;
        __VLS_nonNullable(__VLS_225.slots).default;
        var __VLS_225;
    }
    var __VLS_168;
    const __VLS_228 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */
    // @ts-ignore
    const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({ modelValue: ((__VLS_ctx.importVisible)), title: ("导入班级架构"), width: ("550px"), }));
    const __VLS_230 = __VLS_229({ modelValue: ((__VLS_ctx.importVisible)), title: ("导入班级架构"), width: ("550px"), }, ...__VLS_functionalComponentArgsRest(__VLS_229));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("import-container") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-start mb-4") }, });
    const __VLS_234 = __VLS_resolvedLocalAndGlobalComponents.ElTooltip;
    /** @type { [typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ] } */
    // @ts-ignore
    const __VLS_235 = __VLS_asFunctionalComponent(__VLS_234, new __VLS_234({ placement: ("right"), effect: ("light"), }));
    const __VLS_236 = __VLS_235({ placement: ("right"), effect: ("light"), }, ...__VLS_functionalComponentArgsRest(__VLS_235));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { content: __VLS_thisSlot } = __VLS_nonNullable(__VLS_239.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("text-xs leading-6 text-gray-600 p-2") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("instructions-trigger") }, });
    const __VLS_240 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
    /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
    // @ts-ignore
    const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({ ...{ class: ("mr-1") }, }));
    const __VLS_242 = __VLS_241({ ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_241));
    const __VLS_246 = __VLS_resolvedLocalAndGlobalComponents.InfoFilled;
    /** @type { [typeof __VLS_components.InfoFilled, typeof __VLS_components.infoFilled, ] } */
    // @ts-ignore
    const __VLS_247 = __VLS_asFunctionalComponent(__VLS_246, new __VLS_246({}));
    const __VLS_248 = __VLS_247({}, ...__VLS_functionalComponentArgsRest(__VLS_247));
    __VLS_nonNullable(__VLS_245.slots).default;
    var __VLS_245;
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    var __VLS_239;
    const __VLS_252 = __VLS_resolvedLocalAndGlobalComponents.ElUpload;
    /** @type { [typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ] } */
    // @ts-ignore
    const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({ ...{ class: ("upload-demo") }, drag: (true), action: ("#"), multiple: (true), autoUpload: ((false)), onChange: ((__VLS_ctx.handleFileChange)), fileList: ((__VLS_ctx.fileList)), showFileList: ((false)), accept: (".xlsx, .xls"), }));
    const __VLS_254 = __VLS_253({ ...{ class: ("upload-demo") }, drag: (true), action: ("#"), multiple: (true), autoUpload: ((false)), onChange: ((__VLS_ctx.handleFileChange)), fileList: ((__VLS_ctx.fileList)), showFileList: ((false)), accept: (".xlsx, .xls"), }, ...__VLS_functionalComponentArgsRest(__VLS_253));
    if (__VLS_ctx.fileList.length === 0) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("upload-empty-content") }, });
        const __VLS_258 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_259 = __VLS_asFunctionalComponent(__VLS_258, new __VLS_258({ ...{ class: ("el-icon--upload") }, }));
        const __VLS_260 = __VLS_259({ ...{ class: ("el-icon--upload") }, }, ...__VLS_functionalComponentArgsRest(__VLS_259));
        const __VLS_264 = __VLS_resolvedLocalAndGlobalComponents.UploadFilled;
        /** @type { [typeof __VLS_components.UploadFilled, typeof __VLS_components.uploadFilled, ] } */
        // @ts-ignore
        const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({}));
        const __VLS_266 = __VLS_265({}, ...__VLS_functionalComponentArgsRest(__VLS_265));
        __VLS_nonNullable(__VLS_263.slots).default;
        var __VLS_263;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("el-upload__text") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.em, __VLS_intrinsicElements.em)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("el-upload__tip mt-2") }, });
    }
    else {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("p-4") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-between items-center mb-2") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-sm font-bold") }, });
        (__VLS_ctx.fileList.length);
        const __VLS_270 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_271 = __VLS_asFunctionalComponent(__VLS_270, new __VLS_270({ ...{ 'onClick': {} }, link: (true), type: ("danger"), }));
        const __VLS_272 = __VLS_271({ ...{ 'onClick': {} }, link: (true), type: ("danger"), }, ...__VLS_functionalComponentArgsRest(__VLS_271));
        let __VLS_276;
        const __VLS_277 = {
            onClick: (...[$event]) => {
                if (!(!((__VLS_ctx.fileList.length === 0))))
                    return;
                __VLS_ctx.fileList = [];
            }
        };
        let __VLS_273;
        let __VLS_274;
        __VLS_nonNullable(__VLS_275.slots).default;
        var __VLS_275;
        const __VLS_278 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
        /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
        // @ts-ignore
        const __VLS_279 = __VLS_asFunctionalComponent(__VLS_278, new __VLS_278({ data: ((__VLS_ctx.fileList)), size: ("small"), border: (true), }));
        const __VLS_280 = __VLS_279({ data: ((__VLS_ctx.fileList)), size: ("small"), border: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_279));
        const __VLS_284 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_285 = __VLS_asFunctionalComponent(__VLS_284, new __VLS_284({ prop: ("name"), label: ("文件名"), }));
        const __VLS_286 = __VLS_285({ prop: ("name"), label: ("文件名"), }, ...__VLS_functionalComponentArgsRest(__VLS_285));
        __VLS_nonNullable(__VLS_283.slots).default;
        var __VLS_283;
    }
    __VLS_nonNullable(__VLS_257.slots).default;
    var __VLS_257;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-8 flex flex-col gap-3") }, });
    const __VLS_290 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_291 = __VLS_asFunctionalComponent(__VLS_290, new __VLS_290({ ...{ 'onClick': {} }, type: ("primary"), size: ("large"), ...{ class: ("w-full start-import-btn") }, loading: ((__VLS_ctx.importLoading)), disabled: ((__VLS_ctx.fileList.length === 0)), }));
    const __VLS_292 = __VLS_291({ ...{ 'onClick': {} }, type: ("primary"), size: ("large"), ...{ class: ("w-full start-import-btn") }, loading: ((__VLS_ctx.importLoading)), disabled: ((__VLS_ctx.fileList.length === 0)), }, ...__VLS_functionalComponentArgsRest(__VLS_291));
    let __VLS_296;
    const __VLS_297 = {
        onClick: (__VLS_ctx.submitImport)
    };
    let __VLS_293;
    let __VLS_294;
    __VLS_nonNullable(__VLS_295.slots).default;
    var __VLS_295;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-center mt-1") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({ href: ("file:///c:/Users/admin/Desktop/wechat_mini_program-master/JavaSB_back/src/main/assests/班级导入模板.zip"), download: ("班级导入模板.zip"), });
    const __VLS_298 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_299 = __VLS_asFunctionalComponent(__VLS_298, new __VLS_298({ link: (true), type: ("primary"), ...{ class: ("download-link") }, }));
    const __VLS_300 = __VLS_299({ link: (true), type: ("primary"), ...{ class: ("download-link") }, }, ...__VLS_functionalComponentArgsRest(__VLS_299));
    const __VLS_304 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
    /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
    // @ts-ignore
    const __VLS_305 = __VLS_asFunctionalComponent(__VLS_304, new __VLS_304({ ...{ class: ("mr-1") }, }));
    const __VLS_306 = __VLS_305({ ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_305));
    const __VLS_310 = __VLS_resolvedLocalAndGlobalComponents.document;
    /** @type { [typeof __VLS_components.Document, typeof __VLS_components.document, ] } */
    // @ts-ignore
    const __VLS_311 = __VLS_asFunctionalComponent(__VLS_310, new __VLS_310({}));
    const __VLS_312 = __VLS_311({}, ...__VLS_functionalComponentArgsRest(__VLS_311));
    __VLS_nonNullable(__VLS_309.slots).default;
    var __VLS_309;
    __VLS_nonNullable(__VLS_303.slots).default;
    var __VLS_303;
    __VLS_nonNullable(__VLS_233.slots).default;
    var __VLS_233;
    __VLS_styleScopedClasses['page-container'];
    __VLS_styleScopedClasses['mb-4'];
    __VLS_styleScopedClasses['text-large'];
    __VLS_styleScopedClasses['font-600'];
    __VLS_styleScopedClasses['mr-3'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['mr-2'];
    __VLS_styleScopedClasses['search-card'];
    __VLS_styleScopedClasses['mb-4'];
    __VLS_styleScopedClasses['search-form-inline'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['header-actions'];
    __VLS_styleScopedClasses['mt-4'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-end'];
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
    __VLS_styleScopedClasses['p-4'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['mb-2'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['font-bold'];
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
        "formRef": __VLS_175,
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
            InfoFilled: InfoFilled,
            UploadFilled: UploadFilled,
            Document: Document,
            projectName: projectName,
            loading: loading,
            tableData: tableData,
            total: total,
            page: page,
            pageSize: pageSize,
            searchForm: searchForm,
            dialogVisible: dialogVisible,
            isEdit: isEdit,
            formRef: formRef,
            form: form,
            rules: rules,
            importVisible: importVisible,
            importLoading: importLoading,
            fileList: fileList,
            handleOpenImport: handleOpenImport,
            handleFileChange: handleFileChange,
            submitImport: submitImport,
            loadData: loadData,
            goBack: goBack,
            handleSearch: handleSearch,
            resetSearch: resetSearch,
            handleAddClass: handleAddClass,
            handleEdit: handleEdit,
            handleDelete: handleDelete,
            handleEnter: handleEnter,
            handleCurrentChange: handleCurrentChange,
            submitForm: submitForm,
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