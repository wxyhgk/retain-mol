import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UiPalette = 'default' | 'heritage'

interface UiPaletteState {
  palette: UiPalette
  setPalette: (palette: UiPalette) => void
  togglePalette: () => void
}

export const useUiPaletteStore = create<UiPaletteState>()(
  persist(
    (set) => ({
      palette: 'default',
      setPalette: (palette) => set({ palette }),
      togglePalette: () => set(state => ({ palette: state.palette === 'default' ? 'heritage' : 'default' })),
    }),
    {
      name: 'retainmol-ui-palette',
    },
  ),
)
