/// <reference types="../../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, watch, computed } from 'vue';
import { Plus, Delete } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { fetchSaveStudentScore } from '@/api/core-business/exam/project-editor';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps();
const emit = defineEmits();
const saving = ref(false);
const questionScores = ref([]);
watch(() => props.modelValue, (val) => {
    if (val && props.student) {
        // 如果已有小题分数据，则显示
        if (props.student.questionScores && Array.isArray(props.student.questionScores)) {
            questionScores.value = [...props.student.questionScores];
        }
        else if (typeof props.student.questionScores === 'string') {
            try {
                questionScores.value = JSON.parse(props.student.questionScores);
            }
            catch (e) {
                questionScores.value = [];
            }
        }
        else {
            questionScores.value = [];
        }
    }
});
const totalScore = computed(() => {
    return questionScores.value.reduce((sum, s) => sum + (s || 0), 0).toFixed(1);
});
function addQuestion() {
    questionScores.value.push(0);
}
function removeQuestion(index) {
    questionScores.value.splice(index, 1);
}
function handleClose() {
    emit('update:modelValue', false);
}
async function handleSave() {
    if (!props.student)
        return;
    saving.value = true;
    try {
        await fetchSaveStudentScore({
            projectId: props.projectId,
            subjectName: props.subjectName,
            studentNo: props.student.studentNo,
            questionScores: questionScores.value
        });
        ElMessage.success('成绩保存成功');
        emit('saved');
        handleClose();
    }
    catch (error) {
        ElMessage.error(error.message || '保存失败');
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
    __VLS_styleScopedClasses['label'];
    __VLS_styleScopedClasses['value'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.modelValue)), title: ("编辑学生成绩"), width: ("500px"), destroyOnClose: (true), }));
    const __VLS_2 = __VLS_1({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.modelValue)), title: ("编辑学生成绩"), width: ("500px"), destroyOnClose: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_6 = {};
    let __VLS_7;
    const __VLS_8 = {
        onClose: (__VLS_ctx.handleClose)
    };
    let __VLS_3;
    let __VLS_4;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("score-edit-container") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("student-info") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("info-item") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("label") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("value") }, });
    (__VLS_ctx.student?.studentName);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("info-item") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("label") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("value") }, });
    (__VLS_ctx.student?.studentNo);
    const __VLS_9 = __VLS_resolvedLocalAndGlobalComponents.ElDivider;
    /** @type { [typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ] } */
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({}));
    const __VLS_11 = __VLS_10({}, ...__VLS_functionalComponentArgsRest(__VLS_10));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("section-title") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("question-list") }, });
    for (const [score, index] of __VLS_getVForSourceType((__VLS_ctx.questionScores))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ key: ((index)), ...{ class: ("question-item") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("question-no") }, });
        (index + 1);
        const __VLS_15 = __VLS_resolvedLocalAndGlobalComponents.ElInputNumber;
        /** @type { [typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ] } */
        // @ts-ignore
        const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({ modelValue: ((__VLS_ctx.questionScores[index])), min: ((0)), precision: ((1)), ...{ class: ("score-input") }, placeholder: ("分值"), }));
        const __VLS_17 = __VLS_16({ modelValue: ((__VLS_ctx.questionScores[index])), min: ((0)), precision: ((1)), ...{ class: ("score-input") }, placeholder: ("分值"), }, ...__VLS_functionalComponentArgsRest(__VLS_16));
        const __VLS_21 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({ ...{ 'onClick': {} }, type: ("danger"), link: (true), icon: ((__VLS_ctx.Delete)), }));
        const __VLS_23 = __VLS_22({ ...{ 'onClick': {} }, type: ("danger"), link: (true), icon: ((__VLS_ctx.Delete)), }, ...__VLS_functionalComponentArgsRest(__VLS_22));
        let __VLS_27;
        const __VLS_28 = {
            onClick: (...[$event]) => {
                __VLS_ctx.removeQuestion(index);
            }
        };
        let __VLS_24;
        let __VLS_25;
        var __VLS_26;
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.addQuestion) }, ...{ class: ("add-question") }, });
    const __VLS_29 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
    /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({}));
    const __VLS_31 = __VLS_30({}, ...__VLS_functionalComponentArgsRest(__VLS_30));
    const __VLS_35 = __VLS_resolvedLocalAndGlobalComponents.Plus;
    /** @type { [typeof __VLS_components.Plus, ] } */
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({}));
    const __VLS_37 = __VLS_36({}, ...__VLS_functionalComponentArgsRest(__VLS_36));
    __VLS_nonNullable(__VLS_34.slots).default;
    var __VLS_34;
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("total-summary") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("label") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("value") }, });
    (__VLS_ctx.totalScore);
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("dialog-footer") }, });
        const __VLS_41 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({ ...{ 'onClick': {} }, }));
        const __VLS_43 = __VLS_42({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_42));
        let __VLS_47;
        const __VLS_48 = {
            onClick: (__VLS_ctx.handleClose)
        };
        let __VLS_44;
        let __VLS_45;
        __VLS_nonNullable(__VLS_46.slots).default;
        var __VLS_46;
        const __VLS_49 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.saving)), }));
        const __VLS_51 = __VLS_50({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.saving)), }, ...__VLS_functionalComponentArgsRest(__VLS_50));
        let __VLS_55;
        const __VLS_56 = {
            onClick: (__VLS_ctx.handleSave)
        };
        let __VLS_52;
        let __VLS_53;
        __VLS_nonNullable(__VLS_54.slots).default;
        var __VLS_54;
    }
    var __VLS_5;
    __VLS_styleScopedClasses['score-edit-container'];
    __VLS_styleScopedClasses['student-info'];
    __VLS_styleScopedClasses['info-item'];
    __VLS_styleScopedClasses['label'];
    __VLS_styleScopedClasses['value'];
    __VLS_styleScopedClasses['info-item'];
    __VLS_styleScopedClasses['label'];
    __VLS_styleScopedClasses['value'];
    __VLS_styleScopedClasses['section-title'];
    __VLS_styleScopedClasses['question-list'];
    __VLS_styleScopedClasses['question-item'];
    __VLS_styleScopedClasses['question-no'];
    __VLS_styleScopedClasses['score-input'];
    __VLS_styleScopedClasses['add-question'];
    __VLS_styleScopedClasses['total-summary'];
    __VLS_styleScopedClasses['label'];
    __VLS_styleScopedClasses['value'];
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
            Plus: Plus,
            Delete: Delete,
            saving: saving,
            questionScores: questionScores,
            totalScore: totalScore,
            addQuestion: addQuestion,
            removeQuestion: removeQuestion,
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
//# sourceMappingURL=ScoreEditDialog.vue.js.map