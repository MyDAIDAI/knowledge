import Vue from 'vue'
import Viewer from 'v-viewer'
import 'viewerjs/dist/viewer.css'

export default ({
  Vue, // VuePress 正在使用的 Vue 构造函数
  options, // 附加到根实例的一些选项
  router, // 当前应用的路由实例
  siteData // 站点元数据
}) => {
  Vue.use(Viewer, {
    defaultOptions: {
      zIndex: 9999,
      button: true,
      navbar: true,
      title: true,
      toolbar: {
        zoomIn: 1,
        zoomOut: 1,
        oneToOne: 1,
        reset: 1,
        prev: 1,
        play: 0,
        next: 1,
        rotateLeft: 1,
        rotateRight: 1,
        flipHorizontal: 1,
        flipVertical: 1,
      }
    }
  })
}