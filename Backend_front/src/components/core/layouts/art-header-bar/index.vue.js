/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useFullscreen, useWindowSize } from '@vueuse/core';
import { MenuTypeEnum } from '@/enums/appEnum';
import { useSettingStore } from '@/store/modules/setting';
import { useUserStore } from '@/store/modules/user';
import { useMenuStore } from '@/store/modules/menu';
import AppConfig from '@/config';
import { mittBus } from '@/utils/sys';
import { themeAnimation } from '@/utils/ui/animation';
import { useCommon } from '@/hooks/core/useCommon';
import { useHeaderBar } from '@/hooks/core/useHeaderBar';
import ArtUserMenu from './widget/ArtUserMenu.vue';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtHeaderBar' });
// 检测操作系统类型
const isWindows = navigator.userAgent.includes('Windows');
const router = useRouter();
const { locale } = useI18n();
const { width } = useWindowSize();
const settingStore = useSettingStore();
const userStore = useUserStore();
const menuStore = useMenuStore();
// 顶部栏功能配置
const { shouldShowMenuButton, shouldShowRefreshButton, shouldShowFastEnter, shouldShowBreadcrumb, shouldShowGlobalSearch, shouldShowFullscreen, shouldShowNotification, shouldShowChat, shouldShowLanguage, shouldShowSettings, shouldShowThemeToggle, fastEnterMinWidth: headerBarFastEnterMinWidth } = useHeaderBar();
const { menuOpen, systemThemeColor, showSettingGuide, menuType, isDark, tabStyle } = storeToRefs(settingStore);
const { language } = storeToRefs(userStore);
const { menuList } = storeToRefs(menuStore);
const showNotice = ref(false);
const notice = ref(null);
// 菜单类型判断
const isLeftMenu = computed(() => menuType.value === MenuTypeEnum.LEFT);
const isDualMenu = computed(() => menuType.value === MenuTypeEnum.DUAL_MENU);
const isTopMenu = computed(() => menuType.value === MenuTypeEnum.TOP);
const isTopLeftMenu = computed(() => menuType.value === MenuTypeEnum.TOP_LEFT);
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
onMounted(() => {
    initLanguage();
    document.addEventListener('click', bodyCloseNotice);
});
onUnmounted(() => {
    document.removeEventListener('click', bodyCloseNotice);
});
/**
 * 切换全屏状态
 */
const toggleFullScreen = () => {
    toggleFullscreen();
};
/**
 * 切换菜单显示/隐藏状态
 */
const visibleMenu = () => {
    settingStore.setMenuOpen(!menuOpen.value);
};
const { homePath } = useCommon();
const { refresh } = useCommon();
/**
 * 跳转到首页
 */
const toHome = () => {
    router.push(homePath.value);
};
/**
 * 刷新页面
 * @param {number} time - 延迟时间，默认为0毫秒
 */
const reload = (time = 0) => {
    setTimeout(() => {
        refresh();
    }, time);
};
/**
 * 初始化语言设置
 */
const initLanguage = () => {
    locale.value = language.value;
};
/**
 * 切换系统语言
 * @param {LanguageEnum} lang - 目标语言类型
 */
const changeLanguage = (lang) => {
    if (locale.value === lang)
        return;
    locale.value = lang;
    userStore.setLanguage(lang);
    reload(50);
};
/**
 * 打开设置面板
 */
const openSetting = () => {
    mittBus.emit('openSetting');
    // 隐藏设置引导提示
    if (showSettingGuide.value) {
        settingStore.hideSettingGuide();
    }
};
/**
 * 打开全局搜索对话框
 */
const openSearchDialog = () => {
    mittBus.emit('openSearchDialog');
};
/**
 * 点击页面其他区域关闭通知面板
 * @param {Event} e - 点击事件对象
 */
const bodyCloseNotice = (e) => {
    if (!showNotice.value)
        return;
    const target = e.target;
    // 检查是否点击了通知按钮或通知面板内部
    const isNoticeButton = target.closest('.notice-button');
    const isNoticePanel = target.closest('.art-notification-panel');
    if (!isNoticeButton && !isNoticePanel) {
        showNotice.value = false;
    }
};
/**
 * 切换通知面板显示状态
 */
const visibleNotice = () => {
    showNotice.value = !showNotice.value;
};
/**
 * 打开聊天窗口
 */
