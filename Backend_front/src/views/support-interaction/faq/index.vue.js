/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, onMounted } from 'vue';
import { fetchGetFaqList, fetchGetFaqCategories, fetchAddFaq, fetchUpdateFaq, fetchDeleteFaq, fetchAddFaqCategory, fetchGetFaqCategoryList, fetchUpdateFaqCategory, fetchDeleteFaqCategory } from '@/api/support-interaction/index';
import { ElMessage, ElMessageBox } from 'element-plus';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'FaqManage' });
const loading = ref(false);
const tableData = ref([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref();
const categoryOptions = ref([]);
const filterCategory = ref('');
const searchKeyword = ref('');
// 分类管理相关
const categoryDialogVisible = ref(false);
const categoryList = ref([]);
const originalCategories = new Map(); // 用于取消编辑时还原数据
const handleManageCategory = async () => {
    categoryDialogVisible.value = true;
    await loadCategoryList();
};
const loadCategoryList = async () => {
    try {
        const res = await fetchGetFaqCategoryList();
        if (res && Array.isArray(res)) {
            categoryList.value = res.map((item) => ({
                ...item,
                isEdit: false
            }));
        }
    }
    catch (error) {
        console.error('获取模块列表失败', error);
    }
};
const handleAddCategory = () => {
    categoryList.value.push({
        id: null,
        name: '',
        sort: 0,
        status: 1,
        isEdit: true
    });
};
const saveCategory = async (row) => {
    if (!row.name) {
        ElMessage.warning('模块名称不能为空');
        return;
    }
    try {
        const api = row.id ? fetchUpdateFaqCategory : fetchAddFaqCategory;
        await api(row);
        ElMessage.success(row.id ? '更新成功' : '新增成功');
        await loadCategoryList();
        fetchCategories(); // 更新主页面的下拉选项
    }
    catch (error) { }
};
const cancelEditCategory = (row, index) => {
    if (!row.id) {
        categoryList.value.splice(index, 1);
    }
    else {
        row.isEdit = false;
        loadCategoryList(); // 简单处理：直接重新加载
    }
};
const handleDeleteCategory = (row) => {
    ElMessageBox.confirm(`确定要删除模块 "${row.name}" 吗?`, '提示', {
        type: 'warning'
    }).then(async () => {
        try {
            await fetchDeleteFaqCategory(row.id);
            ElMessage.success('删除成功');
            await loadCategoryList();
            fetchCategories();
        }
        catch (error) { }
    }).catch(() => { });
};
const form = ref({
    id: '',
    categoryName: '',
    question: '',
    answer: '',
    status: 1
});
const rules = {
    categoryName: [{ required: true, message: '请输入或选择模块名称', trigger: 'blur' }],
    question: [{ required: true, message: '请输入问题', trigger: 'blur' }],
    answer: [{ required: true, message: '请输入解答内容', trigger: 'blur' }]
};
const loadData = async () => {
    loading.value = true;
    try {
        const res = await fetchGetFaqList({
            current: 1,
            size: 50,
            categoryName: filterCategory.value || undefined,
            question: searchKeyword.value || undefined
        });
        if (res && res.records) {
            tableData.value = res.records;
        }
        // 获取分类
        fetchCategories();
    }
    catch (error) {
        console.error(error);
    }
    loading.value = false;
};
const fetchCategories = async () => {
    try {
        const catRes = await fetchGetFaqCategories();
        // 由于后端接口 Result.success 会被 axios 拦截器处理为直接返回 data 部分
        // catRes 此时已经是 List<String> 数组了
        if (catRes && Array.isArray(catRes)) {
            categoryOptions.value = catRes;
        }
    }
    catch (error) {
        console.error('获取分类失败', error);
    }
};
const handleAdd = () => {
    isEdit.value = false;
    form.value = { id: '', categoryName: '', question: '', answer: '', status: 1 };
    dialogVisible.value = true;
};
const handleEdit = (row) => {
    isEdit.value = true;
    form.value = { ...row };
    dialogVisible.value = true;
};
const handleDelete = (row) => {
    ElMessageBox.confirm('确定要删除该 FAQ 吗?', '提示', {
        type: 'warning'
    }).then(async () => {
        try {
            await fetchDeleteFaq(row.id);
            ElMessage.success('删除成功');
            loadData();
        }
        catch (error) { }
    }).catch(() => { });
};
const submit = async () => {
    await formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                const api = isEdit.value ? fetchUpdateFaq : fetchAddFaq;
                await api(form.value);
                ElMessage.success(isEdit.value ? '更新成功' : '添加成功');
                dialogVisible.value = false;
                loadData();
            }
            catch (error) { }
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
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("page-container p-5") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-card p-5 rounded-xl bg-white shadow-sm") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-between items-center mb-5") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex items-center space-x-4") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("font-bold text-lg text-g-800") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
    /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onChange': {} }, modelValue: ((__VLS_ctx.filterCategory)), placeholder: ("按模块筛选"), clearable: (true), ...{ style: ({}) }, }));
    const __VLS_2 = __VLS_1({ ...{ 'onChange': {} }, modelValue: ((__VLS_ctx.filterCategory)), placeholder: ("按模块筛选"), clearable: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_6;
    const __VLS_7 = {
        onChange: (__VLS_ctx.loadData)
    };
    let __VLS_3;
    let __VLS_4;
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.categoryOptions))) {
        const __VLS_8 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
        /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({ key: ((item)), label: ((item)), value: ((item)), }));
        const __VLS_10 = __VLS_9({ key: ((item)), label: ((item)), value: ((item)), }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    }
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ ...{ 'onKeyup': {} }, ...{ 'onClear': {} }, modelValue: ((__VLS_ctx.searchKeyword)), placeholder: ("搜索问题关键词"), clearable: (true), ...{ style: ({}) }, }));
    const __VLS_16 = __VLS_15({ ...{ 'onKeyup': {} }, ...{ 'onClear': {} }, modelValue: ((__VLS_ctx.searchKeyword)), placeholder: ("搜索问题关键词"), clearable: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    let __VLS_20;
    const __VLS_21 = {
        onKeyup: (__VLS_ctx.loadData)
    };
    const __VLS_22 = {
        onClear: (__VLS_ctx.loadData)
    };
    let __VLS_17;
    let __VLS_18;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { prefix: __VLS_thisSlot } = __VLS_nonNullable(__VLS_19.slots);
        const __VLS_23 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_24 = __VLS_asFunctionalComponent(__VLS_23, new __VLS_23({ icon: ("ri:search-line"), }));
        const __VLS_25 = __VLS_24({ icon: ("ri:search-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_24));
    }
    var __VLS_19;
    const __VLS_29 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({ ...{ 'onClick': {} }, type: ("primary"), }));
    const __VLS_31 = __VLS_30({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_30));
    let __VLS_35;
    const __VLS_36 = {
        onClick: (__VLS_ctx.loadData)
    };
    let __VLS_32;
    let __VLS_33;
    __VLS_nonNullable(__VLS_34.slots).default;
    var __VLS_34;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex items-center space-x-2") }, });
    const __VLS_37 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({ ...{ 'onClick': {} }, }));
    const __VLS_39 = __VLS_38({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    let __VLS_43;
    const __VLS_44 = {
        onClick: (__VLS_ctx.handleManageCategory)
    };
    let __VLS_40;
    let __VLS_41;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { icon: __VLS_thisSlot } = __VLS_nonNullable(__VLS_42.slots);
        const __VLS_45 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({ icon: ("ri:settings-4-line"), }));
        const __VLS_47 = __VLS_46({ icon: ("ri:settings-4-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    }
    var __VLS_42;
    const __VLS_51 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({ ...{ 'onClick': {} }, type: ("primary"), }));
    const __VLS_53 = __VLS_52({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_52));
    let __VLS_57;
    const __VLS_58 = {
        onClick: (__VLS_ctx.handleAdd)
    };
    let __VLS_54;
    let __VLS_55;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { icon: __VLS_thisSlot } = __VLS_nonNullable(__VLS_56.slots);
        const __VLS_59 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({ icon: ("ri:add-line"), }));
        const __VLS_61 = __VLS_60({ icon: ("ri:add-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_60));
    }
    var __VLS_56;
    const __VLS_65 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
    // @ts-ignore
    const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({ data: ((__VLS_ctx.tableData)), border: (true), }));
    const __VLS_67 = __VLS_66({ data: ((__VLS_ctx.tableData)), border: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_66));
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.loading) }, null, null);
    const __VLS_71 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({ prop: ("categoryName"), label: ("所属模块"), width: ("120"), }));
    const __VLS_73 = __VLS_72({ prop: ("categoryName"), label: ("所属模块"), width: ("120"), }, ...__VLS_functionalComponentArgsRest(__VLS_72));
    const __VLS_77 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({ prop: ("question"), label: ("常见问题"), minWidth: ("200"), showOverflowTooltip: (true), }));
    const __VLS_79 = __VLS_78({ prop: ("question"), label: ("常见问题"), minWidth: ("200"), showOverflowTooltip: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_78));
    const __VLS_83 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({ prop: ("answer"), label: ("解答内容"), minWidth: ("300"), showOverflowTooltip: (true), }));
    const __VLS_85 = __VLS_84({ prop: ("answer"), label: ("解答内容"), minWidth: ("300"), showOverflowTooltip: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_84));
    const __VLS_89 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({ label: ("状态"), width: ("100"), }));
    const __VLS_91 = __VLS_90({ label: ("状态"), width: ("100"), }, ...__VLS_functionalComponentArgsRest(__VLS_90));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_94.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_95 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
        /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
        // @ts-ignore
        const __VLS_96 = __VLS_asFunctionalComponent(__VLS_95, new __VLS_95({ type: ((row.status === 1 ? 'success' : 'info')), }));
        const __VLS_97 = __VLS_96({ type: ((row.status === 1 ? 'success' : 'info')), }, ...__VLS_functionalComponentArgsRest(__VLS_96));
        (row.status === 1 ? '已启用' : '已禁用');
        __VLS_nonNullable(__VLS_100.slots).default;
        var __VLS_100;
    }
    var __VLS_94;
    const __VLS_101 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({ prop: ("createTime"), label: ("创建时间"), width: ("180"), }));
    const __VLS_103 = __VLS_102({ prop: ("createTime"), label: ("创建时间"), width: ("180"), }, ...__VLS_functionalComponentArgsRest(__VLS_102));
    const __VLS_107 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_108 = __VLS_asFunctionalComponent(__VLS_107, new __VLS_107({ label: ("操作"), width: ("180"), fixed: ("right"), }));
    const __VLS_109 = __VLS_108({ label: ("操作"), width: ("180"), fixed: ("right"), }, ...__VLS_functionalComponentArgsRest(__VLS_108));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_112.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_113 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }));
        const __VLS_115 = __VLS_114({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_114));
        let __VLS_119;
        const __VLS_120 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleEdit(row);
            }
        };
        let __VLS_116;
        let __VLS_117;
        __VLS_nonNullable(__VLS_118.slots).default;
        var __VLS_118;
        const __VLS_121 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({ ...{ 'onClick': {} }, link: (true), type: ("danger"), }));
        const __VLS_123 = __VLS_122({ ...{ 'onClick': {} }, link: (true), type: ("danger"), }, ...__VLS_functionalComponentArgsRest(__VLS_122));
        let __VLS_127;
        const __VLS_128 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleDelete(row);
            }
        };
        let __VLS_124;
        let __VLS_125;
        __VLS_nonNullable(__VLS_126.slots).default;
        var __VLS_126;
    }
    var __VLS_112;
    __VLS_nonNullable(__VLS_70.slots).default;
    var __VLS_70;
    const __VLS_129 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */
    // @ts-ignore
    const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({ modelValue: ((__VLS_ctx.dialogVisible)), title: ((__VLS_ctx.isEdit ? '编辑 FAQ' : '新增 FAQ')), width: ("600px"), }));
    const __VLS_131 = __VLS_130({ modelValue: ((__VLS_ctx.dialogVisible)), title: ((__VLS_ctx.isEdit ? '编辑 FAQ' : '新增 FAQ')), width: ("600px"), }, ...__VLS_functionalComponentArgsRest(__VLS_130));
    const __VLS_135 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */
    // @ts-ignore
    const __VLS_136 = __VLS_asFunctionalComponent(__VLS_135, new __VLS_135({ model: ((__VLS_ctx.form)), labelWidth: ("80px"), rules: ((__VLS_ctx.rules)), ref: ("formRef"), }));
    const __VLS_137 = __VLS_136({ model: ((__VLS_ctx.form)), labelWidth: ("80px"), rules: ((__VLS_ctx.rules)), ref: ("formRef"), }, ...__VLS_functionalComponentArgsRest(__VLS_136));
    // @ts-ignore navigation for `const formRef = ref()`
    __VLS_ctx.formRef;
    var __VLS_141 = {};
    const __VLS_142 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_143 = __VLS_asFunctionalComponent(__VLS_142, new __VLS_142({ label: ("所属模块"), prop: ("categoryName"), }));
    const __VLS_144 = __VLS_143({ label: ("所属模块"), prop: ("categoryName"), }, ...__VLS_functionalComponentArgsRest(__VLS_143));
    const __VLS_148 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
    /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */
    // @ts-ignore
    const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({ modelValue: ((__VLS_ctx.form.categoryName)), filterable: (true), allowCreate: (true), defaultFirstOption: (true), placeholder: ("请选择或输入新模块名称"), ...{ style: ({}) }, }));
    const __VLS_150 = __VLS_149({ modelValue: ((__VLS_ctx.form.categoryName)), filterable: (true), allowCreate: (true), defaultFirstOption: (true), placeholder: ("请选择或输入新模块名称"), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_149));
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.categoryOptions))) {
        const __VLS_154 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
        /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
        // @ts-ignore
        const __VLS_155 = __VLS_asFunctionalComponent(__VLS_154, new __VLS_154({ key: ((item)), label: ((item)), value: ((item)), }));
        const __VLS_156 = __VLS_155({ key: ((item)), label: ((item)), value: ((item)), }, ...__VLS_functionalComponentArgsRest(__VLS_155));
    }
    __VLS_nonNullable(__VLS_153.slots).default;
    var __VLS_153;
    __VLS_nonNullable(__VLS_147.slots).default;
    var __VLS_147;
    const __VLS_160 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({ label: ("问题"), prop: ("question"), }));
    const __VLS_162 = __VLS_161({ label: ("问题"), prop: ("question"), }, ...__VLS_functionalComponentArgsRest(__VLS_161));
    const __VLS_166 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_167 = __VLS_asFunctionalComponent(__VLS_166, new __VLS_166({ modelValue: ((__VLS_ctx.form.question)), placeholder: ("请输入常见问题描述"), }));
    const __VLS_168 = __VLS_167({ modelValue: ((__VLS_ctx.form.question)), placeholder: ("请输入常见问题描述"), }, ...__VLS_functionalComponentArgsRest(__VLS_167));
    __VLS_nonNullable(__VLS_165.slots).default;
    var __VLS_165;
    const __VLS_172 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({ label: ("解答"), prop: ("answer"), }));
    const __VLS_174 = __VLS_173({ label: ("解答"), prop: ("answer"), }, ...__VLS_functionalComponentArgsRest(__VLS_173));
    const __VLS_178 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_179 = __VLS_asFunctionalComponent(__VLS_178, new __VLS_178({ modelValue: ((__VLS_ctx.form.answer)), type: ("textarea"), rows: ((4)), placeholder: ("请输入详细的解答内容"), }));
    const __VLS_180 = __VLS_179({ modelValue: ((__VLS_ctx.form.answer)), type: ("textarea"), rows: ((4)), placeholder: ("请输入详细的解答内容"), }, ...__VLS_functionalComponentArgsRest(__VLS_179));
    __VLS_nonNullable(__VLS_177.slots).default;
    var __VLS_177;
    const __VLS_184 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({ label: ("状态"), }));
    const __VLS_186 = __VLS_185({ label: ("状态"), }, ...__VLS_functionalComponentArgsRest(__VLS_185));
    const __VLS_190 = __VLS_resolvedLocalAndGlobalComponents.ElSwitch;
    /** @type { [typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ] } */
    // @ts-ignore
    const __VLS_191 = __VLS_asFunctionalComponent(__VLS_190, new __VLS_190({ modelValue: ((__VLS_ctx.form.status)), activeValue: ((1)), inactiveValue: ((0)), activeText: ("启用"), inactiveText: ("禁用"), }));
    const __VLS_192 = __VLS_191({ modelValue: ((__VLS_ctx.form.status)), activeValue: ((1)), inactiveValue: ((0)), activeText: ("启用"), inactiveText: ("禁用"), }, ...__VLS_functionalComponentArgsRest(__VLS_191));
    __VLS_nonNullable(__VLS_189.slots).default;
    var __VLS_189;
    __VLS_nonNullable(__VLS_140.slots).default;
    var __VLS_140;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_134.slots);
        const __VLS_196 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({ ...{ 'onClick': {} }, }));
        const __VLS_198 = __VLS_197({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_197));
        let __VLS_202;
        const __VLS_203 = {
            onClick: (...[$event]) => {
                __VLS_ctx.dialogVisible = false;
            }
        };
        let __VLS_199;
        let __VLS_200;
        __VLS_nonNullable(__VLS_201.slots).default;
        var __VLS_201;
        const __VLS_204 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_206 = __VLS_205({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_205));
        let __VLS_210;
        const __VLS_211 = {
            onClick: (__VLS_ctx.submit)
        };
        let __VLS_207;
        let __VLS_208;
        __VLS_nonNullable(__VLS_209.slots).default;
        var __VLS_209;
    }
    var __VLS_134;
    const __VLS_212 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */
    // @ts-ignore
    const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({ modelValue: ((__VLS_ctx.categoryDialogVisible)), title: ("模块管理"), width: ("700px"), }));
    const __VLS_214 = __VLS_213({ modelValue: ((__VLS_ctx.categoryDialogVisible)), title: ("模块管理"), width: ("700px"), }, ...__VLS_functionalComponentArgsRest(__VLS_213));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mb-4 flex justify-end") }, });
    const __VLS_218 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_219 = __VLS_asFunctionalComponent(__VLS_218, new __VLS_218({ ...{ 'onClick': {} }, type: ("primary"), size: ("small"), }));
    const __VLS_220 = __VLS_219({ ...{ 'onClick': {} }, type: ("primary"), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_219));
    let __VLS_224;
    const __VLS_225 = {
        onClick: (__VLS_ctx.handleAddCategory)
    };
    let __VLS_221;
    let __VLS_222;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { icon: __VLS_thisSlot } = __VLS_nonNullable(__VLS_223.slots);
        const __VLS_226 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_227 = __VLS_asFunctionalComponent(__VLS_226, new __VLS_226({ icon: ("ri:add-line"), }));
        const __VLS_228 = __VLS_227({ icon: ("ri:add-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_227));
    }
    var __VLS_223;
    const __VLS_232 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
    // @ts-ignore
    const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({ data: ((__VLS_ctx.categoryList)), border: (true), size: ("small"), }));
    const __VLS_234 = __VLS_233({ data: ((__VLS_ctx.categoryList)), border: (true), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_233));
    const __VLS_238 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_239 = __VLS_asFunctionalComponent(__VLS_238, new __VLS_238({ label: ("模块名称"), minWidth: ("150"), }));
    const __VLS_240 = __VLS_239({ label: ("模块名称"), minWidth: ("150"), }, ...__VLS_functionalComponentArgsRest(__VLS_239));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_243.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        if (row.isEdit) {
            const __VLS_244 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
            /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
            // @ts-ignore
            const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({ modelValue: ((row.name)), size: ("small"), ...{ style: ({}) }, }));
            const __VLS_246 = __VLS_245({ modelValue: ((row.name)), size: ("small"), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_245));
        }
        else {
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (row.name);
        }
    }
    var __VLS_243;
    const __VLS_250 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_251 = __VLS_asFunctionalComponent(__VLS_250, new __VLS_250({ label: ("排序"), width: ("120"), }));
    const __VLS_252 = __VLS_251({ label: ("排序"), width: ("120"), }, ...__VLS_functionalComponentArgsRest(__VLS_251));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_255.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        if (row.isEdit) {
            const __VLS_256 = __VLS_resolvedLocalAndGlobalComponents.ElInputNumber;
            /** @type { [typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ] } */
            // @ts-ignore
            const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({ modelValue: ((row.sort)), min: ((0)), size: ("small"), controlsPosition: ("right"), ...{ style: ({}) }, }));
            const __VLS_258 = __VLS_257({ modelValue: ((row.sort)), min: ((0)), size: ("small"), controlsPosition: ("right"), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_257));
        }
        else {
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (row.sort);
        }
    }
    var __VLS_255;
    const __VLS_262 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_263 = __VLS_asFunctionalComponent(__VLS_262, new __VLS_262({ label: ("状态"), width: ("100"), }));
    const __VLS_264 = __VLS_263({ label: ("状态"), width: ("100"), }, ...__VLS_functionalComponentArgsRest(__VLS_263));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_267.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        if (row.isEdit) {
            const __VLS_268 = __VLS_resolvedLocalAndGlobalComponents.ElSwitch;
            /** @type { [typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ] } */
            // @ts-ignore
            const __VLS_269 = __VLS_asFunctionalComponent(__VLS_268, new __VLS_268({ modelValue: ((row.status)), activeValue: ((1)), inactiveValue: ((0)), size: ("small"), }));
            const __VLS_270 = __VLS_269({ modelValue: ((row.status)), activeValue: ((1)), inactiveValue: ((0)), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_269));
        }
        else {
            const __VLS_274 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
            /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
            // @ts-ignore
            const __VLS_275 = __VLS_asFunctionalComponent(__VLS_274, new __VLS_274({ type: ((row.status === 1 ? 'success' : 'info')), size: ("small"), }));
            const __VLS_276 = __VLS_275({ type: ((row.status === 1 ? 'success' : 'info')), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_275));
            (row.status === 1 ? '启用' : '禁用');
            __VLS_nonNullable(__VLS_279.slots).default;
            var __VLS_279;
        }
    }
    var __VLS_267;
    const __VLS_280 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_281 = __VLS_asFunctionalComponent(__VLS_280, new __VLS_280({ label: ("操作"), width: ("150"), fixed: ("right"), }));
    const __VLS_282 = __VLS_281({ label: ("操作"), width: ("150"), fixed: ("right"), }, ...__VLS_functionalComponentArgsRest(__VLS_281));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_285.slots);
        const [{ row, $index }] = __VLS_getSlotParams(__VLS_thisSlot);
        if (row.isEdit) {
            const __VLS_286 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_287 = __VLS_asFunctionalComponent(__VLS_286, new __VLS_286({ ...{ 'onClick': {} }, link: (true), type: ("primary"), size: ("small"), }));
            const __VLS_288 = __VLS_287({ ...{ 'onClick': {} }, link: (true), type: ("primary"), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_287));
            let __VLS_292;
            const __VLS_293 = {
                onClick: (...[$event]) => {
                    if (!((row.isEdit)))
                        return;
                    __VLS_ctx.saveCategory(row);
                }
            };
            let __VLS_289;
            let __VLS_290;
            __VLS_nonNullable(__VLS_291.slots).default;
            var __VLS_291;
            const __VLS_294 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_295 = __VLS_asFunctionalComponent(__VLS_294, new __VLS_294({ ...{ 'onClick': {} }, link: (true), size: ("small"), }));
            const __VLS_296 = __VLS_295({ ...{ 'onClick': {} }, link: (true), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_295));
            let __VLS_300;
            const __VLS_301 = {
                onClick: (...[$event]) => {
                    if (!((row.isEdit)))
                        return;
                    __VLS_ctx.cancelEditCategory(row, $index);
                }
            };
            let __VLS_297;
            let __VLS_298;
            __VLS_nonNullable(__VLS_299.slots).default;
            var __VLS_299;
        }
        else {
            const __VLS_302 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_303 = __VLS_asFunctionalComponent(__VLS_302, new __VLS_302({ ...{ 'onClick': {} }, link: (true), type: ("primary"), size: ("small"), }));
            const __VLS_304 = __VLS_303({ ...{ 'onClick': {} }, link: (true), type: ("primary"), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_303));
            let __VLS_308;
            const __VLS_309 = {
                onClick: (...[$event]) => {
                    if (!(!((row.isEdit))))
                        return;
                    row.isEdit = true;
                }
            };
            let __VLS_305;
            let __VLS_306;
            __VLS_nonNullable(__VLS_307.slots).default;
            var __VLS_307;
            const __VLS_310 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_311 = __VLS_asFunctionalComponent(__VLS_310, new __VLS_310({ ...{ 'onClick': {} }, link: (true), type: ("danger"), size: ("small"), }));
            const __VLS_312 = __VLS_311({ ...{ 'onClick': {} }, link: (true), type: ("danger"), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_311));
            let __VLS_316;
            const __VLS_317 = {
                onClick: (...[$event]) => {
                    if (!(!((row.isEdit))))
                        return;
                    __VLS_ctx.handleDeleteCategory(row);
                }
            };
            let __VLS_313;
            let __VLS_314;
            __VLS_nonNullable(__VLS_315.slots).default;
            var __VLS_315;
        }
    }
    var __VLS_285;
    __VLS_nonNullable(__VLS_237.slots).default;
    var __VLS_237;
    __VLS_nonNullable(__VLS_217.slots).default;
    var __VLS_217;
    __VLS_styleScopedClasses['page-container'];
    __VLS_styleScopedClasses['p-5'];
    __VLS_styleScopedClasses['art-card'];
    __VLS_styleScopedClasses['p-5'];
    __VLS_styleScopedClasses['rounded-xl'];
    __VLS_styleScopedClasses['bg-white'];
    __VLS_styleScopedClasses['shadow-sm'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['mb-5'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['space-x-4'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['text-lg'];
    __VLS_styleScopedClasses['text-g-800'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['space-x-2'];
    __VLS_styleScopedClasses['mb-4'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-end'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "formRef": __VLS_141,
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
            loading: loading,
            tableData: tableData,
            dialogVisible: dialogVisible,
            isEdit: isEdit,
            formRef: formRef,
            categoryOptions: categoryOptions,
            filterCategory: filterCategory,
            searchKeyword: searchKeyword,
            categoryDialogVisible: categoryDialogVisible,
            categoryList: categoryList,
            handleManageCategory: handleManageCategory,
            handleAddCategory: handleAddCategory,
            saveCategory: saveCategory,
            cancelEditCategory: cancelEditCategory,
            handleDeleteCategory: handleDeleteCategory,
            form: form,
            rules: rules,
            loadData: loadData,
            handleAdd: handleAdd,
            handleEdit: handleEdit,
            handleDelete: handleDelete,
            submit: submit,
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