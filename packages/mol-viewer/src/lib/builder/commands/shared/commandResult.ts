import type { Molecule } from '../../../molecule'

export type EditCommandResult =
  | { ok: true; changed: true; molecule: Molecule; message?: string }
  | { ok: true; changed: false; message?: string }
  | { ok: false; reason: string }

export type EditCommandResultWithMeta<TMeta extends object> =
  | ({ ok: true; changed: true; molecule: Molecule } & TMeta)
  | ({ ok: true; changed: false } & Partial<TMeta>)
  | { ok: false; reason: string }

/** Package an already finalized molecule; no chemistry or state mutation here. */
export function editChanged(molecule: Molecule, message?: string): EditCommandResult {
  return message
    ? { ok: true, changed: true, molecule, message }
    : { ok: true, changed: true, molecule }
}

export function editUnchanged(message?: string): EditCommandResult {
  return message
    ? { ok: true, changed: false, message }
    : { ok: true, changed: false }
}

export function editFailed(reason: string): EditCommandResult {
  return { ok: false, reason }
}

export function editFromMoleculeResult(
  result:
    | { ok: true; changed: true; molecule: Molecule }
    | { ok: true; changed: false }
    | { ok: false; reason: string },
  message?: string,
): EditCommandResult {
  if (result.ok === false) return editFailed(result.reason)
  if (!result.changed) return editUnchanged(message)
  return editChanged(result.molecule, message)
}
