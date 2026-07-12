import { useUiThemeStore } from '@/domain/uiThemeStore'
import { useCanvasFocusMode } from './useCanvasFocusMode'

export function useAppShellModel() {
  const canvasFocus = useCanvasFocusMode()
  const uiTheme = useUiThemeStore(state => state.theme)

  return { canvasFocus, uiTheme }
}

export type AppShellModel = ReturnType<typeof useAppShellModel>
