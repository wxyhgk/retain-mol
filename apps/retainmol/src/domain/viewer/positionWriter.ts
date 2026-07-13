export interface AtomPosition {
  readonly x: number
  readonly y: number
  readonly z: number
}

/** App-owned port for committing animated coordinates into the viewer runtime. */
export interface MoleculePositionWriter {
  setObjectAtomPositions(
    objectId: string,
    positions: ReadonlyMap<string, AtomPosition>,
  ): void
}