const openChat = () => {
    mittBus.emit('openChat');
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
    __VLS_styleScopedClasses['art-svg-icon'];
    __VLS_styleScopedClasses['art-svg-icon'];
    __VLS_styleScopedClasses['art-svg-icon'];
    __VLS_styleScopedClasses['art-svg-icon'];
    __VLS_styleScopedClasses['art-svg-icon'];
    __VLS_styleScopedClasses['art-svg-icon'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("w-full bg-[var(--default-bg-color)]") }, ...{ class: (([
                __VLS_ctx.tabStyle === 'tab-card' || __VLS_ctx.tabStyle === 'tab-google' ? 'mb-5 max-sm:mb-3 !bg-box' : ''
            ])) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("relative box-border flex-b h-15 leading-15 select-none") }, ...{ class: (([
                __VLS_ctx.tabStyle === 'tab-card' || __VLS_ctx.tabStyle === 'tab-google'
                    ? 'border-b border-[var(--art-card-border)]'
                    : ''
            ])) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-c flex-1 min-w-0 leading-15") }, ...{ style: ({}) }, });
    if (__VLS_ctx.isTopMenu) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.toHome) }, ...{ class: ("flex-c c-p") }, });
        const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ArtLogo;
        /** @type { [typeof __VLS_components.ArtLogo, ] } */
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ class: ("pl-4.5") }, }));
        const __VLS_2 = __VLS_1({ ...{ class: ("pl-4.5") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        if (__VLS_ctx.width >= 1400) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("my-0 mx-2 ml-2 text-lg") }, });
            (__VLS_ctx.AppConfig.systemInfo.name);
        }
    }
    const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ArtLogo;
    /** @type { [typeof __VLS_components.ArtLogo, ] } */
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ ...{ 'onClick': {} }, ...{ class: ("!hidden pl-3.5 overflow-hidden align-[-0.15em] fill-current") }, }));
    const __VLS_8 = __VLS_7({ ...{ 'onClick': {} }, ...{ class: ("!hidden pl-3.5 overflow-hidden align-[-0.15em] fill-current") }, }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    let __VLS_12;
    const __VLS_13 = {
        onClick: (__VLS_ctx.toHome)
    };
    let __VLS_9;
    let __VLS_10;
    var __VLS_11;
    if (__VLS_ctx.isLeftMenu && __VLS_ctx.shouldShowMenuButton) {
        const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ArtIconButton;
        /** @type { [typeof __VLS_components.ArtIconButton, ] } */
        // @ts-ignore
        const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ ...{ 'onClick': {} }, icon: ("ri:menu-2-fill"), ...{ class: ("ml-3 max-sm:ml-[7px]") }, }));
        const __VLS_16 = __VLS_15({ ...{ 'onClick': {} }, icon: ("ri:menu-2-fill"), ...{ class: ("ml-3 max-sm:ml-[7px]") }, }, ...__VLS_functionalComponentArgsRest(__VLS_15));
        let __VLS_20;
        const __VLS_21 = {
            onClick: (__VLS_ctx.visibleMenu)
        };
        let __VLS_17;
        let __VLS_18;
        var __VLS_19;
    }
    if (__VLS_ctx.shouldShowRefreshButton) {
        const __VLS_22 = __VLS_resolvedLocalAndGlobalComponents.ArtIconButton;
        /** @type { [typeof __VLS_components.ArtIconButton, ] } */
        // @ts-ignore
        const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({ ...{ 'onClick': {} }, icon: ("ri:refresh-line"), ...{ class: ("!ml-3 refresh-btn max-sm:!hidden") }, ...{ style: (({ marginLeft: !__VLS_ctx.isLeftMenu ? '10px' : '0' })) }, }));
        const __VLS_24 = __VLS_23({ ...{ 'onClick': {} }, icon: ("ri:refresh-line"), ...{ class: ("!ml-3 refresh-btn max-sm:!hidden") }, ...{ style: (({ marginLeft: !__VLS_ctx.isLeftMenu ? '10px' : '0' })) }, }, ...__VLS_functionalComponentArgsRest(__VLS_23));
        let __VLS_28;
        const __VLS_29 = {
            onClick: (__VLS_ctx.reload)
        };
        let __VLS_25;
        let __VLS_26;
        var __VLS_27;
    }
    if (__VLS_ctx.shouldShowFastEnter && __VLS_ctx.width >= __VLS_ctx.headerBarFastEnterMinWidth) {
        const __VLS_30 = __VLS_resolvedLocalAndGlobalComponents.ArtFastEnter;
        /** @type { [typeof __VLS_components.ArtFastEnter, typeof __VLS_components.ArtFastEnter, ] } */
        // @ts-ignore
        const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({}));
        const __VLS_32 = __VLS_31({}, ...__VLS_functionalComponentArgsRest(__VLS_31));
        const __VLS_36 = __VLS_resolvedLocalAndGlobalComponents.ArtIconButton;
        /** @type { [typeof __VLS_components.ArtIconButton, ] } */
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({ icon: ("ri:function-line"), ...{ class: ("ml-3") }, }));
        const __VLS_38 = __VLS_37({ icon: ("ri:function-line"), ...{ class: ("ml-3") }, }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        __VLS_nonNullable(__VLS_35.slots).default;
        var __VLS_35;
    }
    if ((__VLS_ctx.shouldShowBreadcrumb && __VLS_ctx.isLeftMenu) || (__VLS_ctx.shouldShowBreadcrumb && __VLS_ctx.isDualMenu)) {
        const __VLS_42 = __VLS_resolvedLocalAndGlobalComponents.ArtBreadcrumb;
        /** @type { [typeof __VLS_components.ArtBreadcrumb, ] } */
        // @ts-ignore
        const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({}));
        const __VLS_44 = __VLS_43({}, ...__VLS_functionalComponentArgsRest(__VLS_43));
    }
    if (__VLS_ctx.isTopMenu) {
        const __VLS_48 = __VLS_resolvedLocalAndGlobalComponents.ArtHorizontalMenu;
        /** @type { [typeof __VLS_components.ArtHorizontalMenu, ] } */
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({ list: ((__VLS_ctx.menuList)), }));
        const __VLS_50 = __VLS_49({ list: ((__VLS_ctx.menuList)), }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    }
    if (__VLS_ctx.isTopLeftMenu) {
        const __VLS_54 = __VLS_resolvedLocalAndGlobalComponents.ArtMixedMenu;
        /** @type { [typeof __VLS_components.ArtMixedMenu, ] } */
        // @ts-ignore
        const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({ list: ((__VLS_ctx.menuList)), }));
        const __VLS_56 = __VLS_55({ list: ((__VLS_ctx.menuList)), }, ...__VLS_functionalComponentArgsRest(__VLS_55));
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-c gap-2.5") }, });
    if (__VLS_ctx.shouldShowGlobalSearch) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.openSearchDialog) }, ...{ class: ("flex-cb w-40 h-9 px-2.5 c-p border border-g-400 rounded-custom-sm max-md:!hidden") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-c") }, });
        const __VLS_60 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({ icon: ("ri:search-line"), ...{ class: ("text-sm text-g-500") }, }));
        const __VLS_62 = __VLS_61({ icon: ("ri:search-line"), ...{ class: ("text-sm text-g-500") }, }, ...__VLS_functionalComponentArgsRest(__VLS_61));
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("ml-1 text-xs font-normal text-g-500") }, });
        (__VLS_ctx.$t('topBar.search.title'));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-c h-5 px-1.5 text-g-500/80 border border-g-400 rounded") }, });
        if (__VLS_ctx.isWindows) {
            const __VLS_66 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({ icon: ("vaadin:ctrl-a"), ...{ class: ("text-sm") }, }));
            const __VLS_68 = __VLS_67({ icon: ("vaadin:ctrl-a"), ...{ class: ("text-sm") }, }, ...__VLS_functionalComponentArgsRest(__VLS_67));
        }
        else {
            const __VLS_72 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({ icon: ("ri:command-fill"), ...{ class: ("text-xs") }, }));
            const __VLS_74 = __VLS_73({ icon: ("ri:command-fill"), ...{ class: ("text-xs") }, }, ...__VLS_functionalComponentArgsRest(__VLS_73));
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("ml-0.5 text-xs") }, });
    }
    if (__VLS_ctx.shouldShowFullscreen) {
        const __VLS_78 = __VLS_resolvedLocalAndGlobalComponents.ArtIconButton;
        /** @type { [typeof __VLS_components.ArtIconButton, ] } */
        // @ts-ignore
        const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({ ...{ 'onClick': {} }, icon: ((__VLS_ctx.isFullscreen ? 'ri:fullscreen-exit-line' : 'ri:fullscreen-fill')), ...{ class: (([!__VLS_ctx.isFullscreen ? 'full-screen-btn' : 'exit-full-screen-btn', 'ml-3'])) }, ...{ class: ("max-md:!hidden") }, }));
        const __VLS_80 = __VLS_79({ ...{ 'onClick': {} }, icon: ((__VLS_ctx.isFullscreen ? 'ri:fullscreen-exit-line' : 'ri:fullscreen-fill')), ...{ class: (([!__VLS_ctx.isFullscreen ? 'full-screen-btn' : 'exit-full-screen-btn', 'ml-3'])) }, ...{ class: ("max-md:!hidden") }, }, ...__VLS_functionalComponentArgsRest(__VLS_79));
        let __VLS_84;
        const __VLS_85 = {
            onClick: (__VLS_ctx.toggleFullScreen)
        };
        let __VLS_81;
        let __VLS_82;
        var __VLS_83;
    }
    if (__VLS_ctx.shouldShowSettings) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_86 = __VLS_resolvedLocalAndGlobalComponents.ElPopover;
        /** @type { [typeof __VLS_components.ElPopover, typeof __VLS_components.ElPopover, ] } */
        // @ts-ignore
        const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({ visible: ((__VLS_ctx.showSettingGuide)), placement: ("bottom-start"), width: ((190)), offset: ((0)), }));
        const __VLS_88 = __VLS_87({ visible: ((__VLS_ctx.showSettingGuide)), placement: ("bottom-start"), width: ((190)), offset: ((0)), }, ...__VLS_functionalComponentArgsRest(__VLS_87));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { reference: __VLS_thisSlot } = __VLS_nonNullable(__VLS_91.slots);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-cc") }, });
            const __VLS_92 = __VLS_resolvedLocalAndGlobalComponents.ArtIconButton;
            /** @type { [typeof __VLS_components.ArtIconButton, ] } */
            // @ts-ignore
            const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({ ...{ 'onClick': {} }, icon: ("ri:settings-line"), ...{ class: ("setting-btn") }, }));
            const __VLS_94 = __VLS_93({ ...{ 'onClick': {} }, icon: ("ri:settings-line"), ...{ class: ("setting-btn") }, }, ...__VLS_functionalComponentArgsRest(__VLS_93));
            let __VLS_98;
            const __VLS_99 = {
                onClick: (__VLS_ctx.openSetting)
            };
            let __VLS_95;
            let __VLS_96;
            var __VLS_97;
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_91.slots);
            __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            (__VLS_ctx.$t('topBar.guide.title'));
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ style: (({ color: __VLS_ctx.systemThemeColor })) }, });
            (__VLS_ctx.$t('topBar.guide.theme'));
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ style: (({ color: __VLS_ctx.systemThemeColor })) }, });
            (__VLS_ctx.$t('topBar.guide.menu'));
            (__VLS_ctx.$t('topBar.guide.description'));
        }
        var __VLS_91;
    }
    if (__VLS_ctx.shouldShowThemeToggle) {
        const __VLS_100 = __VLS_resolvedLocalAndGlobalComponents.ArtIconButton;
        /** @type { [typeof __VLS_components.ArtIconButton, ] } */
        // @ts-ignore
        const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({ ...{ 'onClick': {} }, icon: ((__VLS_ctx.isDark ? 'ri:sun-fill' : 'ri:moon-line')), }));
        const __VLS_102 = __VLS_101({ ...{ 'onClick': {} }, icon: ((__VLS_ctx.isDark ? 'ri:sun-fill' : 'ri:moon-line')), }, ...__VLS_functionalComponentArgsRest(__VLS_101));
        let __VLS_106;
        const __VLS_107 = {
            onClick: (__VLS_ctx.themeAnimation)
        };
        let __VLS_103;
        let __VLS_104;
        var __VLS_105;
    }
    // @ts-ignore
    [ArtUserMenu,];
    // @ts-ignore
    const __VLS_108 = __VLS_asFunctionalComponent(ArtUserMenu, new ArtUserMenu({}));
    const __VLS_109 = __VLS_108({}, ...__VLS_functionalComponentArgsRest(__VLS_108));
    const __VLS_113 = __VLS_resolvedLocalAndGlobalComponents.ArtWorkTab;
    /** @type { [typeof __VLS_components.ArtWorkTab, ] } */
    // @ts-ignore
    const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({}));
    const __VLS_115 = __VLS_114({}, ...__VLS_functionalComponentArgsRest(__VLS_114));
    const __VLS_119 = __VLS_resolvedLocalAndGlobalComponents.ArtNotification;
    /** @type { [typeof __VLS_components.ArtNotification, ] } */
    // @ts-ignore
    const __VLS_120 = __VLS_asFunctionalComponent(__VLS_119, new __VLS_119({ value: ((__VLS_ctx.showNotice)), ref: ("notice"), }));
    const __VLS_121 = __VLS_120({ value: ((__VLS_ctx.showNotice)), ref: ("notice"), }, ...__VLS_functionalComponentArgsRest(__VLS_120));
    // @ts-ignore navigation for `const notice = ref()`
    __VLS_ctx.notice;
    var __VLS_125 = {};
    var __VLS_124;
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['bg-[var(--default-bg-color)]'];
    __VLS_styleScopedClasses['relative'];
    __VLS_styleScopedClasses['box-border'];
    __VLS_styleScopedClasses['flex-b'];
    __VLS_styleScopedClasses['h-15'];
    __VLS_styleScopedClasses['leading-15'];
    __VLS_styleScopedClasses['select-none'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['flex-1'];
    __VLS_styleScopedClasses['min-w-0'];
    __VLS_styleScopedClasses['leading-15'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['pl-4.5'];
    __VLS_styleScopedClasses['my-0'];
    __VLS_styleScopedClasses['mx-2'];
    __VLS_styleScopedClasses['ml-2'];
    __VLS_styleScopedClasses['text-lg'];
    __VLS_styleScopedClasses['!hidden'];
    __VLS_styleScopedClasses['pl-3.5'];
    __VLS_styleScopedClasses['overflow-hidden'];
    __VLS_styleScopedClasses['align-[-0.15em]'];
    __VLS_styleScopedClasses['fill-current'];
    __VLS_styleScopedClasses['ml-3'];
    __VLS_styleScopedClasses['max-sm:ml-[7px]'];
    __VLS_styleScopedClasses['!ml-3'];
    __VLS_styleScopedClasses['refresh-btn'];
    __VLS_styleScopedClasses['max-sm:!hidden'];
    __VLS_styleScopedClasses['ml-3'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['gap-2.5'];
    __VLS_styleScopedClasses['flex-cb'];
    __VLS_styleScopedClasses['w-40'];
    __VLS_styleScopedClasses['h-9'];
    __VLS_styleScopedClasses['px-2.5'];
    __VLS_styleScopedClasses['c-p'];
    __VLS_styleScopedClasses['border'];
    __VLS_styleScopedClasses['border-g-400'];
    __VLS_styleScopedClasses['rounded-custom-sm'];
    __VLS_styleScopedClasses['max-md:!hidden'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['text-g-500'];
    __VLS_styleScopedClasses['ml-1'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['font-normal'];
    __VLS_styleScopedClasses['text-g-500'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['h-5'];
    __VLS_styleScopedClasses['px-1.5'];
    __VLS_styleScopedClasses['text-g-500/80'];
    __VLS_styleScopedClasses['border'];
    __VLS_styleScopedClasses['border-g-400'];
    __VLS_styleScopedClasses['rounded'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['ml-0.5'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['ml-3'];
    __VLS_styleScopedClasses['max-md:!hidden'];
    __VLS_styleScopedClasses['flex-cc'];
    __VLS_styleScopedClasses['setting-btn'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "notice": __VLS_125,
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
            AppConfig: AppConfig,
            themeAnimation: themeAnimation,
            ArtUserMenu: ArtUserMenu,
            isWindows: isWindows,
            width: width,
            shouldShowMenuButton: shouldShowMenuButton,
            shouldShowRefreshButton: shouldShowRefreshButton,
            shouldShowFastEnter: shouldShowFastEnter,
            shouldShowBreadcrumb: shouldShowBreadcrumb,
            shouldShowGlobalSearch: shouldShowGlobalSearch,
            shouldShowFullscreen: shouldShowFullscreen,
            shouldShowSettings: shouldShowSettings,
            shouldShowThemeToggle: shouldShowThemeToggle,
            headerBarFastEnterMinWidth: headerBarFastEnterMinWidth,
            systemThemeColor: systemThemeColor,
            showSettingGuide: showSettingGuide,
            isDark: isDark,
            tabStyle: tabStyle,
            menuList: menuList,
            showNotice: showNotice,
            notice: notice,
            isLeftMenu: isLeftMenu,
            isDualMenu: isDualMenu,
            isTopMenu: isTopMenu,
            isTopLeftMenu: isTopLeftMenu,
            isFullscreen: isFullscreen,
            toggleFullScreen: toggleFullScreen,
            visibleMenu: visibleMenu,
            toHome: toHome,
            reload: reload,
            openSetting: openSetting,
            openSearchDialog: openSearchDialog,
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