/// <reference types="../../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, reactive, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { ArrowRight, Plus } from '@element-plus/icons-vue';
import StudentSelectDialog from './StudentSelectDialog.vue';
import SubjectSelectDialog from './SubjectSelectDialog.vue';
import SubjectBenchmarkDialog from './SubjectBenchmarkDialog.vue';
import { addProject, updateProject } from './ProjectDialog';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps();
const emit = defineEmits();
const saving = ref(false);
const studentSelectVisible = ref(false);
const subjectSelectVisible = ref(false);
const benchmarkVisible = ref(false);
const form = reactive({
    id: '',
    name: '',
    schoolIds: [],
    classIds: [],
    subjects: [],
    benchmarks: {}
});
watch(() => props.modelValue, (val) => {
    if (val && props.project) {
        Object.assign(form, {
            id: props.project.id || '',
            name: props.project.name || '',
            schoolIds: [...(props.project.schoolIds || [])],
            classIds: [...(props.project.classIds || [])],
            subjects: [...(props.project.subjects || [])],
            benchmarks: props.project.benchmarks || {}
        });
    }
});
const hasStudentSelection = computed(() => form.classIds.length > 0);
const selectedSchoolCount = computed(() => {
    const schoolIds = new Set();
    form.classIds.forEach(cid => {
        const cls = props.options.classes.find(c => c.id === cid);
        if (cls) {
            schoolIds.add(cls.schoolId);
        }
    });
    return schoolIds.size;
});
const selectedClassCount = computed(() => form.classIds.length);
const selectedStudentCount = computed(() => {
    let count = 0;
    form.classIds.forEach(cid => {
        const cls = props.options.classes.find(c => c.id === cid);
        if (cls) {
            count += cls.studentCount;
        }
    });
    return count;
});
function handleStudentConfirm(selection) {
    form.schoolIds = selection.schoolIds;
    form.classIds = selection.classIds;
}
function handleSubjectConfirm(selected) {
    form.subjects = selected;
    // 移除不在已选科目中的基准分数
    if (form.benchmarks) {
        const newBenchmarks = {};
        selected.forEach(s => {
            if (form.benchmarks && form.benchmarks[s]) {
                newBenchmarks[s] = form.benchmarks[s];
            }
        });
        form.benchmarks = newBenchmarks;
    }
}
function handleBenchmarkConfirm(benchmarks) {
    form.benchmarks = benchmarks;
}
function removeSubject(subject) {
    form.subjects = form.subjects.filter(s => s !== subject);
    if (form.benchmarks) {
        delete form.benchmarks[subject];
    }
}
function handleClose() {
    emit('update:modelValue', false);
}
async function handleSave() {
    if (!form.name) {
        return ElMessage.warning('请输入项目名称');
    }
    if (!hasStudentSelection.value) {
        return ElMessage.warning('请选取参与学生');
    }
    if (form.subjects.length === 0) {
        return ElMessage.warning('请至少选择一个学科');
    }
    // 检查基准分数是否完整
    const benchmarkCount = Object.keys(form.benchmarks || {}).length;
    if (benchmarkCount < form.subjects.length) {
        return ElMessage.warning('请设置所有已选学科的基准分数');
    }
    saving.value = true;
    try {
        if (props.mode === 'create') {
            await addProject(form);
            ElMessage.success('创建成功');
        }
        else {
            await updateProject(form);
            ElMessage.success('更新成功');
        }
        emit('saved');
        handleClose();
    }
    catch (error) {
        ElMessage.error(error.message || '操作失败');
    }
    finally {
        saving.value = false;
    }
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
    __VLS_styleScopedClasses['stats-item'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.modelValue)), title: ((__VLS_ctx.mode === 'create' ? '创建考试项目' : '编辑考试项目')), width: ("900px"), ...{ class: ("project-dialog") }, destroyOnClose: (true), alignCenter: (true), }));
    const __VLS_2 = __VLS_1({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.modelValue)), title: ((__VLS_ctx.mode === 'create' ? '创建考试项目' : '编辑考试项目')), width: ("900px"), ...{ class: ("project-dialog") }, destroyOnClose: (true), alignCenter: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_6 = {};
    let __VLS_7;
    const __VLS_8 = {
        onClose: (__VLS_ctx.handleClose)
    };
    let __VLS_3;
    let __VLS_4;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("project-layout") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("project-form-container") }, });
    const __VLS_9 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({ model: ((__VLS_ctx.form)), labelPosition: ("top"), ...{ class: ("project-form") }, }));
    const __VLS_11 = __VLS_10({ model: ((__VLS_ctx.form)), labelPosition: ("top"), ...{ class: ("project-form") }, }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    const __VLS_15 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({ label: ("项目名称"), required: (true), }));
    const __VLS_17 = __VLS_16({ label: ("项目名称"), required: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    const __VLS_21 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({ modelValue: ((__VLS_ctx.form.name)), placeholder: ("请输入项目名称"), clearable: (true), }));
    const __VLS_23 = __VLS_22({ modelValue: ((__VLS_ctx.form.name)), placeholder: ("请输入项目名称"), clearable: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    __VLS_nonNullable(__VLS_20.slots).default;
    var __VLS_20;
    const __VLS_27 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({ label: ("选取学生"), required: (true), }));
    const __VLS_29 = __VLS_28({ label: ("选取学生"), required: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                __VLS_ctx.studentSelectVisible = true;
            } }, ...{ class: ("selection-box") }, });
    if (__VLS_ctx.hasStudentSelection) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("selection-summary") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("highlight") }, });
        (__VLS_ctx.selectedSchoolCount);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("highlight") }, });
        (__VLS_ctx.selectedClassCount);
    }
    else {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("placeholder") }, });
    }
    const __VLS_33 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
    /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({}));
    const __VLS_35 = __VLS_34({}, ...__VLS_functionalComponentArgsRest(__VLS_34));
    const __VLS_39 = __VLS_resolvedLocalAndGlobalComponents.ArrowRight;
    /** @type { [typeof __VLS_components.ArrowRight, ] } */
    // @ts-ignore
    const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({}));
    const __VLS_41 = __VLS_40({}, ...__VLS_functionalComponentArgsRest(__VLS_40));
    __VLS_nonNullable(__VLS_38.slots).default;
    var __VLS_38;
    __VLS_nonNullable(__VLS_32.slots).default;
    var __VLS_32;
    const __VLS_45 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({ label: ("学科选择"), required: (true), }));
    const __VLS_47 = __VLS_46({ label: ("学科选择"), required: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                __VLS_ctx.subjectSelectVisible = true;
            } }, ...{ class: ("selection-box subject-box") }, });
    if (__VLS_ctx.form.subjects.length > 0) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("subject-tags") }, });
        for (const [subject] of __VLS_getVForSourceType((__VLS_ctx.form.subjects))) {
            const __VLS_51 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
            /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
            // @ts-ignore
            const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({ ...{ 'onClose': {} }, key: ((subject)), closable: (true), size: ("small"), ...{ class: ("subject-tag") }, }));
            const __VLS_53 = __VLS_52({ ...{ 'onClose': {} }, key: ((subject)), closable: (true), size: ("small"), ...{ class: ("subject-tag") }, }, ...__VLS_functionalComponentArgsRest(__VLS_52));
            let __VLS_57;
            const __VLS_58 = {
                onClose: (...[$event]) => {
                    if (!((__VLS_ctx.form.subjects.length > 0)))
                        return;
                    __VLS_ctx.removeSubject(subject);
                }
            };
            let __VLS_54;
            let __VLS_55;
            (subject);
            __VLS_nonNullable(__VLS_56.slots).default;
            var __VLS_56;
        }
    }
    else {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("placeholder") }, });
    }
    const __VLS_59 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
    /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
    // @ts-ignore
    const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({}));
    const __VLS_61 = __VLS_60({}, ...__VLS_functionalComponentArgsRest(__VLS_60));
    const __VLS_65 = __VLS_resolvedLocalAndGlobalComponents.Plus;
    /** @type { [typeof __VLS_components.Plus, ] } */
    // @ts-ignore
    const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({}));
    const __VLS_67 = __VLS_66({}, ...__VLS_functionalComponentArgsRest(__VLS_66));
    __VLS_nonNullable(__VLS_64.slots).default;
    var __VLS_64;
    __VLS_nonNullable(__VLS_50.slots).default;
    var __VLS_50;
    const __VLS_71 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({ label: ("学科基准分数"), required: (true), }));
    const __VLS_73 = __VLS_72({ label: ("学科基准分数"), required: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_72));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                __VLS_ctx.benchmarkVisible = true;
            } }, ...{ class: ("selection-box benchmark-box") }, });
    if (Object.keys(__VLS_ctx.form.benchmarks || {}).length > 0) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("benchmark-summary") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("highlight") }, });
        (Object.keys(__VLS_ctx.form.benchmarks || {}).length);
    }
    else {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("placeholder") }, });
    }
    const __VLS_77 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
    /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
    // @ts-ignore
    const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({}));
    const __VLS_79 = __VLS_78({}, ...__VLS_functionalComponentArgsRest(__VLS_78));
    const __VLS_83 = __VLS_resolvedLocalAndGlobalComponents.ArrowRight;
    /** @type { [typeof __VLS_components.ArrowRight, ] } */
    // @ts-ignore
    const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({}));
    const __VLS_85 = __VLS_84({}, ...__VLS_functionalComponentArgsRest(__VLS_84));
    __VLS_nonNullable(__VLS_82.slots).default;
    var __VLS_82;
    __VLS_nonNullable(__VLS_76.slots).default;
    var __VLS_76;
    __VLS_nonNullable(__VLS_14.slots).default;
    var __VLS_14;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("project-info-container") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("info-card stats-card") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("card-title") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stats-grid") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stats-item") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stats-label") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stats-value") }, });
    (__VLS_ctx.selectedSchoolCount);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stats-item") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stats-label") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stats-value") }, });
    (__VLS_ctx.selectedClassCount);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stats-item") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stats-label") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stats-value") }, });
    (__VLS_ctx.selectedStudentCount);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("info-card subject-stats-card") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("card-title") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("subject-stats") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stats-item") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stats-label") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stats-value") }, });
    (__VLS_ctx.form.subjects.length);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("subject-preview") }, });
    if (__VLS_ctx.form.subjects.length === 0) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("placeholder") }, });
    }
    else {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.form.subjects.join('、'));
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("dialog-footer") }, });
        const __VLS_89 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({ ...{ 'onClick': {} }, }));
        const __VLS_91 = __VLS_90({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_90));
        let __VLS_95;
        const __VLS_96 = {
            onClick: (__VLS_ctx.handleClose)
        };
        let __VLS_92;
        let __VLS_93;
        __VLS_nonNullable(__VLS_94.slots).default;
        var __VLS_94;
        const __VLS_97 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.saving)), }));
        const __VLS_99 = __VLS_98({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.saving)), }, ...__VLS_functionalComponentArgsRest(__VLS_98));
        let __VLS_103;
        const __VLS_104 = {
            onClick: (__VLS_ctx.handleSave)
        };
        let __VLS_100;
        let __VLS_101;
        (__VLS_ctx.mode === 'create' ? '创建' : '保存');
        __VLS_nonNullable(__VLS_102.slots).default;
        var __VLS_102;
    }
    // @ts-ignore
    [StudentSelectDialog,];
    // @ts-ignore
    const __VLS_105 = __VLS_asFunctionalComponent(StudentSelectDialog, new StudentSelectDialog({ ...{ 'onConfirm': {} }, modelValue: ((__VLS_ctx.studentSelectVisible)), schools: ((__VLS_ctx.options.schools)), classes: ((__VLS_ctx.options.classes)), initialSchools: ((__VLS_ctx.form.schoolIds)), initialClasses: ((__VLS_ctx.form.classIds)), }));
    const __VLS_106 = __VLS_105({ ...{ 'onConfirm': {} }, modelValue: ((__VLS_ctx.studentSelectVisible)), schools: ((__VLS_ctx.options.schools)), classes: ((__VLS_ctx.options.classes)), initialSchools: ((__VLS_ctx.form.schoolIds)), initialClasses: ((__VLS_ctx.form.classIds)), }, ...__VLS_functionalComponentArgsRest(__VLS_105));
    let __VLS_110;
    const __VLS_111 = {
        onConfirm: (__VLS_ctx.handleStudentConfirm)
    };
    let __VLS_107;
    let __VLS_108;
    var __VLS_109;
    // @ts-ignore
    [SubjectSelectDialog,];
    // @ts-ignore
    const __VLS_112 = __VLS_asFunctionalComponent(SubjectSelectDialog, new SubjectSelectDialog({ ...{ 'onConfirm': {} }, modelValue: ((__VLS_ctx.subjectSelectVisible)), subjects: ((__VLS_ctx.options.subjects)), selected: ((__VLS_ctx.form.subjects)), }));
    const __VLS_113 = __VLS_112({ ...{ 'onConfirm': {} }, modelValue: ((__VLS_ctx.subjectSelectVisible)), subjects: ((__VLS_ctx.options.subjects)), selected: ((__VLS_ctx.form.subjects)), }, ...__VLS_functionalComponentArgsRest(__VLS_112));
    let __VLS_117;
    const __VLS_118 = {
        onConfirm: (__VLS_ctx.handleSubjectConfirm)
    };
    let __VLS_114;
    let __VLS_115;
    var __VLS_116;
    // @ts-ignore
    [SubjectBenchmarkDialog,];
    // @ts-ignore
    const __VLS_119 = __VLS_asFunctionalComponent(SubjectBenchmarkDialog, new SubjectBenchmarkDialog({ ...{ 'onConfirm': {} }, modelValue: ((__VLS_ctx.benchmarkVisible)), subjects: ((__VLS_ctx.form.subjects)), initialBenchmarks: ((__VLS_ctx.form.benchmarks)), }));
    const __VLS_120 = __VLS_119({ ...{ 'onConfirm': {} }, modelValue: ((__VLS_ctx.benchmarkVisible)), subjects: ((__VLS_ctx.form.subjects)), initialBenchmarks: ((__VLS_ctx.form.benchmarks)), }, ...__VLS_functionalComponentArgsRest(__VLS_119));
    let __VLS_124;
    const __VLS_125 = {
        onConfirm: (__VLS_ctx.handleBenchmarkConfirm)
    };
    let __VLS_121;
    let __VLS_122;
    var __VLS_123;
    var __VLS_5;
    __VLS_styleScopedClasses['project-dialog'];
    __VLS_styleScopedClasses['project-layout'];
    __VLS_styleScopedClasses['project-form-container'];
    __VLS_styleScopedClasses['project-form'];
    __VLS_styleScopedClasses['selection-box'];
    __VLS_styleScopedClasses['selection-summary'];
    __VLS_styleScopedClasses['highlight'];
    __VLS_styleScopedClasses['highlight'];
    __VLS_styleScopedClasses['placeholder'];
    __VLS_styleScopedClasses['selection-box'];
    __VLS_styleScopedClasses['subject-box'];
    __VLS_styleScopedClasses['subject-tags'];
    __VLS_styleScopedClasses['subject-tag'];
    __VLS_styleScopedClasses['placeholder'];
    __VLS_styleScopedClasses['selection-box'];
    __VLS_styleScopedClasses['benchmark-box'];
    __VLS_styleScopedClasses['benchmark-summary'];
    __VLS_styleScopedClasses['highlight'];
    __VLS_styleScopedClasses['placeholder'];
    __VLS_styleScopedClasses['project-info-container'];
    __VLS_styleScopedClasses['info-card'];
    __VLS_styleScopedClasses['stats-card'];
    __VLS_styleScopedClasses['card-title'];
    __VLS_styleScopedClasses['stats-grid'];
    __VLS_styleScopedClasses['stats-item'];
    __VLS_styleScopedClasses['stats-label'];
    __VLS_styleScopedClasses['stats-value'];
    __VLS_styleScopedClasses['stats-item'];
    __VLS_styleScopedClasses['stats-label'];
    __VLS_styleScopedClasses['stats-value'];
    __VLS_styleScopedClasses['stats-item'];
    __VLS_styleScopedClasses['stats-label'];
    __VLS_styleScopedClasses['stats-value'];
    __VLS_styleScopedClasses['info-card'];
    __VLS_styleScopedClasses['subject-stats-card'];
    __VLS_styleScopedClasses['card-title'];
    __VLS_styleScopedClasses['subject-stats'];
    __VLS_styleScopedClasses['stats-item'];
    __VLS_styleScopedClasses['stats-label'];
    __VLS_styleScopedClasses['stats-value'];
    __VLS_styleScopedClasses['subject-preview'];
    __VLS_styleScopedClasses['placeholder'];
    __VLS_styleScopedClasses['dialog-footer'];
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
            ArrowRight: ArrowRight,
            Plus: Plus,
            StudentSelectDialog: StudentSelectDialog,
            SubjectSelectDialog: SubjectSelectDialog,
            SubjectBenchmarkDialog: SubjectBenchmarkDialog,
            saving: saving,
            studentSelectVisible: studentSelectVisible,
            subjectSelectVisible: subjectSelectVisible,
            benchmarkVisible: benchmarkVisible,
            form: form,
            hasStudentSelection: hasStudentSelection,
            selectedSchoolCount: selectedSchoolCount,
            selectedClassCount: selectedClassCount,
            selectedStudentCount: selectedStudentCount,
            handleStudentConfirm: handleStudentConfirm,
            handleSubjectConfirm: handleSubjectConfirm,
            handleBenchmarkConfirm: handleBenchmarkConfirm,
            removeSubject: removeSubject,
            handleClose: handleClose,
            handleSave: handleSave,
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
//# sourceMappingURL=ProjectDialog.vue.js.map