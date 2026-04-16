/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { useRouter } from 'vue-router';
import { useCommon } from '@/hooks/core/useCommon';
import { useUserStore } from '@/store/modules/user';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const router = useRouter();
const userStore = useUserStore();
const __VLS_props = withDefaults(defineProps(), {});
const { homePath } = useCommon();
const backHome = () => {
    const targetHomePath = homePath.value || '/';
    if (!userStore.isLogin) {
        router.push({
            name: 'Login',
            query: { redirect: targetHomePath }
        });
        return;
    }
    router.push(targetHomePath);
};
const refreshPage = () => {
    window.location.reload();
}; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({});
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("page-content !border-0 !bg-transparent min-h-screen flex-cc") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-cc max-md:!block max-md:text-center") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ThemeSvg;
    /** @type { [typeof __VLS_components.ThemeSvg, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ src: ((__VLS_ctx.data.imgUrl)), size: ("100%"), ...{ class: ("!w-100") }, }));
    const __VLS_2 = __VLS_1({ src: ((__VLS_ctx.data.imgUrl)), size: ("100%"), ...{ class: ("!w-100") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("ml-15 w-75 max-md:mx-auto max-md:mt-10 max-md:w-full max-md:text-center") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("text-xl leading-7 text-g-600 max-md:text-lg") }, });
    (__VLS_ctx.data.desc);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-5 flex items-center") }, });
    const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ ...{ 'onClick': {} }, type: ("primary"), size: ("large"), }));
    const __VLS_8 = __VLS_7({ ...{ 'onClick': {} }, type: ("primary"), size: ("large"), }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
    let __VLS_12;
    const __VLS_13 = {
        onClick: (__VLS_ctx.backHome)
    };
    let __VLS_9;
    let __VLS_10;
    (__VLS_ctx.data.btnText);
    __VLS_nonNullable(__VLS_11.slots).default;
    var __VLS_11;
    const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ ...{ 'onClick': {} }, size: ("large"), ...{ class: ("ml-4") }, }));
    const __VLS_16 = __VLS_15({ ...{ 'onClick': {} }, size: ("large"), ...{ class: ("ml-4") }, }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
    let __VLS_20;
    const __VLS_21 = {
        onClick: (__VLS_ctx.refreshPage)
    };
    let __VLS_17;
    let __VLS_18;
    __VLS_nonNullable(__VLS_19.slots).default;
    var __VLS_19;
    __VLS_styleScopedClasses['page-content'];
    __VLS_styleScopedClasses['!border-0'];
    __VLS_styleScopedClasses['!bg-transparent'];
    __VLS_styleScopedClasses['min-h-screen'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['max-md:!block'];
    __VLS_styleScopedClasses['max-md:text-center'];
    __VLS_styleScopedClasses['!w-100'];
    __VLS_styleScopedClasses['ml-15'];
    __VLS_styleScopedClasses['w-75'];
    __VLS_styleScopedClasses['max-md:mx-auto'];
    __VLS_styleScopedClasses['max-md:mt-10'];
    __VLS_styleScopedClasses['max-md:w-full'];
    __VLS_styleScopedClasses['max-md:text-center'];
    __VLS_styleScopedClasses['text-xl'];
    __VLS_styleScopedClasses['leading-7'];
    __VLS_styleScopedClasses['text-g-600'];
    __VLS_styleScopedClasses['max-md:text-lg'];
    __VLS_styleScopedClasses['mt-5'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['ml-4'];
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
            backHome: backHome,
            refreshPage: refreshPage,
        };
    },
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
    props: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=ArtException.vue.js.map