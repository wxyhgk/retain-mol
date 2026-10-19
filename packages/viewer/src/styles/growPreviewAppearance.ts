import { getElementData } from '@retainmol/core/internal/lib/model/elements'
import { getDefaultElementColor } from '@retainmol/core/internal/lib/presentation/elementColors'
import { RENDER } from '../config/render.config'

/** Preserve the existing default-color ghost style independently of geometry queries. */
export function getGrowPreviewAppearance(symbol: string): { radius: number; color: number } {
  return {
    radius: getElementData(symbol).covalentRadius * RENDER.growGhostRadiusFactor,
    color: getDefaultElementColor(symbol),
  }
}
