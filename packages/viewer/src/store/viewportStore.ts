import { create } from 'zustand'
import { setViewportAxesVisible, setViewportGridVisible } from '../viewport'

export interface ViewportUiState {
  axesVisible: boolean
  gridVisible: boolean
  setAxesVisible: (visible: boolean) => void
  setGridVisible: (visible: boolean) => void
}

export const useViewportStore = create<ViewportUiState>(set => ({
  axesVisible: false,
  gridVisible: false,
  setAxesVisible: (visible) => {
    // Sync with renderer via viewport registry; only update store if renderer accepted
    if (setViewportAxesVisible(visible)) set({ axesVisible: visible })
    else set({ axesVisible: visible }) // still update UI state even if no active viewport (e.g. initial render)
  },
  setGridVisible: (visible) => {
    if (setViewportGridVisible(visible)) set({ gridVisible: visible })
    else set({ gridVisible: visible })
  },
}))
