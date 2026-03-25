<script setup lang="ts">
import { useNotify } from './useNotify'
const {
    globalNotifyState,
    options
} = useNotify()
</script>

<template>
    <wd-popup
        v-model="globalNotifyState"
        :position="'top'"
        :z-index="99"
        :duration="250"
        :modal="false"
    >
        <view class="global_notify" :class="[`global_notify_${options?.type ? options?.type : 'primary'}`]">
            <template v-if="options?.icon">
                <wd-loading v-if="options.icon === 'loading'" size="22px" />
                <wd-icon v-else color="#fff" :name="options.icon" size="22px"></wd-icon>
            </template>
            {{ options?.content }}
        </view>
    </wd-popup>
</template>


<style lang="scss" scoped>
@import './index.scss';
</style>