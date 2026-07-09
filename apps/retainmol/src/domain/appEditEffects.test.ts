import { describe, expect, it } from 'vitest'
import type { MolClipboard } from '@retainmol/mol-viewer/core'
import {
  connectSelectedAtomsEffect,
  copySelectionToClipboard,
  pasteClipboard,
  writeObjectAtomPositions,
} from './appEditEffects'

describe('app edit effects', () => {
  const clipboard: MolClipboard = { atoms: [], bonds: [] }

  it('copies the current selection into editor clipboard', () => {
    const calls: string[] = []

    const copied = copySelectionToClipboard({
      copySelection: () => clipboard,
      setClipboard: value => calls.push(`clipboard:${value.atoms.length}`),
    })

    expect(copied).toBe(true)
    expect(calls).toEqual(['clipboard:0'])
  })

  it('skips copy when selection is empty', () => {
    const copied = copySelectionToClipboard({
      copySelection: () => null,
      setClipboard: () => { throw new Error('should not set clipboard') },
    })

    expect(copied).toBe(false)
  })

  it('pastes clipboard atoms and selects the new atoms', () => {
    const calls: string[] = []

    const pasted = pasteClipboard({
      getClipboard: () => clipboard,
      pasteAtoms: value => {
        calls.push(`paste:${value.bonds.length}`)
        return ['a1', 'a2']
      },
      selectAtoms: (atomIds, mode) => calls.push(`select:${mode}:${atomIds.join(',')}`),
    })

    expect(pasted).toBe(true)
    expect(calls).toEqual(['paste:0', 'select:replace:a1,a2'])
  })

  it('skips paste when clipboard is empty', () => {
    const pasted = pasteClipboard({
      getClipboard: () => null,
      pasteAtoms: () => { throw new Error('should not paste atoms') },
      selectAtoms: () => { throw new Error('should not select atoms') },
    })

    expect(pasted).toBe(false)
  })

  it('connects selected atoms and flashes failed command reasons', () => {
    const calls: string[] = []

    const ok = connectSelectedAtomsEffect({
      bondSelectedAtoms: () => ({ ok: true }),
      flashHint: message => calls.push(message),
    })
    const failed = connectSelectedAtomsEffect({
      bondSelectedAtoms: () => ({ ok: false, reason: 'bad bond' }),
      flashHint: message => calls.push(message),
    })

    expect(ok).toBe(true)
    expect(failed).toBe(false)
    expect(calls).toEqual(['bad bond'])
  })

  it('writes object atom positions through an injected effect', () => {
    const calls: string[] = []
    const positions = new Map([['a1', { x: 1, y: 2, z: 3 }]])

    writeObjectAtomPositions('obj1', positions, {
      setObjectAtomPositions: (objectId, next) => calls.push(`${objectId}:${next.size}`),
    })

    expect(calls).toEqual(['obj1:1'])
  })
})
