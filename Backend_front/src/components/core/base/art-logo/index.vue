<!-- 系统logo -->
<template>
  <div class="flex-cc">
    <img :style="logoStyle" :src="logoSrc" alt="logo" class="w-full h-full" />
  </div>
</template>

<script setup lang="ts">
  import logoPng from '@imgs/common/logo.png'

  defineOptions({ name: 'ArtLogo' })

  interface Props {
    /** logo 大小 */
    size?: number | string
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 36
  })

  // 使用 logo.png (彩色图标)
  const logoSrc = logoPng

  const logoStyle = computed(() => ({ width: `${props.size}px` }))
</script>
