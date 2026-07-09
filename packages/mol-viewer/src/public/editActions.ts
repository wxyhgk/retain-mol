import { useMoleculeStore } from '../store/moleculeStore'

/**
 * Compatibility wrapper for older app code.
 * New code should call `useMoleculeStore.getState().bondSelectedAtoms()`.
 *
 * @deprecated Use `useMoleculeStore.getState().bondSelectedAtoms()` instead.
 */
export function bondSelectedAtoms(): { ok: boolean; reason?: string } {
  return useMoleculeStore.getState().bondSelectedAtoms()
}
