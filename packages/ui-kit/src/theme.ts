import { create } from 'zustand'

export type UiTheme = 'day' | 'night'

interface UiThemeState {
  theme: UiTheme
  setTheme: (theme: UiTheme) => void
  toggleTheme: () => void
}

export const useUiThemeStore = create<UiThemeState>((set) => ({
  theme: 'day',
  setTheme: theme => set({ theme }),
  toggleTheme: () => set(state => ({ theme: state.theme === 'day' ? 'night' : 'day' })),
}))
