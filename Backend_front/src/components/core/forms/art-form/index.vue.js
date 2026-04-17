/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { useWindowSize } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import { toRaw } from 'vue';
import { ElCascader, ElCheckbox, ElCheckboxGroup, ElDatePicker, ElInput, ElInputTag, ElInputNumber, ElRadioGroup, ElRate, ElSelect, ElSlider, ElSwitch, ElTimePicker, ElTimeSelect, ElTreeSelect } from 'element-plus';
import { calculateResponsiveSpan } from '@/utils/form/responsive';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtForm' });
const componentMap = {
    input: ElInput, // 输入框
    inputtag: ElInputTag, // 标签输入框
    number: ElInputNumber, // 数字输入框
    select: ElSelect, // 选择器
    switch: ElSwitch, // 开关
    checkbox: ElCheckbox, // 复选框
    checkboxgroup: ElCheckboxGroup, // 复选框组
    radiogroup: ElRadioGroup, // 单选框组
    date: ElDatePicker, // 日期选择器
    daterange: ElDatePicker, // 日期范围选择器
    datetime: ElDatePicker, // 日期时间选择器
    datetimerange: ElDatePicker, // 日期时间范围选择器
    rate: ElRate, // 评分
    slider: ElSlider, // 滑块
    cascader: ElCascader, // 级联选择器
    timepicker: ElTimePicker, // 时间选择器
    timeselect: ElTimeSelect, // 时间选择
    treeselect: ElTreeSelect // 树选择器
};
const { width } = useWindowSize();
const { t } = useI18n();
const isMobile = computed(() => width.value < 500);
const formInstance = useTemplateRef('formRef');
const props = withDefaults(defineProps(), {
    items: () => [],
    span: 6,
    gutter: 12,
    labelPosition: 'right',
    labelWidth: '70px',
    buttonLeftLimit: 2,
    showReset: true,
    showSubmit: true,
    disabledSubmit: false,
    sanitizeOutput: () => ({})
});
const emit = defineEmits();
const modelValue = defineModel({ default: {} });
const initialModelValue = ref({});
// 保存组件初始化时的表单快照，用于 reset 时恢复默认值。
const cloneModelValue = (value) => {
    if (!value)
        return {};
    const deepClone = (source) => {
        if (Array.isArray(source)) {
            return source.map((item) => deepClone(item));
        }
        if (source && typeof source === 'object') {
            const rawSource = toRaw(source);
            return Object.keys(rawSource).reduce((accumulator, key) => {
                accumulator[key] = deepClone(rawSource[key]);
                return accumulator;
            }, {});
        }
        return source;
    };
    return deepClone(toRaw(value));
};
initialModelValue.value = cloneModelValue(modelValue.value);
const rootProps = ['label', 'labelWidth', 'key', 'type', 'hidden', 'span', 'slots'];
// 输出时的清洗策略默认偏“接口友好”，但允许按业务覆盖。
const sanitizeOutputOptions = computed(() => ({
    removeEmptyString: true,
    removeEmptyArray: true,
    removeEmptyObject: true,
    removeEmptyRichText: true,
    keepZero: true,
    keepFalse: true,
    ...props.sanitizeOutput
}));
const PATH_NUMBER_RE = /^\d+$/;
// 兼容 a.b、a.0.b 这类路径写法，数字段会被当作数组索引处理。
const parsePath = (path) => {
    return path
        .split('.')
        .filter(Boolean)
        .map((segment) => (PATH_NUMBER_RE.test(segment) ? Number(segment) : segment));
};
const getFieldValue = (path) => {
    return parsePath(path).reduce((currentValue, segment) => {
        if (currentValue == null)
            return undefined;
        return currentValue[segment];
    }, modelValue.value);
};
// 清空字段时只删除路径的最后一段，避免误删同级数据。
const deleteFieldValue = (path) => {
    const segments = parsePath(path);
    if (!segments.length)
        return;
    const lastSegment = segments.pop();
    const parent = segments.reduce((currentValue, segment) => {
        if (currentValue == null)
            return undefined;
        return currentValue[segment];
    }, modelValue.value);
    if (parent != null && lastSegment !== undefined) {
        delete parent[lastSegment];
    }
};
// 表单清空输入时不保留空字符串，同时按路径自动补齐中间对象或数组。
const setFieldValue = (path, value) => {
    const normalizedValue = value === '' ? undefined : value;
    const segments = parsePath(path);
    if (!segments.length)
        return;
    if (normalizedValue === undefined) {
        deleteFieldValue(path);
        return;
    }
    let currentValue = modelValue.value;
    segments.forEach((segment, index) => {
        const isLast = index === segments.length - 1;
        if (isLast) {
            currentValue[segment] = normalizedValue;
            return;
        }
        const nextSegment = segments[index + 1];
        const nextContainer = typeof nextSegment === 'number' ? [] : {};
        if (currentValue[segment] === null ||
            currentValue[segment] === undefined ||
            typeof currentValue[segment] !== 'object') {
            currentValue[segment] = nextContainer;
        }
        currentValue = currentValue[segment];
    });
};
const isRichTextEmpty = (value) => {
    if (/<(img|video|audio|iframe|embed|object)\b/i.test(value)) {
        return false;
    }
    // 去掉编辑器常见占位标签后再判断是否还有实际内容。
    return (value
        .replace(/&nbsp;/gi, '')
        .replace(/<br\s*\/?>/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim() === '');
};
// 提交时按配置清洗空值，但保留 0 和 false 这类有效值。
const sanitizeOutputValue = (value) => {
    const options = sanitizeOutputOptions.value;
    if (Array.isArray(value)) {
        const sanitizedArray = value
            .map((item) => sanitizeOutputValue(item))
            .filter((item) => item !== undefined);
        return sanitizedArray.length === 0 && options.removeEmptyArray ? undefined : sanitizedArray;
    }
    if (value && typeof value === 'object') {
        const rawValue = toRaw(value);
        const sanitizedObject = Object.entries(rawValue).reduce((accumulator, [key, item]) => {
            const sanitizedItem = sanitizeOutputValue(item);
            if (sanitizedItem !== undefined) {
                accumulator[key] = sanitizedItem;
            }
            return accumulator;
        }, {});
        return Object.keys(sanitizedObject).length === 0 && options.removeEmptyObject
            ? undefined
            : sanitizedObject;
    }
    if (typeof value === 'string') {
        if (options.removeEmptyString && value.trim() === '') {
            return undefined;
        }
        if (options.removeEmptyRichText && isRichTextEmpty(value)) {
            return undefined;
        }
        return value;
    }
    if (value === 0) {
        return options.keepZero ? value : undefined;
    }
    if (value === false) {
        return options.keepFalse ? value : undefined;
    }
    return value ?? undefined;
};
const getSanitizedOutput = () => {
    return (sanitizeOutputValue(cloneModelValue(modelValue.value)) || {});
};
const getProps = (item) => {
    if (item.props)
        return item.props;
    const props = { ...item };
    rootProps.forEach((key) => delete props[key]);
    return props;
};
// 获取插槽
const getSlots = (item) => {
    if (!item.slots)
        return {};
    const validSlots = {};
    Object.entries(item.slots).forEach(([key, slotFn]) => {
        if (slotFn) {
            validSlots[key] = slotFn;
        }
    });
    return validSlots;
};
// 组件
const getComponent = (item) => {
    // 优先使用 render 函数或组件渲染自定义组件
    if (item.render) {
        return item.render;
    }
    // 使用 type 获取预定义组件
    const { type } = item;
    return componentMap[type] || componentMap['input'];
};
/**
 * 获取列宽 span 值
 * 根据屏幕尺寸智能降级，避免小屏幕上表单项被压缩过小
 */
const getColSpan = (itemSpan, breakpoint) => {
    return calculateResponsiveSpan(itemSpan, span.value, breakpoint);
};
/**
 * 可见的表单项
 */
const visibleFormItems = computed(() => {
    return props.items.filter((item) => !item.hidden);
});
/**
 * 操作按钮样式
 */
const actionButtonsStyle = computed(() => ({
    'justify-content': isMobile.value
        ? 'flex-end'
        : props.items.filter((item) => !item.hidden).length <= props.buttonLeftLimit
            ? 'flex-start'
            : 'flex-end'
}));
/**
 * 处理重置事件
 */
const handleReset = () => {
    // 重置表单字段（UI 层）
    formInstance.value?.resetFields();
    // 恢复初始表单值，保留默认值而不是简单清空。
    Object.keys(modelValue.value).forEach((key) => {
        delete modelValue.value[key];
    });
    Object.assign(modelValue.value, cloneModelValue(initialModelValue.value));
    // 触发 reset 事件
    emit('reset');
};
/**
 * 处理提交事件
 */
const handleSubmit = () => {
    // 对外只抛出清洗后的结果，避免业务层重复过滤空值。
    emit('submit', getSanitizedOutput());
};
const __VLS_exposed = {
    ref: formInstance,
    validate: (...args) => formInstance.value?.validate(...args),
    reset: handleReset,
    // 允许外部在不触发提交事件时主动获取清洗后的输出。
    getOutput: getSanitizedOutput
};
defineExpose({
    ref: formInstance,
    validate: (...args) => formInstance.value?.validate(...args),
    reset: handleReset,
    // 允许外部在不触发提交事件时主动获取清洗后的输出。
    getOutput: getSanitizedOutput
});
// 解构 props 以便在模板中直接使用
const { span, gutter, labelPosition, labelWidth } = toRefs(props); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    items: () => [],
    span: 6,
    gutter: 12,
    labelPosition: 'right',
    labelWidth: '70px',
    buttonLeftLimit: 2,
    showReset: true,
    showSubmit: true,
    disabledSubmit: false,
    sanitizeOutput: () => ({})
});
const __VLS_fnComponent = (await import('vue')).defineComponent({
    __typeEmits: {},
});
;
let __VLS_functionalComponentProps;
const __VLS_defaults = {
    modelValue: {},
};
const __VLS_modelEmit = defineEmits();
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({ ...{ class: ("px-4 pb-0 pt-4 md:px-4 md:pt-4") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.ElForm, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ref: ("formRef"), model: ((__VLS_ctx.modelValue)), labelPosition: ((__VLS_ctx.labelPosition)), ...({ ...__VLS_ctx.$attrs }), }));
    const __VLS_2 = __VLS_1({ ref: ("formRef"), model: ((__VLS_ctx.modelValue)), labelPosition: ((__VLS_ctx.labelPosition)), ...({ ...__VLS_ctx.$attrs }), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    // @ts-ignore navigation for `const formRef = ref()`
    __VLS_ctx.formRef;
    var __VLS_6 = {};
    const __VLS_7 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.ElRow, ] } */
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({ ...{ class: ("flex flex-wrap") }, gutter: ((__VLS_ctx.gutter)), }));
    const __VLS_9 = __VLS_8({ ...{ class: ("flex flex-wrap") }, gutter: ((__VLS_ctx.gutter)), }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.visibleFormItems))) {
        const __VLS_13 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({ key: ((item.key)), xs: ((__VLS_ctx.getColSpan(item.span, 'xs'))), sm: ((__VLS_ctx.getColSpan(item.span, 'sm'))), md: ((__VLS_ctx.getColSpan(item.span, 'md'))), lg: ((__VLS_ctx.getColSpan(item.span, 'lg'))), xl: ((__VLS_ctx.getColSpan(item.span, 'xl'))), }));
        const __VLS_15 = __VLS_14({ key: ((item.key)), xs: ((__VLS_ctx.getColSpan(item.span, 'xs'))), sm: ((__VLS_ctx.getColSpan(item.span, 'sm'))), md: ((__VLS_ctx.getColSpan(item.span, 'md'))), lg: ((__VLS_ctx.getColSpan(item.span, 'lg'))), xl: ((__VLS_ctx.getColSpan(item.span, 'xl'))), }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        const __VLS_19 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({ prop: ((item.key)), labelWidth: ((item.label ? item.labelWidth || __VLS_ctx.labelWidth : undefined)), }));
        const __VLS_21 = __VLS_20({ prop: ((item.key)), labelWidth: ((item.label ? item.labelWidth || __VLS_ctx.labelWidth : undefined)), }, ...__VLS_functionalComponentArgsRest(__VLS_20));
        if (item.label) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
            {
                const { label: __VLS_thisSlot } = __VLS_nonNullable(__VLS_24.slots);
                if (typeof item.label !== 'string') {
                    const __VLS_25 = ((item.label));
                    // @ts-ignore
                    const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({}));
                    const __VLS_27 = __VLS_26({}, ...__VLS_functionalComponentArgsRest(__VLS_26));
                }
                else {
                    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                    (item.label);
                }
            }
        }
        var __VLS_31 = {
            item: ((item)), modelValue: ((__VLS_ctx.modelValue)),
        };
        var __VLS_32 = (item.key);
        const __VLS_33 = ((__VLS_ctx.getComponent(item)));
        // @ts-ignore
        const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({ ...{ 'onUpdate:modelValue': {} }, modelValue: ((__VLS_ctx.getFieldValue(item.key))), ...(__VLS_ctx.getProps(item)), }));
        const __VLS_35 = __VLS_34({ ...{ 'onUpdate:modelValue': {} }, modelValue: ((__VLS_ctx.getFieldValue(item.key))), ...(__VLS_ctx.getProps(item)), }, ...__VLS_functionalComponentArgsRest(__VLS_34));
        let __VLS_39;
        const __VLS_40 = {
            'onUpdate:modelValue': (...[$event]) => {
                __VLS_ctx.setFieldValue(item.key, $event);
            }
        };
        let __VLS_36;
        let __VLS_37;
        if (item.type === 'select' && __VLS_ctx.getProps(item)?.options) {
            for (const [option] of __VLS_getVForSourceType((__VLS_ctx.getProps(item).options))) {
                const __VLS_41 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
                /** @type { [typeof __VLS_components.ElOption, ] } */
                // @ts-ignore
                const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({ ...(option), key: ((option.value)), }));
                const __VLS_43 = __VLS_42({ ...(option), key: ((option.value)), }, ...__VLS_functionalComponentArgsRest(__VLS_42));
            }
        }
        if (item.type === 'checkboxgroup' && __VLS_ctx.getProps(item)?.options) {
            for (const [option] of __VLS_getVForSourceType((__VLS_ctx.getProps(item).options))) {
                const __VLS_47 = __VLS_resolvedLocalAndGlobalComponents.ElCheckbox;
                /** @type { [typeof __VLS_components.ElCheckbox, ] } */
                // @ts-ignore
                const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({ ...(option), key: ((option.value)), }));
                const __VLS_49 = __VLS_48({ ...(option), key: ((option.value)), }, ...__VLS_functionalComponentArgsRest(__VLS_48));
            }
        }
        if (item.type === 'radiogroup' && __VLS_ctx.getProps(item)?.options) {
            for (const [option] of __VLS_getVForSourceType((__VLS_ctx.getProps(item).options))) {
                const __VLS_53 = __VLS_resolvedLocalAndGlobalComponents.ElRadio;
                /** @type { [typeof __VLS_components.ElRadio, ] } */
                // @ts-ignore
                const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({ ...(option), key: ((option.value)), }));
                const __VLS_55 = __VLS_54({ ...(option), key: ((option.value)), }, ...__VLS_functionalComponentArgsRest(__VLS_54));
            }
        }
        for (const [slotFn, slotName] of __VLS_getVForSourceType((__VLS_ctx.getSlots(item)))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({ key: ((slotName)), });
            {
                const { [__VLS_tryAsConstant(slotName)]: __VLS_thisSlot } = __VLS_nonNullable(__VLS_38.slots);
                const __VLS_59 = ((slotFn));
                // @ts-ignore
                const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({}));
                const __VLS_61 = __VLS_60({}, ...__VLS_functionalComponentArgsRest(__VLS_60));
            }
        }
        var __VLS_38;
        __VLS_nonNullable(__VLS_24.slots).default;
        var __VLS_24;
        __VLS_nonNullable(__VLS_18.slots).default;
        var __VLS_18;
    }
    const __VLS_65 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
    // @ts-ignore
    const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({ xs: ((24)), sm: ((24)), md: ((__VLS_ctx.span)), lg: ((__VLS_ctx.span)), xl: ((__VLS_ctx.span)), ...{ class: ("max-w-full flex-1") }, }));
    const __VLS_67 = __VLS_66({ xs: ((24)), sm: ((24)), md: ((__VLS_ctx.span)), lg: ((__VLS_ctx.span)), xl: ((__VLS_ctx.span)), ...{ class: ("max-w-full flex-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_66));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mb-3 flex-c flex-wrap justify-end md:flex-row md:items-stretch md:gap-2") }, ...{ style: ((__VLS_ctx.actionButtonsStyle)) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex gap-2 md:justify-center") }, });
    if (__VLS_ctx.showReset) {
        const __VLS_71 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({ ...{ 'onClick': {} }, ...{ class: ("reset-button") }, }));
        const __VLS_73 = __VLS_72({ ...{ 'onClick': {} }, ...{ class: ("reset-button") }, }, ...__VLS_functionalComponentArgsRest(__VLS_72));
        __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
        let __VLS_77;
        const __VLS_78 = {
            onClick: (__VLS_ctx.handleReset)
        };
        let __VLS_74;
        let __VLS_75;
        (__VLS_ctx.t('table.form.reset'));
        __VLS_nonNullable(__VLS_76.slots).default;
        var __VLS_76;
    }
    if (__VLS_ctx.showSubmit) {
        const __VLS_79 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_80 = __VLS_asFunctionalComponent(__VLS_79, new __VLS_79({ ...{ 'onClick': {} }, type: ("primary"), ...{ class: ("submit-button") }, disabled: ((__VLS_ctx.disabledSubmit)), }));
        const __VLS_81 = __VLS_80({ ...{ 'onClick': {} }, type: ("primary"), ...{ class: ("submit-button") }, disabled: ((__VLS_ctx.disabledSubmit)), }, ...__VLS_functionalComponentArgsRest(__VLS_80));
        __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
        let __VLS_85;
        const __VLS_86 = {
            onClick: (__VLS_ctx.handleSubmit)
        };
        let __VLS_82;
        let __VLS_83;
        (__VLS_ctx.t('table.form.submit'));
        __VLS_nonNullable(__VLS_84.slots).default;
        var __VLS_84;
    }
    __VLS_nonNullable(__VLS_70.slots).default;
    var __VLS_70;
    __VLS_nonNullable(__VLS_12.slots).default;
    var __VLS_12;
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    __VLS_styleScopedClasses['px-4'];
    __VLS_styleScopedClasses['pb-0'];
    __VLS_styleScopedClasses['pt-4'];
    __VLS_styleScopedClasses['md:px-4'];
    __VLS_styleScopedClasses['md:pt-4'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['flex-wrap'];
    __VLS_styleScopedClasses['max-w-full'];
    __VLS_styleScopedClasses['flex-1'];
    __VLS_styleScopedClasses['mb-3'];
    __VLS_styleScopedClasses['flex-c'];
    __VLS_styleScopedClasses['flex-wrap'];
    __VLS_styleScopedClasses['justify-end'];
    __VLS_styleScopedClasses['md:flex-row'];
    __VLS_styleScopedClasses['md:items-stretch'];
    __VLS_styleScopedClasses['md:gap-2'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['gap-2'];
    __VLS_styleScopedClasses['md:justify-center'];
    __VLS_styleScopedClasses['reset-button'];
    __VLS_styleScopedClasses['submit-button'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "formRef": __VLS_6,
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
            ElCheckbox: ElCheckbox,
            t: t,
            modelValue: modelValue,
            getFieldValue: getFieldValue,
            setFieldValue: setFieldValue,
            getProps: getProps,
            getSlots: getSlots,
            getComponent: getComponent,
            getColSpan: getColSpan,
            visibleFormItems: visibleFormItems,
            actionButtonsStyle: actionButtonsStyle,
            handleReset: handleReset,
            handleSubmit: handleSubmit,
            span: span,
            gutter: gutter,
            labelPosition: labelPosition,
            labelWidth: labelWidth,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
    __typeEl: {},
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map