/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}


declare  const __UNI_PLATFORM__ : readonly string // 运行平台
declare const __VITE_APP_PROXY__: readonly string // 
declare const __VITE_SERVER_BASEURL__: readonly string // 服务端地址
declare const __VITE_STATIC_BASEURL__: readonly string // 静态资源地址
declare const __VITE_SERVER_TIMEOUT__: readonly number // 服务端地址
declare const wx: any
