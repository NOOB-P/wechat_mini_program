/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const router = useRouter();
const route = useRoute();
const className = ref(route.query.className || '未指定班级');
const projectId = ref(route.query.projectId);
const loading = ref(false);
const tableData = ref([
    { id: '1', subjectName: '语文', paperUrl: 'xxx', answerUrl: 'yyy', scoreUploaded: true },
    { id: '2', subjectName: '数学', paperUrl: '', answerUrl: '', scoreUploaded: false },
    { id: '3', subjectName: '英语', paperUrl: 'zzz', answerUrl: '', scoreUploaded: false }
]);
const subjectOptions = ['语文', '数学', '英语', '物理', '化学', '生物', '政治', '历史', '地理'];
const dialogVisible = ref(false);
const formRef = ref();
const form = ref({
    subjectName: ''
});
const rules = {
    subjectName: [{ required: true, message: '请选择科目', trigger: 'change' }]
};
const goBack = () => {
    router.push({
        name: 'ExamClass',
        query: { projectId: projectId.value }
    });
};
const handleAddSubject = () => {
    form.value.subjectName = '';
    dialogVisible.value = true;
};
const handleUpload = (row, type, file) => {
    const typeMap = {
        paper: '试卷',
        answer: '答案',
        score: '小题得分'
    };
    ElMessage.success(`[${row.subjectName}] ${typeMap[type]}上传成功: ${file.name}`);
};
const handleDelete = (row) => {
    ElMessageBox.confirm(`确定要删除科目 [${row.subjectName}] 吗？`, '警告', {
        type: 'warning'
    }).then(() => {
        ElMessage.success('删除成功');
    });
};
const submitForm = async () => {
    if (!formRef.value)
        return;
    await formRef.value.validate((valid) => {
        if (valid) {
            ElMessage.success('添加成功');
            dialogVisible.value = false;
        }
    });
}; /* PartiallyEnd: #3632/scriptSetup.vue */
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
        (__VLS_ctx.className);
    }
    var __VLS_5;
    const __VLS_8 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({ shadow: ("never"), }));
    const __VLS_10 = __VLS_9({ shadow: ("never"), }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { header: __VLS_thisSlot } = __VLS_nonNullable(__VLS_13.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-between items-center") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("font-bold") }, });
        const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_16 = __VLS_15({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_15));
        let __VLS_20;
        const __VLS_21 = {
            onClick: (__VLS_ctx.handleAddSubject)
        };
        let __VLS_17;
        let __VLS_18;
        __VLS_nonNullable(__VLS_19.slots).default;
        var __VLS_19;
    }
    const __VLS_22 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({ data: ((__VLS_ctx.tableData)), border: (true), ...{ style: ({}) }, }));
    const __VLS_24 = __VLS_23({ data: ((__VLS_ctx.tableData)), border: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_23));
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.loading) }, null, null);
    const __VLS_28 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({ prop: ("subjectName"), label: ("科目名称"), width: ("120"), align: ("center"), }));
    const __VLS_30 = __VLS_29({ prop: ("subjectName"), label: ("科目名称"), width: ("120"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    const __VLS_34 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({ label: ("试卷状态"), minWidth: ("150"), align: ("center"), }));
    const __VLS_36 = __VLS_35({ label: ("试卷状态"), minWidth: ("150"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_35));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_39.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        if (row.paperUrl) {
            const __VLS_40 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
            /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
            // @ts-ignore
            const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({ type: ("success"), }));
            const __VLS_42 = __VLS_41({ type: ("success"), }, ...__VLS_functionalComponentArgsRest(__VLS_41));
            __VLS_nonNullable(__VLS_45.slots).default;
            var __VLS_45;
        }
        else {
            const __VLS_46 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
            /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
            // @ts-ignore
            const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({ type: ("info"), }));
            const __VLS_48 = __VLS_47({ type: ("info"), }, ...__VLS_functionalComponentArgsRest(__VLS_47));
            __VLS_nonNullable(__VLS_51.slots).default;
            var __VLS_51;
        }
    }
    var __VLS_39;
    const __VLS_52 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({ label: ("答案状态"), minWidth: ("150"), align: ("center"), }));
    const __VLS_54 = __VLS_53({ label: ("答案状态"), minWidth: ("150"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_57.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        if (row.answerUrl) {
            const __VLS_58 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
            /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
            // @ts-ignore
            const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({ type: ("success"), }));
            const __VLS_60 = __VLS_59({ type: ("success"), }, ...__VLS_functionalComponentArgsRest(__VLS_59));
            __VLS_nonNullable(__VLS_63.slots).default;
            var __VLS_63;
        }
        else {
            const __VLS_64 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
            /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
            // @ts-ignore
            const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({ type: ("info"), }));
            const __VLS_66 = __VLS_65({ type: ("info"), }, ...__VLS_functionalComponentArgsRest(__VLS_65));
            __VLS_nonNullable(__VLS_69.slots).default;
            var __VLS_69;
        }
    }
    var __VLS_57;
    const __VLS_70 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({ label: ("成绩状态"), minWidth: ("150"), align: ("center"), }));
    const __VLS_72 = __VLS_71({ label: ("成绩状态"), minWidth: ("150"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_71));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_75.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        if (row.scoreUploaded) {
            const __VLS_76 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
            /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
            // @ts-ignore
            const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({ type: ("success"), }));
            const __VLS_78 = __VLS_77({ type: ("success"), }, ...__VLS_functionalComponentArgsRest(__VLS_77));
            __VLS_nonNullable(__VLS_81.slots).default;
            var __VLS_81;
        }
        else {
            const __VLS_82 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
            /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
            // @ts-ignore
            const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({ type: ("info"), }));
            const __VLS_84 = __VLS_83({ type: ("info"), }, ...__VLS_functionalComponentArgsRest(__VLS_83));
            __VLS_nonNullable(__VLS_87.slots).default;
            var __VLS_87;
        }
    }
    var __VLS_75;
    const __VLS_88 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({ label: ("数据管理"), width: ("350"), align: ("center"), fixed: ("right"), }));
    const __VLS_90 = __VLS_89({ label: ("数据管理"), width: ("350"), align: ("center"), fixed: ("right"), }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_93.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_94 = __VLS_resolvedLocalAndGlobalComponents.ElUpload;
        /** @type { [typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ] } */
        // @ts-ignore
        const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({ ...{ 'onChange': {} }, ...{ class: ("inline-block mr-2") }, action: ("#"), autoUpload: ((false)), showFileList: ((false)), }));
        const __VLS_96 = __VLS_95({ ...{ 'onChange': {} }, ...{ class: ("inline-block mr-2") }, action: ("#"), autoUpload: ((false)), showFileList: ((false)), }, ...__VLS_functionalComponentArgsRest(__VLS_95));
        let __VLS_100;
        const __VLS_101 = {
            onChange: ((file) => __VLS_ctx.handleUpload(row, 'paper', file))
        };
        let __VLS_97;
        let __VLS_98;
        const __VLS_102 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({ type: ("primary"), link: (true), }));
        const __VLS_104 = __VLS_103({ type: ("primary"), link: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_103));
        __VLS_nonNullable(__VLS_107.slots).default;
        var __VLS_107;
        __VLS_nonNullable(__VLS_99.slots).default;
        var __VLS_99;
        const __VLS_108 = __VLS_resolvedLocalAndGlobalComponents.ElUpload;
        /** @type { [typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ] } */
        // @ts-ignore
        const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({ ...{ 'onChange': {} }, ...{ class: ("inline-block mr-2") }, action: ("#"), autoUpload: ((false)), showFileList: ((false)), }));
        const __VLS_110 = __VLS_109({ ...{ 'onChange': {} }, ...{ class: ("inline-block mr-2") }, action: ("#"), autoUpload: ((false)), showFileList: ((false)), }, ...__VLS_functionalComponentArgsRest(__VLS_109));
        let __VLS_114;
        const __VLS_115 = {
            onChange: ((file) => __VLS_ctx.handleUpload(row, 'answer', file))
        };
        let __VLS_111;
        let __VLS_112;
        const __VLS_116 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({ type: ("primary"), link: (true), }));
        const __VLS_118 = __VLS_117({ type: ("primary"), link: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_117));
        __VLS_nonNullable(__VLS_121.slots).default;
        var __VLS_121;
        __VLS_nonNullable(__VLS_113.slots).default;
        var __VLS_113;
        const __VLS_122 = __VLS_resolvedLocalAndGlobalComponents.ElUpload;
        /** @type { [typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ] } */
        // @ts-ignore
        const __VLS_123 = __VLS_asFunctionalComponent(__VLS_122, new __VLS_122({ ...{ 'onChange': {} }, ...{ class: ("inline-block mr-2") }, action: ("#"), autoUpload: ((false)), showFileList: ((false)), }));
        const __VLS_124 = __VLS_123({ ...{ 'onChange': {} }, ...{ class: ("inline-block mr-2") }, action: ("#"), autoUpload: ((false)), showFileList: ((false)), }, ...__VLS_functionalComponentArgsRest(__VLS_123));
        let __VLS_128;
        const __VLS_129 = {
            onChange: ((file) => __VLS_ctx.handleUpload(row, 'score', file))
        };
        let __VLS_125;
        let __VLS_126;
        const __VLS_130 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({ type: ("primary"), link: (true), }));
        const __VLS_132 = __VLS_131({ type: ("primary"), link: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_131));
        __VLS_nonNullable(__VLS_135.slots).default;
        var __VLS_135;
        __VLS_nonNullable(__VLS_127.slots).default;
        var __VLS_127;
        const __VLS_136 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({ ...{ 'onClick': {} }, type: ("danger"), link: (true), }));
        const __VLS_138 = __VLS_137({ ...{ 'onClick': {} }, type: ("danger"), link: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_137));
        let __VLS_142;
        const __VLS_143 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleDelete(row);
            }
        };
        let __VLS_139;
        let __VLS_140;
        __VLS_nonNullable(__VLS_141.slots).default;
        var __VLS_141;
    }
    var __VLS_93;
    __VLS_nonNullable(__VLS_27.slots).default;
    var __VLS_27;
    var __VLS_13;
    const __VLS_144 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */
    // @ts-ignore
    const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({ modelValue: ((__VLS_ctx.dialogVisible)), title: ("添加科目"), width: ("400px"), }));
    const __VLS_146 = __VLS_145({ modelValue: ((__VLS_ctx.dialogVisible)), title: ("添加科目"), width: ("400px"), }, ...__VLS_functionalComponentArgsRest(__VLS_145));
    const __VLS_150 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */
    // @ts-ignore
    const __VLS_151 = __VLS_asFunctionalComponent(__VLS_150, new __VLS_150({ model: ((__VLS_ctx.form)), ref: ("formRef"), rules: ((__VLS_ctx.rules)), labelWidth: ("80px"), }));
    const __VLS_152 = __VLS_151({ model: ((__VLS_ctx.form)), ref: ("formRef"), rules: ((__VLS_ctx.rules)), labelWidth: ("80px"), }, ...__VLS_functionalComponentArgsRest(__VLS_151));
    // @ts-ignore navigation for `const formRef = ref()`
    __VLS_ctx.formRef;
    var __VLS_156 = {};
    const __VLS_157 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_158 = __VLS_asFunctionalComponent(__VLS_157, new __VLS_157({ label: ("科目"), prop: ("subjectName"), }));
    const __VLS_159 = __VLS_158({ label: ("科目"), prop: ("subjectName"), }, ...__VLS_functionalComponentArgsRest(__VLS_158));
    const __VLS_163 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
    /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */
    // @ts-ignore
    const __VLS_164 = __VLS_asFunctionalComponent(__VLS_163, new __VLS_163({ modelValue: ((__VLS_ctx.form.subjectName)), placeholder: ("请选择科目"), ...{ class: ("w-full") }, }));
    const __VLS_165 = __VLS_164({ modelValue: ((__VLS_ctx.form.subjectName)), placeholder: ("请选择科目"), ...{ class: ("w-full") }, }, ...__VLS_functionalComponentArgsRest(__VLS_164));
    for (const [s] of __VLS_getVForSourceType((__VLS_ctx.subjectOptions))) {
        const __VLS_169 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
        /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
        // @ts-ignore
        const __VLS_170 = __VLS_asFunctionalComponent(__VLS_169, new __VLS_169({ key: ((s)), label: ((s)), value: ((s)), }));
        const __VLS_171 = __VLS_170({ key: ((s)), label: ((s)), value: ((s)), }, ...__VLS_functionalComponentArgsRest(__VLS_170));
    }
    __VLS_nonNullable(__VLS_168.slots).default;
    var __VLS_168;
    __VLS_nonNullable(__VLS_162.slots).default;
    var __VLS_162;
    __VLS_nonNullable(__VLS_155.slots).default;
    var __VLS_155;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_149.slots);
        const __VLS_175 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_176 = __VLS_asFunctionalComponent(__VLS_175, new __VLS_175({ ...{ 'onClick': {} }, }));
        const __VLS_177 = __VLS_176({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_176));
        let __VLS_181;
        const __VLS_182 = {
            onClick: (...[$event]) => {
                __VLS_ctx.dialogVisible = false;
            }
        };
        let __VLS_178;
        let __VLS_179;
        __VLS_nonNullable(__VLS_180.slots).default;
        var __VLS_180;
        const __VLS_183 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_184 = __VLS_asFunctionalComponent(__VLS_183, new __VLS_183({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_185 = __VLS_184({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_184));
        let __VLS_189;
        const __VLS_190 = {
            onClick: (__VLS_ctx.submitForm)
        };
        let __VLS_186;
        let __VLS_187;
        __VLS_nonNullable(__VLS_188.slots).default;
        var __VLS_188;
    }
    var __VLS_149;
    __VLS_styleScopedClasses['page-container'];
    __VLS_styleScopedClasses['mb-4'];
    __VLS_styleScopedClasses['text-large'];
    __VLS_styleScopedClasses['font-600'];
    __VLS_styleScopedClasses['mr-3'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['mr-2'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['inline-block'];
    __VLS_styleScopedClasses['mr-2'];
    __VLS_styleScopedClasses['inline-block'];
    __VLS_styleScopedClasses['mr-2'];
    __VLS_styleScopedClasses['inline-block'];
    __VLS_styleScopedClasses['mr-2'];
    __VLS_styleScopedClasses['w-full'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "formRef": __VLS_156,
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
            className: className,
            loading: loading,
            tableData: tableData,
            subjectOptions: subjectOptions,
            dialogVisible: dialogVisible,
            formRef: formRef,
            form: form,
            rules: rules,
            goBack: goBack,
            handleAddSubject: handleAddSubject,
            handleUpload: handleUpload,
            handleDelete: handleDelete,
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