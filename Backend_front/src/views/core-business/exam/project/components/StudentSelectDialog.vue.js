/// <reference types="../../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, computed, watch } from 'vue';
import { Check, Close } from '@element-plus/icons-vue';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps();
const emit = defineEmits();
const activeTab = ref('school');
const searchKeyword = ref('');
const selectedSchoolIds = ref([]);
const selectedClassIds = ref([]);
const treeProps = {
    label: 'label',
    children: 'children'
};
watch(() => props.modelValue, (val) => {
    if (val) {
        selectedSchoolIds.value = [...props.initialSchools];
        selectedClassIds.value = [...props.initialClasses];
        searchKeyword.value = '';
    }
});
const filteredSchools = computed(() => {
    if (!searchKeyword.value)
        return props.schools;
    const kw = searchKeyword.value.toLowerCase();
    return props.schools.filter(s => s.label.toLowerCase().includes(kw));
});
const filteredClasses = computed(() => {
    if (!searchKeyword.value)
        return props.classes;
    const kw = searchKeyword.value.toLowerCase();
    return props.classes.filter(c => c.label.toLowerCase().includes(kw) ||
        c.schoolName.toLowerCase().includes(kw));
});
const schoolMap = computed(() => {
    const map = new Map();
    selectedClassIds.value.forEach(cid => {
        const cls = props.classes.find(c => c.id === cid);
        if (cls) {
            if (!map.has(cls.schoolId)) {
                map.set(cls.schoolId, []);
            }
            map.get(cls.schoolId).push(cls);
        }
    });
    return map;
});
const treeSchoolCount = computed(() => schoolMap.value.size);
const treeData = computed(() => {
    const data = [];
    schoolMap.value.forEach((classes, schoolId) => {
        const school = props.schools.find(s => s.id === schoolId);
        if (school) {
            data.push({
                key: `school-${schoolId}`,
                type: 'school',
                id: schoolId,
                label: school.label,
                children: classes.map(c => ({
                    key: `class-${c.id}`,
                    type: 'class',
                    id: c.id,
                    label: `${c.grade}${c.className}`
                }))
            });
        }
    });
    return data;
});
function isSchoolSelected(id) {
    return selectedSchoolIds.value.includes(id);
}
function isClassSelected(id) {
    return selectedClassIds.value.includes(id);
}
function toggleSchool(school) {
    const index = selectedSchoolIds.value.indexOf(school.id);
    const schoolClasses = props.classes.filter(c => c.schoolId === school.id);
    const schoolClassIds = schoolClasses.map(c => c.id);
    if (index >= 0) {
        // 取消选中学校
        selectedSchoolIds.value.splice(index, 1);
        // 同时取消选中该学校下的所有班级
        selectedClassIds.value = selectedClassIds.value.filter(id => !schoolClassIds.includes(id));
    }
    else {
        // 选中学校
        selectedSchoolIds.value.push(school.id);
        // 同时选中该学校下的所有班级
        schoolClassIds.forEach(id => {
            if (!selectedClassIds.value.includes(id)) {
                selectedClassIds.value.push(id);
            }
        });
    }
}
function toggleProjectClass(cls) {
    const index = selectedClassIds.value.indexOf(cls.id);
    if (index >= 0) {
        // 取消选中班级
        selectedClassIds.value.splice(index, 1);
        // 如果该学校之前是全选状态，现在也要取消全选状态
        const sIndex = selectedSchoolIds.value.indexOf(cls.schoolId);
        if (sIndex >= 0) {
            selectedSchoolIds.value.splice(sIndex, 1);
        }
    }
    else {
        // 选中班级
        selectedClassIds.value.push(cls.id);
        // 检查该学校下的所有班级是否都已选中
        const schoolClasses = props.classes.filter(c => c.schoolId === cls.schoolId);
        const allSelected = schoolClasses.every(c => selectedClassIds.value.includes(c.id));
        if (allSelected && !selectedSchoolIds.value.includes(cls.schoolId)) {
            selectedSchoolIds.value.push(cls.schoolId);
        }
    }
}
function removeNode(data) {
    if (data.type === 'school') {
        const school = props.schools.find(s => s.id === data.id);
        if (school)
            toggleSchool(school);
    }
    else if (data.type === 'class') {
        const cls = props.classes.find(c => c.id === data.id);
        if (cls)
            toggleProjectClass(cls);
    }
}
function clearAll() {
    selectedSchoolIds.value = [];
    selectedClassIds.value = [];
}
function handleClose() {
    emit('update:modelValue', false);
}
function handleConfirm() {
    emit('confirm', {
        schoolIds: [...selectedSchoolIds.value],
        classIds: [...selectedClassIds.value]
    });
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
    __VLS_styleScopedClasses['item-title'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.modelValue)), title: ("选取学生"), width: ("1000px"), alignCenter: (true), appendToBody: (true), ...{ class: ("student-select-dialog") }, }));
    const __VLS_2 = __VLS_1({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.modelValue)), title: ("选取学生"), width: ("1000px"), alignCenter: (true), appendToBody: (true), ...{ class: ("student-select-dialog") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_6 = {};
    let __VLS_7;
    const __VLS_8 = {
        onClose: (__VLS_ctx.handleClose)
    };
    let __VLS_3;
    let __VLS_4;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("student-select-layout") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("select-main") }, });
    const __VLS_9 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({ modelValue: ((__VLS_ctx.searchKeyword)), placeholder: ("搜索学校、班级或学生"), prefixIcon: ("Search"), clearable: (true), ...{ class: ("mb-4") }, }));
    const __VLS_11 = __VLS_10({ modelValue: ((__VLS_ctx.searchKeyword)), placeholder: ("搜索学校、班级或学生"), prefixIcon: ("Search"), clearable: (true), ...{ class: ("mb-4") }, }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    const __VLS_15 = __VLS_resolvedLocalAndGlobalComponents.ElTabs;
    /** @type { [typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, ] } */
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({ modelValue: ((__VLS_ctx.activeTab)), ...{ class: ("select-tabs") }, }));
    const __VLS_17 = __VLS_16({ modelValue: ((__VLS_ctx.activeTab)), ...{ class: ("select-tabs") }, }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    const __VLS_21 = __VLS_resolvedLocalAndGlobalComponents.ElTabPane;
    /** @type { [typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ] } */
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({ label: ("选取学校"), name: ("school"), }));
    const __VLS_23 = __VLS_22({ label: ("选取学校"), name: ("school"), }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    const __VLS_27 = __VLS_resolvedLocalAndGlobalComponents.ElScrollbar;
    /** @type { [typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, ] } */
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({ maxHeight: ("450px"), }));
    const __VLS_29 = __VLS_28({ maxHeight: ("450px"), }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("list-container") }, });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.filteredSchools))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.toggleSchool(item);
                } }, key: ((item.id)), ...{ class: ("list-item") }, ...{ class: (({ active: __VLS_ctx.isSchoolSelected(item.id) })) }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("item-info") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("item-title") }, });
        (item.label);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("item-meta") }, });
        (item.classCount);
        (item.studentCount);
        if (__VLS_ctx.isSchoolSelected(item.id)) {
            const __VLS_33 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
            /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
            // @ts-ignore
            const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({}));
            const __VLS_35 = __VLS_34({}, ...__VLS_functionalComponentArgsRest(__VLS_34));
            const __VLS_39 = __VLS_resolvedLocalAndGlobalComponents.Check;
            /** @type { [typeof __VLS_components.Check, ] } */
            // @ts-ignore
            const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({}));
            const __VLS_41 = __VLS_40({}, ...__VLS_functionalComponentArgsRest(__VLS_40));
            __VLS_nonNullable(__VLS_38.slots).default;
            var __VLS_38;
        }
    }
    __VLS_nonNullable(__VLS_32.slots).default;
    var __VLS_32;
    __VLS_nonNullable(__VLS_26.slots).default;
    var __VLS_26;
    const __VLS_45 = __VLS_resolvedLocalAndGlobalComponents.ElTabPane;
    /** @type { [typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ] } */
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({ label: ("选取班级"), name: ("class"), }));
    const __VLS_47 = __VLS_46({ label: ("选取班级"), name: ("class"), }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    const __VLS_51 = __VLS_resolvedLocalAndGlobalComponents.ElScrollbar;
    /** @type { [typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, ] } */
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({ maxHeight: ("450px"), }));
    const __VLS_53 = __VLS_52({ maxHeight: ("450px"), }, ...__VLS_functionalComponentArgsRest(__VLS_52));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("list-container") }, });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.filteredClasses))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.toggleProjectClass(item);
                } }, key: ((item.id)), ...{ class: ("list-item") }, ...{ class: (({ active: __VLS_ctx.isClassSelected(item.id) })) }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("item-info") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("item-title") }, });
        (item.schoolName);
        (item.grade);
        (item.className);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("item-meta") }, });
        (item.studentCount);
        if (__VLS_ctx.isClassSelected(item.id)) {
            const __VLS_57 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
            /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
            // @ts-ignore
            const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({}));
            const __VLS_59 = __VLS_58({}, ...__VLS_functionalComponentArgsRest(__VLS_58));
            const __VLS_63 = __VLS_resolvedLocalAndGlobalComponents.Check;
            /** @type { [typeof __VLS_components.Check, ] } */
            // @ts-ignore
            const __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63({}));
            const __VLS_65 = __VLS_64({}, ...__VLS_functionalComponentArgsRest(__VLS_64));
            __VLS_nonNullable(__VLS_62.slots).default;
            var __VLS_62;
        }
    }
    __VLS_nonNullable(__VLS_56.slots).default;
    var __VLS_56;
    __VLS_nonNullable(__VLS_50.slots).default;
    var __VLS_50;
    __VLS_nonNullable(__VLS_20.slots).default;
    var __VLS_20;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("select-side") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("side-header") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("side-title") }, });
    const __VLS_69 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }));
    const __VLS_71 = __VLS_70({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_70));
    let __VLS_75;
    const __VLS_76 = {
        onClick: (__VLS_ctx.clearAll)
    };
    let __VLS_72;
    let __VLS_73;
    __VLS_nonNullable(__VLS_74.slots).default;
    var __VLS_74;
    const __VLS_77 = __VLS_resolvedLocalAndGlobalComponents.ElScrollbar;
    /** @type { [typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, ] } */
    // @ts-ignore
    const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({ maxHeight: ("500px"), }));
    const __VLS_79 = __VLS_78({ maxHeight: ("500px"), }, ...__VLS_functionalComponentArgsRest(__VLS_78));
    const __VLS_83 = __VLS_resolvedLocalAndGlobalComponents.ElTree;
    /** @type { [typeof __VLS_components.ElTree, typeof __VLS_components.elTree, typeof __VLS_components.ElTree, typeof __VLS_components.elTree, ] } */
    // @ts-ignore
    const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({ data: ((__VLS_ctx.treeData)), props: ((__VLS_ctx.treeProps)), nodeKey: ("key"), defaultExpandAll: (true), ...{ class: ("selected-tree") }, }));
    const __VLS_85 = __VLS_84({ data: ((__VLS_ctx.treeData)), props: ((__VLS_ctx.treeProps)), nodeKey: ("key"), defaultExpandAll: (true), ...{ class: ("selected-tree") }, }, ...__VLS_functionalComponentArgsRest(__VLS_84));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_88.slots);
        const [{ node, data }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("tree-node") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("node-label") }, });
        (node.label);
        const __VLS_89 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({ ...{ 'onClick': {} }, ...{ class: ("node-delete") }, }));
        const __VLS_91 = __VLS_90({ ...{ 'onClick': {} }, ...{ class: ("node-delete") }, }, ...__VLS_functionalComponentArgsRest(__VLS_90));
        let __VLS_95;
        const __VLS_96 = {
            onClick: (...[$event]) => {
                __VLS_ctx.removeNode(data);
            }
        };
        let __VLS_92;
        let __VLS_93;
        const __VLS_97 = __VLS_resolvedLocalAndGlobalComponents.Close;
        /** @type { [typeof __VLS_components.Close, ] } */
        // @ts-ignore
        const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({}));
        const __VLS_99 = __VLS_98({}, ...__VLS_functionalComponentArgsRest(__VLS_98));
        __VLS_nonNullable(__VLS_94.slots).default;
        var __VLS_94;
    }
    var __VLS_88;
    if (__VLS_ctx.treeData.length === 0) {
        const __VLS_103 = __VLS_resolvedLocalAndGlobalComponents.ElEmpty;
        /** @type { [typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ] } */
        // @ts-ignore
        const __VLS_104 = __VLS_asFunctionalComponent(__VLS_103, new __VLS_103({ description: ("暂未选取"), imageSize: ((60)), }));
        const __VLS_105 = __VLS_104({ description: ("暂未选取"), imageSize: ((60)), }, ...__VLS_functionalComponentArgsRest(__VLS_104));
    }
    __VLS_nonNullable(__VLS_82.slots).default;
    var __VLS_82;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("dialog-footer") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("selection-summary") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("highlight") }, });
        (__VLS_ctx.treeSchoolCount);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("highlight") }, });
        (__VLS_ctx.selectedClassIds.length);
        const __VLS_109 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_111 = __VLS_110({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_110));
        let __VLS_115;
        const __VLS_116 = {
            onClick: (__VLS_ctx.handleConfirm)
        };
        let __VLS_112;
        let __VLS_113;
        __VLS_nonNullable(__VLS_114.slots).default;
        var __VLS_114;
    }
    var __VLS_5;
    __VLS_styleScopedClasses['student-select-dialog'];
    __VLS_styleScopedClasses['student-select-layout'];
    __VLS_styleScopedClasses['select-main'];
    __VLS_styleScopedClasses['mb-4'];
    __VLS_styleScopedClasses['select-tabs'];
    __VLS_styleScopedClasses['list-container'];
    __VLS_styleScopedClasses['list-item'];
    __VLS_styleScopedClasses['active'];
    __VLS_styleScopedClasses['item-info'];
    __VLS_styleScopedClasses['item-title'];
    __VLS_styleScopedClasses['item-meta'];
    __VLS_styleScopedClasses['list-container'];
    __VLS_styleScopedClasses['list-item'];
    __VLS_styleScopedClasses['active'];
    __VLS_styleScopedClasses['item-info'];
    __VLS_styleScopedClasses['item-title'];
    __VLS_styleScopedClasses['item-meta'];
    __VLS_styleScopedClasses['select-side'];
    __VLS_styleScopedClasses['side-header'];
    __VLS_styleScopedClasses['side-title'];
    __VLS_styleScopedClasses['selected-tree'];
    __VLS_styleScopedClasses['tree-node'];
    __VLS_styleScopedClasses['node-label'];
    __VLS_styleScopedClasses['node-delete'];
    __VLS_styleScopedClasses['dialog-footer'];
    __VLS_styleScopedClasses['selection-summary'];
    __VLS_styleScopedClasses['highlight'];
    __VLS_styleScopedClasses['highlight'];
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
            Close: Close,
            activeTab: activeTab,
            searchKeyword: searchKeyword,
            selectedClassIds: selectedClassIds,
            treeProps: treeProps,
            filteredSchools: filteredSchools,
            filteredClasses: filteredClasses,
            treeSchoolCount: treeSchoolCount,
            treeData: treeData,
            isSchoolSelected: isSchoolSelected,
            isClassSelected: isClassSelected,
            toggleSchool: toggleSchool,
            toggleProjectClass: toggleProjectClass,
            removeNode: removeNode,
            clearAll: clearAll,
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
//# sourceMappingURL=StudentSelectDialog.vue.js.map