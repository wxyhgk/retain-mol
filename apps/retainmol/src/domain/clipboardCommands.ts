import { useEditorStore, useMoleculeStore } from '@/domain/viewerAdapter'

export function copySelectionToEditorClipboard() {
  const clipboard = useMoleculeStore.getState().copySelection()
  if (!clipboard) return false
  useEditorStore.getState().setClipboard(clipboard)
  return true
}

export function pasteEditorClipboard() {
  const clipboard = useEditorStore.getState().clipboard
  if (!clipboard) return false
  const newIds = useMoleculeStore.getState().pasteAtoms(clipboard)
  useMoleculeStore.getState().selectAtoms(newIds, 'replace')
  return true
}
