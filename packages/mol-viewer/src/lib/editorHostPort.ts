import type { Molecule } from './molecule'

/** Host-owned editor state exposed to product capability packages. */
export interface EditorHostSnapshot {
  readonly activeObjectId: string | null
  readonly activeMolecule: Molecule | null
}

/**
 * Narrow boundary between the molecular editor and product capability packages.
 *
 * Implementations belong to the host application. Consumers must not reach into
 * the editor's Zustand stores or depend on scene-store implementation details.
 */
export interface EditorHostPort {
  readonly getSnapshot: () => EditorHostSnapshot
  readonly subscribe: (listener: () => void) => () => void
  readonly replaceActiveMolecule: (molecule: Molecule) => string
  readonly clearSelection: () => void
  readonly notify: (message: string) => void
}
