import { Struct } from 'ketcher-core';
import { type MoleculeDocumentSnapshot, type Result } from 'molecule-contracts';
type IdentityMaps = {
    atoms: ReadonlyMap<number, string>;
    bonds: ReadonlyMap<number, string>;
};
type CanvasCandidate = {
    struct: Struct;
    identities: {
        atoms: Map<number, string>;
        bonds: Map<number, string>;
    };
};
/** Materialize a validated candidate in a separate, slot-preserving Struct. */
export declare function buildCanvasCandidate(source: Struct, base: MoleculeDocumentSnapshot, candidate: MoleculeDocumentSnapshot, identities: IdentityMaps): Result<CanvasCandidate>;
export {};
