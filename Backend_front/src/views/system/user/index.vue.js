/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue';
import { useTable } from '@/hooks/core/useTable';
import { fetchGetUserList, fetchDeleteUser, fetchImportParentUsers, fetchDownloadParentTemplate } from '@/api/system/user';
import defaultAvatar from '@/assets/images/avatar/avatar.webp';
import UserSearch from './modules/user-search.vue';
import UserDialog from './modules/user-dialog.vue';
import { ElTag, ElMessageBox, ElImage, ElMessage } from 'element-plus';
import { fetchGetRoleList } from '@/api/system/role';
import { onMounted } from 'vue';
import { UploadFilled, Loading, Delete, Upload, Document, InfoFilled, Plus } from '@element-plus/icons-vue';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'User' });
// 弹窗相关
const dialogType = ref('add');
const dialogVisible = ref(false);
const currentUserData = ref({});
const parentImportVisible = ref(false);
const parentImportLoading = ref(false);
const parentFileList = ref([]);
const parentUploadRef = ref();
// 角色列表缓存，用于表格渲染
const roleMap = ref({});
const getRoleMap = async () => {
    try {
        const res = await fetchGetRoleList({ current: 1, size: 100 });
        if (res && res.records) {
            const map = {};
            res.records.forEach((r) => {
                map[String(r.id)] = r.roleName;
            });
            roleMap.value = map;
        }
    }
    catch (e) {
        console.error(e);
    }
};
onMounted(() => {
    getRoleMap();
});
// 选中行
const selectedRows = ref([]);
// 搜索表单
const searchForm = ref({
    userName: '',
    userPhone: '',
    roleId: null,
    schoolId: '',
    classId: ''
});
// 用户状态配置
const USER_STATUS_CONFIG = {
    '1': { type: 'success', text: '在线' },
    '2': { type: 'info', text: '离线' },
    '3': { type: 'warning', text: '异常' },
    '4': { type: 'danger', text: '注销' }
};
/**
 * 获取用户状态配置
 */
