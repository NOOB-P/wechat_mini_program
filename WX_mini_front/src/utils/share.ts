/**
 * 全局分享配置
 * 可以在此处定义默认的分享标题、路径和图片
 */
export const shareMixin = {
  // 分享给朋友
  onShareAppMessage() {
    return {
      title: '优题慧 - 智能查分系统',
      path: '/pages/home/index',
      imageUrl: '/static/tabbar/logo.png' // 默认分享图标
    }
  },
  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '优题慧 - 智能查分系统',
      imageUrl: '/static/tabbar/logo.png'
    }
  }
}
