/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, onMounted } from 'vue';
import { fetchGetSvipCourseList, fetchDeleteSvipCourse, fetchChangeSvipCourseStatus, fetchSaveSvipCourse, fetchGetEpisodeList, fetchAddEpisode, fetchUpdateEpisode, fetchDeleteEpisode, fetchGetVideoList, fetchAddVideo, fetchUpdateVideo, fetchDeleteVideo } from '@/api/course-study/svip-course/index';
import { ElMessage, ElMessageBox } from 'element-plus';
import CourseDialog from '../course/modules/course-dialog.vue';
import EpisodeDialog from '../course/modules/episode-dialog.vue';
import VideoDialog from '../course/modules/video-dialog.vue';
import { ArrowLeft, VideoPlay } from '@element-plus/icons-vue';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const loading = ref(false);
const tableData = ref([]);
const queryParams = ref({
    current: 1,
    size: 10,
    type: '',
    isSvipOnly: true
});
const dialogVisible = ref(false);
const isEdit = ref(false);
const editData = ref({});
// 新增分类管理相关
const showDetail = ref(false);
const currentCategory = ref({ id: '', name: '', count: 0 });
const categoryData = ref([
    { id: 'general', name: '常规课程', count: 0 },
    { id: 'talk', name: '学霸说', count: 0 },
    { id: 'family', name: '家庭教育', count: 0 },
    { id: 'sync', name: '同步/专题课', count: 0 }
]);
// 新增章节管理相关
const showEpisodeManagement = ref(false);
const showEpisodeVideoManagement = ref(false);
const episodeLoading = ref(false);
const currentCourse = ref({ id: '', title: '' });
const currentEpisode = ref({ id: '', title: '', sortOrder: 0 });
const episodeData = ref([]);
const episodeDialogVisible = ref(false);
const isEpisodeEdit = ref(false);
const episodeEditData = ref(undefined);
const videoLoading = ref(false);
const videoData = ref([]);
const videoDialogVisible = ref(false);
const isVideoEdit = ref(false);
const videoEditData = ref(undefined);
const enterEpisodeVideoManagement = (row) => {
    currentEpisode.value = { ...row };
    showEpisodeVideoManagement.value = true;
    loadVideos();
};
const loadVideos = async () => {
    videoLoading.value = true;
    try {
        const res = await fetchGetVideoList(currentEpisode.value.id);
        videoData.value = res || [];
    }
    catch (error) {
        console.error('加载视频失败:', error);
    }
    finally {
        videoLoading.value = false;
    }
};
const handleAddVideo = () => {
    isVideoEdit.value = false;
    const maxSort = videoData.value.reduce((max, item) => Math.max(max, item.sortOrder || 0), 0);
    videoEditData.value = {
        episodeId: currentEpisode.value.id,
        sortOrder: maxSort + 1,
        title: '',
        videoUrl: ''
    };
    videoDialogVisible.value = true;
};
const handleEditVideo = (row) => {
    isVideoEdit.value = true;
    videoEditData.value = { ...row };
    videoDialogVisible.value = true;
};
const handleVideoSuccess = async (formData) => {
    try {
        if (isVideoEdit.value) {
            await fetchUpdateVideo(formData);
        }
        else {
            await fetchAddVideo(formData);
        }
        ElMessage.success(isVideoEdit.value ? '更新成功' : '新增成功');
        loadVideos();
    }
    catch (error) {
        // 拦截器处理
    }
};
const handleDeleteVideo = (row) => {
    ElMessageBox.confirm('确定要删除该视频吗?', '提示', { type: 'warning' }).then(async () => {
        try {
            await fetchDeleteVideo(row.id);
            ElMessage.success('删除成功');
            loadVideos();
        }
        catch (error) {
            // 拦截器处理
        }
    });
};
const handleEpisodeVideoSuccess = async () => {
    try {
        await fetchUpdateEpisode(currentEpisode.value);
        ElMessage.success('章节信息保存成功');
        loadEpisodes();
    }
    catch (error) {
        // 拦截器处理
    }
};
const loadCategories = async () => {
    try {
        const data = await fetchGetSvipCourseList({ current: 1, size: 1000 });
        const courses = Array.isArray(data) ? data : (data.list || []);
        // 统计各分类数量
        categoryData.value.forEach(cat => {
            cat.count = courses.filter(c => c.type === cat.id).length;
        });
    }
    catch (error) {
        console.error('加载分类统计失败:', error);
    }
};
const enterCategory = (row) => {
    currentCategory.value = row;
    queryParams.value.type = row.id;
    showDetail.value = true;
    loadData();
};
const enterCourseManagement = (row) => {
    currentCourse.value = row;
    showEpisodeManagement.value = true;
    loadEpisodes();
};
const loadEpisodes = async () => {
    episodeLoading.value = true;
    try {
        const res = await fetchGetEpisodeList(currentCourse.value.id);
        episodeData.value = res || [];
    }
    catch (error) {
        console.error('加载章节失败:', error);
    }
    finally {
        episodeLoading.value = false;
    }
};
const handleImportSuccess = () => {
    ElMessage.success('批量导入成功');
    loadEpisodes();
};
const handleAddEpisode = () => {
    isEpisodeEdit.value = false;
    const maxSort = episodeData.value.reduce((max, item) => Math.max(max, item.sortOrder || 0), 0);
    episodeEditData.value = {
        courseId: currentCourse.value.id,
        sortOrder: maxSort + 1,
        title: ''
    };
    episodeDialogVisible.value = true;
};
const handleEditEpisode = (row) => {
    isEpisodeEdit.value = true;
    episodeEditData.value = { ...row };
    episodeDialogVisible.value = true;
};
const handleEpisodeSuccess = async (formData) => {
    try {
        if (isEpisodeEdit.value) {
            await fetchUpdateEpisode(formData);
        }
        else {
            await fetchAddEpisode(formData);
        }
        ElMessage.success(isEpisodeEdit.value ? '更新成功' : '新增成功');
        loadEpisodes();
    }
    catch (error) {
        // 错误已由请求拦截器处理
    }
};
const handleDeleteEpisode = (row) => {
    ElMessageBox.confirm('确定要删除该章节吗?', '提示', { type: 'warning' }).then(async () => {
        try {
            await fetchDeleteEpisode(row.id);
            ElMessage.success('删除成功');
            loadEpisodes();
        }
        catch (error) {
            // 拦截器已处理
        }
    });
};
const loadData = async () => {
    loading.value = true;
    try {
        const data = await fetchGetSvipCourseList(queryParams.value);
        if (data) {
            if (Array.isArray(data)) {
                tableData.value = data;
            }
            else if (Array.isArray(data.list)) {
                tableData.value = data.list;
            }
        }
    }
    catch (error) {
        console.error('加载 SVIP 课程数据失败:', error);
    }
    finally {
        loading.value = false;
    }
};
const handleAdd = () => {
    isEdit.value = false;
    editData.value = {
        type: currentCategory.value?.id || 'general',
        isSvipOnly: true,
        price: 0,
        status: 1
    };
    dialogVisible.value = true;
};
const handleEdit = (row) => {
    isEdit.value = true;
    editData.value = row;
    dialogVisible.value = true;
};
const handleSuccess = async (formData) => {
    try {
        await fetchSaveSvipCourse(formData);
        ElMessage.success(isEdit.value ? '更新成功' : '新增成功');
        loadData();
        loadCategories();
    }
    catch (error) {
        // 错误已由请求拦截器处理
    }
};
const handleDelete = (row) => {
    ElMessageBox.confirm('确定要删除该 SVIP 课程吗?', '提示', {
        type: 'warning'
    }).then(async () => {
        try {
            await fetchDeleteSvipCourse(row.id);
            ElMessage.success('删除成功');
            loadData();
            loadCategories();
        }
        catch (error) {
            // 拦截器已处理
        }
    });
};
const handleStatus = async (row) => {
    const newStatus = row.status === 1 ? 0 : 1;
    try {
        await fetchChangeSvipCourseStatus(row.id, newStatus);
        ElMessage.success('操作成功');
        loadData();
    }
    catch (error) {
        // 拦截器已处理
    }
};
onMounted(() => {
    loadCategories();
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
    __VLS_styleScopedClasses['video-uploader-large'];
    __VLS_styleScopedClasses['upload-placeholder'];
    __VLS_styleScopedClasses['video-info-box'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("page-container") }, });
    if (!__VLS_ctx.showDetail && !__VLS_ctx.showEpisodeManagement) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
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
        }
        const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
        /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ data: ((__VLS_ctx.categoryData)), border: (true), }));
        const __VLS_8 = __VLS_7({ data: ((__VLS_ctx.categoryData)), border: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ prop: ("id"), label: ("分类ID"), width: ("120"), }));
        const __VLS_14 = __VLS_13({ prop: ("id"), label: ("分类ID"), width: ("120"), }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        const __VLS_18 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({ prop: ("name"), label: ("分类名称"), minWidth: ("150"), }));
        const __VLS_20 = __VLS_19({ prop: ("name"), label: ("分类名称"), minWidth: ("150"), }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        const __VLS_24 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({ prop: ("count"), label: ("课程数量"), width: ("120"), }));
        const __VLS_26 = __VLS_25({ prop: ("count"), label: ("课程数量"), width: ("120"), }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        const __VLS_30 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({ label: ("操作"), width: ("150"), fixed: ("right"), }));
        const __VLS_32 = __VLS_31({ label: ("操作"), width: ("150"), fixed: ("right"), }, ...__VLS_functionalComponentArgsRest(__VLS_31));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_35.slots);
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_36 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }));
            const __VLS_38 = __VLS_37({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_37));
            let __VLS_42;
            const __VLS_43 = {
                onClick: (...[$event]) => {
                    if (!((!__VLS_ctx.showDetail && !__VLS_ctx.showEpisodeManagement)))
                        return;
                    __VLS_ctx.enterCategory(row);
                }
            };
            let __VLS_39;
            let __VLS_40;
            __VLS_nonNullable(__VLS_41.slots).default;
            var __VLS_41;
        }
        var __VLS_35;
        __VLS_nonNullable(__VLS_11.slots).default;
        var __VLS_11;
        var __VLS_5;
    }
    else if (__VLS_ctx.showDetail && !__VLS_ctx.showEpisodeManagement) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_44 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({ shadow: ("never"), }));
        const __VLS_46 = __VLS_45({ shadow: ("never"), }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { header: __VLS_thisSlot } = __VLS_nonNullable(__VLS_49.slots);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-between items-center") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex items-center") }, });
            const __VLS_50 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({ ...{ 'onClick': {} }, link: (true), }));
            const __VLS_52 = __VLS_51({ ...{ 'onClick': {} }, link: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_51));
            let __VLS_56;
            const __VLS_57 = {
                onClick: (...[$event]) => {
                    if (!(!((!__VLS_ctx.showDetail && !__VLS_ctx.showEpisodeManagement))))
                        return;
                    if (!((__VLS_ctx.showDetail && !__VLS_ctx.showEpisodeManagement)))
                        return;
                    __VLS_ctx.showDetail = false;
                }
            };
            let __VLS_53;
            let __VLS_54;
            const __VLS_58 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
            /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
            // @ts-ignore
            const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({}));
            const __VLS_60 = __VLS_59({}, ...__VLS_functionalComponentArgsRest(__VLS_59));
            const __VLS_64 = __VLS_resolvedLocalAndGlobalComponents.ArrowLeft;
            /** @type { [typeof __VLS_components.ArrowLeft, ] } */
            // @ts-ignore
            const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({}));
            const __VLS_66 = __VLS_65({}, ...__VLS_functionalComponentArgsRest(__VLS_65));
            __VLS_nonNullable(__VLS_63.slots).default;
            var __VLS_63;
            __VLS_nonNullable(__VLS_55.slots).default;
            var __VLS_55;
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("ml-4 font-bold") }, });
            (__VLS_ctx.currentCategory.name);
            const __VLS_70 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({ ...{ 'onClick': {} }, type: ("primary"), }));
            const __VLS_72 = __VLS_71({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_71));
            let __VLS_76;
            const __VLS_77 = {
                onClick: (__VLS_ctx.handleAdd)
            };
            let __VLS_73;
            let __VLS_74;
            __VLS_nonNullable(__VLS_75.slots).default;
            var __VLS_75;
        }
        const __VLS_78 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
        /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
        // @ts-ignore
        const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({ data: ((__VLS_ctx.tableData)), border: (true), }));
        const __VLS_80 = __VLS_79({ data: ((__VLS_ctx.tableData)), border: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_79));
        __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.loading) }, null, null);
        const __VLS_84 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({ prop: ("title"), label: ("课程名称"), minWidth: ("180"), }));
        const __VLS_86 = __VLS_85({ prop: ("title"), label: ("课程名称"), minWidth: ("180"), }, ...__VLS_functionalComponentArgsRest(__VLS_85));
        const __VLS_90 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({ prop: ("type"), label: ("类型"), width: ("100"), }));
        const __VLS_92 = __VLS_91({ prop: ("type"), label: ("类型"), width: ("100"), }, ...__VLS_functionalComponentArgsRest(__VLS_91));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_95.slots);
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            if (row.type === 'general') {
                const __VLS_96 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({}));
                const __VLS_98 = __VLS_97({}, ...__VLS_functionalComponentArgsRest(__VLS_97));
                __VLS_nonNullable(__VLS_101.slots).default;
                var __VLS_101;
            }
            else if (row.type === 'sync') {
                const __VLS_102 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({ type: ("success"), }));
                const __VLS_104 = __VLS_103({ type: ("success"), }, ...__VLS_functionalComponentArgsRest(__VLS_103));
                __VLS_nonNullable(__VLS_107.slots).default;
                var __VLS_107;
            }
            else if (row.type === 'family') {
                const __VLS_108 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({ type: ("warning"), }));
                const __VLS_110 = __VLS_109({ type: ("warning"), }, ...__VLS_functionalComponentArgsRest(__VLS_109));
                __VLS_nonNullable(__VLS_113.slots).default;
                var __VLS_113;
            }
            else if (row.type === 'talk') {
                const __VLS_114 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({ type: ("danger"), }));
                const __VLS_116 = __VLS_115({ type: ("danger"), }, ...__VLS_functionalComponentArgsRest(__VLS_115));
                __VLS_nonNullable(__VLS_119.slots).default;
                var __VLS_119;
            }
        }
        var __VLS_95;
        const __VLS_120 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({ prop: ("subject"), label: ("科目"), width: ("80"), }));
        const __VLS_122 = __VLS_121({ prop: ("subject"), label: ("科目"), width: ("80"), }, ...__VLS_functionalComponentArgsRest(__VLS_121));
        const __VLS_126 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({ prop: ("grade"), label: ("年级"), width: ("100"), }));
        const __VLS_128 = __VLS_127({ prop: ("grade"), label: ("年级"), width: ("100"), }, ...__VLS_functionalComponentArgsRest(__VLS_127));
        const __VLS_132 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({ prop: ("price"), label: ("价格"), width: ("100"), }));
        const __VLS_134 = __VLS_133({ prop: ("price"), label: ("价格"), width: ("100"), }, ...__VLS_functionalComponentArgsRest(__VLS_133));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_137.slots);
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ style: ({}) }, });
            (row.price?.toFixed(2));
        }
        var __VLS_137;
        const __VLS_138 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({ label: ("封面"), width: ("120"), }));
        const __VLS_140 = __VLS_139({ label: ("封面"), width: ("120"), }, ...__VLS_functionalComponentArgsRest(__VLS_139));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_143.slots);
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_144 = __VLS_resolvedLocalAndGlobalComponents.ElImage;
            /** @type { [typeof __VLS_components.ElImage, typeof __VLS_components.elImage, ] } */
            // @ts-ignore
            const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({ src: ((row.cover)), ...{ class: ("w-20 h-12 rounded") }, fit: ("cover"), }));
            const __VLS_146 = __VLS_145({ src: ((row.cover)), ...{ class: ("w-20 h-12 rounded") }, fit: ("cover"), }, ...__VLS_functionalComponentArgsRest(__VLS_145));
        }
        var __VLS_143;
        const __VLS_150 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_151 = __VLS_asFunctionalComponent(__VLS_150, new __VLS_150({ prop: ("isRecommend"), label: ("今日推荐"), width: ("100"), }));
        const __VLS_152 = __VLS_151({ prop: ("isRecommend"), label: ("今日推荐"), width: ("100"), }, ...__VLS_functionalComponentArgsRest(__VLS_151));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_155.slots);
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_156 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
            /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
            // @ts-ignore
            const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({ type: ((row.isRecommend === 1 ? 'success' : 'info')), }));
            const __VLS_158 = __VLS_157({ type: ((row.isRecommend === 1 ? 'success' : 'info')), }, ...__VLS_functionalComponentArgsRest(__VLS_157));
            (row.isRecommend === 1 ? '是' : '否');
            __VLS_nonNullable(__VLS_161.slots).default;
            var __VLS_161;
        }
        var __VLS_155;
        const __VLS_162 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_163 = __VLS_asFunctionalComponent(__VLS_162, new __VLS_162({ label: ("状态"), width: ("100"), }));
        const __VLS_164 = __VLS_163({ label: ("状态"), width: ("100"), }, ...__VLS_functionalComponentArgsRest(__VLS_163));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_167.slots);
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_168 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
            /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
            // @ts-ignore
            const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({ type: ((row.status === 1 ? 'success' : 'info')), }));
            const __VLS_170 = __VLS_169({ type: ((row.status === 1 ? 'success' : 'info')), }, ...__VLS_functionalComponentArgsRest(__VLS_169));
            (row.status === 1 ? '已上架' : '已下架');
            __VLS_nonNullable(__VLS_173.slots).default;
            var __VLS_173;
        }
        var __VLS_167;
        const __VLS_174 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_175 = __VLS_asFunctionalComponent(__VLS_174, new __VLS_174({ prop: ("createTime"), label: ("创建时间"), width: ("180"), }));
        const __VLS_176 = __VLS_175({ prop: ("createTime"), label: ("创建时间"), width: ("180"), }, ...__VLS_functionalComponentArgsRest(__VLS_175));
        const __VLS_180 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({ label: ("操作"), width: ("280"), fixed: ("right"), }));
        const __VLS_182 = __VLS_181({ label: ("操作"), width: ("280"), fixed: ("right"), }, ...__VLS_functionalComponentArgsRest(__VLS_181));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_185.slots);
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_186 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_187 = __VLS_asFunctionalComponent(__VLS_186, new __VLS_186({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }));
            const __VLS_188 = __VLS_187({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_187));
            let __VLS_192;
            const __VLS_193 = {
                onClick: (...[$event]) => {
                    if (!(!((!__VLS_ctx.showDetail && !__VLS_ctx.showEpisodeManagement))))
                        return;
                    if (!((__VLS_ctx.showDetail && !__VLS_ctx.showEpisodeManagement)))
                        return;
                    __VLS_ctx.enterCourseManagement(row);
                }
            };
            let __VLS_189;
            let __VLS_190;
            __VLS_nonNullable(__VLS_191.slots).default;
            var __VLS_191;
            const __VLS_194 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_195 = __VLS_asFunctionalComponent(__VLS_194, new __VLS_194({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }));
            const __VLS_196 = __VLS_195({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_195));
            let __VLS_200;
            const __VLS_201 = {
                onClick: (...[$event]) => {
                    if (!(!((!__VLS_ctx.showDetail && !__VLS_ctx.showEpisodeManagement))))
                        return;
                    if (!((__VLS_ctx.showDetail && !__VLS_ctx.showEpisodeManagement)))
                        return;
                    __VLS_ctx.handleEdit(row);
                }
            };
            let __VLS_197;
            let __VLS_198;
            __VLS_nonNullable(__VLS_199.slots).default;
            var __VLS_199;
            const __VLS_202 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_203 = __VLS_asFunctionalComponent(__VLS_202, new __VLS_202({ ...{ 'onClick': {} }, link: (true), type: ((row.status === 1 ? 'warning' : 'success')), }));
            const __VLS_204 = __VLS_203({ ...{ 'onClick': {} }, link: (true), type: ((row.status === 1 ? 'warning' : 'success')), }, ...__VLS_functionalComponentArgsRest(__VLS_203));
            let __VLS_208;
            const __VLS_209 = {
                onClick: (...[$event]) => {
                    if (!(!((!__VLS_ctx.showDetail && !__VLS_ctx.showEpisodeManagement))))
                        return;
                    if (!((__VLS_ctx.showDetail && !__VLS_ctx.showEpisodeManagement)))
                        return;
                    __VLS_ctx.handleStatus(row);
                }
            };
            let __VLS_205;
            let __VLS_206;
            (row.status === 1 ? '下架' : '上架');
            __VLS_nonNullable(__VLS_207.slots).default;
            var __VLS_207;
            const __VLS_210 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_211 = __VLS_asFunctionalComponent(__VLS_210, new __VLS_210({ ...{ 'onClick': {} }, link: (true), type: ("danger"), }));
            const __VLS_212 = __VLS_211({ ...{ 'onClick': {} }, link: (true), type: ("danger"), }, ...__VLS_functionalComponentArgsRest(__VLS_211));
            let __VLS_216;
            const __VLS_217 = {
                onClick: (...[$event]) => {
                    if (!(!((!__VLS_ctx.showDetail && !__VLS_ctx.showEpisodeManagement))))
                        return;
                    if (!((__VLS_ctx.showDetail && !__VLS_ctx.showEpisodeManagement)))
                        return;
                    __VLS_ctx.handleDelete(row);
                }
            };
            let __VLS_213;
            let __VLS_214;
            __VLS_nonNullable(__VLS_215.slots).default;
            var __VLS_215;
        }
        var __VLS_185;
        __VLS_nonNullable(__VLS_83.slots).default;
        var __VLS_83;
        var __VLS_49;
    }
    else if (__VLS_ctx.showEpisodeManagement && !__VLS_ctx.showEpisodeVideoManagement) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_218 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
        // @ts-ignore
        const __VLS_219 = __VLS_asFunctionalComponent(__VLS_218, new __VLS_218({ shadow: ("never"), }));
        const __VLS_220 = __VLS_219({ shadow: ("never"), }, ...__VLS_functionalComponentArgsRest(__VLS_219));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { header: __VLS_thisSlot } = __VLS_nonNullable(__VLS_223.slots);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-between items-center") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex items-center") }, });
            const __VLS_224 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({ ...{ 'onClick': {} }, link: (true), }));
            const __VLS_226 = __VLS_225({ ...{ 'onClick': {} }, link: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_225));
            let __VLS_230;
            const __VLS_231 = {
                onClick: (...[$event]) => {
                    if (!(!((!__VLS_ctx.showDetail && !__VLS_ctx.showEpisodeManagement))))
                        return;
                    if (!(!((__VLS_ctx.showDetail && !__VLS_ctx.showEpisodeManagement))))
                        return;
                    if (!((__VLS_ctx.showEpisodeManagement && !__VLS_ctx.showEpisodeVideoManagement)))
                        return;
                    __VLS_ctx.showEpisodeManagement = false;
                }
            };
            let __VLS_227;
            let __VLS_228;
            const __VLS_232 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
            /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
            // @ts-ignore
            const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({}));
            const __VLS_234 = __VLS_233({}, ...__VLS_functionalComponentArgsRest(__VLS_233));
            const __VLS_238 = __VLS_resolvedLocalAndGlobalComponents.ArrowLeft;
            /** @type { [typeof __VLS_components.ArrowLeft, ] } */
            // @ts-ignore
            const __VLS_239 = __VLS_asFunctionalComponent(__VLS_238, new __VLS_238({}));
            const __VLS_240 = __VLS_239({}, ...__VLS_functionalComponentArgsRest(__VLS_239));
            __VLS_nonNullable(__VLS_237.slots).default;
            var __VLS_237;
            __VLS_nonNullable(__VLS_229.slots).default;
            var __VLS_229;
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("ml-4 font-bold") }, });
            (__VLS_ctx.currentCourse.title);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex items-center") }, });
            const __VLS_244 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({ ...{ 'onClick': {} }, type: ("primary"), }));
            const __VLS_246 = __VLS_245({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_245));
            let __VLS_250;
            const __VLS_251 = {
                onClick: (__VLS_ctx.handleAddEpisode)
            };
            let __VLS_247;
            let __VLS_248;
            __VLS_nonNullable(__VLS_249.slots).default;
            var __VLS_249;
        }
        const __VLS_252 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
        /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
        // @ts-ignore
        const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({ data: ((__VLS_ctx.episodeData)), border: (true), }));
        const __VLS_254 = __VLS_253({ data: ((__VLS_ctx.episodeData)), border: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_253));
        __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.episodeLoading) }, null, null);
        const __VLS_258 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_259 = __VLS_asFunctionalComponent(__VLS_258, new __VLS_258({ type: ("index"), label: ("序号"), width: ("60"), }));
        const __VLS_260 = __VLS_259({ type: ("index"), label: ("序号"), width: ("60"), }, ...__VLS_functionalComponentArgsRest(__VLS_259));
        const __VLS_264 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({ prop: ("title"), label: ("章节名称"), minWidth: ("200"), }));
        const __VLS_266 = __VLS_265({ prop: ("title"), label: ("章节名称"), minWidth: ("200"), }, ...__VLS_functionalComponentArgsRest(__VLS_265));
        const __VLS_270 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_271 = __VLS_asFunctionalComponent(__VLS_270, new __VLS_270({ prop: ("videoUrl"), label: ("视频地址"), minWidth: ("250"), showOverflowTooltip: (true), }));
        const __VLS_272 = __VLS_271({ prop: ("videoUrl"), label: ("视频地址"), minWidth: ("250"), showOverflowTooltip: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_271));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_275.slots);
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            if (row.videoUrl) {
                const __VLS_276 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({ type: ("success"), size: ("small"), }));
                const __VLS_278 = __VLS_277({ type: ("success"), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_277));
                __VLS_nonNullable(__VLS_281.slots).default;
                var __VLS_281;
            }
            else {
                const __VLS_282 = __VLS_resolvedLocalAndGlobalComponents.ElTag;
                /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */
                // @ts-ignore
                const __VLS_283 = __VLS_asFunctionalComponent(__VLS_282, new __VLS_282({ type: ("info"), size: ("small"), }));
                const __VLS_284 = __VLS_283({ type: ("info"), size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_283));
                __VLS_nonNullable(__VLS_287.slots).default;
                var __VLS_287;
            }
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("ml-2 text-xs text-gray-400") }, });
            (row.videoUrl);
        }
        var __VLS_275;
        const __VLS_288 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_289 = __VLS_asFunctionalComponent(__VLS_288, new __VLS_288({ prop: ("sortOrder"), label: ("排序"), width: ("80"), }));
        const __VLS_290 = __VLS_289({ prop: ("sortOrder"), label: ("排序"), width: ("80"), }, ...__VLS_functionalComponentArgsRest(__VLS_289));
        const __VLS_294 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_295 = __VLS_asFunctionalComponent(__VLS_294, new __VLS_294({ label: ("操作"), width: ("180"), fixed: ("right"), }));
        const __VLS_296 = __VLS_295({ label: ("操作"), width: ("180"), fixed: ("right"), }, ...__VLS_functionalComponentArgsRest(__VLS_295));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_299.slots);
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_300 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_301 = __VLS_asFunctionalComponent(__VLS_300, new __VLS_300({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }));
            const __VLS_302 = __VLS_301({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_301));
            let __VLS_306;
            const __VLS_307 = {
                onClick: (...[$event]) => {
                    if (!(!((!__VLS_ctx.showDetail && !__VLS_ctx.showEpisodeManagement))))
                        return;
                    if (!(!((__VLS_ctx.showDetail && !__VLS_ctx.showEpisodeManagement))))
                        return;
                    if (!((__VLS_ctx.showEpisodeManagement && !__VLS_ctx.showEpisodeVideoManagement)))
                        return;
                    __VLS_ctx.enterEpisodeVideoManagement(row);
                }
            };
            let __VLS_303;
            let __VLS_304;
            __VLS_nonNullable(__VLS_305.slots).default;
            var __VLS_305;
            const __VLS_308 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_309 = __VLS_asFunctionalComponent(__VLS_308, new __VLS_308({ ...{ 'onClick': {} }, link: (true), type: ("danger"), }));
            const __VLS_310 = __VLS_309({ ...{ 'onClick': {} }, link: (true), type: ("danger"), }, ...__VLS_functionalComponentArgsRest(__VLS_309));
            let __VLS_314;
            const __VLS_315 = {
                onClick: (...[$event]) => {
                    if (!(!((!__VLS_ctx.showDetail && !__VLS_ctx.showEpisodeManagement))))
                        return;
                    if (!(!((__VLS_ctx.showDetail && !__VLS_ctx.showEpisodeManagement))))
                        return;
                    if (!((__VLS_ctx.showEpisodeManagement && !__VLS_ctx.showEpisodeVideoManagement)))
                        return;
                    __VLS_ctx.handleDeleteEpisode(row);
                }
            };
            let __VLS_311;
            let __VLS_312;
            __VLS_nonNullable(__VLS_313.slots).default;
            var __VLS_313;
        }
        var __VLS_299;
        __VLS_nonNullable(__VLS_257.slots).default;
        var __VLS_257;
        var __VLS_223;
    }
    else if (__VLS_ctx.showEpisodeVideoManagement) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_316 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */
        // @ts-ignore
        const __VLS_317 = __VLS_asFunctionalComponent(__VLS_316, new __VLS_316({ shadow: ("never"), }));
        const __VLS_318 = __VLS_317({ shadow: ("never"), }, ...__VLS_functionalComponentArgsRest(__VLS_317));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { header: __VLS_thisSlot } = __VLS_nonNullable(__VLS_321.slots);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex justify-between items-center") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex items-center") }, });
            const __VLS_322 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_323 = __VLS_asFunctionalComponent(__VLS_322, new __VLS_322({ ...{ 'onClick': {} }, link: (true), }));
            const __VLS_324 = __VLS_323({ ...{ 'onClick': {} }, link: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_323));
            let __VLS_328;
            const __VLS_329 = {
                onClick: (...[$event]) => {
                    if (!(!((!__VLS_ctx.showDetail && !__VLS_ctx.showEpisodeManagement))))
                        return;
                    if (!(!((__VLS_ctx.showDetail && !__VLS_ctx.showEpisodeManagement))))
                        return;
                    if (!(!((__VLS_ctx.showEpisodeManagement && !__VLS_ctx.showEpisodeVideoManagement))))
                        return;
                    if (!((__VLS_ctx.showEpisodeVideoManagement)))
                        return;
                    __VLS_ctx.showEpisodeVideoManagement = false;
                }
            };
            let __VLS_325;
            let __VLS_326;
            const __VLS_330 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
            /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
            // @ts-ignore
            const __VLS_331 = __VLS_asFunctionalComponent(__VLS_330, new __VLS_330({}));
            const __VLS_332 = __VLS_331({}, ...__VLS_functionalComponentArgsRest(__VLS_331));
            const __VLS_336 = __VLS_resolvedLocalAndGlobalComponents.ArrowLeft;
            /** @type { [typeof __VLS_components.ArrowLeft, ] } */
            // @ts-ignore
            const __VLS_337 = __VLS_asFunctionalComponent(__VLS_336, new __VLS_336({}));
            const __VLS_338 = __VLS_337({}, ...__VLS_functionalComponentArgsRest(__VLS_337));
            __VLS_nonNullable(__VLS_335.slots).default;
            var __VLS_335;
            __VLS_nonNullable(__VLS_327.slots).default;
            var __VLS_327;
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("ml-4 font-bold") }, });
            (__VLS_ctx.currentEpisode.title);
            const __VLS_342 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_343 = __VLS_asFunctionalComponent(__VLS_342, new __VLS_342({ ...{ 'onClick': {} }, type: ("primary"), }));
            const __VLS_344 = __VLS_343({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_343));
            let __VLS_348;
            const __VLS_349 = {
                onClick: (__VLS_ctx.handleAddVideo)
            };
            let __VLS_345;
            let __VLS_346;
            __VLS_nonNullable(__VLS_347.slots).default;
            var __VLS_347;
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("mb-6 bg-gray-50 p-4 rounded border") }, });
        const __VLS_350 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
        /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */
        // @ts-ignore
        const __VLS_351 = __VLS_asFunctionalComponent(__VLS_350, new __VLS_350({ model: ((__VLS_ctx.currentEpisode)), inline: (true), }));
        const __VLS_352 = __VLS_351({ model: ((__VLS_ctx.currentEpisode)), inline: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_351));
        const __VLS_356 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
        // @ts-ignore
        const __VLS_357 = __VLS_asFunctionalComponent(__VLS_356, new __VLS_356({ label: ("章节名称"), }));
        const __VLS_358 = __VLS_357({ label: ("章节名称"), }, ...__VLS_functionalComponentArgsRest(__VLS_357));
        const __VLS_362 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
        // @ts-ignore
        const __VLS_363 = __VLS_asFunctionalComponent(__VLS_362, new __VLS_362({ modelValue: ((__VLS_ctx.currentEpisode.title)), }));
        const __VLS_364 = __VLS_363({ modelValue: ((__VLS_ctx.currentEpisode.title)), }, ...__VLS_functionalComponentArgsRest(__VLS_363));
        __VLS_nonNullable(__VLS_361.slots).default;
        var __VLS_361;
        const __VLS_368 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
        // @ts-ignore
        const __VLS_369 = __VLS_asFunctionalComponent(__VLS_368, new __VLS_368({ label: ("章节排序"), }));
        const __VLS_370 = __VLS_369({ label: ("章节排序"), }, ...__VLS_functionalComponentArgsRest(__VLS_369));
        const __VLS_374 = __VLS_resolvedLocalAndGlobalComponents.ElInputNumber;
        /** @type { [typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ] } */
        // @ts-ignore
        const __VLS_375 = __VLS_asFunctionalComponent(__VLS_374, new __VLS_374({ modelValue: ((__VLS_ctx.currentEpisode.sortOrder)), min: ((0)), }));
        const __VLS_376 = __VLS_375({ modelValue: ((__VLS_ctx.currentEpisode.sortOrder)), min: ((0)), }, ...__VLS_functionalComponentArgsRest(__VLS_375));
        __VLS_nonNullable(__VLS_373.slots).default;
        var __VLS_373;
        const __VLS_380 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
        // @ts-ignore
        const __VLS_381 = __VLS_asFunctionalComponent(__VLS_380, new __VLS_380({}));
        const __VLS_382 = __VLS_381({}, ...__VLS_functionalComponentArgsRest(__VLS_381));
        const __VLS_386 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_387 = __VLS_asFunctionalComponent(__VLS_386, new __VLS_386({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_388 = __VLS_387({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_387));
        let __VLS_392;
        const __VLS_393 = {
            onClick: (__VLS_ctx.handleEpisodeVideoSuccess)
        };
        let __VLS_389;
        let __VLS_390;
        __VLS_nonNullable(__VLS_391.slots).default;
        var __VLS_391;
        __VLS_nonNullable(__VLS_385.slots).default;
        var __VLS_385;
        __VLS_nonNullable(__VLS_355.slots).default;
        var __VLS_355;
        const __VLS_394 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
        /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */
        // @ts-ignore
        const __VLS_395 = __VLS_asFunctionalComponent(__VLS_394, new __VLS_394({ data: ((__VLS_ctx.videoData)), border: (true), }));
        const __VLS_396 = __VLS_395({ data: ((__VLS_ctx.videoData)), border: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_395));
        __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.videoLoading) }, null, null);
        const __VLS_400 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_401 = __VLS_asFunctionalComponent(__VLS_400, new __VLS_400({ type: ("index"), label: ("序号"), width: ("60"), }));
        const __VLS_402 = __VLS_401({ type: ("index"), label: ("序号"), width: ("60"), }, ...__VLS_functionalComponentArgsRest(__VLS_401));
        const __VLS_406 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_407 = __VLS_asFunctionalComponent(__VLS_406, new __VLS_406({ prop: ("title"), label: ("视频名称"), minWidth: ("200"), }));
        const __VLS_408 = __VLS_407({ prop: ("title"), label: ("视频名称"), minWidth: ("200"), }, ...__VLS_functionalComponentArgsRest(__VLS_407));
        const __VLS_412 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_413 = __VLS_asFunctionalComponent(__VLS_412, new __VLS_412({ prop: ("videoUrl"), label: ("视频地址"), minWidth: ("300"), showOverflowTooltip: (true), }));
        const __VLS_414 = __VLS_413({ prop: ("videoUrl"), label: ("视频地址"), minWidth: ("300"), showOverflowTooltip: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_413));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_417.slots);
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("flex items-center") }, });
            const __VLS_418 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
            /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
            // @ts-ignore
            const __VLS_419 = __VLS_asFunctionalComponent(__VLS_418, new __VLS_418({ ...{ class: ("text-green-500 mr-1") }, }));
            const __VLS_420 = __VLS_419({ ...{ class: ("text-green-500 mr-1") }, }, ...__VLS_functionalComponentArgsRest(__VLS_419));
            const __VLS_424 = __VLS_resolvedLocalAndGlobalComponents.VideoPlay;
            /** @type { [typeof __VLS_components.VideoPlay, ] } */
            // @ts-ignore
            const __VLS_425 = __VLS_asFunctionalComponent(__VLS_424, new __VLS_424({}));
            const __VLS_426 = __VLS_425({}, ...__VLS_functionalComponentArgsRest(__VLS_425));
            __VLS_nonNullable(__VLS_423.slots).default;
            var __VLS_423;
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-xs text-gray-500") }, });
            (row.videoUrl);
        }
        var __VLS_417;
        const __VLS_430 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_431 = __VLS_asFunctionalComponent(__VLS_430, new __VLS_430({ prop: ("sortOrder"), label: ("排序"), width: ("80"), }));
        const __VLS_432 = __VLS_431({ prop: ("sortOrder"), label: ("排序"), width: ("80"), }, ...__VLS_functionalComponentArgsRest(__VLS_431));
        const __VLS_436 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */
        // @ts-ignore
        const __VLS_437 = __VLS_asFunctionalComponent(__VLS_436, new __VLS_436({ label: ("操作"), width: ("150"), fixed: ("right"), }));
        const __VLS_438 = __VLS_437({ label: ("操作"), width: ("150"), fixed: ("right"), }, ...__VLS_functionalComponentArgsRest(__VLS_437));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_441.slots);
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_442 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_443 = __VLS_asFunctionalComponent(__VLS_442, new __VLS_442({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }));
            const __VLS_444 = __VLS_443({ ...{ 'onClick': {} }, link: (true), type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_443));
            let __VLS_448;
            const __VLS_449 = {
                onClick: (...[$event]) => {
                    if (!(!((!__VLS_ctx.showDetail && !__VLS_ctx.showEpisodeManagement))))
                        return;
                    if (!(!((__VLS_ctx.showDetail && !__VLS_ctx.showEpisodeManagement))))
                        return;
                    if (!(!((__VLS_ctx.showEpisodeManagement && !__VLS_ctx.showEpisodeVideoManagement))))
                        return;
                    if (!((__VLS_ctx.showEpisodeVideoManagement)))
                        return;
                    __VLS_ctx.handleEditVideo(row);
                }
            };
            let __VLS_445;
            let __VLS_446;
            __VLS_nonNullable(__VLS_447.slots).default;
            var __VLS_447;
            const __VLS_450 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_451 = __VLS_asFunctionalComponent(__VLS_450, new __VLS_450({ ...{ 'onClick': {} }, link: (true), type: ("danger"), }));
            const __VLS_452 = __VLS_451({ ...{ 'onClick': {} }, link: (true), type: ("danger"), }, ...__VLS_functionalComponentArgsRest(__VLS_451));
            let __VLS_456;
            const __VLS_457 = {
                onClick: (...[$event]) => {
                    if (!(!((!__VLS_ctx.showDetail && !__VLS_ctx.showEpisodeManagement))))
                        return;
                    if (!(!((__VLS_ctx.showDetail && !__VLS_ctx.showEpisodeManagement))))
                        return;
                    if (!(!((__VLS_ctx.showEpisodeManagement && !__VLS_ctx.showEpisodeVideoManagement))))
                        return;
                    if (!((__VLS_ctx.showEpisodeVideoManagement)))
                        return;
                    __VLS_ctx.handleDeleteVideo(row);
                }
            };
            let __VLS_453;
            let __VLS_454;
            __VLS_nonNullable(__VLS_455.slots).default;
            var __VLS_455;
        }
        var __VLS_441;
        __VLS_nonNullable(__VLS_399.slots).default;
        var __VLS_399;
        var __VLS_321;
    }
    // @ts-ignore
    [CourseDialog,];
    // @ts-ignore
    const __VLS_458 = __VLS_asFunctionalComponent(CourseDialog, new CourseDialog({ ...{ 'onSuccess': {} }, visible: ((__VLS_ctx.dialogVisible)), isEdit: ((__VLS_ctx.isEdit)), data: ((__VLS_ctx.editData)), }));
    const __VLS_459 = __VLS_458({ ...{ 'onSuccess': {} }, visible: ((__VLS_ctx.dialogVisible)), isEdit: ((__VLS_ctx.isEdit)), data: ((__VLS_ctx.editData)), }, ...__VLS_functionalComponentArgsRest(__VLS_458));
    let __VLS_463;
    const __VLS_464 = {
        onSuccess: (__VLS_ctx.handleSuccess)
    };
    let __VLS_460;
    let __VLS_461;
    var __VLS_462;
    // @ts-ignore
    [EpisodeDialog,];
    // @ts-ignore
    const __VLS_465 = __VLS_asFunctionalComponent(EpisodeDialog, new EpisodeDialog({ ...{ 'onSuccess': {} }, visible: ((__VLS_ctx.episodeDialogVisible)), isEdit: ((__VLS_ctx.isEpisodeEdit)), data: ((__VLS_ctx.episodeEditData)), courseId: ((__VLS_ctx.currentCourse?.id)), }));
    const __VLS_466 = __VLS_465({ ...{ 'onSuccess': {} }, visible: ((__VLS_ctx.episodeDialogVisible)), isEdit: ((__VLS_ctx.isEpisodeEdit)), data: ((__VLS_ctx.episodeEditData)), courseId: ((__VLS_ctx.currentCourse?.id)), }, ...__VLS_functionalComponentArgsRest(__VLS_465));
    let __VLS_470;
    const __VLS_471 = {
        onSuccess: (__VLS_ctx.handleEpisodeSuccess)
    };
    let __VLS_467;
    let __VLS_468;
    var __VLS_469;
    // @ts-ignore
    [VideoDialog,];
    // @ts-ignore
    const __VLS_472 = __VLS_asFunctionalComponent(VideoDialog, new VideoDialog({ ...{ 'onSuccess': {} }, visible: ((__VLS_ctx.videoDialogVisible)), isEdit: ((__VLS_ctx.isVideoEdit)), data: ((__VLS_ctx.videoEditData)), episodeId: ((__VLS_ctx.currentEpisode?.id)), }));
    const __VLS_473 = __VLS_472({ ...{ 'onSuccess': {} }, visible: ((__VLS_ctx.videoDialogVisible)), isEdit: ((__VLS_ctx.isVideoEdit)), data: ((__VLS_ctx.videoEditData)), episodeId: ((__VLS_ctx.currentEpisode?.id)), }, ...__VLS_functionalComponentArgsRest(__VLS_472));
    let __VLS_477;
    const __VLS_478 = {
        onSuccess: (__VLS_ctx.handleVideoSuccess)
    };
    let __VLS_474;
    let __VLS_475;
    var __VLS_476;
    __VLS_styleScopedClasses['page-container'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['ml-4'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['w-20'];
    __VLS_styleScopedClasses['h-12'];
    __VLS_styleScopedClasses['rounded'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['ml-4'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['ml-2'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-gray-400'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['justify-between'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['ml-4'];
    __VLS_styleScopedClasses['font-bold'];
    __VLS_styleScopedClasses['mb-6'];
    __VLS_styleScopedClasses['bg-gray-50'];
    __VLS_styleScopedClasses['p-4'];
    __VLS_styleScopedClasses['rounded'];
    __VLS_styleScopedClasses['border'];
    __VLS_styleScopedClasses['flex'];
    __VLS_styleScopedClasses['items-center'];
    __VLS_styleScopedClasses['text-green-500'];
    __VLS_styleScopedClasses['mr-1'];
    __VLS_styleScopedClasses['text-xs'];
    __VLS_styleScopedClasses['text-gray-500'];
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
            CourseDialog: CourseDialog,
            EpisodeDialog: EpisodeDialog,
            VideoDialog: VideoDialog,
            ArrowLeft: ArrowLeft,
            VideoPlay: VideoPlay,
            loading: loading,
            tableData: tableData,
            dialogVisible: dialogVisible,
            isEdit: isEdit,
            editData: editData,
            showDetail: showDetail,
            currentCategory: currentCategory,
            categoryData: categoryData,
            showEpisodeManagement: showEpisodeManagement,
            showEpisodeVideoManagement: showEpisodeVideoManagement,
            episodeLoading: episodeLoading,
            currentCourse: currentCourse,
            currentEpisode: currentEpisode,
            episodeData: episodeData,
            episodeDialogVisible: episodeDialogVisible,
            isEpisodeEdit: isEpisodeEdit,
            episodeEditData: episodeEditData,
            videoLoading: videoLoading,
            videoData: videoData,
            videoDialogVisible: videoDialogVisible,
            isVideoEdit: isVideoEdit,
            videoEditData: videoEditData,
            enterEpisodeVideoManagement: enterEpisodeVideoManagement,
            handleAddVideo: handleAddVideo,
            handleEditVideo: handleEditVideo,
            handleVideoSuccess: handleVideoSuccess,
            handleDeleteVideo: handleDeleteVideo,
            handleEpisodeVideoSuccess: handleEpisodeVideoSuccess,
            enterCategory: enterCategory,
            enterCourseManagement: enterCourseManagement,
            handleAddEpisode: handleAddEpisode,
            handleEpisodeSuccess: handleEpisodeSuccess,
            handleDeleteEpisode: handleDeleteEpisode,
            handleAdd: handleAdd,
            handleEdit: handleEdit,
            handleSuccess: handleSuccess,
            handleDelete: handleDelete,
            handleStatus: handleStatus,
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