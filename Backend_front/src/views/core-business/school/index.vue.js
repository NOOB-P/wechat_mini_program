/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { fetchGetSchoolTree, fetchGetSchoolList, fetchAddSchool, fetchUpdateSchool, fetchDeleteSchool, fetchBatchDeleteSchools, fetchImportExcel, fetchDownloadSchoolTemplate } from '@/api/core-business/school/index';
import { ElMessage, ElMessageBox } from 'element-plus';
import { UploadFilled, Loading as LoadingIcon, Delete, Upload, Document, InfoFilled, Plus } from '@element-plus/icons-vue';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const viewType = ref('list');
const loading = ref(false);
const treeRef = ref(null);
const treeData = ref([]);
const listData = ref([]);
const allSchools = ref([]); // 存储原始所有数据，用于筛选
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const defaultProps = {
    children: 'children',
    label: 'name'
};
const selectedIds = ref([]);
const isBatchDeleting = ref(false);
const handleSelectionChange = (selection) => {
    selectedIds.value = selection.map(item => item.id);
};
const handleBatchDelete = () => {
    if (selectedIds.value.length === 0) {
        // 没选择时点击，因为文案是"取消删除"，清空选择并隐藏复选框
        isBatchDeleting.value = false;
        selectedIds.value = [];
        return;
    }
    ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个学校吗？`, '批量删除警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(async () => {
        try {
            const res = await fetchBatchDeleteSchools(selectedIds.value);
            console.log('学校批量删除返回数据:', res);
            // 修复：由于 axios 拦截器可能会直接返回 res.data 的 data 字段，也可能返回完整的 response
            // 如果后端返回的是 Result.success(msg, data) 且拦截器直接返回了 data
            // 那么这里的 res 实际上就是后端 data 里面的内容（即我们想要的详细信息字符串）
            let msg = '';
            if (typeof res === 'string') {
                msg = res;
            }
            else {
                msg = res?.msg || res?.data?.msg;
            }
            console.log('后端返回的详细 msg:', msg);
            if (msg && msg.includes('未能删除')) {
                ElMessage.warning(msg);
            }
            else {
                ElMessage.success(msg || '批量删除成功');
            }
            selectedIds.value = [];
            isBatchDeleting.value = false;
            loadData(true);
        }
        catch (error) {
            console.error('学校批量删除异常:', error);
            ElMessage.error(error.message || '批量删除失败');
        }
    })
        .catch(() => { });
};
// 搜索相关
const searchForm = ref({
    keyword: '',
    province: '',
    city: '',
    name: ''
});
// 三级联动数据
const provinces = computed(() => {
    const set = new Set(allSchools.value.map(s => s.province).filter(Boolean));
    return Array.from(set);
});
const cities = computed(() => {
    if (!searchForm.value.province)
        return [];
    const set = new Set(allSchools.value
        .filter(s => s.province === searchForm.value.province)
        .map(s => s.city)
        .filter(Boolean));
    return Array.from(set);
});
const schoolsInCity = computed(() => {
    if (!searchForm.value.city)
        return [];
    return allSchools.value
        .filter(s => s.province === searchForm.value.province && s.city === searchForm.value.city)
        .map(s => s.name);
});
const handleProvinceChange = () => {
    searchForm.value.city = '';
    searchForm.value.name = '';
};
const handleCityChange = () => {
    searchForm.value.name = '';
};
const filterNode = (value, data, node) => {
    if (!value)
        return true;
    const { keyword, province, city, name } = value;
    // 定义一个递归函数，检查当前节点或其子节点是否匹配所有筛选条件
    const checkMatch = (d, n) => {
        let m = true;
        // 1. 综合搜索
        if (keyword) {
            m = m && d.name.toLowerCase().includes(keyword.toLowerCase());
        }
        // 2. 省份筛选
        if (province) {
            // 检查当前节点是否属于该省份，或者当前节点本身就是该省份
            let current = n;
            let provinceMatch = false;
            while (current && current.data) {
                if (current.data.type === 'province' && current.data.name === province) {
                    provinceMatch = true;
                    break;
                }
                current = current.parent;
            }
            m = m && provinceMatch;
        }
        // 3. 城市筛选
        if (city) {
            let current = n;
            let cityMatch = false;
            while (current && current.data) {
                if (current.data.type === 'city' && current.data.name === city) {
                    cityMatch = true;
                    break;
                }
                current = current.parent;
            }
            m = m && cityMatch;
        }
        // 4. 学校名称筛选
        if (name) {
            m = m && (d.type === 'school' && d.name === name);
        }
        return m;
    };
    // 如果当前节点匹配，则返回 true
    if (checkMatch(data, node))
        return true;
    // 如果当前节点不匹配，但它的任何子节点匹配，也应该返回 true（显示父节点）
    const hasMatchingChild = (children) => {
        if (!children)
            return false;
        // 注意：这里需要构造虚拟的 node 对象来配合 checkMatch，或者简化逻辑
        // 对于 el-tree，如果子节点匹配，父节点会自动显示。
        // 所以我们只需要判断：
        // 如果是省份节点，且筛选了城市/学校，只要它下面有匹配的城市/学校，它就应该显示。
        return children.some(child => {
            // 递归检查子节点
            let childMatch = true;
            if (keyword)
                childMatch = childMatch && child.name.toLowerCase().includes(keyword.toLowerCase());
            if (province) {
                // 这里的逻辑有点绕，因为 province 是顶层。
                // 如果当前是省份节点，我们已经检查过了。
            }
            // 简化逻辑：如果子节点名称匹配 keyword，或者子节点是指定的 city/name
            if (keyword && child.name.toLowerCase().includes(keyword.toLowerCase()))
                return true;
            if (city && child.type === 'city' && child.name === city)
                return true;
            if (name && child.type === 'school' && child.name === name)
                return true;
            return hasMatchingChild(child.children);
        });
    };
    return hasMatchingChild(data.children);
};
const handleSearch = () => {
    if (viewType.value === 'tree') {
        treeRef.value?.filter(searchForm.value);
    }
    else {
        loadData();
    }
};
const resetSearch = () => {
    searchForm.value = {
        keyword: '',
        province: '',
        city: '',
        name: ''
    };
    if (viewType.value === 'tree') {
        treeRef.value?.filter(null);
    }
    else {
        loadData();
    }
};
// 弹窗相关
const dialogVisible = ref(false);
const submitLoading = ref(false);
const formRef = ref();
const isEdit = ref(false);
const form = ref({
    id: '',
    schoolId: '',
    province: '',
    city: '',
    name: ''
});
const rules = {
    province: [{ required: true, message: '请输入省份', trigger: 'blur' }],
    city: [{ required: true, message: '请输入城市', trigger: 'blur' }],
    name: [{ required: true, message: '请输入学校名称', trigger: 'blur' }]
};
const dialogTitle = computed(() => `${isEdit.value ? '编辑' : '添加'}学校`);
// 导入相关
const importVisible = ref(false);
const importLoading = ref(false);
const fileList = ref([]);
const uploadRef = ref();
const handleOpenImport = () => {
    fileList.value = [];
    importVisible.value = true;
};
const handleFileChange = (uploadFile, uploadFiles) => {
    fileList.value = uploadFiles;
};
const handleRemove = (file, uploadFiles) => {
    fileList.value = uploadFiles;
};
const handleContinueUpload = () => {
    if (uploadRef.value) {
        const input = uploadRef.value.$el.querySelector('input[type="file"]');
        if (input) {
            input.click();
        }
    }
};
const submitImport = async () => {
    const readyFiles = fileList.value.filter(f => f.status === 'ready' || f.status === 'fail');
    if (readyFiles.length === 0) {
        ElMessage.warning('没有待导入的文件');
        return;
    }
    importLoading.value = true;
    let successCount = 0;
    let failCount = 0;
    for (const fileItem of readyFiles) {
        fileItem.status = 'uploading';
        fileItem.errorMsg = '';
        try {
            await fetchImportExcel(fileItem.raw);
            fileItem.status = 'success';
            successCount++;
        }
        catch (error) {
            fileItem.status = 'fail';
            fileItem.errorMsg = error.message || '导入失败';
            failCount++;
        }
    }
    if (failCount === 0) {
        ElMessage.success(`成功导入 ${successCount} 个文件`);
        setTimeout(() => {
            importVisible.value = false;
            fileList.value = [];
            loadData(true);
        }, 1500);
    }
    else {
        ElMessage.warning(`导入完成：${successCount} 个成功，${failCount} 个失败`);
        loadData(true); // 部分成功也要刷新列表
    }
    importLoading.value = false;
};
const loadData = async (forceRefetchAll = false) => {
    loading.value = true;
    try {
        // 始终加载全量数据用于筛选框下拉列表（仅在第一次或数据变动时加载）
        if (allSchools.value.length === 0 || forceRefetchAll) {
            const allRes = await fetchGetSchoolList({ current: 1, size: 10000 });
            if (allRes && allRes.records) {
                allSchools.value = allRes.records;
            }
            else if (allRes && allRes.code === 200) {
                allSchools.value = allRes.data.records;
            }
            else {
                allSchools.value = Array.isArray(allRes) ? allRes : (allRes?.data || []);
            }
        }
        if (viewType.value === 'tree') {
            const res = await fetchGetSchoolTree();
            if (Array.isArray(res)) {
                treeData.value = res;
            }
            else if (res && res.code === 200) {
                treeData.value = res.data;
            }
            // 如果存在搜索条件，则重新应用过滤
            if (searchForm.value.keyword || searchForm.value.province || searchForm.value.city || searchForm.value.name) {
                nextTick(() => {
                    treeRef.value?.filter(searchForm.value);
                });
            }
        }
        else {
            const res = await fetchGetSchoolList({
                current: page.value,
                size: pageSize.value,
                keyword: searchForm.value.keyword,
                province: searchForm.value.province,
                city: searchForm.value.city,
                name: searchForm.value.name
            });
            if (res && res.records) {
                listData.value = res.records.map((item) => {
                    if (item.createTime) {
                        const d = new Date(item.createTime);
                        item.createTime = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
                    }
                    return item;
                });
                total.value = res.total;
            }
            else if (res && res.code === 200) {
                listData.value = res.data.records.map((item) => {
                    if (item.createTime) {
                        const d = new Date(item.createTime);
                        item.createTime = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
                    }
                    return item;
                });
                total.value = res.data.total;
            }
        }
    }
    catch (error) {
        console.error('获取数据失败:', error);
    }
    finally {
        loading.value = false;
    }
};
watch(viewType, () => {
    loadData();
});
import { useRouter } from 'vue-router';
const router = useRouter();
const handleEnterSchool = (row) => {
    const schoolId = row.schoolId || row.id;
    if (schoolId) {
        router.push({
            path: '/core-business/sys-class',
            query: { schoolId, schoolName: row.name }
        });
    }
    else {
        ElMessage.warning('无法获取学校ID');
    }
};
const handleSizeChange = (val) => {
    pageSize.value = val;
    page.value = 1;
    loadData();
};
const handleCurrentChange = (val) => {
    page.value = val;
    loadData();
};
watch(viewType, (newVal) => {
    if (newVal === 'list' && listData.value.length === 0) {
        loadData();
    }
});
// 节点操作
const handleAddSchool = () => {
    isEdit.value = false;
    form.value = {
        id: '',
        schoolId: '',
        province: '',
        city: '',
        name: ''
    };
    dialogVisible.value = true;
    nextTick(() => {
        formRef.value?.clearValidate();
    });
};
const handleEditSchool = (data) => {
    isEdit.value = true;
    // 如果是树节点，需要尝试从 allSchools 中获取完整的省市信息
    let schoolInfo = { ...data };
    const dataId = data.id || data.schoolId;
    if (!data.province) {
        const found = allSchools.value.find(s => (s.id || s.schoolId) === dataId);
        if (found) {
            schoolInfo = { ...found };
        }
        else {
            // 如果数据还没加载，可能需要先加载或者提示用户
            // 这里先尝试加载列表数据，如果还是没有，则只能编辑名称
            fetchGetSchoolList({ current: 1, size: 10000 }).then(res => {
                const list = res?.records || res?.data?.records || (Array.isArray(res) ? res : (res?.data || []));
                allSchools.value = list;
                const f = list.find((s) => (s.id || s.schoolId) === dataId);
                if (f) {
                    form.value = {
                        id: f.id || f.schoolId,
                        schoolId: f.schoolId || '',
                        province: f.province || '',
                        city: f.city || '',
                        name: f.name
                    };
                }
            });
        }
    }
    form.value = {
        id: schoolInfo.id || schoolInfo.schoolId,
        schoolId: schoolInfo.schoolId || '',
        province: schoolInfo.province || '',
        city: schoolInfo.city || '',
        name: schoolInfo.name
    };
    dialogVisible.value = true;
};
const handleDeleteSchool = (data) => {
    ElMessageBox.confirm(`确定要删除 ${data.name} 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        try {
            const deleteId = data.id || data.schoolId;
            await fetchDeleteSchool(deleteId);
            ElMessage.success('删除成功');
            loadData(true);
        }
        catch (error) {
            console.error('删除失败:', error);
            ElMessage.error('删除失败');
        }
    });
};
const submitForm = async () => {
    if (!formRef.value)
        return;
    await formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                submitLoading.value = true;
                if (isEdit.value) {
                    await fetchUpdateSchool({
                        id: form.value.id,
                        province: form.value.province,
                        city: form.value.city,
                        name: form.value.name
                    });
                    ElMessage.success('更新成功');
                }
                else {
                    await fetchAddSchool({
                        province: form.value.province,
                        city: form.value.city,
                        name: form.value.name
                    });
                    ElMessage.success('添加成功');
                }
                dialogVisible.value = false;
                loadData(true);
            }
            catch (error) {
                ElMessage.error('操作失败');
            }
            finally {
                submitLoading.value = false;
            }
        }
    });
};
const downloadTemplate = () => {
    fetchDownloadSchoolTemplate();
};
onMounted(() => {
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
    __VLS_styleScopedClasses['instructions-trigger'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("page-container") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ shadow: ("never"), ...{ class: ("search-card mb-4") }, }));
    const __VLS_2 = __VLS_1({ shadow: ("never"), ...{ class: ("search-card mb-4") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ inline: ((true)), model: ((__VLS_ctx.searchForm)), ...{ class: ("search-form-inline") }, }));
    const __VLS_8 = __VLS_7({ inline: ((true)), model: ((__VLS_ctx.searchForm)), ...{ class: ("search-form-inline") }, }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ label: ("综合搜索"), }));
    const __VLS_14 = __VLS_13({ label: ("综合搜索"), }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    const __VLS_18 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.searchForm.keyword)), placeholder: ("搜索学校/省份/城市"), clearable: (true), ...{ style: ({}) }, }));
    const __VLS_20 = __VLS_19({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.searchForm.keyword)), placeholder: ("搜索学校/省份/城市"), clearable: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    let __VLS_24;
    const __VLS_25 = {
        onKeyup: (__VLS_ctx.handleSearch)
    };
    let __VLS_21;
    let __VLS_22;
    var __VLS_23;
    __VLS_nonNullable(__VLS_17.slots).default;
    var __VLS_17;
    const __VLS_26 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({ label: ("省份"), }));
    const __VLS_28 = __VLS_27({ label: ("省份"), }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    const __VLS_32 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
    /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({ ...{ 'onChange': {} }, modelValue: ((__VLS_ctx.searchForm.province)), placeholder: ("请选择省份"), clearable: (true), ...{ style: ({}) }, }));
    const __VLS_34 = __VLS_33({ ...{ 'onChange': {} }, modelValue: ((__VLS_ctx.searchForm.province)), placeholder: ("请选择省份"), clearable: (true), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_38;
    const __VLS_39 = {
        onChange: (__VLS_ctx.handleProvinceChange)
    };
    let __VLS_35;
    let __VLS_36;
    for (const [p] of __VLS_getVForSourceType((__VLS_ctx.provinces))) {
        const __VLS_40 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
        /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({ key: ((p)), label: ((p)), value: ((p)), }));
        const __VLS_42 = __VLS_41({ key: ((p)), label: ((p)), value: ((p)), }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    }
    __VLS_nonNullable(__VLS_37.slots).default;
    var __VLS_37;
    __VLS_nonNullable(__VLS_31.slots).default;
    var __VLS_31;
    const __VLS_46 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({ label: ("城市"), }));
    const __VLS_48 = __VLS_47({ label: ("城市"), }, ...__VLS_functionalComponentArgsRest(__VLS_47));
    const __VLS_52 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
    /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({ ...{ 'onChange': {} }, modelValue: ((__VLS_ctx.searchForm.city)), placeholder: ("请选择城市"), clearable: (true), disabled: ((!__VLS_ctx.searchForm.province)), ...{ style: ({}) }, }));
    const __VLS_54 = __VLS_53({ ...{ 'onChange': {} }, modelValue: ((__VLS_ctx.searchForm.city)), placeholder: ("请选择城市"), clearable: (true), disabled: ((!__VLS_ctx.searchForm.province)), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    let __VLS_58;
    const __VLS_59 = {
        onChange: (__VLS_ctx.handleCityChange)
    };
    let __VLS_55;
    let __VLS_56;
    for (const [c] of __VLS_getVForSourceType((__VLS_ctx.cities))) {
        const __VLS_60 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
        /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
        // @ts-ignore
        const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({ key: ((c)), label: ((c)), value: ((c)), }));
        const __VLS_62 = __VLS_61({ key: ((c)), label: ((c)), value: ((c)), }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    }
    __VLS_nonNullable(__VLS_57.slots).default;
    var __VLS_57;
    __VLS_nonNullable(__VLS_51.slots).default;
    var __VLS_51;
    const __VLS_66 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({ label: ("学校"), }));
    const __VLS_68 = __VLS_67({ label: ("学校"), }, ...__VLS_functionalComponentArgsRest(__VLS_67));
    const __VLS_72 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
    /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({ modelValue: ((__VLS_ctx.searchForm.name)), placeholder: ("请选择学校"), clearable: (true), disabled: ((!__VLS_ctx.searchForm.city)), ...{ style: ({}) }, }));
    const __VLS_74 = __VLS_73({ modelValue: ((__VLS_ctx.searchForm.name)), placeholder: ("请选择学校"), clearable: (true), disabled: ((!__VLS_ctx.searchForm.city)), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    for (const [s] of __VLS_getVForSourceType((__VLS_ctx.schoolsInCity))) {
        const __VLS_78 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
        /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
        // @ts-ignore
        const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({ key: ((s)), label: ((s)), value: ((s)), }));
        const __VLS_80 = __VLS_79({ key: ((s)), label: ((s)), value: ((s)), }, ...__VLS_functionalComponentArgsRest(__VLS_79));
    }
    __VLS_nonNullable(__VLS_77.slots).default;
    var __VLS_77;
    __VLS_nonNullable(__VLS_71.slots).default;
    var __VLS_71;
    const __VLS_84 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({}));
    const __VLS_86 = __VLS_85({}, ...__VLS_functionalComponentArgsRest(__VLS_85));
    const __VLS_90 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({ ...{ 'onClick': {} }, type: ("primary"), }));
    const __VLS_92 = __VLS_91({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_91));
    let __VLS_96;
    const __VLS_97 = {
        onClick: (__VLS_ctx.handleSearch)
    };
    let __VLS_93;
    let __VLS_94;
    __VLS_nonNullable(__VLS_95.slots).default;
    var __VLS_95;
    const __VLS_98 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({ ...{ 'onClick': {} }, }));
    const __VLS_100 = __VLS_99({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_99));
    let __VLS_104;
    const __VLS_105 = {
        onClick: (__VLS_ctx.resetSearch)
    };
    let __VLS_101;
    let __VLS_102;
    __VLS_nonNullable(__VLS_103.slots).default;
    var __VLS_103;
    __VLS_nonNullable(__VLS_89.slots).default;
    var __VLS_89;
    __VLS_nonNullable(__VLS_11.slots).default;
    var __VLS_11;
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    const __VLS_106 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
    // @ts-ignore
    const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({ shadow: ("never"), ...{ class: ("main-card") }, }));
    const __VLS_108 = __VLS_107({ shadow: ("never"), ...{ class: ("main-card") }, }, ...__VLS_functionalComponentArgsRest(__VLS_107));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { header: __VLS_thisSlot } = __VLS_nonNullable(__VLS_111.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-between items-center") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex items-center") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("font-bold mr-4") }, });
        const __VLS_112 = __VLS_resolvedLocalAndGlobalComponents.ElRadioGroup;
        /** @type { [typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ] } */
        // @ts-ignore
        const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({ modelValue: ((__VLS_ctx.viewType)), size: ("small"), }));
        const __VLS_114 = __VLS_113({ modelValue: ((__VLS_ctx.viewType)), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_113));
        const __VLS_118 = __VLS_resolvedLocalAndGlobalComponents.ElRadioButton;
        /** @type { [typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, ] } */
        // @ts-ignore
        const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({ label: ("list"), }));
        const __VLS_120 = __VLS_119({ label: ("list"), }, ...__VLS_functionalComponentArgsRest(__VLS_119));
        __VLS_nonNullable(__VLS_123.slots).default;
        var __VLS_123;
        const __VLS_124 = __VLS_resolvedLocalAndGlobalComponents.ElRadioButton;
        /** @type { [typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, ] } */
        // @ts-ignore
        const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({ label: ("tree"), }));
        const __VLS_126 = __VLS_125({ label: ("tree"), }, ...__VLS_functionalComponentArgsRest(__VLS_125));
        __VLS_nonNullable(__VLS_129.slots).default;
        var __VLS_129;
        __VLS_nonNullable(__VLS_117.slots).default;
        var __VLS_117;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        if (__VLS_ctx.viewType === 'list' && !__VLS_ctx.isBatchDeleting) {
            const __VLS_130 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({ ...{ 'onClick': {} }, type: ("danger"), }));
            const __VLS_132 = __VLS_131({ ...{ 'onClick': {} }, type: ("danger"), }, ...__VLS_functionalComponentArgsRest(__VLS_131));
            let __VLS_136;
            const __VLS_137 = {
                onClick: (...[$event]) => {
                    if (!((__VLS_ctx.viewType === 'list' && !__VLS_ctx.isBatchDeleting)))
                        return;
                    __VLS_ctx.isBatchDeleting = true;
                }
            };
            let __VLS_133;
            let __VLS_134;
            __VLS_nonNullable(__VLS_135.slots).default;
            var __VLS_135;
        }
        if (__VLS_ctx.viewType === 'list' && __VLS_ctx.isBatchDeleting) {
            const __VLS_138 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({ ...{ 'onClick': {} }, type: ((__VLS_ctx.selectedIds.length > 0 ? 'danger' : 'default')), }));
            const __VLS_140 = __VLS_139({ ...{ 'onClick': {} }, type: ((__VLS_ctx.selectedIds.length > 0 ? 'danger' : 'default')), }, ...__VLS_functionalComponentArgsRest(__VLS_139));
            let __VLS_144;
            const __VLS_145 = {
                onClick: (__VLS_ctx.handleBatchDelete)
            };
            let __VLS_141;
            let __VLS_142;
            (__VLS_ctx.selectedIds.length > 0 ? '开始删除' : '取消删除');
            __VLS_nonNullable(__VLS_143.slots).default;
            var __VLS_143;
        }
        const __VLS_146 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({ ...{ 'onClick': {} }, type: ("primary"), plain: (true), }));
        const __VLS_148 = __VLS_147({ ...{ 'onClick': {} }, type: ("primary"), plain: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_147));
        let __VLS_152;
        const __VLS_153 = {
            onClick: (__VLS_ctx.handleOpenImport)
        };
        let __VLS_149;
        let __VLS_150;
        __VLS_nonNullable(__VLS_151.slots).default;
        var __VLS_151;
        const __VLS_154 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_155 = __VLS_asFunctionalComponent(__VLS_154, new __VLS_154({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_156 = __VLS_155({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_155));
        let __VLS_160;
        const __VLS_161 = {
            onClick: (__VLS_ctx.handleAddSchool)
        };
        let __VLS_157;
        let __VLS_158;
        __VLS_nonNullable(__VLS_159.slots).default;
        var __VLS_159;
    }
    if (__VLS_ctx.viewType === 'tree') {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("tree-container") }, });
        const __VLS_162 = __VLS_resolvedLocalAndGlobalComponents.ElTree;
        /** @type { [typeof __VLS_components.ElTree, typeof __VLS_components.elTree, typeof __VLS_components.ElTree, typeof __VLS_components.elTree, ] } */
        // @ts-ignore
        const __VLS_163 = __VLS_asFunctionalComponent(__VLS_162, new __VLS_162({ ref: ("treeRef"), data: ((__VLS_ctx.treeData)), props: ((__VLS_ctx.defaultProps)), defaultExpandAll: (true), highlightCurrent: (true), expandOnClickNode: ((false)), filterNodeMethod: ((__VLS_ctx.filterNode)), }));
        const __VLS_164 = __VLS_163({ ref: ("treeRef"), data: ((__VLS_ctx.treeData)), props: ((__VLS_ctx.defaultProps)), defaultExpandAll: (true), highlightCurrent: (true), expandOnClickNode: ((false)), filterNodeMethod: ((__VLS_ctx.filterNode)), }, ...__VLS_functionalComponentArgsRest(__VLS_163));
        // @ts-ignore navigation for `const treeRef = ref()`
        __VLS_ctx.treeRef;
        var __VLS_168 = {};
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_167.slots);
            const [{ node, data }] = __VLS_getSlotParams(__VLS_thisSlot);
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("custom-tree-node") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("node-label") }, });
            if (data.type === 'province') {
                const __VLS_169 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_170 = __VLS_asFunctionalComponent(__VLS_169, new __VLS_169({ size: ("small"), type: ("danger"), ...{ class: ("mr-2") }, }));
                const __VLS_171 = __VLS_170({ size: ("small"), type: ("danger"), ...{ class: ("mr-2") }, }, ...__VLS_functionalComponentArgsRest(__VLS_170));
                __VLS_nonNullable(__VLS_174.slots).default;
                var __VLS_174;
            }
            else if (data.type === 'city') {
                const __VLS_175 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_176 = __VLS_asFunctionalComponent(__VLS_175, new __VLS_175({ size: ("small"), type: ("info"), ...{ class: ("mr-2") }, }));
                const __VLS_177 = __VLS_176({ size: ("small"), type: ("info"), ...{ class: ("mr-2") }, }, ...__VLS_functionalComponentArgsRest(__VLS_176));
                __VLS_nonNullable(__VLS_180.slots).default;
                var __VLS_180;
            }
            else if (data.type === 'school') {
                const __VLS_181 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_182 = __VLS_asFunctionalComponent(__VLS_181, new __VLS_181({ size: ("small"), type: ("primary"), ...{ class: ("mr-2") }, }));
                const __VLS_183 = __VLS_182({ size: ("small"), type: ("primary"), ...{ class: ("mr-2") }, }, ...__VLS_functionalComponentArgsRest(__VLS_182));
                __VLS_nonNullable(__VLS_186.slots).default;
                var __VLS_186;
            }
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (node.label);
            if (data.type === 'school') {
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-gray-400 ml-2 text-xs") }, });
                (data.id);
            }
        }
        var __VLS_167;
    }
    else {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("list-container") }, });
        const __VLS_187 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
        /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
        // @ts-ignore
        const __VLS_188 = __VLS_asFunctionalComponent(__VLS_187, new __VLS_187({ ...{ 'onSelectionChange': {} }, data: ((__VLS_ctx.listData)), border: (true), ...{ style: ({}) }, height: ("400"), }));
        const __VLS_189 = __VLS_188({ ...{ 'onSelectionChange': {} }, data: ((__VLS_ctx.listData)), border: (true), ...{ style: ({}) }, height: ("400"), }, ...__VLS_functionalComponentArgsRest(__VLS_188));
        __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.loading) }, null, null);
        let __VLS_193;
        const __VLS_194 = {
            onSelectionChange: (__VLS_ctx.handleSelectionChange)
        };
        let __VLS_190;
        let __VLS_191;
        if (__VLS_ctx.isBatchDeleting) {
            const __VLS_195 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
            /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
            // @ts-ignore
            const __VLS_196 = __VLS_asFunctionalComponent(__VLS_195, new __VLS_195({ type: ("selection"), width: ("55"), align: ("center"), }));
            const __VLS_197 = __VLS_196({ type: ("selection"), width: ("55"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_196));
        }
        const __VLS_201 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_202 = __VLS_asFunctionalComponent(__VLS_201, new __VLS_201({ prop: ("id"), label: ("内部ID"), width: ("80"), align: ("center"), }));
        const __VLS_203 = __VLS_202({ prop: ("id"), label: ("内部ID"), width: ("80"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_202));
        const __VLS_207 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_208 = __VLS_asFunctionalComponent(__VLS_207, new __VLS_207({ prop: ("schoolId"), label: ("唯一标识(ID)"), width: ("190"), align: ("center"), }));
        const __VLS_209 = __VLS_208({ prop: ("schoolId"), label: ("唯一标识(ID)"), width: ("190"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_208));
        const __VLS_213 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_214 = __VLS_asFunctionalComponent(__VLS_213, new __VLS_213({ prop: ("province"), label: ("省份"), width: ("150"), align: ("center"), }));
        const __VLS_215 = __VLS_214({ prop: ("province"), label: ("省份"), width: ("150"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_214));
        const __VLS_219 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_220 = __VLS_asFunctionalComponent(__VLS_219, new __VLS_219({ prop: ("city"), label: ("城市"), width: ("150"), align: ("center"), }));
        const __VLS_221 = __VLS_220({ prop: ("city"), label: ("城市"), width: ("150"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_220));
        const __VLS_225 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_226 = __VLS_asFunctionalComponent(__VLS_225, new __VLS_225({ prop: ("name"), label: ("学校名称"), minWidth: ("200"), }));
        const __VLS_227 = __VLS_226({ prop: ("name"), label: ("学校名称"), minWidth: ("200"), }, ...__VLS_functionalComponentArgsRest(__VLS_226));
        const __VLS_231 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_232 = __VLS_asFunctionalComponent(__VLS_231, new __VLS_231({ prop: ("createTime"), label: ("创建时间"), width: ("180"), align: ("center"), }));
        const __VLS_233 = __VLS_232({ prop: ("createTime"), label: ("创建时间"), width: ("180"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_232));
        const __VLS_237 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_238 = __VLS_asFunctionalComponent(__VLS_237, new __VLS_237({ label: ("操作"), width: ("200"), align: ("center"), fixed: ("right"), }));
        const __VLS_239 = __VLS_238({ label: ("操作"), width: ("200"), align: ("center"), fixed: ("right"), }, ...__VLS_functionalComponentArgsRest(__VLS_238));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_242.slots);
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_243 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_244 = __VLS_asFunctionalComponent(__VLS_243, new __VLS_243({ ...{ 'onClick': {} }, type: ("primary"), link: (true), size: ("small"), }));
            const __VLS_245 = __VLS_244({ ...{ 'onClick': {} }, type: ("primary"), link: (true), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_244));
            let __VLS_249;
            const __VLS_250 = {
                onClick: (...[$event]) => {
                    if (!(!((__VLS_ctx.viewType === 'tree'))))
                        return;
                    __VLS_ctx.handleEnterSchool(row);
                }
            };
            let __VLS_246;
            let __VLS_247;
            __VLS_nonNullable(__VLS_248.slots).default;
            var __VLS_248;
            const __VLS_251 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_252 = __VLS_asFunctionalComponent(__VLS_251, new __VLS_251({ ...{ 'onClick': {} }, type: ("primary"), link: (true), size: ("small"), }));
            const __VLS_253 = __VLS_252({ ...{ 'onClick': {} }, type: ("primary"), link: (true), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_252));
            let __VLS_257;
            const __VLS_258 = {
                onClick: (...[$event]) => {
                    if (!(!((__VLS_ctx.viewType === 'tree'))))
                        return;
                    __VLS_ctx.handleEditSchool(row);
                }
            };
            let __VLS_254;
            let __VLS_255;
            __VLS_nonNullable(__VLS_256.slots).default;
            var __VLS_256;
            const __VLS_259 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_260 = __VLS_asFunctionalComponent(__VLS_259, new __VLS_259({ ...{ 'onClick': {} }, type: ("danger"), link: (true), size: ("small"), }));
            const __VLS_261 = __VLS_260({ ...{ 'onClick': {} }, type: ("danger"), link: (true), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_260));
            let __VLS_265;
            const __VLS_266 = {
                onClick: (...[$event]) => {
                    if (!(!((__VLS_ctx.viewType === 'tree'))))
                        return;
                    __VLS_ctx.handleDeleteSchool(row);
                }
            };
            let __VLS_262;
            let __VLS_263;
            __VLS_nonNullable(__VLS_264.slots).default;
            var __VLS_264;
        }
        var __VLS_242;
        __VLS_nonNullable(__VLS_192.slots).default;
        var __VLS_192;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("pagination-container mt-4 flex justify-end") }, });
        const __VLS_267 = __VLS_resolvedLocalAndGlobalComponents.ElPagination;
        /** @type { [typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ] } */
        // @ts-ignore
        const __VLS_268 = __VLS_asFunctionalComponent(__VLS_267, new __VLS_267({ ...{ 'onSizeChange': {} }, ...{ 'onCurrentChange': {} }, currentPage: ((__VLS_ctx.page)), pageSize: ((__VLS_ctx.pageSize)), pageSizes: (([10, 20, 50, 100])), layout: ("total, sizes, prev, pager, next, jumper"), total: ((__VLS_ctx.total)), }));
        const __VLS_269 = __VLS_268({ ...{ 'onSizeChange': {} }, ...{ 'onCurrentChange': {} }, currentPage: ((__VLS_ctx.page)), pageSize: ((__VLS_ctx.pageSize)), pageSizes: (([10, 20, 50, 100])), layout: ("total, sizes, prev, pager, next, jumper"), total: ((__VLS_ctx.total)), }, ...__VLS_functionalComponentArgsRest(__VLS_268));
        let __VLS_273;
        const __VLS_274 = {
            onSizeChange: (__VLS_ctx.handleSizeChange)
        };
        const __VLS_275 = {
            onCurrentChange: (__VLS_ctx.handleCurrentChange)
        };
        let __VLS_270;
        let __VLS_271;
        var __VLS_272;
    }
    var __VLS_111;
    const __VLS_276 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */
    // @ts-ignore
    const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({ modelValue: ((__VLS_ctx.importVisible)), title: ("导入学校架构"), width: ("550px"), }));
    const __VLS_278 = __VLS_277({ modelValue: ((__VLS_ctx.importVisible)), title: ("导入学校架构"), width: ("550px"), }, ...__VLS_functionalComponentArgsRest(__VLS_277));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("import-container") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-start mb-4") }, });
    const __VLS_282 = __VLS_resolvedLocalAndGlobalComponents.ElTooltip;
    /** @type { [typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ] } */
    // @ts-ignore
    const __VLS_283 = __VLS_asFunctionalComponent(__VLS_282, new __VLS_282({ placement: ("right"), effect: ("light"), }));
    const __VLS_284 = __VLS_283({ placement: ("right"), effect: ("light"), }, ...__VLS_functionalComponentArgsRest(__VLS_283));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { content: __VLS_thisSlot } = __VLS_nonNullable(__VLS_287.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("text-xs leading-6 text-gray-600 p-2") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("instructions-trigger") }, });
    const __VLS_288 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
    /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
    // @ts-ignore
    const __VLS_289 = __VLS_asFunctionalComponent(__VLS_288, new __VLS_288({ ...{ class: ("mr-1") }, }));
    const __VLS_290 = __VLS_289({ ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_289));
    const __VLS_294 = __VLS_resolvedLocalAndGlobalComponents.InfoFilled;
    /** @type { [typeof __VLS_components.InfoFilled, typeof __VLS_components.infoFilled, ] } */
    // @ts-ignore
    const __VLS_295 = __VLS_asFunctionalComponent(__VLS_294, new __VLS_294({}));
    const __VLS_296 = __VLS_295({}, ...__VLS_functionalComponentArgsRest(__VLS_295));
    __VLS_nonNullable(__VLS_293.slots).default;
    var __VLS_293;
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    var __VLS_287;
    const __VLS_300 = __VLS_resolvedLocalAndGlobalComponents.ElUpload;
    /** @type { [typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ] } */
    // @ts-ignore
    const __VLS_301 = __VLS_asFunctionalComponent(__VLS_300, new __VLS_300({ ref: ("uploadRef"), ...{ class: ("upload-demo") }, drag: (true), action: ("#"), multiple: (true), autoUpload: ((false)), onChange: ((__VLS_ctx.handleFileChange)), fileList: ((__VLS_ctx.fileList)), onRemove: ((__VLS_ctx.handleRemove)), showFileList: ((false)), accept: (".xlsx, .xls"), }));
    const __VLS_302 = __VLS_301({ ref: ("uploadRef"), ...{ class: ("upload-demo") }, drag: (true), action: ("#"), multiple: (true), autoUpload: ((false)), onChange: ((__VLS_ctx.handleFileChange)), fileList: ((__VLS_ctx.fileList)), onRemove: ((__VLS_ctx.handleRemove)), showFileList: ((false)), accept: (".xlsx, .xls"), }, ...__VLS_functionalComponentArgsRest(__VLS_301));
    // @ts-ignore navigation for `const uploadRef = ref()`
    __VLS_ctx.uploadRef;
    var __VLS_306 = {};
    if (__VLS_ctx.fileList.length === 0) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("upload-empty-content") }, });
        const __VLS_307 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_308 = __VLS_asFunctionalComponent(__VLS_307, new __VLS_307({ ...{ class: ("el-icon--upload") }, }));
        const __VLS_309 = __VLS_308({ ...{ class: ("el-icon--upload") }, }, ...__VLS_functionalComponentArgsRest(__VLS_308));
        const __VLS_313 = __VLS_resolvedLocalAndGlobalComponents.UploadFilled;
        /** @type { [typeof __VLS_components.UploadFilled, typeof __VLS_components.uploadFilled, ] } */
        // @ts-ignore
        const __VLS_314 = __VLS_asFunctionalComponent(__VLS_313, new __VLS_313({}));
        const __VLS_315 = __VLS_314({}, ...__VLS_functionalComponentArgsRest(__VLS_314));
        __VLS_nonNullable(__VLS_312.slots).default;
        var __VLS_312;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("el-upload__text") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.em, __VLS_intrinsicElements.em)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("el-upload__tip mt-2") }, });
    }
    else {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: () => { } }, ...{ class: ("upload-list-content") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-between items-center mb-2 px-2") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-xs font-bold text-gray-500") }, });
        (__VLS_ctx.fileList.length);
        const __VLS_319 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_320 = __VLS_asFunctionalComponent(__VLS_319, new __VLS_319({ ...{ 'onClick': {} }, link: (true), type: ("danger"), size: ("small"), }));
        const __VLS_321 = __VLS_320({ ...{ 'onClick': {} }, link: (true), type: ("danger"), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_320));
        let __VLS_325;
        const __VLS_326 = {
            onClick: (...[$event]) => {
                if (!(!((__VLS_ctx.fileList.length === 0))))
                    return;
                __VLS_ctx.fileList = [];
            }
        };
        let __VLS_322;
        let __VLS_323;
        __VLS_nonNullable(__VLS_324.slots).default;
        var __VLS_324;
        const __VLS_327 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
        /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
        // @ts-ignore
        const __VLS_328 = __VLS_asFunctionalComponent(__VLS_327, new __VLS_327({ data: ((__VLS_ctx.fileList)), size: ("small"), border: (true), maxHeight: ("180"), ...{ class: ("import-table") }, }));
        const __VLS_329 = __VLS_328({ data: ((__VLS_ctx.fileList)), size: ("small"), border: (true), maxHeight: ("180"), ...{ class: ("import-table") }, }, ...__VLS_functionalComponentArgsRest(__VLS_328));
        const __VLS_333 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_334 = __VLS_asFunctionalComponent(__VLS_333, new __VLS_333({ prop: ("name"), label: ("文件名"), showOverflowTooltip: (true), }));
        const __VLS_335 = __VLS_334({ prop: ("name"), label: ("文件名"), showOverflowTooltip: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_334));
        const __VLS_339 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_340 = __VLS_asFunctionalComponent(__VLS_339, new __VLS_339({ label: ("状态"), width: ("90"), align: ("center"), }));
        const __VLS_341 = __VLS_340({ label: ("状态"), width: ("90"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_340));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_344.slots);
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("status-cell") }, });
            if (row.status === 'ready') {
                const __VLS_345 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_346 = __VLS_asFunctionalComponent(__VLS_345, new __VLS_345({ type: ("info"), size: ("small"), ...{ class: ("status-tag-mini") }, }));
                const __VLS_347 = __VLS_346({ type: ("info"), size: ("small"), ...{ class: ("status-tag-mini") }, }, ...__VLS_functionalComponentArgsRest(__VLS_346));
                __VLS_nonNullable(__VLS_350.slots).default;
                var __VLS_350;
            }
            else if (row.status === 'success') {
                const __VLS_351 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_352 = __VLS_asFunctionalComponent(__VLS_351, new __VLS_351({ type: ("success"), size: ("small"), ...{ class: ("status-tag-mini tag-success-simple") }, }));
                const __VLS_353 = __VLS_352({ type: ("success"), size: ("small"), ...{ class: ("status-tag-mini tag-success-simple") }, }, ...__VLS_functionalComponentArgsRest(__VLS_352));
                __VLS_nonNullable(__VLS_356.slots).default;
                var __VLS_356;
            }
            else if (row.status === 'fail') {
                const __VLS_357 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_358 = __VLS_asFunctionalComponent(__VLS_357, new __VLS_357({ type: ("danger"), size: ("small"), ...{ class: ("status-tag-mini") }, }));
                const __VLS_359 = __VLS_358({ type: ("danger"), size: ("small"), ...{ class: ("status-tag-mini") }, }, ...__VLS_functionalComponentArgsRest(__VLS_358));
                if (row.errorMsg) {
                    const __VLS_363 = __VLS_resolvedLocalAndGlobalComponents.ElTooltip;
                    /** @type { [typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ] } */
                    // @ts-ignore
                    const __VLS_364 = __VLS_asFunctionalComponent(__VLS_363, new __VLS_363({ content: ((row.errorMsg)), placement: ("top"), }));
                    const __VLS_365 = __VLS_364({ content: ((row.errorMsg)), placement: ("top"), }, ...__VLS_functionalComponentArgsRest(__VLS_364));
                    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                    __VLS_nonNullable(__VLS_368.slots).default;
                    var __VLS_368;
                }
                else {
                    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                }
                __VLS_nonNullable(__VLS_362.slots).default;
                var __VLS_362;
            }
            else {
                const __VLS_369 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_370 = __VLS_asFunctionalComponent(__VLS_369, new __VLS_369({ type: ("primary"), size: ("small"), ...{ class: ("status-tag-mini rotating") }, }));
                const __VLS_371 = __VLS_370({ type: ("primary"), size: ("small"), ...{ class: ("status-tag-mini rotating") }, }, ...__VLS_functionalComponentArgsRest(__VLS_370));
                const __VLS_375 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
                /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
                // @ts-ignore
                const __VLS_376 = __VLS_asFunctionalComponent(__VLS_375, new __VLS_375({}));
                const __VLS_377 = __VLS_376({}, ...__VLS_functionalComponentArgsRest(__VLS_376));
                const __VLS_381 = __VLS_resolvedLocalAndGlobalComponents.LoadingIcon;
                /** @type { [typeof __VLS_components.LoadingIcon, typeof __VLS_components.loadingIcon, ] } */
                // @ts-ignore
                const __VLS_382 = __VLS_asFunctionalComponent(__VLS_381, new __VLS_381({}));
                const __VLS_383 = __VLS_382({}, ...__VLS_functionalComponentArgsRest(__VLS_382));
                __VLS_nonNullable(__VLS_380.slots).default;
                var __VLS_380;
                __VLS_nonNullable(__VLS_374.slots).default;
                var __VLS_374;
            }
        }
        var __VLS_344;
        const __VLS_387 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_388 = __VLS_asFunctionalComponent(__VLS_387, new __VLS_387({ label: ("操作"), width: ("50"), align: ("center"), }));
        const __VLS_389 = __VLS_388({ label: ("操作"), width: ("50"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_388));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_392.slots);
            const [{ $index }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_393 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_394 = __VLS_asFunctionalComponent(__VLS_393, new __VLS_393({ ...{ 'onClick': {} }, link: (true), type: ("danger"), icon: ((__VLS_ctx.Delete)), }));
            const __VLS_395 = __VLS_394({ ...{ 'onClick': {} }, link: (true), type: ("danger"), icon: ((__VLS_ctx.Delete)), }, ...__VLS_functionalComponentArgsRest(__VLS_394));
            let __VLS_399;
            const __VLS_400 = {
                onClick: (...[$event]) => {
                    if (!(!((__VLS_ctx.fileList.length === 0))))
                        return;
                    __VLS_ctx.fileList.splice($index, 1);
                }
            };
            let __VLS_396;
            let __VLS_397;
            var __VLS_398;
        }
        var __VLS_392;
        __VLS_nonNullable(__VLS_332.slots).default;
        var __VLS_332;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-2 text-center") }, });
        const __VLS_401 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_402 = __VLS_asFunctionalComponent(__VLS_401, new __VLS_401({ ...{ 'onClick': {} }, link: (true), type: ("primary"), size: ("small"), }));
        const __VLS_403 = __VLS_402({ ...{ 'onClick': {} }, link: (true), type: ("primary"), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_402));
        let __VLS_407;
        const __VLS_408 = {
            onClick: (__VLS_ctx.handleContinueUpload)
        };
        let __VLS_404;
        let __VLS_405;
        const __VLS_409 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_410 = __VLS_asFunctionalComponent(__VLS_409, new __VLS_409({ ...{ class: ("mr-1") }, }));
        const __VLS_411 = __VLS_410({ ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_410));
        const __VLS_415 = __VLS_resolvedLocalAndGlobalComponents.plus;
        /** @type { [typeof __VLS_components.Plus, typeof __VLS_components.plus, ] } */
        // @ts-ignore
        const __VLS_416 = __VLS_asFunctionalComponent(__VLS_415, new __VLS_415({}));
        const __VLS_417 = __VLS_416({}, ...__VLS_functionalComponentArgsRest(__VLS_416));
        __VLS_nonNullable(__VLS_414.slots).default;
        var __VLS_414;
        __VLS_nonNullable(__VLS_406.slots).default;
        var __VLS_406;
    }
    __VLS_nonNullable(__VLS_305.slots).default;
    var __VLS_305;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mt-8 flex flex-col gap-3") }, });
    const __VLS_421 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_422 = __VLS_asFunctionalComponent(__VLS_421, new __VLS_421({ ...{ 'onClick': {} }, type: ("primary"), size: ("large"), ...{ class: ("w-full start-import-btn") }, loading: ((__VLS_ctx.importLoading)), disabled: ((__VLS_ctx.fileList.length === 0)), }));
    const __VLS_423 = __VLS_422({ ...{ 'onClick': {} }, type: ("primary"), size: ("large"), ...{ class: ("w-full start-import-btn") }, loading: ((__VLS_ctx.importLoading)), disabled: ((__VLS_ctx.fileList.length === 0)), }, ...__VLS_functionalComponentArgsRest(__VLS_422));
    let __VLS_427;
    const __VLS_428 = {
        onClick: (__VLS_ctx.submitImport)
    };
    let __VLS_424;
    let __VLS_425;
    if (!__VLS_ctx.importLoading) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { icon: __VLS_thisSlot } = __VLS_nonNullable(__VLS_426.slots);
            const __VLS_429 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
            /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
            // @ts-ignore
            const __VLS_430 = __VLS_asFunctionalComponent(__VLS_429, new __VLS_429({}));
            const __VLS_431 = __VLS_430({}, ...__VLS_functionalComponentArgsRest(__VLS_430));
            const __VLS_435 = __VLS_resolvedLocalAndGlobalComponents.upload;
            /** @type { [typeof __VLS_components.Upload, typeof __VLS_components.upload, ] } */
            // @ts-ignore
            const __VLS_436 = __VLS_asFunctionalComponent(__VLS_435, new __VLS_435({}));
            const __VLS_437 = __VLS_436({}, ...__VLS_functionalComponentArgsRest(__VLS_436));
            __VLS_nonNullable(__VLS_434.slots).default;
            var __VLS_434;
        }
    }
    (__VLS_ctx.importLoading ? '正在上传-校验-处理...' : '确认开始批量导入');
    var __VLS_426;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-center mt-1") }, });
    const __VLS_441 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_442 = __VLS_asFunctionalComponent(__VLS_441, new __VLS_441({ ...{ 'onClick': {} }, link: (true), type: ("primary"), ...{ class: ("download-link") }, }));
    const __VLS_443 = __VLS_442({ ...{ 'onClick': {} }, link: (true), type: ("primary"), ...{ class: ("download-link") }, }, ...__VLS_functionalComponentArgsRest(__VLS_442));
    let __VLS_447;
    const __VLS_448 = {
        onClick: (__VLS_ctx.fetchDownloadSchoolTemplate)
    };
    let __VLS_444;
    let __VLS_445;
    const __VLS_449 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
    /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
    // @ts-ignore
    const __VLS_450 = __VLS_asFunctionalComponent(__VLS_449, new __VLS_449({ ...{ class: ("mr-1") }, }));
    const __VLS_451 = __VLS_450({ ...{ class: ("mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_450));
    const __VLS_455 = __VLS_resolvedLocalAndGlobalComponents.document;
    /** @type { [typeof __VLS_components.Document, typeof __VLS_components.document, ] } */
    // @ts-ignore
    const __VLS_456 = __VLS_asFunctionalComponent(__VLS_455, new __VLS_455({}));
    const __VLS_457 = __VLS_456({}, ...__VLS_functionalComponentArgsRest(__VLS_456));
    __VLS_nonNullable(__VLS_454.slots).default;
    var __VLS_454;
    __VLS_nonNullable(__VLS_446.slots).default;
    var __VLS_446;
    __VLS_nonNullable(__VLS_281.slots).default;
    var __VLS_281;
    const __VLS_461 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */
    // @ts-ignore
    const __VLS_462 = __VLS_asFunctionalComponent(__VLS_461, new __VLS_461({ modelValue: ((__VLS_ctx.dialogVisible)), title: ((__VLS_ctx.dialogTitle)), width: ("450px"), }));
    const __VLS_463 = __VLS_462({ modelValue: ((__VLS_ctx.dialogVisible)), title: ((__VLS_ctx.dialogTitle)), width: ("450px"), }, ...__VLS_functionalComponentArgsRest(__VLS_462));
    const __VLS_467 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */
    // @ts-ignore
    const __VLS_468 = __VLS_asFunctionalComponent(__VLS_467, new __VLS_467({ model: ((__VLS_ctx.form)), labelWidth: ("100px"), ref: ("formRef"), rules: ((__VLS_ctx.rules)), }));
    const __VLS_469 = __VLS_468({ model: ((__VLS_ctx.form)), labelWidth: ("100px"), ref: ("formRef"), rules: ((__VLS_ctx.rules)), }, ...__VLS_functionalComponentArgsRest(__VLS_468));
    // @ts-ignore navigation for `const formRef = ref()`
    __VLS_ctx.formRef;
    var __VLS_473 = {};
    const __VLS_474 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_475 = __VLS_asFunctionalComponent(__VLS_474, new __VLS_474({ label: ("省份"), prop: ("province"), }));
    const __VLS_476 = __VLS_475({ label: ("省份"), prop: ("province"), }, ...__VLS_functionalComponentArgsRest(__VLS_475));
    const __VLS_480 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_481 = __VLS_asFunctionalComponent(__VLS_480, new __VLS_480({ modelValue: ((__VLS_ctx.form.province)), placeholder: ("请输入省份"), }));
    const __VLS_482 = __VLS_481({ modelValue: ((__VLS_ctx.form.province)), placeholder: ("请输入省份"), }, ...__VLS_functionalComponentArgsRest(__VLS_481));
    __VLS_nonNullable(__VLS_479.slots).default;
    var __VLS_479;
    const __VLS_486 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_487 = __VLS_asFunctionalComponent(__VLS_486, new __VLS_486({ label: ("城市"), prop: ("city"), }));
    const __VLS_488 = __VLS_487({ label: ("城市"), prop: ("city"), }, ...__VLS_functionalComponentArgsRest(__VLS_487));
    const __VLS_492 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_493 = __VLS_asFunctionalComponent(__VLS_492, new __VLS_492({ modelValue: ((__VLS_ctx.form.city)), placeholder: ("请输入城市"), }));
    const __VLS_494 = __VLS_493({ modelValue: ((__VLS_ctx.form.city)), placeholder: ("请输入城市"), }, ...__VLS_functionalComponentArgsRest(__VLS_493));
    __VLS_nonNullable(__VLS_491.slots).default;
    var __VLS_491;
    const __VLS_498 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_499 = __VLS_asFunctionalComponent(__VLS_498, new __VLS_498({ label: ("学校名称"), prop: ("name"), }));
    const __VLS_500 = __VLS_499({ label: ("学校名称"), prop: ("name"), }, ...__VLS_functionalComponentArgsRest(__VLS_499));
    const __VLS_504 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_505 = __VLS_asFunctionalComponent(__VLS_504, new __VLS_504({ modelValue: ((__VLS_ctx.form.name)), placeholder: ("请输入学校名称"), }));
    const __VLS_506 = __VLS_505({ modelValue: ((__VLS_ctx.form.name)), placeholder: ("请输入学校名称"), }, ...__VLS_functionalComponentArgsRest(__VLS_505));
    __VLS_nonNullable(__VLS_503.slots).default;
    var __VLS_503;
    __VLS_nonNullable(__VLS_472.slots).default;
    var __VLS_472;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_466.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("dialog-footer") }, });
        const __VLS_510 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_511 = __VLS_asFunctionalComponent(__VLS_510, new __VLS_510({ ...{ 'onClick': {} }, }));
        const __VLS_512 = __VLS_511({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_511));
        let __VLS_516;
        const __VLS_517 = {
            onClick: (...[$event]) => {
                __VLS_ctx.dialogVisible = false;
            }
        };
        let __VLS_513;
        let __VLS_514;
        __VLS_nonNullable(__VLS_515.slots).default;
        var __VLS_515;
        const __VLS_518 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_519 = __VLS_asFunctionalComponent(__VLS_518, new __VLS_518({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.submitLoading)), }));
        const __VLS_520 = __VLS_519({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.submitLoading)), }, ...__VLS_functionalComponentArgsRest(__VLS_519));
        let __VLS_524;
        const __VLS_525 = {
            onClick: (__VLS_ctx.submitForm)
        };
        let __VLS_521;
        let __VLS_522;
        __VLS_nonNullable(__VLS_523.slots).default;
        var __VLS_523;
    }
    var __VLS_466;
    __VLS_styleScopedClasses['page-container'];
    __VLS_styleScopedClasses['search-card'];
    __VLS_styleScopedClasses['mb-4'];
    __VLS_styleScopedClasses['search-form-inline'];
    __VLS_styleScopedClasses['main-card'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['mr-4'];
    __VLS_styleScopedClasses['tree-container'];
    __VLS_styleScopedClasses['custom-tree-node'];
    __VLS_styleScopedClasses['node-label'];
    __VLS_styleScopedClasses['mr-2'];
    __VLS_styleScopedClasses['mr-2'];
    __VLS_styleScopedClasses['mr-2'];
    __VLS_styleScopedClasses['text-gray-400'];
    __VLS_styleScopedClasses['ml-2'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['list-container'];
    __VLS_styleScopedClasses['pagination-container'];
    __VLS_styleScopedClasses['mt-4'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-end'];
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
    __VLS_styleScopedClasses['dialog-footer'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "treeRef": __VLS_168,
        "uploadRef": __VLS_306,
        "formRef": __VLS_473,
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
            fetchDownloadSchoolTemplate: fetchDownloadSchoolTemplate,
            UploadFilled: UploadFilled,
            LoadingIcon: LoadingIcon,
            Delete: Delete,
            Upload: Upload,
            Document: Document,
            InfoFilled: InfoFilled,
            Plus: Plus,
            viewType: viewType,
            loading: loading,
            treeRef: treeRef,
            treeData: treeData,
            listData: listData,
            total: total,
            page: page,
            pageSize: pageSize,
            defaultProps: defaultProps,
            selectedIds: selectedIds,
            isBatchDeleting: isBatchDeleting,
            handleSelectionChange: handleSelectionChange,
            handleBatchDelete: handleBatchDelete,
            searchForm: searchForm,
            provinces: provinces,
            cities: cities,
            schoolsInCity: schoolsInCity,
            handleProvinceChange: handleProvinceChange,
            handleCityChange: handleCityChange,
            filterNode: filterNode,
            handleSearch: handleSearch,
            resetSearch: resetSearch,
            dialogVisible: dialogVisible,
            submitLoading: submitLoading,
            formRef: formRef,
            form: form,
            rules: rules,
            dialogTitle: dialogTitle,
            importVisible: importVisible,
            importLoading: importLoading,
            fileList: fileList,
            uploadRef: uploadRef,
            handleOpenImport: handleOpenImport,
            handleFileChange: handleFileChange,
            handleRemove: handleRemove,
            handleContinueUpload: handleContinueUpload,
            submitImport: submitImport,
            handleEnterSchool: handleEnterSchool,
            handleSizeChange: handleSizeChange,
            handleCurrentChange: handleCurrentChange,
            handleAddSchool: handleAddSchool,
            handleEditSchool: handleEditSchool,
            handleDeleteSchool: handleDeleteSchool,
            submitForm: submitForm,
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