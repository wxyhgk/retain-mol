import { create } from 'zustand'

export const INSPECTOR_ID = 'workspace-inspector'
export const INSPECTOR_TOGGLE_ID = 'workspace-inspector-toggle'

export type InspectorTab = 'draw' | 'inspector' | 'scene' | 'display'

// Layout state is independent of the brush, active tool and last drawing operation.
export const useInspectorStore = create<{
  dockOpen: boolean
  compactOpen: boolean
  tab: InspectorTab
}>(() => ({ dockOpen: true, compactOpen: false, tab: 'draw' }))

export function setInspectorOpen(open: boolean, compact: boolean) {
  useInspectorStore.setState(compact ? { compactOpen: open } : { dockOpen: open })
}

export function revealDrawInspector() {
  // Never open a modal automatically when a drawing shortcut is used on a small screen.
  useInspectorStore.setState({ dockOpen: true, tab: 'draw' })
}
