import { describe, expect, it } from 'vitest'
import {
  editChanged,
  editFailed,
  editFromMoleculeResult,
  editUnchanged,
} from './commandResult'
import type { Molecule } from '../../molecule'

describe('command result helpers', () => {
  const molecule: Molecule = { atoms: [], bonds: [], name: 'M' }

  it('creates edit result variants without extra fields', () => {
    expect(editChanged(molecule)).toEqual({ ok: true, changed: true, molecule })
    expect(editChanged(molecule, 'done')).toEqual({ ok: true, changed: true, molecule, message: 'done' })
    expect(editUnchanged()).toEqual({ ok: true, changed: false })
    expect(editUnchanged('noop')).toEqual({ ok: true, changed: false, message: 'noop' })
    expect(editFailed('bad')).toEqual({ ok: false, reason: 'bad' })
  })

  it('normalizes molecule-like command results', () => {
    expect(editFromMoleculeResult({ ok: true, changed: true, molecule })).toEqual({
      ok: true,
      changed: true,
      molecule,
    })
    expect(editFromMoleculeResult({ ok: true, changed: false }, 'noop')).toEqual({
      ok: true,
      changed: false,
      message: 'noop',
    })
    expect(editFromMoleculeResult({ ok: false, reason: 'bad' })).toEqual({
      ok: false,
      reason: 'bad',
    })
  })
})
