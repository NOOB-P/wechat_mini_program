/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, onMounted, computed } from 'vue';
import { fetchGetWechatConfigList, fetchAddWechatConfig, fetchUpdateWechatConfig, fetchDeleteWechatConfig } from '@/api/support-interaction/index';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from '@/store/modules/user';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'WechatConfig' });
const userStore = useUserStore();
const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref();
const configList = ref([]);
const form = ref({
    id: undefined,
    groupName: '',
    qrCodePath: '',
    displayLocation: 'NONE',
    status: 1
});
const rules = {
    groupName: [{ required: true, message: '请输入群名称', trigger: 'blur' }],
    qrCodePath: [{ required: true, message: '请上传二维码图片', trigger: 'change' }]
};
const uploadHeaders = computed(() => ({
    Authorization: `Bearer ${userStore.accessToken}`
}));
const loadData = async () => {
    loading.value = true;
    try {
        const res = await fetchGetWechatConfigList();
        if (res && Array.isArray(res)) {
            configList.value = res;
        }
    }
    catch (error) {
        console.error(error);
    }
    loading.value = false;
};
const handleAdd = () => {
    isEdit.value = false;
    form.value = { id: undefined, groupName: '', qrCodePath: '', displayLocation: 'NONE', status: 1 };
    dialogVisible.value = true;
};
const handleEdit = (row) => {
    isEdit.value = true;
    form.value = { ...row };
    dialogVisible.value = true;
};
const handleDelete = (row) => {
    ElMessageBox.confirm(`确定要删除微信群 "${row.groupName}" 吗?`, '提示', {
        type: 'warning'
    }).then(async () => {
        try {
            await fetchDeleteWechatConfig(row.id);
            ElMessage.success('删除成功');
            loadData();
        }
        catch (error) { }
    }).catch(() => { });
};
const beforeUpload = (file) => {
    const isImage = file.type === 'image/jpeg' || file.type === 'image/png';
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isImage) {
        ElMessage.error('上传图片只能是 JPG 或 PNG 格式!');
    }
    if (!isLt2M) {
        ElMessage.error('上传图片大小不能超过 2MB!');
    }
    return isImage && isLt2M;
};
const handleUploadSuccess = (res) => {
    if (res.code === 200) {
        form.value.qrCodePath = res.data;
        ElMessage.success('二维码上传成功');
    }
    else {
        ElMessage.error(res.msg || '上传失败');
    }
};
const submit = async () => {
    await formRef.value.validate(async (valid) => {
        if (valid) {
            saving.value = true;
            try {
                const api = isEdit.value ? fetchUpdateWechatConfig : fetchAddWechatConfig;
                await api(form.value);
                ElMessage.success(isEdit.value ? '更新成功' : '添加成功');
                dialogVisible.value = false;
                loadData();
            }
            catch (error) { }
            saving.value = false;
        }
    });
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
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("page-container p-5") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-card p-6 rounded-xl bg-white shadow-sm") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-between items-center mb-6") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("font-bold text-lg text-g-800") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("text-xs text-g-400 mt-1") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onClick': {} }, type: ("primary"), }));
    const __VLS_2 = __VLS_1({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_6;
    const __VLS_7 = {
        onClick: (__VLS_ctx.handleAdd)
    };
    let __VLS_3;
    let __VLS_4;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { icon: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        const __VLS_8 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({ icon: ("ri:add-line"), }));
        const __VLS_10 = __VLS_9({ icon: ("ri:add-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    }
    var __VLS_5;
    const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ data: ((__VLS_ctx.configList)), border: (true), }));
    const __VLS_16 = __VLS_15({ data: ((__VLS_ctx.configList)), border: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.loading) }, null, null);
    const __VLS_20 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({ prop: ("groupName"), label: ("微信群名称"), minWidth: ("150"), }));
    const __VLS_22 = __VLS_21({ prop: ("groupName"), label: ("微信群名称"), minWidth: ("150"), }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    const __VLS_26 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({ label: ("二维码"), width: ("120"), align: ("center"), }));
    const __VLS_28 = __VLS_27({ label: ("二维码"), width: ("120"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_31.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_32 = __VLS_resolvedLocalAndGlobalComponents.ElImage;
        /** @type { [typeof __VLS_components.ElImage, typeof __VLS_components.elImage, ] } */
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({ src: ((row.qrCodePath)), ...{ class: ("w-12 h-12 rounded shadow-sm cursor-pointer") }, fit: ("cover"), previewSrcList: (([row.qrCodePath])), previewTeleported: (true), }));
        const __VLS_34 = __VLS_33({ src: ((row.qrCodePath)), ...{ class: ("w-12 h-12 rounded shadow-sm cursor-pointer") }, fit: ("cover"), previewSrcList: (([row.qrCodePath])), previewTeleported: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    }
    var __VLS_31;
    const __VLS_38 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({ label: ("展示位置"), width: ("150"), align: ("center"), }));
    const __VLS_40 = __VLS_39({ label: ("展示位置"), width: ("150"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_39));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_43.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        if (row.displayLocation === 'HOME_BANNER') {
            const __VLS_44 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
            /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
            // @ts-ignore
            const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({ type: ("warning"), }));
            const __VLS_46 = __VLS_45({ type: ("warning"), }, ...__VLS_functionalComponentArgsRest(__VLS_45));
            __VLS_nonNullable(__VLS_49.slots).default;
            var __VLS_49;
        }
        else if (row.displayLocation === 'HELP_SERVICE') {
            const __VLS_50 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
            /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
            // @ts-ignore
            const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({ type: ("success"), }));
            const __VLS_52 = __VLS_51({ type: ("success"), }, ...__VLS_functionalComponentArgsRest(__VLS_51));
            __VLS_nonNullable(__VLS_55.slots).default;
            var __VLS_55;
        }
        else {
            const __VLS_56 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
            /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
            // @ts-ignore
            const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({ type: ("info"), }));
            const __VLS_58 = __VLS_57({ type: ("info"), }, ...__VLS_functionalComponentArgsRest(__VLS_57));
            __VLS_nonNullable(__VLS_61.slots).default;
            var __VLS_61;
        }
    }
    var __VLS_43;
    const __VLS_62 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({ label: ("状态"), width: ("100"), align: ("center"), }));
    const __VLS_64 = __VLS_63({ label: ("状态"), width: ("100"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_63));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_67.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_68 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
        /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
        // @ts-ignore
        const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({ type: ((row.status === 1 ? 'success' : 'info')), }));
        const __VLS_70 = __VLS_69({ type: ((row.status === 1 ? 'success' : 'info')), }, ...__VLS_functionalComponentArgsRest(__VLS_69));
        (row.status === 1 ? '启用' : '禁用');
        __VLS_nonNullable(__VLS_73.slots).default;
        var __VLS_73;
    }
    var __VLS_67;
    const __VLS_74 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({ prop: ("updateTime"), label: ("最后更新"), width: ("180"), align: ("center"), }));
    const __VLS_76 = __VLS_75({ prop: ("updateTime"), label: ("最后更新"), width: ("180"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_75));
    const __VLS_80 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({ label: ("操作"), width: ("150"), fixed: ("right"), align: ("center"), }));
    const __VLS_82 = __VLS_81({ label: ("操作"), width: ("150"), fixed: ("right"), align: ("center"), }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_85.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_86 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }));
        const __VLS_88 = __VLS_87({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_87));
        let __VLS_92;
        const __VLS_93 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleEdit(row);
            }
        };
        let __VLS_89;
        let __VLS_90;
        __VLS_nonNullable(__VLS_91.slots).default;
        var __VLS_91;
        const __VLS_94 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({ ...{ 'onClick': {} }, link: (true), type: ("danger"), }));
        const __VLS_96 = __VLS_95({ ...{ 'onClick': {} }, link: (true), type: ("danger"), }, ...__VLS_functionalComponentArgsRest(__VLS_95));
        let __VLS_100;
        const __VLS_101 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleDelete(row);
            }
        };
        let __VLS_97;
        let __VLS_98;
        __VLS_nonNullable(__VLS_99.slots).default;
        var __VLS_99;
    }
    var __VLS_85;
    __VLS_nonNullable(__VLS_19.slots).default;
    var __VLS_19;
    const __VLS_102 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */
    // @ts-ignore
    const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({ modelValue: ((__VLS_ctx.dialogVisible)), title: ((__VLS_ctx.isEdit ? '编辑微信群' : '新增微信群')), width: ("500px"), }));
    const __VLS_104 = __VLS_103({ modelValue: ((__VLS_ctx.dialogVisible)), title: ((__VLS_ctx.isEdit ? '编辑微信群' : '新增微信群')), width: ("500px"), }, ...__VLS_functionalComponentArgsRest(__VLS_103));
    const __VLS_108 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({ model: ((__VLS_ctx.form)), labelWidth: ("80px"), rules: ((__VLS_ctx.rules)), ref: ("formRef"), }));
    const __VLS_110 = __VLS_109({ model: ((__VLS_ctx.form)), labelWidth: ("80px"), rules: ((__VLS_ctx.rules)), ref: ("formRef"), }, ...__VLS_functionalComponentArgsRest(__VLS_109));
    // @ts-ignore navigation for `const formRef = ref()`
    __VLS_ctx.formRef;
    var __VLS_114 = {};
    const __VLS_115 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_116 = __VLS_asFunctionalComponent(__VLS_115, new __VLS_115({ label: ("群名称"), prop: ("groupName"), }));
    const __VLS_117 = __VLS_116({ label: ("群名称"), prop: ("groupName"), }, ...__VLS_functionalComponentArgsRest(__VLS_116));
    const __VLS_121 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({ modelValue: ((__VLS_ctx.form.groupName)), placeholder: ("请输入微信群名称"), }));
    const __VLS_123 = __VLS_122({ modelValue: ((__VLS_ctx.form.groupName)), placeholder: ("请输入微信群名称"), }, ...__VLS_functionalComponentArgsRest(__VLS_122));
    __VLS_nonNullable(__VLS_120.slots).default;
    var __VLS_120;
    const __VLS_127 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_128 = __VLS_asFunctionalComponent(__VLS_127, new __VLS_127({ label: ("展示位置"), prop: ("displayLocation"), }));
    const __VLS_129 = __VLS_128({ label: ("展示位置"), prop: ("displayLocation"), }, ...__VLS_functionalComponentArgsRest(__VLS_128));
    const __VLS_133 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
    /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */
    // @ts-ignore
    const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({ modelValue: ((__VLS_ctx.form.displayLocation)), placeholder: ("请选择展示位置"), ...{ class: ("w-full") }, }));
    const __VLS_135 = __VLS_134({ modelValue: ((__VLS_ctx.form.displayLocation)), placeholder: ("请选择展示位置"), ...{ class: ("w-full") }, }, ...__VLS_functionalComponentArgsRest(__VLS_134));
    const __VLS_139 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
    // @ts-ignore
    const __VLS_140 = __VLS_asFunctionalComponent(__VLS_139, new __VLS_139({ label: ("不展示"), value: ("NONE"), }));
    const __VLS_141 = __VLS_140({ label: ("不展示"), value: ("NONE"), }, ...__VLS_functionalComponentArgsRest(__VLS_140));
    const __VLS_145 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
    // @ts-ignore
    const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({ label: ("首页轮播图"), value: ("HOME_BANNER"), }));
    const __VLS_147 = __VLS_146({ label: ("首页轮播图"), value: ("HOME_BANNER"), }, ...__VLS_functionalComponentArgsRest(__VLS_146));
    const __VLS_151 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
    // @ts-ignore
    const __VLS_152 = __VLS_asFunctionalComponent(__VLS_151, new __VLS_151({ label: ("帮助与客服"), value: ("HELP_SERVICE"), }));
    const __VLS_153 = __VLS_152({ label: ("帮助与客服"), value: ("HELP_SERVICE"), }, ...__VLS_functionalComponentArgsRest(__VLS_152));
    __VLS_nonNullable(__VLS_138.slots).default;
    var __VLS_138;
    __VLS_nonNullable(__VLS_132.slots).default;
    var __VLS_132;
    const __VLS_157 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_158 = __VLS_asFunctionalComponent(__VLS_157, new __VLS_157({ label: ("二维码"), prop: ("qrCodePath"), }));
    const __VLS_159 = __VLS_158({ label: ("二维码"), prop: ("qrCodePath"), }, ...__VLS_functionalComponentArgsRest(__VLS_158));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex flex-col items-center w-full p-4 border-2 border-dashed border-g-200 rounded-lg bg-g-50") }, });
    if (__VLS_ctx.form.qrCodePath) {
        const __VLS_163 = __VLS_resolvedLocalAndGlobalComponents.ElImage;
        /** @type { [typeof __VLS_components.ElImage, typeof __VLS_components.elImage, ] } */
        // @ts-ignore
        const __VLS_164 = __VLS_asFunctionalComponent(__VLS_163, new __VLS_163({ src: ((__VLS_ctx.form.qrCodePath)), ...{ class: ("w-32 h-32 rounded shadow-sm mb-3") }, fit: ("contain"), }));
        const __VLS_165 = __VLS_164({ src: ((__VLS_ctx.form.qrCodePath)), ...{ class: ("w-32 h-32 rounded shadow-sm mb-3") }, fit: ("contain"), }, ...__VLS_functionalComponentArgsRest(__VLS_164));
    }
    const __VLS_169 = __VLS_resolvedLocalAndGlobalComponents.ElUpload;
    /** @type { [typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ] } */
    // @ts-ignore
    const __VLS_170 = __VLS_asFunctionalComponent(__VLS_169, new __VLS_169({ ...{ class: ("upload-demo") }, action: ("/api/customer/wechat/upload"), name: ("file"), headers: ((__VLS_ctx.uploadHeaders)), showFileList: ((false)), onSuccess: ((__VLS_ctx.handleUploadSuccess)), beforeUpload: ((__VLS_ctx.beforeUpload)), }));
    const __VLS_171 = __VLS_170({ ...{ class: ("upload-demo") }, action: ("/api/customer/wechat/upload"), name: ("file"), headers: ((__VLS_ctx.uploadHeaders)), showFileList: ((false)), onSuccess: ((__VLS_ctx.handleUploadSuccess)), beforeUpload: ((__VLS_ctx.beforeUpload)), }, ...__VLS_functionalComponentArgsRest(__VLS_170));
    const __VLS_175 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_176 = __VLS_asFunctionalComponent(__VLS_175, new __VLS_175({ type: ("primary"), plain: (true), size: ("small"), }));
    const __VLS_177 = __VLS_176({ type: ("primary"), plain: (true), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_176));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { icon: __VLS_thisSlot } = __VLS_nonNullable(__VLS_180.slots);
        const __VLS_181 = __VLS_resolvedLocalAndGlobalComponents.ArtSvgIcon;
        /** @type { [typeof __VLS_components.ArtSvgIcon, ] } */
        // @ts-ignore
        const __VLS_182 = __VLS_asFunctionalComponent(__VLS_181, new __VLS_181({ icon: ("ri:image-edit-line"), }));
        const __VLS_183 = __VLS_182({ icon: ("ri:image-edit-line"), }, ...__VLS_functionalComponentArgsRest(__VLS_182));
    }
    (__VLS_ctx.form.qrCodePath ? '更换二维码' : '上传二维码');
    var __VLS_180;
    __VLS_nonNullable(__VLS_174.slots).default;
    var __VLS_174;
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("text-[10px] text-g-400 mt-2 text-center") }, });
    __VLS_nonNullable(__VLS_162.slots).default;
    var __VLS_162;
    const __VLS_187 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_188 = __VLS_asFunctionalComponent(__VLS_187, new __VLS_187({ label: ("状态"), }));
    const __VLS_189 = __VLS_188({ label: ("状态"), }, ...__VLS_functionalComponentArgsRest(__VLS_188));
    const __VLS_193 = __VLS_resolvedLocalAndGlobalComponents.ElSwitch;
    /** @type { [typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ] } */
    // @ts-ignore
    const __VLS_194 = __VLS_asFunctionalComponent(__VLS_193, new __VLS_193({ modelValue: ((__VLS_ctx.form.status)), activeValue: ((1)), inactiveValue: ((0)), activeText: ("启用"), inactiveText: ("禁用"), }));
    const __VLS_195 = __VLS_194({ modelValue: ((__VLS_ctx.form.status)), activeValue: ((1)), inactiveValue: ((0)), activeText: ("启用"), inactiveText: ("禁用"), }, ...__VLS_functionalComponentArgsRest(__VLS_194));
    __VLS_nonNullable(__VLS_192.slots).default;
    var __VLS_192;
    __VLS_nonNullable(__VLS_113.slots).default;
    var __VLS_113;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_107.slots);
        const __VLS_199 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_200 = __VLS_asFunctionalComponent(__VLS_199, new __VLS_199({ ...{ 'onClick': {} }, }));
        const __VLS_201 = __VLS_200({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_200));
        let __VLS_205;
        const __VLS_206 = {
            onClick: (...[$event]) => {
                __VLS_ctx.dialogVisible = false;
            }
        };
        let __VLS_202;
        let __VLS_203;
        __VLS_nonNullable(__VLS_204.slots).default;
        var __VLS_204;
        const __VLS_207 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_208 = __VLS_asFunctionalComponent(__VLS_207, new __VLS_207({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.saving)), }));
        const __VLS_209 = __VLS_208({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.saving)), }, ...__VLS_functionalComponentArgsRest(__VLS_208));
        let __VLS_213;
        const __VLS_214 = {
            onClick: (__VLS_ctx.submit)
        };
        let __VLS_210;
        let __VLS_211;
        __VLS_nonNullable(__VLS_212.slots).default;
        var __VLS_212;
    }
    var __VLS_107;
    __VLS_styleScopedClasses['page-container'];
    __VLS_styleScopedClasses['p-5'];
    __VLS_styleScopedClasses['art-card'];
    __VLS_styleScopedClasses['p-6'];
    __VLS_styleScopedClasses['rounded-xl'];
    __VLS_styleScopedClasses['bg-white'];
    __VLS_styleScopedClasses['shadow-sm'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['mb-6'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['text-lg'];
    __VLS_styleScopedClasses['text-g-800'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-g-400'];
    __VLS_styleScopedClasses['mt-1'];
    __VLS_styleScopedClasses['w-12'];
    __VLS_styleScopedClasses['h-12'];
    __VLS_styleScopedClasses['rounded'];
    __VLS_styleScopedClasses['shadow-sm'];
    __VLS_styleScopedClasses['cursor-pointer'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['flex-col'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['p-4'];
    __VLS_styleScopedClasses['border-2'];
    __VLS_styleScopedClasses['border-dashed'];
    __VLS_styleScopedClasses['border-g-200'];
    __VLS_styleScopedClasses['rounded-lg'];
    __VLS_styleScopedClasses['bg-g-50'];
    __VLS_styleScopedClasses['w-32'];
    __VLS_styleScopedClasses['h-32'];
    __VLS_styleScopedClasses['rounded'];
    __VLS_styleScopedClasses['shadow-sm'];
    __VLS_styleScopedClasses['mb-3'];
    __VLS_styleScopedClasses['upload-demo'];
    __VLS_styleScopedClasses['text-[10px]'];
    __VLS_styleScopedClasses['text-g-400'];
    __VLS_styleScopedClasses['mt-2'];
    __VLS_styleScopedClasses['text-center'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "formRef": __VLS_114,
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
            loading: loading,
            saving: saving,
            dialogVisible: dialogVisible,
            isEdit: isEdit,
            formRef: formRef,
            configList: configList,
            form: form,
            rules: rules,
            uploadHeaders: uploadHeaders,
            handleAdd: handleAdd,
            handleEdit: handleEdit,
            handleDelete: handleDelete,
            beforeUpload: beforeUpload,
            handleUploadSuccess: handleUploadSuccess,
            submit: submit,
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