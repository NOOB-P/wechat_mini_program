/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import AppConfig from '@/config';
import { useUserStore } from '@/store/modules/user';
import { useI18n } from 'vue-i18n';
import { HttpError } from '@/utils/http/error';
import { fetchLogin, fetchGetRoles } from '@/api/auth/login';
import { ElNotification, ElMessage } from 'element-plus';
import { useSettingStore } from '@/store/modules/setting';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'Login' });
const settingStore = useSettingStore();
const { isDark } = storeToRefs(settingStore);
const { t, locale } = useI18n();
const formKey = ref(0);
// 监听语言切换，重置表单
watch(locale, () => {
    formKey.value++;
});
const roleList = ref([]);
const accounts = computed(() => {
    if (roleList.value.length === 0) {
        return [
            {
                key: 'admin',
                label: t('login.roles.admin'),
                userName: 'admin',
                password: '',
                roleId: 1
            }
        ];
    }
    return roleList.value.map((role) => ({
        key: role.roleCode,
        label: role.roleName,
        userName: role.roleCode === 'super_admin' ? 'admin' : '',
        password: '',
        roleId: role.id
    }));
});
const dragVerify = ref();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const isPassing = ref(false);
const isClickPass = ref(false);
const systemName = AppConfig.systemInfo.name;
const formRef = ref();
const formData = reactive({
    account: '',
    username: '',
    password: '',
    rememberPassword: true
});
const rules = computed(() => ({
    username: [{ required: true, message: t('login.placeholder.username'), trigger: 'blur' }],
    password: [{ required: true, message: t('login.placeholder.password'), trigger: 'blur' }]
}));
const loading = ref(false);
onMounted(async () => {
    try {
        const res = await fetchGetRoles();
        if (res) {
            roleList.value = res;
            // 默认选中第一个角色
            if (roleList.value.length > 0) {
                setupAccount(roleList.value[0].roleCode);
            }
        }
    }
    catch (error) {
        console.error('Failed to fetch roles:', error);
        setupAccount('admin');
    }
});
// 设置账号
const setupAccount = (key) => {
    const selectedAccount = accounts.value.find((account) => account.key === key);
    formData.account = key;
    formData.username = selectedAccount?.userName ?? '';
    formData.password = selectedAccount?.password ?? '';
};
// 登录
const handleSubmit = async () => {
    if (!formRef.value)
        return;
    try {
        // 表单验证
        const valid = await formRef.value.validate();
        if (!valid)
            return;
        // 拖拽验证
        if (!isPassing.value) {
            isClickPass.value = true;
            return;
        }
        loading.value = true;
        // 登录请求
        const { username, password, account: roleCode } = formData;
        const selectedAccount = accounts.value.find((a) => a.key === roleCode);
        // 后端返回的结构是 Result<LoginVO>，其中包含 data
        // 前端 api.post 已经做了一层解包，但根据 axiosInstance.interceptors.response 来看
        // 它可能返回的是 response，我们需要取出 data。
        const res = await fetchLogin({
            userName: username,
            password,
            roleId: selectedAccount?.roleId
        });
        // 提取后端的 token 和 refreshToken（从后端的 LoginVO 对象中获取）
        // 注意，这里我们的 axios 拦截器可能会返回 res 或者 res.data，如果是 res.data.data 则取 data
        const token = res.data?.token || res.token;
        const refreshToken = res.data?.refreshToken || res.refreshToken;
        // 验证token
        if (!token) {
            throw new Error('Login failed - no token received');
        }
        // 存储 token 和登录状态
        userStore.setToken(token, refreshToken);
        userStore.setLoginStatus(true);
        // 登录成功处理
        showLoginSuccessNotice();
        // 获取 redirect 参数，如果存在则跳转到指定页面，否则跳转到首页
        const redirect = route.query.redirect;
        router.push(redirect || '/');
    }
    catch (error) {
        // 处理 HttpError
        if (error instanceof HttpError) {
            // console.log(error.code)
        }
        else {
            // 处理非 HttpError
            ElMessage.error(error.message || '登录失败，请稍后重试');
            console.error('[Login] Unexpected error:', error);
        }
    }
    finally {
        loading.value = false;
        resetDragVerify();
    }
};
// 重置拖拽验证
const resetDragVerify = () => {
    dragVerify.value.reset();
};
// 登录成功提示
const showLoginSuccessNotice = () => {
    setTimeout(() => {
        ElNotification({
            title: t('login.success.title'),
            type: 'success',
            duration: 2500,
            zIndex: 10000,
            message: `${t('login.success.message')}, ${systemName}!`
        });
    }, 1000);
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex w-full h-screen") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.LoginLeftView;
    /** @type { [typeof __VLS_components.LoginLeftView, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("relative flex-1") }, });
    const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.AuthTopBar;
    /** @type { [typeof __VLS_components.AuthTopBar, ] } */
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({}));
    const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("auth-right-wrap") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("form") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({ ...{ class: ("title") }, });
    (__VLS_ctx.$t('login.title'));
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("sub-title") }, });
    (__VLS_ctx.$t('login.subTitle'));
    const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.ElForm, ] } */
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ ...{ 'onKeyup': {} }, ref: ("formRef"), model: ((__VLS_ctx.formData)), rules: ((__VLS_ctx.rules)), key: ((__VLS_ctx.formKey)), ...{ style: ({}) }, }));
    const __VLS_14 = __VLS_13({ ...{ 'onKeyup': {} }, ref: ("formRef"), model: ((__VLS_ctx.formData)), rules: ((__VLS_ctx.rules)), key: ((__VLS_ctx.formKey)), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    // @ts-ignore navigation for `const formRef = ref()`
    __VLS_ctx.formRef;
    var __VLS_18 = {};
    let __VLS_19;
    const __VLS_20 = {
        onKeyup: (__VLS_ctx.handleSubmit)
    };
    let __VLS_15;
    let __VLS_16;
    const __VLS_21 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({ prop: ("account"), }));
    const __VLS_23 = __VLS_22({ prop: ("account"), }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    const __VLS_27 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
    /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.ElSelect, ] } */
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({ ...{ 'onChange': {} }, modelValue: ((__VLS_ctx.formData.account)), }));
    const __VLS_29 = __VLS_28({ ...{ 'onChange': {} }, modelValue: ((__VLS_ctx.formData.account)), }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    let __VLS_33;
    const __VLS_34 = {
        onChange: (__VLS_ctx.setupAccount)
    };
    let __VLS_30;
    let __VLS_31;
    for (const [account] of __VLS_getVForSourceType((__VLS_ctx.accounts))) {
        const __VLS_35 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
        /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.ElOption, ] } */
        // @ts-ignore
        const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({ key: ((account.key)), label: ((account.label)), value: ((account.key)), }));
        const __VLS_37 = __VLS_36({ key: ((account.key)), label: ((account.label)), value: ((account.key)), }, ...__VLS_functionalComponentArgsRest(__VLS_36));
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (account.label);
        __VLS_nonNullable(__VLS_40.slots).default;
        var __VLS_40;
    }
    __VLS_nonNullable(__VLS_32.slots).default;
    var __VLS_32;
    __VLS_nonNullable(__VLS_26.slots).default;
    var __VLS_26;
    const __VLS_41 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({ prop: ("username"), }));
    const __VLS_43 = __VLS_42({ prop: ("username"), }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    const __VLS_47 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({ ...{ class: ("custom-height") }, placeholder: ((__VLS_ctx.$t('login.placeholder.username'))), modelValue: ((__VLS_ctx.formData.username)), }));
    const __VLS_49 = __VLS_48({ ...{ class: ("custom-height") }, placeholder: ((__VLS_ctx.$t('login.placeholder.username'))), modelValue: ((__VLS_ctx.formData.username)), }, ...__VLS_functionalComponentArgsRest(__VLS_48));
    __VLS_nonNullable(__VLS_46.slots).default;
    var __VLS_46;
    const __VLS_53 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({ prop: ("password"), }));
    const __VLS_55 = __VLS_54({ prop: ("password"), }, ...__VLS_functionalComponentArgsRest(__VLS_54));
    const __VLS_59 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({ ...{ class: ("custom-height") }, placeholder: ((__VLS_ctx.$t('login.placeholder.password'))), modelValue: ((__VLS_ctx.formData.password)), type: ("password"), autocomplete: ("off"), showPassword: (true), }));
    const __VLS_61 = __VLS_60({ ...{ class: ("custom-height") }, placeholder: ((__VLS_ctx.$t('login.placeholder.password'))), modelValue: ((__VLS_ctx.formData.password)), type: ("password"), autocomplete: ("off"), showPassword: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_60));
    __VLS_nonNullable(__VLS_58.slots).default;
    var __VLS_58;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("relative pb-5 mt-6") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("relative z-[2] overflow-hidden select-none rounded-lg border border-transparent tad-300") }, ...{ class: (({ '!border-[#FF4E4F]': !__VLS_ctx.isPassing && __VLS_ctx.isClickPass })) }, });
    const __VLS_65 = __VLS_resolvedLocalAndGlobalComponents.ArtDragVerify;
    /** @type { [typeof __VLS_components.ArtDragVerify, ] } */
    // @ts-ignore
    const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({ ref: ("dragVerify"), value: ((__VLS_ctx.isPassing)), text: ((__VLS_ctx.$t('login.sliderText'))), textColor: ("var(--art-gray-700)"), successText: ((__VLS_ctx.$t('login.sliderSuccessText'))), progressBarBg: ("var(--main-color)"), background: ((__VLS_ctx.isDark ? '#26272F' : '#F1F1F4')), handlerBg: ("var(--default-box-color)"), }));
    const __VLS_67 = __VLS_66({ ref: ("dragVerify"), value: ((__VLS_ctx.isPassing)), text: ((__VLS_ctx.$t('login.sliderText'))), textColor: ("var(--art-gray-700)"), successText: ((__VLS_ctx.$t('login.sliderSuccessText'))), progressBarBg: ("var(--main-color)"), background: ((__VLS_ctx.isDark ? '#26272F' : '#F1F1F4')), handlerBg: ("var(--default-box-color)"), }, ...__VLS_functionalComponentArgsRest(__VLS_66));
    // @ts-ignore navigation for `const dragVerify = ref()`
    __VLS_ctx.dragVerify;
    var __VLS_71 = {};
    var __VLS_70;
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("absolute top-0 z-[1] px-px mt-2 text-xs text-[#f56c6c] tad-300") }, ...{ class: (({ 'translate-y-10': !__VLS_ctx.isPassing && __VLS_ctx.isClickPass })) }, });
    (__VLS_ctx.$t('login.placeholder.slider'));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex-cb mt-2 text-sm") }, });
    const __VLS_72 = __VLS_resolvedLocalAndGlobalComponents.ElCheckbox;
    /** @type { [typeof __VLS_components.ElCheckbox, typeof __VLS_components.ElCheckbox, ] } */
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({ modelValue: ((__VLS_ctx.formData.rememberPassword)), }));
    const __VLS_74 = __VLS_73({ modelValue: ((__VLS_ctx.formData.rememberPassword)), }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    (__VLS_ctx.$t('login.rememberPwd'));
    __VLS_nonNullable(__VLS_77.slots).default;
    var __VLS_77;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ style: ({}) }, });
    const __VLS_78 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
    // @ts-ignore
    const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({ ...{ 'onClick': {} }, ...{ class: ("w-full custom-height") }, type: ("primary"), loading: ((__VLS_ctx.loading)), }));
    const __VLS_80 = __VLS_79({ ...{ 'onClick': {} }, ...{ class: ("w-full custom-height") }, type: ("primary"), loading: ((__VLS_ctx.loading)), }, ...__VLS_functionalComponentArgsRest(__VLS_79));
    __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
    let __VLS_84;
    const __VLS_85 = {
        onClick: (__VLS_ctx.handleSubmit)
    };
    let __VLS_81;
    let __VLS_82;
    (__VLS_ctx.$t('login.btnText'));
    __VLS_nonNullable(__VLS_83.slots).default;
    var __VLS_83;
    __VLS_nonNullable(__VLS_17.slots).default;
    var __VLS_17;
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['h-screen'];
    __VLS_styleScopedClasses['relative'];
    __VLS_styleScopedClasses['flex-1'];
    __VLS_styleScopedClasses['auth-right-wrap'];
    __VLS_styleScopedClasses['form'];
    __VLS_styleScopedClasses['title'];
    __VLS_styleScopedClasses['sub-title'];
    __VLS_styleScopedClasses['custom-height'];
    __VLS_styleScopedClasses['custom-height'];
    __VLS_styleScopedClasses['relative'];
    __VLS_styleScopedClasses['pb-5'];
    __VLS_styleScopedClasses['mt-6'];
    __VLS_styleScopedClasses['relative'];
    __VLS_styleScopedClasses['z-[2]'];
    __VLS_styleScopedClasses['overflow-hidden'];
    __VLS_styleScopedClasses['select-none'];
    __VLS_styleScopedClasses['rounded-lg'];
    __VLS_styleScopedClasses['border'];
    __VLS_styleScopedClasses['border-transparent'];
    __VLS_styleScopedClasses['tad-300'];
    __VLS_styleScopedClasses['!border-[#FF4E4F]'];
    __VLS_styleScopedClasses['absolute'];
    __VLS_styleScopedClasses['top-0'];
    __VLS_styleScopedClasses['z-[1]'];
    __VLS_styleScopedClasses['px-px'];
    __VLS_styleScopedClasses['mt-2'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-[#f56c6c]'];
    __VLS_styleScopedClasses['tad-300'];
    __VLS_styleScopedClasses['translate-y-10'];
    __VLS_styleScopedClasses['flex-cb'];
    __VLS_styleScopedClasses['mt-2'];
    __VLS_styleScopedClasses['text-sm'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['custom-height'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "formRef": __VLS_18,
        "dragVerify": __VLS_71,
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
            isDark: isDark,
            formKey: formKey,
            accounts: accounts,
            dragVerify: dragVerify,
            isPassing: isPassing,
            isClickPass: isClickPass,
            formRef: formRef,
            formData: formData,
            rules: rules,
            loading: loading,
            setupAccount: setupAccount,
            handleSubmit: handleSubmit,
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