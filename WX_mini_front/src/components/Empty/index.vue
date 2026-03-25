<script lang="ts" setup>
interface propsInterface {
    image?:string,
    imageSize?:{
        width: number
        height: number
    } | string | number,
    tip?: string
}
const {image, tip} = withDefaults(
    defineProps<propsInterface>(),
    {
        image: 'content',
        tip: '暂无数据' 
    }
)

const slotDom = useSlots()
</script>

<template>
    <!-- 父级没有使用image插槽也会导致默认展示图片不显示，所以判断父级是否使用了image插槽 -->
    <template v-if="slotDom.image">
        <wd-status-tip :tip="tip">
            <template #image>
                <slot name="image"></slot>
            </template>
        </wd-status-tip>
    </template>
    <template v-else>
        <wd-status-tip :image="image" :tip="tip" :imageSize="imageSize"/>
    </template>
</template>

