import { ref } from 'vue'
import type { NotifyOptions,globalNotifyExport } from '@/components/GlobalNotify/type'


const globalNotifyState = ref<boolean>(false)
const options = ref()
let timer: NodeJS.Timeout;
export function useNotify ():globalNotifyExport {
    function show(o: NotifyOptions) {
        clearTimeout(timer)
        options.value = o
        globalNotifyState.value = true
        if(options.value.duration !== false) {
            timer = setTimeout(() => {
                globalNotifyState.value = false
            }, options.value.duration || 3000)
        }
    }
    function hide() {
        globalNotifyState.value = false
    }
    return {
        globalNotifyState,
        show,
        hide,
        options
    }
}