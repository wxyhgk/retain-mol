import type { Molecule } from '../../molecule'
import { GraphIndex } from './GraphIndex'
import { ValencePolicy } from './ValencePolicy'

export interface BuilderContext {
  readonly molecule: Molecule
  readonly graph: GraphIndex
  readonly valence: ValencePolicy
}

export function createBuilderContext(molecule: Molecule): BuilderContext {
  const graph = new GraphIndex(molecule)
  return {
    molecule,
    graph,
    valence: new ValencePolicy(graph),
  }
}
