/** Controls and foreground surfaces own their keys before the workspace does. */
export function isTextEditingTarget(target: EventTarget | null) {
  return typeof Element !== 'undefined' && target instanceof Element && Boolean(
    target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="combobox"], [role="textbox"], [role="spinbutton"]'),
  )
}

export function isWorkspaceShortcutBlocked(event: Pick<Event, 'target' | 'defaultPrevented'> & { isComposing?: boolean }) {
  if (event.defaultPrevented || event.isComposing || isTextEditingTarget(event.target)) return true
  const target = event.target
  if (typeof Element !== 'undefined' && target instanceof Element
    && target.closest('[data-shortcuts="local"]')) return true
  return typeof document !== 'undefined' && Boolean(document.querySelector(
    'dialog[open], [role="dialog"][aria-modal="true"]:not([data-state="closed"]), [role="alertdialog"][aria-modal="true"], [role="menu"]:not([data-state="closed"]), [data-shortcut-overlay="true"]',
  ))
}
