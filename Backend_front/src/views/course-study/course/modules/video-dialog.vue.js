/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { VideoPlay } from '@element-plus/icons-vue';
import { useUserStore } from '@/store/modules/user';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps({
    visible: Boolean,
    isEdit: Boolean,
    data: Object,
    episodeId: String
});
const emit = defineEmits(['update:visible', 'success']);
const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
});
const userStore = useUserStore();
const uploadHeaders = computed(() => ({
    Authorization: `Bearer ${userStore.accessToken}`
}));
const formRef = ref();
const uploading = ref(false);
const form = ref({
    id: '',
    episodeId: '',
    title: '',
    videoUrl: '',
    sortOrder: 1
});
const rules = {
    title: [{ required: true, message: '请输入视频名称', trigger: 'blur' }],
    videoUrl: [{ required: true, message: '请上传视频', trigger: 'change' }]
};
watch(() => props.visible, (val) => {
    if (val) {
        if (props.isEdit && props.data) {
            form.value = { ...form.value, ...props.data };
        }
        else {
            resetForm();
            form.value.episodeId = props.episodeId || '';
        }
    }
});
const resetForm = () => {
    form.value = {
        id: '',
        episodeId: props.episodeId || '',
        title: '',
        videoUrl: '',
        sortOrder: 1
    };
    formRef.value?.resetFields();
};
const handleClosed = () => {
    resetForm();
};
const handleUploadSuccess = (res) => {
    uploading.value = false;
    if (res.code === 200) {
        form.value.videoUrl = res.data;
        ElMessage.success('视频上传成功');
    }
    else {
        ElMessage.error(res.msg || '上传失败');
    }
};
const beforeUpload = (file) => {
    const isMp4 = file.type === 'video/mp4';
    if (!isMp4) {
        ElMessage.error('仅支持 MP4 格式');
        return false;
    }
    uploading.value = true;
    return true;
};
const handleSubmit = async () => {
    if (!formRef.value)
        return;
    await formRef.value.validate((valid) => {
        if (valid) {
            emit('success', { ...form.value });
            dialogVisible.value = false;
        }
    });
}; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_fnComponent = (await import('vue')).defineComponent({
    props: {
        visible: Boolean,
        isEdit: Boolean,
        data: Object,
        episodeId: String
    },
    emits: {},
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
    __VLS_styleScopedClasses['video-uploader'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onClosed': {} }, title: ((__VLS_ctx.isEdit ? '编辑视频' : '新增视频')), modelValue: ((__VLS_ctx.dialogVisible)), width: ("500px"), }));
    const __VLS_2 = __VLS_1({ ...{ 'onClosed': {} }, title: ((__VLS_ctx.isEdit ? '编辑视频' : '新增视频')), modelValue: ((__VLS_ctx.dialogVisible)), width: ("500px"), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_6 = {};
    let __VLS_7;
    const __VLS_8 = {
        onClosed: (__VLS_ctx.handleClosed)
    };
    let __VLS_3;
    let __VLS_4;
    const __VLS_9 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({ ref: ("formRef"), model: ((__VLS_ctx.form)), rules: ((__VLS_ctx.rules)), labelWidth: ("80px"), }));
    const __VLS_11 = __VLS_10({ ref: ("formRef"), model: ((__VLS_ctx.form)), rules: ((__VLS_ctx.rules)), labelWidth: ("80px"), }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    // @ts-ignore navigation for `const formRef = ref()`
    __VLS_ctx.formRef;
    var __VLS_15 = {};
    const __VLS_16 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({ label: ("视频名称"), prop: ("title"), }));
    const __VLS_18 = __VLS_17({ label: ("视频名称"), prop: ("title"), }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    const __VLS_22 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({ modelValue: ((__VLS_ctx.form.title)), placeholder: ("请输入视频名称"), }));
    const __VLS_24 = __VLS_23({ modelValue: ((__VLS_ctx.form.title)), placeholder: ("请输入视频名称"), }, ...__VLS_functionalComponentArgsRest(__VLS_23));
    __VLS_nonNullable(__VLS_21.slots).default;
    var __VLS_21;
    const __VLS_28 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({ label: ("视频文件"), prop: ("videoUrl"), }));
    const __VLS_30 = __VLS_29({ label: ("视频文件"), prop: ("videoUrl"), }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    const __VLS_34 = __VLS_resolvedLocalAndGlobalComponents.ElUpload;
    /** @type { [typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ] } */
    // @ts-ignore
    const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({ ...{ class: ("video-uploader") }, action: ("/api/system/course/upload-video"), headers: ((__VLS_ctx.uploadHeaders)), showFileList: ((false)), onSuccess: ((__VLS_ctx.handleUploadSuccess)), beforeUpload: ((__VLS_ctx.beforeUpload)), }));
    const __VLS_36 = __VLS_35({ ...{ class: ("video-uploader") }, action: ("/api/system/course/upload-video"), headers: ((__VLS_ctx.uploadHeaders)), showFileList: ((false)), onSuccess: ((__VLS_ctx.handleUploadSuccess)), beforeUpload: ((__VLS_ctx.beforeUpload)), }, ...__VLS_functionalComponentArgsRest(__VLS_35));
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.uploading) }, null, null);
    if (__VLS_ctx.form.videoUrl) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("video-preview") }, });
        const __VLS_40 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({ ...{ class: ("text-green-500 mr-1") }, }));
        const __VLS_42 = __VLS_41({ ...{ class: ("text-green-500 mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        const __VLS_46 = __VLS_resolvedLocalAndGlobalComponents.VideoPlay;
        /** @type { [typeof __VLS_components.VideoPlay, ] } */
        // @ts-ignore
        const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({}));
        const __VLS_48 = __VLS_47({}, ...__VLS_functionalComponentArgsRest(__VLS_47));
        __VLS_nonNullable(__VLS_45.slots).default;
        var __VLS_45;
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-xs truncate max-w-[150px]") }, });
        (__VLS_ctx.form.videoUrl);
    }
    else {
        const __VLS_52 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({ type: ("primary"), size: ("small"), }));
        const __VLS_54 = __VLS_53({ type: ("primary"), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        __VLS_nonNullable(__VLS_57.slots).default;
        var __VLS_57;
    }
    __VLS_nonNullable(__VLS_39.slots).default;
    var __VLS_39;
    __VLS_nonNullable(__VLS_33.slots).default;
    var __VLS_33;
    const __VLS_58 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({ label: ("排序"), prop: ("sortOrder"), }));
    const __VLS_60 = __VLS_59({ label: ("排序"), prop: ("sortOrder"), }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    const __VLS_64 = __VLS_resolvedLocalAndGlobalComponents.ElInputNumber;
    /** @type { [typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ] } */
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({ modelValue: ((__VLS_ctx.form.sortOrder)), min: ((1)), ...{ class: ("w-full") }, }));
    const __VLS_66 = __VLS_65({ modelValue: ((__VLS_ctx.form.sortOrder)), min: ((1)), ...{ class: ("w-full") }, }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    __VLS_nonNullable(__VLS_63.slots).default;
    var __VLS_63;
    __VLS_nonNullable(__VLS_14.slots).default;
    var __VLS_14;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        const __VLS_70 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({ ...{ 'onClick': {} }, }));
        const __VLS_72 = __VLS_71({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_71));
        let __VLS_76;
        const __VLS_77 = {
            onClick: (...[$event]) => {
                __VLS_ctx.dialogVisible = false;
            }
        };
        let __VLS_73;
        let __VLS_74;
        __VLS_nonNullable(__VLS_75.slots).default;
        var __VLS_75;
        const __VLS_78 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_80 = __VLS_79({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_79));
        let __VLS_84;
        const __VLS_85 = {
            onClick: (__VLS_ctx.handleSubmit)
        };
        let __VLS_81;
        let __VLS_82;
        __VLS_nonNullable(__VLS_83.slots).default;
        var __VLS_83;
    }
    var __VLS_5;
    __VLS_styleScopedClasses['video-uploader'];
    __VLS_styleScopedClasses['video-preview'];
    __VLS_styleScopedClasses['text-green-500'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['truncate'];
    __VLS_styleScopedClasses['max-w-[150px]'];
    __VLS_styleScopedClasses['w-full'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "formRef": __VLS_15,
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
            VideoPlay: VideoPlay,
            dialogVisible: dialogVisible,
            uploadHeaders: uploadHeaders,
            formRef: formRef,
            uploading: uploading,
            form: form,
            rules: rules,
            handleClosed: handleClosed,
            handleUploadSuccess: handleUploadSuccess,
            beforeUpload: beforeUpload,
            handleSubmit: handleSubmit,
        };
    },
    emits: {},
    props: {
        visible: Boolean,
        isEdit: Boolean,
        data: Object,
        episodeId: String
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    props: {
        visible: Boolean,
        isEdit: Boolean,
        data: Object,
        episodeId: String
    },
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=video-dialog.vue.js.map