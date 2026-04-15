<template>
  <div class="paper-region-editor" :class="{ readonly }">
    <div v-if="!readonly" class="editor-toolbar">
      <div class="tool-group">
        <el-button
          size="small"
          :type="tool === 'draw' ? 'primary' : 'default'"
          @click="tool = 'draw'"
        >
          框选框
        </el-button>
        <el-button
          size="small"
          :type="tool === 'pan' ? 'primary' : 'default'"
          @click="tool = 'pan'"
        >
          移动画布
        </el-button>
        <el-button
          size="small"
          :type="tool === 'select' ? 'primary' : 'default'"
          @click="tool = 'select'"
        >
          选择题目
        </el-button>
      </div>
      <div class="tool-actions">
        <el-button size="small" :disabled="!selectedRegion" @click="openSelectedRegionDialog">
          题目属性
        </el-button>
        <el-button size="small" :disabled="!selectedRegion" @click="deleteSelectedRegion">
          删除框选
        </el-button>
        <el-button size="small" type="primary" @click="emit('save', cloneRegions(localRegions))">
          保存坐标
        </el-button>
      </div>
    </div>

    <div v-else class="readonly-toolbar">当前为只读预览，展示样板答题卡的框选结果</div>

    <div
      ref="scrollRef"
      class="canvas-scroll"
      :class="[`tool-${tool}`, { readonly }]"
      @mousedown="handleStageMouseDown"
    >
      <div ref="stageRef" class="image-stage">
        <img :src="imageUrl" alt="试卷标注图" class="paper-image" draggable="false" />

        <div class="overlay-layer">
          <button
            v-for="region in localRegions"
            :key="region.id"
            type="button"
            class="region-box"
            :class="{
              selected: selectedRegionId === region.id,
              readonly,
              incomplete: !region.questionNo
            }"
            :style="regionStyle(region)"
            @mousedown.stop="handleRegionMouseDown(region, $event)"
            @click.stop="handleRegionClick(region)"
          >
            <span class="region-label">{{ regionLabel(region) }}</span>
          </button>

          <div v-if="draftRegion" class="region-box draft" :style="regionStyle(draftRegion)">
            <span class="region-label">新建框选</span>
          </div>
        </div>
      </div>
    </div>

    <div class="editor-tip">
      <span v-if="readonly">考生原卷会复用样板答题卡的框选坐标，只能查看不能编辑。</span>
      <span v-else-if="tool === 'draw'">拖拽创建题目框选，创建后会自动弹出题目属性设置。</span>
      <span v-else-if="tool === 'pan'">按住鼠标拖动画布，便于查看大图不同区域。</span>
      <span v-else>点击已有框选可编辑属性，拖动框选可微调位置。</span>
    </div>

    <el-dialog
      v-model="regionDialogVisible"
      title="题目属性设置"
      width="520px"
      append-to-body
      destroy-on-close
    >
      <el-form label-position="top" class="region-form">
        <el-form-item label="题号">
          <el-input v-model="regionForm.questionNo" placeholder="如：第1题 / 1 / 一(1)" />
        </el-form-item>
        <el-form-item label="题型">
          <el-select v-model="regionForm.questionType" placeholder="请选择题型" style="width: 100%">
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
            :rows="3"
            placeholder="请输入该题对应知识点，可填写多个"
          />
        </el-form-item>
        <el-form-item label="分值">
          <el-input-number
            v-model="regionForm.score"
            :min="0"
            :precision="1"
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="regionForm.remark"
            type="textarea"
            :rows="3"
            placeholder="可补充题目说明、切割备注等"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="regionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRegionMeta">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
  import type { PaperRegionItem } from '@/api/core-business/exam/project-editor'

  type RegionTool = 'draw' | 'pan' | 'select'
  type InteractionMode = 'draw' | 'pan' | 'move' | null

  const props = withDefaults(
    defineProps<{
      imageUrl: string
      regions?: PaperRegionItem[]
      readonly?: boolean
    }>(),
    {
      regions: () => [],
      readonly: false
    }
  )

  const emit = defineEmits<{
    'update:regions': [value: PaperRegionItem[]]
    save: [value: PaperRegionItem[]]
  }>()

  const scrollRef = ref<HTMLElement>()
  const stageRef = ref<HTMLElement>()
  const tool = ref<RegionTool>(props.readonly ? 'select' : 'draw')
  const localRegions = ref<PaperRegionItem[]>([])
  const draftRegion = ref<PaperRegionItem | null>(null)
  const selectedRegionId = ref('')
  const suppressClickRegionId = ref('')
  const regionDialogVisible = ref(false)
  const editingRegionId = ref('')

  const regionForm = reactive({
    questionNo: '',
    questionType: '',
    knowledgePoint: '',
    score: null as number | null,
    remark: ''
  })

  const interaction = reactive({
    mode: null as InteractionMode,
    startX: 0,
    startY: 0,
    startClientX: 0,
    startClientY: 0,
    moved: false,
    scrollLeft: 0,
    scrollTop: 0,
    regionId: ''
  })

  const selectedRegion = computed(
    () => localRegions.value.find((item) => item.id === selectedRegionId.value) || null
  )

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
      if (readonly) {
        tool.value = 'select'
      }
    },
    { immediate: true }
  )

  onMounted(() => {
    window.addEventListener('mousemove', handleWindowMouseMove)
    window.addEventListener('mouseup', handleWindowMouseUp)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', handleWindowMouseMove)
    window.removeEventListener('mouseup', handleWindowMouseUp)
  })

  function cloneRegions(regions: PaperRegionItem[]) {
    return (regions || []).map((item, index) => ({
      id: item.id || createRegionId(),
      questionNo: item.questionNo || '',
      questionType: item.questionType || '',
      knowledgePoint: item.knowledgePoint || '',
      score: item.score ?? null,
      remark: item.remark || '',
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

  function getRelativePoint(event: MouseEvent) {
    const rect = stageRef.value?.getBoundingClientRect()
    if (!rect || rect.width <= 0 || rect.height <= 0) return null
    const x = clampUnit((event.clientX - rect.left) / rect.width)
    const y = clampUnit((event.clientY - rect.top) / rect.height)
    return { x, y }
  }

  function handleStageMouseDown(event: MouseEvent) {
    if (props.readonly || !stageRef.value) return

    if (tool.value === 'pan') {
      interaction.mode = 'pan'
      interaction.startClientX = event.clientX
      interaction.startClientY = event.clientY
      interaction.scrollLeft = scrollRef.value?.scrollLeft || 0
      interaction.scrollTop = scrollRef.value?.scrollTop || 0
      interaction.moved = false
      event.preventDefault()
      return
    }

    if (tool.value !== 'draw') return
    if ((event.target as HTMLElement).closest('.region-box')) return

    const point = getRelativePoint(event)
    if (!point) return

    interaction.mode = 'draw'
    interaction.startX = point.x
    interaction.startY = point.y
    interaction.moved = false
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
    }
    event.preventDefault()
  }

  function handleRegionMouseDown(region: PaperRegionItem, event: MouseEvent) {
    selectedRegionId.value = region.id
    if (props.readonly || tool.value !== 'select') return

    const point = getRelativePoint(event)
    if (!point) return

    interaction.mode = 'move'
    interaction.regionId = region.id
    interaction.startX = point.x
    interaction.startY = point.y
    interaction.startClientX = event.clientX
    interaction.startClientY = event.clientY
    interaction.moved = false
    event.preventDefault()
  }

  function handleRegionClick(region: PaperRegionItem) {
    selectedRegionId.value = region.id
    if (props.readonly || tool.value !== 'select') return
    if (suppressClickRegionId.value === region.id) {
      suppressClickRegionId.value = ''
      return
    }
    openRegionDialog(region)
  }

  function handleWindowMouseMove(event: MouseEvent) {
    if (!interaction.mode) return

    if (interaction.mode === 'pan') {
      interaction.moved = true
      if (scrollRef.value) {
        scrollRef.value.scrollLeft =
          interaction.scrollLeft - (event.clientX - interaction.startClientX)
        scrollRef.value.scrollTop =
          interaction.scrollTop - (event.clientY - interaction.startClientY)
      }
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
    }
  }

  function handleWindowMouseUp() {
    if (!interaction.mode) return

    if (interaction.mode === 'draw' && draftRegion.value) {
      const { width, height } = draftRegion.value
      if (width >= 0.01 && height >= 0.01) {
        const region: PaperRegionItem = {
          ...draftRegion.value,
          questionNo: `第${localRegions.value.length + 1}题`,
          sortOrder: localRegions.value.length + 1
        }
        localRegions.value = [...localRegions.value, region]
        selectedRegionId.value = region.id
        emitRegions()
        nextTick(() => openRegionDialog(region))
      }
      draftRegion.value = null
    }

    if (interaction.mode === 'move' && interaction.moved) {
      suppressClickRegionId.value = interaction.regionId
    }

    interaction.mode = null
    interaction.regionId = ''
    interaction.moved = false
  }

  function openRegionDialog(region: PaperRegionItem) {
    editingRegionId.value = region.id
    regionForm.questionNo = region.questionNo || ''
    regionForm.questionType = region.questionType || ''
    regionForm.knowledgePoint = region.knowledgePoint || ''
    regionForm.score = region.score ?? null
    regionForm.remark = region.remark || ''
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
    target.questionNo = regionForm.questionNo.trim()
    target.questionType = regionForm.questionType.trim()
    target.knowledgePoint = regionForm.knowledgePoint.trim()
    target.score = regionForm.score ?? null
    target.remark = regionForm.remark.trim()
    emitRegions()
    regionDialogVisible.value = false
  }

  function deleteSelectedRegion() {
    if (!selectedRegion.value) return
    localRegions.value = localRegions.value
      .filter((item) => item.id !== selectedRegion.value?.id)
      .map((item, index) => ({ ...item, sortOrder: index + 1 }))
    selectedRegionId.value = localRegions.value[0]?.id || ''
    emitRegions()
  }
</script>

<style scoped lang="scss">
  .paper-region-editor {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
    min-height: 0;
  }

  .editor-toolbar,
  .readonly-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #fff;
  }

  .readonly-toolbar {
    justify-content: flex-start;
    color: #64748b;
    font-size: 13px;
  }

  .tool-group,
  .tool-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .canvas-scroll {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 20px;
    border-radius: 16px;
    background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
    border: 1px solid #e2e8f0;
    cursor: crosshair;

    &.tool-pan {
      cursor: grab;
    }

    &.tool-select {
      cursor: default;
    }

    &.readonly {
      cursor: default;
    }
  }

  .image-stage {
    position: relative;
    width: fit-content;
    max-width: 100%;
    margin: 0 auto;
    box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
  }

  .paper-image {
    display: block;
    max-width: min(100%, 1100px);
    width: auto;
    height: auto;
    user-select: none;
    -webkit-user-drag: none;
  }

  .overlay-layer {
    position: absolute;
    inset: 0;
  }

  .region-box {
    position: absolute;
    border: 2px solid #2563eb;
    background: rgba(37, 99, 235, 0.14);
    border-radius: 6px;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 4px 6px;
    text-align: left;
    overflow: hidden;
    cursor: pointer;

    &.selected {
      border-color: #f97316;
      background: rgba(249, 115, 22, 0.16);
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.14);
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
    background: rgba(255, 255, 255, 0.82);
    padding: 2px 6px;
    border-radius: 999px;
  }

  .editor-tip {
    color: #64748b;
    font-size: 13px;
    padding: 0 4px;
  }

  .region-form {
    :deep(.el-form-item) {
      margin-bottom: 16px;
    }
  }

  @media (max-width: 960px) {
    .editor-toolbar {
      flex-direction: column;
      align-items: stretch;
    }

    .tool-group,
    .tool-actions {
      width: 100%;
    }

    .paper-image {
      max-width: 100%;
    }
  }
</style>
