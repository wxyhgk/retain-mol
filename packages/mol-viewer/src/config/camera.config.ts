/**
 * 相机与交互控制的默认参数。
 */

export const CAMERA = {
  /** 透视相机视场角（度） */
  fov: 45,
  near: 0.1,
  far: 1000,
  /** 初始相机到原点距离（z 正方向） */
  initialZ: 20,
}

export const CONTROLS = {
  rotateSpeed: 1.2,
  panSpeed: 1.0,
  zoomSpeed: 1.0,
  /** 相机 z 轴允许的最近/最远距离 */
  minDistance: 1.0,
  maxDistance: 1000.0,
  /** 鼠标拖动缩放的指数系数（越大越灵敏） */
  dragZoomCoef: 0.01,
  /** 滚轮缩放的指数系数 */
  wheelZoomCoef: 0.001,
}
