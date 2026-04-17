/// <reference types="../../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import PaperEditView from './PaperEditView.vue';
import { fetchProjectScoreSummary } from '@/api/core-business/exam/project-editor';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps();
const emit = defineEmits();
const router = useRouter();
const summaryLoading = ref(false);
const summaryData = ref([]);
const summaryStats = ref({});
const isEditingPaper = ref(false);
const currentSubject = ref('');
watch(isEditingPaper, (val) => {
    emit('update:isEditingPaper', val);
});
async function loadSummary() {
    if (!props.projectId)
        return;
    summaryLoading.value = true;
    try {
        const res = await fetchProjectScoreSummary(props.projectId);
        summaryData.value = res.records ?? [];
        summaryStats.value = res.stats ?? {};
    }
    finally {
        summaryLoading.value = false;
    }
}
function handleEnterSubject(row) {
    router.push({
        name: 'ExamSubjectScore',
        query: {
            projectId: props.projectId,
            subjectName: row.subjectName
        }
    });
}
function handleEditPaper(row) {
    currentSubject.value = row.subjectName;
    isEditingPaper.value = true;
}
async function reload() {
    await loadSummary();
}
watch(() => props.projectId, () => {
    reload();
});
onMounted(reload);
const __VLS_exposed = {
    reload
};
defineExpose({
    reload
}); /* PartiallyEnd: #3632/scriptSetup.vue */
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
    __VLS_styleScopedClasses['summary-pill'];
    __VLS_styleScopedClasses['summary-pill'];
    __VLS_styleScopedClasses['summary-row'];
    __VLS_styleScopedClasses['summary-row'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("score-panel") }, });
    if (!__VLS_ctx.isEditingPaper) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("summary-row") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("summary-pill") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.summaryStats.subjectCount ?? 0);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("summary-pill") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.summaryStats.uploadedSubjectCount ?? 0);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("summary-pill") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.summaryStats.scoreRecordCount ?? 0);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("summary-pill") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.summaryStats.studentCount ?? 0);
    }
    if (!__VLS_ctx.isEditingPaper) {
        const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ shadow: ("never"), ...{ class: ("panel-card") }, }));
        const __VLS_2 = __VLS_1({ shadow: ("never"), ...{ class: ("panel-card") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { header: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("section-header") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("section-title") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("section-desc") }, });
        }
        const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
        /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ ...{ 'onRowClick': {} }, data: ((__VLS_ctx.summaryData)), stripe: (true), rowClassName: ("subject-row"), }));
        const __VLS_8 = __VLS_7({ ...{ 'onRowClick': {} }, data: ((__VLS_ctx.summaryData)), stripe: (true), rowClassName: ("subject-row"), }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.summaryLoading) }, null, null);
        let __VLS_12;
        const __VLS_13 = {
            onRowClick: (__VLS_ctx.handleEnterSubject)
        };
        let __VLS_9;
        let __VLS_10;
        const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ prop: ("subjectName"), label: ("科目"), minWidth: ("120"), }));
        const __VLS_16 = __VLS_15({ prop: ("subjectName"), label: ("科目"), minWidth: ("120"), }, ...__VLS_functionalComponentArgsRest(__VLS_15));
        const __VLS_20 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({ prop: ("classCount"), label: ("班级数"), width: ("90"), align: ("center"), }));
        const __VLS_22 = __VLS_21({ prop: ("classCount"), label: ("班级数"), width: ("90"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        const __VLS_26 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({ prop: ("studentCount"), label: ("学生数"), width: ("100"), align: ("center"), }));
        const __VLS_28 = __VLS_27({ prop: ("studentCount"), label: ("学生数"), width: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_27));
        const __VLS_32 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({ prop: ("scoreCount"), label: ("成绩条数"), width: ("100"), align: ("center"), }));
        const __VLS_34 = __VLS_33({ prop: ("scoreCount"), label: ("成绩条数"), width: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        const __VLS_38 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({ label: ("试卷包"), width: ("100"), align: ("center"), }));
        const __VLS_40 = __VLS_39({ label: ("试卷包"), width: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_39));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_43.slots);
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_44 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
            /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
            // @ts-ignore
            const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({ type: ((row.paperUploaded ? 'success' : 'info')), }));
            const __VLS_46 = __VLS_45({ type: ((row.paperUploaded ? 'success' : 'info')), }, ...__VLS_functionalComponentArgsRest(__VLS_45));
            (row.paperUploaded ? '录入' : '未录入');
            __VLS_nonNullable(__VLS_49.slots).default;
            var __VLS_49;
        }
        var __VLS_43;
        const __VLS_50 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({ label: ("成绩单"), width: ("100"), align: ("center"), }));
        const __VLS_52 = __VLS_51({ label: ("成绩单"), width: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_51));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_55.slots);
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_56 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
            /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
            // @ts-ignore
            const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({ type: ((row.scoreUploaded ? 'success' : 'info')), }));
            const __VLS_58 = __VLS_57({ type: ((row.scoreUploaded ? 'success' : 'info')), }, ...__VLS_functionalComponentArgsRest(__VLS_57));
            (row.scoreUploaded ? '录入' : '未录入');
            __VLS_nonNullable(__VLS_61.slots).default;
            var __VLS_61;
        }
        var __VLS_55;
        const __VLS_62 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({ label: ("操作"), width: ("180"), align: ("center"), fixed: ("right"), }));
        const __VLS_64 = __VLS_63({ label: ("操作"), width: ("180"), align: ("center"), fixed: ("right"), }, ...__VLS_functionalComponentArgsRest(__VLS_63));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_67.slots);
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_68 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({ ...{ 'onClick': {} }, type: ("primary"), link: (true), }));
            const __VLS_70 = __VLS_69({ ...{ 'onClick': {} }, type: ("primary"), link: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_69));
            let __VLS_74;
            const __VLS_75 = {
                onClick: (...[$event]) => {
                    if (!((!__VLS_ctx.isEditingPaper)))
                        return;
                    __VLS_ctx.handleEnterSubject(row);
                }
            };
            let __VLS_71;
            let __VLS_72;
            __VLS_nonNullable(__VLS_73.slots).default;
            var __VLS_73;
            const __VLS_76 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({ ...{ 'onClick': {} }, type: ("primary"), link: (true), }));
            const __VLS_78 = __VLS_77({ ...{ 'onClick': {} }, type: ("primary"), link: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_77));
            let __VLS_82;
            const __VLS_83 = {
                onClick: (...[$event]) => {
                    if (!((!__VLS_ctx.isEditingPaper)))
                        return;
                    __VLS_ctx.handleEditPaper(row);
                }
            };
            let __VLS_79;
            let __VLS_80;
            __VLS_nonNullable(__VLS_81.slots).default;
            var __VLS_81;
        }
        var __VLS_67;
        __VLS_nonNullable(__VLS_11.slots).default;
        var __VLS_11;
        var __VLS_5;
    }
    else {
        // @ts-ignore
        [PaperEditView,];
        // @ts-ignore
        const __VLS_84 = __VLS_asFunctionalComponent(PaperEditView, new PaperEditView({ ...{ 'onBack': {} }, ...{ 'onSaved': {} }, projectId: ((__VLS_ctx.projectId)), subjectName: ((__VLS_ctx.currentSubject)), }));
        const __VLS_85 = __VLS_84({ ...{ 'onBack': {} }, ...{ 'onSaved': {} }, projectId: ((__VLS_ctx.projectId)), subjectName: ((__VLS_ctx.currentSubject)), }, ...__VLS_functionalComponentArgsRest(__VLS_84));
        let __VLS_89;
        const __VLS_90 = {
            onBack: (...[$event]) => {
                if (!(!((!__VLS_ctx.isEditingPaper))))
                    return;
                __VLS_ctx.isEditingPaper = false;
            }
        };
        const __VLS_91 = {
            onSaved: (__VLS_ctx.reload)
        };
        let __VLS_86;
        let __VLS_87;
        var __VLS_88;
    }
    __VLS_styleScopedClasses['score-panel'];
    __VLS_styleScopedClasses['summary-row'];
    __VLS_styleScopedClasses['summary-pill'];
    __VLS_styleScopedClasses['summary-pill'];
    __VLS_styleScopedClasses['summary-pill'];
    __VLS_styleScopedClasses['summary-pill'];
    __VLS_styleScopedClasses['panel-card'];
    __VLS_styleScopedClasses['section-header'];
    __VLS_styleScopedClasses['section-title'];
    __VLS_styleScopedClasses['section-desc'];
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
            PaperEditView: PaperEditView,
            summaryLoading: summaryLoading,
            summaryData: summaryData,
            summaryStats: summaryStats,
            isEditingPaper: isEditingPaper,
            currentSubject: currentSubject,
            handleEnterSubject: handleEnterSubject,
            handleEditPaper: handleEditPaper,
            reload: reload,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=ScorePanel.vue.js.map