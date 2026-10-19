/**
 * 视口截图桥接 —— 让 app 层能触发 PNG 导出而不直接持有 renderer 实例
 * （与 store/integrity.ts 同样的注册函数模式，保持 app→包 单向、边界干净）。
 *
 * MolViewer 在 renderer 就绪时注册截图函数；app 调 captureViewportImage()。
 * 应用模式下同一时刻只有一个活跃视口，单例足够；组件库多实例场景请改用
 * MolViewer 的 ref API（尚未提供，按需再加）。
 */

import { RENDER } from './config/render.config'

export type CaptureFn = (scale?: number) => string | null

export interface ViewportCaptureRegistry {
  register(fn: CaptureFn): () => void
  capture(scale?: number): string | null
}

export function createViewportCaptureRegistry(): ViewportCaptureRegistry {
  let capture: CaptureFn | null = null
  return {
    register(fn) {
      capture = fn
      return () => {
        if (capture === fn) capture = null
      }
    },
    capture(scale = RENDER.captureScale) {
      return capture ? capture(scale) : null
    },
  }
}

export const defaultCaptureRegistry = createViewportCaptureRegistry()
let disposeDefaultCapture: (() => void) | null = null

/** MolViewer 内部调用：renderer 就绪传入截图函数，销毁时传 null */
export function registerViewportCapture(fn: CaptureFn | null): void {
  disposeDefaultCapture?.()
  disposeDefaultCapture = fn ? defaultCaptureRegistry.register(fn) : null
}

/**
 * 截取当前视口为 PNG data URL；scale 放大倍数（默认 2 倍，出高清图）。
 * 无活跃视口时返回 null。
 */
export function captureViewportImage(scale = RENDER.captureScale): string | null {
  return defaultCaptureRegistry.capture(scale)
}
