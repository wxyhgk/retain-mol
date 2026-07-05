/**
 * 3D 渲染中和"主题/元素色"无关的视觉常量。
 * 主题里已有的（元素颜色、ball/stick 尺寸、背景）不要重复放这里。
 */

export const RENDER = {
  /** 球 / 圆柱几何分段 —— 调低能显著提性能，但表面会出多边形感 */
  sphereSegments: 24,
  cylinderSegments: 12,

  /** 选中原子的高亮光晕相对原子半径的额外半径 */
  selectionHaloOffset: 0.12,
  /** 测量 pending 原子的光晕额外半径 */
  pendingHaloOffset: 0.18,
  pendingHaloOpacity: 0.5,

  /** stick / wireframe 模式下原子半径 = bondRadiusStick × stickAtomMultiplier */
  stickAtomMultiplier: 1.5,

  /** Phong 材质高光参数 */
  atomShininess: 80,
  atomSpecular: 0x444444,
  bondShininess: 60,

  /** 键的选中 / 未选中色（非主题控制，一般不改） */
  bondSelectedColor: 0xffaa00,
  bondDefaultColor: 0xaaaaaa,

  /** 芳香键虚线参数（单位：Å） */
  aromaticDashColor: 0x888888,
  aromaticDashSize:  0.12,   // 每段实心小圆柱长度
  aromaticGapSize:   0.10,   // 段间空隙
  /** 芳香键虚线圆柱半径 = bondRadiusStick × aromaticDashRadiusFactor */
  aromaticDashRadiusFactor: 0.55,
}

export const GHOST_LINE = {
  /** 成键工具的 ghost 预览线颜色（无目标） */
  color: 0x3b82f6,
  /** 悬停在合法目标原子上时的颜色 */
  targetColor: 0x22c55e,
  linewidth: 2,
  opacity: 0.7,
}

export const BOND_DRAG_HOVER = {
  /** 目标原子高亮光晕的额外半径（Å） */
  haloOffset: 0.18,
  /** 高亮光晕颜色 */
  color: 0x22c55e,
  opacity: 0.35,
}

export const GROW_GUIDE = {
  /** 拖出生长时 VSEPR 候选槽位参考几何（环/点）的颜色 */
  color: 0x3b82f6,
  ringSegments: 96,
  ringTubeSegments: 10,
  /**
   * 圆环的深度烘焙（虚实/近粗远细）：拖拽期间相机锁定，按每段到相机的
   * 距离插值管径与透明度 —— 近侧粗且实，远侧细且虚。
   * 场景雾在 2Å 的环径上没有可见梯度，必须在环自身上做。
   */
  ringTubeNear: 0.055,
  ringTubeFar:  0.018,
  ringAlphaNear: 0.85,
  ringAlphaFar:  0.15,
  /** 候选点小球半径（Å）与透明度（近/远） */
  pointRadius: 0.14,
  pointAlphaNear: 0.45,
  pointAlphaFar:  0.18,
  /**
   * 屏幕空间拾取：滑动吸附按"环投影到屏幕后离光标最近的点"求解，
   * 环侧视（投影很扁）时也能顺滑滑动。hysteresisPx 为切换候选的滞回
   * 代价（像素），防止前/后半环在投影重叠处来回抖动。
   */
  pickSamples: 144,
  hysteresisPx: 12,
}

export const FOG = {
  /**
   * 深度雾化（depth cueing）：从相机注视点开始往后逐渐变淡，
   * 提供前后深度线索。near/far 为相对相机-注视点距离的偏移（Å）。
   */
  nearOffset: 1,
  farOffset: 22,
}

export const DOF = {
  /** 景深（虚实）：对焦在相机注视点，远处虚化。enabled=false 可整体关闭 */
  enabled: true,
  /** 光圈：越大虚化越强、焦平面越浅（典型 0.0001 ~ 0.001） */
  aperture: 0.00022,
  /** 最大模糊量（屏幕空间比例） */
  maxblur: 0.008,
}

export const LIGHTING = {
  ambient: { color: 0xffffff, intensity: 0.7 },
  keyLight: { color: 0xffffff, intensity: 0.9, position: [10, 15, 10] as const },
  fillLight: { color: 0xddeeff, intensity: 0.4, position: [-10, -5, -10] as const },
}
