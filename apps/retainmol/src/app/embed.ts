import { exportXYZ } from '@retainmol/core'
import { exportMol, parseClipboard } from '@retainmol/core/io'
import { useUiThemeStore } from '@/domain/uiThemeStore'
import { clearMoleculeHistory } from '@/domain/viewer/history'
import { editorHostPort } from '@/domain/viewer/editorHostPort'
import { useMoleculeStore } from '@/domain/viewer/moleculeState'
import { placeMoleculeInViewer } from '@/features/molecule-placement'

/**
 * Embedded mode: RetainMol inside another page (a frame), which gives it a
 * molecule and is told of every change to it.
 *
 *     /?embed=1&parent=http://localhost:4321&theme=night
 *
 * Messages are `{ protocol: 'retainmol-embed', type, … }`, both ways, and only
 * with the page named by `parent` (its origin), which must be the frame's
 * parent. From the page:
 *   - `load` `{ text, report? }`: MOL/SDF, XYZ or GJF text; replaces the
 *     molecule (shown in 3D, then pushed to the 2D sketch). A flat structure
 *     is given 3D coordinates; with `report`, what it became is sent back as
 *     a `changed`.
 *   - `theme` `{ theme: 'day' | 'night' }`.
 * To the page:
 *   - `ready`: listening (send `load` after it).
 *   - `changed` `{ mol, xyz, atoms, formula }`: the molecule as it is now, after
 *     an edit (not after a `load`), a moment after the edits stop.
 *   - `loaded` `{ atoms }` / `error` `{ message }`: how a `load` went.
 *   - `save`: ⌘S/Ctrl+S was pressed in the frame; the page saves what it keeps.
 *
 * In this mode nothing is saved in the browser (no crash snapshot, no local
 * save, no leave warning): the page around it keeps the molecule.
 */

export const EMBED_PROTOCOL = 'retainmol-embed'

export interface EmbedOptions {
  /** The origin of the page around the frame. */
  readonly parentOrigin: string
  readonly theme: 'day' | 'night' | null
}

/** Embedded mode's options from the address; null when not embedded. */
export function readEmbedOptions(search: string): EmbedOptions | null {
  const params = new URLSearchParams(search)
  if (params.get('embed') !== '1') return null
  const parent = params.get('parent') ?? ''
  let parentOrigin: string
  try {
    parentOrigin = new URL(parent).origin
  } catch {
    return null
  }
  const theme = params.get('theme')
  return { parentOrigin, theme: theme === 'night' || theme === 'day' ? theme : null }
}

let embedded: EmbedOptions | null = null
let postToHost: ((message: Record<string, unknown>) => void) | null = null

/** Whether RetainMol runs inside another page. */
export function isEmbedded(): boolean {
  return embedded !== null
}

const CHANGE_DEBOUNCE_MS = 300

/** Hill order: C, H, then the rest by symbol. */
function formulaOf(atoms: readonly { readonly symbol: string }[]): string {
  const counts = new Map<string, number>()
  for (const { symbol } of atoms) counts.set(symbol, (counts.get(symbol) ?? 0) + 1)
  const first = counts.has('C') ? ['C', 'H'].filter(name => counts.has(name)) : []
  const names = [...first, ...[...counts.keys()].filter(name => !first.includes(name)).sort()]
  return names.map(name => `${name}${counts.get(name) === 1 ? '' : counts.get(name)}`).join('')
}

/** ⌘S in embedded mode: the page around saves (the molecule is its, not the browser's). */
export function requestHostSave(): void {
  postToHost?.({ type: 'save' })
}

/** Starts embedded mode: listens to the page, tells it the changes. */
export function connectEmbed(options: EmbedOptions): void {
  embedded = options
  if (options.theme) useUiThemeStore.getState().setTheme(options.theme)
  const post = (message: Record<string, unknown>) => {
    window.parent.postMessage({ protocol: EMBED_PROTOCOL, ...message }, options.parentOrigin)
  }
  postToHost = post

  /** The molecule last told to the page, or last loaded from it: not a change. */
  let known: unknown = null
  let loading = false
  let timer: number | undefined

  const tell = () => {
    const molecule = editorHostPort.getSnapshot().activeMolecule
    if (loading || !molecule || molecule === known) return
    known = molecule
    post({
      type: 'changed',
      mol: exportMol(molecule),
      xyz: exportXYZ(molecule),
      atoms: molecule.atoms.length,
      formula: formulaOf(molecule.atoms),
    })
  }
  editorHostPort.subscribe(() => {
    window.clearTimeout(timer)
    timer = window.setTimeout(tell, CHANGE_DEBOUNCE_MS)
  })

  window.addEventListener('message', event => {
    if (event.origin !== options.parentOrigin || event.source !== window.parent) return
    const data = event.data as { protocol?: unknown; type?: unknown; text?: unknown; theme?: unknown; report?: unknown } | null
    if (!data || data.protocol !== EMBED_PROTOCOL) return
    if (data.type === 'theme' && (data.theme === 'day' || data.theme === 'night')) {
      useUiThemeStore.getState().setTheme(data.theme)
      return
    }
    if (data.type !== 'load' || typeof data.text !== 'string') return
    const text = data.text
    const report = data.report === true
    loading = true
    void (async () => {
      try {
        const molecule = text.trim() ? parseClipboard(text).molecule : null
        if (molecule && !molecule.atoms.length) throw new Error('结构里没有原子')
        // A new session: what the scene held (another molecule of the page) goes, and its history with it.
        const scene = useMoleculeStore.getState()
        for (const id of Object.keys(scene.objectsById)) useMoleculeStore.getState().removeSceneObject(id)
        if (molecule) await placeMoleculeInViewer(molecule, { mode: 'replace' })
        clearMoleculeHistory()
        known = report ? null : editorHostPort.getSnapshot().activeMolecule
        // The 2D editor follows what was loaded, an empty canvas too (StructuraPanel listens).
        window.dispatchEvent(new CustomEvent('retainmol:push-to-2d'))
        post({ type: 'loaded', atoms: molecule?.atoms.length ?? 0 })
      } catch (error) {
        post({ type: 'error', message: error instanceof Error ? error.message : String(error) })
      } finally {
        // What placing it changed settles before edits count again.
        window.setTimeout(() => {
          loading = false
          if (report) tell()
          else known = editorHostPort.getSnapshot().activeMolecule ?? null
        }, CHANGE_DEBOUNCE_MS * 2)
      }
    })()
  })
  post({ type: 'ready' })
}
