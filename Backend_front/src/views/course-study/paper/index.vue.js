/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, onMounted, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import { getPaperListApi, savePaperApi, deletePaperApi, getSubjectsApi, saveSubjectApi, deleteSubjectApi, uploadPaperApi, getTypeStatsApi, getGradeStatsApi, getSubjectStatsApi } from '@/api/course-study/paper';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const loading = ref(false);
const uploadLoading = ref(false);
const submitLoading = ref(false);
const currentLevel = ref(1);
const total = ref(0);
const paperList = ref([]);
const subjects = ref([]);
const typeData = ref([
    { id: 'FAMOUS', name: '名校试卷', count: 0 },
    { id: 'MONTHLY', name: '月考试卷', count: 0 },
    { id: 'JOINT', name: '联考试卷', count: 0 }
]);
const gradeData = ref([]);
const subjectData = ref([]);
const currentType = ref('');
const currentTypeName = ref('');
const currentGradeName = ref('');
const currentSubjectName = ref('');
const manualGrades = reactive({});
const typeMap = {
    FAMOUS: '名校试卷',
    MONTHLY: '月考试卷',
    JOINT: '联考试卷'
};
// 年级排序权重
const gradeWeightMap = {
    '一年级': 10, '小学一年级': 10,
    '二年级': 20, '小学二年级': 20,
    '三年级': 30, '小学三年级': 30,
    '四年级': 40, '小学四年级': 40,
    '五年级': 50, '小学五年级': 50,
    '六年级': 60, '小学六年级': 60,
    '初一': 70, '七年级': 70,
    '初二': 80, '八年级': 80,
    '初三': 90, '九年级': 90,
    '高一': 100,
    '高二': 110,
    '高三': 120
};
const getGradeWeight = (name) => {
    for (const key in gradeWeightMap) {
        if (name.includes(key))
            return gradeWeightMap[key];
    }
    return 999; // 未知年级排最后
};
// 排序函数
const sortGrades = (list) => {
    return list.sort((a, b) => getGradeWeight(a.name) - getGradeWeight(b.name));
};
const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    keyword: '',
    subject: '',
    grade: '',
    type: '',
    isRecommend: null
});
const dialog = reactive({
    title: '',
    visible: false
});
const form = ref({
    id: null,
    title: '',
    subject: '',
    grade: '',
    year: '',
    type: 'FAMOUS',
    tags: '',
    filePath: '',
    isRecommend: false,
    sortOrder: 1
});
const rules = {
    title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
    subject: [{ required: true, message: '请选择科目', trigger: 'change' }],
    type: [{ required: true, message: '请选择类型', trigger: 'change' }]
};
const paperFormRef = ref();
// 科目管理相关
const subjectDialog = reactive({
    visible: false
});
const subjectEditDialog = reactive({
    title: '',
    visible: false
});
const subjectForm = ref({
    id: null,
    name: '',
    icon: '',
    color: '#409EFF',
    sortOrder: 0
});
// 加载类型统计
const loadTypeStats = async () => {
    loading.value = true;
    try {
        const res = await getTypeStatsApi();
        if (res) {
            typeData.value = res;
        }
    }
    catch (error) {
        console.error('获取类型统计失败:', error);
    }
    finally {
        loading.value = false;
    }
};
// 进入年级管理
const enterGrade = async (row) => {
    currentType.value = row.id;
    currentTypeName.value = row.name;
    loading.value = true;
    try {
        const res = await getGradeStatsApi(row.id);
        let list = res || [];
        // 合并手动新增的年级
        const manual = manualGrades[currentType.value] || [];
        manual.forEach(name => {
            if (!list.find((g) => g.name === name)) {
                list.push({ name, count: 0 });
            }
        });
        gradeData.value = sortGrades(list);
        currentLevel.value = 2;
    }
    catch (error) {
        console.error('获取年级统计失败:', error);
    }
    finally {
        loading.value = false;
    }
};
// 进入科目管理
const enterSubject = async (row) => {
    currentGradeName.value = row.name;
    loading.value = true;
    try {
        const res = await getSubjectStatsApi(currentType.value, row.name);
        subjectData.value = res || [];
        currentLevel.value = 3;
    }
    catch (error) {
        console.error('获取科目统计失败:', error);
    }
    finally {
        loading.value = false;
    }
};
// 进入试卷列表
const enterPaperList = (row) => {
    currentSubjectName.value = row.name;
    queryParams.type = currentType.value;
    queryParams.grade = currentGradeName.value;
    queryParams.subject = currentSubjectName.value;
    queryParams.pageNum = 1;
    currentLevel.value = 4;
    getList();
};
// 获取列表数据
const getList = async () => {
    loading.value = true;
    try {
        const res = await getPaperListApi(queryParams);
        if (res) {
            paperList.value = res.records;
            total.value = res.total;
        }
    }
    finally {
        loading.value = false;
    }
};
// 搜索查询
const handleQuery = () => {
    queryParams.pageNum = 1;
    getList();
};
// 重置查询
const resetQuery = () => {
    queryParams.keyword = '';
    handleQuery();
};
// 状态切换
const handleStatusChange = async (row) => {
    try {
        await savePaperApi(row);
        ElMessage.success('操作成功');
    }
    catch (error) {
        row.isRecommend = !row.isRecommend;
    }
};
// 重置表单
const resetForm = () => {
    form.value = {
        id: null,
        title: '',
        subject: currentSubjectName.value || '',
        grade: currentGradeName.value || '',
        year: new Date().getFullYear().toString(),
        type: currentType.value || 'FAMOUS',
        tags: '',
        filePath: '',
        isRecommend: false,
        sortOrder: 1
    };
    if (paperFormRef.value) {
        paperFormRef.value.resetFields();
    }
};
// 新增按钮
const handleAdd = () => {
    resetForm();
    dialog.title = '新增试卷';
    dialog.visible = true;
};
// 编辑按钮
const handleEdit = (row) => {
    resetForm();
    form.value = { ...row };
    dialog.title = '编辑试卷';
    dialog.visible = true;
};
// 删除按钮
const handleDelete = (row) => {
    ElMessageBox.confirm('确定要删除该试卷吗？', '警告', {
        type: 'warning'
    }).then(async () => {
        await deletePaperApi(row.id);
        ElMessage.success('删除成功');
        getList();
    });
};
// 提交表单
const submitForm = async () => {
    paperFormRef.value.validate(async (valid) => {
        if (valid) {
            submitLoading.value = true;
            try {
                await savePaperApi(form.value);
                ElMessage.success('保存成功');
                dialog.visible = false;
                getList();
            }
            finally {
                submitLoading.value = false;
            }
        }
    });
};
// 上传相关
const beforeUpload = (file) => {
    const isLt50M = file.size / 1024 / 1024 < 50;
    if (!isLt50M) {
        ElMessage.error('上传文件大小不能超过 50MB!');
    }
    return isLt50M;
};
const handleUpload = async (options) => {
    const { file } = options;
    const formData = new FormData();
    formData.append('file', file);
    uploadLoading.value = true;
    try {
        const res = await uploadPaperApi(formData);
        if (res) {
            form.value.filePath = res;
            ElMessage.success('文件上传成功');
        }
    }
    catch (error) {
        ElMessage.error('上传失败');
    }
    finally {
        uploadLoading.value = false;
    }
};
// 科目管理
const handleSubjectManage = () => {
    subjectDialog.visible = true;
    loadSubjects();
};
const loadSubjects = async () => {
    const res = await getSubjectsApi();
    subjects.value = res || [];
};
const handleAddSubject = () => {
    subjectForm.value = {
        id: null,
        name: '',
        icon: '',
        color: '#409EFF',
        sortOrder: 0
    };
    subjectEditDialog.title = '新增科目';
    subjectEditDialog.visible = true;
};
const handleEditSubject = (row) => {
    subjectForm.value = { ...row };
    subjectEditDialog.title = '编辑科目';
    subjectEditDialog.visible = true;
};
const submitSubjectForm = async () => {
    await saveSubjectApi(subjectForm.value);
    ElMessage.success('保存成功');
    subjectEditDialog.visible = false;
    loadSubjects();
};
const handleDeleteSubject = (row) => {
    ElMessageBox.confirm('确定删除该科目吗？', '提示').then(async () => {
        await deleteSubjectApi(row.id);
        ElMessage.success('删除成功');
        loadSubjects();
    });
};
const handleAddNewGrade = () => {
    ElMessageBox.prompt('请输入年级名称（如：高三）', '新增年级', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
    }).then(({ value }) => {
        if (value) {
            if (!manualGrades[currentType.value]) {
                manualGrades[currentType.value] = [];
            }
            if (!manualGrades[currentType.value].includes(value)) {
                manualGrades[currentType.value].push(value);
            }
            enterGrade({ id: currentType.value, name: currentTypeName.value });
        }
    });
};
onMounted(() => {
    loadTypeStats();
    loadSubjects();
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("paper-manage") }, });
    if (__VLS_ctx.currentLevel === 1) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ shadow: ("never"), }));
        const __VLS_2 = __VLS_1({ shadow: ("never"), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { header: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("card-header") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("title") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("actions") }, });
            const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ ...{ 'onClick': {} }, type: ("success"), }));
            const __VLS_8 = __VLS_7({ ...{ 'onClick': {} }, type: ("success"), }, ...__VLS_functionalComponentArgsRest(__VLS_7));
            let __VLS_12;
            const __VLS_13 = {
                onClick: (__VLS_ctx.handleSubjectManage)
            };
            let __VLS_9;
            let __VLS_10;
            __VLS_nonNullable(__VLS_11.slots).default;
            var __VLS_11;
        }
        const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
        /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
        // @ts-ignore
        const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ data: ((__VLS_ctx.typeData)), border: (true), stripe: (true), }));
        const __VLS_16 = __VLS_15({ data: ((__VLS_ctx.typeData)), border: (true), stripe: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_15));
        __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.loading) }, null, null);
        const __VLS_20 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({ prop: ("id"), label: ("类型ID"), width: ("120"), align: ("center"), }));
        const __VLS_22 = __VLS_21({ prop: ("id"), label: ("类型ID"), width: ("120"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        const __VLS_26 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({ prop: ("name"), label: ("类型名称"), minWidth: ("150"), }));
        const __VLS_28 = __VLS_27({ prop: ("name"), label: ("类型名称"), minWidth: ("150"), }, ...__VLS_functionalComponentArgsRest(__VLS_27));
        const __VLS_32 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({ prop: ("count"), label: ("试卷数量"), width: ("120"), align: ("center"), }));
        const __VLS_34 = __VLS_33({ prop: ("count"), label: ("试卷数量"), width: ("120"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        const __VLS_38 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({ label: ("操作"), width: ("150"), align: ("center"), fixed: ("right"), }));
        const __VLS_40 = __VLS_39({ label: ("操作"), width: ("150"), align: ("center"), fixed: ("right"), }, ...__VLS_functionalComponentArgsRest(__VLS_39));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_43.slots);
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_44 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }));
            const __VLS_46 = __VLS_45({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_45));
            let __VLS_50;
            const __VLS_51 = {
                onClick: (...[$event]) => {
                    if (!((__VLS_ctx.currentLevel === 1)))
                        return;
                    __VLS_ctx.enterGrade(row);
                }
            };
            let __VLS_47;
            let __VLS_48;
            __VLS_nonNullable(__VLS_49.slots).default;
            var __VLS_49;
        }
        var __VLS_43;
        __VLS_nonNullable(__VLS_19.slots).default;
        var __VLS_19;
        var __VLS_5;
    }
    else if (__VLS_ctx.currentLevel === 2) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_52 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({ shadow: ("never"), }));
        const __VLS_54 = __VLS_53({ shadow: ("never"), }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { header: __VLS_thisSlot } = __VLS_nonNullable(__VLS_57.slots);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("card-header") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex items-center") }, });
            const __VLS_58 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({ ...{ 'onClick': {} }, link: (true), }));
            const __VLS_60 = __VLS_59({ ...{ 'onClick': {} }, link: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_59));
            let __VLS_64;
            const __VLS_65 = {
                onClick: (...[$event]) => {
                    if (!(!((__VLS_ctx.currentLevel === 1))))
                        return;
                    if (!((__VLS_ctx.currentLevel === 2)))
                        return;
                    __VLS_ctx.currentLevel = 1;
                }
            };
            let __VLS_61;
            let __VLS_62;
            const __VLS_66 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
            /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
            // @ts-ignore
            const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({}));
            const __VLS_68 = __VLS_67({}, ...__VLS_functionalComponentArgsRest(__VLS_67));
            const __VLS_72 = __VLS_resolvedLocalAndGlobalComponents.ArrowLeft;
            /** @type { [typeof __VLS_components.ArrowLeft, ] } */
            // @ts-ignore
            const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({}));
            const __VLS_74 = __VLS_73({}, ...__VLS_functionalComponentArgsRest(__VLS_73));
            __VLS_nonNullable(__VLS_71.slots).default;
            var __VLS_71;
            __VLS_nonNullable(__VLS_63.slots).default;
            var __VLS_63;
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("title ml-4") }, });
            (__VLS_ctx.currentTypeName);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("actions") }, });
            const __VLS_78 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({ ...{ 'onClick': {} }, type: ("primary"), }));
            const __VLS_80 = __VLS_79({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_79));
            let __VLS_84;
            const __VLS_85 = {
                onClick: (__VLS_ctx.handleAddNewGrade)
            };
            let __VLS_81;
            let __VLS_82;
            __VLS_nonNullable(__VLS_83.slots).default;
            var __VLS_83;
        }
        const __VLS_86 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
        /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
        // @ts-ignore
        const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({ data: ((__VLS_ctx.gradeData)), border: (true), stripe: (true), }));
        const __VLS_88 = __VLS_87({ data: ((__VLS_ctx.gradeData)), border: (true), stripe: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_87));
        __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.loading) }, null, null);
        const __VLS_92 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({ prop: ("name"), label: ("年级名称"), minWidth: ("150"), }));
        const __VLS_94 = __VLS_93({ prop: ("name"), label: ("年级名称"), minWidth: ("150"), }, ...__VLS_functionalComponentArgsRest(__VLS_93));
        const __VLS_98 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({ prop: ("count"), label: ("试卷数量"), width: ("120"), align: ("center"), }));
        const __VLS_100 = __VLS_99({ prop: ("count"), label: ("试卷数量"), width: ("120"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_99));
        const __VLS_104 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({ label: ("操作"), width: ("150"), align: ("center"), fixed: ("right"), }));
        const __VLS_106 = __VLS_105({ label: ("操作"), width: ("150"), align: ("center"), fixed: ("right"), }, ...__VLS_functionalComponentArgsRest(__VLS_105));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_109.slots);
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_110 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }));
            const __VLS_112 = __VLS_111({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_111));
            let __VLS_116;
            const __VLS_117 = {
                onClick: (...[$event]) => {
                    if (!(!((__VLS_ctx.currentLevel === 1))))
                        return;
                    if (!((__VLS_ctx.currentLevel === 2)))
                        return;
                    __VLS_ctx.enterSubject(row);
                }
            };
            let __VLS_113;
            let __VLS_114;
            __VLS_nonNullable(__VLS_115.slots).default;
            var __VLS_115;
        }
        var __VLS_109;
        __VLS_nonNullable(__VLS_91.slots).default;
        var __VLS_91;
        var __VLS_57;
    }
    else if (__VLS_ctx.currentLevel === 3) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_118 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
        // @ts-ignore
        const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({ shadow: ("never"), }));
        const __VLS_120 = __VLS_119({ shadow: ("never"), }, ...__VLS_functionalComponentArgsRest(__VLS_119));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { header: __VLS_thisSlot } = __VLS_nonNullable(__VLS_123.slots);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("card-header") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex items-center") }, });
            const __VLS_124 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({ ...{ 'onClick': {} }, link: (true), }));
            const __VLS_126 = __VLS_125({ ...{ 'onClick': {} }, link: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_125));
            let __VLS_130;
            const __VLS_131 = {
                onClick: (...[$event]) => {
                    if (!(!((__VLS_ctx.currentLevel === 1))))
                        return;
                    if (!(!((__VLS_ctx.currentLevel === 2))))
                        return;
                    if (!((__VLS_ctx.currentLevel === 3)))
                        return;
                    __VLS_ctx.currentLevel = 2;
                }
            };
            let __VLS_127;
            let __VLS_128;
            const __VLS_132 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
            /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
            // @ts-ignore
            const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({}));
            const __VLS_134 = __VLS_133({}, ...__VLS_functionalComponentArgsRest(__VLS_133));
            const __VLS_138 = __VLS_resolvedLocalAndGlobalComponents.ArrowLeft;
            /** @type { [typeof __VLS_components.ArrowLeft, ] } */
            // @ts-ignore
            const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({}));
            const __VLS_140 = __VLS_139({}, ...__VLS_functionalComponentArgsRest(__VLS_139));
            __VLS_nonNullable(__VLS_137.slots).default;
            var __VLS_137;
            __VLS_nonNullable(__VLS_129.slots).default;
            var __VLS_129;
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("title ml-4") }, });
            (__VLS_ctx.currentTypeName);
            (__VLS_ctx.currentGradeName);
        }
        const __VLS_144 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
        /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
        // @ts-ignore
        const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({ data: ((__VLS_ctx.subjectData)), border: (true), stripe: (true), }));
        const __VLS_146 = __VLS_145({ data: ((__VLS_ctx.subjectData)), border: (true), stripe: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_145));
        __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.loading) }, null, null);
        const __VLS_150 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_151 = __VLS_asFunctionalComponent(__VLS_150, new __VLS_150({ prop: ("name"), label: ("科目名称"), minWidth: ("150"), }));
        const __VLS_152 = __VLS_151({ prop: ("name"), label: ("科目名称"), minWidth: ("150"), }, ...__VLS_functionalComponentArgsRest(__VLS_151));
        const __VLS_156 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({ prop: ("count"), label: ("试卷数量"), width: ("120"), align: ("center"), }));
        const __VLS_158 = __VLS_157({ prop: ("count"), label: ("试卷数量"), width: ("120"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_157));
        const __VLS_162 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_163 = __VLS_asFunctionalComponent(__VLS_162, new __VLS_162({ label: ("操作"), width: ("150"), align: ("center"), fixed: ("right"), }));
        const __VLS_164 = __VLS_163({ label: ("操作"), width: ("150"), align: ("center"), fixed: ("right"), }, ...__VLS_functionalComponentArgsRest(__VLS_163));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_167.slots);
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_168 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }));
            const __VLS_170 = __VLS_169({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_169));
            let __VLS_174;
            const __VLS_175 = {
                onClick: (...[$event]) => {
                    if (!(!((__VLS_ctx.currentLevel === 1))))
                        return;
                    if (!(!((__VLS_ctx.currentLevel === 2))))
                        return;
                    if (!((__VLS_ctx.currentLevel === 3)))
                        return;
                    __VLS_ctx.enterPaperList(row);
                }
            };
            let __VLS_171;
            let __VLS_172;
            __VLS_nonNullable(__VLS_173.slots).default;
            var __VLS_173;
        }
        var __VLS_167;
        __VLS_nonNullable(__VLS_149.slots).default;
        var __VLS_149;
        var __VLS_123;
    }
    else if (__VLS_ctx.currentLevel === 4) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_176 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
        // @ts-ignore
        const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({ shadow: ("never"), }));
        const __VLS_178 = __VLS_177({ shadow: ("never"), }, ...__VLS_functionalComponentArgsRest(__VLS_177));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { header: __VLS_thisSlot } = __VLS_nonNullable(__VLS_181.slots);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("card-header") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex items-center") }, });
            const __VLS_182 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_183 = __VLS_asFunctionalComponent(__VLS_182, new __VLS_182({ ...{ 'onClick': {} }, link: (true), }));
            const __VLS_184 = __VLS_183({ ...{ 'onClick': {} }, link: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_183));
            let __VLS_188;
            const __VLS_189 = {
                onClick: (...[$event]) => {
                    if (!(!((__VLS_ctx.currentLevel === 1))))
                        return;
                    if (!(!((__VLS_ctx.currentLevel === 2))))
                        return;
                    if (!(!((__VLS_ctx.currentLevel === 3))))
                        return;
                    if (!((__VLS_ctx.currentLevel === 4)))
                        return;
                    __VLS_ctx.currentLevel = 3;
                }
            };
            let __VLS_185;
            let __VLS_186;
            const __VLS_190 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
            /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
            // @ts-ignore
            const __VLS_191 = __VLS_asFunctionalComponent(__VLS_190, new __VLS_190({}));
            const __VLS_192 = __VLS_191({}, ...__VLS_functionalComponentArgsRest(__VLS_191));
            const __VLS_196 = __VLS_resolvedLocalAndGlobalComponents.ArrowLeft;
            /** @type { [typeof __VLS_components.ArrowLeft, ] } */
            // @ts-ignore
            const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({}));
            const __VLS_198 = __VLS_197({}, ...__VLS_functionalComponentArgsRest(__VLS_197));
            __VLS_nonNullable(__VLS_195.slots).default;
            var __VLS_195;
            __VLS_nonNullable(__VLS_187.slots).default;
            var __VLS_187;
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("title ml-4") }, });
            (__VLS_ctx.currentTypeName);
            (__VLS_ctx.currentGradeName);
            (__VLS_ctx.currentSubjectName);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("actions") }, });
            const __VLS_202 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_203 = __VLS_asFunctionalComponent(__VLS_202, new __VLS_202({ ...{ 'onClick': {} }, type: ("primary"), }));
            const __VLS_204 = __VLS_203({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_203));
            let __VLS_208;
            const __VLS_209 = {
                onClick: (__VLS_ctx.handleAdd)
            };
            let __VLS_205;
            let __VLS_206;
            __VLS_nonNullable(__VLS_207.slots).default;
            var __VLS_207;
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("search-bar") }, });
        const __VLS_210 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
        /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */
        // @ts-ignore
        const __VLS_211 = __VLS_asFunctionalComponent(__VLS_210, new __VLS_210({ inline: ((true)), model: ((__VLS_ctx.queryParams)), }));
        const __VLS_212 = __VLS_211({ inline: ((true)), model: ((__VLS_ctx.queryParams)), }, ...__VLS_functionalComponentArgsRest(__VLS_211));
        const __VLS_216 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
        // @ts-ignore
        const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({ label: ("关键词"), }));
        const __VLS_218 = __VLS_217({ label: ("关键词"), }, ...__VLS_functionalComponentArgsRest(__VLS_217));
        const __VLS_222 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
        // @ts-ignore
        const __VLS_223 = __VLS_asFunctionalComponent(__VLS_222, new __VLS_222({ ...{ 'onClear': {} }, modelValue: ((__VLS_ctx.queryParams.keyword)), placeholder: ("搜索标题"), clearable: (true), }));
        const __VLS_224 = __VLS_223({ ...{ 'onClear': {} }, modelValue: ((__VLS_ctx.queryParams.keyword)), placeholder: ("搜索标题"), clearable: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_223));
        let __VLS_228;
        const __VLS_229 = {
            onClear: (__VLS_ctx.handleQuery)
        };
        let __VLS_225;
        let __VLS_226;
        var __VLS_227;
        __VLS_nonNullable(__VLS_221.slots).default;
        var __VLS_221;
        const __VLS_230 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
        // @ts-ignore
        const __VLS_231 = __VLS_asFunctionalComponent(__VLS_230, new __VLS_230({}));
        const __VLS_232 = __VLS_231({}, ...__VLS_functionalComponentArgsRest(__VLS_231));
        const __VLS_236 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_238 = __VLS_237({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_237));
        let __VLS_242;
        const __VLS_243 = {
            onClick: (__VLS_ctx.handleQuery)
        };
        let __VLS_239;
        let __VLS_240;
        __VLS_nonNullable(__VLS_241.slots).default;
        var __VLS_241;
        const __VLS_244 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({ ...{ 'onClick': {} }, }));
        const __VLS_246 = __VLS_245({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_245));
        let __VLS_250;
        const __VLS_251 = {
            onClick: (__VLS_ctx.resetQuery)
        };
        let __VLS_247;
        let __VLS_248;
        __VLS_nonNullable(__VLS_249.slots).default;
        var __VLS_249;
        __VLS_nonNullable(__VLS_235.slots).default;
        var __VLS_235;
        __VLS_nonNullable(__VLS_215.slots).default;
        var __VLS_215;
        const __VLS_252 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
        /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
        // @ts-ignore
        const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({ data: ((__VLS_ctx.paperList)), border: (true), stripe: (true), }));
        const __VLS_254 = __VLS_253({ data: ((__VLS_ctx.paperList)), border: (true), stripe: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_253));
        __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.loading) }, null, null);
        const __VLS_258 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_259 = __VLS_asFunctionalComponent(__VLS_258, new __VLS_258({ prop: ("sortOrder"), label: ("排序"), width: ("80"), align: ("center"), }));
        const __VLS_260 = __VLS_259({ prop: ("sortOrder"), label: ("排序"), width: ("80"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_259));
        const __VLS_264 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({ prop: ("title"), label: ("试卷标题"), minWidth: ("250"), showOverflowTooltip: (true), }));
        const __VLS_266 = __VLS_265({ prop: ("title"), label: ("试卷标题"), minWidth: ("250"), showOverflowTooltip: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_265));
        const __VLS_270 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_271 = __VLS_asFunctionalComponent(__VLS_270, new __VLS_270({ prop: ("year"), label: ("年份"), width: ("100"), align: ("center"), }));
        const __VLS_272 = __VLS_271({ prop: ("year"), label: ("年份"), width: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_271));
        const __VLS_276 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({ prop: ("downloads"), label: ("下载量"), width: ("100"), align: ("center"), }));
        const __VLS_278 = __VLS_277({ prop: ("downloads"), label: ("下载量"), width: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_277));
        const __VLS_282 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_283 = __VLS_asFunctionalComponent(__VLS_282, new __VLS_282({ prop: ("isRecommend"), label: ("推荐"), width: ("80"), align: ("center"), }));
        const __VLS_284 = __VLS_283({ prop: ("isRecommend"), label: ("推荐"), width: ("80"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_283));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_287.slots);
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_288 = __VLS_resolvedLocalAndGlobalComponents.ElSwitch;
            /** @type { [typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ] } */
            // @ts-ignore
            const __VLS_289 = __VLS_asFunctionalComponent(__VLS_288, new __VLS_288({ ...{ 'onChange': {} }, modelValue: ((row.isRecommend)), }));
            const __VLS_290 = __VLS_289({ ...{ 'onChange': {} }, modelValue: ((row.isRecommend)), }, ...__VLS_functionalComponentArgsRest(__VLS_289));
            let __VLS_294;
            const __VLS_295 = {
                onChange: (...[$event]) => {
                    if (!(!((__VLS_ctx.currentLevel === 1))))
                        return;
                    if (!(!((__VLS_ctx.currentLevel === 2))))
                        return;
                    if (!(!((__VLS_ctx.currentLevel === 3))))
                        return;
                    if (!((__VLS_ctx.currentLevel === 4)))
                        return;
                    __VLS_ctx.handleStatusChange(row);
                }
            };
            let __VLS_291;
            let __VLS_292;
            var __VLS_293;
        }
        var __VLS_287;
        const __VLS_296 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_297 = __VLS_asFunctionalComponent(__VLS_296, new __VLS_296({ label: ("操作"), width: ("150"), align: ("center"), fixed: ("right"), }));
        const __VLS_298 = __VLS_297({ label: ("操作"), width: ("150"), align: ("center"), fixed: ("right"), }, ...__VLS_functionalComponentArgsRest(__VLS_297));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_301.slots);
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_302 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_303 = __VLS_asFunctionalComponent(__VLS_302, new __VLS_302({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }));
            const __VLS_304 = __VLS_303({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_303));
            let __VLS_308;
            const __VLS_309 = {
                onClick: (...[$event]) => {
                    if (!(!((__VLS_ctx.currentLevel === 1))))
                        return;
                    if (!(!((__VLS_ctx.currentLevel === 2))))
                        return;
                    if (!(!((__VLS_ctx.currentLevel === 3))))
                        return;
                    if (!((__VLS_ctx.currentLevel === 4)))
                        return;
                    __VLS_ctx.handleEdit(row);
                }
            };
            let __VLS_305;
            let __VLS_306;
            __VLS_nonNullable(__VLS_307.slots).default;
            var __VLS_307;
            const __VLS_310 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_311 = __VLS_asFunctionalComponent(__VLS_310, new __VLS_310({ ...{ 'onClick': {} }, link: (true), type: ("danger"), }));
            const __VLS_312 = __VLS_311({ ...{ 'onClick': {} }, link: (true), type: ("danger"), }, ...__VLS_functionalComponentArgsRest(__VLS_311));
            let __VLS_316;
            const __VLS_317 = {
                onClick: (...[$event]) => {
                    if (!(!((__VLS_ctx.currentLevel === 1))))
                        return;
                    if (!(!((__VLS_ctx.currentLevel === 2))))
                        return;
                    if (!(!((__VLS_ctx.currentLevel === 3))))
                        return;
                    if (!((__VLS_ctx.currentLevel === 4)))
                        return;
                    __VLS_ctx.handleDelete(row);
                }
            };
            let __VLS_313;
            let __VLS_314;
            __VLS_nonNullable(__VLS_315.slots).default;
            var __VLS_315;
        }
        var __VLS_301;
        __VLS_nonNullable(__VLS_257.slots).default;
        var __VLS_257;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("pagination-container") }, });
        const __VLS_318 = __VLS_resolvedLocalAndGlobalComponents.ElPagination;
        /** @type { [typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ] } */
        // @ts-ignore
        const __VLS_319 = __VLS_asFunctionalComponent(__VLS_318, new __VLS_318({ ...{ 'onSizeChange': {} }, ...{ 'onCurrentChange': {} }, currentPage: ((__VLS_ctx.queryParams.pageNum)), pageSize: ((__VLS_ctx.queryParams.pageSize)), total: ((__VLS_ctx.total)), layout: ("total, sizes, prev, pager, next, jumper"), }));
        const __VLS_320 = __VLS_319({ ...{ 'onSizeChange': {} }, ...{ 'onCurrentChange': {} }, currentPage: ((__VLS_ctx.queryParams.pageNum)), pageSize: ((__VLS_ctx.queryParams.pageSize)), total: ((__VLS_ctx.total)), layout: ("total, sizes, prev, pager, next, jumper"), }, ...__VLS_functionalComponentArgsRest(__VLS_319));
        let __VLS_324;
        const __VLS_325 = {
            onSizeChange: (__VLS_ctx.getList)
        };
        const __VLS_326 = {
            onCurrentChange: (__VLS_ctx.getList)
        };
        let __VLS_321;
        let __VLS_322;
        var __VLS_323;
        var __VLS_181;
    }
    const __VLS_327 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */
    // @ts-ignore
    const __VLS_328 = __VLS_asFunctionalComponent(__VLS_327, new __VLS_327({ title: ((__VLS_ctx.dialog.title)), modelValue: ((__VLS_ctx.dialog.visible)), width: ("600px"), appendToBody: (true), }));
    const __VLS_329 = __VLS_328({ title: ((__VLS_ctx.dialog.title)), modelValue: ((__VLS_ctx.dialog.visible)), width: ("600px"), appendToBody: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_328));
    const __VLS_333 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */
    // @ts-ignore
    const __VLS_334 = __VLS_asFunctionalComponent(__VLS_333, new __VLS_333({ ref: ("paperFormRef"), model: ((__VLS_ctx.form)), rules: ((__VLS_ctx.rules)), labelWidth: ("100px"), }));
    const __VLS_335 = __VLS_334({ ref: ("paperFormRef"), model: ((__VLS_ctx.form)), rules: ((__VLS_ctx.rules)), labelWidth: ("100px"), }, ...__VLS_functionalComponentArgsRest(__VLS_334));
    // @ts-ignore navigation for `const paperFormRef = ref()`
    __VLS_ctx.paperFormRef;
    var __VLS_339 = {};
    const __VLS_340 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_341 = __VLS_asFunctionalComponent(__VLS_340, new __VLS_340({ label: ("试卷标题"), prop: ("title"), }));
    const __VLS_342 = __VLS_341({ label: ("试卷标题"), prop: ("title"), }, ...__VLS_functionalComponentArgsRest(__VLS_341));
    const __VLS_346 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_347 = __VLS_asFunctionalComponent(__VLS_346, new __VLS_346({ modelValue: ((__VLS_ctx.form.title)), placeholder: ("请输入试卷标题"), }));
    const __VLS_348 = __VLS_347({ modelValue: ((__VLS_ctx.form.title)), placeholder: ("请输入试卷标题"), }, ...__VLS_functionalComponentArgsRest(__VLS_347));
    __VLS_nonNullable(__VLS_345.slots).default;
    var __VLS_345;
    const __VLS_352 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */
    // @ts-ignore
    const __VLS_353 = __VLS_asFunctionalComponent(__VLS_352, new __VLS_352({ gutter: ((20)), }));
    const __VLS_354 = __VLS_353({ gutter: ((20)), }, ...__VLS_functionalComponentArgsRest(__VLS_353));
    const __VLS_358 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_359 = __VLS_asFunctionalComponent(__VLS_358, new __VLS_358({ span: ((12)), }));
    const __VLS_360 = __VLS_359({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_359));
    const __VLS_364 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_365 = __VLS_asFunctionalComponent(__VLS_364, new __VLS_364({ label: ("科目"), prop: ("subject"), }));
    const __VLS_366 = __VLS_365({ label: ("科目"), prop: ("subject"), }, ...__VLS_functionalComponentArgsRest(__VLS_365));
    const __VLS_370 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
    /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */
    // @ts-ignore
    const __VLS_371 = __VLS_asFunctionalComponent(__VLS_370, new __VLS_370({ modelValue: ((__VLS_ctx.form.subject)), placeholder: ("选择科目"), ...{ style: ({}) }, }));
    const __VLS_372 = __VLS_371({ modelValue: ((__VLS_ctx.form.subject)), placeholder: ("选择科目"), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_371));
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.subjects))) {
        const __VLS_376 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
        /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
        // @ts-ignore
        const __VLS_377 = __VLS_asFunctionalComponent(__VLS_376, new __VLS_376({ key: ((item.id)), label: ((item.name)), value: ((item.name)), }));
        const __VLS_378 = __VLS_377({ key: ((item.id)), label: ((item.name)), value: ((item.name)), }, ...__VLS_functionalComponentArgsRest(__VLS_377));
    }
    __VLS_nonNullable(__VLS_375.slots).default;
    var __VLS_375;
    __VLS_nonNullable(__VLS_369.slots).default;
    var __VLS_369;
    __VLS_nonNullable(__VLS_363.slots).default;
    var __VLS_363;
    const __VLS_382 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_383 = __VLS_asFunctionalComponent(__VLS_382, new __VLS_382({ span: ((12)), }));
    const __VLS_384 = __VLS_383({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_383));
    const __VLS_388 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_389 = __VLS_asFunctionalComponent(__VLS_388, new __VLS_388({ label: ("年级"), prop: ("grade"), }));
    const __VLS_390 = __VLS_389({ label: ("年级"), prop: ("grade"), }, ...__VLS_functionalComponentArgsRest(__VLS_389));
    const __VLS_394 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_395 = __VLS_asFunctionalComponent(__VLS_394, new __VLS_394({ modelValue: ((__VLS_ctx.form.grade)), placeholder: ("如：高三"), }));
    const __VLS_396 = __VLS_395({ modelValue: ((__VLS_ctx.form.grade)), placeholder: ("如：高三"), }, ...__VLS_functionalComponentArgsRest(__VLS_395));
    __VLS_nonNullable(__VLS_393.slots).default;
    var __VLS_393;
    __VLS_nonNullable(__VLS_387.slots).default;
    var __VLS_387;
    __VLS_nonNullable(__VLS_357.slots).default;
    var __VLS_357;
    const __VLS_400 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */
    // @ts-ignore
    const __VLS_401 = __VLS_asFunctionalComponent(__VLS_400, new __VLS_400({ gutter: ((20)), }));
    const __VLS_402 = __VLS_401({ gutter: ((20)), }, ...__VLS_functionalComponentArgsRest(__VLS_401));
    const __VLS_406 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_407 = __VLS_asFunctionalComponent(__VLS_406, new __VLS_406({ span: ((12)), }));
    const __VLS_408 = __VLS_407({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_407));
    const __VLS_412 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_413 = __VLS_asFunctionalComponent(__VLS_412, new __VLS_412({ label: ("年份"), prop: ("year"), }));
    const __VLS_414 = __VLS_413({ label: ("年份"), prop: ("year"), }, ...__VLS_functionalComponentArgsRest(__VLS_413));
    const __VLS_418 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_419 = __VLS_asFunctionalComponent(__VLS_418, new __VLS_418({ modelValue: ((__VLS_ctx.form.year)), placeholder: ("如：2024"), }));
    const __VLS_420 = __VLS_419({ modelValue: ((__VLS_ctx.form.year)), placeholder: ("如：2024"), }, ...__VLS_functionalComponentArgsRest(__VLS_419));
    __VLS_nonNullable(__VLS_417.slots).default;
    var __VLS_417;
    __VLS_nonNullable(__VLS_411.slots).default;
    var __VLS_411;
    const __VLS_424 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_425 = __VLS_asFunctionalComponent(__VLS_424, new __VLS_424({ span: ((12)), }));
    const __VLS_426 = __VLS_425({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_425));
    const __VLS_430 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_431 = __VLS_asFunctionalComponent(__VLS_430, new __VLS_430({ label: ("试卷类型"), prop: ("type"), }));
    const __VLS_432 = __VLS_431({ label: ("试卷类型"), prop: ("type"), }, ...__VLS_functionalComponentArgsRest(__VLS_431));
    const __VLS_436 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
    /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */
    // @ts-ignore
    const __VLS_437 = __VLS_asFunctionalComponent(__VLS_436, new __VLS_436({ modelValue: ((__VLS_ctx.form.type)), placeholder: ("选择类型"), ...{ style: ({}) }, }));
    const __VLS_438 = __VLS_437({ modelValue: ((__VLS_ctx.form.type)), placeholder: ("选择类型"), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_437));
    const __VLS_442 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
    // @ts-ignore
    const __VLS_443 = __VLS_asFunctionalComponent(__VLS_442, new __VLS_442({ label: ("名校试卷"), value: ("FAMOUS"), }));
    const __VLS_444 = __VLS_443({ label: ("名校试卷"), value: ("FAMOUS"), }, ...__VLS_functionalComponentArgsRest(__VLS_443));
    const __VLS_448 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
    // @ts-ignore
    const __VLS_449 = __VLS_asFunctionalComponent(__VLS_448, new __VLS_448({ label: ("月考试卷"), value: ("MONTHLY"), }));
    const __VLS_450 = __VLS_449({ label: ("月考试卷"), value: ("MONTHLY"), }, ...__VLS_functionalComponentArgsRest(__VLS_449));
    const __VLS_454 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
    // @ts-ignore
    const __VLS_455 = __VLS_asFunctionalComponent(__VLS_454, new __VLS_454({ label: ("联考试卷"), value: ("JOINT"), }));
    const __VLS_456 = __VLS_455({ label: ("联考试卷"), value: ("JOINT"), }, ...__VLS_functionalComponentArgsRest(__VLS_455));
    __VLS_nonNullable(__VLS_441.slots).default;
    var __VLS_441;
    __VLS_nonNullable(__VLS_435.slots).default;
    var __VLS_435;
    __VLS_nonNullable(__VLS_429.slots).default;
    var __VLS_429;
    __VLS_nonNullable(__VLS_405.slots).default;
    var __VLS_405;
    const __VLS_460 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_461 = __VLS_asFunctionalComponent(__VLS_460, new __VLS_460({ label: ("排序号"), prop: ("sortOrder"), }));
    const __VLS_462 = __VLS_461({ label: ("排序号"), prop: ("sortOrder"), }, ...__VLS_functionalComponentArgsRest(__VLS_461));
    const __VLS_466 = __VLS_resolvedLocalAndGlobalComponents.ElInputNumber;
    /** @type { [typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ] } */
    // @ts-ignore
    const __VLS_467 = __VLS_asFunctionalComponent(__VLS_466, new __VLS_466({ modelValue: ((__VLS_ctx.form.sortOrder)), min: ((1)), }));
    const __VLS_468 = __VLS_467({ modelValue: ((__VLS_ctx.form.sortOrder)), min: ((1)), }, ...__VLS_functionalComponentArgsRest(__VLS_467));
    __VLS_nonNullable(__VLS_465.slots).default;
    var __VLS_465;
    const __VLS_472 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_473 = __VLS_asFunctionalComponent(__VLS_472, new __VLS_472({ label: ("文件路径"), prop: ("filePath"), }));
    const __VLS_474 = __VLS_473({ label: ("文件路径"), prop: ("filePath"), }, ...__VLS_functionalComponentArgsRest(__VLS_473));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ style: ({}) }, });
    const __VLS_478 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_479 = __VLS_asFunctionalComponent(__VLS_478, new __VLS_478({ modelValue: ((__VLS_ctx.form.filePath)), placeholder: ("上传 PDF/Word 或输入路径"), }));
    const __VLS_480 = __VLS_479({ modelValue: ((__VLS_ctx.form.filePath)), placeholder: ("上传 PDF/Word 或输入路径"), }, ...__VLS_functionalComponentArgsRest(__VLS_479));
    const __VLS_484 = __VLS_resolvedLocalAndGlobalComponents.ElUpload;
    /** @type { [typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ] } */
    // @ts-ignore
    const __VLS_485 = __VLS_asFunctionalComponent(__VLS_484, new __VLS_484({ action: (""), showFileList: ((false)), httpRequest: ((__VLS_ctx.handleUpload)), beforeUpload: ((__VLS_ctx.beforeUpload)), disabled: ((__VLS_ctx.uploadLoading)), }));
    const __VLS_486 = __VLS_485({ action: (""), showFileList: ((false)), httpRequest: ((__VLS_ctx.handleUpload)), beforeUpload: ((__VLS_ctx.beforeUpload)), disabled: ((__VLS_ctx.uploadLoading)), }, ...__VLS_functionalComponentArgsRest(__VLS_485));
    const __VLS_490 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_491 = __VLS_asFunctionalComponent(__VLS_490, new __VLS_490({ type: ("primary"), loading: ((__VLS_ctx.uploadLoading)), }));
    const __VLS_492 = __VLS_491({ type: ("primary"), loading: ((__VLS_ctx.uploadLoading)), }, ...__VLS_functionalComponentArgsRest(__VLS_491));
    __VLS_nonNullable(__VLS_495.slots).default;
    var __VLS_495;
    __VLS_nonNullable(__VLS_489.slots).default;
    var __VLS_489;
    __VLS_nonNullable(__VLS_477.slots).default;
    var __VLS_477;
    const __VLS_496 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_497 = __VLS_asFunctionalComponent(__VLS_496, new __VLS_496({ label: ("标签"), prop: ("tags"), }));
    const __VLS_498 = __VLS_497({ label: ("标签"), prop: ("tags"), }, ...__VLS_functionalComponentArgsRest(__VLS_497));
    const __VLS_502 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_503 = __VLS_asFunctionalComponent(__VLS_502, new __VLS_502({ modelValue: ((__VLS_ctx.form.tags)), placeholder: ("多个标签用逗号分隔，如：真题,重点,解析"), }));
    const __VLS_504 = __VLS_503({ modelValue: ((__VLS_ctx.form.tags)), placeholder: ("多个标签用逗号分隔，如：真题,重点,解析"), }, ...__VLS_functionalComponentArgsRest(__VLS_503));
    __VLS_nonNullable(__VLS_501.slots).default;
    var __VLS_501;
    const __VLS_508 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_509 = __VLS_asFunctionalComponent(__VLS_508, new __VLS_508({ label: ("是否推荐"), }));
    const __VLS_510 = __VLS_509({ label: ("是否推荐"), }, ...__VLS_functionalComponentArgsRest(__VLS_509));
    const __VLS_514 = __VLS_resolvedLocalAndGlobalComponents.ElRadioGroup;
    /** @type { [typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ] } */
    // @ts-ignore
    const __VLS_515 = __VLS_asFunctionalComponent(__VLS_514, new __VLS_514({ modelValue: ((__VLS_ctx.form.isRecommend)), }));
    const __VLS_516 = __VLS_515({ modelValue: ((__VLS_ctx.form.isRecommend)), }, ...__VLS_functionalComponentArgsRest(__VLS_515));
    const __VLS_520 = __VLS_resolvedLocalAndGlobalComponents.ElRadio;
    /** @type { [typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ] } */
    // @ts-ignore
    const __VLS_521 = __VLS_asFunctionalComponent(__VLS_520, new __VLS_520({ label: ((true)), }));
    const __VLS_522 = __VLS_521({ label: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_521));
    __VLS_nonNullable(__VLS_525.slots).default;
    var __VLS_525;
    const __VLS_526 = __VLS_resolvedLocalAndGlobalComponents.ElRadio;
    /** @type { [typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ] } */
    // @ts-ignore
    const __VLS_527 = __VLS_asFunctionalComponent(__VLS_526, new __VLS_526({ label: ((false)), }));
    const __VLS_528 = __VLS_527({ label: ((false)), }, ...__VLS_functionalComponentArgsRest(__VLS_527));
    __VLS_nonNullable(__VLS_531.slots).default;
    var __VLS_531;
    __VLS_nonNullable(__VLS_519.slots).default;
    var __VLS_519;
    __VLS_nonNullable(__VLS_513.slots).default;
    var __VLS_513;
    __VLS_nonNullable(__VLS_338.slots).default;
    var __VLS_338;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_332.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("dialog-footer") }, });
        const __VLS_532 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_533 = __VLS_asFunctionalComponent(__VLS_532, new __VLS_532({ ...{ 'onClick': {} }, }));
        const __VLS_534 = __VLS_533({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_533));
        let __VLS_538;
        const __VLS_539 = {
            onClick: (...[$event]) => {
                __VLS_ctx.dialog.visible = false;
            }
        };
        let __VLS_535;
        let __VLS_536;
        __VLS_nonNullable(__VLS_537.slots).default;
        var __VLS_537;
        const __VLS_540 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_541 = __VLS_asFunctionalComponent(__VLS_540, new __VLS_540({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.submitLoading)), }));
        const __VLS_542 = __VLS_541({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.submitLoading)), }, ...__VLS_functionalComponentArgsRest(__VLS_541));
        let __VLS_546;
        const __VLS_547 = {
            onClick: (__VLS_ctx.submitForm)
        };
        let __VLS_543;
        let __VLS_544;
        __VLS_nonNullable(__VLS_545.slots).default;
        var __VLS_545;
    }
    var __VLS_332;
    const __VLS_548 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */
    // @ts-ignore
    const __VLS_549 = __VLS_asFunctionalComponent(__VLS_548, new __VLS_548({ title: ("科目管理"), modelValue: ((__VLS_ctx.subjectDialog.visible)), width: ("700px"), }));
    const __VLS_550 = __VLS_549({ title: ("科目管理"), modelValue: ((__VLS_ctx.subjectDialog.visible)), width: ("700px"), }, ...__VLS_functionalComponentArgsRest(__VLS_549));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ style: ({}) }, });
    const __VLS_554 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_555 = __VLS_asFunctionalComponent(__VLS_554, new __VLS_554({ ...{ 'onClick': {} }, type: ("primary"), size: ("small"), }));
    const __VLS_556 = __VLS_555({ ...{ 'onClick': {} }, type: ("primary"), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_555));
    let __VLS_560;
    const __VLS_561 = {
        onClick: (__VLS_ctx.handleAddSubject)
    };
    let __VLS_557;
    let __VLS_558;
    __VLS_nonNullable(__VLS_559.slots).default;
    var __VLS_559;
    const __VLS_562 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
    // @ts-ignore
    const __VLS_563 = __VLS_asFunctionalComponent(__VLS_562, new __VLS_562({ data: ((__VLS_ctx.subjects)), border: (true), size: ("small"), }));
    const __VLS_564 = __VLS_563({ data: ((__VLS_ctx.subjects)), border: (true), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_563));
    const __VLS_568 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_569 = __VLS_asFunctionalComponent(__VLS_568, new __VLS_568({ prop: ("name"), label: ("科目名称"), }));
    const __VLS_570 = __VLS_569({ prop: ("name"), label: ("科目名称"), }, ...__VLS_functionalComponentArgsRest(__VLS_569));
    const __VLS_574 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_575 = __VLS_asFunctionalComponent(__VLS_574, new __VLS_574({ prop: ("icon"), label: ("图标"), }));
    const __VLS_576 = __VLS_575({ prop: ("icon"), label: ("图标"), }, ...__VLS_functionalComponentArgsRest(__VLS_575));
    const __VLS_580 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_581 = __VLS_asFunctionalComponent(__VLS_580, new __VLS_580({ prop: ("color"), label: ("颜色"), }));
    const __VLS_582 = __VLS_581({ prop: ("color"), label: ("颜色"), }, ...__VLS_functionalComponentArgsRest(__VLS_581));
    const __VLS_586 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_587 = __VLS_asFunctionalComponent(__VLS_586, new __VLS_586({ prop: ("sortOrder"), label: ("排序"), width: ("80"), align: ("center"), }));
    const __VLS_588 = __VLS_587({ prop: ("sortOrder"), label: ("排序"), width: ("80"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_587));
    const __VLS_592 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_593 = __VLS_asFunctionalComponent(__VLS_592, new __VLS_592({ label: ("操作"), width: ("120"), align: ("center"), }));
    const __VLS_594 = __VLS_593({ label: ("操作"), width: ("120"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_593));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_597.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_598 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_599 = __VLS_asFunctionalComponent(__VLS_598, new __VLS_598({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }));
        const __VLS_600 = __VLS_599({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_599));
        let __VLS_604;
        const __VLS_605 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleEditSubject(row);
            }
        };
        let __VLS_601;
        let __VLS_602;
        __VLS_nonNullable(__VLS_603.slots).default;
        var __VLS_603;
        const __VLS_606 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_607 = __VLS_asFunctionalComponent(__VLS_606, new __VLS_606({ ...{ 'onClick': {} }, link: (true), type: ("danger"), }));
        const __VLS_608 = __VLS_607({ ...{ 'onClick': {} }, link: (true), type: ("danger"), }, ...__VLS_functionalComponentArgsRest(__VLS_607));
        let __VLS_612;
        const __VLS_613 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleDeleteSubject(row);
            }
        };
        let __VLS_609;
        let __VLS_610;
        __VLS_nonNullable(__VLS_611.slots).default;
        var __VLS_611;
    }
    var __VLS_597;
    __VLS_nonNullable(__VLS_567.slots).default;
    var __VLS_567;
    __VLS_nonNullable(__VLS_553.slots).default;
    var __VLS_553;
    const __VLS_614 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */
    // @ts-ignore
    const __VLS_615 = __VLS_asFunctionalComponent(__VLS_614, new __VLS_614({ title: ((__VLS_ctx.subjectEditDialog.title)), modelValue: ((__VLS_ctx.subjectEditDialog.visible)), width: ("400px"), appendToBody: (true), }));
    const __VLS_616 = __VLS_615({ title: ((__VLS_ctx.subjectEditDialog.title)), modelValue: ((__VLS_ctx.subjectEditDialog.visible)), width: ("400px"), appendToBody: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_615));
    const __VLS_620 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */
    // @ts-ignore
    const __VLS_621 = __VLS_asFunctionalComponent(__VLS_620, new __VLS_620({ model: ((__VLS_ctx.subjectForm)), labelWidth: ("80px"), }));
    const __VLS_622 = __VLS_621({ model: ((__VLS_ctx.subjectForm)), labelWidth: ("80px"), }, ...__VLS_functionalComponentArgsRest(__VLS_621));
    const __VLS_626 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_627 = __VLS_asFunctionalComponent(__VLS_626, new __VLS_626({ label: ("科目名称"), }));
    const __VLS_628 = __VLS_627({ label: ("科目名称"), }, ...__VLS_functionalComponentArgsRest(__VLS_627));
    const __VLS_632 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_633 = __VLS_asFunctionalComponent(__VLS_632, new __VLS_632({ modelValue: ((__VLS_ctx.subjectForm.name)), }));
    const __VLS_634 = __VLS_633({ modelValue: ((__VLS_ctx.subjectForm.name)), }, ...__VLS_functionalComponentArgsRest(__VLS_633));
    __VLS_nonNullable(__VLS_631.slots).default;
    var __VLS_631;
    const __VLS_638 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_639 = __VLS_asFunctionalComponent(__VLS_638, new __VLS_638({ label: ("图标"), }));
    const __VLS_640 = __VLS_639({ label: ("图标"), }, ...__VLS_functionalComponentArgsRest(__VLS_639));
    const __VLS_644 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_645 = __VLS_asFunctionalComponent(__VLS_644, new __VLS_644({ modelValue: ((__VLS_ctx.subjectForm.icon)), placeholder: ("图标名称"), }));
    const __VLS_646 = __VLS_645({ modelValue: ((__VLS_ctx.subjectForm.icon)), placeholder: ("图标名称"), }, ...__VLS_functionalComponentArgsRest(__VLS_645));
    __VLS_nonNullable(__VLS_643.slots).default;
    var __VLS_643;
    const __VLS_650 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_651 = __VLS_asFunctionalComponent(__VLS_650, new __VLS_650({ label: ("颜色"), }));
    const __VLS_652 = __VLS_651({ label: ("颜色"), }, ...__VLS_functionalComponentArgsRest(__VLS_651));
    const __VLS_656 = __VLS_resolvedLocalAndGlobalComponents.ElColorPicker;
    /** @type { [typeof __VLS_components.ElColorPicker, typeof __VLS_components.elColorPicker, ] } */
    // @ts-ignore
    const __VLS_657 = __VLS_asFunctionalComponent(__VLS_656, new __VLS_656({ modelValue: ((__VLS_ctx.subjectForm.color)), }));
    const __VLS_658 = __VLS_657({ modelValue: ((__VLS_ctx.subjectForm.color)), }, ...__VLS_functionalComponentArgsRest(__VLS_657));
    __VLS_nonNullable(__VLS_655.slots).default;
    var __VLS_655;
    const __VLS_662 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_663 = __VLS_asFunctionalComponent(__VLS_662, new __VLS_662({ label: ("排序"), }));
    const __VLS_664 = __VLS_663({ label: ("排序"), }, ...__VLS_functionalComponentArgsRest(__VLS_663));
    const __VLS_668 = __VLS_resolvedLocalAndGlobalComponents.ElInputNumber;
    /** @type { [typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ] } */
    // @ts-ignore
    const __VLS_669 = __VLS_asFunctionalComponent(__VLS_668, new __VLS_668({ modelValue: ((__VLS_ctx.subjectForm.sortOrder)), min: ((0)), }));
    const __VLS_670 = __VLS_669({ modelValue: ((__VLS_ctx.subjectForm.sortOrder)), min: ((0)), }, ...__VLS_functionalComponentArgsRest(__VLS_669));
    __VLS_nonNullable(__VLS_667.slots).default;
    var __VLS_667;
    __VLS_nonNullable(__VLS_625.slots).default;
    var __VLS_625;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_619.slots);
        const __VLS_674 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_675 = __VLS_asFunctionalComponent(__VLS_674, new __VLS_674({ ...{ 'onClick': {} }, }));
        const __VLS_676 = __VLS_675({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_675));
        let __VLS_680;
        const __VLS_681 = {
            onClick: (...[$event]) => {
                __VLS_ctx.subjectEditDialog.visible = false;
            }
        };
        let __VLS_677;
        let __VLS_678;
        __VLS_nonNullable(__VLS_679.slots).default;
        var __VLS_679;
        const __VLS_682 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_683 = __VLS_asFunctionalComponent(__VLS_682, new __VLS_682({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_684 = __VLS_683({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_683));
        let __VLS_688;
        const __VLS_689 = {
            onClick: (__VLS_ctx.submitSubjectForm)
        };
        let __VLS_685;
        let __VLS_686;
        __VLS_nonNullable(__VLS_687.slots).default;
        var __VLS_687;
    }
    var __VLS_619;
    __VLS_styleScopedClasses['paper-manage'];
    __VLS_styleScopedClasses['card-header'];
    __VLS_styleScopedClasses['title'];
    __VLS_styleScopedClasses['actions'];
    __VLS_styleScopedClasses['card-header'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['title'];
    __VLS_styleScopedClasses['ml-4'];
    __VLS_styleScopedClasses['actions'];
    __VLS_styleScopedClasses['card-header'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['title'];
    __VLS_styleScopedClasses['ml-4'];
    __VLS_styleScopedClasses['card-header'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['title'];
    __VLS_styleScopedClasses['ml-4'];
    __VLS_styleScopedClasses['actions'];
    __VLS_styleScopedClasses['search-bar'];
    __VLS_styleScopedClasses['pagination-container'];
    __VLS_styleScopedClasses['dialog-footer'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "paperFormRef": __VLS_339,
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
            ArrowLeft: ArrowLeft,
            loading: loading,
            uploadLoading: uploadLoading,
            submitLoading: submitLoading,
            currentLevel: currentLevel,
            total: total,
            paperList: paperList,
            subjects: subjects,
            typeData: typeData,
            gradeData: gradeData,
            subjectData: subjectData,
            currentTypeName: currentTypeName,
            currentGradeName: currentGradeName,
            currentSubjectName: currentSubjectName,
            queryParams: queryParams,
            dialog: dialog,
            form: form,
            rules: rules,
            paperFormRef: paperFormRef,
            subjectDialog: subjectDialog,
            subjectEditDialog: subjectEditDialog,
            subjectForm: subjectForm,
            enterGrade: enterGrade,
            enterSubject: enterSubject,
            enterPaperList: enterPaperList,
            getList: getList,
            handleQuery: handleQuery,
            resetQuery: resetQuery,
            handleStatusChange: handleStatusChange,
            handleAdd: handleAdd,
            handleEdit: handleEdit,
            handleDelete: handleDelete,
            submitForm: submitForm,
            beforeUpload: beforeUpload,
            handleUpload: handleUpload,
            handleSubjectManage: handleSubjectManage,
            handleAddSubject: handleAddSubject,
            handleEditSubject: handleEditSubject,
            submitSubjectForm: submitSubjectForm,
            handleDeleteSubject: handleDeleteSubject,
            handleAddNewGrade: handleAddNewGrade,
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