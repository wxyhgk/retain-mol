import type { Struct } from 'ketcher-core';
type StructureSelection = {
    atoms?: number[];
    bonds?: number[];
};
/**
 * Returns whether the given selection (or the whole structure, when no
 * selection is passed) forms a single connected component, by running a BFS
 * over the selected bonds.
 *
 * Extracted from `Editor` so consumers (e.g. React components) can reuse it
 * without importing the whole `Editor` class, which would risk reintroducing
 * the circular dependencies that were recently refactored away.
 */
export declare function isStructureContinuous(struct: Struct, selection?: StructureSelection): boolean;
export {};
