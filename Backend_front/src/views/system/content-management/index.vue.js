/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { fetchGetPermissionOptions, fetchGetRolePermissions, fetchUpdateRolePermissions } from '@/api/system/content-management';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ContentManagement' });
const loading = ref(false);
const tableData = ref([]);
const permissionOptions = ref([]);
const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
});
const searchForm = reactive({
    roleName: ''
});
const dialogVisible = ref(false);
const saveLoading = ref(false);
const currentRole = ref(null);
const selectedPermissions = ref([]);
const getPermissionTitle = (code) => {
    return permissionOptions.value.find(item => item.menuPermission === code)?.title || code;
};
const loadPermissionOptions = async () => {
    const res = await fetchGetPermissionOptions();
    if (res) {
        permissionOptions.value = res;
    }
};
const loadData = async () => {
    loading.value = true;
    try {
        const res = await fetchGetRolePermissions({
            current: pagination.current,
            size: pagination.size,
            roleName: searchForm.roleName
        });
        if (res) {
            tableData.value = res.records;
            pagination.total = res.total;
        }
    }
    catch (error) {
        console.error('加载失败:', error);
    }
    finally {
        loading.value = false;
    }
};
const handleSearch = () => {
    pagination.current = 1;
    loadData();
};
const handleCurrentChange = (val) => {
    pagination.current = val;
    loadData();
};
const handleSizeChange = (val) => {
    pagination.size = val;
    loadData();
};
const handleEdit = (row) => {
    currentRole.value = row;
    selectedPermissions.value = [...(row.permissionCodes || [])];
    dialogVisible.value = true;
};
const handleSave = async () => {
    if (!currentRole.value)
        return;
    saveLoading.value = true;
    try {
        await fetchUpdateRolePermissions(currentRole.value.id, selectedPermissions.value);
        ElMessage.success('保存成功');
        dialogVisible.value = false;
        loadData();
    }
    catch (error) {
        console.error('保存失败:', error);
        ElMessage.error('保存失败，请稍后重试');
    }
    finally {
        saveLoading.value = false;
    }
};
onMounted(async () => {
    await loadPermissionOptions();
    loadData();
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("page-container") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ shadow: ("never"), }));
    const __VLS_2 = __VLS_1({ shadow: ("never"), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { header: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-between items-center") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("font-bold") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex gap-4") }, });
        const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.searchForm.roleName)), placeholder: ("请输入角色名称"), ...{ style: ({}) }, clearable: (true), }));
        const __VLS_8 = __VLS_7({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.searchForm.roleName)), placeholder: ("请输入角色名称"), ...{ style: ({}) }, clearable: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        let __VLS_12;
        const __VLS_13 = {
            onKeyup: (__VLS_ctx.handleSearch)
        };
        let __VLS_9;
        let __VLS_10;
        var __VLS_11;
        const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_16 = __VLS_15({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_15));
        let __VLS_20;
        const __VLS_21 = {
            onClick: (__VLS_ctx.handleSearch)
        };
        let __VLS_17;
        let __VLS_18;
        __VLS_nonNullable(__VLS_19.slots).default;
        var __VLS_19;
    }
    const __VLS_22 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({ data: ((__VLS_ctx.tableData)), border: (true), ...{ style: ({}) }, }));
    const __VLS_24 = __VLS_23({ data: ((__VLS_ctx.tableData)), border: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_23));
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.loading) }, null, null);
    const __VLS_28 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({ prop: ("roleName"), label: ("角色名称"), width: ("180"), }));
    const __VLS_30 = __VLS_29({ prop: ("roleName"), label: ("角色名称"), width: ("180"), }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    const __VLS_34 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({ prop: ("roleCode"), label: ("角色编码"), width: ("180"), }));
    const __VLS_36 = __VLS_35({ prop: ("roleCode"), label: ("角色编码"), width: ("180"), }, ...__VLS_functionalComponentArgsRest(__VLS_35));
    const __VLS_40 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({ prop: ("description"), label: ("描述"), minWidth: ("220"), }));
    const __VLS_42 = __VLS_41({ prop: ("description"), label: ("描述"), minWidth: ("220"), }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    const __VLS_46 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({ label: ("已分配权限"), minWidth: ("360"), }));
    const __VLS_48 = __VLS_47({ label: ("已分配权限"), minWidth: ("360"), }, ...__VLS_functionalComponentArgsRest(__VLS_47));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_51.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex flex-wrap gap-2") }, });
        for (const [code] of __VLS_getVForSourceType((row.permissionCodes))) {
            const __VLS_52 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
            /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
            // @ts-ignore
            const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({ key: ((code)), type: ("success"), effect: ("plain"), }));
            const __VLS_54 = __VLS_53({ key: ((code)), type: ("success"), effect: ("plain"), }, ...__VLS_functionalComponentArgsRest(__VLS_53));
            (__VLS_ctx.getPermissionTitle(code));
            __VLS_nonNullable(__VLS_57.slots).default;
            var __VLS_57;
        }
    }
    var __VLS_51;
    const __VLS_58 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({ label: ("操作"), width: ("140"), fixed: ("right"), }));
    const __VLS_60 = __VLS_59({ label: ("操作"), width: ("140"), fixed: ("right"), }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_63.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_64 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({ ...{ 'onClick': {} }, type: ("primary"), link: (true), }));
        const __VLS_66 = __VLS_65({ ...{ 'onClick': {} }, type: ("primary"), link: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_65));
        let __VLS_70;
        const __VLS_71 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleEdit(row);
            }
        };
        let __VLS_67;
        let __VLS_68;
        __VLS_nonNullable(__VLS_69.slots).default;
        var __VLS_69;
    }
    var __VLS_63;
    __VLS_nonNullable(__VLS_27.slots).default;
    var __VLS_27;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-end mt-4") }, });
    const __VLS_72 = __VLS_resolvedLocalAndGlobalComponents.ElPagination;
    /** @type { [typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ] } */
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({ ...{ 'onSizeChange': {} }, ...{ 'onCurrentChange': {} }, currentPage: ((__VLS_ctx.pagination.current)), pageSize: ((__VLS_ctx.pagination.size)), total: ((__VLS_ctx.pagination.total)), pageSizes: (([10, 20, 50])), layout: ("total, sizes, prev, pager, next, jumper"), }));
    const __VLS_74 = __VLS_73({ ...{ 'onSizeChange': {} }, ...{ 'onCurrentChange': {} }, currentPage: ((__VLS_ctx.pagination.current)), pageSize: ((__VLS_ctx.pagination.size)), total: ((__VLS_ctx.pagination.total)), pageSizes: (([10, 20, 50])), layout: ("total, sizes, prev, pager, next, jumper"), }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    let __VLS_78;
    const __VLS_79 = {
        onSizeChange: (__VLS_ctx.handleSizeChange)
    };
    const __VLS_80 = {
        onCurrentChange: (__VLS_ctx.handleCurrentChange)
    };
    let __VLS_75;
    let __VLS_76;
    var __VLS_77;
    var __VLS_5;
    const __VLS_81 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */
    // @ts-ignore
    const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({ modelValue: ((__VLS_ctx.dialogVisible)), title: ((`设置角色权限 - ${__VLS_ctx.currentRole?.roleName || ''}`)), width: ("680px"), }));
    const __VLS_83 = __VLS_82({ modelValue: ((__VLS_ctx.dialogVisible)), title: ((`设置角色权限 - ${__VLS_ctx.currentRole?.roleName || ''}`)), width: ("680px"), }, ...__VLS_functionalComponentArgsRest(__VLS_82));
    const __VLS_87 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */
    // @ts-ignore
    const __VLS_88 = __VLS_asFunctionalComponent(__VLS_87, new __VLS_87({ labelPosition: ("top"), }));
    const __VLS_89 = __VLS_88({ labelPosition: ("top"), }, ...__VLS_functionalComponentArgsRest(__VLS_88));
    const __VLS_93 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({ label: ("允许访问的页面"), }));
    const __VLS_95 = __VLS_94({ label: ("允许访问的页面"), }, ...__VLS_functionalComponentArgsRest(__VLS_94));
    const __VLS_99 = __VLS_resolvedLocalAndGlobalComponents.ElCheckboxGroup;
    /** @type { [typeof __VLS_components.ElCheckboxGroup, typeof __VLS_components.elCheckboxGroup, typeof __VLS_components.ElCheckboxGroup, typeof __VLS_components.elCheckboxGroup, ] } */
    // @ts-ignore
    const __VLS_100 = __VLS_asFunctionalComponent(__VLS_99, new __VLS_99({ modelValue: ((__VLS_ctx.selectedPermissions)), }));
    const __VLS_101 = __VLS_100({ modelValue: ((__VLS_ctx.selectedPermissions)), }, ...__VLS_functionalComponentArgsRest(__VLS_100));
    for (const [permission] of __VLS_getVForSourceType((__VLS_ctx.permissionOptions))) {
        const __VLS_105 = __VLS_resolvedLocalAndGlobalComponents.ElCheckbox;
        /** @type { [typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ] } */
        // @ts-ignore
        const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({ key: ((permission.menuPermission)), label: ((permission.menuPermission)), ...{ class: ("mb-2") }, ...{ style: ({}) }, }));
        const __VLS_107 = __VLS_106({ key: ((permission.menuPermission)), label: ((permission.menuPermission)), ...{ class: ("mb-2") }, ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_106));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex items-center") }, });
        if (permission.icon) {
            const __VLS_111 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
            /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
            // @ts-ignore
            const __VLS_112 = __VLS_asFunctionalComponent(__VLS_111, new __VLS_111({ icon: ((permission.icon)), ...{ class: ("mr-1") }, }));
            const __VLS_113 = __VLS_112({ icon: ((permission.icon)), ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_112));
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (permission.title);
        __VLS_nonNullable(__VLS_110.slots).default;
        var __VLS_110;
    }
    __VLS_nonNullable(__VLS_104.slots).default;
    var __VLS_104;
    __VLS_nonNullable(__VLS_98.slots).default;
    var __VLS_98;
    __VLS_nonNullable(__VLS_92.slots).default;
    var __VLS_92;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_86.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("dialog-footer") }, });
        const __VLS_117 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_118 = __VLS_asFunctionalComponent(__VLS_117, new __VLS_117({ ...{ 'onClick': {} }, }));
        const __VLS_119 = __VLS_118({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_118));
        let __VLS_123;
        const __VLS_124 = {
            onClick: (...[$event]) => {
                __VLS_ctx.dialogVisible = false;
            }
        };
        let __VLS_120;
        let __VLS_121;
        __VLS_nonNullable(__VLS_122.slots).default;
        var __VLS_122;
        const __VLS_125 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.saveLoading)), }));
        const __VLS_127 = __VLS_126({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.saveLoading)), }, ...__VLS_functionalComponentArgsRest(__VLS_126));
        let __VLS_131;
        const __VLS_132 = {
            onClick: (__VLS_ctx.handleSave)
        };
        let __VLS_128;
        let __VLS_129;
        __VLS_nonNullable(__VLS_130.slots).default;
        var __VLS_130;
    }
    var __VLS_86;
    __VLS_styleScopedClasses['page-container'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['gap-4'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['flex-wrap'];
    __VLS_styleScopedClasses['gap-2'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-end'];
    __VLS_styleScopedClasses['mt-4'];
    __VLS_styleScopedClasses['mb-2'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['dialog-footer'];
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
            loading: loading,
            tableData: tableData,
            permissionOptions: permissionOptions,
            pagination: pagination,
            searchForm: searchForm,
            dialogVisible: dialogVisible,
            saveLoading: saveLoading,
            currentRole: currentRole,
            selectedPermissions: selectedPermissions,
            getPermissionTitle: getPermissionTitle,
            handleSearch: handleSearch,
            handleCurrentChange: handleCurrentChange,
            handleSizeChange: handleSizeChange,
            handleEdit: handleEdit,
            handleSave: handleSave,
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