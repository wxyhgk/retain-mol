import * as THREE from 'three'

/**
 * 截取当前视口为 PNG data URL。scale = 设备像素倍数（默认 2 出高清图）。
 * 临时抬高 pixelRatio 重新分配绘制缓冲，直接渲染（绕过景深 bokeh，出图更锐利），
 * 同步 toDataURL 读出后复原——preserveDrawingBuffer 未开，必须在渲染当帧同步读取。
 * 纯函数：不含 ticker 等编排副作用（由调用方负责触发下一帧恢复实时视图）。
 */
export function captureCanvasPNG(
  renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, scale = 2,
): string {
  const size = new THREE.Vector2()
  renderer.getSize(size)          // CSS 像素尺寸
  const prevPR = renderer.getPixelRatio()
  renderer.setPixelRatio(prevPR * scale)
  renderer.setSize(size.x, size.y, false)   // 保持 CSS 尺寸，仅重分配高分缓冲
  renderer.render(scene, camera)  // 直接渲染，不走 composer
  const url = renderer.domElement.toDataURL('image/png')
  renderer.setPixelRatio(prevPR)
  renderer.setSize(size.x, size.y, false)
  return url
}
