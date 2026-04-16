/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getClassList, addClass, updateClass, deleteClass, batchDeleteClasses, batchAddClasses, fetchImportClass, fetchDownloadClassTemplate } from '@/api/core-business/sys-class';
import { UploadFilled, Delete, Upload, Document, InfoFilled } from '@element-plus/icons-vue';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const route = useRoute();
const router = useRouter();
const searchForm = reactive({
    classid: '',
    grade: '',
    schoolId: route.query.schoolId || ''
});
const currentSchoolName = ref(route.query.schoolName || '');
const tableData = ref([]);
const loading = ref(false);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const dialogVisible = ref(false);
const dialogType = ref('add');
const submitLoading = ref(false);
const formRef = ref();
const batchAddVisible = ref(false);
const batchAddFormRef = ref();
const batchAddForm = reactive({
    schoolId: route.query.schoolId || '',
    grade: '',
    format: '$班',
    classStart: 1,
    classEnd: 10
});
const batchAddRules = reactive({
    grade: [{ required: true, message: '请选择年级', trigger: 'change' }],
    format: [{ required: true, message: '请输入班级格式', trigger: 'blur' }]
});
const importVisible = ref(false);
const importLoading = ref(false);
const fileList = ref([]);
const uploadRef = ref();
const gradeOptions = [
    '一年级', '二年级', '三年级', '四年级', '五年级', '六年级',
    '初一', '初二', '初三',
    '高一', '高二', '高三'
];
const formData = reactive({
    id: undefined,
    classid: '',
    schoolId: route.query.schoolId || '',
    grade: '',
    alias: ''
});
const rules = reactive({
    schoolId: [{ required: true, message: '请输入关联学校唯一标识(school_id)', trigger: 'blur' }],
    grade: [{ required: true, message: '请输入年级', trigger: 'blur' }]
});
const fetchList = async () => {
    loading.value = true;
    try {
        const res = await getClassList({
            page: page.value,
            size: pageSize.value,
            classid: searchForm.classid || undefined,
            grade: searchForm.grade || undefined,
            schoolId: searchForm.schoolId || undefined
        });
        if (res) {
            const records = res.records || [];
            tableData.value = records.map((item) => {
                if (item.createTime) {
                    const d = new Date(item.createTime);
                    item.createTime = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
                }
                return item;
            });
            total.value = res.total || 0;
        }
    }
    catch (error) {
        ElMessage.error(error.message || '获取列表失败');
    }
    finally {
        loading.value = false;
    }
};
const handleSearch = () => {
    page.value = 1;
    fetchList();
};
const resetSearch = () => {
    searchForm.classid = '';
    searchForm.grade = '';
    handleSearch();
};
const handleSizeChange = (val) => {
    pageSize.value = val;
    fetchList();
};
const handleCurrentChange = (val) => {
    page.value = val;
    fetchList();
};
const handleAddClass = () => {
    const currentSchoolId = route.query.schoolId;
    if (!currentSchoolId) {
        ElMessage.warning('请先从学校管理进入指定学校的班级列表，再添加班级！');
        return;
    }
    dialogType.value = 'add';
    formData.id = undefined;
    formData.classid = '';
    formData.schoolId = currentSchoolId;
    formData.grade = '';
    formData.alias = '';
    dialogVisible.value = true;
};
const handleEditClass = (row) => {
    dialogType.value = 'edit';
    formData.id = row.id;
    formData.classid = row.classid;
    formData.schoolId = row.schoolId || '';
    formData.grade = row.grade;
    formData.alias = row.alias;
    dialogVisible.value = true;
};
const handleEnterClass = (row) => {
    const schoolId = row.schoolId || searchForm.schoolId;
    const classId = row.classid;
    if (classId) {
        router.push({
            path: '/core-business/student',
            query: {
                schoolId,
                classId,
                schoolName: currentSchoolName.value,
                className: `${row.grade}${row.alias}`
            }
        });
    }
    else {
        ElMessage.warning('无法获取班级ID');
    }
};
const handleDeleteClass = (row) => {
    ElMessageBox.confirm('确认删除该班级吗？', '提示', {
        type: 'warning'
    }).then(async () => {
        try {
            await deleteClass(row.id);
            ElMessage.success('删除成功');
            fetchList();
        }
        catch (error) {
            ElMessage.error(error.message || '删除失败');
        }
    });
};
const handleSubmit = async () => {
    if (!formRef.value)
        return;
    await formRef.value.validate(async (valid) => {
        if (valid) {
            submitLoading.value = true;
            try {
                if (dialogType.value === 'add') {
                    await addClass(formData);
                    ElMessage.success('添加成功');
                }
                else {
                    await updateClass(formData.id, formData);
                    ElMessage.success('更新成功');
                }
                dialogVisible.value = false;
                fetchList();
            }
            catch (error) {
                ElMessage.error(error.message || '操作失败');
            }
            finally {
                submitLoading.value = false;
            }
        }
    });
};
const resetForm = () => {
    if (formRef.value) {
        formRef.value.resetFields();
    }
    formData.id = undefined;
    formData.classid = '';
    formData.grade = '';
    formData.alias = '';
};
const handleBatchAdd = () => {
    if (!route.query.schoolId) {
        ElMessage.warning('请先从学校管理进入指定学校的班级列表，再批量添加班级！');
        return;
    }
    batchAddVisible.value = true;
};
const resetBatchAddForm = () => {
    if (batchAddFormRef.value) {
        batchAddFormRef.value.resetFields();
    }
    batchAddForm.schoolId = route.query.schoolId || '';
    batchAddForm.grade = '';
    batchAddForm.format = '$班';
    batchAddForm.classStart = 1;
    batchAddForm.classEnd = 10;
};
const handleBatchAddSubmit = async () => {
    if (!batchAddFormRef.value)
        return;
    await batchAddFormRef.value.validate(async (valid) => {
        if (valid) {
            if (!batchAddForm.schoolId) {
                ElMessage.error('缺失关联学校ID，请从学校管理进入当前页面');
                return;
            }
            if (batchAddForm.classEnd < batchAddForm.classStart) {
                ElMessage.error('班级范围无效');
                return;
            }
            if (!batchAddForm.format.includes('$')) {
                ElMessage.error('班级格式必须包含 $ 符号');
                return;
            }
            submitLoading.value = true;
            try {
                await batchAddClasses(batchAddForm);
                ElMessage.success('批量添加成功');
                batchAddVisible.value = false;
                fetchList();
            }
            catch (error) {
                ElMessage.error(error.message || '批量添加失败');
            }
            finally {
                submitLoading.value = false;
            }
        }
    });
};
// 批量导入
const handleBatchImport = () => {
    importVisible.value = true;
    fileList.value = [];
};
const downloadTemplate = () => {
    fetchDownloadClassTemplate();
};
const handleFileChange = (file, files) => {
    if (file.status === 'ready') {
        fileList.value = files.map((f) => {
            if (!f.status)
                f.status = 'ready';
            return f;
        });
    }
};
const handleRemove = (file, files) => {
    fileList.value = files;
};
const submitImport = async () => {
    if (fileList.value.length === 0) {
        ElMessage.warning('请先选择要导入的文件');
        return;
    }
    const pendingFiles = fileList.value.filter(f => f.status === 'ready' || f.status === 'fail');
    if (pendingFiles.length === 0) {
        ElMessage.success('所有文件均已导入成功');
        return;
    }
    importLoading.value = true;
    for (const file of pendingFiles) {
        file.status = 'uploading';
        try {
            await fetchImportClass(file.raw, searchForm.schoolId || undefined);
            file.status = 'success';
        }
        catch (error) {
            file.status = 'fail';
            file.errorMsg = error.message || '解析或导入失败';
            ElMessage.error(`文件 ${file.name} 导入失败: ${file.errorMsg}`);
        }
    }
    importLoading.value = false;
    const allSuccess = fileList.value.every(f => f.status === 'success');
    if (allSuccess) {
        ElMessage.success('所有文件导入成功');
        setTimeout(() => {
            importVisible.value = false;
            fetchList();
        }, 1000);
    }
    else {
        fetchList();
    }
};
const selectedIds = ref([]);
const isBatchDeleting = ref(false);
const handleSelectionChange = (selection) => {
    selectedIds.value = selection.map(item => item.id);
};
const handleBatchDelete = () => {
    if (selectedIds.value.length === 0) {
        // 没选择时点击，表示取消删除，退出批量删除模式
        isBatchDeleting.value = false;
        selectedIds.value = [];
        return;
    }
    ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个班级吗？`, '批量删除警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        try {
            const res = await batchDeleteClasses(selectedIds.value);
            console.log('班级批量删除返回数据:', res);
            let msg = '';
            if (typeof res === 'string') {
                msg = res;
            }
            else {
                msg = res?.msg || res?.data?.msg;
            }
            console.log('后端返回的详细 msg:', msg);
            if (msg && msg.includes('未能删除')) {
                ElMessage.warning(msg);
            }
            else {
                ElMessage.success(msg || '批量删除成功');
            }
            selectedIds.value = [];
            isBatchDeleting.value = false;
            fetchList();
        }
        catch (error) {
            console.error('班级批量删除异常:', error);
            ElMessage.error(error.message || '批量删除失败');
        }
    }).catch(() => { });
};
onMounted(() => {
    fetchList();
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
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ shadow: ("never"), ...{ class: ("search-card mb-4") }, }));
    const __VLS_2 = __VLS_1({ shadow: ("never"), ...{ class: ("search-card mb-4") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ inline: ((true)), model: ((__VLS_ctx.searchForm)), ...{ class: ("search-form-inline") }, }));
    const __VLS_8 = __VLS_7({ inline: ((true)), model: ((__VLS_ctx.searchForm)), ...{ class: ("search-form-inline") }, }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ label: ("班级ID"), }));
    const __VLS_14 = __VLS_13({ label: ("班级ID"), }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    const __VLS_18 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.searchForm.classid)), placeholder: ("请输入班级ID"), clearable: (true), ...{ style: ({}) }, }));
    const __VLS_20 = __VLS_19({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.searchForm.classid)), placeholder: ("请输入班级ID"), clearable: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    let __VLS_24;
    const __VLS_25 = {
        onKeyup: (__VLS_ctx.handleSearch)
    };
    let __VLS_21;
    let __VLS_22;
    var __VLS_23;
    __VLS_nonNullable(__VLS_17.slots).default;
    var __VLS_17;
    const __VLS_26 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({ label: ("年级"), }));
    const __VLS_28 = __VLS_27({ label: ("年级"), }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    const __VLS_32 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.searchForm.grade)), placeholder: ("请输入年级"), clearable: (true), ...{ style: ({}) }, }));
    const __VLS_34 = __VLS_33({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.searchForm.grade)), placeholder: ("请输入年级"), clearable: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_38;
    const __VLS_39 = {
        onKeyup: (__VLS_ctx.handleSearch)
    };
    let __VLS_35;
    let __VLS_36;
    var __VLS_37;
    __VLS_nonNullable(__VLS_31.slots).default;
    var __VLS_31;
    const __VLS_40 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({}));
    const __VLS_42 = __VLS_41({}, ...__VLS_functionalComponentArgsRest(__VLS_41));
    const __VLS_46 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({ ...{ 'onClick': {} }, type: ("primary"), }));
    const __VLS_48 = __VLS_47({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_47));
    let __VLS_52;
    const __VLS_53 = {
        onClick: (__VLS_ctx.handleSearch)
    };
    let __VLS_49;
    let __VLS_50;
    __VLS_nonNullable(__VLS_51.slots).default;
    var __VLS_51;
    const __VLS_54 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({ ...{ 'onClick': {} }, }));
    const __VLS_56 = __VLS_55({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_55));
    let __VLS_60;
    const __VLS_61 = {
        onClick: (__VLS_ctx.resetSearch)
    };
    let __VLS_57;
    let __VLS_58;
    __VLS_nonNullable(__VLS_59.slots).default;
    var __VLS_59;
    __VLS_nonNullable(__VLS_45.slots).default;
    var __VLS_45;
    __VLS_nonNullable(__VLS_11.slots).default;
    var __VLS_11;
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    const __VLS_62 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({ shadow: ("never"), ...{ class: ("main-card") }, }));
    const __VLS_64 = __VLS_63({ shadow: ("never"), ...{ class: ("main-card") }, }, ...__VLS_functionalComponentArgsRest(__VLS_63));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { header: __VLS_thisSlot } = __VLS_nonNullable(__VLS_67.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-between items-center") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex items-center") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("font-bold mr-4") }, });
        if (__VLS_ctx.currentSchoolName) {
            const __VLS_68 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
            /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
            // @ts-ignore
            const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({ type: ("warning"), effect: ("plain"), ...{ class: ("ml-2") }, }));
            const __VLS_70 = __VLS_69({ type: ("warning"), effect: ("plain"), ...{ class: ("ml-2") }, }, ...__VLS_functionalComponentArgsRest(__VLS_69));
            (__VLS_ctx.currentSchoolName);
            __VLS_nonNullable(__VLS_73.slots).default;
            var __VLS_73;
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        if (!__VLS_ctx.isBatchDeleting) {
            const __VLS_74 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({ ...{ 'onClick': {} }, type: ("danger"), }));
            const __VLS_76 = __VLS_75({ ...{ 'onClick': {} }, type: ("danger"), }, ...__VLS_functionalComponentArgsRest(__VLS_75));
            let __VLS_80;
            const __VLS_81 = {
                onClick: (...[$event]) => {
                    if (!((!__VLS_ctx.isBatchDeleting)))
                        return;
                    __VLS_ctx.isBatchDeleting = true;
                }
            };
            let __VLS_77;
            let __VLS_78;
            __VLS_nonNullable(__VLS_79.slots).default;
            var __VLS_79;
        }
        else {
            const __VLS_82 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({ ...{ 'onClick': {} }, type: ((__VLS_ctx.selectedIds.length > 0 ? 'danger' : 'default')), }));
            const __VLS_84 = __VLS_83({ ...{ 'onClick': {} }, type: ((__VLS_ctx.selectedIds.length > 0 ? 'danger' : 'default')), }, ...__VLS_functionalComponentArgsRest(__VLS_83));
            let __VLS_88;
            const __VLS_89 = {
                onClick: (__VLS_ctx.handleBatchDelete)
            };
            let __VLS_85;
            let __VLS_86;
            (__VLS_ctx.selectedIds.length > 0 ? '开始删除' : '取消删除');
            __VLS_nonNullable(__VLS_87.slots).default;
            var __VLS_87;
        }
        const __VLS_90 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({ ...{ 'onClick': {} }, }));
        const __VLS_92 = __VLS_91({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_91));
        let __VLS_96;
        const __VLS_97 = {
            onClick: (__VLS_ctx.handleBatchImport)
        };
        let __VLS_93;
        let __VLS_94;
        __VLS_nonNullable(__VLS_95.slots).default;
        var __VLS_95;
        const __VLS_98 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({ ...{ 'onClick': {} }, }));
        const __VLS_100 = __VLS_99({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_99));
        let __VLS_104;
        const __VLS_105 = {
            onClick: (__VLS_ctx.handleBatchAdd)
        };
        let __VLS_101;
        let __VLS_102;
        __VLS_nonNullable(__VLS_103.slots).default;
        var __VLS_103;
        const __VLS_106 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_108 = __VLS_107({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_107));
        let __VLS_112;
        const __VLS_113 = {
            onClick: (__VLS_ctx.handleAddClass)
        };
        let __VLS_109;
        let __VLS_110;
        __VLS_nonNullable(__VLS_111.slots).default;
        var __VLS_111;
    }
    const __VLS_114 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
    // @ts-ignore
    const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({ ...{ 'onSelectionChange': {} }, data: ((__VLS_ctx.tableData)), border: (true), ...{ style: ({}) }, height: ("380"), }));
    const __VLS_116 = __VLS_115({ ...{ 'onSelectionChange': {} }, data: ((__VLS_ctx.tableData)), border: (true), ...{ style: ({}) }, height: ("380"), }, ...__VLS_functionalComponentArgsRest(__VLS_115));
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.loading) }, null, null);
    let __VLS_120;
    const __VLS_121 = {
        onSelectionChange: (__VLS_ctx.handleSelectionChange)
    };
    let __VLS_117;
    let __VLS_118;
    if (__VLS_ctx.isBatchDeleting) {
        const __VLS_122 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_123 = __VLS_asFunctionalComponent(__VLS_122, new __VLS_122({ type: ("selection"), width: ("55"), align: ("center"), }));
        const __VLS_124 = __VLS_123({ type: ("selection"), width: ("55"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_123));
    }
    const __VLS_128 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({ prop: ("id"), label: ("内部ID"), width: ("80"), align: ("center"), }));
    const __VLS_130 = __VLS_129({ prop: ("id"), label: ("内部ID"), width: ("80"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_129));
    const __VLS_134 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_135 = __VLS_asFunctionalComponent(__VLS_134, new __VLS_134({ prop: ("classid"), label: ("班级唯一标识"), width: ("220"), align: ("center"), }));
    const __VLS_136 = __VLS_135({ prop: ("classid"), label: ("班级唯一标识"), width: ("220"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_135));
    const __VLS_140 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({ prop: ("schoolId"), label: ("关联学校(schoolId)"), width: ("200"), align: ("center"), }));
    const __VLS_142 = __VLS_141({ prop: ("schoolId"), label: ("关联学校(schoolId)"), width: ("200"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_141));
    const __VLS_146 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({ prop: ("grade"), label: ("年级"), width: ("100"), align: ("center"), }));
    const __VLS_148 = __VLS_147({ prop: ("grade"), label: ("年级"), width: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_147));
    const __VLS_152 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({ prop: ("alias"), label: ("班级"), minWidth: ("150"), align: ("center"), }));
    const __VLS_154 = __VLS_153({ prop: ("alias"), label: ("班级"), minWidth: ("150"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_153));
    const __VLS_158 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158({ prop: ("createTime"), label: ("创建时间"), width: ("180"), align: ("center"), }));
    const __VLS_160 = __VLS_159({ prop: ("createTime"), label: ("创建时间"), width: ("180"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_159));
    const __VLS_164 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({ label: ("操作"), width: ("200"), align: ("center"), fixed: ("right"), }));
    const __VLS_166 = __VLS_165({ label: ("操作"), width: ("200"), align: ("center"), fixed: ("right"), }, ...__VLS_functionalComponentArgsRest(__VLS_165));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_169.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_170 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_171 = __VLS_asFunctionalComponent(__VLS_170, new __VLS_170({ ...{ 'onClick': {} }, type: ("primary"), link: (true), size: ("small"), }));
        const __VLS_172 = __VLS_171({ ...{ 'onClick': {} }, type: ("primary"), link: (true), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_171));
        let __VLS_176;
        const __VLS_177 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleEnterClass(row);
            }
        };
        let __VLS_173;
        let __VLS_174;
        __VLS_nonNullable(__VLS_175.slots).default;
        var __VLS_175;
        const __VLS_178 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_179 = __VLS_asFunctionalComponent(__VLS_178, new __VLS_178({ ...{ 'onClick': {} }, type: ("primary"), link: (true), size: ("small"), }));
        const __VLS_180 = __VLS_179({ ...{ 'onClick': {} }, type: ("primary"), link: (true), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_179));
        let __VLS_184;
        const __VLS_185 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleEditClass(row);
            }
        };
        let __VLS_181;
        let __VLS_182;
        __VLS_nonNullable(__VLS_183.slots).default;
        var __VLS_183;
        const __VLS_186 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_187 = __VLS_asFunctionalComponent(__VLS_186, new __VLS_186({ ...{ 'onClick': {} }, type: ("danger"), link: (true), size: ("small"), }));
        const __VLS_188 = __VLS_187({ ...{ 'onClick': {} }, type: ("danger"), link: (true), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_187));
        let __VLS_192;
        const __VLS_193 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleDeleteClass(row);
            }
        };
        let __VLS_189;
        let __VLS_190;
        __VLS_nonNullable(__VLS_191.slots).default;
        var __VLS_191;
    }
    var __VLS_169;
    __VLS_nonNullable(__VLS_119.slots).default;
    var __VLS_119;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("pagination-container mt-auto flex justify-end pt-4") }, });
    const __VLS_194 = __VLS_resolvedLocalAndGlobalComponents.ElPagination;
    /** @type { [typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ] } */
    // @ts-ignore
    const __VLS_195 = __VLS_asFunctionalComponent(__VLS_194, new __VLS_194({ ...{ 'onSizeChange': {} }, ...{ 'onCurrentChange': {} }, currentPage: ((__VLS_ctx.page)), pageSize: ((__VLS_ctx.pageSize)), pageSizes: (([10, 20, 50, 100])), layout: ("total, sizes, prev, pager, next, jumper"), total: ((__VLS_ctx.total)), }));
    const __VLS_196 = __VLS_195({ ...{ 'onSizeChange': {} }, ...{ 'onCurrentChange': {} }, currentPage: ((__VLS_ctx.page)), pageSize: ((__VLS_ctx.pageSize)), pageSizes: (([10, 20, 50, 100])), layout: ("total, sizes, prev, pager, next, jumper"), total: ((__VLS_ctx.total)), }, ...__VLS_functionalComponentArgsRest(__VLS_195));
    let __VLS_200;
    const __VLS_201 = {
        onSizeChange: (__VLS_ctx.handleSizeChange)
    };
    const __VLS_202 = {
        onCurrentChange: (__VLS_ctx.handleCurrentChange)
    };
    let __VLS_197;
    let __VLS_198;
    var __VLS_199;
    var __VLS_67;
    const __VLS_203 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */
    // @ts-ignore
    const __VLS_204 = __VLS_asFunctionalComponent(__VLS_203, new __VLS_203({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.dialogVisible)), title: ((__VLS_ctx.dialogType === 'add' ? '添加班级' : '编辑班级')), width: ("500px"), }));
    const __VLS_205 = __VLS_204({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.dialogVisible)), title: ((__VLS_ctx.dialogType === 'add' ? '添加班级' : '编辑班级')), width: ("500px"), }, ...__VLS_functionalComponentArgsRest(__VLS_204));
    let __VLS_209;
    const __VLS_210 = {
        onClose: (__VLS_ctx.resetForm)
    };
    let __VLS_206;
    let __VLS_207;
    const __VLS_211 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */
    // @ts-ignore
    const __VLS_212 = __VLS_asFunctionalComponent(__VLS_211, new __VLS_211({ ref: ("formRef"), model: ((__VLS_ctx.formData)), rules: ((__VLS_ctx.rules)), labelWidth: ("120px"), }));
    const __VLS_213 = __VLS_212({ ref: ("formRef"), model: ((__VLS_ctx.formData)), rules: ((__VLS_ctx.rules)), labelWidth: ("120px"), }, ...__VLS_functionalComponentArgsRest(__VLS_212));
    // @ts-ignore navigation for `const formRef = ref()`
    __VLS_ctx.formRef;
    var __VLS_217 = {};
    const __VLS_218 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_219 = __VLS_asFunctionalComponent(__VLS_218, new __VLS_218({ label: ("年级"), prop: ("grade"), }));
    const __VLS_220 = __VLS_219({ label: ("年级"), prop: ("grade"), }, ...__VLS_functionalComponentArgsRest(__VLS_219));
    const __VLS_224 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
    /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */
    // @ts-ignore
    const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({ modelValue: ((__VLS_ctx.formData.grade)), placeholder: ("请选择年级"), ...{ class: ("w-full") }, }));
    const __VLS_226 = __VLS_225({ modelValue: ((__VLS_ctx.formData.grade)), placeholder: ("请选择年级"), ...{ class: ("w-full") }, }, ...__VLS_functionalComponentArgsRest(__VLS_225));
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.gradeOptions))) {
        const __VLS_230 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
        /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
        // @ts-ignore
        const __VLS_231 = __VLS_asFunctionalComponent(__VLS_230, new __VLS_230({ key: ((item)), label: ((item)), value: ((item)), }));
        const __VLS_232 = __VLS_231({ key: ((item)), label: ((item)), value: ((item)), }, ...__VLS_functionalComponentArgsRest(__VLS_231));
    }
    __VLS_nonNullable(__VLS_229.slots).default;
    var __VLS_229;
    __VLS_nonNullable(__VLS_223.slots).default;
    var __VLS_223;
    const __VLS_236 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({ label: ("班级"), prop: ("alias"), }));
    const __VLS_238 = __VLS_237({ label: ("班级"), prop: ("alias"), }, ...__VLS_functionalComponentArgsRest(__VLS_237));
    const __VLS_242 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_243 = __VLS_asFunctionalComponent(__VLS_242, new __VLS_242({ modelValue: ((__VLS_ctx.formData.alias)), placeholder: ("请输入班级名称 (如: 1班, 理科班)"), }));
    const __VLS_244 = __VLS_243({ modelValue: ((__VLS_ctx.formData.alias)), placeholder: ("请输入班级名称 (如: 1班, 理科班)"), }, ...__VLS_functionalComponentArgsRest(__VLS_243));
    __VLS_nonNullable(__VLS_241.slots).default;
    var __VLS_241;
    __VLS_nonNullable(__VLS_216.slots).default;
    var __VLS_216;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_208.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("dialog-footer") }, });
        const __VLS_248 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({ ...{ 'onClick': {} }, }));
        const __VLS_250 = __VLS_249({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_249));
        let __VLS_254;
        const __VLS_255 = {
            onClick: (...[$event]) => {
                __VLS_ctx.dialogVisible = false;
            }
        };
        let __VLS_251;
        let __VLS_252;
        __VLS_nonNullable(__VLS_253.slots).default;
        var __VLS_253;
        const __VLS_256 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.submitLoading)), }));
        const __VLS_258 = __VLS_257({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.submitLoading)), }, ...__VLS_functionalComponentArgsRest(__VLS_257));
        let __VLS_262;
        const __VLS_263 = {
            onClick: (__VLS_ctx.handleSubmit)
        };
        let __VLS_259;
        let __VLS_260;
        __VLS_nonNullable(__VLS_261.slots).default;
        var __VLS_261;
    }
    var __VLS_208;
    const __VLS_264 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */
    // @ts-ignore
    const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.batchAddVisible)), title: ("批量添加班级"), width: ("500px"), }));
    const __VLS_266 = __VLS_265({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.batchAddVisible)), title: ("批量添加班级"), width: ("500px"), }, ...__VLS_functionalComponentArgsRest(__VLS_265));
    let __VLS_270;
    const __VLS_271 = {
        onClose: (__VLS_ctx.resetBatchAddForm)
    };
    let __VLS_267;
    let __VLS_268;
    const __VLS_272 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */
    // @ts-ignore
    const __VLS_273 = __VLS_asFunctionalComponent(__VLS_272, new __VLS_272({ ref: ("batchAddFormRef"), model: ((__VLS_ctx.batchAddForm)), rules: ((__VLS_ctx.batchAddRules)), labelWidth: ("100px"), }));
    const __VLS_274 = __VLS_273({ ref: ("batchAddFormRef"), model: ((__VLS_ctx.batchAddForm)), rules: ((__VLS_ctx.batchAddRules)), labelWidth: ("100px"), }, ...__VLS_functionalComponentArgsRest(__VLS_273));
    // @ts-ignore navigation for `const batchAddFormRef = ref()`
    __VLS_ctx.batchAddFormRef;
    var __VLS_278 = {};
    const __VLS_279 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_280 = __VLS_asFunctionalComponent(__VLS_279, new __VLS_279({ label: ("年级"), prop: ("grade"), }));
    const __VLS_281 = __VLS_280({ label: ("年级"), prop: ("grade"), }, ...__VLS_functionalComponentArgsRest(__VLS_280));
    const __VLS_285 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
    /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */
    // @ts-ignore
    const __VLS_286 = __VLS_asFunctionalComponent(__VLS_285, new __VLS_285({ modelValue: ((__VLS_ctx.batchAddForm.grade)), placeholder: ("请选择年级"), ...{ class: ("w-full") }, }));
    const __VLS_287 = __VLS_286({ modelValue: ((__VLS_ctx.batchAddForm.grade)), placeholder: ("请选择年级"), ...{ class: ("w-full") }, }, ...__VLS_functionalComponentArgsRest(__VLS_286));
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.gradeOptions))) {
        const __VLS_291 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
        /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
        // @ts-ignore
        const __VLS_292 = __VLS_asFunctionalComponent(__VLS_291, new __VLS_291({ key: ((item)), label: ((item)), value: ((item)), }));
        const __VLS_293 = __VLS_292({ key: ((item)), label: ((item)), value: ((item)), }, ...__VLS_functionalComponentArgsRest(__VLS_292));
    }
    __VLS_nonNullable(__VLS_290.slots).default;
    var __VLS_290;
    __VLS_nonNullable(__VLS_284.slots).default;
    var __VLS_284;
    const __VLS_297 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_298 = __VLS_asFunctionalComponent(__VLS_297, new __VLS_297({ label: ("班级格式"), prop: ("format"), }));
    const __VLS_299 = __VLS_298({ label: ("班级格式"), prop: ("format"), }, ...__VLS_functionalComponentArgsRest(__VLS_298));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { label: __VLS_thisSlot } = __VLS_nonNullable(__VLS_302.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex items-center") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        const __VLS_303 = __VLS_resolvedLocalAndGlobalComponents.ElTooltip;
        /** @type { [typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ] } */
        // @ts-ignore
        const __VLS_304 = __VLS_asFunctionalComponent(__VLS_303, new __VLS_303({ content: ("使用 $ 代表班级序号。例如输入 '$班'，配合范围 1-10，将生成 '1班' 到 '10班'"), placement: ("top"), }));
        const __VLS_305 = __VLS_304({ content: ("使用 $ 代表班级序号。例如输入 '$班'，配合范围 1-10，将生成 '1班' 到 '10班'"), placement: ("top"), }, ...__VLS_functionalComponentArgsRest(__VLS_304));
        const __VLS_309 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_310 = __VLS_asFunctionalComponent(__VLS_309, new __VLS_309({ ...{ class: ("ml-1 cursor-pointer text-gray-400") }, }));
        const __VLS_311 = __VLS_310({ ...{ class: ("ml-1 cursor-pointer text-gray-400") }, }, ...__VLS_functionalComponentArgsRest(__VLS_310));
        const __VLS_315 = __VLS_resolvedLocalAndGlobalComponents.InfoFilled;
        /** @type { [typeof __VLS_components.InfoFilled, typeof __VLS_components.infoFilled, ] } */
        // @ts-ignore
        const __VLS_316 = __VLS_asFunctionalComponent(__VLS_315, new __VLS_315({}));
        const __VLS_317 = __VLS_316({}, ...__VLS_functionalComponentArgsRest(__VLS_316));
        __VLS_nonNullable(__VLS_314.slots).default;
        var __VLS_314;
        __VLS_nonNullable(__VLS_308.slots).default;
        var __VLS_308;
    }
    const __VLS_321 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_322 = __VLS_asFunctionalComponent(__VLS_321, new __VLS_321({ modelValue: ((__VLS_ctx.batchAddForm.format)), placeholder: ("例如: $班"), }));
    const __VLS_323 = __VLS_322({ modelValue: ((__VLS_ctx.batchAddForm.format)), placeholder: ("例如: $班"), }, ...__VLS_functionalComponentArgsRest(__VLS_322));
    var __VLS_302;
    const __VLS_327 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_328 = __VLS_asFunctionalComponent(__VLS_327, new __VLS_327({ label: ("班级范围"), }));
    const __VLS_329 = __VLS_328({ label: ("班级范围"), }, ...__VLS_functionalComponentArgsRest(__VLS_328));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex items-center") }, });
    const __VLS_333 = __VLS_resolvedLocalAndGlobalComponents.ElInputNumber;
    /** @type { [typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ] } */
    // @ts-ignore
    const __VLS_334 = __VLS_asFunctionalComponent(__VLS_333, new __VLS_333({ modelValue: ((__VLS_ctx.batchAddForm.classStart)), min: ((1)), }));
    const __VLS_335 = __VLS_334({ modelValue: ((__VLS_ctx.batchAddForm.classStart)), min: ((1)), }, ...__VLS_functionalComponentArgsRest(__VLS_334));
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("mx-2 px-2") }, });
    const __VLS_339 = __VLS_resolvedLocalAndGlobalComponents.ElInputNumber;
    /** @type { [typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ] } */
    // @ts-ignore
    const __VLS_340 = __VLS_asFunctionalComponent(__VLS_339, new __VLS_339({ modelValue: ((__VLS_ctx.batchAddForm.classEnd)), min: ((1)), }));
    const __VLS_341 = __VLS_340({ modelValue: ((__VLS_ctx.batchAddForm.classEnd)), min: ((1)), }, ...__VLS_functionalComponentArgsRest(__VLS_340));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("text-xs text-gray-400 mt-1") }, });
    __VLS_nonNullable(__VLS_332.slots).default;
    var __VLS_332;
    __VLS_nonNullable(__VLS_277.slots).default;
    var __VLS_277;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_269.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("dialog-footer") }, });
        const __VLS_345 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_346 = __VLS_asFunctionalComponent(__VLS_345, new __VLS_345({ ...{ 'onClick': {} }, }));
        const __VLS_347 = __VLS_346({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_346));
        let __VLS_351;
        const __VLS_352 = {
            onClick: (...[$event]) => {
                __VLS_ctx.batchAddVisible = false;
            }
        };
        let __VLS_348;
        let __VLS_349;
        __VLS_nonNullable(__VLS_350.slots).default;
        var __VLS_350;
        const __VLS_353 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_354 = __VLS_asFunctionalComponent(__VLS_353, new __VLS_353({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.submitLoading)), }));
        const __VLS_355 = __VLS_354({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.submitLoading)), }, ...__VLS_functionalComponentArgsRest(__VLS_354));
        let __VLS_359;
        const __VLS_360 = {
            onClick: (__VLS_ctx.handleBatchAddSubmit)
        };
        let __VLS_356;
        let __VLS_357;
        __VLS_nonNullable(__VLS_358.slots).default;
        var __VLS_358;
    }
    var __VLS_269;
    const __VLS_361 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */
    // @ts-ignore
    const __VLS_362 = __VLS_asFunctionalComponent(__VLS_361, new __VLS_361({ modelValue: ((__VLS_ctx.importVisible)), title: ("导入班级数据"), width: ("550px"), }));
    const __VLS_363 = __VLS_362({ modelValue: ((__VLS_ctx.importVisible)), title: ("导入班级数据"), width: ("550px"), }, ...__VLS_functionalComponentArgsRest(__VLS_362));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("import-container") }, ...{ style: ({}) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-start mb-4") }, });
    const __VLS_367 = __VLS_resolvedLocalAndGlobalComponents.ElTooltip;
    /** @type { [typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ] } */
    // @ts-ignore
    const __VLS_368 = __VLS_asFunctionalComponent(__VLS_367, new __VLS_367({ placement: ("right"), effect: ("light"), }));
    const __VLS_369 = __VLS_368({ placement: ("right"), effect: ("light"), }, ...__VLS_functionalComponentArgsRest(__VLS_368));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { content: __VLS_thisSlot } = __VLS_nonNullable(__VLS_372.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("text-xs leading-6 text-gray-600 p-2") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("instructions-trigger") }, ...{ style: ({}) }, });
    const __VLS_373 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
    /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
    // @ts-ignore
    const __VLS_374 = __VLS_asFunctionalComponent(__VLS_373, new __VLS_373({ ...{ class: ("mr-1") }, }));
    const __VLS_375 = __VLS_374({ ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_374));
    const __VLS_379 = __VLS_resolvedLocalAndGlobalComponents.InfoFilled;
    /** @type { [typeof __VLS_components.InfoFilled, typeof __VLS_components.infoFilled, ] } */
    // @ts-ignore
    const __VLS_380 = __VLS_asFunctionalComponent(__VLS_379, new __VLS_379({}));
    const __VLS_381 = __VLS_380({}, ...__VLS_functionalComponentArgsRest(__VLS_380));
    __VLS_nonNullable(__VLS_378.slots).default;
    var __VLS_378;
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    var __VLS_372;
    const __VLS_385 = __VLS_resolvedLocalAndGlobalComponents.ElUpload;
    /** @type { [typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ] } */
    // @ts-ignore
    const __VLS_386 = __VLS_asFunctionalComponent(__VLS_385, new __VLS_385({ ref: ("uploadRef"), ...{ class: ("upload-demo") }, drag: (true), action: ("#"), multiple: (true), autoUpload: ((false)), onChange: ((__VLS_ctx.handleFileChange)), fileList: ((__VLS_ctx.fileList)), onRemove: ((__VLS_ctx.handleRemove)), showFileList: ((false)), accept: (".xlsx, .xls"), }));
    const __VLS_387 = __VLS_386({ ref: ("uploadRef"), ...{ class: ("upload-demo") }, drag: (true), action: ("#"), multiple: (true), autoUpload: ((false)), onChange: ((__VLS_ctx.handleFileChange)), fileList: ((__VLS_ctx.fileList)), onRemove: ((__VLS_ctx.handleRemove)), showFileList: ((false)), accept: (".xlsx, .xls"), }, ...__VLS_functionalComponentArgsRest(__VLS_386));
    // @ts-ignore navigation for `const uploadRef = ref()`
    __VLS_ctx.uploadRef;
    var __VLS_391 = {};
    if (__VLS_ctx.fileList.length === 0) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("upload-empty-content") }, ...{ style: ({}) }, });
        const __VLS_392 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_393 = __VLS_asFunctionalComponent(__VLS_392, new __VLS_392({ ...{ class: ("el-icon--upload") }, ...{ style: ({}) }, }));
        const __VLS_394 = __VLS_393({ ...{ class: ("el-icon--upload") }, ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_393));
        const __VLS_398 = __VLS_resolvedLocalAndGlobalComponents.UploadFilled;
        /** @type { [typeof __VLS_components.UploadFilled, typeof __VLS_components.uploadFilled, ] } */
        // @ts-ignore
        const __VLS_399 = __VLS_asFunctionalComponent(__VLS_398, new __VLS_398({}));
        const __VLS_400 = __VLS_399({}, ...__VLS_functionalComponentArgsRest(__VLS_399));
        __VLS_nonNullable(__VLS_397.slots).default;
        var __VLS_397;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("el-upload__text mt-2") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.em, __VLS_intrinsicElements.em)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("el-upload__tip mt-2 text-gray-400") }, });
    }
    else {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: () => { } }, ...{ class: ("upload-list-content") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-between items-center mb-2 px-2") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-xs font-bold text-gray-500") }, });
        (__VLS_ctx.fileList.length);
        const __VLS_404 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_405 = __VLS_asFunctionalComponent(__VLS_404, new __VLS_404({ ...{ 'onClick': {} }, link: (true), type: ("danger"), size: ("small"), }));
        const __VLS_406 = __VLS_405({ ...{ 'onClick': {} }, link: (true), type: ("danger"), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_405));
        let __VLS_410;
        const __VLS_411 = {
            onClick: (...[$event]) => {
                if (!(!((__VLS_ctx.fileList.length === 0))))
                    return;
                __VLS_ctx.fileList = [];
            }
        };
        let __VLS_407;
        let __VLS_408;
        __VLS_nonNullable(__VLS_409.slots).default;
        var __VLS_409;
        const __VLS_412 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
        /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
        // @ts-ignore
        const __VLS_413 = __VLS_asFunctionalComponent(__VLS_412, new __VLS_412({ data: ((__VLS_ctx.fileList)), size: ("small"), border: (true), maxHeight: ("180"), }));
        const __VLS_414 = __VLS_413({ data: ((__VLS_ctx.fileList)), size: ("small"), border: (true), maxHeight: ("180"), }, ...__VLS_functionalComponentArgsRest(__VLS_413));
        const __VLS_418 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_419 = __VLS_asFunctionalComponent(__VLS_418, new __VLS_418({ prop: ("name"), label: ("文件名"), showOverflowTooltip: (true), }));
        const __VLS_420 = __VLS_419({ prop: ("name"), label: ("文件名"), showOverflowTooltip: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_419));
        const __VLS_424 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_425 = __VLS_asFunctionalComponent(__VLS_424, new __VLS_424({ label: ("状态"), width: ("90"), align: ("center"), }));
        const __VLS_426 = __VLS_425({ label: ("状态"), width: ("90"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_425));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_429.slots);
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-center items-center") }, });
            if (row.status === 'ready') {
                const __VLS_430 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_431 = __VLS_asFunctionalComponent(__VLS_430, new __VLS_430({ type: ("info"), size: ("small"), }));
                const __VLS_432 = __VLS_431({ type: ("info"), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_431));
                __VLS_nonNullable(__VLS_435.slots).default;
                var __VLS_435;
            }
            else if (row.status === 'success') {
                const __VLS_436 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_437 = __VLS_asFunctionalComponent(__VLS_436, new __VLS_436({ type: ("success"), size: ("small"), }));
                const __VLS_438 = __VLS_437({ type: ("success"), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_437));
                __VLS_nonNullable(__VLS_441.slots).default;
                var __VLS_441;
            }
            else if (row.status === 'fail') {
                const __VLS_442 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_443 = __VLS_asFunctionalComponent(__VLS_442, new __VLS_442({ type: ("danger"), size: ("small"), }));
                const __VLS_444 = __VLS_443({ type: ("danger"), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_443));
                __VLS_nonNullable(__VLS_447.slots).default;
                var __VLS_447;
            }
            else {
                const __VLS_448 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_449 = __VLS_asFunctionalComponent(__VLS_448, new __VLS_448({ type: ("primary"), size: ("small"), }));
                const __VLS_450 = __VLS_449({ type: ("primary"), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_449));
                const __VLS_454 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
                /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
                // @ts-ignore
                const __VLS_455 = __VLS_asFunctionalComponent(__VLS_454, new __VLS_454({ ...{ class: ("is-loading") }, }));
                const __VLS_456 = __VLS_455({ ...{ class: ("is-loading") }, }, ...__VLS_functionalComponentArgsRest(__VLS_455));
                const __VLS_460 = __VLS_resolvedLocalAndGlobalComponents.loading;
                /** @type { [typeof __VLS_components.Loading, typeof __VLS_components.loading, ] } */
                // @ts-ignore
                const __VLS_461 = __VLS_asFunctionalComponent(__VLS_460, new __VLS_460({}));
                const __VLS_462 = __VLS_461({}, ...__VLS_functionalComponentArgsRest(__VLS_461));
                __VLS_nonNullable(__VLS_459.slots).default;
                var __VLS_459;
                __VLS_nonNullable(__VLS_453.slots).default;
                var __VLS_453;
            }
        }
        var __VLS_429;
        const __VLS_466 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_467 = __VLS_asFunctionalComponent(__VLS_466, new __VLS_466({ label: ("操作"), width: ("50"), align: ("center"), }));
        const __VLS_468 = __VLS_467({ label: ("操作"), width: ("50"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_467));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_471.slots);
            const [{ $index }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_472 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_473 = __VLS_asFunctionalComponent(__VLS_472, new __VLS_472({ ...{ 'onClick': {} }, link: (true), type: ("danger"), icon: ((__VLS_ctx.Delete)), }));
            const __VLS_474 = __VLS_473({ ...{ 'onClick': {} }, link: (true), type: ("danger"), icon: ((__VLS_ctx.Delete)), }, ...__VLS_functionalComponentArgsRest(__VLS_473));
            let __VLS_478;
            const __VLS_479 = {
                onClick: (...[$event]) => {
                    if (!(!((__VLS_ctx.fileList.length === 0))))
                        return;
                    __VLS_ctx.fileList.splice($index, 1);
                }
            };
            let __VLS_475;
            let __VLS_476;
            var __VLS_477;
        }
        var __VLS_471;
        __VLS_nonNullable(__VLS_417.slots).default;
        var __VLS_417;
    }
    __VLS_nonNullable(__VLS_390.slots).default;
    var __VLS_390;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-8 flex flex-col gap-3") }, });
    const __VLS_480 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_481 = __VLS_asFunctionalComponent(__VLS_480, new __VLS_480({ ...{ 'onClick': {} }, type: ("primary"), size: ("large"), ...{ class: ("w-full") }, loading: ((__VLS_ctx.importLoading)), disabled: ((__VLS_ctx.fileList.length === 0)), }));
    const __VLS_482 = __VLS_481({ ...{ 'onClick': {} }, type: ("primary"), size: ("large"), ...{ class: ("w-full") }, loading: ((__VLS_ctx.importLoading)), disabled: ((__VLS_ctx.fileList.length === 0)), }, ...__VLS_functionalComponentArgsRest(__VLS_481));
    let __VLS_486;
    const __VLS_487 = {
        onClick: (__VLS_ctx.submitImport)
    };
    let __VLS_483;
    let __VLS_484;
    if (!__VLS_ctx.importLoading) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { icon: __VLS_thisSlot } = __VLS_nonNullable(__VLS_485.slots);
            const __VLS_488 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
            /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
            // @ts-ignore
            const __VLS_489 = __VLS_asFunctionalComponent(__VLS_488, new __VLS_488({}));
            const __VLS_490 = __VLS_489({}, ...__VLS_functionalComponentArgsRest(__VLS_489));
            const __VLS_494 = __VLS_resolvedLocalAndGlobalComponents.upload;
            /** @type { [typeof __VLS_components.Upload, typeof __VLS_components.upload, ] } */
            // @ts-ignore
            const __VLS_495 = __VLS_asFunctionalComponent(__VLS_494, new __VLS_494({}));
            const __VLS_496 = __VLS_495({}, ...__VLS_functionalComponentArgsRest(__VLS_495));
            __VLS_nonNullable(__VLS_493.slots).default;
            var __VLS_493;
        }
    }
    (__VLS_ctx.importLoading ? '正在上传-校验-处理...' : '确认开始批量导入');
    var __VLS_485;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-center mt-1") }, });
    const __VLS_500 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_501 = __VLS_asFunctionalComponent(__VLS_500, new __VLS_500({ ...{ 'onClick': {} }, link: (true), type: ("primary"), ...{ style: ({}) }, }));
    const __VLS_502 = __VLS_501({ ...{ 'onClick': {} }, link: (true), type: ("primary"), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_501));
    let __VLS_506;
    const __VLS_507 = {
        onClick: (__VLS_ctx.fetchDownloadClassTemplate)
    };
    let __VLS_503;
    let __VLS_504;
    const __VLS_508 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
    /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
    // @ts-ignore
    const __VLS_509 = __VLS_asFunctionalComponent(__VLS_508, new __VLS_508({ ...{ class: ("mr-1") }, }));
    const __VLS_510 = __VLS_509({ ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_509));
    const __VLS_514 = __VLS_resolvedLocalAndGlobalComponents.document;
    /** @type { [typeof __VLS_components.Document, typeof __VLS_components.document, ] } */
    // @ts-ignore
    const __VLS_515 = __VLS_asFunctionalComponent(__VLS_514, new __VLS_514({}));
    const __VLS_516 = __VLS_515({}, ...__VLS_functionalComponentArgsRest(__VLS_515));
    __VLS_nonNullable(__VLS_513.slots).default;
    var __VLS_513;
    __VLS_nonNullable(__VLS_505.slots).default;
    var __VLS_505;
    __VLS_nonNullable(__VLS_366.slots).default;
    var __VLS_366;
    __VLS_styleScopedClasses['page-container'];
    __VLS_styleScopedClasses['search-card'];
    __VLS_styleScopedClasses['mb-4'];
    __VLS_styleScopedClasses['search-form-inline'];
    __VLS_styleScopedClasses['main-card'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['mr-4'];
    __VLS_styleScopedClasses['ml-2'];
    __VLS_styleScopedClasses['pagination-container'];
    __VLS_styleScopedClasses['mt-auto'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-end'];
    __VLS_styleScopedClasses['pt-4'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['dialog-footer'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['ml-1'];
    __VLS_styleScopedClasses['cursor-pointer'];
    __VLS_styleScopedClasses['text-gray-400'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['mx-2'];
    __VLS_styleScopedClasses['px-2'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-gray-400'];
    __VLS_styleScopedClasses['mt-1'];
    __VLS_styleScopedClasses['dialog-footer'];
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
    __VLS_styleScopedClasses['mt-2'];
    __VLS_styleScopedClasses['el-upload__tip'];
    __VLS_styleScopedClasses['mt-2'];
    __VLS_styleScopedClasses['text-gray-400'];
    __VLS_styleScopedClasses['upload-list-content'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['mb-2'];
    __VLS_styleScopedClasses['px-2'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['text-gray-500'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-center'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['is-loading'];
    __VLS_styleScopedClasses['mt-8'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['flex-col'];
    __VLS_styleScopedClasses['gap-3'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-center'];
    __VLS_styleScopedClasses['mt-1'];
    __VLS_styleScopedClasses['mr-1'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "formRef": __VLS_217,
        "batchAddFormRef": __VLS_278,
        "uploadRef": __VLS_391,
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
            fetchDownloadClassTemplate: fetchDownloadClassTemplate,
            UploadFilled: UploadFilled,
            Delete: Delete,
            Upload: Upload,
            Document: Document,
            InfoFilled: InfoFilled,
            searchForm: searchForm,
            currentSchoolName: currentSchoolName,
            tableData: tableData,
            loading: loading,
            page: page,
            pageSize: pageSize,
            total: total,
            dialogVisible: dialogVisible,
            dialogType: dialogType,
            submitLoading: submitLoading,
            formRef: formRef,
            batchAddVisible: batchAddVisible,
            batchAddFormRef: batchAddFormRef,
            batchAddForm: batchAddForm,
            batchAddRules: batchAddRules,
            importVisible: importVisible,
            importLoading: importLoading,
            fileList: fileList,
            uploadRef: uploadRef,
            gradeOptions: gradeOptions,
            formData: formData,
            rules: rules,
            handleSearch: handleSearch,
            resetSearch: resetSearch,
            handleSizeChange: handleSizeChange,
            handleCurrentChange: handleCurrentChange,
            handleAddClass: handleAddClass,
            handleEditClass: handleEditClass,
            handleEnterClass: handleEnterClass,
            handleDeleteClass: handleDeleteClass,
            handleSubmit: handleSubmit,
            resetForm: resetForm,
            handleBatchAdd: handleBatchAdd,
            resetBatchAddForm: resetBatchAddForm,
            handleBatchAddSubmit: handleBatchAddSubmit,
            handleBatchImport: handleBatchImport,
            handleFileChange: handleFileChange,
            handleRemove: handleRemove,
            submitImport: submitImport,
            selectedIds: selectedIds,
            isBatchDeleting: isBatchDeleting,
            handleSelectionChange: handleSelectionChange,
            handleBatchDelete: handleBatchDelete,
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