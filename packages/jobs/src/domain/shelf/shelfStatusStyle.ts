import type { JobStatus } from '../jobTypes'

export type ShelfUiTheme = 'day' | 'night'

export interface ShelfBoxStyle {
  glassColor: number
  glassOpacity: number
  glassRoughness: number
  edgeColor: number
  edgeOpacity: number
  /** 盒内分子整体透明度（喂给 MoleculeRenderer 的 visualState.opacity） */
  moleculeOpacity: number
  /** running：帧循环里对边线/玻璃透明度做脉动 */
  pulse: boolean
}

interface StatusPalette {
  day: ShelfBoxStyle
  night: ShelfBoxStyle
}

function palette(day: ShelfBoxStyle, night: ShelfBoxStyle): StatusPalette {
  return { day, night }
}

const frosted = palette(
  { glassColor: 0xdde3ec, glassOpacity: 0.32, glassRoughness: 0.55, edgeColor: 0x8a94a6, edgeOpacity: 0.8, moleculeOpacity: 0.75, pulse: false },
  { glassColor: 0x2a3242, glassOpacity: 0.38, glassRoughness: 0.55, edgeColor: 0x6b7689, edgeOpacity: 0.8, moleculeOpacity: 0.75, pulse: false },
)

const STATUS_PALETTES = {
  created: frosted,
  queued: frosted,
  running: palette(
    { glassColor: 0xe8f4ff, glassOpacity: 0.16, glassRoughness: 0.2, edgeColor: 0x2f8fdd, edgeOpacity: 1, moleculeOpacity: 1, pulse: true },
    { glassColor: 0x10263a, glassOpacity: 0.22, glassRoughness: 0.2, edgeColor: 0x4db2ff, edgeOpacity: 1, moleculeOpacity: 1, pulse: true },
  ),
  succeeded: palette(
    { glassColor: 0xf2f7f4, glassOpacity: 0.12, glassRoughness: 0.15, edgeColor: 0x3f9e6e, edgeOpacity: 0.9, moleculeOpacity: 1, pulse: false },
    { glassColor: 0x14211b, glassOpacity: 0.18, glassRoughness: 0.15, edgeColor: 0x4fbf85, edgeOpacity: 0.9, moleculeOpacity: 1, pulse: false },
  ),
  failed: palette(
    { glassColor: 0xf5e4e4, glassOpacity: 0.28, glassRoughness: 0.45, edgeColor: 0xc4453f, edgeOpacity: 1, moleculeOpacity: 0.45, pulse: false },
    { glassColor: 0x33191b, glassOpacity: 0.34, glassRoughness: 0.45, edgeColor: 0xe0635c, edgeOpacity: 1, moleculeOpacity: 0.45, pulse: false },
  ),
  interrupted: palette(
    { glassColor: 0xf5e4e4, glassOpacity: 0.28, glassRoughness: 0.45, edgeColor: 0xc4453f, edgeOpacity: 1, moleculeOpacity: 0.45, pulse: false },
    { glassColor: 0x33191b, glassOpacity: 0.34, glassRoughness: 0.45, edgeColor: 0xe0635c, edgeOpacity: 1, moleculeOpacity: 0.45, pulse: false },
  ),
  cancelled: palette(
    { glassColor: 0xe7e7e7, glassOpacity: 0.3, glassRoughness: 0.5, edgeColor: 0x9a9a9a, edgeOpacity: 0.7, moleculeOpacity: 0.55, pulse: false },
    { glassColor: 0x26282c, glassOpacity: 0.36, glassRoughness: 0.5, edgeColor: 0x777c85, edgeOpacity: 0.7, moleculeOpacity: 0.55, pulse: false },
  ),
} satisfies Record<JobStatus, StatusPalette>

export function shelfStatusStyle(status: JobStatus, theme: ShelfUiTheme): ShelfBoxStyle {
  return STATUS_PALETTES[status][theme]
}
