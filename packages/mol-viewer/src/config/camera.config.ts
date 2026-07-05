/**
 * 相机与交互控制的默认参数。
 */

export const CAMERA = {
  /**
   * 透视相机视场角（度）。
   * 越大透视越强（近大远小越明显）；fitToMolecule 按 fov 自动补偿距离，
   * 分子表观大小不变。45 偏长焦显得"平"，60 立体感明显。
   */
  fov: 60,
  near: 0.1,
  far: 1000,
  /** 初始相机到原点距离（z 正方向） */
  initialZ: 16,
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

export const FIT = {
  /** fitToMolecule 时包围盒尺寸最小值（Å），防止单原子分子相机过近 */
  minBoundingBox: 4,
  /** 包围盒对角线到相机距离的拉远系数 */
  distanceMultiplier: 1.5,
}
