import path from 'node:path'
import { defineConfig, loadEnv } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
// https://uni-helper.js.org/vite-plugin-uni-pages
import UniPages from '@uni-helper/vite-plugin-uni-pages'
// https://github.com/uni-ku/root 全局挂载组件
import UniKuRoot from '@uni-ku/root'
// 更新vite.config自动重载
import ViteRestart from 'vite-plugin-restart'
// https://wot-design-uni.cn/ UI组件库
import { WotResolver } from '@uni-helper/vite-plugin-uni-components/resolvers'
// 自动按需引入组件
import Components from '@uni-helper/vite-plugin-uni-components'
// 
import AutoImport from 'unplugin-auto-import/vite'

export default ({ command, mode }) => {
	// mode: 区分环境 development || production
  const { UNI_PLATFORM } = process.env
  console.log('UNI_PLATFORM -> ', UNI_PLATFORM) // 得到 mp-weixin, h5, app 等
	// console.log("command, mode -> ", command, mode);
	const env = loadEnv(mode, process.cwd(), "");
  const {
    VITE_APP_PORT,
    VITE_SERVER_BASEURL,
    VITE_STATIC_BASEURL,
    VITE_DELETE_CONSOLE,
    VITE_SHOW_SOURCEMAP,
    VITE_APP_PROXY,
    VITE_APP_PROXY_PREFIX,
    VITE_SERVER_TIMEOUT
  } = env
  
	return defineConfig({
		plugins: [
      UniPages({
        // 为页面路径生成 TypeScript 声明
        dts: 'src/types/uni-pages.d.ts',
        // 排除的页面
        exclude: ['**/components/**/**.*'],
      }),
      Components({
        resolvers: [WotResolver()]
      }),
      UniKuRoot({
        rootFileName: 'KuRoot'
      }),
      uni(),
      AutoImport({
        imports: ['vue', 'uni-app'],
        dts: 'src/types/auto-import.d.ts',
        dirs: ['src/hooks'], // 自动导入 hooks
        eslintrc: { enabled: true },
        vueTemplate: true, // default false
      }),
      ViteRestart({
        // 通过这个插件，在修改vite.config.js文件则不需要重新运行也生效配置
        restart: ['vite.config.js'],
      }),
    ],
    define: {
      __UNI_PLATFORM__: JSON.stringify(UNI_PLATFORM),
      __VITE_APP_PROXY__: JSON.stringify(VITE_APP_PROXY),
      __VITE_SERVER_BASEURL__: JSON.stringify(VITE_SERVER_BASEURL),
      __VITE_STATIC_BASEURL__: JSON.stringify(VITE_STATIC_BASEURL),
      __VITE_SERVER_TIMEOUT__:  JSON.stringify(VITE_SERVER_TIMEOUT)
    },
    resolve: {
      extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
      alias: {
        '@': path.join(process.cwd(), './src'),
      },
    },
    server: {
      host: '127.0.0.1',
      port: Number.parseInt(VITE_APP_PORT, 10), // 服务端口
    }
	});
};
