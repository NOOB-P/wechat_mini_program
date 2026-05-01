<template>
  <view class="markdown-render">
    <mp-html-render :content="renderedHtml" :tag-style="tagStyle" />
  </view>
</template>

<script lang="ts">
export default {
  options: {
    virtualHost: true,
    addGlobalClass: true
  }
}
</script>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { marked } from 'marked'
import katex from 'katex'

const props = defineProps<{
  content: string
}>()

const renderedHtml = ref('')

const tagStyle = {
  // 设置 mp-html 标签样式，以支持 katex 排版
  span: 'font-size: inherit;', // 防止一些默认样式覆盖
  div: 'font-size: inherit;'
}

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
      // 将所有非 ASCII 字符（包括中文、全角标点等）包裹在 \text{} 中，避免 KaTeX 解析报错
      fixedFormula = fixedFormula.replace(/([^\x00-\x7F]+)/g, '\\text{$1}')

      // 处理可能导致 KaTeX 报错的其他常见情况
      // 比如连续的连续标点或特殊字符
      fixedFormula = fixedFormula.replace(/&nbsp;/g, ' ')

      const rendered = katex.renderToString(fixedFormula, {
        displayMode,
        throwOnError: false,
        trust: true,
        strict: false,
        output: 'html'
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

  const renderMathOnline = (formula: string, displayMode: boolean) => {
    try {
      const cleanFormula = formula.trim()
      // 对于 CodeCogs 服务，当直接通过 url 拼接时，如果带有 \dpi 等参数，需要确保 \ 被正确传递给后端。
      // \dpi 和 \color 本身是 LaTeX 命令，但是如果我们使用了模板字符串的 \\，在 url 编码之前它就变成了单反斜杠，
      // 但其实我们需要将 \ 本身也经过 encodeURIComponent 处理（即将 \ 编码为 %5C），
      // 所以我们直接对完整的 LaTeX 字符串进行 encodeURIComponent 即可。
      
      const fullLatexCommand = `\\dpi{100}\\color{black} ${cleanFormula}`
      const encodedFormula = encodeURIComponent(fullLatexCommand)
      
      const src = `https://latex.codecogs.com/png.latex?${encodedFormula}`
      
      // 不管是内联还是块级，我们通过 CSS 将其高度与文字对齐，不强制要求其变成 block（因为即使是 $$ 包裹的公式，如果是在段落中间，用户也希望它能与文字和谐共处）
      const imgTag = `<img src="${src}" style="vertical-align: middle; max-width: 100%; display: inline-block; margin: 0 2px; transform: scale(0.9); transform-origin: center;" />`
      
      const placeholder = `@@LATEX_PH_${placeholders.length}@@`
      // 使用 imgTag 而非直接插入，避免被 marked 的转义和破坏。取消外层的 katex-display-wrapper 以避免强行换行
      placeholders.push(imgTag)
      return placeholder
    } catch (e) {
      return formula
    }
  }

  // 修改：由于原先的正则表达式使用了 `.*?` 懒惰匹配，可能在带有换行或者多段文本时跨行匹配失败。
  // 我们使用 `[\s\S]*?` 来确保可以匹配跨行的公式
  content = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, f) => renderMathOnline(f, true))
  // 其他常规的依然走本地 KaTeX 渲染
  content = content.replace(/\\\[([\s\S]*?)\\\]/g, (_, f) => renderMath(f, true))
  content = content.replace(/\$([^\$\n]+?)\$/g, (_, f) => renderMath(f, false))
  content = content.replace(/\\\(([\s\S]*?)\\\)/g, (_, f) => renderMath(f, false))

  // 增加匹配 markdown backtick包裹的公式，因为有时题库会用反引号包裹公式
  content = content.replace(/`([^`]+)`/g, (match, f) => {
    // 判断是否包含典型的数学特征，如果是则渲染为公式，否则保留反引号
    if (/[\\\^\_\{\}\$]/.test(f) || /frac|pi|alpha|beta|sin|cos|tan/.test(f)) {
      return renderMath(f, false)
    }
    return match
  })

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
  // 使用 mp-html 替代 rich-text
  renderedHtml.value = `<div class="katex-container">` + finalHtml + `</div>`
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
  font-size: 32rpx; /* 将基础文本字号放大以匹配图片比例 */
  line-height: 1.6;
  color: #1e293b;
  word-break: break-all;

  p {
    margin-bottom: 20rpx;
    &:last-child {
      margin-bottom: 0;
    }
  }

  /* fixCss */
  .katex-display-wrapper { display: inline-block; margin: 10rpx 10rpx; text-align: center; max-width: 100%; vertical-align: middle; }
  .katex-display { display: inline-block; margin: 0; padding: 0; }
  .katex { font-size: 1.1em; text-indent: 0; display: inline-block; vertical-align: middle; line-height: 1; white-space: nowrap; }
  .katex-html { display: inline-block; line-height: 1.1; vertical-align: middle; }
  .vlist-t { display: inline-table !important; vertical-align: middle !important; }
  .vlist-r { display: table-row !important; }
  .vlist { display: table-cell !important; vertical-align: middle !important; }
  .mfrac { display: inline-block !important; vertical-align: middle !important; }
  .base { display: inline-block !important; vertical-align: middle !important; }
  .katex-error { color: #ef4444; font-family: monospace; background: #fee2e2; padding: 2rpx 8rpx; border-radius: 4rpx; }
}
</style>

