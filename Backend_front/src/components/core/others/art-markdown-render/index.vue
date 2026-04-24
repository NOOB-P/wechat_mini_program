<template>
  <div class="art-markdown-render" v-html="renderedHtml"></div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { marked } from 'marked'
  import katex from 'katex'
  import 'katex/dist/katex.min.css'

  const props = defineProps<{
    content: string
  }>()

  const renderedHtml = computed(() => {
    if (!props.content) return ''

    let content = props.content
    const placeholders: string[] = []

    // 辅助函数：修复并渲染 LaTeX
    const renderMath = (formula: string, displayMode: boolean) => {
      try {
        let fixedFormula = formula.trim()
        
        // 1. 基础容错：修复不平衡的 \left 和 \right (OCR 常见错误)
        const leftCount = (fixedFormula.match(/\\left/g) || []).length
        const rightCount = (fixedFormula.match(/\\right/g) || []).length
        if (leftCount > rightCount) {
          fixedFormula += ' \\right.'.repeat(leftCount - rightCount)
        } else if (rightCount > leftCount) {
          fixedFormula = ' \\left. '.repeat(rightCount - leftCount) + fixedFormula
        }

        // 2. 处理 OCR 误识别的特殊情况，例如 \right.3 这种
        fixedFormula = fixedFormula.replace(/\\right\.(\d+)/g, '\\right. $1')

       // 3. 处理公式中的中文，将其包裹在 \text{} 中以确保 KaTeX 正常渲染
        fixedFormula = fixedFormula.replace(/([\u4e00-\u9fa5]+)/g, '\\text{$1}')

        const rendered = katex.renderToString(fixedFormula, {
          displayMode,
          throwOnError: false,
          trust: true,
          strict: false
        })

        const placeholder = `@@LATEX_PH_${placeholders.length}@@`
        const html = displayMode
          ? `<span class="katex-display-wrapper">${rendered}</span>`
          : rendered
        placeholders.push(html)
        return placeholder
      } catch (e) {
        return formula
      }
    }

    // 1. 统一提取各种 LaTeX 格式并替换为占位符
    // 块级公式
    content = content.replace(/\$\$(.*?)\$\$/gs, (_, f) => renderMath(f, true))
    content = content.replace(/\\\[(.*?)\\\]/gs, (_, f) => renderMath(f, true))

    // 行内公式
    content = content.replace(/\$(.*?)\$/g, (_, f) => renderMath(f, false))
    content = content.replace(/\\\((.*?)\\\)/g, (_, f) => renderMath(f, false))

    // 2. 使用 marked 渲染 Markdown
    let finalHtml = ''
    try {
      marked.setOptions({
        breaks: true,
        gfm: true
      })
      // marked 渲染后的内容
      finalHtml = marked.parse(content) as string
    } catch (e) {
      finalHtml = content
    }

    // 4. 将占位符替换回真实的 KaTeX HTML
    placeholders.forEach((html, i) => {
      finalHtml = finalHtml.replace(`@@LATEX_PH_${i}@@`, html)
    })

    return finalHtml
  })
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
