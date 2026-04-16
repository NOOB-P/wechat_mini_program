/// <reference types="../../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, watch, reactive } from 'vue';
import { Plus, Delete } from '@element-plus/icons-vue';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps();
const emit = defineEmits();
const activeSubject = ref('');
const benchmarks = reactive({});
// 初始化 benchmarks 数据
watch(() => props.modelValue, (val) => {
    if (val) {
        // 重置数据
        Object.keys(benchmarks).forEach(key => delete benchmarks[key]);
        // 填充初始数据或默认数据
        props.subjects.forEach(s => {
            if (props.initialBenchmarks && props.initialBenchmarks[s]) {
                benchmarks[s] = JSON.parse(JSON.stringify(props.initialBenchmarks[s]));
            }
            else {
                benchmarks[s] = {
                    totalScore: 100,
                    questions: []
                };
            }
        });
        if (props.subjects.length > 0) {
            activeSubject.value = props.subjects[0];
        }
    }
});
const currentConfig = ref({ totalScore: 100, questions: [] });
watch(activeSubject, (newSubject) => {
    if (newSubject && benchmarks[newSubject]) {
        currentConfig.value = benchmarks[newSubject];
    }
});
function addQuestion() {
    if (activeSubject.value) {
        benchmarks[activeSubject.value].questions.push({ score: 0 });
    }
}
function removeQuestion(index) {
    if (activeSubject.value) {
        benchmarks[activeSubject.value].questions.splice(index, 1);
    }
}
function handleClose() {
    emit('update:modelValue', false);
}
function handleConfirm() {
    emit('confirm', JSON.parse(JSON.stringify(benchmarks)));
    handleClose();
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
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.modelValue)), title: ("学科基准分数设置"), width: ("800px"), ...{ class: ("benchmark-dialog") }, appendToBody: (true), alignCenter: (true), destroyOnClose: (true), }));
    const __VLS_2 = __VLS_1({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.modelValue)), title: ("学科基准分数设置"), width: ("800px"), ...{ class: ("benchmark-dialog") }, appendToBody: (true), alignCenter: (true), destroyOnClose: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_6 = {};
    let __VLS_7;
    const __VLS_8 = {
        onClose: (__VLS_ctx.handleClose)
    };
    let __VLS_3;
    let __VLS_4;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("benchmark-layout") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("subject-sidebar") }, });
    for (const [subject] of __VLS_getVForSourceType((__VLS_ctx.subjects))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.activeSubject = subject;
                } }, key: ((subject)), ...{ class: ("subject-nav-item") }, ...{ class: (({ active: __VLS_ctx.activeSubject === subject })) }, });
        (subject);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("benchmark-main") }, });
    if (__VLS_ctx.activeSubject) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("settings-container") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("setting-section") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("section-title") }, });
        const __VLS_9 = __VLS_resolvedLocalAndGlobalComponents.ElInputNumber;
        /** @type { [typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ] } */
        // @ts-ignore
        const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({ modelValue: ((__VLS_ctx.currentConfig.totalScore)), min: ((0)), precision: ((1)), ...{ class: ("total-score-input") }, placeholder: ("请输入学科满分"), }));
        const __VLS_11 = __VLS_10({ modelValue: ((__VLS_ctx.currentConfig.totalScore)), min: ((0)), precision: ((1)), ...{ class: ("total-score-input") }, placeholder: ("请输入学科满分"), }, ...__VLS_functionalComponentArgsRest(__VLS_10));
        const __VLS_15 = __VLS_resolvedLocalAndGlobalComponents.ElDivider;
        /** @type { [typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ] } */
        // @ts-ignore
        const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({}));
        const __VLS_17 = __VLS_16({}, ...__VLS_functionalComponentArgsRest(__VLS_16));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("setting-section") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("section-title") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("question-list") }, });
        for (const [q, index] of __VLS_getVForSourceType((__VLS_ctx.currentConfig.questions))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ key: ((index)), ...{ class: ("question-item") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("question-no") }, });
            (index + 1);
            const __VLS_21 = __VLS_resolvedLocalAndGlobalComponents.ElInputNumber;
            /** @type { [typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ] } */
            // @ts-ignore
            const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({ modelValue: ((q.score)), min: ((0)), precision: ((1)), ...{ class: ("question-score-input") }, placeholder: ("分值"), }));
            const __VLS_23 = __VLS_22({ modelValue: ((q.score)), min: ((0)), precision: ((1)), ...{ class: ("question-score-input") }, placeholder: ("分值"), }, ...__VLS_functionalComponentArgsRest(__VLS_22));
            const __VLS_27 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({ ...{ 'onClick': {} }, type: ("danger"), link: (true), icon: ((__VLS_ctx.Delete)), }));
            const __VLS_29 = __VLS_28({ ...{ 'onClick': {} }, type: ("danger"), link: (true), icon: ((__VLS_ctx.Delete)), }, ...__VLS_functionalComponentArgsRest(__VLS_28));
            let __VLS_33;
            const __VLS_34 = {
                onClick: (...[$event]) => {
                    if (!((__VLS_ctx.activeSubject)))
                        return;
                    __VLS_ctx.removeQuestion(index);
                }
            };
            let __VLS_30;
            let __VLS_31;
            var __VLS_32;
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.addQuestion) }, ...{ class: ("add-question") }, });
        const __VLS_35 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({}));
        const __VLS_37 = __VLS_36({}, ...__VLS_functionalComponentArgsRest(__VLS_36));
        const __VLS_41 = __VLS_resolvedLocalAndGlobalComponents.Plus;
        /** @type { [typeof __VLS_components.Plus, ] } */
        // @ts-ignore
        const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({}));
        const __VLS_43 = __VLS_42({}, ...__VLS_functionalComponentArgsRest(__VLS_42));
        __VLS_nonNullable(__VLS_40.slots).default;
        var __VLS_40;
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    else {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("empty-state") }, });
        const __VLS_47 = __VLS_resolvedLocalAndGlobalComponents.ElEmpty;
        /** @type { [typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ] } */
        // @ts-ignore
        const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({ description: ("请选择左侧学科进行设置"), }));
        const __VLS_49 = __VLS_48({ description: ("请选择左侧学科进行设置"), }, ...__VLS_functionalComponentArgsRest(__VLS_48));
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("dialog-footer") }, });
        const __VLS_53 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({ ...{ 'onClick': {} }, }));
        const __VLS_55 = __VLS_54({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_54));
        let __VLS_59;
        const __VLS_60 = {
            onClick: (__VLS_ctx.handleClose)
        };
        let __VLS_56;
        let __VLS_57;
        __VLS_nonNullable(__VLS_58.slots).default;
        var __VLS_58;
        const __VLS_61 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_63 = __VLS_62({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_62));
        let __VLS_67;
        const __VLS_68 = {
            onClick: (__VLS_ctx.handleConfirm)
        };
        let __VLS_64;
        let __VLS_65;
        __VLS_nonNullable(__VLS_66.slots).default;
        var __VLS_66;
    }
    var __VLS_5;
    __VLS_styleScopedClasses['benchmark-dialog'];
    __VLS_styleScopedClasses['benchmark-layout'];
    __VLS_styleScopedClasses['subject-sidebar'];
    __VLS_styleScopedClasses['subject-nav-item'];
    __VLS_styleScopedClasses['active'];
    __VLS_styleScopedClasses['benchmark-main'];
    __VLS_styleScopedClasses['settings-container'];
    __VLS_styleScopedClasses['setting-section'];
    __VLS_styleScopedClasses['section-title'];
    __VLS_styleScopedClasses['total-score-input'];
    __VLS_styleScopedClasses['setting-section'];
    __VLS_styleScopedClasses['section-title'];
    __VLS_styleScopedClasses['question-list'];
    __VLS_styleScopedClasses['question-item'];
    __VLS_styleScopedClasses['question-no'];
    __VLS_styleScopedClasses['question-score-input'];
    __VLS_styleScopedClasses['add-question'];
    __VLS_styleScopedClasses['empty-state'];
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
            activeSubject: activeSubject,
            currentConfig: currentConfig,
            addQuestion: addQuestion,
            removeQuestion: removeQuestion,
            handleClose: handleClose,
            handleConfirm: handleConfirm,
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
//# sourceMappingURL=SubjectBenchmarkDialog.vue.js.map