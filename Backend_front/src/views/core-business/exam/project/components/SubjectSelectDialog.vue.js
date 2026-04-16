/// <reference types="../../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, computed, watch } from 'vue';
import { Check } from '@element-plus/icons-vue';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps();
const emit = defineEmits();
const searchKeyword = ref('');
const localSelected = ref([]);
watch(() => props.modelValue, (val) => {
    if (val) {
        localSelected.value = [...props.selected];
        searchKeyword.value = '';
    }
});
const filteredSubjects = computed(() => {
    if (!searchKeyword.value)
        return props.subjects;
    return props.subjects.filter(s => s.toLowerCase().includes(searchKeyword.value.toLowerCase()));
});
function toggleSubject(subject) {
    const index = localSelected.value.indexOf(subject);
    if (index >= 0) {
        localSelected.value.splice(index, 1);
    }
    else {
        localSelected.value.push(subject);
    }
}
function handleClose() {
    emit('update:modelValue', false);
}
function handleConfirm() {
    emit('confirm', [...localSelected.value]);
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
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.modelValue)), title: ("选取学科"), width: ("600px"), alignCenter: (true), appendToBody: (true), }));
    const __VLS_2 = __VLS_1({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.modelValue)), title: ("选取学科"), width: ("600px"), alignCenter: (true), appendToBody: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_6 = {};
    let __VLS_7;
    const __VLS_8 = {
        onClose: (__VLS_ctx.handleClose)
    };
    let __VLS_3;
    let __VLS_4;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("subject-select-container") }, });
    const __VLS_9 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({ modelValue: ((__VLS_ctx.searchKeyword)), placeholder: ("搜索学科名称"), prefixIcon: ("Search"), clearable: (true), ...{ class: ("mb-4") }, }));
    const __VLS_11 = __VLS_10({ modelValue: ((__VLS_ctx.searchKeyword)), placeholder: ("搜索学科名称"), prefixIcon: ("Search"), clearable: (true), ...{ class: ("mb-4") }, }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("subject-header") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("selected-count") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("highlight") }, });
    (__VLS_ctx.localSelected.length);
    const __VLS_15 = __VLS_resolvedLocalAndGlobalComponents.ElScrollbar;
    /** @type { [typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, ] } */
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({ maxHeight: ("400px"), }));
    const __VLS_17 = __VLS_16({ maxHeight: ("400px"), }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("subject-grid") }, });
    for (const [subject] of __VLS_getVForSourceType((__VLS_ctx.filteredSubjects))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.toggleSubject(subject);
                } }, key: ((subject)), ...{ class: ("subject-item") }, ...{ class: (({ active: __VLS_ctx.localSelected.includes(subject) })) }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (subject);
        if (__VLS_ctx.localSelected.includes(subject)) {
            const __VLS_21 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
            /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
            // @ts-ignore
            const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({}));
            const __VLS_23 = __VLS_22({}, ...__VLS_functionalComponentArgsRest(__VLS_22));
            const __VLS_27 = __VLS_resolvedLocalAndGlobalComponents.Check;
            /** @type { [typeof __VLS_components.Check, ] } */
            // @ts-ignore
            const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({}));
            const __VLS_29 = __VLS_28({}, ...__VLS_functionalComponentArgsRest(__VLS_28));
            __VLS_nonNullable(__VLS_26.slots).default;
            var __VLS_26;
        }
    }
    __VLS_nonNullable(__VLS_20.slots).default;
    var __VLS_20;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        const __VLS_33 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({ ...{ 'onClick': {} }, }));
        const __VLS_35 = __VLS_34({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_34));
        let __VLS_39;
        const __VLS_40 = {
            onClick: (__VLS_ctx.handleClose)
        };
        let __VLS_36;
        let __VLS_37;
        __VLS_nonNullable(__VLS_38.slots).default;
        var __VLS_38;
        const __VLS_41 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_43 = __VLS_42({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_42));
        let __VLS_47;
        const __VLS_48 = {
            onClick: (__VLS_ctx.handleConfirm)
        };
        let __VLS_44;
        let __VLS_45;
        __VLS_nonNullable(__VLS_46.slots).default;
        var __VLS_46;
    }
    var __VLS_5;
    __VLS_styleScopedClasses['subject-select-container'];
    __VLS_styleScopedClasses['mb-4'];
    __VLS_styleScopedClasses['subject-header'];
    __VLS_styleScopedClasses['selected-count'];
    __VLS_styleScopedClasses['highlight'];
    __VLS_styleScopedClasses['subject-grid'];
    __VLS_styleScopedClasses['subject-item'];
    __VLS_styleScopedClasses['active'];
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
            Check: Check,
            searchKeyword: searchKeyword,
            localSelected: localSelected,
            filteredSubjects: filteredSubjects,
            toggleSubject: toggleSubject,
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
//# sourceMappingURL=SubjectSelectDialog.vue.js.map