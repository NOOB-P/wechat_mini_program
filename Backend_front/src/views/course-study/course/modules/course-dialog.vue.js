/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, watch, shallowRef, onBeforeUnmount, computed, nextTick } from 'vue';
import { Plus, VideoPlay } from '@element-plus/icons-vue';
import '@wangeditor/editor/dist/css/style.css';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/store/modules/user';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps({
    visible: Boolean,
    isEdit: Boolean,
    data: Object
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
const editorRef = shallowRef();
const videoUploading = ref(false);
const buildDefaultForm = () => ({
    id: '',
    title: '',
    type: 'general',
    isRecommend: 0,
    subject: '',
    grade: '',
    price: 0,
    isSvipOnly: false,
    author: '',
    buyers: 0,
    studentCount: 0,
    episodes: 0,
    cover: '',
    videoUrl: '',
    content: ''
});
const form = ref(buildDefaultForm());
const rules = {
    title: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
    type: [{ required: true, message: '请选择课程类型', trigger: 'change' }],
    content: [{ required: true, message: '请输入课程内容', trigger: 'blur' }]
};
const toolbarConfig = {};
const editorConfig = { placeholder: '请输入课程详情内容...' };
const handleCreated = (editor) => {
    editorRef.value = editor;
};
onBeforeUnmount(() => {
    const editor = editorRef.value;
    if (editor == null)
        return;
    editor.destroy();
});
const syncFromProps = async () => {
    if (!props.visible)
        return;
    const merged = props.data ? { ...buildDefaultForm(), ...props.data } : buildDefaultForm();
    form.value = merged;
    await nextTick();
    if (editorRef.value) {
        editorRef.value.setHtml(form.value.content || '');
    }
};
watch(() => props.visible, () => {
    syncFromProps();
});
watch(() => props.data, () => {
    syncFromProps();
});
const handleUploadSuccess = (res) => {
    if (res.code === 200) {
        form.value.cover = res.data;
        ElMessage.success('封面上传成功');
    }
};
const handleVideoUploadSuccess = (res) => {
    videoUploading.value = false;
    if (res.code === 200) {
        form.value.videoUrl = res.data;
        formRef.value?.validateField('videoUrl');
        ElMessage.success('视频上传成功');
    }
    else {
        ElMessage.error(res.msg || '视频上传失败');
    }
};
const handleVideoUploadError = (err) => {
    videoUploading.value = false;
    console.error('上传失败:', err);
    ElMessage.error('视频上传失败，可能是文件过大或网络问题');
};
const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
        ElMessage.error('上传头像图片只能是 JPG 或 PNG 格式!');
        return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
        ElMessage.error('上传头像图片大小不能超过 2MB!');
        return false;
    }
    return true;
};
const beforeVideoUpload = (file) => {
    const isMp4 = file.type === 'video/mp4';
    if (!isMp4) {
        ElMessage.error('上传视频只能是 MP4 格式!');
        return false;
    }
    const isLt500M = file.size / 1024 / 1024 < 500;
    if (!isLt500M) {
        ElMessage.error('上传视频大小不能超过 500MB!');
        return false;
    }
    videoUploading.value = true;
    return isMp4 && isLt500M;
};
const handleSubmit = async () => {
    if (!formRef.value)
        return;
    await formRef.value.validate((valid) => {
        if (valid) {
            emit('success', form.value);
            dialogVisible.value = false;
        }
    });
};
const handleClosed = () => {
    form.value = buildDefaultForm();
    if (editorRef.value) {
        editorRef.value.setHtml('');
    }
    videoUploading.value = false;
}; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_fnComponent = (await import('vue')).defineComponent({
    props: {
        visible: Boolean,
        isEdit: Boolean,
        data: Object
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
    __VLS_styleScopedClasses['cover-uploader'];
    __VLS_styleScopedClasses['video-uploader'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onClosed': {} }, title: ((__VLS_ctx.isEdit ? '编辑课程' : '新增课程')), modelValue: ((__VLS_ctx.dialogVisible)), width: ("750px"), }));
    const __VLS_2 = __VLS_1({ ...{ 'onClosed': {} }, title: ((__VLS_ctx.isEdit ? '编辑课程' : '新增课程')), modelValue: ((__VLS_ctx.dialogVisible)), width: ("750px"), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
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
    const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({ ref: ("formRef"), model: ((__VLS_ctx.form)), rules: ((__VLS_ctx.rules)), labelWidth: ("100px"), ...{ class: ("course-form") }, }));
    const __VLS_11 = __VLS_10({ ref: ("formRef"), model: ((__VLS_ctx.form)), rules: ((__VLS_ctx.rules)), labelWidth: ("100px"), ...{ class: ("course-form") }, }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    // @ts-ignore navigation for `const formRef = ref()`
    __VLS_ctx.formRef;
    var __VLS_15 = {};
    const __VLS_16 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({ gutter: ((20)), }));
    const __VLS_18 = __VLS_17({ gutter: ((20)), }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    const __VLS_22 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({ span: ((12)), }));
    const __VLS_24 = __VLS_23({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_23));
    const __VLS_28 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({ label: ("课程名称"), prop: ("title"), }));
    const __VLS_30 = __VLS_29({ label: ("课程名称"), prop: ("title"), }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    const __VLS_34 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({ modelValue: ((__VLS_ctx.form.title)), placeholder: ("请输入课程名称"), }));
    const __VLS_36 = __VLS_35({ modelValue: ((__VLS_ctx.form.title)), placeholder: ("请输入课程名称"), }, ...__VLS_functionalComponentArgsRest(__VLS_35));
    __VLS_nonNullable(__VLS_33.slots).default;
    var __VLS_33;
    __VLS_nonNullable(__VLS_27.slots).default;
    var __VLS_27;
    const __VLS_40 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({ span: ((12)), }));
    const __VLS_42 = __VLS_41({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    const __VLS_46 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({ label: ("课程类型"), prop: ("type"), }));
    const __VLS_48 = __VLS_47({ label: ("课程类型"), prop: ("type"), }, ...__VLS_functionalComponentArgsRest(__VLS_47));
    const __VLS_52 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
    /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({ modelValue: ((__VLS_ctx.form.type)), placeholder: ("请选择类型"), ...{ class: ("w-full") }, }));
    const __VLS_54 = __VLS_53({ modelValue: ((__VLS_ctx.form.type)), placeholder: ("请选择类型"), ...{ class: ("w-full") }, }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    const __VLS_58 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({ label: ("常规课程"), value: ("general"), }));
    const __VLS_60 = __VLS_59({ label: ("常规课程"), value: ("general"), }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    const __VLS_64 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({ label: ("学霸说"), value: ("talk"), }));
    const __VLS_66 = __VLS_65({ label: ("学霸说"), value: ("talk"), }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    const __VLS_70 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({ label: ("家庭教育"), value: ("family"), }));
    const __VLS_72 = __VLS_71({ label: ("家庭教育"), value: ("family"), }, ...__VLS_functionalComponentArgsRest(__VLS_71));
    const __VLS_76 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({ label: ("同步/专题课"), value: ("sync"), }));
    const __VLS_78 = __VLS_77({ label: ("同步/专题课"), value: ("sync"), }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    __VLS_nonNullable(__VLS_57.slots).default;
    var __VLS_57;
    __VLS_nonNullable(__VLS_51.slots).default;
    var __VLS_51;
    __VLS_nonNullable(__VLS_45.slots).default;
    var __VLS_45;
    __VLS_nonNullable(__VLS_21.slots).default;
    var __VLS_21;
    const __VLS_82 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */
    // @ts-ignore
    const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({ gutter: ((20)), }));
    const __VLS_84 = __VLS_83({ gutter: ((20)), }, ...__VLS_functionalComponentArgsRest(__VLS_83));
    const __VLS_88 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({ span: ((12)), }));
    const __VLS_90 = __VLS_89({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    const __VLS_94 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({ label: ("今日推荐"), }));
    const __VLS_96 = __VLS_95({ label: ("今日推荐"), }, ...__VLS_functionalComponentArgsRest(__VLS_95));
    const __VLS_100 = __VLS_resolvedLocalAndGlobalComponents.ElSwitch;
    /** @type { [typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ] } */
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({ modelValue: ((__VLS_ctx.form.isRecommend)), activeValue: ((1)), inactiveValue: ((0)), }));
    const __VLS_102 = __VLS_101({ modelValue: ((__VLS_ctx.form.isRecommend)), activeValue: ((1)), inactiveValue: ((0)), }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    __VLS_nonNullable(__VLS_99.slots).default;
    var __VLS_99;
    __VLS_nonNullable(__VLS_93.slots).default;
    var __VLS_93;
    const __VLS_106 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({ span: ((12)), }));
    const __VLS_108 = __VLS_107({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_107));
    const __VLS_112 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({ label: ("SVIP专享"), }));
    const __VLS_114 = __VLS_113({ label: ("SVIP专享"), }, ...__VLS_functionalComponentArgsRest(__VLS_113));
    const __VLS_118 = __VLS_resolvedLocalAndGlobalComponents.ElSwitch;
    /** @type { [typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ] } */
    // @ts-ignore
    const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({ modelValue: ((__VLS_ctx.form.isSvipOnly)), }));
    const __VLS_120 = __VLS_119({ modelValue: ((__VLS_ctx.form.isSvipOnly)), }, ...__VLS_functionalComponentArgsRest(__VLS_119));
    __VLS_nonNullable(__VLS_117.slots).default;
    var __VLS_117;
    __VLS_nonNullable(__VLS_111.slots).default;
    var __VLS_111;
    __VLS_nonNullable(__VLS_87.slots).default;
    var __VLS_87;
    const __VLS_124 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({ gutter: ((20)), }));
    const __VLS_126 = __VLS_125({ gutter: ((20)), }, ...__VLS_functionalComponentArgsRest(__VLS_125));
    const __VLS_130 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({ span: ((12)), }));
    const __VLS_132 = __VLS_131({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_131));
    const __VLS_136 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({ label: ("科目"), prop: ("subject"), }));
    const __VLS_138 = __VLS_137({ label: ("科目"), prop: ("subject"), }, ...__VLS_functionalComponentArgsRest(__VLS_137));
    const __VLS_142 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_143 = __VLS_asFunctionalComponent(__VLS_142, new __VLS_142({ modelValue: ((__VLS_ctx.form.subject)), placeholder: ("如：数学、英语"), }));
    const __VLS_144 = __VLS_143({ modelValue: ((__VLS_ctx.form.subject)), placeholder: ("如：数学、英语"), }, ...__VLS_functionalComponentArgsRest(__VLS_143));
    __VLS_nonNullable(__VLS_141.slots).default;
    var __VLS_141;
    __VLS_nonNullable(__VLS_135.slots).default;
    var __VLS_135;
    const __VLS_148 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({ span: ((12)), }));
    const __VLS_150 = __VLS_149({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_149));
    const __VLS_154 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_155 = __VLS_asFunctionalComponent(__VLS_154, new __VLS_154({ label: ("年级"), prop: ("grade"), }));
    const __VLS_156 = __VLS_155({ label: ("年级"), prop: ("grade"), }, ...__VLS_functionalComponentArgsRest(__VLS_155));
    const __VLS_160 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({ modelValue: ((__VLS_ctx.form.grade)), placeholder: ("如：七年级、八年级"), }));
    const __VLS_162 = __VLS_161({ modelValue: ((__VLS_ctx.form.grade)), placeholder: ("如：七年级、八年级"), }, ...__VLS_functionalComponentArgsRest(__VLS_161));
    __VLS_nonNullable(__VLS_159.slots).default;
    var __VLS_159;
    __VLS_nonNullable(__VLS_153.slots).default;
    var __VLS_153;
    __VLS_nonNullable(__VLS_129.slots).default;
    var __VLS_129;
    const __VLS_166 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */
    // @ts-ignore
    const __VLS_167 = __VLS_asFunctionalComponent(__VLS_166, new __VLS_166({ gutter: ((20)), }));
    const __VLS_168 = __VLS_167({ gutter: ((20)), }, ...__VLS_functionalComponentArgsRest(__VLS_167));
    const __VLS_172 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({ span: ((12)), }));
    const __VLS_174 = __VLS_173({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_173));
    const __VLS_178 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_179 = __VLS_asFunctionalComponent(__VLS_178, new __VLS_178({ label: ("价格"), prop: ("price"), }));
    const __VLS_180 = __VLS_179({ label: ("价格"), prop: ("price"), }, ...__VLS_functionalComponentArgsRest(__VLS_179));
    const __VLS_184 = __VLS_resolvedLocalAndGlobalComponents.ElInputNumber;
    /** @type { [typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ] } */
    // @ts-ignore
    const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({ modelValue: ((__VLS_ctx.form.price)), min: ((0)), precision: ((2)), ...{ class: ("w-full") }, }));
    const __VLS_186 = __VLS_185({ modelValue: ((__VLS_ctx.form.price)), min: ((0)), precision: ((2)), ...{ class: ("w-full") }, }, ...__VLS_functionalComponentArgsRest(__VLS_185));
    __VLS_nonNullable(__VLS_183.slots).default;
    var __VLS_183;
    __VLS_nonNullable(__VLS_177.slots).default;
    var __VLS_177;
    const __VLS_190 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_191 = __VLS_asFunctionalComponent(__VLS_190, new __VLS_190({ span: ((12)), }));
    const __VLS_192 = __VLS_191({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_191));
    const __VLS_196 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({ label: ("作者/讲师"), prop: ("author"), }));
    const __VLS_198 = __VLS_197({ label: ("作者/讲师"), prop: ("author"), }, ...__VLS_functionalComponentArgsRest(__VLS_197));
    const __VLS_202 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_203 = __VLS_asFunctionalComponent(__VLS_202, new __VLS_202({ modelValue: ((__VLS_ctx.form.author)), placeholder: ("请输入作者姓名"), }));
    const __VLS_204 = __VLS_203({ modelValue: ((__VLS_ctx.form.author)), placeholder: ("请输入作者姓名"), }, ...__VLS_functionalComponentArgsRest(__VLS_203));
    __VLS_nonNullable(__VLS_201.slots).default;
    var __VLS_201;
    __VLS_nonNullable(__VLS_195.slots).default;
    var __VLS_195;
    __VLS_nonNullable(__VLS_171.slots).default;
    var __VLS_171;
    const __VLS_208 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */
    // @ts-ignore
    const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({ gutter: ((20)), }));
    const __VLS_210 = __VLS_209({ gutter: ((20)), }, ...__VLS_functionalComponentArgsRest(__VLS_209));
    const __VLS_214 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_215 = __VLS_asFunctionalComponent(__VLS_214, new __VLS_214({ span: ((12)), }));
    const __VLS_216 = __VLS_215({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_215));
    const __VLS_220 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({ label: ("课程封面"), prop: ("cover"), }));
    const __VLS_222 = __VLS_221({ label: ("课程封面"), prop: ("cover"), }, ...__VLS_functionalComponentArgsRest(__VLS_221));
    const __VLS_226 = __VLS_resolvedLocalAndGlobalComponents.ElUpload;
    /** @type { [typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ] } */
    // @ts-ignore
    const __VLS_227 = __VLS_asFunctionalComponent(__VLS_226, new __VLS_226({ ...{ class: ("cover-uploader") }, action: ("/api/system/course/upload-cover"), headers: ((__VLS_ctx.uploadHeaders)), showFileList: ((false)), onSuccess: ((__VLS_ctx.handleUploadSuccess)), beforeUpload: ((__VLS_ctx.beforeUpload)), }));
    const __VLS_228 = __VLS_227({ ...{ class: ("cover-uploader") }, action: ("/api/system/course/upload-cover"), headers: ((__VLS_ctx.uploadHeaders)), showFileList: ((false)), onSuccess: ((__VLS_ctx.handleUploadSuccess)), beforeUpload: ((__VLS_ctx.beforeUpload)), }, ...__VLS_functionalComponentArgsRest(__VLS_227));
    if (__VLS_ctx.form.cover) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({ src: ((__VLS_ctx.form.cover)), ...{ class: ("cover-img") }, });
    }
    else {
        const __VLS_232 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({ ...{ class: ("uploader-icon") }, }));
        const __VLS_234 = __VLS_233({ ...{ class: ("uploader-icon") }, }, ...__VLS_functionalComponentArgsRest(__VLS_233));
        const __VLS_238 = __VLS_resolvedLocalAndGlobalComponents.Plus;
        /** @type { [typeof __VLS_components.Plus, ] } */
        // @ts-ignore
        const __VLS_239 = __VLS_asFunctionalComponent(__VLS_238, new __VLS_238({}));
        const __VLS_240 = __VLS_239({}, ...__VLS_functionalComponentArgsRest(__VLS_239));
        __VLS_nonNullable(__VLS_237.slots).default;
        var __VLS_237;
    }
    __VLS_nonNullable(__VLS_231.slots).default;
    var __VLS_231;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("text-xs text-gray-400 mt-1") }, });
    __VLS_nonNullable(__VLS_225.slots).default;
    var __VLS_225;
    __VLS_nonNullable(__VLS_219.slots).default;
    var __VLS_219;
    const __VLS_244 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
    // @ts-ignore
    const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({ span: ((12)), }));
    const __VLS_246 = __VLS_245({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_245));
    const __VLS_250 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_251 = __VLS_asFunctionalComponent(__VLS_250, new __VLS_250({ label: ("课程视频"), prop: ("videoUrl"), }));
    const __VLS_252 = __VLS_251({ label: ("课程视频"), prop: ("videoUrl"), }, ...__VLS_functionalComponentArgsRest(__VLS_251));
    const __VLS_256 = __VLS_resolvedLocalAndGlobalComponents.ElUpload;
    /** @type { [typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ] } */
    // @ts-ignore
    const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({ ...{ class: ("video-uploader") }, action: ("/api/system/course/upload-video"), headers: ((__VLS_ctx.uploadHeaders)), showFileList: ((false)), onSuccess: ((__VLS_ctx.handleVideoUploadSuccess)), onError: ((__VLS_ctx.handleVideoUploadError)), beforeUpload: ((__VLS_ctx.beforeVideoUpload)), }));
    const __VLS_258 = __VLS_257({ ...{ class: ("video-uploader") }, action: ("/api/system/course/upload-video"), headers: ((__VLS_ctx.uploadHeaders)), showFileList: ((false)), onSuccess: ((__VLS_ctx.handleVideoUploadSuccess)), onError: ((__VLS_ctx.handleVideoUploadError)), beforeUpload: ((__VLS_ctx.beforeVideoUpload)), }, ...__VLS_functionalComponentArgsRest(__VLS_257));
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.videoUploading) }, null, null);
    if (__VLS_ctx.form.videoUrl) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("video-preview") }, });
        const __VLS_262 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_263 = __VLS_asFunctionalComponent(__VLS_262, new __VLS_262({ ...{ class: ("text-green-500 mr-1") }, }));
        const __VLS_264 = __VLS_263({ ...{ class: ("text-green-500 mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_263));
        const __VLS_268 = __VLS_resolvedLocalAndGlobalComponents.VideoPlay;
        /** @type { [typeof __VLS_components.VideoPlay, ] } */
        // @ts-ignore
        const __VLS_269 = __VLS_asFunctionalComponent(__VLS_268, new __VLS_268({}));
        const __VLS_270 = __VLS_269({}, ...__VLS_functionalComponentArgsRest(__VLS_269));
        __VLS_nonNullable(__VLS_267.slots).default;
        var __VLS_267;
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-xs truncate max-w-[150px]") }, });
        (__VLS_ctx.form.videoUrl);
    }
    else {
        const __VLS_274 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_275 = __VLS_asFunctionalComponent(__VLS_274, new __VLS_274({ type: ("primary"), size: ("small"), }));
        const __VLS_276 = __VLS_275({ type: ("primary"), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_275));
        __VLS_nonNullable(__VLS_279.slots).default;
        var __VLS_279;
    }
    __VLS_nonNullable(__VLS_261.slots).default;
    var __VLS_261;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("text-xs text-gray-400 mt-1") }, });
    __VLS_nonNullable(__VLS_255.slots).default;
    var __VLS_255;
    const __VLS_280 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_281 = __VLS_asFunctionalComponent(__VLS_280, new __VLS_280({ label: ("已学人数"), prop: ("buyers"), }));
    const __VLS_282 = __VLS_281({ label: ("已学人数"), prop: ("buyers"), }, ...__VLS_functionalComponentArgsRest(__VLS_281));
    const __VLS_286 = __VLS_resolvedLocalAndGlobalComponents.ElInputNumber;
    /** @type { [typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ] } */
    // @ts-ignore
    const __VLS_287 = __VLS_asFunctionalComponent(__VLS_286, new __VLS_286({ modelValue: ((__VLS_ctx.form.buyers)), min: ((0)), }));
    const __VLS_288 = __VLS_287({ modelValue: ((__VLS_ctx.form.buyers)), min: ((0)), }, ...__VLS_functionalComponentArgsRest(__VLS_287));
    __VLS_nonNullable(__VLS_285.slots).default;
    var __VLS_285;
    const __VLS_292 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_293 = __VLS_asFunctionalComponent(__VLS_292, new __VLS_292({ label: ("总节数"), prop: ("episodes"), }));
    const __VLS_294 = __VLS_293({ label: ("总节数"), prop: ("episodes"), }, ...__VLS_functionalComponentArgsRest(__VLS_293));
    const __VLS_298 = __VLS_resolvedLocalAndGlobalComponents.ElInputNumber;
    /** @type { [typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ] } */
    // @ts-ignore
    const __VLS_299 = __VLS_asFunctionalComponent(__VLS_298, new __VLS_298({ modelValue: ((__VLS_ctx.form.episodes)), min: ((0)), }));
    const __VLS_300 = __VLS_299({ modelValue: ((__VLS_ctx.form.episodes)), min: ((0)), }, ...__VLS_functionalComponentArgsRest(__VLS_299));
    __VLS_nonNullable(__VLS_297.slots).default;
    var __VLS_297;
    __VLS_nonNullable(__VLS_249.slots).default;
    var __VLS_249;
    __VLS_nonNullable(__VLS_213.slots).default;
    var __VLS_213;
    const __VLS_304 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_305 = __VLS_asFunctionalComponent(__VLS_304, new __VLS_304({ label: ("课程内容"), prop: ("content"), }));
    const __VLS_306 = __VLS_305({ label: ("课程内容"), prop: ("content"), }, ...__VLS_functionalComponentArgsRest(__VLS_305));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ style: ({}) }, });
    const __VLS_310 = __VLS_resolvedLocalAndGlobalComponents.Toolbar;
    /** @type { [typeof __VLS_components.Toolbar, ] } */
    // @ts-ignore
    const __VLS_311 = __VLS_asFunctionalComponent(__VLS_310, new __VLS_310({ ...{ style: ({}) }, editor: ((__VLS_ctx.editorRef)), defaultConfig: ((__VLS_ctx.toolbarConfig)), mode: ("default"), }));
    const __VLS_312 = __VLS_311({ ...{ style: ({}) }, editor: ((__VLS_ctx.editorRef)), defaultConfig: ((__VLS_ctx.toolbarConfig)), mode: ("default"), }, ...__VLS_functionalComponentArgsRest(__VLS_311));
    const __VLS_316 = __VLS_resolvedLocalAndGlobalComponents.Editor;
    /** @type { [typeof __VLS_components.Editor, ] } */
    // @ts-ignore
    const __VLS_317 = __VLS_asFunctionalComponent(__VLS_316, new __VLS_316({ ...{ 'onOnCreated': {} }, ...{ style: ({}) }, modelValue: ((__VLS_ctx.form.content)), defaultConfig: ((__VLS_ctx.editorConfig)), mode: ("default"), }));
    const __VLS_318 = __VLS_317({ ...{ 'onOnCreated': {} }, ...{ style: ({}) }, modelValue: ((__VLS_ctx.form.content)), defaultConfig: ((__VLS_ctx.editorConfig)), mode: ("default"), }, ...__VLS_functionalComponentArgsRest(__VLS_317));
    let __VLS_322;
    const __VLS_323 = {
        onOnCreated: (__VLS_ctx.handleCreated)
    };
    let __VLS_319;
    let __VLS_320;
    var __VLS_321;
    __VLS_nonNullable(__VLS_309.slots).default;
    var __VLS_309;
    __VLS_nonNullable(__VLS_14.slots).default;
    var __VLS_14;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        const __VLS_324 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_325 = __VLS_asFunctionalComponent(__VLS_324, new __VLS_324({ ...{ 'onClick': {} }, }));
        const __VLS_326 = __VLS_325({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_325));
        let __VLS_330;
        const __VLS_331 = {
            onClick: (...[$event]) => {
                __VLS_ctx.dialogVisible = false;
            }
        };
        let __VLS_327;
        let __VLS_328;
        __VLS_nonNullable(__VLS_329.slots).default;
        var __VLS_329;
        const __VLS_332 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_333 = __VLS_asFunctionalComponent(__VLS_332, new __VLS_332({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_334 = __VLS_333({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_333));
        let __VLS_338;
        const __VLS_339 = {
            onClick: (__VLS_ctx.handleSubmit)
        };
        let __VLS_335;
        let __VLS_336;
        __VLS_nonNullable(__VLS_337.slots).default;
        var __VLS_337;
    }
    var __VLS_5;
    __VLS_styleScopedClasses['course-form'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['w-full'];
    __VLS_styleScopedClasses['cover-uploader'];
    __VLS_styleScopedClasses['cover-img'];
    __VLS_styleScopedClasses['uploader-icon'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-gray-400'];
    __VLS_styleScopedClasses['mt-1'];
    __VLS_styleScopedClasses['video-uploader'];
    __VLS_styleScopedClasses['video-preview'];
    __VLS_styleScopedClasses['text-green-500'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['truncate'];
    __VLS_styleScopedClasses['max-w-[150px]'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-gray-400'];
    __VLS_styleScopedClasses['mt-1'];
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
            Plus: Plus,
            VideoPlay: VideoPlay,
            Editor: Editor,
            Toolbar: Toolbar,
            dialogVisible: dialogVisible,
            uploadHeaders: uploadHeaders,
            formRef: formRef,
            editorRef: editorRef,
            videoUploading: videoUploading,
            form: form,
            rules: rules,
            toolbarConfig: toolbarConfig,
            editorConfig: editorConfig,
            handleCreated: handleCreated,
            handleUploadSuccess: handleUploadSuccess,
            handleVideoUploadSuccess: handleVideoUploadSuccess,
            handleVideoUploadError: handleVideoUploadError,
            beforeUpload: beforeUpload,
            beforeVideoUpload: beforeVideoUpload,
            handleSubmit: handleSubmit,
            handleClosed: handleClosed,
        };
    },
    emits: {},
    props: {
        visible: Boolean,
        isEdit: Boolean,
        data: Object
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
        data: Object
    },
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=course-dialog.vue.js.map