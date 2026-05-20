/**
 * @deprecated 请直接使用 ../config/elements.config
 * 此文件仅作为过渡适配层，保持旧接口可用。
 */
export type { ElementConfig as ElementData } from '../config/elements.config'
export {
  getElementConfig as getElement,
  ELEMENT_CONFIGS as ELEMENTS,
  COMMON_ELEMENT_SYMBOLS as COMMON_ELEMENTS,
  PERIODIC_TABLE_LAYOUT,
} from '../config/elements.config'

export const CPK_RADII: Record<string, number> = {
  H: 1.20, C: 1.70, N: 1.55, O: 1.52, F: 1.47,
  P: 1.80, S: 1.80, Cl: 1.75, Br: 1.85, I: 1.98,
  default: 1.50,
}
