/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import CardList from './modules/card-list.vue';
import ActiveUser from './modules/active-user.vue';
import SalesOverview from './modules/sales-overview.vue';
import NewUser from './modules/new-user.vue';
import Dynamic from './modules/dynamic-stats.vue';
import TodoList from './modules/todo-list.vue';
import AboutProject from './modules/about-project.vue';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'Console' }); /* PartiallyEnd: #3632/scriptSetup.vue */
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    // @ts-ignore
    [CardList,];
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(CardList, new CardList({}));
    const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
    const __VLS_5 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.ElRow, ] } */
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({ gutter: ((20)), }));
    const __VLS_7 = __VLS_6({ gutter: ((20)), }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    const __VLS_11 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent(__VLS_11, new __VLS_11({ sm: ((24)), md: ((12)), lg: ((10)), }));
    const __VLS_13 = __VLS_12({ sm: ((24)), md: ((12)), lg: ((10)), }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    // @ts-ignore
    [ActiveUser,];
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(ActiveUser, new ActiveUser({}));
    const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_nonNullable(__VLS_16.slots).default;
    var __VLS_16;
    const __VLS_22 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({ sm: ((24)), md: ((12)), lg: ((14)), }));
    const __VLS_24 = __VLS_23({ sm: ((24)), md: ((12)), lg: ((14)), }, ...__VLS_functionalComponentArgsRest(__VLS_23));
    // @ts-ignore
    [SalesOverview,];
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent(SalesOverview, new SalesOverview({}));
    const __VLS_29 = __VLS_28({}, ...__VLS_functionalComponentArgsRest(__VLS_28));
    __VLS_nonNullable(__VLS_27.slots).default;
    var __VLS_27;
    __VLS_nonNullable(__VLS_10.slots).default;
    var __VLS_10;
    const __VLS_33 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.ElRow, ] } */
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({ gutter: ((20)), }));
    const __VLS_35 = __VLS_34({ gutter: ((20)), }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    const __VLS_39 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
    // @ts-ignore
    const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({ sm: ((24)), md: ((24)), lg: ((12)), }));
    const __VLS_41 = __VLS_40({ sm: ((24)), md: ((24)), lg: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_40));
    // @ts-ignore
    [NewUser,];
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(NewUser, new NewUser({}));
    const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
    __VLS_nonNullable(__VLS_44.slots).default;
    var __VLS_44;
    const __VLS_50 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({ sm: ((24)), md: ((12)), lg: ((6)), }));
    const __VLS_52 = __VLS_51({ sm: ((24)), md: ((12)), lg: ((6)), }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    // @ts-ignore
    [Dynamic,];
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent(Dynamic, new Dynamic({}));
    const __VLS_57 = __VLS_56({}, ...__VLS_functionalComponentArgsRest(__VLS_56));
    __VLS_nonNullable(__VLS_55.slots).default;
    var __VLS_55;
    const __VLS_61 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({ sm: ((24)), md: ((12)), lg: ((6)), }));
    const __VLS_63 = __VLS_62({ sm: ((24)), md: ((12)), lg: ((6)), }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    // @ts-ignore
    [TodoList,];
    // @ts-ignore
    const __VLS_67 = __VLS_asFunctionalComponent(TodoList, new TodoList({}));
    const __VLS_68 = __VLS_67({}, ...__VLS_functionalComponentArgsRest(__VLS_67));
    __VLS_nonNullable(__VLS_66.slots).default;
    var __VLS_66;
    __VLS_nonNullable(__VLS_38.slots).default;
    var __VLS_38;
    // @ts-ignore
    [AboutProject,];
    // @ts-ignore
    const __VLS_72 = __VLS_asFunctionalComponent(AboutProject, new AboutProject({}));
    const __VLS_73 = __VLS_72({}, ...__VLS_functionalComponentArgsRest(__VLS_72));
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
            CardList: CardList,
            ActiveUser: ActiveUser,
            SalesOverview: SalesOverview,
            NewUser: NewUser,
            Dynamic: Dynamic,
            TodoList: TodoList,
            AboutProject: AboutProject,
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