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
}

export const GHOST_LINE = {
  /** 成键工具的 ghost 预览线颜色 */
  color: 0x3b82f6,
  linewidth: 2,
  opacity: 0.7,
}

export const LIGHTING = {
  ambient: { color: 0xffffff, intensity: 0.7 },
  keyLight: { color: 0xffffff, intensity: 0.9, position: [10, 15, 10] as const },
  fillLight: { color: 0xddeeff, intensity: 0.4, position: [-10, -5, -10] as const },
}
