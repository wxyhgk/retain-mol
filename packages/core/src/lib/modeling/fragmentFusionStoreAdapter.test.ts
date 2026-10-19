import { describe, expect, it } from 'vitest'
import type { Atom, Bond, Molecule } from '../model/types'
import {
  createFragmentFusionStoreController,
  createZustandMoleculeTransactionPort,
} from './fragmentFusionStoreAdapter'

const atom = (id: string): Atom => ({ id, symbol: 'C', x: 0, y: 0, z: 0 })
const bond = (id: string, atomId1: string, atomId2: string): Bond => ({
  id,
  atomId1,
  atomId2,
  order: 1,
})
const molecule = (atoms: readonly Atom[], bonds: readonly Bond[]): Molecule => ({ atoms, bonds })

const host = (): Molecule => molecule(
  [atom('h1'), atom('h2')],
  [bond('hb', 'h1', 'h2')],
)

const fragment = (): Molecule => molecule(
  [atom('r1'), atom('r2'), atom('r3')],
  [bond('rb', 'r1', 'r2'), bond('r23', 'r2', 'r3'), bond('r31', 'r3', 'r1')],
)

interface TestState {
  readonly molecule: Molecule
}

const createHistoryStore = () => {
  let state: TestState = { molecule: host() }
  const history: TestState[] = []
  return {
    history,
    getState: () => state,
    setState: (update: TestState | Partial<TestState> | ((value: TestState) => TestState | Partial<TestState>)) => {
      const next = typeof update === 'function' ? update(state) : update
      if (next === state) return
      history.push(state)
      state = { ...state, ...next }
    },
    undo: () => {
      const previous = history.pop()
      if (previous) state = previous
    },
  }
}

describe('fragment fusion store adapter', () => {
  it('commits one atomic checkpoint that can be undone', () => {
    const store = createHistoryStore()
    const controller = createFragmentFusionStoreController(
      createZustandMoleculeTransactionPort({
        store,
        selectMolecule: (state) => state.molecule,
        replaceMolecule: (state, next) => ({ ...state, molecule: next }),
      }),
    )
    const preview = controller.preview({
      fragment: fragment(),
      anchors: [{ hostBondId: 'hb', fragmentBondId: 'rb' }],
    })
    const candidate = preview.candidates[0]
    expect(candidate).toBeDefined()
    if (!candidate) return
    const result = controller.commit(preview, candidate.topologyKey)
    expect(result.ok).toBe(true)
    expect(store.history).toHaveLength(1)
    expect(store.getState().molecule.atoms.map(({ id }) => id).sort()).toEqual(['h1', 'h2', 'r3'])
    store.undo()
    expect(store.getState().molecule.atoms.map(({ id }) => id).sort()).toEqual(['h1', 'h2'])
  })

  it('does not create a checkpoint for an invalid candidate', () => {
    const store = createHistoryStore()
    const controller = createFragmentFusionStoreController(
      createZustandMoleculeTransactionPort({
        store,
        selectMolecule: (state) => state.molecule,
        replaceMolecule: (state, next) => ({ ...state, molecule: next }),
      }),
    )
    const preview = controller.preview({
      fragment: fragment(),
      anchors: [{ hostBondId: 'hb', fragmentBondId: 'rb' }],
    })
    expect(controller.commit(preview, 'missing')).toMatchObject({
      ok: false,
      code: 'candidate-not-found',
    })
    expect(store.history).toHaveLength(0)
  })

  it('rejects a concurrent change between calculation and atomic replacement', () => {
    let current = host()
    const controller = createFragmentFusionStoreController({
      getMolecule: () => current,
      commit: () => {
        current = molecule([...current.atoms, atom('concurrent')], current.bonds)
        return false
      },
    })
    const preview = controller.preview({
      fragment: fragment(),
      anchors: [{ hostBondId: 'hb', fragmentBondId: 'rb' }],
    })
    const candidate = preview.candidates[0]
    expect(candidate).toBeDefined()
    if (!candidate) return
    expect(controller.commit(preview, candidate.topologyKey)).toMatchObject({
      ok: false,
      code: 'concurrent-store-change',
    })
  })
})
