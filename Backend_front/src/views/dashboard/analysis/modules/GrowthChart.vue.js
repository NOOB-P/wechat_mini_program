/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps({
    data: {
        type: Object,
        default: () => ({})
    }
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_fnComponent = (await import('vue')).defineComponent({
    props: {
        data: {
            type: Object,
            default: () => ({})
        }
    },
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
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-card h-105 p-4 box-border mb-5 max-sm:mb-4") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-between items-center px-2 pt-2") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("font-bold text-lg") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
    /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ type: ("success"), }));
    const __VLS_2 = __VLS_1({ type: ("success"), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    if (props.data?.dates) {
        const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ArtLineChart;
        /** @type { [typeof __VLS_components.ArtLineChart, ] } */
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ data: ((props.data?.values)), xAxisData: ((props.data?.dates)), height: ("18rem"), lineWidth: ((3)), showAreaColor: ((true)), smooth: ((true)), }));
        const __VLS_8 = __VLS_7({ data: ((props.data?.values)), xAxisData: ((props.data?.dates)), height: ("18rem"), lineWidth: ((3)), showAreaColor: ((true)), smooth: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    }
    __VLS_styleScopedClasses['art-card'];
    __VLS_styleScopedClasses['h-105'];
    __VLS_styleScopedClasses['p-4'];
    __VLS_styleScopedClasses['box-border'];
    __VLS_styleScopedClasses['mb-5'];
    __VLS_styleScopedClasses['max-sm:mb-4'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['px-2'];
    __VLS_styleScopedClasses['pt-2'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['text-lg'];
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
        return {};
    },
    props: {
        data: {
            type: Object,
            default: () => ({})
        }
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        data: {
            type: Object,
            default: () => ({})
        }
    },
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=GrowthChart.vue.js.map