/** Let fields and foreground UI consume keys before a viewer changes state. */
export function isViewerShortcutBlocked(event: KeyboardEvent) {
  if (event.defaultPrevented || event.isComposing) return true
  if (typeof Element !== 'undefined' && event.target instanceof Element && event.target.closest(
    'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="combobox"], [role="textbox"], [role="spinbutton"], [data-shortcuts="local"]',
  )) return true
  return typeof document !== 'undefined' && Boolean(document.querySelector(
    'dialog[open], [role="dialog"][aria-modal="true"]:not([data-state="closed"]), [role="alertdialog"][aria-modal="true"], [role="menu"]:not([data-state="closed"]), [data-shortcut-overlay="true"]',
  ))
}
