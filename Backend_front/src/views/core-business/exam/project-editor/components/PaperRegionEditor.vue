<template>
  <div
    class="paper-region-editor"
    :class="{ readonly, 'no-toolbar': hideToolbar, 'is-locked': interactionLocked }"
  >
    <div v-if="!hideToolbar" class="editor-toolbar">
      <div class="toolbar-left">
        <el-tooltip :content="currentHintText" placement="bottom-start">
          <button type="button" class="hint-pill">
            <el-icon><InfoFilled /></el-icon>
            <span>提示</span>
          </button>
        </el-tooltip>

        <el-dropdown trigger="hover" placement="bottom-start" @command="handleToolboxCommand">
          <el-tooltip content="将鼠标放上来，会弹出工具箱" placement="bottom">
            <el-button size="small" class="toolbox-trigger">
              <el-icon><Tools /></el-icon>
              工具箱
              <el-icon class="toolbox-arrow"><ArrowDown /></el-icon>
            </el-button>
          </el-tooltip>
          <template #dropdown>
            <el-dropdown-menu class="toolbox-menu">
              <el-dropdown-item command="panMode">移动试卷</el-dropdown-item>
              <el-dropdown-item command="drawMode" :disabled="readonly">创建选框</el-dropdown-item>
              <el-dropdown-item command="adjustMode" :disabled="readonly"
                >编辑选框</el-dropdown-item
              >
              <el-dropdown-item command="editRegion" :disabled="!selectedRegion || readonly">
                题目属性
              </el-dropdown-item>
              <el-dropdown-item command="deleteRegion" :disabled="!selectedRegion || readonly">
                删除框选
              </el-dropdown-item>
              <el-dropdown-item divided command="zoomIn">放大试卷</el-dropdown-item>
              <el-dropdown-item command="zoomOut">缩小试卷</el-dropdown-item>
              <el-dropdown-item command="fitView">铺满视图</el-dropdown-item>
              <el-dropdown-item command="resetView">恢复原始比例</el-dropdown-item>
              <el-dropdown-item divided command="moveUp">向上平移</el-dropdown-item>
              <el-dropdown-item command="moveDown">向下平移</el-dropdown-item>
              <el-dropdown-item command="moveLeft">向左平移</el-dropdown-item>
              <el-dropdown-item command="moveRight">向右平移</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <div class="current-tool-pill">{{ currentToolText }}</div>
        <div class="scale-indicator">{{ scaleText }}</div>
      </div>

      <div class="toolbar-right">
        <slot name="toolbar-extra" />

        <el-tooltip v-if="showSaveAction" content="保存当前框选坐标和题目属性" placement="bottom">
          <el-button size="small" type="primary" @click="emit('save', cloneRegions(localRegions))">
            保存
          </el-button>
        </el-tooltip>

        <span v-if="subjectName" class="subject-badge">{{ subjectName }}</span>
      </div>
    </div>

    <div
      ref="viewportRef"
      class="canvas-viewport"
      :class="[`tool-${tool}`, { readonly, locked: interactionLocked }]"
      @mousedown="handleStageMouseDown"
      @contextmenu.prevent="handleViewportContextMenu"
      @wheel.prevent="handleWheelZoom"
    >
      <div ref="stageRef" class="image-stage" :class="{ ready: imageLoaded }" :style="stageStyle">
        <img
          ref="imageRef"
          :src="imageUrl"
          alt="试卷标注图"
          class="paper-image"
          draggable="false"
          @load="handleImageLoad"
        />

        <div v-if="imageLoaded" class="overlay-layer">
          <button
            v-for="region in localRegions"
            :key="region.id"
            type="button"
            class="region-box"
            :class="{
              selected: selectedRegionId === region.id,
              readonly,
              incomplete: !region.questionNo,
              editable: !readonly && tool === 'adjust'
            }"
            :style="regionStyle(region)"
            @mousedown.stop="handleRegionMouseDown(region, $event)"
            @click.stop="handleRegionClick(region)"
            @mouseenter="hoveredRegionId = region.id"
            @mouseleave="handleRegionMouseLeave(region)"
            @contextmenu.stop.prevent="handleRegionContextMenu(region, $event)"
          >
            <span class="region-label">{{ regionLabel(region) }}</span>
            <template v-if="selectedRegionId === region.id && !readonly && tool === 'adjust'">
              <span
                v-for="direction in resizeDirections"
                :key="direction"
                class="resize-handle"
                :class="`is-${direction}`"
                @mousedown.stop.prevent="handleResizeHandleMouseDown(region, direction, $event)"
              ></span>
            </template>
          </button>

          <div v-if="draftRegion" class="region-box draft" :style="regionStyle(draftRegion)">
            <span class="region-label">新建框选</span>
          </div>
        </div>
      </div>

      <div
        v-if="regionContextMenu.visible && !readonly"
        ref="contextMenuRef"
        class="region-context-menu"
        :style="regionContextMenuStyle"
        @mousedown.stop
        @click.stop
        @contextmenu.stop.prevent
      >
        <button type="button" class="context-menu-item" @click="handleContextMenuCommand('edit')">
          修改属性
        </button>
        <button
          type="button"
          class="context-menu-item danger"
          @click="handleContextMenuCommand('delete')"
        >
          删除选框
        </button>
      </div>

      <div v-if="!imageLoaded" class="canvas-placeholder"> 正在加载试卷，请稍候... </div>
    </div>

    <el-dialog
      v-model="regionDialogVisible"
      title="题目属性设置"
      width="1000px"
      append-to-body
      destroy-on-close
      align-center
      class="property-dialog"
    >
      <div class="split-layout">
        <!-- 左侧：基本属性 -->
        <div class="layout-left">
          <el-form label-position="top" class="region-form">
            <el-form-item label="题号">
              <el-input v-model="regionForm.questionNo" placeholder="如：第1题 / 1 / 一(1)" />
            </el-form-item>
            <el-form-item label="题型">
              <el-select
                v-model="regionForm.questionType"
                placeholder="请选择题型"
                style="width: 100%"
              >
                <el-option label="选择题" value="选择题" />
                <el-option label="填空题" value="填空题" />
                <el-option label="判断题" value="判断题" />
                <el-option label="简答题" value="简答题" />
                <el-option label="解答题" value="解答题" />
                <el-option label="作文题" value="作文题" />
              </el-select>
            </el-form-item>
            <el-form-item label="知识点">
              <el-input
                v-model="regionForm.knowledgePoint"
                type="textarea"
                :rows="4"
                placeholder="请输入该题对应知识点，可填写多个"
              />
            </el-form-item>
            <el-form-item label="分值">
              <el-input-number
                v-model="regionForm.score"
                :min="0"
                :precision="1"
                style="width: 100%"
              />
            </el-form-item>
          </el-form>
        </div>

        <!-- 右侧：题目内容与预览 -->
        <div class="layout-right">
          <div class="content-section">
            <div class="section-header">
              <span class="section-title">题目编辑</span>
              <span class="section-tips">这里是题目识别后的源文本</span>
              <el-button
                v-if="!readonly"
                size="small"
                type="primary"
                plain
                class="section-ocr-btn"
                :loading="regionOcrLoading"
                @click="handleRegionOcr"
              >
                AI识别题目
              </el-button>
            </div>
            <el-input
              v-model="regionForm.questionText"
              type="textarea"
              :rows="8"
              placeholder="请输入题目内容，AI识别到的题目也会自动带入这里"
              class="question-editor"
            />
          </div>
          <div class="content-section">
            <div class="section-header">
              <span class="section-title">题目展示</span>
              <span class="section-tips">这里是可以显示 latex, md 的</span>
            </div>
            <div class="preview-container">
              <ArtMarkdownRender :content="regionForm.questionText" />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="regionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRegionMeta">确定保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { computed, defineAsyncComponent, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
  import { ArrowDown, InfoFilled, Tools } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import { normalizeQuestionNo } from '@/utils/exam-utils'
  import type { PaperRegionItem } from '@/api/core-business/exam/project-editor'
  const ArtMarkdownRender = defineAsyncComponent(
    () => import('@/components/core/others/art-markdown-render/index.vue')
  )

  type RegionTool = 'draw' | 'adjust' | 'pan' | 'select'
  type InteractionMode = 'draw' | 'pan' | 'move' | 'resize' | null
  type ResizeDirection = 'nw' | 'ne' | 'sw' | 'se'
  type ToolboxCommand =
    | 'addRegion'
    | 'modifyRegion'
    | 'drawMode'
    | 'adjustMode'
    | 'panMode'
    | 'selectMode'
    | 'editRegion'
    | 'deleteRegion'
    | 'zoomIn'
    | 'zoomOut'
    | 'fitView'
    | 'resetView'
    | 'moveUp'
    | 'moveDown'
    | 'moveLeft'
    | 'moveRight'

  const MIN_REGION_SIZE = 0.01
  const resizeDirections: ResizeDirection[] = ['nw', 'ne', 'sw', 'se']

  const props = withDefaults(
    defineProps<{
      imageUrl: string
      regions?: PaperRegionItem[]
      readonly?: boolean
      interactionLocked?: boolean
      regionOcrLoading?: boolean
      subjectName?: string
      showSave?: boolean
      hideToolbar?: boolean
      initialTool?: RegionTool
    }>(),
    {
      regions: () => [],
      readonly: false,
      interactionLocked: false,
      regionOcrLoading: false,
      subjectName: '',
      showSave: true,
      hideToolbar: false
    }
  )

  const emit = defineEmits<{
    'update:regions': [value: PaperRegionItem[]]
    save: [value: PaperRegionItem[]]
    'ocr-region': [value: PaperRegionItem]
  }>()

  const viewportRef = ref<HTMLElement>()
  const stageRef = ref<HTMLElement>()
  const imageRef = ref<HTMLImageElement>()
  const tool = ref<RegionTool>(resolveInitialTool(props.initialTool, props.readonly))
  const imageLoaded = ref(false)
  const localRegions = ref<PaperRegionItem[]>([])
  const draftRegion = ref<PaperRegionItem | null>(null)
  const selectedRegionId = ref('')
  const hoveredRegionId = ref('')
  const suppressClickRegionId = ref('')
  const regionDialogVisible = ref(false)
  const editingRegionId = ref('')
  const contextMenuRef = ref<HTMLElement>()

  const regionForm = reactive({
    questionNo: '',
    questionType: '',
    knowledgePoint: '',
    questionText: '',
    score: null as number | null
  })

  const interaction = reactive({
    mode: null as InteractionMode,
    startX: 0,
    startY: 0,
    startClientX: 0,
    startClientY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
    moved: false,
    regionId: '',
    resizeDirection: '' as ResizeDirection | '',
    startRegion: {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    }
  })

  const view = reactive({
    scale: 1,
    minScale: 0.2,
    maxScale: 4,
    offsetX: 0,
    offsetY: 0,
    imageWidth: 0,
    imageHeight: 0,
    hasManualViewport: false
  })

  const regionContextMenu = reactive({
    visible: false,
    x: 0,
    y: 0,
    regionId: ''
  })

  const selectedRegion = computed(
    () => localRegions.value.find((item) => item.id === selectedRegionId.value) || null
  )

  const showSaveAction = computed(() => !props.readonly && props.showSave)
  const scaleText = computed(() => `${Math.round(view.scale * 100)}%`)
  const currentToolText = computed(() => {
    if (tool.value === 'draw') return '当前工具: 创建选框'
    if (tool.value === 'adjust') return '当前工具: 编辑选框'
    if (tool.value === 'pan') return '当前工具: 移动试卷'
    return '当前工具: 移动试卷'
  })
  const currentHintText = computed(() => {
    if (props.readonly) {
      return '当前为只读预览，可通过移动和缩放查看框选结果，也可在工具箱里放大、缩小和平移试卷。'
    }
    if (tool.value === 'draw') {
      return '按住鼠标拖拽即可创建框选区域，松开后会保留选框，右键可继续操作。'
    }
    if (tool.value === 'adjust') {
      return '选中框选后可直接拖动位置，拖拽四角圆点即可调整大小，也可右键管理当前选框。'
    }
    if (tool.value === 'pan') {
      return '按住鼠标即可拖动试卷，也支持鼠标滚轮缩放，方便查看试卷细节。'
    }
    return '点击已有框选可选中区域，右键后可修改属性、删除选框。'
  })
  const regionContextMenuStyle = computed(() => ({
    left: `${regionContextMenu.x}px`,
    top: `${regionContextMenu.y}px`
  }))

  const stageStyle = computed(() => ({
    width: view.imageWidth ? `${view.imageWidth}px` : 'auto',
    transform: `translate(${view.offsetX}px, ${view.offsetY}px) scale(${view.scale})`,
    transformOrigin: 'top left'
  }))

  defineExpose({
    tool,
    scale: computed(() => view.scale),
    handleToolboxCommand,
    save: () => emit('save', cloneRegions(localRegions.value)),
    applyOcrRegionMeta,
    selectedRegion,
    currentHintText,
    currentToolText
  })

  watch(
    () => props.regions,
    (regions) => {
      localRegions.value = cloneRegions(regions || [])
      if (!localRegions.value.some((item) => item.id === selectedRegionId.value)) {
        selectedRegionId.value = localRegions.value[0]?.id || ''
      }
    },
    { immediate: true, deep: true }
  )

  watch(
    () => props.readonly,
    (readonly) => {
      if (readonly && (tool.value === 'draw' || tool.value === 'adjust')) {
        tool.value = resolveInitialTool(props.initialTool, readonly)
      }
    },
    { immediate: true }
  )

  watch(
    () => props.interactionLocked,
    (locked) => {
      if (!locked) return
      interaction.mode = null
      interaction.regionId = ''
      interaction.moved = false
      interaction.resizeDirection = ''
      draftRegion.value = null
      closeRegionContextMenu()
    }
  )

  watch(
    () => props.imageUrl,
    () => {
      imageLoaded.value = false
      view.imageWidth = 0
      view.imageHeight = 0
      view.scale = 1
      view.offsetX = 0
      view.offsetY = 0
      view.hasManualViewport = false
      draftRegion.value = null
      closeRegionContextMenu()
    }
  )

  onMounted(() => {
    window.addEventListener('mousemove', handleWindowMouseMove)
    window.addEventListener('mouseup', handleWindowMouseUp)
    window.addEventListener('mousedown', handleWindowMouseDown)
    window.addEventListener('resize', handleWindowResize)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', handleWindowMouseMove)
    window.removeEventListener('mouseup', handleWindowMouseUp)
    window.removeEventListener('mousedown', handleWindowMouseDown)
    window.removeEventListener('resize', handleWindowResize)
  })

  function cloneRegions(regions: PaperRegionItem[]) {
    return (regions || []).map((item, index) => ({
      id: item.id || createRegionId(),
      questionNo: normalizeQuestionNo(item.questionNo, item.sortOrder ?? index + 1),
      questionType: item.questionType || '',
      knowledgePoint: item.knowledgePoint || '',
      questionText: item.questionText || '',
      score: item.score ?? null,
      sortOrder: item.sortOrder ?? index + 1,
      x: clampUnit(item.x),
      y: clampUnit(item.y),
      width: clampUnit(item.width),
      height: clampUnit(item.height)
    }))
  }

  function createRegionId() {
    return `region_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  }

  function resolveInitialTool(initialTool?: RegionTool, readonly = false): RegionTool {
    if (readonly) {
      return 'pan'
    }
    if (initialTool && ['draw', 'adjust', 'pan', 'select'].includes(initialTool)) {
      return initialTool
    }
    return 'pan'
  }

  function clampUnit(value: number | null | undefined) {
    const num = Number(value || 0)
    if (Number.isNaN(num)) return 0
    return Math.max(0, Math.min(1, Number(num.toFixed(6))))
  }

  function emitRegions() {
    emit('update:regions', cloneRegions(localRegions.value))
  }

  function regionStyle(region: PaperRegionItem) {
    return {
      left: `${region.x * 100}%`,
      top: `${region.y * 100}%`,
      width: `${region.width * 100}%`,
      height: `${region.height * 100}%`
    }
  }

  function regionLabel(region: PaperRegionItem) {
    const prefix = region.questionNo || '未标记'
    return region.knowledgePoint ? `${prefix} | ${region.knowledgePoint}` : prefix
  }

  function nextQuestionIndex() {
    const values = localRegions.value
      .map((item, index) => {
        const normalized = normalizeQuestionNo(item.questionNo, item.sortOrder ?? index + 1)
        const matched = normalized.match(/\d+/)
        return matched ? Number(matched[0]) : 0
      })
      .filter((value) => value > 0)
    return (values.length ? Math.max(...values) : 0) + 1
  }

  function getRelativePoint(event: MouseEvent) {
    const rect = stageRef.value?.getBoundingClientRect()
    if (!rect || rect.width <= 0 || rect.height <= 0) return null
    const x = clampUnit((event.clientX - rect.left) / rect.width)
    const y = clampUnit((event.clientY - rect.top) / rect.height)
    return { x, y }
  }

  function handleImageLoad() {
    const img = imageRef.value
    if (!img) return
    view.imageWidth = img.naturalWidth || img.width
    view.imageHeight = img.naturalHeight || img.height
    imageLoaded.value = true
    nextTick(() => fitView(false))
  }

  function handleWindowResize() {
    if (!imageLoaded.value) return
    if (view.hasManualViewport) {
      normalizeOffsets()
      return
    }
    fitView(false)
  }

  function fitView(markManual = true) {
    if (!viewportRef.value || !view.imageWidth || !view.imageHeight) return

    const viewportWidth = viewportRef.value.clientWidth
    const viewportHeight = viewportRef.value.clientHeight
    if (!viewportWidth || !viewportHeight) return

    const padding = 56
    const usableWidth = Math.max(viewportWidth - padding * 2, 240)
    const usableHeight = Math.max(viewportHeight - padding * 2, 240)
    const fitScale = Math.min(usableWidth / view.imageWidth, usableHeight / view.imageHeight)
    const nextScale = clampScale(fitScale)

    view.scale = nextScale
    updateScaleBounds()
    centerView()
    view.hasManualViewport = markManual
  }

  function resetView() {
    if (!viewportRef.value || !view.imageWidth || !view.imageHeight) return
    view.scale = clampScale(1)
    updateScaleBounds()
    centerView()
    view.hasManualViewport = true
  }

  function centerView() {
    if (!viewportRef.value) return
    const viewportWidth = viewportRef.value.clientWidth
    const viewportHeight = viewportRef.value.clientHeight
    const scaledWidth = view.imageWidth * view.scale
    const scaledHeight = view.imageHeight * view.scale
    view.offsetX = (viewportWidth - scaledWidth) / 2
    view.offsetY = (viewportHeight - scaledHeight) / 2
    normalizeOffsets()
  }

  function updateScaleBounds() {
    const fitScale =
      viewportRef.value && view.imageWidth && view.imageHeight
        ? Math.min(
            Math.max((viewportRef.value.clientWidth - 112) / view.imageWidth, 0.2),
            Math.max((viewportRef.value.clientHeight - 112) / view.imageHeight, 0.2)
          )
        : 0.2
    view.minScale = Math.max(0.15, Math.min(fitScale * 0.45, 1))
    view.maxScale = Math.max(3.5, fitScale * 3.2)
  }

  function clampScale(value: number) {
    updateScaleBounds()
    return Math.min(view.maxScale, Math.max(view.minScale, Number(value.toFixed(3))))
  }

  function setScale(nextScale: number, anchor?: { x: number; y: number }) {
    if (!viewportRef.value || !view.imageWidth || !view.imageHeight) return
    const clampedScale = clampScale(nextScale)
    const viewportRect = viewportRef.value.getBoundingClientRect()
    const point = anchor || {
      x: viewportRect.width / 2,
      y: viewportRect.height / 2
    }

    const contentX = (point.x - view.offsetX) / view.scale
    const contentY = (point.y - view.offsetY) / view.scale

    view.scale = clampedScale
    view.offsetX = point.x - contentX * view.scale
    view.offsetY = point.y - contentY * view.scale
    view.hasManualViewport = true
    normalizeOffsets()
  }

  function normalizeOffsets() {
    if (!viewportRef.value || !view.imageWidth || !view.imageHeight) return
    const viewportWidth = viewportRef.value.clientWidth
    const viewportHeight = viewportRef.value.clientHeight
    const scaledWidth = view.imageWidth * view.scale
    const scaledHeight = view.imageHeight * view.scale
    const padding = 72

    if (scaledWidth <= viewportWidth - padding * 2) {
      view.offsetX = (viewportWidth - scaledWidth) / 2
    } else {
      const minX = viewportWidth - scaledWidth - padding
      const maxX = padding
      view.offsetX = Math.min(maxX, Math.max(minX, view.offsetX))
    }

    if (scaledHeight <= viewportHeight - padding * 2) {
      view.offsetY = (viewportHeight - scaledHeight) / 2
    } else {
      const minY = viewportHeight - scaledHeight - padding
      const maxY = padding
      view.offsetY = Math.min(maxY, Math.max(minY, view.offsetY))
    }
  }

  function nudgeViewport(dx: number, dy: number) {
    view.offsetX += dx
    view.offsetY += dy
    view.hasManualViewport = true
    normalizeOffsets()
  }

  function handleWheelZoom(event: WheelEvent) {
    if (!imageLoaded.value || !viewportRef.value || props.interactionLocked) return
    const rect = viewportRef.value.getBoundingClientRect()
    const anchor = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
    const factor = event.deltaY < 0 ? 1.12 : 0.9
    setScale(view.scale * factor, anchor)
  }

  function handleToolboxCommand(command: ToolboxCommand) {
    if (props.interactionLocked) return

    if (command === 'addRegion' || command === 'drawMode') {
      if (props.readonly) return
      closeRegionContextMenu()
      tool.value = 'draw'
      return
    }

    if (command === 'adjustMode') {
      if (props.readonly) return
      closeRegionContextMenu()
      tool.value = 'adjust'
      return
    }

    if (command === 'panMode') {
      closeRegionContextMenu()
      tool.value = 'pan'
      return
    }

    if (command === 'selectMode') {
      closeRegionContextMenu()
      tool.value = 'select'
      return
    }

    if (command === 'modifyRegion') {
      if (props.readonly) return
      tool.value = 'adjust'
      if (selectedRegion.value) {
        return
      } else {
        ElMessage.info('请先点击一个已有框选框，再进行调整')
      }
      return
    }

    if (command === 'editRegion') {
      if (!selectedRegion.value || props.readonly) {
        ElMessage.warning('请先选择一个框选区域')
        return
      }
      openSelectedRegionDialog()
      return
    }

    if (command === 'deleteRegion') {
      if (!selectedRegion.value || props.readonly) {
        ElMessage.warning('请先选择一个框选区域')
        return
      }
      deleteRegion(selectedRegion.value.id)
      return
    }

    if (command === 'zoomIn') {
      setScale(view.scale * 1.12)
      return
    }

    if (command === 'zoomOut') {
      setScale(view.scale * 0.9)
      return
    }

    if (command === 'fitView') {
      fitView(true)
      return
    }

    if (command === 'resetView') {
      resetView()
      return
    }

    if (command === 'moveUp') {
      nudgeViewport(0, -60)
      return
    }

    if (command === 'moveDown') {
      nudgeViewport(0, 60)
      return
    }

    if (command === 'moveLeft') {
      nudgeViewport(-60, 0)
      return
    }

    if (command === 'moveRight') {
      nudgeViewport(60, 0)
    }
  }

  function handleStageMouseDown(event: MouseEvent) {
    if (!imageLoaded.value || !viewportRef.value || props.interactionLocked) return
    closeRegionContextMenu()
    if (event.button !== 0) return

    if (tool.value === 'pan') {
      interaction.mode = 'pan'
      interaction.startClientX = event.clientX
      interaction.startClientY = event.clientY
      interaction.startOffsetX = view.offsetX
      interaction.startOffsetY = view.offsetY
      interaction.moved = false
      event.preventDefault()
      return
    }

    if (props.readonly || tool.value !== 'draw') return
    if ((event.target as HTMLElement).closest('.region-box')) return
    if (
      stageRef.value &&
      !(event.target instanceof Node && stageRef.value.contains(event.target))
    ) {
      return
    }

    const point = getRelativePoint(event)
    if (!point) return
    selectedRegionId.value = ''

    interaction.mode = 'draw'
    interaction.startX = point.x
    interaction.startY = point.y
    interaction.moved = false
    draftRegion.value = {
      id: createRegionId(),
      questionNo: '',
      questionType: '',
      knowledgePoint: '',
      questionText: '',
      score: null,
      sortOrder: localRegions.value.length + 1,
      x: point.x,
      y: point.y,
      width: 0,
      height: 0
    }
    event.preventDefault()
  }

  function handleRegionMouseDown(region: PaperRegionItem, event: MouseEvent) {
    if (props.interactionLocked) return
    closeRegionContextMenu()
    selectedRegionId.value = region.id
    if (event.button !== 0) return
    if (props.readonly || tool.value !== 'adjust') return

    const point = getRelativePoint(event)
    if (!point) return

    interaction.mode = 'move'
    interaction.regionId = region.id
    interaction.startX = point.x
    interaction.startY = point.y
    interaction.startClientX = event.clientX
    interaction.startClientY = event.clientY
    interaction.moved = false
    interaction.startRegion = {
      x: region.x,
      y: region.y,
      width: region.width,
      height: region.height
    }
    event.preventDefault()
  }

  function handleResizeHandleMouseDown(
    region: PaperRegionItem,
    direction: ResizeDirection,
    event: MouseEvent
  ) {
    if (props.interactionLocked || props.readonly || tool.value !== 'adjust') return
    closeRegionContextMenu()
    if (event.button !== 0) return
    const point = getRelativePoint(event)
    if (!point) return

    selectedRegionId.value = region.id
    interaction.mode = 'resize'
    interaction.regionId = region.id
    interaction.resizeDirection = direction
    interaction.startX = point.x
    interaction.startY = point.y
    interaction.startClientX = event.clientX
    interaction.startClientY = event.clientY
    interaction.moved = false
    interaction.startRegion = {
      x: region.x,
      y: region.y,
      width: region.width,
      height: region.height
    }
  }

  function handleRegionClick(region: PaperRegionItem) {
    selectedRegionId.value = region.id
    if (suppressClickRegionId.value === region.id) {
      suppressClickRegionId.value = ''
      return
    }
    closeRegionContextMenu()
  }

  function handleRegionMouseLeave(region: PaperRegionItem) {
    if (hoveredRegionId.value === region.id) {
      hoveredRegionId.value = ''
    }
  }

  function handleRegionContextMenu(region: PaperRegionItem, event: MouseEvent) {
    if (props.interactionLocked || props.readonly || !viewportRef.value) return
    selectedRegionId.value = region.id
    hoveredRegionId.value = region.id
    const rect = viewportRef.value.getBoundingClientRect()
    regionContextMenu.visible = true
    regionContextMenu.regionId = region.id
    const nextX = event.clientX - rect.left + 12
    const nextY = event.clientY - rect.top + 12
    regionContextMenu.x = Math.max(8, Math.min(nextX, rect.width - 152))
    regionContextMenu.y = Math.max(8, Math.min(nextY, rect.height - 92))
  }

  function handleViewportContextMenu() {
    if (props.interactionLocked) return
    closeRegionContextMenu()
  }

  function closeRegionContextMenu() {
    regionContextMenu.visible = false
    regionContextMenu.regionId = ''
  }

  function handleWindowMouseDown(event: MouseEvent) {
    if (!regionContextMenu.visible) return
    const target = event.target as Node | null
    if (target && contextMenuRef.value?.contains(target)) {
      return
    }
    closeRegionContextMenu()
  }

  function handleContextMenuCommand(command: 'edit' | 'delete') {
    const targetRegion = localRegions.value.find((item) => item.id === regionContextMenu.regionId)
    closeRegionContextMenu()
    if (!targetRegion) return
    selectedRegionId.value = targetRegion.id
    if (command === 'edit') {
      openRegionDialog(targetRegion)
      return
    }
    deleteRegion(targetRegion.id)
  }

  function handleWindowMouseMove(event: MouseEvent) {
    if (!interaction.mode || props.interactionLocked) return

    if (interaction.mode === 'pan') {
      interaction.moved = true
      view.offsetX = interaction.startOffsetX + (event.clientX - interaction.startClientX)
      view.offsetY = interaction.startOffsetY + (event.clientY - interaction.startClientY)
      view.hasManualViewport = true
      normalizeOffsets()
      return
    }

    const point = getRelativePoint(event)
    if (!point) return

    if (interaction.mode === 'draw' && draftRegion.value) {
      interaction.moved = true
      const x = Math.min(interaction.startX, point.x)
      const y = Math.min(interaction.startY, point.y)
      const width = Math.abs(point.x - interaction.startX)
      const height = Math.abs(point.y - interaction.startY)
      draftRegion.value = {
        ...draftRegion.value,
        x,
        y,
        width: clampUnit(width),
        height: clampUnit(height)
      }
      return
    }

    if (interaction.mode === 'move' && interaction.regionId) {
      const target = localRegions.value.find((item) => item.id === interaction.regionId)
      if (!target) return
      const dx = point.x - interaction.startX
      const dy = point.y - interaction.startY
      if (
        Math.abs(event.clientX - interaction.startClientX) > 2 ||
        Math.abs(event.clientY - interaction.startClientY) > 2
      ) {
        interaction.moved = true
      }
      target.x = clampUnit(target.x + dx)
      target.y = clampUnit(target.y + dy)
      if (target.x + target.width > 1) {
        target.x = clampUnit(1 - target.width)
      }
      if (target.y + target.height > 1) {
        target.y = clampUnit(1 - target.height)
      }
      interaction.startX = point.x
      interaction.startY = point.y
      emitRegions()
      return
    }

    if (interaction.mode === 'resize' && interaction.regionId && interaction.resizeDirection) {
      const target = localRegions.value.find((item) => item.id === interaction.regionId)
      if (!target) return
      if (
        Math.abs(event.clientX - interaction.startClientX) > 2 ||
        Math.abs(event.clientY - interaction.startClientY) > 2
      ) {
        interaction.moved = true
      }
      applyResize(target, point)
      emitRegions()
    }
  }

  function handleWindowMouseUp() {
    if (!interaction.mode) return

    if (interaction.mode === 'draw' && draftRegion.value) {
      const { width, height } = draftRegion.value
      if (width >= 0.01 && height >= 0.01) {
        const sortOrder = localRegions.value.length + 1
        const region: PaperRegionItem = {
          ...draftRegion.value,
          questionNo: normalizeQuestionNo('', nextQuestionIndex()),
          sortOrder
        }
        localRegions.value = [...localRegions.value, region]
        selectedRegionId.value = region.id
        hoveredRegionId.value = region.id
        emitRegions()
      }
      draftRegion.value = null
    }

    if (interaction.mode === 'move' && interaction.moved) {
      suppressClickRegionId.value = interaction.regionId
    }

    if (interaction.mode === 'resize' && interaction.moved) {
      suppressClickRegionId.value = interaction.regionId
    }

    interaction.mode = null
    interaction.regionId = ''
    interaction.moved = false
    interaction.resizeDirection = ''
  }

  function openRegionDialog(region: PaperRegionItem) {
    closeRegionContextMenu()
    editingRegionId.value = region.id
    regionForm.questionNo = region.questionNo || ''
    regionForm.questionType = region.questionType || ''
    regionForm.knowledgePoint = region.knowledgePoint || ''
    regionForm.questionText = region.questionText || ''
    regionForm.score = region.score ?? null
    regionDialogVisible.value = true
  }

  function openSelectedRegionDialog() {
    if (selectedRegion.value) {
      openRegionDialog(selectedRegion.value)
    }
  }

  function saveRegionMeta() {
    const target = localRegions.value.find((item) => item.id === editingRegionId.value)
    if (!target) {
      regionDialogVisible.value = false
      return
    }
    target.questionNo = normalizeQuestionNo(regionForm.questionNo.trim(), target.sortOrder)
    target.questionType = regionForm.questionType.trim()
    target.knowledgePoint = regionForm.knowledgePoint.trim()
    target.questionText = regionForm.questionText.trim()
    target.score = regionForm.score ?? null
    emitRegions()
    regionDialogVisible.value = false
  }

  function handleRegionOcr() {
    const target = localRegions.value.find((item) => item.id === editingRegionId.value)
    if (!target) {
      ElMessage.warning('当前未找到可识别的题框')
      return
    }
    emit('ocr-region', { ...target })
  }

  function applyOcrRegionMeta(payload: {
    questionText?: string
    questionType?: string
    score?: number | null
  }) {
    const target = localRegions.value.find((item) => item.id === editingRegionId.value)
    if (!target) {
      return
    }
    if (payload.questionText && payload.questionText.trim()) {
      const nextText = payload.questionText.trim()
      regionForm.questionText = nextText
      target.questionText = nextText
    }
    if (payload.questionType && payload.questionType.trim()) {
      const nextType = payload.questionType.trim()
      regionForm.questionType = nextType
      target.questionType = nextType
    }
    if (payload.score !== undefined && payload.score !== null) {
      regionForm.score = payload.score
      target.score = payload.score
    }
    emitRegions()
  }

  function deleteRegion(regionId: string) {
    localRegions.value = localRegions.value
      .filter((item) => item.id !== regionId)
      .map((item, index) => ({ ...item, sortOrder: index + 1 }))
    selectedRegionId.value = localRegions.value[0]?.id || ''
    if (hoveredRegionId.value === regionId) {
      hoveredRegionId.value = ''
    }
    closeRegionContextMenu()
    emitRegions()
  }

  function applyResize(target: PaperRegionItem, point: { x: number; y: number }) {
    const dx = point.x - interaction.startX
    const dy = point.y - interaction.startY
    const source = interaction.startRegion

    let nextX = source.x
    let nextY = source.y
    let nextWidth = source.width
    let nextHeight = source.height

    if (interaction.resizeDirection.includes('w')) {
      nextX = source.x + dx
      nextWidth = source.width - dx
    }
    if (interaction.resizeDirection.includes('e')) {
      nextWidth = source.width + dx
    }
    if (interaction.resizeDirection.includes('n')) {
      nextY = source.y + dy
      nextHeight = source.height - dy
    }
    if (interaction.resizeDirection.includes('s')) {
      nextHeight = source.height + dy
    }

    if (nextWidth < MIN_REGION_SIZE) {
      if (interaction.resizeDirection.includes('w')) {
        nextX = source.x + source.width - MIN_REGION_SIZE
      }
      nextWidth = MIN_REGION_SIZE
    }

    if (nextHeight < MIN_REGION_SIZE) {
      if (interaction.resizeDirection.includes('n')) {
        nextY = source.y + source.height - MIN_REGION_SIZE
      }
      nextHeight = MIN_REGION_SIZE
    }

    if (nextX < 0) {
      nextWidth += nextX
      nextX = 0
    }
    if (nextY < 0) {
      nextHeight += nextY
      nextY = 0
    }
    if (nextX + nextWidth > 1) {
      nextWidth = 1 - nextX
    }
    if (nextY + nextHeight > 1) {
      nextHeight = 1 - nextY
    }

    target.x = clampUnit(nextX)
    target.y = clampUnit(nextY)
    target.width = clampUnit(Math.max(nextWidth, MIN_REGION_SIZE))
    target.height = clampUnit(Math.max(nextHeight, MIN_REGION_SIZE))
  }
</script>

<style scoped lang="scss">
  .paper-region-editor {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    height: 100%;
    min-height: 0;
    padding: 16px;
    background: linear-gradient(180deg, #f8fbff 0%, #f2f6fb 100%);

    &.no-toolbar {
      padding: 0;
      gap: 0;
      background: #f5f7fa;
    }
  }

  .editor-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 16px;
    border: 1px solid #dbe7f5;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
    flex-wrap: wrap;
  }

  .toolbar-left,
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .hint-pill {
    height: 32px;
    padding: 0 12px;
    border: 1px solid #dbe7f5;
    background: #f8fbff;
    color: #3b82f6;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: help;
    font-size: 13px;
    font-weight: 600;
  }

  .toolbox-trigger {
    :deep(.el-icon) {
      margin-right: 6px;
    }
  }

  .toolbox-arrow {
    margin-left: 6px;
    margin-right: 0;
  }

  .scale-indicator {
    min-width: 62px;
    height: 32px;
    padding: 0 12px;
    border-radius: 999px;
    background: #eff6ff;
    color: #1d4ed8;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
  }

  .current-tool-pill {
    height: 32px;
    padding: 0 14px;
    border-radius: 999px;
    background: #f8fafc;
    border: 1px solid #dbe7f5;
    color: #475569;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
  }

  .subject-badge {
    height: 32px;
    padding: 0 14px;
    border-radius: 10px;
    background: rgba(59, 130, 246, 0.12);
    color: #2563eb;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
  }

  .canvas-viewport {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    border-radius: 20px;
    border: 1px solid #d8e3f0;
    background:
      radial-gradient(circle at top, rgba(59, 130, 246, 0.08), transparent 28%),
      linear-gradient(180deg, #f8fafc 0%, #edf3f8 100%);
    cursor: crosshair;

    &.tool-pan {
      cursor: grab;
    }

    &.tool-select,
    &.readonly {
      cursor: default;
    }

    &.locked {
      cursor: not-allowed;
    }
  }

  .image-stage {
    position: absolute;
    top: 0;
    left: 0;
    box-shadow: 0 24px 50px rgba(15, 23, 42, 0.18);
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
    opacity: 0;
    transition: opacity 0.2s ease;

    &.ready {
      opacity: 1;
    }
  }

  .paper-image {
    display: block;
    width: 100%;
    height: auto;
    user-select: none;
    -webkit-user-drag: none;
  }

  .overlay-layer {
    position: absolute;
    inset: 0;
  }

  .region-context-menu {
    position: absolute;
    z-index: 30;
    min-width: 140px;
    padding: 6px;
    border-radius: 12px;
    border: 1px solid rgba(148, 163, 184, 0.35);
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 16px 32px rgba(15, 23, 42, 0.18);
    backdrop-filter: blur(10px);
  }

  .context-menu-item {
    width: 100%;
    height: 34px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: #1f2937;
    font-size: 13px;
    font-weight: 600;
    text-align: left;
    padding: 0 12px;
    cursor: pointer;

    &:hover {
      background: #eff6ff;
      color: #1d4ed8;
    }

    &.danger:hover {
      background: #fef2f2;
      color: #dc2626;
    }
  }

  .region-box {
    position: absolute;
    border: 2px solid #2563eb;
    background: rgba(37, 99, 235, 0.14);
    border-radius: 8px;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 4px 6px;
    text-align: left;
    overflow: hidden;
    cursor: pointer;

    &.selected {
      border-color: #f97316;
      background: rgba(249, 115, 22, 0.18);
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.18);
    }

    &.editable {
      cursor: move;
    }

    &.draft {
      border-style: dashed;
      pointer-events: none;
    }

    &.readonly {
      cursor: default;
    }

    &.incomplete {
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.14);
    }
  }

  .region-label {
    max-width: 100%;
    font-size: 12px;
    line-height: 1.35;
    font-weight: 600;
    color: #1e3a8a;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.86);
    padding: 2px 6px;
    border-radius: 999px;
  }

  .resize-handle {
    position: absolute;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid #fff;
    background: #f97316;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.2);

    &.is-nw {
      top: -7px;
      left: -7px;
      cursor: nwse-resize;
    }

    &.is-ne {
      top: -7px;
      right: -7px;
      cursor: nesw-resize;
    }

    &.is-sw {
      bottom: -7px;
      left: -7px;
      cursor: nesw-resize;
    }

    &.is-se {
      right: -7px;
      bottom: -7px;
      cursor: nwse-resize;
    }
  }

  .canvas-placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    font-size: 14px;
    letter-spacing: 0.02em;
  }

  .region-form {
    :deep(.el-form-item) {
      margin-bottom: 16px;

      .el-form-item__label {
        font-weight: 600;
        color: #475569;
        padding-bottom: 8px;
      }
    }
  }

  .property-dialog {
    :deep(.el-dialog) {
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    :deep(.el-dialog__header) {
      margin-right: 0;
      padding: 24px 24px 12px;
      border-bottom: 1px solid #f1f5f9;

      .el-dialog__title {
        font-size: 18px;
        font-weight: 700;
        color: #1e293b;
      }
    }

    :deep(.el-dialog__body) {
      padding: 0;
      overflow: hidden;
    }

    :deep(.el-dialog__footer) {
      padding: 16px 24px 24px;
      border-top: 1px solid #f1f5f9;
    }
  }

  .split-layout {
    display: flex;
    height: 560px;
    background: #fff;
  }

  .layout-left {
    width: 360px;
    padding: 24px;
    border-right: 1px solid #f1f5f9;
    background: #fbfcfe;
    overflow-y: auto;
  }

  .layout-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 24px;
    gap: 20px;
    background: #fff;
    min-width: 0;
  }

  .content-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .section-header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }

  .section-ocr-btn {
    margin-left: auto;
  }

  .section-title {
    font-size: 15px;
    font-weight: 700;
    color: #334155;
  }

  .section-tips {
    font-size: 12px;
    color: #94a3b8;
  }

  .question-editor {
    flex: 1;
    :deep(.el-textarea__inner) {
      height: 100% !important;
      border-radius: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      font-family: inherit;
      padding: 12px;
      transition: all 0.2s;

      &:focus {
        background: #fff;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    }
  }

  .preview-container {
    flex: 1;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: #fff;
    overflow-y: auto;
    padding: 16px;
  }

  .preview-content {
    font-size: 14px;
    line-height: 1.6;
    color: #1e293b;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    .el-button {
      border-radius: 10px;
      padding: 10px 24px;
      font-weight: 600;

      &--primary {
        background: #3b82f6;
        border: none;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);

        &:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }
      }
    }
  }

  @media (max-width: 960px) {
    .paper-region-editor {
      padding: 12px;
    }

    .editor-toolbar {
      padding: 12px;
      border-radius: 14px;
    }

    .toolbar-left,
    .toolbar-right {
      width: 100%;
    }

    .canvas-viewport {
      border-radius: 16px;
    }
  }
</style>
