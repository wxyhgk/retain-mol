import { beforeEach, describe, expect, it } from 'vitest'
import {
  acquire3DSlot,
  active3DSlots,
  configureMolecule3DPool,
  release3DSlot,
  reset3DPoolForTest,
} from './molecule3dPool'

describe('molecule3dPool', () => {
  beforeEach(() => reset3DPoolForTest())

  it('keeps at most cap active slots, evicting the oldest', () => {
    configureMolecule3DPool({ cap: 2 })
    acquire3DSlot('a')
    acquire3DSlot('b')
    acquire3DSlot('c')
    expect(active3DSlots()).toEqual(['b', 'c'])
  })

  it('re-acquiring an active id is a no-op and release frees the slot', () => {
    acquire3DSlot('a')
    acquire3DSlot('a')
    expect(active3DSlots()).toEqual(['a'])
    release3DSlot('a')
    expect(active3DSlots()).toEqual([])
    release3DSlot('a')
    expect(active3DSlots()).toEqual([])
  })

  it('eviction preserves insertion order of survivors', () => {
    configureMolecule3DPool({ cap: 3 })
    for (const id of ['a', 'b', 'c', 'd', 'e']) acquire3DSlot(id)
    expect(active3DSlots()).toEqual(['c', 'd', 'e'])
  })
})
