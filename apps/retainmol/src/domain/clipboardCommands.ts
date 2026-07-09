import {
  copySelectionToClipboardFromStores,
  pasteClipboardFromStores,
} from './appEditEffects'

export function copySelectionToEditorClipboard() {
  return copySelectionToClipboardFromStores()
}

export function pasteEditorClipboard() {
  return pasteClipboardFromStores()
}
