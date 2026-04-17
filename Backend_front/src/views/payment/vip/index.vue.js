/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { CircleCheck, Edit, Money, Plus, School } from '@element-plus/icons-vue';
import { fetchGetSchoolOptions } from '@/api/core-business/school';
import { fetchVipPackages, toggleVipStatus } from '@/api/payment/vip';
import BenefitsDialog from './modules/benefits-dialog.vue';
import PackageDialog from './modules/package-dialog.vue';
import PriceDialog from './modules/price-dialog.vue';
import SchoolDialog from './modules/school-dialog.vue';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const loading = ref(false);
const packages = ref([]);
const schoolOptions = ref([]);
const priceVisible = ref(false);
const benefitsVisible = ref(false);
const packageVisible = ref(false);
const schoolVisible = ref(false);
const currentPackage = ref(null);
const parseBenefits = (benefits) => {
    if (Array.isArray(benefits))
        return benefits;
    try {
        const parsed = JSON.parse(benefits || '[]');
        return Array.isArray(parsed) ? parsed : [];
    }
    catch {
        return [];
    }
};
const getSchoolIds = (pkg) => {
    if (!Array.isArray(pkg?.schools))
        return [];
    return pkg.schools.map((item) => item?.schoolId).filter(Boolean);
};
const getSchoolName = (schoolId) => {
    const school = schoolOptions.value.find(item => item.id === schoolId);
    return school?.name || schoolId;
};
const getList = async () => {
    loading.value = true;
    try {
        const [packageRes, schoolRes] = await Promise.all([fetchVipPackages(), fetchGetSchoolOptions()]);
        packages.value = Array.isArray(packageRes) ? packageRes : [];
        schoolOptions.value = Array.isArray(schoolRes) ? schoolRes : [];
    }
    finally {
        loading.value = false;
    }
};
const handleStatusChange = async (pkg) => {
    try {
        await toggleVipStatus(pkg.id, pkg.isEnabled);
        ElMessage.success(`${pkg.title} 状态已更新`);
    }
    catch {
        pkg.isEnabled = pkg.isEnabled === 1 ? 0 : 1;
    }
};
const handleEditPrice = (pkg) => {
    currentPackage.value = pkg;
    priceVisible.value = true;
};
const handleEditBenefits = (pkg) => {
    currentPackage.value = pkg;
    benefitsVisible.value = true;
};
const handleEditSchools = (pkg) => {
    currentPackage.value = pkg;
    schoolVisible.value = true;
};
onMounted(() => {
    getList();
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("vip-package-container p-5") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("page-header mb-5 flex items-center justify-between rounded-lg bg-white p-5 shadow-sm") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({ ...{ class: ("text-xl font-bold text-gray-800") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("mt-1 text-sm text-gray-500") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ type: ("primary"), icon: ((__VLS_ctx.Plus)), disabled: (true), }));
    const __VLS_2 = __VLS_1({ type: ("primary"), icon: ((__VLS_ctx.Plus)), disabled: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("package-list grid grid-cols-1 gap-6 md:grid-cols-2") }, });
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.loading) }, null, null);
    for (const [pkg] of __VLS_getVForSourceType((__VLS_ctx.packages))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ key: ((pkg.id)), ...{ class: ("package-card overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md transition-all hover:shadow-lg") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ((['card-header p-6', pkg.tierCode === 'SVIP' ? 'bg-indigo-600' : 'bg-blue-500'])) }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex items-start justify-between") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("mb-2 inline-block rounded-full bg-white/20 px-2 py-0.5 text-xs text-white") }, });
        (pkg.tierCode);
        __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({ ...{ class: ("text-2xl font-bold text-white") }, });
        (pkg.title);
        const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElSwitch;
        /** @type { [typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ] } */
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ ...{ 'onChange': {} }, modelValue: ((pkg.isEnabled)), activeValue: ((1)), inactiveValue: ((0)), activeColor: ("#13ce66"), inactiveColor: ("#ff4949"), }));
        const __VLS_8 = __VLS_7({ ...{ 'onChange': {} }, modelValue: ((pkg.isEnabled)), activeValue: ((1)), inactiveValue: ((0)), activeColor: ("#13ce66"), inactiveColor: ("#ff4949"), }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        let __VLS_12;
        const __VLS_13 = {
            onChange: (...[$event]) => {
                __VLS_ctx.handleStatusChange(pkg);
            }
        };
        let __VLS_9;
        let __VLS_10;
        var __VLS_11;
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("mt-2 text-sm text-white/80") }, });
        (pkg.subTitle);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("p-6") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mb-6") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({ ...{ class: ("mb-3 flex items-center text-sm font-bold text-gray-700") }, });
        const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ ...{ class: ("mr-2 text-blue-500") }, }));
        const __VLS_16 = __VLS_15({ ...{ class: ("mr-2 text-blue-500") }, }, ...__VLS_functionalComponentArgsRest(__VLS_15));
        const __VLS_20 = __VLS_resolvedLocalAndGlobalComponents.CircleCheck;
        /** @type { [typeof __VLS_components.CircleCheck, ] } */
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
        const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
        __VLS_nonNullable(__VLS_19.slots).default;
        var __VLS_19;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex flex-wrap gap-2") }, });
        for (const [feature] of __VLS_getVForSourceType((__VLS_ctx.parseBenefits(pkg.benefits)))) {
            const __VLS_26 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
            /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
            // @ts-ignore
            const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({ key: ((feature)), size: ("small"), effect: ("plain"), type: ("info"), }));
            const __VLS_28 = __VLS_27({ key: ((feature)), size: ("small"), effect: ("plain"), type: ("info"), }, ...__VLS_functionalComponentArgsRest(__VLS_27));
            (feature);
            __VLS_nonNullable(__VLS_31.slots).default;
            var __VLS_31;
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mb-6 rounded-lg bg-gray-50 p-4") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({ ...{ class: ("mb-4 flex items-center justify-between text-sm font-bold text-gray-700") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("flex items-center") }, });
        const __VLS_32 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({ ...{ class: ("mr-2 text-orange-500") }, }));
        const __VLS_34 = __VLS_33({ ...{ class: ("mr-2 text-orange-500") }, }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        const __VLS_38 = __VLS_resolvedLocalAndGlobalComponents.Money;
        /** @type { [typeof __VLS_components.Money, ] } */
        // @ts-ignore
        const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({}));
        const __VLS_40 = __VLS_39({}, ...__VLS_functionalComponentArgsRest(__VLS_39));
        __VLS_nonNullable(__VLS_37.slots).default;
        var __VLS_37;
        const __VLS_44 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({ ...{ 'onClick': {} }, link: (true), type: ("primary"), icon: ((__VLS_ctx.Edit)), }));
        const __VLS_46 = __VLS_45({ ...{ 'onClick': {} }, link: (true), type: ("primary"), icon: ((__VLS_ctx.Edit)), }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        let __VLS_50;
        const __VLS_51 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleEditPrice(pkg);
            }
        };
        let __VLS_47;
        let __VLS_48;
        __VLS_nonNullable(__VLS_49.slots).default;
        var __VLS_49;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("grid grid-cols-3 gap-4") }, });
        for (const [price] of __VLS_getVForSourceType((pkg.pricings))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ key: ((price.id)), ...{ class: ("border-r border-gray-200 text-center last:border-r-0") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mb-1 text-xs text-gray-500") }, });
            (price.pkgName);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("text-lg font-bold text-red-500") }, });
            (price.currentPrice);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("text-xs text-gray-400 line-through") }, });
            (price.originalPrice);
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mb-6") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({ ...{ class: ("mb-3 flex items-center justify-between text-sm font-bold text-gray-700") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("flex items-center") }, });
        const __VLS_52 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({ ...{ class: ("mr-2 text-emerald-500") }, }));
        const __VLS_54 = __VLS_53({ ...{ class: ("mr-2 text-emerald-500") }, }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        const __VLS_58 = __VLS_resolvedLocalAndGlobalComponents.School;
        /** @type { [typeof __VLS_components.School, ] } */
        // @ts-ignore
        const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({}));
        const __VLS_60 = __VLS_59({}, ...__VLS_functionalComponentArgsRest(__VLS_59));
        __VLS_nonNullable(__VLS_57.slots).default;
        var __VLS_57;
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-xs text-gray-400") }, });
        (__VLS_ctx.getSchoolIds(pkg).length);
        if (__VLS_ctx.getSchoolIds(pkg).length) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex flex-wrap gap-2") }, });
            for (const [schoolId] of __VLS_getVForSourceType((__VLS_ctx.getSchoolIds(pkg).slice(0, 4)))) {
                const __VLS_64 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({ key: ((schoolId)), size: ("small"), effect: ("plain"), type: ("success"), }));
                const __VLS_66 = __VLS_65({ key: ((schoolId)), size: ("small"), effect: ("plain"), type: ("success"), }, ...__VLS_functionalComponentArgsRest(__VLS_65));
                (__VLS_ctx.getSchoolName(schoolId));
                __VLS_nonNullable(__VLS_69.slots).default;
                var __VLS_69;
            }
            if (__VLS_ctx.getSchoolIds(pkg).length > 4) {
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-xs leading-6 text-gray-400") }, });
                (__VLS_ctx.getSchoolIds(pkg).length - 4);
            }
        }
        else {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("text-sm text-gray-400") }, });
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-between border-t border-gray-100 bg-gray-50/50 p-6") }, });
        const __VLS_70 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({ ...{ 'onClick': {} }, }));
        const __VLS_72 = __VLS_71({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_71));
        let __VLS_76;
        const __VLS_77 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleEditBenefits(pkg);
            }
        };
        let __VLS_73;
        let __VLS_74;
        __VLS_nonNullable(__VLS_75.slots).default;
        var __VLS_75;
        const __VLS_78 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({ ...{ 'onClick': {} }, type: ("primary"), plain: (true), }));
        const __VLS_80 = __VLS_79({ ...{ 'onClick': {} }, type: ("primary"), plain: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_79));
        let __VLS_84;
        const __VLS_85 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleEditSchools(pkg);
            }
        };
        let __VLS_81;
        let __VLS_82;
        __VLS_nonNullable(__VLS_83.slots).default;
        var __VLS_83;
    }
    // @ts-ignore
    [PriceDialog,];
    // @ts-ignore
    const __VLS_86 = __VLS_asFunctionalComponent(PriceDialog, new PriceDialog({ ...{ 'onSuccess': {} }, modelValue: ((__VLS_ctx.priceVisible)), packageData: ((__VLS_ctx.currentPackage)), }));
    const __VLS_87 = __VLS_86({ ...{ 'onSuccess': {} }, modelValue: ((__VLS_ctx.priceVisible)), packageData: ((__VLS_ctx.currentPackage)), }, ...__VLS_functionalComponentArgsRest(__VLS_86));
    let __VLS_91;
    const __VLS_92 = {
        onSuccess: (__VLS_ctx.getList)
    };
    let __VLS_88;
    let __VLS_89;
    var __VLS_90;
    // @ts-ignore
    [BenefitsDialog,];
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(BenefitsDialog, new BenefitsDialog({ ...{ 'onSuccess': {} }, modelValue: ((__VLS_ctx.benefitsVisible)), packageData: ((__VLS_ctx.currentPackage)), }));
    const __VLS_94 = __VLS_93({ ...{ 'onSuccess': {} }, modelValue: ((__VLS_ctx.benefitsVisible)), packageData: ((__VLS_ctx.currentPackage)), }, ...__VLS_functionalComponentArgsRest(__VLS_93));
    let __VLS_98;
    const __VLS_99 = {
        onSuccess: (__VLS_ctx.getList)
    };
    let __VLS_95;
    let __VLS_96;
    var __VLS_97;
    // @ts-ignore
    [PackageDialog,];
    // @ts-ignore
    const __VLS_100 = __VLS_asFunctionalComponent(PackageDialog, new PackageDialog({ ...{ 'onSuccess': {} }, modelValue: ((__VLS_ctx.packageVisible)), packageData: ((__VLS_ctx.currentPackage)), }));
    const __VLS_101 = __VLS_100({ ...{ 'onSuccess': {} }, modelValue: ((__VLS_ctx.packageVisible)), packageData: ((__VLS_ctx.currentPackage)), }, ...__VLS_functionalComponentArgsRest(__VLS_100));
    let __VLS_105;
    const __VLS_106 = {
        onSuccess: (__VLS_ctx.getList)
    };
    let __VLS_102;
    let __VLS_103;
    var __VLS_104;
    // @ts-ignore
    [SchoolDialog,];
    // @ts-ignore
    const __VLS_107 = __VLS_asFunctionalComponent(SchoolDialog, new SchoolDialog({ ...{ 'onSuccess': {} }, modelValue: ((__VLS_ctx.schoolVisible)), packageData: ((__VLS_ctx.currentPackage)), schoolOptions: ((__VLS_ctx.schoolOptions)), }));
    const __VLS_108 = __VLS_107({ ...{ 'onSuccess': {} }, modelValue: ((__VLS_ctx.schoolVisible)), packageData: ((__VLS_ctx.currentPackage)), schoolOptions: ((__VLS_ctx.schoolOptions)), }, ...__VLS_functionalComponentArgsRest(__VLS_107));
    let __VLS_112;
    const __VLS_113 = {
        onSuccess: (__VLS_ctx.getList)
    };
    let __VLS_109;
    let __VLS_110;
    var __VLS_111;
    __VLS_styleScopedClasses['vip-package-container'];
    __VLS_styleScopedClasses['p-5'];
    __VLS_styleScopedClasses['page-header'];
    __VLS_styleScopedClasses['mb-5'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['rounded-lg'];
    __VLS_styleScopedClasses['bg-white'];
    __VLS_styleScopedClasses['p-5'];
    __VLS_styleScopedClasses['shadow-sm'];
    __VLS_styleScopedClasses['text-xl'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['text-gray-800'];
    __VLS_styleScopedClasses['mt-1'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['text-gray-500'];
    __VLS_styleScopedClasses['package-list'];
    __VLS_styleScopedClasses['grid'];
    __VLS_styleScopedClasses['grid-cols-1'];
    __VLS_styleScopedClasses['gap-6'];
    __VLS_styleScopedClasses['md:grid-cols-2'];
    __VLS_styleScopedClasses['package-card'];
    __VLS_styleScopedClasses['overflow-hidden'];
    __VLS_styleScopedClasses['rounded-xl'];
    __VLS_styleScopedClasses['border'];
    __VLS_styleScopedClasses['border-gray-100'];
    __VLS_styleScopedClasses['bg-white'];
    __VLS_styleScopedClasses['shadow-md'];
    __VLS_styleScopedClasses['transition-all'];
    __VLS_styleScopedClasses['hover:shadow-lg'];
    __VLS_styleScopedClasses['card-header'];
    __VLS_styleScopedClasses['p-6'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-start'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['mb-2'];
    __VLS_styleScopedClasses['inline-block'];
    __VLS_styleScopedClasses['rounded-full'];
    __VLS_styleScopedClasses['bg-white/20'];
    __VLS_styleScopedClasses['px-2'];
    __VLS_styleScopedClasses['py-0.5'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-white'];
    __VLS_styleScopedClasses['text-2xl'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['text-white'];
    __VLS_styleScopedClasses['mt-2'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['text-white/80'];
    __VLS_styleScopedClasses['p-6'];
    __VLS_styleScopedClasses['mb-6'];
    __VLS_styleScopedClasses['mb-3'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['text-gray-700'];
    __VLS_styleScopedClasses['mr-2'];
    __VLS_styleScopedClasses['text-blue-500'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['flex-wrap'];
    __VLS_styleScopedClasses['gap-2'];
    __VLS_styleScopedClasses['mb-6'];
    __VLS_styleScopedClasses['rounded-lg'];
    __VLS_styleScopedClasses['bg-gray-50'];
    __VLS_styleScopedClasses['p-4'];
    __VLS_styleScopedClasses['mb-4'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['text-gray-700'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['mr-2'];
    __VLS_styleScopedClasses['text-orange-500'];
    __VLS_styleScopedClasses['grid'];
    __VLS_styleScopedClasses['grid-cols-3'];
    __VLS_styleScopedClasses['gap-4'];
    __VLS_styleScopedClasses['border-r'];
    __VLS_styleScopedClasses['border-gray-200'];
    __VLS_styleScopedClasses['text-center'];
    __VLS_styleScopedClasses['last:border-r-0'];
    __VLS_styleScopedClasses['mb-1'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-gray-500'];
    __VLS_styleScopedClasses['text-lg'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['text-red-500'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-gray-400'];
    __VLS_styleScopedClasses['line-through'];
    __VLS_styleScopedClasses['mb-6'];
    __VLS_styleScopedClasses['mb-3'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['text-gray-700'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['mr-2'];
    __VLS_styleScopedClasses['text-emerald-500'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-gray-400'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['flex-wrap'];
    __VLS_styleScopedClasses['gap-2'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['leading-6'];
    __VLS_styleScopedClasses['text-gray-400'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['text-gray-400'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['border-t'];
    __VLS_styleScopedClasses['border-gray-100'];
    __VLS_styleScopedClasses['bg-gray-50/50'];
    __VLS_styleScopedClasses['p-6'];
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
            CircleCheck: CircleCheck,
            Edit: Edit,
            Money: Money,
            Plus: Plus,
            School: School,
            BenefitsDialog: BenefitsDialog,
            PackageDialog: PackageDialog,
            PriceDialog: PriceDialog,
            SchoolDialog: SchoolDialog,
            loading: loading,
            packages: packages,
            schoolOptions: schoolOptions,
            priceVisible: priceVisible,
            benefitsVisible: benefitsVisible,
            packageVisible: packageVisible,
            schoolVisible: schoolVisible,
            currentPackage: currentPackage,
            parseBenefits: parseBenefits,
            getSchoolIds: getSchoolIds,
            getSchoolName: getSchoolName,
            getList: getList,
            handleStatusChange: handleStatusChange,
            handleEditPrice: handleEditPrice,
            handleEditBenefits: handleEditBenefits,
            handleEditSchools: handleEditSchools,
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