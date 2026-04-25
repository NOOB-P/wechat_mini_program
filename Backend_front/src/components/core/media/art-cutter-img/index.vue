<!-- 图片裁剪组件 github: https://github.com/acccccccb/vue-img-cutter/tree/master -->
<template>
  <el-dialog
    v-model="visible"
    :title="title || '图片裁剪'"
    width="800px"
    align-center
    append-to-body
    destroy-on-close
    class="cutter-dialog"
  >
    <div class="cutter-content">
      <!-- 裁剪区域 -->
      <div class="cutter-main">
        <ImgCutter
          ref="imgCutterRef"
          :isModal="false"
          @cutDown="handleCutDown"
          @onPrintImg="handlePrintImg"
          v-bind="cutterProps"
        >
          <template #choose>
            <div class="empty-placeholder" v-if="!hasImage">
              <el-icon><Plus /></el-icon>
              <span>点击选择图片</span>
            </div>
          </template>
        </ImgCutter>
      </div>

      <!-- 底部预览和操作 -->
      <div class="cutter-footer">
        <div class="preview-area">
          <span class="label">预览展示：</span>
          <div
            class="preview-box"
            :style="{
              width: `${previewWidth}px`,
              height: `${previewHeight}px`
            }"
          >
            <img v-if="temImgPath" :src="temImgPath" class="preview-img" />
            <div v-else class="preview-empty">暂无预览</div>
          </div>
        </div>
        <div class="footer-actions">
          <el-button @click="visible = false">取消</el-button>
          <el-button type="primary" @click="confirmCut" :disabled="!temImgPath">保存图片</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue'
  import ImgCutter from 'vue-img-cutter'
  import { Plus } from '@element-plus/icons-vue'

  defineOptions({ name: 'ArtCutterImg' })

  interface CutterProps {
    /** 标题 */
    title?: string
    /** 裁剪宽度 */
    cutWidth?: number
    /** 裁剪高度 */
    cutHeight?: number
    /** 容器宽度 */
    boxWidth?: number
    /** 容器高度 */
    boxHeight?: number
    /** 图片URL */
    imgUrl?: string
    /** 文件类型 */
    fileType?: 'png' | 'jpeg' | 'webp'
    /** 质量 */
    quality?: number
  }

  const props = withDefaults(defineProps<CutterProps>(), {
    title: '图片裁剪',
    cutWidth: 400,
    cutHeight: 240,
    boxWidth: 700,
    boxHeight: 400,
    fileType: 'jpeg',
    quality: 0.9
  })

  const emit = defineEmits(['confirm', 'cancel', 'update:imgUrl'])

  const visible = ref(false)
  const temImgPath = ref('')
  const imgCutterRef = ref()
  const hasImage = ref(false)
  const cutResult = ref<any>(null)

  // 裁剪器参数
  const cutterProps = computed(() => ({
    label: '选择图片',
    boxWidth: props.boxWidth,
    boxHeight: props.boxHeight,
    cutWidth: props.cutWidth,
    cutHeight: props.cutHeight,
    tool: true,
    sizeChange: false,
    moveAble: true,
    imgMove: true,
    scaleAble: true,
    fileType: props.fileType,
    quality: props.quality
  }))

  // 预览图尺寸（按比例缩小）
  const previewWidth = 160
  const previewHeight = computed(() => (previewWidth * props.cutHeight) / props.cutWidth)

  // 打开弹窗
  const open = (url?: string) => {
    visible.value = true
    if (url) {
      temImgPath.value = url
      hasImage.value = true
    } else {
      temImgPath.value = ''
      hasImage.value = false
    }
  }

  // 处理裁剪实时预览
  const handlePrintImg = (res: any) => {
    temImgPath.value = res.dataURL
    hasImage.value = true
  }

  // 处理裁剪完成
  const handleCutDown = (res: any) => {
    cutResult.value = res
    temImgPath.value = res.dataURL
  }

  // 确认保存
  const confirmCut = () => {
    if (imgCutterRef.value) {
      // 触发裁剪器的确认逻辑以获取最终结果
      // 注意：ImgCutter 在 isModal=false 时，通常通过事件实时获取结果
      // 这里我们直接使用 handleCutDown 存下的结果
      emit('confirm', cutResult.value || { dataURL: temImgPath.value })
      visible.value = false
    }
  }

  defineExpose({ open })
</script>

<style lang="scss" scoped>
  .cutter-dialog {
    :deep(.el-dialog__body) {
      padding: 20px 30px !important;
    }
  }

  .cutter-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .cutter-main {
    background: #f8f8f8;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 350px;

    :deep(.img-cutter-container) {
      border: none !important;
    }

    .empty-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      color: #999;
      cursor: pointer;
      padding: 60px;
      border: 2px dashed #ddd;
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        border-color: var(--el-color-primary);
        color: var(--el-color-primary);
      }

      .el-icon {
        font-size: 40px;
      }
    }
  }

  .cutter-footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding-top: 15px;
    border-top: 1px solid #eee;

    .preview-area {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .label {
        font-size: 14px;
        color: #666;
      }

      .preview-box {
        border: 1px solid #eee;
        background: #f0f0f0;
        border-radius: 4px;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;

        .preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preview-empty {
          font-size: 12px;
          color: #ccc;
        }
      }
    }

    .footer-actions {
      display: flex;
      gap: 12px;
    }
  }

  // 隐藏库自带的版权和按钮
  :deep(.copyright),
  :deep(.i-dialog-footer) {
    display: none !important;
  }
</style>
