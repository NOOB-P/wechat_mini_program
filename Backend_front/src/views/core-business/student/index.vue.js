/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { fetchGetStudentList, fetchAddStudent, fetchUpdateStudent, fetchDeleteStudent, fetchBatchDeleteStudents, fetchImportStudents, fetchDownloadTemplate, fetchGetBoundParents } from '@/api/core-business/student/index';
import { fetchGetSchoolList } from '@/api/core-business/school/index';
import { ElMessage, ElMessageBox } from 'element-plus';
import { UploadFilled, Loading as LoadingIcon, Delete, Upload, Document, InfoFilled, Plus } from '@element-plus/icons-vue';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const route = useRoute();
// 表格数据相关
const loading = ref(false);
const tableData = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const selectedIds = ref([]);
const schoolList = ref([]);
const searchForm = reactive({
    keyword: '',
    schoolId: route.query.schoolId || '',
    classId: route.query.classId || ''
});
const currentSchoolName = ref(route.query.schoolName || '');
const currentClassName = ref(route.query.className || '');
const isBatchDeleting = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const boundParents = ref([]);
const submitLoading = ref(false);
const formRef = ref();
const form = ref({
    id: '',
    studentNo: '',
    name: '',
    school: '',
    schoolId: '',
    classId: '',
    grade: '',
    className: ''
});
const rules = {
    studentNo: [{ required: true, message: '请输入学号', trigger: 'blur' }],
    name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    schoolId: [{ required: true, message: '请选择学校', trigger: 'change' }]
};
const importVisible = ref(false);
const importLoading = ref(false);
const fileList = ref([]);
const activeNames = ref(['1']);
const uploadRef = ref();
const loadData = async () => {
    loading.value = true;
    try {
        const params = {
            current: page.value,
            size: pageSize.value,
            keyword: searchForm.keyword || undefined
        };
        // 支持按学校和班级ID进行关联查询过滤
        if (searchForm.schoolId)
            params.schoolId = searchForm.schoolId;
        if (searchForm.classId)
            params.classId = searchForm.classId;
        const res = await fetchGetStudentList(params);
        // 处理 axios 拦截器解包的情况
        if (res && res.records) {
            tableData.value = res.records;
            total.value = res.total;
        }
        else if (res && res.code === 200) {
            tableData.value = res.data.records;
            total.value = res.data.total;
        }
        else {
            tableData.value = [];
            total.value = 0;
        }
    }
    catch (error) {
        console.error('获取学生列表失败:', error);
    }
    finally {
        loading.value = false;
    }
};
const loadSchools = async () => {
    try {
        const res = await fetchGetSchoolList();
        if (Array.isArray(res)) {
            schoolList.value = res;
        }
        else if (res && res.code === 200) {
            schoolList.value = res.data;
        }
    }
    catch (error) {
        console.error('获取学校列表失败:', error);
    }
};
const handleSearch = () => {
    page.value = 1;
    loadData();
};
const resetSearch = () => {
    searchForm.keyword = '';
    searchForm.schoolId = route.query.schoolId || '';
    searchForm.classId = route.query.classId || '';
    handleSearch();
};
const handleSizeChange = (val) => {
    pageSize.value = val;
    loadData();
};
const handleCurrentChange = (val) => {
    page.value = val;
    loadData();
};
const handleSelectionChange = (selection) => {
    selectedIds.value = selection.map(item => item.id);
};
const handleBatchDelete = () => {
    if (selectedIds.value.length === 0) {
        isBatchDeleting.value = false;
        selectedIds.value = [];
        return;
    }
    ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个学生吗？`, '批量删除警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        try {
            const res = await fetchBatchDeleteStudents(selectedIds.value);
            console.log('学生批量删除返回数据:', res);
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
            loadData();
        }
        catch (error) {
            console.error('学生批量删除异常:', error);
            ElMessage.error(error.message || '批量删除失败');
        }
    }).catch(() => { });
};
const handleAdd = () => {
    if (!searchForm.schoolId || !searchForm.classId) {
        ElMessage.warning('请先从学校管理 -> 班级管理进入指定的班级，才能添加学生！');
        return;
    }
    isEdit.value = false;
    form.value = {
        id: '',
        studentNo: '',
        name: '',
        schoolId: searchForm.schoolId,
        classId: searchForm.classId,
        school: currentSchoolName.value,
        grade: '',
        className: ''
    };
    if (formRef.value) {
        formRef.value.resetFields();
    }
    dialogVisible.value = true;
};
const handleEdit = async (row) => {
    isEdit.value = true;
    form.value = { ...row };
    boundParents.value = [];
    if (formRef.value) {
        formRef.value.resetFields();
    }
    // 处理后端返回字段匹配问题，给 schoolId 赋值
    if (row.school && !form.value.schoolId) {
        const matchedSchool = schoolList.value.find(s => s.name === row.school);
        if (matchedSchool) {
            form.value.schoolId = matchedSchool.id;
        }
    }
    dialogVisible.value = true;
    // 获取绑定的家长手机号列表
    try {
        const res = await fetchGetBoundParents(row.id);
        if (res.code === 200) {
            boundParents.value = res.data || [];
        }
        else if (Array.isArray(res)) {
            boundParents.value = res;
        }
    }
    catch (error) {
        console.error('获取绑定账号失败', error);
    }
};
const handleDelete = (row) => {
    ElMessageBox.confirm(`确认删除学生 [${row.name}] 吗？`, '警告', {
        type: 'warning'
    }).then(async () => {
        try {
            const res = await fetchDeleteStudent(row.id);
            if (res && res.code === 200 && res.msg && res.msg.includes('失败')) {
                ElMessage.warning(res.msg);
            }
            else {
                ElMessage.success(res?.msg || '删除成功');
            }
            loadData();
        }
        catch (error) {
            ElMessage.error(error.message || '删除失败');
        }
    });
};
const submitForm = async () => {
    if (!formRef.value)
        return;
    await formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                submitLoading.value = true;
                // 获取选中学校的名称（为了冗余字段 school 赋值）
                const matchedSchool = schoolList.value.find(s => s.id === form.value.schoolId);
                if (matchedSchool) {
                    form.value.school = matchedSchool.name;
                }
                if (isEdit.value) {
                    await fetchUpdateStudent(form.value);
                    ElMessage.success('更新成功');
                }
                else {
                    await fetchAddStudent(form.value);
                    ElMessage.success('添加成功');
                }
                dialogVisible.value = false;
                loadData();
            }
            catch (error) {
                // Axios 拦截器会抛出错误，我们在 catch 里不用自己提示了或者可以通过 error.message 提示
                ElMessage.error(error.message || '操作失败');
            }
            finally {
                submitLoading.value = false;
            }
        }
    });
};
const handleOpenImport = () => {
    fileList.value = [];
    importVisible.value = true;
};
// 导入相关
const handleFileChange = (uploadFile, uploadFiles) => {
    fileList.value = uploadFiles;
};
const handleRemove = (file, uploadFiles) => {
    fileList.value = uploadFiles;
};
const handleContinueUpload = () => {
    if (uploadRef.value) {
        // 触发 el-upload 内部的 input 点击
        const input = uploadRef.value.$el.querySelector('input[type="file"]');
        if (input) {
            input.click();
        }
    }
};
const submitImport = async () => {
    const readyFiles = fileList.value.filter(f => f.status === 'ready' || f.status === 'fail');
    if (readyFiles.length === 0) {
        ElMessage.warning('没有待导入的文件');
        return;
    }
    importLoading.value = true;
    let successCount = 0;
    let failCount = 0;
    for (const fileItem of readyFiles) {
        fileItem.status = 'uploading';
        fileItem.errorMsg = '';
        try {
            await fetchImportStudents(fileItem.raw, searchForm.schoolId || undefined, searchForm.classId || undefined);
            fileItem.status = 'success';
            successCount++;
        }
        catch (error) {
            fileItem.status = 'fail';
            fileItem.errorMsg = error.message || '导入失败';
            failCount++;
        }
    }
    if (failCount === 0) {
        ElMessage.success(`成功导入 ${successCount} 个文件`);
        setTimeout(() => {
            importVisible.value = false;
            fileList.value = [];
            loadData();
        }, 1500);
    }
    else {
        ElMessage.warning(`导入完成：${successCount} 个成功，${failCount} 个失败`);
        loadData(); // 部分成功也要刷新列表
    }
    importLoading.value = false;
};
const downloadTemplate = () => {
    fetchDownloadTemplate();
};
onMounted(() => {
    loadSchools();
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
    __VLS_styleScopedClasses['instructions-trigger'];
    __VLS_styleScopedClasses['instructions-collapse'];
    __VLS_styleScopedClasses['instructions-collapse'];
    __VLS_styleScopedClasses['instructions-collapse'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("page-container") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ shadow: ("never"), ...{ class: ("main-card") }, }));
    const __VLS_2 = __VLS_1({ shadow: ("never"), ...{ class: ("main-card") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { header: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-between items-center") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex items-center") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("font-bold mr-4") }, });
        if (__VLS_ctx.currentSchoolName || __VLS_ctx.currentClassName) {
            const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
            /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
            // @ts-ignore
            const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ type: ("warning"), effect: ("plain"), ...{ class: ("ml-2") }, }));
            const __VLS_8 = __VLS_7({ type: ("warning"), effect: ("plain"), ...{ class: ("ml-2") }, }, ...__VLS_functionalComponentArgsRest(__VLS_7));
            (__VLS_ctx.currentSchoolName || '全部');
            (__VLS_ctx.currentClassName || '全部');
            __VLS_nonNullable(__VLS_11.slots).default;
            var __VLS_11;
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("header-actions") }, });
        if (!__VLS_ctx.isBatchDeleting) {
            const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ ...{ 'onClick': {} }, type: ("danger"), }));
            const __VLS_14 = __VLS_13({ ...{ 'onClick': {} }, type: ("danger"), }, ...__VLS_functionalComponentArgsRest(__VLS_13));
            let __VLS_18;
            const __VLS_19 = {
                onClick: (...[$event]) => {
                    if (!((!__VLS_ctx.isBatchDeleting)))
                        return;
                    __VLS_ctx.isBatchDeleting = true;
                }
            };
            let __VLS_15;
            let __VLS_16;
            __VLS_nonNullable(__VLS_17.slots).default;
            var __VLS_17;
        }
        else {
            const __VLS_20 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({ ...{ 'onClick': {} }, type: ((__VLS_ctx.selectedIds.length > 0 ? 'danger' : 'default')), }));
            const __VLS_22 = __VLS_21({ ...{ 'onClick': {} }, type: ((__VLS_ctx.selectedIds.length > 0 ? 'danger' : 'default')), }, ...__VLS_functionalComponentArgsRest(__VLS_21));
            let __VLS_26;
            const __VLS_27 = {
                onClick: (__VLS_ctx.handleBatchDelete)
            };
            let __VLS_23;
            let __VLS_24;
            (__VLS_ctx.selectedIds.length > 0 ? '开始删除' : '取消删除');
            __VLS_nonNullable(__VLS_25.slots).default;
            var __VLS_25;
        }
        const __VLS_28 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({ ...{ 'onClick': {} }, }));
        const __VLS_30 = __VLS_29({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        let __VLS_34;
        const __VLS_35 = {
            onClick: (__VLS_ctx.handleOpenImport)
        };
        let __VLS_31;
        let __VLS_32;
        __VLS_nonNullable(__VLS_33.slots).default;
        var __VLS_33;
        const __VLS_36 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_38 = __VLS_37({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        let __VLS_42;
        const __VLS_43 = {
            onClick: (__VLS_ctx.handleAdd)
        };
        let __VLS_39;
        let __VLS_40;
        __VLS_nonNullable(__VLS_41.slots).default;
        var __VLS_41;
    }
    const __VLS_44 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({ inline: ((true)), model: ((__VLS_ctx.searchForm)), ...{ class: ("search-form") }, }));
    const __VLS_46 = __VLS_45({ inline: ((true)), model: ((__VLS_ctx.searchForm)), ...{ class: ("search-form") }, }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    const __VLS_50 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({ label: ("综合搜索"), }));
    const __VLS_52 = __VLS_51({ label: ("综合搜索"), }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    const __VLS_56 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.searchForm.keyword)), placeholder: ("搜索姓名/学号/学校/年级/班级"), clearable: (true), ...{ style: ({}) }, }));
    const __VLS_58 = __VLS_57({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.searchForm.keyword)), placeholder: ("搜索姓名/学号/学校/年级/班级"), clearable: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    let __VLS_62;
    const __VLS_63 = {
        onKeyup: (__VLS_ctx.handleSearch)
    };
    let __VLS_59;
    let __VLS_60;
    var __VLS_61;
    __VLS_nonNullable(__VLS_55.slots).default;
    var __VLS_55;
    const __VLS_64 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({}));
    const __VLS_66 = __VLS_65({}, ...__VLS_functionalComponentArgsRest(__VLS_65));
    const __VLS_70 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({ ...{ 'onClick': {} }, type: ("primary"), }));
    const __VLS_72 = __VLS_71({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_71));
    let __VLS_76;
    const __VLS_77 = {
        onClick: (__VLS_ctx.handleSearch)
    };
    let __VLS_73;
    let __VLS_74;
    __VLS_nonNullable(__VLS_75.slots).default;
    var __VLS_75;
    const __VLS_78 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({ ...{ 'onClick': {} }, }));
    const __VLS_80 = __VLS_79({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_79));
    let __VLS_84;
    const __VLS_85 = {
        onClick: (__VLS_ctx.resetSearch)
    };
    let __VLS_81;
    let __VLS_82;
    __VLS_nonNullable(__VLS_83.slots).default;
    var __VLS_83;
    __VLS_nonNullable(__VLS_69.slots).default;
    var __VLS_69;
    __VLS_nonNullable(__VLS_49.slots).default;
    var __VLS_49;
    const __VLS_86 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
    // @ts-ignore
    const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({ ...{ 'onSelectionChange': {} }, data: ((__VLS_ctx.tableData)), border: (true), ...{ style: ({}) }, height: ("350"), }));
    const __VLS_88 = __VLS_87({ ...{ 'onSelectionChange': {} }, data: ((__VLS_ctx.tableData)), border: (true), ...{ style: ({}) }, height: ("350"), }, ...__VLS_functionalComponentArgsRest(__VLS_87));
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.loading) }, null, null);
    let __VLS_92;
    const __VLS_93 = {
        onSelectionChange: (__VLS_ctx.handleSelectionChange)
    };
    let __VLS_89;
    let __VLS_90;
    if (__VLS_ctx.isBatchDeleting) {
        const __VLS_94 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({ type: ("selection"), width: ("55"), align: ("center"), }));
        const __VLS_96 = __VLS_95({ type: ("selection"), width: ("55"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_95));
    }
    const __VLS_100 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({ prop: ("studentNo"), label: ("学号"), width: ("160"), align: ("center"), }));
    const __VLS_102 = __VLS_101({ prop: ("studentNo"), label: ("学号"), width: ("160"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    const __VLS_106 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({ prop: ("name"), label: ("姓名"), width: ("120"), align: ("center"), }));
    const __VLS_108 = __VLS_107({ prop: ("name"), label: ("姓名"), width: ("120"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_107));
    const __VLS_112 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({ prop: ("school"), label: ("学校"), minWidth: ("180"), showOverflowTooltip: (true), }));
    const __VLS_114 = __VLS_113({ prop: ("school"), label: ("学校"), minWidth: ("180"), showOverflowTooltip: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_113));
    const __VLS_118 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({ prop: ("grade"), label: ("年级"), width: ("120"), align: ("center"), }));
    const __VLS_120 = __VLS_119({ prop: ("grade"), label: ("年级"), width: ("120"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_119));
    const __VLS_124 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({ prop: ("className"), label: ("班级"), width: ("100"), align: ("center"), }));
    const __VLS_126 = __VLS_125({ prop: ("className"), label: ("班级"), width: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_125));
    const __VLS_130 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({ label: ("绑定数量"), width: ("100"), align: ("center"), }));
    const __VLS_132 = __VLS_131({ label: ("绑定数量"), width: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_131));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_135.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_136 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
        /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
        // @ts-ignore
        const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({ type: ((row.boundCount > 0 ? 'success' : 'info')), size: ("small"), }));
        const __VLS_138 = __VLS_137({ type: ((row.boundCount > 0 ? 'success' : 'info')), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_137));
        (row.boundCount);
        __VLS_nonNullable(__VLS_141.slots).default;
        var __VLS_141;
    }
    var __VLS_135;
    const __VLS_142 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_143 = __VLS_asFunctionalComponent(__VLS_142, new __VLS_142({ label: ("操作"), width: ("150"), fixed: ("right"), align: ("center"), }));
    const __VLS_144 = __VLS_143({ label: ("操作"), width: ("150"), fixed: ("right"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_143));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_147.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_148 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({ ...{ 'onClick': {} }, link: (true), type: ("primary"), size: ("small"), }));
        const __VLS_150 = __VLS_149({ ...{ 'onClick': {} }, link: (true), type: ("primary"), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_149));
        let __VLS_154;
        const __VLS_155 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleEdit(row);
            }
        };
        let __VLS_151;
        let __VLS_152;
        __VLS_nonNullable(__VLS_153.slots).default;
        var __VLS_153;
        const __VLS_156 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({ ...{ 'onClick': {} }, link: (true), type: ("danger"), size: ("small"), ...{ class: ("ml-2") }, }));
        const __VLS_158 = __VLS_157({ ...{ 'onClick': {} }, link: (true), type: ("danger"), size: ("small"), ...{ class: ("ml-2") }, }, ...__VLS_functionalComponentArgsRest(__VLS_157));
        let __VLS_162;
        const __VLS_163 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleDelete(row);
            }
        };
        let __VLS_159;
        let __VLS_160;
        __VLS_nonNullable(__VLS_161.slots).default;
        var __VLS_161;
    }
    var __VLS_147;
    __VLS_nonNullable(__VLS_91.slots).default;
    var __VLS_91;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("pagination-container mt-auto flex justify-end pt-4") }, });
    const __VLS_164 = __VLS_resolvedLocalAndGlobalComponents.ElPagination;
    /** @type { [typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ] } */
    // @ts-ignore
    const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({ ...{ 'onSizeChange': {} }, ...{ 'onCurrentChange': {} }, currentPage: ((__VLS_ctx.page)), pageSize: ((__VLS_ctx.pageSize)), total: ((__VLS_ctx.total)), pageSizes: (([10, 20, 50, 100])), layout: ("total, sizes, prev, pager, next, jumper"), }));
    const __VLS_166 = __VLS_165({ ...{ 'onSizeChange': {} }, ...{ 'onCurrentChange': {} }, currentPage: ((__VLS_ctx.page)), pageSize: ((__VLS_ctx.pageSize)), total: ((__VLS_ctx.total)), pageSizes: (([10, 20, 50, 100])), layout: ("total, sizes, prev, pager, next, jumper"), }, ...__VLS_functionalComponentArgsRest(__VLS_165));
    let __VLS_170;
    const __VLS_171 = {
        onSizeChange: (__VLS_ctx.handleSizeChange)
    };
    const __VLS_172 = {
        onCurrentChange: (__VLS_ctx.handleCurrentChange)
    };
    let __VLS_167;
    let __VLS_168;
    var __VLS_169;
    var __VLS_5;
    const __VLS_173 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */
    // @ts-ignore
    const __VLS_174 = __VLS_asFunctionalComponent(__VLS_173, new __VLS_173({ modelValue: ((__VLS_ctx.dialogVisible)), title: ((__VLS_ctx.isEdit ? '编辑学生档案' : '新增学生')), width: ("500px"), }));
    const __VLS_175 = __VLS_174({ modelValue: ((__VLS_ctx.dialogVisible)), title: ((__VLS_ctx.isEdit ? '编辑学生档案' : '新增学生')), width: ("500px"), }, ...__VLS_functionalComponentArgsRest(__VLS_174));
    const __VLS_179 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */
    // @ts-ignore
    const __VLS_180 = __VLS_asFunctionalComponent(__VLS_179, new __VLS_179({ ref: ("formRef"), model: ((__VLS_ctx.form)), rules: ((__VLS_ctx.rules)), labelWidth: ("100px"), }));
    const __VLS_181 = __VLS_180({ ref: ("formRef"), model: ((__VLS_ctx.form)), rules: ((__VLS_ctx.rules)), labelWidth: ("100px"), }, ...__VLS_functionalComponentArgsRest(__VLS_180));
    // @ts-ignore navigation for `const formRef = ref()`
    __VLS_ctx.formRef;
    var __VLS_185 = {};
    const __VLS_186 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_187 = __VLS_asFunctionalComponent(__VLS_186, new __VLS_186({ label: ("学号"), prop: ("studentNo"), }));
    const __VLS_188 = __VLS_187({ label: ("学号"), prop: ("studentNo"), }, ...__VLS_functionalComponentArgsRest(__VLS_187));
    const __VLS_192 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({ modelValue: ((__VLS_ctx.form.studentNo)), placeholder: ("请输入学号"), }));
    const __VLS_194 = __VLS_193({ modelValue: ((__VLS_ctx.form.studentNo)), placeholder: ("请输入学号"), }, ...__VLS_functionalComponentArgsRest(__VLS_193));
    __VLS_nonNullable(__VLS_191.slots).default;
    var __VLS_191;
    const __VLS_198 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_199 = __VLS_asFunctionalComponent(__VLS_198, new __VLS_198({ label: ("姓名"), prop: ("name"), }));
    const __VLS_200 = __VLS_199({ label: ("姓名"), prop: ("name"), }, ...__VLS_functionalComponentArgsRest(__VLS_199));
    const __VLS_204 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({ modelValue: ((__VLS_ctx.form.name)), placeholder: ("请输入姓名"), }));
    const __VLS_206 = __VLS_205({ modelValue: ((__VLS_ctx.form.name)), placeholder: ("请输入姓名"), }, ...__VLS_functionalComponentArgsRest(__VLS_205));
    __VLS_nonNullable(__VLS_203.slots).default;
    var __VLS_203;
    if (__VLS_ctx.isEdit) {
        const __VLS_210 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
        // @ts-ignore
        const __VLS_211 = __VLS_asFunctionalComponent(__VLS_210, new __VLS_210({ label: ("绑定账号"), }));
        const __VLS_212 = __VLS_211({ label: ("绑定账号"), }, ...__VLS_functionalComponentArgsRest(__VLS_211));
        if (__VLS_ctx.boundParents.length > 0) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("w-full") }, });
            for (const [phone, index] of __VLS_getVForSourceType((__VLS_ctx.boundParents))) {
                const __VLS_216 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({ key: ((index)), type: ("info"), ...{ class: ("mr-2 mb-2") }, }));
                const __VLS_218 = __VLS_217({ key: ((index)), type: ("info"), ...{ class: ("mr-2 mb-2") }, }, ...__VLS_functionalComponentArgsRest(__VLS_217));
                (phone);
                __VLS_nonNullable(__VLS_221.slots).default;
                var __VLS_221;
            }
        }
        else {
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-gray-400 text-sm") }, });
        }
        __VLS_nonNullable(__VLS_215.slots).default;
        var __VLS_215;
    }
    __VLS_nonNullable(__VLS_184.slots).default;
    var __VLS_184;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_178.slots);
        const __VLS_222 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_223 = __VLS_asFunctionalComponent(__VLS_222, new __VLS_222({ ...{ 'onClick': {} }, }));
        const __VLS_224 = __VLS_223({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_223));
        let __VLS_228;
        const __VLS_229 = {
            onClick: (...[$event]) => {
                __VLS_ctx.dialogVisible = false;
            }
        };
        let __VLS_225;
        let __VLS_226;
        __VLS_nonNullable(__VLS_227.slots).default;
        var __VLS_227;
        const __VLS_230 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_231 = __VLS_asFunctionalComponent(__VLS_230, new __VLS_230({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.submitLoading)), }));
        const __VLS_232 = __VLS_231({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.submitLoading)), }, ...__VLS_functionalComponentArgsRest(__VLS_231));
        let __VLS_236;
        const __VLS_237 = {
            onClick: (__VLS_ctx.submitForm)
        };
        let __VLS_233;
        let __VLS_234;
        __VLS_nonNullable(__VLS_235.slots).default;
        var __VLS_235;
    }
    var __VLS_178;
    const __VLS_238 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */
    // @ts-ignore
    const __VLS_239 = __VLS_asFunctionalComponent(__VLS_238, new __VLS_238({ modelValue: ((__VLS_ctx.importVisible)), title: ("导入学生档案"), width: ("550px"), }));
    const __VLS_240 = __VLS_239({ modelValue: ((__VLS_ctx.importVisible)), title: ("导入学生档案"), width: ("550px"), }, ...__VLS_functionalComponentArgsRest(__VLS_239));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("import-container") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-start mb-4") }, });
    const __VLS_244 = __VLS_resolvedLocalAndGlobalComponents.ElTooltip;
    /** @type { [typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ] } */
    // @ts-ignore
    const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({ placement: ("right"), effect: ("light"), }));
    const __VLS_246 = __VLS_245({ placement: ("right"), effect: ("light"), }, ...__VLS_functionalComponentArgsRest(__VLS_245));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { content: __VLS_thisSlot } = __VLS_nonNullable(__VLS_249.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("text-xs leading-6 text-gray-600 p-2") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("instructions-trigger") }, });
    const __VLS_250 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
    /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
    // @ts-ignore
    const __VLS_251 = __VLS_asFunctionalComponent(__VLS_250, new __VLS_250({ ...{ class: ("mr-1") }, }));
    const __VLS_252 = __VLS_251({ ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_251));
    const __VLS_256 = __VLS_resolvedLocalAndGlobalComponents.InfoFilled;
    /** @type { [typeof __VLS_components.InfoFilled, typeof __VLS_components.infoFilled, ] } */
    // @ts-ignore
    const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({}));
    const __VLS_258 = __VLS_257({}, ...__VLS_functionalComponentArgsRest(__VLS_257));
    __VLS_nonNullable(__VLS_255.slots).default;
    var __VLS_255;
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    var __VLS_249;
    const __VLS_262 = __VLS_resolvedLocalAndGlobalComponents.ElUpload;
    /** @type { [typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ] } */
    // @ts-ignore
    const __VLS_263 = __VLS_asFunctionalComponent(__VLS_262, new __VLS_262({ ref: ("uploadRef"), ...{ class: ("upload-demo") }, drag: (true), action: ("#"), multiple: (true), autoUpload: ((false)), onChange: ((__VLS_ctx.handleFileChange)), fileList: ((__VLS_ctx.fileList)), onRemove: ((__VLS_ctx.handleRemove)), showFileList: ((false)), accept: (".xlsx, .xls"), }));
    const __VLS_264 = __VLS_263({ ref: ("uploadRef"), ...{ class: ("upload-demo") }, drag: (true), action: ("#"), multiple: (true), autoUpload: ((false)), onChange: ((__VLS_ctx.handleFileChange)), fileList: ((__VLS_ctx.fileList)), onRemove: ((__VLS_ctx.handleRemove)), showFileList: ((false)), accept: (".xlsx, .xls"), }, ...__VLS_functionalComponentArgsRest(__VLS_263));
    // @ts-ignore navigation for `const uploadRef = ref()`
    __VLS_ctx.uploadRef;
    var __VLS_268 = {};
    if (__VLS_ctx.fileList.length === 0) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("upload-empty-content") }, });
        const __VLS_269 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_270 = __VLS_asFunctionalComponent(__VLS_269, new __VLS_269({ ...{ class: ("el-icon--upload") }, }));
        const __VLS_271 = __VLS_270({ ...{ class: ("el-icon--upload") }, }, ...__VLS_functionalComponentArgsRest(__VLS_270));
        const __VLS_275 = __VLS_resolvedLocalAndGlobalComponents.UploadFilled;
        /** @type { [typeof __VLS_components.UploadFilled, typeof __VLS_components.uploadFilled, ] } */
        // @ts-ignore
        const __VLS_276 = __VLS_asFunctionalComponent(__VLS_275, new __VLS_275({}));
        const __VLS_277 = __VLS_276({}, ...__VLS_functionalComponentArgsRest(__VLS_276));
        __VLS_nonNullable(__VLS_274.slots).default;
        var __VLS_274;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("el-upload__text") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.em, __VLS_intrinsicElements.em)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("el-upload__tip mt-2") }, });
    }
    else {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: () => { } }, ...{ class: ("upload-list-content") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-between items-center mb-2 px-2") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-xs font-bold text-gray-500") }, });
        (__VLS_ctx.fileList.length);
        const __VLS_281 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_282 = __VLS_asFunctionalComponent(__VLS_281, new __VLS_281({ ...{ 'onClick': {} }, link: (true), type: ("danger"), size: ("small"), }));
        const __VLS_283 = __VLS_282({ ...{ 'onClick': {} }, link: (true), type: ("danger"), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_282));
        let __VLS_287;
        const __VLS_288 = {
            onClick: (...[$event]) => {
                if (!(!((__VLS_ctx.fileList.length === 0))))
                    return;
                __VLS_ctx.fileList = [];
            }
        };
        let __VLS_284;
        let __VLS_285;
        __VLS_nonNullable(__VLS_286.slots).default;
        var __VLS_286;
        const __VLS_289 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
        /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
        // @ts-ignore
        const __VLS_290 = __VLS_asFunctionalComponent(__VLS_289, new __VLS_289({ data: ((__VLS_ctx.fileList)), size: ("small"), border: (true), maxHeight: ("180"), ...{ class: ("import-table") }, }));
        const __VLS_291 = __VLS_290({ data: ((__VLS_ctx.fileList)), size: ("small"), border: (true), maxHeight: ("180"), ...{ class: ("import-table") }, }, ...__VLS_functionalComponentArgsRest(__VLS_290));
        const __VLS_295 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_296 = __VLS_asFunctionalComponent(__VLS_295, new __VLS_295({ prop: ("name"), label: ("文件名"), showOverflowTooltip: (true), }));
        const __VLS_297 = __VLS_296({ prop: ("name"), label: ("文件名"), showOverflowTooltip: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_296));
        const __VLS_301 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_302 = __VLS_asFunctionalComponent(__VLS_301, new __VLS_301({ label: ("状态"), width: ("90"), align: ("center"), }));
        const __VLS_303 = __VLS_302({ label: ("状态"), width: ("90"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_302));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_306.slots);
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("status-cell") }, });
            if (row.status === 'ready') {
                const __VLS_307 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_308 = __VLS_asFunctionalComponent(__VLS_307, new __VLS_307({ type: ("info"), size: ("small"), ...{ class: ("status-tag-mini") }, }));
                const __VLS_309 = __VLS_308({ type: ("info"), size: ("small"), ...{ class: ("status-tag-mini") }, }, ...__VLS_functionalComponentArgsRest(__VLS_308));
                __VLS_nonNullable(__VLS_312.slots).default;
                var __VLS_312;
            }
            else if (row.status === 'success') {
                const __VLS_313 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_314 = __VLS_asFunctionalComponent(__VLS_313, new __VLS_313({ type: ("success"), size: ("small"), ...{ class: ("status-tag-mini tag-success-simple") }, }));
                const __VLS_315 = __VLS_314({ type: ("success"), size: ("small"), ...{ class: ("status-tag-mini tag-success-simple") }, }, ...__VLS_functionalComponentArgsRest(__VLS_314));
                __VLS_nonNullable(__VLS_318.slots).default;
                var __VLS_318;
            }
            else if (row.status === 'fail') {
                const __VLS_319 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_320 = __VLS_asFunctionalComponent(__VLS_319, new __VLS_319({ type: ("danger"), size: ("small"), ...{ class: ("status-tag-mini") }, }));
                const __VLS_321 = __VLS_320({ type: ("danger"), size: ("small"), ...{ class: ("status-tag-mini") }, }, ...__VLS_functionalComponentArgsRest(__VLS_320));
                if (row.errorMsg) {
                    const __VLS_325 = __VLS_resolvedLocalAndGlobalComponents.ElTooltip;
                    /** @type { [typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ] } */
                    // @ts-ignore
                    const __VLS_326 = __VLS_asFunctionalComponent(__VLS_325, new __VLS_325({ content: ((row.errorMsg)), placement: ("top"), }));
                    const __VLS_327 = __VLS_326({ content: ((row.errorMsg)), placement: ("top"), }, ...__VLS_functionalComponentArgsRest(__VLS_326));
                    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                    __VLS_nonNullable(__VLS_330.slots).default;
                    var __VLS_330;
                }
                else {
                    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                }
                __VLS_nonNullable(__VLS_324.slots).default;
                var __VLS_324;
            }
            else {
                const __VLS_331 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_332 = __VLS_asFunctionalComponent(__VLS_331, new __VLS_331({ type: ("primary"), size: ("small"), ...{ class: ("status-tag-mini rotating") }, }));
                const __VLS_333 = __VLS_332({ type: ("primary"), size: ("small"), ...{ class: ("status-tag-mini rotating") }, }, ...__VLS_functionalComponentArgsRest(__VLS_332));
                const __VLS_337 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
                /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
                // @ts-ignore
                const __VLS_338 = __VLS_asFunctionalComponent(__VLS_337, new __VLS_337({}));
                const __VLS_339 = __VLS_338({}, ...__VLS_functionalComponentArgsRest(__VLS_338));
                const __VLS_343 = __VLS_resolvedLocalAndGlobalComponents.LoadingIcon;
                /** @type { [typeof __VLS_components.LoadingIcon, typeof __VLS_components.loadingIcon, ] } */
                // @ts-ignore
                const __VLS_344 = __VLS_asFunctionalComponent(__VLS_343, new __VLS_343({}));
                const __VLS_345 = __VLS_344({}, ...__VLS_functionalComponentArgsRest(__VLS_344));
                __VLS_nonNullable(__VLS_342.slots).default;
                var __VLS_342;
                __VLS_nonNullable(__VLS_336.slots).default;
                var __VLS_336;
            }
        }
        var __VLS_306;
        const __VLS_349 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_350 = __VLS_asFunctionalComponent(__VLS_349, new __VLS_349({ label: ("操作"), width: ("50"), align: ("center"), }));
        const __VLS_351 = __VLS_350({ label: ("操作"), width: ("50"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_350));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_354.slots);
            const [{ $index }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_355 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_356 = __VLS_asFunctionalComponent(__VLS_355, new __VLS_355({ ...{ 'onClick': {} }, link: (true), type: ("danger"), icon: ((__VLS_ctx.Delete)), }));
            const __VLS_357 = __VLS_356({ ...{ 'onClick': {} }, link: (true), type: ("danger"), icon: ((__VLS_ctx.Delete)), }, ...__VLS_functionalComponentArgsRest(__VLS_356));
            let __VLS_361;
            const __VLS_362 = {
                onClick: (...[$event]) => {
                    if (!(!((__VLS_ctx.fileList.length === 0))))
                        return;
                    __VLS_ctx.fileList.splice($index, 1);
                }
            };
            let __VLS_358;
            let __VLS_359;
            var __VLS_360;
        }
        var __VLS_354;
        __VLS_nonNullable(__VLS_294.slots).default;
        var __VLS_294;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-2 text-center") }, });
        const __VLS_363 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_364 = __VLS_asFunctionalComponent(__VLS_363, new __VLS_363({ ...{ 'onClick': {} }, link: (true), type: ("primary"), size: ("small"), }));
        const __VLS_365 = __VLS_364({ ...{ 'onClick': {} }, link: (true), type: ("primary"), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_364));
        let __VLS_369;
        const __VLS_370 = {
            onClick: (__VLS_ctx.handleContinueUpload)
        };
        let __VLS_366;
        let __VLS_367;
        const __VLS_371 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_372 = __VLS_asFunctionalComponent(__VLS_371, new __VLS_371({ ...{ class: ("mr-1") }, }));
        const __VLS_373 = __VLS_372({ ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_372));
        const __VLS_377 = __VLS_resolvedLocalAndGlobalComponents.plus;
        /** @type { [typeof __VLS_components.Plus, typeof __VLS_components.plus, ] } */
        // @ts-ignore
        const __VLS_378 = __VLS_asFunctionalComponent(__VLS_377, new __VLS_377({}));
        const __VLS_379 = __VLS_378({}, ...__VLS_functionalComponentArgsRest(__VLS_378));
        __VLS_nonNullable(__VLS_376.slots).default;
        var __VLS_376;
        __VLS_nonNullable(__VLS_368.slots).default;
        var __VLS_368;
    }
    __VLS_nonNullable(__VLS_267.slots).default;
    var __VLS_267;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-8 flex flex-col gap-3") }, });
    const __VLS_383 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_384 = __VLS_asFunctionalComponent(__VLS_383, new __VLS_383({ ...{ 'onClick': {} }, type: ("primary"), size: ("large"), ...{ class: ("w-full start-import-btn") }, loading: ((__VLS_ctx.importLoading)), disabled: ((__VLS_ctx.fileList.length === 0)), }));
    const __VLS_385 = __VLS_384({ ...{ 'onClick': {} }, type: ("primary"), size: ("large"), ...{ class: ("w-full start-import-btn") }, loading: ((__VLS_ctx.importLoading)), disabled: ((__VLS_ctx.fileList.length === 0)), }, ...__VLS_functionalComponentArgsRest(__VLS_384));
    let __VLS_389;
    const __VLS_390 = {
        onClick: (__VLS_ctx.submitImport)
    };
    let __VLS_386;
    let __VLS_387;
    if (!__VLS_ctx.importLoading) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { icon: __VLS_thisSlot } = __VLS_nonNullable(__VLS_388.slots);
            const __VLS_391 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
            /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
            // @ts-ignore
            const __VLS_392 = __VLS_asFunctionalComponent(__VLS_391, new __VLS_391({}));
            const __VLS_393 = __VLS_392({}, ...__VLS_functionalComponentArgsRest(__VLS_392));
            const __VLS_397 = __VLS_resolvedLocalAndGlobalComponents.upload;
            /** @type { [typeof __VLS_components.Upload, typeof __VLS_components.upload, ] } */
            // @ts-ignore
            const __VLS_398 = __VLS_asFunctionalComponent(__VLS_397, new __VLS_397({}));
            const __VLS_399 = __VLS_398({}, ...__VLS_functionalComponentArgsRest(__VLS_398));
            __VLS_nonNullable(__VLS_396.slots).default;
            var __VLS_396;
        }
    }
    (__VLS_ctx.importLoading ? '正在上传-校验-处理...' : '确认开始批量导入');
    var __VLS_388;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-center mt-1") }, });
    const __VLS_403 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_404 = __VLS_asFunctionalComponent(__VLS_403, new __VLS_403({ ...{ 'onClick': {} }, link: (true), type: ("primary"), ...{ class: ("download-link") }, }));
    const __VLS_405 = __VLS_404({ ...{ 'onClick': {} }, link: (true), type: ("primary"), ...{ class: ("download-link") }, }, ...__VLS_functionalComponentArgsRest(__VLS_404));
    let __VLS_409;
    const __VLS_410 = {
        onClick: (__VLS_ctx.fetchDownloadTemplate)
    };
    let __VLS_406;
    let __VLS_407;
    const __VLS_411 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
    /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
    // @ts-ignore
    const __VLS_412 = __VLS_asFunctionalComponent(__VLS_411, new __VLS_411({ ...{ class: ("mr-1") }, }));
    const __VLS_413 = __VLS_412({ ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_412));
    const __VLS_417 = __VLS_resolvedLocalAndGlobalComponents.document;
    /** @type { [typeof __VLS_components.Document, typeof __VLS_components.document, ] } */
    // @ts-ignore
    const __VLS_418 = __VLS_asFunctionalComponent(__VLS_417, new __VLS_417({}));
    const __VLS_419 = __VLS_418({}, ...__VLS_functionalComponentArgsRest(__VLS_418));
    __VLS_nonNullable(__VLS_416.slots).default;
    var __VLS_416;
    __VLS_nonNullable(__VLS_408.slots).default;
    var __VLS_408;
    __VLS_nonNullable(__VLS_243.slots).default;
    var __VLS_243;
    __VLS_styleScopedClasses['page-container'];
    __VLS_styleScopedClasses['main-card'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['mr-4'];
    __VLS_styleScopedClasses['ml-2'];
    __VLS_styleScopedClasses['header-actions'];
    __VLS_styleScopedClasses['search-form'];
    __VLS_styleScopedClasses['ml-2'];
    __VLS_styleScopedClasses['pagination-container'];
    __VLS_styleScopedClasses['mt-auto'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-end'];
    __VLS_styleScopedClasses['pt-4'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['mr-2'];
    __VLS_styleScopedClasses['mb-2'];
    __VLS_styleScopedClasses['text-gray-400'];
    __VLS_styleScopedClasses['text-sm'];
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
        "formRef": __VLS_185,
        "uploadRef": __VLS_268,
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
            fetchDownloadTemplate: fetchDownloadTemplate,
            UploadFilled: UploadFilled,
            LoadingIcon: LoadingIcon,
            Delete: Delete,
            Upload: Upload,
            Document: Document,
            InfoFilled: InfoFilled,
            Plus: Plus,
            loading: loading,
            tableData: tableData,
            total: total,
            page: page,
            pageSize: pageSize,
            selectedIds: selectedIds,
            searchForm: searchForm,
            currentSchoolName: currentSchoolName,
            currentClassName: currentClassName,
            isBatchDeleting: isBatchDeleting,
            dialogVisible: dialogVisible,
            isEdit: isEdit,
            boundParents: boundParents,
            submitLoading: submitLoading,
            formRef: formRef,
            form: form,
            rules: rules,
            importVisible: importVisible,
            importLoading: importLoading,
            fileList: fileList,
            uploadRef: uploadRef,
            handleSearch: handleSearch,
            resetSearch: resetSearch,
            handleSizeChange: handleSizeChange,
            handleCurrentChange: handleCurrentChange,
            handleSelectionChange: handleSelectionChange,
            handleBatchDelete: handleBatchDelete,
            handleAdd: handleAdd,
            handleEdit: handleEdit,
            handleDelete: handleDelete,
            submitForm: submitForm,
            handleOpenImport: handleOpenImport,
            handleFileChange: handleFileChange,
            handleRemove: handleRemove,
            handleContinueUpload: handleContinueUpload,
            submitImport: submitImport,
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