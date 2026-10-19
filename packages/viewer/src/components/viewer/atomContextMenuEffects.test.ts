import { describe, expect, it } from 'vitest'
import {
  commitContextAtomCharge,
  commitContextAtomHydrogen,
  commitContextAtomRadical,
  commitContextAtomRemoval,
  commitContextAtomReplacement,
  resolveContextAtomIds,
  selectContextAtomIfNeeded,
} from './atomContextMenuEffects'

describe('atom context menu effects', () => {
  it('uses the full multi-selection only when the context atom is selected', () => {
    expect(resolveContextAtomIds('a2', new Set(['a1', 'a2']))).toEqual(['a1', 'a2'])
    expect(resolveContextAtomIds('a3', new Set(['a1', 'a2']))).toEqual(['a3'])
    expect(resolveContextAtomIds('a1', new Set(['a1']))).toEqual(['a1'])
  })

  it('selects the context atom only when needed', () => {
    const calls: string[] = []
    selectContextAtomIfNeeded('a1', () => ({
      selectedAtomIds: new Set(['a2']),
      selectAtom: id => calls.push(id),
    }))
    selectContextAtomIfNeeded('a2', () => ({
      selectedAtomIds: new Set(['a2']),
      selectAtom: id => calls.push(id),
    }))

    expect(calls).toEqual(['a1'])
  })

  it('commits context atom edits through injected store access', () => {
    const calls: string[] = []

    commitContextAtomHydrogen('a1', () => ({
      addOneHydrogen: id => calls.push(`h:${id}`),
    }))
    commitContextAtomReplacement('a2', 'N', () => ({
      selectedAtomIds: new Set(['a1', 'a2']),
      replaceAtoms: (ids, symbol) => calls.push(`replace:${ids.join(',')}:${symbol}`),
    }))
    commitContextAtomRemoval('a3', () => ({
      selectedAtomIds: new Set(['a1', 'a2']),
      removeAtoms: ids => calls.push(`remove:${ids.join(',')}`),
    }))
    commitContextAtomCharge('a4', 1, () => ({
      setAtomCharge: (id, charge) => calls.push(`charge:${id}:${charge}`),
    }))
    commitContextAtomRadical('a5', 0, () => ({
      setAtomRadical: (id, radical) => calls.push(`radical:${id}:${radical}`),
    }))

    expect(calls).toEqual([
      'h:a1',
      'replace:a1,a2:N',
      'remove:a3',
      'charge:a4:1',
      'radical:a5:0',
    ])
  })
})
