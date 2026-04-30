<template>
  <view class="markdown-render">
    <rich-text :nodes="renderedHtml"></rich-text>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { marked } from 'marked'
import katex from 'katex'

const props = defineProps<{
  content: string
}>()

const renderedHtml = ref('')

const renderContent = () => {
  if (!props.content) {
    renderedHtml.value = ''
    return
  }

  let content = props.content
  const placeholders: string[] = []

  const renderMath = (formula: string, displayMode: boolean) => {
    try {
      let fixedFormula = formula.trim()
      const leftCount = (fixedFormula.match(/\\left/g) || []).length
      const rightCount = (fixedFormula.match(/\\right/g) || []).length
      if (leftCount > rightCount) {
        fixedFormula += ' \\right.'.repeat(leftCount - rightCount)
      } else if (rightCount > leftCount) {
        fixedFormula = ' \\left. '.repeat(rightCount - leftCount) + fixedFormula
      }
      fixedFormula = fixedFormula.replace(/\\right\.(\d+)/g, '\\right. $1')
      fixedFormula = fixedFormula.replace(/([\u4e00-\u9fa5]+)/g, '\\text{$1}')

      const rendered = katex.renderToString(fixedFormula, {
        displayMode,
        throwOnError: false,
        trust: true,
        strict: false
      })

      const placeholder = `@@LATEX_PH_${placeholders.length}@@`
      // 使用 span 包装以支持行内显示，即使是 displayMode 也可以通过 inline-block 控制
      placeholders.push(displayMode ? `<span class="katex-display-wrapper">${rendered}</span>` : rendered)
      return placeholder
    } catch (e) {
      console.error('KaTeX error:', e)
      return formula
    }
  }

  // 替换公式为占位符
  content = content.replace(/\$\$(.*?)\$\$/gs, (_, f) => renderMath(f, true))
  content = content.replace(/\\\[(.*?)\\\]/gs, (_, f) => renderMath(f, true))
  content = content.replace(/\$(.*?)\$/g, (_, f) => renderMath(f, false))
  content = content.replace(/\\\((.*?)\\\)/g, (_, f) => renderMath(f, false))

  let finalHtml = ''
  try {
    marked.setOptions({
      breaks: true,
      gfm: true
    })
    finalHtml = marked.parse(content) as string
  } catch (e) {
    console.error('Marked error:', e)
    finalHtml = content
  }

  // 还原占位符
  placeholders.forEach((html, i) => {
    finalHtml = finalHtml.replace(`@@LATEX_PH_${i}@@`, html)
  })

  // 在小程序中，rich-text 对一些标签的支持有限，需要做一些兼容性处理
  // 例如，将一些复杂的 KaTeX 结构稍微简化或确保其使用的类名在样式中定义
  renderedHtml.value = finalHtml
}

watch(
  () => props.content,
  () => {
    renderContent()
  },
  { immediate: true }
)

onMounted(() => {
  renderContent()
})
</script>

<style lang="scss">
@import '@/style/katex-mini.css';
@import '@/style/katex-fix.scss';

.markdown-render {
  font-size: 28rpx;
  line-height: 1.6;
  color: #1e293b;
  word-break: break-all;

  p {
    margin-bottom: 20rpx;
    &:last-child {
      margin-bottom: 0;
    }
  }

  .katex-display-wrapper {
    display: inline-block;
    margin: 10rpx 10rpx;
    text-align: center;
    max-width: 100%;
    vertical-align: middle;

    .katex-display {
      display: inline-block;
      margin: 0;
      padding: 0;
    }
  }

  .katex {
    font-size: 1.1em;
    text-indent: 0;
    display: inline-block;
    vertical-align: middle;
    line-height: 1;
    white-space: nowrap;
  }

  .katex-html {
    display: inline-block;
    line-height: 1.1;
    vertical-align: middle;
  }
  
  /* 解决小程序中 rich-text 可能存在的样式隔离和位移问题 */
  :deep(.katex) {
    display: inline-block !important;
    white-space: nowrap !important;
    vertical-align: middle !important;
  }

  :deep(.katex-html) {
    display: inline-block !important;
    vertical-align: middle !important;
  }

  /* 修复分数线、根号等位移的关键样式 */
  :deep(.vlist-t) {
    display: inline-table !important;
    vertical-align: middle !important;
  }
  
  :deep(.vlist-r) {
    display: table-row !important;
  }
  
  :deep(.vlist) {
    display: table-cell !important;
    vertical-align: middle !important;
  }

  :deep(.mfrac) {
    display: inline-block !important;
    vertical-align: middle !important;
  }

  :deep(.base) {
    display: inline-block !important;
    vertical-align: middle !important;
  }
}
</style>
