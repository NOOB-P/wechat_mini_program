/// <reference types="../../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { computed } from 'vue';
import { School, OfficeBuilding } from '@element-plus/icons-vue';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps();
const statCards = computed(() => [
    {
        label: '覆盖学校',
        value: props.detail.stats.schoolCount ?? 0,
        desc: '当前项目纳入的学校总数',
        icon: 'School'
    },
    {
        label: '参与班级',
        value: props.detail.stats.classCount ?? 0,
        desc: '按当前配置自动生成的班级范围',
        icon: 'OfficeBuilding'
    },
    {
        label: '项目考生',
        value: props.detail.stats.studentCount ?? 0,
        desc: '将进入考生管理与成绩管理的数据池',
        icon: 'User'
    },
    {
        label: '成绩记录',
        value: props.detail.stats.scoreRecordCount ?? 0,
        desc: '当前项目已经录入的总成绩条数',
        icon: 'Document'
    }
]); /* PartiallyEnd: #3632/scriptSetup.vue */
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
    __VLS_styleScopedClasses['el-card__body'];
    __VLS_styleScopedClasses['stats-grid'];
    __VLS_styleScopedClasses['content-grid'];
    __VLS_styleScopedClasses['stats-grid'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("overview-panel") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stats-grid") }, });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.statCards))) {
        const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ key: ((item.label)), shadow: ("never"), ...{ class: ("stat-card") }, ...{ class: ((`stat-card--${index}`)) }, }));
        const __VLS_2 = __VLS_1({ key: ((item.label)), shadow: ("never"), ...{ class: ("stat-card") }, ...{ class: ((`stat-card--${index}`)) }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stat-card-inner") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stat-content") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stat-card__label") }, });
        (item.label);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stat-card__value") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("value-text") }, });
        (item.value);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stat-card__desc") }, });
        (item.desc);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stat-icon-wrapper") }, });
        const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ ...{ class: ("stat-icon") }, }));
        const __VLS_8 = __VLS_7({ ...{ class: ("stat-icon") }, }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        const __VLS_12 = ((item.icon));
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
        const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
        __VLS_nonNullable(__VLS_11.slots).default;
        var __VLS_11;
        __VLS_nonNullable(__VLS_5.slots).default;
        var __VLS_5;
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("content-grid single-column") }, });
    const __VLS_18 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({ shadow: ("never"), ...{ class: ("section-card") }, }));
    const __VLS_20 = __VLS_19({ shadow: ("never"), ...{ class: ("section-card") }, }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { header: __VLS_thisSlot } = __VLS_nonNullable(__VLS_23.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("section-title") }, });
        const __VLS_24 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({ ...{ class: ("title-icon") }, }));
        const __VLS_26 = __VLS_25({ ...{ class: ("title-icon") }, }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        const __VLS_30 = __VLS_resolvedLocalAndGlobalComponents.School;
        /** @type { [typeof __VLS_components.School, ] } */
        // @ts-ignore
        const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({}));
        const __VLS_32 = __VLS_31({}, ...__VLS_functionalComponentArgsRest(__VLS_31));
        __VLS_nonNullable(__VLS_29.slots).default;
        var __VLS_29;
    }
    const __VLS_36 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({ data: ((__VLS_ctx.detail.schools)), ...{ class: ("custom-table") }, }));
    const __VLS_38 = __VLS_37({ data: ((__VLS_ctx.detail.schools)), ...{ class: ("custom-table") }, }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    const __VLS_42 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({ prop: ("schoolName"), label: ("学校"), minWidth: ("180"), }));
    const __VLS_44 = __VLS_43({ prop: ("schoolName"), label: ("学校"), minWidth: ("180"), }, ...__VLS_functionalComponentArgsRest(__VLS_43));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_47.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("fw-medium") }, });
        (row.schoolName);
    }
    var __VLS_47;
    const __VLS_48 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({ prop: ("classCount"), label: ("班级数"), width: ("100"), align: ("center"), }));
    const __VLS_50 = __VLS_49({ prop: ("classCount"), label: ("班级数"), width: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    const __VLS_54 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({ prop: ("studentCount"), label: ("学生数"), width: ("100"), align: ("center"), }));
    const __VLS_56 = __VLS_55({ prop: ("studentCount"), label: ("学生数"), width: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_55));
    __VLS_nonNullable(__VLS_41.slots).default;
    var __VLS_41;
    var __VLS_23;
    const __VLS_60 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({ shadow: ("never"), ...{ class: ("section-card") }, }));
    const __VLS_62 = __VLS_61({ shadow: ("never"), ...{ class: ("section-card") }, }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { header: __VLS_thisSlot } = __VLS_nonNullable(__VLS_65.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("section-title") }, });
        const __VLS_66 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({ ...{ class: ("title-icon") }, }));
        const __VLS_68 = __VLS_67({ ...{ class: ("title-icon") }, }, ...__VLS_functionalComponentArgsRest(__VLS_67));
        const __VLS_72 = __VLS_resolvedLocalAndGlobalComponents.OfficeBuilding;
        /** @type { [typeof __VLS_components.OfficeBuilding, ] } */
        // @ts-ignore
        const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({}));
        const __VLS_74 = __VLS_73({}, ...__VLS_functionalComponentArgsRest(__VLS_73));
        __VLS_nonNullable(__VLS_71.slots).default;
        var __VLS_71;
    }
    const __VLS_78 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
    // @ts-ignore
    const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({ data: ((__VLS_ctx.detail.classes)), ...{ class: ("custom-table") }, }));
    const __VLS_80 = __VLS_79({ data: ((__VLS_ctx.detail.classes)), ...{ class: ("custom-table") }, }, ...__VLS_functionalComponentArgsRest(__VLS_79));
    const __VLS_84 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({ prop: ("school"), label: ("学校"), minWidth: ("180"), }));
    const __VLS_86 = __VLS_85({ prop: ("school"), label: ("学校"), minWidth: ("180"), }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_89.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("fw-medium") }, });
        (row.school);
    }
    var __VLS_89;
    const __VLS_90 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({ prop: ("grade"), label: ("年级"), width: ("120"), align: ("center"), }));
    const __VLS_92 = __VLS_91({ prop: ("grade"), label: ("年级"), width: ("120"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_91));
    const __VLS_96 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({ prop: ("className"), label: ("班级"), width: ("120"), align: ("center"), }));
    const __VLS_98 = __VLS_97({ prop: ("className"), label: ("班级"), width: ("120"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    const __VLS_102 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({ prop: ("studentCount"), label: ("学生数"), width: ("120"), align: ("center"), }));
    const __VLS_104 = __VLS_103({ prop: ("studentCount"), label: ("学生数"), width: ("120"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_103));
    __VLS_nonNullable(__VLS_83.slots).default;
    var __VLS_83;
    var __VLS_65;
    __VLS_styleScopedClasses['overview-panel'];
    __VLS_styleScopedClasses['stats-grid'];
    __VLS_styleScopedClasses['stat-card'];
    __VLS_styleScopedClasses['stat-card-inner'];
    __VLS_styleScopedClasses['stat-content'];
    __VLS_styleScopedClasses['stat-card__label'];
    __VLS_styleScopedClasses['stat-card__value'];
    __VLS_styleScopedClasses['value-text'];
    __VLS_styleScopedClasses['stat-card__desc'];
    __VLS_styleScopedClasses['stat-icon-wrapper'];
    __VLS_styleScopedClasses['stat-icon'];
    __VLS_styleScopedClasses['content-grid'];
    __VLS_styleScopedClasses['single-column'];
    __VLS_styleScopedClasses['section-card'];
    __VLS_styleScopedClasses['section-title'];
    __VLS_styleScopedClasses['title-icon'];
    __VLS_styleScopedClasses['custom-table'];
    __VLS_styleScopedClasses['fw-medium'];
    __VLS_styleScopedClasses['section-card'];
    __VLS_styleScopedClasses['section-title'];
    __VLS_styleScopedClasses['title-icon'];
    __VLS_styleScopedClasses['custom-table'];
    __VLS_styleScopedClasses['fw-medium'];
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
            School: School,
            OfficeBuilding: OfficeBuilding,
            statCards: statCards,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=OverviewPanel.vue.js.map