const getUserStatusConfig = (status) => {
    return (USER_STATUS_CONFIG[status] || {
        type: 'info',
        text: '未知'
    });
};
const { columns, columnChecks, data, loading, pagination, searchParams, getData, replaceSearchParams, resetSearchParams, handleSizeChange, handleCurrentChange, refreshData } = useTable({
    // 核心配置
    core: {
        apiFn: fetchGetUserList,
        apiParams: {
            current: 1,
            size: 20,
            ...searchForm.value
        },
        // 自定义分页字段映射，未设置时将使用全局配置 tableConfig.ts 中的 paginationKey
        // paginationKey: {
        //   current: 'pageNum',
        //   size: 'pageSize'
        // },
        columnsFactory: () => [
            { type: 'selection' }, // 勾选列
            { type: 'index', width: 60, label: '序号' }, // 序号
            {
                prop: 'userInfo',
                label: '用户信息',
                width: 200,
                formatter: (row) => {
                    const avatar = row.avatar || defaultAvatar;
                    return h('div', { class: 'user flex-c' }, [
                        h(ElImage, {
                            class: 'size-9.5 rounded-md',
                            src: avatar,
                            previewSrcList: [avatar],
                            previewTeleported: true
                        }),
                        h('div', { class: 'ml-2' }, [
                            h('p', { class: 'user-name font-bold' }, row.userName),
                            h('p', { class: 'text-xs text-gray-400' }, row.nickName)
                        ])
                    ]);
                }
            },
            {
                prop: 'userType',
                label: '角色类型',
                width: 100,
                formatter: (row) => {
                    // 根据接口返回的角色字典进行映射
                    const roleName = roleMap.value[row.userType] || '未知角色';
                    // 根据角色类型简单分配颜色（这里依然按 ID 粗略分配）
                    const colors = { '1': 'danger', '2': 'primary', '3': 'success', '4': 'warning' };
                    return h(ElTag, { type: (colors[row.userType] || 'info') }, () => roleName);
                }
            },
            {
                prop: 'isVip',
                label: 'VIP',
                width: 80,
                align: 'center',
                formatter: (row) => {
                    return h(ElTag, { type: row.isVip === 1 ? 'success' : 'info', effect: row.isVip === 1 ? 'dark' : 'plain' }, () => (row.isVip === 1 ? '是' : '否'));
                }
            },
            {
                prop: 'isSvip',
                label: 'SVIP',
                width: 80,
                align: 'center',
                formatter: (row) => {
                    return h(ElTag, { type: row.isSvip === 1 ? 'warning' : 'info', effect: row.isSvip === 1 ? 'dark' : 'plain' }, () => (row.isSvip === 1 ? '是' : '否'));
                }
            },
            {
                prop: 'bindingInfo',
                label: '绑定详情',
                minWidth: 250,
                formatter: (row) => {
                    const info = [];
                    if (row.userType === '1' || row.userType === '2') {
                        // 管理员和后台管理不需要绑定
                        info.push(h('p', '-'));
                    }
                    else if (row.userType === '5') {
                        // 假设 5 是学校用户（目前代码中并未定义5，保留以前逻辑兼容）
                        info.push(h('p', `绑定学校: ${row.schoolName || '未绑定'}`));
                    }
                    else if (row.userType === '3') {
                        // 家长用户
                        if (row.boundStudents && row.boundStudents.length > 0) {
                            row.boundStudents.forEach((s) => {
                                info.push(h('p', `学生: ${s.name} (${s.school} / ${s.className || '未设置'})`));
                            });
                        }
                        else if (row.schoolName && row.className && row.studentName) {
                            // 向后兼容之前的单条数据格式
                            info.push(h('p', `学校班级: ${row.schoolName} / ${row.className}`));
                            info.push(h('p', `关联学生: ${row.studentName}`));
                        }
                        else {
                            info.push(h('p', { class: 'text-red-500' }, '未绑定'));
                        }
                    }
                    else if (row.userType === '4') {
                        // 学生用户
                        info.push(h('p', `学校班级: ${row.schoolName || '未设置'} / ${row.className || '未设置'}`));
                        info.push(h('p', `关联家长: ${row.parentName || '无'}`));
                    }
                    else {
                        info.push(h('p', '-'));
                    }
                    return h('div', { class: 'text-xs' }, info);
                }
            },
            { prop: 'userPhone', label: '手机号', width: 120 },
            {
                prop: 'status',
                label: '状态',
                width: 80,
                formatter: (row) => {
                    const statusConfig = getUserStatusConfig(row.status);
                    return h(ElTag, { type: statusConfig.type }, () => statusConfig.text);
                }
            },
            {
                prop: 'createTime',
                label: '创建日期',
                width: 160,
                sortable: true
            },
            {
                prop: 'operation',
                label: '操作',
                width: 120,
                fixed: 'right', // 固定列
                formatter: (row) => h('div', [
                    h(ArtButtonTable, {
                        type: 'edit',
                        onClick: () => showDialog('edit', row)
                    }),
                    h(ArtButtonTable, {
                        type: 'delete',
                        onClick: () => deleteUser(row)
                    })
                ])
            }
        ]
    }
});
/**
 * 搜索
 */
const handleSearch = (params) => {
    // 过滤掉空字符串，避免发送无效参数
    const filteredParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== ''));
    replaceSearchParams(filteredParams);
    refreshData();
};
/**
 * 重置
 */
const handleReset = () => {
    resetSearchParams();
};
/**
 * 显示用户弹窗
 */
const showDialog = (type, row) => {
    console.log('打开弹窗:', { type, row });
    dialogType.value = type;
    currentUserData.value = row || {};
    nextTick(() => {
        dialogVisible.value = true;
    });
};
/**
 * 删除用户
 */
