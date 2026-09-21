/**
 * @deprecated 包内请按用途读取 model/elements、chemistry/policies/elementDefaults 或 presentation/elementColors。
 * 此文件仅作为过渡适配层，保持旧接口可用。
 */
import { getElementData } from './model/elements'

export type { ElementConfig as ElementData } from '../config/elements.config'
export {
  getElementConfig as getElement,
  ELEMENT_CONFIGS as ELEMENTS,
  COMMON_ELEMENT_SYMBOLS as COMMON_ELEMENTS,
  PERIODIC_TABLE_LAYOUT,
} from '../config/elements.config'

export const CPK_RADII: Record<string, number> = {
  ...Object.fromEntries(['H', 'C', 'N', 'O', 'F', 'P', 'S', 'Cl', 'Br', 'I']
    .map(symbol => [symbol, getElementData(symbol).cpkRadius])),
  default: getElementData('').cpkRadius,
}
