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
  { glassColor: 0xe6e1d6, glassOpacity: 0.32, glassRoughness: 0.55, edgeColor: 0x9a9186, edgeOpacity: 0.8, moleculeOpacity: 0.75, pulse: false },
  { glassColor: 0x2b2f31, glassOpacity: 0.38, glassRoughness: 0.55, edgeColor: 0x77706a, edgeOpacity: 0.8, moleculeOpacity: 0.75, pulse: false },
)

const STATUS_PALETTES = {
  created: frosted,
  queued: frosted,
  running: palette(
    { glassColor: 0xecf4f0, glassOpacity: 0.16, glassRoughness: 0.2, edgeColor: 0x3e7065, edgeOpacity: 1, moleculeOpacity: 1, pulse: true },
    { glassColor: 0x14261f, glassOpacity: 0.22, glassRoughness: 0.2, edgeColor: 0x57907f, edgeOpacity: 1, moleculeOpacity: 1, pulse: true },
  ),
  succeeded: palette(
    { glassColor: 0xf2f7f4, glassOpacity: 0.12, glassRoughness: 0.15, edgeColor: 0x4e8273, edgeOpacity: 0.9, moleculeOpacity: 1, pulse: false },
    { glassColor: 0x14211b, glassOpacity: 0.18, glassRoughness: 0.15, edgeColor: 0x6fa593, edgeOpacity: 0.9, moleculeOpacity: 1, pulse: false },
  ),
  failed: palette(
    { glassColor: 0xf3e6e2, glassOpacity: 0.28, glassRoughness: 0.45, edgeColor: 0xa13a32, edgeOpacity: 1, moleculeOpacity: 0.45, pulse: false },
    { glassColor: 0x2e1a17, glassOpacity: 0.34, glassRoughness: 0.45, edgeColor: 0xc25749, edgeOpacity: 1, moleculeOpacity: 0.45, pulse: false },
  ),
  interrupted: palette(
    { glassColor: 0xf3e6e2, glassOpacity: 0.28, glassRoughness: 0.45, edgeColor: 0xa13a32, edgeOpacity: 1, moleculeOpacity: 0.45, pulse: false },
    { glassColor: 0x2e1a17, glassOpacity: 0.34, glassRoughness: 0.45, edgeColor: 0xc25749, edgeOpacity: 1, moleculeOpacity: 0.45, pulse: false },
  ),
  cancelled: palette(
    { glassColor: 0xe7e7e7, glassOpacity: 0.3, glassRoughness: 0.5, edgeColor: 0x9a9a9a, edgeOpacity: 0.7, moleculeOpacity: 0.55, pulse: false },
    { glassColor: 0x26282c, glassOpacity: 0.36, glassRoughness: 0.5, edgeColor: 0x777c85, edgeOpacity: 0.7, moleculeOpacity: 0.55, pulse: false },
  ),
} satisfies Record<JobStatus, StatusPalette>

export function shelfStatusStyle(status: JobStatus, theme: ShelfUiTheme): ShelfBoxStyle {
  return STATUS_PALETTES[status][theme]
}
