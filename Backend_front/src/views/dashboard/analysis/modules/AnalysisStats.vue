<template>
  <ElRow :gutter="20" class="flex">
    <ElCol v-for="(item, index) in props.data" :key="index" :sm="12" :md="6" :lg="6">
      <div class="art-card relative flex flex-col justify-center h-35 px-5 mb-5 max-sm:mb-4">
        <span class="text-g-700 text-sm">{{ item.title }}</span>
        <ArtCountTo
          class="text-[26px] font-medium mt-2"
          :target="item.value"
          :duration="1300"
          :decimals="item.unit === '%' ? 1 : 0"
        />
        <div class="flex-c mt-1">
          <span class="text-xs text-g-600">较上月</span>
          <span
            class="ml-1 text-xs font-semibold"
            :class="[item.trend === 'down' ? 'text-danger' : 'text-success']"
          >
            {{ item.trend === 'up' ? '+' : '-' }}{{ item.percentage }}
          </span>
        </div>
        <div class="absolute top-0 bottom-0 right-5 m-auto size-12.5 rounded-xl flex-cc bg-theme/10">
          <ArtSvgIcon :icon="getIcon(item.icon)" class="text-xl text-theme" />
        </div>
      </div>
    </ElCol>
  </ElRow>
</template>

<script setup lang="ts">
  const props = defineProps({
    data: {
      type: Array as any,
      default: () => []
    }
  })

  const getIcon = (icon: string) => {
    const iconMap: Record<string, string> = {
      User: 'ri:user-line',
      House: 'ri:home-3-line',
      Star: 'ri:star-line',
      Link: 'ri:links-line'
    }
    return iconMap[icon] || 'ri:pie-chart-line'
  }
</script>

