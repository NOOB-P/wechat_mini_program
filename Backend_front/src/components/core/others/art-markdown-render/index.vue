<template>
  <div class="art-markdown-render" v-html="renderedHtml"></div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'

  const props = defineProps<{
    content: string
  }>()

  const renderedHtml = ref('')
  let markedLib: (typeof import('marked'))['marked'] | null = null
  let katexLib: (typeof import('katex'))['default'] | null = null
  let katexCssLoaded = false

  const ensureRenderer = async () => {
    if (!markedLib) {
      const markedModule = await import('marked')
      markedLib = markedModule.marked
    }
    if (!katexLib) {
      const katexModule = await import('katex')
      katexLib = katexModule.default
    }
    if (!katexCssLoaded) {
      await import('katex/dist/katex.min.css')
      katexCssLoaded = true
    }
  }

  const renderContent = async () => {
    if (!props.content) {
      renderedHtml.value = ''
      return
    }

    await ensureRenderer()
    if (!markedLib || !katexLib) {
      renderedHtml.value = props.content
      return
    }
    const marked = markedLib
    const katex = katexLib

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
          strict: false,
          output: 'html'
        })

        const placeholder = `@@LATEX_PH_${placeholders.length}@@`
        placeholders.push(displayMode ? `<span class="katex-display-wrapper">${rendered}</span>` : rendered)
        return placeholder
      } catch {
        return formula
      }
    }

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
    } catch {
      finalHtml = content
    }

    placeholders.forEach((html, i) => {
      finalHtml = finalHtml.replace(`@@LATEX_PH_${i}@@`, html)
    })

    renderedHtml.value = finalHtml
  }

  watch(
    () => props.content,
    () => {
      renderContent()
    },
    { immediate: true }
  )
</script>

<style lang="scss">
  .art-markdown-render {
    font-size: 15px;
    line-height: 1.8;
    color: #1e293b;
    word-break: break-all;

    p {
      margin-bottom: 12px;
      &:last-child {
        margin-bottom: 0;
      }
    }

    /* 移除强制换行的包装器，改为行内块，避免在 Markdown 段落中造成大面积空白 */
    .katex-display-wrapper {
      display: inline-block;
      vertical-align: middle;
      margin: 4px 8px;
      max-width: 100%;
      overflow-x: auto;
      overflow-y: hidden;

      .katex-display {
        display: inline-block;
        margin: 0;
        padding: 0;
        vertical-align: middle;
      }

      .katex {
        white-space: nowrap;
      }
    }

    .katex {
      font-size: 1.05em;
      text-indent: 0;
      display: inline-block;
      vertical-align: middle;
    }

    /* 优化公式中的图片或特殊符号 */
    .katex-html {
      line-height: 1.2;
    }
  }
</style>
