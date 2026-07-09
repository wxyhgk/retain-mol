import type { Molecule } from '../../molecule'

export type BuilderDiagnosticLevel = 'info' | 'warning' | 'error'

export interface BuilderDiagnostic {
  readonly level: BuilderDiagnosticLevel
  readonly code: string
  readonly message: string
  readonly atomIds?: readonly string[]
  readonly bondIds?: readonly string[]
}

export type BuilderResult<T = Molecule> =
  | { ok: true; value: T; diagnostics?: readonly BuilderDiagnostic[] }
  | { ok: false; reason: string; diagnostics?: readonly BuilderDiagnostic[] }

export function ok<T>(value: T, diagnostics?: readonly BuilderDiagnostic[]): BuilderResult<T> {
  return diagnostics && diagnostics.length > 0
    ? { ok: true, value, diagnostics }
    : { ok: true, value }
}

export function fail<T = Molecule>(
  reason: string,
  diagnostics?: readonly BuilderDiagnostic[],
): BuilderResult<T> {
  return diagnostics && diagnostics.length > 0
    ? { ok: false, reason, diagnostics }
    : { ok: false, reason }
}
