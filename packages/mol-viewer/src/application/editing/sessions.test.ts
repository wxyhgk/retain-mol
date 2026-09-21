import { describe, expect, it, vi } from 'vitest'
import { createAtomDragEditSession, createObjectPositionWriteEditSession } from './sessions'

describe('editing sessions with callback ports', () => {
  it('moves a selected group without a store or unrelated session capabilities', () => {
    const write = vi.fn()
    const commit = vi.fn()
    const cancel = vi.fn()
    const openTransaction = vi.fn(() => ({ active: true, commit, cancel }))
    const session = createAtomDragEditSession({
      getMolecule: () => ({
        atoms: [
          { id: 'a', symbol: 'C', x: 0, y: 0, z: 0 },
          { id: 'b', symbol: 'O', x: 1, y: 0, z: 0 },
        ], bonds: [],
      }),
      getSelectedAtomIds: () => new Set(['a', 'b']),
      setAtomPositions: write,
      openTransaction,
      finishLegacyTransaction: () => { throw new Error('unexpected legacy transaction') },
    })
    session.start('a')
    session.move('a', { x: 2, y: 1, z: 0 })
    session.end()
    expect(openTransaction).toHaveBeenCalledWith('atom-drag')
    expect(write).toHaveBeenCalledWith(new Map([
      ['a', { x: 2, y: 1, z: 0 }], ['b', { x: 3, y: 1, z: 0 }],
    ]))
    expect(commit).toHaveBeenCalledOnce()
    expect(cancel).not.toHaveBeenCalled()
  })

  it('cancels a position session once using only its transaction and write port', () => {
    const write = vi.fn()
    const commit = vi.fn()
    const cancel = vi.fn()
    const session = createObjectPositionWriteEditSession('object-a', {
      setObjectAtomPositions: write,
      openTransaction: () => ({ active: true, commit, cancel }),
      finishLegacyTransaction: () => { throw new Error('unexpected legacy transaction') },
    })
    const positions = new Map([['a', { x: 3, y: 2, z: 1 }]])
    session.start()
    session.write(positions)
    session.cancel()
    session.cancel()
    expect(write).toHaveBeenCalledWith('object-a', positions)
    expect(cancel).toHaveBeenCalledOnce()
    expect(commit).not.toHaveBeenCalled()
    expect(session.isActive).toBe(false)
  })
})
