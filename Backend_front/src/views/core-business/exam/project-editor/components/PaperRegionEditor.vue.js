import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { ArrowDown, InfoFilled, Tools } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { normalizeQuestionNo } from '@/utils/exam-utils';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const MIN_REGION_SIZE = 0.01;
const resizeDirections = ['nw', 'ne', 'sw', 'se'];
const props = withDefaults(defineProps(), {
    regions: () => [],
    readonly: false,
    subjectName: '',
    showSave: true,
    hideToolbar: false
});
const emit = defineEmits();
const viewportRef = ref();
const stageRef = ref();
const imageRef = ref();
const tool = ref(resolveInitialTool(props.initialTool, props.readonly));
const imageLoaded = ref(false);
const localRegions = ref([]);
const draftRegion = ref(null);
const selectedRegionId = ref('');
const suppressClickRegionId = ref('');
const regionDialogVisible = ref(false);
const editingRegionId = ref('');
const regionForm = reactive({
    questionNo: '',
    questionType: '',
    knowledgePoint: '',
    score: null,
    remark: ''
});
const interaction = reactive({
    mode: null,
    startX: 0,
    startY: 0,
    startClientX: 0,
    startClientY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
    moved: false,
    regionId: '',
    resizeDirection: '',
    startRegion: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    }
});
const view = reactive({
    scale: 1,
    minScale: 0.2,
    maxScale: 4,
    offsetX: 0,
    offsetY: 0,
    imageWidth: 0,
    imageHeight: 0,
    hasManualViewport: false
});
const selectedRegion = computed(() => localRegions.value.find((item) => item.id === selectedRegionId.value) || null);
const showSaveAction = computed(() => !props.readonly && props.showSave);
const scaleText = computed(() => `${Math.round(view.scale * 100)}%`);
const currentToolText = computed(() => {
    if (tool.value === 'draw')
        return '当前工具: 框选框';
    if (tool.value === 'adjust')
        return '当前工具: 调整框选';
    if (tool.value === 'pan')
        return '当前工具: 移动画布';
    return '当前工具: 选择题目';
});
const currentHintText = computed(() => {
    if (props.readonly) {
        return '当前为只读预览，可切换移动或选择模式查看框选结果，也可在工具箱里放大、缩小和平移试卷。';
    }
    if (tool.value === 'draw') {
        return '按住鼠标拖拽即可创建框选区域，松开后会自动弹出题目属性设置。';
    }
    if (tool.value === 'adjust') {
        return '选中框选后可直接拖动位置，拖拽四角圆点即可调整大小。';
    }
    if (tool.value === 'pan') {
        return '按住鼠标即可拖动画布，也支持鼠标滚轮缩放，方便查看试卷细节。';
    }
    return '点击已有框选可编辑题目属性，也可以先选中再通过工具箱删除。';
});
const stageStyle = computed(() => ({
    width: view.imageWidth ? `${view.imageWidth}px` : 'auto',
    transform: `translate(${view.offsetX}px, ${view.offsetY}px) scale(${view.scale})`,
    transformOrigin: 'top left'
}));
const __VLS_exposed = {
    tool,
    scale: computed(() => view.scale),
    handleToolboxCommand,
    save: () => emit('save', cloneRegions(localRegions.value)),
    selectedRegion,
    currentHintText,
    currentToolText
};
defineExpose({
    tool,
    scale: computed(() => view.scale),
    handleToolboxCommand,
    save: () => emit('save', cloneRegions(localRegions.value)),
    selectedRegion,
    currentHintText,
    currentToolText
});
watch(() => props.regions, (regions) => {
    localRegions.value = cloneRegions(regions || []);
    if (!localRegions.value.some((item) => item.id === selectedRegionId.value)) {
        selectedRegionId.value = localRegions.value[0]?.id || '';
    }
}, { immediate: true, deep: true });
watch(() => props.readonly, (readonly) => {
    if (readonly && (tool.value === 'draw' || tool.value === 'adjust')) {
        tool.value = resolveInitialTool(props.initialTool, readonly);
    }
}, { immediate: true });
watch(() => props.imageUrl, () => {
    imageLoaded.value = false;
    view.imageWidth = 0;
    view.imageHeight = 0;
    view.scale = 1;
    view.offsetX = 0;
    view.offsetY = 0;
    view.hasManualViewport = false;
    draftRegion.value = null;
});
onMounted(() => {
    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    window.addEventListener('resize', handleWindowResize);
});
onUnmounted(() => {
    window.removeEventListener('mousemove', handleWindowMouseMove);
    window.removeEventListener('mouseup', handleWindowMouseUp);
    window.removeEventListener('resize', handleWindowResize);
});
function cloneRegions(regions) {
    return (regions || []).map((item, index) => ({
        id: item.id || createRegionId(),
        questionNo: normalizeQuestionNo(item.questionNo, item.sortOrder ?? index + 1),
        questionType: item.questionType || '',
        knowledgePoint: item.knowledgePoint || '',
        score: item.score ?? null,
        remark: item.remark || '',
        sortOrder: item.sortOrder ?? index + 1,
        x: clampUnit(item.x),
        y: clampUnit(item.y),
        width: clampUnit(item.width),
        height: clampUnit(item.height)
    }));
}
function createRegionId() {
    return `region_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function resolveInitialTool(initialTool, readonly = false) {
    if (readonly) {
        return initialTool === 'pan' ? 'pan' : 'select';
    }
    if (initialTool && ['draw', 'adjust', 'pan', 'select'].includes(initialTool)) {
        return initialTool;
    }
    return 'draw';
}
function clampUnit(value) {
    const num = Number(value || 0);
    if (Number.isNaN(num))
        return 0;
    return Math.max(0, Math.min(1, Number(num.toFixed(6))));
}
function emitRegions() {
    emit('update:regions', cloneRegions(localRegions.value));
}
function regionStyle(region) {
    return {
        left: `${region.x * 100}%`,
        top: `${region.y * 100}%`,
        width: `${region.width * 100}%`,
        height: `${region.height * 100}%`
    };
}
function regionLabel(region) {
    const prefix = region.questionNo || '未标记';
    return region.knowledgePoint ? `${prefix} | ${region.knowledgePoint}` : prefix;
}
function nextQuestionIndex() {
    const values = localRegions.value
        .map((item, index) => {
        const normalized = normalizeQuestionNo(item.questionNo, item.sortOrder ?? index + 1);
        const matched = normalized.match(/\d+/);
        return matched ? Number(matched[0]) : 0;
    })
        .filter((value) => value > 0);
    return (values.length ? Math.max(...values) : 0) + 1;
}
function getRelativePoint(event) {
    const rect = stageRef.value?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0)
        return null;
    const x = clampUnit((event.clientX - rect.left) / rect.width);
    const y = clampUnit((event.clientY - rect.top) / rect.height);
    return { x, y };
}
function handleImageLoad() {
    const img = imageRef.value;
    if (!img)
        return;
    view.imageWidth = img.naturalWidth || img.width;
    view.imageHeight = img.naturalHeight || img.height;
    imageLoaded.value = true;
    nextTick(() => fitView(false));
}
function handleWindowResize() {
    if (!imageLoaded.value)
        return;
    if (view.hasManualViewport) {
        normalizeOffsets();
        return;
    }
    fitView(false);
}
function fitView(markManual = true) {
    if (!viewportRef.value || !view.imageWidth || !view.imageHeight)
        return;
    const viewportWidth = viewportRef.value.clientWidth;
    const viewportHeight = viewportRef.value.clientHeight;
    if (!viewportWidth || !viewportHeight)
        return;
    const padding = 56;
    const usableWidth = Math.max(viewportWidth - padding * 2, 240);
    const usableHeight = Math.max(viewportHeight - padding * 2, 240);
    const fitScale = Math.min(usableWidth / view.imageWidth, usableHeight / view.imageHeight);
    const nextScale = clampScale(fitScale);
    view.scale = nextScale;
    updateScaleBounds();
    centerView();
    view.hasManualViewport = markManual;
}
function resetView() {
    if (!viewportRef.value || !view.imageWidth || !view.imageHeight)
        return;
    view.scale = clampScale(1);
    updateScaleBounds();
    centerView();
    view.hasManualViewport = true;
}
function centerView() {
    if (!viewportRef.value)
        return;
    const viewportWidth = viewportRef.value.clientWidth;
    const viewportHeight = viewportRef.value.clientHeight;
    const scaledWidth = view.imageWidth * view.scale;
    const scaledHeight = view.imageHeight * view.scale;
    view.offsetX = (viewportWidth - scaledWidth) / 2;
    view.offsetY = (viewportHeight - scaledHeight) / 2;
    normalizeOffsets();
}
function updateScaleBounds() {
    const fitScale = viewportRef.value && view.imageWidth && view.imageHeight
        ? Math.min(Math.max((viewportRef.value.clientWidth - 112) / view.imageWidth, 0.2), Math.max((viewportRef.value.clientHeight - 112) / view.imageHeight, 0.2))
        : 0.2;
    view.minScale = Math.max(0.15, Math.min(fitScale * 0.45, 1));
    view.maxScale = Math.max(3.5, fitScale * 3.2);
}
function clampScale(value) {
    updateScaleBounds();
    return Math.min(view.maxScale, Math.max(view.minScale, Number(value.toFixed(3))));
}
function setScale(nextScale, anchor) {
    if (!viewportRef.value || !view.imageWidth || !view.imageHeight)
        return;
    const clampedScale = clampScale(nextScale);
    const viewportRect = viewportRef.value.getBoundingClientRect();
    const point = anchor || {
        x: viewportRect.width / 2,
        y: viewportRect.height / 2
    };
    const contentX = (point.x - view.offsetX) / view.scale;
    const contentY = (point.y - view.offsetY) / view.scale;
    view.scale = clampedScale;
    view.offsetX = point.x - contentX * view.scale;
    view.offsetY = point.y - contentY * view.scale;
    view.hasManualViewport = true;
    normalizeOffsets();
}
function normalizeOffsets() {
    if (!viewportRef.value || !view.imageWidth || !view.imageHeight)
        return;
    const viewportWidth = viewportRef.value.clientWidth;
    const viewportHeight = viewportRef.value.clientHeight;
    const scaledWidth = view.imageWidth * view.scale;
    const scaledHeight = view.imageHeight * view.scale;
    const padding = 72;
    if (scaledWidth <= viewportWidth - padding * 2) {
        view.offsetX = (viewportWidth - scaledWidth) / 2;
    }
    else {
        const minX = viewportWidth - scaledWidth - padding;
        const maxX = padding;
        view.offsetX = Math.min(maxX, Math.max(minX, view.offsetX));
    }
    if (scaledHeight <= viewportHeight - padding * 2) {
        view.offsetY = (viewportHeight - scaledHeight) / 2;
    }
    else {
        const minY = viewportHeight - scaledHeight - padding;
        const maxY = padding;
        view.offsetY = Math.min(maxY, Math.max(minY, view.offsetY));
    }
}
function nudgeViewport(dx, dy) {
    view.offsetX += dx;
    view.offsetY += dy;
    view.hasManualViewport = true;
    normalizeOffsets();
}
function handleWheelZoom(event) {
    if (!imageLoaded.value || !viewportRef.value)
        return;
    const rect = viewportRef.value.getBoundingClientRect();
    const anchor = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
    const factor = event.deltaY < 0 ? 1.12 : 0.9;
    setScale(view.scale * factor, anchor);
}
function handleToolboxCommand(command) {
    if (command === 'addRegion' || command === 'drawMode') {
        if (props.readonly)
            return;
        tool.value = 'draw';
        return;
    }
    if (command === 'adjustMode') {
        if (props.readonly)
            return;
        tool.value = 'adjust';
        return;
    }
    if (command === 'panMode') {
        tool.value = 'pan';
        return;
    }
    if (command === 'selectMode') {
        tool.value = 'select';
        return;
    }
    if (command === 'modifyRegion') {
        if (props.readonly)
            return;
        tool.value = 'adjust';
        if (selectedRegion.value) {
            return;
        }
        else {
            ElMessage.info('请先点击一个已有框选框，再进行调整');
        }
        return;
    }
    if (command === 'editRegion') {
        if (!selectedRegion.value || props.readonly) {
            ElMessage.warning('请先选择一个框选区域');
            return;
        }
        openSelectedRegionDialog();
        return;
    }
    if (command === 'deleteRegion') {
        if (!selectedRegion.value || props.readonly) {
            ElMessage.warning('请先选择一个框选区域');
            return;
        }
        deleteSelectedRegion();
        return;
    }
    if (command === 'zoomIn') {
        setScale(view.scale * 1.12);
        return;
    }
    if (command === 'zoomOut') {
        setScale(view.scale * 0.9);
        return;
    }
    if (command === 'fitView') {
        fitView(true);
        return;
    }
    if (command === 'resetView') {
        resetView();
        return;
    }
    if (command === 'moveUp') {
        nudgeViewport(0, -60);
        return;
    }
    if (command === 'moveDown') {
        nudgeViewport(0, 60);
        return;
    }
    if (command === 'moveLeft') {
        nudgeViewport(-60, 0);
        return;
    }
    if (command === 'moveRight') {
        nudgeViewport(60, 0);
    }
}
function handleStageMouseDown(event) {
    if (!imageLoaded.value || !viewportRef.value)
        return;
    if (tool.value === 'pan') {
        interaction.mode = 'pan';
        interaction.startClientX = event.clientX;
        interaction.startClientY = event.clientY;
        interaction.startOffsetX = view.offsetX;
        interaction.startOffsetY = view.offsetY;
        interaction.moved = false;
        event.preventDefault();
        return;
    }
    if (props.readonly || tool.value !== 'draw')
        return;
    if (event.target.closest('.region-box'))
        return;
    if (stageRef.value &&
        !(event.target instanceof Node && stageRef.value.contains(event.target))) {
        return;
    }
    const point = getRelativePoint(event);
    if (!point)
        return;
    interaction.mode = 'draw';
    interaction.startX = point.x;
    interaction.startY = point.y;
    interaction.moved = false;
    draftRegion.value = {
        id: createRegionId(),
        questionNo: '',
        questionType: '',
        knowledgePoint: '',
        score: null,
        remark: '',
        sortOrder: localRegions.value.length + 1,
        x: point.x,
        y: point.y,
        width: 0,
        height: 0
    };
    event.preventDefault();
}
function handleRegionMouseDown(region, event) {
    selectedRegionId.value = region.id;
    if (props.readonly || tool.value !== 'adjust')
        return;
    const point = getRelativePoint(event);
    if (!point)
        return;
    interaction.mode = 'move';
    interaction.regionId = region.id;
    interaction.startX = point.x;
    interaction.startY = point.y;
    interaction.startClientX = event.clientX;
    interaction.startClientY = event.clientY;
    interaction.moved = false;
    interaction.startRegion = {
        x: region.x,
        y: region.y,
        width: region.width,
        height: region.height
    };
    event.preventDefault();
}
function handleResizeHandleMouseDown(region, direction, event) {
    if (props.readonly || tool.value !== 'adjust')
        return;
    const point = getRelativePoint(event);
    if (!point)
        return;
    selectedRegionId.value = region.id;
    interaction.mode = 'resize';
    interaction.regionId = region.id;
    interaction.resizeDirection = direction;
    interaction.startX = point.x;
    interaction.startY = point.y;
    interaction.startClientX = event.clientX;
    interaction.startClientY = event.clientY;
    interaction.moved = false;
    interaction.startRegion = {
        x: region.x,
        y: region.y,
        width: region.width,
        height: region.height
    };
}
function handleRegionClick(region) {
    selectedRegionId.value = region.id;
    if (props.readonly || tool.value !== 'select')
        return;
    if (suppressClickRegionId.value === region.id) {
        suppressClickRegionId.value = '';
        return;
    }
    openRegionDialog(region);
}
function handleWindowMouseMove(event) {
    if (!interaction.mode)
        return;
    if (interaction.mode === 'pan') {
        interaction.moved = true;
        view.offsetX = interaction.startOffsetX + (event.clientX - interaction.startClientX);
        view.offsetY = interaction.startOffsetY + (event.clientY - interaction.startClientY);
        view.hasManualViewport = true;
        normalizeOffsets();
        return;
    }
    const point = getRelativePoint(event);
    if (!point)
        return;
    if (interaction.mode === 'draw' && draftRegion.value) {
        interaction.moved = true;
        const x = Math.min(interaction.startX, point.x);
        const y = Math.min(interaction.startY, point.y);
        const width = Math.abs(point.x - interaction.startX);
        const height = Math.abs(point.y - interaction.startY);
        draftRegion.value = {
            ...draftRegion.value,
            x,
            y,
            width: clampUnit(width),
            height: clampUnit(height)
        };
        return;
    }
    if (interaction.mode === 'move' && interaction.regionId) {
        const target = localRegions.value.find((item) => item.id === interaction.regionId);
        if (!target)
            return;
        const dx = point.x - interaction.startX;
        const dy = point.y - interaction.startY;
        if (Math.abs(event.clientX - interaction.startClientX) > 2 ||
            Math.abs(event.clientY - interaction.startClientY) > 2) {
            interaction.moved = true;
        }
        target.x = clampUnit(target.x + dx);
        target.y = clampUnit(target.y + dy);
        if (target.x + target.width > 1) {
            target.x = clampUnit(1 - target.width);
        }
        if (target.y + target.height > 1) {
            target.y = clampUnit(1 - target.height);
        }
        interaction.startX = point.x;
        interaction.startY = point.y;
        emitRegions();
        return;
    }
    if (interaction.mode === 'resize' && interaction.regionId && interaction.resizeDirection) {
        const target = localRegions.value.find((item) => item.id === interaction.regionId);
        if (!target)
            return;
        if (Math.abs(event.clientX - interaction.startClientX) > 2 ||
            Math.abs(event.clientY - interaction.startClientY) > 2) {
            interaction.moved = true;
        }
        applyResize(target, point);
        emitRegions();
    }
}
function handleWindowMouseUp() {
    if (!interaction.mode)
        return;
    if (interaction.mode === 'draw' && draftRegion.value) {
        const { width, height } = draftRegion.value;
        if (width >= 0.01 && height >= 0.01) {
            const sortOrder = localRegions.value.length + 1;
            const region = {
                ...draftRegion.value,
                questionNo: normalizeQuestionNo('', nextQuestionIndex()),
                sortOrder
            };
            localRegions.value = [...localRegions.value, region];
            selectedRegionId.value = region.id;
            emitRegions();
            nextTick(() => openRegionDialog(region));
        }
        draftRegion.value = null;
    }
    if (interaction.mode === 'move' && interaction.moved) {
        suppressClickRegionId.value = interaction.regionId;
    }
    if (interaction.mode === 'resize' && interaction.moved) {
        suppressClickRegionId.value = interaction.regionId;
    }
    interaction.mode = null;
    interaction.regionId = '';
    interaction.moved = false;
    interaction.resizeDirection = '';
}
function openRegionDialog(region) {
    editingRegionId.value = region.id;
    regionForm.questionNo = region.questionNo || '';
    regionForm.questionType = region.questionType || '';
    regionForm.knowledgePoint = region.knowledgePoint || '';
    regionForm.score = region.score ?? null;
    regionForm.remark = region.remark || '';
    regionDialogVisible.value = true;
}
function openSelectedRegionDialog() {
    if (selectedRegion.value) {
        openRegionDialog(selectedRegion.value);
    }
}
function saveRegionMeta() {
    const target = localRegions.value.find((item) => item.id === editingRegionId.value);
    if (!target) {
        regionDialogVisible.value = false;
        return;
    }
    target.questionNo = normalizeQuestionNo(regionForm.questionNo.trim(), target.sortOrder);
    target.questionType = regionForm.questionType.trim();
    target.knowledgePoint = regionForm.knowledgePoint.trim();
    target.score = regionForm.score ?? null;
    target.remark = regionForm.remark.trim();
    emitRegions();
    regionDialogVisible.value = false;
}
function deleteSelectedRegion() {
    if (!selectedRegion.value)
        return;
    localRegions.value = localRegions.value
        .filter((item) => item.id !== selectedRegion.value?.id)
        .map((item, index) => ({ ...item, sortOrder: index + 1 }));
    selectedRegionId.value = localRegions.value[0]?.id || '';
    emitRegions();
}
function applyResize(target, point) {
    const dx = point.x - interaction.startX;
    const dy = point.y - interaction.startY;
    const source = interaction.startRegion;
    let nextX = source.x;
    let nextY = source.y;
    let nextWidth = source.width;
    let nextHeight = source.height;
    if (interaction.resizeDirection.includes('w')) {
        nextX = source.x + dx;
        nextWidth = source.width - dx;
    }
    if (interaction.resizeDirection.includes('e')) {
        nextWidth = source.width + dx;
    }
    if (interaction.resizeDirection.includes('n')) {
        nextY = source.y + dy;
        nextHeight = source.height - dy;
    }
    if (interaction.resizeDirection.includes('s')) {
        nextHeight = source.height + dy;
    }
    if (nextWidth < MIN_REGION_SIZE) {
        if (interaction.resizeDirection.includes('w')) {
            nextX = source.x + source.width - MIN_REGION_SIZE;
        }
        nextWidth = MIN_REGION_SIZE;
    }
    if (nextHeight < MIN_REGION_SIZE) {
        if (interaction.resizeDirection.includes('n')) {
            nextY = source.y + source.height - MIN_REGION_SIZE;
        }
        nextHeight = MIN_REGION_SIZE;
    }
    if (nextX < 0) {
        nextWidth += nextX;
        nextX = 0;
    }
    if (nextY < 0) {
        nextHeight += nextY;
        nextY = 0;
    }
    if (nextX + nextWidth > 1) {
        nextWidth = 1 - nextX;
    }
    if (nextY + nextHeight > 1) {
        nextHeight = 1 - nextY;
    }
    target.x = clampUnit(nextX);
    target.y = clampUnit(nextY);
    target.width = clampUnit(Math.max(nextWidth, MIN_REGION_SIZE));
    target.height = clampUnit(Math.max(nextHeight, MIN_REGION_SIZE));
}
; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    regions: () => [],
    readonly: false,
    subjectName: '',
    showSave: true,
    hideToolbar: false
});
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
    __VLS_styleScopedClasses['readonly'];
    __VLS_styleScopedClasses['paper-region-editor'];
    __VLS_styleScopedClasses['editor-toolbar'];
    __VLS_styleScopedClasses['toolbar-left'];
    __VLS_styleScopedClasses['toolbar-right'];
    __VLS_styleScopedClasses['canvas-viewport'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("paper-region-editor") }, ...{ class: (({ readonly: __VLS_ctx.readonly, 'no-toolbar': __VLS_ctx.hideToolbar })) }, });
    if (!__VLS_ctx.hideToolbar) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("editor-toolbar") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("toolbar-left") }, });
        const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElTooltip;
        /** @type { [typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ] } */
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ content: ((__VLS_ctx.currentHintText)), placement: ("bottom-start"), }));
        const __VLS_2 = __VLS_1({ content: ((__VLS_ctx.currentHintText)), placement: ("bottom-start"), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({ type: ("button"), ...{ class: ("hint-pill") }, });
        const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({}));
        const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
        const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.InfoFilled;
        /** @type { [typeof __VLS_components.InfoFilled, ] } */
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
        const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
        __VLS_nonNullable(__VLS_11.slots).default;
        var __VLS_11;
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_nonNullable(__VLS_5.slots).default;
        var __VLS_5;
        const __VLS_18 = __VLS_resolvedLocalAndGlobalComponents.ElDropdown;
        /** @type { [typeof __VLS_components.ElDropdown, typeof __VLS_components.elDropdown, typeof __VLS_components.ElDropdown, typeof __VLS_components.elDropdown, ] } */
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({ ...{ 'onCommand': {} }, trigger: ("hover"), placement: ("bottom-start"), }));
        const __VLS_20 = __VLS_19({ ...{ 'onCommand': {} }, trigger: ("hover"), placement: ("bottom-start"), }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        let __VLS_24;
        const __VLS_25 = {
            onCommand: (__VLS_ctx.handleToolboxCommand)
        };
        let __VLS_21;
        let __VLS_22;
        const __VLS_26 = __VLS_resolvedLocalAndGlobalComponents.ElTooltip;
        /** @type { [typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ] } */
        // @ts-ignore
        const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({ content: ("将鼠标放上来，会弹出工具箱"), placement: ("bottom"), }));
        const __VLS_28 = __VLS_27({ content: ("将鼠标放上来，会弹出工具箱"), placement: ("bottom"), }, ...__VLS_functionalComponentArgsRest(__VLS_27));
        const __VLS_32 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({ size: ("small"), ...{ class: ("toolbox-trigger") }, }));
        const __VLS_34 = __VLS_33({ size: ("small"), ...{ class: ("toolbox-trigger") }, }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        const __VLS_38 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({}));
        const __VLS_40 = __VLS_39({}, ...__VLS_functionalComponentArgsRest(__VLS_39));
        const __VLS_44 = __VLS_resolvedLocalAndGlobalComponents.Tools;
        /** @type { [typeof __VLS_components.Tools, ] } */
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({}));
        const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
        __VLS_nonNullable(__VLS_43.slots).default;
        var __VLS_43;
        const __VLS_50 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({ ...{ class: ("toolbox-arrow") }, }));
        const __VLS_52 = __VLS_51({ ...{ class: ("toolbox-arrow") }, }, ...__VLS_functionalComponentArgsRest(__VLS_51));
        const __VLS_56 = __VLS_resolvedLocalAndGlobalComponents.ArrowDown;
        /** @type { [typeof __VLS_components.ArrowDown, ] } */
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({}));
        const __VLS_58 = __VLS_57({}, ...__VLS_functionalComponentArgsRest(__VLS_57));
        __VLS_nonNullable(__VLS_55.slots).default;
        var __VLS_55;
        __VLS_nonNullable(__VLS_37.slots).default;
        var __VLS_37;
        __VLS_nonNullable(__VLS_31.slots).default;
        var __VLS_31;
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { dropdown: __VLS_thisSlot } = __VLS_nonNullable(__VLS_23.slots);
            const __VLS_62 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownMenu;
            /** @type { [typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.elDropdownMenu, typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.elDropdownMenu, ] } */
            // @ts-ignore
            const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({ ...{ class: ("toolbox-menu") }, }));
            const __VLS_64 = __VLS_63({ ...{ class: ("toolbox-menu") }, }, ...__VLS_functionalComponentArgsRest(__VLS_63));
            const __VLS_68 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
            /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ] } */
            // @ts-ignore
            const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({ command: ("addRegion"), disabled: ((__VLS_ctx.readonly)), }));
            const __VLS_70 = __VLS_69({ command: ("addRegion"), disabled: ((__VLS_ctx.readonly)), }, ...__VLS_functionalComponentArgsRest(__VLS_69));
            __VLS_nonNullable(__VLS_73.slots).default;
            var __VLS_73;
            const __VLS_74 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
            /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ] } */
            // @ts-ignore
            const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({ command: ("modifyRegion"), disabled: ((__VLS_ctx.readonly)), }));
            const __VLS_76 = __VLS_75({ command: ("modifyRegion"), disabled: ((__VLS_ctx.readonly)), }, ...__VLS_functionalComponentArgsRest(__VLS_75));
            __VLS_nonNullable(__VLS_79.slots).default;
            var __VLS_79;
            const __VLS_80 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
            /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ] } */
            // @ts-ignore
            const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({ command: ("drawMode"), disabled: ((__VLS_ctx.readonly)), }));
            const __VLS_82 = __VLS_81({ command: ("drawMode"), disabled: ((__VLS_ctx.readonly)), }, ...__VLS_functionalComponentArgsRest(__VLS_81));
            __VLS_nonNullable(__VLS_85.slots).default;
            var __VLS_85;
            const __VLS_86 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
            /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ] } */
            // @ts-ignore
            const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({ command: ("adjustMode"), disabled: ((__VLS_ctx.readonly)), }));
            const __VLS_88 = __VLS_87({ command: ("adjustMode"), disabled: ((__VLS_ctx.readonly)), }, ...__VLS_functionalComponentArgsRest(__VLS_87));
            __VLS_nonNullable(__VLS_91.slots).default;
            var __VLS_91;
            const __VLS_92 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
            /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ] } */
            // @ts-ignore
            const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({ command: ("panMode"), }));
            const __VLS_94 = __VLS_93({ command: ("panMode"), }, ...__VLS_functionalComponentArgsRest(__VLS_93));
            __VLS_nonNullable(__VLS_97.slots).default;
            var __VLS_97;
            const __VLS_98 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
            /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ] } */
            // @ts-ignore
            const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({ command: ("selectMode"), }));
            const __VLS_100 = __VLS_99({ command: ("selectMode"), }, ...__VLS_functionalComponentArgsRest(__VLS_99));
            __VLS_nonNullable(__VLS_103.slots).default;
            var __VLS_103;
            const __VLS_104 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
            /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ] } */
            // @ts-ignore
            const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({ command: ("editRegion"), disabled: ((!__VLS_ctx.selectedRegion || __VLS_ctx.readonly)), }));
            const __VLS_106 = __VLS_105({ command: ("editRegion"), disabled: ((!__VLS_ctx.selectedRegion || __VLS_ctx.readonly)), }, ...__VLS_functionalComponentArgsRest(__VLS_105));
            __VLS_nonNullable(__VLS_109.slots).default;
            var __VLS_109;
            const __VLS_110 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
            /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ] } */
            // @ts-ignore
            const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({ command: ("deleteRegion"), disabled: ((!__VLS_ctx.selectedRegion || __VLS_ctx.readonly)), }));
            const __VLS_112 = __VLS_111({ command: ("deleteRegion"), disabled: ((!__VLS_ctx.selectedRegion || __VLS_ctx.readonly)), }, ...__VLS_functionalComponentArgsRest(__VLS_111));
            __VLS_nonNullable(__VLS_115.slots).default;
            var __VLS_115;
            const __VLS_116 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
            /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ] } */
            // @ts-ignore
            const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({ divided: (true), command: ("zoomIn"), }));
            const __VLS_118 = __VLS_117({ divided: (true), command: ("zoomIn"), }, ...__VLS_functionalComponentArgsRest(__VLS_117));
            __VLS_nonNullable(__VLS_121.slots).default;
            var __VLS_121;
            const __VLS_122 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
            /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ] } */
            // @ts-ignore
            const __VLS_123 = __VLS_asFunctionalComponent(__VLS_122, new __VLS_122({ command: ("zoomOut"), }));
            const __VLS_124 = __VLS_123({ command: ("zoomOut"), }, ...__VLS_functionalComponentArgsRest(__VLS_123));
            __VLS_nonNullable(__VLS_127.slots).default;
            var __VLS_127;
            const __VLS_128 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
            /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ] } */
            // @ts-ignore
            const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({ command: ("fitView"), }));
            const __VLS_130 = __VLS_129({ command: ("fitView"), }, ...__VLS_functionalComponentArgsRest(__VLS_129));
            __VLS_nonNullable(__VLS_133.slots).default;
            var __VLS_133;
            const __VLS_134 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
            /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ] } */
            // @ts-ignore
            const __VLS_135 = __VLS_asFunctionalComponent(__VLS_134, new __VLS_134({ command: ("resetView"), }));
            const __VLS_136 = __VLS_135({ command: ("resetView"), }, ...__VLS_functionalComponentArgsRest(__VLS_135));
            __VLS_nonNullable(__VLS_139.slots).default;
            var __VLS_139;
            const __VLS_140 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
            /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ] } */
            // @ts-ignore
            const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({ divided: (true), command: ("moveUp"), }));
            const __VLS_142 = __VLS_141({ divided: (true), command: ("moveUp"), }, ...__VLS_functionalComponentArgsRest(__VLS_141));
            __VLS_nonNullable(__VLS_145.slots).default;
            var __VLS_145;
            const __VLS_146 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
            /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ] } */
            // @ts-ignore
            const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({ command: ("moveDown"), }));
            const __VLS_148 = __VLS_147({ command: ("moveDown"), }, ...__VLS_functionalComponentArgsRest(__VLS_147));
            __VLS_nonNullable(__VLS_151.slots).default;
            var __VLS_151;
            const __VLS_152 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
            /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ] } */
            // @ts-ignore
            const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({ command: ("moveLeft"), }));
            const __VLS_154 = __VLS_153({ command: ("moveLeft"), }, ...__VLS_functionalComponentArgsRest(__VLS_153));
            __VLS_nonNullable(__VLS_157.slots).default;
            var __VLS_157;
            const __VLS_158 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
            /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ] } */
            // @ts-ignore
            const __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158({ command: ("moveRight"), }));
            const __VLS_160 = __VLS_159({ command: ("moveRight"), }, ...__VLS_functionalComponentArgsRest(__VLS_159));
            __VLS_nonNullable(__VLS_163.slots).default;
            var __VLS_163;
            __VLS_nonNullable(__VLS_67.slots).default;
            var __VLS_67;
        }
        var __VLS_23;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("current-tool-pill") }, });
        (__VLS_ctx.currentToolText);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("scale-indicator") }, });
        (__VLS_ctx.scaleText);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("toolbar-right") }, });
        var __VLS_164 = {};
        if (__VLS_ctx.showSaveAction) {
            const __VLS_165 = __VLS_resolvedLocalAndGlobalComponents.ElTooltip;
            /** @type { [typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ] } */
            // @ts-ignore
            const __VLS_166 = __VLS_asFunctionalComponent(__VLS_165, new __VLS_165({ content: ("保存当前框选坐标和题目属性"), placement: ("bottom"), }));
            const __VLS_167 = __VLS_166({ content: ("保存当前框选坐标和题目属性"), placement: ("bottom"), }, ...__VLS_functionalComponentArgsRest(__VLS_166));
            const __VLS_171 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
            /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
            // @ts-ignore
            const __VLS_172 = __VLS_asFunctionalComponent(__VLS_171, new __VLS_171({ ...{ 'onClick': {} }, size: ("small"), type: ("primary"), }));
            const __VLS_173 = __VLS_172({ ...{ 'onClick': {} }, size: ("small"), type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_172));
            let __VLS_177;
            const __VLS_178 = {
                onClick: (...[$event]) => {
                    if (!((!__VLS_ctx.hideToolbar)))
                        return;
                    if (!((__VLS_ctx.showSaveAction)))
                        return;
                    __VLS_ctx.emit('save', __VLS_ctx.cloneRegions(__VLS_ctx.localRegions));
                }
            };
            let __VLS_174;
            let __VLS_175;
            __VLS_nonNullable(__VLS_176.slots).default;
            var __VLS_176;
            __VLS_nonNullable(__VLS_170.slots).default;
            var __VLS_170;
        }
        if (__VLS_ctx.subjectName) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("subject-badge") }, });
            (__VLS_ctx.subjectName);
        }
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onMousedown: (__VLS_ctx.handleStageMouseDown) }, ...{ onWheel: (__VLS_ctx.handleWheelZoom) }, ref: ("viewportRef"), ...{ class: ("canvas-viewport") }, ...{ class: (([`tool-${__VLS_ctx.tool}`, { readonly: __VLS_ctx.readonly }])) }, });
    // @ts-ignore navigation for `const viewportRef = ref()`
    __VLS_ctx.viewportRef;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ref: ("stageRef"), ...{ class: ("image-stage") }, ...{ class: (({ ready: __VLS_ctx.imageLoaded })) }, ...{ style: ((__VLS_ctx.stageStyle)) }, });
    // @ts-ignore navigation for `const stageRef = ref()`
    __VLS_ctx.stageRef;
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({ ...{ onLoad: (__VLS_ctx.handleImageLoad) }, ref: ("imageRef"), src: ((__VLS_ctx.imageUrl)), alt: ("试卷标注图"), ...{ class: ("paper-image") }, draggable: ("false"), });
    // @ts-ignore navigation for `const imageRef = ref()`
    __VLS_ctx.imageRef;
    if (__VLS_ctx.imageLoaded) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("overlay-layer") }, });
        for (const [region] of __VLS_getVForSourceType((__VLS_ctx.localRegions))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({ ...{ onMousedown: (...[$event]) => {
                        if (!((__VLS_ctx.imageLoaded)))
                            return;
                        __VLS_ctx.handleRegionMouseDown(region, $event);
                    } }, ...{ onClick: (...[$event]) => {
                        if (!((__VLS_ctx.imageLoaded)))
                            return;
                        __VLS_ctx.handleRegionClick(region);
                    } }, key: ((region.id)), type: ("button"), ...{ class: ("region-box") }, ...{ class: (({
                        selected: __VLS_ctx.selectedRegionId === region.id,
                        readonly: __VLS_ctx.readonly,
                        incomplete: !region.questionNo,
                        editable: !__VLS_ctx.readonly && __VLS_ctx.tool === 'adjust'
                    })) }, ...{ style: ((__VLS_ctx.regionStyle(region))) }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("region-label") }, });
            (__VLS_ctx.regionLabel(region));
            if (__VLS_ctx.selectedRegionId === region.id && !__VLS_ctx.readonly && __VLS_ctx.tool === 'adjust') {
                for (const [direction] of __VLS_getVForSourceType((__VLS_ctx.resizeDirections))) {
                    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ onMousedown: (...[$event]) => {
                                if (!((__VLS_ctx.imageLoaded)))
                                    return;
                                if (!((__VLS_ctx.selectedRegionId === region.id && !__VLS_ctx.readonly && __VLS_ctx.tool === 'adjust')))
                                    return;
                                __VLS_ctx.handleResizeHandleMouseDown(region, direction, $event);
                            } }, key: ((direction)), ...{ class: ("resize-handle") }, ...{ class: ((`is-${direction}`)) }, });
                }
            }
        }
        if (__VLS_ctx.draftRegion) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("region-box draft") }, ...{ style: ((__VLS_ctx.regionStyle(__VLS_ctx.draftRegion))) }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("region-label") }, });
        }
    }
    if (!__VLS_ctx.imageLoaded) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("canvas-placeholder") }, });
    }
    const __VLS_179 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */
    // @ts-ignore
    const __VLS_180 = __VLS_asFunctionalComponent(__VLS_179, new __VLS_179({ modelValue: ((__VLS_ctx.regionDialogVisible)), title: ("题目属性设置"), width: ("520px"), appendToBody: (true), destroyOnClose: (true), }));
    const __VLS_181 = __VLS_180({ modelValue: ((__VLS_ctx.regionDialogVisible)), title: ("题目属性设置"), width: ("520px"), appendToBody: (true), destroyOnClose: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_180));
    const __VLS_185 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */
    // @ts-ignore
    const __VLS_186 = __VLS_asFunctionalComponent(__VLS_185, new __VLS_185({ labelPosition: ("top"), ...{ class: ("region-form") }, }));
    const __VLS_187 = __VLS_186({ labelPosition: ("top"), ...{ class: ("region-form") }, }, ...__VLS_functionalComponentArgsRest(__VLS_186));
    const __VLS_191 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_192 = __VLS_asFunctionalComponent(__VLS_191, new __VLS_191({ label: ("题号"), }));
    const __VLS_193 = __VLS_192({ label: ("题号"), }, ...__VLS_functionalComponentArgsRest(__VLS_192));
    const __VLS_197 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_198 = __VLS_asFunctionalComponent(__VLS_197, new __VLS_197({ modelValue: ((__VLS_ctx.regionForm.questionNo)), placeholder: ("如：第1题 / 1 / 一(1)"), }));
    const __VLS_199 = __VLS_198({ modelValue: ((__VLS_ctx.regionForm.questionNo)), placeholder: ("如：第1题 / 1 / 一(1)"), }, ...__VLS_functionalComponentArgsRest(__VLS_198));
    __VLS_nonNullable(__VLS_196.slots).default;
    var __VLS_196;
    const __VLS_203 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_204 = __VLS_asFunctionalComponent(__VLS_203, new __VLS_203({ label: ("题型"), }));
    const __VLS_205 = __VLS_204({ label: ("题型"), }, ...__VLS_functionalComponentArgsRest(__VLS_204));
    const __VLS_209 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
    /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */
    // @ts-ignore
    const __VLS_210 = __VLS_asFunctionalComponent(__VLS_209, new __VLS_209({ modelValue: ((__VLS_ctx.regionForm.questionType)), placeholder: ("请选择题型"), ...{ style: ({}) }, }));
    const __VLS_211 = __VLS_210({ modelValue: ((__VLS_ctx.regionForm.questionType)), placeholder: ("请选择题型"), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_210));
    const __VLS_215 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
    // @ts-ignore
    const __VLS_216 = __VLS_asFunctionalComponent(__VLS_215, new __VLS_215({ label: ("选择题"), value: ("选择题"), }));
    const __VLS_217 = __VLS_216({ label: ("选择题"), value: ("选择题"), }, ...__VLS_functionalComponentArgsRest(__VLS_216));
    const __VLS_221 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
    // @ts-ignore
    const __VLS_222 = __VLS_asFunctionalComponent(__VLS_221, new __VLS_221({ label: ("填空题"), value: ("填空题"), }));
    const __VLS_223 = __VLS_222({ label: ("填空题"), value: ("填空题"), }, ...__VLS_functionalComponentArgsRest(__VLS_222));
    const __VLS_227 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
    // @ts-ignore
    const __VLS_228 = __VLS_asFunctionalComponent(__VLS_227, new __VLS_227({ label: ("判断题"), value: ("判断题"), }));
    const __VLS_229 = __VLS_228({ label: ("判断题"), value: ("判断题"), }, ...__VLS_functionalComponentArgsRest(__VLS_228));
    const __VLS_233 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
    // @ts-ignore
    const __VLS_234 = __VLS_asFunctionalComponent(__VLS_233, new __VLS_233({ label: ("简答题"), value: ("简答题"), }));
    const __VLS_235 = __VLS_234({ label: ("简答题"), value: ("简答题"), }, ...__VLS_functionalComponentArgsRest(__VLS_234));
    const __VLS_239 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
    // @ts-ignore
    const __VLS_240 = __VLS_asFunctionalComponent(__VLS_239, new __VLS_239({ label: ("解答题"), value: ("解答题"), }));
    const __VLS_241 = __VLS_240({ label: ("解答题"), value: ("解答题"), }, ...__VLS_functionalComponentArgsRest(__VLS_240));
    const __VLS_245 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
    // @ts-ignore
    const __VLS_246 = __VLS_asFunctionalComponent(__VLS_245, new __VLS_245({ label: ("作文题"), value: ("作文题"), }));
    const __VLS_247 = __VLS_246({ label: ("作文题"), value: ("作文题"), }, ...__VLS_functionalComponentArgsRest(__VLS_246));
    __VLS_nonNullable(__VLS_214.slots).default;
    var __VLS_214;
    __VLS_nonNullable(__VLS_208.slots).default;
    var __VLS_208;
    const __VLS_251 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_252 = __VLS_asFunctionalComponent(__VLS_251, new __VLS_251({ label: ("知识点"), }));
    const __VLS_253 = __VLS_252({ label: ("知识点"), }, ...__VLS_functionalComponentArgsRest(__VLS_252));
    const __VLS_257 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_258 = __VLS_asFunctionalComponent(__VLS_257, new __VLS_257({ modelValue: ((__VLS_ctx.regionForm.knowledgePoint)), type: ("textarea"), rows: ((3)), placeholder: ("请输入该题对应知识点，可填写多个"), }));
    const __VLS_259 = __VLS_258({ modelValue: ((__VLS_ctx.regionForm.knowledgePoint)), type: ("textarea"), rows: ((3)), placeholder: ("请输入该题对应知识点，可填写多个"), }, ...__VLS_functionalComponentArgsRest(__VLS_258));
    __VLS_nonNullable(__VLS_256.slots).default;
    var __VLS_256;
    const __VLS_263 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_264 = __VLS_asFunctionalComponent(__VLS_263, new __VLS_263({ label: ("分值"), }));
    const __VLS_265 = __VLS_264({ label: ("分值"), }, ...__VLS_functionalComponentArgsRest(__VLS_264));
    const __VLS_269 = __VLS_resolvedLocalAndGlobalComponents.ElInputNumber;
    /** @type { [typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ] } */
    // @ts-ignore
    const __VLS_270 = __VLS_asFunctionalComponent(__VLS_269, new __VLS_269({ modelValue: ((__VLS_ctx.regionForm.score)), min: ((0)), precision: ((1)), ...{ style: ({}) }, }));
    const __VLS_271 = __VLS_270({ modelValue: ((__VLS_ctx.regionForm.score)), min: ((0)), precision: ((1)), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_270));
    __VLS_nonNullable(__VLS_268.slots).default;
    var __VLS_268;
    const __VLS_275 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */
    // @ts-ignore
    const __VLS_276 = __VLS_asFunctionalComponent(__VLS_275, new __VLS_275({ label: ("备注"), }));
    const __VLS_277 = __VLS_276({ label: ("备注"), }, ...__VLS_functionalComponentArgsRest(__VLS_276));
    const __VLS_281 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */
    // @ts-ignore
    const __VLS_282 = __VLS_asFunctionalComponent(__VLS_281, new __VLS_281({ modelValue: ((__VLS_ctx.regionForm.remark)), type: ("textarea"), rows: ((3)), placeholder: ("可补充题目说明、切割备注等"), }));
    const __VLS_283 = __VLS_282({ modelValue: ((__VLS_ctx.regionForm.remark)), type: ("textarea"), rows: ((3)), placeholder: ("可补充题目说明、切割备注等"), }, ...__VLS_functionalComponentArgsRest(__VLS_282));
    __VLS_nonNullable(__VLS_280.slots).default;
    var __VLS_280;
    __VLS_nonNullable(__VLS_190.slots).default;
    var __VLS_190;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_184.slots);
        const __VLS_287 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_288 = __VLS_asFunctionalComponent(__VLS_287, new __VLS_287({ ...{ 'onClick': {} }, }));
        const __VLS_289 = __VLS_288({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_288));
        let __VLS_293;
        const __VLS_294 = {
            onClick: (...[$event]) => {
                __VLS_ctx.regionDialogVisible = false;
            }
        };
        let __VLS_290;
        let __VLS_291;
        __VLS_nonNullable(__VLS_292.slots).default;
        var __VLS_292;
        const __VLS_295 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_296 = __VLS_asFunctionalComponent(__VLS_295, new __VLS_295({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_297 = __VLS_296({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_296));
        let __VLS_301;
        const __VLS_302 = {
            onClick: (__VLS_ctx.saveRegionMeta)
        };
        let __VLS_298;
        let __VLS_299;
        __VLS_nonNullable(__VLS_300.slots).default;
        var __VLS_300;
    }
    var __VLS_184;
    __VLS_styleScopedClasses['paper-region-editor'];
    __VLS_styleScopedClasses['readonly'];
    __VLS_styleScopedClasses['no-toolbar'];
    __VLS_styleScopedClasses['editor-toolbar'];
    __VLS_styleScopedClasses['toolbar-left'];
    __VLS_styleScopedClasses['hint-pill'];
    __VLS_styleScopedClasses['toolbox-trigger'];
    __VLS_styleScopedClasses['toolbox-arrow'];
    __VLS_styleScopedClasses['toolbox-menu'];
    __VLS_styleScopedClasses['current-tool-pill'];
    __VLS_styleScopedClasses['scale-indicator'];
    __VLS_styleScopedClasses['toolbar-right'];
    __VLS_styleScopedClasses['subject-badge'];
    __VLS_styleScopedClasses['canvas-viewport'];
    __VLS_styleScopedClasses['readonly'];
    __VLS_styleScopedClasses['image-stage'];
    __VLS_styleScopedClasses['ready'];
    __VLS_styleScopedClasses['paper-image'];
    __VLS_styleScopedClasses['overlay-layer'];
    __VLS_styleScopedClasses['region-box'];
    __VLS_styleScopedClasses['selected'];
    __VLS_styleScopedClasses['readonly'];
    __VLS_styleScopedClasses['incomplete'];
    __VLS_styleScopedClasses['editable'];
    __VLS_styleScopedClasses['region-label'];
    __VLS_styleScopedClasses['resize-handle'];
    __VLS_styleScopedClasses['region-box'];
    __VLS_styleScopedClasses['draft'];
    __VLS_styleScopedClasses['region-label'];
    __VLS_styleScopedClasses['canvas-placeholder'];
    __VLS_styleScopedClasses['region-form'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "viewportRef": __VLS_nativeElements['div'],
        "stageRef": __VLS_nativeElements['div'],
        "imageRef": __VLS_nativeElements['img'],
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
            ArrowDown: ArrowDown,
            InfoFilled: InfoFilled,
            Tools: Tools,
            resizeDirections: resizeDirections,
            emit: emit,
            viewportRef: viewportRef,
            stageRef: stageRef,
            imageRef: imageRef,
            tool: tool,
            imageLoaded: imageLoaded,
            localRegions: localRegions,
            draftRegion: draftRegion,
            selectedRegionId: selectedRegionId,
            regionDialogVisible: regionDialogVisible,
            regionForm: regionForm,
            selectedRegion: selectedRegion,
            showSaveAction: showSaveAction,
            scaleText: scaleText,
            currentToolText: currentToolText,
            currentHintText: currentHintText,
            stageStyle: stageStyle,
            cloneRegions: cloneRegions,
            regionStyle: regionStyle,
            regionLabel: regionLabel,
            handleImageLoad: handleImageLoad,
            handleWheelZoom: handleWheelZoom,
            handleToolboxCommand: handleToolboxCommand,
            handleStageMouseDown: handleStageMouseDown,
            handleRegionMouseDown: handleRegionMouseDown,
            handleResizeHandleMouseDown: handleResizeHandleMouseDown,
            handleRegionClick: handleRegionClick,
            saveRegionMeta: saveRegionMeta,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
    __typeEl: {},
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=PaperRegionEditor.vue.js.map