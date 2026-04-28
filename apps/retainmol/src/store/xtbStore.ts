import { create } from 'zustand'

export interface XtbFrameAtom {
  symbol: string
  x: number
  y: number
  z: number
}

export interface XtbFrame {
  step: number
  energy: number
  gnorm: number
  atoms: XtbFrameAtom[]
}

interface XtbState {
  frames: XtbFrame[]
  showCurve: boolean
  corner: 'br' | 'bl' | 'tr' | 'tl'
  scrubStep: number | null       // null = 当前最新帧；否则为用户选中的帧
  addFrame: (f: XtbFrame) => void
  resetFrames: () => void
  setShowCurve: (v: boolean) => void
  setCorner: (c: XtbState['corner']) => void
  setScrubStep: (s: number | null) => void
}

export const useXtbStore = create<XtbState>(set => ({
  frames: [],
  showCurve: false,
  corner: 'br',
  scrubStep: null,
  addFrame: f => set(s => ({ frames: [...s.frames, f] })),
  resetFrames: () => set({ frames: [], scrubStep: null }),
  setShowCurve: v => set({ showCurve: v }),
  setCorner: c => set({ corner: c }),
  setScrubStep: s => set({ scrubStep: s }),
}))
