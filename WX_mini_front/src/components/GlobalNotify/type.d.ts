import { PopupType } from "wot-design-uni/components/wd-popup/types"

// 通知主题类型
enum TypeEnum {
    primary,
    warning,
    success,
    danger,
    info
}

// icon类型
export type NotifyIconType = 
    "close-outline" |
    "check-outline" |
    "warn-bold"|
    "loading"

export type NotifyOptions = {
    icon?: NotifyIconEnum
    content?: string
    duration?: number | boolean
    type?: string
    position?: PopupType
}

export type globalNotifyExport = {
    globalNotifyState: Ref<boolean>
    show: (o: NotifyOptions) => void
    hide: () => void
    options: Ref
}

