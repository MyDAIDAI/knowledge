import './plugins/viewer'

export default ({
  Vue,
  options,
  router,
  siteData
}) => {
  // 在路由更新后初始化图片查看功能
  if (typeof window !== 'undefined') {
    const initImageViewer = () => {
      // 使用 nextTick 确保 DOM 已更新
      Vue.nextTick(() => {
        const images = document.querySelectorAll('.theme-default-content img')
        
        images.forEach((img) => {
          // 避免重复绑定事件
          if (img.dataset.viewerBound) return
          img.dataset.viewerBound = 'true'
          img.style.cursor = 'pointer'
          
          img.addEventListener('click', () => {
            // 获取所有图片的 src 列表
            const imageList = Array.from(images).map(img => img.src)
            const currentIndex = Array.from(images).indexOf(img)
            
            // 尝试多种方式访问 $viewer
            let viewer = null
            
            // 方法1: 从 Vue 根实例访问
            if (options.root && options.root.$viewer) {
              viewer = options.root.$viewer
            }
            // 方法2: 从临时 Vue 实例访问
            else {
              const tempVm = new Vue()
              if (tempVm.$viewer) {
                viewer = tempVm.$viewer
              }
            }
            
            // 如果找到了 viewer，使用它
            if (viewer && typeof viewer.view === 'function') {
              // v-viewer 的 view 方法可以接受索引或图片列表和索引
              try {
                viewer.view(currentIndex)
              } catch (e) {
                // 如果失败，尝试传入图片列表
                try {
                  viewer.view(imageList, currentIndex)
                } catch (e2) {
                  console.warn('Failed to use $viewer:', e2)
                }
              }
            } else {
              // 如果 $viewer 不可用，直接使用 viewerjs
              // 这是最可靠的后备方案
              const ViewerJS = require('viewerjs')
              const viewerInstance = new ViewerJS(img, {
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
              })
              viewerInstance.view(currentIndex)
            }
          })
        })
      })
    }

    // 页面加载完成后初始化
    if (document.readyState === 'complete') {
      initImageViewer()
    } else {
      window.addEventListener('load', initImageViewer)
    }
    
    // 路由更新后重新初始化
    router.afterEach(() => {
      initImageViewer()
    })
  }
}