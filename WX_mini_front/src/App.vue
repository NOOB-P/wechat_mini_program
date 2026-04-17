<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
// import { interceptorAuth } from '@/utils/interceptor'

onLaunch(() => {
  console.log("App Launch");
  // interceptorAuth()
});
onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});
</script>
<style>
/* 全局抗锯齿和字体优化，解决模糊问题 */
page {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  background-color: #f8f8f8;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif;
}
</style>