const deleteUser = (row) => {
    ElMessageBox.confirm(`确定要删除该用户 ${row.userName} 吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
    }).then(async () => {
        try {
            await fetchDeleteUser(row.id);
            ElMessage.success('删除成功');
            refreshData();
        }
        catch (error) {
            // ...
        }
    }).catch(() => { });
};
/**
 * 处理弹窗提交事件
 */
const handleDialogSubmit = async () => {
    try {
        dialogVisible.value = false;
        currentUserData.value = {};
        refreshData();
    }
    catch (error) {
        console.error('提交失败:', error);
    }
};
/**
 * 处理表格行选择变化
 */
const handleSelectionChange = (selection) => {
    selectedRows.value = selection;
    console.log('选中行数据:', selectedRows.value);
};
const handleOpenParentImport = () => {
    parentFileList.value = [];
    parentImportVisible.value = true;
};
const handleParentFileChange = (uploadFile, uploadFiles) => {
    parentFileList.value = uploadFiles;
};
const handleParentRemove = (file, uploadFiles) => {
    parentFileList.value = uploadFiles;
};
const handleContinueParentUpload = () => {
    if (parentUploadRef.value) {
        const input = parentUploadRef.value.$el.querySelector('input[type="file"]');
        if (input) {
            input.click();
        }
    }
};
const submitParentImport = async () => {
    const readyFiles = parentFileList.value.filter((f) => f.status === 'ready' || f.status === 'fail');
    if (readyFiles.length === 0) {
        ElMessage.warning('没有待导入的文件');
        return;
    }
    parentImportLoading.value = true;
    try {
        // 逐个文件并行导入
        const results = await Promise.allSettled(readyFiles.map(async (file) => {
            file.status = 'uploading';
            try {
                const formData = new FormData();
                formData.append('file', file.raw);
                // fetchImportParentUsers 内部使用 request，非 200 会抛出异常进入 catch
                const res = await fetchImportParentUsers(formData);
                file.status = 'success';
                file.errorMsg = '';
                return { name: file.name, success: true, message: res?.message || '导入成功' };
            }
            catch (error) {
                file.status = 'fail';
                file.errorMsg = error.message || '网络错误';
                return { name: file.name, success: false, message: error.message };
            }
        }));
        // 统计结果并给出提示
        const successItems = results.filter((r) => r.value?.success);
        if (successItems.length > 0) {
            ElMessage.success(`成功导入 ${successItems.length} 个文件`);
            refreshData();
        }
        const failItems = results.filter((r) => !r.value?.success);
        if (failItems.length > 0) {
            ElMessage.error(`${failItems.length} 个文件导入失败，请查看明细`);
        }
    }
    catch (error) {
        console.error(error);
        ElMessage.error('导入任务处理异常');
    }
    finally {
        parentImportLoading.value = false;
    }
};
const downloadParentTemplate = async () => {
    try {
        await fetchDownloadParentTemplate();
    }
    catch (error) {
        console.error(error);
    }
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("user-page art-full-height") }, });
    // @ts-ignore
    [UserSearch, UserSearch,];
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(UserSearch, new UserSearch({ ...{ 'onSearch': {} }, ...{ 'onReset': {} }, modelValue: ((__VLS_ctx.searchForm)), }));
    const __VLS_1 = __VLS_0({ ...{ 'onSearch': {} }, ...{ 'onReset': {} }, modelValue: ((__VLS_ctx.searchForm)), }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    let __VLS_5;
    const __VLS_6 = {
        onSearch: (__VLS_ctx.handleSearch)
    };
    const __VLS_7 = {
        onReset: (__VLS_ctx.resetSearchParams)
    };
    let __VLS_2;
    let __VLS_3;
    var __VLS_4;
    const __VLS_8 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.ElCard, ] } */
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({ ...{ class: ("art-table-card") }, }));
    const __VLS_10 = __VLS_9({ ...{ class: ("art-table-card") }, }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ArtTableHeader;
    /** @type { [typeof __VLS_components.ArtTableHeader, typeof __VLS_components.ArtTableHeader, ] } */
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ ...{ 'onRefresh': {} }, columns: ((__VLS_ctx.columnChecks)), loading: ((__VLS_ctx.loading)), }));
    const __VLS_16 = __VLS_15({ ...{ 'onRefresh': {} }, columns: ((__VLS_ctx.columnChecks)), loading: ((__VLS_ctx.loading)), }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    let __VLS_20;
    const __VLS_21 = {
        onRefresh: (__VLS_ctx.refreshData)
    };
    let __VLS_17;
    let __VLS_18;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { left: __VLS_thisSlot } = __VLS_nonNullable(__VLS_19.slots);
        const __VLS_22 = __VLS_resolvedLocalAndGlobalComponents.ElSpace;
        /** @type { [typeof __VLS_components.ElSpace, typeof __VLS_components.ElSpace, ] } */
        // @ts-ignore
        const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({ wrap: (true), }));
        const __VLS_24 = __VLS_23({ wrap: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_23));
        const __VLS_28 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({ ...{ 'onClick': {} }, }));
        const __VLS_30 = __VLS_29({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
        let __VLS_34;
        const __VLS_35 = {
            onClick: (__VLS_ctx.handleOpenParentImport)
        };
        let __VLS_31;
        let __VLS_32;
        __VLS_nonNullable(__VLS_33.slots).default;
        var __VLS_33;
        const __VLS_36 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({ ...{ 'onClick': {} }, }));
        const __VLS_38 = __VLS_37({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
        let __VLS_42;
        const __VLS_43 = {
            onClick: (...[$event]) => {
                __VLS_ctx.showDialog('add');
            }
        };
        let __VLS_39;
        let __VLS_40;
        __VLS_nonNullable(__VLS_41.slots).default;
        var __VLS_41;
        __VLS_nonNullable(__VLS_27.slots).default;
        var __VLS_27;
    }
    var __VLS_19;
    const __VLS_44 = __VLS_resolvedLocalAndGlobalComponents.ArtTable;
    /** @type { [typeof __VLS_components.ArtTable, typeof __VLS_components.ArtTable, ] } */
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({ ...{ 'onSelectionChange': {} }, ...{ 'onPagination:sizeChange': {} }, ...{ 'onPagination:currentChange': {} }, loading: ((__VLS_ctx.loading)), data: __VLS_ctx.data, columns: ((__VLS_ctx.columns)), pagination: ((__VLS_ctx.pagination)), }));
    const __VLS_46 = __VLS_45({ ...{ 'onSelectionChange': {} }, ...{ 'onPagination:sizeChange': {} }, ...{ 'onPagination:currentChange': {} }, loading: ((__VLS_ctx.loading)), data: __VLS_ctx.data, columns: ((__VLS_ctx.columns)), pagination: ((__VLS_ctx.pagination)), }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    let __VLS_50;
    const __VLS_51 = {
        onSelectionChange: (__VLS_ctx.handleSelectionChange)
    };
    const __VLS_52 = {
        'onPagination:sizeChange': (__VLS_ctx.handleSizeChange)
    };
    const __VLS_53 = {
        'onPagination:currentChange': (__VLS_ctx.handleCurrentChange)
    };
    let __VLS_47;
    let __VLS_48;
    var __VLS_49;
    // @ts-ignore
    [UserDialog,];
    // @ts-ignore
    const __VLS_54 = __VLS_asFunctionalComponent(UserDialog, new UserDialog({ ...{ 'onSubmit': {} }, visible: ((__VLS_ctx.dialogVisible)), type: ((__VLS_ctx.dialogType)), userData: ((__VLS_ctx.currentUserData)), }));
    const __VLS_55 = __VLS_54({ ...{ 'onSubmit': {} }, visible: ((__VLS_ctx.dialogVisible)), type: ((__VLS_ctx.dialogType)), userData: ((__VLS_ctx.currentUserData)), }, ...__VLS_functionalComponentArgsRest(__VLS_54));
    let __VLS_59;
    const __VLS_60 = {
        onSubmit: (__VLS_ctx.handleDialogSubmit)
    };
    let __VLS_56;
    let __VLS_57;
    var __VLS_58;
    const __VLS_61 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.ElDialog, ] } */
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({ modelValue: ((__VLS_ctx.parentImportVisible)), title: ("批量导入家长账号"), width: ("560px"), }));
    const __VLS_63 = __VLS_62({ modelValue: ((__VLS_ctx.parentImportVisible)), title: ("批量导入家长账号"), width: ("560px"), }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("import-container") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-start mb-4") }, });
    const __VLS_67 = __VLS_resolvedLocalAndGlobalComponents.ElTooltip;
    /** @type { [typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ] } */
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({ placement: ("right"), effect: ("light"), }));
    const __VLS_69 = __VLS_68({ placement: ("right"), effect: ("light"), }, ...__VLS_functionalComponentArgsRest(__VLS_68));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { content: __VLS_thisSlot } = __VLS_nonNullable(__VLS_72.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("text-xs leading-6 text-gray-600 p-2") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("instructions-trigger") }, });
    const __VLS_73 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
    /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
    // @ts-ignore
    const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({ ...{ class: ("mr-1") }, }));
    const __VLS_75 = __VLS_74({ ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_74));
    const __VLS_79 = __VLS_resolvedLocalAndGlobalComponents.InfoFilled;
    /** @type { [typeof __VLS_components.InfoFilled, ] } */
    // @ts-ignore
    const __VLS_80 = __VLS_asFunctionalComponent(__VLS_79, new __VLS_79({}));
    const __VLS_81 = __VLS_80({}, ...__VLS_functionalComponentArgsRest(__VLS_80));
    __VLS_nonNullable(__VLS_78.slots).default;
    var __VLS_78;
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    var __VLS_72;
    const __VLS_85 = __VLS_resolvedLocalAndGlobalComponents.ElUpload;
    /** @type { [typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ] } */
    // @ts-ignore
    const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({ ref: ("parentUploadRef"), ...{ class: ("upload-demo") }, drag: (true), action: ("#"), multiple: (true), autoUpload: ((false)), onChange: ((__VLS_ctx.handleParentFileChange)), fileList: ((__VLS_ctx.parentFileList)), onRemove: ((__VLS_ctx.handleParentRemove)), showFileList: ((false)), accept: (".xlsx, .xls"), }));
    const __VLS_87 = __VLS_86({ ref: ("parentUploadRef"), ...{ class: ("upload-demo") }, drag: (true), action: ("#"), multiple: (true), autoUpload: ((false)), onChange: ((__VLS_ctx.handleParentFileChange)), fileList: ((__VLS_ctx.parentFileList)), onRemove: ((__VLS_ctx.handleParentRemove)), showFileList: ((false)), accept: (".xlsx, .xls"), }, ...__VLS_functionalComponentArgsRest(__VLS_86));
    // @ts-ignore navigation for `const parentUploadRef = ref()`
    __VLS_ctx.parentUploadRef;
    var __VLS_91 = {};
    if (__VLS_ctx.parentFileList.length === 0) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("upload-empty-content") }, });
        const __VLS_92 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({ ...{ class: ("el-icon--upload") }, }));
        const __VLS_94 = __VLS_93({ ...{ class: ("el-icon--upload") }, }, ...__VLS_functionalComponentArgsRest(__VLS_93));
        const __VLS_98 = __VLS_resolvedLocalAndGlobalComponents.UploadFilled;
        /** @type { [typeof __VLS_components.UploadFilled, ] } */
        // @ts-ignore
        const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({}));
        const __VLS_100 = __VLS_99({}, ...__VLS_functionalComponentArgsRest(__VLS_99));
        __VLS_nonNullable(__VLS_97.slots).default;
        var __VLS_97;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("el-upload__text") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.em, __VLS_intrinsicElements.em)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("el-upload__tip mt-2") }, });
    }
    else {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: () => { } }, ...{ class: ("upload-list-content") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-between items-center mb-2 px-2") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-xs font-bold text-gray-500") }, });
        (__VLS_ctx.parentFileList.length);
        const __VLS_104 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({ ...{ 'onClick': {} }, link: (true), type: ("danger"), size: ("small"), }));
        const __VLS_106 = __VLS_105({ ...{ 'onClick': {} }, link: (true), type: ("danger"), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_105));
        let __VLS_110;
        const __VLS_111 = {
            onClick: (...[$event]) => {
                if (!(!((__VLS_ctx.parentFileList.length === 0))))
                    return;
                __VLS_ctx.parentFileList = [];
            }
        };
        let __VLS_107;
        let __VLS_108;
        __VLS_nonNullable(__VLS_109.slots).default;
        var __VLS_109;
        const __VLS_112 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
        /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
        // @ts-ignore
        const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({ data: ((__VLS_ctx.parentFileList)), size: ("small"), border: (true), maxHeight: ("180"), ...{ class: ("import-table") }, }));
        const __VLS_114 = __VLS_113({ data: ((__VLS_ctx.parentFileList)), size: ("small"), border: (true), maxHeight: ("180"), ...{ class: ("import-table") }, }, ...__VLS_functionalComponentArgsRest(__VLS_113));
        const __VLS_118 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({ prop: ("name"), label: ("文件名"), showOverflowTooltip: (true), }));
        const __VLS_120 = __VLS_119({ prop: ("name"), label: ("文件名"), showOverflowTooltip: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_119));
        const __VLS_124 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({ label: ("状态"), width: ("90"), align: ("center"), }));
        const __VLS_126 = __VLS_125({ label: ("状态"), width: ("90"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_125));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_129.slots);
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("status-cell") }, });
            if (row.status === 'ready') {
                const __VLS_130 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({ type: ("info"), size: ("small"), ...{ class: ("status-tag-mini") }, }));
                const __VLS_132 = __VLS_131({ type: ("info"), size: ("small"), ...{ class: ("status-tag-mini") }, }, ...__VLS_functionalComponentArgsRest(__VLS_131));
                __VLS_nonNullable(__VLS_135.slots).default;
                var __VLS_135;
            }
            else if (row.status === 'success') {
                const __VLS_136 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({ type: ("success"), size: ("small"), ...{ class: ("status-tag-mini tag-success-simple") }, }));
                const __VLS_138 = __VLS_137({ type: ("success"), size: ("small"), ...{ class: ("status-tag-mini tag-success-simple") }, }, ...__VLS_functionalComponentArgsRest(__VLS_137));
                __VLS_nonNullable(__VLS_141.slots).default;
                var __VLS_141;
            }
            else if (row.status === 'fail') {
                const __VLS_142 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_143 = __VLS_asFunctionalComponent(__VLS_142, new __VLS_142({ type: ("danger"), size: ("small"), ...{ class: ("status-tag-mini") }, }));
                const __VLS_144 = __VLS_143({ type: ("danger"), size: ("small"), ...{ class: ("status-tag-mini") }, }, ...__VLS_functionalComponentArgsRest(__VLS_143));
                if (row.errorMsg) {
                    const __VLS_148 = __VLS_resolvedLocalAndGlobalComponents.ElTooltip;
                    /** @type { [typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ] } */
                    // @ts-ignore
                    const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({ content: ((row.errorMsg)), placement: ("top"), }));
                    const __VLS_150 = __VLS_149({ content: ((row.errorMsg)), placement: ("top"), }, ...__VLS_functionalComponentArgsRest(__VLS_149));
                    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                    __VLS_nonNullable(__VLS_153.slots).default;
                    var __VLS_153;
                }
                else {
                    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                }
                __VLS_nonNullable(__VLS_147.slots).default;
                var __VLS_147;
            }
            else {
                const __VLS_154 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_155 = __VLS_asFunctionalComponent(__VLS_154, new __VLS_154({ type: ("primary"), size: ("small"), ...{ class: ("status-tag-mini rotating") }, }));
                const __VLS_156 = __VLS_155({ type: ("primary"), size: ("small"), ...{ class: ("status-tag-mini rotating") }, }, ...__VLS_functionalComponentArgsRest(__VLS_155));
                const __VLS_160 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
                /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
                // @ts-ignore
                const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({}));
                const __VLS_162 = __VLS_161({}, ...__VLS_functionalComponentArgsRest(__VLS_161));
                const __VLS_166 = __VLS_resolvedLocalAndGlobalComponents.Loading;
                /** @type { [typeof __VLS_components.Loading, ] } */
                // @ts-ignore
                const __VLS_167 = __VLS_asFunctionalComponent(__VLS_166, new __VLS_166({}));
                const __VLS_168 = __VLS_167({}, ...__VLS_functionalComponentArgsRest(__VLS_167));
                __VLS_nonNullable(__VLS_165.slots).default;
                var __VLS_165;
                __VLS_nonNullable(__VLS_159.slots).default;
                var __VLS_159;
            }
        }
        var __VLS_129;
        const __VLS_172 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({ label: ("操作"), width: ("50"), align: ("center"), }));
        const __VLS_174 = __VLS_173({ label: ("操作"), width: ("50"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_173));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_177.slots);
            const [{ $index }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_178 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_179 = __VLS_asFunctionalComponent(__VLS_178, new __VLS_178({ ...{ 'onClick': {} }, link: (true), type: ("danger"), icon: ((__VLS_ctx.Delete)), }));
            const __VLS_180 = __VLS_179({ ...{ 'onClick': {} }, link: (true), type: ("danger"), icon: ((__VLS_ctx.Delete)), }, ...__VLS_functionalComponentArgsRest(__VLS_179));
            let __VLS_184;
            const __VLS_185 = {
                onClick: (...[$event]) => {
                    if (!(!((__VLS_ctx.parentFileList.length === 0))))
                        return;
                    __VLS_ctx.parentFileList.splice($index, 1);
                }
            };
            let __VLS_181;
            let __VLS_182;
            var __VLS_183;
        }
        var __VLS_177;
        __VLS_nonNullable(__VLS_117.slots).default;
        var __VLS_117;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-2 text-center") }, });
        const __VLS_186 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_187 = __VLS_asFunctionalComponent(__VLS_186, new __VLS_186({ ...{ 'onClick': {} }, link: (true), type: ("primary"), size: ("small"), }));
        const __VLS_188 = __VLS_187({ ...{ 'onClick': {} }, link: (true), type: ("primary"), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_187));
        let __VLS_192;
        const __VLS_193 = {
            onClick: (__VLS_ctx.handleContinueParentUpload)
        };
        let __VLS_189;
        let __VLS_190;
        const __VLS_194 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_195 = __VLS_asFunctionalComponent(__VLS_194, new __VLS_194({ ...{ class: ("mr-1") }, }));
        const __VLS_196 = __VLS_195({ ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_195));
        const __VLS_200 = __VLS_resolvedLocalAndGlobalComponents.Plus;
        /** @type { [typeof __VLS_components.Plus, ] } */
        // @ts-ignore
        const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({}));
        const __VLS_202 = __VLS_201({}, ...__VLS_functionalComponentArgsRest(__VLS_201));
        __VLS_nonNullable(__VLS_199.slots).default;
        var __VLS_199;
        __VLS_nonNullable(__VLS_191.slots).default;
        var __VLS_191;
    }
    __VLS_nonNullable(__VLS_90.slots).default;
    var __VLS_90;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-8 flex flex-col gap-3") }, });
    const __VLS_206 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_207 = __VLS_asFunctionalComponent(__VLS_206, new __VLS_206({ ...{ 'onClick': {} }, type: ("primary"), size: ("large"), ...{ class: ("w-full start-import-btn") }, loading: ((__VLS_ctx.parentImportLoading)), disabled: ((__VLS_ctx.parentFileList.length === 0)), }));
    const __VLS_208 = __VLS_207({ ...{ 'onClick': {} }, type: ("primary"), size: ("large"), ...{ class: ("w-full start-import-btn") }, loading: ((__VLS_ctx.parentImportLoading)), disabled: ((__VLS_ctx.parentFileList.length === 0)), }, ...__VLS_functionalComponentArgsRest(__VLS_207));
    let __VLS_212;
    const __VLS_213 = {
        onClick: (__VLS_ctx.submitParentImport)
    };
    let __VLS_209;
    let __VLS_210;
    if (!__VLS_ctx.parentImportLoading) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { icon: __VLS_thisSlot } = __VLS_nonNullable(__VLS_211.slots);
            const __VLS_214 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
            /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
            // @ts-ignore
            const __VLS_215 = __VLS_asFunctionalComponent(__VLS_214, new __VLS_214({}));
            const __VLS_216 = __VLS_215({}, ...__VLS_functionalComponentArgsRest(__VLS_215));
            const __VLS_220 = __VLS_resolvedLocalAndGlobalComponents.Upload;
            /** @type { [typeof __VLS_components.Upload, ] } */
            // @ts-ignore
            const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({}));
            const __VLS_222 = __VLS_221({}, ...__VLS_functionalComponentArgsRest(__VLS_221));
            __VLS_nonNullable(__VLS_219.slots).default;
            var __VLS_219;
        }
    }
    (__VLS_ctx.parentImportLoading ? '正在导入家长账号...' : '确认开始批量导入');
    var __VLS_211;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-center mt-1") }, });
    const __VLS_226 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_227 = __VLS_asFunctionalComponent(__VLS_226, new __VLS_226({ ...{ 'onClick': {} }, link: (true), type: ("primary"), ...{ class: ("download-link") }, }));
    const __VLS_228 = __VLS_227({ ...{ 'onClick': {} }, link: (true), type: ("primary"), ...{ class: ("download-link") }, }, ...__VLS_functionalComponentArgsRest(__VLS_227));
    let __VLS_232;
    const __VLS_233 = {
        onClick: (__VLS_ctx.downloadParentTemplate)
    };
    let __VLS_229;
    let __VLS_230;
    const __VLS_234 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
    /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
    // @ts-ignore
    const __VLS_235 = __VLS_asFunctionalComponent(__VLS_234, new __VLS_234({ ...{ class: ("mr-1") }, }));
    const __VLS_236 = __VLS_235({ ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_235));
    const __VLS_240 = __VLS_resolvedLocalAndGlobalComponents.Document;
    /** @type { [typeof __VLS_components.Document, ] } */
    // @ts-ignore
    const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({}));
    const __VLS_242 = __VLS_241({}, ...__VLS_functionalComponentArgsRest(__VLS_241));
    __VLS_nonNullable(__VLS_239.slots).default;
    var __VLS_239;
    __VLS_nonNullable(__VLS_231.slots).default;
    var __VLS_231;
    __VLS_nonNullable(__VLS_66.slots).default;
    var __VLS_66;
    __VLS_nonNullable(__VLS_13.slots).default;
    var __VLS_13;
    __VLS_styleScopedClasses['user-page'];
    __VLS_styleScopedClasses['art-full-height'];
    __VLS_styleScopedClasses['art-table-card'];
    __VLS_styleScopedClasses['import-container'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-start'];
    __VLS_styleScopedClasses['mb-4'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['leading-6'];
    __VLS_styleScopedClasses['text-gray-600'];
    __VLS_styleScopedClasses['p-2'];
    __VLS_styleScopedClasses['instructions-trigger'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['upload-demo'];
    __VLS_styleScopedClasses['upload-empty-content'];
    __VLS_styleScopedClasses['el-icon--upload'];
    __VLS_styleScopedClasses['el-upload__text'];
    __VLS_styleScopedClasses['el-upload__tip'];
    __VLS_styleScopedClasses['mt-2'];
    __VLS_styleScopedClasses['upload-list-content'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['mb-2'];
    __VLS_styleScopedClasses['px-2'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['text-gray-500'];
    __VLS_styleScopedClasses['import-table'];
    __VLS_styleScopedClasses['status-cell'];
    __VLS_styleScopedClasses['status-tag-mini'];
    __VLS_styleScopedClasses['status-tag-mini'];
    __VLS_styleScopedClasses['tag-success-simple'];
    __VLS_styleScopedClasses['status-tag-mini'];
    __VLS_styleScopedClasses['status-tag-mini'];
    __VLS_styleScopedClasses['rotating'];
    __VLS_styleScopedClasses['mt-2'];
    __VLS_styleScopedClasses['text-center'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['mt-8'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['flex-col'];
    __VLS_styleScopedClasses['gap-3'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['start-import-btn'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-center'];
    __VLS_styleScopedClasses['mt-1'];
    __VLS_styleScopedClasses['download-link'];
    __VLS_styleScopedClasses['mr-1'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "parentUploadRef": __VLS_91,
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
            UserSearch: UserSearch,
            UserDialog: UserDialog,
            ElTag: ElTag,
            UploadFilled: UploadFilled,
            Loading: Loading,
            Delete: Delete,
            Upload: Upload,
            Document: Document,
            InfoFilled: InfoFilled,
            Plus: Plus,
            dialogType: dialogType,
            dialogVisible: dialogVisible,
            currentUserData: currentUserData,
            parentImportVisible: parentImportVisible,
            parentImportLoading: parentImportLoading,
            parentFileList: parentFileList,
            parentUploadRef: parentUploadRef,
            searchForm: searchForm,
            columns: columns,
            columnChecks: columnChecks,
            data: data,
            loading: loading,
            pagination: pagination,
            resetSearchParams: resetSearchParams,
            handleSizeChange: handleSizeChange,
            handleCurrentChange: handleCurrentChange,
            refreshData: refreshData,
            handleSearch: handleSearch,
            showDialog: showDialog,
            handleDialogSubmit: handleDialogSubmit,
            handleSelectionChange: handleSelectionChange,
            handleOpenParentImport: handleOpenParentImport,
            handleParentFileChange: handleParentFileChange,
            handleParentRemove: handleParentRemove,
            handleContinueParentUpload: handleContinueParentUpload,
            submitParentImport: submitParentImport,
            downloadParentTemplate: downloadParentTemplate,
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